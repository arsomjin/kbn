# Phase 3 Migration - Critical Instructions

## ⚠️ IMPORTANT: Cloud Functions Update Required

Before running the Phase 3 migration, you **MUST** update your Cloud Functions to prevent unnecessary function executions.

### Why This Update Is Required

The Phase 3 migration adds `provinceId` to all existing documents. This triggers Firebase Cloud Functions that listen for document updates (`onUpdate`). Without the update, these functions will execute unnecessarily:

- `updateVehicleUnitPrice` (sections/stocks/importVehicles)
- `onUpdateSaleVehicles` (sections/sales/vehicles)
- `updateBookingOrderChange` (sections/sales/bookings)
- `updateTransferChange` (sections/stocks/transfer)
- `updateSaleOutChange` (sections/stocks/saleOut)
- `updateOtherVehicleOutChange` (sections/stocks/otherVehicleOut)
- `updateDeliveryPlanChange` (sections/stocks/deliver)
- `updateHRLeave` (sections/hr/leave)

### Step 1: Update functions/index.js

The `onlyCreatedAtChanged` function has already been updated in your codebase. Verify it looks like this:

```javascript
// Utility function to check if only createdAt field changed
function onlyCreatedAtChanged(before, after) {
  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  let changedKeys = [];

  allKeys.forEach((key) => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    const beforeStr = JSON.stringify(beforeVal);
    const afterStr = JSON.stringify(afterVal);
    if (beforeStr !== afterStr) {
      changedKeys.push(key);
    }
  });

  // Skip if only createdAt changed (original behavior)
  if (changedKeys.length === 1 && changedKeys[0] === "createdAt") {
    return true;
  }

  // Skip if only provinceId was added (Phase 3 migration)
  if (
    changedKeys.length === 1 &&
    changedKeys[0] === "provinceId" &&
    !before?.provinceId &&
    after?.provinceId
  ) {
    return true;
  }

  // Skip if both createdAt and provinceId changed (migration + createdAt update)
  if (
    changedKeys.length === 2 &&
    changedKeys.includes("createdAt") &&
    changedKeys.includes("provinceId") &&
    !before?.provinceId &&
    after?.provinceId
  ) {
    return true;
  }

  return false;
}
```

### Step 2: Deploy Cloud Functions

Deploy the updated Cloud Functions to Firebase:

```bash
# Navigate to functions directory
cd functions

# Deploy the updated functions
firebase deploy --only functions

# Or deploy specific functions if needed
firebase deploy --only functions:updateVehicleUnitPrice,functions:onUpdateSaleVehicles,functions:updateBookingOrderChange
```

### Step 3: Verify Deployment

Check that the functions are deployed successfully:

```bash
firebase functions:log
```

### Step 4: Run Migration

Only after the Cloud Functions are deployed, proceed with the Phase 3 migration:

1. Go to `/developer/phase3-migration`
2. Select collections to migrate
3. Preview sample data
4. Execute migration

## Migration Best Practices

### Recommended Migration Order:

1. **Phase 1: Accounting** (Income/Expense collections)

   - Low risk, business critical
   - ~2,000-5,000 documents expected

2. **Phase 2: Sales** (Vehicles/Bookings collections)

   - Medium risk, important business data
   - ~5,000-10,000 documents expected

3. **Phase 3: Inventory** (Stocks/Parts collections)

   - Medium risk, large volume
   - ~10,000-20,000 documents expected

4. **Phase 4: Service** (Orders/Close collections)

   - Lower risk
   - ~3,000-8,000 documents expected

5. **Phase 5: HR** (Employee/Leave collections)
   - Lowest risk
   - ~100-1,000 documents expected

### Safety Tips:

- ✅ **Test on staging first**
- ✅ **Backup data before migration**
- ✅ **Migrate during low-traffic hours**
- ✅ **Monitor Cloud Function logs during migration**
- ✅ **Use collection selection to migrate in batches**
- ✅ **Validate data after each batch**

## Troubleshooting

### If Cloud Functions Still Trigger:

1. Check that the `onlyCreatedAtChanged` function is deployed
2. Verify the function logic with a test document
3. Monitor Cloud Function logs for unexpected executions

### If Migration Fails:

1. Check browser console for errors
2. Use smaller collection batches
3. Check Firebase quota limits
4. Verify network connectivity

### Rollback if Needed:

The migration dashboard includes a rollback function that removes all `provinceId` fields added during migration.

## Contact

If you encounter issues:

1. Check the console warnings in the migration dashboard
2. Review Cloud Function logs
3. Test with a single collection first
4. Contact your development team for assistance

---

**REMEMBER: Deploy Cloud Functions FIRST, then run migration!**
