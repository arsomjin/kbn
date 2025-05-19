import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, Toast } from '../../services/notificationService';

interface NotificationsState {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isNotificationDrawerOpen: boolean;
  fcmInitialized: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  toasts: [],
  unreadCount: 0,
  hasMore: false,
  status: 'idle',
  error: null,
  isNotificationDrawerOpen: false,
  fcmInitialized: false
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload.map(n => ({
        ...n,
        description: n.description ?? n.title ?? ''
      }));
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      const newNotification = {
        ...action.payload,
        description: action.payload.description ?? action.payload.title ?? ''
      };
      state.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: state => {
      state.notifications.forEach(n => (n.isRead = true));
      state.unreadCount = 0;
    },
    addToast: (state, action: PayloadAction<Toast>) => {
      const toastWithId = {
        ...action.payload,
        id: action.payload.id ?? `${Date.now()}-${Math.random()}`
      };
      state.toasts.push(toastWithId);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setStatus: (state, action: PayloadAction<NotificationsState['status']>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNotificationDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationDrawerOpen = action.payload;
    },
    setFcmInitialized: (state, action: PayloadAction<boolean>) => {
      state.fcmInitialized = action.payload;
    }
  }
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  addToast,
  removeToast,
  setHasMore,
  setStatus,
  setError,
  setNotificationDrawerOpen,
  setFcmInitialized
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
