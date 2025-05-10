import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  Notification,
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  NotificationType,
  initializeNotifications
} from '../../services/notificationService';
import { UserProfile } from '../../services/authService';
import { DocumentSnapshot } from 'firebase/firestore';
import { serializeTimestampArray } from '../../utils/timestampUtils';

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  displayed?: boolean;
}

// Types
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastDoc: DocumentSnapshot | undefined;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isNotificationDrawerOpen: boolean;
  fcmInitialized: boolean;
  toasts: Toast[];
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  lastDoc: undefined,
  hasMore: false,
  status: 'idle',
  error: null,
  isNotificationDrawerOpen: false,
  fcmInitialized: false,
  toasts: []
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (
    { userProfile, pageSize = 10, reset = false }: { userProfile: UserProfile; pageSize?: number; reset?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      if (!userProfile?.uid) {
        return rejectWithValue('User profile is required');
      }

      const state = getState() as { notifications: NotificationState };

      // If reset is true, fetch from the beginning
      const startAfterDoc = reset ? undefined : state.notifications.lastDoc;

      const result = await getNotifications(userProfile, pageSize, startAfterDoc);
      // Serialize notifications before returning
      return {
        notifications: serializeTimestampArray(result.notifications),
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
        reset
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const readNotification = createAsyncThunk(
  'notifications/readNotification',
  async ({ notificationId, userId }: { notificationId: string; userId: string }, { rejectWithValue }) => {
    try {
      await markNotificationAsRead(notificationId, userId);
      return { notificationId, userId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const unreadNotification = createAsyncThunk(
  'notifications/unreadNotification',
  async ({ notificationId, userId }: { notificationId: string; userId: string }, { rejectWithValue }) => {
    try {
      await markNotificationAsUnread(notificationId, userId);
      return { notificationId, userId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as unread');
    }
  }
);

// Add read timestamps for multiple notifications
export const readMultipleNotifications = createAsyncThunk(
  'notifications/readMultiple',
  async ({ notificationIds, userId }: { notificationIds: string[]; userId: string }, { dispatch }) => {
    for (const id of notificationIds) {
      try {
        await markNotificationAsRead(id, userId);
        dispatch(markAsRead({ notificationId: id, userId }));
      } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
      }
    }
    return { notificationIds, userId };
  }
);

// Initialize Firebase Cloud Messaging
export const initializeFcm = createAsyncThunk(
  'notifications/initializeFcm',
  async (userId: string, { rejectWithValue }) => {
    try {
      const success = await initializeNotifications(userId);
      return success;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize FCM');
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      const newNotification = action.payload;
      // Check if notification already exists
      const exists = state.notifications.some(n => n.id === newNotification.id);

      if (!exists) {
        state.notifications.unshift(newNotification);
        if (!newNotification.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    updateNotifications(state, action: PayloadAction<Notification[]>) {
      const newNotifications = action.payload;
      let unreadAdded = 0;

      // Add only notifications that don't already exist
      newNotifications.forEach(newNotif => {
        const existingIndex = state.notifications.findIndex(existing => existing.id === newNotif.id);

        if (existingIndex !== -1) {
          // Update existing notification if read status changed
          if (state.notifications[existingIndex].isRead !== newNotif.isRead) {
            if (newNotif.isRead) {
              // If notification was marked as read, decrease unread count
              unreadAdded--;
            } else {
              // If notification was marked as unread, increase unread count
              unreadAdded++;
            }
            state.notifications[existingIndex] = newNotif;
          }
        } else {
          // Add new notification
          state.notifications.unshift(newNotif);
          if (!newNotif.isRead) {
            unreadAdded++;
          }
        }
      });

      // Update unread count
      state.unreadCount = Math.max(0, state.unreadCount + unreadAdded);

      // Process timestamps and sort notifications by createdAt (newest first)
      state.notifications = state.notifications.map(notification => {
        const processTimestamp = (ts: any): string => {
          if (!ts) return new Date().toISOString();
          if (typeof ts === 'string') return ts;
          if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
          if (ts instanceof Date) return ts.toISOString();
          return new Date().toISOString();
        };

        return {
          ...notification,
          createdAt: processTimestamp(notification.createdAt),
          updatedAt: notification.updatedAt ? processTimestamp(notification.updatedAt) : undefined,
          expiresAt: notification.expiresAt ? processTimestamp(notification.expiresAt) : undefined
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    setNotificationDrawer(state, action: PayloadAction<boolean>) {
      state.isNotificationDrawerOpen = action.payload;
    },
    clearNotificationError(state) {
      state.error = null;
    },
    resetNotifications(state) {
      state.notifications = [];
      state.lastDoc = undefined;
      state.hasMore = false;
      state.unreadCount = 0;
    },
    markAsRead: (state, action: PayloadAction<{ notificationId: string; userId: string }>) => {
      const { notificationId, userId } = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);

      if (notification) {
        // Update readBy array if it exists
        if (!notification.readBy) {
          notification.readBy = [userId];
        } else if (!notification.readBy.includes(userId)) {
          notification.readBy.push(userId);
        }

        // Update isRead flag
        const wasRead = notification.isRead;
        notification.isRead = true;

        // Update unread count if status changed
        if (!wasRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    markAsUnread: (state, action: PayloadAction<{ notificationId: string; userId: string }>) => {
      const { notificationId, userId } = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);

      if (notification) {
        // Update readBy array if it exists
        if (notification.readBy) {
          notification.readBy = notification.readBy.filter(id => id !== userId);
        }

        // Update isRead flag
        const wasRead = notification.isRead;
        notification.isRead = false;

        // Update unread count if status changed
        if (wasRead) {
          state.unreadCount += 1;
        }
      }
    },
    // Add toast notification
    addToast: (state, action: PayloadAction<Omit<Toast, 'id' | 'displayed'>>) => {
      const toast = {
        ...action.payload,
        id: uuidv4(),
        displayed: false
      };
      state.toasts.push(toast);
    },
    // Remove toast notification
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    // Mark toast as displayed to prevent duplicate displays
    markToastAsDisplayed: (state, action: PayloadAction<string>) => {
      const toast = state.toasts.find(t => t.id === action.payload);
      if (toast) {
        toast.displayed = true;
      }
    }
  },
  extraReducers: builder => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';

        if (action.payload.reset) {
          // Replace notifications if reset is true
          state.notifications = action.payload.notifications;
        } else {
          // Append notifications if loading more
          state.notifications = [...state.notifications, ...action.payload.notifications];
        }

        state.lastDoc = action.payload.lastDoc;
        state.hasMore = action.payload.hasMore;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Read notification
      .addCase(readNotification.fulfilled, (state, action) => {
        const { notificationId, userId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);

        if (notification) {
          // Update readBy array
          if (!notification.readBy) {
            notification.readBy = [userId];
          } else if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
          }

          // Update isRead flag if not already read
          const wasRead = notification.isRead;
          notification.isRead = true;

          // Update unread count if status changed
          if (!wasRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

      // Unread notification
      .addCase(unreadNotification.fulfilled, (state, action) => {
        const { notificationId, userId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);

        if (notification) {
          // Update readBy array
          if (notification.readBy) {
            notification.readBy = notification.readBy.filter(id => id !== userId);
          }

          // Update isRead flag
          const wasRead = notification.isRead;
          notification.isRead = false;

          // Update unread count if status changed
          if (wasRead) {
            state.unreadCount += 1;
          }
        }
      })

      // Initialize FCM
      .addCase(initializeFcm.fulfilled, (state, action) => {
        state.fcmInitialized = action.payload;
      })
      .addCase(initializeFcm.rejected, state => {
        state.fcmInitialized = false;
      });
  }
});

// Actions
export const {
  addNotification,
  updateNotifications,
  setNotificationDrawer,
  clearNotificationError,
  resetNotifications,
  markAsRead,
  markAsUnread,
  addToast,
  removeToast,
  markToastAsDisplayed
} = notificationSlice.actions;

export default notificationSlice.reducer;
