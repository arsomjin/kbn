import React from 'react';
import { arrayForEach } from 'functions';
import numeral from 'numeral';
import moment from 'moment';
import { Numb } from 'functions';
import { distinctArr } from 'functions';
import { getIncome } from '../IncomeExpenseSummary/api';
import { daysInMonth } from 'functions';

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
    render: text => <div>{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>,
    width: 100,
    fixed: 'left'
  },
  {
    title: <div className="text-center">เงินสดส่ง สนง.ใหญ่ ทั้งหมด</div>,
    dataIndex: 'cash_hq',
    width: 150,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: <div className="text-center">ส่งคืนเงินทอน</div>,
    dataIndex: 'change_repay',
    align: 'right',
    width: 120,
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: <div className="text-center">ช่างส่งตอนเย็น</div>,
    dataIndex: 'cash_evening',
    align: 'right',
    width: 120,
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: <div className="text-center">ส่งเงินสด</div>,
    dataIndex: 'total_cash',
    align: 'right',
    width: 120,
    render: text => {
      return !text ? null : <div className="text-primary">{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ส่งเงินเฮีย',
    dataIndex: 'send_money_hia',
    width: 100,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ส่งเงินคุณเบนซ์',
    dataIndex: 'send_money_k_benz',
    align: 'right',
    width: 100,
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'ส่งเงินพี่ชมพู่',
    dataIndex: 'send_money_chompoo',
    align: 'right',
    width: 100,
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'เงินโอน / เงินฝาก',
    children: [
      {
        title: <div className="text-center">ลูกค้า/ร้านค้า โอนเงิน</div>,
        titleAlign: 'center',
        dataIndex: 'transfer_hq',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">รับเงินขาย ธกส.</div>,
        dataIndex: 'transfer_baac',
        align: 'right',
        width: 120,
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'รวมเงินโอนในวัน',
        dataIndex: 'total_transfer',
        align: 'right',
        width: 120,
        render: text => {
          return !text ? null : <div className="text-primary">{numeral(text).format('0,0.00')}</div>;
        }
      }
    ]
  },
  {
    title: 'รวม รับเงินสุทธิประจำวัน',
    dataIndex: 'total',
    align: 'right',
    className: 'text-primary'
  },
  {
    title: <div className="text-center">ขายลูกค้า ธกส. ยังไม่ได้รับเงิน</div>,
    dataIndex: 'baac_not_receive',
    width: 120,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  }
];

export const mSnap = {
  cash_hq: null,
  change_repay: null,
  cash_evening: null,
  total_cash: null,
  send_money_hia: null,
  send_money_k_benz: null,
  send_money_chompoo: null,
  transfer_hq: null,
  transfer_baac: null,
  total_transfer: null,
  total: null,
  baac_not_receive: null
};

export const formatIncomeSummary = ({ branchCode, month }) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];

      const days = daysInMonth(month);
      const mth = month.slice(-2);
      const year = month.substr(0, 4);
      let arrOfDate = [...Array(daysInMonth(month)).keys()].map(d => {
        let dd = `0${d + 1}`.slice(-2);
        return `${year}-${mth}-${dd}`;
      });
      // showLog({ days, arrOfDate });

      await arrayForEach(arrOfDate, async dd => {
        const dailyIncome = await getIncome(branchCode, dd, 1);
        const {
          incomes,
          expenses,
          dailyChangeDeposit,
          partChangeDeposit,
          bankTransfer,
          duringDayMoney,
          duringDayArr,
          afterDailyClosed,
          afterAccountClosed
        } = dailyIncome;
        // showLog({ dailyIncome });
        // เงินทอน
        const change_repay = Numb(dailyChangeDeposit) + Numb(partChangeDeposit);
        const dailyChange = incomes
          .filter(l => !l.deleted && l.item.includes('เงินทอน'))
          .reduce((sum, elem) => sum + Numb(elem.total), 0);

        // เงินโอน
        const transfer_hq = bankTransfer
          .filter(l => !l.deleted)
          .reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0);
        // ช่างส่งตอนเย็น
        const after_acc_closed = afterAccountClosed
          .filter(l => !l.deleted)
          .reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
        const after_daily_closed = afterDailyClosed
          .filter(l => !l.deleted)
          .reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
        // ส่งเงิน
        let send_money_hia = 0;
        let send_money_k_benz = 0;
        let send_money_chompoo = 0;
        if (duringDayArr.length > 0) {
          send_money_chompoo = duringDayArr
            .filter(l => l.receiverDuringDay === 'KBN10002' && !l.deleted)
            .reduce((sum, elem) => sum + Numb(elem.amtDuringDay), 0);
        }

        // เงินสดส่ง สนง.ใหญ่
        const totalIncome = incomes.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0);
        const totalExpense = expenses
          .filter(l => !l.deleted && !l.isChevrolet)
          .reduce((sum, elem) => sum + Numb(elem.total), 0);
        const totalChevrolet = expenses
          .filter(l => !l.deleted && l.isChevrolet)
          .reduce((sum, elem) => sum + Numb(elem.total), 0);
        const dailyNetIncome = totalIncome - totalExpense - totalChevrolet;
        const cash_hq = dailyNetIncome - transfer_hq - send_money_chompoo - send_money_hia - send_money_k_benz;
        let duringDay_total = duringDayMoney.reduce((sum, elem) => sum + Numb(elem.value), 0);
        const netTotal = Numb(dailyNetIncome) + after_acc_closed - after_daily_closed - transfer_hq - duringDay_total;

        // ธกส.
        // ['incomeCategory', '==', 'daily'],
        // ['incomeSubCategory', '==', 'vehicles'],
        // ['incomeType', '==', 'baac'],
        let transfer_baac = 0;

        const total_cash = cash_hq - change_repay + after_acc_closed;
        const total_transfer = transfer_hq + transfer_baac;
        const total = cash_hq + total_transfer;

        arr.push({
          date: dd,
          ...mSnap,
          cash_hq,
          change_repay,
          transfer_hq,
          cash_evening: after_acc_closed,
          total_cash,
          send_money_chompoo,
          total_transfer,
          total,
          branchCode,
          count: 1
        });
      });

      // showLog({ arr });
      let dArr = distinctArr(
        arr,
        ['date'],
        Object.keys(mSnap).map(k => k)
      );
      dArr = dArr.filter(
        l =>
          Numb(l.cash_hq) - Numb(l.change_repay) + Numb(l.cash_evening) > 0 ||
          Numb(l.transfer_hq) + Numb(l.transfer_baac) > 0
      );
      let result = dArr.map((itm, id) => ({ ...itm, id, key: id }));
      r(result);
    } catch (e) {
      j(e);
    }
  });
