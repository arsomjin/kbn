# Your assigned roles

You are an expert developer assisting with a large-scale JavaScript/TypeScript project.
You are a skilled RBAC, permission project implementation.
You are a professional React developer.
You are a skilled professional UI/UX designer.
You are a skilled Firebase developer.

## KBN Project Overview

KBN is an enterprise-level business management platform built with React, JavaScript, and Firebase. The platform is undergoing a major upgrade to support multi-province operations with comprehensive Role-Based Access Control (RBAC).

## Core Upgrade Goals

- Redesign to simplify and remove duplicated code/logic, improve/enhance for easier maintainability while preserving data structure ✅
- Upgrade from Single province to Multi-province architecture ✅
- Implement full RBAC across provinces, branches, departments ✅
- Maintain backward compatibility with existing data ✅
- Replace outdated libraries with Ant Design equivalents ✅

# AI Context: KBN Multi-Province RBAC System - Advanced Deployment Phase

**Project**: KBN - Multi-Province RBAC Integration & Library Modernization

**Current Status**: 🚀 **ADVANCED DEPLOYMENT PHASE** → **Automatic ProvinceId Injection Solutions Complete**

## Phase Status

### ✅ **PHASE 1 COMPLETED** - Multi-Province RBAC Infrastructure

- **Multi-Province System**: ✅ Complete (Nakhon Ratchasima → Nakhon Sawan)
- **Enhanced RBAC**: ✅ Complete (7-level access control)
- **Department+Flow Permissions**: ✅ Complete (accounting.view, sales.edit, etc.)
- **Migration Tools**: ✅ Production-ready with rollback capability
- **Components & Hooks**: ✅ All RBAC components functional

### ✅ **PHASE 2 COMPLETED** - Integration & Modernization

- **Bug Fixes**: ✅ GeographicBranchSelector, Payment Validation, Branch Fallbacks
- **Payment Validation**: ✅ Centralized validation across income components
- **Hardcoded Branch Fixes**: ✅ 85+ files updated with RBAC-compliant fallbacks
- **LayoutWithRBAC Analysis**: ✅ Confirmed global reusability across all modules

### 🚀 **PHASE 3 CURRENT** - Advanced Deployment & Automatic ProvinceId Solutions

**Goal**: Deploy automatic provinceId injection across all 80+ components with zero manual coding effort.

**Status**: 🎯 **SOLUTIONS COMPLETE** - Ready for systematic deployment

## Advanced Solutions Completed

### **🔍 Automatic ProvinceId Injection for Data Fetching**

**Solution**: Enhanced DocSelector with geographic context support

**Implementation**:

```javascript
// Enhanced DocSelector automatically filters by provinceId
<DocSelector
  collection="sections/sales/vehicles"
  geographic={geographic} // ← Geographic context from LayoutWithRBAC
  respectRBAC={true} // ← Enable automatic filtering
/>

// Results in automatic Firebase query enhancement:
// FROM: { collection: "sections/sales/vehicles" }
// TO:   { collection: "sections/sales/vehicles",
//         where: [["provinceId", "==", "นครสวรรค์"]] }
```

**Files Enhanced**:

- `src/components/DocSelector.js` - Enhanced with geographic filtering
- `src/Modules/Account/screens/Income/IncomeDaily/components/IncomeVehicles/api.js` - Updated RenderSearch
- `src/Modules/Account/screens/Income/IncomeDaily/components/IncomeVehicles/index.js` - Geographic context passing

### **💾 Automatic ProvinceId Injection for Data Submission**

**Solution**: Enhanced LayoutWithRBAC + useDataOperations hook for automatic data enhancement

**Implementation Options**:

#### **Option 1: useDataOperations Hook (Recommended)**

```javascript
const { submitData } = useDataOperations(geographic);

// ONE-LINE SUBMISSION with automatic enhancement
await submitData({
  collection: "sections/account/incomes",
  docId: formValues.incomeId,
  data: formValues, // ← Automatically enhanced with provinceId + metadata
});
```

#### **Option 2: Custom Enhancement**

```javascript
const _onConfirmOrder = async (values) => {
  const enhancedData = geographic.enhanceDataForSubmission(values);
  await firestore
    .collection("sections/account/incomes")
    .doc(incomeId)
    .set(enhancedData);
};
```

**Files Enhanced**:

- `src/hooks/useDataOperations.js` - Complete data operations with automatic provinceId injection
- `src/Modules/Account/screens/Income/IncomeDaily/index.js` - Enhanced submission logic

### **📊 Comprehensive Documentation Created**

**Documentation Files**:

- `src/docs/PROVINCIAL_FILTERING_EXAMPLE.md` - Complete fetching example with IncomeDailyVehicles
- `src/docs/PROVINCIAL_SUBMISSION_EXAMPLE.md` - Complete submission example with multiple methods
- `src/docs/RBAC_PROVINCEIP_INTEGRATION_GUIDE.md` - Implementation guide for all 80+ components

**Key Documentation Features**:

- **Before/After Comparisons**: Clear examples of data flow changes
- **Step-by-Step Implementation**: Detailed component enhancement process
- **Multiple Approaches**: useDataOperations, custom logic, batch operations
- **Visual Diagrams**: Mermaid diagrams showing complete data flows
- **Benefits Analysis**: Performance, security, developer experience improvements

## Technical Implementation Status

### **Core RBAC System** ✅ Complete

```
src/redux/actions/provinces.js         (185 lines)
src/redux/actions/rbac.js             (239 lines)
src/redux/reducers/provinces.js       (196 lines)
src/redux/reducers/rbac.js            (323 lines)
src/utils/rbac.js                     (356 lines)
src/hooks/usePermissions.js           (366 lines)
src/hooks/useRBAC.js                  (386 lines)
src/data/permissions.js               (292 lines)
```

### **Enhanced Components** ✅ Complete

```
src/components/PermissionGate.js      (295 lines)
src/components/ProvinceSelector.js    (306 lines)
src/components/GeographicBranchSelector.js (415 lines)
src/components/RBACDataTable.js       (358 lines)
src/components/RBACNavigationFilter.js (167 lines)
src/components/layout/LayoutWithRBAC.js (Enhanced with geographic context)
src/components/DocSelector.js (Enhanced with geographic filtering)
```

### **Advanced Data Operations** ✅ Complete

```
src/hooks/useDataOperations.js        (188 lines) - Complete data operations with automatic provinceId injection
```

### **Migration & Testing Tools** ✅ Complete

```
src/utils/migration/phase1Migration.js (551 lines)
src/utils/migration/executeMigration.js (416 lines)
src/utils/migration/rollbackUtility.js (440 lines)
src/dev/screens/TestAccessControl/index.js
```

## Deployment Strategy

### **🎯 Ready for Systematic Rollout**

**Approach**: Wrap components with enhanced LayoutWithRBAC for automatic provinceId compliance

**Pattern**:

```javascript
// Before: Direct component usage
const SalesOrderList = () => <SalesOrderContent />;

// After: Enhanced with automatic provinceId injection
const SalesOrderList = () => (
  <LayoutWithRBAC
    permission="sales.view"
    title="รายการขาย"
    autoInjectProvinceId={true} // ← Enable automatic injection
  >
    <SalesOrderContent />
  </LayoutWithRBAC>
);

// Result: All data operations automatically include provinceId
```

### **📋 Deployment Priorities**

#### **High Priority (Immediate)**

1. **Sales Modules**: Vehicle sales, parts sales, service bookings
2. **Account Modules**: All income/expense categories
3. **Inventory Modules**: Stock management, transfers, deliveries

#### **Medium Priority (Next Sprint)**

1. **Reports**: All reporting modules for geographic filtering
2. **Warehouse**: Import/export operations
3. **Customer Management**: Geographic customer segregation

#### **Low Priority (Future)**

1. **System Administration**: User management, settings
2. **Development Tools**: Testing, migration utilities

## Business Context

### **Company**: KBN (Kubota Benja-pol)

- **Business**: Kubota tractor dealership in Thailand
- **Operations**: Sales, Service, Parts, Warehousing, Finance, HR
- **Current**: Nakhon Ratchasima province (branches: 0450, NMA002, NMA003)
- **Expansion**: Nakhon Sawan province (branches: NSN001, NSN002, NSN003)

### **System Status**

- **Multi-Province Support**: ✅ Implemented & Tested
- **Role-Based Access Control**: ✅ Implemented & Tested
- **Geographic Data Filtering**: ✅ Implemented & Tested
- **Department-Based Permissions**: ✅ Implemented & Tested
- **Automatic ProvinceId Injection**: ✅ **SOLUTIONS COMPLETE**
- **Modern UI Components**: 🚀 **ONGOING** (Ant Design migration)

## Implementation Benefits

### **🔒 Data Security & Compliance**

- **Zero Data Leakage**: Users only see authorized geographic data
- **Automatic Enforcement**: Geographic filtering enforced at query level
- **RBAC Compliance**: All data operations respect user permissions
- **Audit Trail**: Complete geographic tracking for all data operations

### **⚡ Performance Improvements**

- **Smaller Result Sets**: Queries filtered by provinceId at database level
- **Optimized Indices**: Firebase can efficiently use provinceId for queries
- **Faster Loading**: Reduced data transfer and processing

### **🛠️ Developer Experience**

- **Zero Manual Work**: No geographic field assignment needed
- **Consistent API**: Same pattern across all 80+ components
- **Error Prevention**: Eliminates hardcoded fallbacks and missing provinceId
- **Future-Proof**: Easy to add new provinces or geographic metadata

### **👥 User Experience**

- **Relevant Data**: Users only see data they can work with
- **Faster Searches**: Geographic filtering improves search performance
- **Clear Context**: Geographic metadata provides clear data context

## Next Steps

### **🎯 Immediate Actions**

1. **Systematic Component Wrapping**: Apply LayoutWithRBAC pattern to all 80+ components
2. **Testing & Validation**: Ensure automatic provinceId injection works across all modules
3. **User Training**: Prepare documentation for geographic context features

### **📊 Success Metrics**

- **100% Geographic Compliance**: All new data includes provinceId
- **Zero Data Leakage**: Users cannot access unauthorized geographic data
- **Performance Improvement**: Faster query response times
- **Developer Productivity**: Reduced geographic-related bugs and support requests

---

**Phase 1**: ✅ **COMPLETE** - Multi-Province RBAC Infrastructure
**Phase 2**: ✅ **COMPLETE** - Integration & Bug Fixes  
**Phase 3**: ✅ **COMPLETE** - Automatic ProvinceId Injection + Production Migration Tools
**Next Phase**: 🎯 **Systematic Rollout** - Deploy across all 80+ components

### **Phase 3 Completion Summary**

**🚀 Automatic ProvinceId Injection System**

- ✅ Enhanced LayoutWithRBAC with geographic context injection
- ✅ DocSelector automatic Firebase query filtering
- ✅ Geographic context flows: LayoutWithRBAC → IncomeDaily → IncomeVehicles → DocSelector
- ✅ Verified working with console logs showing proper provinceId filtering

**🏭 Production Migration Tools**

- ✅ `phase3ProvinceIdMigration.js` - Comprehensive migration across 12+ collections
- ✅ `Phase3MigrationDashboard.js` - User-friendly migration interface
- ✅ `executePhase3Production.js` - Command-line production execution
- ✅ Validation, progress tracking, and rollback capabilities

**🔧 Ready for Production Deployment**

- Run migration: `node executePhase3Production.js migrate`
- Dashboard access: `/dev/phase3-migration`
- All existing data will get `provinceId` fields for geographic filtering
