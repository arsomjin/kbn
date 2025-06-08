import React from 'react';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { Numb } from 'functions';
import { sortArr } from 'functions';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'ช่างบริการ',
    dataIndex: 'technicianId',
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...(!isMobile && { fixed: 'left' })
  },
  {
    title: 'จำนวนคัน',
    dataIndex: 'count',
    width: 90,
    align: 'center',
    render: text => <div className="text-muted">{numeral(text).format('0,0')}</div>
  },
  {
    title: 'อะไหล่',
    dataIndex: 'part',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'น้ำมัน',
    dataIndex: 'oil',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ค่าแรง',
    dataIndex: 'wage',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'ค่าระยะ',
    dataIndex: 'distance',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'อื่นๆ',
    dataIndex: 'other',
    width: 120,
    align: 'center',
    render: text => <div>{numeral(text).format('0,0.00')}</div>
  },
  {
    title: 'รวม',
    dataIndex: 'amtTech',
    width: 120,
    align: 'center',
    render: text => <div className="text-success">{numeral(text).format('0,0.00')}</div>
  }
];

export const serviceMechanicSumKeys = () => {
  return ['count', ...sum_fields, 'amtTech'];
};

const sum_fields = ['part', 'oil', 'wage', 'distance', 'other'];

export const formatServiceMechanic = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let arr = [];
      dataArr.map(it => {
        let part = Numb(it.amtPart);
        let oil = Numb(it.amtOil);
        let wage = Numb(it.amtWage);
        let distance = Numb(it.amtDistance);
        let other = Numb(it.amtOther);
        let month = dayjs(it.recordedDate, 'YYYY-MM-DD').format('M');
        if (!!it?.technicianId && Array.isArray(it.technicianId) && it.technicianId.length > 0) {
          let techArr = it.technicianId.filter(l => !!l).map(it => it.trim());
          techArr.map(technician => {
            let divider = techArr.length;
            arr.push({
              branchCode: it.branchCode,
              part: part / divider,
              oil: oil / divider,
              wage: wage / divider,
              distance: distance / divider,
              other: other / divider,
              month,
              technicianId: [technician],
              technician,
              amtTech: (part + oil + wage + distance + other) / divider,
              count: 1
            });
            return technician;
          });
        }
        return it;
      });
      let dArr = distinctArr(arr, ['technician', 'branchCode'], ['count', ...sum_fields, 'amtTech']);
      let sArr = sortArr(dArr, '-amtTech').map((it, id) => ({
        ...it,
        id,
        key: id
      }));
      r(sArr);
    } catch (e) {
      j(e);
    }
  });
