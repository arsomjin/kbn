import React from 'react';
import { parser } from 'functions';
import dayjs from 'dayjs';
import { getCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { Numb } from 'functions';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
import { insertArr } from 'functions';
import _ from 'lodash';
import { arrayForEach } from 'functions';
import { checkDoc } from 'firebase/api';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: isMobile ? 'วันที่' : 'วันที่ใบขาย',
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
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'แหล่งที่มา',
    dataIndex: 'sourceOfData',
    align: 'center'
  },
  {
    title: 'พื้นที่',
    dataIndex: 'area',
    align: 'center',
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
    title: isMobile ? 'วันที่' : 'วันที่ใบขาย',
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
    title: 'รวม',
    dataIndex: 'total',
    align: 'center',
    className: 'text-primary'
  }
];

export const getColumns = (type, allBranch, headers) => {
  let result = [];
  switch (type) {
    case 'date':
      result = Object.assign([], columns2, {
        0: {
          title: isMobile ? 'วันที่' : 'วันที่ใบขาย',
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
      result = Object.assign([], columns2, {
        0: {
          title: 'ปี',
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
  if (!!headers) {
    let insertHeaders = headers.map((title, i) => ({
      title,
      dataIndex: `${title}`,
      align: 'center',
      width: 120,
      ellipsis: true,
      render: txt => <div>{numeral(txt).format('0,0')}</div>
    }));
    result = insertArr(result, 5, insertHeaders);
  }
  return allBranch ? result.filter(l => l.dataIndex !== 'branchCode') : result;
};

export const getAreaColumns = headers => {
  let result = [
    {
      title: 'พื้นที่',
      dataIndex: 'area',
      width: 180,
      align: 'center'
    },
    {
      title: 'รวม',
      dataIndex: 'total',
      align: 'center',
      className: 'text-primary'
    }
  ];
  if (!!headers) {
    let insertHeaders = headers.map((title, i) => ({
      title,
      dataIndex: `${title}`,
      align: 'center',
      width: 120,
      ellipsis: true,
      render: txt => <div>{numeral(txt).format('0,0')}</div>
    }));
    result = result.concat(insertHeaders);
  }
  return result;
};

const recheckChannel = chan => {
  switch (chan.toString().trim().toLowerCase()) {
    case 'storefront':
    case 'จากหน้าร้าน':
    case 'หน้าร้าน':
    case 'ลูกค้าเข้ามาหน้าร้าน':
    case 'โทรเข้า':
      return 'หน้าร้าน/Walk in';
    case 'referrer':
    case 'นายหน้า/ญาติแนะนำ':
    case 'ลูกค้าเก่าแนะนำ':
    case 'ลูกค้าเก่า':
      return 'นายหน้า/ลูกค้าเก่าแนะนำ';
    case 'knock door':
    case 'knockdoor':
    case 'พี่ประสิทธิ์เข้าไปหา':
      return 'Knock Door';
    case 'ในงานสาธิตโดรน':
    case 'ออกตลาด':
    case 'การตลาด':
      return 'งานสาธิต';
    case 'fanpage':
      return 'เพจ FB/ไลน์';
    default:
      return chan;
  }
};

export const formatMktChannelsData = snap => {
  if (!snap || Object.keys(snap).length === 0) {
    return [];
  }
  showLog({ snap });
  let result = [];
  Object.keys(snap).map(k => {
    let it = snap[k];
    let channels = it?.sourceOfData || [];
    channels.length > 0 &&
      channels.map(channel => {
        result.push({
          ...it,
          ...(!!channel && { channel: recheckChannel(channel) }),
          month: dayjs(it.date, 'YYYY-MM-DD').format('YYYY-MM'),
          year: dayjs(it.date, 'YYYY-MM-DD').format('YYYY'),
          customerName: `${it.firstName} ${it.lastName}`
        });
        return channel;
      });
    return it;
  });
  return result;
};

export const getArea = arr =>
  new Promise(async (r, j) => {
    try {
      let result = [];
      await arrayForEach(arr, async it => {
        let doc = await checkDoc('data', `sales/customers/${it.customerId}`);
        let area = 'ไม่ระบุ';
        if (!!doc) {
          let address = doc.data()?.address || {};
          area = address?.province
            ? `${
                address.province === 'นครราชสีมา'
                  ? `${address.amphoe} / ${address.tambol}`
                  : `${address.province} / ${address.amphoe}`
              }`
            : 'ไม่ระบุ';
        }
        it.area = area;
        result.push(it);
        return it;
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const initData = {
  yearArr: [],
  monthArr: [],
  dateArr: [],
  all: [],
  dateAll: [],
  monthAll: [],
  yearAll: [],
  headers: []
};

const getFieldsSum = (snap, fields) => {
  let fArr = Object.keys(fields).map(f => f);
  let total = 0;
  Object.keys(snap).map(k => {
    if (fArr.includes(k)) {
      total += Numb(snap[k]);
    }
    return k;
  });
  return total;
};

const formatData = (arr, timeField, headers) => {
  let obj = {};
  let channelFields = {};
  headers.map(l => {
    channelFields[l] = 0;
    return l;
  });

  arr.map(l => {
    const { channel, qty, branchCode } = l;
    if (!obj[l[timeField]]) {
      obj[l[timeField]] = {
        [timeField]: l[timeField],
        ...(timeField === 'date' && { month: l.month, year: l.year }),
        ...(timeField === 'month' && { year: l.year }),
        branchCode,
        ...channelFields,
        [channel]: qty
      };
    } else {
      obj[l[timeField]][channel] = obj[l[timeField]][channel] += qty;
    }
    return l;
  });
  return Object.keys(obj).map((k, i) => ({
    ...obj[k],
    total: getFieldsSum(obj[k], channelFields),
    id: i,
    key: i
  }));
};

export const formatDataByArea = (allData, timeField, headers, filter) => {
  let obj = {};
  let channelFields = {};
  headers.map(l => {
    channelFields[l] = 0;
    return l;
  });
  let arr = distinctArr(allData, [timeField, 'area', 'channel'], ['qty']).map((l, i) => {
    const { year, month, date, branchCode, channel, qty, area } = l;
    return {
      ...(timeField === 'date' && { date }),
      ...(['date', 'month'].includes(timeField) && { month }),
      year,
      branchCode,
      area,
      channel,
      qty
    };
  });
  showLog({ arr });
  arr.map(l => {
    const { channel, qty, branchCode, area } = l;
    if (!obj[`${area}/${l[timeField]}`]) {
      obj[`${area}/${l[timeField]}`] = {
        area,
        [timeField]: l[timeField],
        ...(timeField === 'date' && { month: l.month, year: l.year }),
        ...(timeField === 'month' && { year: l.year }),
        branchCode,
        ...channelFields,
        [channel]: qty
      };
    } else {
      obj[`${area}/${l[timeField]}`][channel] = obj[`${area}/${l[timeField]}`][channel] += qty;
    }
    return l;
  });
  showLog({ obj });
  return Object.keys(obj)
    .map((k, i) => ({
      ...obj[k],
      total: getFieldsSum(obj[k], channelFields),
      id: i,
      key: i
    }))
    .filter(l => l[timeField] === filter);
};

export const getMktChannelsData = branch =>
  new Promise(async (r, j) => {
    try {
      let result = initData;
      let wheres = [['sourceOfData', '!=', null]];
      if (branch !== 'all') {
        wheres = wheres.concat([['branchCode', '==', branch]]);
      }
      const channelData = await getCollection('reports/sales/mktChannels', wheres);
      if (!channelData) {
        return r(result);
      }
      let arr = formatMktChannelsData(channelData);
      // arr = await getArea(arr);
      arr = sortArr(arr, '-date').map((l, i) => ({
        ...l,
        area: l?.province
          ? `${l.province === 'นครราชสีมา' ? `${l.amphoe} / ${l.tambol}` : `${l.province} / ${l.amphoe}`}`
          : 'ไม่ระบุ',
        qty: 1,
        id: i,
        key: i
      }));
      let arrDate = distinctArr(arr, ['date', 'channel'], ['qty']).map((l, i) => {
        const { year, month, date, branchCode, channel, qty } = l;
        return {
          month,
          year,
          date,
          branchCode,
          channel,
          qty
        };
      });
      let arrMonth = distinctArr(arr, ['month', 'channel'], ['qty']).map((l, i) => {
        const { year, month, branchCode, channel, qty } = l;
        return {
          month,
          year,
          branchCode,
          channel,
          qty
        };
      });
      let arrYear = distinctArr(arr, ['year', 'channel'], ['qty']).map((l, i) => {
        const { year, branchCode, channel, qty } = l;
        return { year, branchCode, channel, qty };
      });
      let all = arr;
      let channelHeaders = _.uniq(arrYear.map(l => l.channel));
      const dateArr = formatData(arrDate, 'date', channelHeaders);
      const monthArr = formatData(arrMonth, 'month', channelHeaders);
      const yearArr = formatData(arrYear, 'year', channelHeaders);
      r({
        dateArr,
        monthArr,
        yearArr,
        all,
        dateAll: dateArr,
        monthAll: monthArr,
        yearAll: yearArr,
        headers: channelHeaders
      });
    } catch (e) {
      j(e);
    }
  });
