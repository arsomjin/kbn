import React from 'react';
import { ChevronRight } from '@material-ui/icons';
import { Button } from 'elements';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    width: 40,
    align: 'center'
  },
  {
    title: 'ชื่อ - นามสกุล',
    width: 180,
    render: (txt, rec) => (
      <div className="text-primary">{rec?.displayName || `${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}</div>
    )
  },
  {
    title: 'ระดับ',
    dataIndex: 'userGroup',
    align: 'center'
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    width: 120,
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'อีเมล',
    dataIndex: 'email',
    width: 220,
    render: (txt, rec) => <div>{rec?.auth ? rec.auth?.email : ''}</div>,
    align: 'center'
  },
  {
    title: 'เบอร์โทร',
    dataIndex: 'phoneNumber',
    width: 140,
    align: 'center'
  },
  {
    title: '→',
    dataIndex: '',
    key: 'x',
    render: (_, record) => <Button type="link" icon={<ChevronRight />} />,
    align: 'center',
    width: 50
  }
];

export const columns_mobile = [
  {
    title: '#',
    dataIndex: 'id'
  },
  {
    title: 'ชื่อ - นามสกุล',
    width: 180,
    render: (txt, rec) => (
      <div className="text-primary">{rec?.displayName || `${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}</div>
    )
  },
  {
    title: 'ระดับ',
    dataIndex: 'userGroup',
    width: 120,
    align: 'center'
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    width: 120,
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: '→',
    dataIndex: '',
    key: 'x',
    render: (_, record) => <Button type="link" icon={<ChevronRight />} />,
    align: 'center',
    width: 50
  }
];
