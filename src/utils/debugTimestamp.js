import { isDateValue, processFirestoreDataForForm } from './dateHandling.js';

/**
 * Debug the exact timestamp values from the screenshot
 */
export const debugScreenshotTimestamps = () => {
  console.log('🔍 Debugging Screenshot Timestamps');

  // Exact values from the screenshot
  const created = 1748201363348;
  const lastLogin = 1748201363348;

  console.log('=== TIMESTAMP ANALYSIS ===');
  console.log('created value:', created);
  console.log('created type:', typeof created);
  console.log('created length:', created.toString().length);
  console.log('created > 0:', created > 0);
  console.log('created >= 0:', created >= 0);
  console.log('created <= 4102444800000:', created <= 4102444800000);
  console.log('isDateValue(created):', isDateValue(created));

  console.log('\nlastLogin value:', lastLogin);
  console.log('lastLogin type:', typeof lastLogin);
  console.log('lastLogin length:', lastLogin.toString().length);
  console.log('lastLogin > 0:', lastLogin > 0);
  console.log('lastLogin >= 0:', lastLogin >= 0);
  console.log('lastLogin <= 4102444800000:', lastLogin <= 4102444800000);
  console.log('isDateValue(lastLogin):', isDateValue(lastLogin));

  // Test the exact data structure from screenshot
  const testData = {
    uid: 'qMQqbUZ921fB26UpMrbuSJpJQ0q1',
    employeeCode: 'AB776',
    branchCode: '2001',
    created: 1748201363348,
    lastLogin: 1748201363348,
    firstName: 'Arsom',
    lastName: 'Jinda',
    email: 'arsomjin@gmail.com',
  };

  console.log('\n=== PROCESSING TEST ===');
  console.log('Original data:', testData);

  const processed = processFirestoreDataForForm(testData, { outputFormat: 'iso' });
  console.log('Processed data:', processed);

  console.log('\n=== FIELD BY FIELD ===');
  Object.keys(testData).forEach((key) => {
    const original = testData[key];
    const processed_value = processed[key];
    console.log(
      `${key}: ${original} -> ${processed_value} (isDateValue: ${isDateValue(original)})`,
    );
  });

  return { testData, processed };
};

// Test specific timestamp values
export const testTimestampDetection = () => {
  console.log('\n🧪 Testing Timestamp Detection Logic');

  const testValues = [
    1748201363348, // From screenshot
    1640995200000, // 2022-01-01
    1609459200000, // 2021-01-01
    946684800000, // 2000-01-01
    Date.now(), // Current timestamp
  ];

  testValues.forEach((value) => {
    const valueStr = value.toString();
    console.log(`\nValue: ${value}`);
    console.log(`  Length: ${valueStr.length}`);
    console.log(`  > 0: ${value > 0}`);
    console.log(`  >= 0: ${value >= 0}`);
    console.log(`  <= 4102444800000: ${value <= 4102444800000}`);
    console.log(`  Length check (13 or 10): ${valueStr.length === 13 || valueStr.length === 10}`);
    console.log(`  isDateValue: ${isDateValue(value)}`);
    console.log(`  Date: ${new Date(value).toISOString()}`);
  });
};

export default { debugScreenshotTimestamps, testTimestampDetection };
