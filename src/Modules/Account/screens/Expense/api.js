import { DateRange } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { showLog, showWarn } from 'functions';
import moment from 'moment';

export const getExpenses2 = (firestore, br, sDate, eType, collection) =>
  new Promise(async (r, j) => {
    try {
      let expenseArr = [];
      let expensesRef = firestore
        .collection(collection ? `sections/account/${collection}` : 'sections/account/expenses')
        .where('branchCode', '==', br)
        .where('date', '==', moment(sDate).format('YYYY-MM-DD'))
        .where('expenseType', '==', eType);
      let cSnap = await expensesRef.get();
      //  showLog('itemSnap', cSnap);
      if (cSnap.empty) {
        showWarn('No document');
        r(expenseArr);
        return;
      }
      cSnap.forEach(doc => {
        // showLog('item', doc.data());
        let expense = doc.data();
        expense._key = doc.id;
        expense.key = doc.id;
        expenseArr.push(expense);
      });
      expenseArr = expenseArr.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(expenseArr));
      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, 'time');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      r(mOrders);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getExpenses1 = (firestore, br, rng, sDate, eDate, eType, collection) =>
  new Promise(async (r, j) => {
    try {
      //  showLog({ br, rng, sDate, eDate });
      let expenseArr = [];
      let expensesRef =
        br === 'all'
          ? firestore.collection(collection ? `sections/account/${collection}` : 'sections/account/expenses')
          : firestore
              .collection(collection ? `sections/account/${collection}` : 'sections/account/expenses')
              .where('branchCode', '==', br)
              .where('expenseType', '==', eType);

      switch (rng) {
        case DateRange.today:
          expensesRef = expensesRef.where('date', '==', moment().format('YYYY-MM-DD'));
          break;
        case DateRange.thisWeek:
          expensesRef = expensesRef.where('date', '>=', moment().startOf('week').format('YYYY-MM-DD'));
          break;
        case DateRange.thisMonth:
          expensesRef = expensesRef.where('date', '>=', moment().startOf('month').format('YYYY-MM-DD'));
          break;
        case DateRange.sevenDays:
          expensesRef = expensesRef.where('date', '>=', moment().subtract(7, 'days').format('YYYY-MM-DD'));
          break;
        case DateRange.thirtyDays:
          expensesRef = expensesRef.where('date', '>=', moment().subtract(30, 'days').format('YYYY-MM-DD'));
          break;
        case DateRange.custom:
          expensesRef = expensesRef
            .where('date', '>=', moment(sDate).format('YYYY-MM-DD'))
            .where('date', '<=', moment(eDate).format('YYYY-MM-DD'));
          break;

        default:
          break;
      }

      let cSnap = await expensesRef.get();
      //  showLog('itemSnap', cSnap);
      if (cSnap.empty) {
        showWarn('No document');
        r(expenseArr);
        return;
      }
      cSnap.forEach(doc => {
        // showLog('item', doc.data());
        let expense = doc.data();
        expense._key = doc.id;
        expense.key = doc.id;
        expenseArr.push(expense);
      });
      expenseArr = expenseArr.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(expenseArr));
      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, 'time');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      r(mOrders);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getExpenseArr = expenseId =>
  new Promise(async (r, j) => {
    try {
      let items = [];
      const itemsSnap = await checkCollection('expenseItems', [['expenseId', '==', expenseId]]);
      if (!itemsSnap) {
        return r([]);
      }
      itemsSnap.forEach(doc => {
        let item = doc.data();
        item.key = items.length;
        item.id = items.length;
        items.push(item);
      });
      r(items);
    } catch (e) {
      j(e);
    }
  });

export const checkExistingExpense = wheres =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let result = {};
      const snap = await checkCollection('sections/account/expenses', wheres, 'expenseId', 1);
      if (snap) {
        snap.forEach(doc => {
          arr.push({
            ...doc.data(),
            _key: doc.id,
            id: arr.length,
            key: arr.length
          });
        });
        showLog({ existing_array: arr });
        if (arr.length > 0) {
          result = arr[0];
        }
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });
