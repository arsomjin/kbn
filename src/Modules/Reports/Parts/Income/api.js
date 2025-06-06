import React from 'react';
import { IncomePartCategories } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { formatDate } from 'functions';
import { getBankTransferItem } from 'Modules/Reports/Account/IncomeExpenseSummary/api';
import { Tag } from 'antd';

export const columns = [
  {
    title: 'ลำดับที่',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    ellipsis: true
  },
  {
    title: 'ผู้รับเงิน',
    dataIndex: 'receiverEmployee',
    align: 'center'
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    number: true
  }
];

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.details && <Tag>{`${record.details}`}</Tag>}
    {record?.remark && <Tag>{`หมายเหตุ: ${record.remark}`}</Tag>}
  </div>
);

export const getPartsIncome = (branch, date) =>
  new Promise(async (r, j) => {
    try {
      const mDate = formatDate(date);

      let incomes = [];
      let dailyParts = [];
      let partChangeDeposit = 0;
      const dailyPartsSnap = await checkCollection('sections/account/incomes', [
        ['incomeCategory', '==', 'daily'],
        ['incomeSubCategory', '==', 'parts'],
        ['date', '==', mDate],
        ['branchCode', '==', branch]
      ]);
      if (dailyPartsSnap) {
        dailyPartsSnap.forEach(doc => {
          dailyParts.push(doc.data());
        });
      }
      if (dailyParts.length > 0) {
        let partChangeDepositArr = dailyParts.filter(l => l.incomeType === 'partChange');
        if (partChangeDepositArr.length > 0) {
          partChangeDeposit = partChangeDepositArr[0].total;
        }
        dailyParts.map((dp, i) => {
          incomes.push({
            id: incomes.length,
            key: incomes.length,
            incomeId: dp.incomeId,
            item: `รับเงิน${IncomePartCategories[dp.incomeType]}`,
            receiverEmployee: dp.receiverEmployee || dp.createdBy,
            total: dp.total,
            details: '',
            remark: dp.remark,
            deleted: dp?.deleted || false
          });
          return dp;
        });
      }
      // Transfer payment
      let bankTransfer = getBankTransferItem(dailyParts);
      // showLog({
      //   vehicleBankTransfer,
      //   serviceBankTransfer,
      //   otherBankTransfer,
      //   partBankTransfer,
      //   bankTransfer,
      // });

      r({
        incomes,
        partChangeDeposit,
        bankTransfer,
        dailyParts
      });
    } catch (e) {
      j(e);
    }
  });
