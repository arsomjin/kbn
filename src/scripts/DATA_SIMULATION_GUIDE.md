# 🚀 Province Expansion Data Simulation Guide

**Boss, this guide will help you simulate Nakhon Sawan data for testing the dual-search system!**

## 🎯 Purpose

This simulation creates realistic test data for **Nakhon Sawan province** to test:

- ✅ Dual-search functionality (accounting vs sale documents)
- ✅ RBAC geographic filtering
- ✅ Province expansion workflow
- ✅ Real API integration with proper data

## 📋 Quick Start

### Method 1: Browser Console (Recommended)

1. **Open your KBN app** in the browser
2. **Open browser console** (F12 → Console tab)
3. **Copy and paste** the entire content of `console-data-simulation.js`
4. **Run the simulation**:
   ```javascript
   await simulateData();
   ```

### Method 2: Custom Amounts

```javascript
// Create more documents for extensive testing
await simulateData({
  accountingDocs: 30, // 30 accounting documents
  saleDocs: 25, // 25 sale documents
});
```

### Method 3: Cleanup

```javascript
// Remove all simulated data when done testing
await cleanupSimulatedData();
```

## 📊 What Gets Created

### 🏢 Geographic Data

- **Province**: นครสวรรค์ (Nakhon Sawan)
- **Branches**: NSN001, NSN002, NSN003
- **RBAC Filtering**: Proper provinceId and branchCode fields

### 📈 Accounting Documents (25 default)

- **Document IDs**: `ACC-NSN-YYYYMMDD-XXX`
- **Categories**: vehicles, service, parts, other
- **Status**: draft, review, approved (mixed for testing)
- **Amounts**: Realistic ranges (80K-350K for vehicles, etc.)
- **Customers**: Thai names like "นายสมชาย เกษตรกรดี"

### 🛒 Sale Documents (20 default)

- **Document IDs**: `SO-NSN-YYYYMMDD-XXX`
- **Status**: approved (for reference in dual-search)
- **Vehicle Models**: L3408, L2202, L4508, etc.
- **Amounts**: 80K-350K range
- **Customers**: Varied Thai customer names

## 🔍 Testing Scenarios

After running the simulation, you can test:

### Search by Document ID

```
Search: "ACC-NSN"     → Find accounting documents
Search: "SO-NSN"      → Find sale documents
Search: "NSN001"      → Find documents from specific branch
```

### Search by Customer Name

```
Search: "สมชาย"       → Find documents for customers named Somchai
Search: "มาลี"        → Find documents for customers named Mali
Search: "กุโบต้า"     → Find company documents
```

### Search by Product

```
Search: "L3408"       → Find documents with specific tractor model
Search: "รถไถ"        → Find all tractor-related documents
```

### Test Dual-Search Mode

1. **Switch to "เอกสารอ้างอิง" (Sale Documents)**
2. **Search for approved sales** → Should show SO-NSN documents
3. **Select a sale document** → Should auto-populate accounting form
4. **Switch back to "เอกสารบัญชี" (Accounting Documents)**
5. **Search existing accounting docs** → Should show ACC-NSN documents

## 🏗️ Data Structure

### Sample Accounting Document

```javascript
{
  incomeId: "ACC-NSN-20241215-001",
  incomeCategory: "daily",
  incomeSubCategory: "vehicles",

  // Geographic (RBAC filtering)
  provinceId: "nakhon-sawan",
  province: "นครสวรรค์",
  branchCode: "NSN001",
  branch: "NSN001",

  // Customer
  customerName: "นายสมชาย เกษตรกรดี",
  customerId: "CUST-NSN-001",

  // Product
  vehicleModel: "L3408",
  productName: "รถไถเดินตาม L3408",

  // Financial
  amount: 125000,
  totalAmount: 125000,

  // Status & Dates
  status: "approved",
  date: "2024-12-01",
  created: 1734567890123,

  // Metadata
  createdBy: "sample-data-generator",
  description: "เอกสารรายได้ประจำวัน - vehicles (ข้อมูลตัวอย่าง)",

  // Simulation tracking
  _simulation: {
    type: "sample",
    simulatedAt: "2024-12-15T10:30:00.000Z",
    simulatedBy: "province-expansion-testing"
  }
}
```

## 🧹 Cleanup

**Important**: Always clean up simulated data after testing:

```javascript
await cleanupSimulatedData();
```

This removes all documents with `_simulation.simulatedBy === 'province-expansion-testing'`.

## 🔧 Troubleshooting

### Firebase Not Found

```
❌ Firebase not found! Make sure you are on the KBN app page.
```

**Solution**: Make sure you're on the actual KBN app page, not a blank tab.

### Permission Errors

```
❌ Missing or insufficient permissions
```

**Solution**: Make sure your user has proper RBAC permissions for the target province.

### Index Errors

```
❌ The query requires an index
```

**Solution**: Create the required Firestore indexes as prompted by Firebase.

## 🎉 Success Indicators

You'll know the simulation worked when:

1. ✅ Console shows: `🎉 SIMULATION COMPLETE!`
2. ✅ Total document count matches your request
3. ✅ You can search and find documents in the Income Daily screen
4. ✅ Dual-search mode works with both document types
5. ✅ RBAC filtering shows only Nakhon Sawan data (if your user has access)

## 📞 Support

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify your user has Nakhon Sawan province access
3. Ensure Firestore indexes are created
4. Try with smaller document counts first

**Happy Testing, Boss!** 🚀
