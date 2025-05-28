# Notification System Access Guide

## Overview

The KBN platform includes a comprehensive notification system that allows users to send, receive, and manage notifications based on their role and access level.

## Accessing Notification Features

### Sidebar Menu

All notification features are accessible through the **"Notifications"** menu in the sidebar. This menu appears for users with appropriate permissions and includes the following options:

#### 1. Send Notification (Admin Only)

- **Path**: `/admin/send-notification` (Executive) or `/{provinceId}/admin/send-notification` (Province/Branch)
- **Access**: Province Admins, General Managers, Super Admins, Developers, Province Managers, Branch Managers
- **Description**: Create and send notifications to specific recipients with targeting options

#### 2. View All Notifications

- **Path**: `/notifications`
- **Access**: All authenticated users
- **Description**: Browse all notifications in a dedicated list view with filtering and pagination

#### 3. Notification Settings

- **Path**: `/notifications/settings`
- **Access**: All authenticated users
- **Description**: Configure personal notification preferences, push notification permissions, and delivery options

### Notification Center (Bell Icon)

The notification center is accessible through the bell icon (🔔) in the top navigation bar:

- **Real-time Badge Count**: Shows the current number of unread notifications
- **Integration**: Uses Redux store via `useNotifications` hook for live updates
- **Notification Drawer**: Click the bell to open a slide-out drawer showing recent notifications
- **Quick Actions**: Mark as read, view all notifications, access settings

#### Technical Implementation

The NotificationCenter component integrates with the notification system through:

```javascript
const { unreadCount, toggleNotificationDrawer } = useNotifications();
```

This ensures:

- Real-time unread count updates from Redux store
- Consistent state management across all notification components
- Automatic badge updates when notifications are read/received

### User Role Access Matrix

| Feature               | Guest | Employee | Branch Manager | Province Manager | Province Admin | Super Admin |
| --------------------- | ----- | -------- | -------------- | ---------------- | -------------- | ----------- |
| View Notifications    | ❌    | ✅       | ✅             | ✅               | ✅             | ✅          |
| Notification Settings | ❌    | ✅       | ✅             | ✅               | ✅             | ✅          |
| Send to Branch        | ❌    | ❌       | ✅             | ✅               | ✅             | ✅          |
| Send to Province      | ❌    | ❌       | ❌             | ✅               | ✅             | ✅          |
| Send to All Users     | ❌    | ❌       | ❌             | ❌               | ✅             | ✅          |

## Notification Types

The system supports four notification types:

- **Info** (ℹ️): General information and updates
- **Success** (✅): Confirmations and achievements
- **Warning** (⚠️): Important notices requiring attention
- **Error** (❌): Critical issues requiring immediate action

## Priority Levels

- **Low**: Non-urgent information
- **Normal**: Standard notifications (default)
- **High**: Important notifications requiring attention
- **Urgent**: Critical notifications requiring immediate action

## Delivery Methods

- **In-App Only**: Notifications appear only within the KBN application
- **Push Notifications**: Browser push notifications (requires user permission)
- **Both**: Combination of in-app and push notifications

## Troubleshooting

### Badge Count Not Updating

1. Check browser console for Redux state updates
2. Verify user authentication and permissions
3. Ensure notification subscription is active
4. Check network connectivity for real-time updates

### Push Notifications Not Working

1. Verify browser permissions are granted
2. Check notification settings in user preferences
3. Ensure FCM token is properly registered
4. Test with different browsers if needed

### Access Denied Errors

1. Verify user role and permissions
2. Check if user has access to the specific province/branch
3. Ensure user account is properly activated
4. Contact system administrator if issues persist

## Features Available

### ComposeNotification

- Create rich notifications with titles, messages, priorities, and types
- Target specific recipients by role, user, branch, department, or province
- Choose delivery options (in-app only or include push notifications)
- Form validation and recipient count estimation
- Success/error feedback via toast notifications

### NotificationList

- View all notifications in an organized list
- Mark notifications as read/unread
- Filter and search functionality
- Responsive design for all devices

### NotificationSettings

- Configure push notification preferences
- Set notification frequency (real-time, daily, weekly)
- Choose notification types to receive
- FCM token management for push notifications

## Additional Notes

- The notification system respects user preferences when delivering notifications
- Push notifications require browser permission and FCM token registration
- All notification text supports bilingual display (Thai/English)
- The system includes comprehensive accessibility features
- Real-time updates ensure immediate notification delivery
