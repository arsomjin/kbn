import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Notification,
  Toast,
  NotificationType,
  initializeNotifications,
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread
} from '../../services/notificationService';
import { UserProfile } from '../../services/authService';
import { DocumentSnapshot } from 'firebase/firestore';
import { serializeTimestampArray } from '../../utils/timestampUtils';

interface NotificationsState {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isNotificationDrawerOpen: boolean;
  fcmInitialized: boolean;
  lastDoc?: DocumentSnapshot;
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

      const state = getState() as { notifications: NotificationsState };
      const startAfterDoc = reset ? undefined : state.notifications.lastDoc;

      const result = await getNotifications(userProfile, pageSize, startAfterDoc);
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
    markAsRead: (state, action: PayloadAction<{ notificationId: string; userId: string }>) => {
      const notification = state.notifications.find(n => n.id === action.payload.notificationId);
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
    },
    updateNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload.map(n => ({
        ...n,
        description: n.description ?? n.title ?? ''
      }));
      let unreadAdded = 0;

      // Add only notifications that don't already exist
      newNotifications.forEach(newNotif => {
        const existingIndex = state.notifications.findIndex(existing => existing.id === newNotif.id);

        if (existingIndex !== -1) {
          // Update existing notification if read status changed
          if (state.notifications[existingIndex].isRead !== newNotif.isRead) {
            if (newNotif.isRead) {
              unreadAdded--;
            } else {
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
      state.notifications = state.notifications
        .map(notification => {
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
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    resetNotifications: state => {
      state.notifications = [];
      state.lastDoc = undefined;
      state.hasMore = false;
      state.unreadCount = 0;
    },
    setNotificationDrawer: (state, action: PayloadAction<boolean>) => {
      state.isNotificationDrawerOpen = action.payload;
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
          state.notifications = action.payload.notifications;
        } else {
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
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount -= 1;
        }
      })
      // Unread notification
      .addCase(unreadNotification.fulfilled, (state, action) => {
        const { notificationId, userId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && notification.isRead) {
          notification.isRead = false;
          state.unreadCount += 1;
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
  setFcmInitialized,
  updateNotifications,
  resetNotifications,
  setNotificationDrawer
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
