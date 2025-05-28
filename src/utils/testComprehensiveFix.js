import { processFirestoreDataForForm, isDateValue } from './dateHandling.js';
import { processUserDataFromFirestore } from './fixUserDataProcessing.js';

/**
 * Comprehensive test for the date processing fix
 */
export const runComprehensiveTest = () => {
  console.log('🔬 Running Comprehensive Date Processing Test');
  console.log('='.repeat(50));

  // Test data that reproduces the exact issue from screenshots
  const testData = {
    uid: 'user123',
    employeeCode: 'AB776',
    branchCode: '2001',
    created: 1748201363348, // Exact value from screenshot
    lastLogin: 1748201363348, // Exact value from screenshot
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    active: true,
    role: 'employee',
    employeeInfo: {
      department: 'IT',
      employeeCode: 'AB776',
      branch: {
        name: 'Head Office',
        code: '2001',
      },
      workBegin: 1609459200000, // Should be converted
      workEnd: null,
    },
    // Additional test cases
    someDate: '2024-01-01T00:00:00Z', // ISO string
    someTimestamp: { toDate: () => new Date('2024-01-01') }, // Firestore Timestamp
    regularNumber: 42,
    regularString: 'hello',
    nullField: null,
    undefinedField: undefined,
  };

  console.log('📥 Original Data:');
  console.log(JSON.stringify(testData, null, 2));

  console.log('\n🔍 Value Analysis:');
  Object.keys(testData).forEach((key) => {
    const value = testData[key];
    if (typeof value !== 'object' || value === null) {
      console.log(`${key}: ${value} (${typeof value}) -> isDateValue: ${isDateValue(value)}`);
    }
  });

  console.log('\n🧪 Testing processFirestoreDataForForm with ISO output:');
  const processedISO = processFirestoreDataForForm(testData, { outputFormat: 'iso' });
  console.log(JSON.stringify(processedISO, null, 2));

  console.log('\n🛡️ Testing processUserDataFromFirestore (safe processing):');
  const processedSafe = processUserDataFromFirestore(testData);
  console.log(JSON.stringify(processedSafe, null, 2));

  console.log('\n✅ Verification:');
  const tests = [
    {
      name: 'created field is converted to ISO string',
      pass: typeof processedISO.created === 'string' && processedISO.created.includes('2025'),
      actual: processedISO.created,
    },
    {
      name: 'lastLogin field is converted to ISO string',
      pass: typeof processedISO.lastLogin === 'string' && processedISO.lastLogin.includes('2025'),
      actual: processedISO.lastLogin,
    },
    {
      name: 'employeeCode remains as string',
      pass: processedISO.employeeCode === 'AB776',
      actual: processedISO.employeeCode,
    },
    {
      name: 'branchCode remains as string',
      pass: processedISO.branchCode === '2001',
      actual: processedISO.branchCode,
    },
    {
      name: 'nested workBegin is converted',
      pass: typeof processedISO.employeeInfo?.workBegin === 'string',
      actual: processedISO.employeeInfo?.workBegin,
    },
    {
      name: 'regular number stays number',
      pass: processedISO.regularNumber === 42,
      actual: processedISO.regularNumber,
    },
    {
      name: 'regular string stays string',
      pass: processedISO.regularString === 'hello',
      actual: processedISO.regularString,
    },
    {
      name: 'null field stays null',
      pass: processedISO.nullField === null,
      actual: processedISO.nullField,
    },
  ];

  let passedTests = 0;
  tests.forEach((test) => {
    const status = test.pass ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.actual}`);
    if (test.pass) passedTests++;
  });

  console.log(`\n📊 Results: ${passedTests}/${tests.length} tests passed`);

  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! The fix is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the implementation.');
  }

  return {
    original: testData,
    processedISO,
    processedSafe,
    testResults: tests,
    allPassed: passedTests === tests.length,
  };
};

// Export for use in other files
export default runComprehensiveTest;
