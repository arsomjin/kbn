/**
 * RBAC Demo Component for KBN Multi-Province System
 * Comprehensive demo showing all RBAC features and components
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Tag, Alert, Typography, Badge, Descriptions } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UserOutlined, 
  GlobalOutlined, 
  BankOutlined, 
  ShopOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

import PermissionGate, { usePermissionGate } from './PermissionGate';
import ProvinceSelector, { useProvinceSelector } from './ProvinceSelector';
import GeographicBranchSelector, { useGeographicBranchSelector } from './GeographicBranchSelector';
import { usePermissions } from '../hooks/usePermissions';
import { fetchProvinces } from '../redux/actions/provinces';
import { setUserPermissions, setUserRole, setGeographicAccess } from '../redux/actions/rbac';
import { USER_UPDATE } from '../redux/actions/auth';
import { ROLE_PERMISSIONS } from '../data/permissions';

const { Title, Text, Paragraph } = Typography;

const RBACDemo = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { user } = useSelector(state => state.auth);
  const provinces = useSelector(state => state.provinces.provinces);
  const rbacState = useSelector(state => state.rbac);
  
  // Local state for demo
  const [demoRole, setDemoRole] = useState('BRANCH_STAFF');
  const [demoProvince, setDemoProvince] = useState('นครสวรรค์');
  const [demoBranch, setDemoBranch] = useState('NSN001');

  // Permission hooks
  const permissions = usePermissions();
  const {
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    isSuperAdmin,
    isExecutive,
    hasProvinceAccess,
    hasBranchAccessOnly,
    userRole,
    accessibleProvinces,
    accessibleBranches,
    canUserAccessProvince,
    canUserAccessBranch
  } = permissions;

  // Geographic selectors
  const provinceSelector = useProvinceSelector();
  const branchSelector = useGeographicBranchSelector();

  // Permission gate hook examples
  const canViewReports = usePermissionGate({
    permission: 'reports.view',
    province: provinceSelector.selectedProvince,
    requireGeographic: true
  });

  const canManageBranch = usePermissionGate({
    anyOf: ['admin.view', 'sales.approve', 'accounting.approve'],
    branch: branchSelector.selectedBranch
  });

  // Demo data
  const demoRoles = [
    { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
    { key: 'EXECUTIVE', label: 'Executive', color: 'purple' },
    { key: 'PROVINCE_MANAGER', label: 'Province Manager', color: 'blue' },
    { key: 'BRANCH_MANAGER', label: 'Branch Manager', color: 'green' },
    { key: 'BRANCH_STAFF', label: 'Branch Staff', color: 'orange' }
  ];

  const demoPermissions = [
    'accounting.view',
    'accounting.edit',
    'sales.view',
    'sales.edit',
    'service.view',
    'service.edit',
    'inventory.view',
    'inventory.edit',
    'reports.view',
    'admin.view'
  ];

  const demoProvinces = [
    'นครราชสีมา',
    'นครสวรรค์'
  ];

  const demoBranches = [
    { code: '0450', name: 'สาขานครราชสีมา', province: 'นครราชสีมา' },
    { code: 'NSN001', name: 'สาขานครสวรรค์ 1', province: 'นครสวรรค์' },
    { code: 'NSN002', name: 'สาขานครสวรรค์ 2', province: 'นครสวรรค์' },
    { code: 'NSN003', name: 'สาขานครสวรรค์ 3', province: 'นครสวรรค์' }
  ];

  // Load provinces on mount
  useEffect(() => {
    if (Object.keys(provinces).length === 0) {
      dispatch(fetchProvinces());
      
      // For demo purposes, add mock province data if none exists
      const mockProvinces = {
        'nakhon-ratchasima': {
          key: 'nakhon-ratchasima',
          id: 'nakhon-ratchasima',
          provinceName: 'นครราชสีมา',
          provinceNameEn: 'Nakhon Ratchasima',
          code: 'NMA',
          region: 'northeast',
          isActive: true,
          branches: ['0450']
        },
        'nakhon-sawan': {
          key: 'nakhon-sawan',
          id: 'nakhon-sawan',
          provinceName: 'นครสวรรค์',
          provinceNameEn: 'Nakhon Sawan',
          code: 'NSN',
          region: 'central',
          isActive: true,
          branches: ['NSN001', 'NSN002', 'NSN003']
        }
      };
      
      // Add mock provinces to Redux store for demo
      setTimeout(() => {
        dispatch({ type: 'SET_PROVINCES', payload: mockProvinces });
        
        // Also add mock branch data if needed
        const mockBranches = {
          '0450': {
            branchCode: '0450',
            branchName: 'สาขานครราชสีมา',
            provinceId: 'nakhon-ratchasima',
            province: 'นครราชสีมา',
            isActive: true
          },
          'NSN001': {
            branchCode: 'NSN001',
            branchName: 'สาขานครสวรรค์ 1',
            provinceId: 'nakhon-sawan',
            province: 'นครสวรรค์',
            isActive: true
          },
          'NSN002': {
            branchCode: 'NSN002',
            branchName: 'สาขานครสวรรค์ 2',
            provinceId: 'nakhon-sawan',
            province: 'นครสวรรค์',
            isActive: true
          },
          'NSN003': {
            branchCode: 'NSN003',
            branchName: 'สาขานครสวรรค์ 3',
            provinceId: 'nakhon-sawan',
            province: 'นครสวรรค์',
            isActive: true
          }
        };
        
        // Add branches to data Redux store
        dispatch({ type: 'SET_BRANCHES', payload: mockBranches });
      }, 100);
    }
  }, [dispatch, provinces]);

  // Simulate role change for demo
  const handleRoleChange = (role) => {
    setDemoRole(role);
    
    // Simulate different RBAC configs using correct province keys and permissions
    const roleConfigs = {
      SUPER_ADMIN: {
        accessLevel: 'all',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null
      },
      EXECUTIVE: {
        accessLevel: 'all',
        permissions: ROLE_PERMISSIONS.EXECUTIVE,
        allowedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
        allowedBranches: ['0450', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: null,
        homeBranch: null
      },
      PROVINCE_MANAGER: {
        accessLevel: 'province',
        permissions: ROLE_PERMISSIONS.PROVINCE_MANAGER,
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001', 'NSN002', 'NSN003'],
        homeProvince: 'nakhon-sawan',
        homeBranch: null
      },
      BRANCH_MANAGER: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.BRANCH_MANAGER,
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001'],
        homeProvince: 'nakhon-sawan',
        homeBranch: 'NSN001'
      },
      BRANCH_STAFF: {
        accessLevel: 'branch',
        permissions: ROLE_PERMISSIONS.INVENTORY_STAFF, // Using inventory staff as branch staff example
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001'],
        homeProvince: 'nakhon-sawan',
        homeBranch: 'NSN001'
      }
    };

    const config = roleConfigs[role];
    if (config && user?.uid) {
      // Extract permissions and geographic data from config
      const { permissions, ...geographic } = config;
      
      // For demo purposes, also update the user object flags
      const updatedUser = {
        ...user,
        isExecutive: role === 'EXECUTIVE',
        accessLevel: role
      };
      
      // Dispatch auth update first
      dispatch({ type: USER_UPDATE, user: updatedUser });
      
      // Dispatch all three RBAC actions
      dispatch(setUserPermissions(user.uid, permissions, geographic));
      dispatch(setUserRole(user.uid, role));
      dispatch(setGeographicAccess(user.uid, geographic));
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2}>
        <LockOutlined /> KBN RBAC System Demo
      </Title>
      
      <Paragraph>
        This demo showcases the Role-Based Access Control (RBAC) system for KBN's multi-province expansion.
        Switch between different roles to see how permissions and geographic access controls work.
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* Current User Info */}
        <Col span={24}>
          <Card title="Current User Information" icon={<UserOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Role">
                    {typeof userRole === 'object' && userRole?.role ? userRole.role : userRole || 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Access Level">
                    <Tag color={isExecutive ? 'purple' : isSuperAdmin ? 'red' : hasProvinceAccess ? 'blue' : 'green'}>
                      {isExecutive ? 'Executive' : isSuperAdmin ? 'Super Admin' : hasProvinceAccess ? 'Province' : 'Branch'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Home Province">{permissions.userProvinces?.[0] || 'None'}</Descriptions.Item>
                  <Descriptions.Item label="Home Branch">{permissions.userBranches?.[0] || 'None'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Available Permissions:</Text>
                <div style={{ marginTop: 8 }}>
                  {demoPermissions.map(permission => (
                    <Tag 
                      key={permission} 
                      color={hasPermission(permission) ? 'green' : 'red'}
                      style={{ marginBottom: 4 }}
                    >
                      {hasPermission(permission) ? <UnlockOutlined /> : <LockOutlined />} {permission}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Role Switcher for Demo */}
        <Col span={24}>
          <Card title="Demo Role Switcher" icon={<EditOutlined />}>
            <Space wrap>
              <Text>Switch Role:</Text>
              {demoRoles.map(role => (
                <Button
                  key={role.key}
                  type={demoRole === role.key ? 'primary' : 'default'}
                  onClick={() => handleRoleChange(role.key)}
                >
                  <Tag color={role.color}>{role.label}</Tag>
                </Button>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Province Selector Demo */}
        <Col span={12}>
          <Card title="Province Selector (RBAC Filtered)" icon={<GlobalOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <ProvinceSelector
                value={provinceSelector.selectedProvince}
                onChange={provinceSelector.handleProvinceChange}
                placeholder="เลือกจังหวัด"
                showAll={isSuperAdmin || isExecutive}
                respectRBAC={true}
                style={{ width: '100%' }}
              />
              
              <Alert
                message={`Accessible Provinces: ${accessibleProvinces.length}`}
                description={accessibleProvinces.map(p => p.provinceName || p.key).join(', ') || 'None'}
                type="info"
                showIcon
                size="small"
              />
            </Space>
          </Card>
        </Col>

        {/* Branch Selector Demo */}
        <Col span={12}>
          <Card title="Geographic Branch Selector" icon={<BankOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <GeographicBranchSelector
                value={branchSelector.selectedBranch}
                onChange={branchSelector.handleBranchChange}
                province={provinceSelector.selectedProvince}
                placeholder="เลือกสาขา"
                showAll={hasProvinceAccess || isExecutive}
                respectRBAC={true}
                showBranchCode={true}
                style={{ width: '100%' }}
              />
              
              <Alert
                message={`Accessible Branches: ${accessibleBranches.length}`}
                description={accessibleBranches.map(b => b.branchCode || b.key).join(', ') || 'None'}
                type="info"
                showIcon
                size="small"
              />
            </Space>
          </Card>
        </Col>

        {/* Permission Gate Examples */}
        <Col span={24}>
          <Card title="Permission Gate Examples" icon={<EyeOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <PermissionGate 
                  permission="reports.view"
                  province={provinceSelector.selectedProvince}
                  fallback={
                    <Alert message="No permission to view reports" type="error" showIcon />
                  }
                >
                  <Alert message="✅ Can view reports for selected province" type="success" showIcon />
                </PermissionGate>
              </Col>

              <Col span={8}>
                <PermissionGate 
                  role="PROVINCE_MANAGER"
                  fallback={
                    <Alert message="Not a Province Manager" type="warning" showIcon />
                  }
                >
                  <Alert message="✅ You are a Province Manager" type="success" showIcon />
                </PermissionGate>
              </Col>

              <Col span={8}>
                <PermissionGate 
                  anyOf={['admin.view', 'sales.approve', 'accounting.approve']}
                  branch={branchSelector.selectedBranch}
                  fallback={
                    <Alert message="Cannot manage selected branch" type="error" showIcon />
                  }
                >
                  <Alert message="✅ Can manage selected branch" type="success" showIcon />
                </PermissionGate>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Geographic Access Testing */}
        <Col span={24}>
          <Card title="Geographic Access Testing" icon={<ShopOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Province Access Test</Title>
                {demoProvinces.map(province => (
                  <div key={province} style={{ marginBottom: 8 }}>
                    <Badge 
                      status={canUserAccessProvince(province) ? 'success' : 'error'} 
                      text={province}
                    />
                  </div>
                ))}
              </Col>
              <Col span={12}>
                <Title level={5}>Branch Access Test</Title>
                {demoBranches.map(branch => (
                  <div key={branch.code} style={{ marginBottom: 8 }}>
                    <Badge 
                      status={canUserAccessBranch(branch.code) ? 'success' : 'error'} 
                      text={`${branch.code} - ${branch.name}`}
                    />
                  </div>
                ))}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Permission Hook Results */}
        <Col span={24}>
          <Card title="usePermissions Hook Results">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Title level={5}>Access Checks</Title>
                <ul>
                  <li>Executive: <Tag color={isExecutive ? 'green' : 'red'}>{isExecutive.toString()}</Tag></li>
                  <li>Super Admin: <Tag color={isSuperAdmin ? 'green' : 'red'}>{isSuperAdmin.toString()}</Tag></li>
                  <li>Province Access: <Tag color={hasProvinceAccess ? 'green' : 'red'}>{hasProvinceAccess.toString()}</Tag></li>
                  <li>Branch Only: <Tag color={hasBranchAccessOnly ? 'green' : 'red'}>{hasBranchAccessOnly.toString()}</Tag></li>
                </ul>
              </Col>
              <Col span={8}>
                <Title level={5}>Permission Tests</Title>
                <ul>
                  <li>Can View Reports: <Tag color={canViewReports ? 'green' : 'red'}>{canViewReports.toString()}</Tag></li>
                  <li>Can Manage Branch: <Tag color={canManageBranch ? 'green' : 'red'}>{canManageBranch.toString()}</Tag></li>
                </ul>
              </Col>
              <Col span={8}>
                <Title level={5}>Geographic Context</Title>
                <ul>
                  <li>Selected Province: <Tag>{provinceSelector.selectedProvince || 'None'}</Tag></li>
                  <li>Selected Branch: <Tag>{branchSelector.selectedBranch || 'None'}</Tag></li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RBACDemo; 