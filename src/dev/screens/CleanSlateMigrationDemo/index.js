/**
 * Clean Slate Migration Demo
 * Demonstrates migration from legacy RBAC to Clean Slate system
 */

import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  Alert, 
  Steps,
  Timeline,
  Descriptions,
  Table,
  Tag,
  Progress,
  Divider,
  Collapse
} from 'antd';
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  ArrowRightOutlined,
  DatabaseOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import PropTypes from 'prop-types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const MIGRATION_STEPS = [
  { title: 'Legacy Analysis', description: 'วิเคราะห์ระบบเก่า' },
  { title: 'Clean Slate Design', description: 'ออกแบบระบบใหม่' },
  { title: 'Data Mapping', description: 'แมปข้อมูลเก่าไปใหม่' },
  { title: 'Component Migration', description: 'แปลง Component' },
  { title: 'Testing & Validation', description: 'ทดสอบและตรวจสอบ' },
  { title: 'Production Deployment', description: 'นำไปใช้จริง' }
];

const CleanSlateMigrationDemoContent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [migrationProgress, setMigrationProgress] = useState(0);
  
  // Legacy role examples
  const legacyRoles = [
    'SUPER_ADMIN',
    'EXECUTIVE', 
    'PROVINCE_MANAGER_NMA',
    'PROVINCE_MANAGER_NSN',
    'BRANCH_MANAGER_NSN001',
    'ACCOUNTING_STAFF_0450',
    'ACCOUNTING_STAFF_NSN001',
    'SALES_STAFF_0450',
    'SALES_MANAGER_NMA',
    'SERVICE_TECHNICIAN_0450',
    'INVENTORY_CLERK_NSN001'
  ];

  // Clean slate mapping
  const cleanSlateMappings = {
    'SUPER_ADMIN': {
      authority: 'admin',
      department: 'admin',
      geographic: 'multi-province',
      permissions: ['admin.manage', 'accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'hr.manage']
    },
    'PROVINCE_MANAGER_NMA': {
      authority: 'province',
      department: 'admin',
      geographic: 'province',
      permissions: ['accounting.approve', 'sales.approve', 'service.edit', 'inventory.edit', 'hr.edit']
    },
    'ACCOUNTING_STAFF_0450': {
      authority: 'department',
      department: 'accounting',
      geographic: 'branch',
      permissions: ['accounting.view', 'accounting.edit']
    },
    'SALES_STAFF_0450': {
      authority: 'department',
      department: 'sales',
      geographic: 'branch',
      permissions: ['sales.view', 'sales.edit', 'inventory.view']
    }
  };

  // Migration benefits data
  const migrationBenefits = [
    {
      metric: 'Code Reduction',
      before: '1,424 lines',
      after: '474 lines',
      improvement: '67%',
      impact: 'Easier maintenance'
    },
    {
      metric: 'Role Complexity',
      before: '50+ specific roles',
      after: '4×3×6 matrix (72 combinations)',
      improvement: '86% reduction',
      impact: 'No role explosion'
    },
    {
      metric: 'Permission Logic',
      before: 'Nested hierarchies',
      after: 'Flat department.action',
      improvement: '100% simplification',
      impact: 'Zero complexity'
    },
    {
      metric: 'Geographic Handling',
      before: 'Manual injection',
      after: 'Automatic enhancement',
      improvement: '100% automation',
      impact: 'Consistent data'
    }
  ];

  // Simulate migration process
  const runMigrationStep = useCallback((step) => {
    setCurrentStep(step);
    setMigrationProgress((step + 1) * 16.67);
  }, []);

  // Migration steps detailed content
  const migrationStepsContent = {
    0: {
      title: 'Legacy System Analysis',
      content: (
        <div>
          <Alert message="Analyzing Legacy RBAC System" type="info" style={{ marginBottom: '16px' }} />
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="Identified Issues">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>• 50+ specific role definitions</Text>
                  <Text>• Geographic data manually injected</Text>
                  <Text>• Complex permission hierarchies</Text>
                  <Text>• Role inheritance chains</Text>
                  <Text>• Scattered authorization logic</Text>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Legacy Roles Found">
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {legacyRoles.map(role => (
                    <Tag key={role} style={{ marginBottom: '4px', display: 'block' }}>
                      {role}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    1: {
      title: 'Clean Slate Design Principles',
      content: (
        <div>
          <Alert message="Applying Clean Slate Design Principles" type="success" style={{ marginBottom: '16px' }} />
          <Timeline>
            <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
              <strong>Simplicity First</strong><br />
              <Text type="secondary">Choose the simplest solution always</Text>
            </Timeline.Item>
            <Timeline.Item color="blue" dot={<CheckCircleOutlined />}>
              <strong>Zero Complexity Tolerance</strong><br />
              <Text type="secondary">No nested permissions or role inheritance</Text>
            </Timeline.Item>
            <Timeline.Item color="purple" dot={<CheckCircleOutlined />}>
              <strong>Orthogonal Design</strong><br />
              <Text type="secondary">4×3×6 matrix prevents role explosion</Text>
            </Timeline.Item>
            <Timeline.Item color="orange" dot={<CheckCircleOutlined />}>
              <strong>Department.Action Format</strong><br />
              <Text type="secondary">Clear, predictable permission naming</Text>
            </Timeline.Item>
          </Timeline>
        </div>
      )
    },
    2: {
      title: 'Data Structure Mapping',
      content: (
        <div>
          <Alert message="Mapping Legacy Roles to Clean Slate Format" type="warning" style={{ marginBottom: '16px' }} />
          <Table
            dataSource={Object.entries(cleanSlateMappings).map(([legacy, clean]) => ({
              key: legacy,
              legacy,
              ...clean
            }))}
            columns={[
              { title: 'Legacy Role', dataIndex: 'legacy', key: 'legacy' },
              { title: 'Authority', dataIndex: 'authority', key: 'authority', render: (text) => <Tag color="blue">{text}</Tag> },
              { title: 'Department', dataIndex: 'department', key: 'department', render: (text) => <Tag color="green">{text}</Tag> },
              { title: 'Geographic', dataIndex: 'geographic', key: 'geographic', render: (text) => <Tag color="purple">{text}</Tag> },
              { 
                title: 'Permissions', 
                dataIndex: 'permissions', 
                key: 'permissions',
                render: (permissions) => (
                  <Space wrap>
                    {permissions.slice(0, 2).map(p => <Tag key={p} size="small">{p}</Tag>)}
                    {permissions.length > 2 && <Tag size="small">+{permissions.length - 2}</Tag>}
                  </Space>
                )
              }
            ]}
            size="small"
            pagination={false}
          />
        </div>
      )
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      
      {/* Migration Overview */}
      <Alert
        message="Clean Slate Migration Strategy"
        description="Demonstration of migrating from legacy 50+ roles to clean slate 4×3×6 orthogonal system"
        type="info"
        showIcon
        icon={<DatabaseOutlined />}
      />

      {/* Migration Progress */}
      <Card title={<><SyncOutlined spin /> Migration Progress</>}>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Steps current={currentStep} size="small">
              {MIGRATION_STEPS.map((step, index) => (
                <Steps.Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={migrationProgress}
                format={percent => `${Math.round(percent)}%`}
                strokeColor="#52c41a"
              />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Migration Progress</Text>
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Space>
          {MIGRATION_STEPS.map((step, index) => (
            <Button
              key={index}
              size="small"
              type={currentStep === index ? 'primary' : 'default'}
              onClick={() => runMigrationStep(index)}
            >
              Step {index + 1}
            </Button>
          ))}
        </Space>
      </Card>

      {/* Current Step Content */}
      {migrationStepsContent[currentStep] && (
        <Card title={migrationStepsContent[currentStep].title}>
          {migrationStepsContent[currentStep].content}
        </Card>
      )}

      {/* Migration Benefits */}
      <Card title={<><ThunderboltOutlined /> Migration Benefits</>}>
        <Table
          dataSource={migrationBenefits}
          columns={[
            { title: 'Metric', dataIndex: 'metric', key: 'metric' },
            { title: 'Before (Legacy)', dataIndex: 'before', key: 'before' },
            { title: 'After (Clean Slate)', dataIndex: 'after', key: 'after' },
            { 
              title: 'Improvement', 
              dataIndex: 'improvement', 
              key: 'improvement',
              render: (text) => <Tag color="green">{text}</Tag>
            },
            { title: 'Impact', dataIndex: 'impact', key: 'impact' }
          ]}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Implementation Guide */}
      <Card title={<><ToolOutlined /> Implementation Guide</>}>
        <Collapse>
          <Panel header="1. Component Migration Pattern" key="1">
            <Paragraph code>
{`// Before (Legacy - DEPRECATED)
<PermissionGate permission="PROVINCE_MANAGER">
  <ProvinceReports />
</PermissionGate>

// After (Clean Slate RBAC)
<PermissionGate permission="accounting.approve">
  <ProvinceReports />
</PermissionGate>`}
            </Paragraph>
          </Panel>
          
          <Panel header="2. Layout Wrapper Migration" key="2">
            <Paragraph code>
{`// Before (Legacy - DEPRECATED)
<LayoutWithRBAC title="Reports" permission="ACCOUNTING_STAFF">
  <ReportsComponent />
</LayoutWithRBAC>

// After (Clean Slate RBAC)
<LayoutWithRBAC 
  title="Reports" 
  permission="accounting.view"
  autoInjectProvinceId={true}
>
  <ReportsComponent />
</LayoutWithRBAC>`}
            </Paragraph>
          </Panel>
          
          <Panel header="3. Permission Check Migration" key="3">
            <Paragraph code>
{`// Before (Legacy - DEPRECATED)
if (user.role === 'ACCOUNTING_STAFF' || user.role === 'ACCOUNTING_MANAGER') {
  // Show accounting features
}

// After (Clean Slate RBAC)
if (hasPermission('accounting.view')) {
  // Show accounting features
}`}
            </Paragraph>
          </Panel>
          
          <Panel header="4. Data Enhancement Migration" key="4">
            <Paragraph code>
{`// Before (Legacy)
const submitData = {
  ...formData,
  provinceId: selectedProvince,  // Manual injection
  branchCode: selectedBranch     // Manual injection
};

// After (Clean Slate)
const submitData = geographic.enhanceDataForSubmission(formData);
// Automatic provinceId/branchCode injection with audit metadata`}
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>

      {/* Next Steps */}
      <Card title="🚀 Next Steps for Production Migration">
        <Timeline>
          <Timeline.Item color="blue">
            <strong>Phase 1: Pilot Module</strong><br />
            <Text type="secondary">Start with one module (e.g., Income Daily) for testing</Text>
          </Timeline.Item>
          <Timeline.Item color="green">
            <strong>Phase 2: Core Modules</strong><br />
            <Text type="secondary">Migrate accounting, sales, and service modules</Text>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <strong>Phase 3: Legacy Deprecation</strong><br />
            <Text type="secondary">Mark old RBAC system as deprecated</Text>
          </Timeline.Item>
          <Timeline.Item color="red">
            <strong>Phase 4: Complete Cutover</strong><br />
            <Text type="secondary">Remove legacy RBAC system entirely</Text>
          </Timeline.Item>
        </Timeline>
      </Card>

    </Space>
  );
};

const CleanSlateMigrationDemo = () => {
  return (
    <LayoutWithRBAC
      title="Clean Slate Migration Demo"
      subtitle="Legacy to Clean Slate RBAC Migration"
      permission="admin.view"
    >
      <CleanSlateMigrationDemoContent />
    </LayoutWithRBAC>
  );
};

export default CleanSlateMigrationDemo; 