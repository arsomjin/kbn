/**
 * RBAC Demo Component for KBN Multi-Province System
 * Comprehensive demo showing all RBAC features and components
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Tag, Alert, Divider, Typography, Badge, Descriptions } from 'antd';
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
import { fetchProvinces, setCurrentProvince } from '../redux/actions/provinces';
import { setUserPermissions, checkPermission } from '../redux/actions/rbac';

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
    permission: 'view_reports',
    province: provinceSelector.selectedProvince,
    requireGeographic: true
  });

  const canManageBranch = usePermissionGate({
    anyOf: ['manage_branch', 'manage_all_branches'],
    branch: branchSelector.selectedBranch
  });

  // Demo data
  const demoRoles = [
    { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
    { key: 'PROVINCE_MANAGER', label: 'Province Manager', color: 'blue' },
    { key: 'BRANCH_MANAGER', label: 'Branch Manager', color: 'green' },
    { key: 'BRANCH_STAFF', label: 'Branch Staff', color: 'orange' }
  ];

  const demoPermissions = [
    'view_reports',
    'manage_branch',
    'manage_users',
    'view_all_data',
    'edit_settings',
    'manage_inventory',
    'process_sales',
    'view_finances'
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
    }
  }, [dispatch, provinces]);

  // Simulate role change for demo
  const handleRoleChange = (role) => {
    setDemoRole(role);
    
    // Simulate different RBAC configs
    const roleConfigs = {
      SUPER_ADMIN: {
        accessLevel: 'all',
        permissions: ['*'],
        allowedProvinces: [],
        allowedBranches: [],
        homeProvince: null,
        homeBranch: null
      },
      PROVINCE_MANAGER: {
        accessLevel: 'province',
        permissions: ['view_reports', 'manage_branch', 'manage_users', 'view_all_data'],
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN001', 'NSN002', 'NSN003'],
        homeProvince: 'นครสวรรค์',
        homeBranch: null
      },
      BRANCH_MANAGER: {
        accessLevel: 'branch',
        permissions: ['view_reports', 'manage_branch', 'view_all_data', 'manage_inventory'],
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN001'],
        homeProvince: 'นครสวรรค์',
        homeBranch: 'NSN001'
      },
      BRANCH_STAFF: {
        accessLevel: 'branch',
        permissions: ['process_sales', 'view_reports'],
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN001'],
        homeProvince: 'นครสวรรค์',
        homeBranch: 'NSN001'
      }
    };

    const config = roleConfigs[role];
    if (config && user?.uid) {
      dispatch(setUserPermissions(user.uid, config));
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
                  <Descriptions.Item label="Role">{userRole || 'Unknown'}</Descriptions.Item>
                  <Descriptions.Item label="Access Level">
                    <Tag color={isSuperAdmin ? 'red' : hasProvinceAccess ? 'blue' : 'green'}>
                      {isSuperAdmin ? 'Super Admin' : hasProvinceAccess ? 'Province' : 'Branch'}
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
                showAll={isSuperAdmin}
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
                showAll={hasProvinceAccess}
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
                  permission="view_reports"
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
                  anyOf={['manage_branch', 'manage_all_branches']}
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