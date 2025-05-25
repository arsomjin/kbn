import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'hooks/useTheme';

const BranchDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard:branchOverview')}</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={t('dashboard:totalEmployees')}
              value={0}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={t('dashboard:activeEmployees')}
              value={0}
              className={theme === 'dark' ? 'text-white' : ''}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BranchDashboard;
