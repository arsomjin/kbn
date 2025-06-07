# KBN RBAC Integration Plan - Page by Page Implementation

## 🎯 **Integration Strategy**

**Approach**: Gradual integration with thorough testing at each step
**Priority**: High-impact pages first, then systematic module-by-module integration
**Safety**: Maintain existing functionality while adding RBAC layer

---

## 📋 **Module Priority Matrix**

### **Phase 1: Foundation (Week 1-2)**

- ✅ Navigation & Menu System
- ✅ Settings Module (Province/Branch Management)
- ✅ User Management Module

### **Phase 2: Core Business (Week 3-4)**

- 🔄 Sales Module
- 🔄 Account/Financial Module
- 🔄 Reports Module

### **Phase 3: Operations (Week 5-6)**

- 🔄 Customers Module
- 🔄 Service Module
- 🔄 Warehouses Module

### **Phase 4: Supporting (Week 7-8)**

- 🔄 HR Module
- 🔄 Employees Module
- 🔄 Credit Module

---

## 🚀 **Phase 1: Foundation Implementation**

### **Step 1: Navigation System Integration**

#### **Files to Update:**

- `src/components/layout/MainSidebar/SidebarNavItems.js`
- `src/components/layout/HeaderNavbar/MenuItem.js`
- `src/navigation/components/PrivateRoutes.js`
- `src/navigation/routes.js`

#### **Implementation Pattern:**

```javascript
// Before (existing)
const menu_items = user.isDev
  ? ItemsDev
  : user.group && user.group === "group001"
  ? ItemsExec
  : mItems;

// After (with RBAC)
import { RBACNavigationFilter } from "components";

const SidebarNavItems = () => {
  const baseMenuItems = user.isDev
    ? ItemsDev
    : user.group && user.group === "group001"
    ? ItemsExec
    : mItems;

  return (
    <RBACNavigationFilter menuItems={baseMenuItems}>
      {(filteredMenuItems) => (
        <Menu
          theme={theme}
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={filteredMenuItems}
        />
      )}
    </RBACNavigationFilter>
  );
};
```

#### **Menu Items RBAC Configuration:**

```javascript
// src/data/menuItems.js
export const menuItemsWithRBAC = [
  {
    key: "overview",
    title: "ภาพรวม",
    to: "/overview",
    permission: "reports.view", // Department.Flow format
    icon: "dashboard",
  },
  {
    key: "sales",
    title: "การขาย",
    permission: "sales.view",
    children: [
      {
        key: "sales-vehicles",
        title: "ขายรถ",
        to: "/sales/vehicles",
        permission: "sales.edit",
      },
      {
        key: "sales-parts",
        title: "ขายอะไหล่",
        to: "/sales/parts",
        permission: "sales.view",
      },
    ],
  },
  {
    key: "account",
    title: "บัญชี",
    permission: "accounting.view",
    children: [
      {
        key: "income",
        title: "รายได้",
        to: "/account/income-overview",
        permission: "accounting.edit",
      },
      {
        key: "expense",
        title: "รายจ่าย",
        to: "/account/expense-overview",
        permission: "accounting.edit",
      },
    ],
  },
  {
    key: "reports",
    title: "รายงาน",
    permission: "reports.view",
    minAccessLevel: "branch",
    children: [
      {
        key: "financial-reports",
        title: "รายงานการเงิน",
        to: "/reports/financial",
        permission: "accounting.review",
        minAccessLevel: "province",
      },
    ],
  },
  {
    key: "settings",
    title: "ตั้งค่า",
    permission: "admin.view",
    minAccessLevel: "province",
    children: [
      {
        key: "provinces",
        title: "จัดการจังหวัด",
        to: "/settings/provinces",
        permission: "admin.edit",
        minAccessLevel: "all",
      },
      {
        key: "branches",
        title: "จัดการสาขา",
        to: "/settings/branches",
        permission: "admin.edit",
      },
      {
        key: "users",
        title: "จัดการผู้ใช้",
        to: "/settings/users",
        permission: "admin.edit",
      },
    ],
  },
];
```

### **Step 2: Settings Module Enhancement**

#### **Target Files:**

- `src/Modules/Settings/`
- `src/Modules/Settings/components/ProvinceList.js` (already has basic RBAC)

#### **Implementation:**

```javascript
// src/Modules/Settings/screens/Overview/index.js
import React from "react";
import { Card, Row, Col } from "antd";
import { PermissionGate, ProvinceSelector } from "components";
import { usePermissions } from "hooks/usePermissions";

const SettingsOverview = () => {
  const { hasPermission, isSuperAdmin, hasProvinceAccess } = usePermissions();

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Province Management */}
        <Col span={8}>
          <PermissionGate
            permission="admin.edit"
            minAccessLevel="all"
            fallback={
              <Card>
                <p>ไม่มีสิทธิ์จัดการจังหวัด</p>
              </Card>
            }
          >
            <Card title="จัดการจังหวัด" hoverable>
              <p>เพิ่ม/แก้ไข/ลบ จังหวัด</p>
              <Button href="/settings/provinces">จัดการจังหวัด</Button>
            </Card>
          </PermissionGate>
        </Col>

        {/* Branch Management */}
        <Col span={8}>
          <PermissionGate
            permission="admin.edit"
            fallback={
              <Card>
                <p>ไม่มีสิทธิ์จัดการสาขา</p>
              </Card>
            }
          >
            <Card title="จัดการสาขา" hoverable>
              <p>เพิ่ม/แก้ไข/ลบ สาขา</p>
              <Button href="/settings/branches">จัดการสาขา</Button>
            </Card>
          </PermissionGate>
        </Col>

        {/* User Management */}
        <Col span={8}>
          <PermissionGate
            permission="admin.edit"
            fallback={
              <Card>
                <p>ไม่มีสิทธิ์จัดการผู้ใช้</p>
              </Card>
            }
          >
            <Card title="จัดการผู้ใช้" hoverable>
              <p>เพิ่ม/แก้ไข/ลบ ผู้ใช้</p>
              <Button href="/settings/users">จัดการผู้ใช้</Button>
            </Card>
          </PermissionGate>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsOverview;
```

### **Step 3: User Management Module Integration**

#### **Target Files:**

- `src/Modules/Users/`

#### **Enhanced User List with Geographic Filtering:**

```javascript
// src/Modules/Users/screens/UserList/index.js
import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag } from "antd";
import {
  PermissionGate,
  ProvinceSelector,
  GeographicBranchSelector,
} from "components";
import { usePermissions, useRBAC } from "hooks";

const UserList = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [users, setUsers] = useState([]);

  const {
    filterDataByUserAccess,
    accessibleProvinces,
    accessibleBranches,
    isSuperAdmin,
  } = usePermissions();

  const { getUsersByLevel, canManageUsers } = useRBAC();

  // Filter users based on current user's geographic access
  const filteredUsers = filterDataByUserAccess(users, {
    provinceField: "homeProvince",
    branchField: "homeBranch",
  });

  const columns = [
    {
      title: "ชื่อ",
      dataIndex: "displayName",
      key: "name",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "ระดับการเข้าถึง",
      dataIndex: "accessLevel",
      key: "accessLevel",
      render: (level) => (
        <Tag
          color={
            level === "SUPER_ADMIN"
              ? "red"
              : level === "PROVINCE_MANAGER"
              ? "blue"
              : "green"
          }
        >
          {level}
        </Tag>
      ),
    },
    {
      title: "จังหวัด",
      dataIndex: "homeProvince",
      key: "province",
    },
    {
      title: "สาขา",
      dataIndex: "homeBranch",
      key: "branch",
    },
    {
      title: "การกระทำ",
      key: "actions",
      render: (_, record) => (
        <Space>
          <PermissionGate permission="admin.edit">
            <Button size="small">แก้ไข</Button>
          </PermissionGate>

          <PermissionGate
            permission="admin.edit"
            customCheck={({ userRole }) => userRole === "SUPER_ADMIN"}
          >
            <Button size="small" danger>
              ลบ
            </Button>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {/* Geographic Filters */}
        <ProvinceSelector
          value={selectedProvince}
          onChange={setSelectedProvince}
          placeholder="เลือกจังหวัด"
          respectRBAC={true}
          showAll={true}
        />

        <GeographicBranchSelector
          value={selectedBranch}
          onChange={setSelectedBranch}
          province={selectedProvince}
          placeholder="เลือกสาขา"
          respectRBAC={true}
          showAll={true}
        />

        <PermissionGate permission="admin.edit">
          <Button type="primary">เพิ่มผู้ใช้ใหม่</Button>
        </PermissionGate>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="uid"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
        }}
      />
    </div>
  );
};

export default UserList;
```

---

## 🔄 **Phase 2: Core Business Modules**

### **Step 4: Sales Module Integration**

#### **Pattern for Sales Data with Geographic Filtering:**

```javascript
// src/Modules/Sales/screens/VehicleSales/index.js
import React, { useState, useEffect } from "react";
import { usePermissions } from "hooks/usePermissions";
import {
  PermissionGate,
  ProvinceSelector,
  GeographicBranchSelector,
} from "components";

const VehicleSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const {
    filterDataByUserAccess,
    hasPermission,
    shouldShowProvinceSelector,
    getDefaultBranch,
  } = usePermissions();

  // Filter sales data by user's geographic access
  const visibleSalesData = filterDataByUserAccess(salesData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  // Further filter by selected geographic filters
  const filteredSalesData = visibleSalesData.filter((sale) => {
    if (selectedProvince && sale.provinceId !== selectedProvince) return false;
    if (selectedBranch && sale.branchCode !== selectedBranch) return false;
    return true;
  });

  return (
    <div>
      {/* Geographic Filters */}
      {shouldShowProvinceSelector() && (
        <div style={{ marginBottom: 16 }}>
          <ProvinceSelector
            value={selectedProvince}
            onChange={setSelectedProvince}
            respectRBAC={true}
            style={{ width: 200, marginRight: 8 }}
          />

          <GeographicBranchSelector
            value={selectedBranch}
            onChange={setSelectedBranch}
            province={selectedProvince}
            respectRBAC={true}
            style={{ width: 200 }}
          />
        </div>
      )}

      {/* Sales Actions */}
      <Space style={{ marginBottom: 16 }}>
        <PermissionGate permission="sales.edit">
          <Button type="primary">เพิ่มการขายใหม่</Button>
        </PermissionGate>

        <PermissionGate permission="sales.review">
          <Button>ตรวจสอบการขาย</Button>
        </PermissionGate>

        <PermissionGate permission="sales.approve">
          <Button>อนุมัติการขาย</Button>
        </PermissionGate>
      </Space>

      {/* Sales Data Table */}
      <Table
        dataSource={filteredSalesData}
        columns={salesColumns}
        rowKey="saleId"
      />
    </div>
  );
};
```

### **Step 5: Account/Financial Module Integration**

#### **Income/Expense with RBAC:**

```javascript
// src/Modules/Account/screens/Income/IncomeOverview/index.js
import React, { useState, useEffect } from "react";
import { usePermissions } from "hooks/usePermissions";
import { PermissionGate } from "components";

const IncomeOverview = () => {
  const [incomeData, setIncomeData] = useState([]);
  const {
    filterDataByUserAccess,
    hasPermission,
    accessibleBranches,
    getDefaultBranch,
  } = usePermissions();

  // Only show income data for branches user can access
  const visibleIncomeData = filterDataByUserAccess(incomeData, {
    branchField: "branchCode",
  });

  return (
    <div>
      {/* Income Entry Form */}
      <PermissionGate
        permission="accounting.edit"
        fallback={<Alert message="ไม่มีสิทธิ์บันทึกรายได้" type="warning" />}
      >
        <Card title="บันทึกรายได้">
          <IncomeForm
            onSubmit={handleIncomeSubmit}
            allowedBranches={accessibleBranches}
            defaultBranch={getDefaultBranch()}
          />
        </Card>
      </PermissionGate>

      {/* Income Reports */}
      <PermissionGate permission="accounting.view">
        <Card title="รายงานรายได้" style={{ marginTop: 16 }}>
          <IncomeTable data={visibleIncomeData} />
        </Card>
      </PermissionGate>

      {/* Financial Summary - Province Manager+ Only */}
      <PermissionGate
        permission="accounting.review"
        minAccessLevel="province"
        fallback={null}
      >
        <Card title="สรุปการเงินรวม" style={{ marginTop: 16 }}>
          <FinancialSummary data={visibleIncomeData} />
        </Card>
      </PermissionGate>
    </div>
  );
};
```

---

## 📊 **Implementation Testing Strategy**

### **Testing Checklist for Each Page:**

```javascript
// Test helper for RBAC integration
export const testRBACIntegration = (pageName, testCases) => {
  describe(`RBAC Integration - ${pageName}`, () => {
    testCases.forEach((testCase) => {
      test(`${testCase.role} should ${testCase.expected}`, async () => {
        // 1. Set user role
        await setUserRole(testCase.role);

        // 2. Navigate to page
        await navigateToPage(testCase.page);

        // 3. Verify visible elements
        testCase.visibleElements.forEach((element) => {
          expect(screen.getByTestId(element)).toBeInTheDocument();
        });

        // 4. Verify hidden elements
        testCase.hiddenElements.forEach((element) => {
          expect(screen.queryByTestId(element)).not.toBeInTheDocument();
        });

        // 5. Test data filtering
        const tableData = screen.getByTestId("data-table");
        expect(tableData.rows).toHaveLength(testCase.expectedDataCount);
      });
    });
  });
};

// Example test cases for Sales module
const salesModuleTests = [
  {
    role: "SUPER_ADMIN",
    page: "/sales/vehicles",
    expected: "see all sales data and all actions",
    visibleElements: [
      "add-sale-btn",
      "edit-sale-btn",
      "approve-sale-btn",
      "province-selector",
    ],
    hiddenElements: [],
    expectedDataCount: 100, // All sales
  },
  {
    role: "PROVINCE_MANAGER",
    page: "/sales/vehicles",
    expected: "see province sales and manage actions",
    visibleElements: ["add-sale-btn", "edit-sale-btn", "approve-sale-btn"],
    hiddenElements: ["super-admin-panel"],
    expectedDataCount: 50, // Province sales only
  },
  {
    role: "SALES_STAFF",
    page: "/sales/vehicles",
    expected: "see branch sales and basic actions",
    visibleElements: ["add-sale-btn", "edit-sale-btn"],
    hiddenElements: ["approve-sale-btn", "province-selector"],
    expectedDataCount: 10, // Branch sales only
  },
];
```

---

## 🔧 **Common Integration Patterns**

### **Pattern 1: Page-Level RBAC Guard**

```javascript
// Wrap entire pages with permission gates
const ProtectedPage = () => {
  return (
    <PermissionGate permission="sales.view" fallback={<AccessDeniedPage />}>
      <SalesPage />
    </PermissionGate>
  );
};
```

### **Pattern 2: Component-Level Permission**

```javascript
// Individual component protection
const ActionButton = ({ action, children }) => {
  return (
    <PermissionGate permission={`sales.${action}`}>
      <Button>{children}</Button>
    </PermissionGate>
  );
};
```

### **Pattern 3: Data Filtering Hook**

```javascript
// Custom hook for consistent data filtering
const useSalesData = () => {
  const [rawData, setRawData] = useState([]);
  const { filterDataByUserAccess } = usePermissions();

  const filteredData = useMemo(() => {
    return filterDataByUserAccess(rawData, {
      provinceField: "provinceId",
      branchField: "branchCode",
    });
  }, [rawData, filterDataByUserAccess]);

  return { data: filteredData, setData: setRawData };
};
```

### **Pattern 4: Geographic Context Provider**

```javascript
// Context for page-level geographic state
const GeographicContext = createContext();

const GeographicProvider = ({ children }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <GeographicContext.Provider
      value={{
        selectedProvince,
        setSelectedProvince,
        selectedBranch,
        setSelectedBranch,
      }}
    >
      {children}
    </GeographicContext.Provider>
  );
};
```

---

## 📝 **Implementation Checklist**

### **For Each Module Integration:**

- [ ] **Identify Data Sources** - What data needs geographic filtering?
- [ ] **Map Permissions** - Which actions require which department.flow permissions?
- [ ] **Add Geographic Selectors** - Where do users need province/branch filters?
- [ ] **Test Role Scenarios** - Verify each role sees correct data/actions
- [ ] **Validate Existing Functionality** - Ensure no breaking changes
- [ ] **Update Navigation** - Add RBAC filtering to menu items
- [ ] **Document Changes** - Record integration patterns for future reference

### **Quality Assurance:**

- [ ] **Data Integrity** - Same data visible for same access levels
- [ ] **Performance** - No significant slowdown from filtering
- [ ] **User Experience** - Intuitive permission feedback
- [ ] **Security** - No data leakage between geographic areas
- [ ] **Backward Compatibility** - Existing users maintain access

---

**Ready to start with Phase 1?** Let's begin with the navigation system integration!
