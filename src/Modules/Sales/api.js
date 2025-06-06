import { MapVehicleStatus } from 'data/Constant';
import { StatusMap } from 'data/Constant';
import { checkDoc } from 'firebase/api';
import { getChanges } from 'functions';
import { parser } from 'functions';
import { arrayForEach } from 'functions';
import { getArrayChanges } from 'functions';
import moment from 'moment';

export const createNewSaleOrderId = (suffix = 'SALE-VEH') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}${moment().format('YYYYMMDD')}${padLastNo}`;
  return orderId;
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
            .collection('saleItems')
            .doc(item.saleItemId);
          await saleItemRef.set(item);
        });
        // delete mValues.items;
      }
      // showLog('ITEM_DONE');
      const saleRef = firestore.collection('sections').doc('sales').collection('vehicles');
      const updateFields = {
        creditRecorded: null,
        accountRecorded: null,
        registered: null
      };
      // Add sale order.
      const docSnap = await saleRef.doc(values.saleId).get();
      if (docSnap.exists) {
        saleRef.doc(values.saleId).update(mValues);
      } else {
        saleRef.doc(values.saleId).set({ ...mValues, ...updateFields });
      }
      // showLog('ORDER_DONE');
      // Update item in stock.
      if (mValues.items && !['other'].includes(mValues.saleType)) {
        await updateStockItem(mValues, api);
      }
      // showLog('STOCK_ITEM_DONE');
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
        'vehicles'
      );
      // showLog('LOG_DONE');
      r(true);
    } catch (e) {
      j(e);
    }
  });

export const onConfirmBookingOrder = ({ values, category, order, isEdit, user, firestore, api }) =>
  new Promise(async (r, j) => {
    try {
      //  showLog('confirm_values', values);
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
          const bookItemRef = firestore
            .collection('sections')
            .doc('sales')
            .collection('bookItems')
            .doc(item.bookItemId);
          await bookItemRef.set(item);
        });
        // delete mValues.items;
      }
      const bookRef = firestore.collection('sections').doc('sales').collection('bookings');
      const updateFields = {
        creditRecorded: null,
        accountRecorded: null,
        canceled: null
      };
      // Add sale order.
      const docSnap = await bookRef.doc(values.bookId).get();
      if (docSnap.exists) {
        bookRef.doc(values.bookId).update(mValues);
      } else {
        bookRef.doc(values.bookId).set({ ...mValues, ...updateFields });
      }
      // Update item in stock.
      if (mValues.items && !['other'].includes(mValues.saleType)) {
        await updateStockItem(mValues, api);
      }

      // Record log.
      api.addLog(
        isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.bookId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.bookId
            },
        'sales',
        'bookings'
      );
      r(true);
    } catch (e) {
      j(e);
    }
  });

const updateStockItem = (mValues, api) =>
  new Promise(async (r, j) => {
    try {
      let vArr = [];
      let pArr = [];
      let mStatus = MapVehicleStatus[mValues.saleType];
      await arrayForEach(mValues.items, async it => {
        let vehicleArr = !!it.vehicleNo ? (Array.isArray(it.vehicleNo) ? it.vehicleNo : it.vehicleNo.split(',')) : [];
        let peripheralArr = !!it.peripheralNo
          ? Array.isArray(it.peripheralNo)
            ? it.peripheralNo
            : it.peripheralNo.split(',')
          : [];
        vehicleArr.map(vIt => {
          vArr = [...vArr, { vehicleNo: vIt, mStatus }];
          return vIt;
        });
        peripheralArr.map(pIt => {
          pArr = [...pArr, { peripheralNo: pIt, mStatus }];
          return pIt;
        });
      });
      if (vArr.length > 0) {
        await arrayForEach(
          vArr.filter(l => !!l.vehicleNo),
          async uIt => {
            const itemExists = await checkDoc('sections', `stocks/vehicles/${parser(uIt.vehicleNo)}`);
            if (itemExists) {
              await api.updateItem(
                {
                  [mStatus]: true,
                  bookId: mValues.bookId
                },
                'sections/stocks/vehicles',
                parser(uIt.vehicleNo)
              );
            }
          }
        );
      }
      if (pArr.length > 0) {
        await arrayForEach(
          pArr.filter(l => !!l.peripheralNo),
          async uIt => {
            const itemExists = await checkDoc('sections', `stocks/peripherals/${parser(uIt.peripheralNo)}`);
            if (itemExists && ['reserved', 'sold'].includes(mStatus)) {
              await api.updateItem(
                {
                  [mStatus]: true,
                  bookId: mValues.bookId
                },
                'sections/stocks/peripherals',
                parser(uIt.peripheralNo)
              );
            }
          }
        );
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });
