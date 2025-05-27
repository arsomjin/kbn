// Common utility functions

/**
 * Sort array by a key
 * @param {Array} arrItems - Array to sort
 * @param {string} sortKey - Key to sort by (prefix with '-' for descending)
 * @returns {Array} Sorted array
 */
export function sortArr(arrItems, sortKey) {
  if (!Array.isArray(arrItems) || arrItems.length === 0) {
    return [];
  }

  const isDescending = sortKey.startsWith('-');
  const key = isDescending ? sortKey.slice(1) : sortKey;

  return [...arrItems].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return isDescending ? 1 : -1;
    if (bVal == null) return isDescending ? -1 : 1;

    // Handle different data types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return isDescending ? 1 : -1;
    if (aVal > bVal) return isDescending ? -1 : 1;
    return 0;
  });
}

/**
 * Get error message from error object
 * @param {Error|string} eMsg - Error object or message
 * @returns {string} Error message
 */
export const getErrorMessage = (eMsg) => {
  if (typeof eMsg === 'string') {
    return eMsg;
  }

  if (eMsg && typeof eMsg === 'object') {
    if (eMsg.message) return eMsg.message;
    if (eMsg.error) return eMsg.error;
    if (eMsg.code) return eMsg.code;
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

/**
 * Capitalize first letter of string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Check if value is object
 * @param {*} object - Value to check
 * @returns {boolean} True if object
 */
export const isObject = (object) => {
  return object != null && typeof object === 'object';
};

/**
 * Deep equality check
 * @param {*} object1 - First object
 * @param {*} object2 - Second object
 * @returns {boolean} True if deeply equal
 */
export const deepEqual = (object1, object2) => {
  // Defensive: treat undefined/null as empty object
  const a = object1 && typeof object1 === 'object' ? object1 : {};
  const b = object2 && typeof object2 === 'object' ? object2 : {};

  const keys1 = Object.keys(a);
  const keys2 = Object.keys(b);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = a[key];
    const val2 = b[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  return true;
};

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after ms
 */
export const waitFor = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Create array of specified length
 * @param {number} length - Length of array
 * @returns {Array} Array of indices
 */
export const createArrOfLength = (length) => [...Array(length).keys()];

/**
 * Get distinct elements from array
 * @param {Array} arrayOfElements - Array to get distinct elements from
 * @returns {Array} Array of distinct elements
 */
export const distinctElement = (arrayOfElements) => {
  if (!Array.isArray(arrayOfElements)) return [];
  return [...new Set(arrayOfElements)];
};

/**
 * Get minimum value from array
 * @param {Array} arrayOfElements - Array of numbers
 * @returns {number} Minimum value
 */
export const arrayMin = (arrayOfElements) => {
  if (!Array.isArray(arrayOfElements) || arrayOfElements.length === 0) return 0;
  return Math.min(...arrayOfElements.filter((x) => typeof x === 'number'));
};

/**
 * Get maximum value from array
 * @param {Array} arrayOfElements - Array of numbers
 * @returns {number} Maximum value
 */
export const arrayMax = (arrayOfElements) => {
  if (!Array.isArray(arrayOfElements) || arrayOfElements.length === 0) return 0;
  return Math.max(...arrayOfElements.filter((x) => typeof x === 'number'));
};
