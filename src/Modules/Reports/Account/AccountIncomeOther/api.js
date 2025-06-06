import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import { Numb } from 'functions';
import { getSearchData } from 'firebase/api';
import { FilterSnap } from 'data/Constant';

export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    render: text => (
      <div className="text-primary">{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>
    ),
    width: 100,
    fixed: 'left'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...FilterSnap.branch,
    fixed: 'left',
    width: 130
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    width: 140
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    width: 220
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    width: 180
  }
];

const eStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
  font: { bold: true }
};

export const eColumns = columns.map(cl => ({
  title: cl.title,
  dataIndex: cl.dataIndex,
  width: { wpx: cl.width },
  style: eStyle
}));

export const formatIncomeSummary = ({ branches, month }) =>
  new Promise(async (r, j) => {
    try {
      let sArr = await getSearchData('sections/account/incomes', {
        month,
        incomeCategory: 'daily',
        incomeSubCategory: 'other'
      });
      let arr = [];
      sArr
        .filter(l => Numb(l.amtOther) > 0 && !l.deleted)
        .map(it => {
          !!it.amtOthers &&
            it.amtOthers.map(oth => {
              arr.push({
                date: it.date,
                branchCode: it.branchCode,
                item: oth.name,
                total: oth.total,
                firstName: it.firstName,
                lastName: it.lastName,
                customer: `${it.firstName} ${it.lastName || ''}`.trim(),
                remark: it.remark
              });
              return oth;
            });
          return it;
        });

      r(arr.filter(l => !!l.total).map((it, id) => ({ ...it, id, key: id })));
    } catch (e) {
      j(e);
    }
  });
