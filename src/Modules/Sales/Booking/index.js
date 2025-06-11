import { Form, Radio, Select, Skeleton } from 'antd';
import { CommonSteps } from 'data/Constant';
import { Stepper, Button } from 'elements';
import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showWarn } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { Input } from 'elements';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import Customer from 'components/Customer';
import { useHistory, useLocation } from 'react-router';
import { arrayInputColumns, getInitialValues, arrayInputColumns2, printColumns } from './api';
import { FirebaseContext } from '../../../firebase';
import { createNewSaleOrderId, onConfirmBookingOrder } from '../api';
import { Numb } from 'functions';
import { SaleType } from 'data/Constant';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import BookItems from './BookItems';
import EmployeeSelector from 'components/EmployeeSelector';
import SalesHeader from '../components/sales-header';
import Referrer from 'Modules/Referrers/Referrer';
import {
  parser,
  showMessageBar,
  showConfirm,
  cleanValuesBeforeSave,
  cleanNumberFieldsInArray,
  cleanNumberFields,
  load,
  showSuccess
} from 'functions';
import { updateNewOrderCustomer, updateNewOrderReferrer } from 'Modules/Utils';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import ReferrerDetailsModal from 'Modules/Referrers/ReferrerDetailsModal';
import { useMergeState } from 'api/CustomHooks';
import { partialText } from 'utils';
import { firstKey } from 'functions';
import { TotalSummary } from 'components/common/TotalSummary';
import { BuyMore, TurnOverVehicle } from '../components';
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import PrintComponent from 'components/PrintComponent';
import { showPrint } from 'functions';
import { CheckOutlined, PrinterFilled } from '@ant-design/icons';
import { __DEV__ } from 'utils';
import { hidePrint } from 'functions';
import { BeforePrint } from 'components/PrintComponent/Common/BeforePrint';
import { isMobile } from 'react-device-detect';
import Footer from 'components/Footer';
import Payments from 'components/Payments';
import { checkDoc } from 'firebase/api';
import { DatePicker } from 'elements';
import { StatusMapToStep } from 'data/Constant';
import { errorHandler } from 'functions';
import { Address } from 'components/NameAddress';
import { checkCollection } from 'firebase/api';
import { showAlert } from 'functions';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { createKeywords } from 'utils';
import { uniq } from 'lodash';
import { _getPaymentFromAdditionalPurchase } from '../Vehicles/api';
import { checkPayments } from 'Modules/Utils';
import BookingLicence from 'components/PrintComponent/BookingLicence';
// RBAC Integration
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import { Card, Row, Col, Space, Typography } from 'antd';
import { useResponsive } from 'hooks/useResponsive';
// Legacy imports for Container and PageTitle
import { Container } from 'shards-react';
import PageTitle from 'components/common/PageTitle';
import PropTypes from 'prop-types';

const { Option } = Select;
const { Title } = Typography;

const BOOKING_STEPS = [
  { title: 'บันทึกข้อมูล', description: 'บันทึกรายการจองขายรถ' },
  { title: 'ตรวจสอบ', description: 'ตรวจสอบความถูกต้องของข้อมูล' },
  { title: 'อนุมัติ', description: 'อนุมัติรายการจอง' },
  { title: 'เสร็จสิ้น', description: 'จองขายเสร็จสิ้น' }
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
const BookingContent = ({ geographic, auditTrail, mProps, ...contentProps }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div>
      {/* Main booking form content */}
      <BookingFormContent 
        geographic={geographic}
        auditTrail={auditTrail}
        mProps={mProps}
        {...contentProps}
      />
    </div>
  );
};

BookingContent.propTypes = {
  geographic: PropTypes.object,
  auditTrail: PropTypes.object,
  mProps: PropTypes.object.isRequired
};

const BookingFormContent = ({ geographic, auditTrail, ...props }) => {
  const history = useHistory();
  let location = useLocation();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  // showLog({ sale_booking_params: params });

  const { firestore, api } = useContext(FirebaseContext);

  const activeStep = 0;
  const grant = true;

  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);

  const [mProps, setProps] = useMergeState(initProps);

  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {}
  });
  const [showReferrer, setShowReferrer] = useMergeState({
    visible: false,
    referrer: {}
  });
  const [showBeforePrint, setShowBeforePrint] = useMergeState({
    visible: false,
    values: {}
  });
  const [printChecked, setPrintChecked] = useState(['ต้นฉบับ']);
  const [ready, setReady] = useState(false);

  const [form] = Form.useForm();

  const dispatch = useDispatch();

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.bookId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/sale-booking' : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let bookId = createNewSaleOrderId('BOOK-VEH');
      pOrder = { bookId };
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
    //  showLog({ cus });
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

  const _onValuesChange = val => {
    if (firstKey(val) === 'isEquipment') {
      let mItems = form.getFieldValue('items');
      //  showLog({ val, mItems });
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
  };

  const bookNoRef = useRef(null);

  const _onPreConfirm = async (currentValues, netIncome, gTotal) => {
    try {
      const values = await form.validateFields();
      //  showLog({ currentValues, values });
      let mValues = { ...currentValues, ...values };
      mValues.total = parser(netIncome);
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
      const dupSnap = await checkCollection('sections/sales/bookings', [
        ['keywords', 'array-contains', mValues.bookNo.toLowerCase()],
        ['canceled', '==', null]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.bookNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }

      mItems = mValues.items.map(item => ({
        ...item,
        bookId: mValues.bookId
      }));
      mItems = cleanNumberFieldsInArray(mItems, ['qty', 'total']);
      mValues.items = mItems;

      if (mValues?.turnOverItems && mValues.turnOverItems.length > 0) {
        let turnOverItems = mValues.turnOverItems.filter(l => !!l.productCode && Numb(l.qty) > 0);
        mValues.turnOverItems = turnOverItems;
      }
      mValues.amtFull = parser(gTotal);
      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtReceived',
        'amtFull',
        'downPayment',
        'advInstallment',
        'amtSKC',
        'amtOldCustomer',
        'amtReferrer',
        'amtMAX',
        'amtKBN',
        'amtTurnOver',
        'amtTurnOverDifRefund',
        'oweKBNLeasing',
        'deductOther',
        'total'
      ]);
      //  showLog('clean mValues', mValues);
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

      // Check payments.
      if (mValues?.payments && mValues.payments.length > 0) {
        let paymentChecked = checkPayments(mValues.payments, true);
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
        mValues?.bookNo ? `บันทึกข้อมูลใบจองเลขที่ ${mValues.bookNo}` : 'บันทึกข้อมูลใบจอง'
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async values => {
    try {
      let mValues = cleanValuesBeforeSave(values);
      // showLog('clean1', mValues.referringDetails);
      mValues.referringDetails.forHQ = cleanValuesBeforeSave(mValues.referringDetails.forHQ);
      // showLog('clean2', mValues.referringDetails);
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

      if (!mValues?.bookNo || !mValues?.firstName) {
        errorHandler({ message: 'NO_BOOK_NO_OR_NAME', snap: mValues });
        return;
      }

      let bookNo_lower = mValues.bookNo.toLowerCase();
      let bookPNo = removeAllNonAlphaNumericCharacters(bookNo_lower);
      let key1 = createKeywords(bookNo_lower);
      let key2 = createKeywords(removeAllNonAlphaNumericCharacters(bookNo_lower));
      let key3 = createKeywords(mValues.firstName);
      let key4 = !!mValues.lastName ? createKeywords(mValues.lastName) : [];
      let keywords = uniq([...key1, ...key2, ...key3, ...key4]);

      // Add search keys
      mValues = {
        ...mValues,
        bookPNo,
        keywords,
        bookNo_lower,
        bookNo_partial: partialText(mValues.bookNo),
        firstName_lower: mValues.firstName.toLowerCase(),
        firstName_partial: partialText(mValues.firstName),
        customer: `${mValues.prefix}${mValues.firstName} ${mValues.lastName || ''}`.trim(),
        hasTurnOver: !!mValues?.amtTurnOverVehicle ? Numb(mValues.amtTurnOverVehicle) > 0 : false
      };

      const mConfirm = await onConfirmBookingOrder({
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
              let bookId = createNewSaleOrderId('BOOK-VEH');
              resetToInitial();
              setProps({ ...initProps, order: { bookId } });
              form.setFieldsValue(getInitialValues({ bookId }, user));
            }
          },
          mValues.bookNo ? `บันทึกข้อมูลใบจองเลขที่ ${mValues.bookNo} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
          true
        );
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...cleanValuesBeforeSave(values), module: 'Booking' }
      });
    }
  };

  const resetToInitial = () => {
    form.resetFields();
  };

  const _getProTotal = dArr => {
    let promotions = dArr.filter(l => !!l);
    if (promotions.length > 0) {
      return promotions.reduce((sum, elem) => sum + Numb(elem?.total), 0);
    } else {
      return 0;
    }
  };

  const _getDeductTotal = dArr => {
    let deductOthers = dArr.filter(l => !!l);
    if (deductOthers.length > 0) {
      return deductOthers.reduce((sum, elem) => sum + Numb(elem?.total), 0);
    } else {
      return 0;
    }
  };

  const _getNetIncomeFromValues = values => Numb(values.amtReceived);

  const printComponent = (values, printChecked) => {
    const PrintComponentForBooking = React.forwardRef((props, ref) => (
      <div ref={ref} className="page-break" {...props}>
        {printChecked.includes('ต้นฉบับ') && (
          <BookingLicence
            content={{
              docName: (
                <div>
                  ใบแสดงสิทธิ์การจองซื้อ
                  <br />
                  รถคูโบต้าและอุปกรณ์
                </div>
              ),
              subtitle: '(ต้นฉบับ)',
              docNo: values.bookNo || values.bookId
            }}
            values={values}
            columns={printColumns}
          />
        )}
        {printChecked.includes('สำเนา') && (
          <div {...(printChecked.length > 1 && { className: 'page-break mt-2' })}>
            <BookingLicence
              content={{
                docName: (
                  <div>
                    ใบแสดงสิทธิ์การจองซื้อ
                    <br />
                    รถคูโบต้าและอุปกรณ์
                  </div>
                ),
                subtitle: '(สำเนา)',
                docNo: values.bookNo || values.bookId
              }}
              values={values}
              columns={printColumns}
            />
          </div>
        )}
      </div>
    ));
    
    PrintComponentForBooking.displayName = 'PrintComponentForBooking';
    return PrintComponentForBooking;
  };

  const _print = async () => {
    try {
      const validatedValues = await form.validateFields();
      setShowBeforePrint({ visible: true, values: validatedValues });
    } catch (e) {
      e?.errorFields && showAlert('ข้อมูลในใบจองยังไม่สมบูรณ์');
      showWarn(e);
    }
  };

  return (
    <Container fluid className="main-content-container py-3">
      <Row noGutters className="page-header px-3 bg-white">
        <PageTitle sm="4" title="งานรับจอง" subtitle="รถและอุปกรณ์" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-white"
            steps={CommonSteps}
            activeStep={activeStep}
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
                ? values.items.reduce((sum, it) => sum + Numb(it.total), 0)
                : null;

            // showLog({ booking_values: values });
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
                {/* <HiddenItem name="bookId" /> */}
                <HiddenItem name="bookId" />
                <HiddenItem name="customerId" />
                <HiddenItem name="ivAdjusted" />
                <div className="bg-light">
                  <SalesHeader disableAllBranches />
                </div>
                <Row form className="mb-3 border-bottom">
                  <Col md="3">
                    <Form.Item
                      name="bookNo"
                      label="เลขที่ใบจอง"
                      rules={[{ required: true, message: 'กรุณาป้อนเลขที่บิล' }]}
                    >
                      <Input ref={bookNoRef} placeholder="เลขที่บิล" />
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
                      <SourceOfDataSelector
                        // allowNotInList
                        disabled={!grant || mProps.readOnly}
                      />
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
                <div className="px-3 bg-white border pt-3">
                  <Row form>
                    <Col md="2">
                      <h6>ข้อมูลลูกค้า</h6>
                    </Col>
                    <Col md="4">
                      <Form.Item name="isNewCustomer">
                        <Radio.Group buttonStyle="solid">
                          <Radio.Button style={{ width: 80, textAlign: 'center' }} value={true}>
                            ลูกค้าใหม่
                          </Radio.Button>
                          <Radio.Button style={{ width: 80, textAlign: 'center' }} value={false}>
                            ลูกค้าเก่า
                          </Radio.Button>
                        </Radio.Group>
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
                    <div>
                      <strong className="text-warning">{itemsError}</strong>
                    </div>
                  )}
                  <div className="mb-2" style={{ backgroundColor: theme.colors.grey5 }}>
                    <BookItems
                      // isEquipment={values.isEquipment}
                      items={values.items}
                      bookId={values.bookId}
                      onChange={dat => form.setFieldsValue({ items: dat })}
                      grant={grant}
                      isUsed={values?.isUsed}
                      permanentDelete={true}
                    />
                  </div>
                </div>

                <div className="px-3 bg-white border my-3 pt-3">
                  <Row form>
                    {!['other'].includes(values.saleType) ? (
                      <Col md="3">
                        <Form.Item name="amtReceived" label="จำนวนเงินมัดจำ" rules={getRules(['required', 'number'])}>
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    ) : (
                      <Col md="3">
                        <Form.Item label="รายรับ อื่นๆ">
                          <ArrayInput name="amtOthers" columns={arrayInputColumns} />
                        </Form.Item>
                      </Col>
                    )}
                    {!['other'].includes(values.saleType) && (
                      <Col md="3">
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
                    {!['other'].includes(values.saleType) && (
                      <Col md="3">
                        <Form.Item name="downPayment" label="เงินดาวน์">
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    )}
                    {!['other'].includes(values.saleType) && (
                      <Col md="3">
                        <Form.Item name="advInstallment" label="ค่างวดล่วงหน้า">
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </div>
                {values.saleType === 'other' && (
                  <div className="px-3 bg-white border pt-3 mb-3">
                    <Row form className="bg-white">
                      <Col md="4">
                        <Form.Item name="amtOther" label="รายรับอื่นๆ" rules={getRules(['number'])}>
                          <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}
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
                  docId={values.bookId}
                  grant={grant}
                  readOnly={mProps.readOnly}
                  permanentDelete={true}
                />
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
                <Row form>
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
                  <Col md="4">
                    <Form.Item label="รายการหักเงิน อื่นๆ">
                      <ArrayInput name="deductOthers" columns={arrayInputColumns} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item name="oweKBNLeasing" label="หัก ค้างโครงการร้าน" rules={getRules(['number'])}>
                      <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                {!['other'].includes(values.saleType) && (
                  <Row form>
                    <Col md="8">
                      <Form.Item label="ของแถม">
                        <ArrayInput name="giveaways" columns={arrayInputColumns2} form={form} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {/* {!['other'].includes(values.saleType) && (
                  <Row form>
                    <Col md="8">
                      <Form.Item label="รายการซื้อเพิ่ม">
                        <ArrayInput
                          name="additionalPurchase"
                          columns={arrayInputColumns2}
                          form={form}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )} */}
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
                    docId={values.bookId}
                    grant={grant}
                    readOnly={mProps.readOnly}
                    permanentDelete={true}
                  />
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
                    <Row>
                      <Col md="4">
                        <Form.Item name="amtReferrer">
                          <Input
                            currency
                            disabled={!grant}
                            addonBefore="ค่าแนะนำ"
                            addonAfter="บาท"
                            className="text-primary"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                  {/* <Collapse activeKey={hasReferrer ? ['1'] : undefined}>
                    <Collapse.Panel header="รายละเอียดค่าแนะนำ" key="1">
                      <Referring hasReferrer={hasReferrer} grant={grant} />
                      <ReferringFooter
                        grant={grant}
                        hasReferrer={hasReferrer}
                      />
                    </Collapse.Panel>
                  </Collapse> */}
                </div>
                <div className="bg-white border pt-3 mb-3">
                  <Col md="4">
                    <Form.Item
                      name="bookingPerson"
                      label="ผู้รับจอง"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนข้อมูล'
                        }
                      ]}
                    >
                      <EmployeeSelector disabled={!grant || mProps.readOnly} />
                    </Form.Item>
                  </Col>
                </div>
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
                <Footer
                  onConfirm={() => _onPreConfirm(values, netIncome, gTotal)}
                  onCancel={() => form.resetFields()}
                  cancelText="ล้างข้อมูล"
                  cancelPopConfirmText="ล้าง?"
                  okPopConfirmText="ยืนยัน?"
                  okIcon={<CheckOutlined />}
                  alignRight
                  extraButtons={
                    isMobile ? (
                      <PrintComponent
                        ComponentToPrint={printComponent(values, printChecked)}
                        hideComponent
                        disabled={!grant}
                        type="primary"
                        buttonText="พิมพ์ใบจอง"
                        fileName={`kbn-${values.bookNo || values.bookId}`}
                        validateBeforePrint={async () => {
                          try {
                            await form.validateFields();
                            return true;
                          } catch (e) {
                            e?.errorFields && showAlert('ข้อมูลในใบจองยังไม่สมบูรณ์');
                            return false;
                          }
                        }}
                        buttonStyle={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '96%',
                          margin: 6
                        }}
                      />
                    ) : (
                      <Button
                        onClick={_print}
                        type="primary"
                        icon={<PrinterFilled />}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          width: 120
                        }}
                        size="middle"
                        className="m-1"
                      >
                        พิมพ์ใบจอง
                      </Button>
                    )
                  }
                />
                {__DEV__ && (
                  <PrintComponent ComponentToPrint={printComponent(values, printChecked)} disabled={!grant} />
                )}
              </div>
            );
          }}
        </Form>
      )}
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
      {showBeforePrint && (
        <BeforePrint
          title={`พิมพ์เอกสาร ${showBeforePrint.values?.bookNo || showBeforePrint.values?.bookId}`}
          docName="ใบแสดงสิทธิ์การจองซื้อรถ"
          onOk={() => {
            showPrint(
              printComponent(showBeforePrint.values, printChecked),
              () => hidePrint(),
              `KBN-${showBeforePrint.values?.bookNo || showBeforePrint.values?.bookId}`
            );
            setShowBeforePrint({ visible: false, values: {} });
          }}
          onCancel={() => setShowBeforePrint({ visible: false, values: {} })}
          visible={showBeforePrint.visible}
          onChange={checked => setPrintChecked(checked)}
        />
      )}
    </Container>
  );
  };

BookingFormContent.propTypes = {
  geographic: PropTypes.object,
  auditTrail: PropTypes.object
};

// Main BookingComponent with RBAC integration
const BookingComponent = () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);

  const documentId = mProps.order?.bookId;

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.bookId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/sale-booking' : false;

    if (!isEdit) {
      let bookId = createNewSaleOrderId('BOOK-VEH');
      pOrder = { bookId };
      setProps({ order: pOrder, isEdit, activeStep, readOnly, onBack });
    } else {
      setProps({ order: pOrder, isEdit, activeStep, readOnly, onBack });
    }
    setReady(true);
  }, [params, setProps]);

  const handleGeographicChange = useCallback((geoContext) => {
    console.log('🌍 Geographic context received in Booking:', geoContext);
  }, []);

  if (!ready) {
    return (
      <LayoutWithRBAC
        title="งานรับจอง"
        subtitle="รถและอุปกรณ์"
        permission="sales.view"
        editPermission="sales.edit"
        loading={true}
      >
        <div />
      </LayoutWithRBAC>
    );
  }

  return (
    <LayoutWithRBAC
      title="งานรับจอง"
      subtitle="รถและอุปกรณ์"
      permission="sales.view"
      editPermission="sales.edit"
      requireBranchSelection={false}
      onBranchChange={handleGeographicChange}
      documentId={documentId}
      documentType="booking"
      showAuditTrail={true}
      showStepper={true}
      steps={BOOKING_STEPS}
      currentStep={mProps.activeStep}
      autoInjectProvinceId={true}
    >
      <BookingContent 
        mProps={mProps}
        setProps={setProps}
        params={params}
      />
    </LayoutWithRBAC>
  );
};

BookingComponent.displayName = 'BookingComponent';

export default BookingComponent;
