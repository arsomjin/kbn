/**
 * User Notifications Utility
 * Functions to send notifications to users for various events
 */

import { app } from '../firebase';

/**
 * Send notification to a specific user
 * @param {string} userId - The user ID to send notification to
 * @param {Object} notificationData - The notification data
 */
export const sendUserNotification = async (userId, notificationData) => {
  try {
    const notification = {
      userId,
      title: notificationData.title,
      message: notificationData.message,
      description: notificationData.description || notificationData.message,
      type: notificationData.type || 'system_message',
      actionUrl: notificationData.actionUrl || null,
      data: notificationData.data || {},
      read: false,
      popupShown: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await app.firestore().collection('userNotifications').add(notification);

    console.log('✅ User notification sent:', {
      userId,
      type: notification.type,
      title: notification.title,
    });

    return true;
  } catch (error) {
    console.error('❌ Error sending user notification:', error);
    throw error;
  }
};

/**
 * Send approval notification to user when they get approved
 * @param {string} userId - The approved user ID
 * @param {Object} approverInfo - Information about who approved
 * @param {Object} userData - User data for personalization
 */
export const sendApprovalNotification = async (
  userId,
  approverInfo,
  userData = {}
) => {
  try {
    const displayName =
      userData.displayName ||
      `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
      userData.email?.split('@')[0] ||
      'ผู้ใช้';

    const notification = {
      title: '🎉 การสมัครสมาชิกได้รับการอนุมัติ!',
      message: `ยินดีต้อนรับ ${displayName}! บัญชีของคุณได้รับการอนุมัติแล้ว คุณสามารถเข้าใช้งานระบบได้เต็มรูปแบบ`,
      description: `อนุมัติโดย: ${approverInfo.name || 'ผู้จัดการ'} เมื่อ ${new Date().toLocaleString('th-TH')}`,
      type: 'approval_approved',
      actionUrl: '/overview',
      data: {
        approvedBy: approverInfo.uid,
        approverName: approverInfo.name,
        approvedAt: Date.now(),
        userDisplayName: displayName,
      },
    };

    await sendUserNotification(userId, notification);

    console.log('✅ Approval notification sent to user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error sending approval notification:', error);
    throw error;
  }
};

/**
 * Send rejection notification to user when they get rejected
 * @param {string} userId - The rejected user ID
 * @param {Object} rejectorInfo - Information about who rejected
 * @param {string} reason - Rejection reason
 * @param {Object} userData - User data for personalization
 */
export const sendRejectionNotification = async (
  userId,
  rejectorInfo,
  reason,
  userData = {}
) => {
  try {
    const displayName =
      userData.displayName ||
      `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
      userData.email?.split('@')[0] ||
      'ผู้ใช้';

    const notification = {
      title: '❌ การสมัครสมาชิกถูกปฏิเสธ',
      message: `เสียใจด้วย ${displayName} การสมัครสมาชิกของคุณถูกปฏิเสธ`,
      description: `เหตุผล: ${reason}\nคุณสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ภายใน 24 ชั่วโมง`,
      type: 'approval_rejected',
      actionUrl: '/auth/reapply',
      data: {
        rejectedBy: rejectorInfo.uid,
        rejectorName: rejectorInfo.name,
        rejectedAt: Date.now(),
        rejectionReason: reason,
        canReapply: true,
        reapplyAfter: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        userDisplayName: displayName,
      },
    };

    await sendUserNotification(userId, notification);

    console.log('✅ Rejection notification sent to user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error sending rejection notification:', error);
    throw error;
  }
};

/**
 * Send system message notification to user
 * @param {string} userId - The user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
export const sendSystemNotification = async (
  userId,
  title,
  message,
  options = {}
) => {
  try {
    const notification = {
      title,
      message,
      description: options.description || message,
      type: 'system_message',
      actionUrl: options.actionUrl || null,
      data: options.data || {},
    };

    await sendUserNotification(userId, notification);

    console.log('✅ System notification sent to user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error sending system notification:', error);
    throw error;
  }
};

/**
 * Send account update notification to user
 * @param {string} userId - The user ID
 * @param {string} updateType - Type of update (profile, permissions, etc.)
 * @param {string} description - Description of the update
 * @param {Object} options - Additional options
 */
export const sendAccountUpdateNotification = async (
  userId,
  updateType,
  description,
  options = {}
) => {
  try {
    const updateTitles = {
      profile: 'อัปเดตข้อมูลโปรไฟล์',
      permissions: 'อัปเดตสิทธิ์การใช้งาน',
      password: 'เปลี่ยนรหัสผ่าน',
      security: 'อัปเดตความปลอดภัย',
      default: 'อัปเดตบัญชีผู้ใช้',
    };

    const notification = {
      title: updateTitles[updateType] || updateTitles.default,
      message: description,
      description: options.description || description,
      type: 'account_update',
      actionUrl: options.actionUrl || '/profile',
      data: {
        updateType,
        updatedAt: Date.now(),
        ...options.data,
      },
    };

    await sendUserNotification(userId, notification);

    console.log('✅ Account update notification sent to user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error sending account update notification:', error);
    throw error;
  }
};

/**
 * Mark user notification as read
 * @param {string} notificationId - The notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await app
      .firestore()
      .collection('userNotifications')
      .doc(notificationId)
      .update({
        read: true,
        readAt: Date.now(),
      });

    console.log('✅ Notification marked as read:', notificationId);
    return true;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Delete user notification
 * @param {string} notificationId - The notification ID
 */
export const deleteUserNotification = async (notificationId) => {
  try {
    await app
      .firestore()
      .collection('userNotifications')
      .doc(notificationId)
      .delete();

    console.log('✅ Notification deleted:', notificationId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get user notifications
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    let query = app
      .firestore()
      .collection('userNotifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.unreadOnly) {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt),
    }));

    console.log('✅ Retrieved user notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count for user
 * @param {string} userId - The user ID
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const snapshot = await app
      .firestore()
      .collection('userNotifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const count = snapshot.size;
    console.log('✅ Unread notification count:', count);
    return count;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    throw error;
  }
};
