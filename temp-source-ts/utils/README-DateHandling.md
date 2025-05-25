# Date Handling System

## Quick Reference

This folder contains the comprehensive date handling system for the KBN application.

### 📁 Files Overview

- **`dateHandling.ts`** - Core date conversion and processing functions
- **`dateHandlingTests.ts`** - Comprehensive test suite
- **`../hooks/useDateHandling.ts`** - React hooks for component integration
- **`../examples/DateHandlingExamples.tsx`** - Usage examples
- **`../examples/DateHandlingMigrationGuide.tsx`** - Migration guide from old functions
- **`../docs/date-handling-system.md`** - Complete documentation

### 🚀 Quick Start

#### For React Components (Recommended)

```tsx
import { useDateHandling } from 'hooks/useDateHandling';

const { prepareForSave, prepareForForm } = useDateHandling();

// Save to Firestore
const firestoreData = prepareForSave(formValues);

// Load from Firestore
const formData = prepareForForm(firestoreData);
```

#### For Utility Functions

```tsx
import { processFormDataForFirestore, processFirestoreDataForForm } from 'utils/dateHandling';

// Direct function usage
const firestoreData = processFormDataForFirestore(formValues);
const formData = processFirestoreDataForForm(firestoreData);
```

### 🧪 Testing

Run tests in browser console:

```javascript
// Run all tests
window.testDateHandling.runAll();

// Test specific functionality
window.testDateHandling.testConversions();
window.testDateHandling.testFormProcessing();
```

Or import in code:

```tsx
import { runAllDateHandlingTests } from 'utils/dateHandlingTests';
runAllDateHandlingTests();
```

### 📚 Key Features

- ✅ **Type-safe** conversions between Date, Dayjs, and Firestore Timestamp
- ✅ **Automatic detection** of date fields by naming patterns
- ✅ **Nested object** and array processing
- ✅ **Error handling** with graceful fallbacks
- ✅ **React hooks** for easy component integration
- ✅ **Validation** functions for forms
- ✅ **Performance optimized** for large datasets
- ✅ **Timezone aware** conversions
- ✅ **Comprehensive testing** suite

### 🔄 Migration from Old Functions

The old `cleanValuesBeforeSave` and `formatValuesBeforeLoad` functions are now deprecated. Use the new system:

```tsx
// OLD ❌
import { cleanValuesBeforeSave, formatValuesBeforeLoad } from 'utils/functions';
const cleaned = cleanValuesBeforeSave(data);
const formatted = formatValuesBeforeLoad(data);

// NEW ✅
import { useDateHandling } from 'hooks/useDateHandling';
const { prepareForSave, prepareForForm } = useDateHandling();
const cleaned = prepareForSave(data);
const formatted = prepareForForm(data);
```

### 🎯 Common Use Cases

#### Form with Date Fields

```tsx
<Form.Item name='startDate' rules={[{ validator: (_, value) => validateDateField(value, true) }]}>
  <DatePicker />
</Form.Item>
```

#### Date Range Validation

```tsx
const { validateRange } = useDateHandling();
const isValid = await validateRange(startDate, endDate);
```

#### Batch Processing

```tsx
const { processBatch } = useDateBatchProcessing();
const processed = processBatch(largeArray, 'forFirestore');
```

### 📖 Full Documentation

For complete documentation, examples, and advanced usage, see:

- [Complete Documentation](../docs/date-handling-system.md)
- [Usage Examples](../examples/DateHandlingExamples.tsx)
- [Migration Guide](../examples/DateHandlingMigrationGuide.tsx)

### 🛠️ Support

If you encounter issues:

1. Run the test suite to check system health
2. Check the examples for proper usage patterns
3. Review the complete documentation
4. Ensure you're using the hooks in React components

---

_This system replaces the old date handling functions with a more robust, type-safe, and feature-complete solution._
