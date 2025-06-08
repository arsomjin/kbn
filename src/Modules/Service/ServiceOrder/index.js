import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Select, Skeleton, Input as AInput, Popconfirm } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, Col, CardFooter } from 'shards-react';
import { Button } from 'elements';
import { Stepper, Checkbox } from 'elements';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';
import { StatusMapToStep } from 'data/Constant';
import { FirebaseContext } from '../../../firebase';
import { createNewId } from 'utils';
import dayjs from 'dayjs';
import { firstKey } from 'functions';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import { getInitialValues, initAddress, initName, _getNetIncomeFromValues } from './api';
import { getEditArr } from 'utils';
import { isMobile } from 'react-device-detect';
import HiddenItem from 'components/HiddenItem';
import { ServiceCategories } from 'data/Constant';
import BranchDateHeader from 'components/branch-date-header';
import { NotificationIcon } from 'elements';
import { CommonSteps } from 'data/Constant';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import Customer from 'components/Customer';
import { Address } from 'components/NameAddress';
import { Name } from 'components/NameAddress';
import CustomerDetailsModal from 'Modules/Customers/CustomerDetailsModal';
import CommonSelector from 'components/CommonSelector';
import { VehicleType } from 'data/Constant';
import DealerSelector from 'components/DealerSelector';
import { DatePicker } from 'elements';
import VehicleSelector from 'components/VehicleSelector';
import { InputGroup } from 'elements';
import { load } from 'functions';
import { showMessageBar } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { updateNewOrderCustomer } from 'Modules/Utils';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import { StatusMap } from 'data/Constant';
import { arrayForEach } from 'functions';
import { showSuccess } from 'functions';
import { errorHandler } from 'functions';
import ServiceItems from './ServiceItems';
import { cleanNumberFieldsInArray } from 'functions';
import { addSearchFields } from 'utils';
import { Numb } from 'functions';
import { getSearchData } from 'firebase/api';
import { checkCollection } from 'firebase/api';
import { showAlert } from 'functions';
import { waitFor } from 'functions';
import { createDoubleKeywords } from 'Modules/Utils';
import { partialText } from 'utils';
import { usePermissions } from 'hooks/usePermissions';

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
  const [docType, setDocType] = useState('periodicCheck');
  const [showCustomer, setShowCustomer] = useMergeState({
    visible: false,
    customer: {}
  });
  const [ready, setReady] = useState(false);

  const { getDefaultBranch } = usePermissions();

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
          ? `เลขที่ ${pOrder.depositRef.serviceId} วันที่ ${dayjs(pOrder.depositRef.date, 'YYYY-MM-DD').format(
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
        case 'serviceType':
          form.setFieldsValue(val);
          setDocType(val.serviceType);
          break;
        case 'branchCode':
          let mItems = form.getFieldValue('items');
          form.setFieldsValue({
            items: mItems.map(l => ({ ...l, branchCode: val['branchCode'] }))
          });
          break;
        case 'discountCouponPercent':
          let dItems = form.getFieldValue('items');
          let fItems = dItems.map(mItem => {
            mItem.discountCouponPercent = val['discountCouponPercent'];
            let isPart = mItem.serviceItemType === 'อะไหล่';
            let totalBeforeDiscount = Numb(mItem.unitPrice) * (Number(mItem.qty) - Numb(mItem?.returnQty || 0));
            let discount = isPart
              ? totalBeforeDiscount * ((val['discountCouponPercent'] || 0) / 100)
              : mItem.discount || 0;
            mItem.discount = discount;
            if (typeof mItem.returnQty !== 'undefined') {
              let totalReturnBeforeDiscount = Numb(mItem.unitPrice) * Numb(mItem?.returnQty || 0);
              let returnDiscount = isPart
                ? totalReturnBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
                : mItem.returnDiscount || 0;
              let returnTotal = totalReturnBeforeDiscount - returnDiscount;
              mItem.returnDiscount = returnDiscount;
              mItem.returnTotal = returnTotal.toFixed(2);
              mItem.total = (totalBeforeDiscount - discount - returnTotal).toFixed(2);
            } else {
              mItem.total = (totalBeforeDiscount - discount).toFixed(2);
            }
            return mItem;
          });

          form.setFieldsValue({
            items: fItems
          });
          break;
        case 'productPCode':
          // Get model
          let pData = await getSearchData('data/products/vehicleList', { productPCode: val['productPCode'] }, [
            'productCode',
            'name'
          ]);
          form.setFieldsValue({
            model: pData[0]?.model || null
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

  const _onCustomerChange = cus => {
    const { firstName, lastName, prefix, phoneNumber, customerId, address } = cus;
    if (!!customerId && !!firstName) {
      let sameName = form.getFieldValue('sameName');
      let sameAddress = form.getFieldValue('sameAddress');
      if (sameName) {
        form.setFieldsValue({
          contact: {
            firstName,
            lastName,
            prefix,
            phoneNumber
          }
        });
      }
      if (sameAddress && !!address?.address) {
        form.setFieldsValue({
          serviceAddress: address
        });
      }
    }
  };

  const _onSameNameChange = sameName => {
    let contact = initName;
    if (sameName) {
      const { prefix, firstName, lastName, phoneNumber } = form.getFieldsValue();
      contact = { prefix, firstName, lastName, phoneNumber };
    }
    form.setFieldsValue({
      sameName,
      contact
    });
  };
  const _onSameAddressChange = sameAddress => {
    let serviceAddress = initAddress;
    if (sameAddress) {
      serviceAddress = form.getFieldValue('address');
    }
    form.setFieldsValue({ sameAddress, serviceAddress });
  };

  const _onPreConfirm = async netTotal => {
    try {
      load(true);
      const values = await form.validateFields();
      let mValues = { ...values };
      const dupSnap = await checkCollection('sections/services/serviceOrders', [
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
      mValues.total = mItems.reduce((sum, elem) => sum + Numb(elem.total || 0), 0);
      mValues.discount = mItems.reduce((sum, elem) => sum + Numb(elem.discount || 0), 0);
      // mValues.total = parser(netTotal);

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
      // Final clean data before submit
      // mValues = cleanNumberFields(mValues, [
      //   'amtParts',
      //   'amtOil',
      //   'amtWage',
      //   'amtBlackGlue',
      //   'amtDistance',
      //   'amtPumpCheck',
      //   'amtOther',
      //   'deductDeposit',
      //   'amtDuringDay',
      //   'total',
      // ]);

      // if (mValues?.amtOthers) {
      //   mValues.amtOther = mValues.amtOthers.reduce(
      //     (sum, elem) => sum + Numb(elem?.total || 0),
      //     0
      //   );
      // }

      mValues = cleanValuesBeforeSave(mValues);

      load(false);
      //  showLog('clean values', mValues);
      showConfirm(() => _onConfirm(mValues), `บันทึกข้อมูลแจ้งบริการ ${ServiceCategories[docType]}`);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirm = async values => {
    try {
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
        mValues.created = dayjs().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }

      mValues.keywords = createDoubleKeywords(mValues.serviceNo);

      mValues = addSearchFields(mValues, ['serviceNo', 'firstName', 'lastName']);

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
      const serviceRef = firestore
        .collection('sections')
        .doc('services')
        .collection('serviceOrders')
        .doc(mValues.serviceId);
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
        'serviceOrders'
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
        snap: { ...values, module: 'ServiceOrders' }
      });
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 pt-3 bg-white">
        <PageTitle sm="4" title="งานบริการ" subtitle="แจ้งบริการ/ประเมินราคา" className="text-sm-left" />
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
            branchCode: nProps.order?.branchCode || getDefaultBranch() || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
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
              <div className={`${isMobile ? '' : 'px-3 '}bg-light pt-3`}>
                {values.serviceType !== 'repairDeposit' && <HiddenItem name="items" />}
                <HiddenItem name="serviceId" />
                <HiddenItem name="customerId" />
                <Row form>
                  <Col md="4">
                    <Form.Item
                      name="serviceNo"
                      label="ใบแจ้งบริการเลขที่"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนเลขที่'
                        }
                      ]}
                    >
                      <Input placeholder="ใบแจ้งบริการเลขที่" readOnly={nProps.readOnly} disabled={!nProps.grant} />
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
                      name="orderStatus"
                      label="สถานะงานบริการ"
                      rules={[
                        {
                          required: true,
                          message: 'กรุณาป้อนสถานะงานบริการ'
                        }
                      ]}
                    >
                      <Input placeholder="สถานะงานบริการ" readOnly={nProps.readOnly} disabled={!nProps.grant} />
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
                  <label className="mb-3 text-primary">ข้อมูลเจ้าของผลิตภัณฑ์</label>
                  <Customer
                    grant={nProps.grant}
                    onClick={() => _onShowCustomerDetail(values)}
                    onSelect={val => _onCustomerChange(val)}
                    values={values}
                    form={form}
                    size="small"
                    readOnly={nProps.readOnly}
                  />
                  <Address address={values.address} />
                  <Row>
                    <Col md="2">
                      <label className="text-muted">ที่อยู่ให้บริการ</label>
                    </Col>
                    <Col md="8">
                      <Form.Item name="sameAddress">
                        <Checkbox onChange={_onSameAddressChange}>ที่อยู่เดียวกับเจ้าของผลิตภัณฑ์</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Address
                    noLabel
                    address={values.serviceAddress}
                    parent={['serviceAddress']}
                    // notRequired
                    readOnly={values.sameAddress}
                  />
                </div>
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">ผู้ติดต่อ และเวลานัดบริการ</label>
                  <Row>
                    <Col md="2 ">
                      <label className="text-muted">ผู้ติดต่อ</label>
                    </Col>
                    <Col md="8">
                      <Form.Item name="sameName">
                        <Checkbox onChange={_onSameNameChange}>ชื่อเดียวกับเจ้าของผลิตภัณฑ์</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Name values={values} nameValue={['contact']} readOnly={values.sameName} />
                  <Row>
                    <Col md="3">
                      <Form.Item name="appointmentDate" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[10, 14]}
                          addonBefore="วันที่นัดหมาย"
                          placeholder="วันที่นัดหมาย"
                          inputComponent={props => <DatePicker {...props} />}
                        />
                        {/* <DatePicker /> */}
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="appointmentTime" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[10, 14]}
                          addonBefore="เวลานัดหมาย"
                          placeholder="เวลานัดหมาย"
                          inputComponent={props => <DatePicker picker="time" {...props} />}
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="notifyDate" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[10, 14]}
                          addonBefore="วันที่รับแจ้ง"
                          placeholder="วันที่รับแจ้ง"
                          inputComponent={props => <DatePicker {...props} />}
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="urgency">
                        <InputGroup spans={[10, 14]} addonBefore="ความเร่งด่วน" placeholder="ระดับ" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <Form.Item name="notifiedBy" rules={getRules(['required'])}>
                        <InputGroup
                          spans={[8, 16]}
                          addonBefore="ผู้รับแจ้ง"
                          inputComponent={props => <EmployeeSelector {...props} />}
                        />
                        {/* <DatePicker /> */}
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">รายละเอียดผลิตภัณฑ์</label>
                  <Row form>
                    <Col md="3">
                      <Form.Item name="vehicleType" label="ผลิตภัณฑ์" rules={getRules(['required'])}>
                        <CommonSelector
                          placeholder="ผลิตภัณฑ์"
                          optionData={VehicleType}
                          dropdownStyle={{ minWidth: 220 }}
                        />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="productPCode" label="รุ่น" rules={getRules(['required'])}>
                        {/* <ModelSelector
                          style={{ display: 'flex' }}
                          isUsed={false}
                          isVehicle
                        /> */}
                        <VehicleSelector placeholder="รุ่น/ รหัส / ชื่อสินค้า" record={{ ...values, isUsed: false }} />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="dealer" label="ซื้อจากร้าน">
                        <DealerSelector />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="boughDate" label="วันที่ซื้อ">
                        <DatePicker />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="3">
                      <Form.Item name="guaranteedEndDate" label="รับประกันถึง">
                        <DatePicker />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="hoursOfUse" label="ชั่วโมงใช้งาน">
                        <Input placeholder="จำนวนชั่วโมง" readOnly={nProps.readOnly} disabled={!nProps.grant} />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="engineNo" label="หมายเลขเครื่อง">
                        <Select mode="tags" notFoundContent={null} />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="peripheralPCode" label="รุ่นอุปกรณ์ต่อพ่วง">
                        <Input placeholder="รุ่นอุปกรณ์ต่อพ่วง" readOnly={nProps.readOnly} disabled={!nProps.grant} />
                        {/* <ModelSelector
                          style={{ display: 'flex' }}
                          isUsed={false}
                          isVehicle={false}
                        /> */}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md="3">
                      <Form.Item name="vehicleNo" label="หมายเลขรถ">
                        <Select mode="tags" notFoundContent={null} />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="peripheralNo" label="หมายเลขอุปกรณ์">
                        <Select mode="tags" notFoundContent={null} />
                      </Form.Item>
                    </Col>
                    <Col md="3">
                      <Form.Item name="warrantyStatus" label="สถานะรับประกัน">
                        <CommonSelector
                          optionData={['ในประกัน', 'หมดประกัน']}
                          className={values.warrantyStatus === 'ในประกัน' ? 'text-success' : 'text-warning'}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="px-3 pt-3 border mb-3">
                  <label className="mb-3 text-primary">ความต้องการขอรับบริการ</label>
                  <Row>
                    <Col md="6">
                      <Row>
                        <Col
                          md={
                            ['periodicCheck', 'periodicCheck_KIS', 'periodicCheck_Beyond'].includes(values.serviceType)
                              ? '8'
                              : '12'
                          }
                        >
                          <Form.Item name="serviceType">
                            <InputGroup
                              spans={[8, 16]}
                              addonBefore="ประเภทงาน"
                              placeholder="ประเภทงาน"
                              inputComponent={props => (
                                <Select
                                  name="serviceType"
                                  disabled={!nProps.grant || nProps.readOnly}
                                  className="text-primary"
                                  {...props}
                                >
                                  {Object.keys(ServiceCategories).map(k => (
                                    <Select.Option value={k} key={k}>
                                      {ServiceCategories[k]}
                                    </Select.Option>
                                  ))}
                                </Select>
                              )}
                            />
                          </Form.Item>
                        </Col>
                        {['periodicCheck', 'periodicCheck_KIS', 'periodicCheck_Beyond'].includes(
                          values.serviceType
                        ) && (
                          <Col md="4">
                            <Form.Item name="times">
                              <InputGroup
                                spans={[10, 14]}
                                addonBefore="ครั้งที่"
                                placeholder="ครั้งที่"
                                inputComponent={props => (
                                  <CommonSelector optionData={[1, 2, 3, 4, 5, 6, 7, 8, 9]} {...props} />
                                )}
                              />
                            </Form.Item>
                          </Col>
                        )}
                      </Row>
                    </Col>
                    <Col md="4">
                      <Form.Item name="notifyChannel">
                        <InputGroup spans={[10, 14]} addonBefore="ช่องทางรับแจ้ง" placeholder="ช่องทางรับแจ้ง" />
                      </Form.Item>
                    </Col>
                    <Col md="2">
                      <Form.Item name="redo">
                        <Checkbox>เป็นการซ่อมซ้ำ</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="8">
                      <Form.Item name="notifyDetails" label="อาการที่แจ้ง" rules={getRules(['required'])}>
                        <AInput.TextArea />
                      </Form.Item>
                    </Col>
                    <Col md="4">
                      <Form.Item name="assigner" label="ผู้จ่ายงาน" rules={getRules(['required'])}>
                        <EmployeeSelector />
                      </Form.Item>
                    </Col>
                  </Row>
                  <label className="text-primary mb-3">รายการประเมินราคา</label>
                  <Row>
                    <Col md="3">
                      <Form.Item name="discountCouponPercent">
                        <InputGroup
                          spans={[12, 8, 4]}
                          addonBefore="คูปองส่วนลด"
                          addonAfter="%"
                          placeholder="%"
                          inputComponent={props => (
                            <CommonSelector
                              optionData={[0, 5, 10, 15, 20, 30, 100]}
                              className="text-success text-center"
                              {...props}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {itemsError && values.serviceType !== 'repairDeposit' && (
                    <div>
                      <strong className="text-warning ml-2">{itemsError}</strong>
                    </div>
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
                </div>
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
