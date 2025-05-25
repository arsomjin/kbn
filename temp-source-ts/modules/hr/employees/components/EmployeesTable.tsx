import React from 'react';
import { Table, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface EmployeesTableProps {
  data: any[];
  loading: boolean;
  onEdit: (record: any) => void;
  provinceId?: string;
}

/**
 * EmployeesTable - Ant Design Table for Employees
 */
export const EmployeesTable: React.FC<EmployeesTableProps> = ({ data, loading, onEdit }) => {
  const { t } = useTranslation(['employees']);

  const columns = [
    {
      title: t('employees:table.id'),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 100
    },
    {
      title: t('employees:table.name'),
      dataIndex: 'firstName',
      key: 'name',
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}`
    },
    {
      title: t('employees:table.position'),
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: t('employees:table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <span className='text-green-600'>{t('employees:active')}</span>
        ) : (
          <span className='text-red-600'>{t('employees:inactive')}</span>
        )
    },
    {
      title: t('employees:table.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-')
    },
    {
      title: t('employees:table.actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)} size='small'>
          {t('employees:edit')}
        </Button>
      )
    }
  ];

  return (
    <Table
      rowKey='employeeCode'
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      className='bg-white dark:bg-gray-800'
    />
  );
};
