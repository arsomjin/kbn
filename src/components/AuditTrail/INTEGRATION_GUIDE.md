# 🚀 Audit Trail Integration Guide

**Easy integration for 80+ KBN components with full RBAC and geographic support**

## 📋 Quick Start (3 Options)

### Option 1: Super Easy Wrapper (Recommended for most cases)

```javascript
import AuditTrailWrapper from "components/AuditTrailWrapper";

// Replace your existing layout wrapper
<AuditTrailWrapper
  documentType="income_daily"
  documentId={documentId}
  title="รับเงินประจำวัน"
  permission="accounting.view"
  steps={INCOME_DAILY_STEPS}
  currentStep={activeStep}
>
  <YourExistingComponent />
</AuditTrailWrapper>;
```

### Option 2: Using the Hook Directly

```javascript
import { useAuditTrail } from "hooks/useAuditTrail";

const YourComponent = () => {
  const audit = useAuditTrail("income_daily", documentId, {
    steps: INCOME_STEPS,
    currentStep: activeStep,
  });

  const handleSave = async (data) => {
    await audit.saveWithCompleteAudit({
      data,
      isEdit: true,
      notes: "บันทึกข้อมูล",
    });
  };

  return (
    <LayoutWithRBAC {...audit.getLayoutProps()}>
      <YourContent audit={audit} />
    </LayoutWithRBAC>
  );
};
```

### Option 3: Manual Integration (Full control)

```javascript
import LayoutWithRBAC from "components/layout/LayoutWithRBAC";
import { useAuditTrail } from "components/AuditTrail";

// Use existing LayoutWithRBAC with enhanced props
<LayoutWithRBAC
  documentId={documentId}
  documentType="income_daily"
  showAuditTrail={true}
  showStepper={true}
  steps={INCOME_STEPS}
  currentStep={activeStep}
>
  <YourComponent />
</LayoutWithRBAC>;
```

## 🔧 Component Type Integration Examples

### 1. Income/Expense Components

```javascript
<AuditTrailWrapper
  documentType="income_daily" // or "expense_daily"
  documentId={order.incomeId}
  title="รับเงินประจำวัน"
  permission="accounting.view"
  steps={INCOME_DAILY_STEPS}
  currentStep={props.activeStep}
  requireBranchSelection={false}
>
  <IncomeDaily />
</AuditTrailWrapper>
```

### 2. Service Components

```javascript
<AuditTrailWrapper
  documentType="service_order"
  documentId={serviceOrder.serviceId}
  title="ใบสั่งซ่อม"
  permission="service.view"
  steps={SERVICE_STEPS}
  currentStep={serviceOrder.step}
  collection="sections/service/orders"
>
  <ServiceOrder />
</AuditTrailWrapper>
```

### 3. Sales Components

```javascript
<AuditTrailWrapper
  documentType="vehicle_sales"
  documentId={saleOrder.saleId}
  title="ขายรถแทรกเตอร์"
  permission="sales.view"
  steps={SALES_STEPS}
  currentStep={saleOrder.salesStep}
  showAuditSection={true} // Show approval fields
>
  <VehicleSales />
</AuditTrailWrapper>
```

### 4. Inventory Components

```javascript
<AuditTrailWrapper
  documentType="inventory_import"
  documentId={importOrder.importId}
  title="นำเข้าสต็อก"
  permission="inventory.view"
  collection="sections/warehouses/imports"
  auditOptions={{
    excludeFields: ["tempId", "draft"],
  }}
>
  <InventoryImport />
</AuditTrailWrapper>
```

### 5. HR Components

```javascript
<AuditTrailWrapper
  documentType="hr_attendance"
  documentId={attendanceId}
  title="บันทึกเวลาการทำงาน"
  permission="hr.view"
  requireBranchSelection={true}
  auditOptions={{
    departmentPermissions: "hr",
  }}
>
  <AttendanceRecord />
</AuditTrailWrapper>
```

## 🎯 Advanced Usage Patterns

### Using the Hook in Child Components

```javascript
const MyFormComponent = ({ audit, permissions }) => {
  const handleSubmit = async (formData) => {
    try {
      // Option 1: Simple save
      await audit.saveWithCompleteAudit({
        data: formData,
        isEdit: isEditMode,
        notes: "บันทึกแบบฟอร์ม",
      });

      // Option 2: Save with step advancement
      await audit.saveWithCompleteAudit({
        data: formData,
        isEdit: true,
        stepAdvancement: { from: 0, to: 1 },
        notes: "ไปยังขั้นตอนถัดไป",
      });

      // Option 3: Approval workflow
      if (permissions.canApprove) {
        await audit.approveDocument("อนุมัติเอกสาร");
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <Form onFinish={handleSubmit} loading={audit.isProcessing}>
      {/* Your form fields */}
    </Form>
  );
};
```

### Status Management

```javascript
const StatusControls = ({ audit }) => {
  const handleStatusChange = async (newStatus) => {
    await audit.updateStatus(newStatus, "เปลี่ยนสถานะ");
  };

  const handleApprove = async () => {
    await audit.approveDocument("อนุมัติโดยผู้จัดการ");
  };

  const handleReject = async (reason) => {
    await audit.rejectDocument(reason);
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={handleApprove}
        disabled={!audit.permissions.canApprove}
      >
        อนุมัติ
      </Button>

      <Button
        danger
        onClick={() => handleReject("เหตุผลการปฏิเสธ")}
        disabled={!audit.permissions.canApprove}
      >
        ปฏิเสธ
      </Button>
    </div>
  );
};
```

## 🔒 Permission Integration

The system automatically maps document types to departments:

```javascript
// Auto-detected permissions:
'income_daily' → 'accounting.view', 'accounting.edit', 'accounting.approve'
'service_order' → 'service.view', 'service.edit', 'service.approve'
'vehicle_sales' → 'sales.view', 'sales.edit', 'sales.approve'
'inventory_import' → 'inventory.view', 'inventory.edit', 'inventory.approve'
'hr_attendance' → 'hr.view', 'hr.edit', 'hr.approve'
```

### Custom Permission Mapping

```javascript
const audit = useAuditTrail("custom_doc", documentId, {
  departmentPermissions: "custom_department",
});
```

## 🌍 Geographic Integration

Automatically includes:

- Province context
- Branch context
- User's home province/branch
- Geographic filtering based on RBAC

```javascript
// Automatically added to all documents:
{
  provinceId: "NMA",
  branchCode: "0450",
  recordedProvince: "นครราชสีมา",
  recordedBranch: "สำนักงานใหญ่"
}
```

## 📊 Stepper Integration

### Simple Stepper

```javascript
const SIMPLE_STEPS = [
  { title: 'สร้างเอกสาร' },
  { title: 'ตรวจสอบ' },
  { title: 'อนุมัติ' },
  { title: 'เสร็จสิ้น' }
];

<AuditTrailWrapper
  steps={SIMPLE_STEPS}
  currentStep={activeStep}
  onStepClick={handleStepClick}
>
```

### Advanced Stepper with Status

```javascript
const ADVANCED_STEPS = [
  { title: "สร้างเอกสาร", status: "completed" },
  { title: "ตรวจสอบ", status: "current" },
  { title: "อนุมัติ", status: "pending" },
  { title: "เสร็จสิ้น", status: "pending" },
];
```

## 🛠️ Configuration Options

### Complete Configuration

```javascript
const audit = useAuditTrail("income_daily", documentId, {
  // Collection path
  collection: "sections/account/incomes",

  // Stepper integration
  steps: INCOME_STEPS,
  currentStep: 0,
  onStepChange: handleStepChange,

  // Display options
  showGeographicInfo: true,
  showChangeDetails: true,
  excludeFields: ["tempId", "draft", "cache"],

  // Auto-save options
  autoSave: true,
  saveOnMount: false,

  // Permission mapping
  departmentPermissions: "accounting",

  // Custom configuration
  customConfig: {
    trackFieldChanges: ["total", "status", "items"],
    maxHistoryEntries: 100,
  },
});
```

## 🚀 Migration Steps for Existing Components

### Step 1: Replace Layout Wrapper

```javascript
// Before:
<Container>
  <YourComponent />
</Container>

// After:
<AuditTrailWrapper
  documentType="your_doc_type"
  documentId={documentId}
  title="Your Title"
  permission="your.permission"
>
  <YourComponent />
</AuditTrailWrapper>
```

### Step 2: Update Save Functions

```javascript
// Before:
const handleSave = async (data) => {
  await firestore.collection("your_collection").doc(docId).set(data);
};

// After:
const handleSave = async (data) => {
  await audit.saveWithCompleteAudit({
    data,
    isEdit: isEditMode,
    notes: "บันทึกข้อมูล",
  });
};
```

### Step 3: Add Permission Checks

```javascript
// Use built-in permission helpers
<Button disabled={!audit.permissions.canEdit}>
  แก้ไข
</Button>

<Button disabled={!audit.permissions.canApprove}>
  อนุมัติ
</Button>
```

## 📈 Performance Considerations

- ✅ Lazy loading of audit history
- ✅ Memoized permission calculations
- ✅ Efficient geographic context caching
- ✅ Batched status updates
- ✅ Automatic cleanup of old entries

## 🔍 Debugging

```javascript
// Enable debug mode
const audit = useAuditTrail("income_daily", documentId, {
  customConfig: {
    debug: process.env.NODE_ENV === "development",
  },
});

// Check audit state
console.log("Audit Trail State:", {
  auditTrail: audit.auditTrail,
  permissions: audit.permissions,
  geoContext: audit.geoContext,
  errors: audit.errors,
});
```

## 📞 Support

For integration help or issues:

1. Check the console for audit trail debug logs
2. Verify RBAC permissions are configured correctly
3. Ensure geographic context is available
4. Test with development mode enabled

The robust audit trail system is designed to be drop-in compatible with minimal changes to existing components while providing comprehensive tracking and RBAC integration.
