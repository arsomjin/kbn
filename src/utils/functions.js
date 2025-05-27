import { uniqueNamesGenerator, names } from 'unique-names-generator';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { __DEV__ } from '.';
import { message } from 'antd';
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import {
  isMobile,
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
} from 'react-device-detect';
import { useModal } from '../contexts/ModalContext';

// Device detection
export const getCurrentDevice = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

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
    orientation,
  };
};

// Logging utilities
export const showLog = (...args) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const showWarn = (...args) => {
  if (__DEV__) {
    console.warn(...args);
  }
};

export const showError = (...args) => {
  if (__DEV__) {
    console.error(...args);
  }
};

/**
 * Create new ID with prefix
 * @param {string} prefix - ID prefix
 * @returns {string} New unique ID
 */
export const createNewId = (prefix) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`;
};

// Array utilities
export async function arrayForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function chunkArray(array, chunkLength) {
  if (!(Array.isArray(array) && chunkLength > 0)) {
    return [];
  }

  const result = [];
  const tempArray = [...array];

  while (tempArray.length > 0) {
    result.push(tempArray.splice(0, chunkLength));
  }

  return result;
}

// Date utilities
export const formatDate = (date) => {
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date.toString())) {
    return date.toString();
  }
  return dayjs(new Date(date)).format('YYYY-MM-DD');
};

export const dateToThai = (text) => {
  return dayjs(text).add(543, 'year').format('D MMM YY');
};

// Number utilities
export const Numb = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

export const formatCurrency = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

// Object utilities
export const isObject = (object) => {
  return object != null && typeof object === 'object';
};

export const deepEqual = (object1, object2) => {
  // Defensive: treat undefined/null as empty object
  const a = object1 && typeof object1 === 'object' ? object1 : {};
  const b = object2 && typeof object2 === 'object' ? object2 : {};

  const keys1 = Object.keys(a);
  const keys2 = Object.keys(b);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = a[key];
    const val2 = b[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  return true;
};

// Error handling
/**
 * errorHandler - Universal error handler for both utility and React component usage.
 * @param {Error} error - The error object
 * @param {Function} showAlertFn - (optional) A context-aware alert function (e.g. from useModal)
 */
export const errorHandler = (error, showAlertFn) => {
  let msg = 'กรุณาทำรายการใหม่อีกครั้ง';
  if (error?.message) {
    msg = getErrorMessage(error.message);
  }
  if (showAlertFn) {
    showAlertFn({
      title: 'ไม่สำเร็จ',
      content: msg,
    });
  }
  showLog('Error', { error, msg });
  addErrorLogs({ ...error, msg });
};

/**
 * useErrorHandler - React hook for context-aware error handling in components.
 * Returns a handler that uses the ModalContext for user feedback.
 * Usage: const errorHandler = useErrorHandler(); errorHandler(error);
 */
export const useErrorHandler = () => {
  const { showWarning } = useModal();
  return (error) =>
    errorHandler(error, ({ title, content }) => showWarning(`${title}: ${content}`));
};

export const getErrorMessage = (eMsg) => {
  if (!eMsg) return 'กรุณาทำรายการใหม่อีกครั้ง';

  if (eMsg.includes('Query.where')) {
    return 'กรุณาตรวจสอบพารามิเตอร์ที่ใช้ในการค้นหาข้อมูล';
  }

  return 'กรุณาทำรายการใหม่อีกครั้ง';
};

// Action sheet utilities
// DEPRECATED: Use modal.confirm from useAntdUi hook instead
export const showActionSheet = (modal, onClick, title, info) => {
  modal.confirm({
    title: title || 'ยืนยัน',
    content: info,
    onOk: onClick,
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    centered: true,
    maskClosable: false,
  });
};

export const hideActionSheet = () => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

// Message bar utilities
// DEPRECATED: Use modal.info/warning/error from useAntdUi hook instead
export const showMessageBar2 = (modal, title, info, theme, link, linkLabel) => {
  const modalProps = {
    title,
    content: link ? `${info}\n\n${linkLabel || 'คลิกที่นี่'}: ${link}` : info,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false,
  };

  if (theme === 'warning') {
    modal.warning(modalProps);
  } else if (theme === 'error') {
    modal.error(modalProps);
  } else {
    modal.info(modalProps);
  }
};

export const hideMessageBar = () => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

export const showMessageBar = (modal, title, info, theme, link, linkLabel) => {
  showMessageBar2(modal, title, info, theme, link, linkLabel);
};

// Alert utilities
// DEPRECATED: Use modal.info/warning/error from useAntdUi hook instead
export const showAlert2 = (modal, title, info, theme, onOk) => {
  const modalProps = {
    title,
    content: info,
    onOk,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false,
  };

  if (theme === 'warning') {
    modal.warning(modalProps);
  } else if (theme === 'error') {
    modal.error(modalProps);
  } else {
    modal.info(modalProps);
  }
};

export const hideAlert = () => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

export const showAlert = (modal, title, info, theme, onOk) => {
  const modalProps = {
    title,
    content: info,
    onOk,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false,
  };

  if (theme === 'warning') {
    modal.warning(modalProps);
  } else if (theme === 'error') {
    modal.error(modalProps);
  } else {
    modal.info(modalProps);
  }
};

export const showSuccess = (modal, title, info, theme, onOk) => {
  modal.success({
    title,
    content: info,
    onOk,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false,
  });
};

export const load = (loading, text, hideIndicator) => {
  console.log('load called with', { loading, text, hideIndicator });
};

// Confirm utilities
// DEPRECATED: Use modal.confirm from useAntdUi hook instead
export const showConfirm = (modal, onOk, messageText) => {
  modal.confirm({
    title: 'ยืนยัน',
    content: messageText,
    onOk,
  });
};

// Loader utilities
export const useLoad = () => {
  return {
    load: (loading, text, hideIndicator) => {
      console.log('load called with', { loading, text, hideIndicator });
    },
    showLoading: () => console.log('showLoading called'),
    hideLoading: () => console.log('hideLoading called'),
    withLoading: (promise) => promise,
  };
};

// Progress utilities
export const progress = (config) => {
  console.log('Progress called with config:', config);
  return () => console.log('Progress cleanup');
};

export const hideProgress = () => {
  console.log('hideProgress called');
};

export const createArrOfLength = (length) => [...Array(length).keys()];

export const waitFor = (ms) =>
  new Promise((r) => {
    const delayWaitFor = setTimeout(() => {
      clearTimeout(delayWaitFor);
      r(true);
    }, ms);
  });

export const capitalizeFirstLetter = (string) => {
  if (!!string && string.length > 0) return string.charAt(0).toUpperCase() + string.slice(1);
  return '';
};

export const validateMobileNumber = (mobile) => {
  const mobileRegex = /^0[1-9][0-9]{8}$/;
  return mobileRegex.test(mobile);
};

export const getPermCatFromPermissions = (permissions, permCats) => {
  const result = [];

  Object.entries(permCats).forEach(([cat, perms]) => {
    if (permissions.some((perm) => perms.includes(perm))) {
      result.push(cat);
    }
  });

  return result;
};

export const showGrantDenied = () => {
  message.warning({
    content: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    style: {
      marginTop: isMobile ? 32 : 64,
    },
    duration: 5,
  });
};

export const showToBeContinue = () => {
  message.info({
    content: 'ฟีเจอร์นี้กำลังอยู่ในขั้นตอนการพัฒนา',
    style: {
      marginTop: isMobile ? 32 : 64,
    },
    duration: 5,
  });
};

export const showConfirmDelete = (modal, deleteAction, itemName, unRecoverable) => {
  showActionSheet(
    modal,
    deleteAction,
    'ยืนยันการลบ',
    `คุณต้องการลบ${itemName ? ` ${itemName}` : ''} ใช่หรือไม่?${unRecoverable ? ' (ไม่สามารถกู้คืนได้)' : ''}`,
  );
};

export function distinctArr(arrItems, distinctKeys, sumKeys) {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  const map = new Map();

  arrItems.forEach((item) => {
    const key = distinctKeys.map((k) => String(item[k])).join('|');
    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key);
      sumKeys.forEach((k) => {
        const existingValue = existing[k];
        const itemValue = item[k];
        if (typeof existingValue === 'number' && typeof itemValue === 'number') {
          existing[k] = existingValue + itemValue;
        }
      });
    }
  });

  return Array.from(map.values());
}

export const distinctElement = (arrayOfElements) => {
  const uniqueArray = [...new Set(arrayOfElements)];
  return uniqueArray.map((elem) => ({
    name: elem,
    count: arrayOfElements.filter((l) => l === elem).length,
  }));
};

export const newPerson = () => {
  const statusChance = Math.random();
  const config = {
    dictionaries: [names],
    length: 1,
  };

  return {
    firstName: uniqueNamesGenerator(config),
    lastName: uniqueNamesGenerator(config),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status: statusChance > 0.66 ? 'relationship' : statusChance > 0.33 ? 'complicated' : 'single',
  };
};

export function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return Array.from({ length: len }, () => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

export const maskCurrency = (value, maxLength = 12, radix = ',') => {
  if (!value) return '';
  const str = value.toString().replace(/\D/g, '');
  return str.slice(0, maxLength).replace(/\B(?=(\d{3})+(?!\d))/g, radix);
};

export const cleanNumberFields = (valObj, fieldArr) => {
  const result = { ...valObj };

  fieldArr.forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = Numb(result[field]);
    }
  });

  return result;
};

export const cleanNumberFieldsInArray = (valArr, fieldArr) => {
  if (!Array.isArray(valArr) || !Array.isArray(fieldArr)) {
    return valArr;
  }

  return valArr.map((item) => cleanNumberFields(item, fieldArr));
};

export const getChanges = (oldObject = {}, newObject = {}) => {
  const a = oldObject && typeof oldObject === 'object' ? oldObject : {};
  const b = newObject && typeof newObject === 'object' ? newObject : {};

  const changes = {};

  Object.keys(b).forEach((key) => {
    if (!deepEqual(a[key], b[key])) {
      changes[key] = b[key];
    }
  });

  return changes;
};

export const getArrayChanges = (oldArray, newArray) => {
  const added = [];
  const removed = [];
  const modified = [];

  // Find added and modified items
  newArray.forEach((newItem) => {
    const oldItem = oldArray.find((item) => item.id === newItem.id);
    if (!oldItem) {
      added.push(newItem);
    } else if (!deepEqual(oldItem, newItem)) {
      modified.push(newItem);
    }
  });

  // Find removed items
  oldArray.forEach((oldItem) => {
    if (!newArray.find((item) => item.id === oldItem.id)) {
      removed.push(oldItem);
    }
  });

  return { added, removed, modified };
};

export const objectToArray = (obj) => {
  return Object.keys(obj).map((key) => {
    const result = {};
    result[key] = obj[key];
    return result;
  });
};

export const getKeysFromArray = (arr) => {
  return Object.keys(arr.reduce((o, c) => Object.assign(o, c)));
};

export const formatExcelToJson = (data, api, user) => {
  return new Promise((resolve, reject) => {
    try {
      const result = [];
      const headers = data[0];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const item = {};

        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            item[header] = row[index];
          }
        });

        if (Object.keys(item).length > 0) {
          result.push({
            ...item,
            api,
            user,
            createdAt: new Date().toISOString(),
          });
        }
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const isValidDate = (d) => {
  if (!(d instanceof Date)) return false;
  return !isNaN(d.getTime());
};

export const isDateTypeField = (field) => {
  if (typeof field !== 'string') return false;
  return (
    field.toLowerCase().includes('date') ||
    field.toLowerCase().includes('day') ||
    field.toLowerCase().includes('time')
  );
};

export const isTimeTypeField = (val) => {
  if (typeof val !== 'string') return false;
  const lowerVal = val.toLowerCase();
  return lowerVal.includes('time') || val.includes('เวลา') || lowerVal === 'created';
};

export const getVat = (total, priceType) => {
  if (!total || !priceType) return 0;

  const vatRate = 0.07;
  return priceType === 'include' ? total * vatRate : 0;
};

export const getBeforeVat = (total, priceType) => {
  if (!total || !priceType) return 0;

  const vatRate = 0.07;
  return priceType === 'include' ? total / (1 + vatRate) : total;
};

export const getWHTax = (total, priceType, hasWHTax) => {
  if (!total || !priceType || !hasWHTax) return 0;

  const whtRate = 0.03;
  const beforeVat = getBeforeVat(total, priceType);
  return beforeVat * whtRate;
};

export const isRowCompleted = (row, columns) => {
  if (!row || !Array.isArray(columns)) return false;

  return columns.every((column) => {
    if (!column.required) return true;
    const value = row[column.accessor];
    return value !== undefined && value !== null && value !== '';
  });
};

export const parser = (value) => {
  return value.replace(/[^\d.-]/g, '');
};

export const formatNumber = (value) => {
  if (!value || isNaN(Number(value))) {
    return value;
  }
  const decIndex = value.toString().indexOf('.');
  if (decIndex > -1) {
    let fVal = value.toString().substr(0, decIndex);
    fVal = parseFloat(fVal).toString();
    const bVal = parser(value.toString().substr(decIndex));
    return `${fVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${bVal}`;
  }
  return parseFloat(value.toString())
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const hasToParse = (fieldName) => {
  return [
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
    'amtPartType',
  ].includes(fieldName);
};

export const normalizeToDate = (input) => {
  if (!input) return null;
  if (typeof input === 'object' && input !== null && typeof input.toDate === 'function') {
    return input.toDate();
  }
  if (input instanceof Date) return input;
  if (typeof input === 'number' || typeof input === 'string') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/**
 * @deprecated Use processFormDataForFirestore from utils/dateHandling.ts for better reliability
 * Cleans and formats data before saving to Firebase
 * - Removes undefined, null, and empty string values
 * - Handles nested objects and arrays recursively
 * - Formats date fields appropriately
 * - Converts JS Date objects to Firestore Timestamps when specified
 *
 * @param {Object} values - Object to clean before saving
 * @param {Object} options - Options for cleaning behavior
 * @returns {Object} Clean object ready for Firebase
 */
export const cleanValuesBeforeSave = (values, options) => {
  // DEPRECATED WARNING - Guide developers to new system
  if (__DEV__) {
    console.warn(
      '🚨 cleanValuesBeforeSave is deprecated! Please migrate to the new date handling system:\n' +
        'import { processFormDataForFirestore } from "utils/dateHandling";\n' +
        'const cleanData = processFormDataForFirestore(formData);',
    );
  }

  const opts =
    typeof options === 'boolean'
      ? { skipDate: options }
      : {
          skipDate: false,
          removeEmptyArrays: true,
          removeEmptyObjects: true,
          convertDatesToTimestamps: true,
          preserveFields: [],
          ...options,
        };

  if (!values || typeof values !== 'object' || Array.isArray(values)) return {};

  const result = {};
  Object.entries(values).forEach(([key, value]) => {
    const shouldPreserve = opts.preserveFields?.includes(key);
    if (!shouldPreserve && (value === undefined || value === null || value === '')) return;

    // --- Date fields ---
    if (!opts.skipDate && isDateField(key) && value) {
      const ts = opts.convertDatesToTimestamps ? toFirestoreTimestamp(value) : toJSDate(value);
      if (ts) {
        result[key] = ts;
        return;
      }
      // If invalid, set to null or undefined
      result[key] = undefined;
      return;
    }

    // --- Arrays ---
    if (Array.isArray(value)) {
      const cleanedArr = value
        .filter((item) => item !== undefined && item !== null)
        .map((item) =>
          typeof item === 'object' && item !== null ? cleanValuesBeforeSave(item, opts) : item,
        );
      if (cleanedArr.length > 0 || !opts.removeEmptyArrays || shouldPreserve) {
        result[key] = cleanedArr;
      }
      return;
    }

    // --- Objects ---
    if (typeof value === 'object' && value !== null) {
      const cleanedObj = cleanValuesBeforeSave(value, opts);
      if (Object.keys(cleanedObj).length > 0 || !opts.removeEmptyObjects || shouldPreserve) {
        result[key] = cleanedObj;
      }
      return;
    }

    // --- Parser fields ---
    if (hasToParse(key)) {
      result[key] =
        typeof value === 'string'
          ? parser(value)
          : typeof value === 'number'
            ? parser(String(value))
            : parser('');
      return;
    }

    // --- Default ---
    result[key] = value;
  });

  return result;
};

/**
 * @deprecated Use processFirestoreDataForForm from utils/dateHandling.ts for better reliability
 * Formats Firestore-retrieved values for UI components.
 * - Converts all date fields to dayjs objects (for Antd, etc.)
 * - Recursively handles arrays and objects
 * - Handles undefined/null/empty values robustly
 * - Leaves non-date fields untouched except for parser fields
 */
export const formatValuesBeforeLoad = (values) => {
  // DEPRECATED WARNING - Guide developers to new system
  if (__DEV__) {
    console.warn(
      '🚨 formatValuesBeforeLoad is deprecated! Please migrate to the new date handling system:\n' +
        'import { processFirestoreDataForForm } from "utils/dateHandling";\n' +
        'const formData = processFirestoreDataForForm(firestoreData);',
    );
  }

  if (typeof values !== 'object' || !values) {
    return values;
  }

  const mValues = { ...values };
  Object.keys(mValues).forEach((k) => {
    const v = mValues[k];
    if (isDateField(k) && v) {
      mValues[k] = toDayjs(v);
    } else if (isDateField(k) && !v) {
      mValues[k] = undefined;
    } else if (v === undefined && !isDateField(k)) {
      mValues[k] = null;
    } else if (hasToParse(k)) {
      mValues[k] =
        typeof v === 'string' ? parser(v) : typeof v === 'number' ? parser(String(v)) : parser('');
    } else if (Array.isArray(v)) {
      mValues[k] = v.map((item) =>
        typeof item === 'object' && item !== null ? formatValuesBeforeLoad(item) : item,
      );
    } else if (typeof v === 'object' && v !== null) {
      mValues[k] = formatValuesBeforeLoad(v);
    }
  });

  return mValues;
};

export const removeTags = (str) => {
  if (!str || str === null || str === '') return '';
  return str.toString().replace(/(<([^>]+)>)/gi, '');
};

export const firstKey = (obj) => {
  return Object.keys(obj)[0];
};

export const hasKey = (key, obj) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const getStartDateFromDuration = (val) => {
  const now = dayjs();
  let result = now.startOf('day').format('YYYY-MM-DD');

  switch (val) {
    case 'today':
      result = now.startOf('day').format('YYYY-MM-DD');
      break;
    case 'sevenDays':
      result = now.subtract(7, 'day').format('YYYY-MM-DD');
      break;
    case 'thisWeek':
      result = now.startOf('week').format('YYYY-MM-DD');
      break;
    case 'thisMonth':
      result = now.startOf('month').format('YYYY-MM-DD');
      break;
    case 'thirtyDays':
      result = now.subtract(30, 'day').format('YYYY-MM-DD');
      break;
    case 'threeMonth':
      result = now.subtract(3, 'month').format('YYYY-MM-DD');
      break;
    case 'all':
      result = now.subtract(10, 'year').format('YYYY-MM-DD'); // 10 years
      break;
    default:
      break;
  }
  return result;
};

export const toCurrency = (val) => numeral(val).format('0,0.00');

export const roundToNearest5 = (x) => Math.round(x / 5) * 5;

export const toPhone = (txt) => {
  if (!txt) {
    return '';
  }
  const text = txt.toString();
  return `${text.slice(0, 3)}-${text.slice(3, 6)}-${text.slice(-4)}`;
};

export const getDates = (startDate, stopDate, format = 'YYYY-MM-DD') => {
  const dates = [];
  let currentDate = dayjs(startDate);
  const endDate = dayjs(stopDate);

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    dates.push(currentDate.format(format));
    currentDate = currentDate.add(1, 'day');
  }

  return dates;
};

export const getMonths = (
  startDate,
  stopDate,
  dateFormat = 'YYYY-MM-DD',
  monthFormat = 'YYYY-MM',
) => {
  const dates = getDates(startDate, stopDate, dateFormat);
  return [...new Set(dates.map((date) => dayjs(date).format(monthFormat)))];
};

export const showPrint = (ComponentToPrint, onAfterPrint, fileName) => {
  console.log('showPrint called with', { ComponentToPrint, onAfterPrint, fileName });
};

export const hidePrint = () => {
  console.log('hidePrint called');
};

export const getFields = (obj, fields, prefix = '') => {
  const result = {};

  fields.forEach((field) => {
    const key = prefix ? `${prefix}.${field}` : field;
    if (obj[field] !== undefined) {
      result[key] = obj[field];
    }
  });

  return result;
};

export const daysInMonth = (mth) => {
  if (!mth) {
    return 30;
  }
  const month = mth.slice(-2);
  const year = mth.substr(0, 4);
  const days = new Date(Number(year), Number(month), 0).getDate();
  return days;
};

export const arrayToText = (arr) => {
  if (!Array.isArray(arr)) return '';
  return arr.join(', ');
};

export const stripHtml = (str) => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

export const getDaysInMonth = (year, month) => {
  const days = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    days.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }

  return days;
};

export const getMonthNames = () => {
  const monthArray = Array.from({ length: 12 }, (_, i) => ({
    name: dayjs().month(i).format('MMMM'),
  }));

  return monthArray.map((m) => m.name);
};

// Modular Firestore error logging
export const addErrorLogs = async (error) => {
  try {
    const db = getFirestore();
    const errorLog = {
      ...error,
      createdAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    await addDoc(collection(db, 'logs', 'errors', 'entries'), errorLog);
  } catch (e) {
    // Fallback: log to console if Firestore fails
    console.error('Failed to log error to Firestore:', e, error);
  }
};

/**
 * Recursively compares two objects and returns a nested diff object.
 * For changed primitive values, returns { old, new }.
 * For changed objects, recurses and returns only changed fields.
 * If no changes, returns an empty object.
 */
export const getChangesDeep = (oldObject = {}, newObject = {}) => {
  const changes = {};
  const keys = new Set([...Object.keys(oldObject || {}), ...Object.keys(newObject || {})]);

  keys.forEach((key) => {
    const oldVal = oldObject[key];
    const newVal = newObject[key];
    if (
      typeof oldVal === 'object' &&
      oldVal !== null &&
      typeof newVal === 'object' &&
      newVal !== null
    ) {
      // Both are objects, recurse
      const nested = getChangesDeep(oldVal, newVal);
      if (Object.keys(nested).length > 0) {
        changes[key] = nested;
      }
    } else if (oldVal !== newVal) {
      changes[key] = { old: oldVal, new: newVal };
    }
  });

  return changes;
};

// --- Date Field Utilities ---
// NOTE: New improved date handling utilities are available in utils/dateHandling.ts
// These functions are maintained for backward compatibility

/**
 * @deprecated Use isDateField from utils/dateHandling.ts for better accuracy
 * Checks if a field name is a date/time type (case-insensitive, robust)
 */
export const isDateField = (key) => typeof key === 'string' && /date|day|time|at$/i.test(key);

/**
 * @deprecated Use toJSDate from utils/dateHandling.ts for better error handling
 * Converts any Firestore/JS/Dayjs/ISO date value to a JS Date, or null if invalid
 */
export const toJSDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
  if (dayjs.isDayjs(val) && typeof val.isValid === 'function')
    return val.isValid() ? val.toDate() : null;
  // Defensive: Only call isValid if this is a real dayjs object
  // This prevents runtime errors like "val.isValid is not a function"
  if (
    typeof val === 'object' &&
    val !== null &&
    'isValid' in val &&
    typeof val.isValid === 'function'
  ) {
    try {
      // Use dayjs.isDayjs to confirm
      if (dayjs.isDayjs(val)) {
        return val.isValid() ? val.toDate() : null;
      }
    } catch {
      // fallback
    }
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/**
 * @deprecated Use toFirestoreTimestamp from utils/dateHandling.ts for better error handling
 * Converts any Firestore/JS/Dayjs/ISO date value to a Firestore Timestamp, or null if invalid
 */
export const toFirestoreTimestamp = (val) => {
  const d = toJSDate(val);
  return d ? Timestamp.fromDate(d) : null;
};

/**
 * @deprecated Use toDayjs from utils/dateHandling.ts for better error handling
 * Converts any Firestore/JS/Dayjs/ISO date value to a dayjs object, or undefined if invalid
 */
export const toDayjs = (val) => {
  const d = toJSDate(val);
  return d ? dayjs(d) : undefined;
};
