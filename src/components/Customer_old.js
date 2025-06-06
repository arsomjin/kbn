import React, { useState } from 'react';

import { Row, Col } from 'shards-react';
import { Form, Tooltip } from 'antd';
import { Button, Input } from 'elements';
import { showLog } from 'functions';
import PrefixAnt from './PrefixAnt';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import HiddenItem from './HiddenItem';
import { checkDoc } from 'firebase/api';
import { showWarn } from 'functions';
import { load } from 'functions';
import CustomerSelector from 'Modules/Customers/CustomerSelector';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { AnimateKeyframes } from 'react-simple-animate';

const Customer = ({ grant, onClick, onChange, values, errors, form, size, notRequired, readOnly, noMoreInfo }) => {
  const [isSearch, setSearch] = useState(false);
  const _onSelect = async id => {
    // showLog('On_Customer_Change', id);
    try {
      load(true);
      const doc = await checkDoc('data', `sales/customers/${id}`);
      if (doc) {
        let customer = doc.data();
        form.setFieldsValue({
          customerId: id,
          ...(customer?.customerNo && {
            customerNo: customer?.customerNo
          }),
          prefix: customer.prefix,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          address: customer.address
        });
        // onChange && onChange(val);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  showLog({ grant, readOnly });

  return (
    <AnimateKeyframes play={isSearch} keyframes={['opacity: 0', 'opacity: 1']}>
      {!isSearch ? (
        <Row form style={{ alignItems: 'center' }}>
          {(grant || !readOnly) && (
            <Tooltip title="ค้นหา" className="m-3">
              <Button
                // type="primary"
                shape="circle"
                icon={<SearchOutlined />}
                onClick={() => setSearch(true)}
              />
            </Tooltip>
          )}
          <Col md="1">
            <Form.Item name="prefix" label="คำนำหน้า" className={formItemClass}>
              <PrefixAnt disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item
              name="firstName"
              label="ชื่อลูกค้า"
              className={formItemClass}
              rules={[{ required: !notRequired, message: 'กรุณาป้อนชื่อลูกค้า' }]}
            >
              <Input placeholder="ชื่อลูกค้า" disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          {!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(values.prefix) && (
            <Col md="3">
              <Form.Item name="lastName" label="นามสกุล" className={formItemClass}>
                <Input placeholder="นามสกุล" disabled={!grant || readOnly} />
              </Form.Item>
            </Col>
          )}

          <Col md="2">
            <Form.Item
              name="phoneNumber"
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
                <Button
                  onClick={onClick}
                  disabled={!grant || readOnly}
                  className="btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                >
                  ข้อมูลลูกค้าเพิ่มเติม &rarr;
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      ) : (
        <Row form>
          <HiddenItem name="prefix" />
          <HiddenItem name="firstName" required={!notRequired} message="กรุณาป้อนชื่อลูกค้า" />
          <HiddenItem name="lastName" />
          <Tooltip title="เพิ่มรายชื่อใหม่" className="mx-3 mt-4">
            <Button
              // type="primary"
              shape="circle"
              icon={<UserAddOutlined />}
              onClick={() => setSearch(false)}
            />
          </Tooltip>
          <Col md="6">
            <Form.Item name="customerId" label="🔍  ชื่อลูกค้า, นามสกุล, เบอร์โทร" rules={getRules(['required'])}>
              <CustomerSelector size="small" onChange={_onSelect} disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item
              name="phoneNumber"
              label="เบอร์โทรศัพท์"
              className={formItemClass}
              rules={getRules(['mobileNumber'])}
            >
              <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant || readOnly} focusNextField={3} />
            </Form.Item>
          </Col>
          {!noMoreInfo && (
            <Col md="2" className="pb-3">
              <Form.Item label="รายละเอียด" className={formItemClass}>
                <Button
                  onClick={onClick}
                  className="btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                  disabled={!values.customerId || !grant || readOnly}
                >
                  ข้อมูลลูกค้าเพิ่มเติม &rarr;
                </Button>
              </Form.Item>
            </Col>
          )}
        </Row>
      )}
    </AnimateKeyframes>
  );
};

export default Customer;
