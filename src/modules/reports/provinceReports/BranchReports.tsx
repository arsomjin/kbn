import React from 'react';
import { Card, Table } from 'antd';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BranchReports: React.FC = () => {
  const { provinceId, branchCode } = useParams<{ branchCode: string; provinceId: string }>();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('reports:provinceid.branchCode.accounts'),
      dataIndex: 'accounts',
      key: 'accounts'
    },
    {
      title: t('reports:provinceid.branchCode.sales'),
      dataIndex: 'sales',
      key: 'sales'
    },
    {
      title: t('reports:provinceid.branchCode.customers'),
      dataIndex: 'customers',
      key: 'customers'
    }
  ];

  const data = [
    {
      key: '1',
      branch: 'Branch 1',
      sales: 0,
      customers: 0
    }
  ];

  return (
    <div>
      <h1>{t('reports:provinceid.branchCode.title')}</h1>
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default BranchReports;
