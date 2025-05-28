import { processFirestoreDataForForm } from './dateHandling';

/**
 * Safe processing options for user data from Firestore
 * This prevents the issues shown in the screenshots where fields like branchCode,
 * employeeCode, etc. were being incorrectly processed as dates
 */

/**
 * Fields that should NEVER be processed as dates
 * Based on the issues seen in the screenshots
 */
export const USER_NON_DATE_FIELDS = [
  // Employee identifiers
  'employeeCode',
  'employeeId',
  'branchCode',
  'department',
  'uid',
  'company',

  // Profile fields that are not dates
  'displayName',
  'firstName',
  'lastName',
  'email',
  'emailVerified',
  'isAnonymous',
  'phoneNumber',

  // Status fields
  'active',
  'approved',
  'pending',
  'role',
  'roles',
  'permissions',

  // Metadata that might look like dates but aren't
  'version',
  'level',
  'score',
  'count',
  'index',
  'order',
];

/**
 * Fields that SHOULD be processed as dates
 * These are the actual date fields in user documents
 */
export const USER_DATE_FIELDS = [
  'created',
  'createdAt',
  'updated',
  'updatedAt',
  'lastLogin',
  'lastLoginAt',
  'lastActive',
  'birthDate',
  'dateOfBirth',
  'joinDate',
  'startDate',
  'endDate',
  'expiryDate',
  'workBegin',
  'workEnd',
  // Additional timestamp fields that might be numbers
  'timestamp',
  'time',
];

/**
 * Safe options for processing user data from Firestore
 */
export const SAFE_USER_PROCESSING_OPTIONS = {
  convertDates: true,
  processNested: true,
  outputFormat: 'iso', // Use ISO format for Redux state serialization
  excludeFields: USER_NON_DATE_FIELDS,
  // Optionally, you can use includeFields for more precise control:
  // includeFields: USER_DATE_FIELDS,
};

/**
 * Process user data safely from Firestore
 * This function specifically handles the user data structure issues
 *
 * @param {Object} userData - Raw user data from Firestore
 * @param {Object} customOptions - Additional options to override defaults
 * @returns {Object} Safely processed user data
 */
export const processUserDataFromFirestore = (userData, customOptions = {}) => {
  if (!userData || typeof userData !== 'object') {
    return userData;
  }

  const options = {
    ...SAFE_USER_PROCESSING_OPTIONS,
    ...customOptions,
  };

  try {
    const processed = processFirestoreDataForForm(userData, options);

    // Additional manual fixes for known issues
    const result = { ...processed };

    // Ensure these fields remain as simple values
    USER_NON_DATE_FIELDS.forEach((field) => {
      if (field in userData && typeof userData[field] !== 'object') {
        result[field] = userData[field];
      }
    });

    // Handle nested employeeInfo object specifically
    if (userData.employeeInfo && typeof userData.employeeInfo === 'object') {
      result.employeeInfo = {
        ...processFirestoreDataForForm(userData.employeeInfo, {
          ...options,
          excludeFields: [...USER_NON_DATE_FIELDS, 'branch', 'department'],
        }),
      };

      // Ensure branch object in employeeInfo is processed correctly
      if (userData.employeeInfo.branch) {
        result.employeeInfo.branch = userData.employeeInfo.branch;
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing user data:', error);
    console.error('Original data:', userData);
    return userData; // Return original data if processing fails
  }
};

/**
 * Debug a specific user data object
 * Use this to understand why certain fields are being processed incorrectly
 *
 * @param {Object} userData - The user data to debug
 */
export const debugUserData = (userData) => {
  console.group('🐛 Debug User Data Processing');

  console.log('📥 Original user data:', JSON.stringify(userData, null, 2));

  // Process with current method
  const processed = processUserDataFromFirestore(userData);
  console.log('📤 Processed user data:', JSON.stringify(processed, null, 2));

  // Show specific field changes
  console.group('🔄 Field Changes');
  Object.keys(userData).forEach((key) => {
    const original = userData[key];
    const processedValue = processed[key];

    if (JSON.stringify(original) !== JSON.stringify(processedValue)) {
      console.log(`${key}:`, {
        original: { value: original, type: typeof original },
        processed: { value: processedValue, type: typeof processedValue },
        isInExcludeList: USER_NON_DATE_FIELDS.includes(key),
        isInDateList: USER_DATE_FIELDS.includes(key),
      });
    }
  });
  console.groupEnd();

  console.groupEnd();
  return processed;
};

/**
 * Update useFirestoreSync to use safe processing
 * This is the recommended way to fix the issue in useFirestoreSync
 */
export const safeProcessForRedux = (docData, docId) => {
  const dataWithId = { ...docData, _key: docId };
  return processUserDataFromFirestore(dataWithId);
};

/**
 * Example usage for fixing the issues:
 *
 * In useFirestoreSync.js, replace:
 *
 * data[doc.id] = processFirestoreDataForForm(
 *   { ...doc.data(), _key: doc.id },
 *   { outputFormat: 'iso' }
 * );
 *
 * With:
 *
 * import { safeProcessForRedux } from '../utils/fixUserDataProcessing';
 * data[doc.id] = safeProcessForRedux(doc.data(), doc.id);
 */

export default {
  processUserDataFromFirestore,
  debugUserData,
  safeProcessForRedux,
  USER_NON_DATE_FIELDS,
  USER_DATE_FIELDS,
  SAFE_USER_PROCESSING_OPTIONS,
};
