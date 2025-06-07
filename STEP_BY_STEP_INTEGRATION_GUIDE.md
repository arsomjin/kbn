# KBN RBAC Step-by-Step Integration Guide

## 🎯 **Ready to Start Integration?**

Let's implement RBAC integration systematically, starting with the highest-impact areas. I'll provide **exact code changes** for each step.

---

## 📋 **Step 1: Update Overview Module (Starting Point)**

**File**: `src/Modules/Overview/index.js`  
**Current Status**: Basic permission check  
**Goal**: Full RBAC integration with geographic filtering

### **Current Code Analysis:**

```javascript
// Current permission check (line 114):
if (user?.isDev || (user?.permCats && user.permCats?.permCat001)) {
  return <Dashboard />;
}
```

### **🔧 Updated Implementation:**

<details>
<summary><strong>Replace the entire Overview/index.js file</strong></summary>

```javascript
import { Skeleton } from "antd";
import { checkCollection } from "firebase/api";
import { showAlert, showWarn } from "functions";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "redux/actions/auth";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import { checkDoc } from "firebase/api";
import { FirebaseContext } from "../../firebase";

// ✅ Add RBAC imports
import { PermissionGate, ProvinceSelector } from "components";
import { usePermissions } from "hooks/usePermissions";

export default () => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);
  const { branches, departments } = useSelector((state) => state.data);
  const [userData, setUser] = useState({});
  const [ready, setReady] = useState(false);
  const alertRef = useRef();

  // ✅ Add RBAC hooks
  const {
    hasPermission,
    hasDepartmentAccess,
    isSuperAdmin,
    accessibleProvinces,
    shouldShowProvinceSelector,
  } = usePermissions();

  const dispatch = useDispatch();

  const _checkStatus = useCallback(
    async (usr) => {
      try {
        if (!usr?.firstName) {
          return;
        }
        // Get status.
        let wheres = [["firstName", "==", usr.firstName]];
        if (!!usr?.lastName) {
          wheres = wheres.concat([["lastName", "==", usr.lastName]]);
        }
        const snap = await checkCollection("data/company/employees", wheres);
        let userData = [];
        if (snap) {
          snap.forEach((doc) => {
            userData.push({
              ...doc.data(),
              _key: doc.id,
              id: userData.length,
              key: userData.length,
            });
          });
        }
        if (userData.length > 0) {
          let status = userData[0]?.status || "ปกติ";
          if (status === "ลาออก") {
            // Update state.
            const stateDoc = await checkDoc("status", user.uid);
            if (stateDoc) {
              await api.updateItem(
                {
                  ...stateDoc.data(),
                  state: "offline",
                  last_offline: Date.now(),
                },
                "status",
                user.uid
              );
            }
            // Sign user out.
            dispatch(logoutUser());
            !alertRef.current &&
              showAlert(
                "ไม่สามารถเข้าระบบได้",
                `สถานภาพปัจจุบันของคุณ${usr.firstName} ${
                  usr.lastName || ""
                } คือ "ลาออก" หากข้อมูลไม่ถูกต้อง กรุณาติดต่อฝ่ายบุคคล`,
                "warning"
              );
            alertRef.current = true;
          }
        }
      } catch (e) {
        showWarn(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const uData = {
      coverImg: require("../../images/user-profile/up-user-details-background.jpg"),
      avatarImg:
        user?.photoURL || require("../../images/avatars/blank-profile.png"),
      name: user?.displayName || `${user.firstName} ${user.lastName}`,
      bio: "คูโบต้าเบญจพล",
      email: user.email,
      location: user?.branch ? branches[user.branch]?.branchName || "-" : "-",
      phone: user.phoneNumber || "-",
      department: user?.department
        ? departments[user.department]?.department || "-"
        : "-",
      social: {
        facebook: "#",
        twitter: "#",
        github: "#",
        slack: "#",
      },
      tags: [
        "User Experience",
        "UI Design",
        "React JS",
        "HTML & CSS",
        "JavaScript",
        "Bootstrap 4",
      ],
    };
    _checkStatus(user);
    setUser(uData);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return <Skeleton active />;
  }

  // ✅ Enhanced permission logic with RBAC
  const canAccessDashboard =
    user?.isDev ||
    isSuperAdmin ||
    hasPermission("reports.view") ||
    (user?.permCats && user.permCats?.permCat001);

  if (canAccessDashboard) {
    return (
      <PermissionGate
        permission="reports.view"
        fallback={<LandingPage userData={userData} />}
      >
        <Dashboard />
      </PermissionGate>
    );
  }

  return <LandingPage userData={userData} />;
};
```

</details>

### **✅ Test Results Expected:**

- **Super Admin**: Sees Dashboard
- **Province Manager**: Sees Dashboard
- **Branch Manager**: Sees Dashboard
- **Staff**: Sees Landing Page (unless has reports.view permission)

---

## 📋 **Step 2: Enhanced Dashboard Component with Geographic Context**

**File**: `src/Modules/Overview/components/Dashboard.js`  
**Goal**: Add province selector and geographic-aware data

<details>
<summary><strong>Dashboard Enhancement Pattern</strong></summary>

```javascript
// Add these imports at the top of Dashboard.js
import { Card, Row, Col, Space } from "antd";
import {
  ProvinceSelector,
  GeographicBranchSelector,
  PermissionGate,
} from "components";
import { usePermissions } from "hooks/usePermissions";
import { useState } from "react";

// Inside Dashboard component, add geographic state
const Dashboard = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const {
    shouldShowProvinceSelector,
    accessibleProvinces,
    filterDataByUserAccess,
    hasPermission,
  } = usePermissions();

  return (
    <div>
      {/* Geographic Selector Header */}
      {shouldShowProvinceSelector() && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <span>เลือกข้อมูลที่ต้องการดู:</span>
            <ProvinceSelector
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="เลือกจังหวัด"
              respectRBAC={true}
              showAll={true}
              style={{ width: 200 }}
            />
            <GeographicBranchSelector
              value={selectedBranch}
              onChange={setSelectedBranch}
              province={selectedProvince}
              placeholder="เลือกสาขา"
              respectRBAC={true}
              showAll={true}
              style={{ width: 200 }}
            />
          </Space>
        </Card>
      )}

      {/* Permission-based Dashboard Cards */}
      <Row gutter={[16, 16]}>
        {/* Sales Overview */}
        <Col span={8}>
          <PermissionGate permission="sales.view">
            <Card title="ภาพรวมการขาย" hoverable>
              <SalesOverviewCard
                province={selectedProvince}
                branch={selectedBranch}
              />
            </Card>
          </PermissionGate>
        </Col>

        {/* Financial Overview */}
        <Col span={8}>
          <PermissionGate permission="accounting.view">
            <Card title="ภาพรวมการเงิน" hoverable>
              <FinancialOverviewCard
                province={selectedProvince}
                branch={selectedBranch}
              />
            </Card>
          </PermissionGate>
        </Col>

        {/* Admin Overview */}
        <Col span={8}>
          <PermissionGate permission="admin.view" minAccessLevel="province">
            <Card title="การจัดการระบบ" hoverable>
              <AdminOverviewCard />
            </Card>
          </PermissionGate>
        </Col>
      </Row>

      {/* Existing dashboard content */}
      {/* Keep your existing dashboard components here */}
    </div>
  );
};
```

</details>

---

## 📋 **Step 3: Sales Module Integration**

**Next Target**: `src/Modules/Sales/` directory  
**Priority**: High - Core business functionality

### **Step 3a: Sales Overview Page**

<details>
<summary><strong>Sales Module Integration Pattern</strong></summary>

```javascript
// src/Modules/Sales/screens/Overview/index.js
import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Row, Col, Statistic } from "antd";
import {
  PermissionGate,
  ProvinceSelector,
  GeographicBranchSelector,
} from "components";
import { usePermissions } from "hooks/usePermissions";

const SalesOverview = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    filterDataByUserAccess,
    hasPermission,
    shouldShowProvinceSelector,
    accessibleBranches,
  } = usePermissions();

  // Filter sales data by user's geographic access
  const visibleSalesData = filterDataByUserAccess(salesData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  // Further filter by selected filters
  const filteredSalesData = visibleSalesData.filter((sale) => {
    if (selectedProvince && sale.provinceId !== selectedProvince) return false;
    if (selectedBranch && sale.branchCode !== selectedBranch) return false;
    return true;
  });

  const columns = [
    {
      title: "รหัสการขาย",
      dataIndex: "saleId",
      key: "saleId",
    },
    {
      title: "ลูกค้า",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "จังหวัด",
      dataIndex: "provinceId",
      key: "provinceId",
    },
    {
      title: "สาขา",
      dataIndex: "branchCode",
      key: "branchCode",
    },
    {
      title: "ยอดขาย",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount?.toLocaleString()} บาท`,
    },
    {
      title: "การกระทำ",
      key: "actions",
      render: (_, record) => (
        <Space>
          <PermissionGate permission="sales.edit">
            <Button size="small">แก้ไข</Button>
          </PermissionGate>

          <PermissionGate permission="sales.review">
            <Button size="small">ตรวจสอบ</Button>
          </PermissionGate>

          <PermissionGate permission="sales.approve">
            <Button size="small" type="primary">
              อนุมัติ
            </Button>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalSales = filteredSalesData.reduce(
    (sum, sale) => sum + (sale.amount || 0),
    0
  );
  const totalTransactions = filteredSalesData.length;
  const avgSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div>
      {/* Geographic Filters */}
      {shouldShowProvinceSelector() && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <span>กรองข้อมูล:</span>
            <ProvinceSelector
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="เลือกจังหวัด"
              respectRBAC={true}
              showAll={true}
              style={{ width: 200 }}
            />
            <GeographicBranchSelector
              value={selectedBranch}
              onChange={setSelectedBranch}
              province={selectedProvince}
              placeholder="เลือกสาขา"
              respectRBAC={true}
              showAll={true}
              style={{ width: 200 }}
            />
          </Space>
        </Card>
      )}

      {/* Sales Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="ยอดขายรวม"
              value={totalSales}
              suffix="บาท"
              precision={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="จำนวนรายการ"
              value={totalTransactions}
              suffix="รายการ"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="ยอดขายเฉลี่ย"
              value={avgSale}
              suffix="บาท"
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <PermissionGate permission="sales.edit">
            <Button type="primary">เพิ่มการขายใหม่</Button>
          </PermissionGate>

          <PermissionGate permission="sales.review">
            <Button>รายการรอตรวจสอบ</Button>
          </PermissionGate>

          <PermissionGate permission="reports.view">
            <Button>รายงานการขาย</Button>
          </PermissionGate>
        </Space>
      </Card>

      {/* Sales Table */}
      <Card title="รายการขาย">
        <Table
          columns={columns}
          dataSource={filteredSalesData}
          rowKey="saleId"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>
    </div>
  );
};

export default SalesOverview;
```

</details>

---

## 📋 **Step 4: Testing Each Integration**

### **Manual Testing Checklist:**

```javascript
// Testing Script for Each Module
const testModuleIntegration = async (moduleName) => {
  console.log(`🧪 Testing ${moduleName} Integration`);

  // Test 1: Super Admin Access
  await testUserRole("SUPER_ADMIN", {
    shouldSee: ["all data", "all buttons", "province selector"],
    shouldNotSee: [],
  });

  // Test 2: Province Manager Access
  await testUserRole("PROVINCE_MANAGER", {
    shouldSee: ["province data", "management buttons", "province selector"],
    shouldNotSee: ["other province data"],
  });

  // Test 3: Branch Manager Access
  await testUserRole("BRANCH_MANAGER", {
    shouldSee: ["branch data", "basic buttons"],
    shouldNotSee: ["other branch data", "province selector"],
  });

  // Test 4: Staff Access
  await testUserRole("SALES_STAFF", {
    shouldSee: ["own branch data", "view buttons"],
    shouldNotSee: ["edit buttons", "other branch data"],
  });
};
```

### **Browser Testing Steps:**

1. **Open Browser Dev Tools** → Console
2. **Test Role Switching**:
   ```javascript
   // In browser console
   await window.KBN_MIGRATION.setTestUserRole("PROVINCE_MANAGER");
   // Navigate to module and verify access
   ```
3. **Check Data Filtering**:
   - Verify only accessible data shows
   - Test province/branch selectors
   - Confirm buttons appear/disappear correctly

---

## 📋 **Step 5: Account Module Integration**

**Target**: `src/Modules/Account/screens/Income/`  
**Focus**: Financial data with strict geographic filtering

<details>
<summary><strong>Income Module RBAC Pattern</strong></summary>

```javascript
// src/Modules/Account/screens/Income/IncomeOverview/index.js
import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Input, Select, DatePicker } from "antd";
import { PermissionGate, GeographicBranchSelector } from "components";
import { usePermissions } from "hooks/usePermissions";

const IncomeOverview = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [form] = Form.useForm();

  const {
    filterDataByUserAccess,
    accessibleBranches,
    hasPermission,
    getDefaultBranch,
  } = usePermissions();

  // Filter income data by user's branch access
  const visibleIncomeData = filterDataByUserAccess(incomeData, {
    branchField: "branchCode",
  });

  const handleSubmit = async (values) => {
    // ✅ Validate user can add income for selected branch
    const branch = values.branchCode;
    const canAccessBranch = accessibleBranches.some(
      (b) => b.branchCode === branch
    );

    if (!canAccessBranch) {
      message.error("ไม่มีสิทธิ์บันทึกรายได้สำหรับสาขานี้");
      return;
    }

    // Proceed with income entry
    await submitIncome(values);
  };

  return (
    <div>
      {/* Income Entry Form */}
      <PermissionGate
        permission="accounting.edit"
        fallback={
          <Card>
            <Alert
              message="ไม่มีสิทธิ์บันทึกรายได้"
              description="ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง"
              type="warning"
              showIcon
            />
          </Card>
        }
      >
        <Card title="บันทึกรายได้" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="สาขา"
              name="branchCode"
              rules={[{ required: true, message: "กรุณาเลือกสาขา" }]}
            >
              <GeographicBranchSelector
                placeholder="เลือกสาขา"
                respectRBAC={true}
                autoSelect={accessibleBranches.length === 1}
                defaultValue={getDefaultBranch()}
              />
            </Form.Item>

            <Form.Item
              label="ยอดรายได้"
              name="amount"
              rules={[{ required: true, message: "กรุณาระบุยอดรายได้" }]}
            >
              <Input type="number" suffix="บาท" />
            </Form.Item>

            <Form.Item
              label="วันที่"
              name="date"
              rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                บันทึกรายได้
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PermissionGate>

      {/* Income Reports */}
      <PermissionGate permission="accounting.view">
        <Card title="รายงานรายได้">
          <Table
            dataSource={visibleIncomeData}
            columns={incomeColumns}
            rowKey="id"
          />
        </Card>
      </PermissionGate>

      {/* Financial Summary - Province Manager+ Only */}
      <PermissionGate permission="accounting.review" minAccessLevel="province">
        <Card title="สรุปการเงินรวม" style={{ marginTop: 16 }}>
          <FinancialSummaryReport data={visibleIncomeData} />
        </Card>
      </PermissionGate>
    </div>
  );
};

export default IncomeOverview;
```

</details>

---

## 🎯 **Implementation Schedule**

### **Week 1: Foundation**

- [ ] Step 1: Overview Module ✅
- [ ] Step 2: Dashboard Enhancement
- [ ] Test both modules thoroughly

### **Week 2: Core Business**

- [ ] Step 3: Sales Module Integration
- [ ] Step 4: Account Module Integration
- [ ] Cross-module testing

### **Week 3: Advanced Features**

- [ ] Reports Module with advanced filtering
- [ ] Settings Module enhancements
- [ ] User Management improvements

### **Week 4: Polish & Deploy**

- [ ] Navigation system integration
- [ ] Performance optimization
- [ ] Final testing & deployment

---

## 🚀 **Ready to Start?**

**Let's begin with Step 1 - Overview Module Integration!**

1. **Make the changes** to `src/Modules/Overview/index.js`
2. **Test the changes** with different user roles
3. **Report results** - what works, what needs adjustment
4. **Move to Step 2** once Step 1 is working perfectly

Would you like me to help you implement Step 1 right now?
