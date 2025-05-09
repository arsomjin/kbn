# Firebase Data Schema for KBN Project

This document defines the core data schema for the KBN platform's Firestore database. It's designed to help GitHub Copilot understand the data structure when generating code.

## Multi-Province Migration
The system is being updated to support multiple provinces. All collections now include a `provinceId` field.

## Common Patterns

### Standard Fields
Most documents include these common fields:
- `provinceId`: Province identifier (new required field)
- `created`: Timestamp (number) when record was created
- `inputBy`: User ID who created the record
- `branchCode`: Branch identifier
- `keywords`: Array of lowercase search keywords
- `deleted`: Boolean flag for soft deletes
- `remark`: Optional additional notes

### ID Conventions
- Entity IDs follow pattern `{entity}Id` (e.g., `customerId`, `expenseId`)
- References use the same name (e.g., `customerId` to reference a customer)
- Search optimization fields use suffixes: `_lower`, `_partial`

## Main Collections

### `provinces` (New Collection)
Stores province configuration data.
```typescript
interface Province {
  provinceId: string;
  name: string;
  code: string;
  region: string;
  active: boolean;
  created: number;
  inputBy: string;
}
```

### `changeLogs`
Tracks application version changes.
```typescript
interface ChangeLog {
  version: string;
  releaseDate: number; // Timestamp
  changes: { type: "feature" | "fix" | "improvement"; description: string; }[];
  created: number;
  inputBy: string;
}
```

### `data/{category}`
Contains reference data organized in subcollections:

#### `data/account/`
- `expenseCategories`: Expense category definitions
- `expenseNames`: Names linked to expense categories
- `expenseAccountNames`: Account name mappings

#### `data/company/`
- `bankNames`: Reference data for banks
- `branches`: Company branch locations
- `employees`: Staff records
- `locations`: Address information
- `permissionCategories`: Permission groupings
- `permissions`: Individual permissions
- `userGroups`: Role-based access control groups

#### `data/products/`
- `partList`: Product parts inventory
- `vehicleList`: Vehicle inventory 

#### `data/sales/`
- `customers`: Customer information with addresses
- `dealers`: Dealer network data
- `referrers`: Customer referral information
- `dataSources`: Marketing data source tracking

### `sections/{businessFunction}`
Operational data organized by business function:

#### `sections/account/`
- `expenses`: Expense records
- `expenseItems`: Line items for expenses
- `incomes`: Income transactions

#### `sections/sales/`
- `bookings`: Product reservations
- `bookItems`: Line items for bookings
- `vehicles`: Vehicle sales records
- `parts`: Parts sales records

#### `sections/services/`
- `serviceOrders`: Service requests
- `serviceItems`: Service order line items
- `serviceClose`: Completed services

#### `sections/stocks/`
- `importParts`: Parts inventory imports
- `importVehicles`: Vehicle inventory imports
- `transfer`: Internal transfers
- `saleOut`: Inventory exits for sales

### `reports/`
Aggregated data for analytics and reporting:
- `reports/sales/vehicles`: Vehicle sales reports
- `reports/sales/parts`: Parts sales reports
- `reports/services/all`: Comprehensive service reports

## Key Model Examples

### Province (New)
```typescript
interface Province {
  provinceId: string;
  name: string;
  code: string;
  region: string;
  active: boolean;
  created: number;
  inputBy: string;
}
```

### Customer
```typescript
interface Customer {
  customerId: string;
  provinceId: string; // New required field
  prefix: string;
  firstName: string;
  firstName_lower: string;
  firstName_partial: string;
  lastName: string;
  lastName_lower: string;
  lastName_partial: string;
  phoneNumber: string;
  phoneNumber_lower: string;
  address: {
    address: string;
    amphoe: string;
    tambol: string;
    province: string;
    postcode: string;
  };
  customerNo: string;
  branchCode: string;
  inputBy: string;
  created: number;
  keywords: string[];
  whenToBuy?: string;
  sourceOfData: string[];
}
```

### Vehicle Sale
```typescript
interface VehicleSale {
  saleId: string;
  provinceId: string; // New required field
  saleNo: string;
  date: string;
  customerId: string;
  firstName: string;
  lastName: string;
  branchCode: string;
  items: Array<{
    saleItemId: string;
    productCode: string;
    productName: string;
    qty: number;
    unitPrice: number;
    total: number;
    engineNo?: string[];
    vehicleNo?: string[];
  }>;
  total: number;
  salesPerson: string[];
  created: number;
  createdBy: string;
  status: string;
}
```

### Expense
```typescript
interface Expense {
  expenseId: string;
  provinceId: string; // New required field
  date: string;
  expenseCategory: string;
  expenseType: string;
  items: Array<{
    expenseItemId: string;
    expenseCategoryId: string;
    expenseName: string;
    total: number;
    VAT: string;
  }>;
  total: number;
  billTotal: number;
  branchCode: string;
  inputBy: string;
  created: number;
  status: string;
}
```

## Relationships

- Provinces → All Data: `provinceId` links data to provinces
- Customers → Sales: `customerId` in sales references customers
- Sales → SaleItems: `saleId` in items references sales
- Expenses → ExpenseItems: `expenseId` in items references expenses
- ServiceOrders → ServiceItems: `serviceId` in items references orders
- Branches → Employees: Branch assignments through `branchCode`
- UserGroups → Permissions: Permission assignments through `permCats` object

## Security Rules Pattern

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasPermission(permission) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions[permission] == true;
    }
    
    function hasProvinceAccess(provinceId) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return user.accessibleProvinces[provinceId] == true || user.role == "GENERAL_MANAGER" || user.role == "SUPER_ADMIN";
    }
    
    // Rules that enforce province-level access
    match /data/{category}/{subcollection}/{docId} {
      allow read: if hasPermission('DATA_READ') && hasProvinceAccess(resource.data.provinceId);
      allow write: if hasPermission('DATA_WRITE') && hasProvinceAccess(request.resource.data.provinceId);
    }
  }
}
```

## Notable Conventions
- Timestamps use Unix epoch format (number)
- Multi-word fields use camelCase
- Addresses stored as nested objects
- Search optimization with `_lower` and `_partial` field variants
- Arrays for multiple references (e.g., `salesPerson`, `sourceOfData`)
- Transaction status tracking via `status` field
- All operational data now requires a `provinceId` field

## Query Pattern Examples

### Multi-Province Query
```typescript
// Get customers for a specific province and branch
const getCustomers = async (provinceId: string, branchCode: string): Promise<Customer[]> => {
  const customersRef = collection(db, "data", "sales", "customers");
  const q = query(
    customersRef,
    where("provinceId", "==", provinceId),
    where("branchCode", "==", branchCode),
    where("deleted", "==", false),
    orderBy("created", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  } as Customer));
};
```

### Create Document with Province
```typescript
// Create a new customer with province ID
const createCustomer = async (customerData: Partial<Customer>, provinceId: string): Promise<string> => {
  const customersRef = collection(db, "data", "sales", "customers");
  const newCustomerRef = doc(customersRef);
  
  const firstName_lower = customerData.firstName?.toLowerCase();
  const lastName_lower = customerData.lastName?.toLowerCase();
  
  await setDoc(newCustomerRef, {
    ...customerData,
    customerId: newCustomerRef.id,
    provinceId: provinceId,
    firstName_lower,
    firstName_partial: createPartialMatches(firstName_lower),
    lastName_lower,
    lastName_partial: createPartialMatches(lastName_lower),
    created: Date.now(),
    inputBy: auth.currentUser?.uid,
    deleted: false
  });
  
  return newCustomerRef.id;
};
```

### Update Document Preserving Province
```typescript
// Update a customer while preserving province ID
const updateCustomer = async (
  customerId: string, 
  customerData: Partial<Customer>, 
  provinceId: string
): Promise<void> => {
  // First verify province access
  const docRef = doc(db, "data", "sales", "customers", customerId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("Customer not found");
  }
  
  // Verify province match for security
  if (docSnap.data().provinceId !== provinceId) {
    throw new Error("Province mismatch - unauthorized");
  }
  
  // Prepare update data preserving provinceId
  const updateData = {
    ...customerData,
    updated: Date.now(),
    // Province ID should not change
    provinceId: docSnap.data().provinceId
  };
  
  await updateDoc(docRef, updateData);
};
```
