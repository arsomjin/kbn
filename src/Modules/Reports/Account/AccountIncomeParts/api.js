import React from 'react';
import { arrayForEach } from 'functions';
import numeral from 'numeral';
import moment from 'moment';
import { Numb } from 'functions';
import { distinctArr } from 'functions';
import { getSearchData } from 'firebase/api';
import { getDates } from 'functions';

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
    title: 'สนง.ใหญ่',
    dataIndex: '0450',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
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

const eStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
  font: { bold: true }
};

export const eColumns = columns.map(cl => ({
  title: cl.title,
  dataIndex: cl.dataIndex,
  width: { wpx: cl.width },
  style: eStyle
}));

export const initSnap = branches => {
  let snap = {};
  Object.keys(branches).map(k => {
    snap[k] = null;
    return k;
  });
  return snap;
};

export const formatIncomeSummary = ({ branches, date }) =>
  new Promise(async (r, j) => {
    try {
      let mSnap = initSnap(branches);
      let arr = getDates(date[0], date[1], 'YYYY-MM-DD').map(d => {
        return {
          date: d,
          ...mSnap
        };
      });

      let sArr = await getSearchData('sections/account/incomes', {
        startDate: date[0],
        endDate: date[1],
        incomeCategory: 'daily',
        incomeSubCategory: 'parts'
      });

      let dArr = distinctArr(
        sArr.filter(l => !l.deleted),
        ['date', 'branchCode'],
        ['total']
      );
      await arrayForEach(dArr, it => {
        let idx = arr.findIndex(l => l.date === it.date);
        if (idx > -1) {
          arr[idx][it.branchCode] = it.total;
        }
      });
      let result = arr.map((it, id) => ({
        ...it,
        id,
        key: id,
        total:
          Numb(it['0450']) +
          Numb(it['0451']) +
          Numb(it['0452']) +
          Numb(it['0453']) +
          Numb(it['0454']) +
          Numb(it['0455']) +
          Numb(it['0456'])
      }));

      r(result.filter(l => !!l.total));
    } catch (e) {
      j(e);
    }
  });
