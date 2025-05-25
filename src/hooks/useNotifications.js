import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  readMultipleNotifications,
  updateNotifications,
  setNotificationDrawer,
  resetNotifications,
  initializeFcm,
  addToast
} from '../store/slices/notificationsSlice';
import { subscribeToNotifications, NotificationType } from '../services/notificationService';
import { notificationController } from '../controllers/notificationController';
import { getTimestampMillis, serializeTimestampArray } from '../utils/timestampUtils';
import { useAuth } from 'contexts/AuthContext';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, hasMore, status, error, isNotificationDrawerOpen, fcmInitialized } = useSelector(
    (state) => state.notifications
  );
  // Get user from AuthContext (or Redux if that's your pattern)
  const { user, userProfile } = useAuth();

  // Determine the UID to use for notification subscription
  const uid = user?.uid || userProfile?.uid;

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
    const handleFcmMessage = (event) => {
      const customEvent = event;
      const payload = customEvent.detail;

      // Log payload to help with debugging
      console.log('FCM message received in useNotifications:', payload);

      // Show toast notification for foreground messages
      if (payload?.notification) {
        dispatch(
          addToast({
            type: payload.data?.type || NotificationType.INFO,
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
    let unsubscribe = null;

    if (!uid || typeof uid !== 'string' || uid.length < 10) {
      return;
    }

    // Build a minimal profile for subscription if userProfile is not ready
    let effectiveProfile = {
      uid,
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      role: userProfile?.role || '',
      province: userProfile?.province || '',
      accessibleProvinceIds: userProfile?.accessibleProvinceIds || [],
      requestedType: userProfile?.requestedType || 'employee',
      createdAt: userProfile?.createdAt || new Date(),
      updatedAt: userProfile?.updatedAt || new Date()
    };

    unsubscribe = subscribeToNotifications(effectiveProfile, newNotifications => {
      if (newNotifications.length > 0) {
        // Serialize notifications before dispatching
        const serializedNotifications = serializeTimestampArray(newNotifications);
        dispatch(updateNotifications(serializedNotifications));

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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, userProfile, dispatch]);

  // Initial fetch of notifications
  useEffect(() => {
    if (userProfile) {
      // Fetch notifications and serialize before dispatching
      dispatch(fetchNotifications({ userProfile, reset: true })).then((action) => {
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

  const markAsRead = (notificationId) => {
    if (!userProfile?.uid) return;

    notificationController.markAsRead(notificationId, userProfile.uid);
  };

  const markAsUnread = (notificationId) => {
    if (!userProfile?.uid) return;

    notificationController.markAsUnread(notificationId, userProfile.uid);
  };

  const markAllAsRead = () => {
    if (!userProfile?.uid) return;

    const unreadIds = notifications.filter(notification => !notification.isRead).map(notification => notification.id);

    if (unreadIds.length > 0) {
      dispatch(
        readMultipleNotifications({
          notificationIds: unreadIds,
          userId: userProfile.uid
        })
      );
    }
  };

  const toggleNotificationDrawer = (isOpen) => {
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
  const sendNotification = async (notificationData, options) => {
    return await notificationController.sendNotification(notificationData, options);
  };

  /**
   * Show a temporary toast notification
   * @param title - Toast title
   * @param message - Toast message
   * @param type - Notification type
   * @param duration - Duration in seconds
   */
  const showToast = (title, message, type = NotificationType.INFO, duration = 4.5) => {
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
