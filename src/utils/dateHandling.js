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
 * - Intelligent value-based date detection (no longer relies on field names)
 * - Type-safe conversions with comprehensive error handling
 * - Null/undefined handling
 * - Timezone awareness
 * - Support for nested objects and arrays at any depth
 * - Universal data processing functions for any Firestore operations
 * - Configurable output formats
 * - Optimized performance
 *
 * Main Functions:
 * - processFormDataForFirestore() - Convert data for Firestore saving
 * - processFirestoreDataForForm() - Convert data from Firestore for forms
 * - prepareDataForFirestore() - Moved to firestoreUtils.js
 * - prepareDataFromFirestore() - Moved to firestoreUtils.js
 *
 * @author KBN Development Team
 * @version 3.0.0
 *
 * @example
 * // Basic usage - these functions work with ANY data structure
 *
 * // When saving to Firestore (converts dates to Timestamps):
 * const processedData = prepareDataForFirestore(formData);
 * await setDoc(docRef, processedData);
 *
 * // When loading from Firestore (converts Timestamps to dayjs for Antd):
 * const docSnap = await getDoc(docRef);
 * const formData = prepareDataFromFirestore(docSnap.data());
 * form.setFieldsValue(formData);
 *
 * // Works with nested objects and arrays automatically:
 * const complexData = {
 *   user: {
 *     createdAt: new Date(),
 *     profile: {
 *       birthDate: "1990-01-01",
 *       lastLogin: dayjs()
 *     }
 *   },
 *   events: [
 *     { date: "2024-01-01", timestamp: 1704067200000 },
 *     { date: "2024-02-01", timestamp: 1706745600000 }
 *   ]
 * };
 *
 * // All date values will be automatically detected and converted
 * const firestoreReady = prepareDataForFirestore(complexData);
 * const formReady = prepareDataFromFirestore(firestoreData);
 */

import { Timestamp } from 'firebase/firestore';
import dayjs from './dayjs.js';
import { showWarn } from './functions';

// ===== DATE VALUE DETECTION =====

/**
 * Check if a value represents a date/time value
 * Enhanced with more conservative detection to prevent false positives
 */
export const isDateValue = (value) => {
  if (!value) return false;

  // Firestore Timestamp (always a date)
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return true;
  }

  // Dayjs object (always a date)
  if (dayjs.isDayjs(value)) {
    return true;
  }

  // JavaScript Date (always a date)
  if (value instanceof Date) {
    return true;
  }

  // Unix timestamp (be more conservative with numbers)
  if (typeof value === 'number' && value > 0) {
    // Additional check: must be a reasonable timestamp length
    // Milliseconds should be 13 digits, seconds should be 10 digits
    const valueStr = value.toString();
    if (valueStr.length === 13 || valueStr.length === 10) {
      // Only consider it a timestamp if it's in a reasonable range
      // Milliseconds: between 1970-01-01 and 2100-01-01
      if (value >= 0 && value <= 4102444800000) {
        return true;
      }
    }
    return false;
  }

  // String that looks like a date - be more conservative
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();

    // Very specific ISO date patterns only
    const strictPatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, // ISO datetime
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // SQL datetime
    ];

    // Check strict patterns first
    if (strictPatterns.some((pattern) => pattern.test(trimmed))) {
      // Verify it's actually parseable as a valid date
      const parsed = new Date(trimmed);
      if (
        !isNaN(parsed.getTime()) &&
        parsed.getFullYear() >= 1900 &&
        parsed.getFullYear() <= 2100
      ) {
        return true;
      }
    }

    // Additional check for common date formats, but only if they look very date-like
    const commonPatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or DD/MM/YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}$/, // YYYY/MM/DD
    ];

    if (commonPatterns.some((pattern) => pattern.test(trimmed))) {
      const parsed = dayjs(trimmed);
      if (parsed.isValid() && parsed.year() >= 1900 && parsed.year() <= 2100) {
        return true;
      }
    }

    // Reject strings that are clearly not dates
    if (trimmed.length < 8 || trimmed.length > 30) {
      return false;
    }

    // Reject strings with obvious non-date patterns
    const nonDatePatterns = [
      /^[a-zA-Z][a-zA-Z0-9]*$/, // Simple identifiers like "AB776", "dep007"
      /^\d+$/, // Pure numbers as strings
      /^[a-zA-Z]+$/, // Pure letters
      /[!@#$%^&*()_+=[\]{}|;':",./<>?`~]/, // Special characters
    ];

    if (nonDatePatterns.some((pattern) => pattern.test(trimmed))) {
      return false;
    }
  }

  return false;
};

/**
 * Check if a value should be converted to a date format
 * More conservative than isDateValue - only converts obvious date types
 */
export const shouldConvertToDate = (value) => {
  if (!value) return false;

  // Always convert these obvious date types
  if (
    value instanceof Date ||
    dayjs.isDayjs(value) ||
    (value && typeof value === 'object' && typeof value.toDate === 'function')
  ) {
    return true;
  }

  // Be more conservative with strings and numbers
  if (typeof value === 'string') {
    // Only convert strings that look very much like dates
    const isoPatterns = [/^\d{4}-\d{2}-\d{2}$/, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/];
    return isoPatterns.some((pattern) => pattern.test(value.trim()));
  }

  // Only convert numbers that are clearly timestamps
  if (typeof value === 'number' && value > 946684800000 && value < 4102444800000) {
    // Between 2000 and 2100 in milliseconds
    return true;
  }

  return false;
};

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
  /deadline/i, // deadline fields
];

/**
 * Check if a field name indicates a date/time field
 */
export const isDateField = (fieldName) => {
  if (typeof fieldName !== 'string') return false;
  return DATE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
};

/**
 * Add custom date field pattern
 */
export const addDateFieldPattern = (pattern) => {
  DATE_FIELD_PATTERNS.push(pattern);
};

// ===== CORE CONVERSION FUNCTIONS =====

/**
 * Convert any date input to JavaScript Date
 * Most reliable conversion with comprehensive error handling
 */
export const toJSDate = (input, options = {}) => {
  try {
    if (!input) return null;

    // Handle JavaScript Date
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }

    // Handle Firestore Timestamp
    if (
      input &&
      typeof input === 'object' &&
      'toDate' in input &&
      typeof input.toDate === 'function'
    ) {
      return input.toDate();
    }

    // Handle Dayjs object
    if (dayjs.isDayjs(input)) {
      return input.isValid() ? input.toDate() : null;
    }

    // Handle Unix timestamp (seconds and milliseconds)
    if (typeof input === 'number') {
      // If it's a reasonable timestamp (after year 1970 and before year 2100)
      if (input > 0 && input <= 4102444800000) {
        // Handle both seconds and milliseconds
        const date = input < 10000000000 ? new Date(input * 1000) : new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    // Handle string dates
    if (typeof input === 'string') {
      // Try various formats
      const formats = [
        'YYYY-MM-DD',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'DD/MM/YYYY',
        'MM/DD/YYYY',
      ];

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
export const toFirestoreTimestamp = (input, options = {}) => {
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
export const toDayjs = (input, options = {}) => {
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
export const toISOString = (input, options = {}) => {
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
 * Converts all date values to Firestore Timestamps based on value content, not field names
 */
export const processFormDataForFirestore = (data, options = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const {
    excludeFields = [],
    includeFields,
    processNested = true,
    dateOptions = {},
    convertDates = true, // New option to disable date conversion if needed
  } = options;

  const result = { ...data };

  Object.keys(result).forEach((key) => {
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

    // Check if value should be converted to Firestore Timestamp
    if (convertDates && shouldConvertToDate(value)) {
      const ts = toFirestoreTimestamp(value, dateOptions);
      result[key] = ts ?? null;
      return;
    }

    // Handle null values (preserve them)
    if (value === null) {
      result[key] = null;
      return;
    }

    // Process nested objects
    if (processNested && value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = processFormDataForFirestore(value, options);
      return;
    }

    // Process arrays
    if (processNested && Array.isArray(value)) {
      result[key] = value.map((item) => {
        // Convert date values in arrays
        if (convertDates && shouldConvertToDate(item)) {
          const ts = toFirestoreTimestamp(item, dateOptions);
          return ts ?? null;
        }
        // Process nested objects in arrays
        if (typeof item === 'object' && item !== null) {
          return processFormDataForFirestore(item, options);
        }
        return item;
      });
      return;
    }
  });

  return result;
};

/**
 * Process Firestore data for form components
 * Converts all date values to appropriate format based on value content, not field names
 */
export const processFirestoreDataForForm = (data, options = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const {
    excludeFields = [],
    includeFields,
    processNested = true,
    dateOptions = {},
    convertDates = true, // New option to disable date conversion if needed
    outputFormat = 'dayjs', // 'dayjs', 'iso', 'date' - format for converted dates
  } = options;

  const result = { ...data };

  Object.keys(result).forEach((key) => {
    const value = result[key];

    // Skip if in exclude list
    if (excludeFields.includes(key)) return;

    // If include list is specified, only process those fields
    if (includeFields && !includeFields.includes(key)) return;

    // Handle undefined values (keep as undefined)
    if (typeof value === 'undefined') {
      result[key] = undefined;
      return;
    }

    // Handle null values (keep as null)
    if (value === null) {
      result[key] = null;
      return;
    }

    // Check if value should be converted based on VALUE TYPE, not field name
    if (convertDates && isDateValue(value)) {
      // Convert based on output format preference
      switch (outputFormat) {
        case 'dayjs':
          result[key] = toDayjs(value, dateOptions);
          break;
        case 'iso':
          result[key] = toISOString(value, dateOptions);
          break;
        case 'date':
          result[key] = toJSDate(value, dateOptions);
          break;
        default:
          // Default to dayjs for Antd compatibility
          result[key] = toDayjs(value, dateOptions);
      }
      return;
    }

    // Process nested objects recursively
    if (processNested && value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = processFirestoreDataForForm(value, options);
      return;
    }

    // Process arrays recursively
    if (processNested && Array.isArray(value)) {
      result[key] = value.map((item) => {
        // Convert date values in arrays
        if (convertDates && isDateValue(item)) {
          switch (outputFormat) {
            case 'dayjs':
              return toDayjs(item, dateOptions);
            case 'iso':
              return toISOString(item, dateOptions);
            case 'date':
              return toJSDate(item, dateOptions);
            default:
              return toDayjs(item, dateOptions);
          }
        }
        // Process nested objects in arrays
        if (typeof item === 'object' && item !== null) {
          return processFirestoreDataForForm(item, options);
        }
        return item;
      });
      return;
    }

    // For all other types (strings, numbers, booleans that aren't dates), keep as-is
    result[key] = value;
  });

  return result;
};

// ===== ENHANCED UTILITY FUNCTIONS =====

/**
 * NOTE: The main convenience functions prepareDataForFirestore() and prepareDataFromFirestore()
 * have been moved to ../utils/firestoreUtils.js for better integration with Firestore operations.
 *
 * Import them from there:
 * import { prepareDataForFirestore, prepareDataFromFirestore } from '../utils/firestoreUtils';
 */

/**
 * Process data with custom date field detection
 * Useful when you want to specify exactly which fields are dates
 */
export const processDataWithDateFields = (data, dateFields = [], options = {}) => {
  const { forFirestore = false } = options;

  if (!data || typeof data !== 'object') return data;

  const processFunc = forFirestore ? processFormDataForFirestore : processFirestoreDataForForm;

  return processFunc(data, {
    ...options,
    includeFields: dateFields.length > 0 ? dateFields : undefined,
  });
};

// ===== UTILITY FUNCTIONS =====

/**
 * Validate if a date is within a reasonable range
 */
export const isValidDateRange = (date, minYear = 1900, maxYear = 2100) => {
  const year = date.getFullYear();
  return year >= minYear && year <= maxYear;
};

/**
 * Get timezone offset for a specific timezone
 */
export const getTimezoneOffset = (timezone = 'Asia/Bangkok') => {
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
export const formatDateForDisplay = (input, format = 'DD/MM/YYYY', locale = 'th') => {
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
export const isSameDay = (date1, date2) => {
  const d1 = toDayjs(date1);
  const d2 = toDayjs(date2);
  if (!d1 || !d2) return false;
  return d1.isSame(d2, 'day');
};

/**
 * Get date range array between two dates
 */
export const getDateRange = (start, end) => {
  const startDate = toDayjs(start);
  const endDate = toDayjs(end);

  if (!startDate || !endDate || startDate.isAfter(endDate)) {
    return [];
  }

  const dates = [];
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
  const prepareForSave = (formData, options = {}) => {
    return processFormDataForFirestore(formData, options);
  };

  const prepareForForm = (firestoreData, options = {}) => {
    return processFirestoreDataForForm(firestoreData, options);
  };

  const convertToDisplay = (date, format = 'DD/MM/YYYY') => {
    return formatDateForDisplay(date, format);
  };

  return {
    prepareForSave,
    prepareForForm,
    convertToDisplay,
    toJSDate,
    toDayjs,
    toFirestoreTimestamp,
    isDateValue,
    shouldConvertToDate,
    // Deprecated - kept for backward compatibility
    isDateField,
  };
};

// ===== VALIDATION =====

/**
 * Validate date field in form
 */
export const validateDateField = (value, required = false) => {
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
export const validateDateRange = (startDate, endDate) => {
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
  THAI_SHORT: 'DD MMM YYYY',
};

export const TIMEZONE = {
  BANGKOK: 'Asia/Bangkok',
  UTC: 'UTC',
};

// Export for backward compatibility
export {
  toJSDate as normalizeToDate,
  processFormDataForFirestore as cleanValuesBeforeSave,
  processFirestoreDataForForm as formatValuesBeforeLoad,
  // NOTE: prepareDataForFirestore and prepareDataFromFirestore have been moved to firestoreUtils.js
};
