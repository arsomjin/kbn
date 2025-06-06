import { FilterSnap } from 'data/Constant';
import { ListItem } from 'elements';
import { checkCollection } from 'firebase/api';
import React from 'react';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'exportDate',
    align: 'center'
  },
  {
    title: 'สถานะ',
    dataIndex: 'status',
    render: txt => {
      let sClass;
      switch (txt) {
        case 'เสร็จสมบูรณ์':
          sClass = 'text-success';
          break;
        case 'อยู่ระหว่างโอนย้าย':
          sClass = 'text-warning';
          break;
        case 'ยกเลิก':
          sClass = 'text-muted';
          break;
        case 'ตีกลับ':
          sClass = 'text-danger';
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
    title: 'ประเภท',
    dataIndex: 'vehicleType',
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    width: 200,
    align: 'center'
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo',
    ellipsis: true,
    width: 120,
    align: 'center'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo',
    width: 120,
    align: 'center'
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralNo',
    ellipsis: true,
    width: 120,
    align: 'center'
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'fromOrigin',
    align: 'center',
    ...FilterSnap.branch,
    onFilter: (value, record) => record.fromOrigin === value
    // editable: true,
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'toDestination',
    align: 'center',
    ...FilterSnap.branch,
    onFilter: (value, record) => record.toDestination === value
  },
  {
    title: 'รับสินค้าโดย',
    dataIndex: 'importRecordedBy',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'ผู้สอบสินค้า',
    dataIndex: 'exportVerifiedBy',
    ellipsis: true
  },
  {
    title: 'ผู้ส่งสินค้า',
    dataIndex: 'deliveredBy',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'ผู้รับสินค้า',
    dataIndex: 'receivedBy',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true
  }
];

export const getVehicleTransferData = month =>
  new Promise(async (r, j) => {
    const snap = await checkCollection('sections/stocks/transferItems', [
      ['exportDate', '>=', `${month}-01`],
      ['exportDate', '<=', `${month}-31`]
    ]);
    let arr = [];
    if (snap) {
      snap.forEach(doc => [arr.push({ ...doc.data(), _id: doc.id })]);
    }
    let fArr = arr.map((it, id) => {
      return {
        ...it,
        key: id,
        id,
        status: !!it?.completed
          ? 'เสร็จสมบูรณ์'
          : !!it?.rejected
            ? 'ตีกลับ'
            : !!it?.cancelled || !!it?.deleted
              ? 'ยกเลิก'
              : 'อยู่ระหว่างโอนย้าย'
      };
    });
    r(fArr);
  });

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <div className="border py-2">
        {/* <label className="text-primary ml-4">ข้อมูลเพิ่มเติม</label> */}
        <div className="d-flex flex-row">
          <div>
            <ListItem label="เลขที่เอกสาร" info={record.docNo} />
            <ListItem label="รหัสสินค้า" info={record.productCode} />
            <ListItem label="ชื่อสินค้า" info={record.productName} />
          </div>
        </div>
      </div>
    </div>
  );
};
