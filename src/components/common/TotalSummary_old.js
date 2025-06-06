import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { Input } from 'elements';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import PaymentTypeSelector from 'components/PaymentTypeSelector';
import SelfBankSelector from 'components/SelfBankSelector';
import { useSelector } from 'react-redux';

export const TotalSummary = ({ values, depositorName, grant, netIncome, readOnly, hasThirdPayment }) => {
  const { allEmployees } = useSelector(state => state.data);
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
              disabled={true}
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
      <Row form className="bg-white">
        <Col md="4">
          <Form.Item
            name="paymentType1"
            label="วิธีชำระเงิน 1"
            rules={[
              {
                required: true,
                message: 'กรุณาป้อนประเภทการชำระเงิน'
              }
            ]}
          >
            <PaymentTypeSelector disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="payAmount1" label="จำนวนเงิน">
            <Input placeholder="จำนวนเงิน" addonAfter="บาท" currency disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        {values.paymentType1 === 'transfer' && (
          <Col md="4">
            <Form.Item
              name="bankAcc1"
              label="ธนาคาร"
              rules={[
                {
                  required: values.paymentType1 === 'transfer' && values.payAmount1,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <SelfBankSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Row form className="bg-white">
        <Col md="4">
          <Form.Item name="paymentType2" label="วิธีชำระเงิน 2">
            <PaymentTypeSelector disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="payAmount2" label="จำนวนเงิน">
            <Input placeholder="จำนวนเงิน" addonAfter="บาท" currency disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        {values.paymentType2 === 'transfer' && (
          <Col md="4">
            <Form.Item
              name="bankAcc2"
              label="ธนาคาร"
              rules={[
                {
                  required: values.paymentType2 === 'transfer' && values.payAmount2,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <SelfBankSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        )}
      </Row>
      {hasThirdPayment && (
        <Row form className="bg-white">
          <Col md="4">
            <Form.Item name="paymentType3" label="วิธีชำระเงิน 3">
              <PaymentTypeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="payAmount3" label="จำนวนเงิน">
              <Input placeholder="จำนวนเงิน" addonAfter="บาท" currency disabled={!grant} readOnly={readOnly} />
            </Form.Item>
          </Col>
          {values.paymentType3 === 'transfer' && (
            <Col md="4">
              <Form.Item
                name="bankAcc3"
                label="ธนาคาร"
                rules={[
                  {
                    required: values.paymentType3 === 'transfer' && values.payAmount3,
                    message: 'กรุณาป้อนข้อมูล'
                  }
                ]}
              >
                <SelfBankSelector disabled={!grant || readOnly} />
              </Form.Item>
            </Col>
          )}
        </Row>
      )}
      <Row>
        {(values.paymentType1 === 'transfer' ||
          values.paymentType2 === 'transfer' ||
          (hasThirdPayment && values.paymentType3 === 'transfer')) && (
          <Col md="4">
            <Form.Item
              name={depositorName || 'depositor'}
              label="ชื่อผู้โอน/ฝากเงิน"
              rules={[
                {
                  required:
                    values.paymentType1 === 'transfer' ||
                    values.paymentType2 === 'transfer' ||
                    (hasThirdPayment && values.paymentType3 === 'transfer'),
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              {values[depositorName || 'depositor'] && !allEmployees[values[depositorName || 'depositor']] ? (
                <Input disabled={!grant} readOnly={readOnly} />
              ) : (
                <EmployeeSelector disabled={!grant || readOnly} allowNotInList />
              )}
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
};
