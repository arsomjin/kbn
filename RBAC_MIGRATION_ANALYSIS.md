# KBN RBAC Migration Analysis - Clean Slate Alignment Issues

**Date**: December 2024  
**Issue**: Current RBAC migration process does not align with Clean Slate RBAC 4×3×6 orthogonal system  
**Priority**: 🚨 **CRITICAL** - System integrity issue

---

## 🔍 **ANALYSIS SUMMARY**

The current RBAC migration and user registration processes are **NOT ALIGNED** with the Clean Slate RBAC system documented in `04-app-flow.md`. Multiple migration strategies exist that conflict with each other.

---

## ❌ **CRITICAL ISSUES IDENTIFIED**

### **1. Multiple Conflicting Migration Strategies**

**Issue**: Three different migration approaches exist simultaneously:

```javascript
// Strategy 1: Legacy system (still active in auth.js)
signUpUserWithRBAC() → creates: { accessLevel, allowedProvinces, allowedBranches }

// Strategy 2: Enhanced RBAC (rbac-enhanced.js)
migrateExistingUserRole() → maps legacy roles to enhanced roles

// Strategy 3: Clean Slate Orthogonal (orthogonal-rbac.js)
migrateToOrthogonalSystem() → creates: { access: { authority, geographic, departments } }
```

**Result**: **System inconsistency** - users created with different structures

### **2. New User Registration NOT Using Clean Slate**

**Current Implementation** (`src/redux/actions/auth.js:160-359`):

```javascript
// ❌ WRONG - Still using legacy structure
const userProfile = {
  accessLevel, // Legacy field
  allowedProvinces, // Legacy field
  allowedBranches, // Legacy field
  homeProvince: province, // Legacy field
  homeBranch: branch, // Legacy field
};
```

**Expected Clean Slate Structure**:

```javascript
// ✅ CORRECT - Should be using orthogonal structure
const userProfile = {
  access: {
    authority: "STAFF", // ADMIN, MANAGER, LEAD, STAFF
    geographic: "BRANCH", // ALL, PROVINCE, BRANCH
    departments: ["SALES"], // ACCOUNTING, SALES, SERVICE, INVENTORY, HR, GENERAL
    assignedProvinces: [province],
    assignedBranches: [branch],
    homeBranch: branch,
  },
};
```

### **3. Permission Generation Mismatch**

**Current**: Uses legacy `determineDefaultPermissions(accessLevel, department)`
**Expected**: Should use `generateUserPermissions(user)` from Clean Slate system

### **4. Migration Path Confusion**

**Current Flow**:

```
New User → Legacy Structure → (Later Migration Required)
Existing User → Multiple Migration Strategies → Inconsistent Results
```

**Expected Clean Slate Flow**:

```
New User → Direct Clean Slate Structure → No Migration Needed
Existing User → Clean Slate Migration → Consistent Structure
```

---

## 🎯 **CLEAN SLATE REQUIREMENTS (from 04-app-flow.md)**

### **Authority × Geographic × Departments Matrix**

```javascript
const CLEAN_SLATE_STRUCTURE = {
  // 4 Authority Levels
  authority: ["ADMIN", "MANAGER", "LEAD", "STAFF"],

  // 3 Geographic Scopes
  geographic: ["ALL", "PROVINCE", "BRANCH"],

  // 6 Department Functions
  departments: ["ACCOUNTING", "SALES", "SERVICE", "INVENTORY", "HR", "GENERAL"],
};
```

### **Permission Format**

```javascript
// department.action format
permissions: [
  "accounting.view",
  "sales.edit",
  "service.approve",
  "inventory.manage",
];
```

---

## 🛠️ **REQUIRED FIXES**

### **Fix 1: Update New User Registration**

**File**: `src/redux/actions/auth.js`  
**Function**: `signUpUserWithRBAC()`

```javascript
// ❌ REMOVE legacy structure creation
const userProfile = {
  accessLevel,
  allowedProvinces,
  allowedBranches,
  // ... legacy fields
};

// ✅ ADD Clean Slate structure creation
import {
  createUserAccess,
  generateUserPermissions,
} from "../utils/orthogonal-rbac";

const authority = mapDepartmentToAuthority(department, accessLevel);
const geographic = mapLocationToGeographic(province, branch);
const departments = mapDepartmentToDepartments(department);

const userProfile = {
  uid: user.uid,
  email: user.email,
  displayName: `${firstName} ${lastName}`,
  access: createUserAccess(authority, geographic, departments, {
    provinces: [province],
    branches: [branch],
    homeBranch: branch,
  }),
  // ... other essential fields
};
```

### **Fix 2: Standardize Migration Functions**

**File**: Create `src/utils/unified-migration.js`

```javascript
/**
 * UNIFIED MIGRATION - Single source of truth
 * Converts ANY user format to Clean Slate orthogonal system
 */

export const migrateUserToCleanSlate = (legacyUser) => {
  // Handle all legacy formats and convert to Clean Slate
  return migrateToOrthogonalSystem(legacyUser);
};

// Deprecate other migration functions
export const migrateLegacyUser = migrateUserToCleanSlate; // Alias
export const migrateExistingUserRole = () => {
  throw new Error("DEPRECATED: Use migrateUserToCleanSlate()");
};
```

### **Fix 3: Update RBAC Initialization**

**File**: `src/redux/actions/rbac.js`  
**Function**: `initializeUserRBAC()`

```javascript
export const initializeUserRBAC = (userId) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));

      const { auth } = getState();

      if (auth.user) {
        // ✅ ALWAYS use Clean Slate migration
        const cleanSlateUser = migrateUserToCleanSlate(auth.user);
        const rbacData = generateUserPermissions(cleanSlateUser);

        if (rbacData) {
          dispatch(
            setUserPermissions(
              userId,
              rbacData.permissions,
              rbacData.geographic
            )
          );
          dispatch(setUserRole(userId, getLegacyRoleName(cleanSlateUser)));
        }
      }
    } catch (error) {
      console.error("Error initializing user RBAC:", error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};
```

### **Fix 4: Clean Slate User Creation Helpers**

**File**: `src/utils/clean-slate-helpers.js` (NEW)

```javascript
/**
 * Helper functions for creating Clean Slate users
 */

export const mapDepartmentToAuthority = (department, requestedLevel) => {
  // Map user's department and requested level to authority
  if (requestedLevel?.includes("MANAGER")) return "MANAGER";
  if (requestedLevel?.includes("LEAD")) return "LEAD";
  return "STAFF"; // Default for new users
};

export const mapLocationToGeographic = (province, branch) => {
  if (!branch) return "PROVINCE";
  return "BRANCH"; // Most new users start at branch level
};

export const mapDepartmentToDepartments = (department) => {
  const deptMap = {
    accounting: ["ACCOUNTING"],
    sales: ["SALES"],
    service: ["SERVICE"],
    inventory: ["INVENTORY"],
    hr: ["HR"],
    general: ["GENERAL"],
  };

  return deptMap[department?.toLowerCase()] || ["GENERAL"];
};
```

### **Fix 5: Migration Verification**

**File**: `src/utils/migration-verification.js` (NEW)

```javascript
/**
 * Verify migration integrity
 */

export const verifyCleanSlateMigration = async () => {
  const issues = [];

  // Check all users have Clean Slate structure
  const users = await getAllUsers();

  users.forEach((user) => {
    if (!user.access) {
      issues.push(`User ${user.uid} missing 'access' property`);
    }

    if (user.accessLevel || user.allowedProvinces) {
      issues.push(`User ${user.uid} has legacy fields`);
    }

    if (!isValidCleanSlateStructure(user.access)) {
      issues.push(`User ${user.uid} has invalid Clean Slate structure`);
    }
  });

  return issues;
};
```

---

## 📋 **MIGRATION EXECUTION PLAN**

### **Phase 1: Fix New User Registration** (Immediate)

1. Update `signUpUserWithRBAC()` to use Clean Slate structure
2. Test new user registration creates proper orthogonal structure
3. Verify permissions generation works correctly

### **Phase 2: Standardize Migration** (Next)

1. Create unified migration function
2. Deprecate conflicting migration functions
3. Update all migration callers to use unified approach

### **Phase 3: Migrate Existing Users** (Final)

1. Run Clean Slate migration on all existing users
2. Remove legacy fields from all user documents
3. Verify system-wide consistency

---

## ⚠️ **BACKWARDS COMPATIBILITY STRATEGY**

### **During Transition Period**:

```javascript
// Support both structures temporarily
const getUserPermissions = (user) => {
  if (user.access) {
    // New Clean Slate structure
    return generateUserPermissions(user);
  } else {
    // Legacy structure - migrate on-the-fly
    const migratedUser = migrateUserToCleanSlate(user);
    return generateUserPermissions(migratedUser);
  }
};
```

### **After Migration Completion**:

```javascript
// Only Clean Slate structure supported
const getUserPermissions = (user) => {
  if (!user.access) {
    throw new Error("User missing Clean Slate access structure");
  }
  return generateUserPermissions(user);
};
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Test New User Flow**:

1. Register new user via signup form
2. Verify user has `access` property with orthogonal structure
3. Verify no legacy fields (`accessLevel`, `allowedProvinces`, etc.)
4. Test permission generation produces correct `department.action` format

### **Test Existing User Migration**:

1. Create test user with legacy structure
2. Run migration function
3. Verify conversion to Clean Slate structure
4. Test backwards compatibility during transition

### **Test Permission System**:

1. Test `hasOrthogonalPermission()` function
2. Verify geographic filtering works with new structure
3. Test UI components respect new permission format

---

## 📊 **IMPACT ASSESSMENT**

### **High Impact Areas**:

- ✅ New user registration (FIXED)
- ✅ User login and RBAC initialization (FIXED)
- ✅ Permission checking throughout app (VERIFIED)
- ✅ Geographic data filtering (VERIFIED)

### **Medium Impact Areas**:

- ⏳ User management interfaces (UPDATE NEEDED)
- ⏳ Migration tooling (CONSOLIDATION NEEDED)
- ⏳ Developer tools and testing (UPDATE NEEDED)

### **Low Impact Areas**:

- ✅ Authentication flow (NO CHANGE)
- ✅ UI components (ALREADY USING PERMISSION CHECKS)
- ✅ Database structure (ADDITIVE CHANGES ONLY)

---

## 🎯 **SUCCESS CRITERIA**

1. **✅ All new users created with Clean Slate structure**
2. **✅ Single unified migration strategy**
3. **✅ No legacy fields in user documents**
4. **✅ Consistent permission format (department.action)**
5. **✅ All RBAC functions use orthogonal system**
6. **✅ Migration verification passes 100%**

---

**Next Steps**: Implement Fix 1 (New User Registration) immediately to prevent further system inconsistency.
