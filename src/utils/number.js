import numeral from 'numeral';

export const formatNumbersInObject = obj => {
  // Example usage:
  // let data = {
  //     a: 3.14159,
  //     b: 2.71828,
  //     c: "hello",
  //     d: { x: 1.2345, y: 6.789 }
  //   };

  //   formatNumbers(data);
  //   console.log(data);
  // Output: { a: 3.14, b: 2.72, c: "hello", d: { x: 1.23, y: 6.79 } }

  for (let key in obj) {
    if (typeof obj[key] === 'number') {
      // Convert to a number with 2 decimals.
      obj[key] = Numb(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively format numbers in nested objects.
      formatNumbersInObject(obj[key]);
    }
  }
};

// Approach 1: Using a threshold to decide if a number is very small
export function isVerySmallNumber(num, threshold = 1e-6) {
  return Math.abs(num) > 0 && Math.abs(num) < threshold;
}

// Approach 2: Checking if the default string representation is in scientific notation
export function isScientificNotation(num) {
  if (!num) return false;
  return num.toString().toLowerCase().includes('e');
}

export const Numb = val => {
  if (!val || isNaN(val)) {
    return 0;
  }
  let mNum = val.toString().replace(/(\r\n|\n|\r|,| |)/g, '');
  let rNum = isNaN(mNum) ? 0 : Number(mNum);
  return isVerySmallNumber(rNum) ? 0 : rNum;
};

// Walk around for numeral.js issues: return NaN when formatting small number (scientific notation)
export const numer = num => {
  if (isVerySmallNumber(num)) {
    return numer(0);
  }
  return numeral(num);
};
