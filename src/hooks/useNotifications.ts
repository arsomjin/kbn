import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { UserProfile } from '../services/authService';
import {
  fetchNotifications,
  readNotification,
  unreadNotification,
  readMultipleNotifications,
  updateNotifications,
  setNotificationDrawer,
  resetNotifications,
  initializeFcm,
  addToast
} from '../store/slices/notificationSlice';
import { subscribeToNotifications, NotificationType } from '../services/notificationService';
import { notificationController } from '../controllers/notificationController';
import { getTimestampMillis, serializeTimestampArray } from '../utils/timestampUtils';

export const useNotifications = (userProfile: UserProfile | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, hasMore, status, error, isNotificationDrawerOpen, fcmInitialized } = useSelector(
    (state: RootState) => state.notifications
  );

  // Initialize Firebase Cloud Messaging using the notification controller
  useEffect(() => {
    const initializeNotifications = async () => {
      if (userProfile?.uid && !fcmInitialized) {
        try {
          const success = await notificationController.initialize(userProfile.uid);
          if (success) {
            dispatch(initializeFcm(userProfile.uid));
          }
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    initializeNotifications();
  }, [userProfile, fcmInitialized, dispatch]);

  // Listen for FCM messages received when app is in foreground
  useEffect(() => {
    const handleFcmMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail;

      // Log payload to help with debugging
      console.log('FCM message received in useNotifications:', payload);

      // Show toast notification for foreground messages
      if (payload?.notification) {
        dispatch(
          addToast({
            type: (payload.data?.type as NotificationType) || NotificationType.INFO,
            title: payload.notification.title || 'New Notification',
            message: payload.notification.body || '',
            duration: 6 // Show for 6 seconds
          })
        );
      }

      // Refresh notification data
      if (userProfile) {
        dispatch(fetchNotifications({ userProfile, reset: true }));
      }
    };

    // Add event listener for FCM messages
    window.addEventListener('fcm-message', handleFcmMessage);

    // Clean up event listener
    return () => {
      window.removeEventListener('fcm-message', handleFcmMessage);
    };
  }, [userProfile, dispatch]);

  // Real-time notification subscription via Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (userProfile) {
      unsubscribe = subscribeToNotifications(userProfile, newNotifications => {
        if (newNotifications.length > 0) {
          // Serialize notifications before dispatching
          dispatch(updateNotifications(serializeTimestampArray(newNotifications)));

          // Show toast for new unread notifications that just arrived
          const now = Date.now();
          const recentNotifications = newNotifications.filter(n => {
            const notificationTime = getTimestampMillis(n.createdAt);
            // Only show toasts for notifications that are less than 10 seconds old
            return !n.isRead && now - notificationTime < 10000;
          });

          if (recentNotifications.length > 0) {
            recentNotifications.forEach(notification => {
              dispatch(
                addToast({
                  type: notification.type,
                  title: notification.title,
                  message: notification.description,
                  duration: 6 // Show for 6 seconds
                })
              );
            });
          }
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userProfile, dispatch]);

  // Initial fetch of notifications
  useEffect(() => {
    if (userProfile) {
      // Fetch notifications and serialize before dispatching
      dispatch(fetchNotifications({ userProfile, reset: true })).then((action: any) => {
        if (action.payload && action.payload.notifications) {
          action.payload.notifications = serializeTimestampArray(action.payload.notifications);
        }
      });
    } else {
      // Reset notifications when user logs out
      dispatch(resetNotifications());
    }
  }, [userProfile, dispatch]);

  const loadMoreNotifications = () => {
    if (userProfile && hasMore && status !== 'loading') {
      dispatch(fetchNotifications({ userProfile }));
    }
  };

  const markAsRead = (notificationId: string) => {
    if (!userProfile?.uid) return;

    notificationController.markAsRead(notificationId, userProfile.uid);
  };

  const markAsUnread = (notificationId: string) => {
    if (!userProfile?.uid) return;

    notificationController.markAsUnread(notificationId, userProfile.uid);
  };

  const markAllAsRead = () => {
    if (!userProfile?.uid) return;

    const unreadIds = notifications.filter(notification => !notification.isRead).map(notification => notification.id!);

    if (unreadIds.length > 0) {
      dispatch(
        readMultipleNotifications({
          notificationIds: unreadIds,
          userId: userProfile.uid
        })
      );
    }
  };

  const toggleNotificationDrawer = (isOpen?: boolean) => {
    if (isOpen !== undefined) {
      dispatch(setNotificationDrawer(isOpen));
    } else {
      dispatch(setNotificationDrawer(!isNotificationDrawerOpen));
    }
  };

  /**
   * Send a new notification
   * @param notificationData - The notification data
   * @param options - Options for the notification
   */
  const sendNotification = async (notificationData: any, options?: { sendPush?: boolean; userIds?: string[] }) => {
    return await notificationController.sendNotification(notificationData, options);
  };

  /**
   * Show a temporary toast notification
   * @param title - Toast title
   * @param message - Toast message
   * @param type - Notification type
   * @param duration - Duration in seconds
   */
  const showToast = (
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    duration = 4.5
  ) => {
    dispatch(
      addToast({
        title,
        message,
        type,
        duration
      })
    );
  };

  return {
    notifications,
    unreadCount,
    isLoading: status === 'loading',
    hasMore,
    error,
    isNotificationDrawerOpen,
    fcmInitialized,
    loadMoreNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    toggleNotificationDrawer,
    sendNotification,
    showToast
  };
};
