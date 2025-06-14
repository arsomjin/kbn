import React, { useContext, useRef, Fragment, useState, useEffect } from 'react';
import { Form, Popconfirm, Radio, Select, Collapse, Skeleton } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { CommonSteps } from 'data/Constant';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, CardFooter } from 'shards-react';
import HiddenItem from 'components/HiddenItem';
import { getEditArr } from 'utils';
import Customer from 'components/Customer';
import Guarantors from 'components/Guarantors';
import { useHistory, useLocation } from 'react-router';
import {
  arrayInputColumns,
  getInitialValues,
  giveAwayInputColumns,
  initAddress,
  initGuarantor,
  onReservaionSelect,
  _getNetIncomeFromValues,
  _getPaymentFromAdditionalPurchase,
  hasNoVehicleOrEngineNumber,
  hasNoPeripheralNumber
} from './api';
import { FirebaseContext } from '../../../firebase';
import { createNewSaleOrderId, onConfirmSaleOrder } from '../api';
import { SaleType } from 'data/Constant';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import SaleItems from './SaleItems';
import { Stepper, Input, NotificationIcon, DatePicker, Button } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import SalesHeader from '../components/sales-header';
import Referrer from 'Modules/Referrers/Referrer';
import { GuarantorDocs, MoreReservationInfo } from './components';
import { TotalSummary } from 'components/common/TotalSummary';
import {
  showWarn,
  Numb,
  parser,
  showMessageBar,
  showConfirm,
  cleanValuesBeforeSave,
  cleanNumberFieldsInArray,
  cleanNumberFields,
  load,
  showSuccess,
  firstKey
} from 'functions';
import { updateNewOrderCustomer, updateNewOrderReferrer } from 'Modules/Utils';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import ReferrerDetailsModal from 'Modules/Referrers/ReferrerDetailsModal';
import { useMergeState } from 'api/CustomHooks';
import { partialText } from 'utils';
import { getItemId } from 'Modules/Account/api';
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import Referring from 'Modules/Referrers/Referring';
import ReferringFooter from 'Modules/Referrers/ReferringFooter';
import { InfoCircleOutlined } from '@ant-design/icons';
import Payments from 'components/Payments';
import { checkDoc } from 'firebase/api';
import { AnimateKeyframes } from 'react-simple-animate';
import { isMobile } from 'react-device-detect';
import Toggles from 'components/Toggles';
import { StatusMapToStep } from 'data/Constant';
import { errorHandler } from 'functions';
import { showAlert } from 'functions';
import { Address } from 'components/NameAddress';
import { BuyMore, TurnOverVehicle } from '../components';
import { checkCollection } from 'firebase/api';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { createKeywords } from 'utils';
import { uniq } from 'lodash';
import { arrayForEach } from 'functions';
import { checkPayments } from 'Modules/Utils';
// RBAC Testing: Adding LayoutWithRBAC wrapper for comparison
import PropTypes from 'prop-types';
// 🚀 Document Approval Flow Integration
import DocumentWorkflowWrapper from 'components/DocumentApprovalFlow/DocumentWorkflowWrapper';
const { Option } = Select;

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true
};

// Content component for sale machines
const SaleMachinesContent = ({ geographic, auditTrail }) => {
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { users, employees, banks } = useSelector(state => state.data);
  const { firestore, api } = useContext(FirebaseContext);
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const history = useHistory();
  let location = useLocation();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  // showLog({ sale_vehicle_params: params });

  const [mProps, setProps] = useMergeState(initProps);

  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {}
  });
  const [showReferrer, setShowReferrer] = useMergeState({
    visible: false,
    referrer: {}
  });
  const [showMore, setMoreInfo] = useMergeState({
    visible: false,
    values: {}
  });
  const [ready, setReady] = useState(false);

  // let order = params?.order;
  // if (!(order && order?.saleId)) {
  //   let saleId = createNewSaleOrderId();
  //   order = { saleId };
  // }
  // const { readOnly, onBack } = params || {};

  const activeStep = 0;
  const grant = true;

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.saleId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/sale-machines' : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let saleId = createNewSaleOrderId();
      pOrder = { saleId };
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onBookingSelect = async (reserveNo, values) => {
    try {
      // Check if this booking has record sale or credit.
      let saleSnap = await checkCollection('sections/sales/vehicles', [['bookNo', '==', reserveNo]]);
      if (saleSnap) {
        let sales = [];
        saleSnap.forEach(sale => {
          sales.push(sale.data());
        });
        if (sales.length > 0) {
          // sale has been recorded!
          return showAlert(
            'บันทึกใบขายแล้ว',
            `ใบจองเลขที่ ${reserveNo} มีการบันทึกใบขายแล้ว (ใบขายเลขที่ ${sales[0].saleNo})`,
            'warning'
          );
        }
      }

      // Check if the booking has temporaly product code.
      let bookSnap = await checkCollection('sections/sales/bookings', [['bookNo', '==', reserveNo]]);
      if (bookSnap) {
        let books = [];
        bookSnap.forEach(book => {
          books.push(book.data());
        });
        if (books.length > 0 && !!books[0]?.items) {
          // showLog('book items', books[0].items);
          let hasTempProduct = false;
          await arrayForEach(books[0].items, item => {
            hasTempProduct = !!item?.productCode && item.productCode.trim().toLowerCase().startsWith('temp');
          });
          if (hasTempProduct) {
            // Has temporaly product.
            return showAlert(
              'ใบจองนี้มีรหัสสินค้าชั่วคราว',
              `ใบจองเลขที่ ${reserveNo} มีรายการที่มีรหัสสินค้าชั่วคราว(รหัสที่ขึ้นต้นด้วย TEMP) ต้องแก้ไขรหัสสินค้าในใบจองเป็นรหัสสินค้าจริงก่อน ถึงจะบันทึกใบขายได้`,
              'warning'
            );
          }
        }
      }

      onReservaionSelect(reserveNo, values, form);
      saleNoRef.current.focus();
    } catch (e) {
      showWarn(e);
    }
  };

  const _onValuesChange = val => {
    if (firstKey(val) === 'isEquipment') {
      let mItems = form.getFieldValue('items');
      form.setFieldsValue({
        items: mItems.map(l => ({ ...l, isEquipment: val['isEquipment'] }))
      });
    }
    if (firstKey(val) === 'branchCode') {
      let mItems = form.getFieldValue('items');
      form.setFieldsValue({
        items: mItems.map(l => ({ ...l, branchCode: val['branchCode'] }))
      });
    }
    if (firstKey(val) === 'isUsed') {
      let mItems = form.getFieldValue('items');
      //  showLog({ val, mItems });
      form.setFieldsValue({
        items: mItems.map(l => ({ ...l, isUsed: val['isUsed'] }))
      });
    }
    if (firstKey(val) === 'referrer' && val['referrer']?.bankAccount) {
      const { bankAcc, bankName, bank } = val['referrer'].bankAccount;
      const mReferringDetails = form.getFieldValue('referringDetails');
      let referringDetails = {
        ...mReferringDetails,
        bankAcc,
        bankName,
        bank
      };
      form.setFieldsValue({
        referringDetails
      });
    }
    if (firstKey(val) === 'amtReferrer') {
      if (val['amtReferrer']) {
        const mReferringDetails = form.getFieldValue('referringDetails');
        let amount = Numb(parser(val['amtReferrer']));
        let whTax = amount * 0.05;
        let total = amount - whTax;
        let referringDetails = {
          ...mReferringDetails,
          amount,
          whTax,
          total
        };
        form.setFieldsValue({
          referringDetails
        });
      }
    }
    if (firstKey(val) === 'guarantors') {
      let mGuarantors = form.getFieldValue('guarantors');
      form.setFieldsValue({
        guarantors: mGuarantors.map((l, i) => ({
          ...initGuarantor,
          ...l,
          ...val['guarantors'][i],
          address: {
            ...initAddress,
            ...(!!l?.address && { ...l.address }),
            ...(!!val['guarantors'][i]?.address && {
              ...val['guarantors'][i].address
            })
          }
        }))
      });
    }
  };

  const _onShowCustomerDetail = async values => {
    try {
      const { firstName, lastName, prefix, phoneNumber, customerId, address } = values;
      let selectedCustomer = {
        firstName,
        lastName,
        prefix,
        phoneNumber,
        customerId,
        address
      };
      const doc = values.customerId ? await checkDoc('data', `sales/customers/${values.customerId}`) : null;
      if (doc) {
        selectedCustomer = doc.data();
      }
      return setShowCustomer({ visible: true, customer: selectedCustomer });
    } catch (e) {
      showWarn(e);
    }
  };

  const onCustomerUpdate = cus => {
    const { firstName, lastName, prefix, phoneNumber, customerId, address } = cus;
    if (firstName && customerId) {
      form.setFieldsValue({
        firstName,
        firstName_lower: firstName.toLowerCase(),
        firstName_partial: partialText(firstName),
        lastName,
        prefix,
        phoneNumber,
        customerId,
        address,
        customer: `${prefix || ''}${firstName || ''} ${lastName || ''}`.trim()
      });
    }
    setShowCustomer({ visible: false, customer: {} });
  };

  const _onShowReferrerDetail = async values => {
    try {
      const { firstName, lastName, prefix, phoneNumber, referrerId, address } = values?.referrer || {};
      let referrer = {
        firstName,
        lastName,
        prefix,
        phoneNumber,
        referrerId,
        address
      };
      const doc = values.referrerId ? await checkDoc('data', `sales/referrers/${referrerId}`) : null;
      if (doc) {
        referrer = doc.data();
      }
      return setShowReferrer({ visible: true, referrer });
    } catch (e) {
      showWarn(e);
    }
  };

  const onReferrerUpdate = refer => {
    //  showLog({ refer });
    const { firstName, lastName, prefix, phoneNumber, referrerId, bankAccount, address } = refer;
    if (firstName && referrerId) {
      const { bankAcc, bankName, bank } = bankAccount;
      const mReferringDetails = form.getFieldValue('referringDetails');
      let referringDetails = {
        ...mReferringDetails,
        bankAcc,
        bankName,
        bank
      };
      form.setFieldsValue({
        referrer: {
          firstName,
          lastName,
          prefix,
          phoneNumber,
          referrerId,
          address
        },
        referringDetails,
        isNewReferrer: false
      });
    }
    setShowReferrer({ visible: false, referrer: {} });
  };

  const saleNoRef = useRef(null);

  const _onPreConfirm = async (currentValues, netIncome, gTotal) => {
    try {
      const values = await form.validateFields();
      //  showLog({ currentValues, values });
      let mValues = { ...currentValues, ...values };
      if (!mValues?.saleId) {
        return showAlert('NO_SALE_ID');
      }
      mValues.total = parser(netIncome);
      if (!['other'].includes(mValues.saleType)) {
        // Check items.
        if (!mValues.items) {
          showMessageBar('ไม่มีรายการสินค้า', 'กรุณาเลือกรายการรถหรืออุปกรณ์', 'warning');
          return;
        }

        let mItems = mValues.items.filter(l => !!l.productCode && Numb(l.qty) > 0);
        if (mItems.length === 0) {
          showMessageBar('ไม่มีรายการสินค้า', 'กรุณาเลือกรายการรถหรืออุปกรณ์', 'warning');
          return;
        }

        let hasNoVehicleOrEngineNumberItems = hasNoVehicleOrEngineNumber(mItems);
        if (hasNoVehicleOrEngineNumberItems) {
          showMessageBar('ไม่มีเลขรถ/เลขเครื่อง', `กรุณาป้อนข้อมูล เลขรถ/เลขเครื่อง`, 'warning');
          return;
        }

        let hasNoPeripheralNumberItems = hasNoPeripheralNumber(mItems);
        if (hasNoPeripheralNumberItems) {
          showMessageBar('ไม่มีหมายเลขอุปกรณ์', `กรุณาป้อนข้อมูล หมายเลขอุปกรณ์`, 'warning');
          return;
        }

        const dupSnap = await checkCollection('sections/sales/vehicles', [
          ['keywords', 'array-contains', mValues.saleNo.toLowerCase()]
        ]);
        if (dupSnap) {
          showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.saleNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
          return;
        }

        mItems = mValues.items.map(item => ({
          ...item,
          saleId: mValues.saleId,
          saleNo: mValues.saleNo,
          ...(!item.saleItemId && { saleItemId: getItemId('SALE-VEH') }),
          branchCode: mValues.branchCode,
          saleDate: mValues.date,
          registered: null,
          ivAdjusted: false
        }));
        mItems = cleanNumberFieldsInArray(mItems, ['qty', 'total']);
        mValues.items = mItems;
        if (mValues?.turnOverItems && mValues.turnOverItems.length > 0) {
          let turnOverItems = mValues.turnOverItems.filter(l => !!l.productCode && Numb(l.qty) > 0);
          mValues.turnOverItems = turnOverItems;
        }
        mValues.amtFull = parser(gTotal);
      }
      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtReceived',
        'amtFull',
        'advInstallment',
        'amtPlateAndInsurance',
        'amtSKC',
        'amtOldCustomer',
        'amtReferrer',
        'amtMAX',
        'amtKBN',
        'amtReservation',
        'amtTurnOver',
        'amtTurnOverDifRefund',
        'oweKBNLeasing',
        'amtOther',
        'deductOther',
        'total'
      ]);
      if (mValues?.promotions) {
        if (mValues?.promotions.length > 0) {
          mValues.promotions = mValues.promotions.filter(l => !!l);
          mValues.amtPro = mValues.promotions.reduce((sum, elem) => sum + Numb(elem?.total), 0);
        } else {
          mValues.amtPro = 0;
        }
      }
      if (mValues?.deductOthers) {
        if (mValues?.deductOthers.length > 0) {
          mValues.deductOthers = mValues.deductOthers.filter(l => !!l);
          mValues.deductOther = mValues.deductOthers.reduce((sum, elem) => sum + Numb(elem?.total), 0);
        } else {
          mValues.deductOther = 0;
        }
      }

      if (mValues.saleType === 'other' && mValues?.amtOthers.length === 0) {
        showMessageBar('กรุณาตรวจสอบข้อมูล', 'กรุณาป้อนรายรับอื่นๆ', 'warning');
        return;
      }
      if (mValues?.amtOthers) {
        if (mValues?.amtOthers.length > 0) {
          mValues.amtOthers = mValues.amtOthers.filter(l => !!l);
          mValues.amtOther = mValues.amtOthers.reduce((sum, elem) => sum + Numb(elem?.total), 0);
        } else {
          mValues.amtOther = 0;
        }
      }
      if (mValues?.oweKBNLeasings) {
        const oweKBNLeasing = Object.keys(mValues.oweKBNLeasings).reduce(
          (sum, elem) => sum + Numb(mValues.oweKBNLeasings[elem]),
          0
        );
        mValues.oweKBNLeasing = oweKBNLeasing;
      }
      //  showLog('clean mValues', mValues);

      // Check payments.
      if (mValues?.payments && mValues.payments.length > 0) {
        let paymentChecked = checkPayments(mValues.payments, false);
        const { hasNoSelfBank, hasNoAmount, hasNoPerson, hasNoPaymentMethod } = paymentChecked;
        if (hasNoSelfBank) {
          showMessageBar('ไม่มีข้อมูลธนาคาร ในการชำระเงินประเภท-เงินโอน', 'ไม่มีข้อมูลธนาคาร', 'warning');
          return;
        }
        if (hasNoPerson) {
          showMessageBar(
            'ไม่มีข้อมูลชื่อผู้โอน/ผู้ฝากเงิน ในการชำระเงินประเภท-เงินโอน',
            'ไม่มีข้อมูลชื่อผู้โอน/ผู้ฝากเงิน',
            'warning'
          );
          return;
        }
        if (hasNoPaymentMethod) {
          showMessageBar('ไม่มีข้อมูลวิธีโอนเงิน ในการชำระเงินประเภท-เงินโอน', 'ไม่มีข้อมูลวิธีโอนเงิน', 'warning');
          return;
        }
        if (hasNoAmount) {
          showMessageBar('ไม่มีข้อมูลจำนวนเงิน ในการชำระเงิน', 'ไม่มีข้อมูลจำนวนเงิน', 'warning');
          return;
        }
      }

      showConfirm(
        () => _onConfirm(mValues),
        mValues?.saleNo ? `บันทึกข้อมูลใบสั่งขายเลขที่ ${mValues.saleNo}` : 'บันทึกข้อมูลใบสั่งขาย'
      );
    } catch (e) {
      showWarn(e);
      // errorHandler(e);
    }
  };

  const _onConfirm = async values => {
    try {
      let mValues = cleanValuesBeforeSave(values);
      load(true);
      if (!values.customerId) {
        // New customer
        const customerId = await updateNewOrderCustomer({
          values,
          firestore,
          api,
          dispatch,
          user
        });
        if (customerId) {
          mValues.customerId = customerId;
        }
      }

      if (values.referrer?.firstName && !values.referrer?.referrerId) {
        // New referrer
        const referrerId = await updateNewOrderReferrer({
          values,
          firestore,
          api,
          dispatch,
          user
        });
        if (referrerId) {
          mValues.referrer.referrerId = referrerId;
        }
      }

      if (!mValues?.saleNo || !mValues?.firstName) {
        errorHandler({ message: 'NO_SALE_NO_OR_NAME', snap: mValues });
        return;
      }

      // Add search keys
      let saleNo_lower = mValues.saleNo.toLowerCase();
      let salePNo = removeAllNonAlphaNumericCharacters(saleNo_lower);
      let key1 = createKeywords(saleNo_lower);
      let key2 = createKeywords(removeAllNonAlphaNumericCharacters(saleNo_lower));
      let key3 = createKeywords(mValues.firstName);
      let key4 = !!mValues.lastName ? createKeywords(mValues.lastName) : [];
      let keywords = uniq([...key1, ...key2, ...key3, ...key4]);
      mValues = {
        ...mValues,
        salePNo,
        keywords,
        saleNo_lower,
        saleNo_partial: partialText(mValues.saleNo),
        firstName_lower: mValues.firstName.toLowerCase(),
        firstName_partial: partialText(mValues.firstName),
        customer: `${mValues.prefix}${mValues.firstName} ${mValues.lastName || ''}`.trim(),
        hasTurnOver: !!mValues?.amtTurnOverVehicle ? Numb(mValues.amtTurnOverVehicle) > 0 : false,
        hasReferrer: !!mValues.referrer?.firstName,
        hasGuarantor: !!mValues.guarantors.length > 0 && !!mValues.guarantors[0]?.firstName
      };

      const mConfirm = await onConfirmSaleOrder({
        values: mValues,
        category: 'vehicle',
        order: mProps.order,
        isEdit: mProps.isEdit,
        user,
        firestore,
        api
      });

      load(false);

      mConfirm &&
        showSuccess(
          () => {
            if (mProps.isEdit && mProps.onBack) {
              history.push(mProps.onBack.path, { params: mProps.onBack });
            } else {
              let saleId = createNewSaleOrderId();
              resetToInitial();
              setProps({ ...initProps, order: { saleId } });
              form.setFieldsValue(getInitialValues({ saleId }, user));
            }
          },
          mValues?.saleNo ? `บันทึกข้อมูลใบสั่งขายเลขที่ ${mValues.saleNo} สำเร็จ` : 'บันทึกข้อมูลใบสั่งขาย สำเร็จ',
          true
        );
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...cleanValuesBeforeSave(values), module: 'SaleVehicles' }
      });
    }
  };

  const resetToInitial = () => {
    form.resetFields();
  };

  const showMoreInfo = () => {
    let mValues = form.getFieldsValue();
    setMoreInfo({
      visible: true,
      values: mValues
    });
  };
  return (
    <Container fluid className="main-content-container py-3">
      <Row noGutters className="page-header px-3 bg-white">
        <PageTitle sm="4" title="งานขาย" subtitle="รถและอุปกรณ์" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-white"
            steps={CommonSteps}
            activeStep={mProps.activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      {!ready ? (
        <Skeleton active />
      ) : (
        <Form
          form={form}
          initialValues={getInitialValues(mProps.order, user)}
          onValuesChange={_onValuesChange}
          size="small"
          layout="vertical"
        >
          {values => {
            let itemsError = !values.items[0]?.productCode ? 'กรุณาป้อนรายการ' : null;
            const gTotal =
              values.items && values.items.length > 0
                ? values.items.filter(l => !l.deleted).reduce((sum, it) => sum + Numb(it.total), 0)
                : null;

            //  showLog({ values, amtPro, amtDeduct, amtKBNLeasing, amtOther });
            let netIncome = _getNetIncomeFromValues(values);
            if (netIncome <= 0) {
              netIncome = 0;
            }
            let editData = [];
            if (values.editedBy) {
              editData = getEditArr(values.editedBy, users);
            }
            const hasReferrer = values.referrer?.firstName;

            return (
              <div className={`${isMobile ? '' : 'px-3 '}bg-light`}>
                {/* <HiddenItem name="saleId" /> */}
                <HiddenItem name="saleId" />
                <HiddenItem name="customerId" />
                <HiddenItem name="ivAdjusted" />
                <HiddenItem name="amtDeposit" />
                <HiddenItem name="bookingPerson" />
                <HiddenItem name="bookDate" />
                <HiddenItem name="depositPayments" />
                <HiddenItem name="reservationDepositor" />
                {['cash', 'other', 'reservation'].includes(values.saleType) && <HiddenItem name="guarantors" />}
                <div className="bg-light">
                  <SalesHeader
                    disableAllBranches
                    dateLabel="วันที่รับเงิน"
                    orderSearch={values.saleType !== 'reservation'}
                    onSearchSelect={reserveNo => _onBookingSelect(reserveNo, values)}
                  />
                </div>
                <Row form className="mb-3 border-bottom">
                  <Col md="3">
                    <Form.Item
                      name="saleNo"
                      label="เลขที่ใบสั่งขาย"
                      rules={[{ required: true, message: 'กรุณาป้อนเลขที่ใบสั่งขาย' }]}
                    >
                      <Input ref={saleNoRef} placeholder="เลขที่ใบสั่งขาย" />
                    </Form.Item>
                  </Col>
                  <Col md="3" className="d-flex flex-column">
                    <Form.Item label="ประเภทการขาย" name="saleType">
                      <Select
                        name="saleType"
                        onChange={e => {
                          //  showLog({ saleType: e });
                          form.setFieldsValue({
                            saleType: e,
                            amtReceived: e === 'cash' ? (!!gTotal ? gTotal.replace(/,/g, '') : null) : null
                          });
                        }}
                        disabled={!grant}
                        className="text-primary"
                      >
                        {Object.keys(SaleType).map(k => (
                          <Option value={k} key={k}>
                            {SaleType[k]}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md="3">
                    <Form.Item name="salesPerson" label="พนักงานขาย" rules={getRules(['required'])}>
                      <EmployeeSelector disabled={!grant} placeholder="พนักงานขาย" mode="tags" />
                    </Form.Item>
                  </Col>
                  <Col md="3">
                    <Form.Item name="sourceOfData" label="แหล่งที่มา">
                      <SourceOfDataSelector disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                {values.editedBy && (
                  <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                    <NotificationIcon
                      icon="edit"
                      data={editData}
                      badgeNumber={values.editedBy.length}
                      theme="warning"
                    />
                    <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                  </Row>
                )}
                {values.saleType === 'sklLeasing' && (
                  <AnimateKeyframes play={values.saleType === 'sklLeasing'} keyframes={['opacity: 0', 'opacity: 1']}>
                    <Form.Item
                      name="contractDate"
                      label={<label className="text-primary">วันที่นัดทำสัญญาเช่าซื้อ SKL</label>}
                      rules={[
                        {
                          required: values.saleType === 'sklLeasing',
                          message: 'กรุณาป้อนข้อมูล'
                        }
                      ]}
                    >
                      <DatePicker grant={grant} />
                    </Form.Item>
                  </AnimateKeyframes>
                )}
                <div className="px-3 bg-white border pt-3">
                  <Row form>
                    <Col md="2">
                      <h6>ข้อมูลลูกค้า</h6>
                    </Col>
                    <Col md="4">
                      <Form.Item name="isNewCustomer">
                        <Toggles
                          disabled={!grant || mProps.readOnly}
                          buttons={[
                            { label: 'ลูกค้าใหม่', value: true },
                            { label: 'ลูกค้าเก่า', value: false }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Customer
                    grant={grant}
                    onClick={() => _onShowCustomerDetail(values)}
                    values={values}
                    form={form}
                    size="small"
                  />
                  <Address address={values.address} />
                </div>
                {!['cash', 'other', 'reservation'].includes(values.saleType) && (
                  <div className="px-3 bg-white border my-3 py-3">
                    <h6 className="text-primary">ผู้ค้ำประกัน</h6>
                    <Guarantors
                      grant={grant}
                      readOnly={mProps.readOnly}
                      name="guarantors"
                      size="small"
                      notRequired
                      addText="เพิ่มผู้ค้ำประกัน"
                      values={values}
                    />
                    {!!values.guarantors.length > 0 && (
                      <Form.Item
                        name={'guarantorDocs'}
                        rules={[
                          {
                            required: !!values.guarantors.length > 0,
                            message: 'กรุณาป้อนข้อมูล'
                          }
                        ]}
                        label="เอกสารประกอบผู้เช่าซื้อ/ผู้ค้ำประกัน"
                        className="border p-3 bg-light"
                      >
                        <GuarantorDocs grant={grant} readOnly={mProps.readOnly} />
                      </Form.Item>
                    )}
                  </div>
                )}
                <div className="pt-3 mt-3">
                  {/* <Row form>
                    <Col md="2">
                      <h6>ประเภทสินค้า</h6>
                    </Col>
                    <Col md="4">
                      <Form.Item name="isUsed">
                        <Toggles
                          buttons={[
                            { label: 'ใหม่', value: false },
                            { label: 'มือสอง', value: true },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row> */}
                  {itemsError && (
                    <div className="mt-2">
                      <strong className="text-warning">{itemsError}</strong>
                    </div>
                  )}

                  <div className="mb-2" style={{ backgroundColor: theme.colors.grey5 }}>
                    <SaleItems
                      items={values.items}
                      saleId={values.saleId}
                      onChange={dat => form.setFieldsValue({ items: dat })}
                      grant={grant}
                      isUsed={values?.isUsed}
                      permanentDelete={true}
                      // isEquipment={values.isEquipment}
                    />
                  </div>
                </div>
                <div className="px-3 bg-white border my-3 pt-3">
                  <Row form>
                    {!['other'].includes(values.saleType) ? (
                      <Col md="4">
                        <Form.Item
                          name="amtReceived"
                          label={
                            values.saleType === 'reservation'
                              ? 'จำนวนเงินมัดจำ'
                              : values.saleType === 'cash'
                                ? 'จำนวนเงินที่ได้รับ'
                                : 'จำนวนเงินดาวน์'
                          }
                          rules={[
                            // {
                            //   required: !['kbnLeasing', 'other'].includes(
                            //     values.saleType
                            //   ),
                            //   message: 'กรุณาป้อนจำนวนเงิน',
                            // },
                            ...getRules(['number'])
                          ]}
                        >
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    ) : (
                      <Col md="4">
                        <Form.Item label="รายรับ อื่นๆ">
                          <ArrayInput name="amtOthers" columns={arrayInputColumns} />
                        </Form.Item>
                      </Col>
                    )}
                    {!['other'].includes(values.saleType) && (
                      <Col md="4">
                        <Form.Item
                          // name="amtFull"
                          label="ราคาเต็ม"
                          rules={[
                            {
                              required: !['other'].includes(values.saleType),
                              message: 'กรุณาป้อนจำนวนเงิน'
                            },
                            ...getRules(['number'])
                          ]}
                        >
                          <Input
                            placeholder="จำนวนเงิน"
                            addonAfter="บาท"
                            value={gTotal}
                            disabled
                            className="text-primary"
                            currency
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {!['reservation', 'other'].includes(values.saleType) && (
                      <Col md="4">
                        <Form.Item name="deliverDate" label="วันที่ส่งมอบรถ">
                          <DatePicker placeholder="วันที่ส่งมอบรถ" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </div>
                {!['reservation'].includes(values.saleType) && (
                  <TurnOverVehicle
                    onItemChange={dat => {
                      let amtTurnOverVehicle = (dat || []).reduce(
                        (sum, elem) => sum + (!!elem?.total ? Numb(elem.total) : 0),
                        0
                      );
                      return form.setFieldsValue({
                        turnOverItems: dat,
                        amtTurnOverVehicle
                      });
                    }}
                    values={values}
                    docId={values.saleId}
                    grant={grant}
                    readOnly={mProps.readOnly}
                    permanentDelete={true}
                  />
                )}
                <div className="px-3 bg-white border pt-3 mb-3">
                  {!['reservation', 'other'].includes(values.saleType) && (
                    <Row form className="bg-white">
                      {values.saleType !== 'cash' && (
                        <Col md="4">
                          <Form.Item name="advInstallment" label="ชำระค่างวดล่วงหน้า" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                      )}
                      <Col md="4">
                        <Form.Item
                          name="amtPlateAndInsurance"
                          label="ชำระ ค่าทะเบียน + พรบ."
                          rules={getRules(['number'])}
                        >
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  {!['reservation'].includes(values.saleType) && (
                    <>
                      <Row form>
                        <Col md="4">
                          <Form.Item name="amtSKC" label="ส่วนลด SKC" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item name="amtOldCustomer" label="ส่วนลด ลูกค้าเก่า" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item name="amtMAX" label="ส่วนลด MAX" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="4">
                          <Form.Item name="amtKBN" label="ส่วนลด KBN" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item label="โปรโมชั่น">
                            <ArrayInput name="promotions" columns={arrayInputColumns} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item name="proMonth" label="โปรโมชั่นประจำเดือน">
                            <DatePicker picker="month" />
                          </Form.Item>
                        </Col>
                      </Row>
                      {values.saleType !== 'reservation' && (
                        <Row form>
                          <Col md="4">
                            <Form.Item name="amtReservation" label="เงินจอง/เงินมัดจำ" rules={getRules(['number'])}>
                              <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                            </Form.Item>
                          </Col>
                          <Col md="4">
                            <Form.Item label="ข้อมูลเพิ่มเติม">
                              <Button
                                icon={<InfoCircleOutlined />}
                                onClick={showMoreInfo}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8
                                }}
                              >
                                รายละเอียด เงินจอง/เงินมัดจำ
                              </Button>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                      <Row>
                        <Col md="4">
                          <Form.Item name="amtTurnOver" label="หัก ตีเทิร์น" rules={getRules(['number'])}>
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item
                            name="amtTurnOverDifRefund"
                            label="ส่วนต่างเงินคืนลูกค้า ตีเทิร์น"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row form>
                        {!['kbnLeasing'].includes(values.saleType) && (
                          <Col md="4">
                            <Form.Item name="oweKBNLeasing" label="หัก ค้างโครงการร้าน" rules={getRules(['number'])}>
                              <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                            </Form.Item>
                          </Col>
                        )}
                        <Col md="4">
                          <Form.Item label="รายการหักเงิน อื่นๆ">
                            <ArrayInput name="deductOthers" columns={arrayInputColumns} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                  {['kbnLeasing'].includes(values.saleType) && (
                    <Fragment>
                      <Row form className="bg-white">
                        <Col md="4">
                          <Form.Item
                            name={['oweKBNLeasings', 'Down']}
                            label="ค้างดาวน์ร้าน"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item
                            name={['oweKBNLeasings', 'Installment']}
                            label="ค้างค่างวดร้าน"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item
                            name={['oweKBNLeasings', 'Equipment']}
                            label="ค้างอุปกรณ์ร้าน"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row form className="bg-white">
                        <Col md="4">
                          <Form.Item
                            name={['oweKBNLeasings', 'Borrow']}
                            label="ยืมเงินร้าน"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                        <Col md="4">
                          <Form.Item
                            name={['oweKBNLeasings', 'overdueFines']}
                            label="เบี้ยปรับล่าช้า"
                            rules={getRules(['number'])}
                          >
                            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Fragment>
                  )}
                  {values.saleType === 'other' && (
                    <Row form className="bg-white">
                      <Col md="4">
                        <Form.Item name="amtOther" label="รายรับอื่นๆ" rules={getRules(['number'])}>
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  {values.saleType === 'baac' && (
                    <Row form>
                      <Col md="4">
                        <Form.Item
                          name="amtBaacFee"
                          label="หักค่าธรรมเนียม สกต/ธกส."
                          rules={[
                            {
                              required: values.saleType === 'baac',
                              message: 'กรุณาป้อนข้อมูล'
                            },
                            ...getRules(['number'])
                          ]}
                        >
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>

                      <Col md="4">
                        {/* <AInput.Group compact className="d-flex flex-row"> */}
                        <Form.Item
                          name="baacNo"
                          label="เลขที่ ใบ สกต./ธกส."
                          rules={[
                            {
                              required: values.saleType === 'baac',
                              message: 'กรุณาป้อนข้อมูล'
                            }
                          ]}
                        >
                          <Input placeholder="111/1" disabled={!grant} />
                        </Form.Item>
                      </Col>
                      <Col md="4">
                        <Form.Item
                          name="baacDate"
                          label="วันที่ ใบ สกต./ธกส."
                          rules={[
                            {
                              required: values.saleType === 'baac',
                              message: 'กรุณาป้อนข้อมูล'
                            }
                          ]}
                        >
                          <DatePicker placeholder="วันที่ ใบ สกต./ธกส." disabled={!grant} />
                        </Form.Item>
                        {/* </AInput.Group> */}
                      </Col>
                      {/* <Col md="4">
                      <Form.Item
                        name="amtBaacDebtor"
                        label="หัก ลูกหนี้ สกต/ธกส."
                        rules={[
                          {
                            required: values.saleType === 'baac',
                            message: 'กรุณาป้อนข้อมูล',
                          },
                          ...getRules(['number']),
                        ]}
                      >
                        <Input
                          currency
                          placeholder="จำนวนเงิน"
                          addonAfter="บาท"
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col> */}
                    </Row>
                  )}

                  {!['other'].includes(values.saleType) && (
                    <Row form>
                      <Col md="8">
                        <Form.Item label="ของแถม">
                          <ArrayInput name="giveaways" columns={giveAwayInputColumns} form={form} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </div>
                {!['other'].includes(values.saleType) && (
                  <BuyMore
                    onItemChange={dat => {
                      let amtAdditionalPurchase = (dat || []).reduce(
                        (sum, elem) => sum + (!!elem?.total ? Numb(elem.total) : 0),
                        0
                      );
                      let payments = _getPaymentFromAdditionalPurchase(dat);
                      return form.setFieldsValue({
                        additionalPurchase: dat,
                        amtAdditionalPurchase,
                        payments
                      });
                    }}
                    values={values}
                    docId={values.saleId}
                    grant={grant}
                    readOnly={mProps.readOnly}
                    permanentDelete={true}
                  />
                  // <Row form>
                  //   <Col md="8">
                  //     <Form.Item label="รายการซื้อเพิ่ม">
                  //       <ArrayInput
                  //         name="additionalPurchase"
                  //         columns={giveAwayInputColumns}
                  //         form={form}
                  //       />
                  //     </Form.Item>
                  //   </Col>
                  // </Row>
                )}
                <div className="px-3 bg-white border py-2 mb-3">
                  <h6 className="text-primary">ค่าแนะนำ</h6>
                  <div className="border my-2 p-3 bg-light">
                    <label className="text-muted">ข้อมูลผู้แนะนำ</label>
                    <Row form>
                      <Col md="4">
                        <Form.Item name="isNewReferrer">
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value={true}>คนแนะนำใหม่</Radio.Button>
                            <Radio.Button value={false}>คนแนะนำเก่า</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Referrer
                      grant={grant}
                      onClick={() => _onShowReferrerDetail(values)}
                      values={values}
                      form={form}
                      size="small"
                      notRequired
                    />
                    {values.referrer?.firstName && (
                      <Address address={values.referrer?.address} parent={['referrer', 'address']} notRequired />
                    )}
                  </div>
                  <Collapse activeKey={hasReferrer ? ['1'] : undefined}>
                    <Collapse.Panel header="รายละเอียดค่าแนะนำ" key="1">
                      <Referring hasReferrer={hasReferrer} grant={grant} />
                      <ReferringFooter grant={grant} hasReferrer={hasReferrer} />
                    </Collapse.Panel>
                  </Collapse>
                </div>

                {['reservation'].includes(values.saleType) && (
                  <div className="bg-white border pt-3 mb-3">
                    <Col md="4">
                      <Form.Item
                        name="bookingPerson"
                        label="ผู้รับจอง"
                        rules={[
                          {
                            required: ['reservation'].includes(values.saleType),
                            message: 'กรุณาป้อนข้อมูล'
                          }
                        ]}
                      >
                        <EmployeeSelector disabled={!grant || mProps.readOnly} />
                      </Form.Item>
                    </Col>
                  </div>
                )}

                <TotalSummary values={values} grant={grant} netIncome={netIncome} />
                <Form.Item label="การชำระเงิน" name="payments">
                  <Payments disabled={!grant || mProps.readOnly} permanentDelete={true} />
                </Form.Item>
                <Row form>
                  <Col md={8}>
                    <Form.Item name="remark" label="หมายเหตุ">
                      <Input disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                <CardFooter className="border-top ">
                  <Row style={{ justifyContent: 'flex-end' }} form>
                    <Row
                      style={{
                        justifyContent: 'flex-end',
                        marginRight: 10
                      }}
                      form
                    >
                      <Popconfirm
                        title="ยืนยัน?"
                        okText="ล้าง"
                        cancelText="ยกเลิก"
                        onConfirm={() => form.resetFields()}
                      >
                        <Button
                          // onClick={() => form.resetFields()}
                          className="mr-3"
                          disabled={!grant}
                          size="middle"
                        >
                          ล้างข้อมูล
                        </Button>
                      </Popconfirm>
                      <Button
                        type="primary"
                        onClick={() => _onPreConfirm(values, netIncome, gTotal)}
                        disabled={!grant}
                        size="middle"
                      >
                        บันทึกข้อมูล
                      </Button>
                    </Row>
                  </Row>
                </CardFooter>
              </div>
            );
          }}
        </Form>
      )}
      <MoreReservationInfo
        visible={showMore.visible}
        onCancel={() => setMoreInfo({ visible: false, values: {} })}
        values={showMore.values}
        employees={employees}
        banks={banks}
      />
      {showCustomer.visible && (
        <CustomerDetailsModal
          selectedCustomer={showCustomer.customer}
          visible
          onOk={onCustomerUpdate}
          onCancel={() => setShowCustomer({ visible: false, customer: {} })}
        />
      )}
      {showReferrer.visible && (
        <ReferrerDetailsModal
          selectedReferrer={showReferrer.referrer}
          visible
          onOk={onReferrerUpdate}
          onCancel={() => setShowReferrer({ visible: false, referrer: {} })}
        />
      )}
    </Container>
  );
};

// PropTypes for the content component  
SaleMachinesContent.propTypes = {
  geographic: PropTypes.object,
  auditTrail: PropTypes.object
};

// Main component wrapped with DocumentWorkflowWrapper for document approval flow
const SaleMachinesComponent = () => {
  return (
    <DocumentWorkflowWrapper
      documentType="sales_vehicle"
      documentId={null} // Will be set when document is created
      layoutProps={{
        title: "งานขาย",
        subtitle: "รถและอุปกรณ์",
        permission: "sales.view",
        editPermission: "sales.edit",
        loading: false
      }}
    >
      <SaleMachinesContent />
    </DocumentWorkflowWrapper>
  );
};

export default SaleMachinesComponent;
