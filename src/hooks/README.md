# KBN Hooks Directory

This directory contains custom React hooks for the KBN system.

## 🎯 **RBAC & Permissions**

### **usePermissions.js** - THE DEFINITIVE RBAC HOOK

This is the **ONLY** usePermissions hook for the entire KBN system. All other variants have been consolidated.

**Features:**

- ✅ **Clean Slate ONLY** - Uses `user.access` structure exclusively
- ✅ **3x Performance** - No fallback chain checking
- ✅ **Migration Detection** - Checks if users need Clean Slate migration
- ✅ **Complete API** - All permission checking, geographic access, data filtering
- ✅ **UI Components Ready** - Authority checks, home location, departments

**Core Functions:**

```javascript
const {
  // Permission checking
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canEdit,
  canView,
  canDelete,
  canApprove,

  // Geographic access
  hasGeographicAccess,
  canAccessProvince,
  canAccessBranch,
  accessibleProvinces,
  accessibleBranches,
  homeLocation,

  // Data filtering
  filterDataByUserAccess,

  // User context
  userRBAC,
  authority,
  departments,
  isAdmin,
  isManager,

  // Migration status
  isMigrated,
  needsMigration,
} = usePermissions();
```

**Migration Required:**

- Users MUST have `user.access` structure
- Legacy users without Clean Slate structure will return null

---

## 🛠 **Other Hooks**

### **useRBAC.js** - RBAC Management

Higher-level RBAC operations and user management.

### **useGeographicData.js** - Geographic Context

Geographic data enhancement and filtering utilities.

### **useAuditTrail.js** - Audit Logging

Automatic audit trail generation for data changes.

### **useNavigationGenerator.js** - Dynamic Navigation

RBAC-filtered navigation menu generation.

### **useDataOperations.js** - Data CRUD

Standardized data operations with RBAC integration.

### **useDataSync.js** - Data Synchronization

Real-time data synchronization utilities.

### **useNetworkStatus.js** - Network Monitoring

Network status monitoring and offline handling.

### **useResponsive.js** - Responsive Design

Responsive breakpoint detection and utilities.

### **Form & Input Hooks**

- **useEnterKeyNavigation.js** - Enter key form navigation
- **useInputNumberFocus.js** - Number input focus management

### **Error Handling**

- **useFirebaseError.js** - Firebase error handling and user-friendly messages

---

## 🚀 **Best Practices**

1. **Use usePermissions() for ALL RBAC needs** - Don't create new permission hooks
2. **Check isMigrated** before rendering RBAC-dependent components
3. **Use homeLocation** for geographic UI components
4. **Leverage authority checks** (isAdmin, isManager) for role-specific UI
5. **Apply filterDataByUserAccess** for all data lists

## 📋 **Migration Notes**

If you see console errors about missing Clean Slate structure:

```javascript
// Check migration status
const { isMigrated, needsMigration } = usePermissions();

// Use migration tools if needed
if (needsMigration) {
  // Execute Clean Slate migration
  CLEAN_SLATE_CONSOLIDATION.executeCompleteConsolidation();
}
```

---

**Last Updated:** Clean Slate Consolidation - December 2024
