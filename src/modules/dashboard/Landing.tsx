import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Avatar, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { NotificationOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Landing Component
 * 
 * General landing page for all authenticated users with assigned roles
 */
const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 480;
  const isTablet = windowWidth >= 480 && windowWidth < 768;

  // Placeholder announcements
  const announcements = [
    {
      id: 1,
      title: 'System Update Scheduled',
      date: '2025-05-15',
      content: 'A system update is scheduled for May 15, 2025. The system will be down for maintenance from 2:00 AM to 4:00 AM.'
    },
    {
      id: 2,
      title: 'New Document Templates Available',
      date: '2025-05-02',
      content: 'New document templates have been added to the system. Check them out in the Documents section.'
    },
    {
      id: 3,
      title: 'Training Session Next Week',
      date: '2025-05-10',
      content: 'A training session on the new reporting features will be held next week.'
    }
  ];

  // Placeholder recent documents
  const recentDocuments = [
    {
      id: 1,
      title: 'Monthly Report - April 2025',
      type: 'Report',
      updatedAt: '2025-05-01'
    },
    {
      id: 2,
      title: 'Inventory Check List',
      type: 'Checklist',
      updatedAt: '2025-04-28'
    },
    {
      id: 3,
      title: 'Staff Meeting Notes',
      type: 'Notes',
      updatedAt: '2025-04-25'
    }
  ];

  return (
    <div className={isMobile ? 'p-2' : 'p-6'}>
      <Title level={isMobile ? 3 : 2}>Welcome to KBN!</Title>
      <p className='text-gray-500 mb-6'>
        Hello, {userProfile?.displayName || 'User'}. Welcome to your KBN dashboard.
      </p>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        {/* Announcements Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <NotificationOutlined className="mr-2" /> 
                Announcements
              </div>
            }
            className='mb-4'
            size={isMobile ? 'small' : 'default'}
          >
            <List
              itemLayout="vertical"
              dataSource={announcements}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  extra={
                    <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                      {item.date}
                    </Text>
                  }
                >
                  <List.Item.Meta
                    title={<Text strong>{item.title}</Text>}
                  />
                  <Text>{item.content}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        {/* Recent Documents */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2" /> 
                Recent Documents
              </div>
            }
            className='mb-4'
            size={isMobile ? 'small' : 'default'}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentDocuments}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={<a href="#">{item.title}</a>}
                    description={`${item.type} - Updated on ${item.updatedAt}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Links */}
        <Col xs={24}>
          <Card 
            title={
              <div className="flex items-center">
                <TeamOutlined className="mr-2" /> 
                Quick Links
              </div>
            }
            size={isMobile ? 'small' : 'default'}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card hoverable className="text-center">
                  <FileTextOutlined style={{ fontSize: '24px' }} />
                  <div className="mt-2">Documents</div>
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card hoverable className="text-center">
                  <TeamOutlined style={{ fontSize: '24px' }} />
                  <div className="mt-2">Team</div>
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card hoverable className="text-center">
                  <NotificationOutlined style={{ fontSize: '24px' }} />
                  <div className="mt-2">Notifications</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Landing;