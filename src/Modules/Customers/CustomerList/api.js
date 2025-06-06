export const getCustomerListColumes = showBranch =>
  showBranch
    ? [
        {
          title: 'ลำดับ',
          dataIndex: 'id',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '',
          dataIndex: 'prefix',
          width: 70
        },
        {
          title: 'ชื่อลูกค้า',
          dataIndex: 'firstName',
          ellipsis: true,
          width: 100
        },
        {
          title: 'นามสกุล',
          dataIndex: 'lastName',
          ellipsis: true,
          width: 160
        },
        {
          title: 'สาขา',
          dataIndex: 'branchCode',
          ellipsis: true
        },
        {
          title: 'เบอร์โทร',
          dataIndex: 'phoneNumber',
          width: 140
        }
      ]
    : [
        {
          title: 'ลำดับ',
          dataIndex: 'id',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '',
          dataIndex: 'prefix',
          width: 70
        },
        {
          title: 'ชื่อลูกค้า',
          dataIndex: 'firstName',
          ellipsis: true,
          width: 100
        },
        {
          title: 'นามสกุล',
          dataIndex: 'lastName',
          ellipsis: true,
          width: 160
        },
        {
          title: 'เบอร์โทร',
          dataIndex: 'phoneNumber',
          width: 140
        },
        {
          title: 'รหัสลูกค้า',
          dataIndex: 'customerNo',
          ellipsis: true
        }
      ];
