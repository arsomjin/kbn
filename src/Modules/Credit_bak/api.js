import { checkCollection } from 'firebase/api';

export const checkCreditDataExists = sale =>
  new Promise(async (r, j) => {
    try {
      if (!sale?.saleId) {
        return r(false);
      }
      const cExists = await checkCollection('sections/credits/credits', [['saleId', '==', sale.saleId]]);
      let result = {};
      if (cExists) {
        cExists.forEach(doc => {
          result = doc.data();
        });
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });
