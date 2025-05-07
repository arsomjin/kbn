import React, { useEffect, useRef, useState } from 'react';
import { Collapse, Form, Popconfirm, Select } from 'antd';
import {
  getBookingData,
  getInitialValues,
  getSalesData,
  RenderSearch,
  searchKeys,
} from './api';
import IncomeDailyHeader from '../../income-daily-header';
import { useSelector } from 'react-redux';
import { DuringDayMoney } from 'components/common/DuringDayMoney';
import { CardFooter, Col, Row } from 'shards-react';
import { useHistory } from 'react-router-dom';
import { Button, Input } from 'elements';
import { _getNetIncomeFromValues } from 'Modules/Sales/Vehicles/api';
import {
  firstKey,
  showLog,
  showWarn,
  showConfirm,
  load,
  cleanValuesBeforeSave,
  showMessageBar,
} from 'functions';
import HiddenItem from 'components/HiddenItem';
import { IncomeType, arrayInputColumns } from 'data/Constant';
import { useMergeState } from 'api/CustomHooks';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import ArrayInput from 'components/ArrayInput';
import Payments from 'components/Payments';
import Customer from 'components/Customer';
import { Numb } from 'functions';
import Toggles from 'components/Toggles';
import { cleanNumberFields } from 'functions';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import DocViewer from './DocViewer';
import { checkPayments } from 'Modules/Utils';

export default ({ order, onConfirm, onBack, isEdit, readOnly, reset }) => {
  // showLog({ order, onConfirm, onBack, isEdit, readOnly, reset });
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const history = useHistory();

  const [saleDoc, setSale] = useMergeState({
    doc: {},
    type: 'sale',
  });
  const [docType, setDocType] = useState(order?.incomeType || 'down');

  const [nProps, setProps] = useMergeState({
    readOnly,
    onBack,
    isEdit,
  });
  const [curDoc, setCurDoc] = useState({});

  useEffect(() => {
    setProps({
      readOnly,
      onBack,
      isEdit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, readOnly]);

  const searchValuesRef = useRef(searchKeys);

  const sKeys = Object.keys(searchKeys).map((k) => k);

  const grant = true;

  useEffect(() => {
    const distributeValues = (mOrder) => {
      form.setFieldsValue({
        incomeType: mOrder.incomeType,
        branchCode: mOrder?.branchCode || user.branch || '0450',
        date: mOrder?.date || undefined,
      });
      switch (mOrder.incomeType) {
        case 'cash':
        case 'down':
        case 'reservation':
        case 'baac':
          _onValuesChange({
            ...(order?.saleNo && { saleNo: order.saleNo }),
            ...(order?.bookNo && { bookNo: order.bookNo }),
            ...(order?.refDoc && { refDoc: order.refDoc }),
          });
          break;
        case 'licensePlateFee':
        case 'installment':
        case 'kbnLeasing':
        case 'other':
          const {
            incomeId,
            isNewCustomer,
            customerId,
            prefix,
            firstName,
            lastName,
            phoneNumber,
            amtReceived,
            amtBaacDebtor,
            amtPlateAndInsurance,
            amtSKLInstallment,
            oweKBNLeasings,
            amtOthers,
            deductOthers,
            payments,
            total,
            recordedBy,
            amtDuringDay,
            receiverDuringDay,
            remark,
          } = mOrder;
          form2.setFieldsValue({
            incomeId,
            isNewCustomer,
            customerId,
            prefix,
            firstName,
            lastName,
            phoneNumber,
            amtBaacDebtor,
            ...(mOrder.incomeType === 'licensePlateFee' && {
              amtPlateAndInsurance,
            }),
            ...(mOrder.incomeType === 'installment' && {
              amtSKLInstallment:
                amtSKLInstallment ||
                Numb(amtReceived) -
                (deductOthers.length > 0
                  ? deductOthers.reduce(
                    (sum, elem) => sum + Numb(elem?.total || 0),
                    0
                  )
                  : 0),
            }),
            ...(mOrder.incomeType === 'kbnLeasing' && { oweKBNLeasings }),
            ...(mOrder.incomeType === 'other' && { amtOthers }),
            deductOthers,
            payments,
            total,
            recordedBy,
            amtDuringDay,
            receiverDuringDay,
            remark,
          });
          break;
        default:
          break;
      }
    };
    if (!!order?.incomeType && !!order?.incomeCategory && !!order?.firstName) {
      distributeValues(order);
    } else {
      form.setFieldsValue({
        branchCode: order?.branchCode || user.branch || '0450',
      });
      form2.setFieldsValue(getInitialValues(order));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const _onValuesChange = async (val) => {
    try {
      showLog({ val, sKeys, firstKey: firstKey(val) });
      if (sKeys.includes(firstKey(val))) {
        let mData = [];
        let refDoc = {};
        if (firstKey(val) === 'saleNo') {
          if (val?.refDoc) {
            refDoc = val.refDoc.doc;
          } else {
            mData = val?.refDoc
              ? [val.refDoc.doc]
              : await getSalesData(val, true);
            refDoc = mData[0];
          }
          setSale({
            doc: {
              ...refDoc,
              title: `ใบขายเลขที่ ${refDoc?.saleNo}`,
            },
            type: 'sale',
          });
          form2.setFieldsValue({
            total:
              typeof order?.total !== 'undefined'
                ? order.total
                : _getNetIncomeFromValues(refDoc),
            ...(refDoc.saleType === 'baac' && {
              amtBaacDebtor: refDoc.amtBaacDebtor,
            }),
            payments: order?.payments || refDoc?.payments || [],
          });
          form.setFieldsValue({
            bookNo: null,
          });
        } else if (firstKey(val) === 'bookNo') {
          if (val?.refDoc) {
            refDoc = val.refDoc.doc;
          } else {
            mData = val?.refDoc
              ? [val.refDoc.doc]
              : await getBookingData(val, true);
            refDoc = mData[0];
          }
          setSale({
            doc: {
              ...refDoc,
              title: `ใบจองเลขที่ ${refDoc?.bookNo}`,
            },
            type: 'booking',
          });
          form2.setFieldsValue({
            total:
              typeof order?.total !== 'undefined'
                ? order.total
                : mData.length > 0
                  ? mData[0].total
                  : isEdit
                    ? refDoc.total
                    : refDoc.amtReceived,
            payments: order?.payments || refDoc?.payments || [],
          });
          form.setFieldsValue({
            saleNo: null,
            incomeType: 'reservation',
          });
        }
        setCurDoc(refDoc);
      } else if (firstKey(val) === 'incomeType') {
        resetToInitial();
        form.setFieldsValue(val);
        setDocType(val.incomeType);
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const _onValues2Change = async (val) => {
    try {
      if (
        [
          'deductOthers',
          'amtPlateAndInsurance',
          'amtSKLInstallment',
          'kbnLeasing',
          'amtOthers',
        ].includes(firstKey(val))
      ) {
        let amt = 0;
        if (docType === 'other') {
          let amtOthers = form2.getFieldValue('amtOthers');
          amt = amtOthers.reduce(
            (sum, elem) => sum + Numb(elem?.total || 0),
            0
          );
        } else if (docType === 'kbnLeasing') {
          let oweKBNLeasings = form2.getFieldValue('oweKBNLeasings');
          amt = Object.keys(oweKBNLeasings).reduce(
            (sum, elem) => sum + Numb(oweKBNLeasings[elem]),
            0
          );
        } else {
          amt = form2.getFieldValue(
            docType === 'installment'
              ? 'amtSKLInstallment'
              : 'amtPlateAndInsurance'
          );
        }
        let deductOthers = form2.getFieldValue('deductOthers');
        let amtDeduct = deductOthers.reduce(
          (sum, elem) => sum + Numb(elem?.total || 0),
          0
        );
        let total = Numb(amt) - Numb(amtDeduct);
        form2.setFieldsValue({
          total: total > 0 ? total : 0,
        });
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const resetToInitial = () => {
    form.resetFields();
    form2.resetFields();
    setSale({
      doc: {},
      type: 'sale',
    });
    setCurDoc({});
  };

  const _onPreConfirm = async () => {
    try {
      load(true);
      const values1 = await form.validateFields();
      const values2 = await form2.validateFields();
      const { incomeType, branchCode, date } = values1;

      let mValues = { ...values2 };

      if (
        ['licensePlateFee', 'installment', 'kbnLeasing', 'other'].includes(
          docType
        )
      ) {
        mValues = {
          ...mValues,
          incomeType,
          docBranchCode: branchCode,
          docDate: date,
          branchCode,
          date,
        };
      } else {
        const {
          saleNo,
          saleId,
          bookNo,
          bookId,
          isNewCustomer,
          customerId,
          prefix,
          firstName,
          lastName,
          phoneNumber,
          receiverEmployee,
          deleted,
          paymentType,
          bankAcc,
          paymentType1,
          bankAcc1,
          paymentType2,
          bankAcc2,
          paymentType3,
          bankAcc3,
          // payments,
        } = saleDoc.doc;
        if (
          !(
            (saleDoc.type === 'sale' && saleId) ||
            (saleDoc.type === 'booking' && bookId)
          )
        ) {
          load(false);
          return showMessageBar(
            'กรุณาป้อนข้อมูลเลขที่ใบขาย / ใบจอง / ชื่อลูกค้า'
          );
        }

        // Delete extra fields.
        delete mValues.deductOthers;
        delete mValues.amtPlateAndInsurance;
        delete mValues.amtSKLInstallment;
        delete mValues.amtOthers;
        delete mValues.oweKBNLeasings;
        // delete mValues.payments;
        mValues = {
          ...mValues,
          incomeType,
          branchCode,
          // accDate: date,
          docBranchCode: saleDoc.doc.branchCode,
          date,
          docDate: saleDoc.doc.date,
          saleNo,
          saleId,
          bookNo,
          bookId,
          isNewCustomer,
          customerId,
          prefix,
          firstName,
          lastName,
          phoneNumber,
          receiverEmployee,
          deleted: deleted || false,
        };
      }
      let doc = cleanValuesBeforeSave(curDoc);
      let refDoc = { doc, type: saleDoc.type };
      // showLog({ clean_saleDoc: refDoc });
      mValues.refDoc = refDoc;
      mValues = cleanNumberFields(mValues, [
        'amtReceived',
        'amtBaacDebtor',
        'amtPlateAndInsurance',
        'amtSKLInstallment',
        'amtDuringDay',
        'total',
      ]);
      let values = cleanValuesBeforeSave(mValues);
      // showLog('values', values);
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
            'ไม่มีชื่อผู้โอน/ผู้ฝากเงิน ในการชำระเงินประเภท-เงินโอน',
            'ไม่มีชื่อผู้โอน/ผู้ฝากเงิน',
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
        () => onConfirm(values, resetToInitial),
        `บันทึกข้อมูลรับเงินประจำวัน ${['licensePlateFee', 'installment', 'other'].includes(docType)
          ? IncomeType[docType]
          : saleDoc.type === 'sale'
            ? `ใบขายเลขที่ ${values.saleNo}`
            : `ใบจองเลขที่ ${values.bookNo}`
        }`
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onDocViewerChange = (values, total, amtFull) => {
    setCurDoc({ ...curDoc, ...values });
    // setSale({ doc: { ...saleDoc.doc, values }, type: saleDoc.type });
    form2.setFieldsValue({
      total,
    });
  };

  let IncomeTypeArr = Object.keys(IncomeType).map((k) => k);

  const IncomeOptions =
    saleDoc.type === 'booking'
      ? IncomeTypeArr.filter((l) => l === 'reservation')
      : IncomeTypeArr.filter((l) => l !== 'reservation');

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        // onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...searchKeys,
          incomeType: 'down',
          branchCode: order?.branchCode || user.branch || '0450',
          date: undefined,
          amtReceived: null,
        }}
        size="small"
        layout="vertical"
      >
        {(values) => {
          return (
            <>
              {![
                'licensePlateFee',
                'installment',
                'kbnLeasing',
                'other',
              ].includes(docType) &&
                !nProps.readOnly && <RenderSearch type={values.incomeType} />}
              <Row form>
                <Col md="4" className="d-flex flex-column">
                  <Form.Item label="สด/ดาวน์/จอง/อื่นๆ" name="incomeType">
                    <Select
                      name="incomeType"
                      disabled={
                        !grant || nProps.readOnly || saleDoc.type === 'booking'
                      }
                      className="text-primary"
                    >
                      {IncomeOptions.map((k) => (
                        <Select.Option value={k} key={k}>
                          {IncomeType[k]}
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
            </>
          );
        }}
      </Form>
      {!['licensePlateFee', 'installment', 'kbnLeasing', 'other'].includes(
        docType
      ) && (
          <Collapse
            className="my-3"
            activeKey={
              saleDoc.doc?.saleNo || saleDoc.doc?.bookNo ? '1' : undefined
            }
          >
            <Collapse.Panel
              header={saleDoc.doc?.title || 'ข้อมูลจากฝ่ายขาย'}
              key="1"
            >
              <DocViewer
                sale={saleDoc}
                grant={grant}
                readOnly
                noReferrerDetails
                noGuarantor
                isAccount
                onValuesChange={_onDocViewerChange}
                docType={docType}
                hidePayments
              />
            </Collapse.Panel>
          </Collapse>
        )}
      <Form
        form={form2}
        onValuesChange={_onValues2Change}
        initialValues={getInitialValues(order)}
        size="small"
        layout="vertical"
      >
        {(values) => {
          // showLog('incomeVehicles_values', values);
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
          }
          return (
            <>
              <HiddenItem name="incomeId" />
              <HiddenItem name="customerId" />
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
              {docType === 'baac' && (
                <div className="px-3 pt-3 border mb-3">
                  <Form.Item
                    name="amtBaacDebtor"
                    label="หัก ลูกหนี้ สกต/ธกส."
                    rules={getRules(['number'])}
                  >
                    <Input
                      currency
                      placeholder="จำนวนเงิน"
                      disabled={!grant}
                      readOnly={nProps.readOnly}
                    />
                  </Form.Item>
                </div>
              )}
              {[
                'licensePlateFee',
                'installment',
                'kbnLeasing',
                'other',
              ].includes(docType) && (
                  <div className="px-3 pt-3 border mb-3">
                    <label className="text-primary">{`รับเงิน ${IncomeType[docType]}`}</label>
                    <div className="bg-light pt-3 border mb-3">
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
                        readOnly={nProps.readOnly}
                        // onClick={() => _onShowCustomerDetail(values)}
                        values={values}
                        form={form2}
                        size="small"
                      />
                    </div>
                    {docType === 'kbnLeasing' ? (
                      <>
                        <Row form className="bg-light">
                          <Col md="4">
                            <Form.Item
                              name={['oweKBNLeasings', 'Down']}
                              label="ค้างดาวน์ร้าน"
                              rules={getRules(['number'])}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                addonAfter="บาท"
                                disabled={!grant}
                              />
                            </Form.Item>
                          </Col>
                          <Col md="4">
                            <Form.Item
                              name={['oweKBNLeasings', 'Installment']}
                              label="ค้างค่างวดร้าน"
                              rules={getRules(['number'])}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                addonAfter="บาท"
                                disabled={!grant}
                              />
                            </Form.Item>
                          </Col>
                          <Col md="4">
                            <Form.Item
                              name={['oweKBNLeasings', 'Equipment']}
                              label="ค้างอุปกรณ์ร้าน"
                              rules={getRules(['number'])}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                addonAfter="บาท"
                                disabled={!grant}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row form className="bg-light">
                          <Col md="4">
                            <Form.Item
                              name={['oweKBNLeasings', 'Borrow']}
                              label="ยืมเงินร้าน"
                              rules={getRules(['number'])}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                addonAfter="บาท"
                                disabled={!grant}
                              />
                            </Form.Item>
                          </Col>
                          <Col md="4">
                            <Form.Item
                              name={['oweKBNLeasings', 'overdueFines']}
                              label="เบี้ยปรับล่าช้า"
                              rules={getRules(['number'])}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                addonAfter="บาท"
                                disabled={!grant}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row form className="bg-light">
                          <Col md="4">
                            <Form.Item label="รายการหักเงิน อื่นๆ">
                              <ArrayInput
                                name="deductOthers"
                                columns={arrayInputColumns}
                                readOnly={nProps.readOnly}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <Row>
                        {docType === 'other' ? (
                          <Col md="4">
                            <Form.Item label="รายรับ อื่นๆ">
                              <ArrayInput
                                name="amtOthers"
                                columns={arrayInputColumns}
                                readOnly={nProps.readOnly}
                              />
                            </Form.Item>
                          </Col>
                        ) : (
                          <Col md="4">
                            <Form.Item
                              name={
                                docType === 'licensePlateFee'
                                  ? 'amtPlateAndInsurance'
                                  : 'amtSKLInstallment'
                              }
                              label={
                                docType === 'licensePlateFee'
                                  ? 'ค่าทะเบียน + พรบ.'
                                  : 'ค่างวด SKL'
                              }
                              rules={[
                                {
                                  required: [
                                    'licensePlateFee',
                                    'installment',
                                  ].includes(docType),
                                  message: 'กรุณาป้อนข้อมูล',
                                },
                                ...getRules(['number']),
                              ]}
                            >
                              <Input
                                currency
                                placeholder="จำนวนเงิน"
                                disabled={!grant}
                                readOnly={nProps.readOnly}
                              />
                            </Form.Item>
                          </Col>
                        )}
                        <Col md="4">
                          <Form.Item label="รายการหักเงิน อื่นๆ">
                            <ArrayInput
                              name="deductOthers"
                              columns={arrayInputColumns}
                              readOnly={nProps.readOnly}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                    <Form.Item label="การชำระเงิน" name="payments">
                      <Payments disabled={!grant || nProps.readOnly} permanentDelete={true} />
                    </Form.Item>
                  </div>
                )}
              <div className="px-3 pt-3 border mb-3">
                <Row>
                  <Col md="4">
                    <Form.Item
                      name="total"
                      label={<div className="text-primary">จำนวนเงินสุทธิ</div>}
                      rules={[
                        {
                          required: !['kbnLeasing', 'other'].includes(docType),
                          message: 'กรุณาป้อนจำนวนเงิน',
                        },
                        ...getRules(['number']),
                      ]}
                    >
                      <Input
                        currency
                        placeholder="จำนวนเงิน"
                        addonAfter="บาท"
                        disabled={!grant}
                        // readOnly={nProps.readOnly}
                        className="text-primary"
                      />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item
                      name="recordedBy"
                      label="ผู้บันทึก"
                      rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                    >
                      <EmployeeSelector disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                {![
                  'licensePlateFee',
                  'installment',
                  'kbnLeasing',
                  'other',
                ].includes(docType) && (
                    <Form.Item label="การชำระเงิน" name="payments">
                      <Payments disabled={!grant || nProps.readOnly} permanentDelete={true} />
                    </Form.Item>
                  )}
              </div>
              <DuringDayMoney grant={grant} />
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
                          resetToInitial();
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
                      onClick={() => _onPreConfirm()}
                      disabled={!grant}
                      size="middle"
                    // className="d-flex ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
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
    </div>
  );
};
