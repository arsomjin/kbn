import { Form, Radio } from 'antd';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import ModelSelector from 'components/ModelSelector';
import { Input } from 'elements';
import { InputGroup } from 'elements';
import React from 'react';
import { Row, Col } from 'shards-react';

export const InitValue = {
  branchCode: null,
  date: undefined,
  productCode: null,
  chassisNumber: null,
  engineNo: null,
  receiveDate: undefined,
  isDecal: false,
  isUsed: false,
  isTakeOut: false,
  picker: null,
  remark: null
};

export const getInitialValues = (user, order) => {
  if (order && order.created) {
    return {
      ...InitValue,
      ...order
    };
  }
  let mBranch = order && order.branchCode ? order.branchCode : user.branch || '0450';
  return {
    ...InitValue,
    docId: order?.docId,
    branchCode: mBranch
  };
};

export const getData = pCode =>
  new Promise(async (r, j) => {
    try {
      r([]);
    } catch (e) {
      j(e);
    }
  });

export const renderInput = values => {
  return (
    <div className="bg-white px-3">
      <Row>
        <Col md="6">
          <Form.Item name="isUsed">
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทรถ"
              inputComponent={props => (
                <Radio.Group className="px-3" {...props}>
                  <Radio value={false}>ใหม่</Radio>
                  <Radio value={true}>มือสอง</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="productCode" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รุ่น" inputComponent={props => <ModelSelector {...props} />} />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="chassisNumber" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขตัวถัง" alignRight />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="engineNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขเครื่อง" alignRight />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="receiveDate">
            <InputGroup spans={[10, 14]} addonBefore="วันที่รับ" date />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="isDecal" className="border">
            <InputGroup
              spans={[10, 14]}
              addonBefore="การลอกลาย"
              inputComponent={props => (
                <Radio.Group className="px-3" {...props}>
                  <Radio value={true}>ลอกลายแล้ว</Radio>
                  <Radio value={false}>ยังไม่ลอก</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="isTakeOut" className="border">
            <InputGroup
              spans={[10, 14]}
              addonBefore="เบิกลอกลาย"
              inputComponent={props => (
                <Radio.Group className="px-3" {...props}>
                  <Radio value={true}>เบิกแล้ว</Radio>
                  <Radio value={false}>ยังไม่เบิก</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="picker" rules={[{ required: values.isTakeOut, message: 'กรุณาป้อนข้อมูล' }]}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ผู้เบิก"
              inputComponent={props => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="remark" label="หมายเหตุ">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'productCode',
    align: 'center'
  },
  {
    title: 'เลขตัวถัง',
    dataIndex: 'chassisNumber'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo'
  },
  {
    title: 'วันที่รับ',
    dataIndex: 'receiveDate'
  },
  {
    title: 'ลอกลายแล้ว',
    dataIndex: 'isDecal'
  },
  {
    title: 'เบิกแล้ว',
    dataIndex: 'isTakeOut'
  },
  {
    title: 'ผู้เบิก',
    dataIndex: 'picker'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];
