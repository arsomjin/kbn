import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import {
  // if used elsewhere, otherwise consider removing this import
  Numb,
  distinctArr,
  getDates,
  showLog
} from 'functions';
import { getIncome } from '../IncomeExpenseSummary/api';

// Table columns for display
export const columns = [
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
    dataIndex: 'netTotal',
    width: 150,
    align: 'right',
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
  },
  {
    title: <div className="text-center">ส่งคืนเงินทอน</div>,
    dataIndex: 'change_repay',
    align: 'right',
    width: 120,
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
  },
  {
    title: <div className="text-center">ช่างส่งตอนเย็น</div>,
    dataIndex: 'cash_evening',
    align: 'right',
    width: 120,
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
  },
  {
    title: <div className="text-center">ส่งเงินสด</div>,
    dataIndex: 'total_cash',
    align: 'right',
    width: 120,
    render: text =>
      text ? (
        <div className={Numb(text) > 0 ? 'text-primary' : 'text-warning'}>{numeral(text).format('0,0.00')}</div>
      ) : null
  },
  // {
  //   title: (
  //     <div className="text-center">
  //       ส่งเงินสด <br /> ผู้บริหาร
  //     </div>
  //   ),
  //   dataIndex: 'executive_cash_deposit',
  //   width: 100,
  //   align: 'right',
  //   render: (text) =>
  //     text ? <div>{numeral(text).format('0,0.00')}</div> : null,
  // },
  {
    title: 'ส่งเงินพี่ชมพู่',
    dataIndex: 'send_money_chompoo',
    align: 'right',
    width: 100,
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
  },
  {
    title: 'เงินโอน / เงินฝาก',
    children: [
      {
        title: <div className="text-center">เงินฝากธนาคารประจำวัน</div>,
        titleAlign: 'center',
        dataIndex: 'bank_deposit',
        width: 120,
        align: 'right',
        render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
      },
      {
        title: (
          <div className="text-center">
            ลูกค้า/ร้านค้า <br /> โอนเงิน
          </div>
        ),
        titleAlign: 'center',
        dataIndex: 'transfer_hq',
        width: 120,
        align: 'right',
        render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
      },
      {
        title: <div className="text-center">รับเงินขาย ธกส.</div>,
        dataIndex: 'transfer_baac',
        align: 'right',
        width: 120,
        render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
      },
      {
        title: 'รวมเงินโอนในวัน',
        dataIndex: 'total_transfer',
        align: 'right',
        width: 120,
        render: text => (text ? <div className="text-primary">{numeral(text).format('0,0.00')}</div> : null)
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
    render: text => (text ? <div>{numeral(text).format('0,0.00')}</div> : null)
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
    dataIndex: 'date',
    width: { wpx: 100 },
    style: eStyle
  },
  {
    title: 'เงินสดส่ง สนง.ใหญ่ ทั้งหมด',
    dataIndex: 'netTotal',
    width: { wpx: 150 },
    style: eStyle
  },
  {
    title: 'ส่งคืนเงินทอน',
    dataIndex: 'change_repay',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ช่างส่งตอนเย็น',
    dataIndex: 'cash_evening',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ส่งเงินสด',
    dataIndex: 'total_cash',
    width: { wpx: 120 },
    style: eStyle
  },
  // {
  //   title: 'ส่งเงินสด ผู้บริหาร',
  //   dataIndex: 'executive_cash_deposit',
  //   width: { wpx: 100 },
  //   style: eStyle,
  // },
  {
    title: 'ส่งเงินพี่ชมพู่',
    dataIndex: 'send_money_chompoo',
    width: { wpx: 100 },
    style: eStyle
  },
  {
    title: 'เงินฝากธนาคารประจำวัน',
    dataIndex: 'bank_deposit',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ลูกค้า/ร้านค้า โอนเงิน',
    dataIndex: 'transfer_hq',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รับเงินขาย ธกส.',
    dataIndex: 'transfer_baac',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รวมเงินโอนในวัน',
    dataIndex: 'total_transfer',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รวม รับเงินสุทธิประจำวัน',
    dataIndex: 'total',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ขายลูกค้า ธกส. ยังไม่ได้รับเงิน',
    dataIndex: 'baac_not_receive',
    width: { wpx: 120 },
    style: eStyle
  }
];

// Snapshot object to ensure consistent keys
export const mSnap = {
  netTotal: null,
  change_repay: null,
  cash_evening: null,
  total_cash: null,
  executive_cash_deposit: null,
  send_money_chompoo: null,
  bank_deposit: null,
  transfer_hq: null,
  transfer_baac: null,
  total_transfer: null,
  total: null,
  baac_not_receive: null
};

/**
 * Formats and aggregates income summary data over a date range.
 * Fetches data concurrently for each date and returns a distinct list of daily summaries.
 */
export const formatIncomeSummary = async ({ branchCode, date }) => {
  try {
    const arrOfDate = getDates(date[0], date[1], 'YYYY-MM-DD');

    // Process each date concurrently
    const dailySummaries = await Promise.all(
      arrOfDate.map(async dd => {
        const dailyIncome = await getIncome(branchCode, dd, 1);
        const {
          incomes,
          expenses,
          dailyChangeDeposit,
          partChangeDeposit,
          bankTransfer,
          personalLoan,
          duringDayMoney,
          duringDayArr,
          afterDailyClosed,
          afterAccountClosed,
          bankDeposit,
          executiveCashDeposit,
          dailyExecutiveDepositCash
        } = dailyIncome;

        showLog({ dailyIncome });

        // Calculate change repayment amount
        const change_repay = Numb(dailyChangeDeposit) + Numb(partChangeDeposit);

        // Calculate bank deposit amount for the day
        const bank_deposit = bankDeposit
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.total || 0), 0);

        // Calculate total bank transfer amount
        const transfer_hq = bankTransfer
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.amount || 0), 0);

        // Calculate total personal loan amount
        const personal_loan_total = (personalLoan || [])
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.amount || 0), 0);

        // Calculate evening cash amount after account closed
        const after_acc_closed = afterAccountClosed
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.total || 0), 0);
        const after_daily_closed = afterDailyClosed
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.total || 0), 0);

        // Calculate bank deposit amount for the day
        const executive_cash_deposit = executiveCashDeposit
          .filter(item => !item.deleted)
          .reduce((sum, item) => sum + Numb(item?.total || 0), 0);

        // Calculate send money amounts (only send_money_chompoo is computed)
        let send_money_chompoo = 0;
        if (duringDayArr.length > 0) {
          send_money_chompoo = duringDayArr
            .filter(item => item.receiverDuringDay === 'KBN10002' && !item.deleted)
            .reduce((sum, item) => sum + Numb(item.amtDuringDay), 0);
        }

        // Calculate net income values
        const totalIncome = incomes.filter(item => !item.deleted).reduce((sum, item) => sum + Numb(item.total), 0);
        const totalExpense = expenses
          .filter(item => !item.deleted && !item.isChevrolet)
          .reduce((sum, item) => sum + Numb(item.total), 0);
        const totalChevrolet = expenses
          .filter(item => !item.deleted && item.isChevrolet)
          .reduce((sum, item) => sum + Numb(item.total), 0);
        const dailyNetIncome = totalIncome - totalExpense - totalChevrolet;

        // Calculate cash sent to headquarters
        const cash_hq = Numb(dailyNetIncome) - transfer_hq - send_money_chompoo - executive_cash_deposit;

        const duringDay_total = duringDayMoney.reduce((sum, item) => sum + Numb(item.value), 0);
        // Calculate net total after adjustments (including personal loan deduction)
        const netTotal = Numb(dailyNetIncome) - after_daily_closed - transfer_hq - bank_deposit - personal_loan_total - duringDay_total;

        // Currently, BAAC transfer is set to 0
        let transfer_baac = 0;

        // Calculate total cash and overall total for the day
        const total_cash = netTotal - change_repay + after_acc_closed;
        const total_transfer = transfer_hq + transfer_baac + bank_deposit;
        const total = total_cash + total_transfer;

        return {
          date: dd,
          ...mSnap,
          cash_hq,
          change_repay,
          transfer_hq,
          bank_deposit,
          cash_evening: after_acc_closed,
          total_cash,
          executive_cash_deposit,
          executiveCashDeposit,
          send_money_chompoo,
          total_transfer,
          total,
          branchCode,
          count: 1,
          netTotal,
          ...(dailyExecutiveDepositCash > 0
            ? [
                {
                  item: 'ฝากเงินสด ผู้บริหาร-ประจำวัน',
                  value: dailyExecutiveDepositCash,
                  text: 'primary'
                }
              ]
            : [])
        };
      })
    );

    showLog({ dailySummaries });

    // Remove duplicate entries and filter out days with no significant activity
    let distinctSummaries = distinctArr(dailySummaries, ['date'], Object.keys(mSnap));
    // distinctSummaries = distinctSummaries.filter(
    //   (item) => Numb(item.total) > 0
    // );
    // distinctSummaries = distinctSummaries.filter(
    //   (item) =>
    //     Numb(item.cash_hq) - Numb(item.change_repay) + Numb(item.cash_evening) >
    //       0 ||
    //     Numb(item.transfer_hq) +
    //       Numb(item.transfer_baac) +
    //       Numb(item.bank_deposit) >
    //       0
    // );

    // Filter zero values. (Most likely holidays)
    distinctSummaries = distinctSummaries.filter(
      item => !(Numb(item.netTotal) === 0 && Numb(item.change_repay) === 0 && Numb(item.total_cash) === 0)
    );

    const result = distinctSummaries.map((item, index) => ({
      ...item,
      id: index,
      key: index
    }));

    return result;
  } catch (error) {
    throw error;
  }
};
