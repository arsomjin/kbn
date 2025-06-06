import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import { getSearchData } from 'firebase/api';
import EditableCellTable from 'components/EditableCellTable';
import { showLog } from 'functions';
import { Numb } from 'functions';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    fixed: 'left',
    width: 60
  },
  {
    title: 'วันที่',
    dataIndex: 'taxInvoiceDate',
    align: 'center',
    render: text => (
      <div className="text-primary">{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>
    ),
    width: 100,
    fixed: 'left'
  },
  // {
  //   title: 'สาขา',
  //   dataIndex: 'branchCode',
  //   align: 'center',
  //   ...FilterSnap.branch,
  //   fixed: 'left',
  // },
  {
    title: 'เลขที่ใบจ่ายสินค้า',
    dataIndex: 'billNoSKC',
    width: 180,
    align: 'center'
  },
  {
    title: 'เลขที่ใบกำกับภาษี',
    dataIndex: 'taxInvoiceNo',
    width: 180,
    align: 'center'
  },
  // {
  //   title: 'ประเภทราคา',
  //   dataIndex: 'priceType',
  //   required: true,
  //   align: 'center',
  // },
  {
    title: 'มูลค่าสินค้า',
    dataIndex: 'total',
    width: 130,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'VAT',
    dataIndex: 'billVAT',
    width: 110,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'รวมทั้งสิ้น',
    dataIndex: 'billTotal',
    width: 150,
    align: 'right',
    render: text => {
      return !text ? null : <div className="text-primary">{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ยื่นภาษี',
    dataIndex: 'taxFiledPeriod',
    required: true,
    align: 'center',
    width: 80
  },
  {
    title: 'วันครบกำหนด',
    dataIndex: 'dueDate',
    align: 'center',
    render: text => (
      <div className="text-primary">{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>
    ),
    width: 100,
    fixed: 'left'
  }
];

export const formatExpenseSummary = ({ branches, month }) =>
  new Promise(async (r, j) => {
    try {
      let sArr = await getSearchData(
        'sections/account/expenses',
        {
          month,
          expenseType: 'purchaseTransfer',
          isPart: false
        },
        null,
        { date: 'taxInvoiceDate' }
      );

      r(sArr.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id })));
    } catch (e) {
      j(e);
    }
  });

export const listColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    width: 120,
    align: 'center'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    width: 160
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    // width: 180,
    align: 'center'
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    width: 80,
    align: 'right',
    ellipsis: true,
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'รวม',
    dataIndex: 'unitPrice',
    width: 80,
    align: 'right',
    render: (_, record) => {
      let total = Numb(record.qty) * Numb(record.unitPrice);
      return !total ? null : <div className="text-primary">{numeral(total).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ส่วนลด',
    dataIndex: 'discount',
    width: 80,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ยอดสุทธิ',
    dataIndex: 'total',
    width: 90,
    align: 'right',
    render: text => {
      return !text ? null : <div className="text-primary">{numeral(text).format('0,0.00')}</div>;
    }
  }
];

export const expandedRowRender = record => {
  let items = record?.items;
  showLog({ record });
  if (!items || !Array.isArray(items)) {
    return null;
  }
  return (
    <div className="bg-light px-3 pb-3">
      <EditableCellTable columns={listColumns} dataSource={items} pagination={false} />
    </div>
  );
};
