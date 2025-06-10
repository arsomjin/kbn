import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, Button, Alert, Tabs, Select, Space, Tag, Descriptions, Switch, Typography, message } from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  BankOutlined, 
  TeamOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { useGeographicData } from 'hooks/useGeographicData';
import { useNavigationGenerator } from 'hooks/useNavigationGenerator';
import  GeographicBranchSelector  from 'components/GeographicBranchSelector';
import ProvinceSelector from 'components/ProvinceSelector';
import BranchSelector from 'components/BranchSelector';
import { RBACDemo } from 'components';
import { FirebaseContext } from '../../../firebase';

import { setUserPermissions, setUserRole, setGeographicAccess } from 'redux/actions/rbac';
import { USER_UPDATE } from 'redux/actions/auth';
import { ROLE_PERMISSIONS } from 'data/permissions';

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const TestAccessControl = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);
  const { app } = useContext(FirebaseContext);
  
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Quick Test Controls State
  const [quickTestRole, setQuickTestRole] = useState('BRANCH_STAFF');
  const [quickTestProvince, setQuickTestProvince] = useState('nakhon-sawan');
  const [quickTestBranch, setQuickTestBranch] = useState('NSN001');
  const [quickTestDepartment, setQuickTestDepartment] = useState('sales');
  const [autoApplyChanges, setAutoApplyChanges] = useState(true);
  
  const { 
    getAccessibleProvinces, 
    getAccessibleBranches,
    userAccessLevel,
    userProvinces,
    userBranches,
    hasPermission,
    userRole
  } = usePermissions();
  
  const { 
    userScope,
    accessibleProvinces,
    accessibleBranches,
    checkProvinceAccess,
    checkBranchAccess
  } = useGeographicData();

  const { navigation = [] } = useNavigationGenerator();

  // Test configurations for different user types
  const testConfigurations = {
    roles: [
      { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'red', description: 'Full system access' },
      { key: 'EXECUTIVE', label: 'Executive', color: 'purple', description: 'All provinces, executive reports' },
      { key: 'PROVINCE_MANAGER', label: 'Province Manager', color: 'blue', description: 'Single province, all branches' },
      { key: 'BRANCH_MANAGER', label: 'Branch Manager', color: 'green', description: 'Single branch, management access' },
      { key: 'ACCOUNTING_STAFF', label: 'Accounting Staff', color: 'orange', description: 'Accounting operations' },
      { key: 'SALES_STAFF', label: 'Sales Staff', color: 'cyan', description: 'Sales operations' },
      { key: 'SERVICE_STAFF', label: 'Service Staff', color: 'lime', description: 'Service operations' },
      { key: 'INVENTORY_STAFF', label: 'Inventory Staff', color: 'gold', description: 'Inventory operations' }
    ],
    provinces: [
      { key: 'nakhon-ratchasima', label: 'Nakhon Ratchasima', code: 'NMA', branches: ['0450', 'NMA002', 'NMA003'] },
      { key: 'nakhon-sawan', label: 'Nakhon Sawan', code: 'NSN', branches: ['NSN001', 'NSN002', 'NSN003'] }
    ],
    departments: [
      { key: 'accounting', label: 'Accounting', color: 'blue', permissions: ['accounting.view', 'accounting.edit', 'accounting.approve'] },
      { key: 'sales', label: 'Sales', color: 'green', permissions: ['sales.view', 'sales.edit', 'sales.approve'] },
      { key: 'service', label: 'Service', color: 'orange', permissions: ['service.view', 'service.edit', 'service.approve'] },
      { key: 'inventory', label: 'Inventory', color: 'purple', permissions: ['inventory.view', 'inventory.edit', 'inventory.approve'] },
      { key: 'admin', label: 'Administration', color: 'red', permissions: ['admin.view', 'admin.edit', 'admin.approve'] },
      { key: 'reports', label: 'Reports', color: 'cyan', permissions: ['reports.view', 'reports.edit', 'reports.approve'] }
    ]
  };

  // Predefined test scenarios
  const testScenarios = [
    {
      name: 'Super Admin - Full Access',
      role: 'SUPER_ADMIN',
      province: 'nakhon-ratchasima',
      branch: '0450',
      department: 'admin',
      description: 'Test complete system access'
    },
    {
      name: 'Province Manager - NSN',
      role: 'PROVINCE_MANAGER',
      province: 'nakhon-sawan',
      branch: 'NSN001',
      department: 'admin',
      description: 'Test province-level management'
    },
    {
      name: 'Branch Manager - NSN001',
      role: 'BRANCH_MANAGER',
      province: 'nakhon-sawan',
      branch: 'NSN001',
      department: 'sales',
      description: 'Test branch-level management'
    },
    {
      name: 'Sales Staff - NSN002',
      role: 'SALES_STAFF',
      province: 'nakhon-sawan',
      branch: 'NSN002',
      department: 'sales',
      description: 'Test sales operations'
    },
    {
      name: 'Accounting Staff - NMA',
      role: 'ACCOUNTING_STAFF',
      province: 'nakhon-ratchasima',
      branch: '0450',
      department: 'accounting',
      description: 'Test accounting operations'
    },
    {
      name: 'Service Staff - NSN003',
      role: 'SERVICE_STAFF',
      province: 'nakhon-sawan',
      branch: 'NSN003',
      department: 'service',
      description: 'Test service operations'
    }
  ];

  // Add granular role tests to the existing test scenarios
  const granularRoleTests = [
    {
      title: 'Cross-Department Staff Roles',
      roles: [
        {
          name: 'ACCOUNTING_STAFF_SALES_VIEWER',
          description: 'พนักงานบัญชีที่ดูข้อมูลการขายได้',
          expectedPermissions: ['accounting.view', 'accounting.edit', 'sales.view', 'reports.view'],
          expectedAccess: ['บัญชีและการเงิน', 'งานขาย', 'รายงาน'],
          businessCase: 'พนักงานบัญชีต้องดูข้อมูลการขายเพื่อตรวจสอบรายได้'
        },
        {
          name: 'SALES_STAFF_INVENTORY_VIEWER',
          description: 'พนักงานขายที่ดูข้อมูลคลังสินค้าได้',
          expectedPermissions: ['sales.view', 'sales.edit', 'inventory.view', 'reports.view'],
          expectedAccess: ['งานขาย', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'พนักงานขายต้องดูสต็อกสินค้าเพื่อแนะนำลูกค้า'
        },
        {
          name: 'SERVICE_STAFF_PARTS_MANAGER',
          description: 'ช่างบริการที่จัดการอะไหล่ได้',
          expectedPermissions: ['service.view', 'service.edit', 'inventory.view', 'inventory.edit', 'reports.view'],
          expectedAccess: ['งานบริการ', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'ช่างต้องเบิกและจัดการอะไหล่สำหรับงานซ่อม'
        }
      ]
    },
    {
      title: 'Management Hierarchy',
      roles: [
        {
          name: 'PROVINCE_MANAGER',
          description: 'ผู้จัดการจังหวัด',
          expectedPermissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.manage', 'admin.view'],
          expectedAccess: ['บัญชีและการเงิน', 'งานขาย', 'งานบริการ', 'คลังสินค้า', 'รายงาน', 'จัดการระบบ'],
          businessCase: 'ผู้จัดการจังหวัดต้องควบคุมงานทุกแผนกในจังหวัด'
        },
        {
          name: 'BRANCH_MANAGER',
          description: 'ผู้จัดการสาขา',
          expectedPermissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.edit'],
          expectedAccess: ['บัญชีและการเงิน', 'งานขาย', 'งานบริการ', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'ผู้จัดการสาขาต้องควบคุมงานทุกแผนกในสาขา'
        }
      ]
    },
    {
      title: 'Specialist Roles',
      roles: [
        {
          name: 'FINANCE_ANALYST',
          description: 'นักวิเคราะห์การเงิน',
          expectedPermissions: ['accounting.approve', 'credit.approve', 'reports.edit'],
          expectedAccess: ['บัญชีและการเงิน', 'สินเชื่อ', 'รายงาน'],
          businessCase: 'นักวิเคราะห์ต้องอนุมัติและวิเคราะห์ข้อมูลทางการเงิน'
        },
        {
          name: 'OPERATIONS_COORDINATOR',
          description: 'ผู้ประสานงานปฏิบัติการ',
          expectedPermissions: ['inventory.approve', 'service.edit', 'sales.view'],
          expectedAccess: ['คลังสินค้า', 'งานบริการ', 'งานขาย', 'รายงาน'],
          businessCase: 'ผู้ประสานงานต้องควบคุมการไหลของสินค้าและงานบริการ'
        }
      ]
    }
  ];

  // Auto-apply changes when controls change
  useEffect(() => {
    if (autoApplyChanges && user?.uid) {
      console.log('🔄 Auto-applying role change:', {
        role: quickTestRole,
        province: quickTestProvince, 
        branch: quickTestBranch,
        department: quickTestDepartment
      });
      applyQuickTestConfiguration();
    }
  }, [quickTestRole, quickTestProvince, quickTestBranch, quickTestDepartment, autoApplyChanges]);

  // Force refresh navigation
  const forceRefreshNavigation = () => {
    console.log('🔄 Force refreshing navigation...');
    // Trigger a window event that navigation components can listen to
    window.dispatchEvent(new CustomEvent('forceNavigationRefresh', {
      detail: { 
        userRole: quickTestRole,
        timestamp: Date.now()
      }
    }));
    message.info('Navigation refresh triggered!');
  };

  // Apply quick test configuration
  const applyQuickTestConfiguration = async () => {
    if (!user?.uid) return;

    console.log('📝 Applying role configuration:', {
      role: quickTestRole,
      user: user?.email,
      uid: user?.uid
    });

    const roleConfig = getRoleConfiguration(quickTestRole, quickTestProvince, quickTestBranch, quickTestDepartment);
    
    if (roleConfig) {
      // Extract permissions and geographic data from config
      const { permissions, ...geographic } = roleConfig;
      
      console.log('💾 Updating Firestore with:', {
        accessLevel: quickTestRole,
        ...geographic
      });
      
      // Update Firestore with new role and context
      await app.firestore().collection('users').doc(user.uid).update({
        'auth.accessLevel': quickTestRole,
        'auth.allowedProvinces': geographic.allowedProvinces,
        'auth.allowedBranches': geographic.allowedBranches, 
        'auth.homeProvince': geographic.homeProvince,
        'auth.homeBranch': geographic.homeBranch,
        'auth.lastQuickTest': Date.now()
      });

      console.log('✅ Firestore update completed');
      
      // Let the real-time listeners (useSelfListener) handle Redux updates automatically
      // No need to manually dispatch to Redux since useSelfListener will detect the Firestore changes
      
      // Force a navigation refresh after a short delay
      setTimeout(() => {
        forceRefreshNavigation();
      }, 1000);
      
      message.success(`✅ Quick test: switched to ${quickTestRole} role`);
    }
  };

  // Get role configuration based on selections
  const getRoleConfiguration = (role, province, branch, department) => {
    const baseConfigs = {
      SUPER_ADMIN: {
        accessLevel: 'all',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN || [],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null
      },
      EXECUTIVE: {
        accessLevel: 'all',
        permissions: ROLE_PERMISSIONS.EXECUTIVE || [],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null
      },
      PROVINCE_MANAGER: {
        accessLevel: 'province',
        permissions: ROLE_PERMISSIONS.PROVINCE_MANAGER || [],
        allowedProvinces: [province],
        allowedBranches: testConfigurations.provinces.find(p => p.key === province)?.branches || [],
        homeProvince: province,
        homeBranch: null
      },
      BRANCH_MANAGER: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.BRANCH_MANAGER || [],
        allowedProvinces: [province],
        allowedBranches: [branch],
        homeProvince: province,
        homeBranch: branch
      },
      ACCOUNTING_STAFF: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.ACCOUNTING_STAFF || [],
        allowedProvinces: [province],
        allowedBranches: [branch],
        homeProvince: province,
        homeBranch: branch
      },
      SALES_STAFF: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.SALES_STAFF || [],
        allowedProvinces: [province],
        allowedBranches: [branch],
        homeProvince: province,
        homeBranch: branch
      },
      SERVICE_STAFF: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.SERVICE_STAFF || [],
        allowedProvinces: [province],
        allowedBranches: [branch],
        homeProvince: province,
        homeBranch: branch
      },
      INVENTORY_STAFF: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.INVENTORY_STAFF || [],
        allowedProvinces: [province],
        allowedBranches: [branch],
        homeProvince: province,
        homeBranch: branch
      }
    };
    
    return baseConfigs[role];
  };

  // Apply predefined test scenario
  const applyTestScenario = (scenario) => {
    setQuickTestRole(scenario.role);
    setQuickTestProvince(scenario.province);
    setQuickTestBranch(scenario.branch);
    setQuickTestDepartment(scenario.department);
    
    if (!autoApplyChanges) {
      // Manually apply if auto-apply is off
      setTimeout(() => applyQuickTestConfiguration(), 100);
    }
    
    console.log(`🎯 Applied test scenario: ${scenario.name}`);
  };

  // Get available branches for selected province
  const getAvailableBranches = (provinceKey) => {
    const provinceConfig = testConfigurations.provinces.find(p => p.key === provinceKey);
    return provinceConfig?.branches || [];
  };

  // Reset to default user
  const resetToDefault = () => {
    setQuickTestRole('BRANCH_STAFF');
    setQuickTestProvince('nakhon-sawan');
    setQuickTestBranch('NSN001');
    setQuickTestDepartment('sales');
    console.log('🔄 Reset to default test configuration');
  };

  // Switch to a specific role for testing granular roles
  const switchToRole = (roleName) => {
    setQuickTestRole(roleName);
    if (autoApplyChanges) {
      applyQuickTestConfiguration();
    }
    message.info(`สลับไปใช้บทบาท: ${roleName}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>🧪 KBN Multi-Province Test Dashboard</h2>
      </div>

      <Tabs defaultActiveKey="quick-test" size="large">
        <TabPane tab={<span><ThunderboltOutlined /> Quick Test Controls</span>} key="quick-test">
          <Row gutter={[16, 16]}>
            {/* Current Test Configuration */}
            <Col span={24}>
              <Card title={<span><SettingOutlined /> Current Test Configuration</span>}>
                <Row gutter={16}>
                  <Col span={18}>
                    <Descriptions column={4} size="small" bordered>
                      <Descriptions.Item label="Role">
                        <Tag color={testConfigurations.roles.find(r => r.key === quickTestRole)?.color}>
                          {testConfigurations.roles.find(r => r.key === quickTestRole)?.label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Province">
                        <Tag color="blue">
                          {testConfigurations.provinces.find(p => p.key === quickTestProvince)?.label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Branch">
                        <Tag color="green">{quickTestBranch}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Department">
                        <Tag color={testConfigurations.departments.find(d => d.key === quickTestDepartment)?.color}>
                          {testConfigurations.departments.find(d => d.key === quickTestDepartment)?.label}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Auto-apply changes:</span>
                        <Switch 
                          checked={autoApplyChanges} 
                          onChange={setAutoApplyChanges}
                          size="small"
                        />
                      </div>
                      <Button 
                        type="primary" 
                        icon={<ThunderboltOutlined />}
                        onClick={applyQuickTestConfiguration}
                        disabled={autoApplyChanges}
                        size="small"
                        block
                      >
                        Apply Now
                      </Button>
                      <Button 
                        icon={<ReloadOutlined />}
                        onClick={resetToDefault}
                        size="small"
                        block
                      >
                        Reset
                      </Button>
                      <Button 
                        type="dashed"
                        icon={<ReloadOutlined />}
                        onClick={forceRefreshNavigation}
                        size="small"
                        block
                        style={{ marginTop: '4px' }}
                      >
                        Force Refresh Menu
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Quick Controls */}
            <Col span={24}>
              <Card title={<span><UserOutlined /> Quick User Controls</span>}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <div>
                      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                        <UserOutlined /> Role:
                      </label>
                      <Select
                        value={quickTestRole}
                        onChange={setQuickTestRole}
                        style={{ width: '100%' }}
                        placeholder="Select Role"
                      >
                        {testConfigurations.roles.map(role => (
                          <Option key={role.key} value={role.key}>
                            <Space>
                              <Tag color={role.color} size="small">{role.label}</Tag>
                              <small style={{ color: '#666' }}>{role.description}</small>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  
                  <Col span={6}>
                    <div>
                      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                        <GlobalOutlined /> Province:
                      </label>
                      <Select
                        value={quickTestProvince}
                        onChange={(value) => {
                          setQuickTestProvince(value);
                          // Auto-select first branch of new province
                          const availableBranches = getAvailableBranches(value);
                          if (availableBranches.length > 0) {
                            setQuickTestBranch(availableBranches[0]);
                          }
                        }}
                        style={{ width: '100%' }}
                        placeholder="Select Province"
                      >
                        {testConfigurations.provinces.map(province => (
                          <Option key={province.key} value={province.key}>
                            <Space>
                              <Tag color="blue" size="small">{province.code}</Tag>
                              {province.label}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  
                  <Col span={6}>
                    <div>
                      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                        <BankOutlined /> Branch:
                      </label>
                      <Select
                        value={quickTestBranch}
                        onChange={setQuickTestBranch}
                        style={{ width: '100%' }}
                        placeholder="Select Branch"
                      >
                        {getAvailableBranches(quickTestProvince).map(branch => (
                          <Option key={branch} value={branch}>
                            <Tag color="green" size="small">{branch}</Tag>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  
                  <Col span={6}>
                    <div>
                      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                        <TeamOutlined /> Department:
                      </label>
                      <Select
                        value={quickTestDepartment}
                        onChange={setQuickTestDepartment}
                        style={{ width: '100%' }}
                        placeholder="Select Department"
                      >
                        {testConfigurations.departments.map(dept => (
                          <Option key={dept.key} value={dept.key}>
                            <Space>
                              <Tag color={dept.color} size="small">{dept.label}</Tag>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Predefined Test Scenarios */}
            <Col span={24}>
              <Card title={<span>🎯 Predefined Test Scenarios</span>}>
                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary">
                    Click any scenario to quickly switch to that user configuration:
                  </Text>
                </div>
                <Row gutter={[8, 8]}>
                  {testScenarios.map((scenario, index) => (
                    <Col key={index} span={8}>
                      <Card 
                        size="small" 
                        hoverable
                        onClick={() => applyTestScenario(scenario)}
                        style={{ cursor: 'pointer', height: '100%' }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <Tag color={testConfigurations.roles.find(r => r.key === scenario.role)?.color}>
                            {scenario.name}
                          </Tag>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <div><strong>Role:</strong> {testConfigurations.roles.find(r => r.key === scenario.role)?.label}</div>
                          <div><strong>Location:</strong> {scenario.branch}</div>
                          <div><strong>Dept:</strong> {testConfigurations.departments.find(d => d.key === scenario.department)?.label}</div>
                          <div style={{ marginTop: '4px', fontStyle: 'italic' }}>{scenario.description}</div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            {/* Current Permissions Status */}
            <Col span={24}>
              <Card title={<span>🔐 Current Permissions Status</span>}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Department Permissions:</Text>
                      <div style={{ marginTop: '8px' }}>
                        {testConfigurations.departments.map(dept => (
                          <div key={dept.key} style={{ marginBottom: '4px' }}>
                            <Tag color={dept.color} size="small">{dept.label}:</Tag>
                            {dept.permissions.map(permission => (
                              <Tag 
                                key={permission}
                                color={hasPermission(permission) ? 'green' : 'red'}
                                size="small"
                                style={{ marginLeft: '4px' }}
                              >
                                {permission.split('.')[1]} {hasPermission(permission) ? '✓' : '✗'}
                              </Tag>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Geographic Access:</Text>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <Text>Accessible Provinces ({accessibleProvinces.length}):</Text>
                          <div>
                            {testConfigurations.provinces.map(province => (
                              <Tag 
                                key={province.key}
                                color={checkProvinceAccess(province.key) ? 'blue' : 'default'}
                                style={{ margin: '2px' }}
                              >
                                {province.label} {checkProvinceAccess(province.key) ? '✓' : '✗'}
                              </Tag>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Text>Accessible Branches ({accessibleBranches.length}):</Text>
                          <div>
                            {testConfigurations.provinces.flatMap(province => 
                              province.branches.map(branch => (
                                <Tag 
                                  key={branch}
                                  color={checkBranchAccess(branch) ? 'green' : 'default'}
                                  size="small"
                                  style={{ margin: '2px' }}
                                >
                                  {branch} {checkBranchAccess(branch) ? '✓' : '✗'}
                                </Tag>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* User Information Display */}
            <Col span={24}>
              <Card title={<span>👤 Current User Information</span>}>
                <Descriptions column={3} size="small" bordered>
                  <Descriptions.Item label="Display Name">{user?.displayName || 'Test User'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user?.email || 'test@kbn.co.th'}</Descriptions.Item>
                  <Descriptions.Item label="Access Level">{user?.accessLevel || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Home Province">{user?.homeProvince || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Home Branch">{user?.homeBranch || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Is Executive">{user?.isExecutive ? 'Yes' : 'No'}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span>🎭 RBAC Demo & Role Switcher</span>} key="rbac-demo">
          <RBACDemo />
        </TabPane>
        
        <TabPane tab={<span>🎛️ Component Testing</span>} key="component-testing">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="🎛️ Component Testing">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <h4>GeographicBranchSelector Component:</h4>
                    <GeographicBranchSelector
                      onProvinceChange={setSelectedProvince}
                      onBranchChange={setSelectedBranch}
                      province={selectedProvince}
                      value={selectedBranch}
                      hasAllProvinces={true}
                      hasAllBranches={true}
                    />
                  </Col>

                  <Col span={12}>
                    <h4>Province Selector:</h4>
                    <ProvinceSelector
                      value={selectedProvince}
                      onChange={setSelectedProvince}
                      hasAll={true}
                      placeholder="เลือกจังหวัด"
                    />
                  </Col>

                  <Col span={12}>
                    <h4>Branch Selector:</h4>
                    <BranchSelector
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                      provinceFilter={selectedProvince}
                      hasAll={true}
                      placeholder="เลือกสาขา"
                    />
                  </Col>
                </Row>

                {selectedProvince && (
                  <Alert
                    type="info"
                    message={`Selected Province: ${selectedProvince}`}
                    description={`Can access: ${checkProvinceAccess(selectedProvince) ? 'Yes' : 'No'}`}
                    style={{ marginTop: 16 }}
                  />
                )}

                {selectedBranch && (
                  <Alert
                    type="info"
                    message={`Selected Branch: ${selectedBranch}`}
                    description={`Can access: ${checkBranchAccess(selectedBranch) ? 'Yes' : 'No'}`}
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            </Col>

            {/* User Information */}
            <Col span={24}>
              <Card title="👤 Current User Information">
                <Row gutter={16}>
                  <Col span={12}>
                    <h4>Basic Info:</h4>
                    <ul>
                      <li>Display Name: {user?.displayName || 'N/A'}</li>
                      <li>Email: {user?.email || 'N/A'}</li>
                      <li>Access Level: {user?.accessLevel || 'N/A'}</li>
                    </ul>
                  </Col>
                  <Col span={12}>
                    <h4>Geographic Access:</h4>
                    <ul>
                      <li>Allowed Provinces: {user?.allowedProvinces?.join(', ') || 'All'}</li>
                      <li>Allowed Branches: {user?.allowedBranches?.join(', ') || 'All'}</li>
                      <li>Home Province: {user?.homeProvince || 'N/A'}</li>
                      <li>Home Branch: {user?.homeBranch || 'N/A'}</li>
                    </ul>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Accessible Data Summary */}
            <Col span={24}>
              <Card title="📊 Accessible Data Summary">
                <Row gutter={16}>
                  <Col span={12}>
                    <h4>Accessible Provinces ({Object.keys(accessibleProvinces).length}):</h4>
                    <ul>
                      {Object.entries(accessibleProvinces).map(([key, province]) => (
                        <li key={key}>
                          <code>{key}</code>: {province.name}
                        </li>
                      ))}
                    </ul>
                  </Col>
                  <Col span={12}>
                    <h4>Accessible Branches ({Object.keys(accessibleBranches).length}):</h4>
                    <ul>
                      {Object.entries(accessibleBranches).slice(0, 10).map(([code, branch]) => (
                        <li key={code}>
                          <code>{code}</code>: {branch.branchName}
                        </li>
                      ))}
                      {Object.keys(accessibleBranches).length > 10 && (
                        <li><em>... and {Object.keys(accessibleBranches).length - 10} more</em></li>
                      )}
                    </ul>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Add this section to the render method, before the existing permission tests */}
        <Card title="🚀 Granular Role Testing" style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            ทดสอบระบบบทบาทแบบละเอียด (Granular Roles) ที่รองรับงานข้ามแผนกและลำดับชั้นการจัดการใหม่
          </Text>
          
          {granularRoleTests.map((category, categoryIndex) => (
            <Card 
              key={categoryIndex}
              type="inner" 
              title={category.title} 
              style={{ marginBottom: 16 }}
              size="small"
            >
              {category.roles.map((roleTest, roleIndex) => (
                <Card 
                  key={roleIndex}
                  size="small" 
                  style={{ marginBottom: 12 }}
                  title={
                    <Space>
                      <Tag color="blue">{roleTest.name}</Tag>
                      <Text strong>{roleTest.description}</Text>
                    </Space>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Text type="secondary" style={{ fontStyle: 'italic' }}>
                        📋 กรณีใช้งาน: {roleTest.businessCase}
                      </Text>
                    </Col>
                    
                    <Col span={8}>
                      <Text strong>สิทธิ์ที่คาดหวัง:</Text>
                      <div style={{ marginTop: 4 }}>
                        {roleTest.expectedPermissions.map(permission => (
                          <Tag 
                            key={permission}
                            color={hasPermission(permission) ? 'green' : 'red'}
                            style={{ marginBottom: 4 }}
                          >
                            {permission} {hasPermission(permission) ? '✓' : '✗'}
                          </Tag>
                        ))}
                      </div>
                    </Col>
                    
                    <Col span={8}>
                      <Text strong>เมนูที่เข้าถึงได้:</Text>
                      <div style={{ marginTop: 4 }}>
                                                 {roleTest.expectedAccess.map(menuItem => {
                           const hasAccess = navigation && navigation.length > 0 ? navigation.some(section => 
                             section.title === menuItem || 
                             (section.items && section.items.some(item => item.title === menuItem))
                           ) : false;
                           return (
                             <Tag 
                               key={menuItem}
                               color={hasAccess ? 'green' : 'red'}
                               style={{ marginBottom: 4 }}
                             >
                               {menuItem} {hasAccess ? '✓' : '✗'}
                             </Tag>
                           );
                         })}
                      </div>
                    </Col>
                    
                    <Col span={8}>
                      <Space direction="vertical" size="small">
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => switchToRole(roleTest.name)}
                          disabled={userRole === roleTest.name}
                        >
                          {userRole === roleTest.name ? 'กำลังใช้บทบาทนี้' : 'สลับบทบาท'}
                        </Button>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          คลิกเพื่อทดสอบบทบาทนี้
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>
          ))}
        </Card>
      </Tabs>
    </div>
  );
};

export default TestAccessControl; 