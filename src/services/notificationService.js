import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  getDoc,
  limit,
  startAfter,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore, initializeMessaging, requestNotificationPermission } from './firebase';
import { getToken } from 'firebase/messaging';

// Notification types
export const NotificationType = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Request and save FCM token for push notifications
 * @param userId Current user ID
 * @returns Promise resolving to boolean indicating if token was saved successfully
 */
export const saveFcmToken = async (userId) => {
  try {
    // First check current permission status
    if (Notification.permission === 'denied') {
      console.log(
        'Notification permission is blocked. Please enable notifications in your browser settings.',
      );
      return false;
    }

    // Request notification permission if not already granted
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    const messaging = await initializeMessaging();
    if (!messaging) return false;

    try {
      // Get token and save it
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        console.error('No FCM token received');
        return false;
      }

      // Get user's province information for province-based token storage
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      const userData = userDoc.data();

      const tokenRef = doc(firestore, 'fcmTokens', userId);

      // Use setDoc instead of updateDoc for the non-existent document case
      await setDoc(
        tokenRef,
        {
          token,
          userId,
          device: navigator.userAgent,
          provinceId: userData?.provinceId || null, // Associate token with user's province
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log('FCM token saved successfully');
      return true;
    } catch (error) {
      // Handle specific FCM permission errors
      if (error?.code === 'messaging/permission-blocked') {
        console.error(
          'Notification permission is blocked. Please enable notifications in your browser settings.',
        );
        return false;
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Get notifications for a user
export const getNotifications = async (userProfile, pageSize = 10, startAfterDocId) => {
  try {
    if (!userProfile) {
      throw new Error('User profile is required');
    }

    const userId = userProfile.uid;
    if (!userId) {
      throw new Error('User ID is required');
    }

    let notificationsQuery = query(
      collection(firestore, 'notifications'),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1),
    );

    // If this is a pagination request, start after the last document ID
    let lastDoc = null;
    if (startAfterDocId) {
      // Fetch the document snapshot by ID for pagination
      const lastDocRef = doc(firestore, 'notifications', startAfterDocId);
      lastDoc = await getDoc(lastDocRef);
      if (lastDoc.exists()) {
        notificationsQuery = query(notificationsQuery, startAfter(lastDoc));
      }
    }

    const querySnapshot = await getDocs(notificationsQuery);

    const notifications = [];
    let lastVisible = null;

    querySnapshot.forEach((docSnap) => {
      const index = notifications.length;
      if (index === pageSize) {
        lastVisible = docSnap;
        return;
      }
      const data = docSnap.data();

      // Check if this notification has no targeting criteria (for all users)
      const hasNoTargeting = !data.targetRoles && !data.targetBranch && !data.targetDepartment;

      // Check if user's role matches the notification's target roles
      let matchesRole = false;
      if (data.targetRoles && userProfile.role && Array.isArray(data.targetRoles)) {
        matchesRole = data.targetRoles.some(
          (targetRole) => targetRole.toUpperCase() === userProfile.role.toUpperCase(),
        );

        // Special handling for province_admin - they should also see user registration notifications
        if (!matchesRole && userProfile.role.toUpperCase() === 'PROVINCE_ADMIN') {
          // Check if this is a user registration notification (based on title pattern)
          const isUserRegistration =
            data.title === 'มีผู้ใช้ลงทะเบียนใหม่' ||
            data.title === 'notifications.adminTitle' ||
            data.title === 'profile.adminTitle' ||
            (data.link && data.link.includes('/review-users'));

          // Check if notification is targeted at roles province_admin should see
          // Using correct role names from RBAC system
          const adminRoles = ['SUPER_ADMIN', 'PROVINCE_ADMIN', 'GENERAL_MANAGER'];
          const hasAdminTargeting = data.targetRoles.some((role) =>
            adminRoles.includes(role.toUpperCase()),
          );

          if (isUserRegistration && hasAdminTargeting) {
            matchesRole = true;
          }

          // province_admin should also see notifications for roles they manage
          const provinceAdminManagesRoles = ['province_manager', 'branch_manager', 'lead', 'user'];
          const targetsManageableRole = provinceAdminManagesRoles.some((role) =>
            data.targetRoles?.some((targetRole) => targetRole.toUpperCase() === role.toUpperCase()),
          );

          if (targetsManageableRole) {
            matchesRole = true;
          }
        }
      }

      let matchesBranch = false;
      if (data.targetBranch && userProfile.branch) {
        matchesBranch = data.targetBranch === userProfile.branch;
      }

      let matchesDepartment = false;
      if (data.targetDepartment && userProfile.department) {
        matchesDepartment = data.targetDepartment === userProfile.department;
      }

      // Check if this notification is targeted to the current user
      const isPersonal = data.targetUserId && data.targetUserId === userId;

      // For province_admin, check province match
      let provinceRelevant = true; // Default true for non-province notifications
      if (data.provinceId) {
        if (userProfile.role === 'province_admin') {
          // Province admin should see notifications for their province or system-wide
          provinceRelevant = !data.provinceId || data.provinceId === userProfile.province;
        } else if (
          userProfile.accessibleProvinceIds &&
          userProfile.accessibleProvinceIds.length > 0
        ) {
          // Users with multiple province access
          provinceRelevant =
            !data.provinceId || userProfile.accessibleProvinceIds.includes(data.provinceId);
        } else {
          // Regular users can only see their province's notifications or system-wide
          provinceRelevant = !data.provinceId || data.provinceId === userProfile.province;
        }
      }

      // Combine all the relevance criteria
      const isRelevant =
        (isPersonal || hasNoTargeting || matchesRole || matchesBranch || matchesDepartment) &&
        provinceRelevant;

      if (isRelevant) {
        // Check if the notification has been read by this user
        const readBy = data.readBy || [];
        const isRead = readBy.includes(userId);

        notifications.push({
          id: docSnap.id,
          ...data,
          isRead,
        });
      }
    });

    const hasMore = querySnapshot.size > pageSize;
    // Only return the lastDocId (not the snapshot)
    return {
      notifications,
      lastDocId: lastVisible ? lastVisible.id : undefined,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return {
      notifications: [],
      lastDocId: undefined,
      hasMore: false,
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      throw new Error('Notification ID and User ID are required');
    }

    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark notification as unread
export const markNotificationAsUnread = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      throw new Error('Notification ID and User ID are required');
    }

    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

// Create a new notification
export const createNotification = async (notification) => {
  try {
    const notificationData = {
      ...notification,
      isRead: false,
      readBy: [],
      createdAt: Timestamp.now(),
      expiresAt:
        notification.expiresAt ||
        Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days by default
    };

    const docRef = await addDoc(collection(firestore, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Subscribe to real-time notifications for a user
export const subscribeToNotifications = (userProfile, onNotification) => {
  if (!userProfile) {
    console.error('User profile is required for notification subscription');
    return () => undefined;
  }

  // In your Redux structure, the uid is directly on userProfile
  // If userProfile.uid doesn't exist, this function will return
  // an empty unsubscribe function
  const userId = userProfile.uid;

  if (!userId) {
    console.error('User ID is required for notification subscription');
    return () => undefined;
  }

  // Query for notifications that:
  // 1. Haven't expired (or have no expiration)
  // 2. Are ordered by most recent first
  const notificationsQuery = query(
    collection(firestore, 'notifications'),
    where('expiresAt', '>', Timestamp.now()),
    orderBy('expiresAt', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(20),
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check if this notification has no targeting criteria (for all users)
      const hasNoTargeting = !data.targetRoles && !data.targetBranch && !data.targetDepartment;

      // Check if user's role matches the notification's target roles
      let matchesRole = false;
      if (data.targetRoles && userProfile.role && Array.isArray(data.targetRoles)) {
        // Direct role match - case insensitive
        matchesRole = data.targetRoles.some(
          (targetRole) => targetRole.toUpperCase() === userProfile.role.toUpperCase(),
        );

        // Special handling for province_admin - they should also see user registration notifications
        if (!matchesRole && userProfile.role.toUpperCase() === 'PROVINCE_ADMIN') {
          // Check if this is a user registration notification (based on title pattern)
          const isUserRegistration =
            data.title === 'มีผู้ใช้ลงทะเบียนใหม่' ||
            data.title === 'notifications.adminTitle' ||
            data.title === 'profile.adminTitle' ||
            (data.link && data.link.includes('/review-users'));

          // Check if notification is targeted at roles province_admin should see
          // Using correct role names from RBAC system
          const adminRoles = ['SUPER_ADMIN', 'PROVINCE_ADMIN', 'GENERAL_MANAGER'];
          const hasAdminTargeting = data.targetRoles.some((role) =>
            adminRoles.includes(role.toUpperCase()),
          );

          if (isUserRegistration && hasAdminTargeting) {
            matchesRole = true;
          }

          // province_admin should also see notifications for roles they manage
          const provinceAdminManagesRoles = ['province_manager', 'branch_manager', 'lead', 'user'];
          const targetsManageableRole = provinceAdminManagesRoles.some((role) =>
            data.targetRoles?.some((targetRole) => targetRole.toUpperCase() === role.toUpperCase()),
          );

          if (targetsManageableRole) {
            matchesRole = true;
          }
        }
      }

      const matchesBranch = Boolean(
        data.targetBranch && userProfile.branch && data.targetBranch === userProfile.branch,
      );

      const matchesDepartment = Boolean(
        data.targetDepartment &&
          userProfile.department &&
          data.targetDepartment === userProfile.department,
      );

      // Check if this notification is targeted to the current user
      const isPersonal = Array.isArray(data.targetUserIds) && data.targetUserIds.includes(userId);

      // Check province relevance
      let provinceRelevant = true;
      if (data.provinceId) {
        if (userProfile.role === 'province_admin') {
          // Province admin should see notifications for their province or system-wide
          provinceRelevant = !data.provinceId || data.provinceId === userProfile.province;
        } else if (
          userProfile.accessibleProvinceIds &&
          userProfile.accessibleProvinceIds.length > 0
        ) {
          // Users with multiple province access
          provinceRelevant =
            !data.provinceId || userProfile.accessibleProvinceIds.includes(data.provinceId);
        } else {
          // Regular users can only see their province's notifications or system-wide
          provinceRelevant = !data.provinceId || data.provinceId === userProfile.province;
        }
      }

      // Combine all the relevance criteria
      const isRelevant =
        (isPersonal || hasNoTargeting || matchesRole || matchesBranch || matchesDepartment) &&
        provinceRelevant;

      if (isRelevant) {
        // Check if the user has read this notification
        const readBy = data.readBy || [];
        const isRead = readBy.includes(userId);

        // Ensure all required fields are present or provide defaults
        const notification = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          type: data.type || NotificationType.INFO,
          isRead: isRead,
          readBy: data.readBy || [],
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || data.createdAt || Timestamp.now(),
          expiresAt: data.expiresAt,
          targetRoles: data.targetRoles,
          targetBranch: data.targetBranch,
          targetDepartment: data.targetDepartment,
          link: data.link,
          imageUrl: data.imageUrl,
        };

        notifications.push(notification);
      }
    });

    onNotification(notifications);
  });
};

// Initialize FCM and request permission
export const initializeNotifications = async (userId) => {
  try {
    if (!userId) return false;

    // Request permission and save FCM token
    const success = await saveFcmToken(userId);

    // Set up listener for FCM messages
    window.addEventListener('fcm-message', (event) => {
      const customEvent = event;
      const payload = customEvent.detail;

      console.log('FCM message event received:', payload);

      // Process notification data if needed
      // This is a good place to dispatch actions to Redux or update UI
    });

    return success;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};
