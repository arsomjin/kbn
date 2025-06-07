# 🎯 KBN RBAC Integration Plan - Complete 98 Pages

## **📋 Integration Overview**

**Total Pages**: 98 across 18 modules  
**Approach**: Systematic module-by-module integration  
**Timeline**: 4 phases over 8 weeks  
**Safety**: Zero business logic changes, RBAC overlay only

---

## **🚀 Current Progress Summary**

### **✅ COMPLETED (Phase 1 + Navigation + Account Foundation)**

| Component               | Status      | Details                                     |
| ----------------------- | ----------- | ------------------------------------------- |
| **RBAC Infrastructure** | ✅ Complete | All hooks, components, permissions system   |
| **Navigation System**   | ✅ Complete | 98 menu items with search, filtering, RBAC  |
| **Overview Module**     | ✅ Complete | Role-based dashboards, geographic switching |
| **Account Foundation**  | ✅ Complete | Layout component, geographic filtering      |

### **🔧 RBAC Integration Components Ready**

```javascript
// Reusable RBAC Components Available:
import {
  PermissionGate, // Permission-based component wrapping
  GeographicBranchSelector, // RBAC-filtered branch selection
  AccountLayoutWithRBAC, // Account page layout with geographic filtering
  RBACDataTable, // Table with geographic filtering
  usePermissions, // Permission checking hooks
  useGeographicData, // Geographic data filtering
} from "components";
```

---

## **🛠️ Account Module Integration Pattern**

### **1. Enhanced Page Structure**

```javascript
// OLD: Basic page without RBAC
const IncomePage = () => {
  const { user } = useSelector((state) => state.auth);
  // ... basic logic
  return <PageContent />;
};

// NEW: RBAC-enabled page with geographic filtering
const IncomePage = () => {
  const handleBranchChange = (geographic) => {
    // Geographic data: { branchCode, branchName, provinceId, recordedProvince }
    console.log("Selected branch:", geographic);
  };

  return (
    <AccountLayoutWithRBAC
      title="รับเงินประจำวัน"
      permission="accounting.view"
      editPermission="accounting.edit"
      onBranchChange={handleBranchChange}
    >
      <PageContent />
    </AccountLayoutWithRBAC>
  );
};
```

### **2. Data Persistence with Geographic Context**

```javascript
const saveIncomeData = async (values, geographic) => {
  const enrichedData = {
    ...values,
    // RBAC Geographic Context
    branchCode: geographic.branchCode,
    provinceId: geographic.provinceId,
    branchName: geographic.branchName,
    // Audit Trail
    recordedProvince: geographic.recordedProvince,
    recordedBranch: geographic.recordedBranch,
    recordedBy: user.uid,
    recordedAt: Date.now(),
  };

  await firestore.collection("account").doc("incomes").add(enrichedData);
};
```

---

## **📊 Next Phase Implementation Strategy**

### **Week 1: Complete Account Module (12 pages)**

**Immediate Next Steps**:

1. **Apply AccountLayoutWithRBAC to remaining Account pages**:

   - ✅ `IncomeDaily` - RBAC integrated
   - 🔄 `IncomeAfterCloseAccount`
   - 🔄 `IncomeSKL`
   - 🔄 `IncomeBAAC`
   - 🔄 `Expense` screens
   - 🔄 `InputPrice` screens

2. **Data Querying with Geographic Filters**:

```javascript
// Add to existing queries
const getIncomeData = async (userGeographic) => {
  let query = firestore.collection("account").collection("incomes");

  // Apply geographic filtering
  if (userGeographic.accessLevel === "branch") {
    query = query.where("branchCode", "in", userGeographic.allowedBranches);
  } else if (userGeographic.accessLevel === "province") {
    query = query.where("provinceId", "in", userGeographic.allowedProvinces);
  }

  return await query.get();
};
```

### **Week 2: Sales Module (15 pages)**

**Key Focus**: Territory management, customer assignments

**Implementation Pattern**:

```javascript
<SalesLayoutWithRBAC
  title="จัดการการขาย"
  permission="sales.view"
  editPermission="sales.edit"
>
  <BookingForm />
  <CustomerList />
  <SalesReports />
</SalesLayoutWithRBAC>
```

### **Week 3-4: Data Management Modules**

- **Customers Module**: Branch customer segregation
- **Warehouses Module**: Multi-location inventory
- **Credit Module**: Regional credit policies
- **Users/Employees**: Role-based user management

---

## **🔧 Implementation Checklist for Each Page**

### **Step 1: Layout Integration**

- [ ] Replace basic layout with `[Module]LayoutWithRBAC`
- [ ] Add geographic branch selection if needed
- [ ] Implement permission gates

### **Step 2: Data Layer Updates**

- [ ] Add geographic fields to data models
- [ ] Update Firestore queries with geographic filters
- [ ] Implement audit trail fields

### **Step 3: UI Component Updates**

- [ ] Replace `react-select` with `antd Select`
- [ ] Replace `react-table` with `antd Table`
- [ ] Replace `formik` with `antd Form`
- [ ] Add permission-based field access

### **Step 4: Testing & Validation**

- [ ] Test with different user roles
- [ ] Verify geographic data segregation
- [ ] Ensure existing functionality preserved
- [ ] Performance validation

---

## **📈 Success Metrics Update**

- ✅ **Navigation**: 98 menu items with RBAC filtering
- ✅ **Overview Module**: Complete role-based dashboards
- 🔄 **Account Module**: Foundation complete, 11 pages remaining
- ⏳ **Sales Module**: Ready for integration (15 pages)
- ⏳ **Other Modules**: 70+ pages awaiting systematic integration

**Current Progress**: ~15% complete (15/98 pages fully RBAC-enabled)
**Next Milestone**: 40% complete by end of Week 2 (Account + Sales modules)

---

## **🎯 Immediate Action Plan**

### **Today's Priority**: Complete Account Module Foundation

1. **Apply to remaining income screens** (2-3 hours)
2. **Integrate expense screens** (2-3 hours)
3. **Add price input screens** (1-2 hours)
4. **Test end-to-end Account module** (1 hour)

### **This Week**: Full Account + Start Sales

**Ready to continue with the next Account module pages!** 🚀

**Next Target**: `IncomeAfterCloseAccount` page integration
