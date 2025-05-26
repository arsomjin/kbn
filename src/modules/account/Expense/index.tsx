import React, { useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';

const { Title } = Typography;

/**
 * Expense screen component for account module
 */
const Expense: React.FC = () => {
  const { t } = useTranslation('account', 'common');
  const { branchCode = 'all' } = useParams<{ branchCode: string }>();
  const [range, setRange] = useState<[DateTime, DateTime]>([
    DateTime.now().startOf('month'),
    DateTime.now().endOf('month')
  ]);

  return (
    <div className='space-y-6'>
      <Title level={2}>{t('expense:title', 'Expense')}</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card>
            <div className='text-center p-8'>
              {t('expense:underConstruction', 'Expense management page is under construction')}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Expense;
