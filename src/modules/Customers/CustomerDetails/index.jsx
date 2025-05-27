import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { getChanges, load } from 'utils/functions';
import { useModal } from 'contexts/ModalContext';
import { FirebaseContext } from '../../../firebase';
import { useHistory, useLocation } from 'react-router';
import { CustomerGrades, ExpectToBuy } from 'data/Constant';
import { Select, Form, Radio, Input as AInput } from 'antd';
import { getWhenToBuyRange } from 'Modules/Utils';
import moment from 'moment';
import { getInitValues } from '../api';
import EmployeeSelector from 'components/EmployeeSelector';
import { Button } from 'elements';
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
import ReferrerDetailsModal from 'Modules/Referrers/ReferrerDetailsModal';
import { useMergeState } from 'api/CustomHooks';
import { cleanValuesBeforeSave } from 'utils/functions';
import SourceOfDataSelector from 'components/SourceOfDataSelector';
import { addSearchFields, createNewId } from 'utils';
import { checkDoc } from 'services/firebase';
import CustomerSelector from '../CustomerSelector';
import Toggles from 'components/Toggles';
import { UploadImage } from 'elements';
import { LabelWithTooltip } from 'elements';

const { Option } = Select;

const CustomerDetails = () => {
  let location = useLocation();
  const history = useHistory();
  const params = location.state?.params;
  const { selectedCustomer, onBack } = params;
  //  showLog({ params, location, selectedCustomer });

  const { firestore } = useContext(FirebaseContext);
  const { showWarn, showActionSheet, showSuccess } = useModal();

  const { branches, employees } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const [imageUrl, setUrl] = useState(null);

  const [showReferrer, setShowReferrer] = useMergeState({
    visible: false,
    referrer: {},
  });

  // useEffect(() => {
  //   !isInput && window.scrollTo(0, 100);
  //   return () => !isInput && window.scrollTo(0, 100);
  // }, [isInput]);

  const branchCode = branches[selectedCustomer.branch || '0450'].branchCode;

  const _onPreConfirm = (values) => {
    //  showLog('values', values);

    showActionSheet({
      title: 'ยืนยัน?',
      content: `บันทึกข้อมูลของ คุณ${values.firstName}`,
      onOk: () => _onConfirm(values),
    });
  };

  const _onConfirm = async (mValues) => {
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
      let values = cleanValuesBeforeSave(mValues);
      values = addSearchFields(values, [
        'firstName',
        'lastName',
        'phoneNumber',
        'customerNo',
        'customerId',
      ]);
      const oldValues = JSON.parse(JSON.stringify(selectedCustomer));
      const newValues = values;

      const customerRef = firestore.collection('data').doc('sales').collection('customers');
      // let mCustomers = JSON.parse(JSON.stringify(customers));
      let type = 'editCustomer';
      let docId;
      let changes = getChanges(oldValues, newValues);
      if (selectedCustomer.customerId) {
        docId = selectedCustomer.customerId;
        const docSnap = await customerRef.doc(docId).get();
        if (docSnap.exists) {
          await customerRef.doc(docId).update({ ...selectedCustomer, ...values });
        }
      } else {
        type = 'addCustomer';
        const { prefix, firstName, lastName, phoneNumber } = values;
        // Check duplicate customer.
        let cusRef = customerRef.where('firstName', '==', firstName);
        if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
          cusRef = cusRef.where('lastName', '==', lastName);
        }
        const cSnap = await cusRef.get();
        if (cSnap.empty) {
          let customerId = createNewId('CUS');
          await customerRef.doc(customerId).set({
            ...selectedCustomer,
            ...values,
            created: Date.now(),
            url: imageUrl,
            inputBy: user.uid,
            customerId,
          });
          docId = customerId;
        }
      }

      load(false);
      showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => {
        if (onBack?.path) {
          history.push(onBack.path, {
            params: onBack.params,
          });
        } else {
          history.goBack();
        }
      });

      // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e.message || e);
      load(false);
    }
  };

  const _onUploaded = useCallback((url) => setUrl(url), []);

  const _onSelect = async (id) => {
    try {
      load(true);
      const doc = await checkDoc('data', `sales/customers/${id}`);
      if (doc) {
        let customer = doc.data();
        form.setFieldsValue({
          ...getInitValues(selectedCustomer, user, branchCode),
          ...customer,
        });
        // onChange && onChange(val);
      }
      load(false);
    } catch (e) {
      showWarn(e.message || e);
      load(false);
    }
  };

  const _onWhenToBuyChange = useCallback(
    (wtb) => {
      const wtbr = getWhenToBuyRange(wtb, Date.now());
      form.setFieldsValue({
        whenToBuy: wtb,
        ...(wtbr && { whenToBuyRange: wtbr }),
      });
    },
    [form],
  );

  const _onAgentSelect = useCallback(
    (ag) => {
      form.setFieldsValue({
        agentId: ag,
        ...(ag && employees[ag] && { agent: employees[ag].firstName }),
      });
    },
    [employees, form],
  );

  const _onShowReferrerDetail = async (values) => {
    try {
      const { firstName, lastName, prefix, referrerId } = values.referrer;
      let referrer = {
        firstName,
        lastName,
        prefix,
        referrerId,
      };
      const doc = values.referrerId
        ? await checkDoc('data', `sales/referrers/${referrerId}`)
        : null;
      if (doc) {
        referrer = doc.data();
      }
      return setShowReferrer({ visible: true, referrer });
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const onReferrerUpdate = (refer) => {
    //  showLog({ refer });
    const { firstName, lastName, prefix, phoneNumber, referrerId } = refer;
    form.setFieldsValue({
      referrer: { firstName, lastName, prefix, phoneNumber, referrerId },
    });
    setShowReferrer({ visible: false, referrer: {} });
  };

  const grant = true;
  // user.isDev ||
  // (user.permissions && user.permissions.permission302) ||
  // user.uid === selectedCustomer.customerId;

  const displayName = `${
    selectedCustomer.firstName || selectedCustomer.lastName ? 'คุณ' : ''
  }${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`;

  // showLog('customer_detail_render');

  return (
    <div>
      <Form
        form={form}
        onFinish={_onPreConfirm}
        size="small"
        initialValues={getInitValues(selectedCustomer, user, branchCode)}
        layout="vertical"
      >
        {(values) => {
          return (
            <Card
              size="small"
              className="mb-4"
              title={
                <Row justify="space-between" align="middle">
                  <Button
                    onClick={() =>
                      onBack?.path
                        ? history.push(onBack.path, {
                            params: onBack.params,
                          })
                        : history.goBack()
                    }
                    size="default"
                  >
                    &larr; กลับ
                  </Button>
                  <h6 className="m-0 mr-3 text-primary">
                    {!values.isNewCustomer ? 'ลูกค้าเก่า' : 'ลูกค้าใหม่'}
                  </h6>
                </Row>
              }
            >
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
                      { label: 'ลูกค้าเก่า', value: false },
                    ]}
                  />
                </Form.Item>
              )}
              {!(values.isNewCustomer || selectedCustomer) && (
                <Row form className="ml-2 my-4">
                  <Col md="6">
                    <Form.Item
                      name="customerId"
                      label="🔍  ชื่อลูกค้า, นามสกุล, เบอร์โทร"
                      rules={getRules(['required'])}
                    >
                      <CustomerSelector size="small" onChange={_onSelect} disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
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
                    <Form.Item name="customerLevel" label="เกรด">
                      <Select placeholder="เกรด" disabled={!grant}>
                        {Object.keys(CustomerGrades).map((grade) => (
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
                  <Form.Item name="idNumber" label="เลขที่บัตรประชาชน">
                    <Input
                      placeholder="x-xxxx-xxxxx-xxx"
                      mask="1-1111-11111-111"
                      disabled={!grant}
                    />
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
                      onChange={(wtb) => _onWhenToBuyChange(wtb)}
                      disabled={!grant}
                      style={{ display: 'flex' }}
                    >
                      {Object.keys(ExpectToBuy).map((wb) => (
                        <Option key={wb} value={wb}>
                          {ExpectToBuy[wb]}
                        </Option>
                      ))}
                    </Select>
                    {values.whenToBuyRange && (
                      <span className="text-reagent-gray">
                        <small>
                          {moment(values.whenToBuyRange.range[0], 'YYYY-MM-DD').format('DD/MM/YY')}
                        </small>
                        {' - '}
                        <small>
                          {moment(values.whenToBuyRange.range[1], 'YYYY-MM-DD').format('DD/MM/YY')}
                        </small>
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
                    <EmployeeSelector onChange={(ag) => _onAgentSelect(ag)} className="d-flex" />
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
                  />
                </>
              )}
              <Row form>
                <Col md="12">
                  <Form.Item name="remark" label="หมายเหตุ">
                    <AInput.TextArea disabled={!grant} />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Row justify="space-between">
                  <Button
                    onClick={() =>
                      onBack?.path
                        ? history.push(onBack.path, {
                            params: onBack.params,
                          })
                        : history.goBack()
                    }
                    size="default"
                  >
                    &larr; กลับ
                  </Button>
                  <Button type="primary" htmlType="submit" size="default" disabled={!grant}>
                    บันทึกข้อมูล
                  </Button>
                </Row>
              </div>
              <div style={{ height: 50 }} />
            </Card>
          );
        }}
      </Form>
      {showReferrer.visible && (
        <ReferrerDetailsModal
          selectedReferrer={showReferrer.referrer}
          visible
          onOk={onReferrerUpdate}
          onCancel={() => setShowReferrer({ visible: false, referrer: {} })}
        />
      )}
    </div>
  );
};

CustomerDetails.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
};

CustomerDetails.defaultProps = {
  title: 'Account Details',
};

export default CustomerDetails;
