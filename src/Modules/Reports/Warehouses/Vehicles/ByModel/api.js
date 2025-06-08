import EditableCellTable from 'components/EditableCellTable';
import { FilterSnap } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import dayjs from 'dayjs';
import React from 'react';
import { TransferType } from 'data/Constant';

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
        case 'ขาย':
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
    align: 'center',
    ...FilterSnap.status
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'skcDoc',
    align: 'center',
    width: 120
  },
  {
    title: 'วันที่รับ SKC',
    dataIndex: 'importDate',
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...FilterSnap.branch
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    width: 140
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

export const getVehicleData = (pCode, branches) =>
  new Promise(async (r, j) => {
    // const snap = await checkCollection('sections/stocks/vehicles', [
    //   ['transfer', '!=', null],
    // ]);
    const snap = await checkCollection('sections/stocks/vehicles', [['productPCode', '==', pCode]]);
    let arr = [];
    if (snap) {
      snap.forEach(doc => arr.push({ ...doc.data(), _id: doc.id }));
    }
    // Get docNo, importDate, transferInDate, transferOutDate
    let fArr = arr.map((it, key) => {
      let mIt = { ...it };
      let importData = (it.transactions || []).filter(l => l.type === 'import');
      let transferData = (it.transactions || []).filter(l => l.type === 'transfer');
      let saleOutData = (it.transactions || []).filter(l => l.type === 'saleOut');
      let exportData = (it.transactions || []).filter(l => l.type === 'export');
      let otherImportData = (it.transactions || []).filter(l => l.type === 'importOther');
      if (!!it?.transfer) {
        mIt.transferDoc = it.transfer?.docNo || null;
        mIt.transferOutDate = it.transfer?.exportDate || null;
        mIt.fromOrigin = it.transfer?.fromOrigin || null;
        mIt.toDestination = it.transfer?.toDestination || null;
        if (transferData.length === 0) {
          mIt.transactions = mIt.transactions.concat([
            {
              fromOrigin: it.transfer?.fromOrigin || null,
              toDestination: it.transfer?.toDestination || null,
              exportDate: it.transfer?.exportDate || null,
              importDate: it.transfer?.importDate || null,
              docNo: it.transfer?.docNo || null,
              type: 'transfer'
            }
          ]);
        }
      }
      if (importData.length > 0) {
        mIt.importDate = !!importData[0].docDate ? importData[0].docDate : undefined;
        mIt.skcDoc = importData[0].billNoSKC || it.docNo;
      }
      if (transferData.length > 0) {
        mIt.transferInDate = transferData[transferData.length - 1].importDate;
        mIt.transferOutDate = transferData[transferData.length - 1].exportDate;
        if (!it.fromOrigin) {
          mIt.fromOrigin = transferData[transferData.length - 1]?.fromOrigin || null;
        }
        if (!it.toDestination) {
          mIt.toDestination = transferData[transferData.length - 1]?.toDestination || null;
        }
        if (!it.transferDoc) {
          mIt.transferDoc =
            transferData[transferData.length - 1]?.docNo || transferData[transferData.length - 1]?.docId || null;
        }
      }
      if (!!it?.sold) {
        mIt.customer = it.sold?.customer || null;
        mIt.saleDate = dayjs(it.sold.ts).format('DD/MM/YYYY');
        if (saleOutData.length === 0) {
          mIt.transactions = mIt.transactions.concat([
            {
              saleId: it.sold?.saleId || null,
              saleNo: it.sold?.saleNo || null,
              saleType: it.sold?.saleType || null,
              customerId: it.sold?.customerId || null,
              customer: it.sold?.customer || null,
              ts: it.sold?.ts || null,
              by: it.sold?.by || it.sold?.salesPerson || null,
              type: 'saleOut'
            }
          ]);
        }
      }
      if (!!it?.exported) {
        mIt.toDestination = it.exported?.destination || null;
        if (exportData.length === 0) {
          mIt.transactions = mIt.transactions.concat([
            {
              exportId: it.exported?.exportId || null,
              docNo: it.exported?.docNo || null,
              saleType: it.exported?.saleType || null,
              destination: it.exported?.destination || null,
              ts: it.exported?.ts || null,
              by: it.exported?.by || it.exported?.salesPerson || null,
              type: 'export'
            }
          ]);
        }
      }
      if (!mIt.skcDoc) {
        mIt.skcDoc = it.docNo;
      }
      if (!!mIt?.skcDoc && mIt.skcDoc.startsWith('N')) {
        mIt.skcDoc = mIt.skcDoc.substring(2);
      }
      mIt.status = !!it?.sold
        ? 'ขาย'
        : !!it?.reserved
          ? 'จอง'
          : !!it?.transfer
            ? 'โอนย้าย'
            : !!it?.exported
              ? 'จ่ายออก'
              : '-';

      mIt.transferInfo = `${
        !!it.fromOrigin ? `จาก${it.fromOrigin === '0450' ? '' : 'สาขา'} ${branches[it.fromOrigin].branchName}` : ''
      } ${
        !!it.toDestination
          ? `ไป${it.toDestination === '0450' ? '' : 'สาขา'} ${branches[it.toDestination].branchName}`
          : ''
      }`.trim();
      return {
        ...mIt,
        key,
        id: key
      };
    });
    r(fArr);
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
