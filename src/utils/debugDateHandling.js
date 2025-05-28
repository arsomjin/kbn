import { processFirestoreDataForForm, isDateValue, isDateField } from './dateHandling';
import { processUserDataFromFirestore } from './fixUserDataProcessing';

/**
 * Debug utility for analyzing processFirestoreDataForForm issues
 * This helps identify why certain fields are being processed incorrectly
 */

/**
 * Analyze a data object and show what fields would be processed as dates
 * @param {Object} data - The data object to analyze
 * @param {Object} options - Processing options
 */
export const analyzeDataProcessing = (data, options = {}) => {
  console.group('🔍 Data Processing Analysis');

  if (!data || typeof data !== 'object') {
    console.log('❌ Invalid data:', data);
    console.groupEnd();
    return;
  }

  const analysis = {
    originalData: data,
    fieldAnalysis: {},
    dateFields: [],
    nonDateFields: [],
    problematicFields: [],
  };

  // Analyze each field
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const fieldAnalysis = {
      originalValue: value,
      type: typeof value,
      isDateField: isDateField(key),
      isDateValue: isDateValue(value),
      wouldProcess: false,
    };

    // Determine if this field would be processed
    if (options.convertDates !== false && isDateValue(value)) {
      fieldAnalysis.wouldProcess = true;
      analysis.dateFields.push(key);
    } else {
      analysis.nonDateFields.push(key);
    }

    // Flag potentially problematic fields
    if (fieldAnalysis.isDateValue && !fieldAnalysis.isDateField) {
      analysis.problematicFields.push({
        key,
        reason: 'Value looks like date but field name suggests otherwise',
        value,
      });
    }

    if (!fieldAnalysis.isDateValue && fieldAnalysis.isDateField) {
      analysis.problematicFields.push({
        key,
        reason: 'Field name suggests date but value does not look like date',
        value,
      });
    }

    analysis.fieldAnalysis[key] = fieldAnalysis;
  });

  // Display analysis
  console.log('📊 Analysis Results:');
  console.table(analysis.fieldAnalysis);

  if (analysis.problematicFields.length > 0) {
    console.warn('⚠️  Potentially Problematic Fields:');
    analysis.problematicFields.forEach((field) => {
      console.warn(`  - ${field.key}: ${field.reason}`, field.value);
    });
  }

  console.log('✅ Fields that would be processed as dates:', analysis.dateFields);
  console.log('📄 Fields that would remain unchanged:', analysis.nonDateFields);

  console.groupEnd();
  return analysis;
};

/**
 * Test the processFirestoreDataForForm function with debug output
 * @param {Object} data - The data to process
 * @param {Object} options - Processing options
 */
export const debugProcessFirestoreDataForForm = (data, options = {}) => {
  console.group('🧪 Debug processFirestoreDataForForm');

  // Show original data
  console.log('📥 Original Data:', JSON.stringify(data, null, 2));

  // Analyze before processing
  const analysis = analyzeDataProcessing(data, options);

  // Process the data
  const processed = processFirestoreDataForForm(data, options);

  // Show processed data
  console.log('📤 Processed Data:', JSON.stringify(processed, null, 2));

  // Compare changes
  console.group('🔄 Field Changes');
  Object.keys(data).forEach((key) => {
    const original = data[key];
    const processedValue = processed[key];

    if (JSON.stringify(original) !== JSON.stringify(processedValue)) {
      console.log(`🔄 ${key}:`, {
        original,
        processed: processedValue,
        type: `${typeof original} → ${typeof processedValue}`,
      });
    }
  });
  console.groupEnd();

  console.groupEnd();
  return { analysis, processed };
};

/**
 * Test specifically for created and lastLogin issues
 */
export const debugCreatedLastLoginIssue = () => {
  console.group('🚨 Debug Created/LastLogin Issue');

  // Test data that mimics the actual user data structure
  const testUserData = {
    uid: 'test123',
    employeeCode: 'AB776',
    branchCode: '2001',
    created: 1640995200000, // Unix timestamp for 2022-01-01
    lastLogin: 1640995200000, // Unix timestamp for 2022-01-01
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  console.log('Original data:', testUserData);

  // Test if fields are recognized as date fields
  console.log('Is "created" a date field?', isDateField('created'));
  console.log('Is "lastLogin" a date field?', isDateField('lastLogin'));

  // Test if values are recognized as date values
  console.log('Is created value a date?', isDateValue(testUserData.created));
  console.log('Is lastLogin value a date?', isDateValue(testUserData.lastLogin));

  // Test processing with regular function
  const processed = processFirestoreDataForForm(testUserData, { outputFormat: 'iso' });
  console.log('Processed with processFirestoreDataForForm:', processed);

  // Test processing with safe user function
  const safeProcessed = processUserDataFromFirestore(testUserData);
  console.log('Processed with processUserDataFromFirestore:', safeProcessed);

  console.groupEnd();
};

/**
 * Test that shows the exact issue from the screenshots
 */
export const reproduceScreenshotIssue = () => {
  console.group('📸 Reproduce Screenshot Issue');

  // This mimics the exact data structure from the screenshots
  const screenshotData = {
    uid: 'user123',
    employeeCode: 'AB776',
    branchCode: '2001',
    created: 1640995200000, // This becomes undefined
    lastLogin: 1641081600000, // This becomes undefined
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    employeeInfo: {
      department: 'IT',
      branch: { name: 'Head Office' },
    },
  };

  console.log('=== BEFORE PROCESSING ===');
  console.log('Original data:', JSON.stringify(screenshotData, null, 2));

  console.log('=== FIELD ANALYSIS ===');
  Object.keys(screenshotData).forEach((key) => {
    const value = screenshotData[key];
    console.log(`Field "${key}":`, {
      value,
      type: typeof value,
      isDateField: isDateField(key),
      isDateValue: isDateValue(value),
    });
  });

  console.log('=== PROCESSING RESULTS ===');

  // Test with regular processing
  const regularProcessed = processFirestoreDataForForm(screenshotData, { outputFormat: 'iso' });
  console.log('Regular processed:', JSON.stringify(regularProcessed, null, 2));

  // Test with safe processing
  const safeProcessed = processUserDataFromFirestore(screenshotData);
  console.log('Safe processed:', JSON.stringify(safeProcessed, null, 2));

  console.groupEnd();
};

/**
 * Test common field types
 */
export const testCommonFieldTypes = () => {
  console.group('🧪 Testing Common Field Types');

  const testData = {
    // Should NOT be processed as dates
    employeeCode: 'AB776',
    branchCode: '2001',
    department: 'dep007',
    version: 1.5,
    active: true,
    tags: ['tag1', 'tag2'],
    metadata: { key: 'value' },

    // Should be processed as dates
    createdAt: { toDate: () => new Date('2024-01-01') }, // Firestore Timestamp
    birthDate: '1990-01-15',
    lastLogin: 1640995200000, // Unix timestamp

    // Edge cases
    nullValue: null,
    undefinedValue: undefined,
    emptyString: '',
    numberString: '12345',
    shortString: 'AB',
  };

  debugProcessFirestoreDataForForm(testData);
  console.groupEnd();
};

/**
 * Quick fix recommendations based on common issues
 */
export const getFixRecommendations = (fieldName, value, processed) => {
  const recommendations = [];

  if (typeof value === 'string' && typeof processed === 'object' && processed !== null) {
    recommendations.push({
      issue: 'String field converted to object',
      fix: 'Add field to excludeFields in options',
      example: `{ excludeFields: ['${fieldName}'] }`,
    });
  }

  if (value === null && processed === undefined) {
    recommendations.push({
      issue: 'Null converted to undefined',
      fix: 'Check if this field should remain null',
      example: `Consider field type expectations`,
    });
  }

  if (typeof value === 'number' && typeof processed === 'object') {
    recommendations.push({
      issue: 'Number converted to date object',
      fix: 'Number was interpreted as timestamp - add to excludeFields if not a date',
      example: `{ excludeFields: ['${fieldName}'] }`,
    });
  }

  return recommendations;
};

/**
 * Create safe processing options based on field analysis
 * @param {Object} data - The data to analyze
 * @param {Array} knownDateFields - Array of field names that should be treated as dates
 * @param {Array} knownNonDateFields - Array of field names that should NOT be treated as dates
 */
export const createSafeProcessingOptions = (
  data,
  knownDateFields = [],
  knownNonDateFields = [],
) => {
  const analysis = analyzeDataProcessing(data, { convertDates: false });

  const options = {
    convertDates: true,
    processNested: true,
    excludeFields: [...knownNonDateFields],
  };

  // Add problematic fields to exclude list
  analysis.problematicFields.forEach((field) => {
    if (field.reason.includes('Value looks like date but field name suggests otherwise')) {
      options.excludeFields.push(field.key);
    }
  });

  // If we have known date fields, use includeFields for more precise control
  if (knownDateFields.length > 0) {
    options.includeFields = knownDateFields;
  }

  console.log('🛡️ Safe Processing Options Generated:', options);
  return options;
};

export default {
  analyzeDataProcessing,
  debugProcessFirestoreDataForForm,
  testCommonFieldTypes,
  getFixRecommendations,
  createSafeProcessingOptions,
};
