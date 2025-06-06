import { Button, Form, Popconfirm, Radio, Select, Collapse } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, CardFooter } from 'shards-react';
import { showWarn, showLog } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { Input } from 'elements';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import Customer from 'components/Customer';
import { getInitialValues, _getNetIncomeFromValues } from './api';
import { arrayInputColumns, giveAwayInputColumns } from 'data/Constant';
import { FirebaseContext } from '../../../firebase';
import { onConfirmSaleOrder } from '../api';
import { Numb } from 'functions';
import { SaleType } from 'data/Constant';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import SaleItems from './SaleItems';
import { DatePicker } from 'elements';
import { Fragment } from 'react';
import EmployeeSelector from 'components/EmployeeSelector';
import Referrer from 'Modules/Referrers/Referrer';
import { GuarantorDocs, MoreReservationInfo } from './components';
import { TotalSummary } from 'components/common/TotalSummary';
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
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import Referring from 'Modules/Referrers/Referring';
import ReferringFooter from 'Modules/Referrers/ReferringFooter';
import Payments from 'components/Payments';
import Toggles from 'components/Toggles';
import BranchSelector from 'components/BranchSelector';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useMergeState } from 'api/CustomHooks';
import { Address } from 'components/NameAddress';
import { BuyMore, TurnOverVehicle } from '../components';
import Guarantors from 'components/Guarantors';
import { getBookingData } from 'Modules/Account/screens/Income/IncomeDaily/components/IncomeVehicles/api';
const { Option } = Select;

export default ({ sale, readOnly, grant, noReferrerDetails, noGuarantor, editables = {} }) => {
  showLog({
    SaleViewerProps: {
      sale,
      readOnly,
      grant,
      noReferrerDetails,
      noGuarantor
    }
  });
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { users, employees, banks } = useSelector(state => state.data);
  const [order, setOrder] = useState(sale);
  const [showMore, setMoreInfo] = useMergeState({
    visible: false,
    values: {}
  });
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const { firestore, api } = useContext(FirebaseContext);

  const saleNoRef = useRef(null);

  useEffect(() => {
    setOrder(sale);
    form.setFieldsValue(getInitialValues(sale, user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale]);

  const _onPreConfirm = async (currentValues, netIncome, gTotal) => {
    try {
      const values = await form.validateFields();
      //  showLog({ currentValues, values });
      let mValues = { ...currentValues, ...values };
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
        mItems = mValues.items.map(item => ({
          ...item,
          saleId: mValues.saleId
        }));
        mItems = cleanNumberFieldsInArray(mItems, ['qty', 'total']);
        mValues.items = mItems;
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
      showConfirm(() => _onConfirm(mValues), `บันทึกข้อมูลเลขที่ ${mValues.saleNo}`);
    } catch (e) {
      showWarn(e);
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

      const isEdit = order && order.date && order.created;

      const mConfirm = await onConfirmSaleOrder({
        values: mValues,
        category: 'vehicle',
        order,
        isEdit,
        user,
        firestore,
        api
      });

      load(false);

      mConfirm &&
        showSuccess(
          () => showLog('Success'),
          mValues.saleNo ? `บันทึกข้อมูลเลขที่ ${mValues.saleNo} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
          true
        );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const resetToInitial = () => {
    form.resetFields();
  };

  const showMoreInfo = async () => {
    try {
      let val = form.getFieldsValue();
      let mData = await getBookingData(sale, true);
      let values = mData[0] || val;
      setMoreInfo({
        visible: true,
        values
      });
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <>
      <Form form={form} initialValues={getInitialValues(order, user)} size="small" layout="vertical">
        {values => {
          let itemsError = !values.items[0]?.productCode ? 'กรุณาป้อนรายการ' : null;
          const gTotal =
            values.items && values.items.length > 0 ? values.items.reduce((sum, it) => sum + Numb(it.total), 0) : null;

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
            <div className="bg-light ">
              {/* <HiddenItem name="saleId" /> */}
              {(readOnly || !grant) && <label className="text-warning text-right">อ่านอย่างเดียว*</label>}
              <HiddenItem name="saleId" />
              <HiddenItem name="customerId" />
              <HiddenItem name="ivAdjusted" />
              {!['cash', 'other'].includes(values.saleType) && <HiddenItem name="guarantors" />}
              <Row form className="mb-3 border-bottom">
                <Col md="3">
                  <Form.Item
                    name="saleNo"
                    label="เลขที่ใบขาย"
                    rules={[{ required: true, message: 'กรุณาป้อนเลขที่ใบขาย' }]}
                  >
                    <Input ref={saleNoRef} placeholder="เลขที่ใบขาย" disabled={!grant} readOnly={readOnly} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="branchCode" label="สาขา" rules={[{ required: true, message: 'กรุณาป้อนวันที่' }]}>
                    <BranchSelector placeholder="สาขา" disabled={!grant || readOnly} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="date" label="วันที่" rules={[{ required: true, message: 'กรุณาป้อนวันที่' }]}>
                    <DatePicker placeholder="วันที่" disabled={!grant || readOnly} />
                  </Form.Item>
                </Col>
                {values?.saleCutoffDate && (
                  <Col md="3">
                    <Form.Item name="saleCutoffDate" label="วันที่ตัดขายในระบบ Kads">
                      <DatePicker placeholder="วันที่" disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row form className="mb-3 border-bottom">
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
                      disabled={typeof editables?.saleType !== 'undefined' ? !editables.saleType : !grant || readOnly}
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
                    <EmployeeSelector disabled={!grant || readOnly} placeholder="พนักงานขาย" mode="tags" />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="sourceOfData" label="แหล่งที่มา">
                    <SourceOfDataSelector disabled={!grant || readOnly} />
                  </Form.Item>
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              {values.saleType === 'sklLeasing' && (
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
                  <DatePicker disabled={!grant || readOnly} />
                </Form.Item>
              )}
              <div className="px-3 bg-white border pt-3">
                <Row form>
                  <Col md="2">
                    <h6>ข้อมูลลูกค้า</h6>
                  </Col>
                  <Col md="4">
                    <Form.Item name="isNewCustomer">
                      <Toggles
                        disabled={!grant || readOnly}
                        buttons={[
                          { label: 'ลูกค้าใหม่', value: true },
                          { label: 'ลูกค้าเก่า', value: false }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Customer grant={grant} readOnly={readOnly} values={values} form={form} size="small" noMoreInfo />
                <Address
                  address={values.address}
                  disabled={typeof editables?.address !== 'undefined' ? !editables.address : !grant}
                  readOnly={typeof editables?.address !== 'undefined' ? !editables.address : readOnly}
                />
              </div>
              {!['cash', 'other'].includes(values.saleType) &&
                ((values.hasGuarantor || (Array.isArray(values?.guarantors) && values.guarantors.length > 0)) &&
                !noGuarantor ? (
                  <div className="px-3 bg-white border my-3 py-3">
                    <h6 className="text-primary">ผู้ค้ำประกัน</h6>
                    <Guarantors
                      grant={grant}
                      readOnly={readOnly}
                      name="guarantors"
                      size="small"
                      notRequired
                      addText="เพิ่มผู้ค้ำประกัน"
                      values={values}
                    />
                    <Collapse>
                      <Collapse.Panel header="เอกสารประกอบผู้เช่าซื้อ/ผู้ค้ำประกัน" key="2">
                        <Form.Item
                          name={'guarantorDocs'}
                          rules={[
                            {
                              required:
                                values.hasGuarantor ||
                                (Array.isArray(values?.guarantors) && values.guarantors.length > 0),
                              message: 'กรุณาป้อนข้อมูล'
                            }
                          ]}
                        >
                          <GuarantorDocs disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                ) : (
                  <label className="text-muted">ไม่มีผู้ค้ำประกัน</label>
                ))}
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
                        disabled={!grant || readOnly}
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
                    items={values.items.filter(l => l.productCode)}
                    saleId={values.saleId}
                    onChange={dat => form.setFieldsValue({ items: dat })}
                    grant={grant}
                    readOnly={readOnly}
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
                        <Input
                          currency
                          placeholder="จำนวนเงิน"
                          disabled={typeof editables?.amtReceived !== 'undefined' ? !editables.amtReceived : !grant}
                          readOnly={typeof editables?.amtReceived !== 'undefined' ? !editables.amtReceived : readOnly}
                        />
                      </Form.Item>
                    </Col>
                  ) : (
                    <Col md="4">
                      <Form.Item label="รายรับ อื่นๆ">
                        <ArrayInput
                          disabled={!grant}
                          readOnly={readOnly}
                          name="amtOthers"
                          columns={arrayInputColumns}
                        />
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
                        <Input placeholder="จำนวนเงิน" value={gTotal} disabled className="text-primary" currency />
                      </Form.Item>
                    </Col>
                  )}
                  {!['reservation', 'other'].includes(values.saleType) && (
                    <Col md="4">
                      <Form.Item
                        name="deliverDate"
                        label="วันที่ส่งมอบรถ"
                        // rules={[
                        //   {
                        //     required: !['reservation', 'other'].includes(
                        //       values.saleType
                        //     ),
                        //     message: 'กรุณาป้อนข้อมูล',
                        //   },
                        // ]}
                      >
                        <DatePicker placeholder="วันที่ส่งมอบรถ" disabled={!grant || readOnly} />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </div>
              {!!values.amtTurnOverVehicle ? (
                <TurnOverVehicle values={values} grant={grant} readOnly={readOnly} />
              ) : (
                <div className="bg-white border p-3 mb-3">
                  <h6 className="text-muted">ไม่มีการตีเทิร์นรถ</h6>
                </div>
              )}
              <div className="px-3 bg-white border pt-3 mb-3">
                {!['reservation', 'other'].includes(values.saleType) && (
                  <Row form className="bg-white">
                    {values.saleType !== 'cash' && (
                      <Col md="4">
                        <Form.Item name="advInstallment" label="ชำระค่างวดล่วงหน้า" rules={getRules(['number'])}>
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col md="4">
                      <Form.Item
                        name="amtPlateAndInsurance"
                        label="ชำระ ค่าทะเบียน + พรบ."
                        rules={getRules(['number'])}
                      >
                        <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row form>
                  <Col md="4">
                    <Form.Item name="amtSKC" label="ส่วนลด SKC" rules={getRules(['number'])}>
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="amtOldCustomer" label="ส่วนลด ลูกค้าเก่า" rules={getRules(['number'])}>
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="amtMAX" label="ส่วนลด MAX" rules={getRules(['number'])}>
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item name="amtKBN" label="ส่วนลด KBN" rules={getRules(['number'])}>
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item label="โปรโมชั่น">
                      <ArrayInput disabled={!grant} readOnly={readOnly} name="promotions" columns={arrayInputColumns} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="proMonth" label="โปรโมชั่นประจำเดือน">
                      <DatePicker picker="month" disabled={!grant || readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
                {values.saleType !== 'reservation' && (
                  <Row form>
                    <Col md="4">
                      <Form.Item name="amtReservation" label="ส่วนลด เงินจอง" rules={getRules(['number'])}>
                        <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
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
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item
                      name="amtTurnOverDifRefund"
                      label="ส่วนต่างเงินคืนลูกค้า ตีเทิร์น"
                      rules={getRules(['number'])}
                    >
                      <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  {!['kbnLeasing'].includes(values.saleType) && (
                    <Col md="4">
                      <Form.Item name="oweKBNLeasing" label="หัก ค้างโครงการร้าน" rules={getRules(['number'])}>
                        <Input currency placeholder="จำนวนเงิน" disabled={!grant} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col md="4">
                    <Form.Item label="รายการหักเงิน อื่นๆ">
                      <ArrayInput
                        disabled={!grant}
                        readOnly={readOnly}
                        name="deductOthers"
                        columns={arrayInputColumns}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {['kbnLeasing'].includes(values.saleType) && (
                  <Fragment>
                    <Row form className="bg-white">
                      <Col md="4">
                        <Form.Item name={['oweKBNLeasings', 'Down']} label="ค้างดาวน์ร้าน" rules={getRules(['number'])}>
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                      <Col md="4">
                        <Form.Item
                          name={['oweKBNLeasings', 'Installment']}
                          label="ค้างค่างวดร้าน"
                          rules={getRules(['number'])}
                        >
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                      <Col md="4">
                        <Form.Item
                          name={['oweKBNLeasings', 'Equipment']}
                          label="ค้างอุปกรณ์ร้าน"
                          rules={getRules(['number'])}
                        >
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row form className="bg-white">
                      <Col md="4">
                        <Form.Item name={['oweKBNLeasings', 'Borrow']} label="ยืมเงินร้าน" rules={getRules(['number'])}>
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                      <Col md="4">
                        <Form.Item
                          name={['oweKBNLeasings', 'overdueFines']}
                          label="เบี้ยปรับล่าช้า"
                          rules={getRules(['number'])}
                        >
                          <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Fragment>
                )}
                {values.saleType === 'other' && (
                  <Row form className="bg-white">
                    <Col md="4">
                      <Form.Item name="amtOther" label="รายรับอื่นๆ" rules={getRules(['number'])}>
                        <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
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
                        <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
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
                        <Input placeholder="111/1" disabled={!grant} readOnly={readOnly} />
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
                        <DatePicker placeholder="วันที่ ใบ สกต./ธกส." disabled={!grant || readOnly} />
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
                          disabled={!grant} readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col> */}
                  </Row>
                )}

                {!['other'].includes(values.saleType) && (
                  <Row form>
                    <Col md="8">
                      <Form.Item label="ของแถม">
                        <ArrayInput
                          disabled={!grant}
                          readOnly={readOnly}
                          name="giveaways"
                          columns={giveAwayInputColumns}
                          form={form}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {!['other'].includes(values.saleType) && (
                  <BuyMore values={values} grant={grant} readOnly={readOnly} />
                  // <Row form>
                  //   <Col md="8">
                  //     <Form.Item label="รายการซื้อเพิ่ม">
                  //       <ArrayInput
                  //         name="additionalPurchase"
                  //         columns={giveAwayInputColumns}
                  //         disabled={!grant}
                  //         readOnly={readOnly}
                  //         form={form}
                  //       />
                  //     </Form.Item>
                  //   </Col>
                  // </Row>
                )}
              </div>
              <div className="px-3 bg-white border py-2 mb-3">
                <h6 className="text-primary">ค่าแนะนำ</h6>
                {hasReferrer ? (
                  <div className="border my-2 p-3 bg-light">
                    <label className="text-muted">ข้อมูลผู้แนะนำ</label>
                    <Row form>
                      <Col md="4">
                        <Form.Item name="isNewReferrer">
                          <Radio.Group buttonStyle="solid" disabled={!grant || readOnly}>
                            <Radio.Button value={true}>คนแนะนำใหม่</Radio.Button>
                            <Radio.Button value={false}>คนแนะนำเก่า</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Referrer
                      grant={grant}
                      readOnly={readOnly}
                      values={values}
                      form={form}
                      size="small"
                      notRequired
                      noMoreInfo
                    />
                    {values.referrer?.firstName && (
                      <Address
                        address={values.referrer?.address}
                        parent={['referrer', 'address']}
                        notRequired
                        disabled={!grant}
                        readOnly={readOnly}
                      />
                    )}
                    {noReferrerDetails && (
                      <Row>
                        <Col md="4">
                          <Form.Item name="amtReferrer">
                            <Input
                              currency
                              disabled={!grant}
                              readOnly={readOnly}
                              addonBefore="ค่าแนะนำ"
                              addonAfter="บาท"
                              className="text-primary"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                ) : (
                  <h6 className="text-muted">ไม่มีค่าแนะนำ</h6>
                )}
                {hasReferrer && !noReferrerDetails && (
                  <Collapse activeKey={hasReferrer ? ['1'] : undefined}>
                    <Collapse.Panel header="รายละเอียดค่าแนะนำ" key="1">
                      <Referring hasReferrer={hasReferrer} grant={grant} readOnly={readOnly} />
                      <ReferringFooter grant={grant} isReport hasReferrer={hasReferrer} />
                    </Collapse.Panel>
                  </Collapse>
                )}
              </div>
              <TotalSummary values={values} grant={grant} readOnly={readOnly} netIncome={netIncome} />
              <Form.Item label="การชำระเงิน" name="payments">
                <Payments disabled={!grant || readOnly} />
              </Form.Item>
              <Row form>
                <Col md={8}>
                  <Form.Item name="remark" label="หมายเหตุ">
                    <Input disabled={!grant} readOnly={readOnly} />
                  </Form.Item>
                </Col>
              </Row>
              {(Object.keys(editables)
                .map(k => editables[k])
                .some(it => !!it) ||
                (grant && !readOnly)) && (
                <CardFooter className="border-top ">
                  <Row style={{ justifyContent: 'flex-end' }} form>
                    <Row
                      style={{
                        justifyContent: 'flex-end',
                        marginRight: 10
                      }}
                      form
                    >
                      {grant && !readOnly && (
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
                            readOnly={readOnly}
                            size="middle"
                          >
                            ล้างข้อมูล
                          </Button>
                        </Popconfirm>
                      )}
                      <Button
                        type="primary"
                        onClick={() => _onPreConfirm(values, netIncome, gTotal)}
                        disabled={!grant}
                        readOnly={readOnly}
                        size="middle"
                      >
                        บันทึกข้อมูล
                      </Button>
                    </Row>
                  </Row>
                </CardFooter>
              )}
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
