import { StatusMap } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import { Numb } from 'functions';
import { distinctArr } from 'functions';
import { parser } from 'functions';
import { showLog } from 'functions';
import { formatValuesBeforeLoad } from 'functions';
import { getItemId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import moment from 'moment';

// Create static current month to prevent infinite re-renders
const CURRENT_MONTH = dayjs().format('YYYY-MM');

export const getInitialItems = (sale, branchCode) => [
  {
    id: 1,
    saleItemId: getItemId('SALE-VEH'),
    saleId: sale?.saleId,
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

export const initGuarantor = {
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  relationship: null,
  address: {
    address: null,
    moo: null,
    village: null,
    tambol: null,
    amphoe: null,
    province: null,
    postcode: null
  }
};

export const initAddress = {
  address: '',
  moo: '',
  village: '',
  tambol: '',
  amphoe: '',
  province: 'นครราชสีมา',
  postcode: ''
};

const InitValue = {
  saleNo: null,
  refNo: null,
  salesPerson: [],
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  address: initAddress,
  guarantors: [],
  guarantorDocs: {},
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
  sourceOfData: [],
  date: undefined,
  deliverDate: undefined,
  amtReceived: null,
  amtFull: null,
  advInstallment: null,
  amtPlateAndInsurance: null,
  amtSKC: null,
  amtOldCustomer: null,
  amtMAX: null,
  amtKBN: null,
  promotions: [],
  proMonth: CURRENT_MONTH,
  amtPro: null,
  amtBaacFee: null,
  amtBaacDebtor: null,
  amtReservation: null,
  amtTurnOver: null,
  amtTurnOverDifRefund: null,
  amtTurnOverVehicle: null,
  // turnOverVehicleYear: undefined,
  // turnOverVehicleModel: null,
  // turnOverVehicleNo: null,
  // turnOverEngineNo: null,
  // turnOverVehicleWorkHours: null,
  // turnOverVehiclePeripherals: [],
  turnOverItems: [],
  turnOverFix: false,
  turnOverFixMAX: null,
  turnOverFixKBN: null,
  turnOverDocs: [],
  turnOverCloseInstallment: null,
  oweKBNLeasing: null,
  oweKBNLeasings: {
    Down: null,
    Installment: null,
    Equipment: null,
    Borrow: null,
    overdueFines: null
  },
  amtReferrer: null,
  amtOther: null,
  amtOthers: [],
  deductOther: null,
  deductOthers: [],
  giveaways: [],
  additionalPurchase: [],
  total: null,
  amtDeposit: null,
  depositPayments: [],
  reservationDepositor: null,
  payments: [],
  depositor: null,
  remark: null,
  baacNo: null,
  baacDate: undefined,
  bookingPerson: null,
  receiverEmployee: null,
  ivAdjusted: false,
  bookId: '',
  bookNo: '',
  contractDate: undefined
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

export const getInitialValues = (sale, user) => {
  let amount = sale?.amtReferrer || null;
  let refWHTax = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) * 0.05 : null;
  let refTotal = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) - refWHTax : null;
  if (sale && sale.created) {
    return {
      ...InitValue,
      ...sale,
      ...(!sale?.referringDetails && {
        referringDetails: {
          ...initReferringDetails,
          branchCode: sale.branchCode,
          date: sale.date,
          amount,
          whTax: refWHTax,
          total: refTotal
        }
      })
    };
  }
  const mBranch = sale && sale.branchCode ? sale.branchCode : user.homeBranch || (user?.allowedBranches?.[0]) || '0450';
  return {
    ...InitValue,
    saleId: sale?.saleId,
    items: getInitialItems(sale, mBranch),
    branchCode: mBranch,
    ...(sale?.guarantors && { guarantors: sale.guarantors }),
    ...(sale?.referrer && { referrer: sale.referrer }),
    ...(sale?.referringDetails
      ? { referringDetails: sale.referringDetails }
      : {
          referringDetails: {
            ...initReferringDetails,
            branchCode: mBranch,
            date: moment(),
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

export const giveAwayInputColumns = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'unit',
    placeholder: 'หน่วย',
    align: 'right'
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

export const onReservaionSelect = (refNo, values, form) =>
  new Promise(async (r, j) => {
    try {
      let saleSnap = await checkCollection('sections/sales/bookings', [['bookNo', '==', refNo]]);

      if (saleSnap) {
        saleSnap.forEach(sale => {
          let dbValues = formatValuesBeforeLoad(sale.data());
          let setValue = {
            ...values,
            ...dbValues,
            refNo: dbValues.bookNo,
            salesPerson: Array.isArray(dbValues.salesPerson) ? dbValues.salesPerson : [dbValues.salesPerson],
            bookDate: dbValues.date,
            amtReservation: dbValues.total,
            amtDeposit: dbValues.amtReceived,
            amtReceived: dbValues.downPayment,
            depositPayments: dbValues.payments,
            reservationDepositor: dbValues.depositor,
            bookingPerson: Array.isArray(dbValues.bookingPerson) ? dbValues.bookingPerson : [dbValues.bookingPerson]
          };
          form.setFieldsValue({
            ...values,
            ...dbValues,
            refNo: dbValues.bookNo,
            salesPerson: Array.isArray(dbValues.salesPerson) ? dbValues.salesPerson : [dbValues.salesPerson],
            bookDate: dbValues.date,
            amtReservation: dbValues.total,
            amtDeposit: dbValues.amtReceived,
            amtReceived: dbValues.downPayment,
            depositPayments: dbValues.payments,
            reservationDepositor: dbValues.depositor,
            bookingPerson: Array.isArray(dbValues.bookingPerson) ? dbValues.bookingPerson : [dbValues.bookingPerson]
          });
        });
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });

export const _getProTotal = dArr => {
  let promotions = dArr.filter(l => !!l);
  if (promotions.length > 0) {
    return promotions.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  } else {
    return 0;
  }
};

export const _getDeductTotal = dArr => {
  let deductOthers = dArr.filter(l => !!l);
  if (deductOthers.length > 0) {
    return deductOthers.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  } else {
    return 0;
  }
};

export const _getOtherTotal = dArr => {
  let amtOthers = dArr.filter(l => !!l);
  if (amtOthers.length > 0) {
    return amtOthers.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  } else {
    return 0;
  }
};

export const _getAdditionalPurchaseTotal = dArr => {
  let additionalPurchase = dArr.filter(l => !!l);
  if (additionalPurchase.length > 0) {
    return additionalPurchase.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  } else {
    return 0;
  }
};

export const _getNetIncomeFromValues = values => {
  const amtPro = (values?.promotions || []).reduce((sum, elem) => sum + Numb(elem?.total), 0);
  const amtDeduct = (values?.deductOthers || []).reduce((sum, elem) => sum + Numb(elem?.total), 0);
  const amtOther = (values?.amtOthers || []).reduce((sum, elem) => sum + Numb(elem?.total), 0);
  const amtKBNLeasing = Object.keys(values?.oweKBNLeasings || {}).reduce(
    (sum, elem) => sum + Numb(values.oweKBNLeasings[elem]),
    0
  );
  const amtAdditionalPurchase = (values?.additionalPurchase || []).reduce((sum, elem) => sum + Numb(elem?.total), 0);

  // showLog({ values });
  //  showLog({ values, amtPro, amtDeduct, amtKBNLeasing, amtOther });

  return (
    Numb(values.amtReceived) +
    Numb(values.advInstallment) +
    Numb(values.amtPlateAndInsurance) +
    Numb(amtKBNLeasing) +
    Numb(amtOther) +
    Numb(amtAdditionalPurchase) +
    Numb(values.amtTurnOverDifRefund) +
    (!['kbnLeasing'].includes(values.saleType) ? Numb(values.oweKBNLeasing) : 0) -
    Numb(values.amtSKC) -
    Numb(values.amtOldCustomer) -
    Numb(values.amtMAX) -
    Numb(amtPro) -
    Numb(values.amtKBN) -
    Numb(values.amtReservation) -
    Numb(values.amtTurnOver) -
    Numb(values.amtBaacFee) -
    Numb(values.amtBaacDebtor) -
    // Numb(values.amtReferrer) -
    Numb(amtDeduct)
  );
};

export const _getPaymentFromAdditionalPurchase = dat => {
  let result = distinctArr(dat, ['buyType'], ['total']).map((it, id) => ({
    id,
    paymentType: it?.buyType && it.buyType === 'cash' ? 'cash' : null,
    amount: it.total,
    key: id,
    person: null,
    personName: null,
    selfBank: null
  }));

  showLog({ result });
  return result;
};

export const hasNoVehicleOrEngineNumber = mItems => {
  let arr = mItems.filter(l => {
    let isVehicle =
      [
        'รถแทรกเตอร์',
        'รถแทรกเตอร์-ยี่ห้ออื่น',
        'รถเกี่ยวนวดข้าว',
        'รถเกี่ยว-ยี่ห้ออื่น',
        'รถขุด',
        'รถขุด-ยี่ห้ออื่น',
        'รถดำนา',
        'รถหยอดข้าว',
        'รถปลูกผัก',
        // 'โดรน',
        'โดรนการเกษตร',
        // 'อะไหล่โดรน',
        // 'อุปกรณ์',
        'เครื่องยนต์'
        // 'ของแถม',
      ].indexOf(l.vehicleType) > -1;
    let isEngine = ['เครื่องยนต์'].indexOf(l.vehicleType) > -1;
    if (isVehicle) {
      return l.vehicleNo.length === 0 || l.engineNo.length === 0;
    } else if (isEngine) {
      return l.engineNo.length === 0;
    } else {
      return false;
    }
  });
  return arr.length > 0;
};

export const hasNoPeripheralNumber = mItems => {
  let arr = mItems.filter(l => {
    let isEquipment = ['อุปกรณ์'].indexOf(l.vehicleType) > -1;
    if (isEquipment) {
      return l.peripheralNo.length === 0;
    } else {
      return false;
    }
  });
  return arr.length > 0;
};
