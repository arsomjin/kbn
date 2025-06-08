import React from 'react';
import { parser } from 'functions';
import dayjs from 'dayjs';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
import { getCollection } from 'firebase/api';
import { uniq } from 'lodash';

const getColumns2 = (type, arrType) => [
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.date) - parser(b.date),
    ellipsis: true
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ellipsis: true,
    defaultSortOrder: 'ascend',
    sorter: (a, b) => parser(a.branchCode) - parser(b.branchCode)
  },
  {
    title: 'ประเภท',
    dataIndex: 'saleType',
    align: 'center',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.saleType - b.saleType,
    ellipsis: true
  },
  {
    title: 'จำนวนตัดขาย',
    children: arrType
      .filter(l => l.search('scd') > -1 && !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l))
      .map(title => ({
        title: title.startsWith('โดรน') ? 'โดรน' : title.slice(0, -4),
        dataIndex: title,
        align: 'center',
        width: 100,
        className: 'text-warning',
        render: text => <div>{numeral(text).format('0,0')}</div>,
        ellipsis: true
      })),
    align: 'center',
    className: 'text-warning'
  },
  {
    title: 'จำนวนส่งสัญญา',
    children: arrType
      .filter(l => l.search('cdd') > -1 && !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l))
      .map(title => ({
        title: title.startsWith('โดรน') ? 'โดรน' : title.slice(0, -4),
        dataIndex: title,
        align: 'center',
        width: 100,
        className: 'text-primary',
        render: text => <div>{numeral(text).format('0,0')}</div>,
        ellipsis: true
      })),
    align: 'center',
    className: 'text-primary'
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

export const getColumns = (type, allBranch, arrType) => {
  let result = [];
  switch (type) {
    case 'date':
      result = Object.assign([], getColumns2('sklLeasing', arrType), {
        0: {
          title: 'ว/ด/ป',
          dataIndex: 'date',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.date) - parser(b.date),
          ellipsis: true
        }
      });
      break;
    case 'month':
      result = Object.assign([], getColumns2('sklLeasing', arrType), {
        0: {
          title: 'เดือน',
          dataIndex: 'month',
          align: 'center',
          render: txt => <div>{dayjs(txt, 'YYYY-MM').format(isMobile ? 'MMM YY' : 'MMMM YYYY')}</div>,
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.month) - parser(b.month),
          ellipsis: true,
          width: 120
        }
      });
      break;
    case 'year':
      result = Object.assign([], getColumns2('sklLeasing', arrType), {
        0: {
          title: 'ปี',
          dataIndex: 'year',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.year - b.year,
          ellipsis: true,
          width: 120
        }
      });
      break;
    default:
      break;
  }
  return result;
};

export const sumKeys = ['amtSaleCutoff', 'amtContractDeliver', 'amtSKLReceive', 'taxInvoiceCount'];

export const formatCreditData = (snap, typeSnap) => {
  let result = [];
  if (!snap || Object.keys(snap).length === 0) {
    return [];
  }
  showLog({ snap });
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
    date,
    itemType,
    branchCode
  } = snap;

  const initSnap = {};
  const itemSnap = { ...typeSnap };
  sumKeys.map(k => {
    initSnap[k] = null;
    return k;
  });

  if (!!saleCutoffDate) {
    itemType.map(k => {
      itemSnap[`${k}_scd`] = 1;
      return k;
    });
    result.push({
      ...initSnap,
      ...itemSnap,
      date: saleCutoffDate,
      amtSaleCutoff: 1,
      branchCode,
      saleType
    });
  }
  if (!!contractDeliverDate) {
    itemType.map(k => {
      itemSnap[`${k}_cdd`] = 1;
      return k;
    });
    result.push({
      ...initSnap,
      ...itemSnap,
      date: contractDeliverDate,
      amtContractDeliver: 1,
      branchCode,
      saleType
    });
  }
  if (!!contractAmtReceivedDate) {
    result.push({
      ...initSnap,
      ...typeSnap,
      date: contractAmtReceivedDate,
      amtSKLReceive: netTotal,
      branchCode,
      saleType
    });
  }
  if (!!taxInvoiceDate) {
    result.push({
      ...initSnap,
      ...typeSnap,
      date: taxInvoiceDate,
      taxInvoiceCount: 1,
      branchCode,
      saleType
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
  yearAll: [],
  arrType: []
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
      let arrType = [];
      distinctArr(
        Object.keys(creditData || {}).map(k => creditData[k]),
        ['itemType']
      )
        .map(l => l.itemType)
        .map(it => {
          arrType = [...arrType, ...it];
          return it;
        });
      const typeSnap = {};
      arrType = uniq(arrType);
      arrType = [...arrType, ...arrType.map(l => `${l}_scd`), ...arrType.map(l => `${l}_cdd`)];
      arrType.map(k => {
        typeSnap[k] = null;
        return k;
      });
      // showLog({ arrType, typeSnap });
      let fArr = [];
      let arr = Object.keys(creditData || {}).map(k => {
        const nArr = formatCreditData(creditData[k], typeSnap);
        fArr = [...fArr, ...nArr];
        return k;
      });
      let dateDistincts = ['date', 'branchCode', 'saleType'];
      let dArr = distinctArr(fArr, dateDistincts, [...sumKeys, ...arrType]);
      let dateArr = dArr
        .map((l, i) => ({
          ...l,
          month: l?.date ? dayjs(l.date, 'YYYY-MM-DD').format('YYYY-MM') : null,
          year: l?.date ? dayjs(l.date, 'YYYY-MM-DD').format('YYYY') : null,
          id: i,
          key: i
        }))
        .filter(l => !!l.date);
      let monthDistincts = ['month', 'branchCode', 'saleType'];

      let monthArr = distinctArr(dateArr, monthDistincts, [...sumKeys, ...arrType])
        .map((l, i) => {
          let mIt = { ...l, id: i, key: i };
          delete mIt.date;
          return mIt;
        })
        .filter(l => !!l.month);

      let yearDistincts = ['year', 'branchCode', 'saleType'];
      let yearArr = distinctArr(dateArr, yearDistincts, [...sumKeys, ...arrType])
        .map((l, i) => {
          let mIt = { ...l, id: i, key: i };
          delete mIt.date;
          delete mIt.month;
          return mIt;
        })
        .filter(l => !!l.year);

      let all = arr;
      r({
        dateArr,
        monthArr,
        yearArr,
        all,
        dateAll: dateArr,
        monthAll: monthArr,
        yearAll: yearArr,
        arrType
      });
    } catch (e) {
      j(e);
    }
  });
