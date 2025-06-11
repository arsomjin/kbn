# KBN Clean Slate RBAC Redesign - Principles, Rules & Guidelines

**Project**: KBN Multi-Province RBAC System  
**Version**: 2.0 (Clean Slate)  
**Created**: December 2024  
**Purpose**: Complete RBAC system redesign with clear principles

---

## 🎯 **CORE DESIGN PRINCIPLES**

### **1. SIMPLICITY FIRST**

- **Zero Complexity Tolerance** - Always choose the simplest solution
- **No Redundant Code** - Never duplicate logic, functions, or components
- **Minimal Dependencies** - Use as few external libraries as possible
- **Explicit Over Clever** - Write obvious code, not clever code

### **2. ORTHOGONAL DESIGN**

- **4×3×6 Matrix System** - Authority × Geographic × Departments
- **No Role Explosion** - Replace 50+ complex roles with systematic combinations
- **Predictable Permissions** - Same authority level = same permissions across contexts
- **Clear Hierarchies** - Authority levels with distinct capabilities

### **3. CLEAN SEPARATION**

- **Authentication ≠ Authorization** - Clear boundary between identity and permissions
- **Geographic Context Separation** - Location-based access as separate concern
- **Department Isolation** - Each department has independent permission sets
- **Data Flow Clarity** - Permissions flow from authority → geographic → department

---

## 📋 **DEVELOPMENT RULES**

### **Code Quality Rules**

```markdown
1. **ONE FUNCTION, ONE PURPOSE** - No multi-purpose complex functions
2. **DIRECT IMPORTS** - Avoid deep nested imports and re-exports
3. **FLAT STRUCTURE** - Avoid deep nesting in components and logic
4. **CHECK EXISTING FIRST** - Always search for existing solutions before creating
5. **USE EXISTING MAPPINGS** - Always use src/utils/mappings.js for user-friendly names
6. **NO MOCK DATA FRAMEWORKS** - Never create test frameworks using mock data. If unable to connect to real data, honestly state limitations or ask for guidance first.
7. **NO DOCUMENT, DEMO, TEST EXPLOSION** - Never create document, demo, test, If it's not really necessary.
```

### **RBAC Implementation Rules**

```markdown
1. **NO INDIVIDUAL PERMISSIONS** - All permissions come from roles/authority levels
2. **NO PERMISSION OVERRIDES** - No per-user permission customization
3. **GEOGRAPHIC CONSTRAINTS ONLY** - Geographic scope limits access, doesn't add permissions
4. **DEPARTMENT SCOPING** - Permissions scoped to specific departments
5. **TEMPORAL ACCESS** - Use time-bound role elevation instead of permanent overrides
```

### **Integration Rules**

```markdown
1. **PRESERVE BUSINESS LOGIC** - Never change existing business functionality
2. **SEAMLESS INTEGRATION** - RBAC works alongside current system
3. **NO BREAKING CHANGES** - Maintain backward compatibility during transition
4. **GRADUAL REPLACEMENT** - Replace components one by one
5. **FIX BUGS ONLY** - Address issues discovered during integration only
```

---

## 🏗️ **ARCHITECTURE GUIDELINES**

### **Component Structure**

```javascript
// Standard RBAC-enabled component pattern
const BusinessComponent = () => {
  return (
    <LayoutWithRBAC
      permission="department.action"
      title="Component Title"
      requireBranchSelection={true}
      autoInjectProvinceId={true}
      showAuditTrail={true}
    >
      <ComponentContent />
    </LayoutWithRBAC>
  );
};
```

### **Permission Naming Convention**

```javascript
// Format: department.action
"accounting.view"; // View accounting data
"accounting.edit"; // Edit accounting entries
"accounting.approve"; // Approve accounting transactions
"sales.view"; // View sales data
"sales.create"; // Create new sales orders
"inventory.manage"; // Full inventory management
"admin.system"; // System administration
```

### **Geographic Context Integration**

```javascript
// Automatic geographic enhancement
const { geographic } = props; // From LayoutWithRBAC

// Get submission data with provinceId
const submissionData = geographic.getSubmissionData();

// Enhance form data automatically
const enhancedData = geographic.enhanceDataForSubmission(formData);

// Filter data by user access
const accessibleData = geographic.filterFetchedData(allData);
```

---

## 🔒 **SECURITY GUIDELINES**

### **Access Control Principles**

1. **Deny by Default** - No access unless explicitly granted
2. **Least Privilege** - Minimum permissions necessary for job function
3. **Need to Know** - Geographic constraints limit data visibility
4. **Audit Everything** - All permission changes and data access logged
5. **Time-Bound Access** - Temporary elevation for special cases

### **Data Protection Rules**

1. **Geographic Filtering** - Users only see data from their assigned locations
2. **Department Scoping** - Users only access their department's functions
3. **Role Validation** - All actions validated against user's authority level
4. **Context Checking** - Geographic context verified for all operations
5. **Audit Trail** - Complete logging of who did what, when, where

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Phase Approach**

```markdown
Phase 1: Clean Slate Foundation 🚀 CURRENT

- New RBAC system design
- Core permission structure
- Geographic integration patterns
- Component architecture development

Phase 2: Component Development & Integration

- LayoutWithRBAC implementation
- Component integration
- Library modernization
- Business logic preservation

Phase 3: Enhancement

- Advanced features
- Performance optimization
- User experience improvements
- Advanced reporting
```

### **Module Priority**

```markdown
High Priority (Core Business):

- Account modules (Income/Expense)
- Sales modules (Booking/Orders)
- Warehouse modules (Import/Export)

Medium Priority (Reports):

- Financial reports
- Inventory reports
- Sales analytics

Low Priority (Admin):

- HR modules
- System settings
- User management
```

---

## 📐 **UI/UX GUIDELINES**

### **Design Consistency**

- **Nature-Inspired Theme** - Earthy tones, professional appearance
- **Ant Design Standard** - Consistent with modern UI library
- **Responsive Design** - Works on all devices using useResponsive hook
- **Clear Information Hierarchy** - Important information stands out
- **User-Friendly Labels** - Always show human-readable names, not codes

### **RBAC UI Patterns**

```javascript
// Permission-based rendering
<PermissionGate permission="accounting.view">
  <AccountingPanel />
</PermissionGate>

// Geographic selection
<GeographicBranchSelector
  respectRBAC={true}
  showBranchCode={true}
  province={selectedProvince}
/>

// RBAC-filtered data tables
<RBACDataTable
  dataSource={data}
  showGeographicInfo={true}
  actionPermissions={{
    view: 'accounting.view',
    edit: 'accounting.edit',
    delete: 'accounting.delete'
  }}
/>
```

---

## 🔄 **MAINTENANCE GUIDELINES**

### **Code Review Checklist**

- [ ] Uses existing utilities instead of creating new ones
- [ ] Follows one-function-one-purpose rule
- [ ] Uses user-friendly names from mappings.js
- [ ] Preserves existing business logic
- [ ] Includes proper RBAC integration
- [ ] Has appropriate error handling
- [ ] Includes audit trail where needed

### **Testing Requirements**

- [ ] Permission checks work correctly
- [ ] Geographic filtering functions properly
- [ ] Data access restrictions enforced
- [ ] Audit trails captured accurately
- [ ] Business logic preserved exactly
- [ ] User experience remains smooth

---

## 📚 **REFERENCE LINKS**

- **Core RBAC Components**: `src/components/PermissionGate.js`, `src/components/layout/LayoutWithRBAC.js`
- **Permission Definitions**: `src/data/permissions.js`
- **Mapping Utilities**: `src/utils/mappings.js`
- **Geographic Hooks**: `src/hooks/usePermissions.js`, `src/hooks/useGeographicData.js`
- **Implementation Utilities**: To be developed during clean slate implementation

---

**Next Document**: [02-provinceid-integration.md](./02-provinceid-integration.md)
