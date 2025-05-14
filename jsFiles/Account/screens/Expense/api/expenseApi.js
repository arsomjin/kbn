import { DateRange } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { showLog, showWarn } from 'functions';
import moment from 'moment';

/**
 * Get expenses for a specific date and type.
 * @param {object} firestore - Firestore instance
 * @param {string} branchCode
 * @param {string} date
 * @param {string} expenseType
 * @param {string} [collection]
 * @returns {Promise<Array>} Sorted expense array
 */
export const getExpensesByDate = async (firestore, branchCode, date, expenseType, collection) => {
  try {
    let expenseArr = [];
    let expensesRef = firestore
      .collection(
        collection
          ? `sections/account/${collection}`
          : 'sections/account/expenses'
      )
      .where('branchCode', '==', branchCode)
      .where('date', '==', moment(date).format('YYYY-MM-DD'))
      .where('expenseType', '==', expenseType);
    let cSnap = await expensesRef.get();
    if (cSnap.empty) {
      showWarn('No document');
      return expenseArr;
    }
    cSnap.forEach((doc) => {
      let expense = doc.data();
      expense._key = doc.id;
      expense.key = doc.id;
      expenseArr.push(expense);
    });
    expenseArr = expenseArr.map((order, id) => ({ ...order, id: id + 1 }));
    let mOrders = JSON.parse(JSON.stringify(expenseArr));
    mOrders = sortArr(mOrders, 'time');
    mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
    return mOrders;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

/**
 * Get expenses by date range and type.
 * @param {object} firestore - Firestore instance
 * @param {string} branchCode
 * @param {string} range - DateRange enum
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} expenseType
 * @param {string} [collection]
 * @returns {Promise<Array>} Sorted expense array
 */
export const getExpensesByRange = async (firestore, branchCode, range, startDate, endDate, expenseType, collection) => {
  try {
    let expenseArr = [];
    let expensesRef =
      branchCode === 'all'
        ? firestore.collection(
            collection
              ? `sections/account/${collection}`
              : 'sections/account/expenses'
          )
        : firestore
            .collection(
              collection
                ? `sections/account/${collection}`
                : 'sections/account/expenses'
            )
            .where('branchCode', '==', branchCode)
            .where('expenseType', '==', expenseType);

    switch (range) {
      case DateRange.today:
        expensesRef = expensesRef.where(
          'date',
          '==',
          moment().format('YYYY-MM-DD')
        );
        break;
      case DateRange.thisWeek:
        expensesRef = expensesRef.where(
          'date',
          '>=',
          moment().startOf('week').format('YYYY-MM-DD')
        );
        break;
      case DateRange.thisMonth:
        expensesRef = expensesRef.where(
          'date',
          '>=',
          moment().startOf('month').format('YYYY-MM-DD')
        );
        break;
      case DateRange.sevenDays:
        expensesRef = expensesRef.where(
          'date',
          '>=',
          moment().subtract(7, 'days').format('YYYY-MM-DD')
        );
        break;
      case DateRange.thirtyDays:
        expensesRef = expensesRef.where(
          'date',
          '>=',
          moment().subtract(30, 'days').format('YYYY-MM-DD')
        );
        break;
      case DateRange.custom:
        expensesRef = expensesRef
          .where('date', '>=', moment(startDate).format('YYYY-MM-DD'))
          .where('date', '<=', moment(endDate).format('YYYY-MM-DD'));
        break;
      default:
        break;
    }

    let cSnap = await expensesRef.get();
    if (cSnap.empty) {
      showWarn('No document');
      return expenseArr;
    }
    cSnap.forEach((doc) => {
      let expense = doc.data();
      expense._key = doc.id;
      expense.key = doc.id;
      expenseArr.push(expense);
    });
    expenseArr = expenseArr.map((order, id) => ({ ...order, id: id + 1 }));
    let mOrders = JSON.parse(JSON.stringify(expenseArr));
    mOrders = sortArr(mOrders, 'time');
    mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
    return mOrders;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

/**
 * Get all items for a given expense.
 * @param {string} expenseId
 * @returns {Promise<Array>} Expense items
 */
export const getExpenseItems = async (expenseId) => {
  try {
    let items = [];
    const itemsSnap = await checkCollection('expenseItems', [
      ['expenseId', '==', expenseId],
    ]);
    if (!itemsSnap) {
      return [];
    }
    itemsSnap.forEach((doc) => {
      let item = doc.data();
      item.key = items.length;
      item.id = items.length;
      items.push(item);
    });
    return items;
  } catch (e) {
    throw e;
  }
};

/**
 * Check if an expense exists by criteria.
 * @param {Array} wheres - Firestore where conditions
 * @returns {Promise<Object>} Existing expense or empty object
 */
export const checkExistingExpense = async (wheres) => {
  try {
    let arr = [];
    let result = {};
    const snap = await checkCollection(
      'sections/account/expenses',
      wheres,
      'expenseId',
      1
    );
    if (snap) {
      snap.forEach((doc) => {
        arr.push({
          ...doc.data(),
          _key: doc.id,
          id: arr.length,
          key: arr.length,
        });
      });
      showLog({ existing_array: arr });
      if (arr.length > 0) {
        result = arr[0];
      }
    }
    return result;
  } catch (e) {
    throw e;
  }
};