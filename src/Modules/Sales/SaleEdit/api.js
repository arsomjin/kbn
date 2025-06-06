import { checkCollection } from 'firebase/api';
import { showAlert, dateToThai } from 'functions';
import { getArrayChanges, getChanges, showLog, formatValuesBeforeLoad, arrayForEach } from 'functions';
import moment from 'moment-timezone';

export const onSaleSelect = (refNo, values, form, user) =>
  new Promise(async (r, j) => {
    let branch = user?.branch || user?.branchCode;
    let department = user?.department;
    let grantUid = ['Kbc9EYYgExW0BX7YvFkYDEXXFO82'];
    let granted = grantUid.includes(user.uid) || (department === 'dep0009' && branch === '0450') || user?.isDev;
    if (!granted) {
      showAlert('จำกัดสิทธิ์', 'เฉพาะสินเชื่อสำนักงานใหญ่และผู้ที่ได้รับอนุญาต', 'warning');
      r(false);
      return;
    }
    try {
      let saleSnap = await checkCollection('sections/sales/vehicles', [['saleNo', '==', refNo]]);

      if (saleSnap) {
        saleSnap.forEach(sale => {
          let saleCutoffDate = sale.data()?.saleCutoffDate;
          let accountRecorded = sale.data()?.accountRecorded;
          if (!!saleCutoffDate) {
            // sale has been cutoff!
            return showAlert(
              'บันทึกตัดขายแล้ว',
              `ใบสั่งขายเลขที่ ${refNo} มีการบันทึกตัดขายแล้ว (ตัดขายวันที่ ${dateToThai(
                sale.data()?.saleCutoffDate
              )})`,
              'warning'
            );
          }
          if (!!accountRecorded) {
            // sale has been recorded by account dep!
            return showAlert(
              'บัญชีบันทึกแล้ว',
              `ใบสั่งขายเลขที่ ${refNo} มีการบันทึกบัญชีแล้ว วันที่ ${moment(sale.data()?.accountRecorded.time).format(
                'D/MM/YYYY'
              )}`,
              'warning'
            );
          }
          let dbValues = formatValuesBeforeLoad(sale.data());
          let setValue = {
            ...values,
            ...dbValues
          };
          showLog({ values, dbValues, setValue });
          form.setFieldsValue(setValue);
        });
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });

export const onConfirmSaleOrderEdit = ({ values, category, order, isEdit, user, firestore, api }) =>
  new Promise(async (r, j) => {
    try {
      //  showLog('confirm_values', values);
      let mValues = JSON.parse(JSON.stringify(values));
      let changes = getChanges(order, values);
      if (order.items && values.items) {
        const itemChanges = getArrayChanges(order.items, values.items);
        if (itemChanges && itemChanges.length > 0) {
          // Ensure changes is an array before spreading
          const changesArray = Array.isArray(changes) ? changes : (changes ? [changes] : []);
          changes = [...changesArray, ...itemChanges];
        }
      }
      // Ensure changes is always an array for editedBy
      const finalChanges = Array.isArray(changes) ? changes : (changes ? [changes] : []);
      mValues.editedBy = !!order.editedBy
        ? [...order.editedBy, { uid: user.uid, time: Date.now(), changes: finalChanges }]
        : [{ uid: user.uid, time: Date.now(), changes: finalChanges }];

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
      const saleRef = firestore.collection('sections').doc('sales').collection('vehicles');
      const updateFields = {
        creditRecorded: null,
        accountRecorded: null,
        canceled: null
      };
      // Add sale order.
      const docSnap = await saleRef.doc(values.saleId).get();
      if (docSnap.exists) {
        saleRef.doc(values.saleId).update(mValues);
      } else {
        saleRef.doc(values.saleId).set({ ...mValues, ...updateFields });
      }
      // Update item in stock.
      // if (mValues.items && !['other'].includes(mValues.saleType)) {
      //   await updateStockItem(mValues, api);
      // }

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
      r(true);
    } catch (e) {
      j(e);
    }
  });
