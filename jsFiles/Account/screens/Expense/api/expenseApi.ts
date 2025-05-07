import { DateRange } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { sortArr } from 'functions';
import { showLog, showWarn } from 'functions';
import moment from 'moment';

// Define types for function parameters and return values
export interface ExpenseItem {
  expenseItemId?: string;
  expenseName?: string;
  total: number;
  priceType?: string;
  key?: string | number;
  id?: number;
  _key?: string;
  uniqueKey?: string;
  date?: string;
  branchCode?: string;
  [key: string]: any;
}

export interface Expense {
  expenseId: string;
  branchCode: string;
  date: string;
  expenseType: string;
  total?: number;
  items?: ExpenseItem[];
  status?: string;
  created?: number;
  inputDate?: string;
  inputBy?: string;
  editedBy?: Array<{
    uid: string;
    time: number;
    changes: any[];
  }>;
  expenseNo?: string;
  expenseCategory?: string;
  key?: string;
  _key?: string;
  id?: number;
  [key: string]: any;
}

export interface FirestoreQuery {
  where: (field: string, operator: string, value: any) => FirestoreQuery;
  get: () => Promise<FirestoreSnapshot>;
}

export interface FirestoreSnapshot {
  empty: boolean;
  docs?: Array<{
    id: string;
    ref: any;
    data: () => any;
  }>;
  forEach: (callback: (doc: { id: string; data: () => any }) => void) => void;
}

export interface FirestoreInstance {
  collection: (path: string) => FirestoreQuery;
  runTransaction: <T>(updateFunction: (transaction: any) => Promise<T>) => Promise<T>;
}

/**
 * Get expenses for a specific date and type.
 * @param firestore - Firestore instance
 * @param branchCode - Branch code
 * @param date - Date to filter by
 * @param expenseType - Type of expense
 * @param collection - Optional collection name
 * @returns Sorted expense array
 */
export const getExpensesByDate = async (
  firestore: FirestoreInstance,
  branchCode: string,
  date: string,
  expenseType: string,
  collection?: string
): Promise<Expense[]> => {
  try {
    let expenseArr: Expense[] = [];
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
 * @param firestore - Firestore instance
 * @param branchCode - Branch code
 * @param range - DateRange enum
 * @param startDate - Start date for custom range
 * @param endDate - End date for custom range
 * @param expenseType - Type of expense
 * @param collection - Optional collection name
 * @returns Sorted expense array
 */
export const getExpensesByRange = async (
  firestore: FirestoreInstance,
  branchCode: string,
  range: string,
  startDate: string,
  endDate: string,
  expenseType: string,
  collection?: string
): Promise<Expense[]> => {
  try {
    let expenseArr: Expense[] = [];
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
 * @param expenseId - The ID of the expense
 * @returns Expense items
 */
export const getExpenseItems = async (expenseId: string): Promise<ExpenseItem[]> => {
  try {
    let items: ExpenseItem[] = [];
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
 * @param wheres - Firestore where conditions
 * @returns Existing expense or empty object
 */
export const checkExistingExpense = async (
  wheres: Array<[string, string, any]>
): Promise<Expense | Record<string, never>> => {
  try {
    let arr: Expense[] = [];
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