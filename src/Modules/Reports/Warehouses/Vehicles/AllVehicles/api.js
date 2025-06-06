import { checkCollection } from 'firebase/api';
import moment from 'moment-timezone';
import React from 'react';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'สถานะ',
    dataIndex: 'status',
    render: txt => {
      let sClass;
      switch (txt) {
        case 'ขายแล้ว':
          sClass = 'text-success';
          break;
        case 'โอนย้าย':
          sClass = 'text-warning';
          break;
        case 'จอง':
          sClass = 'text-primary';
          break;

        default:
          break;
      }
      return <div className={sClass}>{txt}</div>;
    },
    width: 100,
    align: 'center'
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
  },
  {
    title: 'วันที่รับ SKC',
    dataIndex: 'importDate',
    align: 'center'
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    width: 140
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    width: 220,
    align: 'center'
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'การขาย',
    children: [
      {
        title: 'วันที่ขาย',
        dataIndex: 'saleDate',
        width: 120,
        align: 'center'
      },
      {
        title: 'ลูกค้า',
        dataIndex: 'customer',
        width: 200,
        align: 'center'
      }
    ]
  },
  {
    title: 'การโอนย้าย (ล่าสุด)',
    children: [
      {
        title: 'เลขที่เอกสาร',
        dataIndex: 'transferDoc',
        width: 160,
        align: 'center'
      },
      {
        title: 'วันที่โอนย้าย',
        dataIndex: 'transferOutDate',
        width: 120
      },
      {
        title: 'วันที่รับ',
        dataIndex: 'transferInDate',
        align: 'center',
        width: 120
      },
      {
        title: 'การโอนย้าย',
        dataIndex: 'transferInfo',
        width: 220
        // ellipsis: true,
      }
    ]
  }
];

export const getVehicleData = branches =>
  new Promise(async (r, j) => {
    const snap = await checkCollection('sections/stocks/vehicles', [['transfer', '!=', null]], undefined, 10);
    let arr = [];
    if (snap) {
      snap.forEach(doc => [arr.push({ ...doc.data(), _id: doc.id })]);
    }
    // Get docNo, importDate, transferInDate, transferOutDate
    let importDate,
      transferInDate,
      transferOutDate,
      customer,
      saleDate,
      transferDoc,
      fromOrigin,
      toDestination,
      transferInfo,
      status;
    let fArr = arr.map((it, key) => {
      if (!!it?.transfer) {
        transferDoc = it.transfer?.docNo || null;
        transferOutDate = it.transfer?.exportDate || null;
        fromOrigin = it.transfer?.fromOrigin || null;
        toDestination = it.transfer?.toDestination || null;
      }
      if (!!it?.transactions) {
        let importData = it.transactions.filter(l => l.type === 'import');
        let transferData = it.transactions.filter(l => l.type === 'transfer');
        let saleOutData = it.transactions.filter(l => l.type === 'saleOut');
        importDate = importData.length > 0 ? moment(importData[0].ts).format('DD/MM/YYYY') : undefined;
        transferInDate = transferData.length > 0 ? transferData[transferData.length - 1].importDate : transferInDate;
        transferOutDate = transferData.length > 0 ? transferData[transferData.length - 1].exportDate : transferOutDate;
      }
      if (!!it?.sold) {
        customer = it.sold?.customer || null;
        saleDate = moment(it.sold.ts).format('DD/MM/YYYY');
      }
      status = !!it?.sold ? 'ขายแล้ว' : !!it?.reserved ? 'จอง' : !!it?.transfer ? 'โอนย้าย' : '';

      transferInfo = `${
        !!fromOrigin ? `จาก${fromOrigin === '0450' ? '' : 'สาขา'} ${branches[fromOrigin].branchName}` : ''
      } ${
        !!toDestination ? `ไป${toDestination === '0450' ? '' : 'สาขา'} ${branches[toDestination].branchName}` : ''
      }`.trim();
      return {
        ...it,
        key,
        id: key,
        importDate,
        transferInDate,
        transferOutDate,
        customer,
        saleDate,
        transferDoc,
        fromOrigin,
        toDestination,
        transferInfo,
        status
      };
    });
    r(fArr);
  });
