import React from 'react';
import { Form, Input } from 'antd';
import { Fragment } from 'react';
import { Row, Col } from 'shards-react';
import BankNameSelector from './BankNameSelector';

export default ({ parent, disabled, noLabel, readOnly, notRequired }) => {
  const getParent = field => (parent ? [...parent, field] : ['bankAccount', field]);
  return (
    <Fragment>
      {!noLabel && <label className="text-light mb-2">ข้อมูลบัญชีธนาคาร</label>}
      <Row noGutters>
        <Col md="4">
          <Form.Item
            name={getParent('bankName')}
            label="ชื่อบัญชี"
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <Input placeholder="ชื่อบัญชี" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="2">
          <Form.Item
            name={getParent('bank')}
            label="ธนาคาร"
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <BankNameSelector placeholder="ธนาคาร" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name={getParent('bankAcc')}
            label="เลขที่บัญชี"
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <Input placeholder="เลขที่บัญชี" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item name={getParent('bankBranch')} label="สาขา">
            <Input placeholder="สาขา" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};
