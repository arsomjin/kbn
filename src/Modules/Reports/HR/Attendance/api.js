import React from 'react';
import { createArrOfLength } from 'functions';
import moment from 'moment-timezone';
import { distinctArr } from 'functions';
import { isMobile } from 'react-device-detect';
import { Numb } from 'functions';

const getSubColumns = col => {
  return [
    {
      title: 'ลาป่วย (วัน)',
      dataIndex: `${col}-sick`,
      width: 66,
      align: 'center',
      className: col === 'total' ? 'text-primary' : 'text-muted',
      render: text => <div>{!!text ? text : null}</div>
    },
    {
      title: 'ลากิจ (วัน)',
      dataIndex: `${col}-biz`,
      width: 66,
      align: 'center',
      className: col === 'total' ? 'text-primary' : 'text-muted',
      render: text => <div>{!!text ? text : null}</div>
    },
    {
      title: 'มาสาย (วัน)',
      dataIndex: `${col}-late`,
      width: 66,
      align: 'center',
      className: col === 'total' ? 'text-primary' : 'text-muted',
      render: text => <div>{!!text ? text : null}</div>
    },
    {
      title: 'มาสาย (นาที)',
      dataIndex: `${col}-late-min`,
      width: 66,
      align: 'center',
      className: col === 'total' ? 'text-primary' : 'text-muted',
      render: text => <div>{!!text ? text : null}</div>
    },
    {
      title: 'ขาดงาน (วัน)',
      dataIndex: `${col}-absent`,
      width: 66,
      align: 'center',
      className: col === 'total' ? 'text-primary' : 'text-muted',
      render: text => <div>{!!text ? text : null}</div>
    },
    {
      title: 'รวม (วัน)',
      dataIndex: `${col}-total`,
      width: 66,
      align: 'center',
      ...(col === 'total' && { className: 'text-primary' }),
      render: text => <div>{!!text ? text : null}</div>
    }
  ];
};

export const getColumns = (yr, data) => {
  let mIdx = createArrOfLength(12).map(it => ({
    title: moment().month(it).locale('th').format('MMMM'),
    width: 100,
    align: 'center',
    children: getSubColumns(`${yr}-M${it}`)
  }));

  return [
    {
      title: '#',
      dataIndex: 'id',
      fixed: 'left',
      align: 'center'
    },
    {
      title: 'ชื่อ',
      dataIndex: 'employeeCode',
      width: isMobile ? 130 : 200,
      // align: 'center',
      fixed: 'left'
    },
    {
      title: 'สาขา',
      dataIndex: 'affiliate',
      align: 'center',
      width: 110,
      filters: distinctArr(data, ['affiliate']).map(it => ({
        value: it.affiliate,
        text: it.affiliate
      })),
      onFilter: (value, record) => record.affiliate === value
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      width: 150,
      align: 'center',
      ellipsis: true
    },
    ...mIdx,
    {
      title: 'รวม',
      dataIndex: 'count',
      width: 80,
      align: 'center',
      children: getSubColumns('total'),
      className: 'text-primary'
    }
  ];
};

export const attendanceSumKeys = () => {
  //   let iKeys = createArrOfLength(12).map((it) => `M${it}`);
  let iKeys = Object.keys(createInitSnap()).map(k => k);
  return iKeys;
  //   return [...iKeys, 'count'];
};

export const createInitSnap = () => {
  let mKeys = {};
  let yr = moment().format('YYYY');

  createArrOfLength(12).map(it => {
    mKeys[`${yr}-M${it}-sick`] = null;
    mKeys[`${yr}-M${it}-biz`] = null;
    mKeys[`${yr}-M${it}-late`] = null;
    mKeys[`${yr}-M${it}-late-min`] = null;
    mKeys[`${yr}-M${it}-absent`] = null;
    mKeys[`${yr}-M${it}-total`] = null;
    return it;
  });

  return {
    ...mKeys,
    'total-sick': null,
    'total-biz': null,
    'total-late': null,
    'total-late-min': null,
    'total-absent': null,
    'total-total': null
  };
};

export const formatAttendance = (dataArr, employees) =>
  new Promise(async (r, j) => {
    // if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
    //   r([]);
    // }
    try {
      let initSnap = createInitSnap();
      let empArr = Object.keys(employees).map(k => employees[k]);
      let initData = {};
      let initArr = empArr.map(emp => {
        const { affiliate, employeeCode, position, workBegin, workEnd, prefix, firstName, lastName } = emp;
        let snap = {
          employeeCode,
          eCode: employeeCode.replace(/\D/g, ''),
          affiliate,
          position,
          workBegin,
          workEnd,
          displayName: `${prefix}${firstName} ${lastName}`.trim(),
          ...initSnap
        };
        initData[employeeCode] = snap;
        return snap;
      });
      let arr = dataArr.map(it => {
        let snap = !!initData[it.employeeId]
          ? { ...initData[it.employeeId] }
          : {
              employeeCode: it.employeeId,
              position: it.position,
              ...initSnap
            };
        let yr = moment(it.fromDate, 'YYYY-MM-DD').format('YYYY');
        let m1 = moment(it.fromDate, 'YYYY-MM-DD').format('M');
        let m2 = moment(it.toDate, 'YYYY-MM-DD').format('M');
        let nextMonth = (Number(m1) + 1).toString();
        let mSnap = `${yr}-M${m1 - 1}`;
        let nextSnap = `${yr}-M${nextMonth - 1}`;
        if (m1 === '12') {
          nextMonth = '1';
          nextSnap = `${(Number(yr) + 1).toString()}-M${nextMonth - 1}`;
        }
        let leaveDays = Numb(it.leaveDays);
        let leaveDaysNextMonth = 0;
        if (m1 !== m2) {
          // fromMonth !== toMonth
          let leaveDaysFirstMonth =
            Numb(moment(it.fromDate, 'YYYY-MM-DD').daysInMonth()) -
            Numb(moment(it.fromDate, 'YYYY-MM-DD').format('D')) +
            1;
          if (leaveDaysFirstMonth < leaveDays) {
            leaveDaysNextMonth = leaveDays - leaveDaysFirstMonth;
            leaveDays = leaveDaysFirstMonth;
          }
        }
        switch (it.leaveType) {
          case 'ลาป่วย':
            snap[`${mSnap}-sick`] = Numb(snap[`${mSnap}-sick`]) + leaveDays;
            snap[`${nextSnap}-sick`] = Numb(snap[`${nextSnap}-sick`]) + leaveDaysNextMonth;
            snap['total-sick'] = Numb(snap['total-sick']) + leaveDays + leaveDaysNextMonth;
            break;
          case 'ลากิจ':
            snap[`${mSnap}-biz`] = Numb(snap[`${mSnap}-biz`]) + leaveDays;
            snap[`${nextSnap}-biz`] = Numb(snap[`${nextSnap}-biz`]) + leaveDaysNextMonth;
            snap['total-biz'] = Numb(snap['total-biz']) + leaveDays + leaveDaysNextMonth;
            break;
          case 'ขาดงาน':
            snap[`${mSnap}-absent`] = Numb(snap[`${mSnap}-absent`]) + leaveDays;
            snap[`${nextSnap}-absent`] = Numb(snap[`${nextSnap}-absent`]) + leaveDaysNextMonth;
            snap['total-absent'] = Numb(snap['total-absent']) + leaveDays + leaveDaysNextMonth;
            break;

          default:
            break;
        }
        snap[`${mSnap}-total`] = Numb(snap[`${mSnap}-total`]) + leaveDays;
        snap[`${nextSnap}-total`] = Numb(snap[`${nextSnap}-total`]) + leaveDaysNextMonth;
        snap['total-total'] = Numb(snap['total-total']) + leaveDays + leaveDaysNextMonth;

        initData[it.employeeId] = snap;
        return snap;
      });
      // TODO: Add fingerprint data.

      // r(arr);
      r(Object.keys(initData).map(k => initData[k]));
    } catch (e) {
      j(e);
    }
  });
