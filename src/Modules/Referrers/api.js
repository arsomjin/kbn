import moment from 'moment';

export const createReferrerNo = (TS, suffix = 'KBN-REF') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}-${moment(TS).format('YYYYMMDD')}${padLastNo}`;
  return orderId;
};
