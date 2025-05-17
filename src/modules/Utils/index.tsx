import { getFirestore, collection, doc, query, where, getDocs, DocumentData, QuerySnapshot, DocumentReference, Query, CollectionReference, getDoc } from 'firebase/firestore';
import { app } from 'services/firebase';
import { showWarn, getChanges, Numb } from 'utils/functions';
import { DateTime } from 'luxon';
import { extractLastNumbers } from 'utils/RegEx';
import { createKeywords } from 'utils';
import { VehicleHeaders } from 'utils/constant';
import _, { uniq } from 'lodash';
import { VehicleFilters } from 'utils/constant';
import { removeDoubleSpaces } from 'utils';
import { partialText } from 'utils';
import { createNewId } from 'utils';
import { showLog } from 'utils/functions';
import { convertToArray } from 'utils';
import { checkIsVehicleFromName } from 'utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { extractNumbersFromLastLetter } from 'utils/RegEx';
import { firstKey } from 'utils/functions';
import { isMobile } from 'react-device-detect';
import { store, RootState } from 'store';

// Types and Interfaces
interface User {
  uid: string;
  email?: string;
  displayName?: string;
  auth?: {
    firstName: string;
    lastName: string;
    nickName?: string;
  };
  firstName?: string;
  lastName?: string;
  nickName?: string;
  group?: string;
  device?: any;
}

interface Employee {
  uid?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  email?: string;
  group?: string;
  device?: any;
  displayName?: string;
}

interface EditRecord {
  uid: string;
  time: number;
  changes: Record<string, any>;
}

interface ResultType {
  [key: string]: any;
}

type WhenToBuyRange = { range: [string, string]; months: string[] } | null;

// Array type utilities
type KeywordsArray = string[];
type DocumentArray<T = any> = T[];

interface FormattedItem {
  id?: number;
  [key: string]: any;
}

interface VehicleItem extends FormattedItem {
  vehicleNo?: string[];
  engineNo?: string[];
  model?: string;
  peripheralNo?: string[];
  productCode?: string;
  productName?: string;
  unitPrice?: number;
  qty?: number;
  discount?: number;
  total?: string;
  vehicleType?: string;
  isEquipment?: boolean;
}

interface PaymentItem extends FormattedItem {
  amount: number;
  deleted?: boolean;
}

interface Branch {
  name: string;
  [key: string]: any;
}

interface Branches {
  [key: string]: Branch;
}

interface DataState {
  branches: Record<string, {
    branchName: string;
    [key: string]: any;
  }>;
  dealers: Record<string, {
    dealerName: string;
    prefix?: string;
    lastName?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface AppState {
  data: DataState;
}

interface Store {
  getState(): RootState;
}

// Helper function to get firestore instance
const getDb = () => getFirestore(app);

// Helper functions to replace the removed legacy Firebase API functions
const checkCollection = async (collectionPath: string, wheres?: [string, string, any][]): Promise<QuerySnapshot<DocumentData>> => {
  try {
    const db = getDb();
    let collectionRef: CollectionReference<DocumentData> = collection(db, collectionPath);
    let q: Query<DocumentData> = collectionRef;
    if (wheres && wheres.length > 0) {
      wheres.forEach(([field, op, value]) => {
        q = query(q, where(field, op as any, value));
      });
    }
    const snapshot = await getDocs(q);
    return snapshot;
  } catch (error) {
    console.error('Error checking collection:', error);
    throw error;
  }
};

const checkDoc = async (collectionPath: string, docId: string): Promise<DocumentData | null> => {
  try {
    const db = getDb();
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap : null;
  } catch (error) {
    console.error('Error checking document:', error);
    return null;
  }
};

const getMonths = ([startDate, stopDate]: [string, string]): string[] => {
  var monthArray: string[] = [];
  var currentDate = startDate;
  while (DateTime.fromFormat(currentDate, 'yyyy-MM-dd').toMillis() <= 
         DateTime.fromFormat(stopDate, 'yyyy-MM-dd').toMillis()) {
    monthArray.push(DateTime.fromFormat(currentDate, 'yyyy-MM-dd').toFormat('yyyy-MM'));
    currentDate = DateTime.fromFormat(currentDate, 'yyyy-MM-dd')
                  .plus({ months: 1 })
                  .toFormat('yyyy-MM-dd');
  }
  return monthArray;
};

export const getWhenToBuyRange = (wtb: string, TS?: string): WhenToBuyRange => {
  // thisWeek: 'สัปดาห์นี้',
  // thisMonth: 'เดือนนี้',
  // threeMonth: 'ภายใน 3 เดือน',
  // thisYear: 'ปีนี้',
  // nextYear: 'ปีหน้า',
  // longTime: 'อีกนาน',

  const taday = TS ? DateTime.fromISO(TS).toISO() : DateTime.now().toISO();
  if (!wtb || !taday) {
    return null;
  }
  const range: [string, string] = [taday, DateTime.now().plus({ months: 1 }).toISO() ?? ''];
  switch (wtb) {
    case 'สัปดาห์นี้':
    case 'thisWeek':
      range[1] = DateTime.now().plus({ weeks: 1 }).toISO();
      break;
    case 'เดือนนี้':
      range[1] = DateTime.now().plus({ months: 1 }).toISO();
      break;
    case 'ภายใน 3 เดือน':
    case 'threeMonth':
      range[1] = DateTime.now().plus({ months: 3 }).toISO();
      break;
    case 'ปีนี้':
    case 'thisYear':
      range[1] = DateTime.now().endOf('year').toISO();
      break;
    case 'ปีหน้า':
    case 'nextYear':
      let nextYearFromNow = DateTime.now().plus({ years: 1 });
      range[1] = nextYearFromNow.endOf('year').toISO();
      break;
    case 'อีกนาน':
    case 'longTime':
      // Long time estimated 10 years.
      range[1] = DateTime.now().plus({ years: 10 }).toISO();
      break;
    default:
      break;
  }
  let months = getMonths(range);
  return { range, months };
};

export const updateNewOrderCustomer = ({ values, firestore }: { values: any, firestore: any }) =>
  new Promise<string | boolean>(async (r, j) => {
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
          created: DateTime.now().toMillis(),
          address: address || null,
          customerId
        });
        r(customerId);
      } else {
        let arr: any[] = [];
        cSnap.forEach((doc: any) => {
          arr.push({ ...doc.data(), _id: doc.id });
        });
        arr.length > 0 ? r(arr[0]._id) : r(false);
      }
    } catch (e) {
      j(e);
    }
  });

export const updateNewOrderReferrer = ({ values, firestore, api, dispatch, user }: { values: any, firestore: any, api: any, dispatch: any, user: any }) =>
  new Promise<string | boolean>(async (r, j) => {
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
          created: DateTime.now().toMillis(),
          address: address || null,
          referrerId
        });
        r(referrerId);
      } else {
        let arr: any[] = [];
        cSnap.forEach((doc: any) => {
          arr.push({ ...doc.data(), _id: doc.id });
        });
        arr.length > 0 ? r(arr[0]._id) : r(false);
      }
    } catch (e) {
      j(e);
    }
  });

export const getNameFromUid = ({ uid, users, employees }: { uid: string, users: any, employees: any }) => {
  let employeesArr = Object.keys(employees).map((k: string) => employees[k]);
  let eIndex = employeesArr.findIndex((l: any) => l.uid && l.uid === uid);
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
  showLog(JSON.stringify({
    eIndex,
    user: users[uid],
    employee: employeesArr[eIndex],
    iName,
    users,
    employees,
    uid
  }));

  let eName = iName?.firstName ? `${iName.firstName}${iName.nickName ? ` (${iName.nickName || ''})` : ''}` : '';
  return eName;
};
export const getNameFromEmployeeCode = ({ employeeCode, employees }: { employeeCode: string, employees: any }) => {
  let employeesArr = Object.keys(employees).map((k: string) => employees[k]);
  let eIndex = employeesArr.findIndex((l: any) => l.employeeCode && l.employeeCode === employeeCode);
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
        !isMobile ? (iName.lastName || '') : ''
      }`.trim()
    : '-';
  return eName;
};

export const getFullName = (values: any = {}) => {
  let prefix = values.prefix || '';
  let firstName = values.firstName || '';
  let nickName = values.nickName ? ` ${values.nickName}` : '';
  let lastName = values.lastName ? ` ${values.lastName}` : '';
  return `${prefix}${firstName}${nickName}${lastName}`;
};

export const getEmployeesFromUsers = ({ users, employees }: { users: Record<string, User>, employees: Record<string, Employee> }): Record<string, Employee> => {
  let employeesArr: Employee[] = Object.keys(employees).map(k => employees[k]);
  let usersArr: User[] = Object.keys(users).map(k => users[k]);
  let arr1 = usersArr.map(u => {
    let eIndex = employeesArr.findIndex(l => l.uid && l.uid === u.uid);
    if (eIndex > -1) {
      u = {
        ...u,
        ...employeesArr[eIndex],
        firstName: employeesArr[eIndex].firstName,
        nickName: employeesArr[eIndex].nickName || undefined,
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
  let result: Record<string, Employee> = {};
  arr.forEach(it => {
    if (it.employeeCode) {
      result[it.employeeCode] = it;
    }
  });
  return result;
};

export const checkEditRecord = (row: any, data: any[], user: User, cKey: string): any => {
  let isEdit = !!row.created;
  const newValues = { ...row };
  if (isEdit) {
    const nData = [...data];
    let index = nData.findIndex(item => item[cKey || '_key'] === row[cKey || '_key']);
    const oldValues = nData[index];
    let changes = getChanges(oldValues, newValues);
    newValues.editedBy = !!oldValues.editedBy
      ? [...oldValues.editedBy, { uid: user.uid, time: DateTime.now().toMillis(), changes }]
      : [{ uid: user.uid, time: DateTime.now().toMillis(), changes }];
  }
  return newValues;
};

export const getPathFromCollectionName = (collectionName: string): [string, string] | [string, string, string] | null => {
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
      return ['users', 'users'];
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

export const getSumData = (values: { beforeVAT: number; VAT: number; whTax: number; netTotal: number; hasWHTax?: string }): Array<{ item: string; value: number }> => {
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

export const getAllCustomers = (): Promise<Record<string, any>> =>
  new Promise(async (r, j) => {
    try {
      let result: Record<string, any> = {};
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

export const getAllVehicles = (expenseId: string): Promise<Record<string, VehicleItem>> =>
  new Promise(async (r, j) => {
    try {
      let items: Record<string, VehicleItem> = {};
      const itemsSnap = await checkCollection('data/products/vehicleList');
      if (!itemsSnap) {
        return r({});
      }
      itemsSnap.forEach(doc => {
        let item = doc.data() as VehicleItem;
        item._key = doc.id;
        item.id = Object.keys(items).length;
        items[doc.id] = item;
      });
      r(items);
    } catch (e) {
      j(e);
    }
  });

export const formatVehicleItemData = (arr: VehicleItem[], dataIndex: string | number, rowIndex: number): Promise<VehicleItem[]> =>
  new Promise(async (resolve, reject) => {
    try {
      if (!Array.isArray(arr)) {
        return resolve([]);
      }
      if (rowIndex === -1) {
        const newData = await Promise.all(
          arr.map(async item => {
            let mItem = { ...item };
            if (mItem.productCode) {
              const sDoc = await checkDoc('data', `products/vehicleList/${mItem.productCode}`);
              if (sDoc) {
                const sData = sDoc.data();
                mItem.productName = sData.name;
              }
            }
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
            {
              const unitPrice = Number(mItem.unitPrice) || 0;
              const qty = Number(mItem.qty) || 0;
              const discount = Number(mItem.discount) || 0;
              mItem.total = (unitPrice * qty - discount).toFixed(2);
            }
            if (mItem.vehicleType) {
              mItem.isEquipment = /อุปกรณ์/.test(mItem.vehicleType);
            }
            return mItem;
          })
        );
        return resolve(newData);
      }

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

      if (['unitPrice', 'qty', 'discount', 'productCode'].includes(String(dataIndex))) {
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

export const formatPartItemData = (arr: any[], dataIndex: string, rowIndex: number): Promise<any[]> =>
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

export const formatServiceItemData = (arr: any[], dataIndex: string, rowIndex: number): Promise<any[]> =>
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

export const formatPaymentItemData = (arr: any[], dataIndex: string, rowIndex: number): Promise<any[]> =>
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

export const getBranchName = (branchCode: string, noPrefix?: boolean): string | null => {
  const { branches } = store.getState().data;
  if (!branchCode) {
    return null;
  }
  if (branchCode === 'all') {
    return 'ทุกสาขา';
  }
  return branches[branchCode]?.branchName === 'สำนักงานใหญ่'
    ? branches[branchCode].branchName
    : `${noPrefix ? '' : 'สาขา'}${branches[branchCode].branchName}`;
};

export const getDealerName = (id: string): string | null => {
  const { dealers } = store.getState().data;
  if (!id) {
    return null;
  }
  return dealers[id]?.dealerName === 'สำนักงานใหญ่'
    ? dealers[id].dealerName
    : `${dealers[id].prefix}${dealers[id].dealerName} ${dealers[id].lastName || ''}`;
};

export const cleanKeywordsArr = (arr: string[]): string[] => {
  let cArr: string[] = [];
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

  let kArr: string[] = [];
  cArr.map(l => {
    let kwArr = createKeywords(l);
    kArr = kArr.concat(kwArr);
    return l;
  });
  return _.uniq(kArr);
};

export const createProductKeywords = (val: { name: string; productCode: string }): string[] => {
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

export const extractVehicleNo = (str: string): string | null => {
  return str ? str.substring(0, 7) : null;
};

export const extractVehicleModel = (vNo: string, pName: string): string | null => {
  if (!vNo || !pName) return null;
  // ... rest of implementation
  return vNo;
};

export const getVehicleHeader = (pName: string): string | null => {
  // Extract vehicle header from product name.
  if (typeof pName !== 'string') {
    return null;
  }
  let arr: string[] = [];
  VehicleHeaders.map(l => {
    if (pName.search(l) > -1) {
      arr.push(l);
    }
    return l;
  });
  return arr.length > 0 ? arr[0] : null;
};

export const getModelFromName = (pName: string): string | null => {
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

export const extractPeripheralNo = (str: string): string => {
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

export const extractPeripheralModel = (str: string): string => {
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

export const getExtraSaleSnap = (items: any[]): any => {
  showLog(JSON.stringify({ items }));
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
  let vehicleNo: string[] = [];
  let engineNo: string[] = [];
  let peripheralNo: string[] = [];
  let model: string[] = [];
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
    model: model.length === 1 && model[0] === '' ? [] : model,
    vehicleNo: vehicleNo.length === 1 && vehicleNo[0] === '' ? [] : vehicleNo,
    peripheralNo: peripheralNo.length === 1 && peripheralNo[0] === '' ? [] : peripheralNo,
    engineNo: engineNo.length === 1 && engineNo[0] === '' ? [] : engineNo
  };
};

export const createBillNoSKCKeywords = (str: string): string[] => {
  if (!str) return [];
  const keywords = createDoubleKeywords(str);
  return keywords;
};

export const checkDuplicatedDoc = (collection: string, doc: Record<string, any>): Promise<any[]> =>
  new Promise(async (r, j) => {
    try {
      const field = firstKey(doc);
      if (!field) {
        return r([]);
      }
      let dupSnap = await checkCollection(collection, [[field, '==', doc[field]]]);
      if (!dupSnap) {
        return r([]);
      }
      let arr: any[] = [];
      dupSnap.forEach(dDoc => {
        arr.push({ ...dDoc.data(), _id: dDoc.id });
      });
      r(arr);
    } catch (e) {
      j(e);
    }
  });

export const createDoubleKeywords = (val: string): string[] => {
  return val ? val.split('').map((char, i) => val.slice(i)) : [];
};

export const createKeywordsWithName = (val: string, firstName: string, lastName?: string): string[] => {
  const keywords = createDoubleKeywords(val);
  if (firstName) keywords.push(...createDoubleKeywords(firstName));
  if (lastName) keywords.push(...createDoubleKeywords(lastName));
  return keywords;
};

export const checkPayments = (pItems: PaymentItem[], skip: boolean): { valid: boolean; message: string } => {
  let hasNoSelfBank = false;
  let hasNoPerson = false;
  let hasNoAmount = false;
  let hasNoPaymentMethod = false;
  if (skip) {
    return { valid: true, message: '' };
  }
  let arrNoAmount = pItems.filter(l => !l.deleted && Numb(l.amount) <= 0);
  let arrNoPerson: any[] = [];
  let arrNoSelfBank: any[] = [];
  let arrNoPaymentMethod: any[] = [];
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
  return { valid: !(hasNoSelfBank || hasNoPerson || hasNoAmount || hasNoPaymentMethod), message: '' };
};

// Parser utility function
const parser = (str: string): string => {
  // Implementation based on your needs
  return str || '';
};

// Add type for distinctArr function
function distinctArr<T extends Record<string, any>>(arr: T[], keys: string[]): T[] {
  return arr.filter((item, index, self) =>
    index === self.findIndex((t) => keys.every(key => t[key] === item[key]))
  );
}
