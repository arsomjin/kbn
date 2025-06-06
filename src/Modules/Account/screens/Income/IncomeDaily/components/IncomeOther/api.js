import { Numb } from 'functions';

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
  amtRebate: null,
  amtExcess: null,
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
  receiverDuringDay: 'KBN10002'
};

export const getInitialValues = income => {
  if (income?.created) {
    return income;
  }
  return {
    ...InitValue,
    incomeId: income?.incomeId
  };
};

export const _getNetIncomeFromValues = values => {
  let amtOther = (values?.amtOthers || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let deductOther = (values?.deductOthers || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  return Numb(values.amtRebate) + Numb(values.amtExcess) + Numb(amtOther) - Numb(deductOther);
};
