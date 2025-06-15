import { Button, Form, Radio, Select, Collapse } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'shards-react';
import { showLog } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { Input } from 'elements';
import Customer from 'components/Customer';
import {
  getInitialValues,
  _getNetIncomeFromValues,
} from 'Modules/Sales/Vehicles/api';
import { FirebaseContext } from '../../../../../../../firebase';
import { Numb } from 'functions';
import { SaleType } from 'data/Constant';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import { DatePicker } from 'elements';
import { Fragment } from 'react';
import EmployeeSelector from 'components/EmployeeSelector';
import Referrer from 'Modules/Referrers/Referrer';
import { TotalSummary } from 'components/common/TotalSummary';
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import Referring from 'Modules/Referrers/Referring';
import ReferringFooter from 'Modules/Referrers/ReferringFooter';
import Payments from 'components/Payments';
import Toggles from 'components/Toggles';
import BranchSelector from 'components/BranchSelector';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useMergeState } from 'api/CustomHooks';
import { arrayInputColumns, giveAwayInputColumns } from 'data/Constant';
import { GuarantorDocs } from 'Modules/Sales/Vehicles/components';
import SaleItems from 'Modules/Sales/Vehicles/SaleItems';
import { TurnOverVehicle } from 'Modules/Sales/components';
import { MoreReservationInfo } from 'Modules/Sales/Vehicles/components';
import Guarantors from 'components/Guarantors';
import { showWarn } from 'functions';
import { getBookingData } from './api';
import { BuyMore } from 'Modules/Sales/components';
const { Option } = Select;

export default ({
  sale,
  readOnly,
  grant,
  noReferrerDetails,
  noGuarantor,
  onValuesChange,
  docType,
  hidePayments,
}) => {
  showLog({
    DocViewerProps: {
      sale,
      readOnly,
      grant,
      noReferrerDetails,
      noGuarantor,
      docType,
    },
  });
  const { theme } = useSelector((state) => state.global);
  const { user } = useSelector((state) => state.auth);
  const { users, employees, banks } = useSelector((state) => state.data);
  const [order, setOrder] = useState(sale.doc);
  const [showMore, setMoreInfo] = useMergeState({
    visible: false,
    values: {},
  });
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const { firestore, api } = useContext(FirebaseContext);

  const saleNoRef = useRef(null);

  const _getInitialValues = (mOrder) => {
    let values = getInitialValues(mOrder, user);
    if (docType === 'reservation') {
      return {
        ...values,
        amtReceived: values.amtDeposit,
        amtDeposit: 0,
        amtReservation: 0,
        total: values.amtDeposit,
      };
    }
    return values;
  };

  useEffect(() => {
    setOrder(sale.doc);
    form.setFieldsValue(_getInitialValues(sale.doc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale.doc]);

  const showMoreInfo = async () => {
    try {
      let val = form.getFieldsValue();
      let mData = await getBookingData(sale.doc, true);
      let values = mData[0] || val;
      setMoreInfo({
        visible: true,
        values,
      });
    } catch (e) {
      showWarn(e);
    }
  };

  const _onValuesChange = (val) => {
    let values = form.getFieldsValue();
    let total =
      docType === 'reservation'
        ? values.amtReceived
        : _getNetIncomeFromValues(values);
    if (total <= 0) {
      total = 0;
    }
    const amtFull =
      values?.items && values.items.length > 0
        ? values.items.reduce((sum, it) => sum + Numb(it?.total || 0), 0)
        : 0;
    onValuesChange && onValuesChange(values, total, amtFull);
  };

  return (
    <>
      <Form
        form={form}
        initialValues={_getInitialValues(order)}
        size='small'
        layout='vertical'
        onValuesChange={_onValuesChange}
      >
        {(values) => {
          const gTotal =
            values?.items && values.items.length > 0
              ? values.items.reduce((sum, it) => sum + Numb(it?.total || 0), 0)
              : 0;

          //  showLog({ values, amtPro, amtDeduct, amtKBNLeasing, amtOther });
          let netIncome =
            docType === 'reservation'
              ? values.amtReceived
              : _getNetIncomeFromValues(values);
          if (netIncome <= 0) {
            netIncome = 0;
          }
          const hasReferrer = values.referrer?.firstName;
          return (
            <div className='bg-light '>
              <HiddenItem name='saleId' />
              <HiddenItem name='customerId' />
              <HiddenItem name='ivAdjusted' />
              <HiddenItem name='items' />
              <Row className='mb-3 border-bottom'>
                <Col md='3'>
                  <Form.Item
                    name={sale.type === 'sale' ? 'saleNo' : 'bookNo'}
                    label={sale.type === 'sale' ? 'เลขที่ใบขาย' : 'เลขที่ใบจอง'}
                    rules={[
                      {
                        required: true,
                        message:
                          sale.type === 'sale'
                            ? 'กรุณาป้อนเลขที่ใบขาย'
                            : 'กรุณาป้อนเลขที่ใบจอง',
                      },
                    ]}
                  >
                    <Input
                      ref={saleNoRef}
                      placeholder='เลขที่ใบขาย'
                      disabled={!grant}
                      readOnly={readOnly}
                    />
                  </Form.Item>
                </Col>
                <Col md='3'>
                  <Form.Item
                    name='branchCode'
                    label='สาขา'
                    rules={[{ required: true, message: 'กรุณาป้อนวันที่' }]}
                  >
                    <BranchSelector
                      placeholder='สาขา'
                      disabled={!grant || readOnly}
                    />
                  </Form.Item>
                </Col>
                <Col md='3'>
                  <Form.Item
                    name='date'
                    label='วันที่'
                    rules={[{ required: true, message: 'กรุณาป้อนวันที่' }]}
                  >
                    <DatePicker
                      placeholder='วันที่'
                      disabled={!grant || readOnly}
                    />
                  </Form.Item>
                </Col>
                {values?.saleCutoffDate && (
                  <Col md='3'>
                    <Form.Item
                      name='saleCutoffDate'
                      label='วันที่ตัดขายในระบบ Kads'
                    >
                      <DatePicker placeholder='วันที่' disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row className='mb-3 border-bottom'>
                <Col md='3' className='d-flex flex-column'>
                  <Form.Item label='ประเภทการขาย' name='saleType'>
                    <Select
                      name='saleType'
                      onChange={(e) => {
                        //  showLog({ saleType: e });
                        form.setFieldsValue({
                          saleType: e,
                          amtReceived:
                            e === 'cash'
                              ? !!gTotal
                                ? gTotal.replace(/,/g, '')
                                : null
                              : null,
                        });
                      }}
                      disabled={!grant || readOnly}
                      className='text-primary'
                    >
                      {Object.keys(SaleType).map((k) => (
                        <Option value={k} key={k}>
                          {SaleType[k]}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col md='3'>
                  <Form.Item
                    name='salesPerson'
                    label='พนักงานขาย'
                    rules={getRules(['required'])}
                  >
                    <EmployeeSelector
                      disabled={!grant || readOnly}
                      placeholder='พนักงานขาย'
                      mode='tags'
                    />
                  </Form.Item>
                </Col>
                <Col md='3'>
                  <Form.Item name='sourceOfData' label='แหล่งที่มา'>
                    <SourceOfDataSelector
                      // allowNotInList
                      disabled={!grant || readOnly}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {values.saleType === 'sklLeasing' && docType !== 'cash' && (
                <Form.Item
                  name='contractDate'
                  label={
                    <label className='text-primary'>
                      วันที่นัดทำสัญญาเช่าซื้อ SKL
                    </label>
                  }
                  rules={[
                    {
                      required: values.saleType === 'sklLeasing',
                      message: 'กรุณาป้อนข้อมูล',
                    },
                  ]}
                >
                  <DatePicker disabled={!grant || readOnly} />
                </Form.Item>
              )}
              <div className='px-3 bg-white border pt-3'>
                <Row className='bg-white'>
                  <Col md='2'>
                    <h6>ข้อมูลลูกค้า</h6>
                  </Col>
                  <Col md='4'>
                    <Form.Item name='isNewCustomer'>
                      <Toggles
                        disabled={!grant || readOnly}
                        buttons={[
                          { label: 'ลูกค้าใหม่', value: true },
                          { label: 'ลูกค้าเก่า', value: false },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Customer
                  grant={grant}
                  readOnly={readOnly}
                  values={values}
                  form={form}
                  size='small'
                  noMoreInfo
                />
              </div>
              {!['cash', 'other'].includes(values.saleType) &&
                (values.hasGuarantor ||
                  (Array.isArray(values?.guarantors) &&
                    values.guarantors.length > 0)) &&
                !noGuarantor && (
                  <div className='px-3 bg-white border my-3 py-3'>
                    <h6 className='text-primary'>ผู้ค้ำประกัน</h6>
                    <Guarantors
                      grant={grant}
                      readOnly={readOnly}
                      name='guarantors'
                      size='small'
                      notRequired
                      addText='เพิ่มผู้ค้ำประกัน'
                      values={values}
                    />
                    <Collapse>
                      <Collapse.Panel
                        header='เอกสารประกอบผู้เช่าซื้อ/ผู้ค้ำประกัน'
                        key='2'
                      >
                        <Form.Item
                          name={'guarantorDocs'}
                          rules={[
                            {
                              required:
                                values.hasGuarantor ||
                                (Array.isArray(values?.guarantors) &&
                                  values.guarantors.length > 0),
                              message: 'กรุณาป้อนข้อมูล',
                            },
                          ]}
                        >
                          <GuarantorDocs
                            disabled={!grant}
                            readOnly={readOnly}
                          />
                        </Form.Item>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                )}
              <div className='pt-3 mt-3'>
                <Row className='bg-white'>
                  <Col md='2'>
                    <h6>ประเภทสินค้า</h6>
                  </Col>
                  <Col md='4'>
                    <Form.Item name='isUsed'>
                      <Toggles
                        buttons={[
                          { label: 'ใหม่', value: false },
                          { label: 'มือสอง', value: true },
                        ]}
                        disabled={!grant || readOnly}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div
                  className='mb-2'
                  style={{ backgroundColor: theme.colors.grey5 }}
                >
                  <SaleItems
                    items={values.items.filter((l) => l.productCode)}
                    saleId={values.saleId}
                    onChange={(dat) => form.setFieldsValue({ items: dat })}
                    grant={grant}
                    readOnly={readOnly}
                    isUsed={values?.isUsed}
                    // isEquipment={values.isEquipment}
                  />
                </div>
              </div>
              <div className='px-3 bg-white border my-3 pt-3'>
                <Row className='bg-white'>
                  {!['other'].includes(values.saleType) ? (
                    <Col md='4'>
                      <Form.Item
                        name='amtReceived'
                        label={
                          docType === 'reservation'
                            ? 'จำนวนเงินมัดจำ'
                            : docType === 'cash'
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
                          ...getRules(['number']),
                        ]}
                      >
                        <Input
                          currency
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  ) : (
                    <Col md='4'>
                      <Form.Item label='รายรับ อื่นๆ'>
                        <ArrayInput
                          name='amtOthers'
                          columns={arrayInputColumns}
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {!['other'].includes(values.saleType) && (
                    <Col md='4'>
                      <Form.Item
                        // name="amtFull"
                        label='ราคาเต็ม'
                        rules={[
                          {
                            required: !['other'].includes(values.saleType),
                            message: 'กรุณาป้อนจำนวนเงิน',
                          },
                          ...getRules(['number']),
                        ]}
                      >
                        <Input
                          placeholder='จำนวนเงิน'
                          value={gTotal}
                          disabled
                          className='text-primary'
                          currency
                          readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {!['reservation', 'other'].includes(values.saleType) && (
                    <Col md='4'>
                      <Form.Item
                        name='deliverDate'
                        label='วันที่ส่งมอบรถ'
                        // rules={[
                        //   {
                        //     required: !['reservation', 'other'].includes(
                        //       values.saleType
                        //     ),
                        //     message: 'กรุณาป้อนข้อมูล',
                        //   },
                        // ]}
                      >
                        <DatePicker
                          placeholder='วันที่ส่งมอบรถ'
                          disabled={!grant || readOnly}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </div>
              {!!values.amtTurnOverVehicle ? (
                <TurnOverVehicle
                  values={values}
                  grant={grant}
                  readOnly={readOnly}
                />
              ) : (
                <div className='bg-white border p-3 mb-3'>
                  <h6 className='text-muted'>ไม่มีการตีเทิร์นรถ</h6>
                </div>
              )}
              <div className='px-3 bg-white border pt-3 mb-3'>
                {!['reservation', 'other'].includes(values.saleType) && (
                  <Row className='bg-white'>
                    {values.saleType !== 'cash' && (
                      <Col md='4'>
                        <Form.Item
                          name='advInstallment'
                          label='ชำระค่างวดล่วงหน้า'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    <Col md='4'>
                      <Form.Item
                        name='amtPlateAndInsurance'
                        label='ชำระ ค่าทะเบียน + พรบ.'
                        rules={getRules(['number'])}
                      >
                        <Input
                          currency
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row className='bg-white'>
                  <Col md='4'>
                    <Form.Item
                      name='amtSKC'
                      label='ส่วนลด SKC'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                  <Col md='4'>
                    <Form.Item
                      name='amtOldCustomer'
                      label='ส่วนลด ลูกค้าเก่า'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                  <Col md='4'>
                    <Form.Item
                      name='amtMAX'
                      label='ส่วนลด MAX'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row className='bg-white'>
                  <Col md='4'>
                    <Form.Item
                      name='amtKBN'
                      label='ส่วนลด KBN'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                  <Col md='4'>
                    <Form.Item label='โปรโมชั่น'>
                      <ArrayInput
                        name='promotions'
                        columns={arrayInputColumns}
                        disabled={!grant}
                        readOnly={readOnly}
                      />
                    </Form.Item>
                  </Col>
                  <Col md='4'>
                    <Form.Item name='proMonth' label='โปรโมชั่นประจำเดือน'>
                      <DatePicker
                        picker='month'
                        disabled={!grant || readOnly}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {values.saleType !== 'reservation' && (
                  <Row className='bg-white'>
                    <Col md='4'>
                      <Form.Item
                        name='amtReservation'
                        label='หัก เงินจอง'
                        rules={getRules(['number'])}
                      >
                        <Input
                          currency
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                    <Col md='4'>
                      <Form.Item label='ข้อมูลเพิ่มเติม'>
                        <Button
                          icon={<InfoCircleOutlined />}
                          onClick={showMoreInfo}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          รายละเอียด เงินจอง/เงินมัดจำ
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row className='bg-white'>
                  <Col md='4'>
                    <Form.Item
                      name='amtTurnOver'
                      label='หัก ตีเทิร์น'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                  <Col md='4'>
                    <Form.Item
                      name='amtTurnOverDifRefund'
                      label='ส่วนต่างเงินคืนลูกค้า ตีเทิร์น'
                      rules={getRules(['number'])}
                    >
                      <Input
                        currency
                        placeholder='จำนวนเงิน'
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row className='bg-white'>
                  {!['kbnLeasing'].includes(values.saleType) && (
                    <Col md='4'>
                      <Form.Item
                        name='oweKBNLeasing'
                        label='หัก ค้างโครงการร้าน'
                        rules={getRules(['number'])}
                      >
                        <Input
                          currency
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col md='4'>
                    <Form.Item label='รายการหักเงิน อื่นๆ'>
                      <ArrayInput
                        name='deductOthers'
                        columns={arrayInputColumns}
                        readOnly={readOnly}
                        disabled={!grant}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {['kbnLeasing'].includes(values.saleType) && (
                  <Fragment>
                    <Row className='bg-white'>
                      <Col md='4'>
                        <Form.Item
                          name={['oweKBNLeasings', 'Down']}
                          label='ค้างดาวน์ร้าน'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4'>
                        <Form.Item
                          name={['oweKBNLeasings', 'Installment']}
                          label='ค้างค่างวดร้าน'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4'>
                        <Form.Item
                          name={['oweKBNLeasings', 'Equipment']}
                          label='ค้างอุปกรณ์ร้าน'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row className='bg-white'>
                      <Col md='4'>
                        <Form.Item
                          name={['oweKBNLeasings', 'Borrow']}
                          label='ยืมเงินร้าน'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                      <Col md='4'>
                        <Form.Item
                          name={['oweKBNLeasings', 'overdueFines']}
                          label='เบี้ยปรับล่าช้า'
                          rules={getRules(['number'])}
                        >
                          <Input
                            currency
                            placeholder='จำนวนเงิน'
                            readOnly={readOnly}
                            disabled={!grant}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Fragment>
                )}
                {values.saleType === 'other' && (
                  <Row className='bg-white'>
                    <Col md='4'>
                      <Form.Item
                        name='amtOther'
                        label='รายรับอื่นๆ'
                        rules={getRules(['number'])}
                      >
                        <Input
                          currency
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {values.saleType === 'baac' && (
                  <Row className='bg-white'>
                    <Col md='4'>
                      <Form.Item
                        name='amtBaacFee'
                        label='หักค่าธรรมเนียม สกต/ธกส.'
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
                          placeholder='จำนวนเงิน'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>

                    <Col md='4'>
                      {/* <AInput.Group compact className="d-flex flex-row"> */}
                      <Form.Item
                        name='baacNo'
                        label='เลขที่ ใบ สกต./ธกส.'
                        rules={[
                          {
                            required: values.saleType === 'baac',
                            message: 'กรุณาป้อนข้อมูล',
                          },
                        ]}
                      >
                        <Input
                          placeholder='111/1'
                          readOnly={readOnly}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                    <Col md='4'>
                      <Form.Item
                        name='baacDate'
                        label='วันที่ ใบ สกต./ธกส.'
                        rules={[
                          {
                            required: values.saleType === 'baac',
                            message: 'กรุณาป้อนข้อมูล',
                          },
                        ]}
                      >
                        <DatePicker
                          placeholder='วันที่ ใบ สกต./ธกส.'
                          disabled={!grant || readOnly}
                        />
                      </Form.Item>
                      {/* </AInput.Group> */}
                    </Col>
                  </Row>
                )}
                {!['other'].includes(values.saleType) && (
                  <Row className='bg-white'>
                    <Col md='8'>
                      <Form.Item label='ของแถม'>
                        <ArrayInput
                          name='giveaways'
                          columns={giveAwayInputColumns}
                          form={form}
                          disabled={!grant}
                          readOnly={readOnly}
                        />
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
                          columns={giveAwayInputColumns}
                          form={form}
                          disabled={!grant}
                          readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col>
                  </Row> 
                )}*/}
              </div>
              {!['other'].includes(values.saleType) && (
                <BuyMore values={values} grant={grant} readOnly={readOnly} />
              )}
              <div className='px-3 bg-white border py-2 mb-3'>
                <h6 className='text-primary'>ค่าแนะนำ</h6>
                {hasReferrer ? (
                  <div className='border my-2 p-3 bg-light'>
                    <label className='text-muted'>ข้อมูลผู้แนะนำ</label>
                    <Row className='bg-white'>
                      <Col md='4'>
                        <Form.Item name='isNewReferrer'>
                          <Radio.Group
                            buttonStyle='solid'
                            disabled={!grant || readOnly}
                          >
                            <Radio.Button value={true}>
                              คนแนะนำใหม่
                            </Radio.Button>
                            <Radio.Button value={false}>
                              คนแนะนำเก่า
                            </Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Referrer
                      grant={grant}
                      readOnly={readOnly}
                      values={values}
                      form={form}
                      size='small'
                      notRequired
                      noMoreInfo
                    />
                    {noReferrerDetails && (
                      <Row className='bg-white'>
                        <Col md='4'>
                          <Form.Item name='amtReferrer'>
                            <Input
                              currency
                              disabled={!grant}
                              readOnly={readOnly}
                              addonBefore='ค่าแนะนำ'
                              addonAfter='บาท'
                              className='text-primary'
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                ) : (
                  <h6 className='text-muted'>ไม่มีค่าแนะนำ</h6>
                )}
                {hasReferrer && !noReferrerDetails && (
                  <Collapse activeKey={hasReferrer ? ['1'] : undefined}>
                    <Collapse.Panel header='รายละเอียดค่าแนะนำ' key='1'>
                      <Referring
                        hasReferrer={hasReferrer}
                        disabled={!grant}
                        readOnly={readOnly}
                      />
                      <ReferringFooter
                        grant={grant}
                        isReport
                        hasReferrer={hasReferrer}
                      />
                    </Collapse.Panel>
                  </Collapse>
                )}
              </div>
              <TotalSummary values={values} netIncome={netIncome} />
              {!hidePayments && (
                <Form.Item label='การชำระเงิน' name='payments'>
                  <Payments disabled={!grant || readOnly} />
                </Form.Item>
              )}
              <Row className='bg-white'>
                <Col md={8}>
                  <Form.Item name='remark' label='หมายเหตุ'>
                    <Input disabled={!grant} readOnly={readOnly} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          );
        }}
      </Form>
      <MoreReservationInfo
        visible={showMore.visible}
        onCancel={() => setMoreInfo({ visible: false, values: {} })}
        values={showMore.values}
        employees={employees}
        banks={banks}
      />
    </>
  );
};
