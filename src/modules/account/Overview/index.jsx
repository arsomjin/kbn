import React, { useState } from 'react';
import { Card, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { AccountReport } from '../components/AccountReport';
import { AccountPieChart } from '../components/AccountPieChart';
import { AccountTable } from '../components/AccountTable';
import { useFinancialData } from '../hooks/useFinancialData';

/**
 * Overview screen component for account module
 */
const Overview = () => {
  const { t } = useTranslation('account', 'common');
  const { branchCode = 'all' } = useParams();
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  const { data, loading, error } = useFinancialData(range);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <AccountReport
              title={t('financialReport')}
              branchName={branchCode === 'all' ? t('allBranches') : branchCode}
              range={range}
              onRangeChange={handleRangeChange}
              data={data}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <AccountPieChart
              title={t('financialDistribution')}
              branchName={branchCode === 'all' ? t('allBranches') : branchCode}
              range={range}
              data={data}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <AccountTable data={data.data} range={range} />
      </Card>
    </div>
  );
};

export default Overview;
