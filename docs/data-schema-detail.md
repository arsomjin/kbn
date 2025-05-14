# 📊 Firestore Data Schema

This document outlines the comprehensive Firestore data structure for the KBN platform, including collections, document schemas, and query patterns.

## Overview

The KBN platform uses a hierarchical data structure in Firestore, organized by business functions and reference data. All operational data must now include a `provinceId` field to support the multi-province architecture.

## Main Collections

### 1. `users`

Stores user accounts and profiles.

```typescript
interface User {
  auth: {
    uid: string;               // Firebase Authentication UID
    created: number;           // Timestamp of creation
    displayName: string;       // User display name
    email: string;             // User email
    emailVerified?: boolean;   // Email verified flag
    firstName?: string;        // First name
    lastName?: string;         // Last name
    isAnonymous?: boolean;     // Anonymous user flag
    lastLogin?: number;        // Last login timestamp
    password?: string;         // (if stored, not recommended)
    phoneNumber?: string | null; // Optional phone number
    photoURL?: string;         // Profile photo URL
  };
  branch?: string;            // Branch code (may be 'branch' or 'branchCode')
  department?: string;        // Department code
  description?: string;       // Description
  device?: Record<string, any>; // Device info
  group?: string;             // User group
  oldBranch?: string;         // Previous branch code
  status: string;             // User status (may be in Thai or English)
  // Add any additional fields as needed from metadata
}
```

### 2. `provinces`

Stores province configuration and metadata (new in TypeScript migration).

```typescript
interface Province {
  provinceId: string;        // Unique province identifier
  name: string;              // Province name
  nameEn: string;            // Province name in English
  code: string;              // Province code
  region: string;            // Geographical region
  location: {                // Geographic coordinates
    latitude: number;
    longitude: number;
  };
  branchCodes: string[];     // List of branches in this province
  settings: {                // Province-specific settings
    taxRate?: number;
    currency?: string;
    timeZone?: string;
    workingDays?: string[];
    workingHours?: {
      start: string;
      end: string;
    };
  };
  contact: {                 // Contact information
    address: string;
    phone: string;
    email: string;
  };
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  status: "active" | "inactive";
  deletable: boolean;        // Whether province can be deleted
  deleted: boolean;          // Soft delete flag
}
```

### 3. `data/{category}`

Reference data organized in subcollections by category.

#### 3.1 `data/account/expense-categories`

```typescript
interface ExpenseCategory {
  categoryId: string;       // Unique identifier
  provinceId: string;       // Province identifier
  name: string;             // Category name
  nameEn: string;           // Category name in English
  code?: string;            // Optional category code
  description?: string;     // Optional description
  parentCategoryId?: string;// Optional parent category
  order?: number;           // Display order
  created: number;          // Creation timestamp
  updated?: number;         // Last update timestamp
  inputBy: string;          // User who created the record
  branchCode?: string;      // Optional branch restriction
  keywords: string[];       // Search keywords
  deleted: boolean;         // Soft delete flag
}
```

#### 3.2 `data/company/branches`

```typescript
interface Branch {
  branchCode: string;       // Unique branch code
  provinceId: string;       // Province identifier
  name: string;             // Branch name
  nameEn: string;           // Branch name in English
  address: {                // Branch address
    address: string;
    moo?: string;
    village?: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {                // Contact information
    tel?: string;
    fax?: string;
    email?: string;
    website?: string;
  };
  manager?: string;         // Branch manager user ID
  created: number;          // Creation timestamp
  updated?: number;         // Last update timestamp
  inputBy: string;          // User who created the record
  keywords: string[];       // Search keywords
  deleted: boolean;         // Soft delete flag
}
```

#### 3.3 `data/company/employees`

```typescript
interface Employee {
  employeeId: string;        // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  userId?: string;           // Optional linked user ID
  prefix?: string;           // Name prefix
  firstName: string;         // First name
  lastName: string;          // Last name
  nickname?: string;         // Nickname
  position: string;          // Job position
  department: string;        // Department
  employmentType: "full-time" | "part-time" | "contractor";
  status: "active" | "inactive" | "on-leave";
  hireDate: number;          // Hire date timestamp
  endDate?: number;          // End date timestamp, if applicable
  contact: {                 // Contact information
    phoneNumber: string;
    email?: string;
    emergencyContact?: string;
  };
  address?: {                // Optional address
    address: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
  };
  identificationNumber?: string; // Government ID
  bankAccount?: {            // Bank account information
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
}
```

#### 3.4 `data/sales/customers`

```typescript
interface Customer {
  customerId: string;        // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  prefix?: string;           // Name prefix
  firstName: string;         // First name
  firstName_lower?: string;  // Lowercase for search
  firstName_partial?: string;// Partial match for search
  lastName: string;          // Last name
  lastName_lower?: string;   // Lowercase for search
  lastName_partial?: string; // Partial match for search
  phoneNumber: string;       // Phone number
  phoneNumber_lower?: string;// Lowercase for search
  email?: string;            // Optional email
  address?: {                // Optional address
    address: string;
    moo?: string;
    village?: string;
    province?: string;
    amphoe?: string;
    tambol?: string;
    postcode?: string;
  };
  source?: string;           // Customer acquisition source
  notes?: string;            // Additional notes
  customerType?: string;     // Customer segment/type
  referredBy?: string;       // Referrer ID
  tags?: string[];           // Custom tags
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
  remark?: string;           // Additional remarks
}
```

### 4. `sections/{businessFunction}`

Operational data organized by business function.

#### 4.1 `sections/sales/bookings`

```typescript
interface Booking {
  bookingId: string;         // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  customerId: string;        // Customer ID
  customerName: string;      // Customer name (denormalized)
  customerPhone: string;     // Customer phone (denormalized)
  bookingDate: number;       // Booking timestamp
  serviceDate: number;       // Scheduled service date
  serviceItems: Array<{      // Service items
    serviceId: string;
    serviceName: string;
    quantity: number;
    price: number;
    discount?: number;
    notes?: string;
  }>;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  totalAmount: number;       // Total booking amount
  deposit?: number;          // Optional deposit amount
  paidAmount?: number;       // Amount paid
  paymentStatus: "unpaid" | "partially-paid" | "paid";
  paymentMethod?: string;    // Payment method
  assignedTo?: string;       // Assigned employee ID
  notes?: string;            // Additional notes
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
}
```

#### 4.2 `sections/account/expenses`

```typescript
interface Expense {
  expenseId: string;         // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  categoryId: string;        // Expense category ID
  categoryName: string;      // Category name (denormalized)
  date: number;              // Expense date timestamp
  amount: number;            // Expense amount
  description: string;       // Expense description
  paymentMethod: string;     // Payment method
  reference?: string;        // Reference number or ID
  attachments?: string[];    // Attachment file URLs
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;       // User ID who approved
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
}
```

#### 4.3 `sections/services/serviceOrders`

```typescript
interface ServiceOrder {
  serviceOrderId: string;    // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  bookingId?: string;        // Optional booking reference
  customerId: string;        // Customer ID
  customerName: string;      // Customer name (denormalized)
  vehicleInfo: {             // Vehicle information
    make: string;
    model: string;
    year?: number;
    licensePlate: string;
    color?: string;
    vin?: string;
  };
  serviceDate: number;       // Service date timestamp
  completionDate?: number;   // Completion timestamp
  serviceItems: Array<{      // Service items
    serviceId: string;
    serviceName: string;
    quantity: number;
    price: number;
    discount?: number;
    technician?: string;
    status: "pending" | "in-progress" | "completed";
    notes?: string;
  }>;
  partsUsed: Array<{         // Parts used
    partId: string;
    partName: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  laborCharges: Array<{      // Labor charges
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
  }>;
  status: "pending" | "in-progress" | "completed" | "delivered" | "cancelled";
  totalAmount: number;       // Total order amount
  paymentStatus: "unpaid" | "partially-paid" | "paid";
  payments: Array<{          // Payment records
    date: number;
    amount: number;
    method: string;
    reference?: string;
  }>;
  assignedTechnicians: string[]; // Assigned technician IDs
  notes?: string;            // Additional notes
  customerSignature?: string;// URL to signature image
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
}
```

#### 4.4 `sections/stocks/inventory`

```typescript
interface InventoryItem {
  itemId: string;            // Unique identifier
  provinceId: string;        // Province identifier
  branchCode: string;        // Branch code
  sku: string;               // Stock keeping unit
  name: string;              // Item name
  description?: string;      // Item description
  category: string;          // Item category
  supplier?: string;         // Supplier ID
  cost: number;              // Cost price
  price: number;             // Selling price
  quantity: number;          // Current quantity
  minimumStock: number;      // Reorder threshold
  location?: string;         // Storage location
  unit: string;              // Unit of measure
  barcode?: string;          // Barcode
  images?: string[];         // Image URLs
  attributes?: Record<string, any>; // Custom attributes
  lastRestockDate?: number;  // Last restock timestamp
  created: number;           // Creation timestamp
  updated?: number;          // Last update timestamp
  inputBy: string;           // User who created the record
  keywords: string[];        // Search keywords
  deleted: boolean;          // Soft delete flag
}
```

### 5. `messages`

Stores notification and system messages.

```typescript
interface Message {
  messageId: string;         // Unique identifier
  userId: string;            // Target user ID
  provinceId?: string;       // Optional province context
  branchCode?: string;       // Optional branch context
  type: "notification" | "alert" | "system" | "chat";
  title: string;             // Message title
  content: string;           // Message content
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;             // Read status
  readAt?: number;           // Read timestamp
  actions?: Array<{          // Optional actions
    label: string;
    url?: string;
    action?: string;
  }>;
  expiresAt?: number;        // Expiration timestamp
  created: number;           // Creation timestamp
  sender?: string;           // Sender ID
  parentMessageId?: string;  // For threaded messages
  metadata?: Record<string, any>; // Additional metadata
  deleted: boolean;          // Soft delete flag
}
```

### 6. `reports`

Stores analytics and reporting data.

```typescript
interface Report {
  reportId: string;          // Unique identifier
  provinceId: string;        // Province identifier
  branchCode?: string;       // Optional branch filter
  type: string;              // Report type
  title: string;             // Report title
  dateRange: {               // Date range
    start: number;
    end: number;
  };
  parameters: Record<string, any>; // Report parameters
  generatedBy: string;       // User ID who generated
  results: Record<string, any>; // Report results
  format: "json" | "csv" | "pdf";
  url?: string;              // Optional download URL
  scheduleId?: string;       // Optional schedule reference
  created: number;           // Creation timestamp
  status: "generating" | "completed" | "failed";
  error?: string;            // Error message if failed
  deleted: boolean;          // Soft delete flag
}
```

### 7. `changeLogs`

Stores application version changes history.

```typescript
interface ChangeLog {
  version: string;           // Version number
  releaseDate: number;       // Release timestamp
  changes: Array<{           // Changes list
    type: "feature" | "bugfix" | "improvement" | "security";
    description: string;
    details?: string;
    affectedModules?: string[];
  }>;
  requiredAction?: boolean;  // Whether user action is required
  actionDescription?: string;// Description of required action
  created: number;           // Creation timestamp
  createdBy: string;         // User who created the record
  deleted: boolean;          // Soft delete flag
}
```

## Common Query Patterns

### Multi-Province Queries

All data queries must include province filtering:

```typescript
// Fetch customers for a specific province
const getCustomersByProvince = async (provinceId: string): Promise<Customer[]> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    const customersRef = collection(db, "data", "sales", "customers");
    const customersQuery = query(
      customersRef,
      where("provinceId", "==", provinceId),
      where("deleted", "==", false),
      orderBy("created", "desc")
    );
    
    const querySnapshot = await getDocs(customersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};

// Fetch customers for a specific branch within a province
const getCustomersByBranch = async (provinceId: string, branchCode: string): Promise<Customer[]> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    const customersRef = collection(db, "data", "sales", "customers");
    const customersQuery = query(
      customersRef,
      where("provinceId", "==", provinceId),
      where("branchCode", "==", branchCode),
      where("deleted", "==", false),
      orderBy("created", "desc")
    );
    
    const querySnapshot = await getDocs(customersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};
```

### Creating Documents with Province ID

All write operations must include the province ID:

```typescript
// Create a new customer with province ID
const createCustomer = async (customerData: Omit<Customer, "customerId" | "created" | "keywords" | "deleted">, provinceId: string): Promise<string> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.CREATE_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    // Generate lowercase and partial match fields for search
    const firstName_lower = customerData.firstName.toLowerCase();
    const lastName_lower = customerData.lastName.toLowerCase();
    const phoneNumber_lower = customerData.phoneNumber.toLowerCase();
    
    // Generate keywords for search
    const keywords = [
      firstName_lower,
      lastName_lower,
      phoneNumber_lower,
      `${firstName_lower} ${lastName_lower}`,
      customerData.branchCode
    ].filter(Boolean);
    
    // Add customer document with required fields
    const docRef = await addDoc(collection(db, "data", "sales", "customers"), {
      ...customerData,
      firstName_lower,
      lastName_lower,
      phoneNumber_lower,
      provinceId,
      created: Date.now(),
      inputBy: auth.currentUser?.uid,
      keywords,
      deleted: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
};
```

### Updating Documents

Update operations with province validation:

```typescript
// Update customer with province validation
const updateCustomer = async (customerId: string, customerData: Partial<Customer>, provinceId: string): Promise<void> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.EDIT_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    // Get customer reference
    const customerRef = doc(db, "data", "sales", "customers", customerId);
    
    // Get current document to validate province
    const customerSnap = await getDoc(customerRef);
    
    if (!customerSnap.exists()) {
      throw new Error("Customer not found");
    }
    
    // Validate province match for security
    if (customerSnap.data().provinceId !== provinceId) {
      throw new Error("Province mismatch");
    }
    
    // Update searchable fields if changed
    const updates: Record<string, any> = {
      ...customerData,
      updated: Date.now()
    };
    
    if (customerData.firstName) {
      updates.firstName_lower = customerData.firstName.toLowerCase();
    }
    
    if (customerData.lastName) {
      updates.lastName_lower = customerData.lastName.toLowerCase();
    }
    
    if (customerData.phoneNumber) {
      updates.phoneNumber_lower = customerData.phoneNumber.toLowerCase();
    }
    
    // Generate new keywords if name or phone changed
    if (customerData.firstName || customerData.lastName || customerData.phoneNumber) {
      const currentData = customerSnap.data();
      const firstName = customerData.firstName || currentData.firstName;
      const lastName = customerData.lastName || currentData.lastName;
      const phoneNumber = customerData.phoneNumber || currentData.phoneNumber;
      
      updates.keywords = [
        firstName.toLowerCase(),
        lastName.toLowerCase(),
        phoneNumber.toLowerCase(),
        `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
        currentData.branchCode
      ].filter(Boolean);
    }
    
    // Update document
    await updateDoc(customerRef, updates);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error("Failed to update customer");
  }
};
```

### Soft Delete Pattern

Use soft deletes for data retention:

```typescript
// Soft delete a customer
const deleteCustomer = async (customerId: string, provinceId: string): Promise<void> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.EDIT_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    // Get customer reference
    const customerRef = doc(db, "data", "sales", "customers", customerId);
    
    // Get current document to validate province
    const customerSnap = await getDoc(customerRef);
    
    if (!customerSnap.exists()) {
      throw new Error("Customer not found");
    }
    
    // Validate province match for security
    if (customerSnap.data().provinceId !== provinceId) {
      throw new Error("Province mismatch");
    }
    
    // Soft delete by setting 'deleted' flag
    await updateDoc(customerRef, {
      deleted: true,
      updated: Date.now()
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
};
```

### Batch Operations

Use batched writes for consistency:

```typescript
// Update multiple customers' status
const updateCustomerStatus = async (customerIds: string[], status: string, provinceId: string): Promise<void> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.EDIT_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    const batch = writeBatch(db);
    const timestamp = Date.now();
    
    // First validate all customers belong to the correct province
    const validationPromises = customerIds.map(async (id) => {
      const customerRef = doc(db, "data", "sales", "customers", id);
      const customerSnap = await getDoc(customerRef);
      
      if (!customerSnap.exists()) {
        throw new Error(`Customer ${id} not found`);
      }
      
      if (customerSnap.data().provinceId !== provinceId) {
        throw new Error(`Customer ${id} province mismatch`);
      }
      
      return { ref: customerRef, exists: true };
    });
    
    const validatedRefs = await Promise.all(validationPromises);
    
    // Update all validated customers
    validatedRefs.forEach(({ ref }) => {
      batch.update(ref, {
        status,
        updated: timestamp
      });
    });
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error("Error updating customer status:", error);
    throw new Error("Failed to update customer status");
  }
};
```

### Transactions

Use transactions for complex operations:

```typescript
// Transfer inventory between branches within the same province
const transferInventory = async (
  itemId: string,
  sourceBranch: string,
  targetBranch: string,
  quantity: number,
  provinceId: string
): Promise<void> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.EDIT_INVENTORY) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    await runTransaction(db, async (transaction) => {
      // Get source inventory document
      const sourceRef = doc(db, "sections", "stocks", "inventory", `${sourceBranch}-${itemId}`);
      const sourceDoc = await transaction.get(sourceRef);
      
      if (!sourceDoc.exists()) {
        throw new Error("Source inventory item not found");
      }
      
      // Validate province match
      if (sourceDoc.data().provinceId !== provinceId) {
        throw new Error("Source inventory province mismatch");
      }
      
      // Check if source has enough quantity
      const sourceData = sourceDoc.data();
      if (sourceData.quantity < quantity) {
        throw new Error("Not enough inventory in source branch");
      }
      
      // Get target inventory document
      const targetRef = doc(db, "sections", "stocks", "inventory", `${targetBranch}-${itemId}`);
      const targetDoc = await transaction.get(targetRef);
      
      // Update source quantity
      transaction.update(sourceRef, {
        quantity: sourceData.quantity - quantity,
        updated: Date.now()
      });
      
      // If target exists, update it; otherwise create it
      if (targetDoc.exists()) {
        // Validate province match
        if (targetDoc.data().provinceId !== provinceId) {
          throw new Error("Target inventory province mismatch");
        }
        
        transaction.update(targetRef, {
          quantity: targetDoc.data().quantity + quantity,
          updated: Date.now()
        });
      } else {
        // Create new inventory in target branch with same item data
        const newTargetData = {
          ...sourceData,
          itemId,
          branchCode: targetBranch,
          quantity,
          created: Date.now()
        };
        
        transaction.set(targetRef, newTargetData);
      }
      
      // Create transfer record
      const transferRef = doc(collection(db, "sections", "stocks", "transfers"));
      transaction.set(transferRef, {
        transferId: transferRef.id,
        provinceId,
        itemId,
        sourceBranch,
        targetBranch,
        quantity,
        date: Date.now(),
        status: "completed",
        initiatedBy: auth.currentUser?.uid,
        created: Date.now(),
        deleted: false
      });
    });
  } catch (error) {
    console.error("Error transferring inventory:", error);
    throw new Error("Failed to transfer inventory");
  }
};
```

## Data Migration Helper

Use this utility to migrate existing data to include province IDs:

```typescript
// Migration utility to add province ID to existing collections
const migrateCollectionToMultiProvince = async (
  collectionPath: string,
  defaultProvinceId: string
): Promise<void> => {
  const { hasPermission } = usePermissions();
  
  // Check for admin permission
  if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
    throw new Error("Insufficient permissions for migration");
  }
  
  try {
    // Get reference to collection
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(query(collectionRef, where("provinceId", "==", null)));
    
    console.log(`Found ${snapshot.size} documents to migrate in ${collectionPath}`);
    
    if (snapshot.size === 0) {
      console.log(`No migration needed for ${collectionPath}`);
      return;
    }
    
    // Firebase batched writes have a limit of 500 operations
    const batchSize = 450;
    let batchCount = 0;
    let batch = writeBatch(db);
    let totalMigrated = 0;
    
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, { 
        provinceId: defaultProvinceId,
        updated: Date.now() 
      });
      
      batchCount++;
      totalMigrated++;
      
      if (batchCount >= batchSize) {
        // Commit the batch
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        
        // Start a new batch
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates`);
    }
    
    console.log(`Migration completed: updated ${totalMigrated} documents in ${collectionPath}`);
  } catch (error) {
    console.error(`Error migrating collection ${collectionPath}:`, error);
    throw new Error(`Failed to migrate collection ${collectionPath}`);
  }
};
```

## Search Optimization

Use these patterns for optimized search:

```typescript
// Customer search with multiple criteria
const searchCustomers = async (
  provinceId: string,
  searchTerm: string,
  filters: {
    branchCode?: string;
    startDate?: number;
    endDate?: number;
  } = {}
): Promise<Customer[]> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  try {
    // Start with base query conditions
    let conditions: QueryConstraint[] = [
      where("provinceId", "==", provinceId),
      where("deleted", "==", false),
    ];
    
    // Add optional branch filter
    if (filters.branchCode) {
      conditions.push(where("branchCode", "==", filters.branchCode));
    }
    
    // Add date range filters if provided
    if (filters.startDate) {
      conditions.push(where("created", ">=", filters.startDate));
    }
    
    if (filters.endDate) {
      conditions.push(where("created", "<=", filters.endDate));
    }
    
    // Search term processing
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // If search term exists, search in name and phone fields
    if (searchTermLower) {
      // We'll use array contains for keywords
      conditions.push(
        where("keywords", "array-contains", searchTermLower)
      );
    }
    
    // Create query with all conditions
    const customersRef = collection(db, "data", "sales", "customers");
    const customersQuery = query(
      customersRef,
      ...conditions,
      orderBy("created", "desc"),
      limit(100) // Limit results for performance
    );
    
    const querySnapshot = await getDocs(customersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  } catch (error) {
    console.error("Error searching customers:", error);
    throw new Error("Failed to search customers");
  }
};
```

## Transaction and Denormalization Pattern

Use these patterns for data consistency:

```typescript
// Create a service order with denormalized data
const createServiceOrder = async (
  orderData: Omit<ServiceOrder, "serviceOrderId" | "created" | "inputBy" | "keywords" | "deleted">,
  provinceId: string
): Promise<string> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.CREATE_INVENTORY) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  const serviceOrderId = `SO-${Date.now().toString(36).toUpperCase()}`;
  
  try {
    await runTransaction(db, async (transaction) => {
      // Verify customer exists and belongs to province
      const customerRef = doc(db, "data", "sales", "customers", orderData.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (!customerDoc.exists()) {
        throw new Error("Customer not found");
      }
      
      const customerData = customerDoc.data();
      
      if (customerData.provinceId !== provinceId) {
        throw new Error("Customer province mismatch");
      }
      
      // Denormalize customer data for quick access
      const customerName = `${customerData.firstName} ${customerData.lastName}`;
      
      // Update stock quantities for parts used
      for (const part of orderData.partsUsed) {
        const partRef = doc(db, "sections", "stocks", "inventory", part.partId);
        const partDoc = await transaction.get(partRef);
        
        if (!partDoc.exists()) {
          throw new Error(`Part ${part.partId} not found`);
        }
        
        if (partDoc.data().provinceId !== provinceId) {
          throw new Error(`Part ${part.partId} province mismatch`);
        }
        
        const newQuantity = partDoc.data().quantity - part.quantity;
        
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for part ${part.partName}`);
        }
        
        transaction.update(partRef, { 
          quantity: newQuantity,
          updated: Date.now()
        });
      }
      
      // Create service order
      const orderRef = doc(db, "sections", "services", "serviceOrders", serviceOrderId);
      
      // Generate keywords for search
      const keywords = [
        customerName.toLowerCase(),
        orderData.vehicleInfo.licensePlate.toLowerCase(),
        orderData.vehicleInfo.make.toLowerCase(),
        orderData.vehicleInfo.model.toLowerCase(),
        serviceOrderId.toLowerCase(),
        orderData.branchCode.toLowerCase(),
        ...orderData.serviceItems.map(item => item.serviceName.toLowerCase())
      ].filter(Boolean);
      
      transaction.set(orderRef, {
        ...orderData,
        serviceOrderId,
        customerName,
        provinceId,
        created: Date.now(),
        inputBy: auth.currentUser?.uid,
        keywords,
        deleted: false
      });
      
      // If this order is from a booking, update the booking status
      if (orderData.bookingId) {
        const bookingRef = doc(db, "sections", "sales", "bookings", orderData.bookingId);
        const bookingDoc = await transaction.get(bookingRef);
        
        if (bookingDoc.exists() && bookingDoc.data().provinceId === provinceId) {
          transaction.update(bookingRef, {
            status: "in-progress",
            updated: Date.now()
          });
        }
      }
    });
    
    return serviceOrderId;
  } catch (error) {
    console.error("Error creating service order:", error);
    throw new Error("Failed to create service order");
  }
};
```
