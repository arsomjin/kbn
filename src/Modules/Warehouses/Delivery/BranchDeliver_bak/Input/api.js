import React from 'react';
import { Form } from 'antd';
import { Row, Col } from 'shards-react';
import { DatePicker, Input } from 'elements';
import { InputGroup } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';

export const initValues = {
  productCode: null,
  vehicleNo: null,
  peripheralNo: null,
  engineNo: null,
  pressureBladeNo: null,
  bucketNo: null,
  sugarcanePickerNo: null,
  remark: null,
  deliverDate: undefined,
  sender: null,
  recordedBy: null,
  branchCode: null,
  deliverType: 'branchDelivery'
};

export const renderInput = values => {
  return (
    <div>
      <div className="border p-3">
        <label className="text-muted">{`ข้อมูลรถ ${values.productCode ? `- ${values.productCode}` : ''}`}</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item
              name="productCode"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore="รุ่นรถ" alignRight primary vehicle placeholder="รุ่นรถ" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="vehicleNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขรถ" placeholder="เลขรถ" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="engineNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขเครื่อง" placeholder="เลขเครื่อง" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="peripheralNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขอุปกรณ์ต่อพ่วง" placeholder="หมายเลขอุปกรณ์ต่อพ่วง" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="pressureBladeNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขใบดัน" placeholder="เลขใบดัน" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="bucketNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขบุ้งกี๋" placeholder="หมายเลขบุ้งกี๋" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="sugarcanePickerNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขคีบอ้อย" placeholder="หมายเลขคีบอ้อย" />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div className="border mt-3 p-3 bg-light">
        <label className="text-muted">ข้อมูลการนัดหมาย</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item name="branchCode">
              <InputGroup spans={[10, 14]} addonBefore="สาขา" branch />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="sender" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้ส่ง"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <Form.Item
              name="deliverDate"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="วันที่จัดส่ง"
                placeholder="วันที่จัดส่ง"
                inputComponent={props => <DatePicker {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="recordedBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้แจ้ง"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="remark" label="หมายเหตุ" className="d-flex flex-row">
              <Input placeholder="หมายเหตุ" className="ml-3" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
};
