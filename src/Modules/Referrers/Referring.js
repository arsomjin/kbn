import React from 'react';
import { Form } from 'antd';
import { Row, Col } from 'shards-react';
import { getRules } from 'api/Table';
import BankNameSelector from 'components/BankNameSelector';
import BranchSelector from 'components/BranchSelector';
import { DatePicker } from 'elements';
import { Input, InputGroup } from 'elements';

export default ({ hasReferrer, grant, readOnly }) => (
  <div className="border p-3 bg-light mb-3">
    {/* <label className="text-muted">รายละเอียดค่าแนะนำ</label> */}
    <Row>
      <Col md="4">
        <Form.Item
          name={['referringDetails', 'relationship']}
          rules={!hasReferrer ? undefined : [...getRules(['required'])]}
          label="ความสัมพันธ์กับผู้ออกรถ"
        >
          <Input disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item label="สาขาที่ขอเบิกค่าแนะนำ" name={['referringDetails', 'branchCode']}>
          <BranchSelector disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item label="วันที่" name={['referringDetails', 'date']}>
          <DatePicker disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6" className="border-right">
        <Form.Item name="amtReferrer" rules={!hasReferrer ? undefined : [...getRules(['number', 'required'])]}>
          <InputGroup
            spans={[10, 10, 4]}
            addonBefore="จำนวนเงินค่าแนะนำ"
            disabled={!grant || readOnly}
            currency
            addonAfter="บาท"
          />
        </Form.Item>
        <Form.Item name={['referringDetails', 'whTax']}>
          <InputGroup spans={[10, 10, 4]} addonBefore="หักภาษี ณ ที่จ่าย" disabled currency addonAfter="บาท" />
        </Form.Item>
        <Form.Item name={['referringDetails', 'total']} rules={!hasReferrer ? undefined : [...getRules(['number'])]}>
          <InputGroup spans={[10, 10, 4]} addonBefore="จำนวนเงินสุทธิ" disabled currency addonAfter="บาท" />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item
          name={['referringDetails', 'bankName']}
          // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
        >
          <InputGroup spans={[10, 14]} addonBefore="ชื่อบัญชีธนาคาร" disabled={!grant || readOnly} />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'bank']}
          // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ธนาคาร"
            inputComponent={props => <BankNameSelector {...props} />}
            disabled={!grant || readOnly}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'bankAcc']}
          // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
        >
          <InputGroup spans={[10, 14]} addonBefore="เลขที่บัญชี" disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
    </Row>
  </div>
);
