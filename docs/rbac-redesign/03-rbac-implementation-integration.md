# KBN Clean Slate RBAC Redesign - Implementation & Integration

**Project**: KBN Multi-Province RBAC System  
**Document**: 03 - RBAC Implementation & Integration  
**Created**: December 2024  
**Purpose**: Step-by-step guide for implementing and integrating RBAC across all modules

---

## 🎯 **OVERVIEW**

This document provides comprehensive implementation patterns for integrating the new RBAC system across all business modules while preserving existing functionality and ensuring smooth user experience.

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **RBAC System Components**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Identity │    │  RBAC Engine    │    │ Geographic      │
│                 │───▶│                 │───▶│ Context         │
│ - Authentication│    │ - Permissions   │    │ - Province      │
│ - User Profile  │    │ - Roles         │    │ - Branches      │
│ - Basic Info    │    │ - Access Levels │    │ - Filtering     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │  Data Access    │    │ Audit & Logging │
│                 │    │                 │    │                 │
│ - PermissionGate│    │ - Query Filter  │    │ - Action Logs   │
│ - LayoutWithRBAC│    │ - Result Filter │    │ - Access Logs   │
│ - RBAC Tables   │    │ - Submission    │    │ - Change Trail  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Integration Flow**

```
User Login → Role Assignment → Geographic Context → Permission Check → UI Rendering → Data Access → Audit Logging
```

---

## 🔧 **COMPONENT INTEGRATION PATTERNS**

### **1. LayoutWithRBAC Integration**

#### Complete Integration Pattern

```javascript
import LayoutWithRBAC from "components/layout/LayoutWithRBAC";

const BusinessModule = () => {
  return (
    <LayoutWithRBAC
      // 🔑 Core RBAC Settings
      permission="department.action" // Required permission
      editPermission="department.edit" // Optional edit permission
      title="Module Title"
      subtitle="Module Description"
      // 🗺️ Geographic Settings
      requireBranchSelection={true} // Force branch selection
      autoInjectProvinceId={true} // Auto-inject province in data
      onBranchChange={handleBranchChange} // Branch change callback
      // 📋 Audit Trail Settings
      showAuditTrail={true} // Enable audit trail
      documentId={documentId} // Document being tracked
      documentType="module_type" // Type for audit
      // 📊 UI Enhancement Settings
      showStepper={true} // Show progress stepper
      steps={BUSINESS_STEPS} // Stepper configuration
      currentStep={activeStep} // Current step
      loading={isLoading} // Loading state
    >
      <ModuleContent />
    </LayoutWithRBAC>
  );
};
```

#### Legacy Module Migration Pattern

```javascript
// ❌ OLD: Shards-React Layout
import { Container, Row, Col } from "shards-react";
import PageTitle from "components/common/PageTitle";

const LegacyModule = () => {
  return (
    <Container fluid className="main-content-container px-4">
      <Row>
        <Col>
          <PageTitle title="Legacy Module" />
          <LegacyContent />
        </Col>
      </Row>
    </Container>
  );
};

// ✅ NEW: LayoutWithRBAC
import LayoutWithRBAC from "components/layout/LayoutWithRBAC";
import { Card } from "antd";

const ModernModule = () => {
  return (
    <LayoutWithRBAC
      permission="legacy.view"
      title="Modernized Module"
      requireBranchSelection={true}
      autoInjectProvinceId={true}
    >
      <ModernContent />
    </LayoutWithRBAC>
  );
};
```

### **2. PermissionGate Integration**

#### Basic Permission Gating

```javascript
import { PermissionGate } from "components";

const ConditionalContent = () => {
  return (
    <div>
      {/* Always visible content */}
      <GeneralInfo />

      {/* Permission-gated content */}
      <PermissionGate permission="accounting.view">
        <AccountingPanel />
      </PermissionGate>

      <PermissionGate permission="sales.edit">
        <SalesEditForm />
      </PermissionGate>

      <PermissionGate
        permission="admin.manage"
        fallback={<Alert message="Insufficient permissions" type="warning" />}
      >
        <AdminControls />
      </PermissionGate>
    </div>
  );
};
```

#### Geographic Context Gating

```javascript
const GeographicContent = () => {
  return (
    <PermissionGate
      permission="reports.view"
      province={selectedProvince}
      branch={selectedBranch}
      fallback={<Text type="secondary">Select accessible province/branch</Text>}
    >
      <ProvinceReports province={selectedProvince} />
    </PermissionGate>
  );
};
```

### **3. Data Table Integration**

#### RBACDataTable Implementation

```javascript
import { RBACDataTable } from "components";

const DataListing = ({ rawData }) => {
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Amount", dataIndex: "amount" },
    { title: "Province", dataIndex: "provinceId" },
    { title: "Branch", dataIndex: "branchCode" },
  ];

  return (
    <RBACDataTable
      dataSource={rawData}
      columns={columns}
      // 🔒 RBAC Configuration
      rbacConfig={{
        enableSelection: true,
        showSummary: true,
      }}
      // 🗺️ Geographic Settings
      showGeographicInfo={true}
      geographicFields={{
        province: "provinceId",
        branch: "branchCode",
      }}
      // 🎮 Action Permissions
      actionPermissions={{
        view: "data.view",
        edit: "data.edit",
        delete: "data.delete",
      }}
      // 📋 Action Handlers
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
```

---

## 🔗 **HOOK INTEGRATION PATTERNS**

### **1. usePermissions Hook**

#### Basic Permission Checking

```javascript
import { usePermissions } from "hooks/usePermissions";

const ComponentWithPermissions = () => {
  const {
    // 🔍 Permission Checking
    hasPermission,
    canEdit,
    canView,
    canDelete,

    // 🗺️ Geographic Access
    filterDataByUserAccess,
    accessibleBranches,
    getDefaultBranch,

    // 👤 User Context
    isAdmin,
    authority,
    userProvinces,
  } = usePermissions();

  // Check specific permission
  const canManageInventory = hasPermission("inventory.manage");

  // Filter data by user access
  const accessibleData = filterDataByUserAccess(allData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  return (
    <div>
      {canView && <DataView data={accessibleData} />}
      {canEdit && <EditControls />}
      {canManageInventory && <InventoryManagement />}
    </div>
  );
};
```

### **2. useGeographicData Hook**

#### Geographic Context Management

```javascript
import { useGeographicData } from "hooks/useGeographicData";

const GeographicComponent = () => {
  const {
    // 🗺️ Current Context
    getCurrentProvince,
    getCurrentBranch,
    getQueryFilters,

    // 🔍 Access Checking
    checkBranchAccess,
    checkProvinceAccess,

    // 📊 Data Enhancement
    enhanceDataForSubmission,
    filterFetchedData,
  } = useGeographicData();

  const handleDataSubmission = async (formData) => {
    // Automatic geographic enhancement
    const enhancedData = enhanceDataForSubmission(formData);
    await saveData(enhancedData);
  };

  const fetchBranchData = async () => {
    const filters = getQueryFilters();
    return await fetchData("collection", filters);
  };

  return (
    <GeographicForm
      onSubmit={handleDataSubmission}
      initialFilters={getQueryFilters()}
    />
  );
};
```

---

## 📝 **FORM INTEGRATION PATTERNS**

### **1. Geographic Form Enhancement**

#### Automatic Province Injection

```javascript
const GeographicForm = ({ geographic }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Automatic province/branch injection
      const enhancedValues = geographic.enhanceDataForSubmission(values);

      // Submit with geographic context
      await submitForm(enhancedValues);

      message.success("Data saved successfully");
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item name="description" rules={[{ required: true }]}>
        <Input placeholder="Description" />
      </Form.Item>

      <Form.Item name="amount" rules={[{ required: true }]}>
        <InputNumber placeholder="Amount" />
      </Form.Item>

      {/* Province/Branch automatically injected on submit */}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Data
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### **2. Branch Selection Forms**

#### Dependent Field Patterns

```javascript
const BranchDependentForm = () => {
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState(null);

  return (
    <Form form={form}>
      <Form.Item name="province" label="Province">
        <ProvinceSelector
          onChange={(value) => {
            setSelectedProvince(value);
            form.setFieldsValue({ branch: null }); // Reset branch
          }}
          respectRBAC={true}
        />
      </Form.Item>

      <Form.Item name="branch" label="Branch">
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => (
            <GeographicBranchSelector
              province={getFieldValue("province")}
              disabled={!getFieldValue("province")}
              respectRBAC={true}
              showBranchCode={true}
            />
          )}
        </Form.Item>
      </Form.Item>
    </Form>
  );
};
```

---

## 🔄 **MIGRATION STRATEGIES**

### **1. Module-by-Module Migration**

#### Sales Module Migration

```javascript
// Phase 1: Wrapper Integration
const SalesBooking = () => {
  return (
    <LayoutWithRBAC
      permission="sales.view"
      editPermission="sales.edit"
      title="Vehicle Booking"
      requireBranchSelection={true}
    >
      <LegacySalesBookingContent />
    </LayoutWithRBAC>
  );
};

// Phase 2: Component Modernization
const ModernSalesBooking = () => {
  return (
    <LayoutWithRBAC
      permission="sales.view"
      editPermission="sales.edit"
      title="Vehicle Booking"
      requireBranchSelection={true}
      autoInjectProvinceId={true}
      showAuditTrail={true}
    >
      <ModernBookingForm />
      <BookingDataTable />
    </LayoutWithRBAC>
  );
};
```

#### Service Module Migration

```javascript
// Before: Legacy Service Order
const LegacyServiceOrder = () => {
  return (
    <Container fluid>
      <Row>
        <Col>
          <PageTitle title="Service Order" />
        </Col>
      </Row>
      <Row>
        <Col>
          <ServiceOrderForm />
        </Col>
      </Row>
    </Container>
  );
};

// After: RBAC-Enabled Service Order
const ModernServiceOrder = () => {
  return (
    <LayoutWithRBAC
      permission="service.view"
      editPermission="service.edit"
      title="Service Order"
      requireBranchSelection={true}
      autoInjectProvinceId={true}
      showAuditTrail={true}
      documentType="service_order"
    >
      <ServiceOrderContent />
    </LayoutWithRBAC>
  );
};
```

### **2. Library Modernization**

#### Ant Design Migration

```javascript
// ❌ Old: Multiple UI Libraries
import { Container, Row, Col } from "shards-react";
import { Card } from "react-bootstrap";
import Select from "react-select";

// ✅ New: Ant Design Standardization
import { Row, Col, Card, Select } from "antd";

const ModernComponent = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="Modern Card">
          <Select
            placeholder="Select option"
            options={options}
            style={{ width: "100%" }}
          />
        </Card>
      </Col>
    </Row>
  );
};
```

---

## 🎮 **ACTION PATTERNS**

### **1. CRUD Operations with RBAC**

#### Create Operations

```javascript
const CreateWithRBAC = ({ geographic, auditTrail }) => {
  const handleCreate = async (formData) => {
    // 1. Enhance with geographic context
    const enhancedData = geographic.enhanceDataForSubmission(formData);

    // 2. Add creation metadata
    const dataToSave = {
      ...enhancedData,
      createdBy: user.uid,
      createdAt: Date.now(),
      status: "draft",
    };

    // 3. Save with audit trail
    await auditTrail.saveWithAuditTrail({
      collection: "sections/business/data",
      data: dataToSave,
      isEdit: false,
      notes: "Created new business record",
    });
  };
};
```

#### Update Operations

```javascript
const UpdateWithRBAC = ({ geographic, auditTrail, originalData }) => {
  const handleUpdate = async (formData) => {
    // 1. Enhance with current geographic context
    const enhancedData = geographic.enhanceDataForSubmission(formData);

    // 2. Add update metadata
    const dataToSave = {
      ...enhancedData,
      updatedBy: user.uid,
      updatedAt: Date.now(),
    };

    // 3. Save with audit trail
    await auditTrail.saveWithAuditTrail({
      collection: "sections/business/data",
      data: dataToSave,
      isEdit: true,
      oldData: originalData,
      notes: "Updated business record",
    });
  };
};
```

### **2. Data Fetching with Geographic Filtering**

#### Automatic Filtering

```javascript
const DataFetcher = () => {
  const { getQueryFilters } = useGeographicData();
  const { filterDataByUserAccess } = usePermissions();

  const fetchData = async () => {
    // 1. Get user's geographic constraints
    const filters = getQueryFilters();

    // 2. Query with geographic filters
    let query = firestore.collection("business-data");

    if (filters.provinceId) {
      query = query.where("provinceId", "==", filters.provinceId);
    }

    if (filters.branchCode) {
      query = query.where("branchCode", "==", filters.branchCode);
    }

    const snapshot = await query.get();
    const rawData = snapshot.docs.map((doc) => doc.data());

    // 3. Additional RBAC filtering
    return filterDataByUserAccess(rawData, {
      provinceField: "provinceId",
      branchField: "branchCode",
    });
  };
};
```

---

## 🔍 **TESTING PATTERNS**

### **1. Permission Testing**

```javascript
const testPermissions = () => {
  // Test permission gates
  const testPermissionGate = (permission, expectedVisible) => {
    render(
      <PermissionGate permission={permission}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    const content = screen.queryByTestId("protected-content");
    expect(!!content).toBe(expectedVisible);
  };

  testPermissionGate("accounting.view", true); // Should be visible
  testPermissionGate("admin.manage", false); // Should be hidden
};
```

### **2. Geographic Filtering Testing**

```javascript
const testGeographicFiltering = () => {
  const mockData = [
    { id: 1, provinceId: "นครราชสีมา", branchCode: "0450" },
    { id: 2, provinceId: "นครสวรรค์", branchCode: "NSN001" },
  ];

  // Test filtering for Nakhon Ratchasima user
  const filteredData = filterDataByUserAccess(mockData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  expect(filteredData).toHaveLength(1);
  expect(filteredData[0].provinceId).toBe("นครราชสีมา");
};
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Module Integration Checklist**

- [ ] Replace shards-react layout with LayoutWithRBAC
- [ ] Add appropriate permission requirements
- [ ] Enable geographic context where needed
- [ ] Integrate audit trail for data changes
- [ ] Add PermissionGate for conditional content
- [ ] Update data tables to use RBACDataTable
- [ ] Implement geographic data filtering
- [ ] Test permission scenarios
- [ ] Verify data access restrictions
- [ ] Update navigation/routing integration

### **Quality Assurance Checklist**

- [ ] Business logic preserved exactly
- [ ] No breaking changes to existing functionality
- [ ] User experience remains smooth
- [ ] Performance impact minimal
- [ ] Error handling maintained
- [ ] Responsive design preserved
- [ ] Accessibility standards met

---

**Previous Document**: [02-provinceid-integration.md](./02-provinceid-integration.md)  
**Next Document**: [04-app-flow.md](./04-app-flow.md)
