import React from 'react';
import { Form } from 'antd';
import { getRules } from 'api/Table';
import { InputGroup } from 'elements';
import { Row, Col } from 'shards-react';
import { Input } from 'elements';
import HiddenItem from 'components/HiddenItem';
import EmployeeSelector from 'components/EmployeeSelector';
import { DatePicker } from 'elements';
import { dateToThai } from 'functions';
import dayjs from 'dayjs';
import ExecutiveSelector from 'components/ExecutiveSelector';

export const initItem = {
  depositId: null,
  date: dayjs().format('YYYY-MM-DD'),
  depositDate: undefined,
  branchCode: null,
  depositor: null,
  selfBankId: null,
  total: null,
  remark: null,
  deleted: false
};

export const getInitItem = order => {
  return {
    ...initItem,
    depositId: order?.depositId
  };
};

export const getColumns = isEdit => [
  // export const columns = [
  {
    title: 'ลำดับที่',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'วันที่บันทึก',
    dataIndex: 'date',
    editable: !isEdit,
    required: true,
    width: 120,
    render: text => <div className="text-center">{text ? dateToThai(text) : '-'}</div>
  },
  {
    title: 'วันที่ฝากเงิน',
    dataIndex: 'depositDate',
    editable: !isEdit,
    required: true,
    width: 120,
    render: text => <div className="text-center">{text ? dateToThai(text) : '-'}</div>
  },
  {
    title: <div className="text-center">พนักงานผู้นำฝากเงิน</div>,
    dataIndex: 'depositor',
    width: 180
  },
  {
    title: 'ผู้บริหาร',
    dataIndex: 'executiveId',
    editable: !isEdit,
    required: true,
    ellipsis: true,
    width: 240
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    editable: !isEdit,
    required: true,
    number: true
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true
  }
];

export const renderInput = () => {
  return (
    <div className="bg-white">
      <HiddenItem name="depositId" />
      <HiddenItem name="deleted" />
      <Row>
        <Col md="4">
          <Form.Item name="depositDate" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="วันที่ฝากเงิน"
              inputComponent={props => <DatePicker {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="8">
          <Form.Item name="depositor" rules={getRules(['required'])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="พนักงานผู้นำฝากเงิน"
              inputComponent={props => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup spans={[8, 12, 4]} addonBefore="จำนวนเงิน" addonAfter="บาท" alignRight primary />
          </Form.Item>
        </Col>
        <Col md="8">
          <Form.Item name="executiveId" rules={getRules(['required'])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="ผู้บริหาร/ผู้รับฝาก"
              inputComponent={props => <ExecutiveSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="12" className="d-flex flex-row ">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: '90%' }}>
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
