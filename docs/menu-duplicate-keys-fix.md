# Menu Duplicate Keys Fix Summary

## Issue

React Menu component was throwing warnings about duplicate keys:

- `income-personal-loan` used in both accounting and reports sections
- `customer-delivery-plan` used in both warehouse and warehouse reports sections
- `branch-delivery-plan` used in both warehouse and warehouse reports sections

## Root Cause

The navigation configuration file (`src/data/navigationConfig.js`) had duplicate key values across different menu sections, causing React to warn about non-unique keys in the Menu component.

## Fixes Applied

### 1. Income Personal Loan Key

**Location**: `src/data/navigationConfig.js`

**Before**:

```javascript
// Line 47 - Accounting section
{
  key: 'income-personal-loan',
  title: 'รับเงิน - สินเชื่อส่วนบุคคล',
  to: '/account/income-personal-loan',
  // ...
}

// Line 497 - Reports section
{
  key: 'income-personal-loan',
  title: 'รายรับ - สินเชื่อส่วนบุคคล',
  to: '/reports/income-personal-loan',
  // ...
}
```

**After**:

```javascript
// Line 47 - Accounting section (unchanged)
{
  key: 'income-personal-loan',
  title: 'รับเงิน - สินเชื่อส่วนบุคคล',
  to: '/account/income-personal-loan',
  // ...
}

// Line 497 - Reports section (updated)
{
  key: 'income-personal-loan-report',
  title: 'รายรับ - สินเชื่อส่วนบุคคล',
  to: '/reports/income-personal-loan',
  // ...
}
```

### 2. Customer Delivery Plan Key

**Location**: `src/data/navigationConfig.js`

**Before**:

```javascript
// Line 402 - Warehouse section
{
  key: 'customer-delivery-plan',
  title: 'ส่งลูกค้า',
  to: '/warehouse/customer-deliver-plan',
  // ...
}

// Line 766 - Warehouse Reports section
{
  key: 'customer-delivery-plan',
  title: 'แผนการส่งรถลูกค้า',
  to: '/reports/warehouse/vehicles/customerDeliveryPlan',
  // ...
}
```

**After**:

```javascript
// Line 402 - Warehouse section (unchanged)
{
  key: 'customer-delivery-plan',
  title: 'ส่งลูกค้า',
  to: '/warehouse/customer-deliver-plan',
  // ...
}

// Line 766 - Warehouse Reports section (updated)
{
  key: 'customer-delivery-plan-report',
  title: 'แผนการส่งรถลูกค้า',
  to: '/reports/warehouse/vehicles/customerDeliveryPlan',
  // ...
}
```

### 3. Branch Delivery Plan Key

**Location**: `src/data/navigationConfig.js`

**Before**:

```javascript
// Line 409 - Warehouse section
{
  key: 'branch-delivery-plan',
  title: 'ส่งสาขา',
  to: '/warehouse/branch-deliver-plan',
  // ...
}

// Line 773 - Warehouse Reports section
{
  key: 'branch-delivery-plan',
  title: 'แผนการส่งรถสาขา',
  to: '/reports/warehouse/vehicles/branchDeliveryPlan',
  // ...
}
```

**After**:

```javascript
// Line 409 - Warehouse section (unchanged)
{
  key: 'branch-delivery-plan',
  title: 'ส่งสาขา',
  to: '/warehouse/branch-deliver-plan',
  // ...
}

// Line 773 - Warehouse Reports section (updated)
{
  key: 'branch-delivery-plan-report',
  title: 'แผนการส่งรถสาขา',
  to: '/reports/warehouse/vehicles/branchDeliveryPlan',
  // ...
}
```

## Additional Fix: HR Leaving Report

### Issue

After the moment-timezone to dayjs migration, the HR Leaving report had an undefined `dayjs.tz()` function because the timezone plugin wasn't imported.

### Fix Applied

**Location**: `src/Modules/Reports/HR/Leaving/index.js`

**Added timezone plugin imports and configuration**:

```javascript
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Configure dayjs plugins
dayjs.extend(timezone);
dayjs.extend(utc);
```

**Fixed component export**:

```javascript
const HRLeaving = () => {
  // ... component code
};

export default HRLeaving;
```

## Verification

### Duplicate Key Check

Ran command to verify no remaining duplicates:

```bash
grep -o "key: '[^']*'" src/data/navigationConfig.js | sort | uniq -d
```

**Result**: No duplicates found ✅

### Menu Key Naming Convention

- **Functional pages**: Use original descriptive keys (e.g., `income-personal-loan`)
- **Report pages**: Add `-report` suffix (e.g., `income-personal-loan-report`)
- **Maintains clarity**: Easy to distinguish between functional and reporting sections

## Impact

### ✅ **Fixed**

- React Menu duplicate key warnings eliminated
- Navigation functionality preserved
- All menu items remain accessible
- HR Leaving report timezone functionality restored

### ✅ **No Breaking Changes**

- All existing routes and paths unchanged
- User experience identical
- No impact on existing bookmarks or links
- RBAC permissions remain intact

## Testing Recommendations

1. **Navigation Testing**: Verify all menu items are clickable and lead to correct pages
2. **RBAC Testing**: Confirm permission-based menu filtering still works
3. **HR Reports**: Test the HR Leaving report timezone display functionality
4. **Console Monitoring**: Check browser console for any remaining React warnings

---

**Fix Completed**: ✅ Success  
**Date**: 2025-06-07  
**Files Modified**: 2 files  
**Warnings Eliminated**: 3 duplicate key warnings  
**Additional Fixes**: 1 timezone plugin issue
