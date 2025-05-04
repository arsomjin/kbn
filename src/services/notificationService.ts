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
  DocumentSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { firestore, initializeMessaging, requestNotificationPermission } from './firebase';
import { getToken } from 'firebase/messaging';
import { UserProfile } from './authService';

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

// Notification interface
export interface Notification {
  id?: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp | Date;
  expiresAt?: Timestamp;
  targetRoles?: string[];
  targetBranch?: string;
  targetDepartment?: string;
  link?: string;
  imageUrl?: string;
  readBy?: string[]; // Array of user IDs who read the notification
}

/**
 * Request and save FCM token for push notifications
 * @param userId Current user ID
 * @returns Promise resolving to boolean indicating if token was saved successfully
 */
export const saveFcmToken = async (userId: string): Promise<boolean> => {
  try {
    // First request notification permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    const messaging = await initializeMessaging();
    if (!messaging) return false;

    // Get token and save it
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });

    if (!token) {
      console.error('No FCM token received');
      return false;
    }

    const tokenRef = doc(firestore, 'fcmTokens', userId);

    // Use setDoc instead of updateDoc for the non-existent document case
    await setDoc(
      tokenRef,
      {
        token,
        userId,
        device: navigator.userAgent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );

    console.log('FCM token saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Get notifications for a user
export const getNotifications = async (
  userProfile: UserProfile,
  pageSize = 10,
  startAfterDoc?: DocumentSnapshot
): Promise<{
  notifications: Notification[];
  lastDoc: DocumentSnapshot | undefined;
  hasMore: boolean;
}> => {
  try {
    if (!userProfile) {
      throw new Error('User profile is required');
    }
    
    const userId = userProfile.uid;
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Base query - includes notifications that:
    // 1. Haven't expired
    // 2. Match user targeting criteria (role, branch, department)
    // 3. Are for all users (no specific targeting)
    let notificationsQuery = query(
      collection(firestore, 'notifications'),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Get one extra to check if there's more
    );

    // If this is a pagination request, start after the last document
    if (startAfterDoc) {
      notificationsQuery = query(notificationsQuery, startAfter(startAfterDoc));
    }

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];
    let lastDoc: DocumentSnapshot | undefined;

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const index = notifications.length;
      // If this is the extra document, just save it as lastDoc
      if (index === pageSize) {
        lastDoc = doc;
        return;
      }

      const data = doc.data() as Notification;

      // Check if this notification is relevant to the user
      const isRelevant =
        // No targeting specified - for all users
        (!data.targetRoles && !data.targetBranch && !data.targetDepartment) ||
        // Role targeting
        (data.targetRoles && userProfile.role && data.targetRoles.includes(userProfile.role)) ||
        // Branch targeting
        (data.targetBranch && userProfile.branch && data.targetBranch === userProfile.branch) ||
        // Department targeting
        (data.targetDepartment && userProfile.department && data.targetDepartment === userProfile.department);

      if (isRelevant) {
        // Check if the notification has been read by this user
        const readBy = data.readBy || [];
        const isRead = readBy.includes(userId); // Use userId instead of userProfile.uid

        notifications.push({
          id: doc.id,
          ...data,
          isRead
        });
      }
    });

    // Determine if there are more notifications to fetch
    const hasMore = querySnapshot.size > pageSize;

    return {
      notifications,
      lastDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return {
      notifications: [],
      lastDoc: undefined,
      hasMore: false
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (!notificationId || !userId) {
      throw new Error('Notification ID and User ID are required');
    }

    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayUnion(userId),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark notification as unread
export const markNotificationAsUnread = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (!notificationId || !userId) {
      throw new Error('Notification ID and User ID are required');
    }

    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayRemove(userId),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readBy'>
): Promise<string> => {
  try {
    const notificationData: Omit<Notification, 'id'> = {
      ...notification,
      isRead: false,
      readBy: [],
      createdAt: Timestamp.now(),
      expiresAt: notification.expiresAt || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days by default
    };

    const docRef = await addDoc(collection(firestore, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Subscribe to real-time notifications for a user
export const subscribeToNotifications = (
  userProfile: UserProfile,
  onNotification: (notifications: Notification[]) => void
): (() => void) => {
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
    limit(20)
  );

  return onSnapshot(notificationsQuery, snapshot => {
    const notifications: Notification[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      // Check if this notification is relevant to the user
      const isRelevant =
        // No targeting specified - for all users
        (!data.targetRoles && !data.targetBranch && !data.targetDepartment) ||
        // Role targeting
        (data.targetRoles && userProfile.role && data.targetRoles.includes(userProfile.role)) ||
        // Branch targeting
        (data.targetBranch && userProfile.branch && data.targetBranch === userProfile.branch) ||
        // Department targeting
        (data.targetDepartment && userProfile.department && data.targetDepartment === userProfile.department);

      if (isRelevant) {
        // Check if the user has read this notification
        const readBy = data.readBy || [];
        const isRead = readBy.includes(userId); // Use userId instead of userProfile.uid

        // Ensure all required fields are present or provide defaults
        const notification: Notification = {
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
          imageUrl: data.imageUrl
        };

        notifications.push(notification);
      }
    });

    onNotification(notifications);
  });
};

// Initialize FCM and request permission
export const initializeNotifications = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;

    // Request permission and save FCM token
    const success = await saveFcmToken(userId);

    // Set up listener for FCM messages
    window.addEventListener('fcm-message', (event: Event) => {
      const customEvent = event as CustomEvent;
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
