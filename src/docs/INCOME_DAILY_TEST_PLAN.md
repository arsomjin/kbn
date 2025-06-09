# IncomeDaily End-to-End Testing Plan

## 🎯 **Test Objective**

Validate the complete automatic `provinceId` injection flow in IncomeDaily component from data fetching to submission.

## 🧪 **Test Environment Setup**

### **Prerequisites**

1. User logged in as **Province Manager** for **Nakhon Sawan**
2. User permissions: `accounting.view`, `accounting.edit`
3. User geographic access: `provinceId: "นครสวรรค์"`, `branchCode: "NSN001"`
4. Test data: Sales records in both provinces (Nakhon Ratchasima & Nakhon Sawan)

### **Test Data Setup**

```javascript
// Test sales records in Firestore
Sales Records in Database:
1. { saleNo: "V2024001", firstName: "สมชาย", provinceId: "นครราชสีมา", branchCode: "0450" }
2. { saleNo: "V2024002", firstName: "สมชาย", provinceId: "นครสวรรค์", branchCode: "NSN001" }
3. { saleNo: "V2024003", firstName: "สมศักดิ์", provinceId: "นครสวรรค์", branchCode: "NSN001" }
4. { saleNo: "V2024004", firstName: "สมศักดิ์", provinceId: "นครราชสีมา", branchCode: "0450" }
```

## 🔍 **Test Cases**

### **Test Case 1: Component Initialization**

#### **Steps:**

1. Navigate to **รับเงินประจำวัน** (IncomeDaily)
2. Select category: **ยานพาหนะ** (Vehicles)

#### **Expected Results:**

```javascript
✅ LayoutWithRBAC loads with:
   - autoInjectProvinceId: true
   - Geographic context created
   - User permissions validated
   - Branch selector shows user's accessible branches

✅ Console logs should show:
   - "Geographic context created: { provinceId: 'นครสวรรค์', branchCode: 'NSN001' }"
   - "Enhanced geographic context passed to children"
```

### **Test Case 2: Data Fetching - Sales Search**

#### **Steps:**

1. In the search field "ค้นหาจาก เลขที่ใบขายสินค้า/ชื่อลูกค้า"
2. Type: **"สมชาย"**
3. Observe search results

#### **Expected Results:**

```javascript
✅ DocSelector automatically enhances Firebase query:
   Original query: { collection: "sections/sales/vehicles", where: [["firstName_keywords", "array-contains", "สมชาย"]] }

   Enhanced query: {
     collection: "sections/sales/vehicles",
     where: [
       ["provinceId", "==", "นครสวรรค์"],  // ← Auto-injected!
       ["firstName_keywords", "array-contains", "สมชาย"]
     ]
   }

✅ Search results show ONLY:
   - V2024002: สมชาย (Nakhon Sawan) ✅ Visible
   - V2024001: สมชาย (Nakhon Ratchasima) ❌ Hidden (geographic filtering)

✅ Console logs should show:
   - "fetchSearchList with geographic filtering: { geoFilters: { provinceId: 'นครสวรรค์' } }"
   - "Query enhanced with provinceId filter"
```

### **Test Case 3: Data Fetching - Booking Search**

#### **Steps:**

1. In the booking search field "ค้นหาจาก เลขที่ใบจอง/ชื่อลูกค้า"
2. Type: **"สมศักดิ์"**
3. Observe search results

#### **Expected Results:**

```javascript
✅ Similar geographic filtering applied to bookings collection
✅ Only bookings from user's authorized province shown
✅ Console shows automatic provinceId injection
```

### **Test Case 4: Form Completion**

#### **Steps:**

1. Select a sale record from search results (e.g., V2024002)
2. Fill in additional required fields:
   - Customer information (auto-populated)
   - Payment amount: **50,000**
   - Payment method: **เงินสด**
3. Do NOT manually set any geographic fields

#### **Expected Results:**

```javascript
✅ Form populated with sale data
✅ No manual geographic field assignment needed
✅ Geographic context available in component props
```

### **Test Case 5: Data Submission**

#### **Steps:**

1. Click **บันทึกข้อมูล** (Save)
2. Confirm submission
3. Check Firestore document
4. Verify console logs

#### **Expected Results:**

#### **A. Before Enhancement (Form Data)**

```javascript
Original form data: {
  "incomeId": "INC-2024-001",
  "incomeCategory": "daily",
  "incomeSubCategory": "vehicles",
  "saleNo": "V2024002",
  "customerId": "CUST-001",
  "firstName": "สมชาย",
  "total": 50000,
  "payments": [{ "type": "cash", "amount": 50000 }]
}
```

#### **B. After Automatic Enhancement**

```javascript
Enhanced data submitted to Firestore: {
  // Original business data
  "incomeId": "INC-2024-001",
  "incomeCategory": "daily",
  "incomeSubCategory": "vehicles",
  "saleNo": "V2024002",
  "customerId": "CUST-001",
  "firstName": "สมชาย",
  "total": 50000,
  "payments": [{ "type": "cash", "amount": 50000 }],

  // 🚀 AUTOMATICALLY INJECTED FIELDS
  "provinceId": "นครสวรรค์",           // ← Auto-injected
  "branchCode": "NSN001",              // ← Auto-injected
  "recordedProvince": "นครสวรรค์",     // ← Auto-injected
  "recordedBranch": "NSN001",          // ← Auto-injected
  "recordedAt": 1703097600000,         // ← Auto-injected

  // Standard fields
  "created": 1703097600000,
  "createdBy": "user123",
  "status": "pending"
}
```

#### **C. Console Validation**

```javascript
✅ Console logs should show:
   - "Using enhanced geographic context for automatic provinceId injection"
   - "Data enhanced with geographic metadata"
   - "Enhanced data: { provinceId: 'นครสวรรค์', branchCode: 'NSN001', ... }"
   - "Document saved with automatic geographic compliance"
```

### **Test Case 6: Firestore Document Verification**

#### **Steps:**

1. Open Firebase Console
2. Navigate to: `sections/account/incomes/{incomeId}`
3. Verify document structure

#### **Expected Results:**

```javascript
✅ Document contains all required geographic fields:
   - provinceId: "นครสวรรค์"
   - branchCode: "NSN001"
   - recordedProvince: "นครสวรรค์"
   - recordedBranch: "NSN001"
   - recordedAt: [timestamp]

✅ Document is queryable by provinceId
✅ Geographic compliance validated
```

### **Test Case 7: Data Retrieval Validation**

#### **Steps:**

1. Create a report query filtering by provinceId
2. Verify the saved income record appears in province-specific queries

#### **Expected Results:**

```javascript
✅ Query with provinceId filter returns the new income record
✅ Cross-province queries do not return this record
✅ Geographic filtering works in both directions (save & retrieve)
```

## 🔧 **Developer Testing Commands**

### **Console Debugging**

```javascript
// In browser console, check geographic context
console.log("Geographic Context:", geographic);
console.log("Enhanced Data:", geographic?.enhanceDataForSubmission(testData));
console.log("Query Filters:", geographic?.getQueryFilters());
```

### **Firebase Query Testing**

```javascript
// Test query with provinceId filter
db.collection("sections/sales/vehicles")
  .where("provinceId", "==", "นครสวรรค์")
  .where("firstName_keywords", "array-contains", "สมชาย")
  .get()
  .then((snapshot) => console.log("Filtered results:", snapshot.docs.length));
```

### **Data Enhancement Testing**

```javascript
// Test enhancement function
const testData = { incomeId: "TEST-001", total: 10000 };
const enhanced = geographic.enhanceDataForSubmission(testData);
console.log("Enhanced:", enhanced);
// Should include provinceId, branchCode, recordedProvince, etc.
```

## 📊 **Success Criteria**

### **✅ Automatic Data Fetching**

- [ ] DocSelector queries include automatic provinceId filter
- [ ] Search results show only authorized geographic data
- [ ] No data leakage from other provinces
- [ ] Console logs confirm query enhancement

### **✅ Automatic Data Submission**

- [ ] Form data automatically enhanced with geographic fields
- [ ] No manual geographic field assignment needed
- [ ] Firestore document includes all required geographic metadata
- [ ] Geographic compliance flags set correctly

### **✅ End-to-End Flow**

- [ ] Complete flow works without manual intervention
- [ ] Data integrity maintained throughout
- [ ] Performance optimized with geographic filtering
- [ ] Error handling works correctly

### **❌ Failure Indicators**

- [ ] Search returns results from other provinces
- [ ] Submitted data missing provinceId or geographic fields
- [ ] Manual geographic field assignment required
- [ ] Console errors related to geographic context

## 🎯 **Expected Outcome**

After successful testing:

1. **Zero Manual Work**: Complete flow works without geographic field management
2. **100% Geographic Compliance**: All data includes proper provinceId
3. **Secure Data Access**: Users only see authorized data
4. **Optimized Performance**: Queries filtered at database level
5. **Ready for Rollout**: Pattern validated for deployment across 80+ components

This test validates that our automatic provinceId injection solutions work completely from **data fetching** → **form handling** → **data submission** → **data storage** with zero manual coding effort!
