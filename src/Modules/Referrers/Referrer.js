import React, { Fragment } from 'react';

import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { Button, Input } from 'elements';
import { showLog } from 'functions';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import HiddenItem from 'components/HiddenItem';
import PrefixAnt from 'components/PrefixAnt';
import { load } from 'functions';
import { checkDoc } from 'firebase/api';
import { showWarn } from 'functions';
import DocSelector from 'components/DocSelector';
import { partialText } from 'utils';

const Referrer = ({
  isNewReferrer,
  grant,
  onClick,
  onChange,
  values,
  errors,
  form,
  size,
  notRequired,
  noMoreInfo,
  readOnly
}) => {
  const _onSelect = async id => {
    try {
      load(true);
      const doc = await checkDoc('data', `sales/referrers/${id}`);
      if (doc) {
        let referrer = doc.data();
        form.setFieldsValue({
          referrer: {
            referrerId: id,
            ...(referrer?.referrerNo && {
              referrerNo: referrer?.referrerNo
            }),
            prefix: referrer.prefix,
            firstName: referrer.firstName,
            firstName_lower: referrer.firstName.toLowerCase(),
            firstName_partial: partialText(referrer.firstName),
            lastName: referrer.lastName,
            phoneNumber: referrer.phoneNumber
          }
        });
        // onChange && onChange(val);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  // showLog({ values }); // Disabled to prevent console spam
  return (
    <Fragment>
      {/* <label className="text-light my-2">คนแนะนำ</label> */}
      {values.isNewReferrer ? (
        <Row form style={{ alignItems: 'center' }}>
          <Col md="2">
            <Form.Item name={['referrer', 'prefix']} label="คำนำหน้า" className={formItemClass}>
              <PrefixAnt disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="2">
            <Form.Item
              name={['referrer', 'firstName']}
              label="ชื่อคนแนะนำ"
              className={formItemClass}
              rules={[{ required: !notRequired, message: 'กรุณาป้อนชื่อคนแนะนำ' }]}
            >
              <Input placeholder="ชื่อคนแนะนำ" disabled={!grant} readOnly={readOnly} />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col md="3">
              <Form.Item name={['referrer', 'lastName']} label="นามสกุล" className={formItemClass}>
                <Input placeholder="นามสกุล" disabled={!grant} readOnly={readOnly} />
              </Form.Item>
            </Col>
          )}

          <Col md="2">
            <Form.Item
              name={['referrer', 'phoneNumber']}
              label="เบอร์โทรศัพท์"
              className={formItemClass}
              rules={getRules(['mobileNumber'])}
            >
              <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          {!noMoreInfo && (
            <Col md="2">
              <Form.Item label="รายละเอียด" className={formItemClass}>
                <Button onClick={onClick} className="btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0">
                  ข้อมูลคนแนะนำเพิ่มเติม &rarr;
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      ) : (
        <Row form>
          <HiddenItem name={['referrer', 'prefix']} />
          <HiddenItem name={['referrer', 'firstName']} required={!notRequired} message="กรุณาป้อนชื่อคนแนะนำ" />
          <HiddenItem name="lastName" />
          <Col md="6">
            <Form.Item
              name={['referrer', 'referrerId']}
              label="🔍  ชื่อผู้แนะนำ, นามสกุล, เบอร์โทร"
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

          <Col md="3">
            <Form.Item
              name={['referrer', 'phoneNumber']}
              label="เบอร์โทรศัพท์"
              className={formItemClass}
              rules={getRules(['mobileNumber'])}
            >
              <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant || readOnly} focusNextField={3} />
            </Form.Item>
          </Col>
          {!noMoreInfo && (
            <Col md="2" className="pb-3">
              <Form.Item label="ข้อมูลคนแนะนำ" className={formItemClass}>
                <Button
                  onClick={onClick}
                  className="btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                  disabled={!values.referrer.referrerId}
                >
                  ข้อมูลคนแนะนำเพิ่มเติม &rarr;
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
