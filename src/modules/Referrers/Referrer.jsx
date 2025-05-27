import React, { Fragment } from 'react';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'elements';
import { showLog } from 'utils/functions';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import HiddenItem from 'components/HiddenItem';
import PrefixAnt from 'components/PrefixAnt';
import { load } from 'utils/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from 'services/firebase';
import { useModal } from 'contexts/ModalContext';
import { useResponsive } from 'hooks/useResponsive';
import DocSelector from 'components/DocSelector';
import { partialText } from 'utils';

const Referrer = ({ grant, onClick, values, form, notRequired, noMoreInfo, readOnly }) => {
  const { t } = useTranslation('referrers');
  const { showWarning } = useModal();
  const { isMobile } = useResponsive();

  const _onSelect = async (id) => {
    try {
      load(true);
      const db = getFirestore(app);
      const docRef = doc(db, 'data', 'sales', 'referrers', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const referrer = docSnap.data();
        form.setFieldsValue({
          referrer: {
            referrerId: id,
            ...(referrer?.referrerNo && {
              referrerNo: referrer?.referrerNo,
            }),
            prefix: referrer.prefix,
            firstName: referrer.firstName,
            firstName_lower: referrer.firstName.toLowerCase(),
            firstName_partial: partialText(referrer.firstName),
            lastName: referrer.lastName,
            phoneNumber: referrer.phoneNumber,
          },
        });
      }
      load(false);
    } catch (e) {
      showWarning(e.message || t('common:errors.unexpectedError'));
      load(false);
    }
  };

  showLog({ values });

  return (
    <Fragment>
      {/* <label className="text-light my-2">คนแนะนำ</label> */}
      {values.isNewReferrer ? (
        <Row gutter={[16, 16]} style={{ alignItems: 'center' }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name={['referrer', 'prefix']} label={t('prefix')} className={formItemClass}>
              <PrefixAnt disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name={['referrer', 'firstName']}
              label={t('firstName')}
              className={formItemClass}
              rules={[{ required: !notRequired, message: t('requiredField') }]}
            >
              <Input placeholder={t('firstName')} disabled={!grant} readOnly={readOnly} />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name={['referrer', 'lastName']}
                label={t('lastName')}
                className={formItemClass}
              >
                <Input placeholder={t('lastName')} disabled={!grant} readOnly={readOnly} />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name={['referrer', 'phoneNumber']}
              label={t('phoneNumber')}
              className={formItemClass}
              rules={getRules(['mobileNumber'])}
            >
              <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          {!noMoreInfo && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label={t('referrerDetails')} className={formItemClass}>
                <Button onClick={onClick} className={`btn-white ${isMobile ? 'w-full' : ''}`}>
                  {t('referrerDetails')} &rarr;
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <HiddenItem name={['referrer', 'prefix']} />
          <HiddenItem
            name={['referrer', 'firstName']}
            required={!notRequired}
            message={t('requiredField')}
          />
          <HiddenItem name="lastName" />
          <Col xs={24} sm={12} md={12} lg={8}>
            <Form.Item
              name={['referrer', 'referrerId']}
              label={t('searchPlaceholder')}
              rules={getRules(['required'])}
            >
              <DocSelector
                collection="data/sales/referrers"
                orderBy={['referrerId', 'firstName', 'lastName', 'phoneNumber', 'referrerNo']}
                labels={['prefix', 'firstName', 'lastName', 'phoneNumber', 'referrerNo']}
                size="small"
                onChange={_onSelect}
                disabled={!grant || readOnly}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name={['referrer', 'phoneNumber']}
              label={t('phoneNumber')}
              className={formItemClass}
              rules={getRules(['mobileNumber'])}
            >
              <Input
                mask="111-1111111"
                placeholder="012-3456789"
                disabled={!grant || readOnly}
                focusNextField={3}
              />
            </Form.Item>
          </Col>
          {!noMoreInfo && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label={t('referrerDetails')} className={formItemClass}>
                <Button
                  onClick={onClick}
                  className={`btn-white ${isMobile ? 'w-full' : ''}`}
                  disabled={!values.referrer?.referrerId}
                >
                  {t('referrerDetails')} &rarr;
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      )}
    </Fragment>
  );
};

export default Referrer;
