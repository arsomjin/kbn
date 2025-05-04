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

```javascript
// Notification controller
import { db, messaging } from '../services/firebase/config';
import { store } from '../store';
import { addNotification, markAsRead } from '../store/slices/notificationSlice';

export const notificationController = {
  // Create and store a new notification
  async createNotification(userId, notification) {
    try {
      // Prepare notification data
      const notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
        userId
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
  async sendPushNotification(userId, notification) {
    try {
      // Get user's FCM tokens
      const userTokensSnapshot = await getDocs(query(collection(db, 'fcmTokens'), where('userId', '==', userId)));

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
        data: notification.data || {}
      });

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
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
- When sending notifications to roles (e.g., admins, managers), always use the canonical role keys (e.g., `ROLES.ADMIN`, `ROLES.SUPER_ADMIN`, `ROLES.PROVINCE_MANAGER`, `ROLES.GENERAL_MANAGER`).
- Do not use legacy or non-canonical role names (e.g., `system-admin`, `owner`, `executive`).
- See `UserReview.tsx` and `ComposeNotification.tsx` for examples of correct usage.

**Permission-based UI:**
- Use the `PermissionContext` and `usePermissions` hook to conditionally render notification UI/actions based on user permissions.
- Example:
  ```tsx
  const { hasPermission, hasRole } = usePermissions();
  if (hasRole(ROLES.ADMIN)) { /* show admin notification actions */ }
  if (hasPermission(PERMISSIONS.CONTENT_EDIT)) { /* show edit button */ }
  ```

---

## 🔗 Related Documentation

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Redux State Management](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/state-management.md)
