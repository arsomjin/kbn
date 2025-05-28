/**
 * Simple test to isolate the timestamp detection issue
 */

// Copy the exact isDateValue logic to test it standalone
function testIsDateValue(value) {
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

// Test the exact values from the screenshot
const testValues = {
  created: 1748201363348,
  lastLogin: 1748201363348,
  employeeCode: 'AB776',
  branchCode: '2001',
};

console.log('=== SIMPLE TIMESTAMP TEST ===');
Object.keys(testValues).forEach((key) => {
  const value = testValues[key];
  const result = testIsDateValue(value);
  console.log(`${key}: ${value} (${typeof value}) -> isDateValue: ${result}`);

  if (typeof value === 'number') {
    console.log(`  Length: ${value.toString().length}`);
    console.log(`  > 0: ${value > 0}`);
    console.log(`  >= 0: ${value >= 0}`);
    console.log(`  <= 4102444800000: ${value <= 4102444800000}`);
    console.log(
      `  Length check: ${value.toString().length === 13 || value.toString().length === 10}`,
    );
    console.log(`  Date: ${new Date(value).toISOString()}`);
  }
});

export default testIsDateValue;
