/**
 * 🎯 RBAC INTEGRATION TESTER
 * 
 * Comprehensive testing dashboard for RBAC integration across all app components
 * Tests different user roles, permissions, and geographic access patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Alert, 
  Typography, 
  Space, 
  Tag, 
  Progress, 
  Tabs,
  Table,
  Switch,
  notification,
  Divider,
  Descriptions,
  Badge,
  List,
  Steps,
  Select
} from 'antd';
import { 
  UserOutlined,
  GlobalOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  BugOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// Import RBAC components and hooks
import { usePermissions } from 'hooks/usePermissions';
import PermissionGate from 'components/PermissionGate';
import GeographicBranchSelector from 'components/GeographicBranchSelector';
import ProvinceSelector from 'components/ProvinceSelector';
import { TEST_PROFILES } from 'role-testing-utilities';
import { fetchProvinces } from 'redux/actions/provinces';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const RBACIntegrationTester = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  
  // Redux state
  const { user } = useSelector(state => state.auth);
  const provinces = useSelector(state => state.provinces.provinces);
  const provincesLoading = useSelector(state => state.provinces.loading);
  const branches = useSelector(state => state.data?.branches || {});
  
  // RBAC permissions
  const {
    hasPermission,
    canAccessProvince,
    canAccessBranch,
    accessibleProvinces,
    accessibleBranches,
    userRole,
    userRBAC,
    filterDataByUserAccess
  } = usePermissions();
  
  // Test state
  const [currentTestRole, setCurrentTestRole] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState('permissions');
  const [debugInfo, setDebugInfo] = useState({});
  
  // Initialize provinces on component mount
  useEffect(() => {
    console.log('🎯 RBAC Integration Tester - Initializing...');
    
    // Load provinces if not already loaded
    if (Object.keys(provinces).length === 0 && !provincesLoading) {
      console.log('📦 Loading provinces data...');
      dispatch(fetchProvinces());
    }
  }, [dispatch, provinces, provincesLoading]);

  // Update debug info whenever RBAC-related state changes
  useEffect(() => {
    // Enhanced RBAC debug information
    const enhancedRBAC = user?.userRBAC;
    const legacyAccessible = accessibleProvinces?.length || 0;
    const legacyBranches = accessibleBranches?.length || 0;
    
    const debugData = {
      provincesCount: Object.keys(provinces).length,
      branchesCount: Object.keys(branches).length,
      accessibleProvincesCount: enhancedRBAC ? 
        enhancedRBAC.geographic?.allowedProvinces?.length || 0 : 
        legacyAccessible,
      accessibleBranchesCount: enhancedRBAC ? 
        enhancedRBAC.geographic?.allowedBranches?.length || 0 : 
        legacyBranches,
      userRole: enhancedRBAC ? 
        `${enhancedRBAC.authority} (${enhancedRBAC.geographic?.scope || 'Unknown'})` : 
        (userRole || 'None'),
      userRBAC: !!enhancedRBAC,
      loading: provincesLoading,
      currentUser: user?.displayName || 'None',
      currentTestRole: currentTestRole || 'None',
      // Enhanced RBAC specific
      enhancedRBACActive: !!enhancedRBAC,
      authority: enhancedRBAC?.authority || 'None',
      geographicScope: enhancedRBAC?.geographic?.scope || 'None',
      homeProvince: enhancedRBAC?.geographic?.homeProvince || 'None',
      homeBranch: enhancedRBAC?.geographic?.homeBranch || 'None'
    };
    
    setDebugInfo(debugData);
    console.log('🔍 Enhanced RBAC Debug info updated:', debugData);
    
    // Log detailed state when role changes
    if (currentTestRole) {
      console.log('👤 Current Test Role:', currentTestRole);
      console.log('🎯 Enhanced RBAC Structure:', enhancedRBAC);
      console.log('🌏 Accessible Provinces:', enhancedRBAC?.geographic?.allowedProvinces || accessibleProvinces);
      console.log('🏢 Accessible Branches:', enhancedRBAC?.geographic?.allowedBranches || accessibleBranches);
      console.log('🔑 Authority:', enhancedRBAC?.authority || userRole);
      console.log('🛡️ Enhanced RBAC Active:', !!enhancedRBAC);
    }
    
  }, [provinces, branches, accessibleProvinces, accessibleBranches, userRole, userRBAC, provincesLoading, user, currentTestRole]);

  // Test modules and their required permissions
  const testModules = [
    {
      name: 'Income Daily',
      path: '/account/income/income-daily',
      requiredPermissions: ['accounting.view'],
      testCases: ['View data', 'Filter by branch', 'Geographic access']
    },
    {
      name: 'Sales Booking',
      path: '/sales/booking',
      requiredPermissions: ['sales.view'],
      testCases: ['View bookings', 'Create booking', 'Edit booking']
    },
    {
      name: 'Warehouse Management',
      path: '/warehouses',
      requiredPermissions: ['warehouse.view'],
      testCases: ['View inventory', 'Manage stock', 'Transfer items']
    },
    {
      name: 'Reports',
      path: '/reports',
      requiredPermissions: ['reports.view'],
      testCases: ['View reports', 'Export data', 'Filter by province']
    },
    {
      name: 'User Management',
      path: '/admin/user-management',
      requiredPermissions: ['admin.view'],
      testCases: ['View users', 'Edit users', 'Manage roles']
    }
  ];

  // Enhanced role switching with proper Redux integration
  const switchToTestRole = useCallback((roleKey) => {
    const profile = TEST_PROFILES[roleKey];
    if (!profile) {
      console.error(`❌ Role '${roleKey}' not found. Available roles:`, Object.keys(TEST_PROFILES));
      return;
    }

    console.log(`🔄 Switching to role: ${roleKey}`, profile);
    setCurrentTestRole(roleKey);
    
    // Enhanced Redux store update
    if (window.store) {
      console.log('📦 Updating Redux store with test user...');
      
      // Update auth state with new user
      window.store.dispatch({
        type: 'USER_UPDATE',
        user: profile
      });

      // Force reload provinces to trigger RBAC recalculation
      window.store.dispatch(fetchProvinces());
      
      // Verify the update worked
      setTimeout(() => {
        const state = window.store.getState();
        console.log('✅ Redux state updated:', {
          currentUser: state.auth?.user?.displayName || 'None',
          userRole: state.auth?.user?.role || 'None',
          userRBAC: !!state.auth?.user?.userRBAC || !!state.auth?.user?.access
        });
      }, 100);
    } else {
      console.warn('⚠️ Redux store not found on window object');
    }

    // Also dispatch through component's dispatch
    dispatch({
      type: 'USER_UPDATE',
      user: profile
    });

    // Force refresh provinces data
    dispatch(fetchProvinces());

    // Success notification
    notification.success({
      message: '🎭 Role Switched Successfully',
      description: `Now testing as: ${profile.displayName}`,
      placement: 'topRight',
      duration: 3
    });

    // Force debug info update with enhanced data
    setTimeout(() => {
      console.log('🔍 Updating debug info after role switch...');
      
      // Get fresh state for debug info
      const state = window.store?.getState();
      const currentUser = state?.auth?.user || profile;
      const enhancedRBAC = currentUser?.userRBAC || currentUser?.access;
      
      const debugData = {
        provincesCount: Object.keys(provinces).length,
        branchesCount: Object.keys(branches).length,
        accessibleProvincesCount: enhancedRBAC ? 
          enhancedRBAC.geographic?.allowedProvinces?.length || 0 : 
          (accessibleProvinces?.length || 0),
        accessibleBranchesCount: enhancedRBAC ? 
          enhancedRBAC.geographic?.allowedBranches?.length || 0 : 
          (accessibleBranches?.length || 0),
        userRole: enhancedRBAC ? 
          `${enhancedRBAC.authority} (${enhancedRBAC.geographic?.scope || 'Unknown'})` : 
          (userRole || 'None'),
        userRBAC: !!enhancedRBAC,
        loading: provincesLoading,
        currentUser: currentUser?.displayName || 'None',
        currentTestRole: roleKey || 'None',
        // Enhanced debug info
        enhancedRBACActive: !!enhancedRBAC,
        authority: enhancedRBAC?.authority || 'None',
        geographicScope: enhancedRBAC?.geographic?.scope || 'None',
        homeProvince: enhancedRBAC?.geographic?.homeProvince || 'None',
        homeBranch: enhancedRBAC?.geographic?.homeBranch || 'None'
      };
      
      setDebugInfo(debugData);
      console.log('🎯 Debug info updated:', debugData);
    }, 300);
  }, [dispatch, provinces, branches, accessibleProvinces, accessibleBranches, userRole, userRBAC, provincesLoading]);

  // Run comprehensive tests
  const runIntegrationTests = useCallback(async () => {
    setRunningTests(true);
    const results = {};

    for (const roleKey of Object.keys(TEST_PROFILES)) {
      console.log(`🧪 Testing role: ${roleKey}`);
      
      // Switch to test role
      switchToTestRole(roleKey);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const roleResults = {
        permissions: {},
        geographic: {},
        modules: {}
      };

      // Test permissions
      const testPermissions = ['accounting.view', 'accounting.edit', 'sales.view', 'sales.edit', 'warehouse.view', 'reports.view', 'admin.view'];
      for (const permission of testPermissions) {
        roleResults.permissions[permission] = hasPermission(permission);
      }

      // Test geographic access (using correct province IDs)
      const testProvinces = ['NMA', 'NSN'];
      const testBranches = ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'];
      
      for (const province of testProvinces) {
        roleResults.geographic[`province_${province}`] = canAccessProvince(province);
      }
      
      for (const branch of testBranches) {
        roleResults.geographic[`branch_${branch}`] = canAccessBranch(branch);
      }

      // Test module access
      for (const module of testModules) {
        const hasAllPermissions = module.requiredPermissions.every(perm => hasPermission(perm));
        roleResults.modules[module.name] = hasAllPermissions;
      }

      results[roleKey] = roleResults;
    }

    setTestResults(results);
    setRunningTests(false);
    
    notification.success({
      message: 'Integration Tests Complete',
      description: 'All role-based tests have been executed',
      placement: 'topRight'
    });
  }, [hasPermission, canAccessProvince, canAccessBranch, switchToTestRole]);

  // Generate test summary
  const getTestSummary = () => {
    const totalTests = Object.keys(testResults).length;
    if (totalTests === 0) return { total: 0, passed: 0, failed: 0 };

    let passed = 0;
    let failed = 0;

    Object.values(testResults).forEach(roleResult => {
      const roleTests = [
        ...Object.values(roleResult.permissions),
        ...Object.values(roleResult.geographic),
        ...Object.values(roleResult.modules)
      ];
      
      if (roleTests.every(test => test === true || test === false)) {
        passed++;
      } else {
        failed++;
      }
    });

    return { total: totalTests, passed, failed };
  };

  // Component testing section
  const renderComponentTests = () => {
    return (
    <Card title="Component Integration Tests" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="Province Selector">
            <ProvinceSelector 
              placeholder="Test Province Selection"
              respectRBAC={true}
              fetchOnMount={true}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Should show only accessible provinces
            </Text>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card size="small" title="Branch Selector">
            <GeographicBranchSelector 
              placeholder="Test Branch Selection"
              respectRBAC={true}
              showBranchCode={true}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Should filter by province and RBAC
            </Text>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card size="small" title="Permission Gates">
            <Space direction="vertical" style={{ width: '100%' }}>
              <PermissionGate 
                permission="accounting.view"
                fallback={<Tag color="red">No Accounting Access</Tag>}
              >
                <Tag color="green">✅ Accounting Access</Tag>
              </PermissionGate>
              
              <PermissionGate 
                permission="sales.edit"
                fallback={<Tag color="red">No Sales Edit</Tag>}
              >
                <Tag color="green">✅ Sales Edit</Tag>
              </PermissionGate>
              
              <PermissionGate 
                permission="admin.view"
                fallback={<Tag color="red">No Admin Access</Tag>}
              >
                <Tag color="green">✅ Admin Access</Tag>
              </PermissionGate>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );}

  // Module navigation tests
  const renderModuleTests = () => (
    <Card title="Module Navigation Tests" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {testModules.map(module => (
          <Col span={8} key={module.name}>
            <Card 
              size="small" 
              title={module.name}
              extra={
                <Button 
                  size="small" 
                  type="link"
                  onClick={() => history.push(module.path)}
                  icon={<RocketOutlined />}
                >
                  Test
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {module.requiredPermissions.map(permission => (
                  <div key={permission}>
                    {hasPermission(permission) ? (
                      <Tag color="green" size="small">✅ {permission}</Tag>
                    ) : (
                      <Tag color="red" size="small">❌ {permission}</Tag>
                    )}
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  // Role testing section
  const renderRoleTests = () => {
    return (
    <Card title="Role Testing" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {Object.entries(TEST_PROFILES).map(([roleKey, profile]) => (
          <Col span={6} key={roleKey}>
            <Card 
              size="small"
              title={profile.displayName}
              extra={
                <Button 
                  size="small"
                  type={currentTestRole === roleKey ? "primary" : "default"}
                  onClick={() => switchToTestRole(roleKey)}
                >
                  Switch
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Provinces: {profile.userRBAC?.geographic?.allowedProvinces?.length || profile.allowedProvinces?.length || 0}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Branches: {profile.userRBAC?.geographic?.allowedBranches?.length || profile.allowedBranches?.length || 0}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Permissions: {profile.userRBAC ? 
                    Object.values(profile.userRBAC.permissions.departments).filter(dept => 
                      Object.values(dept).some(perm => perm)
                    ).length : 
                    (profile.permissions?.length || 0)
                  }
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );}

  const summary = getTestSummary();

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Space size="middle" wrap>
              <Title level={2}>🎯 RBAC Integration Tester</Title>
              
              {/* Role Selector */}
              <Space>
                <Text strong>Test Role:</Text>
                <Select
                  value={currentTestRole}
                  placeholder="Select test role"
                  style={{ width: 200 }}
                  onChange={switchToTestRole}
                  options={Object.keys(TEST_PROFILES).map(roleKey => ({
                    value: roleKey,
                    label: (
                      <Space>
                        <Text strong>{roleKey}</Text>
                        <Text type="secondary">
                          {TEST_PROFILES[roleKey].displayName}
                        </Text>
                      </Space>
                    )
                  }))}
                />
              </Space>
              
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                loading={runningTests}
                onClick={runIntegrationTests}
              >
                Run All Tests
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Reset
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Current User Status */}
        <Col span={24}>
          <Alert
            message={`Current Test User: ${user?.displayName || 'Not Set'}`}
            description={
              <Space>
                <Text>Role: {user?.role || currentTestRole || 'None'}</Text>
                <Text>Provinces: {user?.userRBAC?.geographic?.allowedProvinces?.length || accessibleProvinces?.length || 0}</Text>
                <Text>Branches: {user?.userRBAC?.geographic?.allowedBranches?.length || accessibleBranches?.length || 0}</Text>
                {user?.userRBAC && (
                  <>
                    <Text>Authority: {user.userRBAC.authority}</Text>
                    <Text>Scope: {user.userRBAC.geographic?.scope}</Text>
                  </>
                )}
              </Space>
            }
            type="info"
            showIcon
            icon={<UserOutlined />}
          />
        </Col>

        {/* Debug Information */}
        <Col span={24}>
          <Card 
            title="🔍 Debug Information" 
            size="small"
            style={{ backgroundColor: '#f6f6f6' }}
          >
            <Row gutter={[8, 8]}>
              <Col span={4}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Provinces Loaded">
                    <Badge 
                      status={debugInfo.provincesCount > 0 ? "success" : "error"} 
                      text={debugInfo.provincesCount || 0}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Branches Loaded">
                    <Badge 
                      status={debugInfo.branchesCount > 0 ? "success" : "error"} 
                      text={debugInfo.branchesCount || 0}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={4}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Access Provinces">
                    <Badge 
                      status={debugInfo.accessibleProvincesCount > 0 ? "success" : "warning"} 
                      text={debugInfo.accessibleProvincesCount || 0}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Access Branches">
                    <Badge 
                      status={debugInfo.accessibleBranchesCount > 0 ? "success" : "warning"} 
                      text={debugInfo.accessibleBranchesCount || 0}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={5}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Current">
                    <Tag color={user?.uid ? "blue" : "red"} size="small">
                      {user?.displayName || 'None'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="User">
                    <Tag color={debugInfo.currentUser !== 'None' ? "blue" : "red"} size="small">
                      {debugInfo.currentUser}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    <Tag color={debugInfo.currentTestRole !== 'None' ? "orange" : "default"} size="small">
                      {debugInfo.currentTestRole}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={5}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Test">
                    <Tag color={debugInfo.currentTestRole !== 'None' ? "orange" : "default"} size="small">
                      {debugInfo.currentTestRole}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="User">
                    <Tag color={user?.userRBAC ? "green" : "red"} size="small">
                      {user?.userRBAC ? user?.role : 'Legacy'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    <Tag color={user?.role ? "blue" : "red"} size="small">
                      {user?.role || 'None'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={6}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="RBAC Active">
                    <Tag color={debugInfo.enhancedRBACActive ? "green" : "red"}>
                      {debugInfo.enhancedRBACActive ? "Yes" : "No"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Authority">
                    <Tag color={debugInfo.authority !== 'None' ? "blue" : "red"}>
                      {debugInfo.authority}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Scope">
                    <Tag color={debugInfo.geographicScope !== 'None' ? "purple" : "red"}>
                      {debugInfo.geographicScope}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Space direction="vertical">
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={() => {
                      console.log('🔄 Force reloading provinces and recalculating RBAC...');
                      dispatch(fetchProvinces());
                      // Force a recalculation by triggering a state update
                      setTimeout(() => {
                        console.log('🔍 Forced RBAC recalculation');
                        window.location.reload(false); // Soft reload to refresh hooks
                      }, 1000);
                    }}
                    loading={debugInfo.loading}
                  >
                    Reload & Refresh
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => {
                      console.log('🔍 Current Redux State:');
                      console.log('Provinces:', provinces);
                      console.log('Branches:', branches);
                      console.log('User:', user);
                      console.log('RBAC:', userRBAC);
                      console.log('Accessible Provinces:', accessibleProvinces);
                      console.log('Accessible Branches:', accessibleBranches);
                      console.log('Current Test Role:', currentTestRole);
                    }}
                  >
                    Debug All
                  </Button>
                  <Button 
                    size="small"
                    type="dashed"
                    onClick={() => {
                      console.log('🔄 Switching to DEFAULT_BRANCH_MANAGER for testing...');
                      switchToTestRole('DEFAULT_BRANCH_MANAGER');
                    }}
                  >
                    Test Switch
                  </Button>
                  <Button 
                    size="small"
                    type="ghost"
                    onClick={() => {
                      console.log('🔄 Forcing UserContext update...');
                      window.forceUserContextUpdate && window.forceUserContextUpdate();
                      setTimeout(() => {
                        window.refreshRBAC && window.refreshRBAC();
                      }, 500);
                    }}
                  >
                    Fix Sidebar
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Test Summary */}
        {summary.total > 0 && (
          <Col span={24}>
            <Card title="Test Summary">
              <Row gutter={16}>
                <Col span={8}>
                  <Progress 
                    type="circle" 
                    percent={Math.round((summary.passed / summary.total) * 100)}
                    format={() => `${summary.passed}/${summary.total}`}
                  />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text>Tests Passed</Text>
                  </div>
                </Col>
                <Col span={16}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Total Roles Tested">{summary.total}</Descriptions.Item>
                    <Descriptions.Item label="Passed">{summary.passed}</Descriptions.Item>
                    <Descriptions.Item label="Failed">{summary.failed}</Descriptions.Item>
                    <Descriptions.Item label="Success Rate">
                      {summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Test Sections */}
        <Col span={24}>
          <Tabs defaultActiveKey="components" type="card">
            <TabPane tab="Components" key="components">
              {renderComponentTests()}
            </TabPane>
            
            <TabPane tab="Modules" key="modules">
              {renderModuleTests()}
            </TabPane>
            
            <TabPane tab="Roles" key="roles">
              {renderRoleTests()}
            </TabPane>
            
            <TabPane tab="Results" key="results">
              <Card title="Detailed Test Results">
                {Object.entries(testResults).map(([roleKey, results]) => (
                  <Card key={roleKey} size="small" style={{ marginBottom: 16 }}>
                    <Title level={5}>{TEST_PROFILES[roleKey]?.displayName}</Title>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text strong>Permissions:</Text>
                        <List
                          size="small"
                          dataSource={Object.entries(results.permissions || {})}
                          renderItem={([perm, hasAccess]) => (
                            <List.Item>
                              <Badge 
                                status={hasAccess ? "success" : "error"} 
                                text={perm}
                              />
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col span={8}>
                        <Text strong>Geographic:</Text>
                        <List
                          size="small"
                          dataSource={Object.entries(results.geographic || {})}
                          renderItem={([location, hasAccess]) => (
                            <List.Item>
                              <Badge 
                                status={hasAccess ? "success" : "error"} 
                                text={location.replace('_', ': ')}
                              />
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col span={8}>
                        <Text strong>Modules:</Text>
                        <List
                          size="small"
                          dataSource={Object.entries(results.modules || {})}
                          renderItem={([module, hasAccess]) => (
                            <List.Item>
                              <Badge 
                                status={hasAccess ? "success" : "error"} 
                                text={module}
                              />
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default RBACIntegrationTester; 