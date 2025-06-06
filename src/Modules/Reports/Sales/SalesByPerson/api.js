export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่',
    dataIndex: 'date',
    ellipsis: true,
    defaultSortOrder: 'ascend',
    sorter: {
      compare: (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0),
      multiple: 1
    }
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
    ellipsis: true
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType',
    ellipsis: true,
    // defaultSortOrder: 'descend',
    sorter: {
      compare: (a, b) => (a.vehicleType > b.vehicleType ? 1 : a.vehicleType < b.vehicleType ? -1 : 0),
      multiple: 2
    }
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true
  },
  {
    title: 'พนักงานขาย',
    dataIndex: 'salesPerson',
    ellipsis: true
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  }
];
export const columns2 = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่',
    dataIndex: 'date',
    ellipsis: true,
    defaultSortOrder: 'ascend',
    sorter: {
      compare: (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0),
      multiple: 1
    }
  },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    ellipsis: true
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType',
    ellipsis: true,
    // defaultSortOrder: 'descend',
    sorter: {
      compare: (a, b) => (a.vehicleType > b.vehicleType ? 1 : a.vehicleType < b.vehicleType ? -1 : 0),
      multiple: 2
    }
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true
  },
  {
    title: 'พนักงานขาย',
    dataIndex: 'salesPerson',
    ellipsis: true
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  }
];
