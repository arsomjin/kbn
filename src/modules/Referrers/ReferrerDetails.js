import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Slide } from 'react-awesome-reveal';
import { Card, Row, Col, Form, Radio, Input as AInput, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { formItemClass } from 'data/Constant';
import { Input } from 'elements';
import { Name, Address } from 'components/NameAddress';
import { getRules } from 'api/Table';
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { app } from 'services/firebase';
import { cleanValuesBeforeSave, load } from 'utils/functions';
import { useModal } from 'contexts/ModalContext';
import { createReferrerNo } from './api';
import HiddenItem from 'components/HiddenItem';
import { addSearchFields, createNewId } from 'utils';
import { UploadImage } from 'elements';
import BankAccount from 'components/BankAccount';

const ReferrerDetails = () => {
  const { t } = useTranslation('referrers');
  const { showConfirm, showSuccess, showWarning } = useModal();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const params = location.state?.params;
  const { selectedReferrer, onBack } = params;

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

        const db = getFirestore(app);
        const referrerRef = collection(db, 'data', 'sales', 'referrers');
        let docId;

        const { prefix, firstName, lastName, phoneNumber } = values;

        if (values?.referrerId) {
          docId = selectedReferrer.referrerId;
          const docRef = doc(db, 'data', 'sales', 'referrers', docId);
          await updateDoc(docRef, values);
        } else {
          const { firstName, lastName } = values;
          // Check duplicate referrer.
          let refRef = query(referrerRef, where('firstName', '==', firstName));
          if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
            refRef = query(refRef, where('lastName', '==', lastName));
          }
          const cSnap = await getDocs(refRef);
          if (cSnap.empty) {
            let referrerId = createNewId('REF');
            await setDoc(doc(db, 'data', 'sales', 'referrers', referrerId), {
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
        showSuccess(t('saveSuccess'), 3, () => {
          if (onBack?.path) {
            navigate(onBack.path, {
              state: {
                params: {
                  ...onBack.params,
                  selectedReferrer: {
                    ...selectedReferrer,
                    referrerId: docId,
                    prefix,
                    firstName,
                    lastName,
                    phoneNumber,
                  },
                },
              },
            });
          } else {
            navigate(-1);
          }
        });
      } catch (e) {
        showWarning(e.message || t('common:errors.unexpectedError'));
        load(false);
      }
    },
    [navigate, onBack, selectedReferrer, user.uid, showSuccess, showWarning, t],
  );

  const onPreConfirm = useCallback(
    (values) => {
      showConfirm({
        title: t('common:confirm'),
        content: t('confirmSave', { name: values.firstName }),
        onOk: () => onConfirm(values),
      });
    },
    [onConfirm, showConfirm, t],
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
          bankAccount: {
            bankName: mBank.bankName || null,
            bank: mBank.bank || null,
            bankAcc: mBank.bankAcc || null,
            bankBranch: mBank.bankBranch || null,
          },
          remark: selectedReferrer.remark || null,
        }}
        layout="vertical"
      >
        {(values) => {
          return (
            <Card size="small" className="mb-4">
              <Card.Meta
                title={
                  <Row justify="space-between" align="middle" className="border-bottom pb-3">
                    <Button
                      size="default"
                      onClick={() => {
                        if (onBack?.path) {
                          navigate(onBack.path, {
                            state: { params: onBack.params },
                          });
                        } else {
                          navigate(-1);
                        }
                      }}
                    >
                      &larr; {t('back')}
                    </Button>
                    <h6 className="m-0 mr-3 text-primary">
                      {!values.isNewReferrer ? t('existingReferrer') : t('newReferrer')}
                    </h6>
                  </Row>
                }
              />
              <HiddenItem name="referrerId" />
              <div className="p-4">
                {!selectedReferrer && (
                  <Form.Item className={formItemClass} label={t('referrer')} name="isNewReferrer">
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value={true}>{t('newReferrer')}</Radio.Button>
                      <Radio.Button value={false}>{t('existingReferrer')}</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                )}
                <Row gutter={[16, 16]} className="my-4">
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="url">
                      <UploadImage title={t('common:image')} storeRef={`images/referrers`} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="referrerNo"
                      label={t('referrerCode')}
                      rules={getRules(['required'])}
                    >
                      <Input placeholder={t('enterData')} />
                    </Form.Item>
                  </Col>
                </Row>
                <label className="text-light mb-2">{t('personalInfo')}</label>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="idNumber" label={t('idNumber')}>
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
                  <Col xs={24}>
                    <Form.Item name="remark" label={t('remark')}>
                      <AInput.TextArea disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <div className="border-top p-4">
                <Row justify="space-between" align="middle">
                  <Button
                    size="default"
                    onClick={() => {
                      if (onBack?.path) {
                        navigate(onBack.path, {
                          state: { params: onBack.params },
                        });
                      } else {
                        navigate(-1);
                      }
                    }}
                  >
                    &larr; {t('back')}
                  </Button>
                  <Button type="primary" htmlType="submit" size="default" disabled={!grant}>
                    {t('saveData')}
                  </Button>
                </Row>
              </div>
              <div style={{ height: 50 }} />
            </Card>
          );
        }}
      </Form>
    </Slide>
  );
};

export default ReferrerDetails;
