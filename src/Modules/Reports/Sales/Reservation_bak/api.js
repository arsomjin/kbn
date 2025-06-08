import React from 'react';
import { parser } from 'functions';
import dayjs from 'dayjs';
import { getCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { isMobile } from 'react-device-detect';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: isMobile ? 'วันที่' : 'วันที่จอง',
    dataIndex: 'date',
    align: 'center',
    // defaultSortOrder: 'descend',
    // sorter: (a, b) => parser(a.date) - parser(b.date),
    ellipsis: true
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'เหตุผล',
    dataIndex: 'cancelDetails',
    width: 180
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ellipsis: true
  }
];

const columns2 = [
  {
    title: isMobile ? 'วันที่' : 'วันที่จอง',
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
    title: 'ยอดยกมา',
    dataIndex: 'total',
    align: 'center'
    // className: 'text-primary',
  },
  {
    title: 'ประเมินไม่ผ่าน',
    dataIndex: 'total',
    align: 'center',
    className: 'text-danger'
  },
  {
    title: 'ยกเลิกการจอง',
    dataIndex: 'total',
    align: 'center',
    className: 'text-warning'
  },
  {
    title: 'รวมจอง',
    dataIndex: 'total',
    align: 'center',
    className: 'text-primary'
  }
];

export const getColumns = (type, allBranch) => {
  let result = [];
  switch (type) {
    case 'date':
      result = Object.assign([], columns2, {
        0: {
          title: isMobile ? 'วันที่' : 'วันที่จอง',
          dataIndex: 'date',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.date) - parser(b.date),
          ellipsis: true
        }
      });
      break;
    case 'month':
      result = Object.assign([], columns2, {
        0: {
          title: isMobile ? 'เดือน' : 'เดือนที่จอง',
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
      result = Object.assign([], columns2, {
        0: {
          title: isMobile ? 'ปี' : 'ปีที่จอง',
          dataIndex: 'year',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.year) - parser(b.year),
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

const getDetailFromAnomalyCancellation = cancel => {
  if (!cancel || typeof cancel !== 'object') {
    return null;
  }
  let result = null;
  Object.keys(cancel).map(k => {
    if (!['by', 'date', 'reason', 'editedBy'].includes(k)) {
      result = cancel[k];
    }
    return k;
  });
  return result;
};

export const formatCancellationData = snap => {
  if (!snap || Object.keys(snap).length === 0) {
    return snap;
  }
  let cancel = snap?.cancel || {
    date: null,
    details: null,
    by: null
  };
  const {
    bookId,
    bookNo,
    bookNo_lower,
    bookNo_partial,
    bookingPerson,
    branchCode,
    customerId,
    prefix,
    firstName,
    firstName_lower,
    firstName_partial,
    lastName,
    phoneNumber,
    items,
    saleType,
    salesPerson,
    sourceOfData
  } = snap;

  let cancelDetails = cancel?.details || null;
  if (!!cancel?.date && !cancel.details) {
    // Anomaly.
    cancelDetails = getDetailFromAnomalyCancellation(cancel);
  }

  let date = cancel?.date || snap.date;
  // let date = cancel?.date || null;

  let doc = {
    bookId,
    bookNo,
    bookNo_lower,
    bookNo_partial,
    bookingPerson,
    branchCode,
    customerId,
    prefix,
    firstName,
    firstName_lower,
    firstName_partial,
    lastName,
    phoneNumber,
    customerName: `${firstName} ${lastName}`,
    items,
    saleType,
    salesPerson,
    sourceOfData,
    date,
    cancelMonth: date ? dayjs(date, 'YYYY-MM-DD').format('YYYY-MM') : null,
    cancelYear: date ? dayjs(date, 'YYYY-MM-DD').format('YYYY') : null,
    cancelDetails,
    cancelBy: cancel?.by || null
  };
  return doc;
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

const formatData = (arr, timeField) => {
  let obj = {};
  arr.map(l => {
    const { branchCode, qty } = l;
    if (!obj[l[timeField]]) {
      obj[l[timeField]] = {
        [timeField]: l[timeField],
        ...(timeField === 'date' && { month: l.month, year: l.year }),
        ...(timeField === 'month' && { year: l.year }),
        branchCode,
        qty: numeral(qty).format('0,0')
      };
    }
    return l;
  });
  return Object.keys(obj).map((k, i) => ({
    ...obj[k],
    total: obj[k].qty,
    id: i,
    key: i
  }));
};

export const getCancellationData = branch =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [['canceled', '!=', null]];
      if (branch !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branch]]);
      }
      const cancelData = await getCollection('sections/sales/bookings', wheres);
      if (!cancelData) {
        return r(result);
      }
      let arr = Object.keys(cancelData || {}).map(k => {
        const snap = formatCancellationData(cancelData[k]);
        return snap;
      });
      arr = sortArr(arr, '-date').map((l, i) => ({
        ...l,
        qty: 1,
        id: i,
        key: i
      }));
      let arrDate = distinctArr(arr, ['date'], ['qty']).map((l, i) => {
        const { cancelYear, cancelMonth, date, branchCode, qty } = l;
        return {
          month: cancelMonth,
          year: cancelYear,
          date: date,
          branchCode,
          qty
        };
      });
      let arrMonth = distinctArr(arr, ['cancelMonth'], ['qty']).map((l, i) => {
        const { cancelYear, cancelMonth, branchCode, qty } = l;
        return {
          month: cancelMonth,
          year: cancelYear,
          branchCode,
          qty
        };
      });
      let arrYear = distinctArr(arr, ['cancelYear'], ['qty']).map((l, i) => {
        const { cancelYear, branchCode, qty } = l;
        return { year: cancelYear, branchCode, qty };
      });
      let all = arr;
      const dateArr = formatData(arrDate, 'date');
      const monthArr = formatData(arrMonth, 'month');
      const yearArr = formatData(arrYear, 'year');
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
