import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import { distinctArr } from 'functions';
import { getSearchData } from 'firebase/api';
import { FilterSnap } from 'data/Constant';

export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    render: text => (
      <div className="text-primary">{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>
    ),
    width: 100,
    fixed: 'left'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...FilterSnap.branch,
    fixed: 'left'
  },
  {
    title: 'ท่อไอเสีย',
    dataIndex: 'amtIntake',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'เครื่องวัดขนาดแปลง',
    dataIndex: 'amtFieldMeter',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'แบตเตอรี่',
    dataIndex: 'amtBattery',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ยาง',
    dataIndex: 'amtTyre',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'GPS',
    dataIndex: 'amtGPS',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'อื่นๆ',
    dataIndex: 'amtOther',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  }
  // {
  //   title: 'รวม',
  //   dataIndex: 'total',
  //   width: 100,
  //   align: 'right',
  //   render: (text) => {
  //     return !text ? null : (
  //       <div className="text-primary">{numeral(text).format('0,0.00')}</div>
  //     );
  //   },
  // },
];

export const formatIncomeSummary = ({ branches, month }) =>
  new Promise(async (r, j) => {
    try {
      let sArr = await getSearchData('sections/account/incomes', {
        month,
        incomeCategory: 'daily',
        incomeSubCategory: 'parts',
        incomeType: 'partKBN'
      });

      let dArr = distinctArr(
        sArr.filter(l => !l.deleted),
        ['date', 'branchCode'],
        ['total', 'amtIntake', 'amtFieldMeter', 'amtBattery', 'amtTyre', 'amtGPS', 'amtOther']
      );

      r(dArr.filter(l => !!l.total).map((it, id) => ({ ...it, id, key: id })));
    } catch (e) {
      j(e);
    }
  });
