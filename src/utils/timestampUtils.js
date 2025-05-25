import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Type guard to check if an object implements the toDate method
function hasToDate(obj) {
  return obj !== null && typeof obj === 'object' && typeof obj.toDate === 'function';
}

// Convert a Timestamp, string, or Date to milliseconds
export const getTimestampMillis = (timestamp) => {
  if (!timestamp) return Date.now();

  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (typeof timestamp === 'string') {
    // Try to parse as ISO string using dayjs for reliability
    const dt = dayjs(timestamp);
    if (dt.isValid()) return dt.valueOf();
    // fallback to Date if not ISO
    return new Date(timestamp).getTime();
  }

  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }

  return Date.now();
};

// Format relative time from a timestamp
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const millis = getTimestampMillis(timestamp);
  return dayjs(millis).fromNow();
};

// Convert Firebase Timestamp to a serializable format (ISO string or milliseconds)
export const serializeTimestamp = (timestamp, format = 'iso') => {
  if (!timestamp) return null;

  // Safely convert to a proper Date object
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    // Handle string timestamps
    try {
      // Try to parse as ISO string using dayjs for reliability
      const dt = dayjs(timestamp);
      if (dt.isValid()) {
        date = dt.toDate();
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

  return format === 'iso' ? dayjs(date).toISOString() : dayjs(date).valueOf();
};

// Convert a serialized timestamp back to a Firebase Timestamp object
export const deserializeTimestamp = (value) => {
  if (!value) return null;

  const millis = typeof value === 'string' ? dayjs(value).valueOf() : value;

  return Timestamp.fromMillis(millis);
};

// Process a notification object to convert all timestamp fields to serializable format
export const serializeNotification = (notification) => {
  const result = { ...notification };

  if (
    result.createdAt &&
    (result.createdAt instanceof Timestamp || result.createdAt instanceof Date)
  ) {
    result.createdAt = serializeTimestamp(result.createdAt);
  }
  if (
    result.updatedAt &&
    (result.updatedAt instanceof Timestamp || result.updatedAt instanceof Date)
  ) {
    result.updatedAt = serializeTimestamp(result.updatedAt);
  }
  if (
    result.expiresAt &&
    (result.expiresAt instanceof Timestamp || result.expiresAt instanceof Date)
  ) {
    result.expiresAt = serializeTimestamp(result.expiresAt);
  }
  if (result.readAt && (result.readAt instanceof Timestamp || result.readAt instanceof Date)) {
    result.readAt = serializeTimestamp(result.readAt);
  }

  return result;
};

// Process a notification object to convert all serialized timestamp fields back to Firebase Timestamp objects
export const deserializeNotification = (notification) => {
  const result = { ...notification };

  if (
    result.createdAt &&
    (typeof result.createdAt === 'string' || typeof result.createdAt === 'number')
  ) {
    result.createdAt = deserializeTimestamp(result.createdAt);
  }
  if (
    result.updatedAt &&
    (typeof result.updatedAt === 'string' || typeof result.updatedAt === 'number')
  ) {
    result.updatedAt = deserializeTimestamp(result.updatedAt);
  }
  if (
    result.expiresAt &&
    (typeof result.expiresAt === 'string' || typeof result.expiresAt === 'number')
  ) {
    result.expiresAt = deserializeTimestamp(result.expiresAt);
  }
  if (result.readAt && (typeof result.readAt === 'string' || typeof result.readAt === 'number')) {
    result.readAt = deserializeTimestamp(result.readAt);
  }

  return result;
};

// Process arrays of objects with timestamp fields
export const serializeTimestampArray = (items) => {
  return items.map(serializeNotification);
};

// Process arrays of objects with serialized timestamp fields
export const deserializeTimestampArray = (items) => {
  return items.map(deserializeNotification);
};

// Serialize Employee object with Timestamp fields for Redux storage
export const serializeEmployee = (employee) => {
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

// Serialize a record of employees for Redux storage
export const serializeEmployees = (employees) => {
  const serialized = {};

  for (const [key, employee] of Object.entries(employees)) {
    serialized[key] = serializeEmployee(employee);
  }

  return serialized;
};

// Recursively convert all Firestore Timestamps in an object to ISO strings
export function serializeTimestampsDeep(obj) {
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeTimestampsDeep);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = serializeTimestampsDeep(obj[key]);
    }
    return result;
  }
  return obj;
}
