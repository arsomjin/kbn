import React from 'react';
import { getCollection } from 'firebase/api';
import { distinctArr } from 'functions';
import { uniq } from 'lodash';
import moment from 'moment-timezone';
import numeral from 'numeral';
import { parser } from 'functions';
import { isMobile } from 'react-device-detect';
import { getModelFromName } from 'Modules/Utils';

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

export const formatBookingData = (snap, typeSnap) => {
  if (!snap || Object.keys(snap).length === 0) {
    return [];
  }

  let result = [];
  const { date, itemType, branchCode, saleType } = snap;

  const itemSnap = { ...typeSnap };
  itemType.forEach(type => {
    if (type.startsWith('รถแทร')) {
      result.push({
        ...itemSnap,
        date,
        รถแทรกเตอร์: 1,
        branchCode,
        saleType
      });
    } else if (type.startsWith('อุปกร')) {
      result.push({
        ...itemSnap,
        date,
        อุปกรณ์: 1,
        branchCode,
        saleType
      });
    } else {
      result.push({
        ...itemSnap,
        date,
        [type]: 1,
        branchCode,
        saleType
      });
    }
  });

  // showLog({ result });
  return result;
};

export const getCancelledData = ({ branchCode, saleType }) =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [['canceled', '==', null]];
      if (branchCode !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branchCode]]);
      }
      if (saleType !== 'all') {
        wheres = wheres.concat([['saleType', '==', saleType]]);
      }
      const bookingData = await getCollection('sections/sales/bookings', wheres);
      if (!bookingData) {
        return r(result);
      }
      let arrType = [];
      let bookingArr = Object.keys(bookingData || {}).map(k => {
        let doc = bookingData[k];
        let itemType = !!doc?.items ? uniq(doc.items.map(it => it.vehicleType)).filter(l => !!l) : [];
        return { ...doc, itemType };
      });

      distinctArr(bookingArr, ['itemType'])
        .map(l => l.itemType)
        .map(it => {
          arrType = [...arrType, ...it];
          return it;
        });
      arrType = arrType.map(l => {
        if (['รถแทรคเตอร์', 'รถแทรกเตอร์'].includes(l)) {
          return 'รถแทรกเตอร์';
        }
        if (['อุปกรณ์', 'อุปกรณ์ต่อพ่วง'].includes(l)) {
          return 'อุปกรณ์';
        }
        return l;
      });
      arrType = uniq(arrType);
      if (arrType.includes('อื่นๆ')) {
        // Move to end.
        arrType = [...arrType.filter(l => l !== 'อื่นๆ'), ...arrType.filter(l => l === 'อื่นๆ')];
      }
      let typeSnap = {};
      arrType.map(k => {
        typeSnap[k] = null;
        return k;
      });

      let fArr = [];
      let arr = bookingArr.map(it => {
        const nArr = formatBookingData(it, typeSnap);
        fArr = [...fArr, ...nArr];
        return it;
      });
      let dateDistincts = ['date', 'branchCode', 'saleType'];
      let dArr = distinctArr(fArr, dateDistincts, arrType);
      let dateArr = dArr
        .map((l, i) => ({
          ...l,
          month: l?.date ? moment(l.date, 'YYYY-MM-DD').format('YYYY-MM') : null,
          year: l?.date ? moment(l.date, 'YYYY-MM-DD').format('YYYY') : null,
          id: i,
          key: i
        }))
        .filter(l => !!l.date);

      let monthDistincts = ['month', 'branchCode', 'saleType'];

      let monthArr = distinctArr(dateArr, monthDistincts, arrType)
        .map((l, i) => {
          let mIt = { ...l, id: i, key: i };
          delete mIt.date;
          return mIt;
        })
        .filter(l => !!l.month);

      let yearDistincts = ['year', 'branchCode', 'saleType'];
      let yearArr = distinctArr(dateArr, yearDistincts, arrType)
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

export const getColumns2 = arrType => [
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
    title: 'จำนวน',
    children: arrType.map(title => ({
      title,
      dataIndex: title,
      align: 'center',
      width: 120,
      className: 'text-danger',
      render: text => <div>{numeral(text).format('0,0')}</div>,
      ellipsis: true
    })),
    align: 'center',
    className: 'text-danger'
  }
];

export const getColumns = (type, allBranch, arrType) => {
  let result = [];
  switch (type) {
    case 'date':
      result = Object.assign([], getColumns2(arrType), {
        0: {
          title: 'ว/ด/ป',
          dataIndex: 'date',
          align: 'center',
          ellipsis: true,
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.date) - parser(b.date)
        }
      });
      break;
    case 'month':
      result = Object.assign([], getColumns2(arrType), {
        0: {
          title: 'เดือน',
          dataIndex: 'month',
          align: 'center',
          render: txt => <div>{moment(txt, 'YYYY-MM').format(isMobile ? 'MMM YY' : 'MMMM YYYY')}</div>,
          defaultSortOrder: 'descend',
          sorter: (a, b) => parser(a.month) - parser(b.month),
          ellipsis: true,
          width: 130
        }
      });
      break;
    case 'year':
      result = Object.assign([], getColumns2(arrType), {
        0: {
          title: 'ปี',
          dataIndex: 'year',
          align: 'center',
          ellipsis: true,
          width: 120,
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.year - b.year
        }
      });
      break;
    default:
      break;
  }

  return result;
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่รับจอง',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center'
  },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    align: 'center'
  },
  {
    title: 'ประเภท',
    dataIndex: 'itemType',
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    // ellipsis: true,
    render: (_, rec) => {
      let model = '';
      if (!!rec.items) {
        rec.items.map(l => {
          model = `${model} ${getModelFromName(l.productName)}`.trim();
          return l;
        });
      }
      return <div>{model}</div>;
    },
    width: 160,
    align: 'center'
  },
  {
    title: 'จำนวนเงินจอง',
    dataIndex: 'amtReceived'
  },
  // {
  //   title: 'ยอดเต็ม',
  //   dataIndex: 'amtFull',
  // },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  }
];
