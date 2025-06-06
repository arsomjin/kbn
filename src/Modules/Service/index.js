import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button, Form, Popconfirm, Select, Skeleton } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, Col, CardFooter } from 'shards-react';
import { useHistory } from 'react-router';
import { getInitialValues, _getNetIncomeFromValues } from './api';
import { showWarn } from 'functions';
import moment from 'moment';
import { useSelector } from 'react-redux';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import { useMergeState } from 'api/CustomHooks';
import { firstKey } from 'functions';
import { useLocation } from 'react-router-dom';
import { StatusMapToStep } from 'data/Constant';
import { createNewId } from 'utils';
import { checkDoc } from 'firebase/api';
import { getEditArr } from 'utils';
import HiddenItem from 'components/HiddenItem';
import { IncomeServiceCategories } from 'data/Constant';
import { NotificationIcon } from 'elements';
import Toggles from 'components/Toggles';
import Customer from 'components/Customer';
import ServiceItems from './ServiceItems';
import { Input } from 'elements';
import { DatePicker } from 'elements';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import { arrayInputColumns } from 'data/Constant';
import { TotalSummary } from 'components/common/TotalSummary';
import Payments from 'components/Payments';
import EmployeeSelector from 'components/EmployeeSelector';
import { FirebaseContext } from '../../firebase';
import { load } from 'functions';
import { parser } from 'functions';
import { showMessageBar } from 'functions';
import { cleanNumberFields } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import BranchDateHeader from 'components/branch-date-header';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import { isMobile } from 'react-device-detect';
import { updateNewOrderCustomer } from 'Modules/Utils';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import { StatusMap } from 'data/Constant';
import { arrayForEach } from 'functions';
import { showSuccess } from 'functions';
import { errorHandler } from 'functions';
import { checkCollection } from 'firebase/api';
import { showAlert } from 'functions';
import { waitFor } from 'functions';
import { partialText } from 'utils';
import { Numb } from 'functions';
import { checkPayments } from 'Modules/Utils';

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
  deductDepositLabel: null,
  deductDepositOrderId: null
};

export default () => {
  const history = useHistory();
  const pathName = history.location.pathname;
  let location = useLocation();
  const params = location.state?.params;
  const { firestore, api } = useContext(FirebaseContext);

  const [form] = Form.useForm();
  const { users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);
  const [nProps, setProps] = useMergeState(initProps);
  const [docType, setDocType] = useState('outsideCare');
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {}
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.serviceId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/services' : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let serviceId = createNewId('SER');
      pOrder = { serviceId };
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
        onBack,
        deductDepositLabel: pOrder?.depositRef
          ? `เลขที่ ${pOrder.depositRef.serviceId} วันที่ ${moment(pOrder.depositRef.date, 'YYYY-MM-DD').format(
              'DD/MM/YYYY'
            )}`
          : null
      });
      setDocType(pOrder?.serviceType || 'outsideCare');
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async val => {
    try {
      if (firstKey(val) === 'serviceType') {
        resetToInitial();
        form.setFieldsValue(val);
        setDocType(val.serviceType);
      }
      if (firstKey(val) === 'branchCode') {
        let mItems = form.getFieldValue('items');
        form.setFieldsValue({
          items: mItems.map(l => ({ ...l, branchCode: val['branchCode'] }))
        });
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const resetToInitial = async () => {
    let serviceId = createNewId('SER');
    form.resetFields();
    setProps({ ...initProps, order: { serviceId } });
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues({ serviceId })
    });
    setShowCustomer({
      visible: false,
      customer: {}
    });
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

  const _onCustomerChange = async val => {
    //  showLog('customer', customers[val.value]);
    // TODOS: get deposit value
    let incomeRef = firestore
      .collection('sections')
      .doc('services')
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
    docSnap.forEach(doc => {
      order = doc.data();
      order._key = doc.id;
    });
    //  showLog('order', order);
    setProps({
      deductDepositOrderId: order._key,
      deductDepositLabel: `เลขที่ ${order.incomeNo} วันที่ ${moment(order.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}`
    });
    form.setFieldsValue({
      deductDeposit: order.amtDeposit,
      depositRef: {
        orderId: order.incomeNo,
        date: order.date
      }
    });
  };

  const _onPreConfirm = async netTotal => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...values };
      mValues.total = parser(netTotal);

      const dupSnap = await checkCollection('sections/services/services', [
        ['array-contains', '==', mValues.serviceNo]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.serviceNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }

      if (mValues.incomeType !== 'repairDeposit') {
        // Check items.
        let inCompletedItems = false;
        mValues.items &&
          mValues.items.map(item => {
            if (!item.item) {
              inCompletedItems = true;
            }
            item.serviceId = mValues.serviceId;
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
        'total'
      ]);

      if (mValues?.amtOthers) {
        mValues.amtOther = mValues.amtOthers.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);
      //  showLog('clean values', mValues);

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

      showConfirm(() => _onConfirm(mValues), `บันทึกข้อมูลงานบริการ ${IncomeServiceCategories[docType]}`);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirm = async values => {
    try {
      //  showLog('confirm_values', values);
      if (nProps.deductDepositOrderId) {
        let depositRef = firestore
          .collection('sections')
          .doc('services')
          .collection('services')
          .doc(nProps.deductDepositOrderId);
        const docSnap = await depositRef.get();
        if (docSnap.exists) {
          await depositRef.update({ depositUsed: true });
        }
      }

      let mValues = JSON.parse(JSON.stringify(values));
      if (!mValues.customerId) {
        // New customer
        const customerId = await updateNewOrderCustomer({
          values: mValues,
          firestore
        });
        if (customerId) {
          mValues.customerId = customerId;
        }
      }
      if (nProps.isEdit) {
        let changes = getChanges(nProps.order, values);
        if (nProps.order.items && values.items) {
          const itemChanges = getArrayChanges(nProps.order.items, values.items);
          if (itemChanges) {
            changes = [...changes, ...itemChanges];
          }
        }
        mValues.editedBy = !!nProps.order.editedBy
          ? [...nProps.order.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
      } else {
        mValues.created = moment().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }
      // Add order items.
      if (mValues.items && mValues.items.length > 0) {
        await arrayForEach(mValues.items, async item => {
          const serviceItemRef = firestore
            .collection('sections')
            .doc('services')
            .collection('serviceItems')
            .doc(item.serviceItemId);
          item.item && (await serviceItemRef.set(item));
        });
        // delete mValues.items;
      }
      const serviceRef = firestore.collection('sections').doc('services').collection('services').doc(mValues.serviceId);
      // Add service order.
      const docSnap = await serviceRef.get();
      if (docSnap.exists) {
        serviceRef.update(mValues);
      } else {
        serviceRef.set(mValues);
      }
      // Record log.
      api.addLog(
        nProps.isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.serviceId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.serviceId
            },
        'services',
        'services'
      );
      load(false);
      showSuccess(
        () => {
          if (nProps.isEdit && nProps.onBack) {
            history.push(nProps.onBack.path, { params: nProps.onBack });
          } else {
            resetToInitial();
          }
        },
        mValues.serviceNo ? `บันทึกข้อมูลเลขที่ ${mValues.serviceNo} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
        true
      );
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...values, module: 'ServiceInput' }
      });
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-white">
        <PageTitle sm="4" title="งานบริการ" subtitle="Service" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-white"
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
          initialValues={{
            ...getInitialValues(nProps.order),
            branchCode: nProps.order?.branchCode || user.branch || '0450'
          }}
          size="small"
          layout="vertical"
        >
          {values => {
            //  showLog({ values });
            let itemsError =
              values.serviceType !== 'repairDeposit' ? (!values.items[0]?.item ? 'กรุณาป้อนรายการ' : null) : null;
            let editData = [];
            if (values.editedBy) {
              editData = getEditArr(values.editedBy, users);
              // showLog('mapped_data', editData);
            }
            const netIncome = _getNetIncomeFromValues(values);
            return (
              <div className={`${isMobile ? '' : 'px-3 '}bg-light`}>
                {values.serviceType !== 'repairDeposit' && <HiddenItem name="items" />}
                <HiddenItem name="serviceId" />
                <HiddenItem name="customerId" />
                <Row form>
                  <Col md="4">
                    <Form.Item label="ประเภทงานบริการ" name="serviceType">
                      <Select name="serviceType" disabled={!nProps.grant || nProps.readOnly} className="text-primary">
                        {Object.keys(IncomeServiceCategories).map(k => (
                          <Select.Option value={k} key={k}>
                            {IncomeServiceCategories[k]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md="8">
                    <BranchDateHeader
                      disabled={!nProps.grant || nProps.readOnly}
                      disableAllBranches
                      branchRequired
                      dateRequired
                      dateLabel="วันที่บันทึก"
                    />
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
                <Row form>
                  <Col md="4">
                    <Form.Item
                      name="serviceNo"
                      label="เลขที่เอกสาร"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนเลขที่เอกสาร'
                        }
                      ]}
                    >
                      <Input placeholder="เลขที่เอกสาร" readOnly={nProps.readOnly} disabled={!nProps.grant} />
                    </Form.Item>
                  </Col>
                  {!['repairDeposit'].includes(values.serviceType) && (
                    <Col md={4}>
                      <Form.Item name="technicianId" label="ช่างบริการ" rules={getRules(['required'])}>
                        <EmployeeSelector
                          disabled={!nProps.grant || nProps.readOnly}
                          placeholder="ช่างบริการ"
                          mode="tags"
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                <div className="px-3 pt-3 border mb-3">
                  <Col md="4">
                    <Form.Item name="isNewCustomer">
                      <Toggles
                        disabled={!nProps.grant || nProps.readOnly}
                        buttons={[
                          { label: 'ลูกค้าใหม่', value: true },
                          { label: 'ลูกค้าเก่า', value: false }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Customer
                    grant={nProps.grant}
                    onClick={() => _onShowCustomerDetail(values)}
                    onChange={val => _onCustomerChange(val)}
                    values={values}
                    form={form}
                    size="small"
                    readOnly={nProps.readOnly}
                  />
                </div>
                {itemsError && values.serviceType !== 'repairDeposit' && (
                  <strong className="text-warning">{itemsError}</strong>
                )}
                {values.items.length > 0 && values.serviceType !== 'repairDeposit' && (
                  <div className="mb-2" style={{ backgroundColor: theme.colors.grey5 }}>
                    <ServiceItems
                      items={values.items}
                      serviceId={values.serviceId}
                      onChange={dat => form.setFieldsValue({ items: dat })}
                      disabled={!nProps.grant || nProps.readOnly}
                    />
                  </div>
                )}
                {!['repairDeposit', 'inside'].includes(values.serviceType) && (
                  <Row form>
                    <Col md="4" className="form-group">
                      <Form.Item
                        name="vehicleRegNumber"
                        label="ทะเบียนรถ"
                        rules={[
                          {
                            required: !['repairDeposit', 'inside'].includes(values.serviceType),
                            message: 'กรุณาป้อนทะเบียนรถ'
                          }
                        ]}
                      >
                        <Input disabled={!nProps.grant} readOnly={nProps.readOnly} placeholder="ทะเบียนรถ" />
                      </Form.Item>
                    </Col>
                    <Col md="4" className="form-group">
                      <Form.Item
                        name="serviceDate"
                        label="วันที่ออกให้บริการ"
                        rules={[
                          {
                            required: !['repairDeposit', 'inside'].includes(values.serviceType),
                            message: 'กรุณาป้อนข้อมูล'
                          }
                        ]}
                      >
                        <DatePicker placeholder="วันที่ออกให้บริการ" disabled={!nProps.grant} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {values.serviceType !== 'repairDeposit' ? (
                  <Fragment>
                    <Row form>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtParts" label="ค่าอะไหล่" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่าอะไหล่"
                          />
                        </Form.Item>
                      </Col>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtOil" label="ค่าน้ำมัน" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่าน้ำมัน"
                          />
                        </Form.Item>
                      </Col>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtWage" label="ค่าแรง" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่าแรง"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtBlackGlue" label="ค่ากาวดำ" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่ากาวดำ"
                          />
                        </Form.Item>
                      </Col>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtDistance" label="ค่าระยะทาง" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่าระยะทาง"
                          />
                        </Form.Item>
                      </Col>
                      <Col md="4" className="form-group">
                        <Form.Item name="amtPumpCheck" label="ค่าเช็คปั๊ม" rules={getRules(['number'])}>
                          <Input
                            disabled={!nProps.grant}
                            readOnly={nProps.readOnly}
                            addonAfter="บาท"
                            placeholder="ค่าเช็คปั๊ม"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md="4">
                        <Form.Item label="รายรับ อื่นๆ">
                          <ArrayInput name="amtOthers" columns={arrayInputColumns} readOnly={nProps.readOnly} />
                        </Form.Item>
                      </Col>
                      <Col md="4" className="form-group">
                        <Form.Item
                          name="deductDeposit"
                          label={nProps.deductDepositLabel || 'หัก มัดจำ'}
                          rules={getRules(['number'])}
                        >
                          <Input
                            disabled={!nProps.grant}
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
                            required: values.serviceType === 'repairDeposit',
                            message: 'กรุณาป้อนข้อมูล'
                          }
                        ]}
                      >
                        <Input
                          disabled={!nProps.grant}
                          readOnly={nProps.readOnly}
                          addonAfter="บาท"
                          placeholder="เงินมัดจำ"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <TotalSummary values={values} grant={nProps.grant} readOnly={nProps.readOnly} netIncome={netIncome} />
                <Form.Item label="การชำระเงิน" name="payments">
                  <Payments disabled={!nProps.grant || nProps.readOnly} permanentDelete={true} />
                </Form.Item>
                <Row form>
                  <Col md={8} className="form-group">
                    <Form.Item name="remark" label="หมายเหตุ">
                      <Input disabled={!nProps.grant} placeholder="หมายเหตุ" />
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
                      {!nProps.readOnly ? (
                        <Popconfirm
                          title="ยืนยัน?"
                          okText="ล้าง"
                          cancelText="ยกเลิก"
                          onConfirm={() => {
                            form.resetFields();
                          }}
                        >
                          <Button
                            // onClick={() => form.resetFields()}
                            className="mr-3"
                            disabled={!nProps.grant || nProps.readOnly}
                            size="middle"
                          >
                            ล้างข้อมูล
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button
                          onClick={() =>
                            history.push(nProps.onBack.path, {
                              params: nProps.onBack
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
                        disabled={!nProps.grant}
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
