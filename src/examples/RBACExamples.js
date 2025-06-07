/**
 * RBAC Practical Examples for KBN Multi-Province System
 * Real-world usage examples for developers
 */

import React from 'react';
import { Card, Space, Typography, Button, Table, Form, Row, Col } from 'antd';
import { 
  PermissionGate, 
  ProvinceSelector, 
  GeographicBranchSelector,
  usePermissionGate,
  useProvinceSelector,
  useGeographicBranchSelector
} from '../components';
import { usePermissions } from '../hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;

// Example 1: Basic Permission Gating
const Example1_BasicPermissionGating = () => {
  return (
    <Card title="Example 1: Basic Permission Gating" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Show content only to users with view_reports permission */}
        <PermissionGate 
          permission="view_reports"
          fallback={<Text type="secondary">You don&apos;t have permission to view reports.</Text>}
        >
          <Button type="primary">View Sales Reports</Button>
        </PermissionGate>

        {/* Show content only to Province Managers */}
        <PermissionGate 
          role="PROVINCE_MANAGER"
          fallback={<Text type="secondary">Province Manager access required.</Text>}
        >
          <Button type="default">Manage Province Settings</Button>
        </PermissionGate>

        {/* Multiple permission options (any of) */}
        <PermissionGate 
          anyOf={['manage_branch', 'manage_all_branches']}
          fallback={<Text type="secondary">Branch management access required.</Text>}
        >
          <Button type="default">Branch Settings</Button>
        </PermissionGate>
      </Space>
    </Card>
  );
};

// Example 2: Geographic Filtering
const Example2_GeographicFiltering = () => {
  const { selectedProvince, handleProvinceChange } = useProvinceSelector();
  const { selectedBranch, handleBranchChange } = useGeographicBranchSelector();

  return (
    <Card title="Example 2: Geographic Filtering" size="small">
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Province (RBAC Filtered)">
              <ProvinceSelector
                value={selectedProvince}
                onChange={handleProvinceChange}
                respectRBAC={true}
                showAll={false}
                placeholder="Select Province"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Branch (Province Filtered)">
              <GeographicBranchSelector
                value={selectedBranch}
                onChange={handleBranchChange}
                province={selectedProvince}
                respectRBAC={true}
                showBranchCode={true}
                placeholder="Select Branch"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Content that shows based on geographic selection */}
        <PermissionGate 
          permission="view_reports"
          province={selectedProvince}
          branch={selectedBranch}
          fallback={<Text type="secondary">Select a province/branch you have access to view reports.</Text>}
        >
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6ffed' }}>
            <Text type="success">
              ✅ You can view reports for {selectedProvince && `Province: ${selectedProvince}`} 
              {selectedBranch && `, Branch: ${selectedBranch}`}
            </Text>
          </Card>
        </PermissionGate>
      </Form>
    </Card>
  );
};

// Example 3: Data Table with RBAC
const Example3_DataTableWithRBAC = () => {
  const { hasPermission, filterDataByUserAccess } = usePermissions();

  // Sample data
  const sampleData = [
    { id: 1, name: 'Sale #001', province: 'นครราชสีมา', branch: '0450', amount: 50000 },
    { id: 2, name: 'Sale #002', province: 'นครสวรรค์', branch: 'NSN001', amount: 75000 },
    { id: 3, name: 'Sale #003', province: 'นครสวรรค์', branch: 'NSN002', amount: 60000 },
    { id: 4, name: 'Sale #004', province: 'นครราชสีมา', branch: '0450', amount: 45000 },
  ];

  // Filter data based on user's geographic access
  const filteredData = filterDataByUserAccess(sampleData, {
    provinceField: 'province',
    branchField: 'branch'
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Province', dataIndex: 'province', key: 'province' },
    { title: 'Branch', dataIndex: 'branch', key: 'branch' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount) => `฿${amount.toLocaleString()}` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <PermissionGate 
            permission="view_details"
            province={record.province}
            branch={record.branch}
          >
            <Button size="small">View</Button>
          </PermissionGate>
          
          <PermissionGate 
            permission="edit_sales"
            province={record.province}
            branch={record.branch}
          >
            <Button size="small" type="primary">Edit</Button>
          </PermissionGate>
          
          <PermissionGate 
            permission="delete_sales"
            province={record.province}
            branch={record.branch}
          >
            <Button size="small" danger>Delete</Button>
          </PermissionGate>
        </Space>
      )
    }
  ];

  return (
    <Card title="Example 3: Data Table with RBAC" size="small">
      <Text type="secondary">
        This table shows only data from provinces/branches you have access to, 
        and actions are filtered by your permissions.
      </Text>
      <Table 
        dataSource={filteredData}
        columns={columns}
        size="small"
        style={{ marginTop: 16 }}
        pagination={false}
      />
    </Card>
  );
};

// Example 4: Complex Permission Logic
const Example4_ComplexPermissionLogic = () => {
  const { selectedProvince, handleProvinceChange } = useProvinceSelector();
  
  // Custom permission check using hook
  const canManageInventory = usePermissionGate({
    allOf: ['manage_inventory', 'access_warehouse'],
    province: selectedProvince,
    requireGeographic: true
  });

  const canViewFinancials = usePermissionGate({
    customCheck: ({ hasPermission, userRole, canUserAccessProvince }) => {
      // Custom logic: Super admins or province managers can view financials
      // Branch staff can only view if they have explicit permission
      if (userRole === 'SUPER_ADMIN') return true;
      if (userRole === 'PROVINCE_MANAGER' && canUserAccessProvince(selectedProvince)) return true;
      return hasPermission('view_financials') && canUserAccessProvince(selectedProvince);
    }
  });

  return (
    <Card title="Example 4: Complex Permission Logic" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProvinceSelector
          value={selectedProvince}
          onChange={handleProvinceChange}
          placeholder="Select Province"
          respectRBAC={true}
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>Permission Results:</Text>
          <ul>
            <li>
              Can Manage Inventory: 
              <Text type={canManageInventory ? 'success' : 'danger'}>
                {canManageInventory ? ' ✅ Yes' : ' ❌ No'}
              </Text>
            </li>
            <li>
              Can View Financials: 
              <Text type={canViewFinancials ? 'success' : 'danger'}>
                {canViewFinancials ? ' ✅ Yes' : ' ❌ No'}
              </Text>
            </li>
          </ul>
        </div>

        {/* Conditional content based on complex permissions */}
        {canManageInventory && (
          <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
            <Text>🏪 Inventory Management Dashboard would be displayed here</Text>
          </Card>
        )}

        {canViewFinancials && (
          <Card size="small" style={{ backgroundColor: '#e6f7ff' }}>
            <Text>💰 Financial Reports would be displayed here</Text>
          </Card>
        )}
      </Space>
    </Card>
  );
};

// Main Examples Component
const RBACExamples = () => {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>KBN RBAC System - Practical Examples</Title>
      
      <Paragraph>
        These examples demonstrate how to implement the RBAC system in real components.
        Copy these patterns for consistent permission handling across the application.
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Example1_BasicPermissionGating />
        <Example2_GeographicFiltering />
        <Example3_DataTableWithRBAC />
        <Example4_ComplexPermissionLogic />
      </Space>

      <Card title="Code Implementation Tips" size="small" style={{ marginTop: 24 }}>
        <ul>
          <li><Text strong>Always use PermissionGate</Text> - Wrap sensitive UI elements</li>
          <li><Text strong>Filter data server-side</Text> - Client filtering is for UX only</li>
          <li><Text strong>Use geographic context</Text> - Pass province/branch to permission checks</li>
          <li><Text strong>Provide fallbacks</Text> - Always show helpful messages when access is denied</li>
          <li><Text strong>Use hooks for complex logic</Text> - usePermissionGate for conditional rendering</li>
          <li><Text strong>Test with different roles</Text> - Use the demo role switcher for testing</li>
        </ul>
      </Card>
    </div>
  );
};

export default RBACExamples; 