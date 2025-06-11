# Clean Slate RBAC Implementation for KBN

## Overview

This is the **clean slate RBAC (Role-Based Access Control) system** for the KBN multi-province platform, implementing a **4×3×6 orthogonal permission system** that replaces the complex legacy role-based approach with a simple, scalable permission-based system.

## 🎯 Core Principles

1. **Permission-Based**: Uses `department.action` format instead of complex roles
2. **Orthogonal Design**: 4 Authority × 3 Geographic × 6 Departments
3. **Zero Complexity**: Simple permission checking, no nested role hierarchies
4. **Geographic Integration**: Automatic provinceId injection and branch filtering
5. **Clean Implementation**: No legacy baggage, built from scratch
6. **Mock Data Prohibition**: Always connect to real data or state limitations

## 🏗️ System Architecture

### Authority Levels (4)

- **`admin`**: System administration
- **`province`**: Province-level management
- **`branch`**: Branch-level management
- **`department`**: Department-specific operations

### Geographic Scopes (3)

- **`multi-province`**: Cross-province access
- **`province`**: Single province access
- **`branch`**: Single branch access

### Departments (6)

- **`accounting`**: Financial operations
- **`sales`**: Vehicle and parts sales
- **`service`**: Maintenance and repairs
- **`inventory`**: Stock management
- **`hr`**: Human resources
- **`admin`**: System administration

## 📋 Permission Format

All permissions follow the format: `department.action`

### Available Actions

- **`view`**: Read access
- **`edit`**: Create/update access
- **`approve`**: Approval workflow access
- **`manage`**: Administrative access
- **`reports`**: Reporting access

### Examples

```javascript
"accounting.view"; // View accounting data
"sales.edit"; // Create/edit sales records
"service.approve"; // Approve service orders
"admin.system"; // System administration
"reports.province"; // Province-level reports
```

## 🚀 Quick Start

### 1. Basic Permission Check

```javascript
import { useCleanSlatePermissions } from "hooks/useCleanSlatePermissions";

const MyComponent = () => {
  const { hasPermission } = useCleanSlatePermissions();

  const canViewAccounting = hasPermission("accounting.view");
  const canEditSales = hasPermission("sales.edit");

  return (
    <div>
      {canViewAccounting && <AccountingData />}
      {canEditSales && <SalesForm />}
    </div>
  );
};
```

### 2. Permission Gate Component

```javascript
import PermissionGate from "components/PermissionGate";

const App = () => (
  <div>
    {/* Single permission */}
    <PermissionGate permission="accounting.view">
      <AccountingReports />
    </PermissionGate>

    {/* Multiple permissions (any of) */}
    <PermissionGate anyOf={["sales.edit", "sales.approve"]}>
      <SalesForm />
    </PermissionGate>

    {/* Authority level check */}
    <PermissionGate authority="admin">
      <AdminPanel />
    </PermissionGate>
  </div>
);
```

### 3. Layout with RBAC Integration

```javascript
import LayoutWithRBAC from "components/layout/LayoutWithRBAC";

const IncomeDailyPage = () => (
  <LayoutWithRBAC
    title="รับเงินประจำวัน"
    subtitle="Daily Income Management"
    permission="accounting.view"
    editPermission="accounting.edit"
    requireBranchSelection={false}
    autoInjectProvinceId={true}
  >
    <IncomeDailyContent />
  </LayoutWithRBAC>
);
```

## 📁 File Structure

```
src/
├── utils/
│   └── clean-slate-rbac.js           # Core RBAC utilities
├── hooks/
│   └── useCleanSlatePermissions.js   # Main permission hook
├── components/
│   ├── PermissionGate.js   # Permission gate component
│   └── layout/
│       └── LayoutWithRBAC.js # Layout with RBAC
├── examples/
│   └── CleanSlateRBACDemo.js         # Comprehensive demo
└── rbac/
    └── README.md                     # This file
```

## 🔧 Core Components

### PermissionGate

Permission-based component rendering:

```javascript
<PermissionGate
  permission="accounting.view" // Required permission
  anyOf={["sales.edit", "sales.approve"]} // Alternative permissions
  allOf={["accounting.view", "reports.view"]} // Required permissions
  authority="admin" // Authority level check
  department="accounting" // Department access check
  geographic={{ provinceId: "NS001" }} // Geographic context
  fallback={<AccessDenied />} // Fallback content
  debug={true} // Enable debug logging
>
  <ProtectedContent />
</PermissionGate>
```

### useCleanSlatePermissions Hook

Core permission utilities:

```javascript
const {
  // Permission checking
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  // Authority checks
  isAdmin,
  isProvinceLevel,
  isBranchLevel,
  isDepartmentLevel,
  hasAuthorityLevel,

  // Department checks
  worksInDepartment,
  primaryDepartment,
  departmentPermissions,

  // Geographic access
  canAccessProvince,
  canAccessBranch,
  accessibleProvinces,
  accessibleBranches,

  // Data utilities
  filterDataByUserAccess,
  getQueryFilters,
  enhanceDataForSubmission,

  // User context
  userRBAC,
  authority,
  departments,
} = useCleanSlatePermissions();
```

### LayoutWithRBAC

Enhanced layout with integrated RBAC:

```javascript
<LayoutWithRBAC
  title="Page Title"
  subtitle="Page Subtitle"
  permission="required.permission"
  editPermission="edit.permission"
  authority="admin"
  department="accounting"
  requireBranchSelection={true}
  requireProvinceSelection={false}
  autoInjectProvinceId={true}
  showGeographicSelector={true}
  showBreadcrumb={true}
  showUserInfo={true}
  breadcrumbItems={[{ title: "Home", href: "/" }, { title: "Current Page" }]}
>
  <PageContent />
</LayoutWithRBAC>
```

## 🎨 Convenience Components

Pre-configured department gates:

```javascript
import {
  AccountingGate,
  SalesGate,
  ServiceGate,
  InventoryGate,
  AdminGate
} from 'components/PermissionGate';

// Department-specific gates
<AccountingGate action="view">
  <AccountingReports />
</AccountingGate>

<SalesGate action="edit">
  <SalesForm />
</SalesGate>

<AdminGate action="system">
  <AdminPanel />
</AdminGate>
```

## 📍 Geographic Data & ProvinceId Injection System

The Clean Slate RBAC system includes a comprehensive **ProvinceId Injection** mechanism that automatically enhances data with geographic identifiers for consistent multi-province operations.

### 🎯 **LayoutWithRBAC - Enhanced ProvinceId Injection**

The `LayoutWithRBAC` component provides **automatic provinceId injection** through multiple mechanisms:

#### **1. Automatic Data Enhancement**

```javascript
import LayoutWithRBAC from "components/layout/LayoutWithRBAC";

// Component automatically enhances all data submissions
<LayoutWithRBAC
  title="รับเงินประจำวัน"
  permission="accounting.view"
  editPermission="accounting.edit"
  autoInjectProvinceId={true} // 🎯 KEY FEATURE
  requireBranchSelection={false}
  onBranchChange={handleGeographicChange}
  showAuditTrail={true}
  documentId={documentId}
  documentType="income_daily"
>
  <YourComponent />
</LayoutWithRBAC>;
```

#### **2. Enhanced Geographic Context Injection**

Your child components automatically receive an enhanced `geographic` prop:

```javascript
// In your component (receives these props automatically)
const YourComponent = ({ geographic }) => {
  // 🎯 AUTOMATIC PROVINCEID INJECTION
  console.log(geographic.provinceId); // Auto-injected current province
  console.log(geographic.branchCode); // Auto-injected current branch

  // 🎯 ENHANCED DATA SUBMISSION
  const handleSubmit = async (formData) => {
    // Automatically enhances data with geographic identifiers
    const enhancedData = geographic.enhanceDataForSubmission(formData);

    console.log(enhancedData);
    /*
    {
      ...formData,
      provinceId: "NMA",              // Auto-injected
      branchCode: "0450",             // Auto-injected
      geographicContext: {            // Audit trail metadata
        provinceId: "NMA",
        branchCode: "0450",
        provinceName: "นครราชสีมา",
        branchName: "สำนักงานใหญ่",
        recordedAt: 1703123456789
      }
    }
    */
  };

  // 🎯 QUICK SUBMISSION DATA
  const submissionData = geographic.getSubmissionData();
  /*
  {
    branchCode: "0450",
    provinceId: "NMA", 
    provinceName: "นครราชสีมา",
    branchName: "สำนักงานใหญ่",
    recordedProvince: { provinceId: "NMA" },
    recordedBranch: { branchCode: "0450" },
    recordedAt: 1703123456789
  }
  */

  // 🎯 ENHANCED QUERY FILTERS
  const filters = geographic.getQueryFilters();
  /*
  {
    provinceId: "NMA",        // Current province filter
    branchCode: "0450",       // Current branch filter
    userAccess: [...]         // User's access permissions
  }
  */

  // 🎯 DATA FILTERING BY ACCESS
  const visibleData = geographic.filterDataByAccess(allData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });
};
```

#### **3. Audit Trail Integration with ProvinceId**

```javascript
// Components receive auditTrail prop when showAuditTrail={true}
const YourComponent = ({ auditTrail, geographic }) => {
  const handleSave = async (data) => {
    // Audit trail automatically includes geographic context
    await auditTrail.saveWithAuditTrail({
      collection: "sections/account/incomes",
      data: data, // Will be enhanced with provinceId
      isEdit: true,
      oldData: existingData,
      notes: "บันทึกรายการรับเงิน",
    });

    // Data is automatically enhanced:
    /*
    {
      ...data,
      provinceId: "NMA",              // Auto-injected
      branchCode: "0450",             // Auto-injected  
      geographicContext: {            // Audit metadata
        provinceId: "NMA",
        branchCode: "0450",
        provinceName: "นครราชสีมา",
        branchName: "สำนักงานใหญ่",
        recordedAt: 1703123456789
      }
    }
    */
  };
};
```

#### **4. Geographic Access Control & Warnings**

The layout automatically shows warnings for geographic access violations:

```javascript
// Automatically shows warnings when:
// 1. Required geographic selections are missing
// 2. User doesn't have access to selected locations

<LayoutWithRBAC
  requireProvinceSelection={true} // Shows warning if no province selected
  requireBranchSelection={true} // Shows warning if no branch selected
>
  {/* Content only shown when requirements met */}
</LayoutWithRBAC>
```

### 🔧 **Manual ProvinceId Injection (Alternative)**

For components not using `LayoutWithRBAC`:

```javascript
import { useCleanSlatePermissions } from "hooks/useCleanSlatePermissions";

const YourComponent = () => {
  const { enhanceDataForSubmission, getGeographicContext } =
    useCleanSlatePermissions();

  const handleSubmit = async (data) => {
    // Manual enhancement
    const enhancedData = enhanceDataForSubmission(data);
    console.log(enhancedData.provinceId); // Auto-injected based on user context
  };
};
```

### 📊 **ProvinceId Injection Configuration**

#### **Layout Component Props**

```javascript
<LayoutWithRBAC
  // Geographic Requirements
  requireProvinceSelection={boolean}     // Require province selection
  requireBranchSelection={boolean}       // Require branch selection

  // Auto-injection Controls
  autoInjectProvinceId={boolean}         // Enable/disable auto-injection (default: true)

  // Geographic Display
  showGeographicSelector={boolean}       // Show province/branch selectors

  // Audit Trail Integration
  showAuditTrail={boolean}              // Enable audit trail with geo data
  documentId={string}                   // Document ID for audit
  documentType={string}                 // Document type for audit

  // Workflow Integration
  showStepper={boolean}                 // Show workflow stepper
  steps={stepArray}                     // Workflow steps
  currentStep={number}                  // Current step index

  // Callbacks
  onBranchChange={function}             // Called when geographic selection changes
/>
```

#### **Child Component Props (Auto-injected)**

```javascript
// Your components automatically receive:
{
  geographic: {
    // Selection State
    selectedProvince: string,
    selectedBranch: string,

    // Auto-injected Data (when autoInjectProvinceId=true)
    provinceId: string,           // Current province ID
    branchCode: string,           // Current branch code

    // User-friendly Names
    provinceName: string,         // "นครราชสีมา"
    branchName: string,           // "สำนักงานใหญ่"

    // Data Enhancement Functions
    enhanceDataForSubmission: (data) => enhancedData,
    getSubmissionData: () => submissionData,
    getQueryFilters: () => filters,
    filterDataByAccess: (data, mapping) => filteredData,

    // Access Control
    canAccessProvince: (provinceId) => boolean,
    canAccessBranch: (branchCode) => boolean,
    accessibleProvinces: string[],
    accessibleBranches: string[]
  },

  // Edit Permissions
  canEdit: boolean,

  // User Context
  userRBAC: object,

  // Audit Trail (when showAuditTrail=true)
  auditTrail: {
    documentId: string,
    documentType: string,
    saveWithAuditTrail: async (options) => result
  },

  // Stepper Info (when showStepper=true)
  stepperInfo: {
    steps: array,
    currentStep: number
  }
}
```

### ✅ **Best Practices for ProvinceId Injection**

#### **1. Always Use Enhanced Data Submission**

```javascript
// ✅ CORRECT - Use geographic enhancement
const handleSubmit = async (formData) => {
  const enhancedData = geographic.enhanceDataForSubmission(formData);
  await saveToFirestore(enhancedData); // Includes provinceId + metadata
};

// ❌ WRONG - Manual injection prone to errors
const handleSubmit = async (formData) => {
  formData.provinceId = selectedProvince; // Missing metadata, error-prone
  await saveToFirestore(formData);
};
```

#### **2. Use Query Filters for Data Loading**

```javascript
// ✅ CORRECT - Use enhanced filters
const loadData = async () => {
  const filters = geographic.getQueryFilters();
  const data = await fetchData(filters); // Respects user access + current selection
};

// ❌ WRONG - Manual filtering
const loadData = async () => {
  const data = await fetchData({ provinceId: selectedProvince }); // Incomplete filtering
};
```

#### **3. Leverage Access Control**

```javascript
// ✅ CORRECT - Use built-in filtering
const visibleData = geographic.filterDataByAccess(allData, {
  provinceField: "provinceId",
  branchField: "branchCode",
});

// ❌ WRONG - Manual access checking
const visibleData = allData.filter(
  (item) => item.provinceId === selectedProvince // Doesn't respect user permissions
);
```

#### **4. Geographic Requirement Patterns**

```javascript
// For data entry forms - require branch selection
<LayoutWithRBAC
  requireBranchSelection={true}
  autoInjectProvinceId={true}
>
  <DataEntryForm />
</LayoutWithRBAC>

// For reports - don't require selection (shows all accessible data)
<LayoutWithRBAC
  requireBranchSelection={false}
  autoInjectProvinceId={false}
>
  <ReportsView />
</LayoutWithRBAC>
```

### 🚨 **Migration from Legacy LayoutWithRBAC**

The enhanced `LayoutWithRBAC` maintains compatibility with the existing `LayoutWithRBAC`:

```javascript
// Legacy usage still works
<LayoutWithRBAC
  title="รับเงินประจำวัน"
  permission="accounting.view"
  autoInjectProvinceId={true}
  onBranchChange={handleGeographicChange}
>
  <Component />
</LayoutWithRBAC>

// Enhanced clean slate version
<LayoutWithRBAC
  title="รับเงินประจำวัน"
  permission="accounting.view"
  autoInjectProvinceId={true}
  onBranchChange={handleGeographicChange}
  showAuditTrail={true}        // NEW: Enhanced audit trail
  showStepper={true}           // NEW: Workflow support
  steps={WORKFLOW_STEPS}       // NEW: Step definitions
>
  <Component />
</LayoutWithRBAC>
```

### 📈 **Performance Optimization**

The provinceId injection system is optimized for performance:

- **Memoized Geographic Context**: Prevents unnecessary re-renders
- **Selective Enhancement**: Only enhances data when needed
- **Efficient Access Checks**: Cached permission evaluations
- **Minimal Re-computation**: Smart dependency tracking

## 🎭 Role Presets

Quick setup configurations for common roles:

```javascript
import { ROLE_PRESETS } from "utils/clean-slate-rbac";

// Available presets:
ROLE_PRESETS.ADMIN;
ROLE_PRESETS.PROVINCE_MANAGER;
ROLE_PRESETS.BRANCH_MANAGER;
ROLE_PRESETS.ACCOUNTING_STAFF;
ROLE_PRESETS.SALES_STAFF;

// Example usage:
const accountingStaff = {
  ...ROLE_PRESETS.ACCOUNTING_STAFF,
  allowedProvinces: ["นครสวรรค์"],
  allowedBranches: ["NSN001"],
};
```

## 🔄 Migration from Legacy RBAC

### Before (Old System)

```javascript
// Complex role checking
if (userRole === "ACCOUNTING_STAFF" || userRole === "BRANCH_MANAGER") {
  // Show content
}

// Role-based navigation
const menu = generateMenuForRole(userRole);
```

### After (Clean Slate)

```javascript
// Simple permission checking
<PermissionGate permission="accounting.view">
  {/* Content */}
</PermissionGate>;

// Permission-based navigation
const { generateNavigationPermissions } = useCleanSlatePermissions();
const menu = generateNavigationPermissions();
```

## 🧪 Testing

### Permission Testing

```javascript
describe("PermissionGate", () => {
  it("should grant access with correct permission", () => {
    const { getByText } = renderWithRBAC(
      <PermissionGate permission="accounting.view">
        <div>Protected Content</div>
      </PermissionGate>,
      { permissions: ["accounting.view"] }
    );

    expect(getByText("Protected Content")).toBeInTheDocument();
  });
});
```

### Hook Testing

```javascript
describe("useCleanSlatePermissions", () => {
  it("should check permissions correctly", () => {
    const { result } = renderHook(() => useCleanSlatePermissions(), {
      wrapper: ({ children }) => (
        <RBACProvider permissions={["sales.edit"]}>{children}</RBACProvider>
      ),
    });

    expect(result.current.hasPermission("sales.edit")).toBe(true);
    expect(result.current.hasPermission("admin.system")).toBe(false);
  });
});
```

## 📊 Performance Considerations

### Efficient Permission Checking

- Uses `useMemo` for expensive calculations
- Caches permission results
- Minimal re-renders with proper dependencies

### Geographic Optimization

- Lazy loading of geographic data
- Efficient filtering algorithms
- Reduced API calls with smart caching

## 🐛 Debugging

### Enable Debug Mode

```javascript
<PermissionGate permission="accounting.view" debug={true}>
  <Content />
</PermissionGate>
```

### Console Output

```
🔐 PermissionGate Debug: {
  permission: "accounting.view",
  userAuthority: "department",
  userPermissions: ["accounting.view", "accounting.edit"],
  userDepartments: ["accounting"]
}
✅ Access granted
```

## 🚨 Common Patterns

### Form Integration

```javascript
const FormComponent = () => {
  const { enhanceDataForSubmission, hasPermission } =
    useCleanSlatePermissions();

  return (
    <Form
      onFinish={(values) => {
        const enhanced = enhanceDataForSubmission(values);
        handleSubmit(enhanced);
      }}
    >
      <Form.Item name="description">
        <Input />
      </Form.Item>

      {hasPermission("accounting.approve") && (
        <Form.Item name="approved">
          <Switch />
        </Form.Item>
      )}
    </Form>
  );
};
```

### Conditional Rendering

```javascript
const { departmentPermissions } = useCleanSlatePermissions();

return (
  <div>
    {departmentPermissions.accounting.canView && <AccountingSection />}
    {departmentPermissions.sales.canEdit && <SalesForm />}
    {departmentPermissions.service.canManage && <ServiceAdmin />}
  </div>
);
```

### Navigation Filtering

```javascript
const { generateNavigationPermissions } = useCleanSlatePermissions();

const navigation = [
  {
    key: "accounting",
    permission: "accounting.view",
    title: "Accounting",
    children: [
      { key: "income", permission: "accounting.view", title: "Income Daily" },
      { key: "reports", permission: "accounting.reports", title: "Reports" },
    ],
  },
].filter((item) => generateNavigationPermissions().includes(item.permission));
```

## 📈 Best Practices

1. **Always use LayoutWithRBAC** for page-level components
2. **Wrap sensitive components** with PermissionGate
3. **Use convenience components** (AccountingGate, SalesGate, etc.) when possible
4. **Enable debug mode** during development
5. **Test permission scenarios** thoroughly
6. **Cache expensive operations** with useMemo/useCallback
7. **Handle loading states** gracefully
8. **Provide meaningful fallback content**

## 🎯 Implementation Checklist

- [ ] Replace LayoutWithRBAC with LayoutWithRBAC
- [ ] Update permission checks to use `department.action` format
- [ ] Remove old role-based conditional logic
- [ ] Add geographic context to forms
- [ ] Update navigation generation
- [ ] Test permission scenarios
- [ ] Update user management to new format
- [ ] Add audit logging for permission changes

---

**Status**: ✅ **READY FOR IMPLEMENTATION**  
**Next Steps**: Begin integration with existing modules starting with Income Daily  
**Documentation**: Complete with examples and testing patterns

For questions or support, refer to the comprehensive demo at `/examples/clean-slate-rbac-demo`.
