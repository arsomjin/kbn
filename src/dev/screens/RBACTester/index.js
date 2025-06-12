import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Alert, 
  Descriptions,
  Tag,
  message,
  Tabs,
  Table,
  Badge,
  Modal,
  Checkbox,
  Tree,
  Statistic,
  Progress,
  List,
  Avatar,
  Tooltip,
  Divider
} from 'antd';
import { 
  SwapOutlined, 
  ExperimentOutlined, 
  UserOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  BugOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { app } from '../../../firebase';
import { verifyAuth } from 'redux/actions/auth';
import { usePermissions } from 'hooks/usePermissions';
import { 
  getProvinceName, 
  getBranchName, 
  getDepartmentName,
  getApprovalLevelName,
  getAccessLevelName 
} from 'utils/mappings';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ComprehensiveRBACTester = () => {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [testProfiles, setTestProfiles] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');
  
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { hasPermission, filterDataByUserAccess, getUserGeo } = usePermissions();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Comprehensive RBAC Test Profiles with Real Scenarios
  const rbacProfiles = {
    // Administrative Profiles
    super_admin: {
      name: 'Super Admin (เจ้าของระบบ)',
      category: 'admin',
      access: {
        authority: 'ADMIN',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
          assignedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['admin', 'general'],
        permissions: ['*', 'admin.manage', 'users.manage', 'accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve']
      },
      description: 'Full system access - sees all data across all provinces and departments',
      expectAccess: ['Multi-province data', 'All reports', 'User management', 'System settings'],
      testScenarios: ['Dashboard Overview', 'User Management', 'Cross-province Reports', 'System Administration']
    },

    // Province Manager Profiles
    province_manager_nma: {
      name: 'Province Manager - นครราชสีมา',
      category: 'management',
      access: {
        authority: 'MANAGER',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450', 'NMA002', 'NMA003'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: null
        },
        departments: ['general'],
        permissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.manage']
      },
      description: 'Manages all branches in นครราชสีมา province only',
      expectAccess: ['นครราชสีมา data only', 'All departments in province', 'Approve transactions', 'Manage branch staff'],
      testScenarios: ['Province Dashboard', 'Branch Performance', 'Staff Management', 'Approval Workflows']
    },

    province_manager_nsn: {
      name: 'Province Manager - นครสวรรค์',
      category: 'management',
      access: {
        authority: 'MANAGER',
        geographic: {
          assignedProvinces: ['nakhon-sawan'],
          assignedBranches: ['NSN001', 'NSN002', 'NSN003'],
          homeProvince: 'nakhon-sawan',
          homeBranch: null
        },
        departments: ['general'],
        permissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.manage']
      },
      description: 'Manages all branches in นครสวรรค์ province only',
      expectAccess: ['นครสวรรค์ data only', 'All departments in province', 'Approve transactions', 'Manage branch staff'],
      testScenarios: ['Province Dashboard', 'Branch Performance', 'Staff Management', 'Approval Workflows']
    },

    // Branch Manager Profiles
    branch_manager_0450: {
      name: 'Branch Manager - สำนักงานใหญ่',
      category: 'branch',
      access: {
        authority: 'LEAD',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['general'],
        permissions: ['accounting.view', 'sales.approve', 'service.approve', 'inventory.edit', 'reports.view']
      },
      description: 'Manages สำนักงานใหญ่ branch operations only',
      expectAccess: ['Single branch data', 'All departments in branch', 'Limited approval rights', 'Branch reports'],
      testScenarios: ['Branch Dashboard', 'Daily Operations', 'Team Management', 'Local Reports']
    },

    branch_manager_nsn001: {
      name: 'Branch Manager - สาขาตาคลี',
      category: 'branch',
      access: {
        authority: 'LEAD',
        geographic: {
          assignedProvinces: ['nakhon-sawan'],
          assignedBranches: ['NSN001'],
          homeProvince: 'nakhon-sawan',
          homeBranch: 'NSN001'
        },
        departments: ['general'],
        permissions: ['accounting.view', 'sales.approve', 'service.approve', 'inventory.edit', 'reports.view']
      },
      description: 'Manages สาขาตาคลี branch in นครสวรรค์ only',
      expectAccess: ['Single branch data', 'All departments in branch', 'Limited approval rights', 'Branch reports'],
      testScenarios: ['Branch Dashboard', 'Daily Operations', 'Team Management', 'Local Reports']
    },

    // Department Staff Profiles
    accounting_staff_0450: {
      name: 'Accounting Staff - สำนักงานใหญ่',
      category: 'department',
      access: {
        authority: 'DEPARTMENT',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['accounting'],
        permissions: ['accounting.view', 'accounting.edit', 'reports.view']
      },
      description: 'Accounting department access in สำนักงานใหญ่ only',
      expectAccess: ['Accounting data only', 'Single branch', 'Edit permissions', 'Financial reports'],
      testScenarios: ['Accounting Dashboard', 'Transaction Entry', 'Financial Reports', 'Department Tasks']
    },

    sales_staff_nsn001: {
      name: 'Sales Staff - สาขาตาคลี',
      category: 'department',
      access: {
        authority: 'DEPARTMENT',
        geographic: {
          assignedProvinces: ['nakhon-sawan'],
          assignedBranches: ['NSN001'],
          homeProvince: 'nakhon-sawan',
          homeBranch: 'NSN001'
        },
        departments: ['sales'],
        permissions: ['sales.view', 'sales.edit', 'customers.view', 'inventory.view']
      },
      description: 'Sales department access in สาขาตาคลี only',
      expectAccess: ['Sales data only', 'Single branch', 'Customer management', 'Inventory viewing'],
      testScenarios: ['Sales Dashboard', 'Customer Management', 'Order Processing', 'Inventory Check']
    },

    service_staff_0450: {
      name: 'Service Staff - สำนักงานใหญ่',
      category: 'department',
      access: {
        authority: 'DEPARTMENT',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['service'],
        permissions: ['service.view', 'service.edit', 'inventory.view', 'customers.view']
      },
      description: 'Service department access in สำนักงานใหญ่ only',
      expectAccess: ['Service data only', 'Single branch', 'Work order management', 'Parts viewing'],
      testScenarios: ['Service Dashboard', 'Work Orders', 'Parts Management', 'Customer Service']
    },

    // Restricted Profiles for Testing Edge Cases
    guest_viewer: {
      name: 'Guest Viewer (ผู้ดูระบบ)',
      category: 'restricted',
      access: {
        authority: 'VIEWER',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: [],
        permissions: ['general.view']
      },
      description: 'Read-only access to basic information only',
      expectAccess: ['View-only access', 'Basic information', 'No editing', 'No sensitive data'],
      testScenarios: ['Basic Navigation', 'Information Viewing', 'Access Restrictions', 'Error Handling']
    }
  };

  // Test suites for comprehensive RBAC validation
  const testSuites = {
    permissionTests: {
      name: 'Permission Validation',
      tests: [
        { 
          name: 'Has Admin Access', 
          check: () => hasPermission('admin.manage'),
          expect: (profile) => profile.access.permissions.includes('admin.manage') || profile.access.permissions.includes('*')
        },
        { 
          name: 'Can Approve Accounting', 
          check: () => hasPermission('accounting.approve'),
          expect: (profile) => profile.access.permissions.includes('accounting.approve') || profile.access.permissions.includes('*')
        },
        { 
          name: 'Can Edit Sales', 
          check: () => hasPermission('sales.edit'),
          expect: (profile) => profile.access.permissions.includes('sales.edit') || profile.access.permissions.includes('*')
        },
        { 
          name: 'Can View Service', 
          check: () => hasPermission('service.view'),
          expect: (profile) => profile.access.permissions.includes('service.view') || profile.access.permissions.includes('*')
        }
      ]
    },
    geographicTests: {
      name: 'Geographic Access',
      tests: [
        {
          name: 'Home Province Access',
          check: () => {
            const geo = getUserGeo();
            return geo.homeProvince;
          },
          expect: (profile) => profile.access.geographic.homeProvince
        },
        {
          name: 'Branch Access Count',
          check: () => {
            const geo = getUserGeo();
            return geo.assignedBranches?.length || 0;
          },
          expect: (profile) => profile.access.geographic.assignedBranches?.length || 0
        }
      ]
    },
    dataFilteringTests: {
      name: 'Data Filtering',
      tests: [
        {
          name: 'Sample Data Filtering',
          check: () => {
            const sampleData = [
              { id: 1, provinceId: 'nakhon-ratchasima', branchCode: '0450', type: 'accounting' },
              { id: 2, provinceId: 'nakhon-sawan', branchCode: 'NSN001', type: 'sales' },
              { id: 3, provinceId: 'nakhon-ratchasima', branchCode: 'NMA002', type: 'service' }
            ];
            const filtered = filterDataByUserAccess(sampleData, {
              provinceField: 'provinceId',
              branchField: 'branchCode'
            });
            return filtered.length;
          },
          expect: (profile) => {
            const provinces = profile.access.geographic.assignedProvinces || [];
            const branches = profile.access.geographic.assignedBranches || [];
            
            let expectedCount = 0;
            if (provinces.includes('nakhon-ratchasima')) {
              if (branches.includes('0450')) expectedCount++;
              if (branches.includes('NMA002')) expectedCount++;
            }
            if (provinces.includes('nakhon-sawan') && branches.includes('NSN001')) {
              expectedCount++;
            }
            return expectedCount;
          }
        }
      ]
    }
  };

  useEffect(() => {
    setTestProfiles(Object.entries(rbacProfiles));
  }, []);

  const handleSwitchProfile = async () => {
    if (!selectedProfile || !user?.uid) {
      message.error('Please select a profile');
      return;
    }

    setLoading(true);
    try {
      const profile = rbacProfiles[selectedProfile];
      const timestamp = Date.now();
      
      // Update user's RBAC structure
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          access: {
            ...profile.access,
            lastUpdate: timestamp,
            updatedBy: 'rbac-tester',
            isActive: true,
            testProfile: selectedProfile
          },
          isActive: true,
          'auth.isActive': true,
          'auth.isApproved': true
        });

      if (isMounted) {
        message.success(`Switched to ${profile.name}`, 3);
        
        // Refresh auth to load new RBAC data
        dispatch(verifyAuth());
        
        // Run automatic tests after switch
        setTimeout(() => {
          runComprehensiveTests();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error switching RBAC profile:', error);
      if (isMounted) {
        message.error('Failed to switch RBAC profile');
      }
    }
    if (isMounted) {
      setLoading(false);
    }
  };

  const runComprehensiveTests = async () => {
    setRunningTests(true);
    const results = {};
    
    try {
      const currentProfile = rbacProfiles[selectedProfile];
      if (!currentProfile) return;

      // Run all test suites
      for (const [suiteKey, suite] of Object.entries(testSuites)) {
        results[suiteKey] = {
          name: suite.name,
          tests: [],
          passed: 0,
          total: suite.tests.length
        };

        for (const test of suite.tests) {
          try {
            const actualResult = test.check();
            const expectedResult = test.expect(currentProfile);
            const passed = actualResult === expectedResult;
            
            results[suiteKey].tests.push({
              name: test.name,
              passed,
              actual: actualResult,
              expected: expectedResult,
              status: passed ? 'passed' : 'failed'
            });
            
            if (passed) results[suiteKey].passed++;
          } catch (error) {
            results[suiteKey].tests.push({
              name: test.name,
              passed: false,
              actual: 'Error',
              expected: test.expect(currentProfile),
              error: error.message,
              status: 'error'
            });
          }
        }
      }

      setTestResults(results);
      
      // Show summary message
      const totalTests = Object.values(results).reduce((sum, suite) => sum + suite.total, 0);
      const totalPassed = Object.values(results).reduce((sum, suite) => sum + suite.passed, 0);
      
      if (totalPassed === totalTests) {
        message.success(`🎉 All ${totalTests} tests passed!`, 4);
      } else {
        message.warning(`⚠️ ${totalPassed}/${totalTests} tests passed`, 4);
      }
      
    } catch (error) {
      console.error('Error running tests:', error);
      message.error('Failed to run comprehensive tests');
    }
    
    setRunningTests(false);
  };

  const resetToOriginal = async () => {
    setLoading(true);
    try {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'access.authority': 'DEPARTMENT',
          'access.geographic.assignedProvinces': ['nakhon-ratchasima'],
          'access.geographic.assignedBranches': ['0450'],
          'access.geographic.homeProvince': 'nakhon-ratchasima',
          'access.geographic.homeBranch': '0450',
          'access.departments': ['general'],
          'access.permissions': ['accounting.view', 'sales.view'],
          'access.lastUpdate': Date.now(),
          'access.updatedBy': 'rbac-tester-reset',
          'access.isActive': true,
          'access.testProfile': null,
          isActive: true,
          'auth.isActive': true
        });

      if (isMounted) {
        message.success('Reset to original profile');
        dispatch(verifyAuth());
        setTestResults({});
        setSelectedProfile('');
      }
      
    } catch (error) {
      console.error('Error resetting RBAC profile:', error);
      if (isMounted) {
        message.error('Failed to reset RBAC profile');
      }
    }
    if (isMounted) {
      setLoading(false);
    }
  };

  const activateUser = async () => {
    setLoading(true);
    try {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          isActive: true,
          'auth.isActive': true,
          'access.isActive': true,
          'auth.isApproved': true,
          'auth.approvalStatus': 'approved'
        });

      if (isMounted) {
        message.success('User activated successfully!');
        dispatch(verifyAuth());
      }
    } catch (error) {
      console.error('Error activating user:', error);
      if (isMounted) {
        message.error('Failed to activate user');
      }
    }
    if (isMounted) {
      setLoading(false);
    }
  };

  const getCurrentAccess = () => {
    if (!user?.access) return null;
    
    const access = user.access;
    const geo = getUserGeo();
    
    return {
      authority: access.authority || 'Unknown',
      authorityName: getApprovalLevelName(access.authority),
      provinces: geo.assignedProvinces || [],
      branches: geo.assignedBranches || [],
      homeProvince: geo.homeProvince || 'None',
      homeBranch: geo.homeBranch || 'None',
      departments: access.departments || [],
      permissions: access.permissions || [],
      isActive: user.isActive || user.auth?.isActive || access?.isActive || false,
      testProfile: access.testProfile || null
    };
  };

  const currentAccess = getCurrentAccess();
  const totalProfiles = testProfiles.length;
  const profilesByCategory = testProfiles.reduce((acc, [key, profile]) => {
    if (!acc[profile.category]) acc[profile.category] = [];
    acc[profile.category].push([key, profile]);
    return acc;
  }, {});

  // Test results summary
  const testSummary = Object.keys(testResults).length > 0 ? {
    totalSuites: Object.keys(testResults).length,
    totalTests: Object.values(testResults).reduce((sum, suite) => sum + suite.total, 0),
    totalPassed: Object.values(testResults).reduce((sum, suite) => sum + suite.passed, 0),
    successRate: Object.values(testResults).reduce((sum, suite) => sum + suite.passed, 0) / 
                 Object.values(testResults).reduce((sum, suite) => sum + suite.total, 0) * 100
  } : null;

  const profileColumns = [
    {
      title: 'Profile',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </Space>
      )
    },
    {
      title: 'Authority',
      dataIndex: ['access', 'authority'],
      key: 'authority',
      render: (authority) => {
        const colors = {
          'ADMIN': 'red',
          'MANAGER': 'orange', 
          'LEAD': 'blue',
          'DEPARTMENT': 'green',
          'VIEWER': 'gray'
        };
                 return <Tag color={colors[authority]}>{getApprovalLevelName(authority)}</Tag>;
      }
    },
    {
      title: 'Geographic Scope',
      key: 'geographic',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <Text strong style={{ fontSize: '11px' }}>Provinces:</Text>
            <br />
            <Space wrap>
              {record.access.geographic.assignedProvinces.map(province => (
                <Tag key={province} size="small" color="blue">
                  {getProvinceName(province)}
                </Tag>
              ))}
            </Space>
          </div>
          <div>
            <Text strong style={{ fontSize: '11px' }}>Branches:</Text>
            <br />
            <Space wrap>
              {record.access.geographic.assignedBranches.slice(0, 3).map(branch => (
                <Tag key={branch} size="small" color="green">
                  {getBranchName(branch)}
                </Tag>
              ))}
              {record.access.geographic.assignedBranches.length > 3 && (
                <Tag size="small">+{record.access.geographic.assignedBranches.length - 3} more</Tag>
              )}
            </Space>
          </div>
        </Space>
      )
    },
    {
      title: 'Key Permissions',
      dataIndex: ['access', 'permissions'],
      key: 'permissions',
      render: (permissions) => (
        <Space wrap>
          {permissions.slice(0, 3).map(permission => (
            <Tag key={permission} size="small" color="purple">
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tag size="small">+{permissions.length - 3} more</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Test Scenarios',
      dataIndex: 'testScenarios',
      key: 'scenarios',
      render: (scenarios) => (
        <List
          size="small"
          dataSource={scenarios}
          renderItem={scenario => (
            <List.Item style={{ padding: '2px 0', fontSize: '11px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
              {scenario}
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={2}>
          <ExperimentOutlined style={{ color: '#1890ff' }} /> Comprehensive RBAC Testing Suite
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Advanced testing environment for Clean Slate RBAC system validation across all user profiles and scenarios
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Available Profiles" 
              value={totalProfiles} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Profile Categories" 
              value={Object.keys(profilesByCategory).length} 
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Test Suites" 
              value={Object.keys(testSuites).length} 
              prefix={<BugOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Success Rate" 
              value={testSummary ? Math.round(testSummary.successRate) : 0} 
              suffix="%" 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: testSummary?.successRate >= 80 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        {/* Profile Management Tab */}
        <TabPane 
          tab={<span><UserOutlined />Profile Testing</span>} 
          key="profiles"
        >
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="🎭 Test Profile Selection" size="default">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Select
                    placeholder="Choose a test profile to simulate"
                    value={selectedProfile}
                    onChange={setSelectedProfile}
                    style={{ width: '100%' }}
                    size="large"
                    showSearch
                    optionFilterProp="children"
                  >
                    {Object.entries(profilesByCategory).map(([category, profiles]) => (
                      <Select.OptGroup key={category} label={category.toUpperCase()}>
                        {profiles.map(([key, profile]) => (
                          <Option key={key} value={key}>
                            <Space>
                                                             <Tag color={
                                 category === 'admin' ? 'red' : 
                                 category === 'management' ? 'orange' : 
                                 category === 'branch' ? 'blue' : 
                                 category === 'department' ? 'green' : 'gray'
                               }>
                                 {getApprovalLevelName(profile.access.authority)}
                               </Tag>
                              {profile.name}
                            </Space>
                          </Option>
                        ))}
                      </Select.OptGroup>
                    ))}
                  </Select>
                  
                  {selectedProfile && (
                    <Alert
                      message={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text strong>{rbacProfiles[selectedProfile].name}</Text>
                          <Text type="secondary">{rbacProfiles[selectedProfile].description}</Text>
                          <div>
                            <Text strong style={{ fontSize: '12px' }}>Expected Access:</Text>
                            <ul style={{ margin: '4px 0 0 16px', fontSize: '12px' }}>
                              {rbacProfiles[selectedProfile].expectAccess.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </Space>
                      }
                      type="info"
                      showIcon
                    />
                  )}
                  
                  <Space size="large">
                    <Button
                      type="primary"
                      icon={<SwapOutlined />}
                      loading={loading}
                      onClick={handleSwitchProfile}
                      disabled={!selectedProfile}
                      size="large"
                    >
                      Switch & Test Profile
                    </Button>
                    
                    <Button
                      icon={<UserOutlined />}
                      loading={loading}
                      onClick={resetToOriginal}
                      size="large"
                    >
                      Reset to Original
                    </Button>

                    <Button
                      icon={<BugOutlined />}
                      loading={runningTests}
                      onClick={runComprehensiveTests}
                      disabled={!selectedProfile}
                      size="large"
                    >
                      Run Tests
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="🔍 Current RBAC Status" size="default">
                {currentAccess ? (
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Test Profile">
                      {currentAccess.testProfile ? (
                        <Badge status="processing" text={rbacProfiles[currentAccess.testProfile]?.name || 'Unknown'} />
                      ) : (
                        <Text type="secondary">Original Profile</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Authority">
                      <Tag color="blue">{currentAccess.authorityName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Home Location">
                      <Space direction="vertical" size="small">
                        <Text>{getProvinceName(currentAccess.homeProvince)}</Text>
                        <Text type="secondary">{getBranchName(currentAccess.homeBranch)}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Geographic Access">
                      <Space direction="vertical" size="small">
                        <div>
                          <Badge count={currentAccess.provinces.length} size="small">
                            <Tag color="green">Provinces</Tag>
                          </Badge>
                        </div>
                        <div>
                          <Badge count={currentAccess.branches.length} size="small">
                            <Tag color="orange">Branches</Tag>
                          </Badge>
                        </div>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Departments">
                      <Space wrap>
                        {currentAccess.departments.map(dept => (
                          <Tag key={dept} color="magenta">{getDepartmentName(dept)}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Key Permissions">
                      <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                        <Space wrap>
                          {currentAccess.permissions.slice(0, 5).map(perm => (
                            <Tag key={perm} color="red" style={{ fontSize: '10px' }}>
                              {perm}
                            </Tag>
                          ))}
                          {currentAccess.permissions.length > 5 && (
                            <Tag>+{currentAccess.permissions.length - 5} more</Tag>
                          )}
                        </Space>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Space>
                        <Tag color={currentAccess.isActive ? 'green' : 'red'}>
                          {currentAccess.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Tag>
                        {!currentAccess.isActive && (
                          <Button 
                            size="small" 
                            type="primary" 
                            danger 
                            onClick={activateUser}
                            loading={loading}
                          >
                            Activate
                          </Button>
                        )}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Alert 
                    message="No RBAC Data" 
                    description="User does not have Clean Slate RBAC structure" 
                    type="warning"
                    showIcon
                  />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Test Results Tab */}
        <TabPane 
          tab={<span><BugOutlined />Test Results</span>} 
          key="results"
        >
          {Object.keys(testResults).length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Test Summary */}
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Statistic 
                      title="Total Tests" 
                      value={testSummary.totalTests}
                      prefix={<BugOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Passed" 
                      value={testSummary.totalPassed}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Failed" 
                      value={testSummary.totalTests - testSummary.totalPassed}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <div>
                      <Text strong>Success Rate</Text>
                      <Progress 
                        percent={Math.round(testSummary.successRate)} 
                        status={testSummary.successRate >= 80 ? 'success' : 'exception'}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Individual Test Results */}
              {Object.entries(testResults).map(([suiteKey, suite]) => (
                <Card 
                  key={suiteKey}
                  title={
                    <Space>
                      <Badge 
                        count={`${suite.passed}/${suite.total}`} 
                        color={suite.passed === suite.total ? 'green' : 'red'}
                      />
                      {suite.name}
                    </Space>
                  }
                >
                  <Table
                    dataSource={suite.tests}
                    columns={[
                      {
                        title: 'Test Name',
                        dataIndex: 'name',
                        key: 'name'
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          const config = {
                            'passed': { color: 'green', icon: <CheckCircleOutlined /> },
                            'failed': { color: 'red', icon: <CloseCircleOutlined /> },
                            'error': { color: 'orange', icon: <ExclamationCircleOutlined /> }
                          };
                          const { color, icon } = config[status] || config.error;
                          return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
                        }
                      },
                      {
                        title: 'Expected',
                        dataIndex: 'expected',
                        key: 'expected',
                        render: (value) => <Text code>{String(value)}</Text>
                      },
                      {
                        title: 'Actual',
                        dataIndex: 'actual',
                        key: 'actual',
                        render: (value) => <Text code>{String(value)}</Text>
                      }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              ))}
            </Space>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <BugOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={3} type="secondary">No Test Results</Title>
                <Paragraph type="secondary">
                  Switch to a test profile and run comprehensive tests to see detailed results here.
                </Paragraph>
                <Button 
                  type="primary" 
                  icon={<ExperimentOutlined />}
                  onClick={() => setActiveTab('profiles')}
                >
                  Start Testing
                </Button>
              </div>
            </Card>
          )}
        </TabPane>

        {/* Profile Overview Tab */}
        <TabPane 
          tab={<span><EyeOutlined />Profile Overview</span>} 
          key="overview"
        >
          <Card title="🎭 All Available Test Profiles">
            <Table
              dataSource={testProfiles.map(([key, profile]) => ({ key, ...profile }))}
              columns={profileColumns}
              pagination={{ pageSize: 10 }}
              size="middle"
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Quick Action Bar */}
      <Card style={{ marginTop: '24px', background: '#f6f6f6' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Quick Actions:</Text>
              <Button size="small" onClick={() => window.location.href = '/overview'}>
                <DashboardOutlined /> Dashboard
              </Button>
              <Button size="small" onClick={() => window.location.href = '/developer'}>
                <SettingOutlined /> Dev Tools
              </Button>
              <Button size="small" onClick={() => window.location.href = '/admin/user-management'}>
                <UserOutlined /> User Management
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">RBAC Tester</Text>
              <Badge status="processing" text="Active Testing Environment" />
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ComprehensiveRBACTester; 