# AI Context: KBN Multi-Province Expansion Phase 1

**Project**: Nakhon Ratchasima → Nakhon Sawan Expansion with RBAC Implementation

## Project Overview

### Current State

- **Single Province**: Nakhon Ratchasima (นครราชสีมา) with existing branches
- **Basic Branch System**: Branch codes, locations, warehouses
- **Simple User Permissions**: Basic permission categories without geographic restrictions
- **Hardcoded Defaults**: Province defaulting to "นครราชสีมา"

### Target State (Phase 1)

- **Two Provinces**: Nakhon Ratchasima + Nakhon Sawan (นครสวรรค์)
- **3 New Branches**: NSN001, NSN002, NSN003 in Nakhon Sawan
- **Enhanced RBAC**: Role-based access with province/branch filtering
- **Geographic Data Isolation**: Users see only data they have access to

## Business Context

### Company: KBN (Kubota Benja-pol)

- **Business Type**: Kubota tractor and agricultural equipment dealership in Thailand
- **Core Operations**: Sales, Service, Parts, Warehousing, Finance, HR
- **Current Location**: Centered around Nakhon Ratchasima province
- **Expansion Goal**: Scale to multiple provinces with proper access control

## Implementation Architecture

### Enhanced Data Structure

```javascript
// Firebase Collections Enhancement
const dataStructure = {
  // NEW: Province management
  "data/company/provinces": {
    นครราชสีมา: {
      provinceCode: "30",
      provinceName: "นครราชสีมา",
      provinceNameEn: "Nakhon Ratchasima",
      region: "อีสาน",
      isActive: true,
      manager: null,
      createdAt: Date.now(),
      branches: ["0450", "NMA002", "NMA003"],
    },
    นครสวรรค์: {
      provinceCode: "60",
      provinceName: "นครสวรรค์",
      provinceNameEn: "Nakhon Sawan",
      region: "กลาง",
      isActive: true,
      manager: null,
      createdAt: Date.now(),
      branches: ["NSN001", "NSN002", "NSN003"],
    },
  },

  // ENHANCED: Branch structure with province reference
  "data/company/branches": {
    NSN001: {
      branchCode: "NSN001",
      branchName: "สาขานครสวรรค์ 1",
      provinceCode: "นครสวรรค์",
      region: "กลาง",
      locationId: "location_nsn001",
      warehouseId: "warehouse_nsn001",
      isActive: true,
      manager: null,
      queue: 1,
    },
  },

  // ENHANCED: User roles with geographic access
  "data/company/employees": {
    userId123: {
      accessLevel: "province", // "all" | "province" | "branch"
      allowedProvinces: ["นครสวรรค์"],
      allowedBranches: ["NSN001", "NSN002", "NSN003"],
      homeProvince: "นครสวรรค์",
      homeBranch: "NSN001",
    },
  },
};
```

### RBAC System Design

```javascript
const ACCESS_LEVELS = {
  SUPER_ADMIN: {
    level: "all",
    description: "ผู้ดูแลระบบสูงสุด",
    permissions: ["*"],
    geographic: { type: "all" },
  },
  PROVINCE_MANAGER: {
    level: "province",
    description: "ผู้จัดการจังหวัด",
    permissions: [
      "view_province_reports",
      "manage_branches_in_province",
      "view_all_data_in_province",
      "manage_users_in_province",
    ],
    geographic: { type: "province", restrictions: "allowedProvinces" },
  },
  BRANCH_MANAGER: {
    level: "branch",
    description: "ผู้จัดการสาขา",
    permissions: [
      "view_branch_reports",
      "manage_branch_operations",
      "view_branch_data",
    ],
    geographic: { type: "branch", restrictions: "allowedBranches" },
  },
  BRANCH_STAFF: {
    level: "branch",
    description: "พนักงานสาขา",
    permissions: ["view_branch_data", "create_sales", "manage_customers"],
    geographic: { type: "branch", restrictions: "allowedBranches" },
  },
};
```

## Files to Create/Modify

### New Files

```
src/redux/actions/provinces.js
src/redux/actions/rbac.js
src/redux/reducers/provinces.js
src/redux/reducers/rbac.js
src/components/ProvinceSelector.js
src/components/RegionSelector.js
src/components/GeographicBranchSelector.js
src/components/PermissionGate.js
src/components/AccessControl.js
src/Modules/Settings/components/ProvinceList.js
src/Modules/Settings/components/ProvinceSetting.js
src/Modules/Settings/components/RoleManagement.js
src/utils/rbac.js
src/utils/geographic.js
src/hooks/usePermissions.js
src/hooks/useGeographicData.js
```

### Modified Files

```
src/redux/reducers/index.js - Add provinces, rbac reducers
src/redux/reducers/auth.js - Enhance user object with geographic access
src/redux/reducers/data.js - Add province filtering logic
src/components/BranchSelector.js - Add province filtering
src/Formiks/FNameAddress.js - Multi-province address support
src/Modules/Settings/components/BranchList.js - Province-aware branch listing
```

## Implementation Steps

### Step 1: Redux Infrastructure (Day 1-2)

**Create Province Actions**

```javascript
// src/redux/actions/provinces.js
export const GET_PROVINCES = "GET_PROVINCES";
export const SET_CURRENT_PROVINCE = "SET_CURRENT_PROVINCE";
export const UPDATE_PROVINCE = "UPDATE_PROVINCE";

export const setProvinces = (provinces) => ({
  type: GET_PROVINCES,
  provinces,
});
```

**Create RBAC Actions**

```javascript
// src/redux/actions/rbac.js
export const SET_USER_PERMISSIONS = "SET_USER_PERMISSIONS";
export const CHECK_PERMISSION = "CHECK_PERMISSION";
export const SET_GEOGRAPHIC_ACCESS = "SET_GEOGRAPHIC_ACCESS";

export const setUserPermissions = (userId, permissions, geographic) => ({
  type: SET_USER_PERMISSIONS,
  userId,
  permissions,
  geographic,
});
```

### Step 2: Core Components (Day 3-4)

**Permission Gate Component**

```javascript
// src/components/PermissionGate.js
import React from "react";
import { usePermissions } from "hooks/usePermissions";

const PermissionGate = ({
  permission,
  province,
  branch,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission, { province, branch })) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
```

**Geographic Branch Selector**

```javascript
// src/components/GeographicBranchSelector.js
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { usePermissions } from "hooks/usePermissions";
import BranchSelector from "./BranchSelector";

const GeographicBranchSelector = (props) => {
  const { user } = useSelector((state) => state.auth);
  const { branches } = useSelector((state) => state.data);
  const { getAccessibleBranches } = usePermissions();

  const accessibleBranches = useMemo(() => {
    return getAccessibleBranches(branches);
  }, [branches, getAccessibleBranches]);

  return (
    <BranchSelector
      {...props}
      branches={accessibleBranches}
      onlyUserBranch={user.accessLevel === "branch" ? user.homeBranch : null}
    />
  );
};

export default GeographicBranchSelector;
```

### Step 3: RBAC Utilities (Day 5-6)

**Permission Utilities**

```javascript
// src/utils/rbac.js
export const checkPermission = (
  userPermissions,
  requiredPermission,
  context = {}
) => {
  // Super admin check
  if (userPermissions.includes("*")) return true;

  // Direct permission check
  if (userPermissions.includes(requiredPermission)) {
    return checkGeographicAccess(context);
  }

  return false;
};

export const checkGeographicAccess = (user, context) => {
  const { province, branch } = context;

  // All access
  if (user.accessLevel === "all") return true;

  // Province level access
  if (user.accessLevel === "province") {
    return !province || user.allowedProvinces.includes(province);
  }

  // Branch level access
  if (user.accessLevel === "branch") {
    return !branch || user.allowedBranches.includes(branch);
  }

  return false;
};
```

**Custom Hooks**

```javascript
// src/hooks/usePermissions.js
import { useSelector } from "react-redux";
import {
  checkPermission,
  checkGeographicAccess,
  filterDataByAccess,
} from "utils/rbac";

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);
  const { branches } = useSelector((state) => state.data);

  const hasPermission = (permission, context = {}) => {
    return checkPermission(user.permissions || [], permission, context);
  };

  const hasGeographicAccess = (context) => {
    return checkGeographicAccess(user, context);
  };

  const getAccessibleBranches = (allBranches) => {
    if (user.accessLevel === "all") return allBranches;

    return Object.keys(allBranches)
      .filter((branchCode) => {
        const branch = allBranches[branchCode];
        return hasGeographicAccess({
          province: branch.provinceCode,
          branch: branchCode,
        });
      })
      .reduce((acc, branchCode) => {
        acc[branchCode] = allBranches[branchCode];
        return acc;
      }, {});
  };

  return {
    hasPermission,
    hasGeographicAccess,
    getAccessibleBranches,
    userAccessLevel: user.accessLevel,
    userProvinces: user.allowedProvinces || [],
    userBranches: user.allowedBranches || [],
  };
};
```

### Step 4: Firebase API Integration (Day 7-8)

**Province Management API**

```javascript
// Add to src/firebase/api.js
export const getProvinces = async () => {
  const snapshot = await db.collection("data/company/provinces").get();
  const provinces = {};
  snapshot.forEach((doc) => {
    provinces[doc.id] = { ...doc.data(), id: doc.id };
  });
  return provinces;
};

export const createProvince = async (provinceData) => {
  const docRef = await db
    .collection("data/company/provinces")
    .doc(provinceData.provinceName);
  await docRef.set({
    ...provinceData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return docRef.id;
};
```

### Step 5: Data Migration & Setup (Day 9-10)

**Migration Script**

```javascript
// src/utils/migration/phase1Migration.js
export const migrateToPhase1 = async () => {
  // 1. Create Nakhon Ratchasima province
  await createProvince({
    provinceCode: "30",
    provinceName: "นครราชสีมา",
    provinceNameEn: "Nakhon Ratchasima",
    region: "อีสาน",
    isActive: true,
    branches: ["0450"],
  });

  // 2. Create Nakhon Sawan province
  await createProvince({
    provinceCode: "60",
    provinceName: "นครสวรรค์",
    provinceNameEn: "Nakhon Sawan",
    region: "กลาง",
    isActive: true,
    branches: ["NSN001", "NSN002", "NSN003"],
  });

  // 3. Create Nakhon Sawan branches
  const nsnBranches = [
    {
      branchCode: "NSN001",
      branchName: "สาขานครสวรรค์ 1",
      provinceCode: "นครสวรรค์",
      region: "กลาง",
    },
    // ... NSN002, NSN003
  ];

  for (const branch of nsnBranches) {
    await createBranch(branch);
  }
};
```

## Current System Integration Points

### Existing File Structure

```
src/
├── components/
│   ├── BranchSelector.js (MODIFY - add province filtering)
│   └── ...
├── Modules/
│   ├── Settings/
│   │   └── components/
│   │       ├── BranchList.js (MODIFY - province awareness)
│   │       └── SettingBranch.js
│   └── ...
├── redux/
│   ├── actions/
│   │   └── data.js (MODIFY - add province actions)
│   ├── reducers/
│   │   ├── index.js (MODIFY - add new reducers)
│   │   ├── data.js (MODIFY - province filtering)
│   │   └── auth.js (MODIFY - geographic access)
│   └── ...
├── Formiks/
│   └── FNameAddress.js (MODIFY - multi-province support)
└── ...
```

## Testing Strategy

### Unit Tests

```javascript
// src/utils/__tests__/rbac.test.js
describe("RBAC Functions", () => {
  test("checkPermission allows super admin", () => {
    const userPermissions = ["*"];
    expect(checkPermission(userPermissions, "any_permission")).toBe(true);
  });

  test("checkGeographicAccess filters by province", () => {
    const user = { accessLevel: "province", allowedProvinces: ["นครสวรรค์"] };
    const context = { province: "นครสวรรค์" };
    expect(checkGeographicAccess(user, context)).toBe(true);
  });
});
```

## User Migration Plan

### Existing Users

1. **Assign Province Access**: All existing users get access to "นครราชสีมา"
2. **Role Mapping**: Map existing permissions to new RBAC system
3. **Default Settings**: Set appropriate accessLevel based on current roles

### New Users (Nakhon Sawan)

1. **Province Manager**: Full access to Nakhon Sawan province
2. **Branch Managers**: Access to specific NSN branches
3. **Staff**: Branch-level access only

## Performance Considerations

1. **Data Filtering**: Client-side filtering for small datasets, server-side for large ones
2. **Caching**: Cache user permissions and geographic access
3. **Lazy Loading**: Load province data on demand
4. **Indexing**: Firestore indexes for province/branch queries

## Security Considerations

1. **Server-side Validation**: Always validate geographic access on backend
2. **Permission Escalation**: Prevent users from accessing higher levels
3. **Audit Logs**: Track permission changes and access attempts
4. **Session Management**: Invalidate sessions when permissions change

## Success Criteria

1. **Functional**: Users can only access data from their assigned provinces/branches
2. **Performance**: No degradation in system performance
3. **Security**: All geographic access properly validated
4. **Usability**: Smooth transition for existing users
5. **Scalability**: Easy addition of new provinces in future phases

This AI context provides the complete roadmap for implementing Phase 1 of the multi-province expansion with comprehensive RBAC. Each step builds upon the previous ones, ensuring a systematic and secure implementation.
