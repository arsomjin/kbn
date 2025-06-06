import { Quill } from 'react-quill';
import quillEmoji from 'quill-emoji';
import 'react-quill/dist/quill.snow.css';
import { checkCollection } from 'firebase/api';
import { showAlert, load, arrayForEach, Numb, progress, showWarn } from 'functions';
import numeral from 'numeral';
import { checkIsVehicleFromName } from 'utils';
import { checkDoc } from 'firebase/api';
import { cleanValuesBeforeSave } from 'functions';
import { getDoc } from 'firebase/api';
import { onCancelImportData } from 'Modules/Utils/Upload/api';
import { distinctArr } from 'functions';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { createKeywords } from 'utils';
import { uniq } from 'lodash';
import { partialText } from 'utils';

const { EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji } = quillEmoji;

Quill.register(
  {
    'formats/emoji': EmojiBlot,
    'modules/emoji-shortname': ShortNameEmoji,
    'modules/emoji-toolbar': ToolbarEmoji,
    'modules/emoji-textarea': TextAreaEmoji
  },
  true
);

export const createBookingKeywords = mValues => {
  let bookNo_lower = mValues.bookNo.toLowerCase();
  let bookPNo = removeAllNonAlphaNumericCharacters(bookNo_lower);
  let key1 = createKeywords(bookNo_lower);
  let key2 = createKeywords(removeAllNonAlphaNumericCharacters(bookNo_lower));
  let key3 = createKeywords(mValues.firstName);
  let key4 = !!mValues.lastName ? createKeywords(mValues.lastName) : [];
  let keywords = uniq([...key1, ...key2, ...key3, ...key4]);

  // Add search keys
  return {
    ...mValues,
    bookPNo,
    keywords,
    bookNo_lower,
    bookNo_partial: partialText(mValues.bookNo),
    firstName_lower: mValues.firstName.toLowerCase(),
    firstName_partial: partialText(mValues.firstName)
  };
};

export const createSaleKeywords = mValues => {
  let saleNo_lower = mValues.saleNo.toLowerCase();
  let salePNo = removeAllNonAlphaNumericCharacters(saleNo_lower);
  let key1 = createKeywords(saleNo_lower);
  let key2 = createKeywords(removeAllNonAlphaNumericCharacters(saleNo_lower));
  let key3 = createKeywords(mValues.firstName);
  let key4 = !!mValues.lastName ? createKeywords(mValues.lastName) : [];
  let keywords = uniq([...key1, ...key2, ...key3, ...key4]);

  // Add search keys
  return {
    ...mValues,
    salePNo,
    keywords,
    saleNo_lower,
    saleNo_partial: partialText(mValues.saleNo),
    firstName_lower: mValues.firstName.toLowerCase(),
    firstName_partial: partialText(mValues.firstName)
  };
};

export const modulesQuill = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ align: [] }],
      ['bold', 'italic', 'underline'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        {
          color: [
            '#000000',
            '#e60000',
            '#ff9900',
            '#ffff00',
            '#008a00',
            '#0066cc',
            '#9933ff',
            '#ffffff',
            '#facccc',
            '#ffebcc',
            '#ffffcc',
            '#cce8cc',
            '#cce0f5',
            '#ebd6ff',
            '#bbbbbb',
            '#f06666',
            '#ffc266',
            '#ffff66',
            '#66b966',
            '#66a3e0',
            '#c285ff',
            '#888888',
            '#a10000',
            '#b26b00',
            '#b2b200',
            '#006100',
            '#0047b2',
            '#6b24b2',
            '#444444',
            '#5c0000',
            '#663d00',
            '#666600',
            '#003700',
            '#002966',
            '#3d1466',
            'custom-color'
          ]
        },
        { background: [] },
        'link',
        'emoji'
      ]
    ],
    handlers: {
      color: function (value) {
        if (value == 'custom-color') value = window.prompt('Enter Hex Color Code');
        this.quill.format('color', value);
      }
    }
  },
  keyboard: {
    bindings: {
      tab: false,
      custom: {
        key: 13,
        shiftKey: true,
        handler: function () {
          /** do nothing */
        }
      },
      // handleEnter: {
      //   key: 13,
      //   handler: function () {
      //     /** do nothing */
      //   },
      // },
      linebreak: {
        key: 13,
        shiftKey: true,
        handler: function (range) {
          const currentLeaf = this.quill.getLeaf(range.index)[0];
          const nextLeaf = this.quill.getLeaf(range.index + 1)[0];
          this.quill.insertEmbed(range.index, 'break', true, 'user');
          // Insert a second break if:
          // At the end of the editor, OR next leaf has a different parent (<p>)
          if (nextLeaf === null || currentLeaf.parent !== nextLeaf.parent) {
            this.quill.insertEmbed(range.index, 'break', true, 'user');
          }
          // Now that we've inserted a line break, move the cursor forward
          this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        }
      }
    }
  },
  'emoji-toolbar': true,
  'emoji-textarea': true,
  'emoji-shortname': true
};

export const formatsQuill = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'align',
  'link',
  'image',
  'background',
  'color',
  'emoji'
];

export const editImportDataByBatchNo = async (path, batchNo, firestore) => {
  try {
    if (!(path && batchNo)) {
      return showAlert('No data input.');
    }
    load(true);
    const dataSnap = await checkCollection(path, [['batchNo', '==', batchNo]]);
    let dataArr = [];
    if (dataSnap) {
      dataSnap.forEach(doc => {
        dataArr.push({
          ...doc.data(),
          _id: doc.id
        });
      });
    }
    load(false);
    let plBreak1 = false;
    await arrayForEach(dataArr, async (it, i) => {
      if (plBreak1) {
        return;
      }
      const percent = Numb(((i + 1) * 100) / dataArr.length);
      progress({
        show: true,
        percent,
        text: `กำลังอับเดต ${i + 1} จาก ${numeral(dataArr.length).format('0,0')} รายการ`,
        subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
        onCancel: () => {
          plBreak1 = true;
          showAlert('Aborted');
        }
      });
      const updateRef = firestore.collection(path).doc(it._id);

      let mIt = { ...it };
      mIt.docDate = mIt.docDate.replace('2020', '2021');
      // mIt.inputDate = mIt.inputDate.replace('2020', '2021');
      // mIt.transactionDate = mIt.transactionDate.replace('2020', '2021');
      delete mIt._id;
      await updateRef.set(mIt);
    });
    progress({ show: false, percent: 0, text: null, subtext: null });
  } catch (e) {
    load(false);
    progress({ show: false, percent: 0, text: null, subtext: null });
    showWarn(e);
  }
};

// const updateTransferData = async () => {
//   try {
//     // return api.updateData('bankNames');
//     // return;
//     load(true);
//     const dataSnap = await checkCollection('sections/stocks/transferOut');
//     let dataArr = [];
//     if (dataSnap) {
//       dataSnap.forEach((doc) => {
//         let item = doc.data();
//         dataArr.push({
//           ...item,
//           _id: doc.id,
//         });
//       });
//     }
//     load(false);
//     showLog({
//       dataArr,
//     });
//     let plBreak1 = false;
//     await arrayForEach(dataArr, async (it, i) => {
//       if (plBreak1) {
//         return;
//       }
//       const percent = Numb(((i + 1) * 100) / dataArr.length);
//       progress({
//         show: true,
//         percent,
//         text: `กำลังอับเดต ${i + 1} จาก ${numeral(dataArr.length).format(
//           '0,0'
//         )} รายการ`,
//         subtext:
//           'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
//         onCancel: () => {
//           plBreak1 = true;
//           showAlert('Aborted');
//         },
//       });

//       const updateRef = firestore
//         .collection('sections/stocks/transfer')
//         .doc(it._id);
//       let mIt = { ...it };
//       mIt.fromOrigin = it.branchCode;
//       mIt.exportDate = it.date;
//       mIt.exportRecordedBy = it.recordedBy;
//       mIt.exportVerifiedBy = it.verifiedBy;
//       mIt.importDate = null;
//       mIt.importRecordedBy = null;
//       mIt.importVerifiedBy = null;
//       mIt.receivedBy = null;
//       mIt.rejected = false;
//       let mIsUsed = false;
//       let mItems = (it?.items || [])
//         .filter((l) => !!l.productCode)
//         .map((item) => {
//           let isUsed = item?.productCode.startsWith('2-') ? true : false;
//           if (isUsed) {
//             mIsUsed = isUsed;
//           }
//           return {
//             ...item,
//             isUsed,
//             fromOrigin: it.branchCode,
//             toDestination: it.toDestination,
//             ...(!!item.vehicleNo &&
//               typeof item.vehicleNo === 'string' && {
//                 vehicleNo: item.vehicleNo.split(','),
//               }),
//             ...(!!item.peripheralNo &&
//               typeof item.peripheralNo === 'string' && {
//                 peripheralNo: item.peripheralNo.split(','),
//               }),
//             ...(!!item.engineNo &&
//               typeof item.engineNo === 'string' && {
//                 engineNo: item.engineNo.split(','),
//               }),
//           };
//         });
//       mIt.isUsed = mIsUsed;
//       mIt.items = mItems;
//       mIt = cleanValuesBeforeSave(mIt);
//       // delete mIt.productSearchCode;
//       delete mIt._id;
//       await updateRef.set(mIt);
//       // await updateRef.update({ productPCode });
//       // await updateRef.delete();
//     });

//     progress({ show: false, percent: 0, text: null, subtext: null });
//   } catch (e) {
//     load(false);
//     progress({ show: false, percent: 0, text: null, subtext: null });
//     showWarn(e);
//   }
// }

// const _updateSaleOutData = useCallback(async () => {
//   try {
//     // return api.updateData('bankNames');
//     // return;
//     load(true);
//     const dataSnap = await checkCollection('sections/stocks/saleOut_bak');
//     let dataArr = [];
//     if (dataSnap) {
//       dataSnap.forEach((doc) => {
//         let item = doc.data();
//         dataArr.push({
//           ...item,
//           _id: doc.id,
//         });
//       });
//     }

//     let anomaly = dataArr.filter((l) => !l.saleId);
//     if (anomaly.length > 0) {
//       await arrayForEach(anomaly, async (ano) => {
//         let idx = dataArr.findIndex((l) => l._key === ano._key);
//         showLog('FOUND', dataArr[idx]);
//         const aSnap = await checkCollection('sections/sales/vehicles', [
//           ['saleNo', '==', dataArr[idx].saleNo],
//         ]);
//         if (aSnap) {
//           let saleId = null;
//           aSnap.forEach((aDoc) => {
//             showLog('anomalyDoc', aDoc.data());
//             saleId = aDoc.data().saleId;
//             return aDoc;
//           });
//           dataArr[idx].saleId = saleId;
//           showLog({ SALE_ID: saleId, newData: dataArr[idx] });
//         } else {
//           dataArr[idx].saleId = createNewId('SALE-VEH');
//         }
//       });
//     }

//     let anomaly2 = dataArr.filter((l) => !l.saleId);
//     showLog({ anomaly, anomaly2 });
//     let dSaleId = distinctArr(dataArr, ['saleId']);
//     let saleOut = [];
//     await arrayForEach(dSaleId, async (sale) => {
//       let fItems = dataArr
//         .filter((l) => l.saleId === sale.saleId)
//         .map((it) => ({
//           ...it,
//           vehicleNo: it?.vehicleNo
//             ? Array.isArray(it.vehicleNo)
//               ? it.vehicleNo
//               : it.vehicleNo.split(',')
//             : [],
//           peripheralNo: it?.peripheralNo
//             ? Array.isArray(it.peripheralNo)
//               ? it.peripheralNo
//               : it.peripheralNo.split(',')
//             : [],
//           engineNo: it?.engineNo
//             ? Array.isArray(it.engineNo)
//               ? it.engineNo
//               : it.engineNo.split(',')
//             : [],
//           pressureBladeNo: it?.pressureBladeNo ? [it.pressureBladeNo] : [],
//           bucketNo: it?.bucketNo ? [it.bucketNo] : [],
//           sugarcanePickerNo: it?.sugarcanePickerNo
//             ? [it.sugarcanePickerNo]
//             : [],
//           deliverItemId: it._key,
//           deliverId: it.saleId,
//           completed: null,
//           rejected: null,
//           cancelled: null,
//           deleted: null,
//           vehicleItemType: null,
//           vehicleType: 'vehicle',
//         }));
//       sale.items = fItems;
//       const saleDoc = await getDoc(
//         'sections',
//         `sales/vehicles/${sale.saleId}`
//       );
//       let saleType, customerId, customer, address, phoneNumber, salesPerson;
//       if (saleDoc?.address && saleDoc.address.address) {
//         address = saleDoc.address;
//       } else if (saleDoc?.customerId) {
//         const cusDoc = await getDoc(
//           'data',
//           `sales/customers/${saleDoc.customerId}`
//         );
//         showLog({ cusDoc });
//         if (cusDoc) {
//           address = cusDoc.address || {};
//         }
//       } else {
//         address = {
//           address: null,
//           amphoe: null,
//           moo: null,
//           postcode: null,
//           province: null,
//           tambol: null,
//           village: null,
//         };
//       }
//       if (saleDoc) {
//         saleType = saleDoc.saleType;
//         customerId = saleDoc.customerId || null;
//         customer =
//           saleDoc.customer ||
//           `${saleDoc.prefix}${saleDoc.firstName} ${saleDoc.lastName}`.trim();
//         phoneNumber = saleDoc.phoneNumber || null;
//         salesPerson = saleDoc.salesPerson || [];
//       }
//       let result = cleanValuesBeforeSave({
//         ...InitValue,
//         date: sale.date,
//         docNo: sale.docNo,
//         transferType: sale.exportType,
//         saleDate: sale.saleDate,
//         saleId: sale.saleId,
//         saleNo: sale.saleNo,
//         saleType,
//         customerId,
//         customer,
//         address,
//         phoneNumber,
//         salesPerson,
//         recordedBy: sale.recordedBy,
//         recordedDate: sale.date,
//         items: fItems,
//         deliverId: sale.saleId,
//         deleted: false,
//         completed: false,
//         rejected: false,
//         canceled: false,
//         vehicleItemType: null,
//         vehicleType: 'vehicle',
//       });
//       saleOut.push(result);
//     });

//     let saleOutItems = dataArr.map((it) => ({
//       ...it,
//       vehicleNo: it?.vehicleNo
//         ? Array.isArray(it.vehicleNo)
//           ? it.vehicleNo
//           : it.vehicleNo.split(',')
//         : [],
//       peripheralNo: it?.peripheralNo
//         ? Array.isArray(it.peripheralNo)
//           ? it.peripheralNo
//           : it.peripheralNo.split(',')
//         : [],
//       engineNo: it?.engineNo
//         ? Array.isArray(it.engineNo)
//           ? it.engineNo
//           : it.engineNo.split(',')
//         : [],
//       pressureBladeNo: it?.pressureBladeNo ? [it.pressureBladeNo] : [],
//       bucketNo: it?.bucketNo ? [it.bucketNo] : [],
//       sugarcanePickerNo: it?.sugarcanePickerNo ? [it.sugarcanePickerNo] : [],
//       deliverItemId: it._key,
//       deliverId: it.saleId,
//       completed: null,
//       rejected: null,
//       cancelled: null,
//       deleted: null,
//     }));

//     load(false);

//     return showLog({
//       dataArr,
//       dSaleNo: distinctArr(dataArr, ['saleNo'], ['date']),
//       dSaleId,
//       dDocNo: distinctArr(dataArr, ['docNo'], ['date']),
//       saleOut,
//       saleOutItems,
//       dSaleOutDocNo: distinctArr(saleOut, ['docNo']),
//     });
//     let plBreak1 = false;
//     await arrayForEach(saleOutItems, async (it, i) => {
//       if (plBreak1) {
//         return;
//       }
//       const percent = Numb(((i + 1) * 100) / saleOutItems.length);
//       progress({
//         show: true,
//         percent,
//         text: `กำลังอับเดต ${i + 1} จาก ${numeral(saleOutItems.length).format(
//           '0,0'
//         )} รายการ`,
//         subtext:
//           'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
//         onCancel: () => {
//           plBreak1 = true;
//           showAlert('Aborted');
//         },
//       });

//       const updateRef = firestore
//         .collection('sections/stocks/saleOutItems')
//         .doc(it.deliverItemId);
//       // .doc(it._id);
//       let mIt = { ...it };
//       mIt = cleanValuesBeforeSave(mIt);
//       // delete mIt.productSearchCode;
//       delete mIt._id;
//       await updateRef.set(mIt);
//       // await updateRef.update({ productPCode });
//       // await updateRef.delete();
//     });

//     progress({ show: false, percent: 0, text: null, subtext: null });
//   } catch (e) {
//     load(false);
//     progress({ show: false, percent: 0, text: null, subtext: null });
//     showWarn(e);
//   }
// }, [firestore]);

// const checkImportVehicles = useCallback(async () => {
//   try {
//     // return api.updateData('bankNames');
//     // return;
//     load(true);
//     const dataSnap = await checkCollection(
//       'sections/stocks/importVehicles_latest'
//     );
//     let dataArr = [];
//     if (dataSnap) {
//       dataSnap.forEach((doc) => {
//         let item = doc.data();
//         dataArr.push({
//           ...item,
//           _id: doc.id,
//         });
//       });
//     }

//     load(false);
//     let peripherals = dataArr
//       .filter((l) => l.storeLocationCode.startsWith('NI'))
//       .map((it) => ({
//         ...it,
//         peripheralArr:
//           it.peripheralNo.split(',') === ['']
//             ? []
//             : it.peripheralNo.split(','),
//       }));
//     showLog({
//       dataArr,
//       noName: dataArr.filter((l) => !l.productName),
//       moreThanOne: dataArr.filter((l) => l.import > 1),
//       noVehicleNo: dataArr.filter((l) => !l.vehicleNo),
//       vehicles: dataArr.filter((l) => l.storeLocationCode.startsWith('NV')),
//       peripherals,
//       peripheralAnomaly: peripherals.filter(
//         (l) => l.import !== l.peripheralArr.length
//       ),
//       peripheralHasVNo: peripherals.filter((l) => l.vehicleNo),
//       dNames: distinctArr(dataArr, ['productName']).map((it) => ({
//         name: it.productName,
//         isVehicle: checkIsVehicleFromName(it.productName),
//       })),
//       drones: dataArr.filter((l) => l.productName.startsWith('โดรน')),
//     });
//     let plBreak1 = false;
//     await arrayForEach(dataArr, async (it, i) => {
//       if (plBreak1) {
//         return;
//       }
//       const percent = Numb(((i + 1) * 100) / dataArr.length);
//       progress({
//         show: true,
//         percent,
//         text: `กำลังอับเดต ${i + 1} จาก ${numeral(dataArr.length).format(
//           '0,0'
//         )} รายการ`,
//         subtext:
//           'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
//         onCancel: () => {
//           plBreak1 = true;
//           showAlert('Aborted');
//         },
//       });

//       const updateRef = firestore
//         .collection('sections/stocks/importVehicles')
//         .doc(it._id);
//       let mIt = { ...it };
//       mIt = cleanValuesBeforeSave(mIt);
//       // delete mIt.productSearchCode;
//       delete mIt._id;
//       await updateRef.set(mIt);
//       // await updateRef.update({ productPCode });
//       // await updateRef.delete();
//     });

//     progress({ show: false, percent: 0, text: null, subtext: null });
//   } catch (e) {
//     load(false);
//     progress({ show: false, percent: 0, text: null, subtext: null });
//     showWarn(e);
//   }
// }, [firestore]);

const _updatePeripherals = async firestore => {
  try {
    // return api.updateData('bankNames');
    // return;
    // let arr = [
    //   'abc123',
    //   'A223K',
    //   '.jjkd9',
    //   '.?ท8-87h',
    //   'kk887&.',
    //   '.KBUL-5567 ,',
    // ];
    // const cleaned = cleanIdentityArray(arr);
    // return showLog({ cleaned });
    load(true);
    // const dataSnap = await checkCollection('sections/stocks/importVehicles');
    const dataSnap = await checkCollection('sections/stocks/peripherals');
    let dataArr = [];

    if (dataSnap) {
      dataSnap.forEach(doc => {
        let item = doc.data();
        dataArr.push({
          ...item,
          _id: doc.id,
          isVehicle: !!item?.productName ? checkIsVehicleFromName(item.productName) : false
        });
      });
    }

    load(false);
    const hasTransactionAndName = dataArr.filter(l => (!!l.sold || !!l.reserved) && !!l.productName);

    let plBreak1 = false;
    await arrayForEach(hasTransactionAndName, async (it, i) => {
      if (plBreak1) {
        return;
      }
      const percent = Numb(((i + 1) * 100) / hasTransactionAndName.length);
      progress({
        show: true,
        percent,
        text: `กำลังอับเดต ${i + 1} จาก ${numeral(hasTransactionAndName.length).format('0,0')} รายการ`,
        subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
        onCancel: () => {
          plBreak1 = true;
          showAlert('Aborted');
        }
      });

      const updateRef = firestore.collection('sections/stocks/vehicles').doc(it._id);
      let mIt = { ...it };

      const saleDoc = await checkDoc('sections', `sales/vehicles/${it.sold.saleId}`);
      let sold = it.sold;
      let baac = null;
      let skl = null;
      let kbnLeasing = null;
      if (saleDoc) {
        let sale = saleDoc.data();
        sold = {
          saleId: sale.saleId || null,
          saleNo: sale.saleNo || null,
          saleType: sale.saleType || null,
          customerId: sale.customerId || null,
          customer: sale.customer || null,
          ts: sale.created || null,
          by: sale.salesPerson || []
        };
        if (!!sale?.saleType) {
          baac = sale.saleType === 'baac' || null;
          skl = sale.saleType === 'sklLeasing' || null;
          kbnLeasing = sale.saleType === 'kbnLeasing' || null;
        }
      }

      mIt = cleanValuesBeforeSave(mIt);
      // delete mIt.productSearchCode;
      delete mIt._id;
      const isExist = await getDoc('sections', `stocks/vehicles/${it._id}`);
      if (!!isExist) {
        // showLog('EXISTS', isExist);
        await updateRef.update({
          sold,
          ...(baac && { baac }),
          ...(skl && { skl }),
          ...(kbnLeasing && { kbnLeasing })
        });
      }
      // await updateRef.set(mIt);
      // await updateRef.delete();
    });

    progress({ show: false, percent: 0, text: null, subtext: null });
  } catch (e) {
    load(false);
    progress({ show: false, percent: 0, text: null, subtext: null });
    showWarn(e);
  }
};

export const deleteImportDataByBatchNo = ({ collection, itemCollection, batchNo, api, handleCancel }) => {
  try {
    onCancelImportData([collection, itemCollection], batchNo, api, handleCancel);
  } catch (e) {
    showWarn(e);
  }
};

export const editImportParts = async firestore => {
  try {
    load(true);
    const dataSnap = await checkCollection('sections/stocks/importParts_edit');
    let dataArr = [];

    if (dataSnap) {
      dataSnap.forEach(doc => {
        let item = doc.data();
        dataArr.push({
          ...item,
          _id: doc.id
        });
      });
    }

    load(false);

    const docArr = distinctArr(dataArr, ['docNo']).map(it => {
      const { docNo, batchNo, billNoSKC, _id } = it;
      return { docNo, batchNo, billNoSKC, _id };
    });

    let plBreak1 = false;

    let toBeEdit = [];

    await arrayForEach(docArr, async (it, i) => {
      if (plBreak1) {
        return;
      }
      const percent = Numb(((i + 1) * 100) / docArr.length);
      progress({
        show: true,
        percent,
        text: `กำลังอับเดต ${i + 1} จาก ${numeral(docArr.length).format('0,0')} รายการ`,
        subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
        onCancel: () => {
          plBreak1 = true;
          showAlert('Aborted');
        }
      });

      // const updateRef = firestore
      //   .collection('sections/stocks/importParts')
      //   .doc(it._id);
      // let mIt = { ...it };

      const dataSnap = await checkCollection('sections/stocks/importParts', [
        ['docNo', '==', it.docNo],
        ['billNoSKC', '==', it.billNoSKC]
      ]);
      let changeArr = [];

      if (dataSnap) {
        dataSnap.forEach(doc => {
          let item = doc.data();
          changeArr.push({
            ...item,
            _id: doc.id
          });
        });
      }

      if (changeArr.length === 1) {
        toBeEdit = [...toBeEdit, ...changeArr];
      }
    });

    await arrayForEach(toBeEdit, async (it, i) => {
      if (plBreak1) {
        return;
      }
      const percent = Numb(((i + 1) * 100) / toBeEdit.length);
      progress({
        show: true,
        percent,
        text: `กำลังอับเดต ${i + 1} จาก ${numeral(toBeEdit.length).format('0,0')} รายการ`,
        subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
        onCancel: () => {
          plBreak1 = true;
          showAlert('Aborted');
        }
      });

      const updateRef = firestore.collection('sections/stocks/importParts');

      const dataSnap = await checkCollection('sections/stocks/importParts_edit', [
        ['docNo', '==', it.docNo],
        ['billNoSKC', '==', it.billNoSKC]
      ]);
      let updateArr = [];

      if (dataSnap) {
        dataSnap.forEach(doc => {
          let item = doc.data();
          updateArr.push({
            ...item,
            _id: doc.id,
            batchNo: it.batchNo
            // pre_batchNo: item.batchNo,
          });
        });
      }

      await updateRef.doc(it._id).delete();
      if (updateArr.length > 0) {
        await arrayForEach(updateArr, async uIt => {
          let mIt = { ...uIt };
          delete mIt._id;
          !!uIt._id && (await updateRef.doc(uIt._id).set(mIt));
        });
      }
    });

    progress({ show: false, percent: 0, text: null, subtext: null });
  } catch (e) {
    load(false);
    progress({ show: false, percent: 0, text: null, subtext: null });
    showWarn(e);
  }
};
