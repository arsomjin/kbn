# ProvinceId Automatic Injection - Data Submission Example

## 🎯 Scenario: IncomeDaily Data Submission

**User Story**: A province manager in Nakhon Sawan creates an income record. The system should automatically inject `provinceId` and geographic metadata when saving to Firestore.

## 🔍 **Before Enhancement (Current Behavior)**

### **Problem: Manual Geographic Assignment**

```javascript
const _onConfirmOrder = async (values, resetToInitial) => {
  try {
    let mValues = JSON.parse(JSON.stringify(values));
    mValues.incomeCategory = 'daily';
    mValues.incomeSubCategory = category;

    // Manual geographic assignment (error-prone)
    mValues.branchCode = user.branch || '0450'; // ❌ Hardcoded fallback
    // ❌ NO provinceId assigned!
    // ❌ NO geographic tracking!

    // Save to Firestore
    const incomeRef = firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .doc(mValues.incomeId);

    await incomeRef.set(mValues);
  } catch (e) {
    showWarn(e);
  }
};

// Result: Data saved WITHOUT proper geographic information
Firestore Document: {
  "incomeId": "INC-2024-001",
  "incomeCategory": "daily",
  "customerId": "CUST-001",
  "firstName": "สมชาย",
  "total": 50000,
  "branchCode": "0450", // ❌ Hardcoded fallback
  // ❌ Missing provinceId!
  // ❌ Missing geographic metadata!
  // ❌ No compliance tracking!
  "created": 1703097600000,
  "createdBy": "user123"
}
```

## 🚀 **After Enhancement (Automatic ProvinceId Injection)**

### **Step 1: LayoutWithRBAC Provides Enhanced Geographic Context**

```javascript
<LayoutWithRBAC
  permission="accounting.view"
  editPermission="accounting.edit"
  title="รับเงินประจำวัน"
  autoInjectProvinceId={true} // ← Enable automatic injection
  documentId={documentId}
  documentType="income_daily"
>
  <IncomeDailyContent />
</LayoutWithRBAC>
```

### **Step 2: Enhanced Geographic Context Creation**

```javascript
// LayoutWithRBAC creates comprehensive geographic context
const enhancedGeographic = {
  // Basic geographic data
  branchCode: "NSN001",
  provinceId: "นครสวรรค์",
  provinceName: "นครสวรรค์",
  branchName: "สาขานครสวรรค์ 1",

  // User context
  userId: "user123",
  userRole: "PROVINCE_MANAGER",
  recordedAt: Date.now(),

  // Enhanced data for submissions
  enhanceDataForSubmission: (data) => {
    const enhancedData = {
      ...data,

      // Core geographic fields (REQUIRED)
      provinceId: "นครสวรรค์",
      branchCode: "NSN001",

      // Extended geographic metadata
      provinceName: "นครสวรรค์",
      branchName: "สาขานครสวรรค์ 1",

      // Compliance tracking
      recordedProvince: "นครสวรรค์",
      recordedBranch: "NSN001",
      recordedByRole: "PROVINCE_MANAGER",
      recordedAt: Date.now(),

      // Audit metadata
      geographicCompliance: true,
      rbacCompliant: true,

      // Geographic hash for validation
      geoHash: generateGeoHash("นครสวรรค์", "NSN001"),

      // Version tracking
      schemaVersion: "2.0",
      enhancementVersion: "1.0",
    };

    return enhancedData;
  },

  // Query filters for fetching
  getQueryFilters: () => ({
    branchCode: "NSN001",
    provinceId: "นครสวรรค์",
  }),
};
```

### **Step 3: Component Receives Geographic Context**

```javascript
const IncomeDailyContent = ({ geographic, auditTrail }) => {
  // Pass geographic context to child components
  const enhancedCurrentView = React.cloneElement(currentView, {
    ...currentView.props,
    geographic: geographic, // ← Pass geographic context
    auditTrail: auditTrail,
  });

  return enhancedCurrentView;
};

const IncomeVehicles = ({ onConfirm, geographic }) => {
  // Component calls onConfirm with geographic context available
  const handleSubmit = (formValues) => {
    onConfirm(formValues, resetToInitial, auditTrail);
  };

  return <Form onFinish={handleSubmit} />;
};
```

### **Step 4: Enhanced Submission Logic**

```javascript
const _onConfirmOrder = async (
  values,
  resetToInitial,
  auditTrailFromProps = null
) => {
  try {
    let mValues = JSON.parse(JSON.stringify(values));
    mValues.incomeCategory = "daily";
    mValues.incomeSubCategory = category;

    // 🚀 AUTOMATIC GEOGRAPHIC ENHANCEMENT
    if (geographic && geographic.enhanceDataForSubmission) {
      mValues = geographic.enhanceDataForSubmission(mValues);
    } else {
      // Fallback for components not yet enhanced
      Object.assign(mValues, geographic);
    }

    // Enhanced audit trail support
    if (auditTrailFromProps && !mProps.isEdit) {
      mValues.created = dayjs().valueOf();
      mValues.createdBy = user.uid;
      mValues.status = StatusMap.pending;

      // Save with automatic geographic compliance
      await auditTrailFromProps.saveWithAuditTrail({
        collection: "sections/account/incomes",
        data: mValues, // ← Already enhanced with geographic data
        isEdit: false,
        notes: `สร้างรายการรับเงินประจำวัน - ${IncomeDailyCategories[category]}`,
      });
    } else {
      // Fallback save (still enhanced)
      const incomeRef = firestore
        .collection("sections")
        .doc("account")
        .collection("incomes")
        .doc(mValues.incomeId);

      await incomeRef.set(mValues); // ← Enhanced data automatically saved
    }

    showSuccess("บันทึกข้อมูลสำเร็จ");
  } catch (e) {
    showWarn(e);
  }
};
```

### **Step 5: Enhanced Firestore Document**

```javascript
// Result: Comprehensive geographic data automatically injected
Firestore Document: {
  // Original business data
  "incomeId": "INC-2024-001",
  "incomeCategory": "daily",
  "customerId": "CUST-001",
  "firstName": "สมชาย",
  "total": 50000,
  "created": 1703097600000,
  "createdBy": "user123",

  // 🚀 AUTOMATICALLY INJECTED GEOGRAPHIC DATA
  "provinceId": "นครสวรรค์",           // ← Core field for queries
  "branchCode": "NSN001",              // ← Enhanced RBAC-compliant value
  "provinceName": "นครสวรรค์",         // ← Human-readable
  "branchName": "สาขานครสวรรค์ 1",      // ← Human-readable

  // 🚀 COMPLIANCE TRACKING
  "recordedProvince": "นครสวรรค์",     // ← Where it was recorded
  "recordedBranch": "NSN001",          // ← Which branch recorded it
  "recordedByRole": "PROVINCE_MANAGER", // ← User role at time of creation
  "recordedAt": 1703097600000,         // ← Timestamp of recording

  // 🚀 AUDIT METADATA
  "geographicCompliance": true,        // ← Compliance flag
  "rbacCompliant": true,               // ← RBAC compliance flag
  "geoHash": "NSW-NSN001-PM",          // ← Geographic validation hash

  // 🚀 VERSION TRACKING
  "schemaVersion": "2.0",              // ← Data schema version
  "enhancementVersion": "1.0"          // ← Enhancement version
}
```

## 📊 **Comparison: Before vs After**

| Aspect              | Before             | After                                  |
| ------------------- | ------------------ | -------------------------------------- |
| **Geographic Data** | `branchCode` only  | `provinceId` + `branchCode` + metadata |
| **Fallback Values** | Hardcoded `'0450'` | RBAC-compliant defaults                |
| **Code Changes**    | Manual assignment  | ✅ Automatic injection                 |
| **Compliance**      | ❌ No tracking     | ✅ Full compliance metadata            |
| **Audit Trail**     | Basic logging      | ✅ Geographic audit trail              |
| **Data Integrity**  | Inconsistent       | ✅ Standardized enhancement            |
| **Query Support**   | Limited filtering  | ✅ Optimized for geographic queries    |

## 🔧 **Implementation Pattern for All Components**

### **1. Original Component (Any Module)**

```javascript
// Before: Manual geographic handling
const OrderForm = () => {
  const handleSubmit = async (values) => {
    // Manual assignment (error-prone)
    values.branchCode = user.branch || "0450";
    // Missing provinceId!

    await firestore.collection("orders").add(values);
  };

  return <Form onFinish={handleSubmit} />;
};
```

### **2. Enhanced with LayoutWithRBAC**

```javascript
// After: Automatic geographic enhancement
const OrderForm = () => {
  return (
    <LayoutWithRBAC
      permission="sales.edit"
      title="สร้างใบสั่งซื้อ"
      autoInjectProvinceId={true} // ← Enable automatic injection
    >
      <OrderFormContent />
    </LayoutWithRBAC>
  );
};

const OrderFormContent = ({ geographic }) => {
  const handleSubmit = async (values) => {
    // 🚀 AUTOMATIC ENHANCEMENT
    const enhancedValues = geographic.enhanceDataForSubmission(values);

    // Enhanced data already includes:
    // - provinceId
    // - branchCode (RBAC-compliant)
    // - Geographic metadata
    // - Compliance tracking

    await firestore.collection("orders").add(enhancedValues);
  };

  return <Form onFinish={handleSubmit} />;
};
```

### **3. Result: Automatic Geographic Compliance**

```javascript
// Original data
{
  "productId": "P001",
  "quantity": 5,
  "total": 25000
}

// Automatically enhanced to:
{
  "productId": "P001",
  "quantity": 5,
  "total": 25000,

  // 🚀 AUTOMATIC ADDITIONS
  "provinceId": "นครสวรรค์",
  "branchCode": "NSN001",
  "provinceName": "นครสวรรค์",
  "branchName": "สาขานครสวรรค์ 1",
  "recordedProvince": "นครสวรรค์",
  "recordedBranch": "NSN001",
  "recordedByRole": "PROVINCE_MANAGER",
  "recordedAt": 1703097600000,
  "geographicCompliance": true,
  "rbacCompliant": true,
  "geoHash": "NSW-NSN001-PM"
}
```

## 💡 **Key Benefits of Automatic Injection**

### **🔒 Data Integrity**

- **Consistent Structure**: All documents have standardized geographic fields
- **No Missing Fields**: `provinceId` never forgotten or missing
- **RBAC Compliance**: Branch codes always respect user permissions
- **Validation Ready**: Built-in geographic validation hashes

### **⚡ Query Performance**

- **Optimized Indices**: Firebase can efficiently query by `provinceId`
- **Smaller Result Sets**: Geographic filtering at database level
- **Faster Aggregations**: Province-based reports run efficiently

### **🛠️ Developer Experience**

- **Zero Manual Work**: No geographic field assignment needed
- **Error Prevention**: Eliminates hardcoded fallbacks
- **Consistent API**: Same pattern across all 80+ components
- **Future-Proof**: Easy to add new geographic metadata

### **📊 Audit & Compliance**

- **Full Traceability**: Know exactly where/when/by-whom data was recorded
- **Compliance Reporting**: Easy to generate geographic compliance reports
- **Data Governance**: Built-in metadata for data management
- **Rollback Support**: Geographic context preserved for data recovery

## 🎯 **Expected Outcome**

After implementing this pattern across all 80+ components:

1. **User creates any record** (sale, expense, inventory, etc.)
2. **System automatically enhances** data with complete geographic metadata
3. **Firestore receives** fully compliant, queryable, auditable documents
4. **Zero manual coding** required for geographic compliance
5. **100% data consistency** across all modules

This achieves **complete geographic data integrity** with **zero additional developer effort**!

## 🚀 **Advanced: Using useDataOperations Hook**

For even simpler implementation, components can use the `useDataOperations` hook for standardized submissions:

### **1. Enhanced Component with useDataOperations**

```javascript
import { useDataOperations } from "hooks/useDataOperations";

const IncomeDailyContent = ({ geographic, auditTrail }) => {
  const { submitData, fetchData } = useDataOperations(geographic);

  const handleSubmit = async (formValues) => {
    try {
      // 🚀 ONE-LINE SUBMISSION with automatic enhancement
      await submitData({
        collection: "sections/account/incomes",
        docId: formValues.incomeId,
        data: formValues,
        isEdit: false,
        auditTrail: auditTrail,
      });

      // Data automatically enhanced with:
      // - provinceId
      // - branchCode
      // - Geographic metadata
      // - Compliance tracking
      // - Audit trail integration

      showSuccess("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      showError("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return <IncomeForm onSubmit={handleSubmit} />;
};
```

### **2. Automatic Data Enhancement Flow**

```javascript
// Original form data
const formValues = {
  incomeId: "INC-2024-001",
  customerId: "CUST-001",
  total: 50000,
  incomeCategory: "daily",
};

// submitData() automatically enhances to:
const enhancedData = {
  // Original business data
  incomeId: "INC-2024-001",
  customerId: "CUST-001",
  total: 50000,
  incomeCategory: "daily",

  // 🚀 AUTOMATIC GEOGRAPHIC ENHANCEMENT
  provinceId: "นครสวรรค์", // From geographic context
  branchCode: "NSN001", // From geographic context
  provinceName: "นครสวรรค์", // From geographic context
  branchName: "สาขานครสวรรค์ 1", // From geographic context

  // 🚀 COMPLIANCE & AUDIT METADATA
  recordedProvince: "นครสวรรค์", // Where recorded
  recordedBranch: "NSN001", // Which branch
  recordedByRole: "PROVINCE_MANAGER", // User role
  recordedAt: 1703097600000, // When recorded
  geographicCompliance: true, // Compliance flag
  rbacCompliant: true, // RBAC flag

  // 🚀 AUTOMATIC TIMESTAMPS
  createdAt: 1703097600000, // Auto-generated
  createdBy: "user123", // Current user
};

// Final result: Enhanced data saved to Firestore with full compliance
```

### **3. Multiple Collection Support**

```javascript
// Works seamlessly across all collections
const { submitData } = useDataOperations(geographic);

// Sales order
await submitData({
  collection: "sections/sales/vehicles",
  docId: saleId,
  data: saleData, // Automatically gets provinceId
});

// Expense record
await submitData({
  collection: "sections/account/expenses",
  docId: expenseId,
  data: expenseData, // Automatically gets provinceId
});

// Inventory record
await submitData({
  collection: "sections/stocks/vehicles",
  docId: stockId,
  data: stockData, // Automatically gets provinceId
});

// ALL automatically enhanced with geographic compliance!
```

### **4. Batch Operations with Geographic Enhancement**

```javascript
const { submitBatchData } = useDataOperations(geographic);

// Submit multiple related documents at once
await submitBatchData({
  operations: [
    {
      collection: "sections/sales/vehicles",
      docId: "SALE-001",
      data: saleData,
      operation: "set",
    },
    {
      collection: "sections/account/incomes",
      docId: "INC-001",
      data: incomeData,
      operation: "set",
    },
    {
      collection: "sections/stocks/vehicles",
      docId: "STK-001",
      data: stockData,
      operation: "update",
    },
  ],
});

// ALL documents automatically enhanced with provinceId + metadata!
```
