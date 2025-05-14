import React, { Fragment } from 'react';
import { Tag, Form, Input as AInput, Divider, Select, Button, Card } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';
import { Input } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { IncomeDailyCategories } from 'data/Constant';
import { isMobile } from 'react-device-detect';
import { SearchOutlined } from '@ant-design/icons';
import SelfBankSelector from 'components/SelfBankSelector';
import { showLog } from 'functions';
const { Option } = Select

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: 'วันที่',
    dataIndex: 'incomeDate',
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
  },
  {
    title: (<div className="text-center">เลขที่เอกสาร<br />รับเงิน</div>),
    dataIndex: 'incomeNo',
    width: 120
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'incomeSubCategory',
    render: txt => <a>{IncomeDailyCategories[txt]}</a>,
    width: 120
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    render: (_, record) => {
      return (<a>{`${record.prefix || ''}${record.firstName || ''} ${record.lastName || ''}`}</a>)
    },
    width: 200
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    width: 300,
    render: (arr) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {(arr || []).map((it, index) => (
          <Tag key={index} style={{ whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {it}
          </Tag>
        ))}
      </div>
    )
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'totalLoan',
    align: 'right'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
  },
];

export const expandedRowRender = (record) => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.receiveNo && <Tag>{`เลขที่ใบรับสินค้า: ${record.receiveNo}`}</Tag>}
    {record?.billNoSKC && <Tag>{`เลขที่ใบรับสินค้า: ${record.billNoSKC}`}</Tag>}
    {record?.branch && <Tag>{`สาขาที่รับสินค้า: ${record.branch}`}</Tag>}
    {record?.inputDate && (
      <Tag>{`วันที่คีย์: ${moment(record.inputDate, 'YYYY-MM-DD').format(
        'DD/MM/YYYY'
      )}`}</Tag>
    )}
    {record?.productCode && <Tag>{`รหัสสินค้า: ${record.productCode}`}</Tag>}
    {record?.vehicleNo && <Tag>{`หมายเลขรถ: ${record.vehicleNo}`}</Tag>}
    {record?.peripheralNo && (
      <Tag>{`เลขอุปกรณ์ต่อพ่วง: ${record.peripheralNo}`}</Tag>
    )}
  </div>
);

export const renderHeader = ({ handleUpdate, loading }) => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="3">
        <Form.Item name="incomeSubCategory" label="ประเภทการรับเงิน">
          <Select
            placeholder="ประเภทการรับเงิน"
            className="text-primary"
          >
            {Object.keys(IncomeDailyCategories).map((type, i) => (
              <Option
                key={i}
                value={type}
              // disabled={type === 'parts'}
              >{`${IncomeDailyCategories[type]}`}</Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="3">
        <Form.Item name="branchCode" label="สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="startDate" label="🔍  วันที่">
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <div style={{ marginTop: !isMobile ? 30 : 0 }}>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            type="primary"
            icon={loading ? undefined : <SearchOutlined />}
            loading={loading}
            size="middle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: 130
            }}
            className="mr-2"
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button></div>
      </Col>
    </Row>
  </div>
);

export const initAccountValues = {
  incomeDate: null,
  pLoanId: null,
  pLoanNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNo: null,
  branchCode: null,
  incomeSubCategory: null,
  item: [],
  totalLoan: null,
  payDate: null,
  amtReceived: null,
  selfBankId: null,
  bank: null,
  bankName: null,
  bankAcc: null,
  loanIncomeReceiver: null,
  remark: null,
};


export const renderPLoanBody = ({ values, grant = true, readOnly = false }) => {
  const prefix = values.prefix
    ? ['นาย', 'นาง', 'นางสาว', 'คุณ'].includes(values.prefix)
      ? values.prefix
      : `${values.prefix} `
    : '';
  return (
    <>
      <h5 className="text-primary mb-3">บันทึกข้อมูลการรับเงิน</h5>
      {/* Row 1: Document Number & Phone */}
      <Card >
        <Row>
          <Col md="4">
            <Form.Item name="incomeSubCategory" label="ประเภทสินค้า">
              <Select
                disabled
                placeholder="ประเภทการรับเงิน"
                className="text-primary"
              >
                {Object.keys(IncomeDailyCategories).map((type, i) => (
                  <Option
                    key={i}
                    value={type}
                  // disabled={type === 'parts'}
                  >{`${IncomeDailyCategories[type]}`}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md="4" />
        </Row>

        {/* Row 2: Customer Name Display */}
        <Row>
          <Col md="4">
            <Form.Item label="ลูกค้า">
              <h5>{`${prefix}${values.firstName || ''} ${values.lastName || ''}`}</h5>
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="phoneNumber" label="เบอร์โทร">
              <Input readOnly placeholder="012-3456789" />
            </Form.Item>
          </Col>
          <Col md="4" />
        </Row>

        {/* Row 3: Total & Item Tags */}
        <Row>
          <Col md="4">
            <Form.Item name="totalLoan" label="จำนวนเงิน">
              <Input placeholder="บาท" readOnly currency />
            </Form.Item>
          </Col>
          <Col md="8">
            <Form.Item label="รายการ">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(values.item || []).length === 0 ? (
                  <Tag color="default">ไม่มีรายการ</Tag>
                ) : (
                  (values.item || []).map((it, idx) => (
                    <Tag
                      key={idx}
                      style={{
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {it}
                    </Tag>
                  ))
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Divider className='text-primary'>บันทึกข้อมูล</Divider>
      <Card>
        {/* Row 4: Payment Date & Amount Received */}
        <Row gutter={[16, 16]}>
          <Col md="4">
            <Form.Item
              name="pLoanNo"
              label="เลขที่เอกสาร"
              rules={getRules(['required'])}
            >
              <Input
                placeholder="กรุณาป้อนเลขที่เอกสาร"
                disabled={!grant}
                readOnly={readOnly}
              />
            </Form.Item>
          </Col>
          <Col md={4}>
            <Form.Item
              name="payDate"
              label="วันที่รับเงิน"
              rules={getRules(['required'])}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col md={4}>
            <Form.Item
              name="amtReceived"
              label="จำนวนเงินที่ได้รับ"
              rules={getRules(['required'])}
            >
              <Input placeholder="บาท" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 5: Bank & Accounting Input */}
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Form.Item
              name="selfBankId"
              label="ธนาคาร"
              rules={getRules(['required'])}
            >
              <SelfBankSelector placeholder="ธนาคาร" />
            </Form.Item>
          </Col>
          <Col md={4}>
            <Form.Item
              name="loanIncomeReceiver"
              label="บันทึกข้อมูลโดย"
              rules={getRules(['required'])}
            >
              <EmployeeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 6: Remarks */}
        <Row gutter={[16, 16]}>
          <Col md={12}>
            <Form.Item name="remark" label="หมายเหตุ">
              <AInput.TextArea disabled={!grant} readOnly={readOnly} rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  )
}