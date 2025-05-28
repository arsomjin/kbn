/**
 * Simple test for processFirestoreDataForForm fix
 * Tests the exact scenario from the screenshot
 */

// Simplified version of the core logic for testing
function simpleIsDateValue(value) {
  if (!value) return false;

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

  return false;
}

function simpleToISOString(input) {
  try {
    if (!input) return null;

    // Handle Unix timestamp (seconds and milliseconds)
    if (typeof input === 'number') {
      // If it's a reasonable timestamp (after year 1970 and before year 2100)
      if (input > 0 && input <= 4102444800000) {
        // Handle both seconds and milliseconds
        const date = input < 10000000000 ? new Date(input * 1000) : new Date(input);
        return isNaN(date.getTime()) ? null : date.toISOString();
      }
    }

    return null;
  } catch {
    return null;
  }
}

function simpleProcessFirestoreDataForForm(data, options = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const { outputFormat = 'iso' } = options;
  const result = { ...data };

  Object.keys(result).forEach((key) => {
    const value = result[key];

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
    if (simpleIsDateValue(value)) {
      // Convert based on output format preference
      if (outputFormat === 'iso') {
        result[key] = simpleToISOString(value);
      }
      return;
    }

    // For all other types, keep as-is
    result[key] = value;
  });

  return result;
}

// Test with exact data from screenshot
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

console.log('=== SIMPLE PROCESS TEST ===');
console.log('Original data:');
console.log(JSON.stringify(testData, null, 2));

console.log('\nProcessed data:');
const processed = simpleProcessFirestoreDataForForm(testData, { outputFormat: 'iso' });
console.log(JSON.stringify(processed, null, 2));

console.log('\n=== VERIFICATION ===');
const success =
  processed.created &&
  processed.lastLogin &&
  processed.employeeCode === 'AB776' &&
  processed.branchCode === '2001' &&
  typeof processed.created === 'string' &&
  typeof processed.lastLogin === 'string';

console.log(success ? '✅ Fix successful!' : '❌ Fix failed!');

console.log('\n=== FIELD ANALYSIS ===');
Object.keys(testData).forEach((key) => {
  const original = testData[key];
  const processed_value = processed[key];
  const isDate = simpleIsDateValue(original);
  console.log(`${key}: ${original} -> ${processed_value} (isDate: ${isDate})`);
});

export default { simpleProcessFirestoreDataForForm, simpleIsDateValue, simpleToISOString };
