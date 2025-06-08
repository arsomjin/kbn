import React from 'react';
import { parser } from 'functions';
import dayjs from 'dayjs';
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
    title: isMobile ? 'วันที่' : 'วันที่ประเมิน',
    dataIndex: 'assessmentDate',
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
    title: 'ผลการประเมิน',
    dataIndex: 'result',
    align: 'center',
    render: txt => (
      <div className={txt === 'ผ่าน' ? 'text-success' : txt === 'ติด W' ? 'text-warning' : 'text-danger'}>{txt}</div>
    ),
    width: 120,
    ellipsis: true
  },
  {
    title: 'เหตุผล',
    dataIndex: 'assessmentDetails',
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
    title: isMobile ? 'วันที่' : 'วันที่ประเมิน',
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
    title: 'รวม',
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
          title: isMobile ? 'วันที่' : 'วันที่ประเมิน',
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
          title: isMobile ? 'เดือน' : 'เดือนที่ประเมิน',
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
          title: isMobile ? 'ปี' : 'ปีที่ประเมิน',
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

export const formatAssessmentData = snap => {
  if (!snap || Object.keys(snap).length === 0) {
    return snap;
  }
  let assessment = snap?.assessment || {
    date: null,
    details: null,
    result: null
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

  let assessmentDetails = assessment?.details || null;
  if (!!assessment?.date && !assessment.details) {
    // Anomaly.
    assessmentDetails = getDetailFromAnomalyAssessment(assessment);
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
    assessmentDate: assessment?.date || null,
    assessmentMonth: assessment?.date ? dayjs(assessment.date, 'YYYY-MM-DD').format('YYYY-MM') : null,
    assessmentYear: assessment?.date ? dayjs(assessment.date, 'YYYY-MM-DD').format('YYYY') : null,
    assessmentResult: typeof assessment?.result !== 'undefined' ? assessment.result : null,
    assessmentDetails,
    result:
      typeof assessment?.result !== 'undefined'
        ? assessment.result === 'pass'
          ? 'ผ่าน'
          : assessment.result === 'waiting'
            ? 'ติด W'
            : 'ไม่ผ่าน'
        : null
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
        waiting: '0'
      };
    }
    if (result === 'ผ่าน') {
      obj[l[timeField]]['approved'] = numeral(qty).format('0,0');
    } else if (result === 'ติด W') {
      obj[l[timeField]]['waiting'] = numeral(qty).format('0,0');
    } else {
      obj[l[timeField]]['disapproved'] = numeral(qty).format('0,0');
    }
    return l;
  });
  return Object.keys(obj).map((k, i) => ({
    ...obj[k],
    total: numeral(Numb(obj[k].approved) + Numb(obj[k].disapproved) + Numb(obj[k].waiting)).format('0,0'),
    id: i,
    key: i
  }));
};

export const getAssessmentData = branch =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [['assessmentResult', '!=', null]];
      if (branch !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branch]]);
      }
      const assessmentData = await getCollection('reports/sales/assessment', wheres);
      if (!assessmentData) {
        return r(result);
      }
      let arr = Object.keys(assessmentData || {}).map(k => {
        const snap = formatAssessmentData(assessmentData[k]);
        return snap;
      });
      arr = sortArr(arr, '-assessmentDate').map((l, i) => ({
        ...l,
        qty: 1,
        id: i,
        key: i
      }));
      let arrDate = distinctArr(arr, ['assessmentDate', 'result'], ['qty']).map((l, i) => {
        const { assessmentYear, assessmentMonth, assessmentDate, branchCode, result, qty } = l;
        return {
          month: assessmentMonth,
          year: assessmentYear,
          date: assessmentDate,
          branchCode,
          result,
          qty
        };
      });
      let arrMonth = distinctArr(arr, ['assessmentMonth', 'result'], ['qty']).map((l, i) => {
        const { assessmentYear, assessmentMonth, branchCode, result, qty } = l;
        return {
          month: assessmentMonth,
          year: assessmentYear,
          branchCode,
          result,
          qty
        };
      });
      let arrYear = distinctArr(arr, ['assessmentYear', 'result'], ['qty']).map((l, i) => {
        const { assessmentYear, branchCode, result, qty } = l;
        return { year: assessmentYear, branchCode, result, qty };
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
