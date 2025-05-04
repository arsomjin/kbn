import { store } from '../store';
import { addNotification, markAsRead, updateNotifications } from '../store/slices/notificationSlice';
import {
  Notification,
  NotificationType,
  createNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  saveFcmToken,
  initializeNotifications
} from '../services/notificationService';
import { callFunction } from '../utils/firestoreUtils';
import { UserProfile } from '../services/authService';
import { Timestamp } from 'firebase/firestore';

/**
 * Notification Controller - Central hub for notification management
 * Implements the publisher-subscriber pattern as described in the documentation
 */
export const notificationController = {
  /**
   * Initialize the notification system
   * @param userId - The user ID to initialize notifications for
   * @returns Promise<boolean> - Success status
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      return await initializeNotifications(userId);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  },

  /**
   * Create and store a new notification
   * @param notification - The notification data to create
   * @returns Promise<string> - The ID of the created notification
   */
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readBy'>
  ): Promise<string> {
    try {
      const notificationId = await createNotification(notification);

      // If the notification is for the current user, add it to the store
      const currentUser = store.getState().auth?.userProfile;
      if (currentUser) {
        const isRelevant = this.isNotificationRelevantToUser(notification, currentUser);

        if (isRelevant) {
          store.dispatch(
            addNotification({
              id: notificationId,
              ...notification,
              isRead: false,
              readBy: [],
              createdAt: Timestamp.now(),
              expiresAt: notification.expiresAt || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
            })
          );
        }
      }

      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Send a push notification to specific users
   * @param notification - The notification data
   * @param userIds - Array of user IDs to send to
   * @returns Promise<boolean> - Success status
   */
  async sendPushNotification(
    notification: { title: string; body: string; data?: Record<string, string> },
    userIds: string[]
  ): Promise<boolean> {
    try {
      // Call Firebase Cloud Function to send the push notification
      await callFunction('sendPushNotification', {
        notification,
        userIds
      });

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  },

  /**
   * Mark a notification as read
   * @param notificationId - The ID of the notification to mark as read
   * @param userId - The user ID who read the notification
   * @returns Promise<void>
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await markNotificationAsRead(notificationId, userId);

      // Update Redux store
      store.dispatch(markAsRead({ notificationId, userId }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as unread
   * @param notificationId - The ID of the notification to mark as unread
   * @param userId - The user ID
   * @returns Promise<void>
   */
  async markAsUnread(notificationId: string, userId: string): Promise<void> {
    try {
      await markNotificationAsUnread(notificationId, userId);

      // Update Redux store - would need to implement this action in your slice
      // store.dispatch(markAsUnread({ notificationId, userId }));
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  },

  /**
   * Check if a notification is relevant to a specific user
   * @param notification - The notification to check
   * @param userProfile - The user profile
   * @returns boolean - Whether the notification is relevant
   */
  isNotificationRelevantToUser(
    notification: Pick<Notification, 'targetRoles' | 'targetBranch' | 'targetDepartment'>,
    userProfile: UserProfile
  ): boolean {
    // Explicitly check each condition and ensure boolean return type
    if (!notification || !userProfile) return false;

    const hasNoTargeting = !notification.targetRoles && !notification.targetBranch && !notification.targetDepartment;

    const matchesRole =
      notification.targetRoles &&
      userProfile.role &&
      Array.isArray(notification.targetRoles) &&
      notification.targetRoles.includes(userProfile.role);

    const matchesBranch =
      notification.targetBranch && userProfile.branch && notification.targetBranch === userProfile.branch;

    const matchesDepartment =
      notification.targetDepartment &&
      userProfile.department &&
      notification.targetDepartment === userProfile.department;

    // Explicitly return a boolean value
    return Boolean(hasNoTargeting || matchesRole || matchesBranch || matchesDepartment);
  },

  /**
   * Send both in-app and push notifications in one call
   * @param notification - Notification data
   * @param options - Options including whether to send push and user targeting
   * @returns Promise<{id: string, success: boolean}>
   */
  async sendNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readBy'>,
    options: {
      sendPush?: boolean;
      userIds?: string[];
    } = {}
  ): Promise<{ id: string; success: boolean }> {
    try {
      // Create in-app notification
      const notificationId = await this.createNotification(notification);

      // Send push notification if requested
      if (options.sendPush && options.userIds && options.userIds.length > 0) {
        await this.sendPushNotification(
          {
            title: notification.title,
            body: notification.description,
            data: {
              type: notification.type,
              link: notification.link || '/'
            }
          },
          options.userIds
        );
      }

      return { id: notificationId, success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { id: '', success: false };
    }
  },

  /**
   * Track notification engagement for analytics
   * @param notificationId - The notification ID
   * @param userId - The user ID
   * @param action - The action taken (view, click, dismiss)
   * @returns Promise<void>
   */
  async trackEngagement(notificationId: string, userId: string, action: 'view' | 'click' | 'dismiss'): Promise<void> {
    try {
      // Implementation for tracking notification engagement
      // This would typically store the event in Firestore
      console.log(`Tracking notification engagement: ${action} on ${notificationId} by ${userId}`);

      // This is where you would implement analytics tracking
      // For now, we'll just mark as read if the action is 'click'
      if (action === 'click') {
        await this.markAsRead(notificationId, userId);
      }
    } catch (error) {
      console.error('Error tracking notification engagement:', error);
    }
  }
};

export default notificationController;
