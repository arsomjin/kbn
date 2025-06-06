import { parser } from 'functions';

export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่คีย์ขาย',
    dataIndex: 'date',
    align: 'center',
    // defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.deliverDate) - parser(b.deliverDate)
  },
  {
    title: 'วันที่ส่งมอบรถ',
    dataIndex: 'deliverDate',
    align: 'center',
    // defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.deliverDate) - parser(b.deliverDate)
  },
  // {
  //   title: 'วันที่เอกสาร',
  //   dataIndex: 'date',
  //   align: 'center',
  //   defaultSortOrder: 'descend',
  //   sorter: (a, b) => parser(a.date) - parser(b.date),
  // },
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
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
    align: 'center'
  },
  {
    title: 'ยอดเต็ม',
    dataIndex: 'amtFull'
  },
  {
    title: 'ยอดรับสุทธิ',
    dataIndex: 'total'
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
    ellipsis: true,
    dataIndex: 'productCode'
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
