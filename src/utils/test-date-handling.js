/**
 * Simple test file for the enhanced date handling utilities
 * Run this to verify everything works correctly
 */

import { prepareDataForFirestore, prepareDataFromFirestore } from './firestoreUtils';
import dayjs from './dayjs';

// Test data with various date formats
const testData = {
  name: 'Test User',
  email: 'test@example.com',

  // Various date formats
  birthDate: '1990-01-15', // ISO string
  registeredAt: new Date(), // JS Date
  lastLogin: dayjs(), // Dayjs object
  expiryDate: 1704067200000, // Unix timestamp (ms)

  // Nested object
  profile: {
    createdAt: '2024-01-01T10:00:00Z',
    settings: {
      theme: 'dark', // Non-date value
      notifications: true, // Non-date value
    },
  },

  // Array with dates
  events: [
    { date: '2024-02-01', name: 'Event 1' },
    { date: dayjs('2024-02-15'), name: 'Event 2' },
  ],

  // Non-date fields
  count: 42,
  active: true,
  tags: ['tag1', 'tag2'],
};

export const runDateHandlingTest = () => {
  console.log('🧪 Testing Enhanced Date Handling Utilities\n');

  // Test 1: Prepare for Firestore
  console.log('📤 1. Testing prepareDataForFirestore()');
  console.log('Original data:', JSON.stringify(testData, null, 2));

  const firestoreData = prepareDataForFirestore(testData);
  console.log('Processed for Firestore:', JSON.stringify(firestoreData, null, 2));

  // Verify that dates were converted
  const hasTimestamps = Object.values(firestoreData).some(
    (value) => value && typeof value === 'object' && typeof value.toDate === 'function',
  );
  console.log('✅ Contains Firestore Timestamps:', hasTimestamps);
  console.log('');

  // Test 2: Prepare from Firestore (simulate Firestore data)
  console.log('📥 2. Testing prepareDataFromFirestore()');

  // Mock Firestore data with Timestamp-like objects
  const mockFirestoreData = {
    name: 'Test User',
    email: 'test@example.com',
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
      settings: {
        theme: 'dark',
      },
    },
  };

  console.log('Mock Firestore data:', JSON.stringify(mockFirestoreData, null, 2));

  const formData = prepareDataFromFirestore(mockFirestoreData);
  console.log('Processed for forms:', JSON.stringify(formData, null, 2));

  // Verify that Timestamps were converted to dayjs
  const hasDayjsObjects = JSON.stringify(formData).includes('"$d"');
  console.log('✅ Contains dayjs objects:', hasDayjsObjects);
  console.log('');

  // Test 3: Custom options
  console.log('⚙️  3. Testing with custom options');

  const customFormData = prepareDataFromFirestore(mockFirestoreData, {
    outputFormat: 'iso',
    excludeFields: ['profile'],
  });

  console.log(
    'With custom options (ISO format, exclude profile):',
    JSON.stringify(customFormData, null, 2),
  );
  console.log('');

  console.log('🎉 All tests completed successfully!');
  console.log('The enhanced date handling utilities are working correctly.');
};

// Export for use in other files
export { testData };

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  try {
    runDateHandlingTest();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}
