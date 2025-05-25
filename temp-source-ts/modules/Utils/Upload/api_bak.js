import { Markers } from 'data/Constant';
import { SourceOfDataMappingId } from 'data/fields-mapping';
import { checkCollection } from 'firebase/api';
import { cleanValuesBeforeSave } from 'functions';
import { progress, Numb, arrayForEach, distinctArr, showLog, showWarn, load, showAlert } from 'functions';
import moment from 'moment';
import numeral from 'numeral';
import { partialText } from 'utils';

export const _checkIsNotDuplicated = (data, dataType, firestore) =>
  new Promise(async (r, j) => {
    showLog('CHECK_DUPLICATE: ', { data, dataType });
    try {
      let dataRef;
      switch (dataType) {
        case 'vehicles':
          dataRef = firestore
            .collection('sections')
            .doc('stocks')
            .collection('importVehicles')
            .where('docNo', '==', data.docNo)
            .where('docDate', '==', data.docDate)
            .where('billNoSKC', '==', data.billNoSKC)
            .where('branchCode', '==', data.branchCode)
            .where('userName', '==', data.userName)
            .where('vehicleNo', '==', data.vehicleNo)
            .where('peripheralNo', '==', data.peripheralNo);
          break;
        case 'parts':
          dataRef = firestore
            .collection('sections')
            .doc('stocks')
            .collection('importParts')
            .where('docNo', '==', data.docNo)
            .where('inputDate', '==', data.inputDate)
            .where('billNoSKC', '==', data.billNoSKC)
            .where('branchCode', '==', data.branchCode)
            // .where('userName', '==', data.userName)
            .where('storePoint', '==', data.storePoint);
          break;
        case 'services':
          dataRef = firestore
            .collection('sections')
            .doc('services')
            .collection('importServices')
            .where('orderNo', '==', data.orderNo)
            .where('docDate', '==', data.docDate)
            .where('engineNo', '==', data.engineNo)
            .where('branchCode', '==', data.branchCode)
            .where('customerName', '==', data.customerName)
            .where('jobCloseDate', '==', data.jobCloseDate);
          break;
        case 'sellParts':
          dataRef = firestore
            .collection('sections')
            .doc('sales')
            .collection('parts')
            .where('saleNo', '==', data.saleNo)
            .where('saleDate', '==', data.saleDate)
            .where('branchCode', '==', data.branchCode)
            .where('firstName', '==', data.firstName);
          break;
        case 'fingerPrint':
          dataRef = firestore
            .collection('sections')
            .doc('hr')
            .collection('importFingerPrint')
            .where('date', '==', data.date)
            .where('branch', '==', data.branch)
            .where('employeeCode', '==', data.employeeCode)
            .where('fullName', '==', data.fullName);
          break;

        default:
          break;
      }
      const cSnap = await dataRef.get();
      if (!cSnap.empty) {
        cSnap.forEach(doc => {
          r({ result: false, duplicateData: doc.data() });
        });
      } else {
        r({ result: true });
      }
    } catch (e) {
      showWarn(e);
      r(false);
    }
  });

export const _checkImportData = (excelArr, jsonArr, dataType, firestore, users, byPassDuplicateCheck) =>
  new Promise(async (r, j) => {
    try {
      // Check data type and length.
      let isCorrected = !!excelArr && excelArr?.rows && excelArr.cols;
      if (!isCorrected) {
        r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
      }
      isCorrected = !!jsonArr && Array.isArray(jsonArr) && Array.isArray(excelArr.rows) && Array.isArray(excelArr.cols);
      if (!isCorrected) {
        r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
      }
      isCorrected = jsonArr.length > 0 && excelArr.rows.length > 0 && excelArr.cols.length > 0;
      if (!isCorrected) {
        r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
      }
      // Check correctness in excel data.
      //  - Columns 11st starts with ['NI', 'NV'] for vehicles, ['NS'] for parts.
      if (['vehicles', 'parts'].includes(dataType)) {
        let docType = excelArr.rows[0][11].substr(0, 2);
        switch (dataType) {
          case 'vehicles':
            isCorrected = ['NI', 'NV'].includes(docType);
            break;
          case 'parts':
            isCorrected = ['NS'].includes(docType);
            break;
          default:
            break;
        }
      }
      // Check duplication
      //  - Random check fields [docNo, docDate, billNoSKC, branchCode, userName] in json file.
      let rd1 = Math.floor(Math.random() * jsonArr.length);
      if (!['partList', 'vehicleList', 'fingerPrint'].includes(dataType) && !byPassDuplicateCheck) {
        const isNotDuplicated = await _checkIsNotDuplicated(jsonArr[rd1], dataType, firestore);
        // showLog({ isCorrected, isNotDuplicated });
        if (!isNotDuplicated.result) {
          r({
            result: false,
            info: `ไฟล์นี้ได้อัปโหลดแล้ว เมื่อวันที่ ${moment(isNotDuplicated.duplicateData.importTime).format(
              'DD/MM/YY'
            )} เวลา ${moment(isNotDuplicated.duplicateData.importTime).format(
              'HH:mm'
            )} โดย ${users[isNotDuplicated.duplicateData.importBy].displayName}`
          });
          return;
        }
      }
      r({ result: true });
    } catch (e) {
      showWarn(e);
      r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
    }
  });

export const formatServiceData = dataArr =>
  new Promise(async (r, j) => {
    try {
      const distinctOrders = distinctArr(dataArr, ['orderNo']);
      let serviceOrders = [];
      let serviceItems = [];
      await arrayForEach(distinctOrders, async order => {
        const {
          orderNo,
          orderReason,
          orderStatus,
          orderType,
          orderTypeDesc,
          docDate,
          productName,
          vehicleModel,
          vehicleNo,
          engineNo,
          jobCloseDate,
          model,
          advisor,
          advisorName,
          branchCode,
          branchName,
          causeCode,
          causeCodeDesc,
          customerCode,
          customerName,
          serviceStatus,
          serviceTechnician,
          saleDate,
          warrantyCategory,
          workHour,
          discountType
        } = order;
        let sItems = dataArr
          .filter(l => l.orderNo === order.orderNo)
          .map(sItem => {
            const {
              chargesCode,
              description,
              item,
              unit,
              unitPrice,
              qty,
              reasonCode,
              categoryCode,
              categoryDesc,
              netPrice,
              partType,
              priceBeforeDiscount,
              SKCDiscountPrice,
              dealerDiscountPrice
            } = sItem;
            return {
              chargesCode,
              description,
              discountType,
              item,
              unit,
              unitPrice,
              qty,
              reasonCode,
              categoryCode,
              categoryDesc,
              netPrice,
              partType,
              priceBeforeDiscount,
              SKCDiscountPrice,
              dealerDiscountPrice,
              orderNo,
              warrantyCategory
            };
          });
        serviceItems = [...serviceItems, ...sItems];
        const priceBeforeDiscount = sItems.reduce((sum, elem) => sum + Numb(elem.priceBeforeDiscount), 0);
        const SKCDiscountPrice = sItems.reduce((sum, elem) => sum + Numb(elem.SKCDiscountPrice), 0);
        const dealerDiscountPrice = sItems.reduce((sum, elem) => sum + Numb(elem.dealerDiscountPrice), 0);
        const netPrice = sItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const partItems = sItems.filter(l => l.categoryDesc === 'อะไหล่' && l.partType !== 'YX');
        const oilItems = sItems.filter(l => l.categoryDesc === 'อะไหล่' && l.partType === 'YX');
        const wageItems = sItems.filter(l => l.categoryDesc === 'ค่าแรง' || l.description.includes('ค่าแรง'));
        const travelItems = sItems.filter(
          l => l.categoryDesc === 'ค่าบริการอื่นๆ' && l.description.includes('ค่าเดินทาง')
        );
        const freightItems = sItems.filter(
          l => l.categoryDesc === 'ค่าบริการอื่นๆ' && l.description.includes('ค่าขนส่ง')
        );
        const otherItems = sItems.filter(
          l =>
            l.categoryDesc === 'ค่าบริการอื่นๆ' &&
            !(
              l.description.includes('ค่าแรง') ||
              l.description.includes('ค่าเดินทาง') ||
              l.description.includes('ค่าขนส่ง')
            )
        );

        const partBeforeDiscount = partItems.reduce((sum, elem) => sum + Numb(elem.priceBeforeDiscount), 0);
        const partSKCDiscount = partItems.reduce((sum, elem) => sum + Numb(elem.SKCDiscountPrice), 0);
        const partDealerDiscount = partItems.reduce((sum, elem) => sum + Numb(elem.dealerDiscountPrice), 0);
        const parts = partItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const oilBeforeDiscount = oilItems.reduce((sum, elem) => sum + Numb(elem.priceBeforeDiscount), 0);
        const oilSKCDiscount = oilItems.reduce((sum, elem) => sum + Numb(elem.SKCDiscountPrice), 0);
        const oilDealerDiscount = oilItems.reduce((sum, elem) => sum + Numb(elem.dealerDiscountPrice), 0);
        const oils = oilItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const oilSum = distinctArr(oilItems, ['description'], ['qty']).map(ol => ({
          description: ol.description,
          qty: ol.qty
        }));
        const wages = wageItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const freights = freightItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const travels = travelItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);
        const others = otherItems.reduce((sum, elem) => sum + Numb(elem.netPrice), 0);

        let percentDiscount =
          partBeforeDiscount + oilBeforeDiscount > 0
            ? parseInt(((partSKCDiscount + oilSKCDiscount) / (partBeforeDiscount + oilBeforeDiscount)) * 100)
            : 0;

        // showLog({
        //   percentDiscount,
        //   partBeforeDiscount,
        //   oilBeforeDiscount,
        //   parts,
        //   oils,
        // });

        serviceOrders.push({
          orderNo,
          orderReason,
          orderStatus,
          orderType,
          orderTypeDesc,
          docDate,
          productName,
          vehicleModel,
          vehicleNo,
          engineNo,
          jobCloseDate,
          model,
          advisor,
          advisorName,
          branchCode,
          branchName,
          causeCode,
          causeCodeDesc,
          customerCode,
          customerName,
          serviceStatus,
          serviceTechnician: serviceTechnician.split(','),
          saleDate,
          workHour,
          priceBeforeDiscount,
          SKCDiscountPrice,
          dealerDiscountPrice,
          netPrice,
          discountType,
          partBeforeDiscount,
          partSKCDiscount,
          partDealerDiscount,
          parts,
          oilBeforeDiscount,
          oilSKCDiscount,
          oilDealerDiscount,
          oils,
          oilSum,
          wages,
          freights,
          travels,
          others,
          percentDiscount
        });
      });
      r({ serviceOrders, serviceItems });
    } catch (e) {
      j(e);
    }
  });

export const formatStockData_bak = (dataArr, dataType) =>
  new Promise(async (r, j) => {
    try {
      const distinctOrders = distinctArr(dataArr, ['docNo']);
      const isVehicleType = dataType === 'vehicles';
      let orders = [];
      let items = [];
      await arrayForEach(distinctOrders, async order => {
        const {
          docNo,
          billNoSKC,
          branch,
          branchCode,
          docDate,
          docHeaderText,
          inputDate,
          inputTime,
          movementType,
          purchaseNo,
          storeLocationCode,
          transactionDate,
          typeCode,
          userName,
          productCode,
          productName
        } = order;
        let sItems = dataArr
          .filter(l => l.docNo === order.docNo)
          .map(sItem => {
            const {
              balance,
              item,
              itemNo,
              peripheralNo,
              receiveBranch,
              remark,
              startBalance,
              storeLocation,
              transferBranchCode,
              transferDocNo,
              transferLocationCode,
              unit
            } = sItem;
            return {
              docNo,
              docDate,
              balance,
              item,
              itemNo,
              peripheralNo,
              ...(isVehicleType && { vehicleNo: sItem.vehicleNo }),
              productCode: sItem.productCode,
              productName: sItem.productName,
              receiveBranch,
              remark,
              startBalance,
              storeLocation,
              ...(!isVehicleType && { storePoint: sItem.storePoint }),
              transferBranchCode,
              transferDocNo,
              transferLocationCode,
              unit,
              export: sItem.export,
              import: sItem.import,
              branch,
              branchCode,
              movementType
            };
          });
        items = [...items, ...sItems];
        orders.push({
          docNo,
          order: order.order,
          billNoSKC,
          branch,
          branchCode,
          docDate,
          docHeaderText,
          inputDate,
          inputTime,
          movementType,
          purchaseNo,
          storeLocationCode,
          transactionDate,
          typeCode,
          userName,
          peripheralNo: order.peripheralNo,
          ...(isVehicleType && { vehicleNo: order.vehicleNo }),
          productCode,
          productName,
          startBalance: order.startBalance,
          import: order.import,
          export: order.export,
          balance: order.balance,
          unit: order.unit
        });
      });
      r({ orders, items });
    } catch (e) {
      j(e);
    }
  });

export const formatStockData = (dataArr, dataType) =>
  new Promise(async (r, j) => {
    try {
      const isVehicleType = dataType === 'vehicles';
      let orders = [];
      await arrayForEach(dataArr, async order => {
        orders.push({
          ...order,
          order: order.order,
          ...(isVehicleType && { vehicleNo: order.vehicleNo }),
          ...(!isVehicleType && { storePoint: order.storePoint }),
          import: order.import,
          export: order.export
        });
      });
      r(orders);
    } catch (e) {
      j(e);
    }
  });

export const formatSellPartsData = (dataArr, dataType) =>
  new Promise(async (r, j) => {
    try {
      const distinctOrders = distinctArr(dataArr, ['saleNo']);
      let orders = [];
      let items = [];
      await arrayForEach(distinctOrders, async order => {
        showLog({ order });
        const {
          saleNo,
          branchCode,
          branch,
          shop,
          shopCode,
          employeeName,
          vehicleNo,
          engineNo,
          saleDate,
          invoiceNumber,
          taxInvoice,
          saleType,
          sourceOfData,
          firstName,
          lastName,
          prefix,
          address,
          building,
          floor,
          room,
          village,
          moo,
          soi,
          road,
          tambol,
          amphoe,
          province,
          postcode,
          telephone,
          phoneNumber,
          paymentTerms
        } = order;
        let sItems = dataArr
          .filter(l => l.saleNo === order.saleNo)
          .map(sItem => {
            const {
              saleNo,
              saleDate,
              branchCode,
              item,
              cancelStatus,
              storeLocation,
              storeLocationName,
              productCode,
              productName,
              productType,
              productTypeDesc,
              discountGroup,
              qty,
              unit,
              unitPrice,
              netTotal,
              discountCouponPercent,
              discountCoupon,
              skcpartsdiscount20,
              skcpartsdiscountamount20,
              pointsReceived,
              redeemPoint,
              AD_Discount,
              AD_DiscountPercent,
              AD_DiscountQty,
              SKCDiscount,
              SKCDiscountPercent,
              SKCDiscountQty,
              SKCLoyaltyDiscount,
              SKCLoyaltyDiscountAmt,
              SKCLoyaltyDiscountPercent,
              SKCManualDiscount,
              SKCManualDiscountPercent,
              SKCManualDiscountQty,
              billDiscount,
              billDiscountPercent,
              billDiscountQty,
              deposit,
              discountPointRedeem,
              netDepositDeduct,
              remark
            } = sItem;
            return {
              saleNo,
              saleDate,
              branchCode,
              item,
              cancelStatus,
              storeLocation,
              storeLocationName,
              productCode,
              productName,
              productType,
              productTypeDesc,
              discountGroup,
              qty,
              unit,
              unitPrice,
              netTotal,
              discountCouponPercent,
              discountCoupon,
              skcpartsdiscount20,
              skcpartsdiscountamount20,
              pointsReceived,
              redeemPoint,
              AD_Discount,
              AD_DiscountPercent,
              AD_DiscountQty,
              SKCDiscount,
              SKCDiscountPercent,
              SKCDiscountQty,
              SKCLoyaltyDiscount,
              SKCLoyaltyDiscountAmt,
              SKCLoyaltyDiscountPercent,
              SKCManualDiscount,
              SKCManualDiscountPercent,
              SKCManualDiscountQty,
              billDiscount,
              billDiscountPercent,
              billDiscountQty,
              deposit,
              discountPointRedeem,
              netDepositDeduct,
              remark,
              amtOilType: productTypeDesc === 'น้ำมันหล่อลื่น' ? netTotal : 0,
              amtPartType: productTypeDesc !== 'น้ำมันหล่อลื่น' ? netTotal : 0,
              sourceOfData
            };
          });
        items = [...items, ...sItems];
        orders.push({
          saleNo,
          branchCode,
          branch,
          shop,
          shopCode,
          employeeName,
          vehicleNo,
          engineNo,
          saleDate,
          invoiceNumber,
          taxInvoice,
          saleType,
          sourceOfData,
          firstName,
          lastName,
          prefix,
          paymentTerms,
          telephone,
          phoneNumber,
          address: {
            address,
            building,
            floor,
            room,
            village,
            moo,
            soi,
            road,
            tambol,
            amphoe,
            province,
            postcode
          }
        });
      });
      let groups = distinctArr(
        items,
        ['saleDate', 'branchCode', 'sourceOfData'],
        [
          'netTotal',
          'amtOilType',
          'amtPartType',
          'discountCoupon',
          'pointsReceived',
          'redeemPoint',
          'AD_Discount',
          'AD_DiscountQty',
          'SKCDiscount',
          'SKCDiscountQty',
          'SKCLoyaltyDiscount',
          'SKCLoyaltyDiscountAmt',
          'SKCManualDiscount',
          'SKCManualDiscountQty',
          'billDiscount',
          'billDiscountQty',
          'deposit',
          'discountPointRedeem',
          'netDepositDeduct'
        ]
      ).map(dItem => {
        const {
          saleNo,
          saleDate,
          branchCode,
          item,
          sourceOfData,
          netTotal,
          discountCoupon,
          pointsReceived,
          redeemPoint,
          AD_Discount,
          AD_DiscountQty,
          SKCDiscount,
          SKCDiscountQty,
          SKCLoyaltyDiscount,
          SKCLoyaltyDiscountAmt,
          SKCManualDiscount,
          SKCManualDiscountQty,
          billDiscount,
          billDiscountQty,
          deposit,
          discountPointRedeem,
          netDepositDeduct,
          amtOilType,
          amtPartType
        } = dItem;
        return {
          saleNo,
          saleDate,
          branchCode,
          item,
          sourceOfData,
          netTotal,
          discountCoupon,
          pointsReceived,
          redeemPoint,
          AD_Discount,
          AD_DiscountQty,
          SKCDiscount,
          SKCDiscountQty,
          SKCLoyaltyDiscount,
          SKCLoyaltyDiscountAmt,
          SKCManualDiscount,
          SKCManualDiscountQty,
          billDiscount,
          billDiscountQty,
          deposit,
          discountPointRedeem,
          netDepositDeduct,
          amtOilType,
          amtPartType
        };
      });

      r({ orders, items, groups });
    } catch (e) {
      j(e);
    }
  });

export const onCancelImportData = async (collectionArr, batchNo, api, handleCancel) => {
  // showLog({ batchNo });
  try {
    load(true, 'กำลังยกเลิก... \nห้ามออกจากหน้านี้ การยกเลิกจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด');
    const dSnap = await checkCollection(collectionArr[0], [['batchNo', '==', batchNo]]);
    if (dSnap) {
      let dArr = [];
      dSnap.forEach(async doc => {
        dArr.push({ ...doc.data(), _id: doc.id });
      });
      // showLog({ dArr });
      await arrayForEach(dArr, async it => {
        await api.deleteItem(collectionArr[0], it._id);
      });
    }
    if (collectionArr.length > 1) {
      const dSnap2 = await checkCollection(collectionArr[1], [['batchNo', '==', batchNo]]);
      if (dSnap2) {
        let dArr2 = [];
        dSnap2.forEach(async doc => {
          dArr2.push({ ...doc.data(), _id: doc.id });
        });
        // showLog({ dArr2 });
        await arrayForEach(dArr2, async it => {
          await api.deleteItem(collectionArr[1], it._id);
        });
      }
    }
    load(false);
    showAlert('สำเร็จ', 'ยกเลิกการนำเข้าข้อมูลเรียบร้อยแล้ว', 'warning', handleCancel);
  } catch (e) {
    showWarn(e);
    load(false);
  }
};

export const onConfirm = ({ currentData, api, firestore, dataType, user, handleCancel }) =>
  new Promise(async (r, j) => {
    try {
      // showLog('data_to_upload', currentData);
      load(true, 'กำลังอัปโหลดข้อมูล...');
      const batchNo = Date.now();
      let dataRef;
      let collection;
      switch (dataType) {
        case 'vehicles':
        case 'parts':
          const orders = await formatStockData(currentData, dataType);

          load(false);
          let isVehicleType = dataType === 'vehicles';
          let subCollection = isVehicleType ? 'importVehicles' : 'importParts';
          dataRef = firestore.collection('sections').doc('stocks').collection(subCollection);
          collection = `sections/stocks/${subCollection}`;
          const sRecords = orders.length;
          // const sRecords = orders.length + items.length;
          let sBreak1 = false;
          let sBreak2 = false;
          await arrayForEach(orders, async (item, i) => {
            if (sBreak1) {
              return;
            }
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / sRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(sRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                sBreak1 = true;
                onCancelImportData(
                  [collection],
                  // [collection, itemCollection],
                  batchNo,
                  api,
                  handleCancel
                );
              }
            });
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                ...Markers.stockImportVehicles,
                ...Markers.purchaseTransferPayment,
                ...(!isVehicleType && { pCode: item.productCode }),
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            let docItemNo = `${item.docNo}-${item.itemNo}`;
            await dataRef.doc(docItemNo).set(saveItem);
          });
          if (sBreak1) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          if (sBreak2) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        case 'services':
          const { serviceOrders, serviceItems } = await formatServiceData(currentData);

          // return
          load(false);
          // let servicesRef = 'sections/services/importServices';
          let servicesRef = firestore.collection('sections').doc('services').collection('importServices');
          let serviceItemsCollection = 'sections/services/importServiceItems';
          const records = serviceOrders.length + serviceItems.length;
          let mBreak1 = false;
          let mBreak2 = false;
          await arrayForEach(serviceOrders, async (item, i) => {
            if (mBreak1) {
              return;
            }
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / records);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(records).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                mBreak1 = true;
                onCancelImportData(
                  ['sections/services/importServices', serviceItemsCollection],
                  batchNo,
                  api,
                  handleCancel
                );
              }
            });
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await servicesRef.doc(item.orderNo).set(saveItem);
          });
          if (mBreak1) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          let serviceItemsRef = firestore.collection('sections').doc('services').collection('importServiceItems');

          await arrayForEach(serviceItems, async (item, n) => {
            if (mBreak2) {
              return;
            }
            // showLog({ n });
            const percent = Numb(((serviceOrders.length + n + 1) * 100) / records);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${serviceOrders.length + n + 1} จาก ${numeral(records).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                mBreak2 = true;
                onCancelImportData(
                  ['sections/services/importServices', serviceItemsCollection],
                  batchNo,
                  api,
                  handleCancel
                );
              }
            });
            let serviceItemId = `${item.orderNo}-${item.item}`;
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await serviceItemsRef.doc(serviceItemId).set(saveItem);
          });
          if (mBreak2) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        case 'sellParts':
          const spData = await formatSellPartsData(currentData);
          const spOrders = spData.orders;
          const spItems = spData.items;
          const groups = spData.groups;

          showLog({ spData });

          return;
          load(false);
          dataRef = firestore.collection('sections').doc('sales').collection('parts');
          collection = `sections/sales/parts`;
          let spItemsRef = firestore.collection('sections').doc('sales').collection('partItems');
          let groupsRef = firestore.collection('sections').doc('sales').collection('partGroups');
          let spItemCollection = `sections/sales/partItems`;
          const spRecords = spOrders.length + spItems.length;
          let spBreak1 = false;
          let spBreak2 = false;
          // Import part groups.
          await arrayForEach(groups, async (bItem, i) => {
            const padLastNo = ('0'.repeat(4) + i).slice(-4);

            let bItemNo = `${moment(bItem.saleDate, 'YYYY-MM-DD').format(
              'YYMMDD'
            )}${bItem.branchCode}${SourceOfDataMappingId[bItem.sourceOfData || 'sf']}${padLastNo}`;

            progress({
              show: true,
              percent: 0,
              text: 'กำลังอัปโหลด...'
            });
            const saveItem = cleanValuesBeforeSave(
              {
                ...bItem,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await groupsRef.doc(bItemNo).set(saveItem);
          });

          await arrayForEach(spOrders, async (item, i) => {
            if (spBreak1) {
              return;
            }
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / spRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(spRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                spBreak1 = true;
                onCancelImportData([collection, spItemCollection], batchNo, api, handleCancel);
              }
            });
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await dataRef.doc(item.saleNo).set(saveItem);
          });
          if (spBreak1) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          await arrayForEach(spItems, async (item, n) => {
            if (spBreak2) {
              return;
            }
            // showLog({ n });
            const percent = Numb(((spOrders.length + n + 1) * 100) / spRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${spOrders.length + n + 1} จาก ${numeral(spRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                spBreak2 = true;
                onCancelImportData([collection, spItemCollection], batchNo, api, handleCancel);
              }
            });

            let docItemNo = `${item.saleNo}-${item.item}`;
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await spItemsRef.doc(docItemNo).set(saveItem);
          });
          if (spBreak2) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        case 'vehicleList':
          let vehicleListRef = firestore.collection('data').doc('products').collection('vehicleList');
          let vlBreak1 = false;
          const vlRecords = currentData.length;
          await arrayForEach(currentData, async (item, i) => {
            if (vlBreak1) {
              return;
            }
            item.no_ && delete item.no_;
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / vlRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(vlRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                vlBreak1 = true;
                onCancelImportData(['data/products/vehicleList'], batchNo, api, handleCancel);
              }
            });
            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo,
                deleted: false
              },
              true
            );
            await vehicleListRef.doc(item.productCode).set(saveItem);
          });
          if (vlBreak1) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        case 'partList':
          let partListRef = firestore.collection('data').doc('products').collection('partList');
          let plBreak1 = false;
          const plRecords = currentData.length;
          await arrayForEach(currentData, async (item, i) => {
            if (plBreak1) {
              return;
            }
            item.no_ && delete item.no_;
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / plRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(plRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                plBreak1 = true;
                onCancelImportData(['data/products/partList'], batchNo, api, handleCancel);
              }
            });
            const {
              div,
              effectiveDate: eff_date,
              group,
              materialName: name_eng,
              materialNo: pCode,
              materialThaiName: name,
              model,
              no_,
              slp_no_vat,
              slp_plus_vat: slp,
              wsp_no_vat,
              wsp_plus_vat
            } = item;
            let sItem = {
              slp,
              slp_no_vat,
              model,
              name,
              name_eng,
              pCode,
              group,
              div,
              eff_date,
              pCode_lower: !!pCode ? pCode.toLowerCase() : '',
              name_lower: !!name ? name.toLowerCase() : '',
              name_eng_lower: !!name_eng ? name_eng.toLowerCase() : '',
              model_lower: !!model ? model.toLowerCase() : '',
              pCode_partial: partialText(pCode),
              name_partial: partialText(name),
              name_eng_partial: partialText(name_eng),
              model_partial: partialText(model)
            };
            // const sSnap = await partListRef.doc(sItem.pCode).get();
            // if (!sSnap.exists) {
            const saveItem = cleanValuesBeforeSave(
              {
                ...sItem,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            await partListRef.doc(sItem.pCode).set(saveItem);
            // } else {
            //   showWarning(`${sItem.pCode} อัปโหลดก่อนหน้านี้แล้ว!`);
            // Add anomaly
            // await api.addItem(
            //   {
            //     item,
            //     anomaly: {
            //       dataType: 'partList',
            //       type: 'IMPORT_DUPLICATED',
            //       by: user.uid,
            //       time: Date.now(),
            //       batchNo,
            //     },
            //   },
            //   'anomaly/imports/partList'
            // );
            // }
          });
          if (plBreak1) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        case 'fingerPrint':
          let fingerPrintRef = firestore.collection('sections').doc('hr').collection('importFingerPrint');
          let fingerPrintBatchRef = firestore.collection('sections').doc('hr').collection('importFingerPrintBatch');
          let plBreak11 = false;
          const fpRecords = currentData.length;
          await arrayForEach(currentData, async (item, i) => {
            if (plBreak11) {
              return;
            }
            item.no_ && delete item.no_;
            // showLog({ i });
            const percent = Numb(((i + 1) * 100) / fpRecords);
            progress({
              show: true,
              percent,
              text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(fpRecords).format('0,0')} รายการ`,
              subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
              onCancel: () => {
                plBreak11 = true;
                onCancelImportData(['sections/hr/importFingerPrint'], batchNo, api, handleCancel);
              }
            });

            const saveItem = cleanValuesBeforeSave(
              {
                ...item,
                importBy: user.uid,
                importTime: Date.now(),
                batchNo
              },
              true
            );
            if (!!item.employeeCode) {
              // New data will overwrite previous data.
              await fingerPrintRef.doc(`${item.employeeCode.toString()}-${item.date}`).set(saveItem);
              // Data will be recorded for each batch.
              await fingerPrintBatchRef.doc(`${item.employeeCode.toString()}-${item.date}-${batchNo}`).set(saveItem);
            }
          });
          if (plBreak11) {
            progress({ show: false, percent: 0, text: null, subtext: null });
            return;
          }
          break;
        default:
          break;
      }

      // Add import logs.
      let importRef = firestore.collection('sections').doc('imports').collection(dataType);
      await importRef.doc(batchNo.toString()).set({
        batchNo,
        dataType,
        by: user.uid,
        time: Date.now()
      });

      load(false);
      progress({ show: false, percent: 0, text: null, subtext: null });
      r(batchNo);
    } catch (e) {
      showWarn(e);
      load(false);
      progress({ show: false, percent: 0, text: '' });
      j(e);
    }

    // resetToInitial();
  });

export const getTitle = dataType => {
  switch (dataType) {
    case 'vehicles':
      return 'รับรถและอุปกรณ์';
    case 'parts':
      return 'รับอะไหล่';
    case 'services':
      return 'รายได้งานบริการ';
    case 'sellParts':
      return 'รายได้ขายอะไหล่';
    case 'vehicleList':
      return 'รายการรถและอุปกรณ์';
    case 'partList':
      return 'รายการอะไหล่';
    case 'fingerPrint':
      return 'การสแกนลายนิ้วมือ';

    default:
      return 'รับรถและอุปกรณ์';
  }
};

export const getDataType = title => {
  switch (title) {
    case 'รับรถและอุปกรณ์':
      return 'vehicles';
    case 'รับอะไหล่':
      return 'parts';
    case 'รายได้งานบริการ':
      return 'services';
    case 'รายได้ขายอะไหล่':
      return 'sellParts';
    case 'รายการรถและอุปกรณ์':
      return 'vehicleList';
    case 'รายการอะไหล่':
      return 'partList';
    case 'การสแกนลายนิ้วมือ':
      return 'fingerPrint';

    default:
      return 'vehicles';
  }
};
