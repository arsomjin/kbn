import React from 'react';
import numeral from 'numeral';
import { Numb } from 'utils/functions';
import { showLog } from 'utils/functions';

export const tableData = [
  {
    id: 1,
    key: 1,
    productName: 'รถแทรคเตอร์ รุ่น L4018SP',
    description: 'Accommodation',
    unitPrice: 132600,
    discount: 0,
    qty: 1,
  },
  {
    id: 2,
    key: 2,
    productName: 'อุปกรณ์ ผานบุกเบิก รุ่น DP224E-HP',
    description: 'Accommodation',
    unitPrice: 20600,
    discount: 0,
    qty: 1,
  },
];

export const tableColumns = [
  {
    title: 'รายละเอียด',
    dataIndex: 'productName',
    key: 'productName',
    width: '40%',
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    key: 'qty',
    width: '10%',
    align: 'center',
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: '10%',
    align: 'right',
    render: (text) => numeral(text).format('0,0.00'),
  },
  {
    title: 'ส่วนลด',
    dataIndex: 'discount',
    key: 'discount',
    width: '10%',
    align: 'right',
    render: (text) => numeral(text).format('0,0.00'),
  },
  {
    title: 'ยอดรวม',
    width: '10%',
    render: (text, record) => {
      return (
        <div>
          {numeral(Numb(record.qty) * Numb(record.unitPrice) - Numb(record.discount)).format(
            '0,0.00',
          )}
        </div>
      );
    },
    align: 'right',
  },
];
