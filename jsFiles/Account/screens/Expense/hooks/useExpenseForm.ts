import { useState, useEffect } from 'react';
import { useMergeState } from 'api/CustomHooks';
import { getCollection } from 'firebase/api';
import { sortArrByMultiKeys, showWarn } from 'functions';
import { StatusMapToStep } from 'data/Constant';
import { createNewOrderId } from 'Modules/Account/api';

/**
 * Props for the useExpenseForm hook
 */
interface UseExpenseFormProps {
  firestore: any;
  api: any;
  user: any;
  location: any;
  params?: any;
  order?: any;
}

/**
 * Initial props for the expense form
 */
const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
};

/**
 * Custom hook to handle expense form logic
 * @param props - Props for the hook
 * @returns Form state and handlers
 */
export function useExpenseForm(props: UseExpenseFormProps) {
  const { firestore, api, user, location, params } = props;
  
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState<boolean>(false);
  const [category, setCategory] = useState<string>(params?.category || 'dailyChange');
  const [expenseNames, setExpenseNames] = useState<any[]>([]);
  const [saved, setSaved] = useState<boolean>(true);

  useEffect(() => {
    const getExpenseNames = async () => {
      let itArr: any[] = [];
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
  }, [api]);

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
  }, [params, category, location.pathname, setProps]);

  const changeCategory = (ev: string) => {
    setCategory(ev);
  };

  const setUnsaved = () => setSaved(false);

  return {
    mProps,
    setProps,
    ready,
    category,
    expenseNames,
    saved,
    changeCategory,
    setUnsaved,
    setSaved,
    initProps,
  };
}