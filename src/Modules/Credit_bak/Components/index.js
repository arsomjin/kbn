import React from 'react';
import { Tag, Form, Collapse } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';
import DocSelector from 'components/DocSelector';
import { Numb } from 'functions';
import SaleViewer from 'Modules/Sales/Vehicles/SaleViewer';
import { Input } from 'elements';
import { InputGroup } from 'elements';
import BankNameSelector from 'components/BankNameSelector';
import ReferringFooter from 'Modules/Referrers/ReferringFooter';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่ส่งมอบรถ',
    dataIndex: 'deliverDate'
  },
  {
    title: 'วันที่บันทึก',
    dataIndex: 'created',
    align: 'center',
    render: txt => <div>{moment.tz(txt, 'Asia/Bangkok').format('D/MM/YYYY HH:mm:ss')}</div>,
    width: 180,
    // defaultSortOrder: 'descend',
    sorter: (a, b) => a.created - b.created
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo'
  },
  {
    title: 'ประเภท',
    dataIndex: 'saleType'
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo'
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralNo'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode'
  },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName'
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName'
  },
  {
    title: 'ราคาสินค้า',
    dataIndex: 'amtFull'
  }
];

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.receiveNo && <Tag>{`เลขที่ใบรับสินค้า: ${record.receiveNo}`}</Tag>}
    {record?.billNoSKC && <Tag>{`เลขที่ใบรับสินค้า: ${record.billNoSKC}`}</Tag>}
    {record?.branch && <Tag>{`สาขาที่รับสินค้า: ${record.branch}`}</Tag>}
    {record?.inputDate && <Tag>{`วันที่คีย์: ${moment(record.inputDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</Tag>}
    <Tag>{`รหัสสินค้า: ${record.productCode}`}</Tag>
    {record?.vehicleNo && <Tag>{`หมายเลขรถ: ${record.vehicleNo}`}</Tag>}
    {record?.peripheralNo && <Tag>{`เลขอุปกรณ์ต่อพ่วง: ${record.peripheralNo}`}</Tag>}
  </div>
);

export const initSearchValue = {
  customerId: null,
  saleNo: null,
  saleType: null,
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  branchCode: null
};

export const renderHeader = saleType => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="8">
        <Form.Item name="saleNo" label="🔍   ค้นหาจาก เลขที่ใบขายสินค้า/ชื่อลูกค้า">
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy={['saleNo', 'firstName']}
            wheres={[['saleType', '==', saleType]]}
            size="small"
            hasKeywords
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="2">
        <Form.Item name="startDate" label="🔍 ค้นหาจาก วันที่">
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="branchCode" label="🔍 ค้นหาจาก สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getNetTotal = values => {
  let nTotal;
  switch (values.saleType) {
    case 'sklLeasing':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    case 'baac':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtBaacFee) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    case 'cash':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    default:
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
  }
  return nTotal;
};

export const renderSale = ({ sale, form, grant, readOnly }) => {
  return (
    <Collapse className="my-3">
      <Collapse.Panel header={`ใบขายเลขที่ ${sale.saleNo || ''}`} key="1">
        {/* <label className="text-light mb-2">{`ใบขาย ${sale.saleNo || ''}`}</label> */}
        <SaleViewer {...{ sale, form, grant, readOnly }} />
      </Collapse.Panel>
    </Collapse>
  );
};

export const referrerCheck = ({ values }) => {
  const hasReferrer = values.referrer?.firstName;
  return (
    <div className="border bg-light p-3 mb-3">
      <label className="text-primary mb-3">ตรวจสอบค่าแนะนำ</label>
      {hasReferrer ? (
        <>
          <div>
            <Row>
              <Col md="4">
                <Form.Item label="สาขาที่ขอเบิกค่าแนะนำ" name={['referringDetails', 'branchCode']}>
                  <BranchSelector readOnly />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item label="วันที่" name={['referringDetails', 'date']}>
                  <DatePicker readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row form style={{ alignItems: 'center' }}>
              <Col md="2">
                <Form.Item name={['referrer', 'prefix']} label="คำนำหน้า">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col md="3">
                <Form.Item name={['referrer', 'firstName']} label="ชื่อคนแนะนำ">
                  <Input placeholder="ชื่อคนแนะนำ" readOnly />
                </Form.Item>
              </Col>
              {!['หจก.', 'บจ.'].includes(values.prefix) && (
                <Col md="4">
                  <Form.Item name={['referrer', 'lastName']} label="นามสกุล">
                    <Input placeholder="นามสกุล" readOnly />
                  </Form.Item>
                </Col>
              )}
              <Col md="3">
                <Form.Item name={['referrer', 'phoneNumber']} label="เบอร์โทรศัพท์">
                  <Input mask="111-1111111" placeholder="012-3456789" readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Item name={['referringDetails', 'relationship']} label="ความสัมพันธ์กับผู้ออกรถ">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md="6" className="border-right">
                <Form.Item name="amtReferrer">
                  <InputGroup spans={[10, 10, 4]} addonBefore="จำนวนเงินค่าแนะนำ" currency addonAfter="บาท" readOnly />
                </Form.Item>
                <Form.Item name={['referringDetails', 'whTax']}>
                  <InputGroup spans={[10, 10, 4]} addonBefore="หักภาษี ณ ที่จ่าย" readOnly currency addonAfter="บาท" />
                </Form.Item>
                <Form.Item name={['referringDetails', 'total']}>
                  <InputGroup spans={[10, 10, 4]} addonBefore="จำนวนเงินสุทธิ" readOnly currency addonAfter="บาท" />
                </Form.Item>
              </Col>
              <Col md="6">
                <Form.Item
                  name={['referringDetails', 'bankName']}
                  // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
                >
                  <InputGroup spans={[10, 14]} addonBefore="ชื่อบัญชีธนาคาร" readOnly />
                </Form.Item>
                <Form.Item
                  name={['referringDetails', 'bank']}
                  // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
                >
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ธนาคาร"
                    inputComponent={props => <BankNameSelector {...props} />}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  name={['referringDetails', 'bankAcc']}
                  // rules={!hasReferrer ? undefined : [...getRules(['required'])]}
                >
                  <InputGroup spans={[10, 14]} addonBefore="เลขที่บัญชี" readOnly />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <ReferringFooter isCreditCheck hasReferrer={hasReferrer} />
        </>
      ) : (
        <div>
          <h6 className="text-muted">ไม่มีค่าแนะนำ</h6>
        </div>
      )}
    </div>
  );
};
