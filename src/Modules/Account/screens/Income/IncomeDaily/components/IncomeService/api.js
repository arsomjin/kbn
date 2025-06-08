import dayjs from 'dayjs';
import { StatusMap } from 'data/Constant';
import { getItemId } from 'Modules/Account/api';
import { Numb } from 'functions';

export const getInitialItems = income => [
  {
    id: 1,
    incomeItemId: getItemId(),
    incomeId: income?.orderId,
    item: null,
    description: '',
    status: StatusMap.pending,
    _key: ''
  }
];

const InitValue = {
  incomeNo: '',
  date: undefined,
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  incomeType: 'outsideCare',
  kbnReceipt: null,
  workOrder: null,
  vehicleNo: [],
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
  vehicleRegNumber: '',
  amtDuringDay: null,
  receiverDuringDay: 'KBN10002'
};

export const getInitialValues = income => {
  if (income?.created) {
    return income;
  }
  return {
    ...InitValue,
    incomeId: income?.incomeId,
    items: getInitialItems(income),
    serviceDate: income?.serviceDate ? dayjs(income.serviceDate, 'YYYY-MM-DD') : undefined
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
