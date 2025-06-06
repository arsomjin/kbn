import { ExpectToBuy } from 'data/Constant';
import moment from 'moment';

export const createCustomerNo = (branchCode, TS, suffix = 'KBN-CUS') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}-${branchCode || ''}${moment(TS).format('YYYYMMDD')}${padLastNo}`;
  return orderId;
};

const initCustomer = {
  customerId: null,
  prefix: 'นาย',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  idNumber: '',
  career: '',
  address: {
    address: '',
    moo: '',
    village: '',
    tambol: '',
    amphoe: '',
    province: 'นครราชสีมา',
    postcode: ''
  },
  url: null,
  plants: [],
  areaSize: '',
  ownedModel: '',
  interestedModel: '',
  customerLevel: '',
  branch: '0450',
  sourceOfData: [],
  agent: '',
  remark: ''
};

export const getInitValues = (selectedCustomer, user, branchCode) => {
  let customerNo = createCustomerNo(branchCode);
  return {
    ...initCustomer,
    ...selectedCustomer,
    customerNo: selectedCustomer.customerNo || customerNo,
    customerId: selectedCustomer.customerId || customerNo,
    referrer:
      selectedCustomer.referrer && selectedCustomer.referrer?.firstName
        ? selectedCustomer.referrer
        : {
            referrerId: null,
            prefix: 'นาย',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: {
              address: '',
              moo: '',
              village: '',
              tambol: '',
              amphoe: '',
              province: 'นครราชสีมา',
              postcode: ''
            }
          },
    isNewReferrer: !(selectedCustomer.referrer && selectedCustomer.referrer?.firstName),
    agentId: selectedCustomer.agentId || user.uid,
    whenToBuy: selectedCustomer?.whenToBuy || ExpectToBuy.thisMonth,
    whenToBuyRange: selectedCustomer?.whenToBuyRange || {
      range: [moment().format('YYYY-MM-DD'), moment().add(1, 'month').format('YYYY-MM-DD')],
      months: [moment().format('YYYY-MM'), moment().add(1, 'month').format('YYYY-MM')]
    }
  };
};
