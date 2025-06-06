import React from 'react';
import { Form, Input as AInput } from 'antd';
import { Row, Col } from 'shards-react';
import { DatePicker } from 'elements';
import { Fragment } from 'react';
import { getRules } from 'api/Table';
import { InputGroup, Input } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import { Numb } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import { checkCreditDataExists } from 'Modules/Credit/api';
import { referrerCheck } from 'Modules/Credit/Components';
import { initReferringDetails } from 'Modules/Sales/Vehicles/api';
import { parser } from 'functions';
import SaleTypeSelector from 'components/SaleTypeSelector';

export const initCreditValues = {
  date: undefined,
  creditId: null,
  creditNo: null,
  customerId: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  contractDeliverDate: undefined,
  contractAmtReceivedDate: undefined,
  amtFull: null,
  amtReceive: null,
  downPayment: null,
  totalDownDiscount: null,
  firstInstallment: null,
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
  remark: null
};

export const getCashCreditDataFromSale = (sale, credit) =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      let amount = sale?.amtReferrer || null;
      let refWHTax = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) * 0.05 : null;
      let refTotal = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) - refWHTax : null;
      const hasReferrer = !!sale.referrer?.firstName;
      // Check existing credit data.
      const oCredit = await checkCreditDataExists(sale);
      if (oCredit && oCredit.inputBy) {
        result = {
          ...initCreditValues,
          ...oCredit,
          ...(!oCredit?.referringDetails && {
            ...initReferringDetails,
            branchCode: sale.branchCode,
            date: sale.date,
            amount,
            whTax: refWHTax,
            total: refTotal
          }),
          ...(!oCredit?.referrer && {
            referrer: sale.referrer
          }),
          ...(!oCredit?.amtReferrer && {
            amtReferrer: sale.amtReferrer
          }),
          hasReferrer
        };
      } else {
        const {
          amtOldCustomer,
          amtMAX,
          amtOther,
          amtPro,
          amtSKC,
          amtFull,
          amtReceived: downPayment,
          advInstallment: firstInstallment,
          items: saleItems,
          saleId,
          saleNo,
          saleType,
          customerId,
          prefix,
          firstName,
          lastName,
          referrer,
          amtReferrer,
          referringDetails
        } = sale;
        let totalDownDiscount = Numb(amtOldCustomer) + Numb(amtMAX) + Numb(amtOther) + Numb(amtPro) + Numb(amtSKC);
        let nCredit = {
          amtFull,
          downPayment,
          totalDownDiscount,
          firstInstallment,
          saleItems,
          saleId,
          saleNo,
          saleType,
          customerId,
          prefix,
          firstName,
          lastName,
          referrer,
          amtReferrer,
          hasReferrer,
          referringDetails,
          sendTransferDate: referringDetails?.forHQ ? referringDetails.forHQ?.sendTransferDate || null : null,
          actualTransferDate: referringDetails?.forHQ ? referringDetails.forHQ?.actualTransferDate || null : null
        };
        result = {
          ...initCreditValues,
          creditId: createNewOrderId('CRE-VEH'),
          ...nCredit,
          ...(hasReferrer && {
            referringDetails: !sale?.referringDetails
              ? {
                  ...initReferringDetails,
                  branchCode: sale.branchCode,
                  date: sale.date,
                  amount,
                  whTax: refWHTax,
                  total: refTotal
                }
              : sale.referringDetails
          })
        };
      }
      r({
        ...result,
        totalBeforeDeductInsurance:
          Numb(result.amtFull) -
          Numb(result.downPayment) +
          Numb(result.totalDownDiscount) -
          Numb(result.firstInstallment)
      });
    } catch (e) {
      j(e);
    }
  });

export const renderCashBody = ({ values, grant, readOnly, netTotal }) => (
  <Fragment>
    <label className="text-primary mb-3">บันทึกข้อมูลสินเชื่อ</label>
    <Row>
      <Col md="6">
        <Form.Item name="creditNo" label="เลขที่" rules={getRules(['required'])}>
          <Input placeholder="กรุณาป้อนเลขที่เอกสาร" disabled={!grant} readOnly={readOnly} />
        </Form.Item>
      </Col>
    </Row>
    <div className="border pt-3 px-3 mb-3">
      <Row>
        <Col md="4">
          <Form.Item name="date" label="วันที่บันทึกข้อมูล" rules={getRules(['required'])}>
            <DatePicker disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="taxInvoiceDate" rules={getRules(['required'])}>
            <InputGroup addonBefore="วันที่ใบกำกับภาษี" alignRight date disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="taxInvoice">
            <InputGroup addonBefore="เลขที่ใบกำกับภาษี" alignRight disabled={!grant} readOnly={readOnly} />
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
        <Form.Item name="totalBeforeDeductInsurance" rules={getRules(['required'])}>
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
    </Row>
    <Row>
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
      <Col md="6">
        <Form.Item name="amtReceive" rules={getRules(['required'])}>
          <InputGroup
            addonBefore="รวมยอดที่ได้รับเงิน SKL"
            addonAfter="บาท"
            alignRight
            currency
            disabled={!grant}
            readOnly={readOnly}
            primaryAfter
            primaryBefore
            primary
          />
        </Form.Item>
      </Col>
    </Row>
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
            readOnly={readOnly}
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
    <Row>
      {/* Remark */}
      <Col md="6">
        <Form.Item name="inputBy" label="บันทึกข้อมูลโดย" rules={getRules(['required'])}>
          <EmployeeSelector disabled={!grant || readOnly} />
        </Form.Item>
      </Col>
      <Col md="6">
        <Form.Item name="remark" label="หมายเหตุ">
          <AInput.TextArea disabled={!grant} readOnly={readOnly} />
        </Form.Item>
      </Col>
    </Row>
  </Fragment>
);
