# ProvinceId Automatic Injection - Complete Example

## 🎯 Scenario: IncomeDailyVehicles Customer Search

**User Story**: A province manager in Nakhon Sawan searches for sale data by customer name or sale number. The system should automatically filter results to show only sales from their authorized branches/provinces.

## 🔍 **Before Enhancement (Current Behavior)**

### **Problem: No Geographic Filtering**

```javascript
// User searches for "สมชาย" in sales data
<DocSelector
  collection="sections/sales/vehicles"
  orderBy={['saleNo', 'firstName']}
  labels={['saleNo', 'firstName', 'lastName']}
/>

// Firebase Query (NO geographic filtering)
Firebase Query: {
  collection: "sections/sales/vehicles",
  where: [
    // Only search-based filters - NO provinceId!
    ["firstName_keywords", "array-contains", "สมชาย"]
  ]
}

// Results: ALL customers named "สมชาย" from ALL provinces
[
  { saleNo: "V2024001", firstName: "สมชาย", branchCode: "0450", provinceId: "นครราชสีมา" },
  { saleNo: "V2024002", firstName: "สมชาย", branchCode: "NSN001", provinceId: "นครสวรรค์" },
  { saleNo: "V2024003", firstName: "สมชาย", branchCode: "0450", provinceId: "นครราชสีมา" },
  // ... MORE from other provinces user shouldn't see
]
```

## 🚀 **After Enhancement (Automatic ProvinceId Injection)**

### **Step 1: LayoutWithRBAC Provides Geographic Context**

```javascript
<LayoutWithRBAC
  permission="accounting.view"
  editPermission="accounting.edit"
  title="รับเงินประจำวัน"
  autoInjectProvinceId={true} // ← Enable automatic injection
>
  <IncomeDailyContent />
</LayoutWithRBAC>
```

### **Step 2: Enhanced Geographic Context**

```javascript
// LayoutWithRBAC creates enhanced geographic context
const enhancedGeographic = {
  branchCode: "NSN001",
  provinceId: "นครสวรรค์",

  // Query filters for fetching data
  getQueryFilters: () => ({
    branchCode: "NSN001",
    provinceId: "นครสวรรค์",
  }),

  // Enhanced data for submissions
  enhanceDataForSubmission: (data) => ({
    ...data,
    branchCode: "NSN001",
    provinceId: "นครสวรรค์",
    recordedProvince: "นครสวรรค์",
    recordedBranch: "NSN001",
    recordedAt: Date.now(),
  }),

  // Filter fetched data by geographic access
  filterFetchedData: (dataArray, getLocationFn) => {
    return dataArray.filter((item) => {
      const location = getLocationFn(item);
      return userCanAccess(location.branchCode, location.provinceId);
    });
  },
};
```

### **Step 3: Component Receives Geographic Context**

```javascript
const IncomeVehicles = ({ geographic }) => {
  return (
    <RenderSearch
      type="vehicles"
      geographic={geographic} // ← Pass geographic context
    />
  );
};

const RenderSearch = ({ type, geographic }) => {
  return (
    <DocSelector
      collection="sections/sales/vehicles"
      orderBy={["saleNo", "firstName"]}
      labels={["saleNo", "firstName", "lastName"]}
      geographic={geographic} // ← DocSelector receives geographic context
      respectRBAC={true} // ← Enable RBAC filtering
    />
  );
};
```

### **Step 4: DocSelector Automatically Adds Geographic Filters**

```javascript
const fetchSearchList = async (search) => {
  // Enhanced: Add geographic filters automatically
  let enhancedWheres = [];

  if (respectRBAC && geographic?.getQueryFilters) {
    const geoFilters = geographic.getQueryFilters();
    // geoFilters = { branchCode: "NSN001", provinceId: "นครสวรรค์" }

    // Auto-inject provinceId filter
    if (geoFilters.provinceId) {
      enhancedWheres.push(["provinceId", "==", "นครสวรรค์"]);
    }

    // Auto-inject branchCode filter (optional)
    if (geoFilters.branchCode) {
      enhancedWheres.push(["branchCode", "==", "NSN001"]);
    }
  }

  // Add search filters
  enhancedWheres.push(["firstName_keywords", "array-contains", "สมชาย"]);

  return await createOptionsFromFirestore({
    searchCollection: "sections/sales/vehicles",
    wheres: enhancedWheres, // ← Combined: search + geographic filters
  });
};
```

### **Step 5: Firebase Query with Geographic Filtering**

```javascript
// Enhanced Firebase Query (WITH automatic geographic filtering)
Firebase Query: {
  collection: "sections/sales/vehicles",
  where: [
    ["provinceId", "==", "นครสวรรค์"], // ← Automatically injected!
    ["branchCode", "==", "NSN001"],    // ← Automatically injected!
    ["firstName_keywords", "array-contains", "สมชาย"] // User's search
  ]
}

// Results: ONLY customers from user's authorized province/branch
[
  { saleNo: "V2024002", firstName: "สมชาย", branchCode: "NSN001", provinceId: "นครสวรรค์" },
  // No results from other provinces!
]
```

## 📊 **Comparison: Before vs After**

| Aspect            | Before             | After                            |
| ----------------- | ------------------ | -------------------------------- |
| **Query Filters** | Search only        | Search + provinceId + branchCode |
| **Results Scope** | All provinces      | User's authorized area only      |
| **Code Changes**  | N/A                | ✅ Zero manual changes needed    |
| **Security**      | ❌ Data leakage    | ✅ Geographic isolation          |
| **Performance**   | Slower (more data) | ✅ Faster (filtered data)        |

## 🔧 **Implementation for All 80+ Components**

### **1. Wrap Component with LayoutWithRBAC**

```javascript
// Before: Direct component
const SalesOrderList = () => {
  return (
    <div>
      <DocSelector collection="sections/sales/orders" />
    </div>
  );
};

// After: RBAC-wrapped with automatic provinceId injection
const SalesOrderList = () => {
  return (
    <LayoutWithRBAC
      permission="sales.view"
      title="รายการขาย"
      autoInjectProvinceId={true} // ← Enable automatic injection
    >
      <SalesOrderContent />
    </LayoutWithRBAC>
  );
};
```

### **2. Component Automatically Receives Geographic Context**

```javascript
const SalesOrderContent = ({ geographic }) => {
  return (
    <DocSelector
      collection="sections/sales/orders"
      geographic={geographic} // ← Pass context to DocSelector
      respectRBAC={true} // ← Enable filtering
    />
  );
};
```

### **3. Result: Automatic Geographic Filtering**

```javascript
// Automatic Firebase Query Enhancement:
// FROM: { collection: "sections/sales/orders" }
// TO:   {
//   collection: "sections/sales/orders",
//   where: [
//     ["provinceId", "==", user.province],
//     ["branchCode", "==", user.branch]
//   ]
// }
```

## 💡 **Key Benefits**

### **🔒 Security**

- **Zero Data Leakage**: Users only see authorized data
- **Automatic Enforcement**: No manual geographic checks needed
- **Role-Based Filtering**: Respects user's province/branch permissions

### **⚡ Performance**

- **Smaller Result Sets**: Queries return only relevant data
- **Faster Searches**: Less data to filter through
- **Optimized Indices**: Firebase can use provinceId for efficient queries

### **🛠️ Developer Experience**

- **Zero Code Changes**: Existing components work automatically
- **Consistent Behavior**: Same pattern across all modules
- **Error Prevention**: No forgotten geographic filters

### **👥 User Experience**

- **Relevant Results**: Only see data they can actually work with
- **Faster Loading**: Smaller datasets load quicker
- **Clear Scope**: Obvious which province/branch they're viewing

## 🎯 **Expected Outcome**

After implementing this pattern:

1. **User searches "สมชาย"** in sales data
2. **System automatically adds** `provinceId: "นครสวรรค์"` to query
3. **Firebase returns only** sales from user's authorized province
4. **User sees relevant results** without data leakage
5. **Zero manual coding** required for geographic compliance

This achieves **100% geographic compliance** across all 80+ components with **minimal code changes**!
