import React from 'react';
import { ChevronRight } from '@material-ui/icons';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { distinctArr } from 'functions';

export const getColumns1 = data => [
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
      <div className="text-primary">
        {rec?.displayName || `${rec?.prefix || ''}${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}
      </div>
    )
  },
  {
    title: 'ชื่อเล่น',
    dataIndex: 'nickName',
    width: 80,
    align: 'center'
  },
  {
    title: 'ตำแหน่ง',
    dataIndex: 'position',
    width: 120,
    align: 'center',
    filters: distinctArr(data, ['position']).map(it => ({
      value: it.position,
      text: it.position
    })),
    onFilter: (value, record) => record.position === value
  },
  {
    title: 'สาขา',
    dataIndex: 'affiliate',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['affiliate']).map(it => ({
      value: it.affiliate,
      text: it.affiliate
    })),
    onFilter: (value, record) => record.affiliate === value
  },
  {
    title: 'รหัสพนักงาน',
    dataIndex: 'employeeCode',
    width: 100,
    align: 'center',
    render: txt => <div>{txt}</div>
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

export const getColumns2 = data => [
  {
    title: '#',
    dataIndex: 'id'
  },
  {
    title: 'ชื่อ - นามสกุล',
    width: 180,
    render: (txt, rec) => (
      <div className="text-primary">
        {rec?.displayName || `${rec?.prefix || ''}${rec?.firstName || ''} ${rec?.lastName || ''}`.trim()}
      </div>
    )
  },
  {
    title: 'ตำแหน่ง',
    dataIndex: 'position',
    width: 120,
    align: 'center',
    filters: distinctArr(data, ['position']).map(it => ({
      value: it.position,
      text: it.position
    })),
    onFilter: (value, record) => record.position === value
  },
  {
    title: 'สาขา',
    dataIndex: 'affiliate',
    align: 'center',
    width: 120,
    filters: distinctArr(data, ['affiliate']).map(it => ({
      value: it.affiliate,
      text: it.affiliate
    })),
    onFilter: (value, record) => record.affiliate === value
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

export const getColumns = data => {
  let result = !isMobile ? getColumns1(data) : getColumns2(data);
  return result;
};
