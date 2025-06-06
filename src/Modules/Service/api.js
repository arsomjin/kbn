import moment from 'moment-timezone';
import { StatusMap } from 'data/Constant';
import { getItemId } from 'Modules/Account/api';
import { Numb } from 'functions';

export const getInitialItems = service => [
  {
    id: 1,
    serviceItemId: getItemId(),
    serviceId: service?.orderId,
    item: null,
    description: '',
    status: StatusMap.pending,
    _key: ''
  }
];

const InitValue = {
  serviceNo: '',
  date: undefined,
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  serviceType: 'outsideCare',
  items: [],
  deliverDate: undefined,
  amtParts: null,
  amtOil: null,
  amtWage: null,
  amtBlackGlue: null,
  amtDistance: null,
  amtPumpCheck: null,
  amtOthers: [],
  amtOther: null,
  amtDeposit: null,
  deductDeposits: [],
  deductDeposit: null,
  depositUsed: false,
  depositRef: null,
  total: null,
  employeeId: null,
  receiverEmployee: null,
  payments: [],
  depositor: null,
  remark: '',
  technicianId: [],
  vehicleRegNumber: ''
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
