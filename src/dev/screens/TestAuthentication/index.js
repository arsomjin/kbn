import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Typography, Space, Alert, Descriptions, Badge, Tag, Row, Col, message, Select } from 'antd';
import { 
  LoginOutlined, 
  LogoutOutlined, 
  UserOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { loginUser, logoutUser, signUpUserWithRBAC } from 'redux/actions/auth';
import { getUserStatus, USER_STATUS, getApprovalLevelName } from 'utils/authHelpers';
import EmployeeVerificationTest from './EmployeeVerificationTest';
import AdminWorkflowTest from './AdminWorkflowTest';
import { updateIsDevFlag, checkIsDevSync, forceUserRefresh } from 'utils/debugAuth';
import { usePermissions } from 'hooks/usePermissions';
import { useNavigationGenerator } from 'hooks/useNavigationGenerator';
import app from 'firebase/app';

const { Option } = Select;

const { Title, Paragraph, Text } = Typography;

const TestAuthentication = ({ productionMode = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoggingIn, loginError } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // If in production mode, only show the role switcher
  if (productionMode) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Row justify="center">
          <Col span={20}>
            <Card 
              title={
                <div style={{ textAlign: 'center' }}>
                  <CrownOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
                  <Title level={2} style={{ margin: 0, display: 'inline' }}>
                    KBN Production Role Switcher
                  </Title>
                </div>
              }
              extra={
                <Tag color={process.env.NODE_ENV === 'production' ? 'red' : 'orange'}>
                  {process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟡 DEVELOPMENT'}
                </Tag>
              }
            >
              <ProductionRoleSwitcher />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Test user accounts for different scenarios
  const testAccounts = {
    approved: {
      email: 'test.approved@kbn.co.th',
      password: 'Test123!',
      description: 'Pre-approved test user'
    },
    pending: {
      email: 'test.pending@kbn.co.th', 
      password: 'Test123!',
      description: 'Pending approval test user'
    },
    rejected: {
      email: 'test.rejected@kbn.co.th',
      password: 'Test123!', 
      description: 'Rejected test user'
    }
  };

  const addTestResult = (test, result, details) => {
    const newResult = {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const runTest = async (testName, testFunction) => {
    setCurrentTest(testName);
    try {
      const result = await testFunction();
      addTestResult(testName, 'PASS', result);
    } catch (error) {
      addTestResult(testName, 'FAIL', error.message);
    } finally {
      setCurrentTest(null);
    }
  };

  // Test Cases
  const testApprovedUserLogin = async () => {
    const { email, password } = testAccounts.approved;
    await dispatch(loginUser(email, password, false));
    if (loginError) throw new Error(loginError);
    return 'Approved user logged in successfully';
  };

  const testPendingUserLogin = async () => {
    const { email, password } = testAccounts.pending;
    await dispatch(loginUser(email, password, false));
    // For pending users, should still login but with pending status
    if (user?.isPendingApproval) {
      return 'Pending user logged in with approval status';
    }
    throw new Error('Pending user test failed');
  };

  const testUserStatusHelper = () => {
    // Test the getUserStatus helper function
    const testData = {
      auth: {
        isApproved: true,
        isActive: true,
        approvalStatus: 'approved'
      }
    };
    const status = getUserStatus(testData);
    if (status.status === USER_STATUS.APPROVED && status.canAccess) {
      return 'getUserStatus helper working correctly';
    }
    throw new Error('getUserStatus helper failed');
  };

  const testLogout = async () => {
    if (!isAuthenticated) {
      throw new Error('No user to logout');
    }
    await dispatch(logoutUser());
    return 'User logged out successfully';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [USER_STATUS.APPROVED]: { status: 'success', text: 'อนุมัติแล้ว' },
      [USER_STATUS.PENDING]: { status: 'warning', text: 'รออนุมัติ' },
      [USER_STATUS.REJECTED]: { status: 'error', text: 'ถูกปฏิเสธ' },
      [USER_STATUS.SUSPENDED]: { status: 'default', text: 'ระงับการใช้งาน' }
    };
    
    const config = statusConfig[status] || { status: 'default', text: 'ไม่ทราบสถานะ' };
    return <Badge status={config.status} text={config.text} />;
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'PASS': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FAIL': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // Add debugging section for isDev flag
  const debugUserStatus = () => {
    console.group('🔍 User Debug Information');
    console.log('User object:', user);
    console.log('User isDev:', user?.isDev);
    console.log('User auth:', user?.auth);
    console.log('User permissions:', user?.permissions);
    console.log('Redux auth state:', { user });
    console.groupEnd();
  };

  const handleUpdateIsDev = async (value) => {
    const result = await updateIsDevFlag(value);
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(`Error: ${result.error}`);
    }
  };

  const handleCheckSync = async () => {
    const syncData = await checkIsDevSync();
    setDebugInfo(syncData);
    console.log('🔍 Sync check result:', syncData);
  };

  const handleForceRefresh = async () => {
    const result = await forceUserRefresh();
    if (result.success) {
      message.success(result.message);
      console.log('🔄 User data refreshed, sidebar should update immediately');
    } else {
      message.error(`Error: ${result.error}`);
    }
  };

  const handleCheckFirestoreStructure = async () => {
    try {
      const currentUser = app.auth().currentUser;
      if (!currentUser) {
        message.error('No user signed in');
        return;
      }

      const userDoc = await app.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        console.group('🔍 Firestore Document Structure');
        console.log('Root level isDev:', userData.isDev);
        console.log('Auth level isDev:', userData.auth?.isDev);
        console.log('Full auth object:', userData.auth);
        console.log('Full document:', userData);
        console.groupEnd();
        
        message.info('Check console for Firestore structure details');
      }
    } catch (error) {
      console.error('Error checking Firestore:', error);
      message.error('Failed to check Firestore structure');
    }
  };

  const handleTestRealTimeUpdate = async () => {
    try {
      const currentUser = app.auth().currentUser;
      if (!currentUser) {
        message.error('No user signed in');
        return;
      }

      console.log('🔄 Testing real-time isDev update...');
      
      // Toggle isDev flag
      const currentIsDev = user?.isDev || false;
      const newIsDev = !currentIsDev;
      
      console.log(`📝 Updating isDev from ${currentIsDev} to ${newIsDev}`);
      
      // Update Firestore - this should trigger real-time listener
      await app.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          isDev: newIsDev,
          updatedAt: new Date().toISOString()
        });

      console.log('✅ Firestore updated, waiting for real-time listener...');
      message.info(`isDev set to ${newIsDev}. Check if sidebar updates automatically!`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      message.error(`Error: ${error.message}`);
    }
  };

  const handleTestUserManagementAccess = async () => {
    try {
      console.log('🔐 Testing Firestore access to users collection...');
      
      // Test if user can read the users collection (which user management page needs)
      const snapshot = await app.firestore().collection('users').limit(1).get();
      
      if (snapshot.docs.length >= 0) {
        message.success('✅ Access to users collection successful! Should be able to access User Management page now.');
        console.log('✅ Firestore access test passed');
      } else {
        message.warning('⚠️ No users found, but access is working');
        console.log('⚠️ Collection is empty but access works');
      }
    } catch (error) {
      console.error('❌ Firestore access test failed:', error);
      message.error(`❌ Access denied: ${error.message}`);
    }
  };

  const handleCheckCurrentFirestoreData = async () => {
    try {
      const currentUser = app.auth().currentUser;
      if (!currentUser) {
        message.error('No user signed in');
        return;
      }

      const userDoc = await app.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        
        console.group('🔍 CURRENT FIRESTORE DATA STRUCTURE');
        console.log('📁 Full Document:', userData);
        console.log('🔐 auth.accessLevel:', userData.auth?.accessLevel);
        console.log('🏛️ rbac.accessLevel:', userData.rbac?.accessLevel);
        console.log('🌍 auth geographic:', {
          homeProvince: userData.auth?.homeProvince,
          homeBranch: userData.auth?.homeBranch,
          allowedProvinces: userData.auth?.allowedProvinces,
          allowedBranches: userData.auth?.allowedBranches
        });
        console.log('🗺️ rbac geographic:', userData.rbac?.geographic);
        console.log('⚡ verifyAuth fallback logic would choose:', {
          accessLevel: userData.rbac?.accessLevel || userData.auth?.accessLevel || 'STAFF',
          homeProvince: userData.rbac?.geographic?.homeProvince || userData.auth?.homeProvince || 'นครราชสีมา',
          homeBranch: userData.rbac?.geographic?.homeBranch || userData.auth?.homeBranch || '0450'
        });
        console.log('🔄 useSelfListener logic would choose:', {
          primarySource: 'auth.*',
          accessLevel: userData.auth?.accessLevel,
          homeProvince: userData.auth?.homeProvince,
          homeBranch: userData.auth?.homeBranch
        });
        console.groupEnd();
        
        message.info('📊 Check console for detailed Firestore data structure analysis');
      }
    } catch (error) {
      console.error('Error checking Firestore:', error);
      message.error('Failed to check Firestore structure');
    }
  };

  const handleTestPostSwitchPermissions = async () => {
    try {
      console.log('🔍 Testing Firestore permissions after role switch...');
      
      const currentUser = app.auth().currentUser;
      if (!currentUser) {
        message.error('No user signed in');
        return;
      }

      // Check current user document
      const userDoc = await app.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('📋 Current user data in Firestore:', {
          accessLevel: userData.auth?.accessLevel,
          allowedProvinces: userData.auth?.allowedProvinces,
          allowedBranches: userData.auth?.allowedBranches
        });

        // Test users collection access
        try {
          const usersSnapshot = await app.firestore().collection('users').limit(1).get();
          console.log('✅ Users collection access: SUCCESS');
          message.success('✅ Firestore permissions are working correctly after role switch!');
        } catch (usersError) {
          console.error('❌ Users collection access: FAILED', usersError);
          message.error(`❌ Users collection blocked: ${usersError.message}`);
        }

      } else {
        message.error('❌ User document not found');
      }
    } catch (error) {
      console.error('❌ Permission test failed:', error);
      message.error(`❌ Permission test failed: ${error.message}`);
    }
  };

  const handleDebugPermissions = () => {
    console.group('🔍 Permission Debug Information');
    console.log('Current User Object:', user);
    console.log('User Access Level:', user?.accessLevel);
    console.log('User RBAC:', user?.rbac);
    console.log('User Permissions:', user?.permissions);
    console.log('User Role (from Redux):', user?.role);
    
    // Check specific permission
    const hasUsersManage = hasPermission('users.manage');
    console.log('Has users.manage permission:', hasUsersManage);
    
    // Check navigation config permission - using hook instead
    // Note: This should be called inside component context properly
    console.log('Navigation with permissions would be filtered by useNavigationGenerator hook');
    
    console.groupEnd();
    
    message.info('Check console for detailed permission information');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <SafetyOutlined /> Authentication Flow Testing Dashboard
      </Title>
      
      <Paragraph>
        Test the authentication flow with different user scenarios and validate RBAC integration.
      </Paragraph>

      {/* Current User Status */}
      <Card title="Current Authentication Status" style={{ marginBottom: '24px' }}>
        {isAuthenticated ? (
          <Descriptions bordered size="small">
            <Descriptions.Item label="Status" span={3}>
              <Tag color="green">Authenticated</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="User ID">{user.uid}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Name">{user.displayName}</Descriptions.Item>
            <Descriptions.Item label="Access Level">{user.accessLevel}</Descriptions.Item>
            <Descriptions.Item label="Home Province">{user.homeProvince}</Descriptions.Item>
            <Descriptions.Item label="Home Branch">{user.homeBranch}</Descriptions.Item>
            <Descriptions.Item label="Approval Status" span={3}>
              {user.isPendingApproval ? (
                <Badge status="warning" text="Pending Approval" />
              ) : (
                <Badge status="success" text="Approved" />
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Alert 
            message="Not Authenticated" 
            description="No user is currently logged in" 
            type="info" 
            showIcon 
          />
        )}
      </Card>

      {/* Test Controls */}
      <Card title="Authentication Tests" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={() => runTest('Approved User Login', testApprovedUserLogin)}
            loading={currentTest === 'Approved User Login'}
            disabled={isLoggingIn}
          >
            Test Approved User Login
          </Button>
          
          <Button 
            icon={<ClockCircleOutlined />}
            onClick={() => runTest('Pending User Login', testPendingUserLogin)}
            loading={currentTest === 'Pending User Login'}
            disabled={isLoggingIn}
          >
            Test Pending User Login
          </Button>
          
          <Button 
            icon={<UserOutlined />}
            onClick={() => runTest('Status Helper Test', testUserStatusHelper)}
            loading={currentTest === 'Status Helper Test'}
          >
            Test Status Helper
          </Button>
          
          <Button 
            icon={<LogoutOutlined />}
            onClick={() => runTest('User Logout', testLogout)}
            loading={currentTest === 'User Logout'}
            disabled={!isAuthenticated}
          >
            Test Logout
          </Button>
        </Space>

        {loginError && (
          <Alert 
            message="Login Error" 
            description={loginError} 
            type="error" 
            style={{ marginTop: '16px' }} 
            closable 
          />
        )}
      </Card>

      {/* Test Accounts Reference */}
      <Card title="Test Accounts" style={{ marginBottom: '24px' }}>
        <Descriptions bordered size="small">
          {Object.entries(testAccounts).map(([key, account]) => (
            <Descriptions.Item key={key} label={key.toUpperCase()} span={3}>
              <Text code>{account.email}</Text> | <Text code>{account.password}</Text> | {account.description}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {/* Test Results */}
      <Card title="Test Results">
        {testResults.length === 0 ? (
          <Alert message="No tests run yet" type="info" />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {testResults.map(result => (
              <Alert
                key={result.id}
                message={
                  <Space>
                    {getResultIcon(result.result)}
                    <Text strong>[{result.timestamp}] {result.test}</Text>
                  </Space>
                }
                description={result.details}
                type={result.result === 'PASS' ? 'success' : 'error'}
              />
            ))}
          </Space>
        )}
      </Card>

      {/* Employee Verification Testing */}
      <Card title="🔍 Employee Verification System" style={{ marginTop: '24px' }}>
        <EmployeeVerificationTest />
      </Card>

      {/* Admin Workflow Testing */}
      <Card title="👨‍💼 Admin Workflow System" style={{ marginTop: '24px' }}>
        <AdminWorkflowTest />
      </Card>

      {/* Testing Checklist */}
      <Card title="Testing Checklist" style={{ marginTop: '24px' }}>
        <Paragraph>
          <Title level={4}>Critical Test Areas:</Title>
          <ul>
            <li>✅ <Text strong>Login Flow</Text> - Test with approved/pending/rejected users</li>
            <li>✅ <Text strong>User Status Detection</Text> - Validate status helper functions</li>
            <li>✅ <Text strong>Employee Verification</Text> - Test employeeCode and name lookup</li>
            <li>⚠️ <Text strong>Real-time Approval Updates</Text> - Test approval status listeners</li>
            <li>⚠️ <Text strong>RBAC Permission Checks</Text> - Validate geographic/department access</li>
            <li>⚠️ <Text strong>Session Management</Text> - Test token refresh and persistence</li>
            <li>⚠️ <Text strong>Error Handling</Text> - Test network failures and edge cases</li>
            <li>⚠️ <Text strong>Legacy User Migration</Text> - Test backward compatibility</li>
          </ul>
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={3}>🐛 User Debug Information</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Current User Status:</Text>
                <br />
                <Text code>Email: {user?.email}</Text>
                <br />
                <Text code>isDev: {user?.isDev ? '✅ true' : '❌ false'}</Text>
                <br />
                <Text code>UID: {user?.uid}</Text>
                <br />
                <Text code>Group: {user?.group}</Text>
                <br />
                <Text code>Department: {user?.department}</Text>
              </div>
              
              <Button onClick={debugUserStatus} type="primary">
                🔍 Log User Data to Console
              </Button>

              <Space>
                <Button 
                  onClick={() => handleUpdateIsDev(true)} 
                  type="primary" 
                  ghost
                >
                  🔄 Set isDev = true
                </Button>
                <Button 
                  onClick={() => handleUpdateIsDev(false)} 
                  type="default"
                >
                  🔄 Set isDev = false
                </Button>
              </Space>

              <Space>
                <Button onClick={handleCheckSync} type="default">
                  🔍 Check Firebase Sync
                </Button>
                <Button onClick={handleForceRefresh} type="primary" ghost>
                  🔄 Force Refresh User Data
                </Button>
              </Space>

              <Space>
                <Button onClick={handleCheckFirestoreStructure} type="default">
                  🗂️ Check Firestore Structure
                </Button>
                <Button onClick={handleTestRealTimeUpdate} type="primary">
                  📡 Test Real-time Updates
                </Button>
                              <Button onClick={handleTestUserManagementAccess} type="primary" ghost>
                🔐 Test User Management Access
              </Button>
              
              <Button onClick={handleCheckCurrentFirestoreData} type="primary" ghost>
                📋 Check Firestore Document
              </Button>
            </Space>

            <Button onClick={handleTestPostSwitchPermissions} type="primary" danger>
              🔍 Test Post-Switch Permissions
            </Button>

              <Button onClick={handleDebugPermissions} type="primary" danger>
                🔍 Debug My Permissions
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Debug Information Card */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="🚨 Enhanced Debug - Issue Diagnosis" extra={
            <Button onClick={() => window.location.reload()} type="link">
              Refresh Page
            </Button>
          }>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              
              {/* Issue 1: Access Denied Debug */}
              <Card size="small" title="🔐 Issue 1: Access Denied Analysis">
                <DebugAccessDenied />
              </Card>

              {/* Issue 2: Province Display Debug */}
              <Card size="small" title="🌍 Issue 2: Province Display Analysis">
                <DebugProvinceDisplay />
              </Card>

              {/* RBAC State Debug */}
              <Card size="small" title="🎯 RBAC State Diagnosis">
                <DebugRBACState />
              </Card>

            </Space>
          </Card>
        </Col>
      </Row>

      {/* Production-Ready Role Switching */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="👑 Production Role Switching - Client Support Tool" 
            extra={
              <Tag color="gold">
                {process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟡 DEVELOPMENT'}
              </Tag>
            }
          >
            <ProductionRoleSwitcher />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Enhanced Debug Components
const DebugAccessDenied = () => {
  const { hasPermission, userPermissions, userRole } = usePermissions();
  const { user } = useSelector(state => state.auth);

  const testPermission = 'users.manage';
  const hasTestPermission = hasPermission(testPermission);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Descriptions size="small" bordered>
        <Descriptions.Item label="Current Role" span={3}>
          <Tag color={userRole ? 'blue' : 'red'}>{userRole || 'UNKNOWN'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Access Level" span={3}>
          <Tag color="purple">{user?.accessLevel || 'UNKNOWN'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Permission 'users.manage'" span={3}>
          <Tag color={hasTestPermission ? 'green' : 'red'}>
            {hasTestPermission ? '✅ HAS PERMISSION' : '❌ NO PERMISSION'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Total Permissions" span={3}>
          {userPermissions?.length || 0} permissions
        </Descriptions.Item>
      </Descriptions>

      <div>
        <Text strong>Expected for PROVINCE_MANAGER:</Text>
        <br />
        <Text code>✅ Should have &apos;users.manage&apos; permission</Text>
        <br />
        <Text code>✅ Should be able to access /admin/user-management</Text>
      </div>

      <Button 
        onClick={() => {
          console.group('🔐 Access Denied Debug');
          console.log('User Role:', userRole);
          console.log('User Access Level:', user?.accessLevel);
          console.log('User Permissions Array:', userPermissions);
          console.log('Has users.manage:', hasTestPermission);
          console.log('Full User Object:', user);
          console.groupEnd();
        }}
        type="primary"
        size="small"
      >
        🔍 Log Access Debug to Console
      </Button>
    </Space>
  );
};

const DebugProvinceDisplay = () => {
  const { user } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);

  const getProvinceDisplayDebug = () => {
    if (!provinces || typeof provinces !== 'object') {
      return { result: 'provinces data not loaded', provinces: provinces };
    }

    if (user?.accessLevel === 'PROVINCE_MANAGER') {
      if (user?.allowedProvinces && user.allowedProvinces.length === 1) {
        const provinceData = provinces[user.allowedProvinces[0]];
        return {
          result: provinceData?.provinceName || 'ไม่ระบุ',
          provinceId: user.allowedProvinces[0],
          provinceData: provinceData,
          source: 'allowedProvinces[0]'
        };
      }
    }
    
    // Fallback to home province
    const homeProvinceData = user?.homeProvince && provinces[user.homeProvince];
    return {
      result: homeProvinceData?.provinceName || 'ไม่ระบุ',
      provinceId: user?.homeProvince,
      provinceData: homeProvinceData,
      source: 'homeProvince fallback'
    };
  };

  const debugInfo = getProvinceDisplayDebug();

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Descriptions size="small" bordered>
        <Descriptions.Item label="Display Result" span={3}>
          <Tag color={debugInfo.result === 'ไม่ระบุ' ? 'red' : 'green'}>
            {debugInfo.result}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Data Source" span={3}>
          {debugInfo.source}
        </Descriptions.Item>
        <Descriptions.Item label="Province ID" span={3}>
          {debugInfo.provinceId || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="User Access Level" span={3}>
          {user?.accessLevel || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Allowed Provinces" span={3}>
          {user?.allowedProvinces?.join(', ') || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Home Province" span={3}>
          {user?.homeProvince || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Button 
        onClick={() => {
          console.group('🌍 Province Display Debug');
          console.log('Debug Info:', debugInfo);
          console.log('User Object:', user);
          console.log('Provinces Data:', provinces);
          console.log('Branches Data:', branches);
          console.groupEnd();
        }}
        type="primary"
        size="small"
      >
        🔍 Log Province Debug to Console
      </Button>
    </Space>
  );
};

const DebugRBACState = () => {
  const { user } = useSelector(state => state.auth);
  const rbacState = useSelector(state => state.rbac);
  const { userRole, isSuperAdmin } = usePermissions();

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Descriptions size="small" bordered>
        <Descriptions.Item label="RBAC Loaded" span={3}>
          <Tag color={rbacState ? 'green' : 'red'}>
            {rbacState ? '✅ LOADED' : '❌ NOT LOADED'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Is Super Admin" span={3}>
          <Tag color={isSuperAdmin ? 'red' : 'blue'}>
            {isSuperAdmin ? '✅ YES' : '❌ NO'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="User Role from Hook" span={3}>
          {userRole || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="User Group" span={3}>
          {user?.group || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Button 
        onClick={() => {
          console.group('🎯 RBAC State Debug');
          console.log('User Object:', user);
          console.log('RBAC State:', rbacState);
          console.log('User Role from Hook:', userRole);
          console.log('Is Super Admin:', isSuperAdmin);
          console.groupEnd();
        }}
        type="primary"
        size="small"
      >
        🔍 Log RBAC State to Console
      </Button>
    </Space>
  );
};

// Production-Ready Role Switching Component
const ProductionRoleSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userRole, userPermissions } = usePermissions();
  const [switchingRole, setSwitchingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedUserGroup, setSelectedUserGroup] = useState(null);
  const [originalRole, setOriginalRole] = useState(null);
  const [switchLog, setSwitchLog] = useState([]);

  // Store original role on mount
  useEffect(() => {
    if (userRole && !originalRole) {
      setOriginalRole({
        role: userRole,
        permissions: userPermissions,
        user: { ...user }
      });
    }
  }, [userRole, userPermissions, user, originalRole]);

  // Auto-select department and user group when role changes
  useEffect(() => {
    if (selectedRole) {
      const roleInfo = availableRoles.find(r => r.key === selectedRole);
      if (roleInfo?.defaultDepartment) {
        setSelectedDepartment(roleInfo.defaultDepartment);
      }
      
      // Auto-select default user group based on role
      const defaultGroups = {
        SUPER_ADMIN: 'group001',
        EXECUTIVE: 'group001',
        PROVINCE_MANAGER: 'group002',
        BRANCH_MANAGER: 'group003',
        ACCOUNTING_STAFF: 'group008',
        SALES_STAFF: 'group009',
        SERVICE_STAFF: 'group010',
        INVENTORY_STAFF: 'group011'
      };
      setSelectedUserGroup(defaultGroups[selectedRole] || 'group011');
    }
  }, [selectedRole]);

  // Available roles for switching
  const availableRoles = [
    { 
      key: 'SUPER_ADMIN', 
      label: 'Super Admin', 
      color: 'red', 
      description: 'Full system access - for system administration',
      requiresProvince: false,
      requiresBranch: false,
      requiresDepartment: false
    },
    { 
      key: 'EXECUTIVE', 
      label: 'Executive', 
      color: 'purple', 
      description: 'All provinces - for executive oversight',
      requiresProvince: false,
      requiresBranch: false,
      requiresDepartment: false
    },
    { 
      key: 'PROVINCE_MANAGER', 
      label: 'Province Manager', 
      color: 'blue', 
      description: 'Single province - for province management',
      requiresProvince: true,
      requiresBranch: false,
      requiresDepartment: true
    },
    { 
      key: 'BRANCH_MANAGER', 
      label: 'Branch Manager', 
      color: 'green', 
      description: 'Single branch - for branch management',
      requiresProvince: true,
      requiresBranch: true,
      requiresDepartment: true
    },
    { 
      key: 'ACCOUNTING_STAFF', 
      label: 'Accounting Staff', 
      color: 'orange', 
      description: 'Accounting operations - for accounting tasks',
      requiresProvince: true,
      requiresBranch: true,
      requiresDepartment: true,
      defaultDepartment: 'accounting'
    },
    { 
      key: 'SALES_STAFF', 
      label: 'Sales Staff', 
      color: 'cyan', 
      description: 'Sales operations - for sales tasks',
      requiresProvince: true,
      requiresBranch: true,
      requiresDepartment: true,
      defaultDepartment: 'sales'
    },
    { 
      key: 'SERVICE_STAFF', 
      label: 'Service Staff', 
      color: 'lime', 
      description: 'Service operations - for service tasks',
      requiresProvince: true,
      requiresBranch: true,
      requiresDepartment: true,
      defaultDepartment: 'service'
    },
    { 
      key: 'INVENTORY_STAFF', 
      label: 'Inventory Staff', 
      color: 'gold', 
      description: 'Inventory operations - for warehouse tasks',
      requiresProvince: true,
      requiresBranch: true,
      requiresDepartment: true,
      defaultDepartment: 'inventory'
    }
  ];

  // Available provinces and branches
  const provinces = [
    { key: 'nakhon-ratchasima', label: 'นครราชสีมา (Nakhon Ratchasima)', branches: ['0450', 'NMA002', 'NMA003'] },
    { key: 'nakhon-sawan', label: 'นครสวรรค์ (Nakhon Sawan)', branches: ['NSN001', 'NSN002', 'NSN003'] }
  ];

  // Available departments
  const departments = [
    { key: 'accounting', label: 'บัญชี (Accounting)', color: 'blue', description: 'จัดการด้านบัญชีและการเงิน' },
    { key: 'sales', label: 'ขาย (Sales)', color: 'green', description: 'จัดการด้านการขายและลูกค้า' },
    { key: 'service', label: 'บริการ (Service)', color: 'orange', description: 'จัดการด้านบริการหลังการขาย' },
    { key: 'inventory', label: 'คลังสินค้า (Inventory)', color: 'purple', description: 'จัดการสินค้าและอะไหล่' },
    { key: 'admin', label: 'บริหาร (Administration)', color: 'red', description: 'จัดการด้านบริหารและ HR' },
    { key: 'general', label: 'ทั่วไป (General)', color: 'grey', description: 'หน้าที่ทั่วไป' }
  ];

  // Available user groups
  const userGroups = [
    { key: 'group001', label: 'กลุ่ม 001 - ผู้บริหาร', description: 'ผู้บริหารระดับสูง' },
    { key: 'group002', label: 'กลุ่ม 002 - จัดการจังหวัด', description: 'ผู้จัดการจังหวัด' },
    { key: 'group003', label: 'กลุ่ม 003 - จัดการสาขา', description: 'ผู้จัดการสาขา' },
    { key: 'group008', label: 'กลุ่ม 008 - พนักงานบัญชี', description: 'พนักงานแผนกบัญชี' },
    { key: 'group009', label: 'กลุ่ม 009 - พนักงานขาย', description: 'พนักงานแผนกขาย' },
    { key: 'group010', label: 'กลุ่ม 010 - พนักงานบริการ', description: 'พนักงานแผนกบริการ' },
    { key: 'group011', label: 'กลุ่ม 011 - พนักงานคลัง', description: 'พนักงานแผนกคลังสินค้า' }
  ];

  // Get role configuration with full permissions, department, and user group
  const getRoleConfiguration = (role, province = null, branch = null, department = null, userGroup = null) => {
    const { ROLE_PERMISSIONS } = require('data/permissions');
    
    const baseConfigs = {
      SUPER_ADMIN: {
        accessLevel: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN || ['*'],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null,
        department: 'admin',
        group: userGroup || 'group001'
      },
      EXECUTIVE: {
        accessLevel: 'EXECUTIVE',
        permissions: ROLE_PERMISSIONS.EXECUTIVE || ['*'],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null,
        department: 'admin',
        group: userGroup || 'group001'
      },
      PROVINCE_MANAGER: {
        accessLevel: 'PROVINCE_MANAGER',
        permissions: ROLE_PERMISSIONS.PROVINCE_MANAGER || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: province ? provinces.find(p => p.key === province)?.branches || [] : ['0450', 'NMA002', 'NMA003'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: null,
        department: department || 'general',
        group: userGroup || 'group002'
      },
      BRANCH_MANAGER: {
        accessLevel: 'BRANCH_MANAGER',
        permissions: ROLE_PERMISSIONS.BRANCH_MANAGER || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'general',
        group: userGroup || 'group003'
      },
      ACCOUNTING_STAFF: {
        accessLevel: 'ACCOUNTING_STAFF',
        permissions: ROLE_PERMISSIONS.ACCOUNTING_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: 'accounting',
        group: userGroup || 'group008'
      },
      SALES_STAFF: {
        accessLevel: 'SALES_STAFF',
        permissions: ROLE_PERMISSIONS.SALES_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: 'sales',
        group: userGroup || 'group009'
      },
      SERVICE_STAFF: {
        accessLevel: 'SERVICE_STAFF',
        permissions: ROLE_PERMISSIONS.SERVICE_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: 'service',
        group: userGroup || 'group010'
      },
      INVENTORY_STAFF: {
        accessLevel: 'INVENTORY_STAFF',
        permissions: ROLE_PERMISSIONS.INVENTORY_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: 'inventory',
        group: userGroup || 'group011'
      }
    };
    
    return baseConfigs[role];
  };

  // Execute role switch with full permission update
  const executeRoleSwitch = async () => {
    if (!selectedRole || !user?.uid) return;

    setSwitchingRole(true);
    
    try {
      // Get role configuration with full context
      const roleConfig = getRoleConfiguration(selectedRole, selectedProvince, selectedBranch, selectedDepartment, selectedUserGroup);
      
      if (!roleConfig) {
        message.error('Invalid role configuration');
        return;
      }

      // Extract permissions and all context data
      const { permissions, ...contextData } = roleConfig;
      
      // Create updated user object with new role data
      const updatedUser = {
        ...user,
        accessLevel: selectedRole,
        ...contextData,
        // Keep original auth data but update role-specific fields
        auth: {
          ...user.auth,
          accessLevel: selectedRole,
          ...contextData
        },
        // Update Firestore with new role data
        roleChangeLog: {
          ...user.roleChangeLog,
          [Date.now()]: {
            from: userRole,
            to: selectedRole,
            timestamp: Date.now(),
            by: 'production-support-tool'
          }
        }
      };

      // Update Firestore document with complete context
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'auth.accessLevel': selectedRole,
          'auth.allowedProvinces': contextData.allowedProvinces,
          'auth.allowedBranches': contextData.allowedBranches,
          'auth.homeProvince': contextData.homeProvince,
          'auth.homeBranch': contextData.homeBranch,
          'auth.department': contextData.department,
          'auth.group': contextData.group,
          'auth.lastRoleChange': Date.now(),
          'auth.roleChangedBy': 'production-support-tool'
        });

      console.log('✅ Firestore update completed successfully');
      message.success('✅ Firestore document updated successfully');

      // Let the real-time listeners (useSelfListener) handle Redux updates automatically
      // No need to manually dispatch to Redux since useSelfListener will detect the Firestore changes
      
      // Log the switch with complete context
      const logEntry = {
        timestamp: new Date().toLocaleString(),
        from: userRole,
        to: selectedRole,
        province: selectedProvince,
        branch: selectedBranch,
        department: selectedDepartment,
        userGroup: selectedUserGroup,
        permissions: permissions.length
      };
      setSwitchLog(prev => [logEntry, ...prev.slice(0, 4)]); // Keep last 5 entries

      message.success(`✅ Successfully switched to ${selectedRole}${selectedProvince ? ` in ${selectedProvince}` : ''}${selectedBranch ? `/${selectedBranch}` : ''}${selectedDepartment ? ` (${selectedDepartment})` : ''}`);
      
      console.log('🔄 Production Role Switch (Firestore Only - Redux via real-time listener):', {
        from: userRole,
        to: selectedRole,
        context: {
          province: selectedProvince,
          branch: selectedBranch,
          department: selectedDepartment,
          userGroup: selectedUserGroup
        },
        config: roleConfig
      });

      // Automatically test permissions after switching - wait for listener to update Redux
    } catch (error) {
      console.error('❌ Role switch failed:', error);
      message.error(`Failed to switch role: ${error.message}`);
    } finally {
      setSwitchingRole(false);
    }
  };

  // Restore original role
  const restoreOriginalRole = async () => {
    if (!originalRole || !user?.uid) return;

    setSwitchingRole(true);
    
    try {
      // Restore original user state with complete context
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'auth.accessLevel': originalRole.role,
          'auth.allowedProvinces': originalRole.user.allowedProvinces || ['nakhon-ratchasima'],
          'auth.allowedBranches': originalRole.user.allowedBranches || ['0450'],
          'auth.homeProvince': originalRole.user.homeProvince || 'nakhon-ratchasima',
          'auth.homeBranch': originalRole.user.homeBranch || '0450',
          'auth.department': originalRole.user.department || originalRole.user.auth?.department || 'general',
          'auth.group': originalRole.user.group || originalRole.user.auth?.group || 'group011',
          'auth.lastRoleRestore': Date.now(),
          'auth.roleRestoredBy': 'production-support-tool'
        });

      // Let the real-time listeners (useSelfListener) handle Redux updates automatically
      // No need to manually dispatch to Redux since useSelfListener will detect the Firestore changes

      message.success(`✅ Restored to original role: ${originalRole.role}`);
      console.log('🔄 Restored to original role (Firestore Only - Redux via real-time listener):', originalRole);

    } catch (error) {
      console.error('❌ Role restore failed:', error);
      message.error(`Failed to restore role: ${error.message}`);
    } finally {
      setSwitchingRole(false);
    }
  };

  const selectedRoleInfo = availableRoles.find(r => r.key === selectedRole);
  const availableBranches = selectedProvince ? provinces.find(p => p.key === selectedProvince)?.branches || [] : [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Current Status */}
      <Alert
        message="Production Support Tool"
        description={
          <div>
            <p><strong>Purpose:</strong> Quickly switch roles to troubleshoot client issues by experiencing their exact permissions and access levels.</p>
            <p><strong>Current Role:</strong> <Tag color="blue">{userRole}</Tag> | <strong>Department:</strong> <Tag color="orange">{user?.department || user?.auth?.department || 'N/A'}</Tag> | <strong>Group:</strong> <Tag color="purple">{user?.group || user?.auth?.group || 'N/A'}</Tag></p>
            <p><strong>Original Role:</strong> <Tag color="green">{originalRole?.role || 'Unknown'}</Tag></p>
            <p><strong>⚠️ Warning:</strong> Role changes are persistent and logged. Always restore original role when finished.</p>
          </div>
        }
        type="info"
        showIcon
      />

      {/* 3-Column Role Configuration: Role | Geographic | Department */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="🎭 Select Role" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select role to switch to"
                value={selectedRole}
                onChange={setSelectedRole}
                optionLabelProp="label"
              >
                {availableRoles.map(role => (
                  <Option key={role.key} value={role.key} label={role.label}>
                    <div>
                      <Tag color={role.color}>{role.label}</Tag>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {role.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>

              {selectedRoleInfo && (
                <Alert
                  message={selectedRoleInfo.label}
                  description={selectedRoleInfo.description}
                  type="info"
                  size="small"
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="🌍 Geographic Context" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {selectedRoleInfo?.requiresProvince && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select province"
                  value={selectedProvince}
                  onChange={(value) => {
                    setSelectedProvince(value);
                    setSelectedBranch(null); // Reset branch when province changes
                  }}
                >
                  {provinces.map(province => (
                    <Option key={province.key} value={province.key}>
                      {province.label}
                    </Option>
                  ))}
                </Select>
              )}

              {selectedRoleInfo?.requiresBranch && selectedProvince && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select branch"
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                >
                  {availableBranches.map(branch => (
                    <Option key={branch} value={branch}>
                      {branch}
                    </Option>
                  ))}
                </Select>
              )}

              {selectedRoleInfo && !selectedRoleInfo.requiresProvince && (
                <Alert
                  message="No geographic restrictions"
                  description="This role has access to all provinces and branches"
                  type="success"
                  size="small"
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="🏢 Department & Group" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {selectedRoleInfo?.requiresDepartment && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select department"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                >
                  {departments.map(dept => (
                    <Option key={dept.key} value={dept.key}>
                      <div>
                        <Tag color={dept.color}>{dept.label}</Tag>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {dept.description}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              )}

              <Select
                style={{ width: '100%' }}
                placeholder="Select user group"
                value={selectedUserGroup}
                onChange={setSelectedUserGroup}
              >
                {userGroups.map(group => (
                  <Option key={group.key} value={group.key}>
                    <div>
                      <strong>{group.label}</strong>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {group.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>

              {selectedDepartment && (
                <Alert
                  message={`Department: ${departments.find(d => d.key === selectedDepartment)?.label}`}
                  description={`Group: ${userGroups.find(g => g.key === selectedUserGroup)?.label}`}
                  type="success"
                  size="small"
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space>
            <Button
              type="primary"
              size="large"
              loading={switchingRole}
              disabled={
                !selectedRole || 
                (selectedRoleInfo?.requiresProvince && !selectedProvince) || 
                (selectedRoleInfo?.requiresBranch && !selectedBranch) ||
                (selectedRoleInfo?.requiresDepartment && !selectedDepartment)
              }
              onClick={executeRoleSwitch}
              style={{ minWidth: '200px' }}
            >
              🔄 Switch to {selectedRole || 'Selected Role'}
            </Button>

            <Button
              type="default"
              size="large"
              loading={switchingRole}
              disabled={!originalRole}
              onClick={restoreOriginalRole}
              style={{ minWidth: '150px' }}
            >
              🔙 Restore Original
            </Button>

            <Button
              type="link"
              onClick={() => window.location.reload()}
            >
              🔃 Full Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Switch Log */}
      {switchLog.length > 0 && (
        <Card title="📋 Recent Role Changes" size="small">
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {switchLog.map((entry, index) => (
              <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px' }}>
                  <strong>{entry.timestamp}:</strong> {entry.from} → {entry.to}
                  {entry.province && ` (${entry.province}${entry.branch ? `/${entry.branch}` : ''})`}
                  {entry.department && ` | ${entry.department}`}
                  {entry.userGroup && ` | ${entry.userGroup}`}
                  <span style={{ color: '#666' }}> - {entry.permissions} permissions</span>
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Space>
  );
};

// Add PropTypes
const PropTypes = require('prop-types');
TestAuthentication.propTypes = {
  productionMode: PropTypes.bool
};

export default TestAuthentication; 