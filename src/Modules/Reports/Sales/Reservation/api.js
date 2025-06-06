import React from 'react';
import { parser } from 'functions';
import moment from 'moment-timezone';
import { getCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { Numb } from 'functions';
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
    title: 'ผลการจอง',
    dataIndex: 'result',
    align: 'center',
    render: txt => (
      <div
        className={
          txt === 'ยกเลิก'
            ? 'text-danger'
            : txt === 'ผ่าน'
              ? 'text-success'
              : txt === 'ติด W'
                ? 'text-warning'
                : txt === 'ไม่ผ่าน'
                  ? 'text-danger'
                  : undefined
        }
      >
        {txt}
      </div>
    ),
    width: 120,
    ellipsis: true
  },
  {
    title: 'เหตุผล',
    dataIndex: 'resultDetails',
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
    title: 'ยอดจอง',
    dataIndex: 'total',
    align: 'center',
    width: 100,
    className: 'text-primary',
    render: txt => <div>{numeral(txt).format('0,0')}</div>
  },
  {
    title: 'ผ่าน',
    dataIndex: 'approved',
    align: 'center',
    width: 100,
    className: 'text-success'
  },
  {
    title: 'ไม่ผ่าน',
    dataIndex: 'disapproved',
    align: 'center',
    width: 100,
    className: 'text-danger'
  },
  {
    title: 'ติด W',
    dataIndex: 'waiting',
    align: 'center',
    width: 100,
    className: 'text-warning'
  },
  {
    title: 'ยกเลิก',
    dataIndex: 'canceled',
    align: 'center',
    width: 100,
    className: 'text-danger'
  },
  {
    title: 'คงเหลือ',
    dataIndex: 'notAssigned',
    align: 'center',
    width: 100
    // className: 'text-primary',
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
          render: txt => <div>{moment(txt, 'YYYY-MM').format(isMobile ? 'MMM YY' : 'MMMM YYYY')}</div>,
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

const getDetailFromAnomalyAssessment = assessment => {
  if (!assessment || typeof assessment !== 'object') {
    return null;
  }
  let result = null;
  Object.keys(assessment).map(k => {
    if (!['result', 'date', 'reason', 'editedBy'].includes(k)) {
      result = assessment[k];
    }
    return k;
  });
  return result;
};

export const formatReservationData = snap => {
  if (!snap || Object.keys(snap).length === 0) {
    return snap;
  }
  let assessment = snap?.assessment || {
    date: null,
    details: null,
    result: null
  };
  const {
    date,
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
    sourceOfData,
    canceled
  } = snap;

  let resultDetails = canceled?.details || null;
  if (!!assessment?.date) {
    resultDetails = assessment?.details || null;
    if (!assessment.details) {
      // Anomaly.
      resultDetails = getDetailFromAnomalyAssessment(assessment);
    }
  }

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
    resMonth: date ? moment(date, 'YYYY-MM-DD').format('YYYY-MM') : null,
    resYear: date ? moment(date, 'YYYY-MM-DD').format('YYYY') : null,
    assessmentResult: typeof assessment?.result !== 'undefined' ? assessment.result : null,
    resultDetails,
    result: !!canceled
      ? 'ยกเลิก'
      : typeof assessment?.result !== 'undefined'
        ? assessment.result === 'pass'
          ? 'ผ่าน'
          : assessment.result === 'waiting'
            ? 'ติด W'
            : assessment.result === 'notPass'
              ? 'ไม่ผ่าน'
              : 'ไม่ระบุ'
        : 'ไม่ระบุ',
    canceled
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
    const { branchCode, result, qty } = l;
    if (!obj[l[timeField]]) {
      obj[l[timeField]] = {
        [timeField]: l[timeField],
        ...(timeField === 'date' && { month: l.month, year: l.year }),
        ...(timeField === 'month' && { year: l.year }),
        branchCode,
        approved: '0',
        disapproved: '0',
        waiting: '0',
        canceled: '0',
        qty
      };
    }
    if (result === 'ผ่าน') {
      obj[l[timeField]]['approved'] = numeral(qty).format('0,0');
    } else if (result === 'ติด W') {
      obj[l[timeField]]['waiting'] = numeral(qty).format('0,0');
    } else if (result === 'ไม่ผ่าน') {
      obj[l[timeField]]['disapproved'] = numeral(qty).format('0,0');
    } else if (result === 'ยกเลิก') {
      obj[l[timeField]]['canceled'] = numeral(qty).format('0,0');
    } else if (result === 'ไม่ระบุ') {
      obj[l[timeField]]['notAssigned'] = numeral(qty).format('0,0');
    }
    return l;
  });
  return Object.keys(obj).map((k, i) => ({
    ...obj[k],
    total: numeral(
      Numb(obj[k].approved) +
        Numb(obj[k].disapproved) +
        Numb(obj[k].waiting) +
        Numb(obj[k].canceled) +
        Numb(obj[k].notAssigned)
    ).format('0,0'),
    id: i,
    key: i
  }));
};

export const getReservationData = branch =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [];
      if (branch !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branch]]);
      }
      const resData = await getCollection('sections/sales/bookings', wheres);
      if (!resData) {
        return r(result);
      }

      let arr = Object.keys(resData || {}).map(k => {
        const snap = formatReservationData(resData[k]);
        return snap;
      });
      arr = sortArr(arr, '-date').map((l, i) => ({
        ...l,
        qty: 1,
        id: i,
        key: i
      }));
      let arrDate = distinctArr(arr, ['date', 'result'], ['qty']).map((l, i) => {
        const { resYear, resMonth, date, branchCode, result, qty } = l;
        return {
          month: resMonth,
          year: resYear,
          date: date,
          branchCode,
          result,
          qty
        };
      });
      let arrMonth = distinctArr(arr, ['resMonth', 'result'], ['qty']).map((l, i) => {
        const { resYear, resMonth, branchCode, result, qty } = l;
        return {
          month: resMonth,
          year: resYear,
          branchCode,
          result,
          qty
        };
      });
      let arrYear = distinctArr(arr, ['resYear', 'result'], ['qty']).map((l, i) => {
        const { resYear, branchCode, result, qty } = l;
        return { year: resYear, branchCode, result, qty };
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
