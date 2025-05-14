import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { sortArrByMultiKeys, showWarn, getArrayChanges, getChanges } from 'functions';
import { StatusMap, StatusMapToStep } from 'data/Constant';

/**
 * Custom hook for managing expense form logic.
 * @param {object} params - Route params
 * @param {object} firestore - Firestore instance
 * @param {object} api - API object
 * @param {object} user - Auth user
 * @param {function} createNewOrderId - Utility to create new order IDs
 * @param {function} getCollection - Utility to get Firestore collections
 * @returns {object} Form state and handlers
 */
export function useExpenseForm({
  params,
  firestore,
  api,
  user,
  createNewOrderId,
  getCollection,
  initProps,
  location,
  setProps,
}) {
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(params?.category || 'dailyChange');
  const [expenseNames, setExpenseNames] = useState([]);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const getExpenseNames = async () => {
      let itArr = [];
      try {
        const cSnap = await getCollection('data/account/expenseName');
        if (!cSnap) {
          return setExpenseNames(itArr);
        }
        Object.keys(cSnap).map((k) => {
          let item = cSnap[k];
          item.expenseItemId = item._key;
          item.key = itArr.length + 1;
          itArr.push(item);
          return k;
        });
        itArr = sortArrByMultiKeys(itArr, [
          'expenseCategoryId',
          'expenseItemId',
        ]);
        setExpenseNames(itArr);
      } catch (e) {
        showWarn(e);
      }
    };
    getExpenseNames();
    api.getExpenseAccountNames && api.getExpenseAccountNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit =
      !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.expenseId;
    const activeStep = !(pOrder && pOrder.date)
      ? 0
      : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path
      ? onBack.path === '/reports/income-expense-summary'
      : false;
    const isInput = location.pathname === '/account/expense-input';

    if (!isEdit) {
      let expenseId = createNewOrderId('KBN-ACC-EXP');
      setProps({
        order: { expenseId },
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput,
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput,
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, category]);

  const changeCategory = (ev) => setCategory(ev);
  const setUnsaved = () => setSaved(false);

  return {
    ready,
    category,
    expenseNames,
    saved,
    setUnsaved,
    changeCategory,
    setCategory,
    setSaved,
  };
}
