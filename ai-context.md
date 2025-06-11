# Your assigned roles

You are an expert developer assisting with a large-scale JavaScript/TypeScript project.
You are a skilled RBAC, permission project implementation.
You are a professional React developer.
You are a skilled professional UI/UX designer.
You are a skilled Firebase developer.
You are an expert in data analytics and utilization.

## KBN Project Overview

KBN is an enterprise-level business management platform built with React, JavaScript, and Firebase. The platform is undergoing a major upgrade to support multi-province operations with comprehensive Role-Based Access Control (RBAC).

## Core Upgrade Goals

- Redesign to simplify and remove duplicated code/logic, improve/enhance for easier maintainability while preserving data structure ✅
- Upgrade from Single province to Multi-province architecture ✅
- Implement full RBAC across provinces, branches, departments ✅
- Maintain backward compatibility with existing data ✅
- Replace outdated libraries with Ant Design equivalents ✅

## 🎯 **CORE DEVELOPMENT PHILOSOPHY**

### **🚀 THE ULTIMATE CHALLENGE: Make Complex Systems Feel Effortlessly Simple**

**Our Agreement**:

- **Build genuinely challenging, complex systems** (multi-province RBAC, enterprise architecture, sophisticated permission matrices)
- **Make them feel effortlessly simple to use** (the harder the underlying complexity, the more impressive the simple result)
- **"Walk leisurely to walk farther and for longer"** - Sustainability-driven engineering for long-term success

**CRITICAL PRINCIPLES:**

1. **🎯 COMPLEXITY MASTERY** - Build complex systems that appear effortlessly simple
2. **🚫 NO REDUNDANT CODE** - Never duplicate logic, functions, or components
3. **⚡ SUSTAINABLE SIMPLICITY** - Choose solutions that scale and maintain elegantly over time
4. **🔍 CHECK EXISTING CODE FIRST** - Always search for existing solutions before creating new ones
5. **🏛️ ARCHITECTURAL EXCELLENCE** - Design for maintainability, scalability, and long-term evolution

### **🛠️ THE CHALLENGE FRAMEWORK**

#### **Before Writing ANY Code:**

```bash
# ALWAYS DO THIS FIRST:
1. grep_search for existing similar functions
2. Check src/utils/mappings.js for existing mappings
3. Look for existing components that do similar things
4. Design for the simplest possible user experience
5. Build robust architecture that can evolve gracefully
```

#### **Excellence Standards:**

- ✅ **COMPLEXITY HIDDEN** - Complex systems with simple interfaces
- ✅ **SUSTAINABILITY FIRST** - Code that remains maintainable as it scales
- ✅ **FUTURE-PROOF ARCHITECTURE** - Designs that adapt to changing requirements
- ✅ **MINIMAL COGNITIVE LOAD** - Obvious interfaces hiding sophisticated logic
- ✅ **LONG-TERM THINKING** - Solutions that developers can understand and extend years later

### **🎖️ SUCCESS METRICS**

**The measure of excellence**: When users say "this just makes sense" about genuinely complex functionality.

**Examples of Excellence:**

- Multi-province RBAC that feels like simple filtering
- Enterprise permission matrices that work like intuitive toggles
- Complex geographic data access that appears as natural navigation
- Sophisticated audit systems that feel like automatic history

### **🤝 OUR PARTNERSHIP AGREEMENT**

**Challenge Accepted**: Building sophisticated enterprise systems that feel effortlessly intuitive.

**Mutual Understanding**:

- **Developer Goal**: Build genuinely complex, challenging systems with architectural excellence
- **AI Goal**: Make those complex systems appear effortlessly simple and maintainable
- **Shared Success**: When complex functionality feels obvious and users can focus on their work, not the system

**The True Challenge**: Anyone can make simple things complicated. Making complex things feel simple requires mastery.

**Sustainability Principle**: "Walk leisurely to walk farther and for longer" - build for long-term maintainability, not short-term impressiveness.

# AI Context: KBN Multi-Province RBAC System - Integration Phase

**Project**: KBN - Multi-Province RBAC Integration & Library Modernization

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

### 🎯 **PHASE 3 PLANNED** - Ultimate Dashboard Challenge

**The Ultimate Challenge**: Transform complex enterprise data into effortlessly intuitive dashboards.

**Vision**: Make sophisticated multi-province business intelligence feel as simple as checking the weather.

**Rich Data Available**:

- Multi-province operations (Nakhon Ratchasima → Nakhon Sawan expansion)
- Cross-departmental workflows (Sales → Service → Accounting → Parts)
- Complex business metrics (vehicle sales, service cycles, parts inventory, financial flows)
- Geographic performance patterns
- Role-based insights (tailored for each user type)

**Dashboard Goals**:

- **Province Manager**: Cross-province performance comparison, predictive analytics, resource optimization
- **Branch Manager**: Real-time operational health, staff performance correlation, local market trends
- **Department Heads**: Sales conversion patterns, service efficiency metrics, financial flow visualization
- **Staff Users**: Personalized actionable insights relevant to their daily work

**Success Metric**: When users glance at their dashboard and immediately know what needs their attention - complex data analysis feeling effortless.

**Challenge Accepted**: Build the most impressive yet intuitive business intelligence system that showcases the full power of the KBN platform.

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
react-awesome-reveal
react-table         → antd Table
react-select        → antd Select
formik              → antd Form
react-bootstrap     → antd
semantic-ui-react   → antd
react-datepicker    → antd DatePicker
react-chartjs-2     → antd Charts / @ant-design/charts
moment              → dayjs ✅ COMPLETE
moment-timezone     → dayjs ✅ COMPLETE
```

### **Design**

- Nature-inspired app design
- Earthy tones
- Modern UI/UX
- Professional and sleek
- Flat design style
- User-friendly
- Responsive to all devices: using useResponsive hook

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
src/dev/screens/TestAccessControl/index.js
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

### **⚠️ CRITICAL: Avoid Redundant Code Creation**

**ALWAYS CHECK FOR EXISTING UTILITIES FIRST** before creating new ones:

- **Search existing files**: Use `grep_search` or `codebase_search` to find similar functionality
- **Check common utility directories**: `src/utils/`, `src/helpers/`, `src/functions/`
- **Review existing mapping files**: `src/utils/mappings.js` contains comprehensive mapping data
- **Examine import patterns**: Look at how other components import utilities
- **Verify naming conventions**: Follow existing patterns rather than creating new ones

**Example**: Always use existing `src/utils/mappings.js` for province/branch/department mappings instead of creating new mapping utilities.

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

# AI Context & Development Guidelines

## Critical Development Reminders

### 🚨 ALWAYS CHECK EXISTING UTILITIES FIRST

Before creating any new utility functions, mappings, or helper files, **ALWAYS** check these locations:

- `src/utils/mappings.js` - Contains comprehensive mapping data for roles, departments, provinces, branches, etc.
- `src/utils/` - All utility functions
- `src/components/` - Reusable components
- `src/hooks/` - Custom hooks

**Why:** I previously created duplicate utility functions without checking existing `mappings.js`, causing redundancy and confusion.

### 🏷️ ALWAYS USE USER-FRIENDLY MAPPINGS

**CRITICAL**: All UI components MUST use user-friendly names from `src/utils/mappings.js`

```javascript
// ❌ WRONG - Don't show technical codes directly
<Text>NSN002</Text>
<Select.Option value="NSN002">NSN002</Select.Option>

// ✅ CORRECT - Use mapping utilities for user-friendly names
import { getBranchName, getProvinceName, getDepartmentName } from 'utils/mappings';

<Text>{getBranchName('NSN002')}</Text> // "สาขาตาคลี"
<Select.Option value="NSN002">{getBranchName('NSN002')}</Select.Option>

// ✅ CORRECT - Show both friendly name and code when needed
<Text>{getBranchName('NSN002')} ({branchCode})</Text> // "สาขาตาคลี (NSN002)"
```

**Pattern to Follow:**

1. **Primary Display**: Always show user-friendly names first
2. **Secondary Info**: Show technical codes in parentheses or smaller text
3. **Consistent Import**: Always import from `utils/mappings.js`
4. **Error Handling**: Provide fallback for unmapped values

#### **Migration Strategy Implemented**:

- **File**: `src/utils/migrate-users-rbac.js`
- **Functions**: `migrateAllUsers()`, `checkMigrationStatus()`, `rollbackUserMigration()`
- **Backward Compatibility**: Maintains existing role structure while adding enhanced capabilities

#### **Architecture Decision**: NO Individual Permissions

**Rationale**: Individual permission overrides lead to:

- Security explosion (∞ combinations)
- Audit nightmare
- Permission creep
- Maintenance hell

**Instead**: Use structured approach:

1. **Enhanced Roles** (implemented) - Granular predefined roles
2. **Permission Groups** (implemented) - Bundles for complex scenarios
3. **Temporal Access** (implemented) - Time-bound role elevation
4. **Audit System** (implemented) - Complete change tracking

### 🔧 Component Prop Standards

#### GeographicBranchSelector

```javascript
// Required props and expected names
<GeographicBranchSelector
  province={provinceValue} // NOT selectedProvince
  respectRBAC={boolean} // Explicit RBAC control
  showBranchCode={boolean} // Display preferences
  disabled={boolean} // State control
/>
```

#### ProvinceSelector

```javascript
<ProvinceSelector
  respectRBAC={boolean} // Explicit RBAC control
  fetchOnMount={boolean} // Data loading control
  includeInactive={boolean} // Filtering control
/>
```

### 📋 Form Integration Best Practices

#### ✅ Correct Pattern for Dependent Selectors

```javascript
<Form.Item name="province">
  <ProvinceSelector
    onChange={(value) => form.setFieldsValue({ branch: null })}
  />
</Form.Item>

<Form.Item name="branch">
  <Form.Item noStyle shouldUpdate>
    {({ getFieldValue }) => (
      <GeographicBranchSelector
        province={getFieldValue('province')}
        disabled={!getFieldValue('province')}
      />
    )}
  </Form.Item>
</Form.Item>
```

#### ❌ Avoid Complex Nesting

- Don't nest multiple `Form.Item` with complex `shouldUpdate` logic
- Don't use `value` and `onChange` props inside Form.Item (use form control)
- Don't create circular prop dependencies

### 🗂️ File Organization Standards

```
src/
├── utils/
│   ├── mappings.js              # Central mapping data (CHECK FIRST!)
│   ├── rbac-enhanced.js         # Enhanced RBAC system
│   ├── migrate-users-rbac.js    # Migration utilities
│   └── ...
├── components/
│   ├── ProvinceSelector.js      # Geographic selectors
│   ├── GeographicBranchSelector.js
│   └── ...
└── Modules/
    └── Admin/
        └── UserManagement/
            └── index.js         # Enhanced with new RBAC
```

## Component Dependencies & Data Flow

### RBAC Data Flow

```
User Auth Data → Enhanced Role System → Permission Evaluation → UI Component Filtering
     ↓                    ↓                       ↓                      ↓
Firebase User    rbac-enhanced.js    usePermissions()    ProvinceSelector
                                                         GeographicBranchSelector
```

### Geographic Filtering Chain

```
User Selection → Province Filter → Branch Filter → RBAC Validation → Data Access
      ↓               ↓               ↓              ↓              ↓
  Form Values    ProvinceSelector  BranchSelector   hasPermission()  API Calls
```

---

**Last Updated**: December 2024  
**Context**: UserManagement RBAC Integration & Enhanced Role System Implementation
