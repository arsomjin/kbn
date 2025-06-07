import React from 'react';
import { Col, Row } from 'shards-react';
import { Form } from 'antd';
import DocSelector from 'components/DocSelector';
import { getSearchData } from 'firebase/api';
import { SearchOutlined } from '@ant-design/icons';
import { showLog } from 'functions';

export const searchKeys = {
  saleNo: null,
  bookNo: null
};

const InitValue = {
  incomeId: null,
  isNewCustomer: true,
  customerId: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  amtReceived: null,
  amtBaacDebtor: null,
  amtPlateAndInsurance: null,
  amtSKLInstallment: null,
  amtTurnOver: null,
  oweKBNLeasings: {
    Down: null,
    Installment: null,
    Equipment: null,
    Borrow: null,
    overdueFines: null
  },
  amtOthers: [],
  deductOthers: [],
  payments: [],
  total: 0,
  recordedBy: null,
  amtDuringDay: null,
  receiverDuringDay: 'KBN10002',
  remark: null
};

export const getInitialValues = income => {
  if (income?.created) {
    return { ...income };
  }
  return {
    ...InitValue,
    // items: getInitialItems(income, mBranch),
    incomeId: income?.incomeId
  };
};

export const getSalesData = (sValues, isSaleNo) =>
  new Promise(async (r, j) => {
    try {
      let mData = [];
      if (sValues?.saleNo && sValues.saleNo !== 'all') {
        mData = await getSearchData('sections/sales/vehicles', { saleNo: sValues.saleNo }, ['saleNo', 'date']);
      }
      mData = mData
        .filter(l => !['reservation', 'other'].includes(l.saleType))
        .map((item, id) => {
          let vehicleNo = [];
          let peripheralNo = [];
          item?.items &&
            item.items.map(it => {
              vehicleNo = !it.vehicleNo
                ? vehicleNo
                : Array.isArray(it.vehicleNo)
                  ? [...vehicleNo, ...it.vehicleNo]
                  : [...vehicleNo, it.vehicleNo];
              peripheralNo = !it.peripheralNo
                ? peripheralNo
                : Array.isArray(it.peripheralNo)
                  ? [...peripheralNo, ...it.peripheralNo]
                  : [...peripheralNo, it.peripheralNo];
              return it;
            });
          return {
            ...item,
            productCode: item.items[0].productCode,
            vehicleNo,
            peripheralNo,
            id
          };
        });
      r(mData);
    } catch (e) {
      j(e);
    }
  });

export const getBookingData = sValues =>
  new Promise(async (r, j) => {
    try {
      let mData = [];
      if (sValues?.bookNo && sValues.bookNo !== 'all') {
        mData = await getSearchData('sections/sales/bookings', { bookNo: sValues.bookNo }, ['bookNo', 'date']);
      }
      mData = mData.map((item, id) => {
        let vehicleNo = [];
        let peripheralNo = [];
        item?.items &&
          item.items.map(it => {
            vehicleNo = !it.vehicleNo
              ? vehicleNo
              : Array.isArray(it.vehicleNo)
                ? [...vehicleNo, ...it.vehicleNo]
                : [...vehicleNo, it.vehicleNo];
            peripheralNo = !it.peripheralNo
              ? peripheralNo
              : Array.isArray(it.peripheralNo)
                ? [...peripheralNo, ...it.peripheralNo]
                : [...peripheralNo, it.peripheralNo];
            return it;
          });
        return {
          ...item,
          productCode: item.items[0].productCode,
          vehicleNo,
          peripheralNo,
          id,
          refNo: item.bookNo,
          salesPerson: Array.isArray(item.salesPerson) ? item.salesPerson : [item.salesPerson],
          bookDate: item.date,
          amtReservation: item.total,
          amtDeposit: item.amtReceived,
          amtTurnOver: item.amtTurnOver,
          amtReceived: item.downPayment,
          depositPayments: item.payments,
          reservationDepositor: item.depositor,
          bookingPerson: Array.isArray(item.bookingPerson) ? item.bookingPerson : [item.bookingPerson]
        };
      });
      r(mData);
    } catch (e) {
      j(e);
    }
  });

export const RenderSearch = ({ type }) => {
  // showLog({ type });
  return (
    <div className="border bg-light px-3 pt-3 mb-3">
      <Row>
        {type !== 'reservation' && (
          <Col md="6">
            <Form.Item
              name="saleNo"
              label={
                <span className="text-muted">
                  <SearchOutlined className="text-primary" /> ค้นหาจาก เลขที่ใบขายสินค้า/ชื่อลูกค้า
                  {'   '}
                  <label className="text-warning">(ฝ่ายขายต้องบันทึกใบขายก่อน)</label>
                </span>
              }
            >
              <DocSelector
                collection="sections/sales/vehicles"
                orderBy={['saleNo', 'firstName']}
                labels={['saleNo', 'firstName', 'lastName']}
                size="small"
                hasKeywords
                className="text-muted"
              />
            </Form.Item>
          </Col>
        )}
        <Col md="6">
          <Form.Item
            name="bookNo"
            label={
              <span className="text-muted">
                <SearchOutlined className="text-primary" /> ค้นหาจาก เลขที่ใบจอง/ชื่อลูกค้า{'   '}
                (ช่องนี้ใช้สำหรับ
                <label className="text-danger">รับเงินจอง</label>เท่านั้น)
              </span>
            }
          >
            <DocSelector
              collection="sections/sales/bookings"
              orderBy={['bookNo', 'firstName']}
              labels={['bookNo', 'firstName', 'lastName']}
              size="small"
              hasKeywords
              className="text-muted"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
