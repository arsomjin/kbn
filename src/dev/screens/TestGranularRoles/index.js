import React from 'react';
import { Alert, Card, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * TestGranularRoles Component - Deprecated
 * This component has been replaced by the unified RBAC system
 */
const TestGranularRoles = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Alert
        message="Component Deprecated"
        description="TestGranularRoles has been replaced by the unified RBAC system. Please use CleanSlateRBACDemo for testing."
        type="warning"
        icon={<ExclamationCircleOutlined />}
        showIcon
        closable={false}
      />
      
      <Card>
        <Title level={3}>🔄 Migration Notice</Title>
        <Text>
          This legacy component has been deprecated as part of the RBAC system unification.
          All granular role testing is now handled by the new Clean Slate RBAC Demo.
        </Text>
        
        <div style={{ marginTop: '16px' }}>
          <Text strong>Alternative Components:</Text>
          <ul>
            <li><Text code>/dev/clean-slate-rbac-demo</Text> - Comprehensive RBAC testing</li>
            <li><Text code>/dev/clean-slate-permissions-demo</Text> - Permission gate testing</li>
            <li><Text code>/dev/test-authentication</Text> - Authentication testing</li>
          </ul>
        </div>
      </Card>
    </Space>
  );
};

export default TestGranularRoles; 