import React, { useContext, useEffect, useState } from 'react';
import { Form, Skeleton, Input as AInput, Popconfirm } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import PageTitle from 'components/common/PageTitle';
import { CommonSteps } from 'data/Constant';
import { Stepper } from 'elements';
import { firstKey } from 'functions';
import { showWarn } from 'functions';
import { showLog } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, CardFooter } from 'shards-react';
import { getEditArr } from 'utils';
import { getInitialValues, getOtherServiceValues, getServicesData, getServiceSumData, renderService } from './api';
import { FirebaseContext } from '../../../firebase';
import { useSelector } from 'react-redux';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { isMobile } from 'react-device-detect';
import HiddenItem from 'components/HiddenItem';
import { Input } from 'elements';
import { NotificationIcon } from 'elements';
import { StatusMapToStep } from 'data/Constant';
import { createNewId } from 'utils';
import moment from 'moment-timezone';
import { SearchOutlined } from '@ant-design/icons';
import DocSelector from 'components/DocSelector';
import { Checkbox } from 'elements';
import { InputGroup } from 'elements';
import { DatePicker } from 'elements';
import { Button } from 'elements';
import { load } from 'functions';
import { showMessageBar } from 'functions';
import { cleanNumberFieldsInArray } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { ServiceCategories } from 'data/Constant';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import { addSearchFields } from 'utils';
import { arrayForEach } from 'functions';
import { showSuccess } from 'functions';
import { errorHandler } from 'functions';
import { StatusMap } from 'data/Constant';
import ServiceItems from './ServiceItems';
import Payments from 'components/Payments';
import { initAddress } from '../ServiceOrder/api';
import CommonSelector from 'components/CommonSelector';
import { PageSummary } from 'api';
import { cleanNumberFields } from 'functions';
import { showAlert } from 'functions';
import { checkCollection } from 'firebase/api';
import { waitFor } from 'functions';
import { createDoubleKeywords } from 'Modules/Utils';
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

  const { users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);
  const [nProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [docType, setDocType] = useState('periodicCheck');
  const [serviceDoc, setDoc] = useMergeState({
    doc: {},
    title: ''
  });

  const [form] = Form.useForm();

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
      setDocType(pOrder?.serviceType || 'periodicCheck');
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async val => {
    try {
      switch (firstKey(val)) {
        case 'serviceNo':
          let mData = await getServicesData(val);
          let refDoc = mData[0];
          if (refDoc.orderStatus === 'ปิดงาน') {
            return showAlert(
              'ปิดงานแล้ว',
              `ใบแจ้งบริการเลขที่ ${val['serviceNo']} ได้ปิดงานเรียบร้อยแล้ว ${
                !!mData[0]?.closedDate
                  ? `เมื่อวันที่ ${moment(mData[0]?.closedDate, 'YYYY-MM-DD').format('D MMM YYYY')}`
                  : ''
              }`,
              'warning',
              () => form.resetFields()
            );
          }
          showLog({ refDoc });
          setDoc({
            doc: refDoc,
            title: `ใบแจ้งบริการเลขที่ ${refDoc?.serviceNo}`
          });
          form.setFieldsValue({
            technicianId: refDoc?.technicianId || [],
            customer: refDoc?.customer || `${refDoc.prefix}${refDoc.firstName} ${refDoc.lastName || ''}`.trim(),
            cause: refDoc?.notifyDetails || null,
            ...(!!refDoc?.items &&
              refDoc.items.length > 0 && {
                items: refDoc.items.map(l => ({
                  ...l,
                  returnQty: null,
                  returnDiscount: null,
                  returnTotal: null,
                  discountCouponPercent: typeof l.discountCouponPercent !== 'undefined' ? l.discountCouponPercent : 20,
                  advance: l.total
                }))
              }),
            serviceAddress: refDoc?.serviceAddress || initAddress,
            discountCouponPercent: refDoc?.discountCouponPercent || 20,
            warrantyStatus: refDoc?.warrantyStatus || 'ในประกัน',
            vehicleType: refDoc?.vehicleType || 'รถแทรกเตอร์',
            productPCode: refDoc?.productPCode || null,
            model: refDoc?.model || null,
            serviceNo: refDoc?.serviceNo || val['serviceNo'],
            serviceType: refDoc?.serviceType || 'periodicCheck',
            branchCode: refDoc?.branchCode || '0450',
            times: refDoc?.times || 1,
            refDoc
          });
          break;

        default:
          break;
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
  };

  const _onConfirm = async values => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
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

      mValues.keywords = createDoubleKeywords(mValues.serviceNo);

      mValues = addSearchFields(mValues, ['serviceNo']);

      // Add order items.
      if (mValues.items && mValues.items.length > 0) {
        await arrayForEach(mValues.items, async item => {
          const serviceItemRef = firestore
            .collection('sections')
            .doc('services')
            .collection('serviceCloseItems')
            .doc(item.serviceItemId);
          item.item && (await serviceItemRef.set(item));
        });
        // delete mValues.items;
      }
      const serviceRef = firestore
        .collection('sections')
        .doc('services')
        .collection('serviceClose')
        .doc(mValues.serviceId);
      // Add service order.
      const docSnap = await serviceRef.get();
      if (docSnap.exists) {
        await serviceRef.update(mValues);
      } else {
        await serviceRef.set(mValues);
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
        'serviceClose'
      );
      // Update Service Order Status.
      if (!!serviceDoc.doc?.serviceId && !!mValues?.orderStatus) {
        const updateRef = firestore
          .collection('sections')
          .doc('services')
          .collection('serviceOrders')
          .doc(serviceDoc.doc.serviceId);
        const updateSnap = await updateRef.get();
        if (updateSnap.exists) {
          await updateRef.update({
            orderStatus: mValues.orderStatus,
            closedDate: mValues.recordedDate
          });
        }
      }
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
        snap: { ...values, module: 'ServiceClose' }
      });
    }
  };

  const _onPreConfirm = async () => {
    try {
      const values = await form.validateFields();
      load(true);
      let mValues = { ...values };
      const dupSnap = await checkCollection('sections/services/serviceClose', [
        ['keywords', 'array-contains', mValues.serviceNo.toLowerCase()]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.serviceNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }
      let mItems = mValues.items.filter(l => !!l.serviceCode && Numb(l.qty) > 0);
      if (mItems.length === 0) {
        showMessageBar('ไม่มีรายการ', 'กรุณาเลือกรายการบริการ', 'warning');
        return;
      }
      mItems = cleanNumberFieldsInArray(mItems, ['qty', 'total', 'discount']);
      mValues.items = mItems;
      let otherValues = getOtherServiceValues(values);
      mValues = { ...mValues, ...otherValues };

      if (mValues.serviceType !== 'repairDeposit') {
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

      mValues.refDoc = serviceDoc.doc;

      // Final clean data before submit
      mValues = cleanNumberFields(mValues, [
        'amtWage',
        'amtPart',
        'amtOil',
        'amtFreight',
        'amtOther',
        'discount',
        'discountOther',
        'discountCouponPercent',
        'total',
        'amtAllParts',
        'discountPart',
        'discountOil',
        'totalBeforeVat',
        'advance',
        'returnTotal',
        'cash',
        'moneyTransfer',
        'VAT',
        'CF4_3',
        'CF4_6',
        'UDT_18',
        'UDT_6'
      ]);

      // if (mValues?.amtOthers) {
      //   mValues.amtOther = mValues.amtOthers.reduce(
      //     (sum, elem) => sum + Numb(elem?.total || 0),
      //     0
      //   );
      // }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);
      //  showLog('clean values', mValues);

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

      showConfirm(() => _onConfirm(mValues), `บันทึกข้อมูลสรุปปิดงาน ${ServiceCategories[docType]}`);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 pt-3 bg-white">
        <PageTitle sm="4" title="งานบริการ" subtitle="สรุปปิดงาน" className="text-sm-left" />
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
            ...getInitialValues(nProps.order)
            // branchCode: nProps.order?.branchCode || user.branch || '0450',
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
            let otherValues = getOtherServiceValues(values);
            const sumData = getServiceSumData({ ...values, ...otherValues });
            return (
              <div className={`${isMobile ? '' : 'px-3 '}bg-light pt-3`}>
                {values.serviceType !== 'repairDeposit' && <HiddenItem name="items" />}

                <HiddenItem name="serviceId" />
                <HiddenItem name="customerId" />
                <HiddenItem name="amtWage" />
                <HiddenItem name="amtPart" />
                <HiddenItem name="amtOil" />
                <HiddenItem name="amtBlackGlue" />
                <HiddenItem name="amtFreight" />
                <HiddenItem name="amtOther" />
                <HiddenItem name="refDoc" />
                <HiddenItem name="model" />
                <HiddenItem name="serviceType" />
                <HiddenItem name="serviceAddress" />
                <HiddenItem name="branchCode" />
                <HiddenItem name="vehicleType" />
                <HiddenItem name="warrantyStatus" />
                <HiddenItem name="times" />
                <Row form>
                  <Col md="4" className="form-group">
                    <Form.Item
                      name="serviceNo"
                      label={
                        <label>
                          <SearchOutlined className="text-primary" /> ค้นหาจาก เลขที่ใบแจ้งบริการ / ชื่อลูกค้า
                        </label>
                      }
                    >
                      <DocSelector
                        collection="sections/services/serviceOrders"
                        orderBy={['serviceNo', 'firstName', 'lastName']}
                        size="small"
                        dropdownStyle={{ minWidth: 420 }}
                        // hasKeywords
                        placeholder="เลขที่ใบแจ้งบริการ"
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
                {renderService({
                  service: serviceDoc.doc,
                  form,
                  disabled: false,
                  readOnly: true
                })}
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">การดำเนินงาน</label>
                  <Row form>
                    <Col md="4">
                      <Form.Item
                        name="orderStatus"
                        rules={[
                          {
                            required: true,
                            message: 'กรุณาป้อนสถานะงานบริการ'
                          }
                        ]}
                      >
                        <InputGroup
                          spans={[10, 14]}
                          addonBefore="สถานะงานบริการ"
                          inputComponent={props => (
                            <CommonSelector
                              placeholder="สถานะงานบริการ"
                              optionData={['เปิดงาน', 'ปิดงาน', 'เลื่อน', 'ลด']}
                              dropdownStyle={{ minWidth: 120 }}
                              {...props}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col md="8">
                      <Form.Item name="technicianId" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[5, 19]}
                          addonBefore="ช่างผู้ปฏิบัติงาน"
                          inputComponent={props => (
                            <EmployeeSelector
                              disabled={!nProps.grant || nProps.readOnly}
                              placeholder="ช่างผู้ปฏิบัติงาน"
                              mode="tags"
                              {...props}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <Form.Item name="vehicleRegNumber" rules={getRules(['required'])}>
                        <InputGroup spans={[12, 12]} addonBefore="เลขทะเบียนรถ" placeholder="กก 1111" alignRight />
                      </Form.Item>
                    </Col>
                    <Col md="4">
                      <Form.Item name="serviceDate" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[12, 12]}
                          addonBefore="วันที่รับงาน"
                          inputComponent={props => <DatePicker {...props} />}
                        />
                      </Form.Item>
                    </Col>
                    <Col md="4">
                      <Form.Item name="serviceTime" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[12, 12]}
                          addonBefore="เวลารับงาน"
                          inputComponent={props => <DatePicker picker="time" {...props} />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {!!values.orderStatus && !['เปิดงาน', 'ปิดงาน'].includes(values.orderStatus) && (
                    <Form.Item
                      name="failReason"
                      {...(!!values.orderStatus &&
                        !['เปิดงาน', 'ปิดงาน'].includes(values.orderStatus) && {
                          rules: getRules(['required'])
                        })}
                      label="สาเหตุที่ตกแผน"
                    >
                      <AInput.TextArea />
                    </Form.Item>
                  )}
                </div>
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">ลูกค้าอนุมัติดำเนินการ</label>
                  <Row>
                    <Col md="2">
                      <Form.Item name="notFound">
                        <Checkbox>ไม่พบลูกค้า</Checkbox>
                      </Form.Item>
                    </Col>
                    {!values.notFound ? (
                      <>
                        <Col md="4">
                          <Form.Item
                            name="customerApprovedDate"
                            {...(!values.notFound && {
                              rules: getRules(['required'])
                            })}
                          >
                            <InputGroup
                              spans={[12, 12]}
                              addonBefore="ลูกค้าเซ็นต์อนุมัติวันที่"
                              placeholder="วันที่"
                              inputComponent={props => <DatePicker {...props} />}
                            />
                          </Form.Item>
                        </Col>
                        <Col md="3">
                          <Form.Item
                            name="customerApprovedTime"
                            {...(!values.notFound && {
                              rules: getRules(['required'])
                            })}
                          >
                            <InputGroup
                              spans={[10, 14]}
                              addonBefore="เวลา"
                              placeholder="เวลา"
                              inputComponent={props => <DatePicker picker="time" {...props} />}
                            />
                          </Form.Item>
                        </Col>
                      </>
                    ) : (
                      <Col md="10">
                        <Form.Item
                          name="notFoundReason"
                          {...(values.notFound && {
                            rules: getRules(['required'])
                          })}
                        >
                          <InputGroup spans={[4, 20]} addonBefore="เนื่องจาก" placeholder="รายละเอียด" />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </div>
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">การสรุปปิดงาน</label>
                  <Form.Item name="cause" label="สาเหตุของปัญหา / ลักษณะการเสียหาย" rules={getRules(['required'])}>
                    <AInput.TextArea />
                  </Form.Item>
                  <Form.Item name="corrective" label="การดำเนินการแก้ไข" rules={getRules(['required'])}>
                    <AInput.TextArea />
                  </Form.Item>
                </div>
                <label className="text-primary ml-3 mb-3">รายการ</label>
                <Row>
                  <Col md="3" className="ml-3">
                    <Form.Item name="discountCouponPercent">
                      <InputGroup
                        spans={[12, 8, 4]}
                        addonBefore="คูปองส่วนลด"
                        addonAfter="%"
                        placeholder="%"
                        className="text-success text-center"
                        readOnly
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="mb-2" style={{ backgroundColor: theme.colors.grey5 }}>
                  <ServiceItems
                    items={values.items}
                    serviceId={values.serviceId}
                    onChange={dat => form.setFieldsValue({ items: dat })}
                    disabled={!nProps.grant || nProps.readOnly}
                  />
                </div>
                <PageSummary
                  title="ยอดรับเงินค่าบริการ"
                  data={sumData}
                  // alignLeft
                />
                <Form.Item label="การชำระเงิน" name="payments">
                  <Payments disabled={!nProps.grant || nProps.readOnly} permanentDelete={true} />
                </Form.Item>
                <Row>
                  <Col md="4">
                    <div className="px-3 pt-3 border mb-3 text-center">
                      <label className="mb-3 text-primary">ผู้ให้บริการ</label>
                      <Form.Item name="servicer" rules={getRules(['required'])}>
                        <EmployeeSelector placeholder="ผู้ให้บริการ" />
                      </Form.Item>
                      <Form.Item name="recordedDate" rules={getRules(['required'])}>
                        <DatePicker />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="px-3 pt-3 border mb-3 text-center">
                      <label className="mb-3 text-primary">ผู้ตรวจสอบ</label>
                      <Form.Item name="approver" rules={getRules(['required'])}>
                        <EmployeeSelector placeholder="ผู้ตรวจสอบ" />
                      </Form.Item>
                      <Row>
                        <Col md="6">
                          <Form.Item name="approvedDate" rules={getRules(['required'])}>
                            <DatePicker />
                          </Form.Item>
                        </Col>
                        <Col md="6">
                          <Form.Item name="approvedTime" rules={getRules(['required'])}>
                            <DatePicker picker="time" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="px-3 pt-3 border mb-3 text-center">
                      <label className="mb-3 text-primary">ลูกค้าตรวจรับ</label>
                      <Form.Item name="customer" rules={getRules(['required'])}>
                        <Input readOnly />
                      </Form.Item>
                      <Row>
                        <Col md="6">
                          <Form.Item name="customerSignedDate" rules={getRules(['required'])}>
                            <DatePicker />
                          </Form.Item>
                        </Col>
                        <Col md="6">
                          <Form.Item name="customerSignedTime" rules={getRules(['required'])}>
                            <DatePicker picker="time" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
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
                      <Button type="primary" onClick={() => _onPreConfirm()} disabled={!nProps.grant} size="middle">
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
    </Container>
  );
};
