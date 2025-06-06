import moment from 'moment-timezone';
import { getItemId } from 'Modules/Account/api';
import { Numb } from 'functions';
import { initItem } from './ServiceItems';

export const getInitialItems = service => [
  {
    ...initItem,
    id: 1,
    serviceItemId: getItemId(),
    serviceId: service?.orderId,
    _key: ''
  }
];

export const initAddress = {
  address: '',
  moo: '',
  village: '',
  tambol: '',
  amphoe: '',
  province: 'นครราชสีมา',
  postcode: ''
};

export const initName = {
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null
};

const InitValue = {
  serviceNo: '',
  orderStatus: 'เปิดงาน',
  date: undefined,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  address: initAddress,
  sameName: false,
  contact: initName,
  sameAddress: false,
  serviceAddress: initAddress,
  serviceType: 'periodicCheck',
  items: [],
  total: null,
  technicianId: [],
  vehicleRegNumber: '',
  productPCode: null,
  model: null,
  vehicleType: null,
  boughDate: null,
  dealer: null,
  guaranteedEndDate: null,
  hoursOfUse: null,
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  warrantyStatus: 'ในประกัน',
  peripheralPCode: null,
  appointmentDate: undefined,
  appointmentTime: undefined,
  urgency: null,
  notifyDate: undefined,
  notifiedBy: null,
  times: 1,
  notifyChannel: null,
  redo: false,
  notifyDetails: null,
  assigner: null,
  discount: null,
  discountCouponPercent: 20
};

export const getInitialValues = service => {
  if (service?.created) {
    return service;
  }
  return {
    ...InitValue,
    serviceId: service?.serviceId,
    items: getInitialItems(service),
    serviceDate: service?.serviceDate ? moment(service.serviceDate, 'YYYY-MM-DD') : undefined
  };
};

export const _getNetIncomeFromValues = values => {
  let amtOther = (values?.amtOthers || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  return (
    Numb(values.amtParts) +
    Numb(values.amtOil) +
    Numb(values.amtWage) +
    Numb(values.amtBlackGlue) +
    Numb(values.amtDistance) +
    Numb(values.amtPumpCheck) +
    Numb(amtOther) +
    Numb(values.amtDeposit) -
    Numb(values.deductDeposit)
  );
};
