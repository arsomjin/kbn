import React from 'react';
import { Card, Table } from 'antd';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProvinceReports: React.FC = () => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('reports:province.branch'),
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: t('reports:province.sales'),
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: t('reports:province.customers'),
      dataIndex: 'customers',
      key: 'customers',
    },
  ];

  const data = [
    {
      key: '1',
      branch: 'Branch 1',
      sales: 0,
      customers: 0,
    },
  ];

  return (
    <div>
      <h1>{t('reports:province.title')}</h1>
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default ProvinceReports; 