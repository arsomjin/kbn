import React from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { Tag } from 'antd';
import { Col, Row } from 'shards-react';
import EditableRowTable from 'components/EditableRowTable';
import { TableSummary } from 'api/Table';
import { AllIncomeType, IncomeServiceCategories, IncomePartCategories } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { showLog, distinctArr, formatDate, Numb } from 'functions';
import { getNameFromUid } from 'Modules/Utils';

/* --------------------------------------------------------------------------
   Constant definitions & Table column definitions
-------------------------------------------------------------------------- */

export const initItem = {
  senderEmployee: null,
  receiverEmployee: null,
  date: undefined,
  department: null,
  total: null,
  remark: null
};

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
    title: 'ผู้รับเงิน / ผู้บันทึก',
    dataIndex: 'receiverEmployee',
    align: 'center'
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    number: true
  }
];

export const expenseColumns = [
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
    title: 'ผู้จ่ายเงิน',
    dataIndex: 'payer',
    align: 'center'
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    number: true
  }
];

/* --------------------------------------------------------------------------
   Helper Components & Functions
-------------------------------------------------------------------------- */

/**
 * Returns the columns for the change deposit table.
 */
export const getChangeDepositColumns = (users, employees) => [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เวลา',
    dataIndex: 'time',
    render: ts => moment(ts).format('D/MM/YY HH:mm'),
    align: 'center'
  },
  {
    title: 'บันทึกโดย',
    dataIndex: 'by',
    render: uid => getNameFromUid({ uid, users, employees }),
    align: 'center'
  },
  { title: 'จำนวนเงิน', dataIndex: 'total' }
];

/**
 * Renders the expanded row for the table.
 */
export const expandedRowRender = (record, users, employees) => {
  showLog({ record });
  if (record?.item === 'รับเงินทอน') {
    return (
      <div className="ml-4 bg-light bordered pb-1">
        <Row>
          <Col md="8">
            <EditableRowTable
              dataSource={(record?.changeDeposit || []).map((it, id) => ({
                ...it,
                id,
                key: id
              }))}
              columns={getChangeDepositColumns(users, employees)}
              summary={pageData => (
                <TableSummary
                  pageData={pageData}
                  dataLength={(record?.changeDeposit || []).length}
                  startAt={2}
                  sumKeys={['total']}
                />
              )}
              pagination={false}
            />
          </Col>
        </Row>
      </div>
    );
  }
  return (
    <div className="ml-4 bg-light bordered pb-1">
      {record?.details && <Tag>{record.details}</Tag>}
      {record?.remark && <Tag>{`หมายเหตุ: ${record.remark}`}</Tag>}
    </div>
  );
};

/**
 * Processes bank transfer payments from an array of payment items.
 */
export const getBankTransferItem = arr => {
  // Filter for the "old" type of payment (no payments array)
  const oldPayments = arr.filter(
    l =>
      !l.deleted &&
      !l.payments &&
      l.total > 0 &&
      ((l.paymentType === 'transfer' && l.bankAcc) ||
        (l.paymentType1 === 'transfer' && l.bankAcc1) ||
        (l.paymentType2 === 'transfer' && l.bankAcc2) ||
        (l.paymentType3 === 'transfer' && l.bankAcc3))
  );

  // Filter for the "new" type (with a payments array)
  const newPayments = arr.filter(l => l.payments && !l.deleted);

  const result1 = [];
  oldPayments.forEach(it => {
    const bankTransferArr = [];
    const {
      paymentType,
      payAmount,
      bankAcc,
      paymentType1,
      payAmount1,
      bankAcc1,
      paymentType2,
      payAmount2,
      bankAcc2,
      paymentType3,
      payAmount3,
      bankAcc3
    } = it;

    if (paymentType && payAmount) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType,
        amount: payAmount,
        selfBank: bankAcc || null,
        person: null,
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType1 && payAmount1) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType1,
        amount: payAmount1,
        selfBank: bankAcc1 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType2 && payAmount2) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType2,
        amount: payAmount2,
        selfBank: bankAcc2 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType3 && payAmount3) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType3,
        amount: payAmount3,
        selfBank: bankAcc3 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    result1.push(...bankTransferArr);
  });

  const result2 = [];
  newPayments.forEach(it => {
    const transfers = it.payments
      .filter(l => l.paymentType === 'transfer')
      .map(bItem => ({
        ...bItem,
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      }));
    result2.push(...transfers);
  });

  return [...result1, ...result2];
};

/**
 * Processes personal loan payments from an array of payment items.
 */
export const getPersonalLoanItem = arr => {
  // Filter for the "old" type of payment (no payments array)
  const oldPayments = arr.filter(
    l =>
      !l.deleted &&
      !l.payments &&
      l.total > 0 &&
      ((l.paymentType === 'pLoan' && l.payAmount) ||
        (l.paymentType1 === 'pLoan' && l.payAmount1) ||
        (l.paymentType2 === 'pLoan' && l.payAmount2) ||
        (l.paymentType3 === 'pLoan' && l.payAmount3))
  );

  // Filter for the "new" type (with a payments array)
  const newPayments = arr.filter(l => l.payments && !l.deleted);

  const result1 = [];
  oldPayments.forEach(it => {
    const personalLoanArr = [];
    const {
      paymentType,
      payAmount,
      paymentType1,
      payAmount1,
      paymentType2,
      payAmount2,
      paymentType3,
      payAmount3
    } = it;

    if (paymentType === 'pLoan' && payAmount) {
      personalLoanArr.push({
        key: personalLoanArr.length,
        id: personalLoanArr.length,
        paymentType,
        amount: payAmount,
        borrower: it.borrower || `${it.prefix || ''}${it.firstName || ''} ${it.lastName || ''}`.trim(),
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType1 === 'pLoan' && payAmount1) {
      personalLoanArr.push({
        key: personalLoanArr.length,
        id: personalLoanArr.length,
        paymentType: paymentType1,
        amount: payAmount1,
        borrower: it.borrower1 || `${it.prefix || ''}${it.firstName || ''} ${it.lastName || ''}`.trim(),
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType2 === 'pLoan' && payAmount2) {
      personalLoanArr.push({
        key: personalLoanArr.length,
        id: personalLoanArr.length,
        paymentType: paymentType2,
        amount: payAmount2,
        borrower: it.borrower2 || `${it.prefix || ''}${it.firstName || ''} ${it.lastName || ''}`.trim(),
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    if (paymentType3 === 'pLoan' && payAmount3) {
      personalLoanArr.push({
        key: personalLoanArr.length,
        id: personalLoanArr.length,
        paymentType: paymentType3,
        amount: payAmount3,
        borrower: it.borrower3 || `${it.prefix || ''}${it.firstName || ''} ${it.lastName || ''}`.trim(),
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      });
    }
    result1.push(...personalLoanArr);
  });

  const result2 = [];
  newPayments.forEach(it => {
    const loans = it.payments
      .filter(l => l.paymentType === 'pLoan')
      .map(lItem => ({
        ...lItem,
        borrower: lItem.borrower || `${it.prefix || ''}${it.firstName || ''} ${it.lastName || ''}`.trim(),
        incomeId: it.incomeId,
        deleted: it.deleted ?? false
      }));
    result2.push(...loans);
  });

  return [...result1, ...result2];
};

/* --------------------------------------------------------------------------
   API Functions
-------------------------------------------------------------------------- */

/**
 * Retrieves income, expense, bank deposit, and other related records.
 *
 * @param {string} branch - Branch code or "all"
 * @param {string} date - Date to query
 * @param {number} excludeParts - If set to 1, include/exclude parts-related payments
 */
export const getIncome = async (branch, date, excludeParts) => {
  try {
    const mDate = formatDate(date);

    let incomes = [];
    let expenses = [];
    let dailyChanges = [];
    let dailyVehicles = [];
    let dailyServices = [];
    let dailyParts = [];
    let dailyOthers = [];
    let afterDailyClosed = [];
    let afterAccountClosed = [];
    let dailyChangeItems = [];
    let bankTransfer = [];
    let duringDayMoney = [];
    let duringDayArr = [];
    let dailyChangeDeposit = 0;
    let partChangeDeposit = 0;
    let bankDeposit = [];
    let executiveCashDeposit = [];
    let personalLoan = [];

    let queries = [['date', '==', mDate]];
    let queries2 = [['incomeDate', '==', mDate]];
    if (branch !== 'all') {
      queries.push(['branchCode', '==', branch]);
      queries2.push(['branchCode', '==', branch]);
    }

    // Fetch data from Firebase
    const dailyChangeSnap = await checkCollection('sections/account/expenses', [
      ['expenseType', '==', 'dailyChange'],
      ...queries
    ]);
    const dailyVehicleSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'daily'],
      ['incomeSubCategory', '==', 'vehicles'],
      ...queries
    ]);
    const dailyServiceSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'daily'],
      ['incomeSubCategory', '==', 'service'],
      ...queries
    ]);
    const dailyPartsSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'daily'],
      ['incomeSubCategory', '==', 'parts'],
      ...queries
    ]);
    const dailyOtherSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'daily'],
      ['incomeSubCategory', '==', 'other'],
      ...queries
    ]);
    const afterDailyClosedSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'afterAccountClosed'],
      ...queries2
    ]);
    const afterAccountClosedSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'afterAccountClosed'],
      ...queries
    ]);
    const bankDepositSnap = await checkCollection('sections/account/bankDeposit', [
      ['depositDate', '==', mDate],
      ['branchCode', '==', branch]
    ]);
    const executiveCashDepositSnap = await checkCollection('sections/account/executiveCashDeposit', [
      ['depositDate', '==', mDate],
      ['branchCode', '==', branch]
    ]);

    // Process snapshots
    dailyChangeSnap &&
      dailyChangeSnap.forEach(doc => {
        dailyChanges.push({ ...doc.data(), expenseId: doc.id });
      });
    dailyVehicleSnap &&
      dailyVehicleSnap.forEach(doc => {
        dailyVehicles.push(doc.data());
      });
    dailyServiceSnap &&
      dailyServiceSnap.forEach(doc => {
        dailyServices.push(doc.data());
      });
    dailyPartsSnap &&
      dailyPartsSnap.forEach(doc => {
        dailyParts.push(doc.data());
      });
    dailyOtherSnap &&
      dailyOtherSnap.forEach(doc => {
        dailyOthers.push(doc.data());
      });
    afterDailyClosedSnap &&
      afterDailyClosedSnap.forEach(doc => {
        afterDailyClosed.push(doc.data());
      });
    afterAccountClosedSnap &&
      afterAccountClosedSnap.forEach(doc => {
        afterAccountClosed.push(doc.data());
      });
    bankDepositSnap &&
      bankDepositSnap.forEach(doc => {
        bankDeposit.push(doc.data());
      });
    executiveCashDepositSnap &&
      executiveCashDepositSnap.forEach(doc => {
        executiveCashDeposit.push(doc.data());
      });

    // Process daily change records
    if (dailyChanges.length > 0) {
      if (dailyChanges[0]?.items) {
        dailyChangeItems = dailyChanges[0].items.map(it => ({
          ...it,
          expenseId: dailyChanges[0].expenseId
        }));
      } else {
        const dailyChangeItemsSnap = await checkCollection('sections/account/expenseItems', [
          ['expenseId', '==', dailyChanges[0].expenseId]
        ]);
        dailyChangeItemsSnap && dailyChangeItemsSnap.forEach(doc => dailyChangeItems.push(doc.data()));
      }
      const totalDeposit = dailyChanges[0]?.changeDeposit
        ? Array.isArray(dailyChanges[0].changeDeposit)
          ? dailyChanges[0].changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0)
          : dailyChanges[0].changeDeposit
        : 0;
      incomes.push({
        id: incomes.length,
        key: incomes.length,
        expenseId: dailyChanges[0].expenseId,
        item: 'รับเงินทอน',
        receiverEmployee: dailyChanges[0].receiverEmployee || dailyChanges[0].inputBy,
        total: totalDeposit,
        details: '',
        remark: '',
        deleted: dailyChanges[0]?.deleted || false,
        changeDeposit: dailyChanges[0]?.changeDeposit || []
      });
      dailyChangeDeposit = totalDeposit;
    }

    // Process daily vehicle records
    dailyVehicles.forEach(dv => {
      let info = '';
      if (['down', 'cash', 'reservation'].includes(dv.incomeType)) {
        dv.items &&
          dv.items.forEach(it => {
            info += it.name || '';
          });
        info = `${info} ${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`.trim();
        incomes.push({
          id: incomes.length,
          key: incomes.length,
          incomeId: dv.incomeId,
          item: `รายรับ${AllIncomeType[dv.incomeType]} ${info}`,
          receiverEmployee: dv.receiverEmployee || dv.recordedBy || dv.createdBy,
          total: dv.total,
          details: info,
          remark: dv.remark,
          deleted: dv.deleted || false
        });
      } else if (dv.incomeType === 'baac') {
        const info2 = `${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`.trim();
        incomes.push({
          id: incomes.length,
          key: incomes.length,
          incomeId: dv.incomeId,
          item: `รายรับ${AllIncomeType[dv.incomeType]} ${info2}`,
          receiverEmployee: dv.receiverEmployee || dv.recordedBy || dv.createdBy,
          total: dv.total,
          details: dv.baacNo ? `เลขที่ใบ สกต./ธกส. ${dv.baacNo}` : '',
          remark: dv.remark,
          deleted: dv.deleted || false
        });
      } else {
        const info3 = `${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`.trim();
        incomes.push({
          id: incomes.length,
          key: incomes.length,
          incomeId: dv.incomeId,
          item: `รายรับ${AllIncomeType[dv.incomeType]} ${info3}`,
          receiverEmployee: dv.receiverEmployee || dv.recordedBy || dv.createdBy,
          total: dv.total,
          details: '',
          remark: dv.remark,
          deleted: dv.deleted || false
        });
      }
      // Record "during day" transfers if applicable
      if (dv.amtDuringDay && !dv.deleted) {
        duringDayMoney.push({
          item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
          value: dv.amtDuringDay,
          qty: 1
        });
        duringDayArr.push({
          date: dv.date,
          deleted: dv.deleted,
          incomeId: dv.incomeId,
          amtDuringDay: dv.amtDuringDay,
          receiverDuringDay: dv.receiverDuringDay
        });
      }
    });

    // Process daily other records
    dailyOthers.forEach(dv => {
      let info = '';
      if (dv.amtOther && Array.isArray(dv.amtOthers)) {
        dv.amtOthers.forEach(it => {
          info += ` รับเงิน${it.name || ''} ${it.total ? numeral(it.total).format('0,0.00') : ''}`;
        });
      }
      if (dv.deductOther && Array.isArray(dv.deductOthers)) {
        dv.deductOthers.forEach(it => {
          info += ` หัก${it.name || ''} ${it.total ? numeral(it.total).format('0,0.00') : ''}`;
        });
      }
      incomes.push({
        id: incomes.length,
        key: incomes.length,
        incomeId: dv.incomeId,
        item: `${dv.amtRebate ? `รับเงินคืน ${numeral(dv.amtRebate).format('0,0.00')}` : ''}${
          dv.amtExcess ? `รับเงินเกิน ${numeral(dv.amtExcess).format('0,0.00')}` : ''
        } ${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`.trim(),
        receiverEmployee: dv.receiverEmployee || dv.receiverDuringDay || dv.recordedBy || dv.createdBy,
        total: dv.total,
        details: info,
        remark: dv.remark,
        deleted: dv.deleted || false
      });
      if (dv.amtDuringDay && !dv.deleted) {
        duringDayMoney.push({
          item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
          value: dv.amtDuringDay,
          qty: 1
        });
        duringDayArr.push({
          date: dv.date,
          deleted: dv.deleted,
          incomeId: dv.incomeId,
          amtDuringDay: dv.amtDuringDay,
          receiverDuringDay: dv.receiverDuringDay
        });
      }
    });

    // Process daily service records
    dailyServices.forEach(dv => {
      let info = dv.vehicleRegNumber ? `ทะเบียนรถ ${dv.vehicleRegNumber}` : '';
      if (dv.incomeType !== 'repairDeposit' && dv.items) {
        dv.items.forEach(it => {
          info += ` ${it.item || ''}`;
        });
      }
      incomes.push({
        id: incomes.length,
        key: incomes.length,
        incomeId: dv.incomeId,
        item: `รายรับงานช่างบริการ${
          IncomeServiceCategories[dv.incomeType]
        } ${moment(dv.date, 'YYYY-MM-DD').format('D/M/YY')}`,
        receiverEmployee: dv.receiverEmployee || dv.technicianId,
        total: dv.total,
        details: info,
        remark: dv.remark,
        deleted: dv.deleted || false
      });
      if (dv.amtDuringDay && !dv.deleted) {
        duringDayMoney.push({
          item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
          value: dv.amtDuringDay,
          qty: 1
        });
        duringDayArr.push({
          date: dv.date,
          deleted: dv.deleted,
          incomeId: dv.incomeId,
          amtDuringDay: dv.amtDuringDay,
          receiverDuringDay: dv.receiverDuringDay
        });
      }
    });

    // Process daily parts if excludeParts is enabled
    if (dailyParts.length > 0 && excludeParts === 1) {
      const partChangeDepositArr = dailyParts.filter(l => l.incomeType === 'partChange');
      if (partChangeDepositArr.length > 0) {
        partChangeDeposit = partChangeDepositArr[0].total;
      }
      dailyParts.forEach(dp => {
        incomes.push({
          id: incomes.length,
          key: incomes.length,
          incomeId: dp.incomeId,
          item: `${dp.incomeType !== 'partChange' ? 'รับเงิน' : ''}${IncomePartCategories[dp.incomeType]}`,
          receiverEmployee: dp.receiverEmployee || dp.createdBy,
          total: dp.total,
          details: '',
          remark: dp.remark,
          deleted: dp.deleted || false
        });
        if (dp.amtDuringDay && !dp.deleted) {
          duringDayMoney.push({
            item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dp.incomeNo || ''}`.trim(),
            value: dp.amtDuringDay,
            qty: 1
          });
          duringDayArr.push({
            date: dp.date,
            deleted: dp.deleted,
            incomeId: dp.incomeId,
            amtDuringDay: dp.amtDuringDay,
            receiverDuringDay: dp.receiverDuringDay
          });
        }
      });
    }

    // Process expense records from daily change items
    dailyChangeItems.forEach(dv => {
      const pDeleted = dailyChanges.find(l => l.expenseId === dv?.expenseId)?.deleted || false;
      expenses.push({
        id: expenses.length,
        key: expenses.length,
        expenseId: dv.expenseId,
        expenseItemId: dv._key,
        item: dv.expenseName,
        payer: dv.payer,
        total: dv.total,
        priceType: dv.priceType,
        details: '',
        remark: dv.remark,
        deleted: pDeleted || dv.deleted || false,
        isChevrolet: dv.isChevrolet || false
      });
    });

    // Process bank transfer payments from different sources
    const vehicleBankTransfer = getBankTransferItem(dailyVehicles);
    const serviceBankTransfer = getBankTransferItem(dailyServices);
    bankTransfer = bankTransfer.concat(vehicleBankTransfer, serviceBankTransfer);
    if (excludeParts === 1) {
      const partBankTransfer = getBankTransferItem(dailyParts);
      bankTransfer = bankTransfer.concat(partBankTransfer);
    }
    const otherBankTransfer = getBankTransferItem(dailyOthers);
    bankTransfer = bankTransfer.concat(otherBankTransfer);

    // Process personal loan payments from different sources
    const vehiclePersonalLoan = getPersonalLoanItem(dailyVehicles);
    const servicePersonalLoan = getPersonalLoanItem(dailyServices);
    personalLoan = personalLoan.concat(vehiclePersonalLoan, servicePersonalLoan);
    if (excludeParts === 1) {
      const partPersonalLoan = getPersonalLoanItem(dailyParts);
      personalLoan = personalLoan.concat(partPersonalLoan);
    }
    const otherPersonalLoan = getPersonalLoanItem(dailyOthers);
    personalLoan = personalLoan.concat(otherPersonalLoan);

    // Deduplicate "during day" money items
    duringDayMoney = distinctArr(duringDayMoney, ['item'], ['value', 'qty']).map(it => ({
      item: `${it.item} ${it.qty ? `${it.qty} รายการ` : ''}`,
      value: it.value
    }));

    return {
      dailyChangeDeposit,
      partChangeDeposit,
      bankTransfer,
      personalLoan,
      incomes,
      expenses,
      afterDailyClosed,
      afterAccountClosed,
      duringDayMoney,
      duringDayArr,
      bankDeposit,
      executiveCashDeposit
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves only the parts-related income records.
 *
 * @param {string} branch - Branch code or "all"
 * @param {string} date - Date to query
 */
export const getIncome_Parts = async (branch, date) => {
  try {
    const mDate = formatDate(date);

    let incomes = [];
    let expenses = [];
    let dailyChanges = [];
    let dailyParts = [];
    let afterDailyClosed = [];
    let afterAccountClosed = [];
    let dailyChangeItems = [];
    let bankTransfer = [];
    let duringDayMoney = [];
    let duringDayArr = [];
    let dailyChangeDeposit = 0;
    let partChangeDeposit = 0;
    let bankDeposit = [];
    let executiveCashDeposit = [];
    let personalLoan = [];

    let queries = [['date', '==', mDate]];
    let queries2 = [['incomeDate', '==', mDate]];
    if (branch !== 'all') {
      queries.push(['branchCode', '==', branch]);
      queries2.push(['branchCode', '==', branch]);
    }

    const dailyChangeSnap = await checkCollection('sections/account/expenses', [
      ['expenseType', '==', 'dailyChange'],
      ...queries
    ]);
    const dailyPartsSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'daily'],
      ['incomeSubCategory', '==', 'parts'],
      ...queries
    ]);
    const afterDailyClosedSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'afterAccountClosed'],
      ...queries2
    ]);
    const afterAccountClosedSnap = await checkCollection('sections/account/incomes', [
      ['incomeCategory', '==', 'afterAccountClosed'],
      ...queries
    ]);
    const bankDepositSnap = await checkCollection('sections/account/bankDeposit', [
      ['depositDate', '==', mDate],
      ['branchCode', '==', branch]
    ]);
    const executiveCashDepositSnap = await checkCollection('sections/account/executiveCashDeposit', [
      ['depositDate', '==', mDate],
      ['branchCode', '==', branch]
    ]);

    dailyChangeSnap &&
      dailyChangeSnap.forEach(doc => {
        dailyChanges.push({ ...doc.data(), expenseId: doc.id });
      });
    dailyPartsSnap &&
      dailyPartsSnap.forEach(doc => {
        dailyParts.push(doc.data());
      });
    afterDailyClosedSnap &&
      afterDailyClosedSnap.forEach(doc => {
        afterDailyClosed.push(doc.data());
      });
    afterAccountClosedSnap &&
      afterAccountClosedSnap.forEach(doc => {
        afterAccountClosed.push(doc.data());
      });
    bankDepositSnap &&
      bankDepositSnap.forEach(doc => {
        bankDeposit.push(doc.data());
      });
    executiveCashDepositSnap &&
      executiveCashDepositSnap.forEach(doc => {
        executiveCashDeposit.push(doc.data());
      });

    if (dailyChanges.length > 0) {
      if (dailyChanges[0]?.items) {
        dailyChangeItems = dailyChanges[0].items;
      } else {
        const dailyChangeItemsSnap = await checkCollection('sections/account/expenseItems', [
          ['expenseId', '==', dailyChanges[0].expenseId]
        ]);
        dailyChangeItemsSnap && dailyChangeItemsSnap.forEach(doc => dailyChangeItems.push(doc.data()));
      }
      const totalDeposit = dailyChanges[0]?.changeDeposit
        ? Array.isArray(dailyChanges[0].changeDeposit)
          ? dailyChanges[0].changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0)
          : dailyChanges[0].changeDeposit
        : 0;
      incomes.push({
        id: incomes.length,
        key: incomes.length,
        expenseId: dailyChanges[0].expenseId,
        item: 'รับเงินทอน',
        receiverEmployee: dailyChanges[0].receiverEmployee || dailyChanges[0].inputBy,
        total: totalDeposit,
        details: '',
        remark: '',
        deleted: dailyChanges[0]?.deleted || false
      });
      dailyChangeDeposit = totalDeposit;
    }

    if (dailyParts.length > 0) {
      const partChangeDepositArr = dailyParts.filter(l => l.incomeType === 'partChange');
      if (partChangeDepositArr.length > 0) {
        partChangeDeposit = partChangeDepositArr[0].total;
      }
      dailyParts.forEach(dp => {
        incomes.push({
          id: incomes.length,
          key: incomes.length,
          incomeId: dp.incomeId,
          item: `${dp.incomeType !== 'partChange' ? 'รับเงิน' : ''}${IncomePartCategories[dp.incomeType]}`,
          receiverEmployee: dp.receiverEmployee || dp.createdBy,
          total: dp.total,
          details: '',
          remark: dp.remark,
          deleted: dp.deleted || false
        });
        if (dp.amtDuringDay && !dp.deleted) {
          duringDayMoney.push({
            item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dp.incomeNo || ''}`.trim(),
            value: dp.amtDuringDay,
            qty: 1
          });
          duringDayArr.push({
            date: dp.date,
            deleted: dp.deleted,
            incomeId: dp.incomeId,
            amtDuringDay: dp.amtDuringDay,
            receiverDuringDay: dp.receiverDuringDay
          });
        }
      });
    }

    dailyChangeItems.forEach(dv => {
      const pDeleted = dailyChanges.find(l => l.expenseId === dv?.expenseId)?.deleted || false;
      expenses.push({
        id: expenses.length,
        key: expenses.length,
        expenseId: dv.expenseId,
        expenseItemId: dv._key,
        item: dv.expenseName,
        payer: dv.payer,
        total: dv.total,
        priceType: dv.priceType,
        details: '',
        remark: dv.remark,
        deleted: pDeleted || dv.deleted || false,
        isChevrolet: dv.isChevrolet || false
      });
    });

    const partBankTransfer = getBankTransferItem(dailyParts);
    bankTransfer = bankTransfer.concat(partBankTransfer);

    // Process personal loan payments from parts
    const partPersonalLoan = getPersonalLoanItem(dailyParts);
    personalLoan = personalLoan.concat(partPersonalLoan);

    duringDayMoney = distinctArr(duringDayMoney, ['item'], ['value', 'qty']).map(it => ({
      item: `${it.item} ${it.qty ? `${it.qty} รายการ` : ''}`,
      value: it.value
    }));

    return {
      dailyChangeDeposit,
      partChangeDeposit,
      bankTransfer,
      personalLoan,
      incomes,
      expenses,
      afterDailyClosed,
      afterAccountClosed,
      duringDayMoney,
      duringDayArr,
      bankDeposit,
      executiveCashDeposit
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves an income record by its record ID.
 *
 * @param {string} recordId - The income record ID.
 */
export const getIncomeRecordValues = recordId =>
  new Promise(async (r, j) => {
    try {
      const recordSnap = await checkCollection('sections/account/incomes', [['incomeId', '==', recordId]]);
      if (recordSnap) {
        recordSnap.forEach(doc => {
          r(doc.data());
        });
      }
      r(false);
    } catch (e) {
      j(e);
    }
  });

/**
 * Retrieves an expense record by its record ID.
 *
 * @param {string} recordId - The expense record ID.
 */
export const getExpenseRecordValues = recordId =>
  new Promise(async (r, j) => {
    try {
      const recordSnap = await checkCollection('sections/account/expenses', [['expenseId', '==', recordId]]);
      if (recordSnap) {
        recordSnap.forEach(doc => {
          r(doc.data());
        });
      }
      r(false);
    } catch (e) {
      j(e);
    }
  });
