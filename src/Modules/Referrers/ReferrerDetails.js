import React, { useCallback, useContext } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Slide } from 'react-awesome-reveal';
import { Card, CardHeader, Row, Col, CardBody, CardFooter } from 'shards-react';
import { Form, Radio, Input as AInput } from 'antd';
import { formItemClass } from 'data/Constant';
import { Input, Button } from 'elements';
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
import { addSearchFields } from 'utils';
import { createNewId } from 'utils';
import { UploadImage } from 'elements';

const ReferrerDetails = () => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  let location = useLocation();
  const history = useHistory();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  const { selectedReferrer, onBack, isNewReferrer } = params;
  // showLog({ params });

  const grant = true;

  const [form] = Form.useForm();

  const onConfirm = useCallback(
    async mValues => {
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
        values = addSearchFields(values, ['firstName', 'lastName', 'phoneNumber', 'referrerNo', 'referrerId']);
        const oldValues = JSON.parse(JSON.stringify(selectedReferrer));
        const newValues = values;
        const referrerRef = firestore.collection('data').doc('sales').collection('referrers');
        // let mReferrers = JSON.parse(JSON.stringify(referrers));
        let type = 'editReferrer';
        let docId;
        let changes = getChanges(oldValues, newValues);

        const { prefix, firstName, lastName, phoneNumber } = values;

        if (values?.referrerId) {
          docId = selectedReferrer.referrerId;
          const docSnap = await referrerRef.doc(docId).get();
          if (docSnap.exists) {
            await referrerRef.doc(docId).update(values);
          }
        } else {
          type = 'addReferrer';
          const { firstName, lastName } = values;
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
            onBack?.path
              ? history.push(onBack.path, {
                  params: {
                    ...onBack.params,
                    selectedReferrer: {
                      ...selectedReferrer,
                      referrerId: docId,
                      prefix,
                      firstName,
                      lastName,
                      phoneNumber
                    }
                  }
                })
              : history.goBack(),
          'บันทึกข้อมูลสำเร็จ',
          true
        );
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
      }
    },
    [firestore, history, onBack, selectedReferrer, user.uid]
  );

  const onPreConfirm = useCallback(
    values => {
      showConfirm(() => onConfirm(values), `บันทึกรข้อมูลของ คุณ${values.firstName}`);
    },
    [onConfirm]
  );

  const mAddress = selectedReferrer?.address || {};
  const mBank = selectedReferrer?.bankAccount || {};

  return (
    <Slide triggerOnce direction="right" duration={500}>
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
          bankAccount: {
            bankName: mBank.bankName || null,
            bank: mBank.bank || null,
            bankAcc: mBank.bankAcc || null,
            bankBranch: mBank.bankBranch || null
          },
          remark: selectedReferrer.remark || null
        }}
        layout="vertical"
      >
        {values => {
          //  showLog({ values });
          return (
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <Row form style={{ justifyContent: 'space-between' }}>
                  <Button
                    size="default"
                    onClick={() =>
                      onBack?.path
                        ? history.push(onBack.path, {
                            params: onBack.params
                          })
                        : history.goBack()
                    }
                  >
                    &larr; กลับ
                  </Button>
                  <h6 className="m-0 mr-3 text-primary">{!values.isNewReferrer ? 'คนแนะนำเก่า' : 'คนแนะนำใหม่'}</h6>
                </Row>
              </CardHeader>
              <HiddenItem name="referrerId" />
              <CardBody>
                {!selectedReferrer && (
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
                <Row>
                  {/* Remark */}
                  <Col md="12">
                    <Form.Item name="remark" label="หมายเหตุ">
                      <AInput.TextArea disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <Row form style={{ justifyContent: 'space-between' }}>
                  <Button
                    size="default"
                    onClick={() =>
                      onBack?.path
                        ? history.push(onBack.path, {
                            params: onBack.params
                          })
                        : history.goBack()
                    }
                  >
                    &larr; กลับ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="default"
                    // onClick={handleSubmit}
                    disabled={!grant}
                  >
                    บันทึกข้อมูล
                  </Button>
                </Row>
              </CardFooter>
              <div style={{ height: 50 }} />
            </Card>
          );
        }}
      </Form>
    </Slide>
  );
};

export default ReferrerDetails;
