import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, CardBody } from 'shards-react';
import { useSelector } from 'react-redux';
import { showLog, showWarn, showActionSheet, showSuccess, getChanges, load } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { CustomerGrades, ExpectToBuy } from 'data/Constant';
import { Select, Form, Radio, Input as AInput, Modal } from 'antd';
import { getWhenToBuyRange } from 'Modules/Utils';
import moment from 'moment';
import { getInitValues } from '../api';
import EmployeeSelector from 'components/EmployeeSelector';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { Input } from 'elements';
import { Name } from 'components/NameAddress';
import { Address } from 'components/NameAddress';
import PlantSelector from 'components/PlantSelector';
import VehicleSelector from 'components/VehicleSelector';
import BranchSelector from 'components/BranchSelector';
import HiddenItem from 'components/HiddenItem';
import Referrer from 'Modules/Referrers/Referrer';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { cleanValuesBeforeSave } from 'functions';
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import { addSearchFields } from 'utils';
import { checkDoc } from 'firebase/api';
import Toggles from 'components/Toggles';
import { errorHandler } from 'functions';
import { UploadImage } from 'elements';
import { LabelWithTooltip } from 'elements';
import { showAlert } from 'functions';

const { Option } = Select;

const CustomerDetailsModal = ({ selectedCustomer = {}, visible, onOk, onCancel, ...mProps }) => {
  const { firestore, api } = useContext(FirebaseContext);
  const { branches, employees } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  const [imageUrl, setUrl] = useState(null);

  const branchCode = branches[selectedCustomer.branch || '0450'].branchCode;
  const _onPreConfirm = values => {
    // showLog('customer_details_values', values);
    if (!values?.customerId) {
      return errorHandler({
        message: 'NO_CUSTOMER_ID',
        snap: { ...values, module: 'CustomerDetailsModal' }
      });
    }
    showActionSheet(() => _onConfirm(values), 'ยืนยัน?', `บันทึกข้อมูลของ คุณ${values.firstName}`);
  };

  const _onConfirm = async mValues => {
    // const {
    //   firstName,
    //   lastName,
    //   email,
    //   phoneNumber,
    //   group,
    //   branch,
    //   description,
    // } = values;
    try {
      load(true);
      // Removes whitespace from both sides of a string.
      mValues.firstName = mValues.firstName.trim();
      if (!!mValues.lastName) {
        mValues.lastName = mValues.lastName.trim();
      }
      let values = cleanValuesBeforeSave(mValues);
      values = addSearchFields(values, ['firstName', 'lastName', 'phoneNumber', 'customerNo', 'customerId']);
      const oldValues = JSON.parse(JSON.stringify(selectedCustomer));
      const newValues = values;

      const customerRef = firestore.collection('data').doc('sales').collection('customers');
      // let mCustomers = JSON.parse(JSON.stringify(customers));
      let type = 'editCustomer';
      let docId;
      let changes = getChanges(oldValues, newValues);
      showLog({ selectedCustomer, mValues, values });
      if (selectedCustomer?.customerId) {
        docId = selectedCustomer.customerId;
        const docSnap = await customerRef.doc(docId).get();
        if (docSnap.exists) {
          await customerRef.doc(docId).update({ ...selectedCustomer, ...values });
        }
      } else {
        type = 'addCustomer';
        const { prefix, firstName, lastName, customerId } = values;
        // Check duplicate customer.
        let cusRef = customerRef.where('firstName', '==', firstName);
        if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
          cusRef = cusRef.where('lastName', '==', lastName);
        }
        const cSnap = await cusRef.get();
        if (cSnap.empty) {
          let cusObj = cleanValuesBeforeSave({
            ...selectedCustomer,
            ...values,
            created: Date.now(),
            url: imageUrl,
            inputBy: user.uid
          });
          showLog({ cusObj, customerId, values });
          await customerRef.doc(customerId).set(cusObj);
          docId = customerId;
        } else {
          return showAlert(
            'มีข้อมูลลูกค้าในระบบแล้ว',
            `${prefix}${firstName}${
              ['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix) ? '' : ` ${lastName}`
            } มีข้อมูลในระบบแล้ว`
          );
        }
      }

      // Add log.
      await api.addLog(
        {
          time: Date.now(),
          type: type === 'editCustomer' ? 'edited' : 'added',
          by: user.uid,
          docId,
          changes
        },
        'customers',
        type
      );
      load(false);
      showSuccess(
        () =>
          onOk &&
          onOk({
            ...selectedCustomer,
            ...values,
            customerId: docId
          }),
        'บันทึกข้อมูลสำเร็จ',
        true
      );

      // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'CustomerDetailsModal'
        }
      });
      load(false);
    }
  };

  const _onUploaded = useCallback(url => setUrl(url), []);

  const _onSelect = async id => {
    try {
      load(true);
      const doc = await checkDoc('data', `sales/customers/${id}`);
      if (doc) {
        let customer = doc.data();
        form.setFieldsValue({
          ...getInitValues(selectedCustomer, user, branchCode),
          ...customer
        });
        // onChange && onChange(val);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onWhenToBuyChange = useCallback(
    wtb => {
      const wtbr = getWhenToBuyRange(wtb, Date.now());
      form.setFieldsValue({
        whenToBuy: wtb,
        ...(wtbr && { whenToBuyRange: wtbr })
      });
    },
    [form]
  );

  const _onAgentSelect = useCallback(
    ag => {
      form.setFieldsValue({
        agentId: ag,
        ...(ag && employees[ag] && { agent: employees[ag].firstName })
      });
    },
    [employees, form]
  );

  const _onShowReferrerDetail = async values => {
    try {
      const { firstName, lastName, prefix, phoneNumber, referrerId } = values.referrer || {};
      let referrer = {
        firstName,
        lastName,
        prefix,
        phoneNumber,
        referrerId
      };
      const doc = values.referrerId ? await checkDoc('data', `sales/referrers/${referrerId}`) : null;
      if (doc) {
        referrer = doc.data();
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const grant = true;
  // user.isDev ||
  // (user.permissions && user.permissions.permission302) ||
  // user.uid === selectedCustomer.customerId;

  // showLog('customer_detail_modal_render');

  return (
    <Modal
      title="ข้อมูลลูกค้า"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            _onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ปิด"
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
    >
      <Form
        form={form}
        onFinish={_onPreConfirm}
        size="small"
        initialValues={getInitValues(selectedCustomer, user, branchCode)}
        layout="vertical"
      >
        {values => {
          return (
            <Card small className="mb-4">
              <CardBody>
                <HiddenItem name="customerId" />
                <HiddenItem name="agentId" />
                <HiddenItem name="agent" />
                <HiddenItem name="whenToBuy" />
                <HiddenItem name="whenToBuyRange" />
                {!selectedCustomer && (
                  <Form.Item className={formItemClass} label="คนแนะนำ" name="isNewCustomer">
                    <Toggles
                      disabled={!grant}
                      buttons={[
                        { label: 'ลูกค้าใหม่', value: true },
                        { label: 'ลูกค้าเก่า', value: false }
                      ]}
                    />
                  </Form.Item>
                )}
                {/* {!(values.isNewCustomer || selectedCustomer) && (
                  <Row form className="ml-2 my-4">
                    <Col md="6">
                      <Form.Item
                        name="customerId"
                        label="🔍  ชื่อลูกค้า, นามสกุล, เบอร์โทร"
                        rules={getRules(['required'])}
                      >
                        <CustomerSelector
                          size="small"
                          onChange={_onSelect}
                          disabled={!grant}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )} */}
                <Row form className="my-4">
                  <Col md="4">
                    <Form.Item name="url">
                      <UploadImage storeRef={`images/customers`} title="รูปภาพ" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item name="customerNo" label="รหัสลูกค้า" rules={getRules(['required'])}>
                      <Input placeholder="กรุณาป้อนข้อมูล" disabled={!grant} />
                    </Form.Item>
                  </Col>
                  {!values.isNewCustomer && (
                    <Col md="4">
                      <Form.Item
                        name="customerLevel"
                        label="เกรด"
                        // rules={getRules(['required'])}
                      >
                        <Select placeholder="เกรด" disabled={!grant}>
                          {Object.keys(CustomerGrades).map(grade => (
                            <Option key={grade} value={grade}>
                              {CustomerGrades[grade]}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                <label className="text-light mb-2">ข้อมูลส่วนบุคคล</label>
                <Row form>
                  <Col md="4">
                    <Form.Item
                      name="idNumber"
                      label="เลขที่บัตรประชาชน"
                      // rules={getRules(['required'])}
                    >
                      <Input placeholder="x-xxxx-xxxxx-xxx" mask="1-1111-11111-111" disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                <Name values={values} />
                <Address address={values.address} />
                <label className="text-light my-2">ข้อมูลการตลาด</label>
                <Row form>
                  <Col md="4">
                    <Form.Item name="career" label="อาชีพ">
                      <Input placeholder="อาชีพ" disabled={!grant} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="plants" label="พืชไร่">
                      <PlantSelector disabled={!grant} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="areaSize" label="ขนาดพื้นที่ (ไร่)">
                      <Input placeholder="กรุณาป้อนข้อมูล" disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item
                      name="ownedModel"
                      label={
                        <LabelWithTooltip
                          title="ออกรถรุ่น"
                          detail="หากต้องการค้นหาเฉพาะสินค้าใหม่ สามารถค้นหาโดยใช้รหัสสินค้าโดยไม่มี
                        '2-' นำหน้า"
                        />
                      }
                    >
                      <VehicleSelector placeholder="รหัส / รุ่น / ชื่อสินค้า" disabled={!grant} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item
                      name="interestedModel"
                      label={
                        <LabelWithTooltip
                          title="รุ่นที่สนใจ"
                          detail="หากต้องการค้นหาเฉพาะสินค้าใหม่ สามารถค้นหาโดยใช้รหัสสินค้าโดยไม่มี
                        '2-' นำหน้า"
                        />
                      }
                    >
                      <VehicleSelector placeholder="รหัส / รุ่น / ชื่อสินค้า" disabled={!grant} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item label="คาดว่าจะซื้อ">
                      <Select
                        placeholder="คาดว่าจะซื้อ"
                        defaultValue={values.whenToBuy || ExpectToBuy.thisMonth}
                        onChange={wtb => _onWhenToBuyChange(wtb)}
                        disabled={!grant}
                        style={{ display: 'flex' }}
                      >
                        {Object.keys(ExpectToBuy).map(wb => (
                          <Option key={wb} value={wb}>
                            {ExpectToBuy[wb]}
                          </Option>
                        ))}
                      </Select>
                      {values.whenToBuyRange && (
                        <span className="text-reagent-gray">
                          <small>{moment(values.whenToBuyRange.range[0], 'YYYY-MM-DD').format('DD/MM/YY')}</small>
                          {' - '}
                          <small>{moment(values.whenToBuyRange.range[1], 'YYYY-MM-DD').format('DD/MM/YY')}</small>
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item name="branch" label="สาขา">
                      <BranchSelector disabled={!grant} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item label="ตัวแทนขาย">
                      <EmployeeSelector onChange={ag => _onAgentSelect(ag)} className="d-flex" />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="sourceOfData" label="แหล่งที่มา">
                      <SourceOfDataSelector disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                {values.sourceOfData.includes('referrer') && (
                  <>
                    <Row form>
                      <Col md="4">
                        <Form.Item className={formItemClass} label="คนแนะนำ" name="isNewReferrer">
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value={true}>คนแนะนำใหม่</Radio.Button>
                            <Radio.Button value={false}>คนแนะนำเก่า</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Referrer
                      grant={grant}
                      onClick={() => _onShowReferrerDetail(values)}
                      values={values}
                      form={form}
                      size="small"
                      noMoreInfo
                    />
                  </>
                )}
                <Row form>
                  {/* Remark */}
                  <Col md="12">
                    <Form.Item name="remark" label="หมายเหตุ">
                      <AInput.TextArea disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              </CardBody>
              {/* <CardFooter>
                <Row form style={{ justifyContent: 'space-between' }}>
                  <Button onClick={() => onCancel && onCancel()} size="default">
                    &larr; กลับ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="default"
                    disabled={!grant}
                  >
                    บันทึกข้อมูล
                  </Button>
                </Row>
              </CardFooter>
              <div style={{ height: 50 }} /> */}
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

CustomerDetailsModal.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string
};

CustomerDetailsModal.defaultProps = {
  title: 'Account Details'
};

export default CustomerDetailsModal;
