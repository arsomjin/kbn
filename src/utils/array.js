export const getAllDuplicates = (arr, keys) => {
  // Ensure keys is an array
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  // Build counts based on composite keys
  const counts = arr.reduce((acc, item) => {
    // Create a composite key using the values from all keys, separated by a delimiter (e.g., '|')
    const compositeKey = keys.map(key => item[key]).join('|');
    acc[compositeKey] = (acc[compositeKey] || 0) + 1;
    return acc;
  }, {});

  // Filter items that have a composite key appearing more than once
  return arr.filter(item => {
    const compositeKey = keys.map(key => item[key]).join('|');
    return counts[compositeKey] > 1;
  });
};

// Example usage:
const data = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 1, name: 'Alice Duplicate', email: 'alice.dup@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  { id: 2, name: 'Bob Duplicate', email: 'bob.dup@example.com' },
  { id: 4, name: 'Dave', email: 'bob@example.com' } // Duplicate based on email
];

// Find duplicates based on the 'id' key:
// const duplicatesById = getAllDuplicates(data, 'id');
// console.log('Duplicates by id:', duplicatesById);

// Find duplicates based on both 'name' and 'email' keys:
// const duplicatesByNameEmail = getAllDuplicates(data, ['name', 'email']);
// console.log('Duplicates by name and email:', duplicatesByNameEmail);
