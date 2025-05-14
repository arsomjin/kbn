import React from 'react';
import { Form } from 'antd';
import { getRules } from 'api/Table';
import { InputGroup } from 'elements';
import { Row, Col } from 'shards-react';
import DepartmentSelector from 'components/DepartmentSelector';
import { Input } from 'elements';
import HiddenItem from 'components/HiddenItem';
import EmployeeSelector from 'components/EmployeeSelector';
import { DatePicker } from 'elements';

export const initItem = {
  incomeId: null,
  senderEmployee: null,
  receiverEmployee: null,
  date: undefined,
  incomeDate: undefined,
  department: null,
  item: null,
  total: null,
  remark: null,
  branchCode: null,
};

export const getInitItem = (order) => {
  return {
    ...initItem,
    incomeId: order?.incomeId,
  };
};

export const getColumns = (isEdit) => [
  // export const columns = [
  {
    title: 'ลำดับที่',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'พนักงานส่งเงิน',
    dataIndex: 'senderEmployee',
    editable: !isEdit,
    required: true,
    ellipsis: true,
  },
  {
    title: 'ผู้รับเงิน',
    dataIndex: 'receiverEmployee',
    editable: !isEdit,
    required: true,
    ellipsis: true,
  },
  {
    title: 'รายรับวันที่',
    dataIndex: 'incomeDate',
    editable: !isEdit,
    required: true,
    width: 180,
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    editable: !isEdit,
    required: true,
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    editable: true,
    required: true,
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    editable: !isEdit,
    required: true,
    number: true,
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true,
  },
];

export const renderInput = () => {
  return (
    <div className="bg-white">
      <HiddenItem name="incomeId" />
      <Row>
        <Col md="6">
          <Form.Item name="senderEmployee" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="พนักงานส่งเงิน"
              inputComponent={(props) => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="receiverEmployee" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ผู้รับเงิน"
              inputComponent={(props) => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="incomeDate" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="รายรับวันที่"
              inputComponent={(props) => <DatePicker {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="department" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="แผนก"
              inputComponent={(props) => <DepartmentSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="item" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รายการ" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup
              spans={[12, 8, 4]}
              addonBefore="จำนวนเงิน"
              addonAfter="บาท"
              alignRight
              primary
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="12" className="d-flex flex-row ">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: '100%' }}>
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
