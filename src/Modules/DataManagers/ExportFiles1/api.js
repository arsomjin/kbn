import { Form } from 'antd';
import { getRules } from 'api/Table';
import { InputGroup } from 'elements';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

export const renderInput = () => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="vehicleRegNumber" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="เลขทะเบียนรถ" alignRight />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="gasCost" rules={getRules(['required'])}>
            <InputGroup spans={[12, 8, 4]} addonBefore="ค่าน้ำมัน" addonAfter="บาท" alignRight primary />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="origin" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="ต้นทาง" alignRight />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="destination" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="ปลายทาง" alignRight />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="meterStart" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="มิเตอร์ - เริ่มต้น" alignRight />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="meterEnd" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="มิเตอร์ - สิ้นสุด" alignRight />
          </Form.Item>
        </Col>
      </Row>
    </CardBody>
  );
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เลขทะเบียนรถ',
    dataIndex: 'vehicleRegNumber',
    align: 'center'
  },
  {
    title: 'ค่าน้ำมัน',
    dataIndex: 'gasCost'
  },
  {
    title: 'ระยะทาง (ก.ม.)',
    dataIndex: 'distance',
    editable: true
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'origin'
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'destination'
  }
];
