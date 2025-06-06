import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { Input } from 'elements';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';

export const TotalSummary = ({ grant, netIncome, readOnly }) => {
  return (
    <div className="px-3 bg-white border pt-3 mb-3">
      <Row form>
        <Col md="4">
          <Form.Item
            // name="total"
            label="รายรับสุทธิ"
            rules={getRules(['number'])}
          >
            <Input
              value={netIncome}
              currency
              placeholder="จำนวนเงิน"
              addonAfter="บาท"
              readOnly
              className={netIncome > 0 ? 'text-success' : 'text-danger'}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="receiverEmployee" label="ผู้รับเงิน" rules={getRules(['required'])}>
            <EmployeeSelector disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
