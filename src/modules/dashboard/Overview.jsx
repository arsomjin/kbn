import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'hooks/useTheme';
import { UserOutlined, TeamOutlined, BankOutlined, ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Overview = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        {t('dashboard:overview')}
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable className="shadow-sm">
            <Statistic
              title={t('dashboard:totalUsers')}
              value={0}
              prefix={<UserOutlined />}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable className="shadow-sm">
            <Statistic
              title={t('dashboard:activeUsers')}
              value={0}
              prefix={<TeamOutlined />}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable className="shadow-sm">
            <Statistic
              title={t('dashboard:totalBranches')}
              value={0}
              prefix={<BankOutlined />}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable className="shadow-sm">
            <Statistic
              title={t('dashboard:activeBranches')}
              value={0}
              prefix={<ShopOutlined />}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview;
