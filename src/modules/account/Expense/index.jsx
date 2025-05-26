import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

/**
 * Expense screen component for account module
 */
const Expense = () => {
  const { t } = useTranslation('account', 'common');

  return (
    <div className="space-y-6">
      <Title level={2}>{t('expense:title', 'Expense')}</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card>
            <div className="text-center p-8">
              {t('expense:underConstruction', 'Expense management page is under construction')}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Expense;
