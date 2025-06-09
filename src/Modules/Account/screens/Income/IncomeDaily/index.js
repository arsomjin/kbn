import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Row, Col } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { createNewOrderId } from 'Modules/Account/api';
import { FirebaseContext } from '../../../../../firebase';

import { useSelector } from 'react-redux';
import { StatusMapToStep } from 'data/Constant';
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
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import PropTypes from 'prop-types';
import { useResponsive } from 'hooks/useResponsive';

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

// Content component to properly handle props from LayoutWithRBAC
const IncomeDailyContent = ({ category, _changeCategory, currentView, mProps, selectedBranch, canEditData, geographic, auditTrail, ...otherProps }) => {
  const { isMobile } = useResponsive();
  // Create a wrapper function that includes the auditTrail
  const enhancedCurrentView = React.cloneElement(currentView, {
    ...currentView.props,
    auditTrail: auditTrail
  });

  return (
    <div >
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Row gutter={16} align="middle">
          <Col md={12} sm={24}>
            <Form.Item label={<span style={{ marginRight: '8px' }}>ประเภทการรับเงิน</span>} style={{ marginBottom: 0 }}>
              <Select
                placeholder="ประเภทการรับเงิน"
                onChange={_changeCategory}
                value={category}
                disabled={mProps.isEdit}
                style={{ width: '100%' }}
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
      
      {enhancedCurrentView}
    </div>
  );
};

IncomeDailyContent.propTypes = {
  category: PropTypes.string.isRequired,
  _changeCategory: PropTypes.func.isRequired,
  currentView: PropTypes.node.isRequired,
  mProps: PropTypes.object.isRequired,
  selectedBranch: PropTypes.string,
  canEditData: PropTypes.bool,
  geographic: PropTypes.object,
  auditTrail: PropTypes.object
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

  const _onConfirmOrder = async (values, resetToInitial, auditTrailFromProps = null) => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      mValues.incomeCategory = 'daily';
      mValues.incomeSubCategory = category;
      
      // Use enhanced geographic context for automatic provinceId injection
      if (geographic && geographic.enhanceDataForSubmission) {
        mValues = geographic.enhanceDataForSubmission(mValues);
      } else {
        // Fallback to manual assignment if wrapper enhancement not available
        Object.assign(mValues, geographic);
      }
      
      if (!mValues.customerId && !['partSKC', 'partKBN', 'partChange'].includes(mValues.incomeType)) {
        const customerId = await updateNewOrderCustomer({
          values: mValues,
          firestore
        });
        if (customerId) {
          mValues.customerId = customerId;
        }
      }
      
      if (auditTrailFromProps && mProps.isEdit) {
        await auditTrailFromProps.saveWithAuditTrail({
          collection: 'sections/account/incomes',
          data: mValues,
          isEdit: true,
          oldData: mProps.order,
          notes: `แก้ไขรายการรับเงินประจำวัน - ${IncomeDailyCategories[category]}`
        });
      } else if (auditTrailFromProps && !mProps.isEdit) {
        mValues.created = dayjs().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
        
        await auditTrailFromProps.saveWithAuditTrail({
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

  const handleGeographicChange = useCallback((geoContext) => {
    console.log('🌍 Geographic context received in IncomeDaily:', geoContext);
    setGeographic(geoContext);
  }, []);

  // Debug the initial setup
  useEffect(() => {
    console.log('🔍 IncomeDaily mount - checking setup:', {
      hasHandleGeographicChange: !!handleGeographicChange,
      ready,
      category
    });
  }, []);

  // Initialize geographic context even without branch selection requirement
  useEffect(() => {
    console.log('🚀 Current geographic state in IncomeDaily:', geographic);
    if (geographic && Object.keys(geographic).length > 0) {
      console.log('✅ Geographic context available:', {
        branchCode: geographic.branchCode,
        provinceId: geographic.provinceId,
        hasQueryFilters: !!geographic.getQueryFilters,
        hasEnhancement: !!geographic.enhanceDataForSubmission
      });
    } else {
      console.log('⚠️ Geographic context not yet available');
    }
  }, [geographic]);

  let currentView = (
    <IncomeVehicles
      onConfirm={_onConfirmOrder}
      order={mProps.order}
      readOnly={mProps.readOnly}
      onBack={mProps.onBack}
      isEdit={mProps.isEdit}
      reset={() => setProps(initProps)}
      geographic={geographic}
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
          geographic={geographic}
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
          geographic={geographic}
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
          geographic={geographic}
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
          geographic={geographic}
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
          geographic={geographic}
        />
      );
      break;
  }

  if (!ready) {
    return (
      <LayoutWithRBAC
        title="รับเงินประจำวัน"
        subtitle="Management"
        permission="accounting.view"
        editPermission="accounting.edit"
        loading={true}
      >
        <div />
      </LayoutWithRBAC>
    );
  }

  return (
    <LayoutWithRBAC
      title="รับเงินประจำวัน"
      subtitle="Management"
      permission="accounting.view"
      editPermission="accounting.edit"
      requireBranchSelection={false}
      onBranchChange={handleGeographicChange}
      documentId={documentId}
      documentType="income_daily"
      showAuditTrail={true}
      showStepper={true}
      steps={INCOME_DAILY_STEPS}
      currentStep={mProps.activeStep}
      autoInjectProvinceId={true}
    >
      <IncomeDailyContent 
        category={category}
        _changeCategory={_changeCategory}
        currentView={currentView}
        mProps={mProps}
        geographic={geographic}
      />
    </LayoutWithRBAC>
  );
};

export default IncomeDaily;
