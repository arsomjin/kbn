import React, { Fragment } from 'react';
import { Tag, Form, Input as AInput, Collapse } from 'antd';
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
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import SaleTypeSelector from 'components/SaleTypeSelector';
import { showLog } from 'functions';

const getNetReceive = (values, type) => {
  if (['baac'].includes(type)) {
    return (
      Numb(values.amtFull) -
      Numb(values.downPayment) -
      Numb(values.firstInstallment) -
      Numb(values.totalDownDiscount) -
      Numb(values.amtKBN) -
      Numb(values.amtInsurance) -
      Numb(values.amtActOfLegal)
    );
  }
  if (['cash'].includes(type)) {
    return 0;
  }
  if (['skl'].includes(type)) {
    return (
      Numb(values.amtFull) -
      Numb(values.downPayment) -
      Numb(values.firstInstallment) +
      Numb(values.totalDownDiscount) -
      Numb(values.amtInsurance) -
      Numb(values.amtActOfLegal)
    );
  }
  return (
    Numb(values.amtFull) -
    Numb(values.downPayment) -
    Numb(values.firstInstallment) +
    Numb(values.totalDownDiscount) -
    Numb(values.amtKBN) -
    Numb(values.amtInsurance) -
    Numb(values.amtActOfLegal)
  );
};

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
  // {
  //   title: 'วันที่บันทึก',
  //   dataIndex: 'created',
  //   align: 'center',
  //   render: (txt) => (
  //     <div>{moment.tz(txt, 'Asia/Bangkok').format('D/MM/YYYY HH:mm:ss')}</div>
  //   ),
  //   width: 180,
  //   // defaultSortOrder: 'descend',
  //   sorter: (a, b) => a.created - b.created,
  // },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName'
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName'
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

export const renderHeader = () => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="8">
        <Form.Item
          name="saleNo"
          // label="🔍  เลขที่ใบขายสินค้า/ชื่อลูกค้า* (แนะนำให้ใช้เลขที่ใบขาย ในการค้นหาข้อมูล)"
          label={
            <div>
              <span role="img" aria-label="search">
                🔍
              </span>{' '}
              เลขที่ใบขายสินค้า/ชื่อลูกค้า*{' '}
              <span className="text-muted">(แนะนำให้ใช้เลขที่ใบขาย ในการค้นหาข้อมูล)</span>
            </div>
          }
        >
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy={['saleNo', 'firstName']}
            labels={['saleNo', 'firstName', 'lastName']}
            size="small"
            hasKeywords
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
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
      <Col md="4">
        <Form.Item name="branchCode" label="🔍  สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

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

export const referrerCheck = ({ values, isAccountCheck }) => {
  const hasReferrer = values.referrer?.firstName;
  return (
    <div className="border bg-light px-3 pt-3 mb-3">
      <label className="text-primary mb-3">ตรวจสอบค่าแนะนำ</label>
      {hasReferrer ? (
        <>
          <div>
            <Row>
              <Col md="4">
                <Form.Item label="สาขาที่ขอเบิกค่าแนะนำ" name={['referringDetails', 'branchCode']}>
                  <BranchSelector disabled />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item label="วันที่" name={['referringDetails', 'date']}>
                  <DatePicker disabled />
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
          <ReferringFooter isCreditCheck={!isAccountCheck} isAccountCheck={isAccountCheck} hasReferrer={hasReferrer} />
          <Row>
            <Col md="6">
              <Form.Item
                name="inputBy"
                label="บันทึกข้อมูลโดย"
                rules={hasReferrer ? getRules(['required']) : undefined}
              >
                <EmployeeSelector />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item name="remark" label="หมายเหตุ">
                <AInput.TextArea />
              </Form.Item>
            </Col>
          </Row>
        </>
      ) : (
        <div>
          <h6 className="text-muted">ไม่มีค่าแนะนำ</h6>
        </div>
      )}
    </div>
  );
};

export const renderBAACBody = ({ values, grant, readOnly, netTotal, recorded }) => {
  const netReceive = getNetReceive(values, 'baac') - Numb(values.baacFee);
  showLog({
    grant,
    readOnly,
    recorded,
    truth: undefined || false
  });
  return (
    <Fragment>
      <div className="border bg-light px-3 pt-3 mb-3">
        <label className="text-primary mb-3">บันทึกข้อมูลสินเชื่อ</label>
        <Row>
          <Col md="4">
            <Form.Item
              name="creditNo"
              label="เลขที่"
              // rules={getRules(['required'])}
            >
              <Input placeholder="เลขที่เอกสารบันทึกข้อมูลสินเชื่อ" disabled={!grant} readOnly={readOnly || recorded} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="saleCutoffDate"
              label="วันที่ตัดขายในระบบ Kads"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly || recorded} />
            </Form.Item>
          </Col>
        </Row>
        <div className="border pt-3 px-3 mb-3">
          <Row>
            <Col md="4">
              <Form.Item
                name="date"
                label="วันที่บันทึกข้อมูล"
                // rules={getRules(['required'])}
              >
                <DatePicker disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoiceDate" // rules={getRules(['required'])}
              >
                <InputGroup addonBefore="วันที่ใบกำกับภาษี" alignRight date disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoice" // rules={getRules(['required'])}
              >
                <InputGroup
                  addonBefore="เลขที่ใบกำกับภาษี"
                  alignRight
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="2">
            <Form.Item name="prefix">
              <Input placeholder="คำนำหน้า" readOnly />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="firstName">
              <Input placeholder="ชื่อลูกค้า" readOnly />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col md="4">
              <Form.Item name="lastName">
                <Input placeholder="นามสกุล" readOnly />
              </Form.Item>
            </Col>
          )}
          <Col md="3">
            <Form.Item name="phoneNumber" rules={getRules(['mobileNumber'])}>
              <Input mask="111-1111111" placeholder="012-3456789" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Form.Item name="saleType" label="ประเภทการขาย">
              <SaleTypeSelector disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtFull" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ราคาขาย"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="downPayment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินดาวน์"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalDownDiscount" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมส่วนลด โปรช่วยดาวน์ SKC"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="firstInstallment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินงวดล่วงหน้า"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="bg-light pt-2 px-3 border mb-3">
          <label className="text-muted">การรับเงินจาก SKC</label>
          <Row>
            <Col md="6">
              <Form.Item name="skcTotal">
                <InputGroup
                  addonBefore="จำนวนเงิน"
                  addonAfter="บาท"
                  alignRight
                  currency
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item name="skcReceiveDate">
                <InputGroup addonBefore="วันที่รับเงินจาก SKC" alignRight disabled={!grant || readOnly} date />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row>
          <Col md="6">
            <Form.Item name="amtKBN" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ส่วนลด KBN"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="contractDeliverDate" {...(recorded && { rules: getRules(['required']) })}>
              <InputGroup addonBefore="วันที่ส่งสัญญา สกต./ธกส." alignRight disabled={!grant || readOnly} date />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item
              name="contractAmtReceivedDate"
              // rules={getRules(['required'])}
            >
              <InputGroup addonBefore="วันที่รับเงิน สกต./ธกส." alignRight disabled={!grant || readOnly} date />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="contractAmtReceivedBank" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ธนาคารที่รับเงินโอน"
                disabled={!grant}
                readOnly={readOnly || recorded}
                selfBank
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="baacFee" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ค่าธรรมเนียม ธกส./สกต."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="baacNo" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เลขที่ใบ ธกส./สกต."
                alignRight
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="baacDate" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="วันที่ใบ ธกส./สกต."
                alignRight
                disabled={!grant}
                readOnly={readOnly || recorded}
                date
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item>
              <InputGroup
                value={netReceive}
                addonBefore="รวมยอดที่ได้รับเงิน SKL"
                addonAfter="บาท"
                alignRight
                currency
                readOnly
                primaryAfter
                primaryBefore
                primary
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item
              name="inputCreditInfoBy"
              label="บันทึกข้อมูลสินเชื่อโดย"
              // rules={getRules(['required'])}
            >
              <EmployeeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* <Row>
      <Col md="6">
        <Form.Item name="taxInvoice" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ใบกำกับภาษีขาย"
            alignRight
            disabled={!grant}
            readOnly={readOnly || recorded}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="taxInvoiceDate" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="วันที่ใบกำกับภาษี"
            alignRight
            disabled={!grant}
            readOnly={readOnly || recorded}
            date
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item>
          <InputGroup
            addonBefore="รวมยอดเงินสุทธิ"
            addonAfter="บาท"
            alignRight
            currency
            value={netTotal}
            readOnly
            primaryAfter
            primaryBefore
            primary
          />
        </Form.Item>
      </Col>
    </Row> */}
      {referrerCheck({ values })}
    </Fragment>
  );
};

export const renderCashBody = ({ values, grant, readOnly, netTotal, recorded }) => {
  const netReceive = getNetReceive(values, 'cash');
  return (
    <Fragment>
      <div className="border bg-light px-3 pt-3 mb-3">
        <label className="text-primary mb-3">บันทึกข้อมูลสินเชื่อ</label>
        <Row>
          <Col md="4">
            <Form.Item
              name="creditNo"
              label="เลขที่"
              // rules={getRules(['required'])}
            >
              <Input placeholder="เลขที่เอกสารบันทึกข้อมูลสินเชื่อ" disabled={!grant} readOnly={readOnly || recorded} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="saleCutoffDate"
              label="วันที่ตัดขายในระบบ Kads"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly || recorded} />
            </Form.Item>
          </Col>
        </Row>
        <div className="border pt-3 px-3 mb-3">
          <Row>
            <Col md="4">
              <Form.Item
                name="date"
                label="วันที่บันทึกข้อมูล"
                // rules={getRules(['required'])}
              >
                <DatePicker disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoiceDate"
                // rules={getRules(['required'])}
              >
                <InputGroup addonBefore="วันที่ใบกำกับภาษี" alignRight date disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoice"
                // rules={getRules(['required'])}
              >
                <InputGroup
                  addonBefore="เลขที่ใบกำกับภาษี"
                  alignRight
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="2">
            <Form.Item name="prefix">
              <Input placeholder="คำนำหน้า" readOnly />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="firstName">
              <Input placeholder="ชื่อลูกค้า" readOnly />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col md="4">
              <Form.Item name="lastName">
                <Input placeholder="นามสกุล" readOnly />
              </Form.Item>
            </Col>
          )}
          <Col md="3">
            <Form.Item name="phoneNumber" rules={getRules(['mobileNumber'])}>
              <Input mask="111-1111111" placeholder="012-3456789" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Form.Item name="saleType" label="ประเภทการขาย">
              <SaleTypeSelector disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtFull" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ราคาขาย"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="downPayment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินดาวน์"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalDownDiscount" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมส่วนลด โปรช่วยดาวน์ SKC"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="firstInstallment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินงวดล่วงหน้า"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="bg-light pt-2 px-3 border mb-3">
          <label className="text-muted">การรับเงินจาก SKC</label>
          <Row>
            <Col md="6">
              <Form.Item name="skcTotal">
                <InputGroup
                  addonBefore="จำนวนเงิน"
                  addonAfter="บาท"
                  alignRight
                  currency
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item name="skcReceiveDate">
                <InputGroup addonBefore="วันที่รับเงินจาก SKC" alignRight disabled={!grant || readOnly} date />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row>
          <Col md="6">
            <Form.Item name="amtKBN" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ส่วนลด KBN"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalBeforeDeductInsurance" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมจำนวนเงินก่อนหักเบี้ยประกัน/พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
                spans={[14, 6, 4]}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="amtInsurance">
              <InputGroup
                addonBefore="ค่าเบี้ยประกัน"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtActOfLegal">
              <InputGroup
                addonBefore="ค่า พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item>
              <InputGroup
                value={netReceive}
                addonBefore="รวมยอดที่ได้รับเงิน SKL"
                addonAfter="บาท"
                alignRight
                currency
                readOnly
                primaryAfter
                primaryBefore
                primary
              />
            </Form.Item>
          </Col>
        </Row>{' '}
        <Row>
          <Col md="6">
            <Form.Item
              name="inputCreditInfoBy"
              label="บันทึกข้อมูลสินเชื่อโดย"
              // rules={getRules(['required'])}
            >
              <EmployeeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* จำกัดการมองเห็น สินเชื่อจะไม่เห็นข้อมูล
     <Row>
      <Col md="6">
        <Form.Item name="loanInfoIncome">
          <InputGroup
            addonBefore="ค่าบริการข้อมูลสินเชื่อ"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly || recorded}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="vat" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ภาษีมูลค่าเพิ่ม"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly || recorded}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="wht">
          <InputGroup
            addonBefore="ภาษี หัก ณ ที่จ่าย"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly || recorded}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item>
          <InputGroup
            addonBefore="รวมยอดเงินสุทธิ"
            addonAfter="บาท"
            alignRight
            currency
            value={netTotal}
            readOnly
            primaryAfter
            primaryBefore
            primary
          />
        </Form.Item>
      </Col>
    </Row> */}
      {referrerCheck({ values })}
    </Fragment>
  );
};

export const renderSKLBody = ({ values, grant, readOnly, netTotal, recorded }) => {
  const netReceive = getNetReceive(values, 'skl');
  return (
    <Fragment>
      <div className="border bg-light px-3 pt-3 mb-3">
        <label className="text-primary mb-3">บันทึกข้อมูลสินเชื่อ</label>
        <Row>
          <Col md="4">
            <Form.Item
              name="creditNo"
              label="เลขที่"
              // rules={getRules(['required'])}
            >
              <Input placeholder="เลขที่เอกสารบันทึกข้อมูลสินเชื่อ" disabled={!grant} readOnly={readOnly || recorded} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="saleCutoffDate"
              label="วันที่ตัดขายในระบบ Kads"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly || recorded} />
            </Form.Item>
          </Col>
        </Row>
        <div className="border pt-3 px-3 mb-3">
          <Row>
            <Col md="4">
              <Form.Item
                name="date"
                label="วันที่บันทึกข้อมูล"
                // rules={getRules(['required'])}
              >
                <DatePicker disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoiceDate"
                // rules={getRules(['required'])}
              >
                <InputGroup addonBefore="วันที่ใบกำกับภาษี" alignRight date disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoice"
                // rules={getRules(['required'])}
              >
                <InputGroup
                  addonBefore="เลขที่ใบกำกับภาษี"
                  alignRight
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="2">
            <Form.Item name="prefix">
              <Input placeholder="คำนำหน้า" readOnly />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="firstName">
              <Input placeholder="ชื่อลูกค้า" readOnly />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col md="4">
              <Form.Item name="lastName">
                <Input placeholder="นามสกุล" readOnly />
              </Form.Item>
            </Col>
          )}
          <Col md="3">
            <Form.Item name="phoneNumber" rules={getRules(['mobileNumber'])}>
              <Input mask="111-1111111" placeholder="012-3456789" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Form.Item name="saleType" label="ประเภทการขาย">
              <SaleTypeSelector disabled />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="contractDeliverDate"
              label="วันที่ส่งสัญญา SKL"
              {...(recorded && { rules: getRules(['required']) })}
            >
              <DatePicker disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="contractAmtReceivedDate"
              label="วันที่รับเงิน SKL"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtFull" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ราคาขาย"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="downPayment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินดาวน์"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalDownDiscount" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมส่วนลด โปรช่วยดาวน์ SKC"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="firstInstallment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินงวดล่วงหน้า"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalBeforeDeductInsurance" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมจำนวนเงินก่อนหักเบี้ยประกัน/พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
                spans={[14, 6, 4]}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="amtInsurance">
              <InputGroup
                addonBefore="ค่าเบี้ยประกัน"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtActOfLegal">
              <InputGroup
                addonBefore="ค่า พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item>
              <InputGroup
                value={netReceive}
                addonBefore="รวมยอดที่ได้รับเงิน SKL"
                addonAfter="บาท"
                alignRight
                currency
                readOnly
                primaryAfter
                primaryBefore
                primary
              />
            </Form.Item>
          </Col>
        </Row>{' '}
        <Row>
          <Col md="6">
            <Form.Item
              name="inputCreditInfoBy"
              label="บันทึกข้อมูลสินเชื่อโดย"
              // rules={getRules(['required'])}
            >
              <EmployeeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* จำกัดการมองเห็น สินเชื่อจะไม่เห็นข้อมูล
      <Row>
        <Col md="6">
          <Form.Item name="loanInfoIncome">
            <InputGroup
              addonBefore="ค่าบริการข้อมูลสินเชื่อ"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="vat" rules={getRules(['required'])}>
            <InputGroup
              addonBefore="ภาษีมูลค่าเพิ่ม"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="wht">
            <InputGroup
              addonBefore="ภาษี หัก ณ ที่จ่าย"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="taxInvoice">
            <InputGroup
              addonBefore="ใบกำกับภาษีขาย"
              alignRight
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="taxInvoiceDate" rules={getRules(['required'])}>
            <InputGroup
              addonBefore="วันที่ใบกำกับภาษี"
              alignRight
              date
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item>
            <InputGroup
              addonBefore="รวมยอดเงินสุทธิ"
              addonAfter="บาท"
              alignRight
              currency
              value={netTotal}
              readOnly
              primaryAfter
              primaryBefore
              primary
            />
          </Form.Item>
        </Col>
      </Row> */}
      {referrerCheck({ values })}
    </Fragment>
  );
};
export const renderKBNBody = ({ values, grant, readOnly, netTotal, recorded }) => {
  const netReceive = getNetReceive(values, 'kbn');
  return (
    <Fragment>
      <div className="border bg-light px-3 pt-3 mb-3">
        <label className="text-primary mb-3">บันทึกข้อมูลสินเชื่อ</label>
        <Row>
          <Col md="4">
            <Form.Item
              name="creditNo"
              label="เลขที่"
              // rules={getRules(['required'])}
            >
              <Input placeholder="เลขที่เอกสารบันทึกข้อมูลสินเชื่อ" disabled={!grant} readOnly={readOnly || recorded} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="saleCutoffDate"
              label="วันที่ตัดขายในระบบ Kads"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly || recorded} />
            </Form.Item>
          </Col>
        </Row>
        <div className="border pt-3 px-3 mb-3">
          <Row>
            <Col md="4">
              <Form.Item
                name="date"
                label="วันที่บันทึกข้อมูล"
                // rules={getRules(['required'])}
              >
                <DatePicker disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoiceDate"
                // rules={getRules(['required'])}
              >
                <InputGroup addonBefore="วันที่ใบกำกับภาษี" alignRight date disabled={!grant || readOnly || recorded} />
              </Form.Item>
            </Col>
            <Col md="4">
              <Form.Item
                name="taxInvoice"
                // rules={getRules(['required'])}
              >
                <InputGroup
                  addonBefore="เลขที่ใบกำกับภาษี"
                  alignRight
                  disabled={!grant}
                  readOnly={readOnly || recorded}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="2">
            <Form.Item name="prefix">
              <Input placeholder="คำนำหน้า" readOnly />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="firstName">
              <Input placeholder="ชื่อลูกค้า" readOnly />
            </Form.Item>
          </Col>
          {!['หจก.', 'บจ.'].includes(values.prefix) && (
            <Col md="4">
              <Form.Item name="lastName">
                <Input placeholder="นามสกุล" readOnly />
              </Form.Item>
            </Col>
          )}
          <Col md="3">
            <Form.Item name="phoneNumber" rules={getRules(['mobileNumber'])}>
              <Input mask="111-1111111" placeholder="012-3456789" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Form.Item name="saleType" label="ประเภทการขาย">
              <SaleTypeSelector disabled />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="contractDeliverDate"
              label="วันที่ส่งสัญญา KBN"
              {...(recorded && { rules: getRules(['required']) })}
            >
              <DatePicker disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="contractAmtReceivedDate"
              label="วันที่รับเงิน KBN"
              // rules={getRules(['required'])}
            >
              <DatePicker disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtFull" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="ราคาขาย"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="downPayment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินดาวน์"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalDownDiscount" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมส่วนลด โปรช่วยดาวน์ SKC"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="firstInstallment" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="เงินงวดล่วงหน้า"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="totalBeforeDeductInsurance" rules={getRules(['required'])}>
              <InputGroup
                addonBefore="รวมจำนวนเงินก่อนหักเบี้ยประกัน/พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
                spans={[14, 6, 4]}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="amtInsurance">
              <InputGroup
                addonBefore="ค่าเบี้ยประกัน"
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="amtActOfLegal">
              <InputGroup
                addonBefore="ค่า พรบ."
                addonAfter="บาท"
                alignRight
                currency
                disabled={!grant}
                readOnly={readOnly || recorded}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item>
              <InputGroup
                value={netReceive}
                addonBefore="รวมยอดที่ได้รับเงิน SKL"
                addonAfter="บาท"
                alignRight
                currency
                readOnly
                primaryAfter
                primaryBefore
                primary
              />
            </Form.Item>
          </Col>
        </Row>{' '}
        <Row>
          <Col md="6">
            <Form.Item
              name="inputCreditInfoBy"
              label="บันทึกข้อมูลสินเชื่อโดย"
              // rules={getRules(['required'])}
            >
              <EmployeeSelector disabled={!grant || readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* จำกัดการมองเห็น สินเชื่อจะไม่เห็นข้อมูล
      <Row>
        <Col md="6">
          <Form.Item name="loanInfoIncome">
            <InputGroup
              addonBefore="ค่าบริการข้อมูลสินเชื่อ"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="vat" rules={getRules(['required'])}>
            <InputGroup
              addonBefore="ภาษีมูลค่าเพิ่ม"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="wht">
            <InputGroup
              addonBefore="ภาษี หัก ณ ที่จ่าย"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="taxInvoice">
            <InputGroup
              addonBefore="ใบกำกับภาษีขาย"
              alignRight
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="taxInvoiceDate" rules={getRules(['required'])}>
            <InputGroup
              addonBefore="วันที่ใบกำกับภาษี"
              alignRight
              date
              disabled={!grant}
              readOnly={readOnly || recorded}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item>
            <InputGroup
              addonBefore="รวมยอดเงินสุทธิ"
              addonAfter="บาท"
              alignRight
              currency
              value={netTotal}
              readOnly
              primaryAfter
              primaryBefore
              primary
            />
          </Form.Item>
        </Col>
      </Row> */}
      {referrerCheck({ values })}
    </Fragment>
  );
};
