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
  message
} from 'antd';
import { SwapOutlined, ExperimentOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { app } from '../../../firebase';
import { verifyAuth } from 'redux/actions/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const RBACTester = () => {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [testProfiles, setTestProfiles] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // RBAC Test Profiles
  const rbacProfiles = {
    super_admin: {
      name: 'Super Admin',
      access: {
        authority: 'ADMIN',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
          assignedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
          homeProvince: null,
          homeBranch: null
        },
        departments: ['admin'],
        permissions: ['*']
      },
      description: 'Full system access across all provinces and departments'
    },
    province_manager_nma: {
      name: 'Province Manager - นครราชสีมา',
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
      description: 'Full province management for นครราชสีมา'
    },
    province_manager_nsn: {
      name: 'Province Manager - นครสวรรค์',
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
      description: 'Full province management for นครสวรรค์'
    },
    branch_manager_0450: {
      name: 'Branch Manager - สำนักงานใหญ่',
      access: {
        authority: 'LEAD',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['general'],
        permissions: ['accounting.view', 'sales.approve', 'service.approve', 'inventory.edit']
      },
      description: 'Branch management for สำนักงานใหญ่'
    },
    accounting_staff: {
      name: 'Accounting Staff - สำนักงานใหญ่',
      access: {
        authority: 'DEPARTMENT',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['accounting'],
        permissions: ['accounting.view', 'accounting.edit']
      },
      description: 'Department-level accounting access'
    },
    sales_staff: {
      name: 'Sales Staff - สำนักงานใหญ่',
      access: {
        authority: 'DEPARTMENT',
        geographic: {
          assignedProvinces: ['nakhon-ratchasima'],
          assignedBranches: ['0450'],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450'
        },
        departments: ['sales'],
        permissions: ['sales.view', 'sales.edit']
      },
      description: 'Department-level sales access'
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
      
      // Update user's RBAC structure and ensure they're active
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          access: {
            ...profile.access,
            lastUpdate: timestamp,
            updatedBy: 'rbac-tester',
            isActive: true
          },
          // Also update legacy field for compatibility
          isActive: true,
          'auth.isActive': true
        });

      if (isMounted) {
        message.success(`Switched to ${profile.name}`);
        
        // Refresh auth to load new RBAC data
        dispatch(verifyAuth());
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

  const resetToOriginal = async () => {
    setLoading(true);
    try {
      // Reset to basic user structure and ensure they're active
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
          // Also update legacy fields for compatibility
          isActive: true,
          'auth.isActive': true
        });

      if (isMounted) {
        message.success('Reset to original profile');
        dispatch(verifyAuth());
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
    
    return {
      authority: user.access.authority || 'Unknown',
      provinces: user.access.geographic?.assignedProvinces || [],
      branches: user.access.geographic?.assignedBranches || [],
      homeProvince: user.access.geographic?.homeProvince || 'None',
      homeBranch: user.access.geographic?.homeBranch || 'None',
      departments: user.access.departments || [],
      permissions: user.access.permissions || [],
      isActive: user.isActive || user.auth?.isActive || user.access?.isActive || false
    };
  };

  const currentAccess = getCurrentAccess();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ExperimentOutlined /> RBAC Tester
      </Title>
      
      <Alert
        message="RBAC Testing Tool"
        description="Quickly switch between different RBAC profiles to test permissions across the app. Changes are applied immediately."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Switch RBAC Profile">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder="Select test profile"
                value={selectedProfile}
                onChange={setSelectedProfile}
                style={{ width: '100%' }}
              >
                {testProfiles.map(([key, profile]) => (
                  <Option key={key} value={key}>
                    {profile.name}
                  </Option>
                ))}
              </Select>
              
              {selectedProfile && (
                <Alert
                  message={rbacProfiles[selectedProfile].name}
                  description={rbacProfiles[selectedProfile].description}
                  type="success"
                  showIcon
                />
              )}
              
              <Space>
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  loading={loading}
                  onClick={handleSwitchProfile}
                  disabled={!selectedProfile}
                >
                  Switch Profile
                </Button>
                <Button
                  icon={<UserOutlined />}
                  loading={loading}
                  onClick={resetToOriginal}
                >
                  Reset to Original
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Current RBAC Status">
            {currentAccess ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Authority">
                  <Tag color="blue">{currentAccess.authority}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Provinces">
                  <Space wrap>
                    {currentAccess.provinces.map(province => (
                      <Tag key={province} color="green">{province}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Branches">
                  <Space wrap>
                    {currentAccess.branches.map(branch => (
                      <Tag key={branch} color="orange">{branch}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Home Province">
                  <Tag color="purple">{currentAccess.homeProvince}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Home Branch">
                  <Tag color="cyan">{currentAccess.homeBranch}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Departments">
                  <Space wrap>
                    {currentAccess.departments.map(dept => (
                      <Tag key={dept} color="magenta">{dept}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Permissions">
                  <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                    <Space wrap>
                      {currentAccess.permissions.map(perm => (
                        <Tag key={perm} color="red" style={{ fontSize: '11px' }}>
                          {perm}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Active Status">
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
                        Activate Now
                      </Button>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">No RBAC data available</Text>
            )}
          </Card>
        </Col>
      </Row>
      
      <Card title="Available Test Profiles" style={{ marginTop: '16px' }}>
        <Row gutter={[16, 16]}>
          {testProfiles.map(([key, profile]) => (
            <Col span={8} key={key}>
              <Card size="small" title={profile.name}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {profile.description}
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Tag color="blue">{profile.access.authority}</Tag>
                  <Tag color="green">{profile.access.departments[0]}</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default RBACTester; 