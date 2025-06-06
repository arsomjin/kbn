import { StatusMap } from 'data/Constant';
import { getArrayChanges } from 'functions';
import { arrayForEach } from 'functions';
import { getChanges } from 'functions';
import { Numb } from 'functions';
import { getItemId } from 'Modules/Account/api';
import moment from 'moment-timezone';

const InitValue = {
  date: undefined,
  saleNo: null,
  isNewCustomer: true,
  customerId: null,
  customerNo: null,
  prefix: 'นาย',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  saleType: 'partSKC',
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
  remark: ''
};

export const getInitialItems = (sale, branchCode) => [
  {
    id: 1,
    saleItemId: getItemId('SALE-PART'),
    saleId: sale?.saleId,
    productName: '',
    pCode: '',
    partType: null,
    detail: '',
    qty: 1,
    unitPrice: 0,
    total: 0,
    status: StatusMap.pending,
    _key: '',
    branchCode
  }
];

export const getInitialValues = (sale, user) => {
  if (sale && sale.created) {
    return {
      ...InitValue,
      ...sale
    };
  }
  const mBranch = sale && sale.branchCode ? sale.branchCode : user.branch || '0450';
  return {
    ...InitValue,
    saleId: sale?.saleId,
    items: getInitialItems(sale, mBranch),
    branchCode: mBranch
  };
};

export const _getNetIncomeFromValues = values => {
  let amtOther = (values?.amtOthers || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
  let deductOther = (values?.deductOthers || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);

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

export const onConfirmSaleOrder = ({ values, category, order, isEdit, user, firestore, api }) =>
  new Promise(async (r, j) => {
    try {
      // showLog('confirm_values', values);
      let mValues = JSON.parse(JSON.stringify(values));
      mValues.saleCategory = 'daily';
      mValues.saleSubCategory = category;
      mValues.date = order?.date ? order.date : moment(values.date).format('YYYY-MM-DD');
      if (isEdit) {
        let changes = getChanges(order, values);
        if (order.items && values.items) {
          const itemChanges = getArrayChanges(order.items, values.items);
          if (itemChanges) {
            changes = [...changes, ...itemChanges];
          }
        }
        mValues.editedBy = !!order.editedBy
          ? [...order.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
      } else {
        mValues.created = moment().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }
      // Add order items.
      if (mValues.items && mValues.items.length > 0) {
        await arrayForEach(mValues.items, async item => {
          delete item.id;
          delete item.key;
          const saleItemRef = firestore
            .collection('sections')
            .doc('sales')
            .collection('salePartItems')
            .doc(item.saleItemId);
          await saleItemRef.set(item);
        });
        // delete mValues.items;
      }
      // showLog('ITEM_DONE');
      const saleRef = firestore.collection('sections').doc('sales').collection('parts_input');
      const updateFields = {
        creditRecorded: null,
        accountRecorded: null,
        registered: null
      };
      mValues = { ...mValues, ...updateFields };
      // Add sale order.
      const docSnap = await saleRef.doc(values.saleId).get();
      if (docSnap.exists) {
        saleRef.doc(values.saleId).update(mValues);
      } else {
        saleRef.doc(values.saleId).set(mValues);
      }
      // showLog('ORDER_DONE');
      // Record log.
      api.addLog(
        isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.saleId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.saleId
            },
        'sales',
        'parts_input'
      );
      // showLog('LOG_DONE');
      r(true);
    } catch (e) {
      j(e);
    }
  });
