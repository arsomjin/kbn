import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Typography, Space, Alert, Descriptions, Tag, Row, Col, message, Select } from 'antd';
import { 
  CrownOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import app from 'firebase/app';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const ProductionRoleSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userRole, userPermissions } = usePermissions();
  const [switchingRole, setSwitchingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
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

  // Auto-set department when role changes
  useEffect(() => {
    const selectedRoleInfo = availableRoles.find(r => r.key === selectedRole);
    if (selectedRoleInfo?.defaultDepartment) {
      setSelectedDepartment(selectedRoleInfo.defaultDepartment);
    } else if (selectedRole && !selectedRoleInfo?.requiresDepartment) {
      setSelectedDepartment('admin'); // Default for management roles
    }
  }, [selectedRole]);

  // Get role configuration with full permissions
  const getRoleConfiguration = (role, province = null, branch = null, department = null) => {
    const { ROLE_PERMISSIONS } = require('data/permissions');
    
    const baseConfigs = {
      SUPER_ADMIN: {
        accessLevel: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN || ['*'],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null,
        department: department || 'admin',
        group: 'group001' // Super admin group
      },
      EXECUTIVE: {
        accessLevel: 'EXECUTIVE',
        permissions: ROLE_PERMISSIONS.EXECUTIVE || ['*'],
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null,
        department: department || 'admin',
        group: 'group002' // Executive group
      },
      PROVINCE_MANAGER: {
        accessLevel: 'PROVINCE_MANAGER',
        permissions: ROLE_PERMISSIONS.PROVINCE_MANAGER || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: province ? provinces.find(p => p.key === province)?.branches || [] : ['0450', 'NMA002', 'NMA003'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: null,
        department: department || 'admin',
        group: 'group003' // Province manager group
      },
      BRANCH_MANAGER: {
        accessLevel: 'BRANCH_MANAGER',
        permissions: ROLE_PERMISSIONS.BRANCH_MANAGER || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'admin',
        group: 'group004' // Branch manager group
      },
      ACCOUNTING_STAFF: {
        accessLevel: 'ACCOUNTING_STAFF',
        permissions: ROLE_PERMISSIONS.ACCOUNTING_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'accounting',
        group: 'group008' // Accounting staff group
      },
      SALES_STAFF: {
        accessLevel: 'SALES_STAFF',
        permissions: ROLE_PERMISSIONS.SALES_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'sales',
        group: 'group009' // Sales staff group
      },
      SERVICE_STAFF: {
        accessLevel: 'SERVICE_STAFF',
        permissions: ROLE_PERMISSIONS.SERVICE_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'service',
        group: 'group010' // Service staff group
      },
      INVENTORY_STAFF: {
        accessLevel: 'INVENTORY_STAFF',
        permissions: ROLE_PERMISSIONS.INVENTORY_STAFF || [],
        allowedProvinces: province ? [province] : ['nakhon-ratchasima'],
        allowedBranches: branch ? [branch] : ['0450'],
        homeProvince: province || 'nakhon-ratchasima',
        homeBranch: branch || '0450',
        department: department || 'inventory',
        group: 'group011' // Inventory staff group
      }
    };
    
    return baseConfigs[role];
  };

  // Execute role switch with full permission update
  const executeRoleSwitch = async () => {
    if (!selectedRole || !user?.uid) return;

    setSwitchingRole(true);
    
    try {
      // Get role configuration
      const roleConfig = getRoleConfiguration(selectedRole, selectedProvince, selectedBranch, selectedDepartment);
      
      if (!roleConfig) {
        message.error('Invalid role configuration');
        return;
      }

      // Extract permissions and geographic data
      const { permissions, ...geographic } = roleConfig;
      
      // Create updated user object with new role data
      const updatedUser = {
        ...user,
        accessLevel: selectedRole,
        ...geographic,
        // Keep original auth data but update role-specific fields
        auth: {
          ...user.auth,
          accessLevel: selectedRole,
          ...geographic
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

      // Update Firestore document with comprehensive role data
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'auth.accessLevel': selectedRole,
          'auth.allowedProvinces': geographic.allowedProvinces,
          'auth.allowedBranches': geographic.allowedBranches,
          'auth.homeProvince': geographic.homeProvince,
          'auth.homeBranch': geographic.homeBranch,
          'auth.lastRoleChange': Date.now(),
          'auth.roleChangedBy': 'production-support-tool',
          // Update department and group synchronization
          'department': geographic.department,
          'group': geographic.group,
          'homeBranch': geographic.homeBranch,
          // Update display name to reflect role for clarity
          'displayName': user.displayName ? `${user.displayName} [${selectedRole}]` : `[${selectedRole}]`
        });

      // Update Redux state
      dispatch({ type: 'USER_UPDATE', user: updatedUser });
      
      // Update RBAC state
      const { setUserPermissions, setUserRole, setGeographicAccess } = require('redux/actions/rbac');
      dispatch(setUserPermissions(user.uid, permissions, geographic));
      dispatch(setUserRole(user.uid, selectedRole));
      dispatch(setGeographicAccess(user.uid, geographic));

      // Log the switch
      const logEntry = {
        timestamp: new Date().toLocaleString(),
        from: userRole,
        to: selectedRole,
        province: selectedProvince,
        branch: selectedBranch,
        department: selectedDepartment,
        permissions: permissions.length
      };
      setSwitchLog(prev => [logEntry, ...prev.slice(0, 4)]); // Keep last 5 entries

      message.success(`✅ Successfully switched to ${selectedRole}${selectedProvince ? ` in ${selectedProvince}` : ''}${selectedBranch ? `/${selectedBranch}` : ''}${selectedDepartment ? ` (${selectedDepartment})` : ''}`);
      
      console.log('🔄 Production Role Switch:', {
        from: userRole,
        to: selectedRole,
        config: roleConfig,
        user: updatedUser
      });

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
      // Restore original user state with comprehensive data
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'auth.accessLevel': originalRole.role,
          'auth.allowedProvinces': originalRole.user.allowedProvinces || ['nakhon-ratchasima'],
          'auth.allowedBranches': originalRole.user.allowedBranches || ['0450'],
          'auth.homeProvince': originalRole.user.homeProvince || 'nakhon-ratchasima',
          'auth.homeBranch': originalRole.user.homeBranch || '0450',
          'auth.lastRoleRestore': Date.now(),
          'auth.roleRestoredBy': 'production-support-tool',
          // Restore department and group
          'department': originalRole.user.department || 'admin',
          'group': originalRole.user.group || 'group011',
          'homeBranch': originalRole.user.homeBranch || '0450',
          // Restore original display name
          'displayName': originalRole.user.displayName?.replace(/\s*\[.*?\]$/, '') || originalRole.user.displayName
        });

      // Update Redux state
      dispatch({ type: 'USER_UPDATE', user: originalRole.user });
      
      // Update RBAC state
      const { setUserPermissions, setUserRole, setGeographicAccess } = require('redux/actions/rbac');
      dispatch(setUserPermissions(user.uid, originalRole.permissions, {
        allowedProvinces: originalRole.user.allowedProvinces || ['nakhon-ratchasima'],
        allowedBranches: originalRole.user.allowedBranches || ['0450'],
        homeProvince: originalRole.user.homeProvince || 'nakhon-ratchasima',
        homeBranch: originalRole.user.homeBranch || '0450',
        department: originalRole.user.department || 'admin',
        group: originalRole.user.group || 'group011'
      }));
      dispatch(setUserRole(user.uid, originalRole.role));

      message.success(`✅ Restored to original role: ${originalRole.role}`);
      console.log('🔄 Restored to original role:', originalRole);

    } catch (error) {
      console.error('❌ Role restore failed:', error);
      message.error(`Failed to restore role: ${error.message}`);
    } finally {
      setSwitchingRole(false);
    }
  };

  const selectedRoleInfo = availableRoles.find(r => r.key === selectedRole);
  const availableBranches = selectedProvince ? provinces.find(p => p.key === selectedProvince)?.branches || [] : [];

  // Enhanced validation for button enable/disable
  const isValidConfiguration = () => {
    if (!selectedRole) return false;
    
    const roleInfo = availableRoles.find(r => r.key === selectedRole);
    if (!roleInfo) return false;
    
    // Check province requirement
    if (roleInfo.requiresProvince && !selectedProvince) return false;
    
    // Check branch requirement
    if (roleInfo.requiresBranch && !selectedBranch) return false;
    
    // Check department requirement
    if (roleInfo.requiresDepartment && !selectedDepartment) return false;
    
    return true;
  };

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
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Current Status */}
              <Alert
                message="Client Support Tool"
                description={
                  <div>
                    <p><UserSwitchOutlined /> <strong>Purpose:</strong> Switch roles to experience client issues firsthand and provide better support</p>
                    <p><SafetyOutlined /> <strong>Current Role:</strong> <Tag color="blue">{userRole}</Tag> | <strong>Original Role:</strong> <Tag color="green">{originalRole?.role || 'Unknown'}</Tag></p>
                    <p><GlobalOutlined /> <strong>⚠️ Important:</strong> Role changes persist until restored. Always restore original role when finished!</p>
                  </div>
                }
                type="info"
                showIcon
              />

              {/* Current User Info */}
              <Card title="👤 Current Session" size="small">
                <Descriptions column={3} size="small">
                  <Descriptions.Item label="User">{user?.displayName || user?.email}</Descriptions.Item>
                  <Descriptions.Item label="Environment">
                    {process.env.NODE_ENV === 'production' ? '🔴 Production' : '🟡 Development'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    <Tag color="blue">{user?.department || 'Unknown'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Active Role">
                    <Tag color="blue">{userRole}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Original Role">
                    <Tag color="green">{originalRole?.role || 'Unknown'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Group">
                    <Tag color="purple">{user?.group || 'Unknown'}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Role Selection */}
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card title="🎭 Select Target Role" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Select role to switch to"
                        value={selectedRole}
                        onChange={setSelectedRole}
                        optionLabelProp="label"
                        size="large"
                      >
                        {availableRoles.map(role => (
                          <Option key={role.key} value={role.key} label={role.label}>
                            <div>
                              <Tag color={role.color}>{role.label}</Tag>
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
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
                          size="large"
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
                          size="large"
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
                          message="Global Access"
                          description="This role has access to all provinces and branches"
                          type="success"
                          size="small"
                        />
                      )}
                    </Space>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card title="🏢 Department Context" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {selectedRoleInfo?.requiresDepartment && (
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Select department"
                          value={selectedDepartment}
                          onChange={setSelectedDepartment}
                          size="large"
                        >
                          {departments.map(dept => (
                            <Option key={dept.key} value={dept.key}>
                              <div>
                                <Tag color={dept.color}>{dept.label}</Tag>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                  {dept.description}
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      )}

                      {selectedDepartment && (
                        <Alert
                          message={departments.find(d => d.key === selectedDepartment)?.label}
                          description={departments.find(d => d.key === selectedDepartment)?.description}
                          type="info"
                          size="small"
                        />
                      )}

                      {selectedRoleInfo && !selectedRoleInfo.requiresDepartment && (
                        <Alert
                          message="Management Role"
                          description="Management roles have access to all departments"
                          type="success"
                          size="small"
                        />
                      )}
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Row justify="center">
                <Col>
                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      loading={switchingRole}
                      disabled={!isValidConfiguration()}
                      onClick={executeRoleSwitch}
                      style={{ minWidth: '220px', height: '50px' }}
                    >
                      🔄 Switch to {selectedRole || 'Selected Role'}
                    </Button>

                    <Button
                      type="default"
                      size="large"
                      loading={switchingRole}
                      disabled={!originalRole}
                      onClick={restoreOriginalRole}
                      style={{ minWidth: '180px', height: '50px' }}
                    >
                      🔙 Restore Original
                    </Button>

                    <Button
                      type="link"
                      size="large"
                      onClick={() => window.location.reload()}
                      style={{ height: '50px' }}
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
                      <div key={index} style={{ marginBottom: '8px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
                        <Text>
                          <strong>{entry.timestamp}:</strong> {entry.from} → <Tag color="blue">{entry.to}</Tag>
                          {entry.province && (
                            <span> in <Tag color="green">{entry.province}</Tag>
                            {entry.branch && <span>/<Tag color="orange">{entry.branch}</Tag></span>}
                            </span>
                          )}
                          {entry.department && (
                            <span> dept: <Tag color="purple">{entry.department}</Tag></span>
                          )}
                          <span style={{ color: '#666', marginLeft: '12px' }}>
                            ({entry.permissions} permissions)
                          </span>
                        </Text>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Instructions */}
              <Card title="📖 Usage Instructions" size="small">
                <ol style={{ margin: 0 }}>
                  <li><strong>Select Target Role:</strong> Choose the role you want to experience</li>
                  <li><strong>Set Geographic Context:</strong> Select province/branch if required by the role</li>
                  <li><strong>Switch Role:</strong> Click "Switch to" button to apply the role change</li>
                  <li><strong>Experience Client View:</strong> Navigate the application as the client would</li>
                  <li><strong>Restore Original:</strong> Always restore your original role when finished</li>
                </ol>
                
                <Alert
                  message="Best Practices"
                  description={
                    <ul style={{ margin: '8px 0 0 0' }}>
                      <li>Test client scenarios in a controlled manner</li>
                      <li>Document findings for improving client support</li>
                      <li>Always restore your role after troubleshooting</li>
                      <li>Use this tool responsibly in production</li>
                    </ul>
                  }
                  type="warning"
                  size="small"
                  style={{ marginTop: '16px' }}
                />
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductionRoleSwitcher; 