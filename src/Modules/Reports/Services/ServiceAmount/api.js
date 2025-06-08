import React from 'react';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { VehicleGroup } from 'data/Constant';

export const columns = [
  {
    title: 'เดือน',
    dataIndex: 'month',
    width: 120,
    render: text => <div className="text-primary">{dayjs(text, 'M').local().format('MMMM')}</div>,
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'จำนวนคัน',
    dataIndex: 'count',
    width: 90,
    align: 'center',
    render: text => <div className="text-muted">{numeral(text).format('0,0')}</div>
  },
  {
    title: 'อะไหล่แทรกเตอร์',
    dataIndex: 'part_tracktor',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'อะไหล่รถเกี่ยว',
    dataIndex: 'part_harvester',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'อะไหล่รถขุด',
    dataIndex: 'part_excavator',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'อะไหล่รถดำนา',
    dataIndex: 'part_ricePlanter',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'น้ำมัน',
    dataIndex: 'oil',
    width: 90,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ค่าแรง',
    dataIndex: 'wage',
    width: 90,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ค่าขนส่ง',
    dataIndex: 'freight',
    width: 90,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'อื่นๆ',
    dataIndex: 'other',
    width: 90,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  }
];

export const serviceTypeSumKeys = () => {
  return ['count', ...sum_fields];
};

const sum_fields = [
  'part_tracktor',
  'part_harvester',
  'part_excavator',
  'part_ricePlanter',
  'oil',
  'wage',
  'freight',
  'other'
];

const initSnap = () => {
  let iSnap = {};
  sum_fields.map(fld => {
    iSnap[fld] = null;
    return fld;
  });
  return iSnap;
};

export const formatServiceType = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let snap = {};
      [...Array(12).keys()].map(num => {
        snap[num + 1] = {
          month: `${num + 1}`,
          ...initSnap()
        };
        return num;
      });
      let arr = dataArr.map(it => {
        let part_tracktor = null;
        let part_harvester = null;
        let part_excavator = null;
        let part_ricePlanter = null;
        let oil = it.amtOil;
        let wage = it.amtWage;
        let freight = it.amtFreight;
        let other = it.amtOther;
        let month = dayjs(it.recordedDate, 'YYYY-MM-DD').format('M');
        if (it.vehicleType.search(VehicleGroup.tracktor.keyword) > -1) {
          part_tracktor = it.amtPart;
        } else if (it.vehicleType.search(VehicleGroup.harvester.keyword) > -1) {
          part_harvester = it.amtPart;
        } else if (it.vehicleType.search(VehicleGroup.excavator.keyword) > -1) {
          part_excavator = it.amtPart;
        } else if (it.vehicleType.search(VehicleGroup.ricePlanter.keyword) > -1) {
          part_ricePlanter = it.amtPart;
        }

        return {
          // ...it,
          month,
          // serviceTitle,
          part_tracktor,
          part_harvester,
          part_excavator,
          part_ricePlanter,
          oil,
          wage,
          freight,
          other,
          count: 1
        };
      });
      let dArr = distinctArr(arr, ['month'], [...sum_fields, 'count']);
      let fArr = Object.keys(snap).map(k => {
        let mSnap = dArr.find(l => l.month === k);
        // delete mSnap.serviceTitle;
        return { ...snap[k], ...mSnap };
      });
      let result = fArr.map((it, id) => ({ ...it, id, key: id }));
      r(result);
    } catch (e) {
      j(e);
    }
  });
