import React, { Fragment, useContext, useState } from 'react';
import { NotificationIcon } from 'elements';
import { CardFooter, Col, Container, Row } from 'shards-react';
import { Form, Popconfirm, Select, Skeleton } from 'antd';
import { useSelector } from 'react-redux';
import { firstKey } from 'functions';
import { getEditArr } from 'utils';
import { IncomePartCategories } from 'data/Constant';
import { showWarn } from 'functions';
import {
  getInitialValues,
  onConfirmSaleOrder,
  _getNetIncomeFromValues,
} from './api';
import HiddenItem from 'components/HiddenItem';
import Toggles from 'components/Toggles';
import { useMergeState } from 'api/CustomHooks';
import { checkDoc } from 'firebase/api';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import Customer from 'components/Customer';
import { Input } from 'elements';
import { Button } from 'elements';
import { useHistory, useLocation } from 'react-router-dom';
import { arrayInputColumns } from 'data/Constant';
import ArrayInput from 'components/ArrayInput';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { TotalSummary } from 'components/common/TotalSummary';
import Payments from 'components/Payments';
import { load } from 'functions';
import { parser } from 'functions';
import { cleanNumberFields } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { useEffect } from 'react';
import IncomeDailyHeader from 'Modules/Account/screens/Income/IncomeDaily/income-daily-header';
import PageTitle from 'components/common/PageTitle';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import { isMobile } from 'react-device-detect';
import { FirebaseContext } from '../../../firebase';
import { StatusMapToStep } from 'data/Constant';
import { createNewSaleOrderId } from '../api';
import { errorHandler } from 'functions';
import { showSuccess } from 'functions';
import { partialText } from 'utils';
import SalePartItems from './SalePartItems';
import { Numb } from 'functions';
import { showAlert } from 'functions';
import { showMessageBar } from 'functions';
import { getItemId } from 'Modules/Account/api';
import { cleanNumberFieldsInArray } from 'functions';
import { checkCollection } from 'firebase/api';
import { createDoubleKeywords } from 'Modules/Utils';
import { checkPayments } from 'Modules/Utils';

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
};

export default () => {
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const { theme } = useSelector((state) => state.global);
  const [form] = Form.useForm();
  const history = useHistory();
  const { firestore, api } = useContext(FirebaseContext);
  const [docType, setDocType] = useState('partSKC');
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {},
  });
  let location = useLocation();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  // showLog({ sale_vehicle_params: params });

  const [nProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);

  const activeStep = 0;
  const grant = true;

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit =
      !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.saleId;
    const activeStep = !(pOrder && pOrder.date)
      ? 0
      : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path
      ? onBack.path === '/reports/sale-parts'
      : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let saleId = createNewSaleOrderId();
      pOrder = { saleId };
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack,
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack,
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async (val) => {
    try {
      if (firstKey(val) === 'saleType') {
        resetToInitial();
        form.setFieldsValue(val);
        setDocType(val.saleType);
      }
      if (firstKey(val) === 'branchCode' && docType !== 'partDeposit') {
        let mItems = form.getFieldValue('items');
        form.setFieldsValue({
          items: mItems.map((l) => ({ ...l, branchCode: val['branchCode'] })),
        });
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const resetToInitial = () => {
    form.resetFields();
    setShowCustomer({
      visible: false,
      customer: {},
    });
  };

  const _onShowCustomerDetail = async (values) => {
    try {
      const { firstName, lastName, prefix, phoneNumber, customerId, address } =
        values;
      let selectedCustomer = {
        firstName,
        lastName,
        prefix,
        phoneNumber,
        customerId,
        address,
      };
      const doc = values.customerId
        ? await checkDoc('data', `sales/customers/${values.customerId}`)
        : null;
      if (doc) {
        selectedCustomer = doc.data();
      }
      return setShowCustomer({ visible: true, customer: selectedCustomer });
    } catch (e) {
      showWarn(e);
    }
  };

  const onCustomerUpdate = (cus) => {
    const { firstName, lastName, prefix, phoneNumber, customerId, address } =
      cus;
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
        customer: `${prefix || ''}${firstName || ''} ${lastName || ''}`.trim(),
      });
    }
    setShowCustomer({ visible: false, customer: {} });
  };

  const _onConfirm = async (mValues) => {
    try {
      load(true);
      if (!mValues?.saleNo) {
        errorHandler({ message: 'NO_SALE_NO', snap: mValues });
        return;
      }

      const keywords = createDoubleKeywords(mValues.saleNo);

      // Add search keys
      mValues = {
        ...mValues,
        saleNo_lower: mValues.saleNo.toLowerCase(),
        saleNo_partial: partialText(mValues.saleNo),
        ...(!!mValues.firstName && {
          firstName_lower: mValues.firstName.toLowerCase(),
          firstName_partial: partialText(mValues.firstName),
          customer:
            `${mValues.prefix}${mValues.firstName} ${mValues.lastName || ''}`.trim(),
        }),
        keywords,
      };

      const mConfirm = await onConfirmSaleOrder({
        values: mValues,
        category: 'part',
        order: nProps.order,
        isEdit: nProps.isEdit,
        user,
        firestore,
        api,
      });

      load(false);

      mConfirm &&
        showSuccess(
          () => {
            if (nProps.isEdit && nProps.onBack) {
              history.push(nProps.onBack.path, { params: nProps.onBack });
            } else {
              let saleId = createNewSaleOrderId();
              resetToInitial();
              setProps({ ...initProps, order: { saleId } });
              form.setFieldsValue(getInitialValues({ saleId }, user));
            }
          },
          mValues?.saleNo
            ? `บันทึกข้อมูลใบสั่งขายเลขที่ ${mValues.saleNo} สำเร็จ`
            : 'บันทึกข้อมูลใบสั่งขาย สำเร็จ',
          true
        );
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...cleanValuesBeforeSave(mValues), module: 'SaleParts' },
      });
    }
  };

  const _onPreConfirm = async (currentValues, netTotal) => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...currentValues, ...values };
      if (!mValues?.saleId) {
        return showAlert('NO_SALE_ID');
      }
      mValues.total = parser(netTotal);
      if (!['partDeposit'].includes(mValues.saleType)) {
        let mItems = mValues.items.filter((l) => !!l.pCode && Numb(l.qty) > 0);
        if (mItems.length === 0) {
          showMessageBar(
            'ไม่มีรายการสินค้า',
            'กรุณาเลือกรายการรถหรืออุปกรณ์',
            'warning'
          );
          return;
        }
        mItems = mValues.items.map((item) => ({
          ...item,
          saleId: mValues.saleId,
          saleNo: mValues.saleNo,
          ...(!item.saleItemId && { saleItemId: getItemId('SALE-PART') }),
          branchCode: mValues.branchCode,
          saleDate: mValues.date,
          registered: null,
          ivAdjusted: false,
        }));
        mItems = cleanNumberFieldsInArray(mItems, ['qty', 'total']);
        mValues.items = mItems;
      }
      const dupSnap = await checkCollection('sections/sales/parts_input', [
        ['keywords', 'array-contains', mValues.saleNo.toLowerCase()],
      ]);
      if (dupSnap) {
        showAlert(
          'มีรายการซ้ำ',
          `เอกสารเลขที่ ${mValues.saleNo} มีบันทึกไว้แล้วในฐานข้อมูล`,
          'warning'
        );
        return;
      }
      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtReceived',
        'partsDeposit',
        'amtIntake',
        'amtFieldMeter',
        'amtBattery',
        'amtGPS',
        'amtTyre',
        'amtOther',
        'deductOther',
        'total',
      ]);
      if (mValues?.amtOthers) {
        if (mValues?.amtOthers.length > 0) {
          mValues.amtOthers = mValues.amtOthers.filter((l) => !!l);
          mValues.amtOther = mValues.amtOthers.reduce(
            (sum, elem) => sum + Numb(elem?.total),
            0
          );
        } else {
          mValues.amtOther = 0;
        }
      }
      if (mValues?.deductOthers) {
        if (mValues?.deductOthers.length > 0) {
          mValues.deductOthers = mValues.deductOthers.filter((l) => !!l);
          mValues.deductOther = mValues.deductOthers.reduce(
            (sum, elem) => sum + Numb(elem?.total),
            0
          );
        } else {
          mValues.deductOther = 0;
        }
      }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);
      //  showLog('clean values', mValues);

      // Check payments.
      if (mValues?.payments && mValues.payments.length > 0) {
        let paymentChecked = checkPayments(mValues.payments, true);
        const { hasNoSelfBank, hasNoAmount, hasNoPerson, hasNoPaymentMethod } =
          paymentChecked;
        if (hasNoSelfBank) {
          showMessageBar(
            'ไม่มีข้อมูลธนาคาร ในการชำระเงินประเภท-เงินโอน',
            'ไม่มีข้อมูลธนาคาร',
            'warning'
          );
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
          showMessageBar(
            'ไม่มีข้อมูลวิธีโอนเงิน ในการชำระเงินประเภท-เงินโอน',
            'ไม่มีข้อมูลวิธีโอนเงิน',
            'warning'
          );
          return;
        }
        if (hasNoAmount) {
          showMessageBar(
            'ไม่มีข้อมูลจำนวนเงิน ในการชำระเงิน',
            'ไม่มีข้อมูลจำนวนเงิน',
            'warning'
          );
          return;
        }
      }

      showConfirm(
        () => _onConfirm(mValues, resetToInitial),
        `บันทึกข้อมูล ${IncomePartCategories[docType]} เลขที่ ${mValues.saleNo}`
      );
    } catch (e) {
      load(false);
      showWarn(e);
    }
  };

  const getOptions = () =>
    Object.keys(IncomePartCategories).map((k) => {
      return ['partChange'].includes(k) ? null : (
        <Select.Option key={k} value={k}>
          {IncomePartCategories[k]}
        </Select.Option>
      );
    });

  return (
    <Container fluid className='main-content-container py-3'>
      <Row noGutters className='page-header px-3 bg-white'>
        <PageTitle
          sm='4'
          title='งานขาย'
          subtitle='อะไหล่'
          className='text-sm-left'
        />
        <Col>
          <Stepper
            className='bg-white'
            steps={CommonSteps}
            activeStep={nProps.activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      {!ready ? (
        <Skeleton active />
      ) : (
        <Form
          form={form}
          // onFinish={_onPreConfirm}
          onValuesChange={_onValuesChange}
          initialValues={getInitialValues(nProps.order, user)}
          size='small'
          layout='vertical'
        >
          {(values) => {
            //  showLog({ values });
            let itemsError = !values.items[0]?.pCode ? 'กรุณาป้อนรายการ' : null;
            const gTotal =
              values.items && values.items.length > 0
                ? values.items.reduce((sum, it) => sum + Numb(it.total), 0)
                : null;
            const hasHeader = !['partSKC', 'partKBN', 'partChange'].includes(
              values.saleType
            );
            let editData = [];
            if (values.editedBy) {
              editData = getEditArr(values.editedBy, users);
              // showLog('mapped_data', editData);
            }
            const netIncome = _getNetIncomeFromValues(values);
            return (
              <div className={`${isMobile ? '' : 'px-3 '}bg-light`}>
                <HiddenItem name='saleId' />
                <HiddenItem name='customerId' />
                <Row form>
                  <Col md='4' className='d-flex flex-column'>
                    <Form.Item label='ประเภท' name='saleType'>
                      <Select
                        name='saleType'
                        disabled={!grant || nProps.readOnly}
                        className='text-primary'
                      >
                        {getOptions()}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md='8'>
                    <IncomeDailyHeader
                      disabled={!grant || nProps.readOnly}
                      disableAllBranches
                    />
                  </Col>
                </Row>
                {values.editedBy && (
                  <Row
                    form
                    className='mb-3 ml-2'
                    style={{ alignItems: 'center' }}
                  >
                    <NotificationIcon
                      icon='edit'
                      data={editData}
                      badgeNumber={values.editedBy.length}
                      theme='warning'
                    />
                    <span className='ml-2 text-light'>
                      ประวัติการแก้ไขเอกสาร
                    </span>
                  </Row>
                )}
                <Row form>
                  <Col md='4'>
                    <Form.Item
                      name='saleNo'
                      label='เลขที่เอกสาร'
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนเลขที่เอกสาร',
                        },
                      ]}
                    >
                      <Input
                        placeholder='เลขที่เอกสาร'
                        readOnly={nProps.readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={4}>
                    <Form.Item
                      name='salesPerson'
                      label='พนักงานขาย'
                      rules={getRules(['required'])}
                    >
                      <EmployeeSelector
                        disabled={!grant || nProps.readOnly}
                        placeholder='พนักงานขาย'
                        mode='tags'
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {hasHeader && (
                  <div className='bg-light px-3 pt-3 border mb-3'>
                    <Col md='4'>
                      <Form.Item name='isNewCustomer'>
                        <Toggles
                          disabled={!grant || nProps.readOnly}
                          buttons={[
                            { label: 'ลูกค้าใหม่', value: true },
                            { label: 'ลูกค้าเก่า', value: false },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Customer
                      grant={grant}
                      onClick={() => _onShowCustomerDetail(values)}
                      values={values}
                      form={form}
                      size='small'
                      readOnly={nProps.readOnly}
                    />
                  </div>
                )}
                {!['partDeposit'].includes(values.saleType) && (
                  <div>
                    {itemsError && (
                      <div className='mt-2'>
                        <strong className='text-warning'>{itemsError}</strong>
                      </div>
                    )}

                    <div
                      className='mb-2'
                      style={{ backgroundColor: theme.colors.grey5 }}
                    >
                      <SalePartItems
                        items={values.items}
                        saleId={values.saleId}
                        onChange={(dat) =>
                          form.setFieldsValue({
                            items: dat,
                            amtReceived:
                              dat.length > 0
                                ? dat
                                    .filter((l) => !l.deleted)
                                    .reduce(
                                      (sum, it) => sum + Numb(it.total),
                                      0
                                    )
                                : null,
                          })
                        }
                        grant={grant}
                        permanentDelete={true}
                        // isEquipment={values.isEquipment}
                      />
                    </div>
                  </div>
                )}
                <Row form>
                  {!['partKBN'].includes(values.saleType) && (
                    <Col md='4' className='form-group'>
                      <Form.Item
                        name='amtReceived'
                        label='จำนวนเงิน'
                        rules={[
                          {
                            required: !['partKBN'].includes(values.saleType),
                            message: 'กรุณาป้อนจำนวนเงิน',
                          },
                        ]}
                      >
                        <Input
                          readOnly={nProps.readOnly}
                          disabled={!grant}
                          placeholder='จำนวนเงิน'
                          addonAfter='บาท'
                          // value={gTotal}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                {!['partKBN'].includes(values.saleType) ? (
                  <Row form>
                    {!['partDeposit', 'partChange'].includes(
                      values.saleType
                    ) && (
                      <Col md='4' className='form-group'>
                        <Form.Item
                          name='partsDeposit'
                          label='หักเงินมัดจำอะไหล่'
                        >
                          <Input
                            placeholder='หักเงินมัดจำอะไหล่'
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {['partDeposit', 'wholeSale'].includes(values.saleType) && (
                      <Col md='4' className='form-group'>
                        <Form.Item label='รายการหักเงิน อื่นๆ'>
                          <ArrayInput
                            name='deductOthers'
                            columns={arrayInputColumns}
                            readOnly={nProps.readOnly}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                ) : (
                  <Fragment>
                    <Row form>
                      <Col md='4' className='form-group'>
                        <Form.Item name='amtIntake' label='ท่อไอเสีย'>
                          <Input
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                            placeholder='จำนวนเงิน'
                            addonAfter='บาท'
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4' className='form-group'>
                        <Form.Item
                          name='amtFieldMeter'
                          label='เครื่องวัดแปลงนา'
                        >
                          <Input
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                            placeholder='จำนวนเงิน'
                            addonAfter='บาท'
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4' className='form-group'>
                        <Form.Item name='amtBattery' label='แบตเตอรี่'>
                          <Input
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                            placeholder='จำนวนเงิน'
                            addonAfter='บาท'
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md='4' className='form-group'>
                        <Form.Item name='amtGPS' label='GPS'>
                          <Input
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                            placeholder='จำนวนเงิน'
                            addonAfter='บาท'
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4' className='form-group'>
                        <Form.Item name='amtTyre' label='ยาง'>
                          <Input
                            readOnly={nProps.readOnly}
                            disabled={!grant}
                            placeholder='จำนวนเงิน'
                            addonAfter='บาท'
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md='4' className='form-group'>
                        <Form.Item label='รายรับ อื่นๆ'>
                          <ArrayInput
                            name='amtOthers'
                            columns={arrayInputColumns}
                            readOnly={nProps.readOnly}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Fragment>
                )}
                <TotalSummary
                  values={values}
                  grant={grant}
                  readOnly={nProps.readOnly}
                  netIncome={netIncome}
                  hasThirdPayment
                />
                <Form.Item label='การชำระเงิน' name='payments'>
                  <Payments
                    disabled={!grant || nProps.readOnly}
                    permanentDelete={true}
                  />
                  {/* <Payments disabled={!grant || nProps.readOnly} byCustomer /> */}
                </Form.Item>
                <Row form>
                  <Col md={8} className='form-group'>
                    <Form.Item name='remark' label='หมายเหตุ'>
                      <Input disabled={!grant} placeholder='หมายเหตุ' />
                    </Form.Item>
                  </Col>
                </Row>
                <CardFooter className='border-top '>
                  <Row style={{ justifyContent: 'flex-end' }} form>
                    <Row
                      style={{
                        justifyContent: 'flex-end',
                        marginRight: 10,
                      }}
                      form
                    >
                      {!nProps.readOnly ? (
                        <Popconfirm
                          title='ยืนยัน?'
                          okText='ล้าง'
                          cancelText='ยกเลิก'
                          onConfirm={() => {
                            form.resetFields();
                          }}
                        >
                          <Button
                            // onClick={() => form.resetFields()}
                            className='mr-3'
                            disabled={!grant || nProps.readOnly}
                            size='middle'
                          >
                            ล้างข้อมูล
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button
                          onClick={() =>
                            history.push(nProps.onBack.path, {
                              params: nProps.onBack,
                            })
                          }
                          className='mr-3'
                          size='middle'
                        >
                          &larr; กลับ
                        </Button>
                      )}
                      <Button
                        type='primary'
                        onClick={() => _onPreConfirm(values, netIncome)}
                        disabled={!grant}
                        size='middle'
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
      {showCustomer.visible && (
        <CustomerDetailsModal
          selectedCustomer={showCustomer.customer}
          visible
          onOk={onCustomerUpdate}
          onCancel={() => setShowCustomer({ visible: false, customer: {} })}
        />
      )}
    </Container>
  );
};
