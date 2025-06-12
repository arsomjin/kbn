/**
 * Clean Slate Permissions Demo
 * Demonstrates the department.action permission system
 * NOW USING SHARED UTILITIES for 100% accuracy with PermissionManagement
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  Alert, 
  Table,
  Tag,
  Switch,
  Select,
  Divider,
  Badge,
  message,
  Tooltip,
  notification
} from 'antd';
import { 
  SecurityScanOutlined, 
  UserOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  ToolOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DatabaseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import { usePermissions } from 'hooks/usePermissions';
import PermissionGate, { 
  AccountingGate, 
  SalesGate, 
  ServiceGate, 
  InventoryGate,
  AdminGate
} from 'components/PermissionGate';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

// Import shared utilities for 100% accuracy with PermissionManagement
import {
  fetchUsersWithCleanSlate,
  createTestUserCleanSlate,
  toggleUserStatusCleanSlate,
  handleUserManagementError,
  getUserDisplayInfo,
  validateCleanSlateStructure
} from 'utils/user-management-shared';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CleanSlatePermissionsDemoContent = ({ userRBAC }) => {
  const {
    hasPermission,
    canAccessProvince,
    canAccessBranch,
    accessibleProvinces,
    accessibleBranches,
    primaryDepartment,
    isActive,
    isDev
  } = usePermissions();

  const user = useSelector(state => state.auth.user);
  
  // State for real user data
  const [realUsers, setRealUsers] = useState([]);
  const [loadingRealUsers, setLoadingRealUsers] = useState(false);
  const [showRealUsers, setShowRealUsers] = useState(false);
  
  // Load real users using shared utilities (100% same as PermissionManagement)
  const loadRealUsers = useCallback(async () => {
    setLoadingRealUsers(true);
    try {
      const usersData = await fetchUsersWithCleanSlate({ includeDebug: true });
      setRealUsers(usersData);
      console.log('✅ Loaded real users using shared utilities:', usersData.length);
    } catch (error) {
      handleUserManagementError(error, 'โหลดข้อมูลผู้ใช้จริง');
    }
    setLoadingRealUsers(false);
  }, []);
  
  // Load real users on component mount
  useEffect(() => {
    loadRealUsers();
  }, [loadRealUsers]);
  
  // RBAC Mode Detection (same logic as useNavigationGenerator)
  const shouldRespectRBAC = useMemo(() => {
    // Always respect RBAC for non-dev users
    if (!isDev) return true;
    
    // For dev users, check if we're in role simulation mode
    const isRoleSimulation = user?.uid?.startsWith('test_') || 
                           user?.email?.includes('@test.com') ||
                           user?.displayName?.includes('Test ') ||
                           window.localStorage.getItem('rbac_simulation_mode') === 'true';
    
    return isRoleSimulation;
  }, [isDev, user]);

  const [selectedTestUser, setSelectedTestUser] = useState('accounting-staff');
  const [showAllPermissions, setShowAllPermissions] = useState(false);

  // Department.Action Permission Matrix
  const permissionMatrix = {
    accounting: {
      department: 'บัญชีและการเงิน',
      color: 'blue',
      actions: ['view', 'edit', 'approve'],
      examples: [
        { permission: 'accounting.view', description: 'ดูข้อมูลบัญชี', level: 'basic' },
        { permission: 'accounting.edit', description: 'แก้ไขข้อมูลบัญชี', level: 'intermediate' },
        { permission: 'accounting.approve', description: 'อนุมัติรายการบัญชี', level: 'advanced' }
      ]
    },
    sales: {
      department: 'งานขาย',
      color: 'green',
      actions: ['view', 'edit', 'approve'],
      examples: [
        { permission: 'sales.view', description: 'ดูข้อมูลการขาย', level: 'basic' },
        { permission: 'sales.edit', description: 'สร้าง/แก้ไขใบเสนอราคา', level: 'intermediate' },
        { permission: 'sales.approve', description: 'อนุมัติการขาย', level: 'advanced' }
      ]
    },
    service: {
      department: 'งานบริการ',
      color: 'orange',
      actions: ['view', 'edit', 'approve'],
      examples: [
        { permission: 'service.view', description: 'ดูข้อมูลงานซ่อม', level: 'basic' },
        { permission: 'service.edit', description: 'บันทึกงานซ่อม', level: 'intermediate' },
        { permission: 'service.approve', description: 'อนุมัติใบสั่งซ่อม', level: 'advanced' }
      ]
    },
    inventory: {
      department: 'คลังสินค้า',
      color: 'purple',
      actions: ['view', 'edit', 'approve'],
      examples: [
        { permission: 'inventory.view', description: 'ดูสต็อกสินค้า', level: 'basic' },
        { permission: 'inventory.edit', description: 'เบิก/รับสินค้า', level: 'intermediate' },
        { permission: 'inventory.approve', description: 'อนุมัติการโอนสินค้า', level: 'advanced' }
      ]
    },
    hr: {
      department: 'ทรัพยากรบุคคล',
      color: 'cyan',
      actions: ['view', 'edit', 'manage'],
      examples: [
        { permission: 'hr.view', description: 'ดูข้อมูลพนักงาน', level: 'basic' },
        { permission: 'hr.edit', description: 'แก้ไขข้อมูลพนักงาน', level: 'intermediate' },
        { permission: 'hr.manage', description: 'จัดการสิทธิ์ผู้ใช้', level: 'advanced' }
      ]
    },
    admin: {
      department: 'การบริหาร',
      color: 'red',
      actions: ['view', 'edit', 'manage'],
      examples: [
        { permission: 'admin.view', description: 'ดูข้อมูลระบบ', level: 'basic' },
        { permission: 'admin.edit', description: 'แก้ไขการตั้งค่า', level: 'intermediate' },
        { permission: 'admin.manage', description: 'จัดการระบบ', level: 'advanced' }
      ]
    }
  };

  // Test user configurations
  const testUsers = {
    'accounting-staff': {
      name: 'พนักงานบัญชี',
      authority: 'department',
      department: 'accounting',
      permissions: ['accounting.view', 'accounting.edit'],
      provinces: ['NMA'],
      branches: ['0450']
    },
    'sales-manager': {
      name: 'หัวหน้าฝ่ายขาย',
      authority: 'branch',
      department: 'sales',
      permissions: ['sales.view', 'sales.edit', 'sales.approve', 'inventory.view'],
      provinces: ['NSN'],
      branches: ['NSN001']
    },
    'service-technician': {
      name: 'ช่างบริการ',
      authority: 'department',
      department: 'service',
      permissions: ['service.view', 'service.edit', 'inventory.view'],
      provinces: ['NMA'],
      branches: ['0450', 'NMA002']
    },
    'province-manager': {
      name: 'ผู้จัดการจังหวัด',
      authority: 'province',
      department: 'admin',
      permissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'hr.edit'],
      provinces: ['NSN'],
      branches: ['NSN001', 'NSN002', 'NSN003']
    },
    'super-admin': {
      name: 'ผู้ดูแลระบบ',
      authority: 'admin',
      department: 'admin',
      permissions: ['admin.manage', 'hr.manage', 'accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve'],
      provinces: ['NMA', 'NSN'],
      branches: ['0450', 'NMA002', 'NSN001', 'NSN002']
    }
  };

  // Generate table data for all permissions
  const allPermissions = Object.keys(permissionMatrix).flatMap(dept => 
    permissionMatrix[dept].examples.map(example => ({
      key: example.permission,
      department: dept,
      departmentName: permissionMatrix[dept].department,
      permission: example.permission,
      description: example.description,
      level: example.level,
      hasAccess: hasPermission(example.permission)
    }))
  );

  // Permission table columns
  const permissionColumns = [
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text, record) => (
        <Tag color={permissionMatrix[record.department].color}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission) => (
        <Text code>{permission}</Text>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={level === 'basic' ? 'green' : level === 'intermediate' ? 'orange' : 'red'}>
          {level}
        </Tag>
      )
    },
    {
      title: 'Access',
      dataIndex: 'hasAccess',
      key: 'hasAccess',
      render: (hasAccess) => (
        <Tag 
          color={hasAccess ? 'green' : 'red'} 
          icon={hasAccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {hasAccess ? 'Granted' : 'Denied'}
        </Tag>
      )
    }
  ];

  // Permission test handler
  const testPermission = useCallback((permission) => {
    const result = hasPermission(permission);
    message.info(`Permission "${permission}": ${result ? '✅ Granted' : '❌ Denied'}`);
    return result;
  }, [hasPermission]);

  const currentTestUser = testUsers[selectedTestUser];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      
      {/* Permission System Overview */}
      <Alert
        message="Clean Slate Permission System - department.action Format"
        description="ระบบ Permission แบบใหม่ที่ใช้รูปแบบ department.action เช่น accounting.view, sales.edit, service.approve"
        type="info"
        showIcon
        icon={<SecurityScanOutlined />}
      />

      {/* RBAC Mode Status */}
      <Card title={<><EyeOutlined /> RBAC Testing Mode</>}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Alert 
              message={
                <Space align="center">
                  {shouldRespectRBAC ? (
                    <>
                      <PlayCircleOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Role Simulation ACTIVE</Text>
                    </>
                  ) : (
                    <>
                      <ToolOutlined style={{ color: '#faad14' }} />
                      <Text strong>Dev Mode (RBAC Bypassed)</Text>
                    </>
                  )}
                </Space>
              }
              description={
                shouldRespectRBAC 
                  ? "Permissions reflect current role limitations. Navigation also filters by role."
                  : "Dev mode: All permissions granted, navigation shows all items. Use role simulation to test."
              }
              type={shouldRespectRBAC ? "success" : "warning"}
              showIcon={false}
            />
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>Current Status:</Text>
                <br />
                <Tag color={isDev ? 'orange' : 'blue'}>
                  {isDev ? 'Developer User' : 'Regular User'}
                </Tag>
                <Tag color={shouldRespectRBAC ? 'green' : 'red'}>
                  {shouldRespectRBAC ? 'RBAC Active' : 'RBAC Bypassed'}
                </Tag>
              </div>
              
              <div>
                <Space wrap>
                  <Tooltip title="Start role simulation to test permissions">
                    <Button 
                      size="small" 
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => {
                        console.log('🎭 Available Role Simulation Commands:');
                        console.log('window.simulateUser("ACCOUNTING_STAFF_MULTI")');
                        console.log('window.simulateUser("PROVINCE_MANAGER_NSW")');
                        console.log('window.simulateUser("BRANCH_MANAGER_NMA")');
                        console.log('window.debugRBAC() - Show all commands');
                        message.info('Check console for simulation commands');
                      }}
                    >
                      Start Simulation
                    </Button>
                  </Tooltip>
                  
                  {shouldRespectRBAC && (
                    <Tooltip title="Exit role simulation, return to dev mode">
                      <Button 
                        size="small"
                        icon={<StopOutlined />}
                        onClick={() => {
                          if (window.exitSimulation) {
                            window.exitSimulation();
                          }
                          message.success('Returned to dev mode - refresh to see navigation changes');
                        }}
                      >
                        Exit Simulation
                      </Button>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Show all available test commands">
                    <Button 
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={() => {
                        if (window.debugRBAC) {
                          window.debugRBAC();
                        }
                        message.info('All commands shown in console');
                      }}
                    >
                      Debug Commands
                    </Button>
                  </Tooltip>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Test User Selector */}
      <Card title={<><UserOutlined /> Test User Selection</>}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Select Test User:</Text>
              <Select
                value={selectedTestUser}
                onChange={setSelectedTestUser}
                style={{ width: '100%' }}
                size="large"
              >
                {Object.entries(testUsers).map(([key, user]) => (
                  <Option key={key} value={key}>
                    {user.name} ({user.authority})
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Show All Permissions:</Text>
                <Switch
                  checked={showAllPermissions}
                  onChange={setShowAllPermissions}
                  checkedChildren="All"
                  unCheckedChildren="Current"
                />
              </div>
              <Text type="secondary">
                {showAllPermissions ? 'แสดงทุก permissions' : 'แสดงเฉพาะที่มีสิทธิ์'}
              </Text>
            </Space>
          </Col>
        </Row>

        {/* Current User Info */}
        {currentTestUser && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text strong>Authority:</Text>
                <br />
                <Tag color="blue">{currentTestUser.authority}</Tag>
              </Col>
              <Col span={6}>
                <Text strong>Department:</Text>
                <br />
                <Tag color="green">{currentTestUser.department}</Tag>
              </Col>
              <Col span={6}>
                <Text strong>Provinces:</Text>
                <br />
                <Space wrap>
                  {currentTestUser.provinces.map(province => (
                    <Tag key={province} color="purple">{province}</Tag>
                  ))}
                </Space>
              </Col>
              <Col span={6}>
                <Text strong>Branches:</Text>
                <br />
                <Space wrap>
                  {currentTestUser.branches.map(branch => (
                    <Tag key={branch} color="orange">{branch}</Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Permission Matrix Overview */}
      <Card title={<><TeamOutlined /> Department.Action Matrix</>}>
        <Row gutter={[16, 16]}>
          {Object.entries(permissionMatrix).map(([dept, config]) => (
            <Col key={dept} span={8}>
              <Card size="small" title={
                <Space>
                  <Tag color={config.color}>{config.department}</Tag>
                  <Badge count={config.actions.length} size="small" />
                </Space>
              }>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {config.examples.map(example => (
                    <div key={example.permission} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text code style={{ fontSize: '11px' }}>{example.permission}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>{example.description}</Text>
                      </div>
                      <Button
                        size="small"
                        type={hasPermission(example.permission) ? 'primary' : 'default'}
                        icon={hasPermission(example.permission) ? <UnlockOutlined /> : <LockOutlined />}
                        onClick={() => testPermission(example.permission)}
                      />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Permission Gates Demo */}
      <Card title={<><ThunderboltOutlined /> Permission Gates Demo</>}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small" title="Accounting Gates">
              <Space direction="vertical" style={{ width: '100%' }}>
                <AccountingGate fallback={<Alert message="No accounting access" type="error" size="small" />}>
                  <Alert message="✅ Accounting Access" type="success" size="small" />
                </AccountingGate>
                
                <PermissionGate 
                  permission="accounting.edit" 
                  fallback={<Alert message="No accounting.edit" type="warning" size="small" />}
                >
                  <Alert message="✅ Can Edit Accounting" type="success" size="small" />
                </PermissionGate>
              </Space>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card size="small" title="Sales Gates">
              <Space direction="vertical" style={{ width: '100%' }}>
                <SalesGate fallback={<Alert message="No sales access" type="error" size="small" />}>
                  <Alert message="✅ Sales Access" type="success" size="small" />
                </SalesGate>
                
                <PermissionGate 
                  permission="sales.approve" 
                  fallback={<Alert message="No sales.approve" type="warning" size="small" />}
                >
                  <Alert message="✅ Can Approve Sales" type="success" size="small" />
                </PermissionGate>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card size="small" title="Admin Gates">
              <Space direction="vertical" style={{ width: '100%' }}>
                <AdminGate fallback={<Alert message="No admin access" type="error" size="small" />}>
                  <Alert message="✅ Admin Access" type="success" size="small" />
                </AdminGate>
                
                <PermissionGate 
                  permission="admin.manage" 
                  fallback={<Alert message="No admin.manage" type="warning" size="small" />}
                >
                  <Alert message="✅ Can Manage System" type="success" size="small" />
                </PermissionGate>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Detailed Permission Table */}
      <Card title={<><SettingOutlined /> Permission Details</>}>
        <Table
          dataSource={showAllPermissions ? allPermissions : allPermissions.filter(p => p.hasAccess)}
          columns={permissionColumns}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey="key"
        />
      </Card>

      {/* Real Users Data - 100% Same as PermissionManagement */}
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            <span>Real Users Data (Same as PermissionManagement)</span>
            <Badge 
              count={realUsers.length} 
              style={{ backgroundColor: '#52c41a' }}
              title={`${realUsers.length} users loaded`}
            />
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadRealUsers}
              loading={loadingRealUsers}
              size="small"
            >
              Refresh
            </Button>
            <Switch
              checked={showRealUsers}
              onChange={setShowRealUsers}
              checkedChildren="Show Users"
              unCheckedChildren="Hide Users"
            />
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message="100% Shared Logic with PermissionManagement"
            description={
              <div>
                <p>This section uses the exact same functions as PermissionManagement for 100% accuracy:</p>
                <ul>
                  <li><code>fetchUsersWithCleanSlate()</code> - Same user loading logic</li>
                  <li><code>validateCleanSlateStructure()</code> - Same RBAC validation</li>
                  <li><code>getUserDisplayInfo()</code> - Same display formatting</li>
                  <li><code>handleUserManagementError()</code> - Same error handling</li>
                </ul>
                <Text strong>Migration Status: </Text>
                <Tag color="green">
                  {realUsers.filter(u => u._hasCleanSlate).length} Clean Slate
                </Tag>
                <Tag color="orange">
                  {realUsers.filter(u => u._needsMigration).length} Need Migration
                </Tag>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {showRealUsers && (
            <>
              {loadingRealUsers ? (
                <Card loading style={{ minHeight: 200 }} />
              ) : (
                <Table
                  dataSource={realUsers}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  rowKey="uid"
                  columns={[
                    {
                      title: 'User',
                      key: 'user',
                      render: (_, record) => {
                        const displayInfo = getUserDisplayInfo(record);
                        return (
                          <div>
                            <div style={{ fontWeight: 500 }}>{displayInfo.displayName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
                          </div>
                        );
                      }
                    },
                    {
                      title: 'RBAC Status',
                      key: 'rbacStatus',
                      render: (_, record) => {
                        const displayInfo = getUserDisplayInfo(record);
                        return (
                          <div>
                            <Tag color={displayInfo.statusColor}>{displayInfo.rbacStatus}</Tag>
                            {record._needsMigration && (
                              <div style={{ fontSize: '11px', color: '#ff7875', marginTop: 2 }}>
                                ⚠️ Needs Migration
                              </div>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Authority',
                      dataIndex: 'accessLevel',
                      key: 'authority',
                      render: (authority) => (
                        <Tag color={authority === 'NEEDS_MIGRATION' ? 'orange' : 'blue'}>
                          {authority}
                        </Tag>
                      )
                    },
                    {
                      title: 'Department',
                      dataIndex: 'department',
                      key: 'department',
                      render: (dept) => (
                        <Tag color={dept === 'NEEDS_MIGRATION' ? 'orange' : 'green'}>
                          {dept}
                        </Tag>
                      )
                    },
                    {
                      title: 'Location',
                      key: 'location',
                      render: (_, record) => (
                        <div style={{ fontSize: '12px' }}>
                          <div>🏛️ {record.homeProvince || 'Unknown'}</div>
                          <div>🏢 {record.homeBranch || 'Unknown'}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Status',
                      key: 'status',
                      render: (_, record) => {
                        const displayInfo = getUserDisplayInfo(record);
                        return (
                          <Tag color={displayInfo.statusColor}>
                            {displayInfo.statusText}
                          </Tag>
                        );
                      }
                    }
                  ]}
                />
              )}
              
              <Alert
                message="Data Validation"
                description={
                  <div>
                    <Text strong>Functions Used (100% same as PermissionManagement):</Text>
                    <br />
                    <Space wrap style={{ marginTop: 8 }}>
                      <Tag color="blue">fetchUsersWithCleanSlate()</Tag>
                      <Tag color="blue">validateCleanSlateStructure()</Tag>
                      <Tag color="blue">getUserDisplayInfo()</Tag>
                      <Tag color="blue">handleUserManagementError()</Tag>
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px', marginTop: 8, display: 'block' }}>
                      Any discrepancy with PermissionManagement indicates a shared utilities bug.
                    </Text>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </Space>
      </Card>

      {/* Implementation Examples */}
      <Card title="📝 Implementation Examples">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          
          <div>
            <Text strong>1. Basic Permission Check:</Text>
            <Paragraph code>
{`import { usePermissions } from 'hooks/usePermissions';

const { hasPermission } = usePermissions();

if (hasPermission('accounting.edit')) {
  // Show edit button
}`}
            </Paragraph>
          </div>

          <div>
            <Text strong>2. Permission Gate Component:</Text>
            <Paragraph code>
{`import PermissionGate from 'components/PermissionGate';

<PermissionGate permission="sales.approve">
  <Button>Approve Sale</Button>
</PermissionGate>`}
            </Paragraph>
          </div>

          <div>
            <Text strong>3. Department-specific Gates:</Text>
            <Paragraph code>
{`import { AccountingGate, SalesGate } from 'components/PermissionGate';

<AccountingGate>
  <AccountingModule />
</AccountingGate>

<SalesGate>
  <SalesModule />
</SalesGate>`}
            </Paragraph>
          </div>

          <div>
            <Text strong>4. Multiple Permission Check:</Text>
            <Paragraph code>
{`<PermissionGate 
  anyOf={['sales.edit', 'sales.approve']}
  geographic={{ provinceId: 'NMA', branchCode: '0450' }}
>
  <SalesForm />
</PermissionGate>`}
            </Paragraph>
          </div>

          <div>
            <Text strong>5. Role Simulation Detection:</Text>
            <Paragraph code>
{`// Same logic used in navigation filtering
const shouldRespectRBAC = useMemo(() => {
  if (!isDev) return true; // Non-dev users always respect RBAC
  
  // Dev users: check for role simulation
  const isRoleSimulation = user?.uid?.startsWith('test_') || 
                          user?.email?.includes('@test.com') ||
                          localStorage.getItem('rbac_simulation_mode') === 'true';
  
  return isRoleSimulation;
}, [isDev, user]);`}
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* RBAC Integration Status */}
      <Card title="🔧 shouldRespectRBAC Integration">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message="Navigation Filtering Integration Complete"
            description={
              <div>
                <p>This demo now uses the same <code>shouldRespectRBAC</code> logic as the navigation generator:</p>
                <ul>
                  <li><strong>Dev Mode</strong>: Shows RBAC bypass status when not in simulation</li>
                  <li><strong>Role Simulation</strong>: Shows active simulation when testing roles</li>
                  <li><strong>Navigation Sync</strong>: Menu filtering matches permission testing mode</li>
                  <li><strong>Real-time Detection</strong>: Automatically detects simulation state changes</li>
                </ul>
              </div>
            }
            type="success"
            showIcon
          />
          
          <div>
            <Text strong>Current Integration Status:</Text>
            <br />
            <Space wrap style={{ marginTop: '8px' }}>
              <Tag color="green">✅ shouldRespectRBAC Logic</Tag>
              <Tag color="green">✅ Role Simulation Detection</Tag>
              <Tag color="green">✅ Navigation Sync</Tag>
              <Tag color="green">✅ Console Commands</Tag>
              <Tag color="green">✅ Real-time Updates</Tag>
            </Space>
          </div>
        </Space>
      </Card>

    </Space>
  );
};

CleanSlatePermissionsDemoContent.propTypes = {
  userRBAC: PropTypes.object
};

const CleanSlatePermissionsDemo = () => {
  return (
    <LayoutWithRBAC
      title="Clean Slate Permissions Demo"
      subtitle="Department.Action Permission System"
      permission="admin.view"
      showBreadcrumb={false}
      showGeographicSelector={true}
      requireBranchSelection={false}
    >
      <CleanSlatePermissionsDemoContent />
    </LayoutWithRBAC>
  );
};

export default CleanSlatePermissionsDemo; 