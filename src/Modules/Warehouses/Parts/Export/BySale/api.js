import { Form } from 'antd';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import DocSelector from 'components/DocSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import { giveAwayInputColumns } from 'data/Constant';
import { Input } from 'elements';
import { InputGroup } from 'elements';
import moment from 'moment';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

export const getInitialValues = user => {
  return {
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    date: moment(),
    docNo: null,
    exportType: 'saleOut',
    toDestination: null,
    productCode: null,
    productName: null,
    vehicleNo: null,
    engineNo: null,
    peripheralNo: null,
    pressureBladeNo: null,
    bucketNo: null,
    sugarcanePickerNo: null,
    giveaways: [],
    remark: null,
    saleNo: null,
    saleId: null,
    recordedBy: null
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
    title: 'เลขที่ใบขายสินค้า',
    dataIndex: 'saleNo',
    align: 'center'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'productNo'
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
    title: 'ของแถม',
    dataIndex: 'giveaways'
  },
  {
    title: 'จ่ายสินค้าโดย',
    dataIndex: 'recordedBy'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const renderInput = (values, form) => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="docNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="saleNo" label="🔍  เลขที่ใบขายสินค้า" rules={getRules(['required'])}>
            <DocSelector
              collection="sections/sales/vehicles"
              orderBy={['saleNo', 'firstName']}
              labels={['saleNo', 'firstName', 'lastName']}
              wheres={[
                ['ivAdjusted', '==', false],
                ['branchCode', '==', values.branchCode]
              ]}
              size="small"
              hasKeywords
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="productCode" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รุ่นรถ" primary vehicle placeholder="รุ่นรถ" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="productName">
            <InputGroup spans={[10, 14]} addonBefore="ชื่อ" placeholder="ชื่อ" readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item
            name="vehicleNo"
            rules={[
              {
                required: !(values.productCode || values.peripheralNo),
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
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
          <Form.Item
            name="peripheralNo"
            rules={[
              {
                required: !(values.productCode || values.peripheralNo),
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
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
          <Form.Item label="ของแถม">
            <ArrayInput name="giveaways" columns={giveAwayInputColumns} form={form} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="recordedBy" label="จ่ายสินค้าโดย">
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
