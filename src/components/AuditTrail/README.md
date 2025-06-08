# 🚀 KBN Audit Trail System

**Complete audit trail solution with RBAC integration, geographic filtering, and stepper workflow support**

## 📋 Overview

The KBN Audit Trail System provides comprehensive document tracking and workflow management for the Kubota Benja-pol multi-province system. It's designed for easy integration into 80+ components with minimal code changes.

## ✨ Features

- **🔒 Full RBAC Integration** - Automatic permission checking and geographic filtering
- **🌍 Multi-Province Support** - Geographic context tracking for all operations
- **📊 Stepper Integration** - Workflow step tracking with audit trail alignment
- **⚡ One-Line Integration** - Drop-in compatibility with existing components
- **🛡️ Error Handling** - Comprehensive error tracking and recovery
- **📱 Responsive Design** - Works on all screen sizes
- **🎯 Performance Optimized** - Lazy loading, memoization, and caching

## 🚀 Quick Start

### Option 1: Super Easy Wrapper (Recommended)

```javascript
import { AuditTrailWrapper } from "components";

<AuditTrailWrapper
  documentType="income_daily"
  documentId={documentId}
  title="รับเงินประจำวัน"
  permission="accounting.view"
  steps={INCOME_STEPS}
  currentStep={activeStep}
>
  <YourExistingComponent />
</AuditTrailWrapper>;
```

### Option 2: Using the Hook Directly

```javascript
import { useAuditTrail } from "hooks/useAuditTrail";

const audit = useAuditTrail("income_daily", documentId, {
  steps: INCOME_STEPS,
  currentStep: activeStep,
});

// Use audit.saveWithCompleteAudit(), audit.permissions, etc.
```

## 📁 File Structure

```
src/
├── components/
│   ├── AuditTrail/
│   │   ├── AuditHistory.jsx          # Timeline display component
│   │   ├── AuditTrailSection.jsx     # Form integration component
│   │   ├── useAuditTrail.js          # Base audit trail hook
│   │   ├── types.js                  # JSDoc type definitions
│   │   ├── utils.js                  # Utility functions
│   │   ├── index.js                  # Component exports
│   │   ├── INTEGRATION_GUIDE.md      # Comprehensive integration guide
│   │   ├── MIGRATION_EXAMPLE.md      # Before/after migration example
│   │   └── README.md                 # This file
│   ├── AuditTrailWrapper.js          # One-line integration wrapper
│   └── layout/
│       └── LayoutWithRBAC.js  # Enhanced layout with audit trail
└── hooks/
    └── useAuditTrail.js              # Enhanced audit trail hook
```

## 🔧 Components

### AuditTrailWrapper

**One-line integration wrapper for any component**

```javascript
<AuditTrailWrapper
  documentType="income_daily"
  documentId={documentId}
  title="รับเงินประจำวัน"
  permission="accounting.view"
  steps={INCOME_STEPS}
  currentStep={activeStep}
>
  <YourComponent />
</AuditTrailWrapper>
```

### AuditHistory

**Timeline display of all audit trail entries**

- Shows user actions with timestamps
- Geographic context (province/branch)
- Change details with before/after values
- RBAC permission filtering
- Thai language support

### AuditTrailSection

**Form integration for edit/review/approval fields**

- Employee selectors with RBAC filtering
- Date pickers for workflow timestamps
- Permission-based field access
- Responsive layout

### useAuditTrail Hook

**Enhanced hook with complete workflow support**

```javascript
const audit = useAuditTrail("income_daily", documentId, {
  steps: INCOME_STEPS,
  currentStep: activeStep,
  collection: "sections/account/incomes",
});

// Available functions:
audit.saveWithCompleteAudit(); // Save with full audit trail
audit.updateStatus(); // Quick status updates
audit.advanceStep(); // Step progression
audit.approveDocument(); // Approval workflow
audit.rejectDocument(); // Rejection workflow
audit.permissions; // RBAC permission helpers
audit.geoContext; // Geographic context
```

## 🔒 RBAC Integration

### Automatic Permission Mapping

The system automatically maps document types to departments:

```javascript
'income_daily' → 'accounting.view', 'accounting.edit', 'accounting.approve'
'service_order' → 'service.view', 'service.edit', 'service.approve'
'vehicle_sales' → 'sales.view', 'sales.edit', 'sales.approve'
'inventory_import' → 'inventory.view', 'inventory.edit', 'inventory.approve'
'hr_attendance' → 'hr.view', 'hr.edit', 'hr.approve'
```

### Permission Helpers

```javascript
const { permissions } = audit;

permissions.canView; // Can view documents
permissions.canEdit; // Can edit documents
permissions.canReview; // Can review documents
permissions.canApprove; // Can approve documents
permissions.canDelete; // Can delete documents
permissions.canViewAuditDetails; // Can view audit details
```

## 🌍 Geographic Integration

All audit entries automatically include:

```javascript
{
  provinceId: "NMA",
  branchCode: "0450",
  recordedProvince: "นครราชสีมา",
  recordedBranch: "สำนักงานใหญ่",
  userProvince: "นครราชสีมา",
  userBranch: "0450"
}
```

## 📊 Stepper Integration

### Simple Stepper

```javascript
const SIMPLE_STEPS = [
  { title: "สร้างเอกสาร" },
  { title: "ตรวจสอบ" },
  { title: "อนุมัติ" },
  { title: "เสร็จสิ้น" },
];
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

## 🛠️ Configuration

### Document Type Mapping

```javascript
const TYPE_MAPPING = {
  income_daily: "accounting",
  income_vehicle: "accounting",
  income_service: "accounting",
  expense_daily: "accounting",
  service_order: "service",
  service_close: "service",
  parts_order: "sales",
  vehicle_sales: "sales",
  inventory_import: "inventory",
  inventory_export: "inventory",
  hr_attendance: "hr",
  hr_payroll: "hr",
};
```

### Custom Configuration

```javascript
const audit = useAuditTrail("income_daily", documentId, {
  collection: "sections/account/incomes",
  showGeographicInfo: true,
  showChangeDetails: true,
  excludeFields: ["tempId", "draft", "cache"],
  autoSave: true,
  departmentPermissions: "accounting",
  customConfig: {
    trackFieldChanges: ["total", "status", "items"],
    maxHistoryEntries: 100,
  },
});
```

## 📈 Performance

- **✅ Lazy Loading** - Audit history loaded on demand
- **✅ Memoization** - Permission calculations cached
- **✅ Geographic Caching** - Context cached per session
- **✅ Batched Updates** - Multiple changes batched together
- **✅ Cleanup** - Automatic cleanup of old entries

## 🔍 Debugging

```javascript
// Enable debug mode in development
const audit = useAuditTrail("income_daily", documentId, {
  customConfig: {
    debug: process.env.NODE_ENV === "development",
  },
});

// Check audit state
console.log("Audit State:", {
  auditTrail: audit.auditTrail,
  permissions: audit.permissions,
  geoContext: audit.geoContext,
  errors: audit.errors,
});
```

## 📚 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete integration examples
- **[Migration Example](./MIGRATION_EXAMPLE.md)** - Before/after migration example
- **[Types Documentation](./types.js)** - JSDoc type definitions

## 🚀 Migration

For existing components, migration is simple:

1. Replace `LayoutWithRBAC` with `AuditTrailWrapper`
2. Update save functions to use `audit.saveWithCompleteAudit()`
3. Add permission checks using `audit.permissions`
4. Test and deploy

**Time estimate**: 5-10 minutes per component

## 📞 Support

The audit trail system is designed to be:

- **Drop-in compatible** with existing components
- **Minimal changes required** for integration
- **Enhanced functionality** without complexity
- **Production ready** with comprehensive error handling

For integration help, check the debug logs and verify RBAC permissions are configured correctly.
