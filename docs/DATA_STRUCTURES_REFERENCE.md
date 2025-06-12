# 📊 KBN Data Structures Reference

**Purpose**: Comprehensive reference for all data structures used in the KBN system. This document must be updated whenever new data structures are introduced or existing ones are modified.

**Critical**: Redux state management, RBAC system, and component props depend on these exact structures.

## 🚨 **RBAC STRUCTURE PRIORITY ORDER**

**IMPORTANT**: The system supports three RBAC structures for compatibility. Use this priority order:

1. **PRIMARY**: `user.access.*` (Clean Slate - Version 2.0) - **USE THIS FOR NEW CODE**
2. **FALLBACK**: `user.userRBAC.*` (Enhanced RBAC - Deprecated but supported)
3. **LEGACY**: `user.accessLevel`, `user.allowedProvinces`, etc. (Legacy fields)

**All components should check structures in this order**:

```javascript
const authority =
  user.access?.authority ||
  user.userRBAC?.authority ||
  user.accessLevel ||
  "STAFF";
const provinces =
  user.access?.geographic?.allowedProvinces ||
  user.userRBAC?.geographic?.allowedProvinces ||
  user.allowedProvinces ||
  [];
```

---

## 🔐 Authentication & User Data

### **User Object (Firebase Auth + Enhanced)**

```javascript
// Core user structure used throughout the system
const user = {
  // Firebase Auth fields
  uid: "string",
  email: "string",
  displayName: "string",
  photoURL: "string",

  // Clean Slate RBAC Structure (PRIMARY - Version 2.0)
  access: {
    authority: "ADMIN" | "MANAGER" | "LEAD" | "STAFF", // Clean Slate authority
    geographic: {
      scope: "ALL" | "PROVINCE" | "BRANCH",
      allowedProvinces: ["string"], // Province IDs
      allowedBranches: ["string"], // Branch codes
      homeProvince: "string", // Default province
      homeBranch: "string", // Default branch
    },
    permissions: {
      departments: {
        accounting: { view: boolean, edit: boolean, approve: boolean },
        sales: { view: boolean, edit: boolean, approve: boolean },
        service: { view: boolean, edit: boolean, approve: boolean },
        inventory: { view: boolean, edit: boolean, approve: boolean },
        hr: { view: boolean, edit: boolean, approve: boolean },
      },
      features: {
        reports: { view: boolean, export: boolean },
        admin: { userManagement: boolean, systemConfig: boolean },
        developer: { tools: boolean, migration: boolean },
      },
    },
    departments: ["string"], // User's assigned departments
    createdAt: "timestamp",
    version: "2.0",
  },

  // Legacy fields (maintaining backward compatibility)
  branch: "string", // Branch code
  province: "string", // Province ID
  isDev: boolean, // Developer access
  isActive: boolean, // Account status

  // Metadata
  createdAt: "timestamp",
  updatedAt: "timestamp",
  lastLogin: "timestamp",
};
```

### **Redux Auth State**

```javascript
// src/redux/reducers/auth.js
const authState = {
  user: User | null, // Current authenticated user
  isAuthenticated: boolean, // Authentication status
  loading: boolean, // Auth loading state
  error: string | null, // Auth error message

  // Session management
  sessionExpiry: timestamp,
  rememberMe: boolean,

  // UI state
  showLoginModal: boolean,
  redirectAfterLogin: string | null,
};
```

---

## 🌍 Geographic Data Structures

### **Province Object**

```javascript
const province = {
  id: "string", // Unique identifier (e.g., "NMA", "NSN")
  name: "string", // Thai name (e.g., "นครราชสีมา")
  nameEn: "string", // English name (e.g., "Nakhon Ratchasima")
  code: "string", // Short code
  region: "string", // Region classification
  isActive: boolean, // Status
  branches: ["string"], // Array of branch codes in this province

  // Business data
  salesTarget: number,
  population: number,
  marketSize: number,

  // System metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  migrationPhase: number, // For multi-province rollout
};
```

### **Branch Object**

```javascript
const branch = {
  code: "string", // Unique identifier (e.g., "0450", "NSN001")
  name: "string", // Thai name (e.g., "สาขาตาคลี")
  nameEn: "string", // English name
  provinceId: "string", // Parent province ID

  // Location data
  address: "string",
  district: "string",
  amphoe: "string",
  zipcode: "string",
  coordinates: {
    lat: number,
    lng: number,
  },

  // Business data
  type: "MAIN" | "SUB" | "SERVICE_CENTER",
  manager: "string", // User UID
  staff: ["string"], // Array of staff UIDs
  departments: ["string"], // Available departments

  // Operational data
  isActive: boolean,
  openingHours: {
    monday: { open: "string", close: "string" },
    // ... other days
  },

  // System metadata
  createdAt: timestamp,
  updatedAt: timestamp,
};
```

### **Redux Geographic State**

```javascript
// src/redux/reducers/provinces.js
const provincesState = {
  provinces: {
    [provinceId]: Province, // Normalized by province ID
  },
  branches: {
    [branchCode]: Branch, // Normalized by branch code
  },

  // Loading states
  loading: {
    provinces: boolean,
    branches: boolean,
  },

  // Error states
  error: {
    provinces: string | null,
    branches: string | null,
  },

  // UI state
  selectedProvince: string | null,
  selectedBranch: string | null,

  // Cache management
  lastFetched: {
    provinces: timestamp,
    branches: timestamp,
  },
};
```

---

## 🔑 RBAC Data Structures

### **Permission Object**

```javascript
const permission = {
  id: "string", // e.g., "accounting.view", "sales.approve"
  department: "string", // Department name
  action: "view" | "edit" | "approve" | "delete" | "create",
  description: "string", // Human-readable description
  requiredAuthority: "ADMIN" | "MANAGER" | "LEAD" | "STAFF",
  requiredScope: "ALL" | "PROVINCE" | "BRANCH" | null,

  // Conditions
  conditions: {
    requiresApproval: boolean,
    timeRestrictions: {
      startTime: "string", // e.g., "09:00"
      endTime: "string", // e.g., "17:00"
    },
    dataRestrictions: {
      ownDataOnly: boolean,
      branchDataOnly: boolean,
      provinceDataOnly: boolean,
    },
  },
};
```

### **Redux RBAC State**

```javascript
// src/redux/reducers/rbac.js
const rbacState = {
  // Permission system
  permissions: {
    [permissionId]: Permission,
  },
  userPermissions: ["string"], // User's current permissions

  // Role system
  roles: {
    [roleName]: RoleConfig,
  },

  // Geographic access (computed)
  accessibleProvinces: ["string"],
  accessibleBranches: ["string"],

  // Permission checking cache
  permissionCache: {
    [cacheKey]: boolean, // Computed permission results
  },

  // Loading and error states
  loading: boolean,
  error: string | null,

  // System state
  rbacInitialized: boolean,
  lastPermissionCheck: timestamp,
};
```

---

## 💼 Business Entity Data Structures

### **Vehicle Data**

```javascript
const vehicle = {
  id: "string", // Unique vehicle ID
  vin: "string", // Vehicle Identification Number

  // Basic information
  brand: "string", // e.g., "Kubota"
  model: "string", // e.g., "L3408"
  year: number,
  color: "string",

  // Business data
  cost: number, // Purchase cost
  price: number, // Selling price
  status: "IN_STOCK" | "SOLD" | "RESERVED" | "MAINTENANCE",

  // Location tracking (REQUIRED for RBAC filtering)
  provinceId: "string", // REQUIRED for RBAC filtering
  branchCode: "string", // REQUIRED for RBAC filtering
  warehouseLocation: "string",

  // Sales information
  customerId: "string" | null,
  salesPersonId: "string" | null,
  saleDate: timestamp | null,
  salePrice: number | null,

  // System metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "string", // User UID
  lastModifiedBy: "string", // User UID
};
```

### **Customer Data**

```javascript
const customer = {
  id: "string",

  // Personal information
  firstName: "string",
  lastName: "string",
  email: "string",
  phone: "string",
  idCard: "string", // Thai ID card number

  // Address
  address: "string",
  district: "string",
  amphoe: "string",
  province: "string",
  zipcode: "string",

  // Business information
  customerType: "INDIVIDUAL" | "BUSINESS",
  companyName: "string" | null,
  taxId: "string" | null,

  // KBN relationship (REQUIRED for RBAC filtering)
  homeProvince: "string", // REQUIRED for RBAC filtering
  homeBranch: "string", // REQUIRED for RBAC filtering
  assignedSalesPerson: "string",

  // System metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "string",
  isActive: boolean,
};
```

---

## 🏗️ Component Prop Standards

### **Geographic Selectors**

```javascript
// ProvinceSelector props
const provinceSelectorProps = {
  value: "string" | null,       // Selected province ID
  onChange: (value) => void,    // Change handler
  respectRBAC: boolean,         // Apply RBAC filtering (default: true)
  fetchOnMount: boolean,        // Auto-fetch data (default: true)
  includeInactive: boolean,     // Include inactive provinces (default: false)
  placeholder: "string",        // Placeholder text
  disabled: boolean,            // Disabled state
  size: "small" | "middle" | "large"
}

// GeographicBranchSelector props
const branchSelectorProps = {
  province: "string" | null,    // Province to filter by
  value: "string" | null,       // Selected branch code
  onChange: (value) => void,    // Change handler
  respectRBAC: boolean,         // Apply RBAC filtering (default: true)
  showBranchCode: boolean,      // Show code with name (default: false)
  disabled: boolean,            // Disabled state
  placeholder: "string",        // Placeholder text
  size: "small" | "middle" | "large"
}
```

### **Permission Components**

```javascript
// PermissionGate props
const permissionGateProps = {
  permission: "string", // Required permission (e.g., "sales.view")
  role: "string" | null, // Required role (optional)
  province: "string" | null, // Required province access
  branch: "string" | null, // Required branch access
  fallback: ReactNode | null, // Component to show if no permission
  children: ReactNode, // Component to show if has permission
};
```

---

## 🔄 Redux State Shape (Complete)

### **Root State**

```javascript
const rootState = {
  // Authentication
  auth: AuthState,

  // Geographic data
  provinces: ProvincesState,

  // RBAC system
  rbac: RBACState,

  // Business entities
  vehicles: {
    items: { [id]: Vehicle },
    loading: boolean,
    error: string | null,
    filters: Object,
    pagination: {
      current: number,
      pageSize: number,
      total: number,
    },
  },

  customers: {
    items: { [id]: Customer },
    loading: boolean,
    error: string | null,
  },

  // UI state
  ui: {
    sidebarCollapsed: boolean,
    theme: "light" | "dark",
    language: "th" | "en",
    selectedProvince: string | null,
    selectedBranch: string | null,

    // Modal states
    modals: {
      userManagement: boolean,
      vehicleDetails: boolean,
      // ... other modals
    },

    // Loading states
    globalLoading: boolean,
    pageLoading: boolean,
  },
};
```

---

## ⚠️ Critical Notes

### **Redux State Mutations**

```javascript
// ❌ NEVER mutate state directly
state.user.role = newRole;
state.vehicles.push(newVehicle);

// ✅ ALWAYS use immutable updates
return {
  ...state,
  user: {
    ...state.user,
    role: newRole,
  },
};
```

### **RBAC Field Requirements**

**CRITICAL**: All business entities MUST include:

- `provinceId`: For province-level filtering
- `branchCode`: For branch-level filtering
- `createdBy`: For ownership-based access
- `updatedAt`: For audit trails

### **Data Consistency Rules**

1. **Province → Branch Relationship**: Branch `provinceId` must match valid province `id`
2. **User → Geographic Access**: User's `allowedProvinces`/`allowedBranches` must exist in system
3. **Business Entity → Geography**: All business entities must have valid `provinceId` and `branchCode`
4. **Permission → Role Mapping**: User permissions must align with role configuration

---

## 📋 Update Checklist

When adding new data structures:

- [ ] Document the complete structure with all fields
- [ ] Define validation schemas
- [ ] Update Redux state shape if needed
- [ ] Document RBAC filtering requirements
- [ ] Add component prop standards if creating new components
- [ ] Update this reference document
- [ ] Test with existing RBAC system

---

**Last Updated**: December 2024  
**Version**: 2.1 (Multi-Province RBAC Integration)  
**Maintainer**: KBN Development Team

**⚠️ IMPORTANT**: This document is the single source of truth for all data structures in the KBN system. Always consult this document before creating new data models or modifying existing ones.
