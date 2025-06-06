import React from 'react';
import { parser } from 'functions';
import { Typography } from 'antd';
const { Text } = Typography;

export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่รับจอง',
    dataIndex: 'date',
    align: 'center',
    defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.date) - parser(b.date)
  },
  // {
  //   title: 'วันที่บันทึก',
  //   dataIndex: 'created',
  //   align: 'center',
  //   render: (txt) => (
  //     <div>{moment.tz(txt, 'Asia/Bangkok').format('D/MM/YYYY HH:mm:ss')}</div>
  //   ),
  //   width: 180,
  //   defaultSortOrder: 'descend',
  //   sorter: (a, b) => a.created - b.created,
  // },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center'
  },
  // {
  //   title: 'ประเภทรถ',
  //   dataIndex: 'vehicleType',
  //   align: 'center',
  // },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    align: 'center'
  },
  // {
  // title: 'รหัสสินค้า',
  //   dataIndex: 'productCode',
  //   ellipsis: true,
  // },
  // {
  //   title: 'ชื่อสินค้า',
  //   dataIndex: 'productName',
  //   ellipsis: true,
  // },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  },
  {
    title: 'จำนวนเงินจอง',
    dataIndex: 'amtReceived'
  },
  {
    title: 'ยอดเต็ม',
    dataIndex: 'amtFull'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  }
];

export const saleColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'พนักงานขาย',
    dataIndex: 'receiverEmployee',
    ellipsis: true
  },
  // {
  //   title: 'ประเภทสินค้า',
  //   dataIndex: 'vehicleType',
  //   ellipsis: true,
  // },
  // {
  // title: 'รหัสสินค้า',
  //   dataIndex: 'productCode',
  //   ellipsis: true,
  // },
  // {
  //   title: 'ชื่อสินค้า',
  //   dataIndex: 'productName',
  //   ellipsis: true,
  // },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  }
];
export const modelColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType',
    ellipsis: true
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    ellipsis: true,
    width: 140
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true,
    width: 180
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  },
  {
    title: '%',
    dataIndex: 'percentage',
    align: 'right'
  }
];

export const asColumns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่เอกสาร',
    dataIndex: 'date',
    align: 'center',
    defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.date) - parser(b.date)
  },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    align: 'center'
  },
  {
    title: 'ผลการประเมิน',
    dataIndex: 'assessmentResult',
    ellipsis: true,
    align: 'center',
    width: 100,
    render: txt => (
      <Text
        {...(txt !== 'N/A' && {
          className: txt === 'ผ่าน' ? 'text-success' : 'text-danger'
        })}
      >
        {txt}
      </Text>
    )
  },
  {
    title: 'วันที่ประเมิน',
    dataIndex: 'assessmentDate',
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center'
  },
  {
    title: 'จำนวนเงินจอง',
    dataIndex: 'amtReceived'
  },
  {
    title: 'ยอดเต็ม',
    dataIndex: 'amtFull'
  }
  // {
  //   title: 'ประเภทรถ',
  //   dataIndex: 'vehicleType',
  //   align: 'center',
  // },
  // {
  // title: 'รหัสสินค้า',
  //   dataIndex: 'productCode',
  //   ellipsis: true,
  // },
  // {
  //   title: 'ชื่อสินค้า',
  //   dataIndex: 'productName',
  //   ellipsis: true,
  // },
];
