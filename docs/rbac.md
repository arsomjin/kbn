# 🔑 Role-Based Access Control (RBAC)

This document outlines the hierarchical Role-Based Access Control (RBAC) system implemented in the KBN platform, which enforces proper permission boundaries across provinces, branches, and user roles. The implementation is available in `/src/constants/roles.ts` which defines role types, hierarchy, and permission mappings.

## Role Hierarchy

The application implements a hierarchical RBAC system with the following roles (from lowest to highest privilege):

| Role | Description | Access Level | Province Access |
|------|-------------|-------------|-----------------|
| `GUEST` | Unauthenticated users | Minimal access | None |
| `PENDING` | Users awaiting approval | Very limited access | None |
| `USER`/`BRANCH` | Standard authenticated users | Basic access | Single branch |
| `LEAD` | Team leads/reviewers | Enhanced basic access | Single branch |
| `BRANCH_MANAGER` | Branch managers | Intermediate access | Single branch |
| `PROVINCE_MANAGER` | Province managers | Higher intermediate access | Single province |
| `PROVINCE_ADMIN` | Administrative users | High-level access | Single provinces |
| `GENERAL_MANAGER` | General managers | Advanced access | Multiple provinces |
| `PRIVILEGE` | Users with special access | Very high access | All provinces |
| `SUPER_ADMIN`/`DEVELOPER` | System administrators | Complete system access | All provinces |

## Permission Types

Permissions in the system are divided into several categories:

### Read Permissions
- `VIEW_DASHBOARD`: Access to dashboard and statistics
- `VIEW_CUSTOMERS`: Access to customer information
- `VIEW_SALES`: Access to sales records
- `VIEW_INVENTORY`: Access to inventory data
- `VIEW_REPORTS`: Access to reports and analytics
- `VIEW_EMPLOYEES`: Access to employee information
- `VIEW_SETTINGS`: Access to system settings

### Write Permissions
- `CREATE_CUSTOMERS`: Create new customer profiles
- `EDIT_CUSTOMERS`: Edit existing customer information
- `CREATE_SALES`: Create new sales records
- `EDIT_SALES`: Edit existing sales records
- `CREATE_INVENTORY`: Add new inventory items
- `EDIT_INVENTORY`: Update inventory information
- `DELETE_INVENTORY`: Remove inventory items

### Administrative Permissions
- `MANAGE_USERS`: Create, edit, and delete users
- `ASSIGN_ROLES`: Change user roles
- `MANAGE_BRANCHES`: Create, edit, and delete branch information
- `MANAGE_PROVINCES`: Create, edit, and delete province information
- `SYSTEM_SETTINGS`: Configure system-wide settings
- `AUDIT_LOGS`: View system audit logs

## Permission Implementation

The permission system should be implemented at multiple levels:

### Route-Level Protection

```tsx
import { Navigate, useParams } from "react-router-dom";
import { PERMISSIONS } from "../constants/Permissions";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
  provinceCheck?: (params: Record<string, string>) => boolean;
}

export const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  children,
  requiredPermission,
  provinceCheck
}) => {
  const { hasPermission } = usePermissions();
  const params = useParams();
  
  // Check if user has required permission
  const hasRequiredPermission = hasPermission(requiredPermission);
  
  // Check if province access is required and granted
  const hasProvincePermission = provinceCheck 
    ? provinceCheck(params)
    : true;
  
  if (!hasRequiredPermission || !hasProvincePermission) {
    return <Navigate to="/access-denied" />;
  }
  
  return <>{children}</>;
};

// Usage example:
<Route
  path="/customers/:provinceId"
  element={
    <PermissionProtectedRoute 
      requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}
      provinceCheck={(params) => hasProvinceAccess(params.provinceId)}
    >
      <CustomersPage />
    </PermissionProtectedRoute>
  }
/>
```

### Component-Level Access Control

```tsx
import React from "react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../constants/Permissions";
import { AccessDenied } from "../components/common/AccessDenied";

interface CustomerDetailProps {
  customerId: string;
  provinceId: string;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customerId, 
  provinceId 
}) => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    return <AccessDenied />;
  }
  
  // Determine if user can edit
  const canEdit = hasPermission(PERMISSIONS.EDIT_CUSTOMERS);
  
  return (
    <div>
      <CustomerInfo customerId={customerId} />
      {canEdit && <EditCustomerButton customerId={customerId} />}
    </div>
  );
};
```

### UI Element Conditional Rendering

```tsx
import React from "react";
import { Button } from "antd";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../constants/Permissions";

interface ActionButtonsProps {
  provinceId: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ provinceId }) => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  const hasProvincePermission = hasProvinceAccess(provinceId);
  const canCreateCustomers = hasPermission(PERMISSIONS.CREATE_CUSTOMERS) && hasProvincePermission;
  const canCreateSales = hasPermission(PERMISSIONS.CREATE_SALES) && hasProvincePermission;
  
  return (
    <div className="action-buttons">
      {canCreateCustomers && (
        <Button type="primary">
          Add Customer
        </Button>
      )}
      
      {canCreateSales && (
        <Button type="primary">
          Create Sale
        </Button>
      )}
    </div>
  );
};
```

### Service-Level Validation

```typescript
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../constants/Permissions";

export const createCustomer = async (customerData: CustomerData, provinceId: string): Promise<string> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.CREATE_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions to create customer");
  }
  
  try {
    // Add customer with required province ID
    const docRef = await addDoc(collection(db, "data", "sales", "customers"), {
      ...customerData,
      provinceId,
      created: Date.now(),
      deleted: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer. Please try again.");
  }
};

export const getCustomersByProvince = async (provinceId: string): Promise<Customer[]> => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions to view customers");
  }
  
  try {
    const customersRef = collection(db, "data", "sales", "customers");
    const customersQuery = query(
      customersRef,
      where("provinceId", "==", provinceId),
      where("deleted", "==", false)
    );
    
    const querySnapshot = await getDocs(customersQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers. Please try again.");
  }
};
```

## Permission Hooks

The `usePermissions` hook provides a simple interface for checking permissions:

```typescript
import { useContext } from "react";
import { PermissionContext } from "../contexts/PermissionContext";

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  
  const { userRole, userPermissions, userProvinces } = context;
  
  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };
  
  // Check if user has access to specific province
  const hasProvinceAccess = (provinceId: string): boolean => {
    if (!user || !provinceId) return false;
    
    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (isInRoleCategory(user.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
      return true;
    }
    
    // Other roles with multiple province access check their accessible provinces
    if (user.accessibleProvinceIds && user.accessibleProvinceIds.length > 0) {
      return user.accessibleProvinceIds.includes(provinceId);
    }
    
    // All other roles can only access their assigned province
    return user.province === provinceId;
  };
  
  // Check if user has specific role or higher
  const hasMinimumRole = (role: string): boolean => {
    const roleHierarchy = [
      "GUEST",
      "PENDING",
      "USER",
      "LEAD",
      "BRANCH_MANAGER",
      "PROVINCE_MANAGER",
      "PROVINCE_ADMIN",
      "GENERAL_MANAGER",
      "PRIVILEGE",
      "SUPER_ADMIN"
    ];
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  };
  
  return {
    userRole,
    userPermissions,
    userProvinces,
    hasPermission,
    hasProvinceAccess,
    hasMinimumRole
  };
};
```

## Permission Context Provider

The `PermissionProvider` component manages the permission state:

```tsx
import React, { createContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { ROLE_PERMISSIONS } from "../constants/roles";

interface PermissionContextType {
  userRole: string;
  userPermissions: string[];
  userProvinces: string[];
  isLoading: boolean;
}

export const PermissionContext = createContext<PermissionContextType | null>(null);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("GUEST");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userProvinces, setUserProvinces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole("GUEST");
        setUserPermissions([]);
        setUserProvinces([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // Get user document from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const role = userData.role || "USER";
          setUserRole(role);
          
          // Get permissions based on role
          const permissions = ROLE_PERMISSIONS[role] || [];
          setUserPermissions(permissions);
          
          // Get provinces user has access to
          const provinces = userData.provinces || [];
          setUserProvinces(provinces);
        } else {
          // Default to pending if user document doesn't exist
          setUserRole("PENDING");
          setUserPermissions([]);
          setUserProvinces([]);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);
  
  return (
    <PermissionContext.Provider
      value={{
        userRole,
        userPermissions,
        userProvinces,
        isLoading
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
```

## Role-Permission Mapping

Map roles to their respective permissions in a constant file:

```typescript
// constants/roles.ts
import { PERMISSIONS } from "./Permissions";

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  "GUEST": [
    // No permissions
  ],
  
  "PENDING": [
    // Minimal permissions for pending users
    PERMISSIONS.VIEW_DASHBOARD
  ],
  
  "USER": [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_INVENTORY
  ],
  
  "LEAD": [
    ...ROLE_PERMISSIONS.USER,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.CREATE_INVENTORY
  ],
  
  "BRANCH_MANAGER": [
    ...ROLE_PERMISSIONS.LEAD,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.EDIT_SALES,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_EMPLOYEES
  ],
  
  "PROVINCE_MANAGER": [
    ...ROLE_PERMISSIONS.BRANCH_MANAGER,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.DELETE_INVENTORY
  ],
  
  "PROVINCE_ADMIN": [
    ...ROLE_PERMISSIONS.PROVINCE_MANAGER,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.MANAGE_PROVINCES
  ],
    
  "GENERAL_MANAGER": [
    ...ROLE_PERMISSIONS.PROVINCE_ADMIN,
    PERMISSIONS.MANAGE_BRANCHES
  ],
  
  "PRIVILEGE": [
    ...ROLE_PERMISSIONS.GENERAL_MANAGER,
    PERMISSIONS.SYSTEM_SETTINGS
  ],
  
  "SUPER_ADMIN": [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  "DEVELOPER": [
    // All permissions
    ...Object.values(PERMISSIONS),
    PERMISSIONS.AUDIT_LOGS
  ]
};
```

## Permission Constants

Define permission constants in a separate file:

```typescript
// constants/Permissions.ts
export const PERMISSIONS = {
  // Read permissions
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_CUSTOMERS: "VIEW_CUSTOMERS",
  VIEW_SALES: "VIEW_SALES", 
  VIEW_INVENTORY: "VIEW_INVENTORY",
  VIEW_REPORTS: "VIEW_REPORTS",
  VIEW_EMPLOYEES: "VIEW_EMPLOYEES",
  VIEW_SETTINGS: "VIEW_SETTINGS",
  
  // Write permissions
  CREATE_CUSTOMERS: "CREATE_CUSTOMERS",
  EDIT_CUSTOMERS: "EDIT_CUSTOMERS",
  CREATE_SALES: "CREATE_SALES",
  EDIT_SALES: "EDIT_SALES",
  CREATE_INVENTORY: "CREATE_INVENTORY",
  EDIT_INVENTORY: "EDIT_INVENTORY",
  DELETE_INVENTORY: "DELETE_INVENTORY",
  
  // Administrative permissions
  MANAGE_USERS: "MANAGE_USERS",
  ASSIGN_ROLES: "ASSIGN_ROLES",
  MANAGE_BRANCHES: "MANAGE_BRANCHES",
  MANAGE_PROVINCES: "MANAGE_PROVINCES",
  SYSTEM_SETTINGS: "SYSTEM_SETTINGS",
  AUDIT_LOGS: "AUDIT_LOGS"
};
```

## Testing Permission Logic

Example test for permission hooks:

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionContext } from "../contexts/PermissionContext";

describe("usePermissions hook", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PermissionContext.Provider
      value={{
        userRole: "BRANCH_MANAGER",
        userPermissions: ["VIEW_CUSTOMERS", "EDIT_CUSTOMERS"],
        userProvinces: ["province1", "province2"],
        isLoading: false
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
  
  it("should check permissions correctly", () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    expect(result.current.hasPermission("VIEW_CUSTOMERS")).toBe(true);
    expect(result.current.hasPermission("MANAGE_USERS")).toBe(false);
  });
  
  it("should check province access correctly", () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    expect(result.current.hasProvinceAccess("province1")).toBe(true);
    expect(result.current.hasProvinceAccess("province3")).toBe(false);
  });
  
  it("should check minimum role correctly", () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    expect(result.current.hasMinimumRole("USER")).toBe(true);
    expect(result.current.hasMinimumRole("ADMIN")).toBe(false);
  });
});