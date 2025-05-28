import { processFirestoreDataForForm, isDateValue } from './dateHandling.js';

/**
 * Test the fix for created and lastLogin fields
 */
export const testCreatedLastLoginFix = () => {
  console.log('🧪 Testing Created/LastLogin Fix');

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

  // Test if values are recognized as date values
  console.log('Is created value a date?', isDateValue(testUserData.created));
  console.log('Is lastLogin value a date?', isDateValue(testUserData.lastLogin));
  console.log('Is employeeCode a date?', isDateValue(testUserData.employeeCode));
  console.log('Is branchCode a date?', isDateValue(testUserData.branchCode));

  // Test processing with ISO format
  const processed = processFirestoreDataForForm(testUserData, { outputFormat: 'iso' });
  console.log('Processed data:', processed);

  // Verify the fix
  const success =
    processed.created &&
    processed.lastLogin &&
    processed.employeeCode === 'AB776' &&
    processed.branchCode === '2001';

  console.log(success ? '✅ Fix successful!' : '❌ Fix failed!');

  return { original: testUserData, processed, success };
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testCreatedLastLoginFix();
}
