import React, { Fragment, useState } from 'react';
import { NotificationIcon } from 'elements';
import { CardFooter, Col, Row } from 'shards-react';
import IncomeDailyHeader from '../../income-daily-header';
import { Form, Popconfirm, Select } from 'antd';
import { useSelector } from 'react-redux';
import { firstKey } from 'functions';
import { getEditArr } from 'utils';
import { IncomePartCategories } from 'data/Constant';
import { showWarn } from 'functions';
import { getInitialValues, _getNetIncomeFromValues } from './api';
import HiddenItem from 'components/HiddenItem';
import Toggles from 'components/Toggles';
import { useMergeState } from 'api/CustomHooks';
import { checkDoc } from 'firebase/api';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import Customer from 'components/Customer';
import { Input } from 'elements';
import { Button } from 'elements';
import { useHistory } from 'react-router-dom';
import { arrayInputColumns } from 'data/Constant';
import ArrayInput from 'components/ArrayInput';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { TotalSummary } from 'components/common/TotalSummary';
import Payments from 'components/Payments';
import { DuringDayMoney } from 'components/common/DuringDayMoney';
import { load } from 'functions';
import { parser } from 'functions';
import { cleanNumberFields } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { useEffect } from 'react';
import { deepEqual } from 'functions';
import { partialText } from 'utils';
import { Numb } from 'functions';
import { showMessageBar } from 'functions';
import { checkPayments } from 'Modules/Utils';
import { validatePayments } from 'Modules/Utils';
import { usePermissions } from 'hooks/usePermissions';

export default ({ order, onConfirm, onBack, isEdit, readOnly, reset }) => {
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const { getDefaultBranch } = usePermissions();
  const [form] = Form.useForm();
  const history = useHistory();
  const [docType, setDocType] = useState(order?.incomeType || 'partSKC');
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {}
  });
  const [nProps, setProps] = useMergeState({
    order,
    readOnly,
    onBack,
    isEdit
  });

  const grant = true;

  useEffect(() => {
    setProps({
      order,
      readOnly,
      onBack,
      isEdit
    });
    let curValues = form.getFieldsValue();
    if (
      !deepEqual(curValues, {
        ...getInitialValues(order),
        branchCode: order?.branchCode || getDefaultBranch() || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
      })
    ) {
      form.setFieldsValue({
        ...getInitialValues(order),
        branchCode: order?.branchCode || getDefaultBranch() || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, order, readOnly]);

  const _onValuesChange = async val => {
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
      return setShowCustomer({
        visible: true,
        customer: selectedCustomer
      });
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

  const _onPreConfirm = async netTotal => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...values };
      mValues.total = parser(netTotal);
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
        'amtDuringDay',
        'total'
      ]);

      if (mValues?.amtOthers) {
        mValues.amtOther = mValues.amtOthers.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      }
      if (mValues?.deductOthers) {
        mValues.deductOther = mValues.deductOthers.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);

      // Check payments.
      if (!validatePayments(mValues.payments, showMessageBar)) {
        return;
      }

      // showLog('clean values', mValues);
      showConfirm(
        () => onConfirm(mValues, resetToInitial),
        `บันทึกข้อมูลรับเงินประจำวัน ${IncomePartCategories[docType]}`
      );
    } catch (e) {
      load(false);
      showWarn(e);
    }
  };
  const getOptions = branchCode =>
    Object.keys(IncomePartCategories).map(k => {
      return branchCode !== '0450' && k === 'partChange' ? null : (
        <Select.Option key={k} value={k}>
          {IncomePartCategories[k]}
        </Select.Option>
      );
    });

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        // onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitialValues(nProps.order),
          branchCode: nProps.order?.branchCode || getDefaultBranch() || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
        }}
        size="small"
        layout="vertical"
      >
        {values => {
          //  showLog({ values });
          const hasHeader = !['partSKC', 'partKBN', 'partChange'].includes(values.incomeType);
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          const netIncome = _getNetIncomeFromValues(values);
          return (
            <>
              <HiddenItem name="incomeId" />
              <HiddenItem name="customerId" />
              <Row form>
                <Col md="4" className="d-flex flex-column">
                  <Form.Item label="ประเภท" name="incomeType">
                    <Select name="incomeType" disabled={!grant || nProps.readOnly} className="text-primary">
                      {getOptions(values.branchCode)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col md="8">
                  <IncomeDailyHeader disabled={!grant || nProps.readOnly} disableAllBranches />
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              {hasHeader && (
                <div className="bg-light px-3 pt-3 border mb-3">
                  <Col md="4">
                    <Form.Item name="isNewCustomer">
                      <Toggles
                        disabled={!grant || nProps.readOnly}
                        buttons={[
                          { label: 'ลูกค้าใหม่', value: true },
                          { label: 'ลูกค้าเก่า', value: false }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Customer
                    grant={grant}
                    onClick={() => _onShowCustomerDetail(values)}
                    values={values}
                    form={form}
                    size="small"
                    readOnly={nProps.readOnly}
                  />
                </div>
              )}
              <Row form>
                {!['partKBN'].includes(values.incomeType) && (
                  <Col md="4" className="form-group">
                    <Form.Item
                      name="amtReceived"
                      label="จำนวนเงิน"
                      rules={[
                        {
                          required: !['partKBN'].includes(values.incomeType),
                          message: 'กรุณาป้อนจำนวนเงิน'
                        }
                      ]}
                    >
                      <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                    </Form.Item>
                  </Col>
                )}
                {!['partDeposit', 'wholeSale', 'partChange'].includes(values.incomeType) && (
                  <Col md="4">
                    <Form.Item
                      name="docNo"
                      label="เลขที่เอกสาร"
                      rules={[
                        {
                          required: !['partDeposit', 'wholeSale', 'partChange'].includes(values.incomeType),
                          message: 'กรุณาป้อนเลขที่เอกสาร'
                        }
                      ]}
                    >
                      <Input placeholder="เลขที่เอกสาร" readOnly={nProps.readOnly} disabled={!grant} />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              {!['partKBN'].includes(values.incomeType) ? (
                <Row form>
                  {!['partDeposit', 'partChange'].includes(values.incomeType) && (
                    <Col md="4" className="form-group">
                      <Form.Item name="partsDeposit" label="หักเงินมัดจำอะไหล่">
                        <Input placeholder="หักเงินมัดจำอะไหล่" readOnly={nProps.readOnly} disabled={!grant} />
                      </Form.Item>
                    </Col>
                  )}
                  {['partDeposit', 'wholeSale'].includes(values.incomeType) && (
                    <Col md="4" className="form-group">
                      <Form.Item label="รายการหักเงิน อื่นๆ">
                        <ArrayInput name="deductOthers" columns={arrayInputColumns} readOnly={nProps.readOnly} />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              ) : (
                <Fragment>
                  <Row form>
                    <Col md="4" className="form-group">
                      <Form.Item name="amtIntake" label="ท่อไอเสีย">
                        <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                      </Form.Item>
                    </Col>
                    <Col md="4" className="form-group">
                      <Form.Item name="amtFieldMeter" label="เครื่องวัดแปลงนา">
                        <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                      </Form.Item>
                    </Col>
                    <Col md="4" className="form-group">
                      <Form.Item name="amtBattery" label="แบตเตอรี่">
                        <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="4" className="form-group">
                      <Form.Item name="amtGPS" label="GPS">
                        <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                      </Form.Item>
                    </Col>
                    <Col md="4" className="form-group">
                      <Form.Item name="amtTyre" label="ยาง">
                        <Input readOnly={nProps.readOnly} disabled={!grant} placeholder="จำนวนเงิน" addonAfter="บาท" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="4" className="form-group">
                      <Form.Item label="รายรับ อื่นๆ">
                        <ArrayInput name="amtOthers" columns={arrayInputColumns} readOnly={nProps.readOnly} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Fragment>
              )}
              {['partSKC'].includes(values.incomeType) && (
                <Row form>
                  <Col md={4} className="form-group">
                    <Form.Item name="salesPerson" label="พนักงานขาย" rules={getRules(['required'])}>
                      <EmployeeSelector disabled={!grant || nProps.readOnly} placeholder="พนักงานขาย" mode="tags" />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <TotalSummary
                values={values}
                grant={grant}
                readOnly={nProps.readOnly}
                netIncome={netIncome}
                hasThirdPayment
              />
              <Form.Item label="การชำระเงิน" name="payments">
                <Payments disabled={!grant || nProps.readOnly} permanentDelete={true} />
                {/* <Payments disabled={!grant || nProps.readOnly} byCustomer /> */}
              </Form.Item>
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
                            params: nProps.onBack
                          })
                        }
                        className="mr-3"
                        size="middle"
                      >
                        &larr; กลับ
                      </Button>
                    )}
                    <Button type="primary" onClick={() => _onPreConfirm(netIncome)} disabled={!grant} size="middle">
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
