# AI Context: KBN Multi-Province RBAC System - Integration Phase

**Project**: KBN (Kubota Benja-pol) - Multi-Province RBAC Integration & Library Modernization

**Current Status**: 🎯 **RBAC COMPLETE** → **INTEGRATION PHASE**

## Phase Status

### ✅ **PHASE 1 COMPLETED** - Multi-Province RBAC Infrastructure

- **Multi-Province System**: ✅ Complete (Nakhon Ratchasima → Nakhon Sawan)
- **Enhanced RBAC**: ✅ Complete (7-level access control)
- **Department+Flow Permissions**: ✅ Complete (accounting.view, sales.edit, etc.)
- **Migration Tools**: ✅ Production-ready with rollback capability
- **Components & Hooks**: ✅ All RBAC components functional

### 🚀 **PHASE 2 CURRENT** - Integration & Modernization

**Goal**: Integrate RBAC with existing business logic while maintaining original functionality and modernizing outdated UI libraries.

**Approach**:

- **No Breaking Changes**: Preserve all existing logic, functionality, and data
- **Seamless Integration**: RBAC works alongside current system
- **Library Modernization**: Replace outdated libraries with Ant Design equivalents
- **Bug Fixes Only**: Fix issues discovered during integration

## Integration Strategy

### **Preserve Existing System**

- ✅ All current business logic remains unchanged
- ✅ Existing data structures preserved
- ✅ Original functionality maintained
- ✅ No disruption to current workflows

### **RBAC Integration Points**

- **Components**: Wrap existing components with `<PermissionGate>`
- **Data Filtering**: Apply geographic filtering where needed
- **Navigation**: Filter menu items based on permissions
- **Forms**: Apply permission-based field access

### **Library Modernization Plan**

Replace outdated libraries with Ant Design equivalents:

```javascript
// REMOVE (Outdated Libraries)
shards-react        → antd
material-ui         → antd
react-table         → antd Table
react-select        → antd Select
formik              → antd Form
react-bootstrap     → antd
semantic-ui-react   → antd
react-datepicker    → antd DatePicker
react-chartjs-2     → antd Charts / @ant-design/charts
```

## Technical Implementation (Completed)

### **RBAC System Architecture**

```javascript
// 7-Level Access Control
ACCESS_LEVELS: {
  SUPER_ADMIN, PROVINCE_MANAGER, BRANCH_MANAGER,
  ACCOUNTING_STAFF, SALES_STAFF, SERVICE_STAFF, INVENTORY_STAFF
}

// Department + Document Flow Permissions
PERMISSIONS: "department.flow" // e.g., "accounting.view", "sales.approve"

// Geographic Access Control
GEOGRAPHIC: { provinces: [], branches: [], homeProvince, homeBranch }
```

### **Core Components Available**

```javascript
import {
  PermissionGate, // Permission-based component rendering
  ProvinceSelector, // RBAC-filtered province selection
  GeographicBranchSelector, // RBAC-filtered branch selection
  RBACDataTable, // Geographic data filtering
  RBACNavigationFilter, // Menu filtering
  usePermissions, // Permission checking hooks
  useRBAC, // RBAC management
  useGeographicData, // Geographic data utilities
} from "components";
```

### **Migration Tools Ready**

```javascript
// Production-safe migration with rollback
import { executePhase1Migration } from "utils/migration/executeMigration";

// Test dashboard available at: /dev/test-multi-province
```

## Integration Guidelines

### **1. Component Integration Pattern**

```javascript
// Before: Direct component usage
<AccountingReports data={allData} />

// After: RBAC-wrapped with geographic filtering
<PermissionGate permission="accounting.view">
  <AccountingReports
    data={filterDataByUserAccess(allData, {
      provinceField: 'provinceId',
      branchField: 'branchCode'
    })}
  />
</PermissionGate>
```

### **2. Library Replacement Pattern**

```javascript
// Before: react-select
import Select from "react-select";
<Select options={options} />;

// After: Ant Design Select
import { Select } from "antd";
<Select options={options} />;
```

### **3. Form Modernization**

```javascript
// Before: Formik
import { Formik, Form, Field } from "formik";

// After: Ant Design Form
import { Form, Input, Button } from "antd";
const [form] = Form.useForm();
```

## Business Context

### **Company**: KBN (Kubota Benja-pol)

- **Business**: Kubota tractor dealership in Thailand
- **Operations**: Sales, Service, Parts, Warehousing, Finance, HR
- **Current**: Nakhon Ratchasima province (branches: 0450, NMA002, NMA003)
- **Expansion**: Nakhon Sawan province (new branches: NSN001, NSN002, NSN003)

### **System Requirements**

- **Multi-Province Support**: ✅ Implemented
- **Role-Based Access Control**: ✅ Implemented
- **Geographic Data Filtering**: ✅ Implemented
- **Department-Based Permissions**: ✅ Implemented
- **Modern UI Components**: 🚀 **IN PROGRESS**
- **Seamless Integration**: 🚀 **IN PROGRESS**

## Current Implementation Files

### **RBAC Core** (Complete)

```
src/redux/actions/provinces.js         (185 lines)
src/redux/actions/rbac.js             (239 lines)
src/redux/reducers/provinces.js       (196 lines)
src/redux/reducers/rbac.js            (323 lines)
src/utils/rbac.js                     (356 lines)
src/hooks/usePermissions.js           (366 lines)
src/hooks/useRBAC.js                  (386 lines)
src/data/permissions.js               (292 lines)
```

### **RBAC Components** (Complete)

```
src/components/PermissionGate.js      (295 lines)
src/components/ProvinceSelector.js    (306 lines)
src/components/GeographicBranchSelector.js (415 lines)
src/components/RBACDataTable.js       (358 lines)
src/components/RBACNavigationFilter.js (167 lines)
```

### **Migration & Testing** (Complete)

```
src/utils/migration/phase1Migration.js (551 lines)
src/utils/migration/executeMigration.js (416 lines)
src/utils/migration/rollbackUtility.js (440 lines)
src/dev/screens/TestMultiProvince/index.js
```

## Integration Priorities

### **High Priority**

1. **Main Navigation**: Apply RBAC filtering to menu items
2. **Data Tables**: Replace react-table with antd Table + RBAC filtering
3. **Forms**: Replace Formik with antd Form components
4. **Selectors**: Replace react-select with antd Select

### **Medium Priority**

1. **Charts**: Replace react-chartjs-2 with @ant-design/charts
2. **Date Pickers**: Replace react-datepicker with antd DatePicker
3. **Modals**: Replace existing modals with antd Modal
4. **Notifications**: Replace with antd notification system

### **Low Priority**

1. **Styling**: Remove Bootstrap/Material-UI CSS dependencies
2. **Icons**: Standardize on Ant Design icons
3. **Layout**: Optimize with antd Layout components

## Development Guidelines

### **Integration Approach**

1. **Preserve Original Logic**: Never change existing business logic
2. **Gradual Replacement**: Replace components one by one
3. **Test Thoroughly**: Ensure functionality remains identical
4. **Fix Bugs Only**: Address issues found during integration
5. **Maintain Data Integrity**: No changes to data structures unless fixing bugs

### **RBAC Usage**

```javascript
// Check permissions
const { hasPermission, filterDataByUserAccess } = usePermissions();

// Gate components
<PermissionGate permission="sales.edit" branch={selectedBranch}>
  <SalesForm />
</PermissionGate>;

// Filter data geographically
const visibleData = filterDataByUserAccess(allData, {
  provinceField: "provinceId",
  branchField: "branchCode",
});
```

### **Library Replacement Priority**

1. Replace most critical/problematic libraries first
2. Maintain identical functionality
3. Improve UX where possible without changing logic
4. Remove unused dependencies

---

**Phase 1**: ✅ **COMPLETE** - Multi-Province RBAC Infrastructure
**Phase 2**: 🚀 **IN PROGRESS** - Integration & Library Modernization
**Next Steps**: Systematic integration of RBAC with existing components while modernizing UI libraries to Ant Design
