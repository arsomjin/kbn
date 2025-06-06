import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { CommonSteps } from 'data/Constant';
import { Stepper } from 'elements';
import { useHistory, useLocation } from 'react-router-dom';
import { createNewOrderId } from 'Modules/Account/api';
import { FirebaseContext } from '../../../../../firebase';

import { useSelector } from 'react-redux';
import { StatusMapToStep } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import { useMergeState } from 'api/CustomHooks';
import IncomeVehicles from './components/IncomeVehicles';
import IncomeService from './components/IncomeService';
import IncomeParts from './components/IncomeParts';
import IncomeOther from './components/IncomeOther';
import { showWarn } from 'functions';
import { Form, Select, Skeleton } from 'antd';
import { IncomeDailyCategories } from 'data/Constant';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import moment from 'moment-timezone';
import { StatusMap } from 'data/Constant';
import { arrayForEach } from 'functions';
import { load } from 'functions';
import { showSuccess } from 'functions';
import { updateNewOrderCustomer } from 'Modules/Utils';
import { errorHandler } from 'functions';
const { Option } = Select;

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
  const [category, setCategory] = useState(params?.category || 'vehicles');

  useEffect(() => {
    // showLog('category_change');
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.incomeId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path
      ? ['/reports/income-expense-summary', '/reports/income-parts'].includes(onBack.path)
      : false;

    if (!isEdit) {
      let incomeId = createNewOrderId();
      setProps({ order: { incomeId }, isEdit, activeStep, readOnly, onBack });
    } else {
      setProps({ order: pOrder, isEdit, activeStep, readOnly, onBack });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, category]);

  const _changeCategory = ev => {
    //  showLog('category', ev);
    setCategory(ev);
  };

  const _onConfirmOrder = async (values, resetToInitial) => {
    try {
      //  showLog('confirm_values', values);

      let mValues = JSON.parse(JSON.stringify(values));
      mValues.incomeCategory = 'daily';
      mValues.incomeSubCategory = category;
      if (!mValues.customerId && !['partSKC', 'partKBN', 'partChange'].includes(mValues.incomeType)) {
        // New customer
        const customerId = await updateNewOrderCustomer({
          values: mValues,
          firestore
        });
        if (customerId) {
          mValues.customerId = customerId;
        }
      }
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
        mValues.created = moment().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }
      // Add order items.
      if (mValues.items && mValues.items.length > 0) {
        await arrayForEach(mValues.items, async item => {
          const incomeItemRef = firestore
            .collection('sections')
            .doc('account')
            .collection('incomeItems')
            .doc(item.incomeItemId);
          item.item && (await incomeItemRef.set(item));
        });
        // delete mValues.items;
      }
      const incomeRef = firestore.collection('sections').doc('account').collection('incomes').doc(mValues.incomeId);
      // Add income order.
      const docSnap = await incomeRef.get();
      if (docSnap.exists) {
        incomeRef.update(mValues);
      } else {
        incomeRef.set(mValues);
      }
      // Record log.
      api.addLog(
        mProps.isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.incomeId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.incomeId
            },
        'incomes',
        'daily'
      );
      load(false);
      showSuccess(
        () => {
          if (mProps.isEdit && mProps.onBack) {
            history.push(mProps.onBack.path, { params: mProps.onBack });
          } else {
            let incomeId = createNewOrderId();
            resetToInitial();
            setProps({ ...initProps, order: { incomeId } });
          }
        },
        mValues.incomeNo ? `บันทึกข้อมูลเลขที่ ${mValues.incomeNo} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
        true
      );
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...values, module: 'IncomeDaily' }
      });
    }
  };

  // showLog({ mProps, params: location.state?.params });

  let currentView = (
    <IncomeVehicles
      onConfirm={_onConfirmOrder}
      firestore={firestore}
      api={api}
      order={mProps.order}
      readOnly={mProps.readOnly}
      onBack={mProps.onBack}
      isEdit={mProps.isEdit}
    />
  );

  switch (category) {
    case 'vehicles':
      currentView = (
        <IncomeVehicles
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
          isEdit={mProps.isEdit}
          reset={() => setProps(initProps)}
        />
      );
      break;
    case 'service':
      currentView = (
        <IncomeService
          onBack={mProps.onBack}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          isEdit={mProps.isEdit}
          firestore={firestore}
          reset={() => setProps(initProps)}
        />
      );
      break;
    case 'parts':
      currentView = (
        <IncomeParts
          onBack={mProps.onBack}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          isEdit={mProps.isEdit}
          reset={() => setProps(initProps)}
        />
      );
      break;
    case 'other':
      currentView = (
        <IncomeOther
          onBack={mProps.onBack}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          isEdit={mProps.isEdit}
        />
      );
      break;

    default:
      currentView = (
        <IncomeVehicles
          onConfirm={_onConfirmOrder}
          firestore={firestore}
          api={api}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
          isEdit={mProps.isEdit}
          reset={() => setProps(initProps)}
        />
      );

      break;
  }

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="รับเงินประจำวัน" subtitle="บัญชี" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-light"
            steps={CommonSteps}
            activeStep={mProps.activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <div className="px-3 pt-3 bg-white border-bottom">
        <Row style={{ alignItems: 'center' }}>
          <Col md="4">
            <Form.Item label="ประเภทการรับเงิน">
              <Select
                placeholder="ประเภทการรับเงิน"
                onChange={ev => _changeCategory(ev)}
                value={category}
                className="text-primary"
                disabled={!mProps.grant || mProps.isEdit}
              >
                {Object.keys(IncomeDailyCategories).map((type, i) => (
                  <Option
                    key={i}
                    value={type}
                    // disabled={type === 'parts'}
                  >{`${IncomeDailyCategories[type]}`}</Option>
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
