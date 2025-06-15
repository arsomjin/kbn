import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Row, Col, CardFooter } from 'shards-react';
import { useMergeState } from 'api/CustomHooks';
import { Form, Popconfirm } from 'antd';
import HiddenItem from 'components/HiddenItem';
import { firstKey, showWarn } from 'functions';
import { getEditArr } from 'utils';
import { getInitialValues, _getNetIncomeFromValues } from './api';
import IncomeDailyHeader from '../../income-daily-header';
import { NotificationIcon } from 'elements';
import Toggles from 'components/Toggles';
import Customer from 'components/Customer';
import { checkDoc } from 'firebase/api';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import { Input } from 'elements';
import { Button } from 'elements';
import { DuringDayMoney } from 'components/common/DuringDayMoney';
import Payments from 'components/Payments';
import { TotalSummary } from 'components/common/TotalSummary';
import { arrayInputColumns } from 'data/Constant';
import ArrayInput from 'components/ArrayInput';
import { load } from 'functions';
import { parser } from 'functions';
import { cleanNumberFields } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { deepEqual } from 'functions';
import { partialText } from 'utils';
import { Numb } from 'functions';
import { showMessageBar } from 'functions';
import { showLog } from 'functions';
import { validatePayments } from 'Modules/Utils';
import { usePermissions } from 'hooks/usePermissions';

const IncomeOther = ({ order, onConfirm, onBack, isEdit, readOnly, reset }) => {
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const { getDefaultBranch } = usePermissions();
  const [form] = Form.useForm();
  const history = useHistory();
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {},
  });

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
        branchCode:
          order?.branchCode ||
          getDefaultBranch() ||
          user.homeBranch ||
          user?.allowedBranches?.[0] ||
          '0450',
      })
    ) {
      form.setFieldsValue({
        ...getInitialValues(order),
        branchCode:
          order?.branchCode ||
          getDefaultBranch() ||
          user.homeBranch ||
          user?.allowedBranches?.[0] ||
          '0450',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, order, readOnly]);

  const _onValuesChange = async (val) => {
    try {
      if (firstKey(val) === 'incomeType') {
        resetToInitial();
        form.setFieldsValue(val);
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

  const _onPreConfirm = async (netTotal) => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...values };
      mValues.total = parser(netTotal);
      mValues.incomeType = 'other';
      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtRebate',
        'amtExcess',
        'amtOther',
        'deductOther',
        'amtDuringDay',
        'total',
      ]);

      if (mValues?.amtOthers) {
        mValues.amtOther = mValues.amtOthers.reduce(
          (sum, elem) => sum + Numb(elem?.total || 0),
          0
        );
      }
      if (mValues?.deductOthers) {
        mValues.deductOther = mValues.deductOthers.reduce(
          (sum, elem) => sum + Numb(elem?.total || 0),
          0
        );
      }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);

      // Check payments.
      if (!validatePayments(mValues.payments, showMessageBar)) {
        return;
      }
      // showLog('[IncomeOther] clean values', mValues); // Disabled to prevent console spam
      showConfirm(
        () => onConfirm(mValues, resetToInitial),
        `บันทึกข้อมูลรับเงินประจำวัน อื่นๆ`
      );
    } catch (e) {
      load(false);
      showWarn(e);
    }
  };

  return (
    <div className='bg-white px-3 py-3'>
      <Form
        form={form}
        // onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitialValues(nProps.order),
          branchCode:
            nProps.order?.branchCode ||
            getDefaultBranch() ||
            user.homeBranch ||
            user?.allowedBranches?.[0] ||
            '0450',
        }}
        size='small'
        layout='vertical'
      >
        {(values) => {
          //  showLog({ values });
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          const netIncome = _getNetIncomeFromValues(values);
          return (
            <>
              <HiddenItem name='incomeId' />
              <HiddenItem name='customerId' />
              <Row form>
                {/* <Col md="4">
                  <Form.Item
                    name="incomeNo"
                    label="เลขที่บิล"
                    rules={[{ required: true, message: 'กรุณาป้อนเลขที่บิล' }]}
                  >
                    <Input
                      placeholder="เลขที่บิล"
                      disabled={!grant}
                      readOnly={nProps.readOnly}
                    />
                  </Form.Item>
                </Col> */}
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
                  <span className='ml-2 text-light'>ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <div className='px-3 pt-3 border mb-3'>
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
              <Row form>
                <Col md='4' className='form-group'>
                  <Form.Item name='amtRebate' label='รับเงินคืน'>
                    <Input
                      disabled={!grant}
                      readOnly={nProps.readOnly}
                      placeholder='จำนวนเงิน'
                      addonAfter='บาท'
                    />
                  </Form.Item>
                </Col>
                <Col md='4' className='form-group'>
                  <Form.Item name='amtExcess' label='เงินเกิน'>
                    <Input
                      disabled={!grant}
                      readOnly={nProps.readOnly}
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
                <Col md='4' className='form-group'>
                  <Form.Item label='รายการหักเงิน อื่นๆ'>
                    <ArrayInput
                      name='deductOthers'
                      columns={arrayInputColumns}
                      readOnly={nProps.readOnly}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <TotalSummary
                values={values}
                grant={grant}
                readOnly={nProps.readOnly}
                netIncome={netIncome}
              />
              <Form.Item label='การชำระเงิน' name='payments'>
                <Payments
                  disabled={!grant || nProps.readOnly}
                  permanentDelete={true}
                />
              </Form.Item>
              <DuringDayMoney grant={grant} />
              <Row form>
                <Col md={8}>
                  <Form.Item name='remark' label='หมายเหตุ'>
                    <Input disabled={!grant} />
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
                    {!readOnly ? (
                      <Popconfirm
                        title='ยืนยัน?'
                        okText='ล้าง'
                        cancelText='ยกเลิก'
                        onConfirm={() => {
                          form.resetFields();
                          reset();
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
                      onClick={() => _onPreConfirm(netIncome)}
                      disabled={!grant}
                      size='middle'
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

export default IncomeOther;
