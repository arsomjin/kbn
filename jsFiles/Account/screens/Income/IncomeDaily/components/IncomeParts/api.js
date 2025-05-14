import { Numb } from 'functions';

const InitValue = {
  incomeNo: '',
  date: undefined,
  docNo: null,
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  incomeType: 'partSKC',
  deliverDate: undefined,
  amtReceived: null,
  billCounted: null,
  partsDeposit: null,
  amtIntake: null,
  amtFieldMeter: null,
  amtBattery: null,
  amtGPS: null,
  amtTyre: null,
  amtOther: null,
  amtOthers: [],
  deductOther: null,
  deductOthers: [],
  total: null,
  receiverEmployee: null,
  payments: [],
  depositor: null,
  remark: '',
  amtDuringDay: null,
  receiverDuringDay: 'KBN10002',
};

export const getInitialValues = (income) => {
  if (income?.created) {
    return income;
  }
  return {
    ...InitValue,
    incomeId: income?.incomeId,
  };
};

export const _getNetIncomeFromValues = (values) => {
  let amtOther = (values?.amtOthers || []).reduce(
    (sum, elem) => sum + Numb(elem?.total || 0),
    0
  );
  let deductOther = (values?.deductOthers || []).reduce(
    (sum, elem) => sum + Numb(elem?.total || 0),
    0
  );

  return (
    Numb(values.amtReceived) +
    Numb(values.amtIntake) +
    Numb(values.amtFieldMeter) +
    Numb(values.amtBattery) +
    Numb(values.amtGPS) +
    Numb(values.amtTyre) +
    Numb(amtOther) -
    Numb(deductOther) -
    Numb(values.partsDeposit)
  );
};
