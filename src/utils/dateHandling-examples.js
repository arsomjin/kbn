/**
 * Examples of using the enhanced date handling utilities
 * These examples demonstrate how the new functions work with any data structure
 */

import { prepareDataForFirestore, prepareDataFromFirestore } from './firestoreUtils';
import { processFormDataForFirestore } from './dateHandling';
import dayjs from './dayjs';

// Example 1: Simple form data with mixed date formats
export const exampleFormData = {
  // Basic user info
  name: 'John Doe',
  email: 'john@example.com',

  // Various date formats that will be auto-detected
  birthDate: '1990-01-15', // ISO string
  registeredAt: new Date(), // JS Date
  lastLogin: dayjs(), // Dayjs object
  expiryDate: 1704067200000, // Unix timestamp (milliseconds)

  // Nested object with dates
  profile: {
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: new Date('2024-01-15'),
    preferences: {
      timezone: 'Asia/Bangkok',
      notificationTime: '09:00:00', // This won't be converted (not a date)
    },
  },

  // Array with mixed content
  events: [
    {
      eventDate: '2024-02-01',
      name: 'Meeting 1',
    },
    {
      eventDate: dayjs('2024-02-15'),
      name: 'Meeting 2',
    },
  ],

  // Non-date fields that won't be touched
  settings: {
    theme: 'dark',
    language: 'th',
    version: '1.0.0',
  },
};

// Example 2: Firestore data (what you get from Firestore)
export const exampleFirestoreData = {
  name: 'John Doe',
  email: 'john@example.com',

  // These would be Firestore Timestamps in real scenario
  // For demo, we'll use objects that mimic Timestamp structure
  birthDate: {
    toDate: () => new Date('1990-01-15'),
    seconds: 632188800,
    nanoseconds: 0,
  },

  profile: {
    createdAt: {
      toDate: () => new Date('2024-01-01T10:00:00Z'),
      seconds: 1704103200,
      nanoseconds: 0,
    },
    preferences: {
      timezone: 'Asia/Bangkok',
    },
  },
};

// Example usage functions
export const demonstrateUsage = () => {
  console.log('=== Date Handling Examples ===\n');

  // 1. Preparing data for Firestore
  console.log('1. Original form data:', exampleFormData);
  const firestoreReady = prepareDataForFirestore(exampleFormData);
  console.log('   Prepared for Firestore:', firestoreReady);
  console.log('   → All date values converted to Firestore Timestamps\n');

  // 2. Preparing data from Firestore for forms
  console.log('2. Firestore data:', exampleFirestoreData);
  const formReady = prepareDataFromFirestore(exampleFirestoreData);
  console.log('   Prepared for forms:', formReady);
  console.log('   → All Timestamps converted to dayjs objects\n');

  // 3. Custom options
  const customOptions = {
    excludeFields: ['lastLogin'], // Don't convert this field
    outputFormat: 'iso', // Return ISO strings instead of dayjs
  };

  const customProcessed = prepareDataFromFirestore(exampleFirestoreData, customOptions);
  console.log('3. With custom options:', customProcessed);
  console.log('   → Custom formatting applied\n');

  // 4. Selective processing
  const specificFields = processFormDataForFirestore(exampleFormData, {
    includeFields: ['birthDate', 'registeredAt'], // Only process these fields
  });
  console.log('4. Selective processing:', specificFields);
  console.log('   → Only specified fields converted\n');
};

// Test function to verify date detection
export const testDateDetection = () => {
  const testValues = [
    // Should be detected as dates
    new Date(),
    '2024-01-01',
    '2024-01-01T10:00:00Z',
    dayjs(),
    1704067200000, // Unix timestamp

    // Should NOT be detected as dates
    'not a date',
    123, // Small number
    '2024', // Just a year
    null,
    undefined,
    { someField: 'value' },
  ];

  console.log('=== Date Detection Test ===');
  testValues.forEach((value) => {
    const processed = prepareDataForFirestore({ testField: value });
    console.log(
      `${JSON.stringify(value)} → ${processed.testField?.constructor?.name || typeof processed.testField}`,
    );
  });
};

// Example of using in a React component
export const useExampleInComponent = () => {
  // In a real component, you might do:
  /*
  const handleSave = async (formValues) => {
    try {
      // Automatically convert all date values for Firestore
      const dataToSave = prepareDataForFirestore(formValues);
      await setDoc(doc(db, 'users', userId), dataToSave);
      message.success('Data saved successfully');
    } catch (error) {
      message.error('Failed to save data');
    }
  };

  const loadUserData = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        // Automatically convert all Timestamps for form usage
        const formData = prepareDataFromFirestore(docSnap.data());
        form.setFieldsValue(formData);
      }
    } catch (error) {
      message.error('Failed to load data');
    }
  };
  */
};
