import { getChanges } from 'functions';
import { arrayForEach } from 'functions';
import { getArrayChanges } from 'functions';

export const onConfirmBookingOrderEdit = ({ values, category, order, isEdit, user, firestore, api }) =>
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
