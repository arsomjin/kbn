import React from 'react';
import { Form } from 'antd';
import { getRules } from '@/api/Table';
import { InputGroup } from '@/components/elements';
import { Row, Col } from 'antd';
import { Input } from '@/components/elements';
import HiddenItem from '@/components/HiddenItem';
import EmployeeSelector from '@/components/EmployeeSelector';
import { DatePicker } from '@/components/elements';
import SelfBankSelector from '@/components/SelfBankSelector';
import { dateToThai } from '@/utils/date';
import { DateTime } from 'luxon';
import { BankDepositItem } from './types';

export const initItem: BankDepositItem = {
  depositId: '',
  date: DateTime.now().toFormat('yyyy-MM-dd'),
  depositDate: '',
  branchCode: '',
  depositor: '',
  selfBankId: '',
  total: 0,
  remark: '',
  deleted: false
};

export const getInitItem = (order?: Partial<BankDepositItem>): BankDepositItem => {
  return {
    ...initItem,
    depositId: order?.depositId || ''
  };
};

export const getColumns = (isEdit: boolean) => [
  {
    title: 'ลำดับที่',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center' as const
  },
  {
    title: 'วันที่บันทึก',
    dataIndex: 'date',
    editable: !isEdit,
    required: true,
    width: 120,
    render: (text: string) => <div className="text-center">{text ? dateToThai(text) : '-'}</div>
  },
  {
    title: 'วันที่ฝากเงิน',
    dataIndex: 'depositDate',
    editable: !isEdit,
    required: true,
    width: 120,
    render: (text: string) => <div className="text-center">{text ? dateToThai(text) : '-'}</div>
  },
  {
    title: <div className="text-center">พนักงานผู้นำฝากเงิน</div>,
    dataIndex: 'depositor',
    width: 180
  },
  {
    title: 'ธนาคาร',
    dataIndex: 'selfBankId',
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
        <Col md={4}>
          <Form.Item name="depositDate" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="วันที่ฝากเงิน"
              inputComponent={(props: any) => <DatePicker {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item name="depositor" rules={getRules(['required'])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="พนักงานผู้นำฝากเงิน"
              inputComponent={(props: any) => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup spans={[8, 12, 4]} addonBefore="จำนวนเงิน" addonAfter="บาท" alignRight primary />
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item name="selfBankId" rules={getRules(['required'])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="ธนาคาร"
              inputComponent={(props: any) => <SelfBankSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md={12} className="d-flex flex-row">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: '90%' }}>
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}; 