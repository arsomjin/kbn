import { checkCollection } from 'firebase/api';
import { checkDoc } from 'firebase/api';
import { getChanges } from 'functions';
import { Numb } from 'functions';
import { distinctArr } from 'functions';
import { store } from 'App';
import moment from 'moment';
import { extractLastNumbers } from 'utils/RegEx';
import { createKeywords } from 'utils';
import { parser } from 'functions';
import { VehicleHeaders } from 'utils/constant';
import _, { uniq } from 'lodash';
import { VehicleFilters } from 'utils/constant';
import { removeDoubleSpaces } from 'utils';
import { partialText } from 'utils';
import { createNewId } from 'utils';
import { showLog } from 'functions';
import { convertToArray } from 'utils';
import { checkIsVehicleFromName } from 'utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { extractNumbersFromLastLetter } from 'utils/RegEx';
import { firstKey } from 'functions';
import { isMobile } from 'react-device-detect';

const getMonths = ([startDate, stopDate]) => {
  var monthArray = [];
  var currentDate = startDate;
  while (moment(currentDate).isSameOrBefore(stopDate)) {
    monthArray.push(moment(currentDate, 'YYYY-MM-DD').format('YYYY-MM'));
    currentDate = moment(currentDate, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD');
  }
  return monthArray;
};

export const getWhenToBuyRange = (wtb, TS) => {
  // thisWeek: 'สัปดาห์นี้',
  // thisMonth: 'เดือนนี้',
  // threeMonth: 'ภายใน 3 เดือน',
  // thisYear: 'ปีนี้',
  // nextYear: 'ปีหน้า',
  // longTime: 'อีกนาน',

  let taday = TS ? moment(TS).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  if (!wtb) {
    return null;
  }
  let range = [taday, moment().add(1, 'month').format('YYYY-MM-DD')];
  switch (wtb) {
    case 'สัปดาห์นี้':
    case 'thisWeek':
      range[1] = moment().add(1, 'week').format('YYYY-MM-DD');
      break;
    case 'เดือนนี้':
      range[1] = moment().add(1, 'month').format('YYYY-MM-DD');
      break;
    case 'ภายใน 3 เดือน':
    case 'threeMonth':
      range[1] = moment().add(3, 'month').format('YYYY-MM-DD');
      break;
    case 'ปีนี้':
    case 'thisYear':
      range[1] = moment().endOf('year').format('YYYY-MM-DD');
      break;
    case 'ปีหน้า':
    case 'nextYear':
      let nextYearFromNow = moment().add(1, 'year');
      range[1] = moment(nextYearFromNow).endOf('year').format('YYYY-MM-DD');
      break;
    case 'อีกนาน':
    case 'longTime':
      // Long time estimated 10 years.
      range[1] = moment().add(10, 'year').format('YYYY-MM-DD');
      break;
    default:
      break;
  }
  let months = getMonths(range);
  return { range, months };
};

export const updateNewOrderCustomer = ({ values, firestore }) =>
  new Promise(async (r, j) => {
    try {
      const { prefix, firstName, lastName, phoneNumber, address } = values;
      if (!firstName) {
        return j('NO_CUSTOMER_NAME');
      }
      const customersRef = firestore.collection('data').doc('sales').collection('customers​');

      // Check duplicate customer.
      let cusRef = customersRef.where('firstName', '==', firstName);
      if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
        cusRef = cusRef.where('lastName', '==', lastName);
      }
      const cSnap = await cusRef.get();

      if (cSnap.empty) {
        let customerId = createNewId('CUS');
        await customersRef.doc(customerId).set({
          prefix,
          firstName,
          lastName: lastName || '',
          phoneNumber: phoneNumber || '',
          firstName_lower: firstName.toLowerCase(),
          firstName_partial: partialText(firstName),
          lastName_lower: !!lastName ? lastName.toLowerCase() : '',
          lastName_partial: !!lastName ? partialText(lastName) : '',
          phoneNumber_lower: !!phoneNumber ? phoneNumber.toLowerCase() : '',
          phoneNumber_partial: !!phoneNumber ? partialText(phoneNumber) : '',
          created: Date.now(),
          address: address || null,
          customerId
        });
        r(customerId);
      } else {
        let arr = [];
        cSnap.forEach(doc => {
          arr.push({ ...doc.data(), _id: doc.id });
        });
        arr.length > 0 ? r(arr[0]._id) : r(false);
      }
    } catch (e) {
      j(e);
    }
  });

export const updateNewOrderReferrer = ({ values, firestore, api, dispatch, user }) =>
  new Promise(async (r, j) => {
    try {
      if (!values.referrer) {
        // No referrer
        return r(false);
      }
      const { prefix, firstName, lastName, phoneNumber, address } = values.referrer;

      if (!firstName) {
        return j('NO_REFERRER_NAME');
      }

      const referrersRef = firestore.collection('data').doc('sales').collection('referrers');

      // Check duplicate referrer.
      let refRef = referrersRef.where('firstName', '==', firstName);
      if (!['ร้าน', 'หจก.', 'บจก.', 'บมจ.'].includes(prefix)) {
        refRef = refRef.where('lastName', '==', lastName);
      }
      const cSnap = await refRef.get();

      if (cSnap.empty) {
        let referrerId = createNewId('REF');
        await referrersRef.doc(referrerId).set({
          prefix,
          firstName,
          lastName: lastName || '',
          phoneNumber: phoneNumber || '',
          firstName_lower: firstName.toLowerCase(),
          firstName_partial: partialText(firstName),
          lastName_lower: !!lastName ? lastName.toLowerCase() : '',
          lastName_partial: !!lastName ? partialText(lastName) : '',
          phoneNumber_lower: !!phoneNumber ? phoneNumber.toLowerCase() : '',
          phoneNumber_partial: !!phoneNumber ? partialText(phoneNumber) : '',
          created: Date.now(),
          address: address || null,
          referrerId
        });
        r(referrerId);
      } else {
        let arr = [];
        cSnap.forEach(doc => {
          arr.push({ ...doc.data(), _id: doc.id });
        });
        arr.length > 0 ? r(arr[0]._id) : r(false);
      }
    } catch (e) {
      j(e);
    }
  });

export const getNameFromUid = ({ uid, users, employees }) => {
  let employeesArr = Object.keys(employees).map(k => employees[k]);
  let eIndex = employeesArr.findIndex(l => l.uid && l.uid === uid);
  let iName =
    eIndex > -1
      ? {
          firstName: employeesArr[eIndex]?.firstName,
          nickName: employeesArr[eIndex]?.nickName || null,
          lastName: employeesArr[eIndex]?.lastName
        }
      : users[uid]?.auth
        ? {
            firstName: users[uid].auth?.firstName,
            nickName: users[uid].auth?.nickName || null,
            lastname: users[uid].auth?.lastname
          }
        : {
            firstName: users[uid]?.firstName,
            nickName: users[uid]?.nickName || null,
            lastname: users[uid]?.lastname
          };
  showLog({
    eIndex,
    user: users[uid],
    employee: employeesArr[eIndex],
    iName,
    users,
    employees,
    uid
  });

  let eName = iName?.firstName ? `${iName.firstName}${!!iName.nickName ? ` (${iName.nickName})` : ''}` : '';
  return eName;
};
export const getNameFromEmployeeCode = ({ employeeCode, employees }) => {
  let employeesArr = Object.keys(employees).map(k => employees[k]);
  let eIndex = employeesArr.findIndex(l => l.employeeCode && l.employeeCode === employeeCode);
  let iName =
    eIndex > -1
      ? {
          firstName: employeesArr[eIndex]?.firstName,
          nickName: employeesArr[eIndex]?.nickName || null,
          lastName: employeesArr[eIndex]?.lastName
        }
      : null;

  let eName = !!iName
    ? `${iName.firstName}${!!iName.nickName ? ` (${iName.nickName})` : ''} ${
        !isMobile ? iName.lastName || null : ''
      }`.trim()
    : '-';
  return eName;
};

export const getFullName = (values = {}) => {
  let prefix = values.prefix || '';
  let firstName = values.firstName || '';
  let nickName = values.nickName ? ` ${values.nickName}` : '';
  let lastName = values.lastName ? ` ${values.lastName}` : '';
  return `${prefix}${firstName}${nickName}${lastName}`;
};

export const getEmployeesFromUsers = ({ users, employees }) => {
  let employeesArr = Object.keys(employees).map(k => employees[k]);
  let usersArr = Object.keys(users).map(k => users[k]);
  let arr1 = usersArr.map(u => {
    let eIndex = employeesArr.findIndex(l => l.uid && l.uid === u.uid);
    if (eIndex > -1) {
      u = {
        ...u,
        ...employeesArr[eIndex],
        firstName: employeesArr[eIndex].firstName,
        nickName: employeesArr[eIndex].nickName || null,
        lastName: employeesArr[eIndex].lastName
      };
    }
    return u;
  });
  let arr = employeesArr.map(u => {
    let eIndex = arr1.findIndex(l => l.uid && l.uid === u.uid);
    if (eIndex > -1) {
      u = {
        ...u,
        ...(arr1[eIndex].group && { group: arr1[eIndex].group }),
        email: arr1[eIndex].email,
        displayName: arr1[eIndex].displayName,
        device: arr1[eIndex].device
      };
    }
    return u;
  });
  arr = distinctArr(arr, ['uid']);
  let result = {};
  arr.map(it => {
    if (it.employeeCode) {
      result[it.employeeCode] = it;
    }
    return it;
  });
  return result;
};

export const checkEditRecord = (row, data, user, cKey) => {
  let isEdit = !!row.created;
  const newValues = { ...row };
  if (isEdit) {
    const nData = [...data];
    let index = nData.findIndex(item => item[cKey || '_key'] === row[cKey || '_key']);
    const oldValues = nData[index];
    let changes = getChanges(oldValues, newValues);
    newValues.editedBy = !!oldValues.editedBy
      ? [...oldValues.editedBy, { uid: user.uid, time: Date.now(), changes }]
      : [{ uid: user.uid, time: Date.now(), changes }];
  }
  return newValues;
};

export const getPathFromCollectionName = collectionName => {
  switch (collectionName) {
    case 'banks':
      return ['data', 'company/banks'];
    case 'branches':
      return ['data', 'company/branches'];
    case 'customers':
      return ['data', 'sales/customers'];
    case 'dealers':
      return ['data', 'sales/dealers'];
    case 'departments':
      return ['data', 'company/departments'];
    case 'employees':
      return ['data', 'company/employees'];
    case 'expenseAccountNames':
      return ['data', 'account/expenseName'];
    case 'expenseCategories':
      return ['data', 'account/expenseCategory'];
    case 'locations':
      return ['data', 'company/locations'];
    case 'permissionCategories':
      return ['data', 'company/permissionCategories'];
    case 'permissions':
      return ['data', 'company/permissions'];
    case 'userGroups':
      return ['data', 'company/userGroups'];
    case 'users':
      return ['users'];
    case 'vehicleList':
      return ['data', 'products/vehicleList'];
    case 'partList':
      return ['data', 'products/partList'];
    case 'warehouses':
      return ['data', 'company/warehouses'];
    case 'referrers':
      return ['data', 'sales/referrers'];
    case 'plants':
      return ['data', 'sales/plants'];
    // case 'stockVehicles':
    //   api.getStockVehicles();
    //   break;
    // case 'stockParts':
    //   api.getStockParts();
    //   break;

    default:
      return null;
  }
};

export const getSumData = values => {
  const { beforeVAT, VAT, whTax, netTotal, hasWHTax } = values;
  return [
    {
      item: 'จำนวนเงินก่อนหักภาษี',
      value: beforeVAT
    },
    {
      item: 'ภาษีมูลค่าเพิ่ม',
      value: VAT
    },
    {
      item: `ภาษี หัก ณ ที่จ่าย${hasWHTax ? ` ${hasWHTax}%` : ''}`,
      value: whTax
    },
    {
      item: 'รวมยอดสุทธิ',
      value: netTotal
    }
  ];
};

export const getAllCustomers = () =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      const snap = await checkCollection('data/sales/customers');
      if (snap) {
        snap.forEach(doc => {
          let customer = doc.data();
          customer._key = doc.id;
          result[doc.id] = customer;
        });
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const getAllVehicles = expenseId =>
  new Promise(async (r, j) => {
    try {
      let items = {};
      const itemsSnap = await checkCollection('data/products/vehicleList');
      if (!itemsSnap) {
        return r({});
      }
      itemsSnap.forEach(doc => {
        let item = doc.data();
        item._key = doc.id;
        item.id = items.length;
        items[doc.id] = item;
      });
      r(items);
    } catch (e) {
      j(e);
    }
  });

export const formatVehicleItemData = (arr, dataIndex, rowIndex) =>
  new Promise(async (resolve, reject) => {
    try {
      // Safely handle undefined or non-array input
      if (!Array.isArray(arr)) {
        return resolve([]);
      }
      // If rowIndex is -1, recalculate the entire table:
      if (rowIndex === -1) {
        const newData = await Promise.all(
          arr.map(async item => {
            let mItem = { ...item };
            // Update product details if productCode exists
            if (mItem.productCode) {
              const sDoc = await checkDoc('data', `products/vehicleList/${mItem.productCode}`);
              if (sDoc) {
                const sData = sDoc.data();
                mItem.productName = sData.name;
                // mItem.unitPrice = !mItem.isUsed ? Numb(sData.listPrice) : 0.0; // Allow user editing the price
              }
            }
            // Update peripheralNo and engineNo if vehicleNo has values
            if (Array.isArray(mItem.vehicleNo) && mItem.vehicleNo.length > 0) {
              const sSnap = await checkCollection('sections/stocks/vehicles', [['vehicleNo', 'in', mItem.vehicleNo]]);
              if (sSnap) {
                let peripheralNo = '';
                let engineNo = '';
                sSnap.forEach(doc => {
                  const d = doc.data();
                  peripheralNo = d?.peripheralNo;
                  engineNo = d?.engineNo;
                });
                mItem.peripheralNo = peripheralNo ? [peripheralNo] : mItem.peripheralNo;
                mItem.engineNo = engineNo ? [engineNo] : mItem.engineNo;
              }
            }
            // Recalculate total regardless of dataIndex
            {
              const unitPrice = Number(mItem.unitPrice) || 0;
              const qty = Number(mItem.qty) || 0;
              const discount = Number(mItem.discount) || 0;
              mItem.total = (unitPrice * qty - discount).toFixed(2);
            }
            // Update flag for vehicleType if needed
            if (mItem.vehicleType) {
              mItem.isEquipment = /อุปกรณ์/.test(mItem.vehicleType);
            }
            return mItem;
          })
        );
        return resolve(newData);
      }

      // For single-row update, ensure rowIndex is valid.
      if (rowIndex < 0 || rowIndex >= arr.length) {
        throw new Error('Invalid rowIndex provided to formatVehicleItemData.');
      }

      const newData = [...arr];
      let mItem = { ...arr[rowIndex] };

      if (dataIndex === 'productCode' && mItem.productCode) {
        const sDoc = await checkDoc('data', `products/vehicleList/${mItem.productCode}`);
        if (sDoc) {
          const sData = sDoc.data();
          mItem.productName = sData.name;
          mItem.unitPrice = !mItem.isUsed ? Numb(sData.listPrice) : 0.0;
        }
      }

      if (dataIndex === 'vehicleNo' && Array.isArray(mItem.vehicleNo) && mItem.vehicleNo.length > 0) {
        const sSnap = await checkCollection('sections/stocks/vehicles', [['vehicleNo', 'in', mItem.vehicleNo]]);
        if (sSnap) {
          let peripheralNo = '';
          let engineNo = '';
          sSnap.forEach(doc => {
            const d = doc.data();
            peripheralNo = d?.peripheralNo;
            engineNo = d?.engineNo;
          });
          mItem.peripheralNo = peripheralNo ? [peripheralNo] : mItem.peripheralNo;
          mItem.engineNo = engineNo ? [engineNo] : mItem.engineNo;
        }
      }

      if (['unitPrice', 'qty', 'discount', 'productCode'].includes(dataIndex)) {
        const unitPrice = Number(mItem.unitPrice) || 0;
        const qty = Number(mItem.qty) || 0;
        const discount = Number(mItem.discount) || 0;
        mItem.total = (unitPrice * qty - discount).toFixed(2);
      }

      if (dataIndex === 'vehicleType' && mItem.vehicleType) {
        mItem.isEquipment = /อุปกรณ์/.test(mItem.vehicleType);
      }

      newData.splice(rowIndex, 1, mItem);
      resolve(newData);
    } catch (e) {
      reject(e);
    }
  });

export const formatPartItemData = (arr, dataIndex, rowIndex) =>
  new Promise(async (resolve, reject) => {
    try {
      // Safely handle undefined or non-array input
      if (!Array.isArray(arr)) {
        return resolve([]);
      }
      // 1) Full-table recalculation if rowIndex === -1
      if (rowIndex === -1) {
        const newData = await Promise.all(
          arr.map(async item => {
            let mItem = { ...item };

            // If pCode exists, fetch doc and update fields
            if (mItem.pCode) {
              const sDoc = await checkDoc('data', `products/partList/${mItem.pCode}`);
              if (sDoc) {
                const sData = sDoc.data();
                mItem.productName = `${sData.name}${sData.model ? ` - ${sData.model}` : ''}`;
                mItem.unitPrice = Numb(sData.slp);
                // Calculate total
                const qty = Number(mItem.qty) || 0;
                const discount = Number(mItem.discount) || 0;
                mItem.total = (Numb(mItem.unitPrice) * qty - discount).toFixed(2);
                // partType
                mItem.partType = sData.partType || 'SKC';
              }
            } else {
              // If no pCode, still recalc total
              const qty = Number(mItem.qty) || 0;
              const discount = Number(mItem.discount) || 0;
              const unitPrice = Number(mItem.unitPrice) || 0;
              mItem.total = (unitPrice * qty - discount).toFixed(2);
            }
            return mItem;
          })
        );
        return resolve(newData);
      }

      // 2) Single-row update
      if (rowIndex < 0 || rowIndex >= arr.length) {
        throw new Error('Invalid rowIndex provided to formatPartItemData.');
      }
      const newData = [...arr];
      let mItem = { ...arr[rowIndex] };

      // If pCode changed
      if (dataIndex === 'pCode' && mItem.pCode) {
        const sDoc = await checkDoc('data', `products/partList/${mItem.pCode}`);
        if (sDoc) {
          const sData = sDoc.data();
          mItem.productName = `${sData.name}${sData.model ? ` - ${sData.model}` : ''}`;
          mItem.unitPrice = Numb(sData.slp);
          mItem.partType = sData.partType || 'SKC';
        }
      }

      // If one of these fields changed, recalc total
      if (['unitPrice', 'qty', 'discount', 'pCode'].includes(dataIndex)) {
        const unitPrice = Number(mItem.unitPrice) || 0;
        const qty = Number(mItem.qty) || 0;
        const discount = Number(mItem.discount) || 0;
        mItem.total = (unitPrice * qty - discount).toFixed(2);
      }

      newData.splice(rowIndex, 1, mItem);
      resolve(newData);
    } catch (err) {
      reject(err);
    }
  });

export const formatPartItemData_bak = (arr, dataIndex, rowIndex) =>
  new Promise(async (r, j) => {
    try {
      // showLog({ arr, dataIndex });
      let newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      if (dataIndex === 'pCode' && arr[rowIndex][dataIndex]) {
        const sDoc = await checkDoc('data', `products/partList/${mItem.pCode}`);
        if (sDoc) {
          mItem.productName = `${sDoc.data().name}${!!sDoc.data()?.model ? ` - ${sDoc.data().model}` : ''}`;
          mItem.unitPrice = Numb(sDoc.data().slp);
          mItem.total = (Numb(sDoc.data().slp) * Numb(mItem.qty) - Numb(sDoc.data()?.discount || 0)).toFixed(2);
          mItem.partType = sDoc.data().partType || 'SKC';
        }
      }
      if (['unitPrice', 'qty', 'discount'].includes(dataIndex)) {
        mItem.total = (Numb(mItem.unitPrice) * Numb(mItem.qty) - Numb(mItem?.discount || 0)).toFixed(2);
      }
      newData.splice(rowIndex, 1, mItem);
      r(newData);
    } catch (e) {
      j(e);
    }
  });

export const formatServiceItemData = (arr, dataIndex, rowIndex) =>
  new Promise(async (resolve, reject) => {
    try {
      // Safely handle undefined or non-array input
      if (!Array.isArray(arr)) {
        return resolve([]);
      }
      // Full-table recalculation
      if (rowIndex === -1) {
        const newData = await Promise.all(
          arr.map(async item => {
            let mItem = { ...item };
            let isPart = mItem.serviceItemType === 'อะไหล่';
            if (mItem.serviceCode) {
              const sDoc = await checkDoc(
                'data',
                isPart ? `products/partList/${mItem.serviceCode}` : `services/serviceList/${mItem.serviceCode}`
              );
              if (sDoc) {
                let unitPrice = isPart ? Numb(sDoc.data().slp) : Numb(sDoc.data().unitPrice);
                let totalBeforeDiscount = Numb(unitPrice) * Numb(mItem.qty);
                let discount = isPart
                  ? totalBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
                  : mItem?.discount || 0;
                mItem.item = sDoc.data().name;
                mItem.unitPrice = unitPrice;
                mItem.discount = discount;
                if (typeof mItem.returnQty !== 'undefined') {
                  let totalReturnBeforeDiscount = Numb(unitPrice) * Numb(mItem.returnQty || 0);
                  let returnDiscount = isPart
                    ? totalReturnBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
                    : mItem?.returnDiscount || 0;
                  let returnTotal = totalReturnBeforeDiscount - returnDiscount;
                  mItem.returnDiscount = returnDiscount;
                  mItem.returnTotal = returnTotal.toFixed(2);
                  mItem.total = (totalBeforeDiscount - discount - returnTotal).toFixed(2);
                } else {
                  mItem.total = (totalBeforeDiscount - discount).toFixed(2);
                }
              }
            }
            return mItem;
          })
        );
        return resolve(newData);
      }

      // Single-row update
      if (rowIndex < 0 || rowIndex >= arr.length) {
        throw new Error('Invalid rowIndex provided to formatServiceItemData.');
      }
      const newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      let isPart = mItem.serviceItemType === 'อะไหล่';
      if (dataIndex === 'serviceCode' && mItem.serviceCode) {
        const sDoc = await checkDoc(
          'data',
          isPart ? `products/partList/${mItem.serviceCode}` : `services/serviceList/${mItem.serviceCode}`
        );
        if (sDoc) {
          let unitPrice = isPart ? Numb(sDoc.data().slp) : Numb(sDoc.data().unitPrice);
          let totalBeforeDiscount = Numb(unitPrice) * Numb(mItem.qty);
          let discount = isPart
            ? totalBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
            : mItem?.discount || 0;
          mItem.item = sDoc.data().name;
          mItem.unitPrice = unitPrice;
          mItem.discount = discount;
          if (typeof mItem.returnQty !== 'undefined') {
            let totalReturnBeforeDiscount = Numb(unitPrice) * Numb(mItem.returnQty || 0);
            let returnDiscount = isPart
              ? totalReturnBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
              : mItem?.returnDiscount || 0;
            let returnTotal = totalReturnBeforeDiscount - returnDiscount;
            mItem.returnDiscount = returnDiscount;
            mItem.returnTotal = returnTotal.toFixed(2);
            mItem.total = (totalBeforeDiscount - discount - returnTotal).toFixed(2);
          } else {
            mItem.total = (totalBeforeDiscount - discount).toFixed(2);
          }
        }
      }
      if (['unitPrice', 'qty', 'discount', 'serviceCode'].includes(dataIndex)) {
        const unitPrice = Number(mItem.unitPrice) || 0;
        const qty = Number(mItem.qty) || 0;
        const discount = Number(mItem.discount) || 0;
        mItem.total = (unitPrice * qty - discount).toFixed(2);
      }
      newData.splice(rowIndex, 1, mItem);
      resolve(newData);
    } catch (e) {
      reject(e);
    }
  });

export const formatServiceItemData_bak = (arr, dataIndex, rowIndex) =>
  new Promise(async (r, j) => {
    try {
      // showLog({ arr, dataIndex });
      let newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      let isPart = mItem.serviceItemType === 'อะไหล่';
      if (dataIndex === 'serviceCode' && arr[rowIndex][dataIndex]) {
        const sDoc = await checkDoc(
          'data',
          isPart ? `products/partList/${mItem.serviceCode}` : `services/serviceList/${mItem.serviceCode}`
        );
        if (sDoc) {
          let unitPrice = isPart ? Numb(sDoc.data().slp) : Numb(sDoc.data().unitPrice);

          let totalBeforeDiscount = Numb(unitPrice) * Numb(mItem.qty);
          let discount = isPart
            ? totalBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
            : mItem?.discount || 0;
          mItem.item = sDoc.data().name;
          mItem.unitPrice = unitPrice;
          mItem.discount = discount;
          if (typeof mItem.returnQty !== 'undefined') {
            let totalReturnBeforeDiscount = Numb(unitPrice) * Numb(mItem?.returnQty || 0);
            let returnDiscount = isPart
              ? totalReturnBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
              : mItem?.returnDiscount || 0;
            let returnTotal = totalReturnBeforeDiscount - returnDiscount;
            mItem.returnDiscount = returnDiscount;
            mItem.returnTotal = returnTotal.toFixed(2);
            mItem.total = (totalBeforeDiscount - discount - returnTotal).toFixed(2);
          } else {
            mItem.total = (totalBeforeDiscount - discount).toFixed(2);
          }
        }
      }
      if (['unitPrice', 'qty', 'discount', 'returnQty'].includes(dataIndex)) {
        let totalBeforeDiscount = Numb(mItem.unitPrice) * Numb(mItem.qty);
        let discount =
          dataIndex === 'discount'
            ? Numb(mItem?.discount || 0)
            : isPart
              ? totalBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
              : mItem?.discount || 0;
        mItem.discount = discount;
        if (typeof mItem.returnQty !== 'undefined') {
          let totalReturnBeforeDiscount = Numb(mItem.unitPrice) * Numb(mItem?.returnQty || 0);
          let returnDiscount = isPart
            ? totalReturnBeforeDiscount * ((mItem?.discountCouponPercent || 0) / 100)
            : mItem?.returnDiscount || 0;
          let returnTotal = totalReturnBeforeDiscount - returnDiscount;
          mItem.returnDiscount = returnDiscount;
          mItem.returnTotal = returnTotal.toFixed(2);
          mItem.total = (totalBeforeDiscount - discount - returnTotal).toFixed(2);
        } else {
          mItem.total = (totalBeforeDiscount - discount).toFixed(2);
        }
      }
      newData.splice(rowIndex, 1, mItem);
      r(newData);
    } catch (e) {
      j(e);
    }
  });

export const formatPaymentItemData = (arr, dataIndex, rowIndex) =>
  new Promise(async (resolve, reject) => {
    try {
      // Safely handle undefined or non-array input
      if (!Array.isArray(arr)) {
        return resolve([]);
      }
      // Full-table recalculation: update every payment item
      if (rowIndex === -1) {
        const newData = await Promise.all(
          arr.map(async item => {
            let mItem = { ...item };
            // For example, if the payment item has a customer field, update the customerName.
            if (mItem.customer) {
              const sDoc = await checkDoc('data', `sales/customers/${mItem.customer}`);
              if (sDoc) {
                mItem.customerName = `${sDoc.data().firstName} ${sDoc.data().lastName || ''}`;
              }
            }
            return mItem;
          })
        );
        return resolve(newData);
      }

      // For single-row update, validate rowIndex
      if (rowIndex < 0 || rowIndex >= arr.length) {
        throw new Error('Invalid rowIndex provided to formatPaymentItemData.');
      }
      const newData = [...arr];
      let mItem = { ...arr[rowIndex] };

      // Update the customer field if that's the field being updated
      if (dataIndex === 'customer' && mItem.customer) {
        const sDoc = await checkDoc('data', `sales/customers/${mItem.customer}`);
        if (sDoc) {
          mItem.customerName = `${sDoc.data().firstName} ${sDoc.data().lastName || ''}`;
        }
      }
      newData.splice(rowIndex, 1, mItem);
      resolve(newData);
    } catch (e) {
      reject(e);
    }
  });

export const formatPaymentItemData_bak = (arr, dataIndex, rowIndex) =>
  new Promise(async (r, j) => {
    try {
      //  showLog({ arr, dataIndex });
      let newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      if (dataIndex === 'customer' && arr[rowIndex][dataIndex]) {
        const sDoc = await checkDoc('data', `sales/customers/${mItem.customer}`);
        if (sDoc) {
          mItem.customerName = `${sDoc.data().firstName} ${sDoc.data().lastName || ''}`;
        }
      }
      newData.splice(rowIndex, 1, mItem);
      r(newData);
    } catch (e) {
      j(e);
    }
  });

export const getBranchName = (branchCode, noPrefix) => {
  const { branches } = store.getState().data;
  if (!branchCode) {
    return null;
  }
  if (branchCode === 'all') {
    return 'ทุกสาขา';
  }
  return branches[branchCode].branchName === 'สำนักงานใหญ่'
    ? branches[branchCode].branchName
    : `${noPrefix ? '' : 'สาขา'}${branches[branchCode].branchName}`;
};

export const getDealerName = id => {
  const { dealers } = store.getState().data;
  if (!id) {
    return null;
  }
  return dealers[id].dealerName === 'สำนักงานใหญ่'
    ? dealers[id].dealerName
    : `${dealers[id].prefix}${dealers[id].dealerName} ${dealers[id].lastName || ''}`;
};

export const cleanKeywordsArr = arr => {
  let cArr = [];
  arr.map(l => {
    if (!l) {
      return l;
    }
    if (!['-', '+'].includes(l)) {
      cArr.push(l.replace('(', '').replace(')', ''));
    }
    let words = [
      'บุ้งกี๋',
      'เหล็กถ่วง',
      'เก็บเกี่ยว',
      'ข้าวโพด',
      'ถั่วเหลือง',
      'มันสำปะหลัง',
      'อ้อย',
      'ใบมีด',
      'เครื่องปลูก',
      'เครื่องพ่น',
      'เครื่องฝัง',
      'ตัดหญ้า',
      'เจาะหลุม',
      'ระเบิดดิน',
      'หยอด',
      'หยอดเมล็ด',
      'หยอดข้าว',
      'เกี่ยวข้าว',
      'นวดข้าว',
      'ตู้แอร์',
      'ดินแห้ง',
      'ฟาง',
      'กล้า',
      'ดำนา',
      'ล้อเหล็ก',
      'ปลูกอ้อย'
    ];
    words.map(w => {
      if (l.search(w) > -1) {
        cArr.push(w);
      }
      return w;
    });
    return l;
  });

  let kArr = [];
  cArr.map(l => {
    let kwArr = createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

export const createProductKeywords = val => {
  const { name, productCode } = val;
  if (!name || !productCode) {
    return [];
  }
  let arrName = name.toLowerCase().split(' ');
  let arrProductCode = productCode.toLowerCase().split(' ');
  let allArray = arrName.concat(arrProductCode);
  allArray.forEach((sName, i) => {
    if (sName.search(' - ') > -1) {
      let arr2 = sName.split(' - ');
      allArray = allArray.concat(arr2);
    }
    if (sName.search(' + ') > -1) {
      let arr3 = sName.split(' + ');
      allArray = allArray.concat(arr3);
    }
    if (sName.search('/') > -1) {
      let arr4 = sName.split('/');
      allArray = allArray.concat(arr4);
    }
  });
  return cleanKeywordsArr(allArray);
};

export const extractVehicleNo = str => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  let result = extractLastNumbers(str, 5);
  result = !!result ? result.toLowerCase() : '';
  return result;
};

export const extractVehicleModel = (vNo, pName) => {
  // Extract vehicle model from product name or vehicle number.
  if (typeof vNo !== 'string' || typeof pName !== 'string') {
    return vNo;
  }

  let result = null;
  let kIndex = vNo.lastIndexOf('-');
  if (!vNo.startsWith('KB') && kIndex > -1) {
    result = vNo.substring(0, kIndex);
    return result;
  }
};

export const getVehicleHeader = pName => {
  // Extract vehicle header from product name.
  if (typeof pName !== 'string') {
    return null;
  }
  let arr = [];
  VehicleHeaders.map(l => {
    if (pName.search(l) > -1) {
      arr.push(l);
    }
    return l;
  });
  return arr.length > 0 ? arr[0] : null;
};

export const getModelFromName = pName => {
  // Extract vehicle header from product name.
  if (typeof pName !== 'string') {
    return null;
  }
  let fName = pName;
  VehicleFilters.map(l => {
    if (pName.search(l) > -1) {
      fName = fName.replace(new RegExp(l, 'g'), '').trim();
    }
    return l;
  });
  fName = removeDoubleSpaces(fName);
  if (fName.startsWith('+') || fName.startsWith('-')) {
    fName = fName.substring(1).trim();
  }
  return removeDoubleSpaces(fName);
};

export const extractPeripheralNo = str => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  let result = str;
  let kIndex = str.lastIndexOf('-');
  if (kIndex > -1) {
    result = str.substring(kIndex + 1);
  } else {
    result = parser(extractLastNumbers(str, 7));
  }
  return !!result ? result.toLowerCase() : '';
};

export const extractPeripheralModel = str => {
  if (typeof str !== 'string') {
    return str;
  }
  let result = str;
  let kIndex = str.lastIndexOf('-');
  if (kIndex > -1) {
    result = str.substring(0, kIndex);
  } else {
    result = parser(str.substring(0, 6));
  }
  return result;
};

export const createVehicleNoKeyWords = str => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  let kArr = [];
  let words = extractLastNumbers(str, 5);
  if (!words || typeof words !== 'string') {
    return str;
  }
  [str.toLowerCase(), words.toLowerCase()].map(l => {
    let kwArr = createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};
export const createPeripheralNoKeyWords = str => {
  if (typeof str !== 'string') {
    return str;
  }
  let words = extractPeripheralNo(str);
  let kArr = [];
  if (!words || typeof words !== 'string') {
    return str;
  }
  [str.toLowerCase(), words.toLowerCase()].map(l => {
    let kwArr = createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

export const getExtraSaleSnap = items => {
  showLog({ items });
  if (!Array.isArray(items)) {
    return {};
  }
  let allItems = (items || []).map(it => {
    let vehicleArr = convertToArray(it.vehicleNo);
    let peripheralArr = convertToArray(it.peripheralNo);
    let engineArr = convertToArray(it.engineNo);
    let isVehicle = !!it?.productName ? checkIsVehicleFromName(it.productName) : vehicleArr.length > 0;
    let modelName =
      isVehicle || !!it.productName
        ? getModelFromName(it.productName)
        : !!peripheralArr[0]
          ? extractPeripheralModel(peripheralArr[0])
          : '';
    return {
      model: modelName,
      productCode: it.productCode || null,
      productName: it.productName || null,
      vehicleNo: vehicleArr,
      peripheralNo: peripheralArr,
      engineNo: engineArr,
      qty: it.qty || null,
      unitPrice: it.unitPrice || null,
      total: it.total || null,
      isVehicle
    };
  });
  let vehicleNo = [];
  let engineNo = [];
  let peripheralNo = [];
  let model = [];
  allItems.map(l => {
    if (!!l?.model) {
      model.push(l.model);
    }
    if (!!l?.vehicleNo && l.vehicleNo.length > 0) {
      vehicleNo = vehicleNo.concat(l.vehicleNo);
    }
    if (!!l?.peripheralNo && l.peripheralNo.length > 0) {
      peripheralNo = peripheralNo.concat(l.peripheralNo);
    }
    if (!!l?.engineNo && l.engineNo.length > 0) {
      engineNo = engineNo.concat(l.engineNo);
    }
    return l;
  });
  return {
    vehicles: allItems.filter(l => l.isVehicle),
    peripherals: allItems.filter(l => !l.isVehicle),
    model: model === [''] ? [] : model,
    vehicleNo: vehicleNo === [''] ? [] : vehicleNo,
    peripheralNo: peripheralNo === [''] ? [] : peripheralNo,
    engineNo: engineNo === [''] ? [] : engineNo
  };
};

export const createBillNoSKCKeywords = str => {
  if (!str) {
    return str;
  }
  let word1 = removeAllNonAlphaNumericCharacters(str);
  let word2 = extractNumbersFromLastLetter(str);
  let keyword1 = createKeywords(word1);
  let keyword2 = createKeywords(word2);

  let keywords = [...keyword1, ...keyword2];
  return keywords;
};

export const checkDuplicatedDoc = (collection, doc) =>
  new Promise(async (r, j) => {
    try {
      const field = firstKey(doc);
      let dupSnap = await checkCollection(collection, [[field, '==', doc[field]]]);
      if (!dupSnap) {
        return r(false);
      }
      let arr = [];
      dupSnap.forEach(dDoc => {
        arr.push({ ...dDoc.data(), _id: dDoc.id });
      });
      r(arr);
    } catch (e) {
      j(e);
    }
  });

export const createDoubleKeywords = val => {
  if (!val) {
    return [];
  }

  let val_lower = val.toLowerCase();
  let key1 = createKeywords(val_lower);
  let key2 = createKeywords(removeAllNonAlphaNumericCharacters(val_lower));
  return uniq([...key1, ...key2]);
};
export const createKeywordsWithName = (val, firstName, lastName) => {
  if (!val || !firstName) {
    return [];
  }
  let val_lower = val.toLowerCase();
  let key1 = createKeywords(val_lower);
  let key2 = createKeywords(removeAllNonAlphaNumericCharacters(val_lower));
  let key3 = createKeywords(firstName);
  let key4 = !!lastName ? createKeywords(lastName) : [];
  let keywords = uniq([...key1, ...key2, ...key3, ...key4]);
  return keywords;
};

export const checkPayments = (pItems, skip) => {
  let hasNoSelfBank = false;
  let hasNoPerson = false;
  let hasNoAmount = false;
  let hasNoPaymentMethod = false;
  if (skip) {
    return { hasNoSelfBank, hasNoAmount, hasNoPerson, hasNoPaymentMethod };
  }
  let arrNoAmount = pItems.filter(l => !l.deleted && Numb(l.amount) <= 0);
  let arrNoPerson = [];
  let arrNoSelfBank = [];
  let arrNoPaymentMethod = [];
  let arr = pItems.filter(l => !l.deleted && Numb(l.amount) > 0);
  arr.map(it => {
    const { paymentType, amount, selfBank, paymentMethod, customer, person } = it;
    switch (paymentType) {
      case 'cash':
        break;
      case 'transfer':
        if (Numb(amount) > 0) {
          if (!customer && !person) {
            arrNoPerson.push(it);
          }
          if (!selfBank) {
            arrNoSelfBank.push(it);
          }
          if (!paymentMethod) {
            arrNoPaymentMethod.push(it);
          }
        }
        break;

      default:
        break;
    }
    return it;
  });
  hasNoSelfBank = arrNoSelfBank.length > 0;
  hasNoPerson = arrNoPerson.length > 0;
  // hasNoAmount = arrNoAmount.length > 0;
  hasNoPaymentMethod = arrNoPaymentMethod.length > 0;
  return { hasNoSelfBank, hasNoAmount, hasNoPerson, hasNoPaymentMethod };
};
