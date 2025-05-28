import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { distinctArr } from 'utils/array';

const getColumns1 = (data, t) => [
  {
    title: '#',
    dataIndex: 'id',
    width: 40,
    align: 'center',
  },
  {
    title: t('fields.fullName'),
    width: 180,
    render: (txt, rec) => (
      <div className="text-primary">
        {rec?.displayName ||
          `${rec?.prefix || ''}${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}
      </div>
    ),
  },
  {
    title: t('fields.nickName'),
    dataIndex: 'nickName',
    width: 80,
    align: 'center',
  },
  {
    title: t('fields.position'),
    dataIndex: 'position',
    width: 120,
    align: 'center',
    filters: distinctArr(data, ['position']).map((it) => ({
      value: it.position,
      text: it.position,
    })),
    onFilter: (value, record) => record.position === value,
  },
  {
    title: t('fields.provinceId'),
    dataIndex: 'provinceId',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['provinceId']).map((it) => ({
      value: it.provinceId,
      text: it.provinceId,
    })),
    onFilter: (value, record) => record.provinceId === value,
  },
  {
    title: t('fields.branch'),
    dataIndex: 'branch',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['branch']).map((it) => ({
      value: it.branch,
      text: it.branch,
    })),
    onFilter: (value, record) => record.branch === value,
  },
  {
    title: t('fields.employeeCode'),
    dataIndex: 'employeeCode',
    width: 100,
    align: 'center',
    render: (txt) => <div>{txt}</div>,
  },
  {
    title: t('fields.phoneNumber'),
    dataIndex: 'phoneNumber',
    width: 140,
    align: 'center',
  },
  {
    title: '→',
    dataIndex: '',
    key: 'x',
    render: () => <Button type="link" icon={<RightOutlined />} />,
    align: 'center',
    width: 50,
  },
];

const getColumns2 = (data, t) => [
  {
    title: '#',
    dataIndex: 'id',
  },
  {
    title: t('fields.fullName'),
    width: 180,
    render: (txt, rec) => (
      <div className="text-primary">
        {rec?.displayName ||
          `${rec?.prefix || ''}${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}
      </div>
    ),
  },
  {
    title: t('fields.position'),
    dataIndex: 'position',
    width: 120,
    align: 'center',
    filters: distinctArr(data, ['position']).map((it) => ({
      value: it.position,
      text: it.position,
    })),
    onFilter: (value, record) => record.position === value,
  },
  {
    title: t('fields.provinceId'),
    dataIndex: 'provinceId',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['provinceId']).map((it) => ({
      value: it.provinceId,
      text: it.provinceId,
    })),
    onFilter: (value, record) => record.provinceId === value,
  },
  {
    title: t('fields.branch'),
    dataIndex: 'branch',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['branch']).map((it) => ({
      value: it.branch,
      text: it.branch,
    })),
    onFilter: (value, record) => record.branch === value,
  },
  {
    title: '→',
    dataIndex: '',
    key: 'x',
    render: () => <Button type="link" icon={<RightOutlined />} />,
    align: 'center',
    width: 50,
  },
];

export const getColumns = (data, isMobile, t) => {
  let result = !isMobile ? getColumns1(data, t) : getColumns2(data, t);
  return result;
};
