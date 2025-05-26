import { store } from '../store';
import {
  addNotification,
  markAsRead,
  updateNotifications,
} from '../store/slices/notificationsSlice';
import {
  Notification,
  NotificationType,
  createNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  initializeNotifications,
  getNotifications,
} from '../services/notificationService';
import { callFunction } from '../utils/firestoreUtils';
import { UserProfile } from '../services/authService';
import { Timestamp } from 'firebase/firestore';
import { ROLES, RoleType } from '../constants/roles';
import { hasRolePrivilege } from 'utils/roleUtils';

/**
 * Basic interface for notification objects with province-aware properties
 */
interface NotificationInterface {
  id?: string;
  title: string;
  description: string;
  type: NotificationType;
  provinceId?: string | null;
  targetRoles?: string[];
  targetBranch?: string;
  targetDepartment?: string;
  link?: string;
  imageUrl?: string;
}

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
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readBy'>,
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
              expiresAt:
                notification.expiresAt ||
                Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            }),
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
    userIds: string[],
  ): Promise<boolean> {
    try {
      // Call Firebase Cloud Function to send the push notification
      await callFunction('sendPushNotification', {
        notification,
        userIds,
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
   * Check if a notification is relevant to a specific user based on RBAC
   * @param notification - The notification to check
   * @param userProfile - The user profile
   * @returns boolean - Whether the notification is relevant
   */
  isNotificationRelevantToUser(
    notification: Pick<
      Notification,
      'targetRoles' | 'targetBranch' | 'targetDepartment' | 'provinceId' | 'type'
    >,
    userProfile: UserProfile,
  ): boolean {
    // Explicitly check each condition and ensure boolean return type
    if (!notification || !userProfile) return false;

    const hasNoTargeting =
      !notification.targetRoles &&
      !notification.targetBranch &&
      !notification.targetDepartment &&
      !notification.provinceId;

    // Check for role matching with special handling for province_admin
    let matchesRole = false;
    if (notification.targetRoles && userProfile?.role && Array.isArray(notification.targetRoles)) {
      // Direct role match
      matchesRole = notification.targetRoles.includes(userProfile?.role);

      // Special handling for province_admin - they should also see notifications for roles they manage
      if (!matchesRole && userProfile?.role === 'province_admin') {
        // province_admin should see notifications intended for province_manager, branch_manager, etc.
        const provinceAdminManagesRoles = ['province_manager', 'branch_manager', 'lead', 'user'];
        const targetsManageableRole = provinceAdminManagesRoles.some((role) =>
          notification.targetRoles?.includes(role),
        );

        if (targetsManageableRole) {
          matchesRole = true;
        }
      }
    }

    const matchesBranch =
      notification.targetBranch &&
      userProfile.branch &&
      notification.targetBranch === userProfile.branch;

    const matchesDepartment =
      notification.targetDepartment &&
      userProfile.department &&
      notification.targetDepartment === userProfile.department;

    // Check province access based on user role and accessible provinces
    const hasProvinceAccess = this.checkNotificationPermission(
      {
        title: '', // Add required properties to satisfy the NotificationInterface
        description: '',
        type: notification.type || NotificationType.INFO,
        provinceId: notification.provinceId,
      },
      userProfile,
    );

    // Explicitly return a boolean value
    return Boolean(
      hasNoTargeting ||
        (matchesRole && hasProvinceAccess) ||
        (matchesBranch && hasProvinceAccess) ||
        (matchesDepartment && hasProvinceAccess),
    );
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
    } = {},
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
              link: notification.link || '/',
              provinceId: notification.provinceId || '', // Convert null to empty string
            },
          },
          options.userIds,
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
  async trackEngagement(
    notificationId: string,
    userId: string,
    action: 'view' | 'click' | 'dismiss',
  ): Promise<void> {
    try {
      // Implementation for tracking notification engagement
      // This would typically store the event in Firestore
      console.log(`Tracking notification engagement: ${action} on ${notificationId} by ${userId}`);

      // Call analytics tracking function if available
      // await trackEvent('notification_engagement', { action, notificationId, userId });

      // If the action is 'click', mark the notification as read
      if (action === 'click') {
        await this.markAsRead(notificationId, userId);
      }
    } catch (error) {
      console.error('Error tracking notification engagement:', error);
    }
  },

  /**
   * Mark all notifications as read for a user within a specific province
   * @param userId - User ID
   * @param provinceId - Optional province ID for filtering
   * @returns Promise<void>
   */
  async markAllAsRead(userId: string, provinceId?: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await callFunction('markAllNotificationsAsRead', {
        userId,
        provinceId,
      });

      // Update local state by fetching fresh notifications
      const userProfile = store.getState().auth?.userProfile;
      if (userProfile) {
        // Dispatch action to update notifications
        store.dispatch(updateNotifications([])); // Clear current notifications
        // You would typically fetch updated notifications here
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Check if a user has permission to access a notification based on province access
   * @param notification - The notification to check
   * @param userProfile - The user profile
   * @returns boolean - Whether the user has permission for the notification
   */
  checkNotificationPermission(
    notification: NotificationInterface,
    userProfile: UserProfile,
  ): boolean {
    // If notification has no province ID, it's a system-wide notification
    if (!notification.provinceId) return true;

    // Check if user has permissions to access this province's notifications

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (hasRolePrivilege(userProfile?.role as RoleType, ROLES.GENERAL_MANAGER)) {
      return true;
    }

    // Other roles with multiple province access check their accessible provinces
    if (userProfile.accessibleProvinceIds && userProfile.accessibleProvinceIds.length > 0) {
      return userProfile.accessibleProvinceIds.includes(notification.provinceId);
    }

    // All other roles can only access their assigned province
    return userProfile.province === notification.provinceId;
  },

  /**
   * Fetch notifications based on user ID and optional province filtering
   * @param options - Parameters for fetching notifications
   * @returns Promise<Notification[]> - Retrieved notifications
   */
  async fetchNotifications(options: {
    userId: string;
    limit?: number;
    provinceId?: string;
    startAfter?: any;
    userProfile: UserProfile;
  }): Promise<Notification[]> {
    try {
      // Build query based on options provided
      const pageSize = options.limit || 10;
      const { userProfile } = options;

      if (!userProfile) {
        throw new Error('User is not authenticated');
      }

      // Get notifications with proper filtering
      const result = await getNotifications(userProfile, pageSize, options.startAfter);

      // Handle province filtering based on user role
      let notifications = result.notifications;

      // Special handling for province_admin role - they should see all notifications
      // for their province plus any system-wide notifications (those with null provinceId)
      if (options.provinceId && userProfile?.role === 'province_admin') {
        notifications = notifications.filter(
          (notification: Notification) =>
            !notification.provinceId || // System-wide notifications (null provinceId)
            notification.provinceId === options.provinceId, // Province-specific notifications
        );
      }
      // Standard province filtering for other roles
      else if (options.provinceId) {
        notifications = notifications.filter(
          (notification: Notification) =>
            !notification.provinceId || notification.provinceId === options.provinceId,
        );
      }

      // Check each notification against user permissions
      notifications = notifications.filter((notification) => {
        const hasPermission = this.checkNotificationPermission(
          {
            title: notification.title,
            description: notification.description,
            type: notification.type,
            provinceId: notification.provinceId,
            targetRoles: notification.targetRoles,
          },
          userProfile,
        );

        return hasPermission;
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Create a notification specifically for new user registrations
   * with proper RBAC role targeting and province awareness
   * @param user - User data with province information
   * @returns Promise<{id: string, success: boolean}>
   */
  async createUserRegistrationNotification(user?: {
    provinceId?: string;
    displayName?: string;
    email?: string;
  }): Promise<{ id: string; success: boolean }> {
    try {
      const targetRoles = [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER, ROLES.PROVINCE_ADMIN];
      const provinceId = user?.provinceId || null;
      const userName = user?.displayName || user?.email || '';

      const notification = {
        title: 'มีผู้ใช้ลงทะเบียนใหม่',
        description: userName
          ? `มีผู้ใช้ลงทะเบียนใหม่ในระบบที่รอการอนุมัติ: ${userName}`
          : 'มีผู้ใช้ลงทะเบียนใหม่ในระบบที่รอการอนุมัติ',
        type: NotificationType.INFO,
        provinceId,
        targetRoles,
        link: '/review-users',
        imageUrl: '/logo192.png', // Add default avatar/logo for user registration notifications
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      };

      return await this.sendNotification(notification);
    } catch (error) {
      console.error('Error creating user registration notification:', error);
      return { id: '', success: false };
    }
  },

  /**
   * Fetch personal notifications for a user
   * @param userId - User ID
   * @param userProfile - User profile
   * @returns Promise<Notification[]> - Retrieved notifications
   */
  async fetchPersonalNotifications(
    userId: string,
    userProfile: UserProfile,
  ): Promise<Notification[]> {
    try {
      if (!userProfile) {
        throw new Error('User profile is required');
      }

      // Get notifications with proper filtering
      const result = await getNotifications(userProfile, 10);

      // Filter to only include notifications where the user is the target
      const notifications = result.notifications.filter((notification) => {
        // Check if this is a personal notification (no targeting criteria)
        const isPersonal =
          !notification.targetRoles && !notification.targetBranch && !notification.targetDepartment;

        // Check if user is explicitly targeted
        const isTargeted =
          notification.targetRoles?.includes(userProfile?.role) ||
          notification.targetBranch === userProfile.branch ||
          notification.targetDepartment === userProfile.department;

        return isPersonal || isTargeted;
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching personal notifications:', error);
      return [];
    }
  },
};

export default notificationController;
