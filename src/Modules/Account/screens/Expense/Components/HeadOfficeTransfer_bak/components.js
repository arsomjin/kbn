/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useCallback } from 'react';
import { Table, Popconfirm, Form, Tabs, Typography, Collapse } from 'antd';
import { showLog } from 'functions';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { DatePicker, Input } from 'elements';
import DealerSelector from 'components/DealerSelector';
import moment from 'moment';
import { tailLayout } from 'Modules/api';
import { TAB_WIDTH } from 'data/Constant';
import { ledgerColumns, ledgerInitItemValues } from './api';
import EditableCellTable from 'components/EditableCellTable';
import BankNameSelector from 'components/BankNameSelector';
import HiddenItem from 'components/HiddenItem';
import { CardFooter, Col, Row } from 'shards-react';
import { InputGroup, Button } from 'elements';
import { getRules } from 'api/Table';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import SelfBankSelector from 'components/SelfBankSelector';
import BranchSelector from 'components/BranchSelector';
import DepartmentSelector from 'components/DepartmentSelector';
import ExpenseNameSelector from 'components/ExpenseNameSelector';
import Footer from 'components/Footer';
import { useMergeState } from 'api/CustomHooks';
import { Numb } from 'functions';
import { TableSummary } from 'api/Table';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';

const { TabPane } = Tabs;
const { Text } = Typography;

const Tab1 = ({ record, branchCode, onUpdate }) => {
  const { bank, accNo, bankName } = record;

  const { user } = useSelector(state => state.auth);
  const { dealers } = useSelector(state => state.data);
  const [mBank] = useMergeState({
    bank,
    accNo,
    bankName: bankName || (dealers[record.receiver] ? dealers[record.receiver].dealerName : null)
  });
  const [form] = Form.useForm();

  const handleUpdate = useCallback(
    async mValues => {
      let values = JSON.parse(JSON.stringify(mValues));
      //  showLog('values', values);
      let bankInfo = {
        ...values,
        bankInfoEditTime: Date.now(),
        bankInfoEditBy: user.uid
      };
      //  showLog('bankInfo', bankInfo);
      onUpdate(bankInfo);
      // form.resetFields();
    },
    [onUpdate, user.uid]
  );

  return (
    <div style={{ width: TAB_WIDTH }}>
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={handleUpdate}
        initialValues={mBank}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
        size="small"
      >
        <Form.Item
          name="bank"
          label="ธนาคาร"
          rules={[
            {
              required: true,
              message: 'กรุณาป้อนธนาคาร'
            }
          ]}
        >
          <BankNameSelector placeholder="ธนาคาร" />
        </Form.Item>
        <Form.Item name="accNo" label="เลขที่บัญชี" rules={getRules(['required'])}>
          <Input placeholder="กรุณาป้อน เลขบัญชีธนาคาร" />
        </Form.Item>
        <Form.Item name="bankName" label="ชื่อบัญชี" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="ชื่อบัญชี" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button htmlType="button" onClick={() => form.resetFields()} className="mr-2 mt-2" size="middle">
            ล้างข้อมูล
          </Button>
          <Popconfirm
            title="บันทึกข้อมูล ?"
            onConfirm={() => form.submit()}
            onCancel={() => showLog('cancel')}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
          >
            <Button type="primary" className="mr-2 mt-2" size="middle">
              บันทึกข้อมูล
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </div>
  );
};

const renderLedgerInput = (form, values) => (
  <div className="bg-white">
    <HiddenItem name="whTax" />
    <Row>
      <Col md="6">
        <Form.Item name="transferDate" rules={getRules(['required'])}>
          <InputGroup
            spans={[10, 14]}
            addonBefore="วันที่โอนเงิน"
            inputComponent={props => <DatePicker {...props} />}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="selfBankId" rules={getRules(['required'])}>
          <InputGroup
            spans={[10, 14]}
            addonBefore="โอนจากธนาคาร"
            inputComponent={props => <SelfBankSelector {...props} />}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="payInNo" rules={getRules(['required'])}>
          <InputGroup spans={[10, 14]} addonBefore="เลขที่ใบ Pay-in" />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="expenseBranch">
          <InputGroup spans={[10, 14]} addonBefore="สาขา" inputComponent={props => <BranchSelector {...props} />} />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="department">
          <InputGroup
            spans={[10, 14]}
            addonBefore="แผนก"
            inputComponent={props => <DepartmentSelector style={{ width: '100%' }} {...props} />}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="expenseCategoryId" rules={getRules(['required'])}>
          <InputGroup
            spans={[10, 14]}
            addonBefore="หมวดรายจ่าย"
            inputComponent={props => <ExpenseCategorySelector placement="bottomRight" {...props} />}
            primary
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="expenseAccountNameId" rules={getRules(['required'])}>
          <InputGroup
            spans={[10, 14]}
            addonBefore="ชื่อบัญชี"
            inputComponent={props => <ExpenseNameSelector record={values} {...props} />}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="netTotal" rules={getRules(['required'])}>
          <InputGroup spans={[10, 10, 4]} addonBefore="จำนวนเงิน" addonAfter="บาท" currency />
        </Form.Item>
      </Col>
      {/* <Col md="6">
        <Form.Item name="hasWHTax" rules={getRules(['required'])}>
          <InputGroup
            spans={[10, 14]}
            addonBefore="หักภาษี ณ ที่จ่าย"
            inputComponent={(props) => <WithHoldingTaxSelector {...props} />}
          />
        </Form.Item>
      </Col> */}
    </Row>
    {/* <Row>
      <Col md="6">
        <Form.Item name="whTaxDoc">
          <InputGroup
            spans={[10, 14]}
            addonBefore="แบบแสดงภาษีหัก ณ ที่จ่าย"
            inputComponent={(props) => <WithHoldingTaxDocSelector {...props} />}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="whTax">
          <InputGroup
            spans={[10, 10, 4]}
            addonBefore="จำนวนเงินภาษีหัก ณ ที่จ่าย"
            addonAfter="บาท"
            currency
          />
        </Form.Item>
      </Col>
    </Row> */}
    <Footer
      onConfirm={() => form.submit()}
      onCancel={() => form.resetFields()}
      cancelText="ล้างข้อมูล"
      cancelPopConfirmText="ล้าง?"
      okPopConfirmText="ยืนยัน?"
      okText="เพิ่มรายการ"
      okIcon={<PlusOutlined />}
    />
  </div>
);

const renderLedgerSummary = (pageData, mData) => {
  if (mData.length === 0) {
    return null;
  }
  let totalExpense = 0;
  let totalWHTax = 0;

  pageData.forEach(({ total, whTax }) => {
    totalExpense += Numb(total);
    totalWHTax += Numb(whTax);
  });

  return (
    <>
      {/* <h6>สรุปรายการรับเงินทอน รายการจ่ายเงิน</h6> */}
      <Table.Summary.Row className="bg-light">
        <Table.Summary.Cell />
        <Table.Summary.Cell />
        <Table.Summary.Cell />
        <Table.Summary.Cell />
        <Table.Summary.Cell />
        <Table.Summary.Cell>
          <div style={{ textAlign: 'right' }}>
            <Text>รวมเงิน</Text>
          </div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: 'center' }}>
            <Text className="text-primary">{numeral(totalExpense).format('0,0.00')}</Text>
          </div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>บาท</Table.Summary.Cell>
        <Table.Summary.Cell />
        <Table.Summary.Cell>
          <div style={{ textAlign: 'right' }}>
            <span>
              <Text className="text-primary">{`${numeral(totalWHTax).format('0,0.00')}   `}</Text>
              <Text className="text-light">บาท</Text>
            </span>
          </div>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </>
  );
};

const Tab2 = ({ record, branchCode, expenseNames, onUpdate, loading }) => {
  const [form] = Form.useForm();
  const [mData, setData] = useState(
    record.ledgerRecords
      ? record.ledgerRecords.map((l, id) => ({
          ...l,
          id,
          key: id
        }))
      : []
  );

  const _onAddConfirm = val => {
    let newData = [...mData, { ...val, id: mData.length, key: mData.length }];
    newData = updateDataArr(newData);
    setData(newData);
    form.resetFields();
  };

  const _onUpdate = async row => {
    let newData = [...mData];
    const index = newData.findIndex(item => row.key === item.key);

    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
    } else {
      newData.push(row);
    }
    newData = updateDataArr(newData);
    setData(newData);
  };

  const updateDataArr = dArr => {
    let result = dArr.map((it, i) => {
      // if (it.total) {
      //   const whTax = getWHTax(Number(it.total), it.priceType, it.hasWHTax);
      //   it.whTax = whTax;
      // }
      return it;
    });
    return result;
  };

  const _onDelete = async key => {
    let newData = [...mData];
    const index = newData.findIndex(item => key === item.key);
    if (index > -1) {
      const item = newData[index];
      if (newData[index]._key) {
        newData.splice(index, 1, { ...item, deleted: true });
      } else {
        newData = newData.filter(l => l.key !== key);
      }
    } else {
      newData = newData.filter(l => l.key !== key);
      newData = newData.map((l, n) => ({ ...l, key: n, id: n }));
    }
    // showLog({ newData });
    setData(newData);
  };

  const _onConfirm = () => {
    // showLog('confirm_ledger', mData);
    onUpdate(mData);
  };

  return (
    <div>
      <Form
        form={form}
        initialValues={{
          ...ledgerInitItemValues,
          netTotal: record.netTotal ? numeral(record.netTotal).format('0.00') : null
        }}
        layout="vertical"
        size="small"
        onFinish={_onAddConfirm}
      >
        {values => {
          //  showLog({ values });
          return (
            <Collapse className="mb-3">
              <Collapse.Panel header="บันทึกข้อมูล" key="1">
                {renderLedgerInput(form, values)}
              </Collapse.Panel>
            </Collapse>
          );
        }}
      </Form>
      <EditableCellTable
        columns={ledgerColumns}
        dataSource={mData.map((l, id) => ({
          ...l,
          id,
          key: id
        }))}
        onDelete={_onDelete}
        onUpdate={_onUpdate}
        pagination={false}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={ledgerColumns.length} startAt={5} sumKeys={['netTotal']} />
        )}
        loading={loading}
      />
      <CardFooter className="d-flex justify-content-end m-3">
        <Popconfirm
          title="บันทึกข้อมูล ?"
          onConfirm={() => _onConfirm()}
          onCancel={() => showLog('cancel')}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
          disabled={mData.length === 0}
        >
          <Button
            type="primary"
            size="middle"
            icon={<CheckOutlined />}
            disabled={mData.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {'บันทึกข้อมูล'}
          </Button>
        </Popconfirm>
      </CardFooter>
    </div>
  );
};

const Tab3 = ({ record, branchCode, onUpdate }) => {
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const data = record?.taxInvoiceInfo ? record.taxInvoiceInfo : {};

  const handleUpdate = useCallback(
    async mValues => {
      let values = JSON.parse(JSON.stringify(mValues));
      //  showLog('values', values);
      let expense = {
        ...values,
        taxInvoiceDate: moment(values.taxInvoiceDate).format('YYYY-MM-DD'),
        time: Date.now(),
        inputBy: user.uid
      };
      //  showLog('expense', expense);
      onUpdate(expense);
      // form.resetFields();
    },
    [onUpdate, user.uid]
  );

  return (
    <div style={{ width: TAB_WIDTH }}>
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={handleUpdate}
        initialValues={{
          taxInvoiceDate: data?.taxInvoiceDate || moment().format('YYYY-MM-DD'),
          taxInvoiceNo: data?.taxInvoiceNo || null,
          dealer: data?.dealer || record.receiver || null,
          beforeVAT: record.beforeVAT,
          VAT: record.VAT,
          total: Numb(record.beforeVAT) + Numb(record.VAT),
          remark: data?.remark || null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
        size="small"
      >
        <Form.Item
          name="taxInvoiceNo"
          label="เลขที่ใบกำกับภาษี/ใบเสร็จรับเงิน"
          rules={[
            {
              required: true,
              message: 'กรุณาป้อนเลขที่ใบกำกับภาษี/ใบเสร็จรับเงิน'
            }
          ]}
        >
          <Input placeholder="เลขที่ใบกำกับภาษี/ใบเสร็จรับเงิน" />
        </Form.Item>
        <Form.Item name="taxInvoiceDate" label="วันที่เอกสาร" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <DatePicker placeholder="วันที่เอกสาร" />
        </Form.Item>
        <Form.Item name="dealer" label="ชื่อผู้จำหน่าย" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <DealerSelector placeholder="ชื่อผู้จำหน่าย" />
        </Form.Item>
        <Form.Item
          name="beforeVAT"
          label="จำนวนเงินก่อนหักภาษี"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <Input currency placeholder="จำนวนเงินก่อนหักภาษี" />
        </Form.Item>
        <Form.Item name="VAT" label="ภาษีมูลค่าเพิ่ม" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input currency placeholder="ภาษีมูลค่าเพิ่ม" />
        </Form.Item>
        <Form.Item name="total" label="รวมจำนวนเงินทั้งสิ้น" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input currency placeholder="รวมจำนวนเงินทั้งสิ้น" />
        </Form.Item>
        <Form.Item name="remark" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button htmlType="button" onClick={() => form.resetFields()} className="mr-2 mt-2" size="middle">
            รีเซ็ตข้อมูล
          </Button>
          <Popconfirm
            title="บันทึกข้อมูล ?"
            onConfirm={() => form.submit()}
            onCancel={() => showLog('cancel')}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
          >
            <Button type="primary" className="mr-2 mt-2" size="middle">
              บันทึกข้อมูล
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </div>
  );
};

class ExpenseHQ extends React.Component {
  constructor(props) {
    super(props);
    //  showLog('ExpandedTable props', this.props);
    const { record } = this.props;
    this.state = {
      dataSource: record.ledgerRecords ? record.ledgerRecords.map((l, id) => ({ ...l, id, key: id })) : [],
      count: 0,
      editingKey: '',
      taxInvoiceInfo: record?.taxInvoiceInfo || {},
      bankInfo: {
        bank: record?.bank || null,
        accNo: record?.accNo || null,
        bankName: record?.bankName || null
      },
      ready: true
    };
    this.priceType = record.priceType;
  }

  isEditing = record => record._key === this.state.editingKey;

  render() {
    const { ready } = this.state;
    return (
      <Tabs type="card" style={{ height: '100%' }}>
        <TabPane tab="บันทึกแยกประเภทบัญชี" key="1" style={{ minHeight: '100vh' }}>
          <Tab2
            record={this.props.record}
            branchCode={this.props.branchCode}
            onUpdate={this.props.handleLedgerRecordsUpdate.bind(this)}
            expenseNames={this.props.expenseNames}
            loading={!ready}
          />
        </TabPane>
        <TabPane tab="ใบกำกับภาษี/ใบเสร็จรับเงิน" key="2">
          <Tab3
            record={this.props.record}
            branchCode={this.props.branchCode}
            onUpdate={this.props.handleInvoiceUpdate.bind(this)}
          />
        </TabPane>
        <TabPane tab="เลขที่บัญชี" key="3">
          <Tab1 record={this.props.record} onUpdate={this.props.handleBankInfoUpdate.bind(this)} />
        </TabPane>
      </Tabs>
    );
  }
}

export default ExpenseHQ;
