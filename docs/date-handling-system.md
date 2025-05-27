# Date Handling System Documentation

## Overview

The KBN Date Handling System provides a robust, type-safe solution for managing dates between Antd components and Firestore. This system replaces the old `processFormDataForFirestore` and `processFirestoreDataForForm` functions with a more reliable and comprehensive approach.

## Key Features

- **Type-Safe Conversions**: Full TypeScript support with proper type definitions
- **Multiple Input Support**: Handles Date, Timestamp, Dayjs, strings, and numbers
- **Automatic Field Detection**: Smart detection of date fields by name patterns
- **Nested Object Support**: Processes complex nested structures and arrays
- **Error Handling**: Graceful error handling with fallbacks
- **Performance Optimized**: Efficient processing with memoization
- **Timezone Aware**: Built-in timezone support
- **Validation**: Comprehensive date validation functions
- **React Integration**: Custom hooks for easy component integration

## Quick Start

### Basic Usage with Hooks

```tsx
import React from 'react';
import { Form, DatePicker, Button } from 'antd';
import { useDateHandling } from 'utils/dateHandling';

const MyForm: React.FC = () => {
  const [form] = Form.useForm();
  const { prepareForSave, prepareForForm } = useDateHandling();

  const handleSave = async (values: any) => {
    // Convert form data for Firestore (dayjs → Timestamp)
    const firestoreData = prepareForSave(values);
    await saveToFirestore(firestoreData);
  };

  const handleLoad = async () => {
    const firestoreData = await loadFromFirestore();
    // Convert Firestore data for form (Timestamp → dayjs)
    const formData = prepareForForm(firestoreData);
    form.setFieldsValue(formData);
  };

  return (
    <Form form={form} onFinish={handleSave}>
      <Form.Item name="startDate" label="Start Date">
        <DatePicker />
      </Form.Item>
      <Form.Item name="endDate" label="End Date">
        <DatePicker />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
      <Button onClick={handleLoad}>Load</Button>
    </Form>
  );
};
```

### Direct Function Usage

```tsx
import { processFormDataForFirestore, processFirestoreDataForForm } from 'utils/dateHandling';

// Save to Firestore
const saveData = async (formValues: any) => {
  const firestoreData = processFormDataForFirestore(formValues);
  await setDoc(doc(firestore, 'collection', 'docId'), firestoreData);
};

// Load from Firestore
const loadData = async () => {
  const docSnap = await getDoc(doc(firestore, 'collection', 'docId'));
  if (docSnap.exists()) {
    const formData = processFirestoreDataForForm(docSnap.data());
    return formData;
  }
};
```

## Core Functions

### Conversion Functions

#### `toJSDate(input, options?)`

Converts any date input to JavaScript Date object.

```tsx
import { toJSDate } from 'utils/dateHandling';

const date1 = toJSDate('2023-12-25'); // Date object
const date2 = toJSDate(dayjs('2023-12-25')); // Date object
const date3 = toJSDate(firestoreTimestamp); // Date object
const date4 = toJSDate(1703462400000); // Date object
```

#### `toDayjs(input, options?)`

Converts any date input to Dayjs object for Antd components.

```tsx
import { toDayjs } from 'utils/dateHandling';

const dayjs1 = toDayjs(new Date()); // Dayjs object
const dayjs2 = toDayjs('2023-12-25'); // Dayjs object
const dayjs3 = toDayjs(firestoreTimestamp); // Dayjs object
```

#### `toFirestoreTimestamp(input, options?)`

Converts any date input to Firestore Timestamp for saving.

```tsx
import { toFirestoreTimestamp } from 'utils/dateHandling';

const timestamp1 = toFirestoreTimestamp(new Date()); // Timestamp
const timestamp2 = toDayjs('2023-12-25'); // Timestamp
```

### Processing Functions

#### `processFormDataForFirestore(data, options?)`

Processes form data before saving to Firestore. Converts all date fields to Timestamps.

```tsx
import { processFormDataForFirestore } from 'utils/dateHandling';

const formData = {
  name: 'John Doe',
  createdDate: dayjs('2023-12-25'),
  profile: {
    birthDate: dayjs('1990-05-15'),
    lastLogin: dayjs('2023-12-24'),
  },
};

const firestoreData = processFormDataForFirestore(formData);
// Result: All date fields converted to Firestore Timestamps
```

#### `processFirestoreDataForForm(data, options?)`

Processes Firestore data for form components. Converts all Timestamp fields to Dayjs objects.

```tsx
import { processFirestoreDataForForm } from 'utils/dateHandling';

const firestoreData = {
  name: 'John Doe',
  createdDate: Timestamp.fromDate(new Date('2023-12-25')),
  profile: {
    birthDate: Timestamp.fromDate(new Date('1990-05-15')),
  },
};

const formData = processFirestoreDataForForm(firestoreData);
// Result: All Timestamp fields converted to Dayjs objects
```

## React Hooks

### `useDateHandling(options?)`

Main hook for form components.

```tsx
const {
  prepareForSave, // Convert form data for Firestore
  prepareForForm, // Convert Firestore data for form
  formatForDisplay, // Format date for display
  validateDate, // Validate single date
  validateRange, // Validate date range
  toDayjs, // Direct conversion functions
  toJSDate,
  toFirestoreTimestamp,
  isDateField,
} = useDateHandling();
```

### `useDateRangeHandling()`

Specialized hook for date range forms.

```tsx
import { useDateRangeHandling } from 'hooks/useDateHandling';

const { validateRange, formatRange, getRangeDays, isValidRange } = useDateRangeHandling();
```

### `useDateBatchProcessing()`

Hook for processing large datasets with dates.

```tsx
import { useDateBatchProcessing } from 'hooks/useDateHandling';

const { processBatch } = useDateBatchProcessing();

// Process array of objects
const processedData = processBatch(largeDataArray, 'forFirestore');
```

## Options and Configuration

### `FormDataProcessingOptions`

```tsx
interface FormDataProcessingOptions {
  excludeFields?: string[]; // Fields to skip
  includeFields?: string[]; // Only process these fields
  processNested?: boolean; // Process nested objects (default: true)
  dateOptions?: DateConversionOptions;
}
```

### `DateConversionOptions`

```tsx
interface DateConversionOptions {
  timezone?: string; // Target timezone
  preserveTime?: boolean; // Keep time component
  defaultValue?: any; // Fallback value
  suppressWarnings?: boolean; // Disable warnings
}
```

### Usage Examples

```tsx
// Exclude specific fields from processing
const options = {
  excludeFields: ['metadata', 'tempData'],
};
const result = processFormDataForFirestore(data, options);

// Only process specific fields
const options = {
  includeFields: ['startDate', 'endDate', 'createdAt'],
};

// Disable nested processing
const options = {
  processNested: false,
};

// Timezone conversion
const options = {
  dateOptions: {
    timezone: 'America/New_York',
    preserveTime: true,
  },
};
```

## Date Field Detection

The system automatically detects date fields based on naming patterns:

### Detected Patterns

- Fields ending with: `date`, `time`, `at`
- Fields starting with: `date`
- Common patterns: `birthday`, `deadline`, `expire`, `timestamp`

### Examples

```tsx
// These will be automatically detected as date fields:
const data = {
  createdDate: dayjs(), // ✅ Detected
  startDate: dayjs(), // ✅ Detected
  updatedAt: dayjs(), // ✅ Detected
  deadline: dayjs(), // ✅ Detected
  timestamp: dayjs(), // ✅ Detected

  // These will NOT be detected:
  name: 'John', // ❌ Not detected
  amount: 1000, // ❌ Not detected
  status: 'active', // ❌ Not detected
};
```

### Custom Patterns

```tsx
import { addDateFieldPattern } from 'utils/dateHandling';

// Add custom pattern
addDateFieldPattern(/schedule$/i); // Now 'workSchedule' will be detected
```

## Validation

### Form Validation

```tsx
import { validateDateField, validateDateRange } from 'utils/dateHandling';

// In Antd Form
<Form.Item
  name="startDate"
  rules={[
    { validator: (_, value) => validateDateField(value, true) }
  ]}
>
  <DatePicker />
</Form.Item>

<Form.Item
  name="endDate"
  rules={[
    {
      validator: (_, value) => {
        const startDate = form.getFieldValue('startDate');
        return validateDateRange(startDate, value);
      }
    }
  ]}
>
  <DatePicker />
</Form.Item>
```

### Hook Validation

```tsx
const { validateDate, validateRange } = useDateHandling();

// Validate single date
const isValid = await validateDate(dateValue, true); // required = true

// Validate date range
const isValidRange = await validateRange(startDate, endDate);
```

## Error Handling

The system includes comprehensive error handling:

```tsx
// Automatic error handling with notifications
const { prepareForSave } = useDateHandling();

// If conversion fails, user gets notification and original data is returned
const result = prepareForSave(formData);
```

### Manual Error Handling

```tsx
import { toJSDate } from 'utils/dateHandling';

const options = {
  suppressWarnings: true,
  defaultValue: new Date(),
};

const date = toJSDate('invalid-date', options);
// Returns defaultValue instead of null on error
```

## Performance

### Batch Processing

```tsx
import { useDateBatchProcessing } from 'hooks/useDateHandling';

const { processBatch } = useDateBatchProcessing();

// Process large datasets efficiently
const largeDataset = Array.from({ length: 10000 }, () => ({
  id: Math.random(),
  createdDate: dayjs(),
  updatedDate: dayjs(),
}));

const processed = processBatch(largeDataset, 'forFirestore');
```

### Memoization

The hooks use React's `useCallback` and `useMemo` for performance optimization:

```tsx
// These functions are memoized and won't recreate on every render
const { prepareForSave, prepareForForm } = useDateHandling();
```

## Migration Guide

### From Old Functions

Replace old functions with new ones:

```tsx
// OLD ❌
import { cleanValuesBeforeSave, formatValuesBeforeLoad } from 'utils/functions';
const cleanData = cleanValuesBeforeSave(formData);
const formData = formatValuesBeforeLoad(firestoreData);

// NEW ✅
import { useDateHandling } from 'utils/dateHandling';
const { prepareForSave, prepareForForm } = useDateHandling();
const cleanData = prepareForSave(formData);
const formData = prepareForForm(firestoreData);
```

### Direct Function Usage

```tsx
// OLD ❌
import { cleanValuesBeforeSave } from 'utils/functions';

// NEW ✅
import { processFormDataForFirestore } from 'utils/dateHandling';
```

## Testing

### Run Tests

```tsx
import { runAllDateHandlingTests } from 'utils/dateHandlingTests';

// Run all tests
runAllDateHandlingTests();

// Or run specific tests
import { testDateConversions, testFormDataProcessing } from 'utils/dateHandlingTests';
testDateConversions();
testFormDataProcessing();
```

### Browser Console

```javascript
// Available in browser console:
window.testDateHandling.runAll(); // Run all tests
window.testDateHandling.testConversions(); // Test conversions
window.testDateHandling.testFormProcessing(); // Test form processing
```

## Constants

### Date Formats

```tsx
import { DATE_FORMATS } from 'utils/dateHandling';

DATE_FORMATS.DISPLAY; // 'DD/MM/YYYY'
DATE_FORMATS.DISPLAY_WITH_TIME; // 'DD/MM/YYYY HH:mm'
DATE_FORMATS.ISO; // 'YYYY-MM-DD'
DATE_FORMATS.THAI_FULL; // 'วันdddd ที่ DD MMMM YYYY'
```

### Timezones

```tsx
import { TIMEZONE } from 'utils/dateHandling';

TIMEZONE.BANGKOK; // 'Asia/Bangkok'
TIMEZONE.UTC; // 'UTC'
```

## Best Practices

1. **Always use the hooks in React components** for automatic error handling
2. **Use direct functions in utility files** where hooks aren't available
3. **Test date conversions** thoroughly when implementing new features
4. **Validate date inputs** in forms to prevent invalid data
5. **Use consistent date formats** throughout the application
6. **Handle timezones** appropriately for international applications

## Troubleshooting

### Common Issues

1. **Invalid date format**: Use `validateDateField` to check input validity
2. **Timezone issues**: Specify timezone in options when needed
3. **Performance with large datasets**: Use `useDateBatchProcessing` for large arrays
4. **Nested object conversion**: Ensure `processNested: true` in options

### Debug Mode

Enable debug logging:

```tsx
const options = {
  dateOptions: {
    suppressWarnings: false, // Enable warnings for debugging
  },
};
```

## Support

For issues or questions about the date handling system:

1. Check the test results with `runAllDateHandlingTests()`
2. Review the examples in `DateHandlingExamples.tsx`
3. Check the migration guide in `DateHandlingMigrationGuide.tsx`
4. Refer to this documentation for comprehensive usage instructions
