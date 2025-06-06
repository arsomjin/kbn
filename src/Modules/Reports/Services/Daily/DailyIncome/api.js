import React from 'react';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { sortArr } from 'functions';

export const columns = [
  {
    title: 'ว/ด/ป',
    dataIndex: 'recordedDate',
    align: 'center'
  },
  {
    title: 'เงินสด',
    dataIndex: 'cash',
    width: 160,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'เงินโอน',
    dataIndex: 'moneyTransfer',
    width: 160,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'รวม',
    dataIndex: 'total',
    width: 160,
    align: 'center',
    render: text => <div className="text-primary">{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const serviceDailyIncomeSumKeys = ['cash', 'moneyTransfer', 'total'];

export const formatServiceDailyIncome = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let arr = distinctArr(dataArr, ['recordedDate'], ['cash', 'moneyTransfer', 'total']);
      arr = sortArr(arr, 'recordedDate');
      r(arr);
    } catch (e) {
      j(e);
    }
  });
