import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import {
  // if used elsewhere, otherwise consider removing this import
  Numb
} from 'functions';
import { IncomeDailyCategories } from 'data/Constant';
import { Tag } from 'antd';

// Table columns for display
export const columns = [
  {
    title: 'วันที่',
    dataIndex: 'incomeDate',
    align: 'center',
    render: text => <div>{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>,
    width: 120,
    fixed: 'left'
  },
  {
    title: <div className="text-center">สาขา</div>,
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'incomeSubCategory',
    render: txt => <a>{IncomeDailyCategories[txt]}</a>,
    width: 120,
    align: 'center'
  },
  {
    title: (
      <div className="text-center">
        เลขที่เอกสาร
        <br />
        รับเงิน
      </div>
    ),
    dataIndex: 'pLoanNo',
    width: 120,
    align: 'center'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    render: (_, record) => {
      return <a>{`${record.prefix || ''}${record.firstName || ''} ${record.lastName || ''}`}</a>;
    },
    width: 200
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    width: 280,
    render: arr => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {(arr || []).map((it, index) => (
          <Tag
            key={index}
            style={{
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {it}
          </Tag>
        ))}
      </div>
    )
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'totalLoan',
    align: 'right',
    width: 120,
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
  },
  {
    title: 'วันที่รับเงิน',
    dataIndex: 'payDate',
    align: 'center',
    render: text => <div>{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>,
    width: 120
  },
  {
    title: <div className="text-center">จำนวนเงินที่ได้รับ</div>,
    dataIndex: 'amtReceived',
    align: 'right',
    width: 120,
    render: text =>
      text ? (
        <div className={Numb(text) > 0 ? 'text-primary' : 'text-warning'}>{numeral(text).format('0,0.00')}</div>
      ) : null
  },
  {
    title: 'ธนาคาร',
    dataIndex: 'selfBankId',
    width: 300
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

const eStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
  font: { bold: true }
};

// Columns for Excel export
export const eColumns = [
  {
    title: 'วันที่',
    dataIndex: 'incomeDate',
    width: { wpx: 100 },
    style: eStyle
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    width: { wpx: 100 },
    style: eStyle
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'incomeSubCategory',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เลขที่เอกสารรับเงิน',
    dataIndex: 'pLoanNo',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    width: { wpx: 200 },
    style: eStyle
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    width: { wpx: 300 },
    style: eStyle
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'totalLoan',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'วันที่รับเงิน',
    dataIndex: 'payDate',
    width: { wpx: 100 },
    style: eStyle
  },
  {
    title: 'จำนวนเงินที่ได้รับ',
    dataIndex: 'amtReceived',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ธนาคาร',
    dataIndex: 'selfBankId',
    width: { wpx: 200 },
    style: eStyle
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    width: { wpx: 200 },
    style: eStyle
  }
];
