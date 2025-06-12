# KBN Clean Slate RBAC Redesign - UI/UX Design

**Project**: KBN Multi-Province RBAC System  
**Document**: 05 - UI/UX Design  
**Created**: December 2024  
**Purpose**: Comprehensive UI/UX design guidelines for RBAC-enabled interface

---

## 🎯 **DESIGN PHILOSOPHY**

### **Core Principles**

- **MODERN NICE and CLEAN**
- **Intuitive Access Control** - RBAC should feel natural, not restrictive
- **Progressive Disclosure** - Show relevant features based on user role
- **Geographic Awareness** - Location context clearly visible
- **Consistent Patterns** - Same interaction patterns across modules
- **Accessibility First** - Inclusive design for all users

### **Design Values**

```
Simplicity > Complexity
Clarity > Cleverness
Consistency > Novelty
Function > Form
User Need > System Logic
```

---

## 🎨 **VISUAL DESIGN SYSTEM**

### **1. Nature-Inspired Color Palette**

```css
/* Primary Colors - Earthy Professional */
--primary-green: #52c41a; /* Success, positive actions */
--primary-blue: #1890ff; /* Information, navigation */
--primary-brown: #8b4513; /* Earthy, corporate identity */

/* Secondary Colors - Natural Tones */
--forest-green: #228b22; /* Active states */
--sky-blue: #87ceeb; /* Hover states */
--warm-beige: #f5f5dc; /* Backgrounds */
--earth-brown: #a0522d; /* Accents */

/* Functional Colors */
--success: #52c41a; /* Success messages */
--warning: #faad14; /* Warnings, attention */
--error: #ff4d4f; /* Errors, danger */
--info: #1890ff; /* Information */

/* Neutral Colors */
--text-primary: #262626; /* Primary text */
--text-secondary: #8c8c8c; /* Secondary text */
--border-color: #d9d9d9; /* Borders */
--background: #fafafa; /* Page background */
```

### **2. Typography System**

```css
/* Font Families */
--font-primary: "Kanit", -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary: "Sarabun", system-ui, sans-serif;
--font-mono: "Fira Code", "Monaco", monospace;

/* Font Scales */
--text-xs: 12px; /* Helper text */
--text-sm: 14px; /* Body text */
--text-base: 16px; /* Default */
--text-lg: 18px; /* Emphasis */
--text-xl: 20px; /* Headings */
--text-2xl: 24px; /* Page titles */
--text-3xl: 30px; /* Section headers */
```

### **3. Spacing System**

```css
/* Consistent spacing scale */
--space-xs: 4px; /* Tight spacing */
--space-sm: 8px; /* Small gaps */
--space-md: 16px; /* Standard spacing */
--space-lg: 24px; /* Section spacing */
--space-xl: 32px; /* Page margins */
--space-2xl: 48px; /* Large sections */
```

---

## 🏗️ **LAYOUT PATTERNS**

### **1. RBAC-Aware Layout Structure**

```jsx
const RBACLayout = () => (
  <Layout style={{ minHeight: "100vh" }}>
    {/* Header with role indicator */}
    <Header className="rbac-header">
      <RoleIndicator />
      <GeographicContext />
      <UserMenu />
    </Header>

    {/* Sidebar with filtered navigation */}
    <Layout>
      <Sider className="rbac-sidebar">
        <FilteredNavigation />
      </Sider>

      {/* Main content area */}
      <Layout>
        <Content className="rbac-content">
          <BreadcrumbTrail />
          <PageContent />
        </Content>

        <Footer>
          <AuditInfo />
        </Footer>
      </Layout>
    </Layout>
  </Layout>
);
```

### **2. Geographic Context Display**

```jsx
const GeographicContextDisplay = ({ selectedBranch, province }) => (
  <div className="geographic-context">
    <Space>
      <EnvironmentOutlined style={{ color: "#52c41a" }} />
      <Text strong>{getBranchName(selectedBranch)}</Text>
      <Text type="secondary">({getProvinceName(province)})</Text>
    </Space>
  </div>
);
```

### **3. Role-Based Dashboard Layout**

```jsx
// Manager Dashboard - Full overview
const ManagerDashboard = () => (
  <Row gutter={[24, 24]}>
    <Col span={24}>
      <OverviewMetrics />
    </Col>
    <Col span={16}>
      <DetailedReports />
    </Col>
    <Col span={8}>
      <QuickActions />
    </Col>
  </Row>
);

// Staff Dashboard - Focused on daily tasks
const StaffDashboard = () => (
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <DailyTasks />
    </Col>
    <Col span={12}>
      <RecentActivity />
    </Col>
    <Col span={12}>
      <QuickForms />
    </Col>
  </Row>
);
```

---

## 🔐 **RBAC UI COMPONENTS**

### **1. Permission Indicator Components**

```jsx
const PermissionBadge = ({ permission, children }) => {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission(permission);

  return (
    <Badge
      status={hasAccess ? "success" : "default"}
      text={children}
      style={{
        opacity: hasAccess ? 1 : 0.6,
        cursor: hasAccess ? "pointer" : "not-allowed",
      }}
    />
  );
};

const AuthorityIndicator = ({ authority, primaryDepartment }) => {
  const authorityConfig = {
    admin: { color: "red", icon: "👑" },
    manager: { color: "blue", icon: "🏢" },
    lead: { color: "green", icon: "🏪" },
    staff: { color: "orange", icon: "💼" },
  };

  const departmentConfig = {
    accounting: { color: "orange", icon: "💰" },
    sales: { color: "cyan", icon: "🚗" },
    service: { color: "lime", icon: "🔧" },
    inventory: { color: "gold", icon: "📦" },
  };

  const config = authorityConfig[authority];
  const deptConfig = primaryDepartment
    ? departmentConfig[primaryDepartment]
    : null;

  return (
    <Space>
      <Tag color={config.color} icon={config.icon}>
        {authority}
      </Tag>
      {deptConfig && (
        <Tag color={deptConfig.color} icon={deptConfig.icon}>
          {primaryDepartment}
        </Tag>
      )}
    </Space>
  );
};
```

### **2. Geographic Selection Components**

```jsx
const GeographicSelector = ({ showProvinceSelector = true }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <Card title="Geographic Context" size="small">
      <Space direction="vertical" style={{ width: "100%" }}>
        {showProvinceSelector && (
          <ProvinceSelector
            value={selectedProvince}
            onChange={setSelectedProvince}
            respectRBAC={true}
            size="large"
          />
        )}

        <GeographicBranchSelector
          province={selectedProvince}
          value={selectedBranch}
          onChange={setSelectedBranch}
          respectRBAC={true}
          showBranchCode={true}
          size="large"
        />

        {selectedBranch && (
          <Alert
            message={`Selected: ${getBranchName(selectedBranch)}`}
            type="info"
            size="small"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};
```

### **3. Data Access Indicators**

```jsx
const DataAccessIndicator = ({ data, userAccess }) => {
  const accessLevel = determineAccessLevel(data, userAccess);

  const indicators = {
    FULL_ACCESS: {
      color: "green",
      text: "Full Access",
      icon: <CheckOutlined />,
    },
    READ_ONLY: { color: "blue", text: "Read Only", icon: <EyeOutlined /> },
    NO_ACCESS: { color: "red", text: "No Access", icon: <StopOutlined /> },
  };

  const indicator = indicators[accessLevel];

  return (
    <Space>
      {indicator.icon}
      <Text type={accessLevel === "NO_ACCESS" ? "danger" : "secondary"}>
        {indicator.text}
      </Text>
    </Space>
  );
};
```

---

## 📋 **FORM DESIGN PATTERNS**

### **1. RBAC-Enabled Forms**

```jsx
const RBACForm = ({ permission, editPermission, geographic }) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(editPermission);
  const canView = hasPermission(permission);

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <Form
      layout="vertical"
      disabled={!canEdit}
      onFinish={(values) => {
        const enhancedData = geographic.enhanceDataForSubmission(values);
        handleSubmit(enhancedData);
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="description" rules={[{ required: true }]}>
            <Input placeholder="Description" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="amount" rules={[{ required: true }]}>
            <InputNumber
              placeholder="Amount"
              style={{ width: "100%" }}
              formatter={(value) =>
                `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Geographic context automatically added */}
      <GeographicContextDisplay {...geographic} />

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!canEdit}
            loading={submitting}
          >
            {canEdit ? "Save" : "View Only"}
          </Button>

          {canEdit && <Button onClick={handleReset}>Reset</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
```

### **2. Permission-Based Field Visibility**

```jsx
const ConditionalFormFields = () => {
  const { hasPermission } = usePermissions();

  return (
    <Form>
      {/* Always visible fields */}
      <Form.Item name="basicInfo">
        <Input placeholder="Basic Information" />
      </Form.Item>

      {/* Conditional fields based on permissions */}
      <PermissionGate permission="accounting.view">
        <Form.Item name="financialData">
          <InputNumber placeholder="Financial Data" />
        </Form.Item>
      </PermissionGate>

      <PermissionGate permission="admin.edit">
        <Form.Item name="systemSettings">
          <Select placeholder="System Settings">
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
          </Select>
        </Form.Item>
      </PermissionGate>
    </Form>
  );
};
```

---

## 📊 **TABLE DESIGN PATTERNS**

### **1. RBAC-Enabled Data Table**

```jsx
const RBACDataTable = ({ data, actionPermissions }) => {
  const { hasPermission, filterDataByUserAccess } = usePermissions();

  // Filter data based on user's geographic access
  const filteredData = filterDataByUserAccess(data, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Province",
      dataIndex: "provinceId",
      key: "provinceId",
      render: (provinceId) => (
        <Tag color="blue">{getProvinceName(provinceId)}</Tag>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branchCode",
      key: "branchCode",
      render: (branchCode) => <Text code>{getBranchName(branchCode)}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <PermissionGate permission={actionPermissions.view}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              View
            </Button>
          </PermissionGate>

          <PermissionGate permission={actionPermissions.edit}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          </PermissionGate>

          <PermissionGate permission={actionPermissions.delete}>
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Data Management"
      extra={<DataAccessSummary data={filteredData} />}
    >
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items (filtered by access)`,
        }}
      />
    </Card>
  );
};
```

### **2. Geographic Information Display**

```jsx
const GeographicInfoColumn = () => ({
  title: "Location",
  key: "location",
  render: (_, record) => (
    <Space direction="vertical" size="small">
      <Tag color="green">
        <EnvironmentOutlined /> {getProvinceName(record.provinceId)}
      </Tag>
      <Text type="secondary" style={{ fontSize: "12px" }}>
        {getBranchName(record.branchCode)}
      </Text>
    </Space>
  ),
});
```

---

## 🧭 **NAVIGATION DESIGN**

### **1. Role-Based Navigation Menu**

```jsx
const NavigationMenu = () => {
  const { permissions, hasPermission } = usePermissions();
  const navigation = generateNavigationByPermissions(permissions);

  return (
    <Menu mode="inline" theme="light">
      {navigation.map((section) => (
        <Menu.SubMenu
          key={section.key}
          icon={section.icon}
          title={section.title}
        >
          {section.items
            .filter((item) => hasPermission(item.permission))
            .map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.title}
                {item.restricted && (
                  <Tag size="small" color="orange">
                    Limited
                  </Tag>
                )}
              </Menu.Item>
            ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );
};
```

### **2. Breadcrumb with Access Context**

```jsx
const RBACBreadcrumb = ({ items }) => {
  const { hasPermission } = usePermissions();

  return (
    <Breadcrumb>
      {items.map((item, index) => (
        <Breadcrumb.Item
          key={index}
          className={!hasPermission(item.permission) ? "restricted" : ""}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {!hasPermission(item.permission) && (
            <LockOutlined style={{ marginLeft: 4, color: "#ff4d4f" }} />
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};
```

---

## 🎨 **VISUAL FEEDBACK PATTERNS**

### **1. Permission State Indicators**

```jsx
const PermissionStateIndicator = ({ permission, children }) => {
  const { hasPermission } = usePermissions();
  const access = hasPermission(permission);

  return (
    <div className={`permission-indicator ${access ? "allowed" : "denied"}`}>
      {children}
      {!access && (
        <div className="access-overlay">
          <LockOutlined />
          <Text type="secondary">Insufficient permissions</Text>
        </div>
      )}
    </div>
  );
};

// CSS for visual feedback
const permissionStyles = `
.permission-indicator.denied {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

.permission-indicator.denied .access-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}
`;
```

### **2. Geographic Context Awareness**

```jsx
const GeographicAwareCard = ({ data, title }) => {
  const { getCurrentProvince } = useGeographicData();
  const currentProvince = getCurrentProvince();
  const isLocalData = data.provinceId === currentProvince?.provinceId;

  return (
    <Card
      title={
        <Space>
          {title}
          {isLocalData ? (
            <Tag color="green">Local</Tag>
          ) : (
            <Tag color="blue">Remote</Tag>
          )}
        </Space>
      }
      className={isLocalData ? "local-data" : "remote-data"}
      extra={<Text type="secondary">{getProvinceName(data.provinceId)}</Text>}
    >
      {/* Card content */}
    </Card>
  );
};
```

---

## 📱 **RESPONSIVE DESIGN PATTERNS**

### **1. Mobile-First RBAC Layout**

```jsx
const ResponsiveRBACLayout = () => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <Layout>
        <Header>
          <MobileHeader />
        </Header>
        <Content>
          <MobileNavigation />
          <MobileContent />
        </Content>
      </Layout>
    );
  }

  return <DesktopRBACLayout />;
};
```

### **2. Adaptive Permission Display**

```jsx
const AdaptivePermissionDisplay = ({ permissions }) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <Collapse>
        <Panel header="Permissions" key="permissions">
          <PermissionList permissions={permissions} compact />
        </Panel>
      </Collapse>
    );
  }

  return <PermissionGrid permissions={permissions} />;
};
```

---

## ✅ **DESIGN VALIDATION CHECKLIST**

### **Visual Consistency**

- [ ] Color palette applied consistently across all components
- [ ] Typography scale used appropriately
- [ ] Spacing system followed throughout
- [ ] Icon usage consistent and meaningful
- [ ] Status indicators clear and recognizable

### **RBAC Integration**

- [ ] Permission states clearly communicated
- [ ] Geographic context always visible
- [ ] Role indicators prominently displayed
- [ ] Access levels visually differentiated
- [ ] Restricted areas appropriately marked

### **User Experience**

- [ ] Navigation flows logically for each role
- [ ] Forms provide clear feedback
- [ ] Error states handled gracefully
- [ ] Loading states indicated
- [ ] Success actions confirmed

### **Accessibility**

- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] Alternative text provided for images

### **Responsive Design**

- [ ] Mobile layouts optimized
- [ ] Touch targets appropriately sized
- [ ] Content readable on all screen sizes
- [ ] Navigation accessible on mobile
- [ ] Performance optimized for mobile

---

**Previous Document**: [04-app-flow.md](./04-app-flow.md)  
**Next Document**: [06-modernization.md](./06-modernization.md)
