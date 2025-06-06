import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DailyChange from './Components/DailyChange';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../firebase';
import { DateRange } from 'data/Constant';
import { showWarn, sortArrByMultiKeys } from 'functions';
import { AccountSteps } from 'data/Constant';
import { Stepper } from 'elements';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, Col } from 'shards-react';
import ExpenseInputHeader from './Components/expense-input-header';
import HeadOfficeTransfer from './Components/HeadOfficeTransfer';
import ExecutiveExpenses from './Components/ExecutiveExpenses';
import PurchaseTransfer from './Components/PurchaseTransfer';
import { StatusMapToStep } from 'data/Constant';
import moment from 'moment';

export default props => {
  const { user } = useSelector(state => state.auth);
  const { firestore, api } = useContext(FirebaseContext);
  // const history = useHistory();
  let location = useLocation();
  const isInput = location.pathname === '/account/expense-input';

  const params = location.state?.params;

  const { readOnly, onBack } = params || {};

  const [order, setOrder] = useState({});
  const [expenseNames, setExpenseNames] = useState([]);
  const [branchCode, setBranch] = useState(order?.branchCode || user.branch || '0450');
  const [range, setRange] = useState(DateRange.today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [expenseType, setType] = useState('dailyChange');

  const [ready, setReady] = useState(0);

  const rangeRef = useRef(DateRange.today);
  const branchRef = useRef(null);
  const selectedDateRef = useRef(null);
  const expenseTypeRef = useRef(null);

  const grant = true;
  // user.isDev || (user.permissions && user.permissions.permission202);

  const getExpenseNames = useCallback(async () => {
    let itArr = [];
    try {
      const cSnap = await firestore.collection('data').doc('account').collection('expenseName').get();
      //  showLog('itemSnap', cSnap);
      if (cSnap.empty) {
        showWarn('No document');
        setReady(rd => rd + 1);
        return setExpenseNames(itArr);
      }
      cSnap.forEach(doc => {
        // showLog('item', doc.data());
        let item = doc.data();
        item.expenseItemId = doc.id;
        item.key = itArr.length + 1;
        itArr.push(item);
      });
      //  showLog('expenseNames', itArr);
      itArr = sortArrByMultiKeys(itArr, ['expenseCategoryId', 'expenseItemId']);
      setExpenseNames(itArr);
      setReady(rd => rd + 1);
    } catch (e) {
      showWarn(e);
    }
  }, [firestore]);

  useEffect(() => {
    getExpenseNames();
    let mOrder = params?.order;
    //  showLog({ params, props, mOrder });

    const initBranchCode = isInput ? mOrder?.branchCode || user.branch || '0450' : 'all';
    const initDate = mOrder?.date || moment().format('YYYY-MM-DD');
    const initExpenseType = mOrder?.expenseType || 'dailyChange';

    setOrder(mOrder);
    setBranch(initBranchCode);
    setSelectedDate(initDate);
    setType(initExpenseType);
    branchRef.current = initBranchCode;
    selectedDateRef.current = initDate;
    expenseTypeRef.current = initExpenseType;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onBranchSelected = async br => {
    try {
      setBranch(br);
      branchRef.current = br;
    } catch (e) {
      showWarn(e);
    }
  };
  const _onRangeSelected = async rng => {
    try {
      setRange(rng);
      rangeRef.current = rng;
    } catch (e) {
      showWarn(e);
    }
  };

  const _onDateSelected = async dateValue => {
    try {
      //  showLog('selectDate', dateValue);
      setSelectedDate(dateValue);
      selectedDateRef.current = dateValue;
    } catch (e) {
      showWarn(e);
    }
  };

  const _onTypeChange = async type => {
    try {
      setType(type);
      expenseTypeRef.current = type;
    } catch (e) {
      showWarn(e);
    }
  };

  // const uCategories = updateExpenseCategories(expenses, expenseCategories);

  const isEdit = !!order && order.date && order.expenseId;
  const activeStep = !(order && order.date) ? 0 : StatusMapToStep[order.status || 'pending'];

  let currentView;

  switch (expenseType) {
    case 'dailyChange':
      currentView = (
        <DailyChange
          selectedDate={selectedDate}
          branchCode={branchCode}
          isEdit={isEdit}
          expenseType={expenseType}
          order={order}
          onBack={onBack}
        />
      );
      break;
    case 'headOfficeTransfer':
      currentView = (
        <HeadOfficeTransfer
          selectedDate={selectedDate}
          branchCode={branchCode}
          isInput={isInput}
          expenseType={expenseType}
          expenseNames={expenseNames}
        />
      );
      break;
    case 'executive':
      currentView = (
        <ExecutiveExpenses
          selectedDate={selectedDate}
          branchCode={branchCode}
          isInput={isInput}
          expenseType={expenseType}
          order={order}
          onBack={onBack}
        />
      );

      break;
    case 'purchaseTransfer':
      // currentView = <ComingSoon info="To update within this week." />;
      currentView = (
        <PurchaseTransfer
          selectedDate={selectedDate}
          branchCode={branchCode}
          isInput={isInput}
          expenseType={expenseType}
        />
      );
      break;

    default:
      break;
  }

  return (
    <div>
      <Container fluid className="main-content-container p-3">
        <Row noGutters className="page-header px-3 bg-light">
          <PageTitle sm="4" title="รายจ่าย" subtitle="บัญชี" className="text-sm-left" />
          {isInput && (
            <Col>
              <Stepper
                className="bg-light"
                steps={AccountSteps}
                activeStep={activeStep}
                alternativeLabel={false} // In-line labels
              />
            </Col>
          )}
        </Row>
        <ExpenseInputHeader
          onBranchChange={_onBranchSelected}
          onDateChange={_onDateSelected}
          onTypeChange={_onTypeChange}
          disabled={!grant}
          disableAllBranches
          defaultType={expenseType}
          defaultDate={selectedDate}
          defaultBranch={branchCode}
          readOnly={isEdit}
        />

        {currentView}
      </Container>
    </div>
  );
};
