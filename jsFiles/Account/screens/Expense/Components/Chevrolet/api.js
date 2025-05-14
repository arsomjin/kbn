import React from 'react';
import { Form } from 'antd';
import moment from 'moment';
import { getRules } from 'api/Table';
import { InputGroup } from 'elements';
import { Row, Col } from 'shards-react';
import DepartmentSelector from 'components/DepartmentSelector';
import { Input } from 'elements';
import HiddenItem from 'components/HiddenItem';
import EmployeeSelector from 'components/EmployeeSelector';
import PriceTypeSelector from 'components/PriceTypeSelector';
import ExpenseNameSelector from 'components/ExpenseNameSelector';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import DealerSelector from 'components/DealerSelector';

export const initItem = {
  payer: null,
  expenseCategoryId: null,
  expenseName: null,
  total: null,
  balance: null,
  expenseAccountNameId: null,
  VAT: null,
  discount: null,
  dealer: null,
  department: null,
  remark: null,
  priceType: 'includeVat',
  taxInvoiceNo: null,
};

export const initValues = {
  expenseId: null,
  branchCode: null,
  date: moment().format('YYYY-MM-DD'),
  changeDeposit: [],
  expenseType: 'dailyChange',
  time: Date.now(),
  total: null,
  billTotal: null,
  receiverEmployee: null,
};

export const getInitValues = (order) => {
  return {
    ...initValues,
    ...order,
  };
};

export const getInitItem = (branchCode, date) => {
  return {
    ...initItem,
    branchCode,
    date,
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

export const renderInput = (values, grant, readOnly) => {
  return (
    <div className="bg-white">
      <HiddenItem name="balance" />
      <HiddenItem name="VAT" />
      <Row>
        <Col md="4">
          <Form.Item name="payer" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="พนักงานผู้เบิกเงิน"
              inputComponent={(props) => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="expenseCategoryId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="หมวดรายจ่าย"
              inputComponent={(props) => <ExpenseCategorySelector {...props} />}
              primary
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="expenseName" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รายการ" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="department" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="แผนก"
              inputComponent={(props) => <DepartmentSelector {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore="รายจ่าย"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="priceType" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทราคา"
              inputComponent={(props) => (
                <PriceTypeSelector style={{ width: '100%' }} {...props} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="expenseAccountNameId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ชื่อบัญชี"
              inputComponent={(props) => (
                <ExpenseNameSelector record={values} {...props} />
              )}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="taxInvoiceNo">
            <InputGroup
              spans={[10, 14]}
              addonBefore="เลขที่บิล"
              alignRight
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="dealer">
            <InputGroup
              spans={[10, 14]}
              addonBefore="ชื่อผู้จำหน่าย"
              inputComponent={(props) => <DealerSelector {...props} />}
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
