# 🔔 Notification System – KBN

This document outlines the notification architecture in the KBN platform, detailing how notifications are managed, displayed, and integrated throughout the application.

---

## 📋 Overview

KBN implements a comprehensive notification system that handles both in-app notifications and push notifications. The system is designed to provide timely, relevant alerts to users across multiple channels while maintaining a consistent user experience.

---

## 🏗️ Architecture

The notification system follows a publisher-subscriber pattern:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│ Event Sources   │────▶│ Notification    │────▶│ Notification    │
│ (Actions/API)   │     │ Controller      │     │ Store           │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│ Push            │◀────│ Notification    │◀────│ Notification    │
│ Service         │     │ Manager         │     │ Components      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📂 Key Files and Directories

| Path                                        | Purpose                                   |
| ------------------------------------------- | ----------------------------------------- |
| `src/controllers/notificationController.ts` | Core notification management logic        |
| `src/store/slices/notificationSlice.ts`     | Redux state for notifications             |
| `src/components/notifications/`             | Notification UI components                |
| `src/services/notificationService.ts`       | Notification service logic (FCM, etc.)    |
| `public/firebase-messaging-sw.js`           | Service worker for push notifications     |
| `scripts/update-firebase-sw.js`             | Script to update service worker           |
| `functions/index.ts`                        | Cloud Functions for notification delivery |

---

## 🔔 Notification Types

The application supports several types of notifications:

1. **In-app notifications** - Displayed within the application UI

   - Toast notifications (temporary alerts)
   - Notification center items (persistent)
   - Banner notifications (important alerts)

2. **Push notifications** - Delivered outside the application

   - Web push notifications (via Firebase Cloud Messaging)
   - Mobile push notifications (via Firebase Cloud Messaging)

3. **Email notifications** - Sent to user's email address
   - Transactional emails (actions, confirmations)
   - Digest emails (periodic summaries)

---

## ⚙️ Notification Controller

The notification controller manages notification creation, storage, and delivery:

```typescript
// Notification controller
import { db, messaging } from '../services/firebase/config';
import { store } from '../store';
import { addNotification, markAsRead } from '../store/slices/notificationSlice';

export const notificationController = {
  // Create and store a new notification
  async createNotification(userId: string, notification: any): Promise<any> {
    try {
      // Get user's province information
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      // Prepare notification data with province ID
      const notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
        userId,
        provinceId: notification.provinceId || userData?.provinceId || null
      };

      // Store in Firestore
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);

      // Add to local state if user is the recipient
      const currentUser = store.getState().auth.user;
      if (currentUser && currentUser.uid === userId) {
        store.dispatch(
          addNotification({
            id: docRef.id,
            ...notificationData
          })
        );
      }

      // Send push notification if specified
      if (notification.sendPush) {
        await this.sendPushNotification(userId, notification);
      }

      return {
        id: docRef.id,
        ...notificationData
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Send push notification
  async sendPushNotification(userId: string, notification: any): Promise<boolean | void> {
    try {
      // Get user's FCM tokens
      const userTokensSnapshot = await getDocs(
        query(collection(db, 'fcmTokens'), where('userId', '==', userId))
      );

      const tokens = userTokensSnapshot.docs.map(doc => doc.data().token);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for user');
        return;
      }

      // Send via Cloud Function
      await callFunction('sendPushNotification', {
        tokens,
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data || {},
          provinceId: notification.provinceId || null
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  },

  // Fetch notifications for user with province filtering
  async fetchNotifications(userId: string, provinceId?: string): Promise<any[]> {
    try {
      let notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // If province ID is specified, filter by it
      if (provinceId) {
        notificationsQuery = query(
          notificationsQuery,
          where('provinceId', 'in', [provinceId, null])
        );
      }

      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update store
      store.dispatch(setNotifications(notifications));
      
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // Update in Firestore
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date().toISOString()
      });

      // Update in Redux store
      store.dispatch(markAsRead(notificationId));

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Send notification to users by role and province
  async notifyByRoleAndProvince(
    role: string,
    provinceId: string | null,
    notification: any
  ): Promise<void> {
    try {
      let usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      
      // If province is specified, find users with access to this province
      if (provinceId) {
        usersQuery = query(
          collection(db, 'users'),
          where('role', '==', role),
          where(`accessibleProvinces.${provinceId}`, '==', true)
        );
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      
      // Create batch to add notifications for all users
      const batch = writeBatch(db);
      
      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        const notificationRef = doc(collection(db, 'notifications'));
        
        batch.set(notificationRef, {
          ...notification,
          userId: userDoc.id,
          provinceId: provinceId || userData.provinceId || null,
          createdAt: new Date().toISOString(),
          read: false
        });
      });
      
      await batch.commit();
      
      // Queue push notifications in background
      for (const userDoc of usersSnapshot.docs) {
        this.sendPushNotification(userDoc.id, {
          ...notification,
          provinceId: provinceId || userDoc.data().provinceId || null
        }).catch(err => console.error(`Push notification error for user ${userDoc.id}:`, err));
      }
      
    } catch (error) {
      console.error('Error sending notifications by role and province:', error);
      throw error;
    }
  }

  // Other notification methods...
};
```

---

## 🔄 Redux Integration

Notifications are stored in Redux for application-wide access:

```javascript
// Notification slice
import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(item => !item.read).length;
      state.loading = false;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
    // Other reducers...
  }
});

export const { setNotifications, addNotification, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
```

---

## 🔔 In-App Notification Components

The application includes several UI components for displaying notifications:

### Notification Center

```jsx
// Notification Center component
const NotificationCenter = () => {
  const { items, unreadCount, loading } = useSelector(state => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleNotificationClick = notification => {
    // Mark as read
    dispatch(markAsRead(notification.id));

    // Handle navigation based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="notification-center">
      <button className="notification-bell" onClick={handleToggle}>
        <BellIcon />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && <button onClick={handleMarkAllAsRead}>Mark all as read</button>}
          </div>

          <div className="notification-list">
            {loading ? (
              <LoadingSpinner />
            ) : items.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              items.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Toast Notifications

```jsx
// Toast notification component
export const ToastContainer = () => {
  const toasts = useSelector(state => state.notifications.toasts);
  const dispatch = useDispatch();

  const handleDismiss = id => {
    dispatch(removeToast(id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={() => handleDismiss(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ id, type, title, message, duration = 5000, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {title && <h4>{title}</h4>}
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={() => onDismiss(id)}>
        <CloseIcon />
      </button>
    </div>
  );
};
```

---

## 🔔 Push Notification Integration

The application integrates with Firebase Cloud Messaging (FCM) for push notifications:

### FCM Setup

```javascript
// Firebase messaging setup
import { messaging } from '../firebase/config';

export const initializeMessaging = async () => {
  try {
    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });

    if (!currentToken) {
      console.log('No registration token available');
      return null;
    }

    console.log('FCM registration token:', currentToken);

    // Store token in Firestore for the current user
    await storeToken(currentToken);

    return currentToken;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

// Store user's FCM token
const storeToken = async token => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in');
    return;
  }

  try {
    const tokenRef = doc(db, 'fcmTokens', token);

    await setDoc(tokenRef, {
      token,
      userId: user.uid,
      device: navigator.userAgent,
      createdAt: serverTimestamp()
    });

    console.log('Token stored successfully');
  } catch (error) {
    console.error('Error storing token:', error);
  }
};
```

### Service Worker

```javascript
// firebase-messaging-sw.js (service worker)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('Background message received:', payload);

  const { notification } = payload;

  // Display notification
  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: '/logo192.png',
    data: payload.data
  });
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Try to find an existing window and focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

---

## 🚀 Cloud Functions for Notifications

Firebase Cloud Functions handle server-side notification tasks:

```javascript
// Notification-related Cloud Functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Send push notification
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tokens, title, body, data: payloadData } = data;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid tokens must be provided');
  }

  try {
    // Prepare message
    const message = {
      notification: {
        title,
        body
      },
      data: payloadData || {},
      tokens
    };

    // Send message
    const response = await admin.messaging().sendMulticast(message);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create notification when a new document is added to a collection
exports.createNotificationOnNewDocument = functions.firestore
  .document('collections/{docId}')
  .onCreate(async (snapshot, context) => {
    const newData = snapshot.data();
    const { assignedTo, title } = newData;

    if (!assignedTo) {
      return null;
    }

    try {
      // Create notification document
      await admin
        .firestore()
        .collection('notifications')
        .add({
          userId: assignedTo,
          title: 'New document assigned',
          body: `You have been assigned to "${title}"`,
          type: 'assignment',
          data: {
            documentId: context.params.docId,
            documentTitle: title
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  });
```

---

## 📊 Notification Analytics

The application tracks notification engagement:

```javascript
// Notification analytics
export const trackNotificationEngagement = async (notification, action) => {
  try {
    await addDoc(collection(db, 'notificationAnalytics'), {
      notificationId: notification.id,
      userId: auth.currentUser?.uid,
      action, // 'click', 'dismiss', 'view'
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking notification engagement:', error);
  }
};
```

---

## 🧪 Testing Notifications

Notification components and logic can be tested:

```javascript
// Example notification component test
describe('NotificationCenter', () => {
  const mockNotifications = [
    { id: '1', title: 'Test Notification', body: 'This is a test', read: false },
    { id: '2', title: 'Another Notification', body: 'This is another test', read: true }
  ];

  beforeEach(() => {
    useSelector.mockImplementation(() => ({
      items: mockNotifications,
      unreadCount: 1,
      loading: false
    }));
  });

  it('should display the correct number of unread notifications', () => {
    render(<NotificationCenter />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should open the dropdown when clicked', () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('should mark notification as read when clicked', () => {
    const mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole('button')); // Open dropdown
    fireEvent.click(screen.getByText('Test Notification'));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('markAsRead'),
        payload: '1'
      })
    );
  });
});
```

---

## 📝 Best Practices

1. **Design for multiple channels**: Support in-app, push, and email notifications
2. **Implement throttling**: Prevent notification spam by throttling frequency
3. **Allow user preferences**: Let users customize notification types and channels
4. **Group related notifications**: Combine related notifications to reduce noise
5. **Include actionable content**: Make notifications actionable when possible
6. **Test delivery channels**: Ensure notifications work across all supported platforms
7. **Handle offline scenarios**: Queue notifications when users are offline
8. **Implement analytics**: Track open rates and engagement metrics
9. **Manage token lifecycle**: Update or delete FCM tokens when needed
10. **Provide clear opt-out**: Make it easy for users to opt out of notifications

---

## 🔄 Notification Workflows

### Creating a Notification

1. Event occurs (e.g., new comment, assignment)
2. System generates notification with appropriate content
3. Notification is stored in database
4. Notification is delivered through selected channels
5. User receives the notification

### User Interaction with Notifications

1. User views notification in the notification center
2. User clicks on a notification
3. System marks the notification as read
4. User is redirected to relevant content
5. System records engagement metrics

---

## 🛡️ Roles & Permissions in Notifications

Notification targeting and delivery leverage the canonical roles and permissions defined in:
- `src/constants/roles.ts` (see `ROLES`, `UserRole`, `RoleCategory`)
- `src/constants/Permissions.ts` (see `PERMISSIONS`)

**Role-based targeting:**
- When sending notifications to roles (e.g., admins, managers), always use the canonical role keys (e.g., `ROLES.PROVINCE_ADMIN`, `ROLES.SUPER_ADMIN`, `ROLES.PROVINCE_MANAGER`, `ROLES.GENERAL_MANAGER`).
- Do not use legacy or non-canonical role names (e.g., `system-admin`, `owner`, `executive`).
- See `UserReview.tsx` and `ComposeNotification.tsx` for examples of correct usage.

**Permission-based UI:**
- Use the `PermissionContext` and `usePermissions` hook to conditionally render notification UI/actions based on user permissions.
- Example:
  ```tsx
  const { hasPermission, hasRole } = usePermissions();
  if (hasRole(ROLES.PROVINCE_ADMIN)) { /* show province_admin notification actions */ }
  if (hasPermission(PERMISSIONS.CONTENT_EDIT)) { /* show edit button */ }
  ```

---

## 🏢 Province-Aware Notification Components

The multi-province migration requires notification components that are province-aware:

### ProvinceFilteredNotificationCenter

```tsx
import React, { useEffect, useState } from "react";
import { Select, Badge, Dropdown, Menu, Empty, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { notificationController } from "../../controllers/notificationController";

interface ProvinceFilteredNotificationCenterProps {
  maxItems?: number;
}

export const ProvinceFilteredNotificationCenter: React.FC<ProvinceFilteredNotificationCenterProps> = ({ 
  maxItems = 10 
}) => {
  const { user, currentProvinceId } = useAuth();
  const { hasProvinceAccess, accessibleProvinces } = usePermissions();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch notifications whenever province changes
  useEffect(() => {
    if (!user?.uid || !currentProvinceId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Only fetch notifications for the current province if user has access
        if (hasProvinceAccess(currentProvinceId)) {
          const results = await notificationController.fetchNotifications(
            user.uid, 
            currentProvinceId
          );
          
          setNotifications(results.slice(0, maxItems));
          setUnreadCount(results.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.uid, currentProvinceId, hasProvinceAccess, maxItems]);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await notificationController.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to target if available
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const menu = (
    <Menu className="notification-menu">
      <div className="notification-header">
        <h4>Notifications</h4>
        {unreadCount > 0 && (
          <a onClick={() => notificationController.markAllAsRead(user?.uid, currentProvinceId)}>
            Mark all as read
          </a>
        )}
      </div>
      
      <div className="notification-content">
        {loading ? (
          <div className="notification-loading">
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            description="No notifications" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            className="notification-empty" 
          />
        ) : (
          notifications.map((notification) => (
            <Menu.Item 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)}
              className={notification.read ? "notification-read" : "notification-unread"}
            >
              <div className="notification-item">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-body">{notification.body}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </div>
                {notification.provinceId && (
                  <div className="notification-province-tag">
                    {accessibleProvinces.find(p => p.provinceId === notification.provinceId)?.name || 
                     "System"}
                  </div>
                )}
              </div>
            </Menu.Item>
          ))
        )}
      </div>
      
      <div className="notification-footer">
        <a href="/notifications">View all notifications</a>
      </div>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight" arrow>
      <Badge count={unreadCount} size="small">
        <div className="notification-bell-container">
          <BellOutlined className="notification-bell-icon" />
        </div>
      </Badge>
    </Dropdown>
  );
};
```

### NotificationProvinceSwitcher

This component allows users to view notifications from different provinces they have access to:

```tsx
import React from "react";
import { Select, Space, Typography } from "antd";
import { usePermissions } from "../../hooks/usePermissions";

const { Text } = Typography;
const { Option } = Select;

interface NotificationProvinceSwitcherProps {
  onChange: (provinceId: string | null) => void;
  value: string | null;
  showAllOption?: boolean;
}

export const NotificationProvinceSwitcherProps: React.FC<NotificationProvinceSwitcherProps> = ({
  onChange,
  value,
  showAllOption = true
}) => {
  const { accessibleProvinces, hasProvinceAccess, hasRole } = usePermissions();
  const { ROLES } = require("../../constants/roles");
  
  // Only show provinces the user has access to
  const availableProvinces = accessibleProvinces.filter(province => 
    hasProvinceAccess(province.provinceId)
  );
  
  // Check if user has access to see all provinces
  const canViewAllProvinces = isInRoleCategory(user.role as RoleType, RoleCategory.GENERAL_MANAGER);
  
  return (
    <Space direction="vertical" size="small">
      <Text type="secondary">Filter notifications by province:</Text>
      <Select
        value={value}
        onChange={onChange}
        style={{ width: 200 }}
        placeholder="Select province"
      >
        {showAllOption && canViewAllProvinces && (
          <Option value={null}>All Provinces</Option>
        )}
        
        {availableProvinces.map(province => (
          <Option key={province.provinceId} value={province.provinceId}>
            {province.name}
          </Option>
        ))}
      </Select>
    </Space>
  );
};
```

---

## 📊 Multi-Province Notification Data Model

The notification schema has been updated to support multi-province architecture:

```typescript
// TypeScript interface for notification data model
interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string; // e.g., 'alert', 'info', 'reminder', 'task'
  provinceId: string | null; // Province-specific or system-wide (null)
  branchCode?: string; // Optional branch specificity
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  link?: string; // Optional navigation link
  data?: Record<string, any>; // Additional data payload
  read: boolean;
  createdAt: string; // ISO date string
  readAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  
  // Tracking fields
  deliveredToClient?: boolean;
  deliveredPush?: boolean;
  deliveredEmail?: boolean;
  
  // Province migration fields
  migratedFromLegacy?: boolean; // Flag for migrated notifications
  legacyId?: string; // Reference to pre-migration ID if applicable
}
```

### Firestore Collection Structure

The notification data is stored in Firestore with the following structure:

```
notifications/
  ├─ {notificationId}/
  │   ├─ userId: string
  │   ├─ title: string
  │   ├─ body: string
  │   ├─ type: string
  │   ├─ provinceId: string | null
  │   ├─ branchCode: string (optional)
  │   ├─ priority: string (optional)
  │   ├─ link: string (optional)
  │   ├─ data: object (optional)
  │   ├─ read: boolean
  │   ├─ createdAt: timestamp
  │   ├─ readAt: timestamp (optional)
  │   └─ expiresAt: timestamp (optional)
  │
  └─ ...

fcmTokens/
  ├─ {tokenId}/
  │   ├─ token: string
  │   ├─ userId: string
  │   ├─ device: string
  │   ├─ provinceId: string (optional)
  │   ├─ createdAt: timestamp
  │   └─ lastUsed: timestamp
  │
  └─ ...

notificationPreferences/
  ├─ {userId}/
  │   ├─ userId: string
  │   ├─ email: boolean
  │   ├─ push: boolean
  │   ├─ inApp: boolean
  │   ├─ categories: {
  │   │   ├─ system: boolean
  │   │   ├─ task: boolean
  │   │   └─ ...
  │   │ }
  │   └─ provinceFilters: {
  │       ├─ {provinceId}: boolean
  │       └─ ...
  │     }
  │
  └─ ...
```

### Queries with Province Filtering

Example queries for fetching notifications with province filtering:

```typescript
// Get user notifications for all accessible provinces
const fetchAllProvinceNotifications = async (userId: string): Promise<Notification[]> => {
  const { accessibleProvinces } = usePermissions();
  const provinceIds = accessibleProvinces.map(p => p.provinceId);
  
  // Include null for system-wide notifications
  const validProvinceIds = [...provinceIds, null];
  
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("provinceId", "in", validProvinceIds),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  
  const snapshot = await getDocs(notificationsQuery);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notification[];
};

// Get user notifications for a specific province
const fetchProvinceNotifications = async (
  userId: string, 
  provinceId: string
): Promise<Notification[]> => {
  const { hasProvinceAccess } = usePermissions();
  
  // Security check
  if (!hasProvinceAccess(provinceId)) {
    throw new Error("User does not have access to this province");
  }
  
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("provinceId", "in", [provinceId, null]), // Include system-wide notifications
    orderBy("createdAt", "desc"),
    limit(100)
  );
  
  const snapshot = await getDocs(notificationsQuery);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notification[];
};
```

### Subscription System

Notification subscriptions can now be configured on a per-province basis:

```typescript
interface NotificationSubscription {
  userId: string;
  categories: string[];
  provinces: string[]; // Array of province IDs
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Subscribe user to notifications for specific provinces
const subscribeToProvinceNotifications = async (
  userId: string,
  provinceIds: string[],
  categories: string[]
): Promise<void> => {
  const { hasProvinceAccess } = usePermissions();
  
  // Filter to only include provinces the user can access
  const accessibleProvinceIds = provinceIds.filter(id => hasProvinceAccess(id));
  
  await setDoc(
    doc(db, "notificationPreferences", userId),
    {
      userId,
      categories,
      provinceFilters: Object.fromEntries(
        accessibleProvinceIds.map(id => [id, true])
      ),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};
```

## 🛡️ Province-Based Security and Permissions

The notification system enforces province-based access control and permissions at multiple levels:

### Permission-Based Notification Access

```typescript
// Permission hooks for notification management
const NotificationManager: React.FC = () => {
  const { user, currentProvinceId } = useAuth();
  const { hasPermission, hasProvinceAccess } = usePermissions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Example permission check - only users with specific permissions can view/manage notifications
  const canViewAllNotifications = hasPermission(PERMISSIONS.NOTIFICATION_VIEW_ALL);
  const canManageNotifications = hasPermission(PERMISSIONS.NOTIFICATION_MANAGE) && 
                                 hasProvinceAccess(currentProvinceId);
  
  // Different notification sources based on permissions
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        let results: Notification[] = [];
        
        if (canViewAllNotifications) {
          // Admin view - can see all notifications across provinces they have access to
          results = await notificationController.fetchAllNotifications(user.accessibleProvinces);
        } else if (hasProvinceAccess(currentProvinceId)) {
          // Regular view - can only see notifications for their current province
          results = await notificationController.fetchNotifications(user.uid, currentProvinceId);
        } else {
          // Fallback - only personal notifications
          results = await notificationController.fetchPersonalNotifications(user.uid);
        }
        
        setNotifications(results);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
  }, [user, currentProvinceId, canViewAllNotifications, hasProvinceAccess]);
  
  return (
    <div className="notification-manager">
      {canManageNotifications && (
        <div className="notification-actions">
          <Button onClick={handleCreateNotification}>Create Notification</Button>
          <Button onClick={handleBulkOperations}>Bulk Operations</Button>
        </div>
      )}
      
      <NotificationList 
        notifications={notifications}
        canManage={canManageNotifications}
        currentProvinceId={currentProvinceId}
      />
    </div>
  );
};
```

### Security Rules for Province-Based Access

Firestore security rules enforce province-based access control for notifications:

```javascript
// Firestore security rules for notifications
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(roles) {
      return isAuthenticated() && (getUserData().role in roles);
    }
    
    function hasProvinceAccess(provinceId) {
      let userData = getUserData();
      
      // Admins have access to all provinces
      if (userData.role in ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER']) {
        return true;
      }
      
      // General managers can access provinces they're assigned to
      if (userData.role == 'GENERAL_MANAGER' && userData.accessibleProvinces != null) {
        return userData.accessibleProvinces[provinceId] == true;
      }
      
      // Other roles can only access their assigned province
      return userData.provinceId == provinceId;
    }
    
    // Notification collection rules
    match /notifications/{notificationId} {
      // Users can read notifications addressed to them
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid);
      
      // Users with management permission can read notifications for provinces they have access to
      allow read: if isAuthenticated() && 
                     hasRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'GENERAL_MANAGER', 'PROVINCE_MANAGER']) && 
                     (resource.data.provinceId == null || hasProvinceAccess(resource.data.provinceId));
      
      // Only authorized roles can create notifications
      allow create: if isAuthenticated() && 
                     hasRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'GENERAL_MANAGER', 'PROVINCE_MANAGER', 'BRANCH_MANAGER']) &&
                     (request.resource.data.provinceId == null || hasProvinceAccess(request.resource.data.provinceId));
      
      // Users can mark their own notifications as read
      allow update: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid &&
                     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'readAt']);
      
      // Only admins and notification creators can delete notifications
      allow delete: if isAuthenticated() && 
                     (hasRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']) || 
                     resource.data.createdBy == request.auth.uid);
    }
    
    // Notification preferences
    match /notificationPreferences/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### Province-Based FCM Token Management

For push notifications, FCM tokens are now associated with provinces:

```typescript
// Store user's FCM token with province information
const storeToken = async (token: string): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in');
    return;
  }

  try {
    // Get user's province information
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    const tokenRef = doc(db, 'fcmTokens', token);

    await setDoc(tokenRef, {
      token,
      userId: user.uid,
      device: navigator.userAgent,
      provinceId: userData?.provinceId || null, // Associate token with user's primary province
      createdAt: serverTimestamp(),
      lastUsed: serverTimestamp()
    });

    console.log('Token stored successfully with province information');
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get tokens for a specific province
const getTokensForProvince = async (provinceId: string): Promise<string[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'fcmTokens'), where('provinceId', '==', provinceId))
    );
    
    return snapshot.docs.map(doc => doc.data().token);
  } catch (error) {
    console.error('Error getting tokens for province:', error);
    return [];
  }
};
```
