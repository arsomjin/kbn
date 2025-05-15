import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProvinceDashboard: React.FC = () => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard:province.title')}</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard:province.totalBranches')}
              value={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard:province.totalEmployees')}
              value={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard:province.totalCustomers')}
              value={0}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProvinceDashboard; 