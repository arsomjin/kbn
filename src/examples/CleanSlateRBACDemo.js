/**
 * Clean Slate RBAC Demo Component
 * Comprehensive demonstration of the new clean slate RBAC system
 */

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Descriptions, 
  Tag, 
  Table,
  Form,
  Input,
  Select,
  Switch,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  SecurityScanOutlined, 
  GlobalOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

import LayoutWithRBAC from '../components/layout/LayoutWithRBAC';
import PermissionGate, { 
  AccountingGate,
  SalesGate,
  ServiceGate,
  InventoryGate,
  AdminGate
} from '../components/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';
import { 
  AUTHORITY_LEVELS, 
  DEPARTMENTS
} from '../utils/orthogonal-rbac';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Simple role presets for demo
const ROLE_PRESETS = {
  ACCOUNTING_STAFF: {
    authority: 'DEPARTMENT',
    permissions: ['accounting.view', 'accounting.edit'],
    departments: ['ACCOUNTING'],
    geographic: { scope: 'BRANCH' }
  },
  SALES_STAFF: {
    authority: 'DEPARTMENT', 
    permissions: ['sales.view', 'sales.edit'],
    departments: ['SALES'],
    geographic: { scope: 'BRANCH' }
  },
  BRANCH_MANAGER: {
    authority: 'BRANCH',
    permissions: ['accounting.view', 'sales.view', 'service.view', 'inventory.view'],
    departments: ['MANAGEMENT'],
    geographic: { scope: 'BRANCH' }
  },
  PROVINCE_MANAGER: {
    authority: 'PROVINCE',
    permissions: ['accounting.approve', 'sales.approve', 'service.approve'],
    departments: ['MANAGEMENT'],
    geographic: { scope: 'PROVINCE' }
  }
};

/**
 * Mock data for demo
 */
const mockUserData = {
  admin: {
    uid: 'admin-001',
    authority: 'ADMIN',
    permissions: ['admin.system', 'admin.users', 'admin.settings', 'reports.cross-province'],
    departments: [],
    allowedProvinces: ['*'],
    allowedBranches: ['*'],
    isActive: true
  },
  provinceManager: {
    uid: 'province-001',
    authority: 'MANAGER',
    permissions: ['province.manage', 'branch.manage', 'reports.province', 'accounting.approve', 'sales.approve'],
    departments: [],
    allowedProvinces: ['นครสวรรค์'],
    allowedBranches: ['NSN001', 'NSN002', 'NSN003'],
    isActive: true
  },
  branchManager: {
    uid: 'branch-001',
    authority: 'MANAGER',
    permissions: ['branch.manage', 'reports.branch', 'accounting.view', 'sales.view', 'service.view'],
    departments: [],
    allowedProvinces: ['นครสวรรค์'],
    allowedBranches: ['NSN001'],
    isActive: true
  },
  accountingStaff: {
    uid: 'accounting-001',
    authority: 'STAFF',
    permissions: ['accounting.view', 'accounting.edit', 'accounting.reports'],
    departments: ['ACCOUNTING'],
    allowedProvinces: ['นครสวรรค์'],
    allowedBranches: ['NSN001'],
    isActive: true
  },
  salesStaff: {
    uid: 'sales-001',
    authority: 'STAFF',
    permissions: ['sales.view', 'sales.edit', 'sales.reports'],
    departments: ['SALES'],
    allowedProvinces: ['นครสวรรค์'],
    allowedBranches: ['NSN001'],
    isActive: true
  }
};

/**
 * Permission testing grid
 */
const PermissionTestGrid = () => {
  const { hasPermission, userRBAC } = usePermissions();

  const permissions = [
    'admin.system',
    'admin.users',
    'province.manage',
    'branch.manage',
    'accounting.view',
    'accounting.edit',
    'accounting.approve',
    'sales.view',
    'sales.edit',
    'sales.approve',
    'service.view',
    'service.edit',
    'inventory.view',
    'reports.province',
    'reports.branch'
  ];

  const columns = [
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Access',
      dataIndex: 'hasAccess',
      key: 'hasAccess',
      render: (hasAccess) => hasAccess ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>Granted</Tag>
      ) : (
        <Tag color="red" icon={<CloseCircleOutlined />}>Denied</Tag>
      )
    }
  ];

  const data = permissions.map(permission => ({
    key: permission,
    permission,
    hasAccess: hasPermission(permission)
  }));

  return (
    <Card title="Permission Test Grid" size="small">
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        size="small"
      />
    </Card>
  );
};

/**
 * Department access demo
 */
const DepartmentAccessDemo = () => (
  <Card title="Department-Based Access Control" size="small">
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <AccountingGate action="view">
          <Alert 
            message="Accounting Department" 
            description="You have accounting view access"
            type="success"
            showIcon
          />
        </AccountingGate>
        <AccountingGate 
          action="view" 
          fallback={
            <Alert 
              message="Accounting Department" 
              description="You don't have accounting access"
              type="error"
              showIcon
            />
          }
        />
      </Col>

      <Col span={12}>
        <SalesGate action="view">
          <Alert 
            message="Sales Department" 
            description="You have sales view access"
            type="success"
            showIcon
          />
        </SalesGate>
        <SalesGate 
          action="view" 
          fallback={
            <Alert 
              message="Sales Department" 
              description="You don't have sales access"
              type="error"
              showIcon
            />
          }
        />
      </Col>

      <Col span={12}>
        <ServiceGate action="view">
          <Alert 
            message="Service Department" 
            description="You have service view access"
            type="success"
            showIcon
          />
        </ServiceGate>
        <ServiceGate 
          action="view" 
          fallback={
            <Alert 
              message="Service Department" 
              description="You don't have service access"
              type="error"
              showIcon
            />
          }
        />
      </Col>

      <Col span={12}>
        <AdminGate action="system">
          <Alert 
            message="Admin System" 
            description="You have admin system access"
            type="success"
            showIcon
          />
        </AdminGate>
        <AdminGate 
          action="system" 
          fallback={
            <Alert 
              message="Admin System" 
              description="You don't have admin access"
              type="error"
              showIcon
            />
          }
        />
      </Col>
    </Row>
  </Card>
);

/**
 * Authority level demo
 */
const AuthorityLevelDemo = () => {
  const { hasAuthorityLevel, userRBAC } = usePermissions();

  const authorityLevels = ['ADMIN', 'MANAGER', 'LEAD', 'STAFF'];

  return (
    <Card title="Authority Level Access" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {authorityLevels.map(level => (
          <div key={level}>
            <PermissionGate authority={level}>
              <Alert 
                message={`${level} Authority`}
                description={`You have ${level} level authority`}
                type="success"
                showIcon
              />
            </PermissionGate>
            <PermissionGate 
              authority={level}
              fallback={
                <Alert 
                  message={`${level} Authority`}
                  description={`You don't have ${level} level authority`}
                  type="error"
                  showIcon
                />
              }
            />
          </div>
        ))}
      </Space>
    </Card>
  );
};

/**
 * User info display
 */
const UserInfoDisplay = () => {
  const { userRBAC, primaryDepartment, accessibleProvinces, accessibleBranches } = usePermissions();

  if (!userRBAC) {
    return (
      <Alert message="No user data available" type="warning" />
    );
  }

  return (
    <Card title="Current User RBAC Information" size="small">
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Authority">
          <Tag color="blue">{userRBAC.authority}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Primary Department">
          <Tag color="green">{primaryDepartment || 'None'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="All Departments">
          <Space>
            {userRBAC.departments.map(dept => (
              <Tag key={dept} color="orange">{dept}</Tag>
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Permissions">
          <Space wrap>
            {userRBAC.permissions.slice(0, 5).map(perm => (
              <Tag key={perm} color="purple">{perm}</Tag>
            ))}
            {userRBAC.permissions.length > 5 && (
              <Tag>+{userRBAC.permissions.length - 5} more</Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Accessible Provinces">
          <Space wrap>
            {accessibleProvinces.map(province => (
              <Tag key={province} color="cyan">{province}</Tag>
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Accessible Branches">
          <Space wrap>
            {accessibleBranches.slice(0, 3).map(branch => (
              <Tag key={branch} color="lime">{branch}</Tag>
            ))}
            {accessibleBranches.length > 3 && (
              <Tag>+{accessibleBranches.length - 3} more</Tag>
            )}
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

/**
 * Form with geographic enhancement demo
 */
const GeographicFormDemo = () => {
  const { enhanceDataForSubmission } = usePermissions();
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const enhancedData = enhanceDataForSubmission(values);
    console.log('Enhanced form data:', enhancedData);
    alert(`Form submitted with enhanced data: ${JSON.stringify(enhancedData, null, 2)}`);
  };

  return (
    <Card title="Geographic Enhancement Demo" size="small">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input placeholder="Enter description" />
        </Form.Item>
        
        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <Input type="number" placeholder="Enter amount" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit with Auto Geographic Enhancement
          </Button>
        </Form.Item>
      </Form>
      
      <Alert
        message="Geographic Auto-Injection"
        description="When you submit this form, provinceId and branchCode will be automatically injected based on your current geographic context."
        type="info"
        showIcon
      />
    </Card>
  );
};

/**
 * Role preset demo
 */
const RolePresetDemo = () => {
  const [selectedRole, setSelectedRole] = useState('ACCOUNTING_STAFF');

  return (
    <Card title="Role Presets Demo" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ width: '100%' }}
        >
          {Object.keys(ROLE_PRESETS).map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>

        {selectedRole && ROLE_PRESETS[selectedRole] && (
          <Descriptions title="Role Configuration" column={1} size="small">
            <Descriptions.Item label="Authority">
              {ROLE_PRESETS[selectedRole].authority}
            </Descriptions.Item>
            <Descriptions.Item label="Departments">
              {ROLE_PRESETS[selectedRole].departments?.join(', ') || 'None'}
            </Descriptions.Item>
            <Descriptions.Item label="Permissions">
              <Space wrap>
                {ROLE_PRESETS[selectedRole].permissions.map(perm => (
                  <Tag key={perm} color="blue">{perm}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Geographic Scope">
              {ROLE_PRESETS[selectedRole].geographic.scope}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Space>
    </Card>
  );
};

/**
 * Main demo component
 */
const CleanSlateRBACDemo = () => {
  return (
    <LayoutWithRBAC
      title="Clean Slate RBAC System Demo"
      subtitle="4×3×6 Orthogonal Permission System Demonstration"
      permission="admin.view"
      showGeographicSelector={true}
      breadcrumbItems={[
        { title: 'Home', href: '/' },
        { title: 'Examples', href: '/examples' },
        { title: 'Clean Slate RBAC Demo' }
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Introduction */}
        <Card>
          <Title level={3}>
            <ExperimentOutlined /> Clean Slate RBAC System
          </Title>
          <Paragraph>
            This demo showcases the new clean slate RBAC system with 4×3×6 orthogonal permissions:
          </Paragraph>
          <ul>
            <li><strong>4 Authority Levels:</strong> admin, province, branch, department</li>
            <li><strong>3 Geographic Scopes:</strong> multi-province, province, branch</li>
            <li><strong>6 Departments:</strong> accounting, sales, service, inventory, hr, admin</li>
          </ul>
          <Paragraph>
            Permissions follow the format: <Text code>department.action</Text> (e.g., <Text code>accounting.view</Text>, <Text code>sales.edit</Text>)
          </Paragraph>
        </Card>

        {/* User Info */}
        <UserInfoDisplay />

        {/* Main demos in grid */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <PermissionTestGrid />
          </Col>
          <Col span={12}>
            <DepartmentAccessDemo />
          </Col>
          <Col span={12}>
            <AuthorityLevelDemo />
          </Col>
          <Col span={12}>
            <GeographicFormDemo />
          </Col>
          <Col span={24}>
            <RolePresetDemo />
          </Col>
        </Row>

        {/* Usage examples */}
        <Card title="Implementation Examples">
          <Title level={4}>Basic Permission Gate Usage</Title>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`// Single permission check
<PermissionGate permission="accounting.view">
  <AccountingContent />
</PermissionGate>

// Multiple permission options (any of)
<PermissionGate anyOf={["sales.edit", "sales.approve"]}>
  <SalesForm />
</PermissionGate>

// Authority level check
<PermissionGate authority="admin">
  <AdminPanel />
</PermissionGate>

// Department access check
<PermissionGate department="accounting">
  <AccountingReports />
</PermissionGate>`}
          </pre>

          <Title level={4}>Layout with RBAC Integration</Title>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<LayoutWithRBAC
  title="Income Daily"
  permission="accounting.view"
  editPermission="accounting.edit"
  requireBranchSelection={false}
  autoInjectProvinceId={true}
>
  <IncomeDailyForm />
</LayoutWithRBAC>`}
          </pre>
        </Card>
      </Space>
    </LayoutWithRBAC>
  );
};

export default CleanSlateRBACDemo; 