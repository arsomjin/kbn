import { checkCollection } from 'firebase/api';
import { Numb } from 'functions';
import { parser } from 'functions';
import { uniq } from 'lodash';
import { createNewOrderId } from 'Modules/Account/api';
import { initReferringDetails } from 'Modules/Sales/Vehicles/api';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';

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

export const initCreditValues = {
  date: undefined,
  creditId: null,
  creditNo: null,
  saleCutoffDate: undefined,
  customerId: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  contractDeliverDate: undefined,
  contractAmtReceivedDate: undefined,
  contractAmtReceivedBank: null,
  contractAmtReceivedAccNo: null,
  amtFull: null,
  amtReceive: null,
  downPayment: null,
  totalDownDiscount: null,
  firstInstallment: null,
  amtBaacFee: null,
  amtInsurance: null,
  amtActOfLegal: null,
  loanInfoIncome: null,
  vat: null,
  wht: null,
  taxInvoice: null,
  taxInvoiceDate: undefined,
  saleId: null,
  saleNo: null,
  saleType: null,
  saleItems: [],
  inputBy: null,
  inputCreditInfoBy: null,
  remark: null
};

export const getCreditDataFromSale = sale =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      let amount = sale?.amtReferrer || null;
      let refWHTax = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) * 0.05 : null;
      let refTotal = sale?.amtReferrer ? Numb(parser(sale.amtReferrer)) - refWHTax : null;
      const hasReferrer = !!sale.referrer?.firstName;
      let itemType = !!sale?.items ? uniq(sale.items.map(it => it.vehicleType)).filter(l => !!l) : [];
      if (
        !!sale?.creditInfo &&
        removeAllNonAlphaNumericCharacters(sale?.saleNo) ===
          removeAllNonAlphaNumericCharacters(sale?.creditInfo?.saleNo)
      ) {
        result = {
          ...initCreditValues,
          ...sale.creditInfo,
          amtKBN: sale.amtKBN,
          branchCode: sale.branchCode,
          itemType
        };
      } else {
        const {
          amtOldCustomer,
          amtMAX,
          amtOther,
          amtPro,
          amtSKC,
          amtKBN,
          amtFull,
          amtReceived: downPayment,
          advInstallment: firstInstallment,
          amtBaacFee,
          baacNo,
          baacDate,
          saleId,
          saleNo,
          saleType,
          customerId,
          prefix,
          firstName,
          lastName,
          referrer,
          amtReferrer,
          referringDetails,
          branchCode
        } = sale;
        let totalDownDiscount = Numb(amtOldCustomer) + Numb(amtMAX) + Numb(amtOther) + Numb(amtPro) + Numb(amtSKC);

        let initSnap = {
          amtFull,
          downPayment,
          totalDownDiscount,
          amtKBN,
          branchCode,
          saleId,
          saleNo,
          saleType,
          customerId,
          prefix,
          firstName,
          lastName,
          referrer,
          amtReferrer,
          hasReferrer,
          referringDetails,
          sendTransferDate: referringDetails?.forHQ ? referringDetails.forHQ?.sendTransferDate || null : null,
          actualTransferDate: referringDetails?.forHQ ? referringDetails.forHQ?.actualTransferDate || null : null,
          itemType
        };

        let nCredit = initSnap;

        switch (saleType) {
          case 'baac':
            nCredit = {
              ...initSnap,
              firstInstallment,
              amtBaacFee,
              baacNo,
              baacDate
            };

            break;
          case 'sklLeasing':
          case 'kbnLeasing':
            nCredit = {
              ...initSnap,
              firstInstallment
            };
            break;
          default:
            break;
        }

        result = {
          ...initCreditValues,
          creditId: createNewOrderId('CRE-VEH'),
          ...nCredit,
          ...(hasReferrer && {
            referringDetails: !sale?.referringDetails
              ? {
                  ...initReferringDetails,
                  branchCode: sale.branchCode,
                  date: sale.date,
                  amount,
                  whTax: refWHTax,
                  total: refTotal
                }
              : sale.referringDetails
          })
        };
      }
      r({
        ...result,
        totalBeforeDeductInsurance:
          Numb(result.amtFull) -
          Numb(result.downPayment) -
          Numb(result.firstInstallment) +
          Numb(result.totalDownDiscount)
      });
    } catch (e) {
      j(e);
    }
  });

export const getNetTotal = values => {
  let nTotal;
  switch (values.saleType) {
    case 'sklLeasing':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    case 'baac':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) -
        Numb(values.amtBaacFee) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    case 'cash':
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
    default:
      nTotal =
        Numb(values.amtFull) -
        Numb(values.downPayment) +
        Numb(values.totalDownDiscount) -
        Numb(values.firstInstallment) -
        Numb(values.amtInsurance) -
        Numb(values.amtActOfLegal) +
        Numb(values.loanInfoIncome) +
        Numb(values.vat) -
        Numb(values.wht);
      break;
  }
  return nTotal;
};
