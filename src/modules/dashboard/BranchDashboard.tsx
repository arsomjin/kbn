import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { UserOutlined, BankOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

/**
 * Branch Dashboard Component
 * 
 * Targeted for Branch Managers to view branch-specific statistics and operations
 */
const BranchDashboard: React.FC = () => {
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

  // Placeholder branch stats
  const branchStats = {
    branchUsers: 28,
    pendingDocuments: 14,
    completedTasks: 42,
    upcomingDeadlines: 7
  };

  return (
    <div className={isMobile ? 'p-2' : 'p-6'}>
      <Title level={isMobile ? 3 : 2}>{t('dashboard:branchDashboard')}</Title>
      <p className='text-gray-500 mb-6'>
        {t('dashboard:branchWelcome', { name: userProfile?.displayName || t('common:user') })}
      </p>

      {/* Branch Statistics */}
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} className='mb-6'>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:branchUsers')}
              value={branchStats.branchUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#65a169', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:pendingDocuments')}
              value={branchStats.pendingDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#e6a23c', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:completedTasks')}
              value={branchStats.completedTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#409eff', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size={isMobile ? 'small' : 'default'}>
            <Statistic
              title={t('dashboard:upcomingDeadlines')}
              value={branchStats.upcomingDeadlines}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#f56c6c', fontSize: isMobile ? '1.5rem' : '2rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Branch Performance */}
      <Title level={isMobile ? 4 : 3} className='mb-4'>
        {t('dashboard:branchPerformance')}
      </Title>
      <Card className='mb-6'>
        <p className={isMobile ? 'text-sm' : ''}>
          {t('dashboard:branchPerformanceNote', { count: branchStats.completedTasks })}
        </p>
      </Card>

      {/* Recent Branch Activities */}
      <Title level={isMobile ? 4 : 3} className='mb-4'>
        {t('dashboard:recentActivities')}
      </Title>
      <Card>
        <p className={isMobile ? 'text-sm' : ''}>{t('dashboard:noBranchActivities')}</p>
      </Card>
    </div>
  );
};

export default BranchDashboard;