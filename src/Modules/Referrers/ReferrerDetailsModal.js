import React, { useCallback, useContext } from 'react';
import { Card, Row, Col, CardBody } from 'shards-react';
import { Form, Radio, Input as AInput, Modal } from 'antd';
import { formItemClass } from 'data/Constant';
import { Input } from 'elements';
import { Name, Address } from 'components/NameAddress';
import { showConfirm, load } from 'functions';
import { getRules } from 'api/Table';
import { FirebaseContext } from '../../firebase';
import { getChanges } from 'functions';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import { createReferrerNo } from './api';
import { cleanValuesBeforeSave } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import BankAccount from 'components/BankAccount';
import { addSearchFields } from 'utils';
import { createNewId } from 'utils';
import { UploadImage } from 'elements';

const ReferrerDetailsModal = ({ selectedReferrer = {}, visible, onOk, onCancel, ...mProps }) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const grant = true;

  const [form] = Form.useForm();

  const onConfirm = useCallback(
    async mValues => {
      try {
        load(true);
        let values = cleanValuesBeforeSave(mValues);
        values = addSearchFields(values, ['firstName', 'lastName', 'phoneNumber', 'referrerNo', 'referrerId']);
        const oldValues = JSON.parse(JSON.stringify(selectedReferrer));
        const newValues = values;
        const referrerRef = firestore.collection('data').doc('sales').collection('referrers');
        let type = 'editReferrer';
        let docId;
        let changes = getChanges(oldValues, newValues);

        if (selectedReferrer?.referrerId) {
          docId = selectedReferrer.referrerId;
          const docSnap = await referrerRef.doc(docId).get();
          if (docSnap.exists) {
            await referrerRef.doc(docId).update({ ...selectedReferrer, ...values });
          }
        } else {
          type = 'addReferrer';
          const { prefix, firstName, lastName } = values;
          // Check duplicate referrer.
          let refRef = referrerRef.where('firstName', '==', firstName);
          if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
            refRef = refRef.where('lastName', '==', lastName);
          }
          const cSnap = await refRef.get();

          if (cSnap.empty) {
            let referrerId = createNewId('REF');
            await referrerRef.doc(referrerId).set({
              ...values,
              created: Date.now(),
              inputBy: user.uid,
              referrerId
            });
            docId = referrerId;
          } else {
            cSnap.forEach(doc => {
              docId = doc.id;
            });
          }
        }

        load(false);
        showSuccess(
          () =>
            onOk &&
            onOk({
              ...selectedReferrer,
              ...values,
              referrerId: docId
            }),
          'บันทึกข้อมูลสำเร็จ',
          true
        );
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
      }
    },
    [firestore, onOk, selectedReferrer, user.uid]
  );

  const onPreConfirm = useCallback(
    values => {
      showConfirm(() => onConfirm(values), `บันทึกรข้อมูลของ คุณ${values.firstName}`);
    },
    [onConfirm]
  );

  const mAddress = selectedReferrer?.address || {};

  return (
    <Modal
      title="ข้อมูลคนแนะนำ"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
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
        onFinish={onPreConfirm}
        size="small"
        initialValues={{
          isNewReferrer: !selectedReferrer?.referrerId,
          url: selectedReferrer.url || null,
          referrerNo: selectedReferrer.referrerNo || createReferrerNo(),
          referrerId: selectedReferrer.referrerId || null,
          //   referrerLevel: selectedReferrer.referrerLevel || null,
          idNumber: selectedReferrer.idNumber || null,
          prefix: selectedReferrer.prefix || null,
          firstName: selectedReferrer.firstName || null,
          lastName: selectedReferrer.lastName || null,
          phoneNumber: selectedReferrer.phoneNumber || null,
          address: {
            address: mAddress.address || null,
            moo: mAddress.moo || null,
            village: mAddress.village || null,
            tambol: mAddress.tambol || null,
            amphoe: mAddress.amphoe || null,
            province: mAddress.province || null,
            postcode: mAddress.postcode || null
          },
          remark: selectedReferrer.remark || null
        }}
        layout="vertical"
      >
        {values => {
          //  showLog({ values });
          return (
            <Card small className="mb-4">
              <HiddenItem name="referrerId" />
              <CardBody>
                {!(values.isNewReferrer || selectedReferrer) && (
                  <Form.Item className={formItemClass} label="คนแนะนำ" name="isNewReferrer">
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value={true}>คนแนะนำใหม่</Radio.Button>
                      <Radio.Button value={false}>คนแนะนำเก่า</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                )}
                <Row form className="my-4">
                  <Col md="4">
                    <Form.Item name="url">
                      <UploadImage title="รูปภาพ" storeRef={`images/referrers`} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4">
                    <Form.Item name="referrerNo" label="รหัสคนแนะนำ" rules={getRules(['required'])}>
                      <Input placeholder="กรุณาป้อนข้อมูล" />
                    </Form.Item>
                  </Col>
                  {/* <Col md="4">
                    <Form.Item name="referrerLevel" label="เกรด">
                      <Select
                        placeholder="เกรด"
                        defaultValue={values.referrerLevel}
                        disabled={!grant}
                        style={{ display: 'flex' }}
                      >
                        {Object.keys(CustomerGrades).map((grade) => (
                          <Option key={grade} value={grade}>
                            {CustomerGrades[grade]}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col> */}
                </Row>
                <label className="text-light mb-2">ข้อมูลส่วนบุคคล</label>
                <Row form>
                  <Col md="4">
                    <Form.Item name="idNumber" label="เลขที่บัตรประชาชน">
                      <Input placeholder="x-xxxx-xxxxx-xxx" mask="1-1111-11111-111" disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
                <Name values={values} />
                <Address address={values.address} />
                <BankAccount notRequired />
                <Row>
                  {/* Remark */}
                  <Col md="12">
                    <Form.Item name="remark" label="หมายเหตุ">
                      <AInput.TextArea disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

export default ReferrerDetailsModal;
