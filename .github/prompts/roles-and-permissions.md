# RBAC System for KBN Platform

This document outlines the role-based access control system implemented in the KBN platform to help GitHub Copilot understand permission structures when generating code.

## User Roles Hierarchy

The application uses a hierarchical role system with increasing access levels:

| Role | Access Level | Description | Province Access |
|------|-------------|-------------|-----------------|
| `GUEST` | Minimal | Unauthenticated users | None |
| `PENDING` | Very Limited | Users awaiting approval | None |
| `USER`/`BRANCH` | Basic | Standard authenticated users | Single branch |
| `LEAD` | Enhanced Basic | Document reviewers/Team leads | Single branch |
| `BRANCH_MANAGER` | Intermediate | Branch-level managers | Single branch |
| `PROVINCE_MANAGER` | Higher Intermediate | Province-level managers | Single province |
| `GENERAL_MANAGER` | Advanced | General managers | Multiple provinces |
| `ADMIN` | High | Administrative users | All provinces |
| `PRIVILEGE` | Very High | Users with special privileges | All provinces |
| `SUPER_ADMIN`/`DEVELOPER` | Full | Complete system access | All provinces |

Role definitions are in `src/constants/roles.ts`.

## Permission Categories

Permissions are grouped into these categories:

1. **Data Access** - Access to different data types
2. **User Management** - User and role management capabilities
3. **Content Management** - Content creation/editing permissions
4. **System Configuration** - System settings access
5. **Operational Actions** - Specific operation permissions
6. **Document Management** - Document workflow permissions
7. **Province Management** - Province configuration and access permissions (new)

Permission definitions are in `src/constants/Permissions.ts`.

## Implementation Patterns

### Route-Level Protection

```tsx
// Basic permission check
<Route
  path="/admin/settings"
  element={
    <PermissionProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_EDIT}>
      <AdminSettingsScreen />
    </PermissionProtectedRoute>
  }
/>

// Province-specific route protection
<Route
  path="/province/:provinceId/dashboard"
  element={
    <PermissionProtectedRoute 
      requiredPermission={PERMISSIONS.PROVINCE_VIEW}
      validateParams={(params) => hasProvinceAccess(params.provinceId)}
    >
      <ProvinceDashboard />
    </PermissionProtectedRoute>
  }
/>
```

### Component-Level Checks

```tsx
const ActionButton: React.FC<{ provinceId: string }> = ({ provinceId }) => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check both permission and province access
  if (hasPermission(PERMISSIONS.CONTENT_EDIT) && hasProvinceAccess(provinceId)) {
    return <Button onClick={handleEdit}>Edit Content</Button>;
  }
  
  return null;
};
```

### Service-Level Validation

```typescript
export const updateUserRole = async (
  userId: string, 
  newRole: string, 
  provinceId: string
): Promise<void> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check both permission and province access
  if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT) || !hasProvinceAccess(provinceId)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }
  
  return await firestore.collection("users").doc(userId).update({
    role: newRole
  });
};
```

## Permission Hooks

The application provides these permission hooks:

```typescript
// In components
const { 
  hasRole,           // Check if user has specific role
  hasPermission,     // Check if user has specific permission
  hasProvinceAccess, // Check if user has access to specific province
  getPrivilegeLevel, // Get numeric level of user's highest role
  userRole,          // Get user's current role
  accessibleProvinces // Get array of province IDs user can access
} = usePermissions();
```

## User Permission Storage

User role and permission data structure:

```typescript
interface User {
  uid: string;
  email: string;
  role: UserRole; // From ROLES enum
  customPermissions?: string[]; // Optional additional permissions
  branchCode?: string; // For branch-specific permissions
  provinceId?: string; // Primary province ID
  accessibleProvinces?: { [provinceId: string]: boolean }; // All accessible provinces
}
```

## Best Practices

1. Always verify permissions server-side and client-side
2. Follow principle of least privilege
3. Create granular, specific permissions
4. Document role-permission relationships
5. Audit permission checks regularly
6. Handle permission denials with clear user feedback
7. Use `getPrivilegeLevel()` for role hierarchy comparisons
8. Always check both permission and province access
9. Use `hasProvinceAccess()` for all province-specific operations
10. Remember that some roles have access to all provinces (ADMIN+)

## Common Permission Check Patterns

```typescript
// Simple permission check
if (hasPermission(PERMISSIONS.USER_EDIT)) {
  // Allow edit action
}

// Branch-specific check
if (hasPermission(PERMISSIONS.BRANCH_DATA_VIEW) && userBranchCode === targetBranchCode) {
  // Allow branch-specific data access
}

// Province access check
if (hasProvinceAccess(targetProvinceId)) {
  // Allow province-specific operations
}

// Role-based check with fallback
if (hasRole(ROLES.PROVINCE_ADMIN) || (hasRole(ROLES.PROVINCE_MANAGER) && hasProvinceAccess(targetProvinceId))) {
  // Allow administrative action
}

// Permission check with privilege level
if (getPrivilegeLevel() >= getPrivilegeLevel(ROLES.BRANCH_MANAGER)) {
  // Allow action for branch manager and above
}

// Complete check for province-specific operation
if (hasPermission(PERMISSIONS.DATA_EDIT) && hasProvinceAccess(provinceId)) {
  // Allow province-specific data edit
}
```

## Province Access Control Logic

```typescript
// Determine if user has access to a specific province
export const hasProvinceAccess = (provinceId: string): boolean => {
  const { user, hasRole } = useAuth();
  
  // Role category: GENERAL_MANAGER can access all province
  if (isInRoleCategory(user.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
    return true;
  }
  
  // Province managers can access only their assigned province
  if (hasRole(ROLES.PROVINCE_MANAGER)) {
    return user.provinceId === provinceId;
  }
  
  // Branch-level roles can only access their province
  if (hasRole([ROLES.BRANCH_MANAGER, ROLES.LEAD, ROLES.USER])) {
    return user.provinceId === provinceId;
  }
  
  // Default deny
  return false;
};
```

## TypeScript Enums and Types

```typescript
// Role definitions with TypeScript
export enum ROLES {
  GUEST = "GUEST",
  PENDING = "PENDING",
  USER = "USER",
  BRANCH = "BRANCH",
  LEAD = "LEAD",
  BRANCH_MANAGER = "BRANCH_MANAGER",
  PROVINCE_MANAGER = "PROVINCE_MANAGER", // New role
  GENERAL_MANAGER = "GENERAL_MANAGER", // New role
  PROVINCE_ADMIN = "PROVINCE_ADMIN",
  PRIVILEGE = "PRIVILEGE",
  SUPER_ADMIN = "SUPER_ADMIN",
  DEVELOPER = "DEVELOPER"
}

// Permission structure with TypeScript
export type Permission = {
  id: string;
  name: string;
  category: string;
  description: string;
};

// Province-specific permissions (new)
export const PROVINCE_PERMISSIONS = {
  PROVINCE_VIEW: "province:view",
  PROVINCE_EDIT: "province:edit",
  PROVINCE_CREATE: "province:create",
  PROVINCE_DELETE: "province:delete",
  PROVINCE_USERS_MANAGE: "province:users:manage",
  PROVINCE_REPORTS_VIEW: "province:reports:view",
  PROVINCE_CONFIG_EDIT: "province:config:edit"
};

// Extended usePermissions hook with province support
export const usePermissions = () => {
  const { user } = useAuth();
  const [currentProvinceId, setCurrentProvinceId] = useState<string | null>(null);
  
  // Get province IDs accessible to this user
  const accessibleProvinces = useMemo(() => {
    if (!user) return [];
    
    // Admins can access all provinces
    if ([ROLES.PROVINCE_ADMIN, ROLES.SUPER_ADMIN, ROLES.DEVELOPER].includes(user.role)) {
      return Object.keys(allProvinces); // From provinces context
    }
    
    // General managers access their assigned provinces
    if (user.role === ROLES.GENERAL_MANAGER && user.accessibleProvinces) {
      return Object.keys(user.accessibleProvinces)
        .filter(id => user.accessibleProvinces[id]);
    }
    
    // Other roles can only access their assigned province
    return user.provinceId ? [user.provinceId] : [];
  }, [user]);
  
  // Check if user has access to specific province
  const hasProvinceAccess = useCallback((provinceId: string) => {
    if (!user || !provinceId) return false;
    
    // Admin roles have access to all provinces
    if ([ROLES.PRIVILEGE, ROLES.SUPER_ADMIN, ROLES.DEVELOPER].includes(user.role)) {
      return true;
    }
    
    // General managers check their accessible provinces
    if (user.role === ROLES.GENERAL_MANAGER && user.accessibleProvinces) {
      return !!user.accessibleProvinces[provinceId];
    }
    
    // All other roles can only access their assigned province
    return user.provinceId === provinceId;
  }, [user]);
  
  // Other existing permission logic...
  
  return {
    hasRole,
    hasPermission,
    getPrivilegeLevel,
    userRole: user?.role,
    // New province-related functionality
    accessibleProvinces,
    hasProvinceAccess,
    currentProvinceId,
    setCurrentProvinceId
  };
};
```

## Migration Integration Points

To integrate province-based permissions into the existing system:

1. Update user profiles to include province information
2. Enhance permission checks to verify province access
3. Add province selector to relevant UI components
4. Modify data queries to filter by province
5. Update security rules to enforce province-level access

```typescript
// Example user profile update
const updateUserProvince = async (
  userId: string, 
  provinceId: string, 
  accessibleProvinces?: Record<string, boolean>
): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    provinceId,
    accessibleProvinces: accessibleProvinces || { [provinceId]: true }
  });
};
```
