import EditableCellTable from 'components/EditableCellTable';
import { checkCollection } from 'firebase/api';
import dayjs from 'dayjs';
import React from 'react';
import { TransferType } from 'data/Constant';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import { insertArr } from 'functions';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    width: 140,
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    width: 180,
    align: 'center'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    width: 180
  },
  {
    title: 'รวม',
    dataIndex: 'qty',
    width: 80,
    align: 'center',
    render: txt => <label>{!!txt ? numeral(txt).format('0,0') : '-'}</label>
  },
  {
    title: 'ขาย',
    dataIndex: 'soldQty',
    className: 'text-success',
    width: 80,
    align: 'center',
    render: txt => <label>{!!txt ? numeral(txt).format('0,0') : '-'}</label>
  },
  {
    title: 'จอง',
    dataIndex: 'reservedQty',
    className: 'text-primary',
    width: 80,
    align: 'center',
    render: txt => <label>{!!txt ? numeral(txt).format('0,0') : '-'}</label>
  },
  {
    title: 'อยู่ระหว่างโอนย้าย',
    dataIndex: 'transferQty',
    className: 'text-warning',
    width: 80,
    align: 'center',
    render: txt => <label>{!!txt ? numeral(txt).format('0,0') : '-'}</label>
  },
  {
    title: 'จ่ายออก',
    dataIndex: 'exportedQty',
    className: 'text-danger',
    width: 80,
    align: 'center',
    render: txt => <label>{!!txt ? numeral(txt).format('0,0') : '-'}</label>
  },
  {
    title: 'คงเหลือ',
    dataIndex: 'total',
    width: 80,
    align: 'center',
    render: txt => <h6>{!!txt ? numeral(txt).format('0,0') : '-'}</h6>
  }
];

export const columns2 = insertArr(columns, 1, [
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  }
]);

export const getStockData = ({ isVehicle, isUsed, branchCode }) =>
  new Promise(async (r, j) => {
    // const snap = await checkCollection('sections/stocks/vehicles', [
    //   ['transfer', '!=', null],
    // ]);
    let wheres;
    if (branchCode !== 'all') {
      wheres = [['branchCode', '==', branchCode]];
    }
    if (!!isVehicle) {
      wheres = wheres = !!wheres ? wheres.concat([['isVehicle', '==', isVehicle]]) : [['isVehicle', '==', isVehicle]];
    }
    if (!!isUsed) {
      wheres = !!wheres ? wheres.concat([['isUsed', '==', isUsed]]) : [['isUsed', '==', isUsed]];
    }
    const snap = await checkCollection('sections/stocks/vehicles', wheres);
    let arr = [];
    if (snap) {
      snap.forEach(doc =>
        arr.push({
          ...doc.data(),
          _id: doc.id,
          qty: 1,
          soldQty: !!doc.data().sold ? 1 : 0,
          reservedQty: !!doc.data().reserved ? 1 : 0,
          transferQty: !!doc.data().transfer ? 1 : 0,
          exportedQty: !!doc.data().exported ? 1 : 0
        })
      );
    }
    // Get docNo, importDate, transferInDate, transferOutDate
    let dArr = distinctArr(arr, ['productPCode'], ['sold', 'reservedQty', 'transferQty', 'exportedQty', 'qty']);
    let result = dArr.map((it, id) => ({
      ...it,
      id,
      key: id,
      total: it.qty - it.soldQty - it.transferQty - it.reservedQty - it.exportedQty
    }));
    let fModels = distinctArr(result, ['model']).map(l => ({
      text: l.model,
      value: l.productPCode
    }));
    r({ result, fModels });
  });

const listColumns = [
  {
    title: '#',
    dataIndex: 'id'
  },
  {
    title: 'วันที่',
    dataIndex: 'date'
  },
  {
    title: 'ประเภท',
    dataIndex: 'type',
    align: 'center',
    width: 140
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    align: 'center'
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'fromOrigin',
    align: 'center'
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'toDestination',
    align: 'center'
  },
  {
    title: 'ข้อมูลเพิ่มเติม',
    dataIndex: 'info'
  }
];

const formatTransactions = trans => {
  return trans.map((it, key) => {
    let type = TransferType[it.type];
    let customer = it?.customer || null;
    let docNo = it?.billNoSKC || it?.saleNo || it?.bookNo || it?.docNo || null;
    let info = it?.info || null;
    let fromOrigin = it?.fromOrigin || it?.origin || null;
    let toDestination = it?.toDestination || it?.destination || null;
    let date = it?.docDate || (!!it?.ts ? dayjs(it.ts) : it.exportDate);

    return {
      ...it,
      type,
      customer,
      docNo,
      fromOrigin,
      toDestination,
      date,
      info,
      key,
      id: key
    };
  });
};

export const expandedRowRender = record => {
  return (
    <div className="bg-light px-3 pb-3">
      <label className="text-muted ">ประวัติการทำรายการ</label>
      <EditableCellTable
        columns={listColumns}
        dataSource={formatTransactions(record.transactions)}
        // summary={(pageData) => (
        //   <TableSummary
        //     pageData={pageData}
        //     dataLength={listColumns.length}
        //     startAt={6}
        //     sumKeys={['qty']}
        //   />
        // )}
        pagination={false}
      />
    </div>
  );
};
