import React from 'react';
import dayjs from 'dayjs';
import { getItemId } from 'Modules/Account/api';
import { Numb } from 'functions';
import { initItem } from './ServiceItems';
import { getSearchData } from 'firebase/api';
import { Collapse } from 'antd';
import ServiceViewer from '../Components/ServiceViewer';
import { initAddress } from '../ServiceOrder/api';

export const getInitialItems = service => [
  {
    ...initItem,
    id: 1,
    serviceItemId: getItemId(),
    serviceId: service?.orderId,
    _key: ''
  }
];

const InitValue = {
  serviceNo: '',
  serviceType: 'periodicCheck',
  branchCode: '0450',
  times: 1,
  refDoc: {},
  serviceDate: undefined,
  serviceTime: undefined,
  serviceAddress: initAddress,
  technicianId: [],
  notFound: false,
  notFoundReason: null,
  orderStatus: 'ปิดงาน',
  failReason: null,
  cause: null,
  corrective: null,
  servicer: null,
  approver: null,
  customer: null,
  customerApprovedDate: undefined,
  customerApprovedTime: undefined,
  customerSignedDate: undefined,
  customerSignedTime: undefined,
  approvedDate: undefined,
  approvedTime: undefined,
  recordedDate: undefined,
  amtWage: null,
  amtPart: null,
  amtOil: null,
  amtBlackGlue: null,
  amtFreight: null,
  amtOther: null,
  discount: null,
  discountOther: null,
  discountCouponPercent: 20,
  total: null,
  amtAllParts: null,
  discountPart: null,
  discountOil: null,
  discountBlackGlue: null,
  totalBeforeVat: null,
  advance: null,
  returnTotal: null,
  cash: null,
  moneyTransfer: null,
  VAT: null,
  remark: null,
  items: [],
  payments: [],
  warrantyStatus: 'ในประกัน',
  vehicleType: null,
  productPCode: null,
  model: null,
  CF4_3: null,
  CF4_6: null,
  UDT_18: null,
  UDT_6: null,
  vehicleRegNumber: null
};

export const getInitialValues = service => {
  if (service?.created) {
    return service;
  }
  return {
    ...InitValue,
    serviceId: service?.serviceId,
    items: getInitialItems(service),
    serviceDate: service?.serviceDate ? dayjs(service.serviceDate, 'YYYY-MM-DD') : undefined
  };
};

export const getServicesData = sValues =>
  new Promise(async (r, j) => {
    try {
      let mData = [];
      if (sValues?.serviceNo && sValues.serviceNo !== 'all') {
        mData = await getSearchData('sections/services/serviceOrders', { serviceNo: sValues.serviceNo }, ['serviceNo']);
      }
      r(mData);
    } catch (e) {
      j(e);
    }
  });

export const renderService = ({ service, form, disabled, readOnly }) => {
  return (
    <Collapse className="mb-3">
      <Collapse.Panel
        {...(!service?.serviceNo && { collapsible: 'disabled' })}
        header={`ใบแจ้งบริการ ${!!service?.serviceNo ? `เลขที่ ${service.serviceNo}` : ''}`}
        key="1"
      >
        <ServiceViewer {...{ service, form, disabled, readOnly }} />
      </Collapse.Panel>
    </Collapse>
  );
};

export const getOtherServiceValues = values => {
  let arr = [...values.items];
  let arrPart = arr.filter(
    l =>
      l.serviceItemType === 'อะไหล่' &&
      l.item.trim().search('น้ำมัน') !== 0 &&
      l.item.trim().search('กาว') !== 0 &&
      l.item.trim().search('ค่าแรง') === -1 &&
      l.item.trim().search('ขนส่ง') === -1
  );
  let arrOil = arr.filter(l => l.item.trim().search('น้ำมัน') === 0);
  let arrBlackGlue = arr.filter(l => l.item.trim().search('กาว') === 0);
  let arrWage = arr.filter(l => l.item.trim().search('ค่าแรง') > -1);
  let arrFreight = arr.filter(l => l.item.trim().search('ขนส่ง') > -1);

  let amtPart = arrPart.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let discountPart = arrPart.reduce(
    (sum, elem) => sum + (Number(elem?.discount || 0) - Numb(elem?.returnDiscount || 0)),
    0
  );
  let amtBlackGlue = arrBlackGlue.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let amtOil = arrOil.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let CF4_6 = arrOil
    .filter(l => l.item.search('CF4') > -1 && l.item.search('6 ลิตร') > -1)
    .reduce((sum, elem) => sum + (Number(elem?.qty || 0) - Numb(elem?.returnQty || 0)), 0);
  let CF4_3 = arrOil
    .filter(l => l.item.search('CF4') > -1 && l.item.search('3 ลิตร') > -1)
    .reduce((sum, elem) => sum + (Number(elem?.qty || 0) - Numb(elem?.returnQty || 0)), 0);
  let UDT_18 = arrOil
    .filter(l => l.item.search('UDT') > -1 && l.item.search('18 ลิตร') > -1)
    .reduce((sum, elem) => sum + (Number(elem?.qty || 0) - Numb(elem?.returnQty || 0)), 0);
  let UDT_6 = arrOil
    .filter(l => l.item.search('UDT') > -1 && l.item.search('6 ลิตร') > -1)
    .reduce((sum, elem) => sum + (Number(elem?.qty || 0) - Numb(elem?.returnQty || 0)), 0);
  let discountOil = arrOil.reduce(
    (sum, elem) => sum + (Number(elem?.discount || 0) - Numb(elem?.returnDiscount || 0)),
    0
  );
  let discountBlackGlue = arrBlackGlue.reduce(
    (sum, elem) => sum + (Number(elem?.discount || 0) - Numb(elem?.returnDiscount || 0)),
    0
  );
  let amtWage = arrWage.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let amtFreight = arrFreight.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let amtAllParts = amtPart + amtOil + amtBlackGlue;
  let discount = arr.reduce((sum, elem) => sum + (Number(elem?.discount || 0) - Numb(elem?.returnDiscount || 0)), 0);
  let amtOther = 0;
  let discountOther = 0;
  let totalBeforeVat = amtWage + amtAllParts + amtFreight + amtOther - discount - discountOther;
  let VAT = (totalBeforeVat - totalBeforeVat / 1.07).toFixed(2);
  let total = arr.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let returnTotal = arr.reduce((sum, elem) => sum + Numb(elem?.returnTotal || 0), 0);
  let advance = arr.reduce((sum, elem) => sum + Numb(elem?.advance || 0), 0);
  let cash = values.payments
    .filter(l => l.paymentType === 'cash')
    .reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0);
  let moneyTransfer = values.payments
    .filter(l => l.paymentType === 'transfer')
    .reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0);
  return {
    amtWage,
    amtFreight,
    amtOil,
    amtBlackGlue,
    amtAllParts,
    amtPart,
    amtOther,
    discountPart,
    discountOil,
    discountBlackGlue,
    discountOther,
    discount,
    totalBeforeVat,
    advance,
    returnTotal,
    total,
    VAT,
    cash,
    moneyTransfer,
    CF4_3,
    CF4_6,
    UDT_18,
    UDT_6
  };
};

export const getServiceSumData = values => {
  const { amtWage, amtAllParts, amtOther, discount, discountOther, VAT, total } = values;
  let total1 = amtWage + amtAllParts + amtOther;
  let total2 = total1 - discount - discountOther;
  return [
    {
      item: 'ค่าแรง',
      value: amtWage
    },
    {
      item: 'ค่าอะไหล่',
      value: amtAllParts
    },
    {
      item: 'ค่าใช้จ่ายอื่นๆ',
      value: amtOther
    },
    {
      item: 'ยอดเงินรวม',
      value: total1,
      text: 'primary'
    },
    {
      item: 'รวมส่วนลด',
      value: discount
    },
    {
      item: 'รวมส่วนลดอื่นๆ',
      value: discountOther
    },
    {
      item: 'รวมทั้งสิ้น',
      value: total2,
      text: 'primary'
    },
    {
      item: 'ภาษีมูลค่าเพิ่ม',
      value: VAT
    },
    {
      item: 'รวมยอดสุทธิ',
      value: total
    }
  ];
};
