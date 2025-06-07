import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'shards-react';
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
import { Form, Select, Skeleton, Alert } from 'antd';
import { IncomeDailyCategories } from 'data/Constant';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import dayjs from 'dayjs';
import { StatusMap } from 'data/Constant';
import { arrayForEach } from 'functions';
import { load } from 'functions';
import { showSuccess } from 'functions';
import { updateNewOrderCustomer } from 'Modules/Utils';
import { errorHandler } from 'functions';
import AccountLayoutWithRBAC from 'components/layout/AccountLayoutWithRBAC';
import useAuditTrail from 'hooks/useAuditTrail';
import { PermissionGate } from 'components';

const { Option } = Select;

const INCOME_DAILY_STEPS = [
  { title: 'บันทึกข้อมูล', description: 'บันทึกรายการรับเงินประจำวัน' },
  { title: 'ตรวจสอบ', description: 'ตรวจสอบความถูกต้องของข้อมูล' },
  { title: 'อนุมัติ', description: 'อนุมัติรายการรับเงิน' },
  { title: 'เสร็จสิ้น', description: 'บันทึกข้อมูลเสร็จสิ้น' }
];

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true
};

const IncomeDaily = () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(params?.category || 'vehicles');
  const [geographic, setGeographic] = useState({});

  const documentId = mProps.order?.incomeId;
  
  const auditTrail = useAuditTrail(
    documentId && mProps.isEdit ? documentId : null,
    'income_daily'
  );

  useEffect(() => {
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
  }, [params, category]);

  const _changeCategory = ev => {
    setCategory(ev);
  };

  const _onConfirmOrder = async (values, resetToInitial) => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      mValues.incomeCategory = 'daily';
      mValues.incomeSubCategory = category;
      
      Object.assign(mValues, geographic);
      
      if (!mValues.customerId && !['partSKC', 'partKBN', 'partChange'].includes(mValues.incomeType)) {
        const customerId = await updateNewOrderCustomer({
          values: mValues,
          firestore
        });
        if (customerId) {
          mValues.customerId = customerId;
        }
      }
      
      if (auditTrail && mProps.isEdit) {
        await auditTrail.saveWithAuditTrail({
          collection: 'sections/account/incomes',
          data: mValues,
          isEdit: true,
          oldData: mProps.order,
          notes: `แก้ไขรายการรับเงินประจำวัน - ${IncomeDailyCategories[category]}`
        });
      } else if (auditTrail && !mProps.isEdit) {
        mValues.created = dayjs().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
        
        await auditTrail.saveWithAuditTrail({
          collection: 'sections/account/incomes',
          data: mValues,
          isEdit: false,
          notes: `สร้างรายการรับเงินประจำวัน - ${IncomeDailyCategories[category]}`
        });
      } else {
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
        
        if (mValues.items && mValues.items.length > 0) {
          await arrayForEach(mValues.items, async item => {
            const incomeItemRef = firestore
              .collection('sections')
              .doc('account')
              .collection('incomeItems')
              .doc(item.incomeItemId);
            item.item && (await incomeItemRef.set(item));
          });
        }
        
        const incomeRef = firestore.collection('sections').doc('account').collection('incomes').doc(mValues.incomeId);
        const docSnap = await incomeRef.get();
        if (docSnap.exists) {
          incomeRef.update(mValues);
        } else {
          incomeRef.set(mValues);
        }
      }

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
        message: e?.message || 'เกิดข้อผิดพลาด',
        uid: user.uid || 'unknown'
      });
    }
  };

  const handleGeographicChange = (geoContext) => {
    setGeographic(geoContext);
  };

  let currentView = (
    <IncomeVehicles
      onConfirm={_onConfirmOrder}
      order={mProps.order}
      readOnly={mProps.readOnly}
      onBack={mProps.onBack}
      isEdit={mProps.isEdit}
      reset={() => setProps(initProps)}
    />
  );

  switch (category) {
    case 'vehicles':
      currentView = (
        <PermissionGate permission="view_vehicle_income">
          <IncomeVehicles
            onConfirm={_onConfirmOrder}
            order={mProps.order}
            readOnly={mProps.readOnly}
            onBack={mProps.onBack}
            isEdit={mProps.isEdit}
            reset={() => setProps(initProps)}
          />
        </PermissionGate>
      );
      break;
    case 'service':
      currentView = (
        <PermissionGate permission="view_service_income">
          <IncomeService
            onBack={mProps.onBack}
            onConfirm={_onConfirmOrder}
            order={mProps.order}
            readOnly={mProps.readOnly}
            isEdit={mProps.isEdit}
            firestore={firestore}
            reset={() => setProps(initProps)}
          />
        </PermissionGate>
      );
      break;
    case 'parts':
      currentView = (
        <PermissionGate permission="view_parts_income">
          <IncomeParts
            onBack={mProps.onBack}
            onConfirm={_onConfirmOrder}
            order={mProps.order}
            readOnly={mProps.readOnly}
            isEdit={mProps.isEdit}
            reset={() => setProps(initProps)}
          />
        </PermissionGate>
      );
      break;
    case 'other':
      currentView = (
        <PermissionGate permission="view_other_income">
          <IncomeOther
            onBack={mProps.onBack}
            onConfirm={_onConfirmOrder}
            order={mProps.order}
            readOnly={mProps.readOnly}
            isEdit={mProps.isEdit}
          />
        </PermissionGate>
      );
      break;
    default:
      currentView = (
        <PermissionGate permission="sales.view">
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
        </PermissionGate>
      );
      break;
  }

  if (!ready) {
    return (
      <AccountLayoutWithRBAC
        title="รับเงินประจำวัน"
        subtitle="Management"
        permission="accounting.view"
        editPermission="accounting.edit"
        loading={true}
      >
        <div />
      </AccountLayoutWithRBAC>
    );
  }

  return (
    <AccountLayoutWithRBAC
      title="รับเงินประจำวัน"
      subtitle="Management"
      permission="accounting.view"
      editPermission="accounting.edit"
      requireBranchSelection={true}
      onBranchChange={handleGeographicChange}
      // documentId={documentId}
      // documentType="income_daily"
      // showAuditTrail={mProps.isEdit && !!documentId}
      // steps={INCOME_DAILY_STEPS}
      // currentStep={mProps.activeStep}
    >
      <Container fluid className="main-content-container p-3">
        <Row noGutters className="page-header px-3 bg-light">
          <PageTitle sm="4" title="รับเงินประจำวัน" subtitle="บัญชี" className="text-sm-left" />
          <Col>
            <Stepper
              className="bg-light"
              steps={CommonSteps}
              activeStep={mProps.activeStep}
              alternativeLabel={false}
            />
          </Col>
        </Row>
        
        <div className="px-3 pt-3 bg-white border-bottom">
          <Row style={{ alignItems: 'center' }}>
            <Col md="4">
              <Form.Item label="ประเภทการรับเงิน">
                <Select
                  placeholder="ประเภทการรับเงิน"
                  onChange={_changeCategory}
                  value={category}
                  className="text-primary"
                  disabled={mProps.isEdit}
                >
                  {Object.keys(IncomeDailyCategories).map((type, i) => (
                    <Option key={i} value={type}>
                      {`${IncomeDailyCategories[type]}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
        
        <PermissionGate permission="accounting.view">
          {currentView}
        </PermissionGate>
      </Container>
    </AccountLayoutWithRBAC>
  );
};

export default IncomeDaily;
