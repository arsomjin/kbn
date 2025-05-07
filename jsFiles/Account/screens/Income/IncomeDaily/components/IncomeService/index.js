import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, CardFooter } from 'shards-react';
import { Form, Popconfirm, Select } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import { firstKey, showWarn } from 'functions';
import { IncomeServiceCategories } from 'data/Constant';
import IncomeDailyHeader from '../../income-daily-header';
import Toggles from 'components/Toggles';
import Customer from 'components/Customer';
import IncomeItems from './IncomeItems';
import { getInitialValues, _getNetIncomeFromValues } from './api';
import { getEditArr } from 'utils';
import { NotificationIcon } from 'elements';
import { checkDoc } from 'firebase/api';
import { Input } from 'elements';
import { DatePicker } from 'elements';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import { arrayInputColumns } from 'data/Constant';
import moment from 'moment-timezone';
import { TotalSummary } from 'components/common/TotalSummary';
import Payments from 'components/Payments';
import EmployeeSelector from 'components/EmployeeSelector';
import { DuringDayMoney } from 'components/common/DuringDayMoney';
import { Button } from 'elements';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import { load } from 'functions';
import { showConfirm } from 'functions';
import { parser } from 'functions';
import { showMessageBar } from 'functions';
import { cleanNumberFields } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { deepEqual } from 'functions';
import { partialText } from 'utils';
import { Numb } from 'functions';
import { checkPayments } from 'Modules/Utils';

export default ({
  order,
  onConfirm,
  onBack,
  isEdit,
  readOnly,
  firestore,
  reset,
}) => {
  // showLog({ order, onConfirm, onBack, isEdit, readOnly });
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const { theme } = useSelector((state) => state.global);

  const [form] = Form.useForm();
  const history = useHistory();

  const [docType, setDocType] = useState(order?.incomeType || 'outsideCare');
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {},
  });
  const [deductDepositLabel, setDeductDepositLabel] = useState(
    order?.depositRef
      ? `เลขที่ ${order.depositRef.orderId} วันที่ ${moment(
        order.depositRef.date,
        'YYYY-MM-DD'
      ).format('DD/MM/YYYY')}`
      : null
  );
  const [deductDepositOrderId, setDeductDepositOrderId] = useState(null);

  const [nProps, setProps] = useMergeState({
    order,
    readOnly,
    onBack,
    isEdit,
  });

  const grant = true;

  useEffect(() => {
    setProps({
      order,
      readOnly,
      onBack,
      isEdit,
    });
    let curValues = form.getFieldsValue();
    if (
      !deepEqual(curValues, {
        ...getInitialValues(order),
        branchCode: order?.branchCode || user.branch || '0450',
      })
    ) {
      form.setFieldsValue({
        ...getInitialValues(order),
        branchCode: order?.branchCode || user.branch || '0450',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, order, readOnly]);

  const _onValuesChange = async (val) => {
    try {
      if (firstKey(val) === 'incomeType') {
        resetToInitial();
        form.setFieldsValue(val);
        setDocType(val.incomeType);
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
    setDeductDepositLabel(null);
    setDeductDepositOrderId(null);
  };

  const _onPreConfirm = async (netTotal) => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...values };
      mValues.total = parser(netTotal);

      if (mValues.incomeType !== 'repairDeposit') {
        // Check items.
        let inCompletedItems = false;
        mValues.items &&
          mValues.items.map((item) => {
            if (!item.item) {
              inCompletedItems = true;
            }
            item.incomeId = mValues.incomeId;
            return item;
          });
        if (inCompletedItems) {
          showMessageBar('ไม่มีรายการ', 'กรุณาป้อนรายการ', 'warning');
          return;
        }
      }

      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtParts',
        'amtOil',
        'amtWage',
        'amtBlackGlue',
        'amtDistance',
        'amtPumpCheck',
        'amtOther',
        'deductDeposit',
        'amtDuringDay',
        'total',
      ]);

      if (mValues?.amtOthers) {
        mValues.amtOther = mValues.amtOthers.reduce(
          (sum, elem) => sum + Numb(elem?.total || 0),
          0
        );
      }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);

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

      // showLog('clean values', mValues);
      showConfirm(
        () => _onConfirm(mValues),
        `บันทึกข้อมูลรับเงินประจำวัน ${IncomeServiceCategories[docType]}`
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirm = async (values) => {
    try {
      if (deductDepositOrderId) {
        let depositRef = firestore
          .collection('sections')
          .doc('account')
          .collection('incomes')
          .doc(deductDepositOrderId);
        const docSnap = await depositRef.get();
        if (docSnap.exists) {
          await depositRef.update({ depositUsed: true });
        }
      }
      onConfirm(values, resetToInitial);
    } catch (e) {
      showWarn(e);
    }
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
      return setShowCustomer({
        visible: true,
        customer: selectedCustomer,
      });
    } catch (e) {
      showWarn(e);
    }
  };

  const onCustomerUpdate = (cus) => {
    //  showLog({ cus });
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

  const _onCustomerChange = async (val) => {
    //  showLog('customer', customers[val.value]);
    // TODOS: get deposit value
    let incomeRef = firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .where('incomeType', '==', 'repairDeposit')
      .where('depositUsed', '==', false)
      .where('customerId', '==', val.value)
      .orderBy('date')
      .limit(1);
    let order = {};
    const docSnap = await incomeRef.get();
    if (docSnap.empty) {
      //  showLog('No deposit recorded.');
      return;
    }
    docSnap.forEach((doc) => {
      order = doc.data();
      order._key = doc.id;
    });
    //  showLog('order', order);
    setDeductDepositOrderId(order._key);
    setDeductDepositLabel(
      `เลขที่ ${order.incomeNo} วันที่ ${moment(
        order.date,
        'YYYY-MM-DD'
      ).format('DD/MM/YYYY')}`
    );
    form.setFieldsValue({
      deductDeposit: order.amtDeposit,
      depositRef: {
        orderId: order.incomeNo,
        date: order.date,
      },
    });
  };

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        // onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitialValues(nProps.order),
          branchCode: nProps.order?.branchCode || user.branch || '0450',
        }}
        size="small"
        layout="vertical"
      >
        {(values) => {
          //  showLog({ values });
          let itemsError =
            values.incomeType !== 'repairDeposit'
              ? !values.items[0]?.item
                ? 'กรุณาป้อนรายการ'
                : null
              : null;
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          const netIncome = _getNetIncomeFromValues(values);
          return (
            <>
              {values.incomeType !== 'repairDeposit' && (
                <HiddenItem name="items" />
              )}
              <HiddenItem name="incomeId" />
              <HiddenItem name="customerId" />
              <Row form>
                <Col md="4" className="d-flex flex-column">
                  <Form.Item label="ประเภทงานบริการ" name="incomeType">
                    <Select
                      name="incomeType"
                      disabled={!grant || nProps.readOnly}
                      className="text-primary"
                    >
                      {Object.keys(IncomeServiceCategories).map((k) => (
                        <Select.Option value={k} key={k}>
                          {IncomeServiceCategories[k]}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col md="8">
                  <IncomeDailyHeader
                    disabled={!grant || nProps.readOnly}
                    disableAllBranches
                  />
                </Col>
              </Row>
              {values.editedBy && (
                <Row
                  form
                  className="mb-3 ml-2"
                  style={{ alignItems: 'center' }}
                >
                  <NotificationIcon
                    icon="edit"
                    data={editData}
                    badgeNumber={values.editedBy.length}
                    theme="warning"
                  />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <div>
                <Row form>
                  <Col md="4" className="d-flex flex-column">
                    <Form.Item
                      name="kbnReceipt"
                      label="เลขที่ใบเสร็จรับเงิน KBN"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนเลขที่ใบเสร็จรับเงิน KBN',
                        },
                      ]}
                    >
                      <Input disabled={!grant} readOnly={nProps.readOnly} />
                    </Form.Item>
                  </Col>
                  <Col md="4" className="d-flex flex-column">
                    <Form.Item
                      name="workOrder"
                      label="เลขที่ใบสั่งงาน"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนเลขที่ใบสั่งงาน',
                        },
                      ]}
                    >
                      <Input disabled={!grant} readOnly={nProps.readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <div className="px-3 pt-3 border mb-3">
                <Col md="4">
                  <Form.Item name="isNewCustomer">
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
                  onChange={(val) => _onCustomerChange(val)}
                  values={values}
                  form={form}
                  size="small"
                  readOnly={nProps.readOnly}
                />
              </div>
              <div>
                <Row form>
                  <Col md="3">
                    <Form.Item
                      name="vehicleNo"
                      label="หมายเลขรถ"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนหมายเลขรถ',
                        },
                      ]}
                    >
                      <Select mode="tags" notFoundContent={null} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              {itemsError && values.incomeType !== 'repairDeposit' && (
                <strong className="text-warning">{itemsError}</strong>
              )}
              {values?.items &&
                values.items.length > 0 &&
                values.incomeType !== 'repairDeposit' && (
                  <div
                    className="mb-2"
                    style={{ backgroundColor: theme.colors.grey5 }}
                  >
                    <IncomeItems
                      items={values.items}
                      incomeId={values.incomeId}
                      onChange={(dat) => form.setFieldsValue({ items: dat })}
                      disabled={!grant || nProps.readOnly}
                    />
                  </div>
                )}
              {!['repairDeposit', 'inside'].includes(values.incomeType) && (
                <Row form>
                  <Col md="4" className="form-group">
                    <Form.Item
                      name="vehicleRegNumber"
                      label="ทะเบียนรถ"
                      rules={[
                        {
                          required: !['repairDeposit', 'inside'].includes(
                            values.incomeType
                          ),
                          message: 'กรุณาป้อนทะเบียนรถ',
                        },
                      ]}
                    >
                      <Input
                        disabled={!grant}
                        readOnly={nProps.readOnly}
                        placeholder="ทะเบียนรถ"
                      />
                    </Form.Item>
                  </Col>
                  <Col md="4" className="form-group">
                    <Form.Item
                      name="serviceDate"
                      label="วันที่ออกให้บริการ"
                      rules={[
                        {
                          required: !['repairDeposit', 'inside'].includes(
                            values.incomeType
                          ),
                          message: 'กรุณาป้อนข้อมูล',
                        },
                      ]}
                    >
                      <DatePicker
                        placeholder="วันที่ออกให้บริการ"
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {values.incomeType !== 'repairDeposit' ? (
                <Fragment>
                  <Row form>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtParts"
                        label="ค่าอะไหล่"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่าอะไหล่"
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtOil"
                        label="ค่าน้ำมัน"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่าน้ำมัน"
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtWage"
                        label="ค่าแรง"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่าแรง"
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtBlackGlue"
                        label="ค่ากาวดำ"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่ากาวดำ"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtDistance"
                        label="ค่าระยะทาง"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่าระยะทาง"
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="amtPumpCheck"
                        label="ค่าเช็คปั๊ม"
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="ค่าเช็คปั๊ม"
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item label="รายรับ อื่นๆ">
                        <ArrayInput
                          name="amtOthers"
                          columns={arrayInputColumns}
                          readOnly={nProps.readOnly}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="3" className="form-group">
                      <Form.Item
                        name="deductDeposit"
                        label={deductDepositLabel || 'หัก มัดจำ'}
                        rules={getRules(['number'])}
                      >
                        <Input
                          disabled={!grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="หัก มัดจำ"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Fragment>
              ) : (
                <Row form>
                  <Col md="4" className="form-group">
                    <Form.Item
                      name="amtDeposit"
                      label="เงินมัดจำ"
                      rules={[
                        {
                          required: values.incomeType === 'repairDeposit',
                          message: 'กรุณาป้อนข้อมูล',
                        },
                      ]}
                    >
                      <Input
                        disabled={!grant}
                        readOnly={nProps.readOnly}
                        addonAfter="บาท"
                        placeholder="เงินมัดจำ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <TotalSummary
                values={values}
                grant={grant}
                readOnly={nProps.readOnly}
                netIncome={netIncome}
              />
              <Form.Item label="การชำระเงิน" name="payments">
                <Payments disabled={!grant || nProps.readOnly} permanentDelete={true} />
              </Form.Item>
              {![IncomeServiceCategories.repairDeposit].includes(
                values.incomeType
              ) && (
                  <Row form>
                    <Col md={8} className="form-group">
                      <Form.Item name="technicianId" label="ช่างบริการ">
                        <EmployeeSelector
                          mode="multiple"
                          disabled={!grant || nProps.readOnly}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              <DuringDayMoney grant={grant} />
              <Row form>
                <Col md={8} className="form-group">
                  <Form.Item name="remark" label="หมายเหตุ">
                    <Input disabled={!grant} placeholder="หมายเหตุ" />
                  </Form.Item>
                </Col>
              </Row>
              <CardFooter className="border-top ">
                <Row style={{ justifyContent: 'flex-end' }} form>
                  <Row
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: 10,
                    }}
                    form
                  >
                    {!readOnly ? (
                      <Popconfirm
                        title="ยืนยัน?"
                        okText="ล้าง"
                        cancelText="ยกเลิก"
                        onConfirm={() => {
                          form.resetFields();
                          reset();
                        }}
                      >
                        <Button
                          // onClick={() => form.resetFields()}
                          className="mr-3"
                          disabled={!grant || nProps.readOnly}
                          size="middle"
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
                        className="mr-3"
                        size="middle"
                      >
                        &larr; กลับ
                      </Button>
                    )}
                    <Button
                      type="primary"
                      onClick={() => _onPreConfirm(netIncome)}
                      disabled={!grant}
                      size="middle"
                    >
                      บันทึกข้อมูล
                    </Button>
                  </Row>
                </Row>
              </CardFooter>
            </>
          );
        }}
      </Form>
      {showCustomer.visible && (
        <CustomerDetailsModal
          selectedCustomer={showCustomer.customer}
          visible
          onOk={onCustomerUpdate}
          onCancel={() => setShowCustomer({ visible: false, customer: {} })}
        />
      )}
    </div>
  );
};
