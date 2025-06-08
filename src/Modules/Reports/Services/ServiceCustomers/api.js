import React from 'react';
import { showLog, distinctArr } from 'functions';
import numeral from 'numeral';
import { createArrOfLength } from 'functions';
import dayjs from 'dayjs';
import { VehicleGroup } from 'data/Constant';
import { ServiceCustomerReportHeader } from '../Constant';

export const getColumns = () => {
  let mIdx = createArrOfLength(12).map(it => ({
    title: (it + 1).toString(),
    dataIndex: `M${it + 1}`,
    width: 60,
    align: 'center',
    render: text => <div>{!!text ? text : null}</div>
  }));
  return [
    {
      title: 'ประเภท',
      dataIndex: 'serviceTitle',
      width: 180,
      render: text => <div className="text-primary">{ServiceCustomerReportHeader[text]}</div>
    },
    {
      title: 'เดือนที่',
      children: mIdx
    },
    {
      title: 'รวม',
      dataIndex: 'count',
      width: 80,
      align: 'center',
      render: text => <div className="text-primary">{numeral(text).format('0,0.00')}</div>
    }
  ];
};

export const serviceCustomerSumKeys = () => {
  let iKeys = createArrOfLength(12).map(it => `M${it + 1}`);
  return [...iKeys, 'count'];
};

export const createInitData = () => {
  let mKeys = {};
  createArrOfLength(12).map(it => {
    mKeys[`M${it + 1}`] = null;
    return it;
  });
  let arr = Object.keys(ServiceCustomerReportHeader).map(k => ({
    serviceTitle: k,
    ...mKeys
  }));
  let result = [];
  arr.map(l => {
    Object.keys(VehicleGroup).map(vGroup => {
      result.push({
        ...l,
        vGroup
      });
      return vGroup;
    });
    return l;
  });
  showLog({ arr, result });
  return result;
};

export const formatServiceCustomers = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let initData = createInitData().map((it, id) => ({ ...it, id, key: id }));
      let arr = dataArr.map(it => {
        let serviceTitle = 'n/a';
        let month = dayjs(it.recordedDate, 'YYYY-MM-DD').format('M');
        let vGroup = 'n/a';
        if (it.vehicleType.search(VehicleGroup.tracktor.keyword) > -1) {
          vGroup = 'tracktor';
        } else if (it.vehicleType.search(VehicleGroup.harvester.keyword) > -1) {
          vGroup = 'harvester';
        } else if (it.vehicleType.search(VehicleGroup.excavator.keyword) > -1) {
          vGroup = 'excavator';
        } else if (it.vehicleType.search(VehicleGroup.ricePlanter.keyword) > -1) {
          vGroup = 'ricePlanter';
        }
        switch (it.serviceType) {
          case 'periodicCheck':
            serviceTitle = `check${it.times}`;
            break;
          case 'periodicCheck_KIS':
            serviceTitle = `checkKis${it.times}`;
            break;
          case 'periodicCheck_Beyond':
            serviceTitle = `checkBeyond${it.times}`;
            break;
          case 'checkDrone':
            serviceTitle = 'checkDrone';
            break;
          case 'periodicService':
            serviceTitle = 'periodicService';
            break;
          case 'generalRepair':
            serviceTitle = it.warrantyStatus === 'ในประกัน' ? 'inWarranty' : 'outWarranty';
            break;
          case 'serviceCare':
            serviceTitle = 'serviceCare';
            break;
          case 'worthReassure':
            serviceTitle = 'worthReassure';
            break;
          case 'mobileService':
            serviceTitle = 'mobileService';
            break;
          case 'otherService':
            serviceTitle = 'otherService';
            break;

          default:
            break;
        }
        return {
          ...it,
          serviceTitle,
          month,
          vGroup,
          count: 1,
          [`M${month}`]: 1
        };
      });
      let dArr = distinctArr(
        arr,
        ['customerId'],
        ['count', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
      ).map((it, id) => ({
        serviceTitle: it.serviceTitle,
        vGroup: it.vGroup,
        month: it.month,
        count: it.count,
        M1: it?.M1 || null,
        M2: it?.M2 || null,
        M3: it?.M3 || null,
        M4: it?.M4 || null,
        M5: it?.M5 || null,
        M6: it?.M6 || null,
        M7: it?.M7 || null,
        M8: it?.M8 || null,
        M9: it?.M9 || null,
        M10: it?.M10 || null,
        M11: it?.M11 || null,
        M12: it?.M12 || null
      }));
      dArr = distinctArr(
        dArr,
        ['serviceTitle', 'vGroup', 'month'],
        ['count', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
      );
      dArr.map(item => {
        let idx = initData.findIndex(l => l.vGroup === item.vGroup && l.serviceTitle === item.serviceTitle);
        if (idx > -1) {
          initData[idx] = { ...initData[idx], ...item };
        }
        return item;
      });
      r(initData);
    } catch (e) {
      j(e);
    }
  });
