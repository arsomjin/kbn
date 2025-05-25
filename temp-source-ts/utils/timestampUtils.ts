import { Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';

/**
 * Interface for objects that have a toDate method (like Firestore Timestamp)
 */
interface HasToDate {
  toDate: () => Date;
}

/**
 * Type guard to check if an object implements the HasToDate interface
 */
function hasToDate(obj: any): obj is HasToDate {
  return obj !== null && typeof obj === 'object' && typeof obj.toDate === 'function';
}

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
 * @param timestamp - Firebase Timestamp object, Date, string, or number
 * @param format - Output format ('iso' for ISO string, 'millis' for milliseconds)
 * @returns string | number - Serialized representation of timestamp
 */
export const serializeTimestamp = (
  timestamp: Timestamp | Date | string | number | unknown | null,
  format: 'iso' | 'millis' = 'iso'
): string | number | null => {
  if (!timestamp) return null;

  // Safely convert to a proper Date object
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    // Handle string timestamps
    try {
      // Try to parse as ISO string using Luxon for reliability
      const dt = DateTime.fromISO(timestamp);
      if (dt.isValid) {
        date = new Date(dt.toMillis());
      } else {
        // fallback to standard Date parsing
        date = new Date(timestamp);
      }
    } catch (e) {
      console.warn('Failed to parse string timestamp:', timestamp, e);
      return null;
    }
  } else if (typeof timestamp === 'number') {
    // Handle numeric timestamps (milliseconds)
    date = new Date(timestamp);
  } else if (hasToDate(timestamp)) {
    // Handle Firestore Timestamp-like objects
    try {
      date = timestamp.toDate();
    } catch (e) {
      console.warn('Failed to convert timestamp to date:', e);
      return null;
    }
  } else {
    console.warn('Invalid timestamp type:', typeof timestamp);
    return null;
  }

  // Ensure we have a valid Date before calling methods on it
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date object created from timestamp');
    return null;
  }

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

/**
 * Serialize Employee object with Timestamp fields for Redux storage
 * @param employee - Employee object with potentially non-serializable Timestamp fields
 * @returns SerializedEmployee - Employee object with timestamp fields converted to strings
 */
export const serializeEmployee = (employee: any): any => {
  if (!employee) return employee;

  const serialized = { ...employee };

  // Define timestamp fields to process
  const timestampFields = ['createdAt', 'updatedAt', 'startDate', 'endDate'];

  // Process each timestamp field
  for (const field of timestampFields) {
    if (serialized[field] !== undefined && serialized[field] !== null) {
      const serializedValue = serializeTimestamp(serialized[field]);
      if (serializedValue !== null) {
        serialized[field] = serializedValue;
      }
    }
  }

  return serialized;
};

/**
 * Serialize a record of employees for Redux storage
 * @param employees - Record of employees with potentially non-serializable Timestamp fields
 * @returns Serialized record of employees
 */
export const serializeEmployees = (employees: Record<string, any>): Record<string, any> => {
  const serialized: Record<string, any> = {};

  for (const [key, employee] of Object.entries(employees)) {
    serialized[key] = serializeEmployee(employee);
  }

  return serialized;
};
