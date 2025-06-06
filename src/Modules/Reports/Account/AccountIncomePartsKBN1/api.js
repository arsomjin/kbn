import React from 'react';
import { arrayForEach } from 'functions';
import numeral from 'numeral';
import moment from 'moment';
import { Numb } from 'functions';
import { distinctArr } from 'functions';
import { daysInMonth } from 'functions';
import { getSearchData } from 'firebase/api';

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
    width: 100
  },
  {
    title: 'สนง.ใหญ่',
    children: [
      {
        title: 'ท่อไอเสีย',
        dataIndex: '0450amtIntake',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'เครื่องวัดขนาดแปลง',
        dataIndex: '0450amtFieldMeter',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'แบตเตอรี่',
        dataIndex: '0450amtBattery',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'ยาง',
        dataIndex: '0450amtTyre',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'GPS',
        dataIndex: '0450amtGPS',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'อื่นๆ',
        dataIndex: '0450amtOther',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        dataIndex: '0450total',
        width: 100,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      }
    ]
  },
  {
    title: 'โคกกรวด',
    dataIndex: '0454',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'หนองบุญมาก',
    dataIndex: '0455',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'จักราช',
    dataIndex: '0452',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'สีดา',
    dataIndex: '0453',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ขามสะแกแสง',
    dataIndex: '0456',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'บัวใหญ่',
    dataIndex: '0451',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'รวม',
    dataIndex: 'total',
    width: 150,
    align: 'right',
    render: text => {
      return !text ? null : <div className="text-primary">{numeral(text).format('0,0.00')}</div>;
    }
  }
];

export const initSnap = branches => {
  let snap = {};
  Object.keys(branches).map(k => {
    snap[`${k}amtIntake`] = null;
    snap[`${k}amtFieldMeter`] = null;
    snap[`${k}amtBattery`] = null;
    snap[`${k}amtTyre`] = null;
    snap[`${k}amtGPS`] = null;
    snap[`${k}amtOther`] = null;
    snap[`${k}total`] = null;
    return k;
  });
  return snap;
};

export const formatIncomeSummary = ({ branches, month }) =>
  new Promise(async (r, j) => {
    try {
      let mSnap = initSnap(branches);
      const mth = month.slice(-2);
      const year = month.substr(0, 4);
      let arr = [...Array(daysInMonth(month)).keys()].map(d => {
        let dd = `0${d + 1}`.slice(-2);
        return {
          date: `${year}-${mth}-${dd}`,
          ...mSnap
        };
      });
      let sArr = await getSearchData('sections/account/incomes', {
        month,
        incomeCategory: 'daily',
        incomeSubCategory: 'parts',
        incomeType: 'partKBN'
      });

      let dArr = distinctArr(
        sArr,
        ['date', 'branchCode'],
        ['total', 'amtIntake', 'amtFieldMeter', 'amtBattery', 'amtTyre', 'amtGPS', 'amtOther']
      );
      await arrayForEach(dArr, it => {
        let idx = arr.findIndex(l => l.date === it.date);
        if (idx > -1) {
          arr[idx][`${it.branchCode}amtIntake`] = it.amtIntake;
          arr[idx][`${it.branchCode}amtFieldMeter`] = it.amtFieldMeter;
          arr[idx][`${it.branchCode}amtBattery`] = it.amtBattery;
          arr[idx][`${it.branchCode}amtTyre`] = it.amtTyre;
          arr[idx][`${it.branchCode}amtGPS`] = it.amtGPS;
          arr[idx][`${it.branchCode}amtOther`] = it.amtOther;
          arr[idx][`${it.branchCode}total`] =
            Numb(it['amtIntake']) +
            Numb(it['amtFieldMeter']) +
            Numb(it['amtBattery']) +
            Numb(it['amtTyre']) +
            Numb(it['amtGPS']) +
            Numb(it['amtOther']);
        }
      });
      let result = arr.map((it, id) => ({
        ...it,
        id,
        key: id,
        total:
          Numb(it['0450total']) +
          Numb(it['0451total']) +
          Numb(it['0452total']) +
          Numb(it['0453total']) +
          Numb(it['0454total']) +
          Numb(it['0455total']) +
          Numb(it['0456total'])
      }));

      r(result.filter(l => !!l.total));
    } catch (e) {
      j(e);
    }
  });
