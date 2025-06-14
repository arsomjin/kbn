import { Form, Select, Skeleton } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import PageTitle from 'components/common/PageTitle';
import { ExpenseType } from 'data/Constant';
import { StatusMap } from 'data/Constant';
import { StatusMapToStep } from 'data/Constant';
import { AccountSteps } from 'data/Constant';
import { Stepper } from 'elements';
import { getChanges } from 'functions';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import { load } from 'functions';
import { getArrayChanges } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'shards-react';
import { FirebaseContext } from '../../../../firebase';
import Page from './Page';

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true
};

export default () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  //  showLog({ params });

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(params?.category || 'dailyChange');

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.expenseId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/income-expense-summary' : false;
    const isInput = location.pathname === '/account/expense-input';

    if (!isEdit) {
      let expenseId = createNewOrderId('KBN-ACC-EXP');
      setProps({
        order: { expenseId },
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _changeCategory = ev => {
    //  showLog('category', ev);
    setProps(initProps);
    setCategory(ev);
  };

  const _onConfirmOrder = async (values, resetToInitial) => {
    try {
      //  showLog('confirm_values', values);

      let mValues = JSON.parse(JSON.stringify(values));
      mValues.expenseCategory = 'daily';
      mValues.expenseType = category;
      if (mProps.isEdit) {
        let changes = getChanges(mProps.order, values);
        if (mProps.order.items && values.items) {
          const itemChanges = getArrayChanges(mProps.order.items, values.items);
          if (itemChanges) {
            changes = [...changes, ...itemChanges];
          }
        }
        mValues.editedBy = !!mProps.order.editedBy
          ? [...mProps.order.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
      } else {
        mValues.created = dayjs().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }

      const expenseRef = firestore.collection('sections').doc('account').collection('expenses').doc(mValues.expenseId);
      // Add expense order.
      const docSnap = await expenseRef.get();
      if (docSnap.exists) {
        expenseRef.update(mValues);
      } else {
        expenseRef.set(mValues);
      }
      // Record log.
      api.addLog(
        mProps.isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.expenseId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.expenseId
            },
        'expenses',
        'daily'
      );
      load(false);
      showSuccess(
        () => {
          if (mProps.isEdit) {
            history.push(mProps.onBack.path, { params: mProps.onBack });
          } else {
            let expenseId = createNewOrderId('KBN-ACC-EXP');
            resetToInitial();
            setProps({ ...initProps, order: { expenseId } });
          }
        },
        mValues.expenseNo ? `บันทึกข้อมูลบิลเลขที่ ${mValues.expenseNo} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
        true
      );
    } catch (e) {
      showWarn(e);
    }
  };

  let currentView = (
    <Page
      isEdit={mProps.isEdit}
      expenseType={category}
      onConfirm={_onConfirmOrder}
      order={mProps.order}
      readOnly={mProps.readOnly}
      onBack={mProps.onBack}
    />
  );

  switch (category) {
    case 'page1':
      currentView = (
        <Page
          isEdit={mProps.isEdit}
          expenseType={category}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
        />
      );
      break;
    default:
      break;
  }

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="รายจ่าย" subtitle="บัญชี" className="text-sm-left" />
        {mProps.isInput && (
          <Col>
            <Stepper
              className="bg-light"
              steps={AccountSteps}
              activeStep={mProps.activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
        )}
      </Row>
      <div className="px-3 pt-3 bg-white border-bottom">
        <Row style={{ alignItems: 'center' }}>
          <Col md="4">
            <Form.Item label="ประเภทการจ่ายเงิน">
              <Select
                placeholder="ประเภทการจ่ายเงิน"
                onChange={ev => _changeCategory(ev)}
                value={category}
                className="text-primary"
                disabled={!mProps.grant || mProps.isEdit}
              >
                {Object.keys(ExpenseType).map((type, i) => (
                  <Select.Option key={i} value={type}>{`${ExpenseType[type]}`}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>
      {ready ? currentView : <Skeleton active />}
    </Container>
  );
};
