import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { UserOutlined, BellOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../constants/roles';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
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

  // Placeholder stats for demonstration
  const stats = {
    users: 152,
    notifications: 24,
    completedTasks: 87,
    pendingTasks: 13
  };

  // Check if user has admin privileges
  const isAdmin = userProfile?.role === UserRole.PROVINCE_ADMIN;
  const isManager = userProfile?.role === UserRole.GENERAL_MANAGER;

  return (
    <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
      <div className='mb-6'>
        <Title level={isMobile ? 3 : 2}>{t('app:title')}</Title>
        <p className={`text-text-light mb-6 ${isMobile ? 'text-sm' : ''}`}>
          {t('dashboard:welcome')}, {userProfile?.displayName || t('common:user')}!
        </p>
      </div>

      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} className='mb-6'>
        {/* Users - Only visible to admin and managers */}
        {(isAdmin || isManager) && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable size={isMobile ? 'small' : 'default'}>
              <Statistic
                title={t('dashboard:totalUsers')}
                value={stats.users}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#65a169', fontSize: isMobile ? '1.5rem' : '2rem' }}
              />
            </Card>
          </Col>
        )}

        {/* Notifications */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:notifications')}
              value={stats.notifications}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#6ea5be', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>

        {/* Completed Tasks */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:completedTasks')}
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#65a169', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>

        {/* Pending Tasks */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:pendingTasks')}
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#c7a15e', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent activity section - placeholder */}
      <Card 
        title={t('dashboard:recentActivity')} 
        className='mb-6'
        size={isMobile ? 'small' : 'default'}
        headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
      >
        <p className={isMobile ? 'text-sm' : ''}>{t('dashboard:noRecentActivity')}</p>
      </Card>

      {/* Additional admin section */}
      {isAdmin && (
        <Card 
          title={t('dashboard:adminSection')}
          size={isMobile ? 'small' : 'default'}
          headStyle={{ fontSize: isMobile ? '14px' : '16px' }}
        >
          <p className={isMobile ? 'text-sm' : ''}>{t('dashboard:adminNote')}</p>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
