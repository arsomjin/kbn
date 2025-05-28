/**
 * Final test to verify the timestamp conversion fix
 */

// Test the conversion functions directly
function testToJSDate(input) {
  try {
    if (!input) return null;

    // Handle Unix timestamp (seconds and milliseconds)
    if (typeof input === 'number') {
      // If it's a reasonable timestamp (after year 1970 and before year 2100)
      if (input > 0 && input <= 4102444800000) {
        // Handle both seconds and milliseconds
        const date = input < 10000000000 ? new Date(input * 1000) : new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function testToISOString(input) {
  try {
    const jsDate = testToJSDate(input);
    return jsDate ? jsDate.toISOString() : null;
  } catch {
    return null;
  }
}

// Test the exact values from the screenshot
const testValues = {
  created: 1748201363348,
  lastLogin: 1748201363348,
  employeeCode: 'AB776',
  branchCode: '2001',
};

console.log('=== FINAL CONVERSION TEST ===');
Object.keys(testValues).forEach((key) => {
  const value = testValues[key];

  if (typeof value === 'number') {
    const jsDate = testToJSDate(value);
    const isoString = testToISOString(value);

    console.log(`${key}: ${value}`);
    console.log(`  toJSDate: ${jsDate}`);
    console.log(`  toISOString: ${isoString}`);
    console.log(`  Range check: ${value > 0 && value <= 4102444800000}`);
    console.log('');
  } else {
    console.log(`${key}: ${value} (non-numeric, should stay as-is)`);
  }
});

export default { testToJSDate, testToISOString };
