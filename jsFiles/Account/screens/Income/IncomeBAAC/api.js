import React, { Fragment } from 'react';
import { Tag, Form, Input as AInput, Collapse } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';
import DocSelector from 'components/DocSelector';
import { Numb } from 'functions';
import SaleViewer from 'Modules/Sales/Vehicles/SaleViewer';
import { InputGroup, Input } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { checkAccountIncomeDataExists } from 'Modules/Account/api';
import { createNewOrderId } from 'Modules/Account/api';
import { checkCreditDataExists } from 'Modules/Credit/api';
import Text from 'antd/lib/typography/Text';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
  },
  {
    title: 'ประเภท',
    dataIndex: 'saleType',
  },
  {
    title: (
      <span role="img" aria-label="search">
        🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
      </span>
    ),
    ellipsis: true,
    dataIndex: 'productCode',
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo',
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralNo',
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
  },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName',
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName',
  },
  {
    title: 'ราคาสินค้า',
    dataIndex: 'amtFull',
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

export const initSearchValue = {
  customerId: null,
  saleNo: null,
  saleType: null,
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  branchCode: null,
};

export const renderHeader = (saleType) => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="8">
        <Form.Item name="saleNo" label="🔍  เลขที่ใบขายสินค้า/ชื่อลูกค้า">
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy={['saleNo', 'firstName']}
            labels={['saleNo', 'firstName', 'lastName']}
            wheres={[['saleType', '==', saleType]]}
            size="small"
            hasAll
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

export const initAccountValues = {
  accountId: null,
  accountNo: null,
  customerId: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  contractDeliverDate: undefined,
  contractAmtReceivedDate: undefined,
  contractAmtReceivedBank: null,
  contractAmtReceivedAccNo: null,
  amtFull: null,
  downPayment: null,
  totalDownDiscount: null,
  firstInstallment: null,
  amtBaacFee: null,
  baacNo: null,
  baacDate: undefined,
  amtInsurance: null,
  amtActOfLegal: null,
  loanInfoIncome: null,
  vat: null,
  wht: null,
  taxInvoice: null,
  taxInvoiceDate: undefined,
  saleId: null,
  saleNo: null,
  saleItems: [],
  inputBy: null,
  remark: null,
};

export const getBAACAccountDataFromSale = (sale, account) =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      // Check existing account data.
      const oAccount = await checkAccountIncomeDataExists(sale);
      if (oAccount && oAccount.inputBy) {
        result = {
          ...initAccountValues,
          ...oAccount,
        };
      } else {
        // Create data from credit data.
        let nAccount = await checkCreditDataExists(sale);
        delete nAccount.created;
        delete nAccount.createdBy;
        delete nAccount.status;
        nAccount?.editedBy && delete nAccount.editedBy;
        result = {
          ...initAccountValues,
          accountId: createNewOrderId('ACC-VEH'),
          ...nAccount,
          creditInputBy: nAccount.inputBy,
          inputBy: null,
        };
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const getNetTotal = (values) => {
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

    default:
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) -
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

export const renderBAACBody = ({ values, grant, readOnly, netTotal }) => (
  <Fragment>
    <label className="text-primary mb-3">บันทึกข้อมูล</label>
    <Row>
      <Col md="6">
        <Form.Item
          name="accountNo"
          label="เลขที่"
          rules={getRules(['required'])}
        >
          <Input
            placeholder="กรุณาป้อนเลขที่เอกสาร"
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row form style={{ alignItems: 'center' }}>
      <Col md="2">
        <Form.Item name="prefix">
          <Input placeholder="นามสกุล" readOnly />
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
      <Col md="6">
        <Form.Item name="amtFull" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ราคาขาย"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="contractDeliverDate" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="วันที่ส่งสัญญา สกต./ธกส."
            alignRight
            disabled={!grant}
            readOnly={readOnly}
            date
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item
          name="contractAmtReceivedDate"
          rules={getRules(['required'])}
        >
          <InputGroup
            addonBefore="วันที่รับเงิน สกต./ธกส."
            alignRight
            disabled={!grant}
            readOnly={readOnly}
            date
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item
          name="contractAmtReceivedBank"
          rules={getRules(['required'])}
        >
          <InputGroup
            addonBefore="ธนาคารที่รับเงินโอน"
            disabled={!grant}
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="baacDate" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="วันที่ใบ ธกส./สกต."
            alignRight
            disabled={!grant}
            readOnly={readOnly}
            date
          />
        </Form.Item>
      </Col>
    </Row>
    {/* <Row>
      <Col md="6">
        <Form.Item
          name="totalBeforeDeductInsurance"
          rules={getRules(['required'])}
        >
          <InputGroup
            addonBefore="รวมจำนวนเงินก่อนหักเบี้ยประกัน/พรบ."
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="amtInsurance" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ค่าเบี้ยประกัน"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="amtActOfLegal" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ค่า พรบ."
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row> */}
    {/* <Row>
      <Col md="6">
        <Form.Item name="loanInfoIncome">
          <InputGroup
            addonBefore="ค่าบริการข้อมูลสินเชื่อ"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row> */}
    {/* <Row>
      <Col md="6">
        <Form.Item name="wht">
          <InputGroup
            addonBefore="ภาษี หัก ณ ที่จ่าย"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row> */}
    <Row>
      <Col md="6">
        <Form.Item name="taxInvoice" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="ใบกำกับภาษีขาย"
            alignRight
            disabled={!grant}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="taxInvoiceDate" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="วันที่ใบกำกับภาษี"
            alignRight
            disabled={!grant}
            readOnly={readOnly}
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
    </Row>
    <Row>
      <Col md="6">
        <Form.Item name="creditInputBy" label="บันทึกข้อมูลสินเชื่อโดย">
          <EmployeeSelector disabled />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item
          name="inputBy"
          label="บันทึกข้อมูลทางบัญชีโดย"
          rules={getRules(['required'])}
        >
          <EmployeeSelector disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="8">
        <Form.Item name="remark" label="หมายเหตุ">
          <AInput.TextArea disabled={!grant} readOnly={readOnly} />
        </Form.Item>
      </Col>
    </Row>
  </Fragment>
);
