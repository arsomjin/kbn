import React from 'react';
import dayjs from 'dayjs';
import DocSelector from 'components/DocSelector';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import BranchSelector from 'components/BranchSelector';
import { DatePicker } from 'elements';
import { parser } from 'functions';
import { uniq } from 'lodash';
import { Numb } from 'functions';
import { initReferringDetails } from 'Modules/Sales/Vehicles/api';
import { createNewOrderId } from 'Modules/Account/api';

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

export const initSearchValue = {
  customerId: null,
  saleNo: null,
  // saleType: null,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  branchCode: null
};

export const renderHeader = () => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="8">
        <Form.Item name="saleNo" label="🔍  เลขที่ใบขายสินค้า/ชื่อลูกค้า">
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

export const initCreditValues = {
  date: undefined,
  creditId: null,
  creditNo: null,
  saleCutoffDate: undefined,
  customerId: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  contractDeliverDate: undefined,
  contractAmtReceivedDate: undefined,
  contractAmtReceivedBank: null,
  contractAmtReceivedAccNo: null,
  amtFull: null,
  amtReceive: null,
  downPayment: null,
  totalDownDiscount: null,
  firstInstallment: null,
  amtBaacFee: null,
  amtInsurance: null,
  amtActOfLegal: null,
  loanInfoIncome: null,
  vat: null,
  wht: null,
  taxInvoice: null,
  taxInvoiceDate: undefined,
  saleId: null,
  saleNo: null,
  saleType: null,
  saleItems: [],
  inputBy: null,
  remark: null
};

export const getCreditDataFromSale = sale =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      let amount = sale?.amtReferrer || null;
      let refWHTax = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) * 0.05 : null;
      let refTotal = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) - refWHTax : null;
      const hasReferrer = !!sale.referrer?.firstName;
      let itemType = !!sale?.items ? uniq(sale.items.map(it => it.vehicleType)).filter(l => !!l) : [];
      if (sale?.creditInfo) {
        result = {
          ...initCreditValues,
          ...sale.creditInfo,
          branchCode: sale.branchCode,
          itemType
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
          amtBaacFee,
          baacNo,
          baacDate,
          saleId,
          saleNo,
          saleType,
          customerId,
          prefix,
          firstName,
          lastName,
          referrer,
          amtReferrer,
          referringDetails,
          branchCode
        } = sale;
        let totalDownDiscount = Numb(amtOldCustomer) + Numb(amtMAX) + Numb(amtOther) + Numb(amtPro) + Numb(amtSKC);

        let initSnap = {
          amtFull,
          downPayment,
          totalDownDiscount,
          branchCode,
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
          actualTransferDate: referringDetails?.forHQ ? referringDetails.forHQ?.actualTransferDate || null : null,
          itemType
        };

        let nCredit = initSnap;

        switch (saleType) {
          case 'baac':
            nCredit = {
              ...initSnap,
              firstInstallment,
              amtBaacFee,
              baacNo,
              baacDate
            };

            break;
          case 'sklLeasing':
          case 'kbnLeasing':
            nCredit = {
              ...initSnap,
              firstInstallment
            };
            break;
          default:
            break;
        }

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
          Numb(result.downPayment) -
          Numb(result.firstInstallment) +
          Numb(result.totalDownDiscount)
      });
    } catch (e) {
      j(e);
    }
  });
