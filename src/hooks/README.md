# Data Synchronization Hooks

This directory contains custom hooks for managing Firebase Firestore data synchronization throughout the KBN application.

## Overview

The data synchronization has been refactored from scattered `useCollectionSync` calls to organized, reusable custom hooks. This improves maintainability, reduces code duplication, and provides better organization by business domain.

## Files

### `useDataSync.js`

Central hub for all data synchronization hooks and configuration.

## Hooks Available

### `useDataSynchronization()`

**Primary hook** - Syncs all application data collections across all domains.

```javascript
import { useDataSynchronization } from "hooks/useDataSync";

const MyComponent = () => {
  // Automatically syncs all collections
  useDataSynchronization();

  return <div>My Component</div>;
};
```

### Domain-Specific Hooks

For components that only need specific domain data:

#### `useCompanySync()`

Syncs company-related collections:

- banks, bankNames, branches
- departments, executives, employees
- locations, permissions, permissionCategories
- userGroups, warehouses

#### `useSalesSync()`

Syncs sales-related collections:

- dataSources, dealers, plants

#### `useAccountSync()`

Syncs account-related collections:

- expenseAccountNames, expenseCategories

### Example Usage

```javascript
import { useCompanySync, useSalesSync } from "hooks/useDataSync";

// Component that only needs company and sales data
const SalesManagementComponent = () => {
  useCompanySync();
  useSalesSync();

  return <div>Sales Management</div>;
};
```

## Configuration

### Adding New Collections

To add new collections, update the `COLLECTION_SYNC_CONFIG` object in `useDataSync.js`:

```javascript
const COLLECTION_SYNC_CONFIG = {
  // Add to existing domain
  sales: [
    { path: "data/sales/dataSources", action: setDataSources },
    { path: "data/sales/dealers", action: setDealers },
    { path: "data/sales/plants", action: setPlants },
    // Add new collection
    { path: "data/sales/customers", action: setCustomers },
  ],

  // Or create new domain
  products: [
    { path: "data/products/vehicles", action: setVehicles },
    { path: "data/products/models", action: setModels },
  ],
};
```

Then add the corresponding hook calls to the domain-specific hooks.

## Migration Guide

### Before (PrivateRoutes.js)

```javascript
// Scattered useCollectionSync calls
useCollectionSync("data/company/banks", setBanks);
useCollectionSync("data/company/branches", setBranches);
useCollectionSync("data/sales/dealers", setDealers);
// ... 15+ more calls
```

### After (PrivateRoutes.js)

```javascript
import { useDataSynchronization } from "hooks/useDataSync";

// Single organized hook call
useDataSynchronization();
```

## Benefits

1. **Centralized Configuration**: All collection paths and actions in one place
2. **Domain Organization**: Related collections grouped together
3. **Reusability**: Hooks can be used in any component
4. **Performance**: Choose specific domain hooks for lighter components
5. **Maintainability**: Easy to add/remove collections
6. **Type Safety**: Configuration object provides clear structure
7. **Documentation**: Self-documenting code with clear naming

## Utility Functions

### `getDomainPaths(domain)`

Get all collection paths for a specific domain.

### `getAllSyncPaths()`

Get all configured collection paths across all domains.

These utilities are helpful for debugging, testing, or building development tools.
