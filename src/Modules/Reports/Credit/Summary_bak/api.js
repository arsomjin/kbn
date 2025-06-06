import React from 'react';
import { parser } from 'functions';
import moment from 'moment-timezone';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
import { getCollection } from 'firebase/api';

const getColumns2 = type => [
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    // defaultSortOrder: 'descend',
    // sorter: (a, b) => parser(a.date) - parser(b.date),
    ellipsis: true
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'ยอดตัดขาย',
    dataIndex: 'amtSaleCutoff',
    align: 'center',
    width: 180,
    className: 'text-warning',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ยอดส่งสัญญา',
    dataIndex: 'amtContractDeliver',
    align: 'center',
    width: 180,
    className: 'text-primary',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ยอดรับเงิน',
    // title:
    //   type === 'sklLeasing'
    //     ? 'ยอดรับเงินจาก SKL'
    //     : type === 'baac'
    //     ? 'ยอดรับเงินจาก สกต./ธกส'
    //     : 'ยอดรับเงิน',
    dataIndex: 'amtSKLReceive',
    align: 'center',
    width: 180,
    className: 'text-success',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'จำนวนใบกำกับภาษี',
    dataIndex: 'taxInvoiceCount',
    align: 'center',
    width: 180,
    render: text => <div>{numeral(text).format('0,0')}</div>
  }
];

export const getColumns = (type, allBranch) => {
  let result = [];
  switch (type) {
    case 'date':
      result = Object.assign([], getColumns2('sklLeasing'), {
        0: {
          title: 'ว/ด/ป',
          dataIndex: 'date',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(b.date) - parser(a.date),
          ellipsis: true
        }
      });
      break;
    case 'month':
      result = Object.assign([], getColumns2('sklLeasing'), {
        0: {
          title: 'เดือน',
          dataIndex: 'month',
          align: 'center',
          render: txt => <div>{moment(txt, 'YYYY-MM').format(isMobile ? 'MMM YY' : 'MMMM YYYY')}</div>,
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(b.month) - parser(a.month),
          ellipsis: true,
          width: 120
        }
      });
      break;
    case 'year':
      result = Object.assign([], getColumns2('sklLeasing'), {
        0: {
          title: 'ปี',
          dataIndex: 'year',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(b.year) - parser(a.year),
          ellipsis: true,
          width: 120
        }
      });
      break;
    default:
      break;
  }
  return allBranch ? result.filter(l => l.dataIndex !== 'branchCode') : result;
};

export const sumKeys = ['amtSaleCutoff', 'amtContractDeliver', 'amtSKLReceive', 'taxInvoiceCount'];

export const formatCreditData = snap => {
  let result = [];
  if (!snap || Object.keys(snap).length === 0) {
    return [];
  }
  const {
    saleId,
    saleNo,
    saleType,
    prefix,
    firstName,
    lastName,
    saleCutoffDate,
    contractDeliverDate,
    contractAmtReceivedDate,
    netTotal,
    taxInvoiceDate,
    taxInvoice,
    date
  } = snap;

  const initSnap = {};
  sumKeys.map(k => {
    initSnap[k] = null;
    return k;
  });
  if (!!saleCutoffDate) {
    result.push({
      ...initSnap,
      date: saleCutoffDate,
      amtSaleCutoff: netTotal
    });
  }
  if (!!contractDeliverDate) {
    result.push({
      ...initSnap,
      date: contractDeliverDate,
      amtContractDeliver: netTotal
    });
  }
  if (!!contractAmtReceivedDate) {
    result.push({
      ...initSnap,
      date: contractAmtReceivedDate,
      amtSKLReceive: netTotal
    });
  }
  if (!!taxInvoiceDate) {
    result.push({
      ...initSnap,
      date: taxInvoiceDate,
      taxInvoiceCount: 1
    });
  }
  showLog({ result });
  return result;
};

export const initData = {
  yearArr: [],
  monthArr: [],
  dateArr: [],
  all: [],
  dateAll: [],
  monthAll: [],
  yearAll: []
};

export const getCreditData = ({ branchCode, saleType }) =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [];
      if (branchCode !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branchCode]]);
      }
      if (saleType !== 'all') {
        wheres = wheres.concat([['saleType', '==', saleType]]);
      }
      const creditData = await getCollection('sections/credits/credits', wheres);
      if (!creditData) {
        return r(result);
      }
      let fArr = [];
      let arr = Object.keys(creditData || {}).map(k => {
        const nArr = formatCreditData(creditData[k]);
        fArr = [...fArr, ...nArr];
        return k;
      });
      let dArr = distinctArr(fArr, ['date'], sumKeys);
      let dateArr = dArr.map((l, i) => ({
        ...l,
        month: l?.date ? moment(l.date, 'YYYY-MM-DD').format('YYYY-MM') : null,
        year: l?.date ? moment(l.date, 'YYYY-MM-DD').format('YYYY') : null,
        id: i,
        key: i
      }));
      let monthArr = distinctArr(dateArr, ['month'], sumKeys).map((l, i) => {
        let mIt = { ...l, id: i, key: i };
        delete mIt.date;
        return mIt;
      });
      let yearArr = distinctArr(dateArr, ['year'], sumKeys).map((l, i) => {
        let mIt = { ...l, id: i, key: i };
        delete mIt.date;
        delete mIt.month;
        return mIt;
      });
      let all = arr;
      r({
        dateArr,
        monthArr,
        yearArr,
        all,
        dateAll: dateArr,
        monthAll: monthArr,
        yearAll: yearArr
      });
    } catch (e) {
      j(e);
    }
  });
