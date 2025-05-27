import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import { formatCurrency, formatDate } from 'utils/functions';

/**
 * Account table component
 */
export const AccountTable = ({ data }) => {
  const { t } = useTranslation('account', 'common');

  const columns = [
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => {
        try {
          return formatDate(date, 'dd/MM/yyyy');
        } catch {
          return '-';
        }
      },
    },
    {
      title: t('income'),
      dataIndex: 'income',
      key: 'income',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.income - b.income,
    },
    {
      title: t('expense'),
      dataIndex: 'expense',
      key: 'expense',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.expense - b.expense,
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.tax - b.tax,
    },
    {
      title: t('total'),
      key: 'total',
      render: (record) => formatCurrency(record.income + record.expense + record.tax),
      sorter: (a, b) => a.income + a.expense + a.tax - (b.income + b.expense + b.tax),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="date"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => t('common.totalRecords', { total }),
      }}
      scroll={{ x: true }}
      className="dark:bg-gray-800 dark:text-white"
      rowClassName="dark:hover:bg-gray-700"
    />
  );
};
