import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { Input } from 'elements';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';

export const DuringDayMoney = ({ grant, readOnly }) => {
  return (
    <div className="px-3 bg-white border pt-3 mb-3">
      <label className="text-primary">ส่งเงินระหว่างวัน</label>
      <Row form>
        <Col md="4">
          <Form.Item name="amtDuringDay" label="จำนวนเงิน" rules={getRules(['number'])}>
            <Input currency placeholder="จำนวนเงิน" addonAfter="บาท" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="receiverDuringDay" label="ผู้รับเงิน">
            <EmployeeSelector disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
