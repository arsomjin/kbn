import * as Device from 'react-device-detect';
import { SuccessManager } from 'api/Success';
import { ActionSheetManager } from 'api/ActionSheet';
import { LoaderManager } from 'api/Loader';
import { w, h } from 'api';
import { MessageBarManager } from 'api/MessageBar';
import { AlertManager } from 'api/AlertDialog';
import namor from 'namor';
import { message, Modal } from 'antd';
import { FieldMapping } from 'data/fields-mapping';
import moment from 'moment';
import { FieldMappingToThai } from 'data/fields-mapping';
import { ProgressManager } from 'api/Progress';
import numeral from 'numeral';
import { PrinterManager } from 'api/Printer';
import { addErrorLogs } from 'firebase/api';
import { __DEV__ } from 'utils';
import { isVerySmallNumber } from 'utils/number';

export const getCurrentDevice = () => {
  const screenWidth = w(100);
  const screenHeight = h(100);
  const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
  const {
    isAndroid,
    isBrowser,
    isChrome,
    isChromium,
    isConsole,
    isEdge,
    isEdgeChromium,
    isElectron,
    isFirefox,
    isIE,
    isIOS,
    isIOS13,
    isIPad13,
    isIPhone13,
    isIPod13,
    isLegacyEdge,
    isMacOs,
    isMobile,
    isMobileOnly,
    isMobileSafari,
    isOpera,
    isSafari,
    isSmartTV,
    isTablet,
    isWearable,
    isWinPhone,
    isWindows,
    isYandex,
    mobileModel,
    mobileVendor,
    osName,
    osVersion
  } = Device;
  return {
    isAndroid,
    isBrowser,
    isChrome,
    isChromium,
    isConsole,
    isEdge,
    isEdgeChromium,
    isElectron,
    isFirefox,
    isIE,
    isIOS,
    isIOS13,
    isIPad13,
    isIPhone13,
    isIPod13,
    isLegacyEdge,
    isMacOs,
    isMobile,
    isMobileOnly,
    isMobileSafari,
    isOpera,
    isSafari,
    isSmartTV,
    isTablet,
    isWearable,
    isWinPhone,
    isWindows,
    isYandex,
    mobileModel,
    mobileVendor,
    osName,
    osVersion,
    screenWidth,
    screenHeight,
    orientation
  };
};

export const showLog = (tag, log) => {
  if (__DEV__) {
    if (typeof tag !== 'undefined' && typeof log !== 'undefined') {
      console.log(`${tag}: `, log);
    } else if (typeof log === 'undefined') {
      console.log(tag);
    }
  }
};

export const showWarn = (tag, log) => {
  if (__DEV__) {
    if (typeof tag !== 'undefined' && typeof log !== 'undefined') {
      console.warn(`${tag}: `, log);
    } else if (typeof log === 'undefined') {
      console.warn(tag);
    }
  }
};

export const showSuccess2 = (onClick, info, unDismiss) => {
  message.success({
    content: info || 'สำเร็จ',
    style: {
      marginTop: Device.isMobile ? 32 : 64
    },
    duration: unDismiss ? 0 : 5,
    onClick
  });
};

export const showSuccess = (onClick, info, unDismiss) => {
  SuccessManager.showSuccess({ onClick, info, unDismiss });
};

export const hideSuccess = () => {
  SuccessManager.hideSuccess();
};

export const showActionSheet = (onClick, title, info) => {
  ActionSheetManager.showActionSheet({ onClick, title, info });
};

export const hideActionSheet = () => {
  ActionSheetManager.hideActionSheet();
};

export const showMessageBar2 = (title, info, theme, link, linkLabel) => {
  // theme = primary, secondary, success, danger, warning, info, light, dark
  MessageBarManager.showMessageBar({ title, info, theme, link, linkLabel });
};

export const hideMessageBar = () => {
  MessageBarManager.hideMessageBar();
};

export const showMessageBar = (title, info, theme, link, linkLabel) => {
  message[theme || 'info']({
    content: title || info,
    style: {
      marginTop: Device.isMobile ? 32 : 64
    },
    duration: 5,
    onclose: link
  });
  // notification[theme || 'info']({
  //   message: title,
  //   description: info,
  //   placement: 'bottomRight',
  //   ...(link && {
  //     btn: (
  //       <a href={link} target="_blank" rel="noopener noreferrer">
  //         {link}
  //       </a>
  //     ),
  //   }),
  //   duration: 5,
  // });
};

export const showWarning = (info, onClick, unDismiss) => {
  message.warning({
    content: info,
    style: {
      marginTop: Device.isMobile ? 32 : 64
    },
    duration: unDismiss ? 0 : 5,
    onClick
  });
};

export const showAlert = (title, content, theme, onOk, onCancel) => {
  switch (theme) {
    case 'warning':
      Modal.warning({
        title,
        content,
        onOk,
        onCancel
      });
      break;
    case 'success':
      Modal.success({
        title,
        content,
        onOk,
        onCancel
      });
      break;
    case 'error':
      Modal.error({
        title,
        content,
        onOk,
        onCancel
      });
      break;

    default:
      Modal.info({
        title,
        content,
        onOk,
        onCancel
      });
      break;
  }
};

export const showAlert2 = (title, info, theme, onOk) => {
  // theme = primary, secondary, success, danger, warning, info, light, dark
  AlertManager.showAlert({ title, info, theme, onOk });
};

export const hideAlert = () => {
  AlertManager.hideAlert();
};

export const showConfirm2 = (title, info, onOk, onCancel) => {
  Modal.confirm({
    title,
    content: info,
    onOk,
    onCancel
  });
};

export const load2 = info => {
  message.load(info, 0);
};

export const load = (loading, text, hideIndicator) => {
  // DeviceEventEmitter.emit('loader', loading);
  if (loading) {
    LoaderManager.showLoader({ loading, text, hideIndicator });
  } else {
    LoaderManager.hideLoader();
  }
};

export const progress = ({ show, percent, text, subtext, onCancel }) => {
  // DeviceEventEmitter.emit('loader', loading);
  if (show) {
    ProgressManager.showProgress({ show, percent, text, subtext, onCancel });
  } else {
    ProgressManager.hideProgress();
  }
};

export const arrayForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const chunkArray = (array, chunkLength) => {
  if (!(Array.isArray(array) && chunkLength > 0)) {
    return showWarn('Input Error at chankArray function!');
  }
  let cArray = [];
  while (array.length > 0) {
    let chunk = array.splice(0, chunkLength);
    cArray.push(chunk);
  }
  return cArray;
};

export const getBoundRect = event => {
  const rippleContainer = event.currentTarget.getBoundingClientRect();
  // showLog('rippleContainer', rippleContainer);
  // showLog('event.pageX', event.pageX);
  const width = rippleContainer.width;
  const height = rippleContainer.height;
  return {
    width,
    height
  };
};

export const createArrOfLength = length => [...Array(length).keys()];

export const waitFor = ms =>
  new Promise(r => {
    // showLog('start', new Date().getTime());
    const delayWaitFor = setTimeout(() => {
      // showLog('stop', new Date().getTime());
      clearTimeout(delayWaitFor);
      r(true);
    }, ms);
  });

export const capitalizeFirstLetter = string => {
  if (!!string && string.length > 0) return string.charAt(0).toUpperCase() + string.slice(1);
  return '';
};

export const validateMobileNumber = text => {
  if (!text) {
    return false;
  }
  let inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const phoneno = /^0\(?([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (phoneno.test(inputtxt)) return true;
  return false;
};

export const getPermCatFromPermissions = (permissions, permCats) => {
  let permCat = {};
  Object.keys(permCats).map(key => {
    permCat[key] = false;
    return key;
  });
  // showLog('permissions', permissions);
  // eslint-disable-next-line array-callback-return
  Object.keys(permissions).map((pKey, pIndex) => {
    // showLog(`pKey: ${pKey}`);
    if (permissions[pKey]) {
      // showLog(`pGroupFromKey: ${pKey.slice(10, 11)}`);
      permCat[`permCat00${pKey.slice(10, 11)}`] = true;
    }
  });
  // showLog('permCat', permCat);
  return permCat;
};

export const showGrantDenied = () =>
  message['warning']({
    content: 'จำกัดสิทธิ์..',
    style: {
      marginTop: Device.isMobile ? 32 : 64
    },
    duration: 2.5
  }).then(() =>
    message['warning']({
      content: 'จำกัดสิทธิ์การเข้าถึงข้อมูลในส่วนนี้',
      style: {
        marginTop: Device.isMobile ? 32 : 64
      },
      duration: 2.5
    })
  );

export const showToBeContinue = () =>
  message['info']({
    content: 'To be continue..',
    style: {
      marginTop: Device.isMobile ? 32 : 64
    },
    duration: 2.5
  }).then(() =>
    message['info']({
      content: 'อยู่ระหว่างดำเนินการ..',
      style: {
        marginTop: Device.isMobile ? 32 : 64
      },
      duration: 2.5
    })
  );

export const showConfirm = (confirmAction, itemName, unCancellable) =>
  showActionSheet(
    confirmAction || (() => showLog('done!')),
    'ยืนยัน?',
    `ยืนยัน ${itemName || ''}? ${unCancellable ? 'รายการไม่สามรถยกเลิกได้' : ''}`
  );

export const showConfirmDelete = (deleteAction, itemName, unRecoverable) =>
  showActionSheet(
    deleteAction || (() => showLog('deleted!')),
    'ลบรายการ?',
    `ต้องการลบ ${itemName}? ${unRecoverable ? 'รายการไม่สามรถกู้คืนได้' : ''}`
  );

export const distinctArr = (arrItems, distinctKeys, sumKeys) => {
  if (!Array.isArray(arrItems) || arrItems.length === 0) return [];

  let result = [];
  let map = new Map();

  arrItems.forEach(elem => {
    // Generate a unique key based on distinctKeys
    let key = distinctKeys.map(k => elem[k]).join('/');

    if (!map.has(key)) {
      // Initialize new object with distinct key fields
      let newObj = { ...elem };

      // Initialize sum fields to numeric values
      if (sumKeys) {
        sumKeys.forEach(sk => {
          newObj[sk] = Numb(newObj[sk]) || 0;
        });
      }

      map.set(key, newObj);
      result.push(newObj);
    } else {
      let existingObj = map.get(key);

      // Accumulate sum fields
      if (sumKeys) {
        sumKeys.forEach(sk => {
          existingObj[sk] += Numb(elem[sk]) || 0;
        });
      }
    }
  });

  return result;
};

export const distinctElement = arrayOfElements => {
  const uniqueArray = [...new Set(arrayOfElements)];
  let result = uniqueArray.map((elem, i) => ({
    name: elem,
    count: arrayOfElements.filter(l => l === elem).length
  }));
  return result;
};

export const arrayMin = arrayOfElements => {
  return arrayOfElements.reduce(function (p, v) {
    return p < v ? p : v;
  });
};

export const arrayMax = arrayOfElements => {
  return arrayOfElements.reduce(function (p, v) {
    return p > v ? p : v;
  });
};

export const sortArr = (arrItems, sortKey) => {
  let arr = JSON.parse(JSON.stringify(arrItems)); // deep copy array.
  if (arr.length === 0) {
    return [];
  }
  let sArr = arr;
  let dir = 1;
  if (sortKey[0] === '-') {
    dir = -1;
    sortKey = sortKey.substring(1);
  }
  sArr = arr.sort((a, b) => {
    return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
  });
  return sArr;
};

export const sortArrByMultiKeys = (arrItems, sortKeys) => {
  // showLog('arrItems', arrItems);
  if (!(!!arrItems && Array.isArray(arrItems) && Array.isArray(sortKeys))) {
    return arrItems;
  }
  let arr = JSON.parse(JSON.stringify(arrItems)); // deep copy array.
  if (arr.length === 0) {
    return [];
  }
  // eslint-disable-next-line array-callback-return
  const result = arr.sort((a, b) => {
    (sortKeys || [])
      .map(o => {
        if (!o || !(!!a[o] || !!b[o])) {
          return 1;
        }
        let dir = 1;
        if (o[0] === '-') {
          dir = -1;
          o = o.substring(1);
        }
        return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
      })
      .reduce((p, n) => (p ? p : n), 0);
  });
  return result;
};

export const searchArr = (arrItems, search, keys) => {
  if (!Array.isArray(arrItems)) {
    return [];
  }
  if (arrItems && arrItems.length > 0) {
    const arr = JSON.parse(JSON.stringify(arrItems));
    const result = arr.filter(item => keys.some(key => String(item[key]).toLowerCase().includes(search.toLowerCase())));
    return result;
  }
  return [];
};

export const insertArr = (arr, index, insertItems) => {
  if (!arr || !Array.isArray(arr) || !insertItems) {
    return arr;
  }
  if (typeof index !== 'number') {
    return arr;
  }
  return [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted items array
    ...insertItems,
    // part of the array after the specified index
    ...arr.slice(index)
  ];
};

export const range = len => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = () => {
  const statusChance = Math.random();
  return {
    firstName: namor.generate({ words: 1, numbers: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status: statusChance > 0.66 ? 'relationship' : statusChance > 0.33 ? 'complicated' : 'single'
  };
};

export function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return range(len).map(d => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      };
    });
  };

  return makeDataLevel();
}

export const maskCurrency = (value, maxLength = 12, radix = ',') => {
  if (!value) {
    return value;
  }
  const currencyRegExp = new RegExp(`(\\d{1,${maxLength - 3}})(,)?(\\d{2})`, 'g');
  return value.replace(currencyRegExp, (match, p1, p2, p3) => [p1, p3].join(radix));
};

export const Numb = val => {
  if (!val || isNaN(val)) {
    return 0;
  }
  let mNum = val.toString().replace(/(\r\n|\n|\r|,| |)/g, '');
  let rNum = isNaN(mNum) ? 0 : Number(mNum);
  return isVerySmallNumber(rNum) ? 0 : rNum;
};

export const cleanNumberFields = (valObj, fieldArr) => {
  if (!Array.isArray(fieldArr)) {
    showWarn('invalid fieldArray props.');
    return valObj;
  }
  let result = JSON.parse(JSON.stringify(valObj));
  fieldArr.map(field => {
    result[field] = Numb(result[field]);
    return field;
  });
  return result;
};

export const cleanNumberFieldsInArray = (valArr, fieldArr) => {
  if (!Array.isArray(valArr) || !Array.isArray(fieldArr)) {
    showWarn('Invalid cleanNumberFieldsInArray input props.');
    return valArr;
  }
  let result = valArr.map((item, index) => {
    fieldArr.map(field => {
      item[field] = Numb(item[field]);
      return field;
    });
    return item;
  });
  return result;
};

export const getChanges = (oldObject = {}, newObject = {}) => {
  // This function detect the changes, return changed value/object of new object (2nd parameter).
  if (!isObject(oldObject) || !isObject(newObject)) {
    console.warn('Invalid input: Both parameters should be objects.');
    return false;
  }

  if (deepEqual(oldObject, newObject)) {
    return false; // No changes detected
  }

  const keys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)]);
  let changes = {};

  for (const key of keys) {
    const val1 = oldObject[key];
    const val2 = newObject[key];
    const areObjects = isObject(val1) && isObject(val2);
    const areDefined = typeof val1 !== 'undefined' && typeof val2 !== 'undefined';

    if (key === 'editedBy') continue; // Skip `editedBy` field

    if (areObjects) {
      const nestedChanges = getChanges(val1, val2); // Recursive deep comparison
      if (nestedChanges && Object.keys(nestedChanges).length > 0) {
        changes[FieldMappingToThai?.[key] || key] = nestedChanges;
      }
    } else if (areDefined && val1 !== val2) {
      changes[FieldMappingToThai?.[key] || key] = val2;
    }
  }

  if (Object.keys(changes).length > 0) {
    showLog({ oldObject, newObject, changes });
  }

  return Object.keys(changes).length > 0 ? changes : false;
};

export const getArrayChanges = (oldArray, newArray) => {
  // Ensure valid arrays
  if (!Array.isArray(oldArray) || !Array.isArray(newArray)) {
    console.warn('Invalid input: Both parameters should be arrays.');
    return [];
  }

  // Use JSON.stringify for small arrays, deepEqual for larger ones
  if (oldArray.length < 10 && newArray.length < 10) {
    if (JSON.stringify(oldArray) === JSON.stringify(newArray)) {
      return [];
    }
  } else {
    if (oldArray.length === newArray.length && deepEqual(oldArray, newArray)) {
      return [];
    }
  }

  let changes = [];

  newArray.forEach((item, i) => {
    const oldItem = oldArray[i];
    const areObjects = isObject(item) && isObject(oldItem);
    const areDefined = typeof item !== 'undefined' && typeof oldItem !== 'undefined';

    if (areDefined) {
      if (areObjects) {
        let mChanges = getChanges(oldItem, item);
        if (mChanges && Object.keys(mChanges).length > 0) {
          changes.push({ index: i, changes: mChanges });
        }
      } else if (oldItem !== item) {
        changes.push({ index: i, oldValue: oldItem, newValue: item });
      }
    } else if (!areDefined && typeof item !== 'undefined') {
      changes.push({ index: i, oldValue: oldItem || null, newValue: item });
    }
  });

  if (changes.length > 0) {
    showLog({ oldArray, newArray, changes });
  }

  return changes;
};

export const objectToArray = obj => Object.keys(obj).map(key => ({ [key]: obj[key] }));

export const getKeysFromArray = arr => Object.keys(arr.reduce((o, c) => Object.assign(o, c)));

export const formatExcelToJson = (dat, api, user) =>
  new Promise(async (r, j) => {
    try {
      const result = [];
      const anomalies = [];
      for (var i = 0; i < dat.rows.length; i++) {
        if (dat.rows[i].length === 0) {
          return dat;
        }
        let it = {};
        for (var n = 0; n < dat.rows[i].length; n++) {
          let val = dat.rows[i][n] || '';
          if (!!dat.cols[n + 1]) {
            let excelFieldName = dat.cols[n + 1].name.toString().trim();
            // Map excel header to field name.
            let fieldName = FieldMapping[excelFieldName];
            if (fieldName) {
              // showLog('last4', fieldName.substr(-4));
              let isDate = isDateTypeField(fieldName);
              // let isDate = fieldName.substr(-4) === 'Date';
              it[fieldName] = isDate
                ? val.length > 9
                  ? fieldName === 'effectiveDate'
                    ? moment(val, 'DD.MM.YYYY').format('YYYY-MM-DD')
                    : moment(val, 'DD/MM/YYYY').format('YYYY-MM-DD')
                  : fieldName === 'effectiveDate'
                    ? moment(val, 'DD.MM.YY').format('YYYY-MM-DD')
                    : moment(val, 'DD/MM/YY').format('YYYY-MM-DD')
                : val;
            } else {
              it[excelFieldName] = val;
              // Add anomaly
              anomalies.push({
                excelFieldName,
                value: val
              });
            }
          } else {
            showLog({ error: { n, col: dat.cols[n + 1], row: dat.rows[i] } });
          }
        }
        if (hasKey('productCode', it) && hasKey('fullName', it) && hasKey('department', it)) {
          // Field name mapping correction.
          it.employeeCode = it.productCode;
          delete it.productCode;
        }
        if (hasKey('employeeCode', it) && hasKey('fullName', it) && hasKey('department', it)) {
          // Field name mapping correction.
          it.branch = it.department;
          delete it.department;
        }
        result.push(it);
      }
      if (anomalies.length > 0) {
        const dAnomalies = distinctArr(anomalies, ['excelFieldName']);
        await arrayForEach(dAnomalies, async item => {
          await api.addItem(
            {
              item,
              anomaly: {
                type: 'FIELDNAME_MAPPING',
                by: user.uid,
                time: Date.now()
              }
            },
            'anomaly/imports/fieldName'
          );
        });
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const isValidDate = d => {
  return d instanceof Date && !isNaN(d);
};

export const isDateTypeField = val => {
  if (typeof val !== 'string') return false;
  const lowerVal = val.toLowerCase();
  return lowerVal.endsWith('date') || val.includes('วันที่') || lowerVal.startsWith('date');
};

export const isTimeTypeField = val => {
  if (typeof val !== 'string') return false;
  const lowerVal = val.toLowerCase();
  return lowerVal.includes('time') || val.includes('เวลา') || lowerVal === 'created';
};

export const getVat = (total, priceType) => {
  let result = 0;
  switch (priceType) {
    case 'noVat':
      result = 0;
      break;
    case 'separateVat':
      result = total * 0.07;
      break;
    case 'includeVat':
      result = (total / 1.07) * 0.07;
      break;

    default:
      result = (total / 1.07) * 0.07;
      break;
  }
  return result.toFixed(4);
};

export const getBeforeVat = (total, priceType) => {
  let result = 0;
  let vat = getVat(total, priceType);
  switch (priceType) {
    case 'noVat':
      result = total;
      break;
    case 'separateVat':
      result = total;
      break;
    case 'includeVat':
      result = total - vat;
      break;

    default:
      result = total;
      break;
  }
  return result.toFixed(4);
};

export const getWHTax = (total, priceType, hasWHTax) => {
  if (isNaN(total)) {
    return 0;
  }
  let bTotal = Numb(total);
  if (priceType === 'includeVat') {
    bTotal = Numb(total) / 1.07;
  }
  let result = (bTotal * Numb(hasWHTax)) / 100;
  return result.toFixed(4);
};

export const isRowCompleted = (row, columns) => {
  let completed = true;
  columns.map(l => {
    if (l.required && completed) {
      completed = !!row[l.dataIndex] || row[l.dataIndex] === 0;
    }
    return l;
  });
  return completed;
};

export const parser = value => {
  if (!value) {
    return value;
  }
  if (!(typeof value === 'number' || typeof value === 'string')) {
    return value;
  }
  return value.toString().replace(/(\r\n|\n|\r| |-|฿\s?)|(,*)/g, '');
};

export const formatNumber = value => {
  // showLog({ value });
  if (!value || isNaN(value)) {
    return value;
  }
  let decIndex = value.toString().indexOf('.');
  if (decIndex > -1) {
    // Has decimal.
    let fVal = value.substr(0, decIndex);
    fVal = parseFloat(fVal).toString();
    let bVal = parser(value.substr(decIndex));
    // bVal = bVal.replace(/./g, '');
    return `${fVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${bVal}`;
  }
  // showLog({
  //   value,
  //   pResult: parseFloat(value)
  //     .toString()
  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  // });
  return parseFloat(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const hasToParse = fieldName =>
  [
    'phoneNumber',
    'mobileNumber',
    'mobilePhoneNumber',
    'accNo',
    'bankAccNo',
    'discountCoupon',
    'discountPointRedeem',
    'SKCDiscount',
    'SKCManualDiscount',
    'AD_Discount',
    'netTotal',
    'amtOilType',
    'amtPartType'
  ].includes(fieldName);

export const cleanValuesBeforeSave = (values, skipDate) => {
  // Check undefined and replace to null,
  // Format date.
  if (typeof values !== 'object' || !values) {
    return values;
  }
  let mValues = { ...values };
  // showLog('value_to_be_clean', mValues);
  Object.keys(values).map((k, i) => {
    if (typeof values[k] === 'undefined') {
      mValues[k] = null;
    }
    // Return null
    if (!mValues[k]) {
      return k;
    }
    if (!skipDate && k.length >= 4 && (k.substr(-4) === 'Date' || k === 'date') && !!values[k]) {
      mValues[k] = moment(values[k]).format('YYYY-MM-DD');
    }
    if (Array.isArray(values[k])) {
      // showLog({ isArray: k, val: values[k] });
      mValues[k] = cleanArrayOfObject(values[k], skipDate);
    } else if (typeof mValues[k] === 'object') {
      mValues[k] = cleanObject(mValues[k]);
    }
    if (hasToParse(k) && ['number', 'string'].includes(typeof mValues[k])) {
      mValues[k] = parser(values[k]);
    }
    // showLog({ current_clean: { k, value: mValues[k] } });
    if (typeof mValues[k] === 'string' && mValues[k].startsWith(',')) {
      mValues[k] = mValues[k].substr(1);
    }
    return k;
  });
  return mValues;
};

const cleanArrayOfObject = (arr, skipDate) => {
  let result = [];
  let fArr = arr.filter(l => !!l);
  for (var i = 0; i < fArr.length; i++) {
    if (fArr[i]) {
      result[i] = typeof fArr[i] === 'object' ? cleanObject(fArr[i], skipDate) : fArr[i];
      // showLog({ cleaned_obj_arr: result[i] });
    }
  }
  return result;
};

const cleanObject = (obj, skipDate) => {
  let mObj = { ...obj };
  Object.keys(obj).map(k => {
    if (typeof obj[k] === 'undefined') {
      mObj[k] = null;
    }
    // Return null
    if (!mObj[k]) {
      return k;
    }
    if (!skipDate && k.length >= 4 && (k.substr(-4) === 'Date' || k === 'date')) {
      mObj[k] = moment(obj[k]).format('YYYY-MM-DD');
    }
    if (hasToParse(k) && ['number', 'string'].includes(typeof mObj[k])) {
      mObj[k] = parser(obj[k]);
    }
    if (Array.isArray(obj[k])) {
      // Array in array. Just 1 level nested array can be checked.
      // mObj[k] = obj[k].join();
      mObj[k] = obj[k];
    }
    if (typeof mObj[k] === 'string' && mObj[k].startsWith(',')) {
      mObj[k] = obj[k].substr(1);
    }
    return k;
  });
  return mObj;
};

export const formatValuesBeforeLoad = values => {
  // Check undefined and replace to null,
  // Format date.
  if (typeof values !== 'object' || !values) {
    return values;
  }
  let mValues = { ...values };
  Object.keys(values).map((k, i) => {
    let dateType = k.length >= 4 && (k.substr(-4) === 'Date' || k === 'date');
    if (dateType && !!values[k]) {
      mValues[k] = moment(values[k], 'YYYY-MM-DD');
    }
    if (dateType && !values[k]) {
      mValues[k] = undefined;
    }
    if (values[k] === undefined && !dateType) {
      mValues[k] = null;
    }
    if (hasToParse(k)) {
      mValues[k] = parser(values[k]);
    }
    return k;
  });
  return mValues;
};

export const removeTags = str => {
  if (!str || str === null || str === '') return str;
  else str = str.toString();
  return str.replace(/(<([^>]+)>)/gi, '');
};

export const isObject = object => {
  return object != null && typeof object === 'object';
};

export const deepEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  return true;
};

export const firstKey = obj => {
  if (!isObject(obj)) {
    return undefined;
  }
  for (var key in obj) if (Object.getOwnPropertyDescriptor(obj, key)) return key;
};

export const hasKey = (key, obj) => {
  if (!isObject(obj) || typeof key !== 'string') {
    return false;
  }
  return Object.keys(obj)
    .map(k => k)
    .includes(key);
};

export const getStartDateFromDuration = val => {
  let result = moment().startOf('d').format('YYYY-MM-DD');
  switch (val) {
    case 'today':
      result = moment().startOf('d').format('YYYY-MM-DD');
      break;
    case 'sevenDays':
      result = moment().subtract(7, 'd').format('YYYY-MM-DD');
      break;
    case 'thisWeek':
      result = moment().startOf('week').format('YYYY-MM-DD');
      break;
    case 'thisMonth':
      result = moment().startOf('month').format('YYYY-MM-DD');
      break;
    case 'thirtyDays':
      result = moment().subtract(30, 'd').format('YYYY-MM-DD');
      break;
    case 'threeMonth':
      result = moment().subtract(3, 'month').format('YYYY-MM-DD');
      break;
    case 'all':
      result = moment().subtract(10, 'years').format('YYYY-MM-DD'); // 10 years.
      break;

    default:
      break;
  }
  return result;
};

export const toCurrency = val => numeral(val).format('0,0.00');

export const roundToNearest5 = x => Math.round(Number(x) / 5) * 5;

export const toPhone = txt => {
  if (!txt) {
    return txt;
  }
  let text = txt.toString();
  return `${text.slice(0, 3)}-${text.slice(3, 6)}-${text.slice(-4)}`;
};

export const getDates = (startDate, stopDate, format) => {
  var dateArray = [];
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(moment(currentDate, 'YYYY-MM-DD').format(format));
    currentDate = moment(currentDate, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
  }
  // showLog({ startDate, stopDate, format, dateArray });
  return dateArray;
};

export const getMonths = (startDate, stopDate, dateFormat, monthFormat) => {
  var monthArray = [];
  var dateArr = getDates(startDate, stopDate, dateFormat);
  monthArray = dateArr.map(d => moment(d, dateFormat).format(monthFormat || 'MMM YYYY'));
  return distinctElement(monthArray).map(l => l.name);
};

export const formatDate = mDate => {
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(mDate)) {
    return mDate;
  } else {
    return moment(mDate).format('YYYY-MM-DD');
  }
};

export const showPrint = (ComponentToPrint, onAfterPrint, fileName) => {
  PrinterManager.showPrinter({
    ComponentToPrint,
    ...(onAfterPrint && { onAfterPrint }),
    ...(fileName && { fileName })
  });
};
export const hidePrint = () => {
  PrinterManager.hidePrinter();
};

export const getErrorMessage = eMsg => {
  if (!['number', 'string'].includes(typeof eMsg) || !eMsg) {
    return eMsg;
  }
  let str = eMsg.toString().trim();
  if (str.indexOf('Query.where') > -1) {
    return 'กรุณาตรวจสอบพารามิเตอร์ที่ใช้ในการค้นหาข้อมูล';
  } else {
    return 'กรุณาทำรายการใหม่อีกครั้ง';
  }
};

let alertShown = false;

export const errorHandler = error => {
  let msg = 'กรุณาทำรายการใหม่อีกครั้ง';
  if (!!error?.message) {
    msg = getErrorMessage(error.message);
  }
  if (!alertShown) {
    showAlert('ไม่สำเร็จ', msg || '', 'warning');
    alertShown = true;
  }
  showLog({ error, msg });
  addErrorLogs(Object.assign(error, { msg }));
};

export const getFields = (o, fields, p, c) => {
  // p: path
  // c: context (accumulator)
  if (!o || typeof o !== 'object') {
    return {};
  }
  if (p === undefined) {
    p = '';
    c = {};
  }
  for (var prop in o) {
    if (!o.hasOwnProperty(prop)) continue;
    if (fields.indexOf(prop) !== -1) c[p + prop] = o[prop];
    else if (typeof o[prop] === 'object') getFields(o[prop], fields, prop + '/', c);
  }
  return c;
};

export const daysInMonth = mth => {
  if (!mth) {
    // showLog({ no_month: mth });
    return 30;
  }
  const month = mth.slice(-2);
  const year = mth.substr(0, 4);
  const days = new Date(year, month, 0).getDate();
  // showLog({ month, year, days });
  return days;
};

export const dateToThai = text => moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY');

export const arrayToText = arr => {
  let txt = '';
  arr.map(elem => {
    txt = `${txt} ${elem}`;
    return elem;
  });
  return txt.trim();
};
