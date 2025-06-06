# Geographic & RBAC Components

This document explains how to use the enhanced geographic and role-based access control (RBAC) components in the KBN application.

## Components Overview

### 1. ProvinceSelector

Allows users to select provinces based on their geographic access permissions.

```jsx
import { ProvinceSelector } from "components";

<ProvinceSelector
  hasAll
  placeholder="เลือกจังหวัด"
  showBranchCount={true}
  onChange={(value) => console.log("Selected province:", value)}
/>;
```

**Props:**

- `hasAll` - Show "ทุกจังหวัด" option
- `onlyUserProvince` - Restrict to specific province
- `regionFilter` - Filter by region
- `showBranchCount` - Show number of branches per province
- `placeholder` - Custom placeholder text

### 2. Enhanced BranchSelector

The existing BranchSelector now supports province filtering and geographic access control.

```jsx
import { BranchSelector } from "components";

<BranchSelector
  hasAll
  provinceFilter="นครสวรรค์"
  placeholder="เลือกสาขา"
  onChange={(value) => console.log("Selected branch:", value)}
/>;
```

**New Props:**

- `provinceFilter` - Filter branches by province
- `regionFilter` - Filter branches by region

### 3. GeographicBranchSelector

Combined province and branch selector with automatic filtering.

```jsx
import { GeographicBranchSelector } from "components";

<GeographicBranchSelector
  hasAllProvinces={true}
  hasAllBranches={true}
  onProvinceChange={(province) => setSelectedProvince(province)}
  onBranchChange={(branch) => setSelectedBranch(branch)}
  colLayout={{ province: 8, branch: 16 }}
/>;
```

**Props:**

- `onProvinceChange` - Province selection callback
- `onBranchChange` - Branch selection callback
- `hasAllProvinces` - Show "ทุกจังหวัด" option
- `hasAllBranches` - Show "ทุกสาขา" option
- `colLayout` - Grid layout configuration
- `showProvinceSelector` - Show/hide province selector

### 4. PermissionGate

Conditional rendering based on user permissions and geographic access.

```jsx
import { PermissionGate } from 'components';

// Single permission check
<PermissionGate permission="manage_branches_in_province">
  <Button>Manage Branches</Button>
</PermissionGate>

// Multiple permissions (ANY)
<PermissionGate permissions={["view_reports", "manage_data"]}>
  <ReportsPanel />
</PermissionGate>

// Multiple permissions (ALL required)
<PermissionGate
  permissions={["admin_access", "manage_users"]}
  requireAll={true}
>
  <AdminPanel />
</PermissionGate>

// Geographic access check
<PermissionGate province="นครสวรรค์" branch="NSN001">
  <BranchSpecificContent />
</PermissionGate>

// With fallback content
<PermissionGate
  permission="view_financial_data"
  fallback={<div>Access Denied</div>}
>
  <FinancialReports />
</PermissionGate>
```

**Props:**

- `permission` - Single permission to check
- `permissions` - Array of permissions to check
- `requireAll` - Require all permissions (default: false = ANY)
- `province` - Check geographic access to province
- `branch` - Check geographic access to branch
- `fallback` - Content to show when access denied

## Usage Examples

### Form with Geographic Selection

```jsx
import React, { useState } from "react";
import { Form, Button } from "antd";
import { GeographicBranchSelector, PermissionGate } from "components";

const MyForm = () => {
  const [selectedProvince, setSelectedProvince] = useState();
  const [selectedBranch, setSelectedBranch] = useState();

  return (
    <Form>
      <Form.Item label="Location">
        <GeographicBranchSelector
          onProvinceChange={setSelectedProvince}
          onBranchChange={setSelectedBranch}
          hasAllProvinces={true}
        />
      </Form.Item>

      <PermissionGate
        permission="create_sales"
        province={selectedProvince}
        branch={selectedBranch}
      >
        <Form.Item>
          <Button type="primary">Create Sale</Button>
        </Form.Item>
      </PermissionGate>
    </Form>
  );
};
```

### Reports with Access Control

```jsx
import React from "react";
import { Card, Row, Col } from "antd";
import { PermissionGate, ProvinceSelector } from "components";

const ReportsPage = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <PermissionGate permission="view_branch_reports">
            <Card title="Branch Reports">
              <p>Branch-specific reports</p>
            </Card>
          </PermissionGate>
        </Col>

        <Col span={8}>
          <PermissionGate permission="view_province_reports">
            <Card title="Province Reports">
              <p>Province-wide reports</p>
            </Card>
          </PermissionGate>
        </Col>

        <Col span={8}>
          <PermissionGate permissions={["admin_access", "view_all_reports"]}>
            <Card title="Admin Reports">
              <p>System-wide reports</p>
            </Card>
          </PermissionGate>
        </Col>
      </Row>
    </div>
  );
};
```

## Access Levels

The system supports three access levels:

1. **`all`** - Super admin access to everything
2. **`province`** - Access to specific provinces and their branches
3. **`branch`** - Access to specific branches only

Components automatically adapt based on the user's access level and geographic restrictions.

## RBAC Integration

All components integrate with the RBAC system through the `usePermissions` hook:

```jsx
import { usePermissions } from "hooks/usePermissions";

const MyComponent = () => {
  const {
    hasPermission,
    hasGeographicAccess,
    getAccessibleBranches,
    getAccessibleProvinces,
    userAccessLevel,
  } = usePermissions();

  // Check specific permission
  const canManage = hasPermission("manage_branches");

  // Check geographic access
  const canAccessProvince = hasGeographicAccess({
    province: "นครสวรรค์",
  });

  return (
    <div>
      {userAccessLevel === "all" && <AdminPanel />}
      {canManage && <ManagementTools />}
      {canAccessProvince && <ProvinceData />}
    </div>
  );
};
```

This system ensures that users only see and can interact with data they have permission to access, both functionally and geographically.
