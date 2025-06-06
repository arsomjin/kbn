import React from 'react';
import { AllIncomeType } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { showLog } from 'functions';
import moment from 'moment';
import numeral from 'numeral';
import { Tag } from 'antd';
import { IncomeServiceCategories } from 'data/Constant';
import { distinctArr } from 'functions';
import { IncomePartCategories } from 'data/Constant';
import { formatDate } from 'functions';
import { Numb } from 'functions';
import EditableRowTable from 'components/EditableRowTable';
import { getNameFromUid } from 'Modules/Utils';
import { Col, Row } from 'shards-react';
import { TableSummary } from 'api/Table';

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

const getChangeDepositColumns = (users, employees) => [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เวลา',
    dataIndex: 'time',
    render: ts => moment(ts).format('lll'),
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

export const expandedRowRender = (record, users, employees) => {
  showLog({ record });
  return !!record?.item && record.item === 'รับเงินทอน' ? (
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
  ) : (
    <div className="ml-4 bg-light bordered pb-1">
      {record?.details && <Tag>{`${record.details}`}</Tag>}
      {record?.remark && <Tag>{`หมายเหตุ: ${record.remark}`}</Tag>}
    </div>
  );
};

export const getBankTransferItem = arr => {
  let mArr = [...arr];
  let arr1 = mArr.filter(
    l =>
      !l.deleted &&
      !l.payments &&
      l.total > 0 &&
      ((l.paymentType === 'transfer' && !!l.bankAcc) ||
        (l.paymentType1 === 'transfer' && !!l.bankAcc1) ||
        (l.paymentType2 === 'transfer' && !!l.bankAcc2) ||
        (l.paymentType3 === 'transfer' && !!l.bankAcc3))
  ); // Old type of payment
  let arr2 = mArr.filter(l => l.payments && !l.deleted);
  // Old type.
  let result1 = [];
  arr1.map((it, i) => {
    let bankTransferArr = [];
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
    if (!!paymentType && !!payAmount) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType || null,
        amount: payAmount,
        selfBank: bankAcc || null,
        person: null,
        incomeId: it.incomeId,
        deleted: typeof it.deleted !== 'undefined' ? it.deleted : false
      });
    }
    if (!!paymentType1 && !!payAmount1) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType1 || null,
        amount: payAmount1,
        selfBank: bankAcc1 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: typeof it.deleted !== 'undefined' ? it.deleted : false
      });
    }
    if (!!paymentType2 && !!payAmount2) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType2 || null,
        amount: payAmount2,
        selfBank: bankAcc2 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: typeof it.deleted !== 'undefined' ? it.deleted : false
      });
    }
    if (!!paymentType3 && !!payAmount3) {
      bankTransferArr.push({
        key: bankTransferArr.length,
        id: bankTransferArr.length,
        paymentType: paymentType3 || null,
        amount: payAmount3,
        selfBank: bankAcc3 || null,
        person: null,
        incomeId: it.incomeId,
        deleted: typeof it.deleted !== 'undefined' ? it.deleted : false
      });
    }
    result1 = result1.concat(bankTransferArr);
    return it;
  });
  // New type.
  let result2 = [];
  arr2.map((it, i) => {
    let tArr = it.payments
      .filter(l => l.paymentType === 'transfer')
      // .filter((l) => l.paymentType === 'transfer' && !!l.selfBank)
      .map(bItem => ({
        ...bItem,
        incomeId: it.incomeId,
        deleted: typeof it.deleted !== 'undefined' ? it.deleted : false
      }));
    result2 = result2.concat(tArr);
    return it;
  });
  return result1.concat(result2);
};

export const getIncome = (branch, date, excludeParts) =>
  new Promise(async (r, j) => {
    try {
      const mDate = formatDate(date);
      // showLog({ branch, date, excludeParts, mDate });

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

      let queries = [['date', '==', mDate]];
      let queries2 = [['incomeDate', '==', mDate]];
      if (branch !== 'all') {
        queries = [...queries, ['branchCode', '==', branch]];
        queries2 = [...queries2, ['branchCode', '==', branch]];
      }
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
      // showLog({ branch, mDate, excludeParts, dailyVehicleSnap });
      if (dailyChangeSnap) {
        dailyChangeSnap.forEach(doc => {
          dailyChanges.push({ ...doc.data(), expenseId: doc.id });
        });
      }
      if (dailyVehicleSnap) {
        dailyVehicleSnap.forEach(doc => {
          dailyVehicles.push(doc.data());
        });
      }
      if (dailyServiceSnap) {
        dailyServiceSnap.forEach(doc => {
          dailyServices.push(doc.data());
        });
      }
      if (dailyPartsSnap) {
        dailyPartsSnap.forEach(doc => {
          dailyParts.push(doc.data());
        });
      }
      if (dailyOtherSnap) {
        dailyOtherSnap.forEach(doc => {
          dailyOthers.push(doc.data());
        });
      }
      if (afterDailyClosedSnap) {
        afterDailyClosedSnap.forEach(doc => {
          afterDailyClosed.push(doc.data());
        });
      }
      if (afterAccountClosedSnap) {
        afterAccountClosedSnap.forEach(doc => {
          afterAccountClosed.push(doc.data());
        });
      }
      if (bankDepositSnap) {
        bankDepositSnap.forEach(doc => {
          bankDeposit.push(doc.data());
        });
      }
      // showLog({ dailyChanges });
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

          if (dailyChangeItemsSnap) {
            dailyChangeItemsSnap.forEach(doc => {
              dailyChangeItems.push(doc.data());
            });
            //  showLog({ dailyChangeItems });
          }
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
      if (dailyVehicles.length > 0) {
        showLog({ dailyVehicles });
        dailyVehicles.map((dv, n) => {
          switch (dv.incomeType) {
            case 'down':
            case 'cash':
            case 'reservation':
              let models = '';
              dv.items &&
                dv.items.map((it, i) => {
                  models = `${models}${it.name || ''}`;
                  return it;
                });
              let info = `${models} ${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`;
              incomes.push({
                id: incomes.length,
                key: incomes.length,
                incomeId: dv.incomeId,
                item: `รายรับ${AllIncomeType[dv.incomeType]} ${info}`,
                receiverEmployee: dv.receiverEmployee || dv?.recordedBy || dv.createdBy,
                total: dv.total,
                details: info,
                remark: dv.remark,
                deleted: dv?.deleted || false
              });
              break;
            case 'baac':
              let info2 = `${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`;
              incomes.push({
                id: incomes.length,
                key: incomes.length,
                incomeId: dv.incomeId,
                item: `รายรับ${AllIncomeType[dv.incomeType]} ${info2}`,
                receiverEmployee: dv.receiverEmployee || dv?.recordedBy || dv.createdBy,
                total: dv.total,
                details: dv.baacNo ? `เลขที่ใบ สกต./ธกส. ${dv.baacNo}` : '',
                remark: dv.remark,
                deleted: dv?.deleted || false
              });
              break;
            default:
              let info3 = `${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`;
              incomes.push({
                id: incomes.length,
                key: incomes.length,
                incomeId: dv.incomeId,
                item: `รายรับ${AllIncomeType[dv.incomeType]} ${info3}`,
                receiverEmployee: dv.receiverEmployee || dv?.recordedBy || dv.createdBy,
                total: dv.total,
                details: '',
                remark: dv.remark,
                deleted: dv?.deleted || false
              });
              break;
          }
          if (dv.amtDuringDay) {
            // มีรายการส่งเงินระหว่างวัน
            showLog('amtDuringDay_dailyVehicles', dv.amtDuringDay);
            if (!dv.deleted) {
              duringDayMoney.push({
                item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
                value: dv.amtDuringDay
              });
            }
            duringDayArr.push({
              date: dv.date,
              deleted: dv.deleted,
              incomeId: dv.incomeId,
              amtDuringDay: dv.amtDuringDay,
              receiverDuringDay: dv.receiverDuringDay
            });
          }
          return dv;
        });
      }
      if (dailyOthers.length > 0) {
        dailyOthers.map((dv, n) => {
          let info = '';
          dv.amtOther &&
            dv.amtOthers.map((it, i) => {
              info = `${info}${it.name ? ` รับเงิน${it.name}` : ''} ${
                it.total ? numeral(it.total).format('0,0.00') : ''
              }`;
              return it;
            });
          dv.deductOther &&
            dv.deductOthers.map((it, i) => {
              info = `${info}${it.name ? ` หัก${it.name}` : ''} ${it.total ? numeral(it.total).format('0,0.00') : ''}`;
              return it;
            });
          incomes.push({
            id: incomes.length,
            key: incomes.length,
            incomeId: dv.incomeId,
            item: `${dv.amtRebate ? `รับเงินคืน ${numeral(dv.amtRebate).format('0,0.00')}` : ''}${
              dv.amtExcess ? `รับเงินเกิน ${numeral(dv.amtExcess).format('0,0.00')}` : ''
            } ${dv.prefix || ''}${dv.firstName || ''} ${dv.lastName || ''}`,
            receiverEmployee: dv.receiverEmployee || dv?.receiverDuringDay || dv?.recordedBy || dv.createdBy,
            total: dv.total,
            details: info,
            remark: dv.remark,
            deleted: dv?.deleted || false
          });
          if (dv.amtDuringDay) {
            // มีรายการส่งเงินระหว่างวัน
            showLog('amtDuringDay_dailyOther', dv.amtDuringDay);
            if (!dv.deleted) {
              duringDayMoney.push({
                item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
                value: dv.amtDuringDay
              });
            }
            duringDayArr.push({
              date: dv.date,
              deleted: dv.deleted,
              incomeId: dv.incomeId,
              amtDuringDay: dv.amtDuringDay,
              receiverDuringDay: dv.receiverDuringDay
            });
          }
        });
      }
      if (dailyServices.length > 0) {
        dailyServices.map((dv, n) => {
          let info = dv.vehicleRegNumber ? `ทะเบียนรถ ${dv.vehicleRegNumber}` : '';
          if (dv.incomeType !== 'repairDeposit') {
            dv.items &&
              dv.items.map((it, i) => {
                info = `${info} ${it.item || ''}`;
                return it;
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
            deleted: dv?.deleted || false
          });
          if (dv.amtDuringDay) {
            // มีรายการส่งเงินระหว่างวัน
            showLog('amtDuringDay_dailyServices', dv.amtDuringDay);
            if (!dv.deleted) {
              duringDayMoney.push({
                item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dv.incomeNo || ''}`.trim(),
                value: dv.amtDuringDay
              });
            }
            duringDayArr.push({
              date: dv.date,
              deleted: dv.deleted,
              incomeId: dv.incomeId,
              amtDuringDay: dv.amtDuringDay,
              receiverDuringDay: dv.receiverDuringDay
            });
          }
          return dv;
        });
      }
      if (dailyParts.length > 0 && excludeParts === 1) {
        let partChangeDepositArr = dailyParts.filter(l => l.incomeType === 'partChange');
        if (partChangeDepositArr.length > 0) {
          partChangeDeposit = partChangeDepositArr[0].total;
        }
        dailyParts.map((dp, i) => {
          incomes.push({
            id: incomes.length,
            key: incomes.length,
            incomeId: dp.incomeId,
            item: `${dp.incomeType !== 'partChange' ? 'รับเงิน' : ''}${IncomePartCategories[dp.incomeType]}`,
            receiverEmployee: dp.receiverEmployee || dp.createdBy,
            total: dp.total,
            details: '',
            remark: dp.remark,
            deleted: dp?.deleted || false
          });
          // มีรายการส่งเงินระหว่างวัน
          showLog('amtDuringDay_dailyParts', dp.amtDuringDay);
          if (dp.amtDuringDay) {
            if (!dp.deleted) {
              duringDayMoney.push({
                item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dp.incomeNo || ''}`,
                value: dp.amtDuringDay
              });
            }
            duringDayArr.push({
              date: dp.date,
              deleted: dp.deleted,
              incomeId: dp.incomeId,
              amtDuringDay: dp.amtDuringDay,
              receiverDuringDay: dp.receiverDuringDay
            });
          }
          return dp;
        });
      }
      if (dailyChangeItems.length > 0) {
        // showLog({
        //   DAILY_CHANGE_ITEMS: dailyChangeItems,
        //   DAILY_CHANGE: dailyChanges,
        // });
        dailyChangeItems.map((dv, n) => {
          let pId = dailyChanges.findIndex(l => l.expenseId === dv?.expenseId);
          let pDeleted = false;
          if (pId > -1) {
            pDeleted = !!dailyChanges[pId]?.deleted;
          }
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
            deleted: pDeleted || dv?.deleted || false,
            isChevrolet: dv?.isChevrolet || false
          });
          return dv;
        });
      }
      // Transfer payment
      let vehicleBankTransfer = getBankTransferItem(dailyVehicles);
      showLog({ vehicleBankTransfer });
      bankTransfer = bankTransfer.concat(vehicleBankTransfer);
      let serviceBankTransfer = getBankTransferItem(dailyServices);
      showLog({ dailyServices, serviceBankTransfer });
      bankTransfer = bankTransfer.concat(serviceBankTransfer);
      let partBankTransfer = [];
      if (excludeParts === 1) {
        partBankTransfer = getBankTransferItem(dailyParts);
        bankTransfer = bankTransfer.concat(partBankTransfer);
      }
      let otherBankTransfer = getBankTransferItem(dailyOthers);
      bankTransfer = bankTransfer.concat(otherBankTransfer);
      duringDayMoney = distinctArr(
        duringDayMoney.map(l => ({ ...l, qty: 1 })),
        ['item'],
        ['value', 'qty']
      ).map(it => ({
        item: `${it.item} ${!!it?.qty ? `${it.qty} รายการ` : ''}`,
        value: it.value
      }));
      showLog({ bankTransfer });
      r({
        dailyChangeDeposit,
        partChangeDeposit,
        bankTransfer,
        incomes,
        expenses,
        afterDailyClosed,
        afterAccountClosed,
        duringDayMoney,
        duringDayArr,
        bankDeposit
      });
    } catch (e) {
      j(e);
    }
  });

export const getIncome_Parts = (branch, date) =>
  new Promise(async (r, j) => {
    // เฉพาะอะไหล่
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

      let queries = [['date', '==', mDate]];
      let queries2 = [['incomeDate', '==', mDate]];
      if (branch !== 'all') {
        queries = [...queries, ['branchCode', '==', branch]];
        queries2 = [...queries2, ['branchCode', '==', branch]];
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
      // showLog({ branch, mDate, excludeParts, dailyVehicleSnap });
      if (dailyChangeSnap) {
        dailyChangeSnap.forEach(doc => {
          dailyChanges.push({ ...doc.data(), expenseId: doc.id });
        });
      }
      if (dailyPartsSnap) {
        dailyPartsSnap.forEach(doc => {
          dailyParts.push(doc.data());
        });
      }
      if (afterDailyClosedSnap) {
        afterDailyClosedSnap.forEach(doc => {
          afterDailyClosed.push(doc.data());
        });
      }
      if (afterAccountClosedSnap) {
        afterAccountClosedSnap.forEach(doc => {
          afterAccountClosed.push(doc.data());
        });
      }
      if (bankDepositSnap) {
        bankDepositSnap.forEach(doc => {
          bankDeposit.push(doc.data());
        });
      }
      // showLog({ dailyChanges });
      if (dailyChanges.length > 0) {
        if (dailyChanges[0]?.items) {
          dailyChangeItems = dailyChanges[0].items;
        } else {
          const dailyChangeItemsSnap = await checkCollection('sections/account/expenseItems', [
            ['expenseId', '==', dailyChanges[0].expenseId]
          ]);

          if (dailyChangeItemsSnap) {
            dailyChangeItemsSnap.forEach(doc => {
              dailyChangeItems.push(doc.data());
            });
            //  showLog({ dailyChangeItems });
          }
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
        let partChangeDepositArr = dailyParts.filter(l => l.incomeType === 'partChange');
        if (partChangeDepositArr.length > 0) {
          partChangeDeposit = partChangeDepositArr[0].total;
        }
        dailyParts.map((dp, i) => {
          incomes.push({
            id: incomes.length,
            key: incomes.length,
            incomeId: dp.incomeId,
            item: `${dp.incomeType !== 'partChange' ? 'รับเงิน' : ''}${IncomePartCategories[dp.incomeType]}`,
            receiverEmployee: dp.receiverEmployee || dp.createdBy,
            total: dp.total,
            details: '',
            remark: dp.remark,
            deleted: dp?.deleted || false
          });
          if (dp.amtDuringDay) {
            // มีรายการส่งเงินระหว่างวัน
            showLog('amtDuringDay_partChange', dp.amtDuringDay);
            if (!dp.deleted) {
              duringDayMoney.push({
                item: `หัก ส่งเงิน การเงินในระหว่างวัน ${dp.incomeNo || ''}`,
                value: dp.amtDuringDay
              });
            }
            duringDayArr.push({
              date: dp.date,
              deleted: dp.deleted,
              incomeId: dp.incomeId,
              amtDuringDay: dp.amtDuringDay,
              receiverDuringDay: dp.receiverDuringDay
            });
          }
          return dp;
        });
      }
      if (dailyChangeItems.length > 0) {
        dailyChangeItems.map((dv, n) => {
          let pId = dailyChanges.findIndex(l => l.expenseId === dv?.expenseId);
          let pDeleted = false;
          if (pId > -1) {
            pDeleted = !!dailyChanges[pId]?.deleted;
          }
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
            deleted: pDeleted || dv?.deleted || false,
            isChevrolet: dv?.isChevrolet || false
          });
          return dv;
        });
      }
      // Transfer payment
      let partBankTransfer = [];
      partBankTransfer = getBankTransferItem(dailyParts);
      bankTransfer = bankTransfer.concat(partBankTransfer);
      duringDayMoney = distinctArr(
        duringDayMoney.map(l => ({ ...l, qty: 1 })),
        ['item'],
        ['value', 'qty']
      ).map(it => ({
        item: `${it.item} ${!!it?.qty ? `${it.qty} รายการ` : ''}`,
        value: it.value
      }));

      r({
        dailyChangeDeposit,
        partChangeDeposit,
        bankTransfer,
        incomes,
        expenses,
        afterDailyClosed,
        afterAccountClosed,
        duringDayMoney,
        duringDayArr,
        bankDeposit
      });
    } catch (e) {
      j(e);
    }
  });

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
