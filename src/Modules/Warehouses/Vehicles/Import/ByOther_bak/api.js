import { Form } from 'antd';
import { getRules } from 'api/Table';
import CommonSelector from 'components/CommonSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import { OtherVehicleImportType } from 'data/Constant';
import { Input } from 'elements';
import { InputGroup } from 'elements';
import moment from 'moment';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

export const getInitialValues = user => {
  return {
    branchCode: user?.branch || '0450',
    date: moment(),
    docNo: null,
    importType: null,
    productCode: null,
    productName: null,
    vehicleNo: null,
    engineNo: null,
    peripheralNo: null,
    pressureBladeNo: null,
    bucketNo: null,
    sugarcanePickerNo: null,
    recordedBy: null,
    remark: null
  };
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
  },
  {
    title: 'ประเภท',
    dataIndex: 'importType',
    align: 'center'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'productCode'
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo'
  },
  {
    title: 'หมายเลขอุปกรณ์ต่อพ่วง',
    dataIndex: 'peripheralNo'
  },
  {
    title: 'เลขใบดัน',
    dataIndex: 'pressureBladeNo'
  },
  {
    title: 'หมายเลขบุ้งกี๋',
    dataIndex: 'bucketNo'
  },
  {
    title: 'หมายเลขคีบอ้อย',
    dataIndex: 'sugarcanePickerNo'
  },
  {
    title: 'รับสินค้าโดย',
    dataIndex: 'recordedBy'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const renderInput = values => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="docNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="importType" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภท"
              inputComponent={props => (
                <CommonSelector {...props} optionData={OtherVehicleImportType} placeholder="ประเภทการรับรถ" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
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
            <InputGroup spans={[10, 14]} addonBefore="รหัสสินค้า" alignRight primary vehicle placeholder="รหัสสินค้า" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="productName">
            <InputGroup spans={[10, 14]} addonBefore="ชื่อสินค้า" placeholder="ชื่อสินค้า" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
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
        <Col md="6">
          <Form.Item name="pressureBladeNo">
            <InputGroup spans={[10, 14]} addonBefore="เลขใบดัน" placeholder="เลขใบดัน" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="bucketNo">
            <InputGroup spans={[10, 14]} addonBefore="หมายเลขบุ้งกี๋" placeholder="หมายเลขบุ้งกี๋" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="sugarcanePickerNo">
            <InputGroup spans={[10, 14]} addonBefore="หมายเลขคีบอ้อย" placeholder="หมายเลขคีบอ้อย" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="recordedBy" label="รับสินค้าโดย">
            <EmployeeSelector />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="remark" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </CardBody>
  );
};
