import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from 'constants/Permissions';
import { Layout, Card, Button, Typography, Space, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, FileOutlined, ReadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const VisitorDashboard = () => {
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

  const canViewContent = hasAnyPermission([PERMISSIONS.CONTENT_VIEW]);
  const canViewDocuments = hasAnyPermission([PERMISSIONS.DOCUMENT_VIEW]);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Title level={4} className="m-0 text-primary-main">
            KBN Visitor
          </Title>
        </div>
        <Space>
          <Text className="text-primary">Welcome, {userProfile.displayName}</Text>
        </Space>
      </Header>

      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Title level={2}>Visitor Dashboard</Title>
            <Text className="text-lg text-secondary">Access public content and documents</Text>
          </div>

          <Row gutter={[24, 24]}>
            {canViewContent && (
              <Col xs={24} sm={12} lg={8}>
                <Card hoverable>
                  <Statistic title="Public Content" value={null} prefix={<ReadOutlined />} />
                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={() => navigate('/visitor/content')}
                  >
                    View Content
                  </Button>
                </Card>
              </Col>
            )}

            {canViewDocuments && (
              <Col xs={24} sm={12} lg={8}>
                <Card hoverable>
                  <Statistic title="Public Documents" value={null} prefix={<FileOutlined />} />
                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={() => navigate('/visitor/documents')}
                  >
                    View Documents
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

export default VisitorDashboard;
