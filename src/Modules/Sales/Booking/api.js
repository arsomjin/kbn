import React from 'react';
import { StatusMap } from 'data/Constant';
import { Numb } from 'functions';
import { parser, showLog } from 'functions';
import { getItemId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import numeral from 'numeral';

// Create static current month to prevent infinite re-renders
const CURRENT_MONTH = dayjs().format('YYYY-MM');

export const getInitialItems = (book, branchCode) => [
  {
    id: 1,
    bookItemId: getItemId('BOOK-VEH'),
    bookId: book?.bookId,
    vehicleItemType: 'vehicle',
    // itemCategory: OrderVehicleItemType.tractor,
    productName: '',
    productCode: '',
    // productType: null,
    vehicleType: null,
    vehicleNo: [],
    peripheralNo: [],
    engineNo: [],
    detail: '',
    qty: 1,
    unitPrice: 0,
    total: 0,
    status: StatusMap.pending,
    _key: '',
    isEquipment: false,
    isUsed: false,
    sourceOfData: [],
    branchCode
  }
];

const InitValue = {
  bookNo: null,
  refNo: null,
  salesPerson: [],
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  address: {
    address: '',
    moo: '',
    village: '',
    tambol: '',
    amphoe: '',
    province: 'นครราชสีมา',
    postcode: ''
  },
  assessment: {
    date: null,
    details: null,
    result: null
  },
  isNewReferrer: true,
  referrer: {
    referrerId: null,
    prefix: 'นาย',
    firstName: null,
    lastName: null,
    phoneNumber: '',
    address: {
      address: null,
      moo: null,
      village: null,
      tambol: null,
      amphoe: null,
      province: null,
      postcode: null
    }
  },
  saleType: 'cash',
  isEquipment: false,
  isUsed: false,
  date: undefined,
  amtReceived: null,
  amtFull: null,
  downPayment: null,
  advInstallment: null,
  amtSKC: null,
  amtOldCustomer: null,
  amtMAX: null,
  amtKBN: null,
  promotions: [],
  proMonth: CURRENT_MONTH,
  amtPro: null,
  deductOther: null,
  deductOthers: [],
  amtReferrer: null,
  amtTurnOver: null,
  amtTurnOverDifRefund: null,
  amtTurnOverVehicle: null,
  // turnOverVehicleYear: undefined,
  // turnOverVehicleModel: null,
  // turnOverVehicleNo: null,
  // turnOverEngineNo: null,
  // turnOverVehicleWorkHours: null,
  // turnOverVehiclePeripherals: [],
  turnOverFix: false,
  turnOverFixMAX: null,
  turnOverFixKBN: null,
  turnOverDocs: [],
  turnOverCloseInstallment: null,
  turnOverItems: [],
  oweKBNLeasing: null,
  giveaways: [],
  additionalPurchase: [],
  total: null,
  payments: [],
  depositor: null,
  remark: null,
  bookingPerson: null,
  receiverEmployee: null,
  ivAdjusted: false,
  sourceOfData: []
};

export const initReferringDetails = {
  relationship: '',
  approvedBy: '',
  amount: null,
  whTax: null,
  total: null,
  bankAcc: '',
  bankName: '',
  bank: '',
  forBranch: {
    requestBy: '',
    branchAccountant: '',
    branchManager: ''
  },
  forHQ: {
    creditClerk: '',
    creditCheckDate: undefined,
    hqAccountant: '',
    hqAccountAuditor: '',
    hqAuditor: '',
    hqAuditorDate: undefined,
    amtTransfer: null,
    sendTransferDate: undefined,
    actualTransferDate: undefined
  }
};

export const getInitialValues = (book, user) => {
  let amount = book?.amtReferrer || null;
  let refWHTax = book?.amtReferrer ? Numb(parser(book.amtReferrer)) * 0.05 : null;
  let refTotal = book?.amtReferrer ? Numb(parser(book.amtReferrer)) - refWHTax : null;
  if (book && book.created) {
    return {
      ...InitValue,
      ...book,
      ...(!book?.referringDetails && {
        referringDetails: {
          ...initReferringDetails,
          branchCode: book.branchCode,
          date: book.date,
          amount,
          whTax: refWHTax,
          total: refTotal
        }
      })
    };
  }
  const mBranch = book && book.branchCode ? book.branchCode : user.homeBranch || (user?.allowedBranches?.[0]) || '0450';

  return {
    ...InitValue,
    bookId: book?.bookId,
    items: getInitialItems(book, mBranch),
    branchCode: mBranch,
    ...(book?.guarantor && { guarantor: book.guarantor }),
    ...(book?.referrer && { referrer: book.referrer }),
    ...(book?.referringDetails
      ? { referringDetails: book.referringDetails }
      : {
          referringDetails: {
            ...initReferringDetails,
            branchCode: mBranch,
            date: undefined,
            amount,
            whTax: refWHTax,
            total: refTotal
          }
        })
  };
};

export const arrayInputColumns = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'total',
    placeholder: 'จำนวนเงิน',
    number: true,
    required: true,
    align: 'right'
  }
];

export const arrayInputColumns2 = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'unit',
    placeholder: 'หน่วย',
    align: 'center'
  },
  {
    name: 'qty',
    placeholder: 'จำนวน',
    number: true,
    align: 'center'
  },
  {
    name: 'unitPrice',
    placeholder: 'ราคาต่อหน่วย',
    number: true,
    align: 'right'
  },
  {
    name: 'total',
    placeholder: 'รวม',
    number: true,
    align: 'right'
  }
];

export const printColumns = [
  {
    title: 'รายละเอียด',
    dataIndex: 'productName',
    key: 'productName',
    width: '40%'
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    key: 'qty',
    width: '10%',
    align: 'center'
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: '10%',
    align: 'right',
    render: text => numeral(text).format('0,0.00')
  },
  {
    title: 'ส่วนลด',
    dataIndex: 'discount',
    key: 'discount',
    width: '10%',
    align: 'right',
    render: text => numeral(text).format('0,0.00')
  },
  {
    title: 'ยอดรวม',
    width: '10%',
    render: (text, record) => {
      showLog({ record, qty: Numb(record.qty), price: Numb(record.unitPrice) });
      return <div>{numeral(Numb(record.qty) * Numb(record.unitPrice) - Numb(record.discount)).format('0,0.00')}</div>;
    },
    align: 'right'
  }
];
