/**
 * Professional Date Handling Utilities for KBN
 *
 * This module provides robust date conversion between:
 * - Antd Components (expects dayjs objects)
 * - Firestore (expects Timestamps)
 * - JavaScript Date objects
 * - ISO strings and other formats
 *
 * Key Features:
 * - Type-safe conversions
 * - Null/undefined handling
 * - Timezone awareness
 * - Error handling with fallbacks
 * - Support for nested objects and arrays
 * - Optimized performance
 *
 * @author KBN Development Team
 * @version 2.0.0
 */

import { Timestamp } from 'firebase/firestore';
import dayjs from '../utils/dayjs';
import type { Dayjs } from 'dayjs';
import { showWarn } from './functions';

// ===== TYPE DEFINITIONS =====

/**
 * Supported date input types
 */
export type DateInput = Date | Timestamp | Dayjs | string | number | null | undefined;

/**
 * Firestore Timestamp-like object (for compatibility)
 */
export interface FirestoreTimestampLike {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

/**
 * Options for date conversion functions
 */
export interface DateConversionOptions {
  /** Timezone to use for conversion */
  timezone?: string;
  /** Whether to preserve time component or reset to start of day */
  preserveTime?: boolean;
  /** Default value to return on conversion failure */
  defaultValue?: any;
  /** Whether to log warnings on conversion failures */
  suppressWarnings?: boolean;
}

/**
 * Configuration for form data processing
 */
export interface FormDataProcessingOptions {
  /** Fields to exclude from date processing */
  excludeFields?: string[];
  /** Fields to include (if specified, only these will be processed) */
  includeFields?: string[];
  /** Whether to process nested objects */
  processNested?: boolean;
  /** Date conversion options */
  dateOptions?: DateConversionOptions;
}

// ===== DATE FIELD DETECTION =====

/**
 * Enhanced date field detection with configurable patterns
 */
const DATE_FIELD_PATTERNS = [
  /date$/i, // endDate, startDate, createdDate
  /time$/i, // createdTime, updatedTime
  /at$/i, // createdAt, updatedAt
  /^date/i, // dateCreated, dateUpdated
  /day$/i, // birthday, workday
  /born$/i, // dateBorn
  /timestamp$/i, // timestamp fields
  /expire/i, // expireDate, expirationDate
  /deadline/i // deadline fields
];

/**
 * Check if a field name indicates a date/time field
 */
export const isDateField = (fieldName: string): boolean => {
  if (typeof fieldName !== 'string') return false;
  return DATE_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
};

/**
 * Add custom date field pattern
 */
export const addDateFieldPattern = (pattern: RegExp): void => {
  DATE_FIELD_PATTERNS.push(pattern);
};

// ===== CORE CONVERSION FUNCTIONS =====

/**
 * Convert any date input to JavaScript Date
 * Most reliable conversion with comprehensive error handling
 */
export const toJSDate = (input: DateInput, options: DateConversionOptions = {}): Date | null => {
  try {
    if (!input) return null;

    // Handle JavaScript Date
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }

    // Handle Firestore Timestamp
    if (input && typeof input === 'object' && 'toDate' in input && typeof input.toDate === 'function') {
      return (input as FirestoreTimestampLike).toDate();
    }

    // Handle Dayjs object
    if (dayjs.isDayjs(input)) {
      return (input as Dayjs).isValid() ? (input as Dayjs).toDate() : null;
    }

    // Handle Unix timestamp (seconds)
    if (typeof input === 'number') {
      // If it's a reasonable timestamp (after year 1970 and before year 3000)
      if (input > 0 && input < 32503680000) {
        // Handle both seconds and milliseconds
        const date = input < 10000000000 ? new Date(input * 1000) : new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    // Handle string dates
    if (typeof input === 'string') {
      // Try various formats
      const formats = ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD/MM/YYYY', 'MM/DD/YYYY'];

      // First try dayjs parsing with specific formats
      for (const format of formats) {
        const parsed = dayjs(input, format, true);
        if (parsed.isValid()) {
          return parsed.toDate();
        }
      }

      // Fallback to native Date parsing
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch (error) {
    if (!options.suppressWarnings) {
      showWarn('Date conversion error:', error, 'Input:', input);
    }
    return options.defaultValue || null;
  }
};

/**
 * Convert any date input to Firestore Timestamp
 * For saving to Firestore
 */
export const toFirestoreTimestamp = (input: DateInput, options: DateConversionOptions = {}): Timestamp | null => {
  try {
    const jsDate = toJSDate(input, { ...options, suppressWarnings: true });
    if (!jsDate) return null;

    return Timestamp.fromDate(jsDate);
  } catch (error) {
    if (!options.suppressWarnings) {
      showWarn('Firestore Timestamp conversion error:', error, 'Input:', input);
    }
    return options.defaultValue || null;
  }
};

/**
 * Convert any date input to Dayjs object
 * For Antd components and UI display
 */
export const toDayjs = (input: DateInput, options: DateConversionOptions = {}): Dayjs | undefined => {
  try {
    const jsDate = toJSDate(input, { ...options, suppressWarnings: true });
    if (!jsDate) return undefined;

    const dayjsObj = dayjs(jsDate);
    if (!dayjsObj.isValid()) return undefined;

    // Apply timezone if specified
    if (options.timezone) {
      return dayjsObj.tz(options.timezone);
    }

    // Reset to start of day if preserveTime is false
    if (options.preserveTime === false) {
      return dayjsObj.startOf('day');
    }

    return dayjsObj;
  } catch (error) {
    if (!options.suppressWarnings) {
      showWarn('Dayjs conversion error:', error, 'Input:', input);
    }
    return options.defaultValue;
  }
};

/**
 * Convert any date input to ISO string
 * For API calls and serialization
 */
export const toISOString = (input: DateInput, options: DateConversionOptions = {}): string | null => {
  try {
    const jsDate = toJSDate(input, { ...options, suppressWarnings: true });
    return jsDate ? jsDate.toISOString() : null;
  } catch (error) {
    if (!options.suppressWarnings) {
      showWarn('ISO String conversion error:', error, 'Input:', input);
    }
    return options.defaultValue || null;
  }
};

// ===== FORM DATA PROCESSING =====

/**
 * Process form data before saving to Firestore
 * Converts all date fields to Firestore Timestamps
 */
export const processFormDataForFirestore = <T extends Record<string, any>>(
  data: T,
  options: FormDataProcessingOptions = {}
): T => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const { excludeFields = [], includeFields, processNested = true, dateOptions = {} } = options;

  const result: Record<string, any> = { ...data };

  Object.keys(result).forEach(key => {
    const value = result[key];

    // Remove undefined fields (Firestore does not allow undefined)
    if (typeof value === 'undefined') {
      delete result[key];
      return;
    }

    // Skip if in exclude list
    if (excludeFields.includes(key)) return;

    // If include list is specified, only process those fields
    if (includeFields && !includeFields.includes(key)) return;

    if (isDateField(key)) {
      // Only convert if value is a valid date-like type
      if (
        value === null ||
        typeof value === 'undefined' ||
        value === '' ||
        value instanceof Date ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        (typeof value === 'object' &&
          value !== null &&
          (typeof value.toDate === 'function' || // Firestore Timestamp
            (typeof value.isValid === 'function' && value.isValid()))) // dayjs
      ) {
        const ts = toFirestoreTimestamp(value, dateOptions);
        result[key] = ts ?? null;
      } else {
        // If not a valid date-like value, set to null
        result[key] = null;
      }
      return;
    }

    // Process nested objects
    if (processNested && value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = processFormDataForFirestore(value, options) as any;
      return;
    }

    // Process arrays
    if (processNested && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? processFormDataForFirestore(item, options) : item
      ) as any;
      return;
    }
  });

  return result as T;
};

/**
 * Process Firestore data for form components
 * Converts all Timestamp fields to Dayjs objects for Antd
 */
export const processFirestoreDataForForm = <T extends Record<string, any>>(
  data: T,
  options: FormDataProcessingOptions = {}
): T => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const { excludeFields = [], includeFields, processNested = true, dateOptions = {} } = options;

  const result: Record<string, any> = { ...data };

  Object.keys(result).forEach(key => {
    const value = result[key];

    // Skip if in exclude list
    if (excludeFields.includes(key)) return;

    // If include list is specified, only process those fields
    if (includeFields && !includeFields.includes(key)) return;

    // Process date fields with value type check
    if (isDateField(key)) {
      if (value === null || typeof value === 'undefined' || value === '') {
        result[key] = undefined;
      } else if (
        value instanceof Date ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        (typeof value === 'object' &&
          value !== null &&
          (typeof value.toDate === 'function' || // Firestore Timestamp
            (typeof value.isValid === 'function' && value.isValid()))) // dayjs
      ) {
        // Convert to dayjs (serializable)
        const dayjsValue = toDayjs(value, dateOptions);
        result[key] = dayjsValue as any;
      } else {
        // Not a valid date-like value
        result[key] = undefined;
      }
      return;
    }

    // Process nested objects
    if (processNested && value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = processFirestoreDataForForm(value, options) as any;
      return;
    }

    // Process arrays
    if (processNested && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? processFirestoreDataForForm(item, options) : item
      ) as any;
      return;
    }
  });

  return result as T;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Validate if a date is within a reasonable range
 */
export const isValidDateRange = (date: Date, minYear = 1900, maxYear = 2100): boolean => {
  const year = date.getFullYear();
  return year >= minYear && year <= maxYear;
};

/**
 * Get timezone offset for a specific timezone
 */
export const getTimezoneOffset = (timezone = 'Asia/Bangkok'): number => {
  try {
    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60000;
    const targetTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const targetOffset = targetTime.getTime() - now.getTime() + localOffset;
    return targetOffset / 60000; // Return in minutes
  } catch {
    return 0;
  }
};

/**
 * Format date for display with localization
 */
export const formatDateForDisplay = (input: DateInput, format = 'DD/MM/YYYY', locale = 'th'): string => {
  const dayjsObj = toDayjs(input);
  if (!dayjsObj) return '';

  try {
    return dayjsObj.locale(locale).format(format);
  } catch {
    return dayjsObj.format(format);
  }
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = toDayjs(date1);
  const d2 = toDayjs(date2);
  if (!d1 || !d2) return false;
  return d1.isSame(d2, 'day');
};

/**
 * Get date range array between two dates
 */
export const getDateRange = (start: DateInput, end: DateInput): Dayjs[] => {
  const startDate = toDayjs(start);
  const endDate = toDayjs(end);

  if (!startDate || !endDate || startDate.isAfter(endDate)) {
    return [];
  }

  const dates: Dayjs[] = [];
  let current = startDate;

  while (current.isSameOrBefore(endDate, 'day')) {
    dates.push(current);
    current = current.add(1, 'day');
  }

  return dates;
};

// ===== HOOKS FOR REACT COMPONENTS =====

/**
 * React hook for form date handling
 */
export const useDateHandling = () => {
  const prepareForSave = (formData: Record<string, any>) => {
    return processFormDataForFirestore(formData);
  };

  const prepareForForm = (firestoreData: Record<string, any>) => {
    return processFirestoreDataForForm(firestoreData);
  };

  const convertToDisplay = (date: DateInput, format = 'DD/MM/YYYY') => {
    return formatDateForDisplay(date, format);
  };

  return {
    prepareForSave,
    prepareForForm,
    convertToDisplay,
    toJSDate,
    toDayjs,
    toFirestoreTimestamp,
    isDateField
  };
};

// ===== VALIDATION =====

/**
 * Validate date field in form
 */
export const validateDateField = (value: any, required = false) => {
  if (!value && required) {
    return Promise.reject('วันที่จำเป็นต้องระบุ');
  }

  if (value && !toDayjs(value)) {
    return Promise.reject('รูปแบบวันที่ไม่ถูกต้อง');
  }

  return Promise.resolve();
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: any, endDate: any) => {
  const start = toDayjs(startDate);
  const end = toDayjs(endDate);

  if (!start || !end) {
    return Promise.reject('วันที่ไม่ถูกต้อง');
  }

  if (start.isAfter(end)) {
    return Promise.reject('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
  }

  return Promise.resolve();
};

// ===== CONSTANTS =====

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  THAI_FULL: 'วันdddd ที่ DD MMMM YYYY',
  THAI_SHORT: 'DD MMM YYYY'
} as const;

export const TIMEZONE = {
  BANGKOK: 'Asia/Bangkok',
  UTC: 'UTC'
} as const;

// Export for backward compatibility
export {
  toJSDate as normalizeToDate,
  processFormDataForFirestore as cleanValuesBeforeSave,
  processFirestoreDataForForm as formatValuesBeforeLoad
};
