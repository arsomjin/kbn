import { Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';

/**
 * Interface defining the common timestamp fields that might be present in our data objects
 */
interface WithTimestamps {
  createdAt?: Timestamp | Date | string | number | null;
  updatedAt?: Timestamp | Date | string | number | null;
  expiresAt?: Timestamp | Date | string | number | null;
  readAt?: Timestamp | Date | string | number | null;
}

/**
 * Convert a Timestamp, string, or Date to milliseconds
 */
export const getTimestampMillis = (timestamp: Timestamp | string | Date | null | undefined): number => {
  if (!timestamp) return Date.now();

  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (typeof timestamp === 'string') {
    // Try to parse as ISO string using Luxon for reliability
    const dt = DateTime.fromISO(timestamp);
    if (dt.isValid) return dt.toMillis();
    // fallback to Date if not ISO
    return new Date(timestamp).getTime();
  }

  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }

  return Date.now();
};

/**
 * Format relative time from a timestamp
 */
export const formatRelativeTime = (timestamp: Timestamp | string | Date | null | undefined): string => {
  if (!timestamp) return '';

  const millis = getTimestampMillis(timestamp);
  const dateTime = DateTime.fromMillis(millis);
  return dateTime.toRelative() || '';
};

/**
 * Convert Firebase Timestamp to a serializable format (ISO string or milliseconds)
 * @param timestamp - Firebase Timestamp object
 * @param format - Output format ('iso' for ISO string, 'millis' for milliseconds)
 * @returns string | number - Serialized representation of timestamp
 */
export const serializeTimestamp = (
  timestamp: Timestamp | Date | undefined | null,
  format: 'iso' | 'millis' = 'iso'
): string | number | null => {
  if (!timestamp) return null;

  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

  return format === 'iso' ? date.toISOString() : date.getTime();
};

/**
 * Convert a serialized timestamp back to a Firebase Timestamp object
 * @param value - Serialized timestamp (ISO string or milliseconds)
 * @returns Timestamp - Firebase Timestamp object
 */
export const deserializeTimestamp = (value: string | number | null | undefined): Timestamp | null => {
  if (!value) return null;

  const millis = typeof value === 'string' ? DateTime.fromISO(value).toMillis() : value;

  return Timestamp.fromMillis(millis);
};

/**
 * Process a notification object to convert all timestamp fields to serializable format
 * @param notification - Notification object with possible Timestamp fields
 * @returns Notification with serialized timestamps
 */
export const serializeNotification = <T extends Partial<WithTimestamps>>(notification: T): T => {
  const result = { ...notification };

  if (result.createdAt && (result.createdAt instanceof Timestamp || result.createdAt instanceof Date)) {
    result.createdAt = serializeTimestamp(result.createdAt) as any;
  }
  if (result.updatedAt && (result.updatedAt instanceof Timestamp || result.updatedAt instanceof Date)) {
    result.updatedAt = serializeTimestamp(result.updatedAt) as any;
  }
  if (result.expiresAt && (result.expiresAt instanceof Timestamp || result.expiresAt instanceof Date)) {
    result.expiresAt = serializeTimestamp(result.expiresAt) as any;
  }
  if (result.readAt && (result.readAt instanceof Timestamp || result.readAt instanceof Date)) {
    result.readAt = serializeTimestamp(result.readAt) as any;
  }

  return result;
};

/**
 * Process a notification object to convert all serialized timestamp fields back to Firebase Timestamp objects
 * @param notification - Notification object with serialized timestamps
 * @returns Notification with Firebase Timestamp objects
 */
export const deserializeNotification = <T extends Partial<WithTimestamps>>(notification: T): T => {
  const result = { ...notification };

  if (result.createdAt && (typeof result.createdAt === 'string' || typeof result.createdAt === 'number')) {
    result.createdAt = deserializeTimestamp(result.createdAt) as any;
  }
  if (result.updatedAt && (typeof result.updatedAt === 'string' || typeof result.updatedAt === 'number')) {
    result.updatedAt = deserializeTimestamp(result.updatedAt) as any;
  }
  if (result.expiresAt && (typeof result.expiresAt === 'string' || typeof result.expiresAt === 'number')) {
    result.expiresAt = deserializeTimestamp(result.expiresAt) as any;
  }
  if (result.readAt && (typeof result.readAt === 'string' || typeof result.readAt === 'number')) {
    result.readAt = deserializeTimestamp(result.readAt) as any;
  }

  return result;
};

/**
 * Process arrays of objects with timestamp fields
 * @param items - Array of objects with timestamp fields
 * @returns Array with serialized timestamps
 */
export const serializeTimestampArray = <T extends Partial<WithTimestamps>>(items: T[]): T[] => {
  return items.map(serializeNotification);
};

/**
 * Process arrays of objects with serialized timestamp fields
 * @param items - Array of objects with serialized timestamps
 * @returns Array with Firebase Timestamp objects
 */
export const deserializeTimestampArray = <T extends Partial<WithTimestamps>>(items: T[]): T[] => {
  return items.map(deserializeNotification);
};
