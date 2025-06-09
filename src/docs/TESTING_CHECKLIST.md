# 🧪 IncomeDaily Testing Checklist

## 🎯 **Quick Testing Guide**

### **1. Navigate to IncomeDaily**

- [ ] Go to **รับเงินประจำวัน** (Income Daily)
- [ ] Select **ยานพาหนะ** (Vehicles) category
- [ ] Verify LayoutWithRBAC loads with geographic context

### **2. Test Data Fetching (Search)**

- [ ] Type **"สมชาย"** in sales search field
- [ ] Open browser DevTools → Console
- [ ] Look for: `"fetchSearchList with geographic filtering"`
- [ ] Verify only authorized province data appears

### **3. Test Data Submission**

- [ ] Select a search result
- [ ] Fill required fields (amount, payment method)
- [ ] Click **บันทึกข้อมูล** (Save)
- [ ] Check console for: `"Data enhanced with geographic metadata"`

### **4. Verify Firestore Document**

- [ ] Open Firebase Console
- [ ] Navigate to: `sections/account/incomes`
- [ ] Find newest document
- [ ] Verify contains: `provinceId`, `branchCode`, `recordedProvince`

## ✅ **Success Indicators**

### **Console Logs To Look For:**

```
✅ "Geographic context created: { provinceId: 'นครสวรรค์', branchCode: 'NSN001' }"
✅ "fetchSearchList with geographic filtering: { geoFilters: { provinceId: 'นครสวรรค์' } }"
✅ "Using enhanced geographic context for automatic provinceId injection"
✅ "Enhanced data: { provinceId: 'นครสวรรค์', branchCode: 'NSN001', ... }"
```

### **Search Results Should:**

```
✅ Show ONLY sales from user's authorized province
❌ Hide sales from other provinces (security test)
```

### **Saved Document Should Include:**

```javascript
{
  // Business data...
  "provinceId": "นครสวรรค์",           // ← Auto-injected
  "branchCode": "NSN001",              // ← Auto-injected
  "recordedProvince": "นครสวรรค์",     // ← Auto-injected
  "recordedBranch": "NSN001",          // ← Auto-injected
  "recordedAt": [timestamp]            // ← Auto-injected
}
```

## 🚨 **Failure Indicators**

### **❌ Red Flags:**

- Search shows results from all provinces (data leakage!)
- Console errors about geographic context
- Saved document missing `provinceId` field
- Manual geographic field assignment needed

### **🔧 Debug Commands:**

```javascript
// In browser console:
console.log("Geographic Context:", geographic);
console.log("Query Filters:", geographic?.getQueryFilters());
```

## 🎯 **Expected Flow**

1. **Component loads** → Geographic context created automatically
2. **User searches** → Firebase query enhanced with `provinceId` filter
3. **Results filtered** → Only authorized data shown
4. **User submits** → Data enhanced with geographic metadata
5. **Document saved** → Full geographic compliance achieved

**Result**: 🚀 **Zero manual coding** for 100% geographic compliance!
