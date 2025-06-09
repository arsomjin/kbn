# RBAC ProvinceId Integration Guide

## 🎯 Objective

Automatically inject `provinceId` into all data operations (fetch/submit) across 80+ business components without modifying each component individually.

## 🏗️ Architecture Overview

### **Centralized Solution Components**

1. **Enhanced LayoutWithRBAC** - Provides geographic context with data operation helpers
2. **useDataOperations Hook** - Standardized data operations with automatic provinceId injection
3. **Geographic Context** - Automatic data enhancement for submissions and filtering for fetches

## 📋 Implementation Strategy

### **Step 1: Wrap Components with Enhanced LayoutWithRBAC**

```javascript
// Before: Direct component
const SalesOrder = () => {
  // Component logic
  return <SalesOrderForm />;
};

// After: RBAC-wrapped with automatic provinceId injection
const SalesOrder = () => {
  return (
    <LayoutWithRBAC
      permission="sales.view"
      editPermission="sales.edit"
      title="รายการขาย"
      subtitle="Sales Management"
      requireBranchSelection={true}
      showAuditTrail={true}
      documentType="sales_order"
      autoInjectProvinceId={true} // ← Enable automatic provinceId injection
    >
      <SalesOrderContent />
    </LayoutWithRBAC>
  );
};
```

### **Step 2: Update Child Components to Use Geographic Context**

```javascript
// Child component receives enhanced geographic context
const SalesOrderContent = ({ geographic, auditTrail }) => {
  const { submitData, fetchData } = useDataOperations(geographic);

  // ✅ Automatic provinceId injection on submit
  const handleSubmit = async (formData) => {
    await submitData({
      collection: "sections/sales/orders",
      docId: formData.orderId,
      data: formData, // ← provinceId automatically added
      auditTrail,
    });
  };

  // ✅ Automatic geographic filtering on fetch
  const loadOrders = async () => {
    const orders = await fetchData({
      collection: "sections/sales/orders",
      filters: { status: "pending" },
      orderBy: { field: "createdAt", direction: "desc" },
    }); // ← Only returns data user can access

    setOrders(orders);
  };

  return <SalesForm onSubmit={handleSubmit} />;
};
```

### **Step 3: Module-Specific Configuration**

```javascript
// Different modules with different requirements

// 1. ACCOUNTING - Full audit trail + stepper
<LayoutWithRBAC
  permission="accounting.view"
  editPermission="accounting.edit"
  title="รับเงินประจำวัน"
  showAuditTrail={true}
  showStepper={true}
  steps={INCOME_DAILY_STEPS}
  documentType="income_daily"
  autoInjectProvinceId={true}
>

// 2. SALES - Branch selection + audit trail
<LayoutWithRBAC
  permission="sales.view"
  editPermission="sales.edit"
  title="การขาย"
  requireBranchSelection={true}
  showAuditTrail={true}
  documentType="sales_order"
  autoInjectProvinceId={true}
>

// 3. WAREHOUSE - Branch selection only
<LayoutWithRBAC
  permission="warehouse.view"
  editPermission="warehouse.edit"
  title="คลังสินค้า"
  requireBranchSelection={true}
  autoInjectProvinceId={true}
>

// 4. HR - Centralized, no branch selection
<LayoutWithRBAC
  permission="hr.view"
  editPermission="hr.edit"
  title="ทรัพยากรบุคคล"
  requireBranchSelection={false}
  autoInjectProvinceId={false} // HR might be centralized
>
```

## 🔧 Enhanced Geographic Context API

### **Automatic Data Enhancement**

```javascript
const { geographic } = props; // From LayoutWithRBAC

// 1. Get submission data with provinceId
const submissionData = geographic.getSubmissionData();
// Returns: { branchCode, provinceId, recordedProvince, recordedBranch, recordedAt }

// 2. Enhance any data for submission
const enhancedFormData = geographic.enhanceDataForSubmission(formData);
// Automatically adds: branchCode, provinceId, recordedProvince, recordedBranch, recordedAt

// 3. Get query filters for fetching
const queryFilters = geographic.getQueryFilters();
// Returns: { branchCode, provinceId } - for filtering queries

// 4. Filter fetched data by user access
const accessibleData = geographic.filterFetchedData(allData, (item) => ({
  provinceId: item.provinceId,
  branchCode: item.branchCode,
}));
```

## 📊 Implementation Priority

### **High Priority (Core Business Operations)**

1. **Account Modules** - Income Daily ✅, Expenses, Bank Deposits
2. **Sales Modules** - Vehicle Sales, Parts Sales, Service Bookings
3. **Warehouse Modules** - Import/Export, Delivery, Inventory

### **Medium Priority (Reports & Analytics)**

4. **Report Modules** - Financial Reports, Inventory Reports, Sales Reports
5. **Service Modules** - Service Orders, Maintenance Records

### **Low Priority (Admin & Support)**

6. **HR Modules** - Leave Management, Payroll
7. **Settings Modules** - User Management, System Configuration

## 🚀 Migration Steps for Each Module

### **Step 1: Identify Module Structure**

```bash
# Find all main component entry points
find src/Modules -name "index.js" -type f | grep -E "(Account|Sales|Warehouse|Service|HR)"
```

### **Step 2: Apply Wrapper Pattern**

```javascript
// Template for each module main component
const ModuleName = () => {
  return (
    <LayoutWithRBAC
      permission="[module].view"
      editPermission="[module].edit"
      title="[Module Title]"
      subtitle="[Module Subtitle]"
      requireBranchSelection={true}
      showAuditTrail={true}
      documentType="[document_type]"
      autoInjectProvinceId={true}
    >
      <ModuleContent />
    </LayoutWithRBAC>
  );
};
```

### **Step 3: Update Data Operations**

```javascript
// Replace manual data operations with standardized hook
const ModuleContent = ({ geographic, auditTrail }) => {
  const { submitData, fetchData, enhanceForSubmission } =
    useDataOperations(geographic);

  // Use standardized operations everywhere
  const handleSave = async (data) => {
    await submitData({
      collection: "sections/[module]/[documents]",
      docId: data.id,
      data,
      auditTrail,
    });
  };
};
```

## 💡 Benefits Achieved

### **For Developers**

- ✅ **Consistent Implementation** - Same pattern across all modules
- ✅ **Automatic Geographic Compliance** - No manual provinceId handling
- ✅ **Reduced Code Duplication** - Centralized data operations
- ✅ **Error Prevention** - Standardized permission/access checks

### **For Business Users**

- ✅ **Data Integrity** - All records have correct geographic information
- ✅ **Access Control** - Users only see data they're authorized to access
- ✅ **Audit Compliance** - Complete tracking of data changes
- ✅ **Multi-Province Support** - Seamless operation across provinces

### **For System Administrators**

- ✅ **Centralized Control** - RBAC changes affect entire system
- ✅ **Geographic Filtering** - Automatic data isolation by location
- ✅ **Compliance Reporting** - Built-in audit trails
- ✅ **Scalability** - Easy to add new provinces/branches

## 🎯 Expected Outcome

After implementing this pattern across all 80+ components:

1. **100% Geographic Compliance** - All data operations include provinceId
2. **Consistent User Experience** - Same RBAC behavior everywhere
3. **Zero Manual provinceId Handling** - Automatic injection/filtering
4. **Future-Proof Architecture** - Easy to extend for additional provinces
5. **Audit-Ready System** - Complete tracking and compliance

## 🔧 Next Steps

1. **Test Enhanced LayoutWithRBAC** with IncomeDaily ✅
2. **Apply to High Priority Modules** (Account, Sales, Warehouse)
3. **Validate Data Operations** - Ensure provinceId in all submissions
4. **Test Geographic Filtering** - Verify users see only authorized data
5. **Roll out to Remaining Modules** - Complete system-wide implementation
