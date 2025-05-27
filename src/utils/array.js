// Array utility functions

/**
 * Async forEach implementation
 * @param {Array} array - Array to iterate over
 * @param {Function} callback - Async callback function
 */
export async function arrayForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Get distinct array based on keys and optionally sum other keys
 * @param {Array} arrItems - Array of items
 * @param {Array} distinctKeys - Keys to make distinct by
 * @param {Array} sumKeys - Keys to sum when combining duplicates
 * @returns {Array} Distinct array
 */
export function distinctArr(arrItems, distinctKeys, sumKeys) {
  if (!Array.isArray(arrItems) || arrItems.length === 0) {
    return [];
  }

  const result = [];
  const seen = new Map();

  arrItems.forEach((item) => {
    // Create a key based on the distinct keys
    const key = distinctKeys.map((k) => item[k]).join('|');

    if (seen.has(key)) {
      // If we've seen this combination before, sum the specified keys
      const existingItem = seen.get(key);
      if (sumKeys && Array.isArray(sumKeys)) {
        sumKeys.forEach((sumKey) => {
          if (typeof existingItem[sumKey] === 'number' && typeof item[sumKey] === 'number') {
            existingItem[sumKey] += item[sumKey];
          }
        });
      }
    } else {
      // First time seeing this combination, add to result
      const newItem = { ...item };
      seen.set(key, newItem);
      result.push(newItem);
    }
  });

  return result;
}

/**
 * Get all duplicates in an array based on specified keys
 * @param {Array} arr - Array to check for duplicates
 * @param {string|Array} keys - Key(s) to check for duplicates
 * @returns {Array} Array of duplicate items
 */
export const getAllDuplicates = (arr, keys) => {
  // Ensure keys is an array
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  // Build counts based on composite keys
  const counts = arr.reduce((acc, item) => {
    // Create a composite key using the values from all keys, separated by a delimiter (e.g., '|')
    const compositeKey = keys.map((key) => item[key]).join('|');
    acc[compositeKey] = (acc[compositeKey] || 0) + 1;
    return acc;
  }, {});

  // Filter items that have a composite key appearing more than once
  return arr.filter((item) => {
    const compositeKey = keys.map((key) => item[key]).join('|');
    return counts[compositeKey] > 1;
  });
};

export const arrayMin = (arrayOfElements) => {
  return arrayOfElements.reduce((p, v) => (p < v ? p : v));
};

export const arrayMax = (arrayOfElements) => {
  return arrayOfElements.reduce((p, v) => (p > v ? p : v));
};

export function sortArr(arrItems, sortKey) {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  return [...arrItems].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }

    return 0;
  });
}

export function sortArrByMultiKeys(arrItems, sortKeys) {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  return [...arrItems].sort((a, b) => {
    for (const key of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const compare = aVal.localeCompare(bVal);
        if (compare !== 0) return compare;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const compare = aVal - bVal;
        if (compare !== 0) return compare;
      }
    }

    return 0;
  });
}

export function searchArr(arrItems, search, keys) {
  if (!Array.isArray(arrItems) || !search) {
    return arrItems;
  }

  const searchLower = search.toLowerCase();
  return arrItems.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(searchLower);
    }),
  );
}

export function insertArr(arr, index, insertItems) {
  if (!Array.isArray(arr) || !Array.isArray(insertItems)) {
    return arr;
  }

  const result = [...arr];
  result.splice(index, 0, ...insertItems);
  return result;
}

export const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};
