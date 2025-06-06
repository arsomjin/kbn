import { ListItem } from 'elements';
import { checkCollection } from 'firebase/api';
import { getBranchName } from 'Modules/Utils';
import moment from 'moment-timezone';
import React from 'react';

export const getColums = employees => [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'fromOrigin',
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
    title: 'เลขใบดัน',
    dataIndex: 'pressureBladeNo',
    width: 120
  },
  {
    title: 'หมายเลขบุ้งกี๋',
    dataIndex: 'bucketNo',
    width: 120
  },
  {
    title: 'หมายเลขคีบอ้อย',
    dataIndex: 'sugarcanePickerNo',
    width: 120
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
  },
  {
    title: 'การขนส่ง',
    children: [
      {
        title: 'วันที่จัดส่ง',
        dataIndex: 'deliveredDate',
        width: 120,
        render: text => (
          <div className={!text ? 'transparent' : ''}>
            {!!text ? moment(text, 'YYYY-MM-DD').format('DD/MM/YYYY') : '-'}
          </div>
        ),
        align: 'center'
      },
      {
        title: 'ไปสาขา',
        dataIndex: 'toDestination',
        width: 120,
        align: 'center',
        render: text => <div className={!text ? 'transparent' : ''}>{!!text ? getBranchName(text) : '-'}</div>
      },
      {
        title: 'ผู้ส่งสินค้า',
        dataIndex: 'deliveredBy',
        ellipsis: true,
        align: 'center',
        width: 120,
        render: text => (
          <div className={!text ? 'transparent' : ''}>
            {text && employees[text]
              ? `${employees[text].firstName}${employees[text].nickName ? `(${employees[text].nickName})` : ''}`
              : text || '-'}
          </div>
        )
      }
    ]
  },

  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const getBranchDeliveryPlanData = ({ month, branchCode }) =>
  new Promise(async (r, j) => {
    let wheres = [
      ['date', '>=', `${month}-01`],
      ['date', '<=', `${month}-31`],
      ['deliverType', '==', 'branchDelivery']
    ];
    if (branchCode !== 'all') {
      wheres = wheres.concat([['fromOrigin', '==', branchCode]]);
    }
    const snap = await checkCollection('sections/stocks/deliverItems', wheres);
    let arr = [];
    if (snap) {
      snap.forEach(doc => [arr.push({ ...doc.data(), _id: doc.id })]);
    }
    let fArr = arr.map((it, id) => {
      return {
        ...it,
        key: id,
        id
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
