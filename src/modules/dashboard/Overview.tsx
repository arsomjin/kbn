import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Typography } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';

const { Title } = Typography;

/**
 * Overview page for privilege users
 *
 * This page serves as the landing page for users with privilege access,
 * providing a high-level view of system status and administrative options.
 */
const Overview: React.FC = () => {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
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

  return (
    <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
      <Title level={isMobile ? 3 : 2}>Administrative Overview</Title>
      <p className='text-gray-500 mb-6'>
        Welcome back, {userProfile?.displayName || 'Administrator'}. Here's your system overview.
      </p>

      {/* Statistics Row */}
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} className='mb-6'>
        <Col xs={24} sm={12} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic 
              title='Active Users' 
              value={245} 
              valueStyle={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic 
              title='Pending Approvals' 
              value={8} 
              valueStyle={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic 
              title='New Reports' 
              value={12} 
              valueStyle={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic 
              title='System Status' 
              value='Healthy' 
              valueStyle={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Admin Actions */}
      <Title level={isMobile ? 5 : 4} className='mb-4'>
        Quick Actions
      </Title>
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        {hasPermission(PERMISSIONS.USER_VIEW) && (
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title='User Management' 
              size={isMobile ? 'small' : 'default'}
              headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
            >
              <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Review and manage user accounts, roles, and permissions.
              </p>
              <Button type='primary' href='/admin/users' size={isMobile ? 'middle' : 'large'}>
                Manage Users
              </Button>
            </Card>
          </Col>
        )}

        {hasPermission(PERMISSIONS.CONTENT_EDIT) && (
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title='Content Management' 
              size={isMobile ? 'small' : 'default'}
              headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
            >
              <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Create, edit, and publish content across the platform.
              </p>
              <Button type='primary' href='/admin/content' size={isMobile ? 'middle' : 'large'}>
                Manage Content
              </Button>
            </Card>
          </Col>
        )}

        {hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW) && (
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title='System Settings' 
              size={isMobile ? 'small' : 'default'}
              headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
            >
              <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Configure system settings and global parameters.
              </p>
              <Button type='primary' href='/admin/settings' size={isMobile ? 'middle' : 'large'}>
                System Settings
              </Button>
            </Card>
          </Col>
        )}

        {hasPermission(PERMISSIONS.DATA_EXPORT) && (
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title='Reports & Analytics' 
              size={isMobile ? 'small' : 'default'}
              headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
            >
              <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Generate reports and view analytics dashboards.
              </p>
              <Button type='primary' href='/admin/reports' size={isMobile ? 'middle' : 'large'}>
                View Reports
              </Button>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Overview;
