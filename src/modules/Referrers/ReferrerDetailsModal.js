import React, { useCallback } from 'react';
import { Card, Row, Col } from 'antd';
import { Form, Radio, Input as AInput, Modal } from 'antd';
import { formItemClass } from 'data/Constant';
import { Input } from 'elements';
import { Name, Address } from 'components/NameAddress';
import { load } from 'utils/functions';
import { getRules } from 'api/Table';
import { firestore } from 'services/firebase';
import { collection, doc, updateDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getChanges } from 'utils/functions';
import { useSelector } from 'react-redux';
import { useModal } from 'contexts/ModalContext';
import { createReferrerNo } from './api';
import { cleanValuesBeforeSave } from 'utils/functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import BankAccount from 'components/BankAccount';
import { addSearchFields } from 'utils';
import { createNewId } from 'utils';
import { UploadImage } from 'elements';

const ReferrerDetailsModal = ({ selectedReferrer = {}, visible, onOk, onCancel }) => {
  const { user } = useSelector((state) => state.auth);
  const { showConfirm, showSuccess, showWarn } = useModal();

  const grant = true;

  const [form] = Form.useForm();

  const onConfirm = useCallback(
    async (mValues) => {
      try {
        load(true);
        let values = cleanValuesBeforeSave(mValues);
        values = addSearchFields(values, [
          'firstName',
          'lastName',
          'phoneNumber',
          'referrerNo',
          'referrerId',
        ]);
        const oldValues = JSON.parse(JSON.stringify(selectedReferrer));
        const newValues = values;
        const referrerRef = collection(firestore, 'data', 'sales', 'referrers');
        let type = 'editReferrer';
        let docId;
        let changes = getChanges(oldValues, newValues);

        if (selectedReferrer?.referrerId) {
          docId = selectedReferrer.referrerId;
          const docSnap = await doc(firestore, 'data', 'sales', 'referrers', docId);
          if (docSnap.exists) {
            await updateDoc(doc(firestore, 'data', 'sales', 'referrers', docId), {
              ...selectedReferrer,
              ...values,
            });
          }
        } else {
          type = 'addReferrer';
          const { prefix, firstName, lastName } = values;
          // Check duplicate referrer.
          let refRef = query(referrerRef, where('firstName', '==', firstName));
          if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
            refRef = query(refRef, where('lastName', '==', lastName));
          }
          const cSnap = await getDocs(refRef);

          if (cSnap.empty) {
            let referrerId = createNewId('REF');
            await setDoc(doc(firestore, 'data', 'sales', 'referrers', referrerId), {
              ...values,
              created: Date.now(),
              inputBy: user.uid,
              referrerId,
            });
            docId = referrerId;
          } else {
            cSnap.forEach((doc) => {
              docId = doc.id;
            });
          }
        }

        load(false);
        showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => {
          if (onOk) {
            onOk({
              ...selectedReferrer,
              ...values,
              referrerId: docId,
            });
          }
        });
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e.message || e);
        load(false);
      }
    },
    [onOk, selectedReferrer, user.uid],
  );

  const onPreConfirm = useCallback(
    (values) => {
      showConfirm({
        title: 'ยืนยัน',
        content: `บันทึกข้อมูลของ คุณ${values.firstName}`,
        onOk: () => onConfirm(values),
      });
    },
    [onConfirm, showConfirm],
  );

  const mAddress = selectedReferrer?.address || {};

  return (
    <Modal
      title="ข้อมูลคนแนะนำ"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onPreConfirm(values);
          })
          .catch((info) => {
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
            postcode: mAddress.postcode || null,
          },
          remark: selectedReferrer.remark || null,
        }}
        layout="vertical"
      >
        {(values) => {
          //  showLog({ values });
          return (
            <Card size="small" className="mb-4">
              <HiddenItem name="referrerId" />
              {!(values.isNewReferrer || selectedReferrer) && (
                <Form.Item className={formItemClass} label="คนแนะนำ" name="isNewReferrer">
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value={true}>คนแนะนำใหม่</Radio.Button>
                    <Radio.Button value={false}>คนแนะนำเก่า</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              )}
              <Row gutter={[16, 16]} className="my-4">
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="url">
                    <UploadImage title="รูปภาพ" storeRef={`images/referrers`} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="referrerNo" label="รหัสคนแนะนำ" rules={getRules(['required'])}>
                    <Input placeholder="กรุณาป้อนข้อมูล" />
                  </Form.Item>
                </Col>
                {/* <Col xs={24} sm={12} md={8} lg={6}>
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
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    name="idNumber"
                    label="เลขที่บัตรประชาชน"
                    // rules={getRules(['required'])}
                  >
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
              <BankAccount bankAccount={values.bankAccount} />
              <Row gutter={[16, 16]}>
                {/* Remark */}
                <Col xs={24}>
                  <Form.Item name="remark" label="หมายเหตุ">
                    <AInput.TextArea disabled={!grant} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

ReferrerDetailsModal.defaultProps = {
  title: 'Referrer Details',
};

export default ReferrerDetailsModal;
