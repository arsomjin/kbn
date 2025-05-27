import dayjs from 'dayjs';

/**
 * Create a unique referrer number with timestamp and random suffix
 * @param {number} TS - Timestamp
 * @param {string} suffix - Suffix for the referrer number
 * @returns {string} Generated referrer number
 */
export const createReferrerNo = (TS = Date.now(), suffix = 'KBN-REF') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(4) + lastNo).slice(-5);
  const referrerId = `${suffix}-${dayjs(TS).format('YYYYMMDD')}${padLastNo}`;
  return referrerId;
};
