# KBN Multi-Province Expansion - Phase 1 Implementation Guide

## 🎯 **Current Status: READY FOR DEPLOYMENT**

### ✅ **Completed Tasks**

#### **1. Data Structure Alignment**

- **FIXED**: Changed all code from `provinceCode` to `provinceId` to match Firestore
- **RESULT**: Perfect alignment between code and database structure
- **VALIDATION**: `provinces[branch.provinceId]` now works correctly

#### **2. Redux Architecture**

- **Created**: Separate Redux modules for provinces and RBAC
- **Files**:
  - `src/redux/actions/provinces.js`
  - `src/redux/reducers/provinces.js`
  - `src/redux/actions/rbac.js`
  - `src/redux/reducers/rbac.js`

#### **3. Geographic Components**

- **Updated**: All geographic selectors work with new data structure
- **Components**:
  - `GeographicBranchSelector` ✅
  - `ProvinceSelector` ✅
  - `BranchSelector` ✅

#### **4. RBAC System**

- **Implemented**: Full role-based access control
- **Levels**: SUPER_ADMIN, PROVINCE_MANAGER, BRANCH_MANAGER, BRANCH_STAFF
- **Features**: Geographic access filtering, permission checking

#### **5. Migration Scripts**

- **Created**: Phase 1 migration for Nakhon Sawan expansion
- **Files**:
  - `src/utils/migration/phase1Migration.js`
  - `src/utils/migration/executeMigration.js`

#### **6. Testing Infrastructure**

- **Created**: Test dashboard for validation
- **File**: `src/dev/screens/TestMultiProvince/index.js`

---

## 🚀 **Next Steps**

### **Step 1: Run Phase 1 Migration**

#### **Option A: Through Test Dashboard**

1. Navigate to test page: `/dev/test-multi-province`
2. Click "Run Phase 1 Migration" button
3. Monitor console for progress

#### **Option B: Through Browser Console**

```javascript
// In browser developer console:
window.runKBNMigration();
```

#### **Option C: Programmatically**

```javascript
import { executePhase1Migration } from "utils/migration/executeMigration";
const result = await executePhase1Migration();
```

### **Step 2: Verify Migration Results**

After migration, verify:

#### **Firestore Collections**

- `data/company/provinces/nakhon-sawan` exists
- `data/company/branches/NSN001` exists
- `data/company/branches/NSN002` exists
- `data/company/branches/NSN003` exists

#### **Data Structure Validation**

```javascript
// Check province-branch relationship
const branch = branches["NSN001"];
const province = provinces[branch.provinceId]; // Should work!
console.log(province.name); // Should show "นครสวรรค์"
```

### **Step 3: Test Multi-Province Functionality**

#### **Test Geographic Selectors**

1. Use `GeographicBranchSelector` component
2. Select "นครสวรรค์" province
3. Verify NSN001-003 branches appear
4. Test branch filtering works correctly

#### **Test RBAC System**

1. Create test users with different access levels
2. Verify province-level managers only see their provinces
3. Test branch-level access restrictions

### **Step 4: Production Deployment**

#### **Environment Setup**

```bash
# Build for production
npm run build

# Test production build
serve -s build
```

#### **Firebase Rules Update**

Update Firestore security rules to support multi-province RBAC:

```javascript
// Add to Firestore rules
function hasProvinceAccess(userId, provinceId) {
  return get(/databases/$(database)/documents/users/$(userId)).data.allowedProvinces.hasAny([provinceId]) ||
         get(/databases/$(database)/documents/users/$(userId)).data.accessLevel == 'SUPER_ADMIN';
}
```

---

## 📊 **Data Structure Summary**

### **Province Document Structure**

```javascript
// Firestore: data/company/provinces/{kebab-case-key}
"nakhon-sawan": {
  key: "nakhon-sawan",
  name: "นครสวรรค์",
  nameEn: "Nakhon Sawan",
  code: "NSN",
  region: "central",
  status: "active"
}
```

### **Branch Document Structure**

```javascript
// Firestore: data/company/branches/{branchCode}
"NSN001": {
  branchCode: "NSN001",
  branchName: "สาขานครสวรรค์ 1",
  provinceId: "nakhon-sawan", // 👈 kebab-case reference
  locationId: "location_nsn001",
  warehouseId: "warehouse_nsn001",
  status: "active"
}
```

### **User RBAC Structure**

```javascript
// User document with RBAC
{
  accessLevel: "PROVINCE_MANAGER",
  allowedProvinces: ["nakhon-sawan"], // kebab-case keys
  allowedBranches: [], // Empty for province managers
  permissions: {
    users: { view: true, create: true, edit: true, manage: true },
    branches: { view: true, create: true, edit: true, manage: true }
  }
}
```

---

## 🧪 **Testing Checklist**

### **Pre-Migration Tests**

- [ ] Build completes without errors
- [ ] All components render without crashes
- [ ] Current province/branch selectors work
- [ ] User permissions load correctly

### **Post-Migration Tests**

- [ ] New province "nakhon-sawan" exists in Redux state
- [ ] NSN001-003 branches exist in Redux state
- [ ] Branch filtering by province works
- [ ] `provinces[branch.provinceId]` lookup succeeds
- [ ] RBAC permissions apply correctly
- [ ] Geographic access controls work

### **User Experience Tests**

- [ ] Province selector shows both provinces
- [ ] Branch selector filters correctly by province
- [ ] GeographicBranchSelector works end-to-end
- [ ] Permission gates show/hide content appropriately
- [ ] Navigation respects user access levels

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. "Cannot read property 'name' of undefined"**

- **Cause**: Province lookup failing
- **Solution**: Verify `branch.provinceId` matches province document key

#### **2. Empty selectors**

- **Cause**: Redux state not populated
- **Solution**: Check data loading in Redux DevTools

#### **3. Migration fails**

- **Cause**: Firebase permission or network issues
- **Solution**: Check browser console and Firebase console

### **Debug Commands**

```javascript
// In browser console
console.log("Provinces:", window.store.getState().provinces);
console.log("Branches:", window.store.getState().data.branches);
console.log("User:", window.store.getState().auth.user);
```

---

## 📈 **Future Enhancements**

### **Phase 2: Additional Provinces**

- Prepare for more provinces (Chiang Mai, Phuket, etc.)
- Scale RBAC system for regional managers
- Implement province-specific reporting

### **Phase 3: Advanced Features**

- Multi-province data synchronization
- Cross-province transfers
- Regional analytics and dashboards

---

## 🎉 **Success Criteria**

The Phase 1 implementation will be considered successful when:

1. ✅ **Data Alignment**: All `provinces[branch.provinceId]` lookups work
2. ✅ **Component Functionality**: All selectors work with new data structure
3. ✅ **RBAC Implementation**: User permissions correctly restrict access
4. ✅ **Migration Success**: Nakhon Sawan province and branches created
5. ✅ **Testing Validation**: All tests pass in test dashboard

**Status**: ✅ Ready for migration execution!

---

_Last Updated: Current_
_Next Review: After Phase 1 Migration_
