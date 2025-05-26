import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from 'constants/Permissions';
import { Layout, Card, Button, Typography, Space, Row, Col, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  FileOutlined,
  TaskOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();

  if (!userProfile) {
    return <LoadingSpinner />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const canViewTasks = hasAnyPermission([PERMISSIONS.TASK_COMPLETE]);
  const canViewDocuments = hasAnyPermission([
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_CREATE,
  ]);
  const canViewReports = hasAnyPermission([PERMISSIONS.REPORT_VIEW]);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Title level={4} className="m-0 text-primary-main">
            KBN Employee
          </Title>
        </div>
        <Space>
          <Text className="text-primary">Welcome, {userProfile.displayName}</Text>
        </Space>
      </Header>

      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Title level={2}>Employee Dashboard</Title>
            <Text className="text-lg text-secondary">
              Manage your tasks and access your workspace
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {canViewTasks && (
              <Col xs={24} sm={12} lg={8}>
                <Card hoverable>
                  <Statistic title="Tasks" value={null} prefix={<TaskOutlined />} />
                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={() => navigate('/employee/tasks')}
                  >
                    View Tasks
                  </Button>
                </Card>
              </Col>
            )}

            {canViewDocuments && (
              <Col xs={24} sm={12} lg={8}>
                <Card hoverable>
                  <Statistic title="Documents" value={null} prefix={<FileOutlined />} />
                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={() => navigate('/employee/documents')}
                  >
                    View Documents
                  </Button>
                </Card>
              </Col>
            )}

            {canViewReports && (
              <Col xs={24} sm={12} lg={8}>
                <Card hoverable>
                  <Statistic title="Reports" value={null} prefix={<BarChartOutlined />} />
                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={() => navigate('/employee/reports')}
                  >
                    View Reports
                  </Button>
                </Card>
              </Col>
            )}

            <Col xs={24} sm={12} lg={8}>
              <Card hoverable>
                <Statistic
                  title="System Status"
                  value="Operational"
                  prefix={<CheckCircleOutlined className="text-success" />}
                />
                <Text className="block mt-2 text-sm text-gray-500">
                  All systems are running normally
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default EmployeeDashboard;
