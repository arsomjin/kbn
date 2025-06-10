# KBN RBAC System Redesign Proposal

## Solving Redundancy and Simplifying Access Control

### 🎯 **PROBLEM ANALYSIS**

The current system has **major redundancy issues**:

#### Current Roles (9+ redundant combinations):

- `SUPER_ADMIN` ← Mix of Authority + Geographic + Department
- `EXECUTIVE` ← Mix of Authority + Geographic
- `PROVINCE_MANAGER` ← Mix of Authority + Geographic
- `BRANCH_MANAGER` ← Mix of Authority + Geographic
- `ACCOUNTING_STAFF` ← Mix of Authority + Department
- `SALES_STAFF` ← Mix of Authority + Department
- `SERVICE_STAFF` ← Mix of Authority + Department
- `INVENTORY_STAFF` ← Mix of Authority + Department
- `BRANCH_STAFF` ← Mix of Authority + Geographic

#### Issues with Current Approach:

1. **Combinatorial Explosion**: 4 Authority × 3 Geographic × 6 Departments = 72 possible combinations!
2. **Redundant Code**: Each role duplicates permission definitions
3. **Hard to Maintain**: Adding new department requires updating multiple roles
4. **Inconsistent Logic**: Same permissions scattered across different role definitions
5. **Poor Scalability**: Adding branches/provinces means more role variants

---

## 🚀 **PROPOSED ORTHOGONAL DESIGN**

### **Core Principle: Separate Concerns**

Instead of mixed roles, use **4 independent dimensions**:

```javascript
// User Authority = Authority Level + Geographic Scope + Department Access + Document Actions
userAccess = {
  authority: "MANAGER", // What level of authority
  geographic: "PROVINCE", // What geographic scope
  departments: ["SALES"], // Which departments
  homeBranch: "NSN001", // Base location
};
```

### **1. Authority Levels (4 levels)**

```javascript
export const AUTHORITY_LEVELS = {
  ADMIN: {
    name: "ผู้ดูแลระบบ",
    actions: ["VIEW", "EDIT", "APPROVE", "MANAGE", "DELETE"],
    canManageUsers: true,
    canManageSystem: true,
    description: "Full system authority",
  },

  MANAGER: {
    name: "ผู้จัดการ",
    actions: ["VIEW", "EDIT", "APPROVE"],
    canManageUsers: true,
    canManageSystem: false,
    description: "Management authority within scope",
  },

  LEAD: {
    name: "หัวหน้าแผนก",
    actions: ["VIEW", "EDIT", "REVIEW"],
    canManageUsers: false,
    canManageSystem: false,
    description: "Team leadership within department",
  },

  STAFF: {
    name: "พนักงาน",
    actions: ["VIEW", "EDIT"],
    canManageUsers: false,
    canManageSystem: false,
    description: "Operational access only",
  },
};
```

### **2. Geographic Scope (3 levels)**

```javascript
export const GEOGRAPHIC_SCOPE = {
  ALL: {
    name: "ทุกจังหวัด",
    access: "all_provinces",
    description: "Access to all provinces and branches",
  },

  PROVINCE: {
    name: "ระดับจังหวัด",
    access: "province_branches",
    description: "Access to all branches within assigned provinces",
  },

  BRANCH: {
    name: "ระดับสาขา",
    access: "specific_branches",
    description: "Access to specific branches only",
  },
};
```

### **3. Department Access (6 departments)**

```javascript
export const DEPARTMENTS = {
  ACCOUNTING: { name: "บัญชีการเงิน", code: "ACC" },
  SALES: { name: "ขายและลูกค้า", code: "SAL" },
  SERVICE: { name: "บริการซ่อม", code: "SVC" },
  INVENTORY: { name: "คลังสินค้า", code: "INV" },
  HR: { name: "ทรัพยากรบุคคล", code: "HR" },
  GENERAL: { name: "ทั่วไป", code: "GEN" },
};
```

### **4. Document Actions (4 actions)**

```javascript
export const DOCUMENT_ACTIONS = {
  VIEW: { name: "ดูข้อมูล", level: 1 },
  EDIT: { name: "แก้ไขข้อมูล", level: 2 },
  APPROVE: { name: "อนุมัติข้อมูล", level: 3 },
  MANAGE: { name: "จัดการระบบ", level: 4 },
};
```

---

## 🔧 **IMPLEMENTATION STRATEGY**

### **Phase 1: New Simplified User Model**

```javascript
// New User Structure
const user = {
  uid: "user123",
  email: "manager@branch.com",

  // NEW: Orthogonal Access Control
  access: {
    authority: "MANAGER", // Single authority level
    geographic: "PROVINCE", // Single geographic scope
    departments: ["SALES", "SERVICE"], // Array of departments

    // Geographic assignments
    assignedProvinces: ["nakhon-sawan"],
    assignedBranches: ["NSN001", "NSN002"],
    homeBranch: "NSN001",

    // Metadata
    effectiveDate: "2024-01-01",
    granttedBy: "admin123",
  },
};
```

### **Phase 2: Dynamic Permission Generation**

```javascript
// Generate permissions dynamically instead of static role definitions
export const generateUserPermissions = (user) => {
  const { authority, geographic, departments } = user.access;

  const authorityLevel = AUTHORITY_LEVELS[authority];
  const geoScope = GEOGRAPHIC_SCOPE[geographic];

  const permissions = [];

  // Generate department.action permissions
  departments.forEach((dept) => {
    authorityLevel.actions.forEach((action) => {
      permissions.push(`${dept.toLowerCase()}.${action.toLowerCase()}`);
    });
  });

  // Add special permissions based on authority
  if (authorityLevel.canManageUsers) {
    permissions.push("users.manage");
  }

  if (authorityLevel.canManageSystem) {
    permissions.push("admin.manage");
  }

  return {
    permissions,
    geographic: {
      scope: geographic,
      provinces: geographic === "ALL" ? null : user.access.assignedProvinces,
      branches: geographic === "BRANCH" ? user.access.assignedBranches : null,
    },
  };
};
```

### **Phase 3: Backward Compatibility**

```javascript
// Map new system to legacy role names for existing code
export const getLegacyRoleName = (user) => {
  const { authority, geographic, departments } = user.access;

  // System admin
  if (authority === "ADMIN" && geographic === "ALL") {
    return "SUPER_ADMIN";
  }

  // Province manager
  if (authority === "MANAGER" && geographic === "PROVINCE") {
    return "PROVINCE_MANAGER";
  }

  // Branch manager
  if (authority === "MANAGER" && geographic === "BRANCH") {
    return "BRANCH_MANAGER";
  }

  // Department staff
  if (authority === "STAFF" && departments.length === 1) {
    return `${departments[0]}_STAFF`;
  }

  // Multi-department or complex roles
  return "CUSTOM_ROLE";
};
```

---

## 📊 **BENEFITS COMPARISON**

| Aspect                    | Current System                       | New Orthogonal System                             |
| ------------------------- | ------------------------------------ | ------------------------------------------------- |
| **Role Definitions**      | 50+ mixed roles                      | 4 authority × 3 geographic = 12 base combinations |
| **Permission Code**       | 500+ lines of duplicated permissions | 100 lines of dynamic generation                   |
| **Adding New Department** | Update 8+ role definitions           | Add 1 department entry                            |
| **Adding New Branch**     | Create new role variants             | Update geographic assignments only                |
| **User Management**       | Complex role selection               | Simple dropdown selections                        |
| **Code Maintenance**      | High complexity                      | Low complexity                                    |
| **Scalability**           | Poor (exponential growth)            | Excellent (linear growth)                         |

---

## 🎯 **MIGRATION PLAN**

### **Step 1: Implement New System (Parallel)**

- Create new orthogonal permission system
- Keep existing system running
- Add translation layer between systems

### **Step 2: Migrate Existing Users**

```javascript
// Migration function
export const migrateUserToNewSystem = (legacyUser) => {
  const authority = determinateAuthority(legacyUser.accessLevel);
  const geographic = determineGeographic(
    legacyUser.allowedProvinces,
    legacyUser.allowedBranches
  );
  const departments = determineDepartments(legacyUser.permissions);

  return {
    ...legacyUser,
    access: {
      authority,
      geographic,
      departments,
      assignedProvinces: legacyUser.allowedProvinces,
      assignedBranches: legacyUser.allowedBranches,
      homeBranch: legacyUser.homeBranch,
    },
  };
};
```

### **Step 3: Update Components**

- Update PermissionGate to use new permission generation
- Update usePermissions hook to support new system
- Update user management interfaces

### **Step 4: Remove Legacy System**

- Remove old role definitions
- Clean up redundant permission code
- Update documentation

---

## 💡 **REAL-WORLD EXAMPLES**

### **Example 1: Provincial Sales Manager**

```javascript
// Old System: Need specific PROVINCE_SALES_MANAGER role
// New System:
{
  authority: "MANAGER",
  geographic: "PROVINCE",
  departments: ["SALES"],
  assignedProvinces: ["nakhon-sawan"]
}
// Generated permissions: sales.view, sales.edit, sales.approve, users.manage
```

### **Example 2: Multi-Department Staff**

```javascript
// Old System: Need SALES_SERVICE_STAFF role (doesn't exist)
// New System:
{
  authority: "STAFF",
  geographic: "BRANCH",
  departments: ["SALES", "SERVICE"],
  assignedBranches: ["NSN001"]
}
// Generated permissions: sales.view, sales.edit, service.view, service.edit
```

### **Example 3: Executive**

```javascript
// Old System: EXECUTIVE role
// New System:
{
  authority: "ADMIN",
  geographic: "ALL",
  departments: ["GENERAL"],
  assignedProvinces: null // All provinces
}
// Generated permissions: *.* (all permissions)
```

---

## 🔧 **IMPLEMENTATION FILES TO CREATE/UPDATE**

### **New Files:**

1. `src/utils/orthogonal-rbac.js` - New permission system
2. `src/utils/rbac-migration.js` - Migration utilities
3. `src/components/UserAccessSelector.js` - New user permission UI

### **Files to Update:**

1. `src/hooks/usePermissions.js` - Add new system support
2. `src/components/PermissionGate.js` - Support new permission generation
3. `src/data/permissions.js` - Add orthogonal definitions
4. User management interfaces

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **Create orthogonal-rbac.js** with new system
2. **Update usePermissions hook** to support both systems
3. **Create migration utility** for existing users
4. **Test with existing components** using translation layer
5. **Gradually migrate user management interfaces**

This design **eliminates redundancy**, **simplifies maintenance**, and **provides better scalability** while maintaining **100% backward compatibility** during migration.

**Result**: From 50+ redundant roles to 4 × 3 × 6 = 72 possible combinations that are **dynamically generated** instead of **manually defined**.
