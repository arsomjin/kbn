import { uniqueNamesGenerator, Config, names } from 'unique-names-generator';
import { Modal } from 'antd';
import { FieldMapping, FieldMappingToThai } from '../data/fields-mapping';
import { DateTime } from 'luxon';
// import ProgressManager from 'api/Progress/Progress';
import numeral from 'numeral';
// import { PrinterManager } from 'api/Printer';
import { __DEV__ } from '../utils';
import { isVerySmallNumber } from './number';
import type { ModalFuncProps } from 'antd/es/modal/interface';
import { message } from 'antd';
// import { useLoading } from 'hooks/useLoading';
import { addErrorLogs } from './firestoreUtils';
import { isMobile, isAndroid, isBrowser, isChrome, isChromium, isConsole, isEdge, isEdgeChromium, isElectron, isFirefox, isIE, isIOS, isIOS13, isIPad13, isIPhone13, isIPod13, isLegacyEdge, isMacOs, isMobileOnly, isMobileSafari, isOpera, isSafari, isSmartTV, isTablet, isWearable, isWinPhone, isWindows, isYandex, mobileModel, mobileVendor, osName, osVersion } from 'react-device-detect';

// Types
interface DeviceInfo {
  isAndroid: boolean;
  isBrowser: boolean;
  isChrome: boolean;
  isChromium: boolean;
  isConsole: boolean;
  isEdge: boolean;
  isEdgeChromium: boolean;
  isElectron: boolean;
  isFirefox: boolean;
  isIE: boolean;
  isIOS: boolean;
  isIOS13: boolean;
  isIPad13: boolean;
  isIPhone13: boolean;
  isIPod13: boolean;
  isLegacyEdge: boolean;
  isMacOs: boolean;
  isMobile: boolean;
  isMobileOnly: boolean;
  isMobileSafari: boolean;
  isOpera: boolean;
  isSafari: boolean;
  isSmartTV: boolean;
  isTablet: boolean;
  isWearable: boolean;
  isWinPhone: boolean;
  isWindows: boolean;
  isYandex: boolean;
  mobileModel: string | null;
  mobileVendor: string | null;
  osName: string;
  osVersion: string;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

interface MessageConfig {
  content: string;
  style?: React.CSSProperties;
  duration?: number;
  onClick?: () => void;
}

interface AlertConfig {
  title: string;
  content: string;
  onOk?: () => void;
  onCancel?: () => void;
}

interface ProgressConfig {
  show?: boolean;
  percent?: number;
  text?: string;
  subtext?: string;
  onCancel?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

interface ProgressManagerType {
  showProgress: (config: ProgressConfig) => void;
  hideProgress: () => void;
}

interface PrinterManagerType {
  showPrinter: (config: { ComponentToPrint: React.ComponentType; onAfterPrint?: () => void; fileName?: string }) => void;
  hidePrinter: () => void;
}

// Device detection
export const getCurrentDevice = (): DeviceInfo => {
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
    orientation
  };
};

// Logging utilities
export const showLog = (tag: string, log?: unknown): void => {
  if (__DEV__) {
    if (typeof tag !== 'undefined' && typeof log !== 'undefined') {
      console.log(`${tag}: `, log);
    } else if (typeof log === 'undefined') {
      console.log(tag);
    }
  }
};

export const showWarn = (tag: string, log?: unknown): void => {
  if (__DEV__) {
    if (typeof tag !== 'undefined' && typeof log !== 'undefined') {
      console.warn(`${tag}: `, log);
    } else if (typeof log === 'undefined') {
      console.warn(tag);
    }
  }
};

/**
 * Create new ID with prefix
 * @param prefix - ID prefix
 * @returns New unique ID
 */
export const createNewId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Message utilities
export const showSuccess = (config: MessageConfig): void => {
  message.success({
    content: config.content || 'สำเร็จ',
    style: {
      marginTop: isMobile ? 32 : 64
    },
    duration: config.duration || 5,
    onClick: config.onClick
  });
};

export const showWarning = (config: MessageConfig): void => {
  message.warning({
    content: config.content,
    style: {
      marginTop: isMobile ? 32 : 64
    },
    duration: config.duration || 5,
    onClick: config.onClick
  });
};

export const showAlert = (config: AlertConfig): void => {
  Modal.confirm({
    title: config.title,
    content: config.content,
    onOk: config.onOk,
    onCancel: config.onCancel,
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    centered: true,
    maskClosable: false
  });
};

// Array utilities
export async function arrayForEach<T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void>
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function chunkArray<T>(array: T[], chunkLength: number): T[][] {
  if (!(Array.isArray(array) && chunkLength > 0)) {
    showWarn('Input Error at chunkArray function!', 'Invalid input');
    return [];
  }
  
  const result: T[][] = [];
  const tempArray = [...array];
  
  while (tempArray.length > 0) {
    result.push(tempArray.splice(0, chunkLength));
  }
  
  return result;
}

// Date utilities
export const formatDate = (date: string | Date): string => {
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date.toString())) {
    return date.toString();
  }
  return DateTime.fromJSDate(new Date(date)).toFormat('yyyy-MM-dd');
};

export const dateToThai = (text: string): string => {
  return DateTime.fromFormat(text, 'yyyy-MM-dd')
    .plus({ years: 543 })
    .setLocale('th')
    .toFormat('d MMM yy');
};

// Number utilities
export const Numb = (val: unknown): number => {
  if (!val || isNaN(Number(val))) {
    return 0;
  }
  const mNum = val.toString().replace(/(\r\n|\n|\r|,| |)/g, '');
  const rNum = isNaN(Number(mNum)) ? 0 : Number(mNum);
  return isVerySmallNumber(rNum) ? 0 : rNum;
};

export const formatCurrency = (value: string | number): string => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
};

// Object utilities
export const isObject = (object: unknown): boolean => {
  return object != null && typeof object === 'object';
};

export const deepEqual = (object1: Record<string, unknown>, object2: Record<string, unknown>): boolean => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1 as Record<string, unknown>, val2 as Record<string, unknown>)) || 
        (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  return true;
};

// Error handling
export const errorHandler = (error: Error): void => {
  let msg = 'กรุณาทำรายการใหม่อีกครั้ง';
  if (error?.message) {
    msg = getErrorMessage(error.message);
  }
  
  showAlert({
    title: 'ไม่สำเร็จ',
    content: msg
  });
  
  showLog('Error', { error, msg });
  addErrorLogs({ ...error, msg });
};

export const getErrorMessage = (eMsg: string): string => {
  if (!eMsg) return 'กรุณาทำรายการใหม่อีกครั้ง';
  
  if (eMsg.includes('Query.where')) {
    return 'กรุณาตรวจสอบพารามิเตอร์ที่ใช้ในการค้นหาข้อมูล';
  }
  
  return 'กรุณาทำรายการใหม่อีกครั้ง';
};

// Success utilities
export const showSuccess2 = (
  onClick?: () => void,
  info?: string,
  unDismiss?: boolean
): void => {
  message.success({
    content: info || 'สำเร็จ',
    style: {
      marginTop: isMobile ? 32 : 64
    },
    duration: unDismiss ? 0 : 5,
    onClick
  });
};

export const hideSuccess = (): void => {
  // No need for this function as Ant Design's message handles its own lifecycle
};

// Action sheet utilities
export const showActionSheet = (
  onClick?: () => void,
  title?: string,
  info?: string
): void => {
  Modal.confirm({
    title: title || 'ยืนยัน',
    content: info,
    onOk: onClick,
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    centered: true,
    maskClosable: false
  });
};

export const hideActionSheet = (): void => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

// Message bar utilities
export const showMessageBar2 = (
  title?: string,
  info?: string,
  theme?: string,
  link?: string,
  linkLabel?: string
): void => {
  const modalProps: ModalFuncProps = {
    title,
    content: link 
      ? `${info}\n\n${linkLabel || 'คลิกที่นี่'}: ${link}`
      : info,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false
  };

  if (theme === 'warning') {
    Modal.warning(modalProps);
  } else if (theme === 'error') {
    Modal.error(modalProps);
  } else {
    Modal.info(modalProps);
  }
};

export const hideMessageBar = (): void => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

export const showMessageBar = (
  title?: string,
  info?: string,
  theme?: string,
  link?: string,
  linkLabel?: string
): void => {
  showMessageBar2(title, info, theme, link, linkLabel);
};

// Alert utilities
export const showAlert2 = (
  title?: string,
  info?: string,
  theme?: string,
  onOk?: () => void
): void => {
  const modalProps: ModalFuncProps = {
    title,
    content: info,
    onOk,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false
  };

  if (theme === 'warning') {
    Modal.warning(modalProps);
  } else if (theme === 'error') {
    Modal.error(modalProps);
  } else {
    Modal.info(modalProps);
  }
};

export const hideAlert = (): void => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

// Confirm utilities
export const showConfirm2 = (
  title?: string,
  info?: string,
  onOk?: () => void,
  onCancel?: () => void
): void => {
  Modal.confirm({
    title: title || 'ยืนยัน',
    content: info,
    onOk,
    onCancel,
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    centered: true,
    maskClosable: false
  });
};

// Loader utilities
export const useLoad = () => {
  return {
    load: (loading?: boolean, text?: string, hideIndicator?: boolean) => {
      console.log('load called with', { loading, text, hideIndicator });
    },
    showLoading: () => console.log('showLoading called'),
    hideLoading: () => console.log('hideLoading called'),
    withLoading: <T>(promise: Promise<T>) => promise
  };
};

// Progress utilities
export const progress = (config: ProgressConfig): (() => void) => {
  console.log('Progress called with config:', config);
  return () => console.log('Progress cleanup');
};

export const hideProgress = (): void => {
  console.log('hideProgress called');
};

export const createArrOfLength = (length: number): number[] => [...Array(length).keys()];

export const waitFor = (ms: number): Promise<boolean> =>
  new Promise(r => {
    const delayWaitFor = setTimeout(() => {
      clearTimeout(delayWaitFor);
      r(true);
    }, ms);
  });

export const capitalizeFirstLetter = (string: string): string => {
  if (!!string && string.length > 0) return string.charAt(0).toUpperCase() + string.slice(1);
  return '';
};

export const validateMobileNumber = (text: string): boolean => {
  if (!text) {
    return false;
  }
  const inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const phoneno = /^0\(?([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (phoneno.test(inputtxt)) return true;
  return false;
};

export const getPermCatFromPermissions = (
  permissions: string[],
  permCats: Record<string, string[]>
): string[] => {
  const result: string[] = [];
  
  Object.entries(permCats).forEach(([cat, perms]) => {
    if (permissions.some(perm => perms.includes(perm))) {
      result.push(cat);
    }
  });
  
  return result;
};

export const showGrantDenied = (): void => {
  message.warning({
    content: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    style: {
      marginTop: isMobile ? 32 : 64
    },
    duration: 5
  });
};

export const showToBeContinue = (): void => {
  message.info({
    content: 'ฟีเจอร์นี้กำลังอยู่ในขั้นตอนการพัฒนา',
    style: {
      marginTop: isMobile ? 32 : 64
    },
    duration: 5
  });
};

export const showConfirm = (
  confirmAction?: () => void,
  itemName?: string,
  unCancellable?: boolean
): void => {
  showActionSheet(
    confirmAction,
    'ยืนยัน',
    `คุณต้องการยืนยัน${itemName ? ` ${itemName}` : ''} ใช่หรือไม่?`
  );
};

export const showConfirmDelete = (
  deleteAction?: () => void,
  itemName?: string,
  unRecoverable?: boolean
): void => {
  showActionSheet(
    deleteAction,
    'ยืนยันการลบ',
    `คุณต้องการลบ${itemName ? ` ${itemName}` : ''} ใช่หรือไม่?${unRecoverable ? ' (ไม่สามารถกู้คืนได้)' : ''}`
  );
};

export function distinctArr<T extends Record<string, unknown>>(
  arrItems: T[],
  distinctKeys: string[],
  sumKeys: string[]
): T[] {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  const result: T[] = [];
  const map = new Map<string, T>();

  arrItems.forEach(item => {
    const key = distinctKeys.map(k => String(item[k])).join('|');
    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key)!;
      sumKeys.forEach(k => {
        const existingValue = existing[k];
        const itemValue = item[k];
        if (typeof existingValue === 'number' && typeof itemValue === 'number') {
          (existing as Record<string, number>)[k] = existingValue + itemValue;
        }
      });
    }
  });

  return Array.from(map.values());
}

export const distinctElement = <T>(arrayOfElements: T[]): Array<{ name: T; count: number }> => {
  const uniqueArray = [...new Set(arrayOfElements)];
  return uniqueArray.map(elem => ({
    name: elem,
    count: arrayOfElements.filter(l => l === elem).length
  }));
};

export const arrayMin = <T extends number>(arrayOfElements: T[]): T => {
  return arrayOfElements.reduce((p, v) => p < v ? p : v);
};

export const arrayMax = <T extends number>(arrayOfElements: T[]): T => {
  return arrayOfElements.reduce((p, v) => p > v ? p : v);
};

export function sortArr<T extends Record<string, unknown>>(
  arrItems: T[],
  sortKey: string
): T[] {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  return [...arrItems].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }

    return 0;
  });
}

export function sortArrByMultiKeys<T extends Record<string, unknown>>(
  arrItems: T[],
  sortKeys: string[]
): T[] {
  if (!Array.isArray(arrItems)) {
    return [];
  }

  return [...arrItems].sort((a, b) => {
    for (const key of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const compare = aVal.localeCompare(bVal);
        if (compare !== 0) return compare;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const compare = aVal - bVal;
        if (compare !== 0) return compare;
      }
    }

    return 0;
  });
}

export function searchArr<T extends Record<string, unknown>>(
  arrItems: T[],
  search: string,
  keys: string[]
): T[] {
  if (!Array.isArray(arrItems) || !search) {
    return arrItems;
  }

  const searchLower = search.toLowerCase();
  return arrItems.filter(item =>
    keys.some(key => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(searchLower);
    })
  );
}

export function insertArr<T>(
  arr: T[],
  index: number,
  insertItems: T[]
): T[] {
  if (!Array.isArray(arr) || !Array.isArray(insertItems)) {
    return arr;
  }

  const result = [...arr];
  result.splice(index, 0, ...insertItems);
  return result;
}

export const range = (len: number): number[] => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

export const newPerson = (): Record<string, unknown> => {
  const statusChance = Math.random();
  const config: Config = {
    dictionaries: [names],
    length: 1
  };
  
  return {
    firstName: uniqueNamesGenerator(config),
    lastName: uniqueNamesGenerator(config),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status: statusChance > 0.66 ? 'relationship' : statusChance > 0.33 ? 'complicated' : 'single'
  };
};

export function makeData(...lens: number[]): Record<string, unknown>[] {
  const makeDataLevel = (depth = 0): Record<string, unknown>[] => {
    const len = lens[depth];
    return Array.from({ length: len }, () => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      };
    });
  };

  return makeDataLevel();
}

export const maskCurrency = (
  value: string | number,
  maxLength = 12,
  radix = ','
): string => {
  if (!value) return '';
  const str = value.toString().replace(/\D/g, '');
  return str.slice(0, maxLength).replace(/\B(?=(\d{3})+(?!\d))/g, radix);
};

export const cleanNumberFields = (
  valObj: Record<string, unknown>,
  fieldArr: string[]
): Record<string, unknown> => {
  const result = { ...valObj };
  
  fieldArr.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = Numb(result[field]);
    }
  });
  
  return result;
};

export const cleanNumberFieldsInArray = <T extends Record<string, unknown>>(
  valArr: T[],
  fieldArr: string[]
): T[] => {
  if (!Array.isArray(valArr) || !Array.isArray(fieldArr)) {
    return valArr;
  }

  return valArr.map(item => cleanNumberFields(item, fieldArr) as T);
};

export const getChanges = (
  oldObject: Record<string, unknown> = {},
  newObject: Record<string, unknown> = {}
): Record<string, unknown> => {
  const changes: Record<string, unknown> = {};

  Object.keys(newObject).forEach(key => {
    if (!deepEqual(oldObject[key] as Record<string, unknown>, newObject[key] as Record<string, unknown>)) {
      changes[key] = newObject[key];
    }
  });

  return changes;
};

export const getArrayChanges = <T extends Record<string, unknown>>(
  oldArray: T[],
  newArray: T[]
): { added: T[]; removed: T[]; modified: T[] } => {
  const added: T[] = [];
  const removed: T[] = [];
  const modified: T[] = [];

  // Find added and modified items
  newArray.forEach(newItem => {
    const oldItem = oldArray.find(item => item.id === newItem.id);
    if (!oldItem) {
      added.push(newItem);
    } else if (!deepEqual(oldItem, newItem)) {
      modified.push(newItem);
    }
  });

  // Find removed items
  oldArray.forEach(oldItem => {
    if (!newArray.find(item => item.id === oldItem.id)) {
      removed.push(oldItem);
    }
  });

  return { added, removed, modified };
};

export const objectToArray = <T extends Record<string, unknown>>(obj: T): Array<Partial<T>> => {
  return Object.keys(obj).map(key => {
    const result: Partial<T> = {};
    result[key as keyof T] = obj[key as keyof T];
    return result;
  });
};

export const getKeysFromArray = <T extends Record<string, unknown>>(arr: T[]): string[] => {
  return Object.keys(arr.reduce((o, c) => Object.assign(o, c)));
};

export const formatExcelToJson = (
  data: unknown[][],
  api: Record<string, unknown>,
  user: Record<string, unknown>
): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    try {
      const result: Record<string, unknown>[] = [];
      const headers = data[0] as string[];

      for (let i = 1; i < data.length; i++) {
        const row = data[i] as unknown[];
        const item: Record<string, unknown> = {};

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
            createdAt: new Date().toISOString()
          });
        }
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const isValidDate = (d: unknown): boolean => {
  if (!(d instanceof Date)) return false;
  return !isNaN(d.getTime());
};

export const isDateTypeField = (val: unknown): boolean => {
  if (typeof val !== 'string') return false;
  const lowerVal = val.toLowerCase();
  return lowerVal.endsWith('date') || val.includes('วันที่') || lowerVal.startsWith('date');
};

export const isTimeTypeField = (val: unknown): boolean => {
  if (typeof val !== 'string') return false;
  const lowerVal = val.toLowerCase();
  return lowerVal.includes('time') || val.includes('เวลา') || lowerVal === 'created';
};

export const getVat = (total: number, priceType: string): number => {
  if (!total || !priceType) return 0;

  const vatRate = 0.07;
  return priceType === 'include' ? total * vatRate : 0;
};

export const getBeforeVat = (total: number, priceType: string): number => {
  if (!total || !priceType) return 0;

  const vatRate = 0.07;
  return priceType === 'include' ? total / (1 + vatRate) : total;
};

export const getWHTax = (
  total: number,
  priceType: string,
  hasWHTax: boolean
): number => {
  if (!total || !priceType || !hasWHTax) return 0;

  const whtRate = 0.03;
  const beforeVat = getBeforeVat(total, priceType);
  return beforeVat * whtRate;
};

export const isRowCompleted = (
  row: Record<string, unknown>,
  columns: Array<{ required?: boolean; accessor: string }>
): boolean => {
  if (!row || !Array.isArray(columns)) return false;

  return columns.every(column => {
    if (!column.required) return true;
    const value = row[column.accessor];
    return value !== undefined && value !== null && value !== '';
  });
};

export const parser = (value: unknown): string | number | unknown => {
  if (!value) {
    return value;
  }
  if (!(typeof value === 'number' || typeof value === 'string')) {
    return value;
  }
  return value.toString().replace(/(\r\n|\n|\r| |-|฿\s?)|(,*)/g, '');
};

export const formatNumber = (value: unknown): string | unknown => {
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

const hasToParse = (fieldName: string): boolean => {
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
    'amtPartType'
  ].includes(fieldName);
};

export const cleanValuesBeforeSave = (
  values: Record<string, unknown>,
  skipDate = false
): Record<string, unknown> => {
  if (!values) return {};

  const result = { ...values };
  Object.keys(result).forEach(key => {
    const value = result[key];

    if (value === null || value === undefined || value === '') {
      delete result[key];
    } else if (Array.isArray(value)) {
      result[key] = cleanArrayOfObject(value as Record<string, unknown>[], skipDate);
    } else if (typeof value === 'object') {
      result[key] = cleanObject(value as Record<string, unknown>, skipDate);
    }
  });

  return result;
};

const cleanArrayOfObject = (
  arr: Record<string, unknown>[],
  skipDate: boolean
): Record<string, unknown>[] => {
  if (!Array.isArray(arr)) return [];

  return arr.map(item => cleanObject(item, skipDate));
};

const cleanObject = (
  obj: Record<string, unknown>,
  skipDate: boolean
): Record<string, unknown> => {
  if (!obj || typeof obj !== 'object') return {};

  const result = { ...obj };
  Object.keys(result).forEach(key => {
    const value = result[key];

    if (value === null || value === undefined || value === '') {
      delete result[key];
    } else if (Array.isArray(value)) {
      result[key] = cleanArrayOfObject(value as Record<string, unknown>[], skipDate);
    } else if (typeof value === 'object') {
      result[key] = cleanObject(value as Record<string, unknown>, skipDate);
    } else if (!skipDate && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      result[key] = new Date(value).toISOString();
    }
  });

  return result;
};

export const formatValuesBeforeLoad = (values: Record<string, unknown>): Record<string, unknown> => {
  if (typeof values !== 'object' || !values) {
    return values;
  }
  const mValues = { ...values };
  Object.keys(values).forEach(k => {
    const dateType = k.length >= 4 && (k.substr(-4) === 'Date' || k === 'date');
    if (dateType && values[k]) {
      mValues[k] = DateTime.fromISO(values[k] as string);
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
  });
  return mValues;
};

export const removeTags = (str: unknown): string => {
  if (!str || str === null || str === '') return '';
  return str.toString().replace(/(<([^>]+)>)/gi, '');
};

export const firstKey = (obj: Record<string, unknown>): string | undefined => {
  return Object.keys(obj)[0];
};

export const hasKey = (key: string, obj: Record<string, unknown>): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const getStartDateFromDuration = (val: string): string => {
  const now = DateTime.now();
  let result = now.startOf('day').toFormat('yyyy-MM-dd');

  switch (val) {
    case 'today':
      result = now.startOf('day').toFormat('yyyy-MM-dd');
      break;
    case 'sevenDays':
      result = now.minus({ days: 7 }).toFormat('yyyy-MM-dd');
      break;
    case 'thisWeek':
      result = now.startOf('week').toFormat('yyyy-MM-dd');
      break;
    case 'thisMonth':
      result = now.startOf('month').toFormat('yyyy-MM-dd');
      break;
    case 'thirtyDays':
      result = now.minus({ days: 30 }).toFormat('yyyy-MM-dd');
      break;
    case 'threeMonth':
      result = now.minus({ months: 3 }).toFormat('yyyy-MM-dd');
      break;
    case 'all':
      result = now.minus({ years: 10 }).toFormat('yyyy-MM-dd'); // 10 years
      break;
    default:
      break;
  }
  return result;
};

export const toCurrency = (val: number): string => numeral(val).format('0,0.00');

export const roundToNearest5 = (x: number): number => Math.round(x / 5) * 5;

export const toPhone = (txt: string | number): string => {
  if (!txt) {
    return '';
  }
  const text = txt.toString();
  return `${text.slice(0, 3)}-${text.slice(3, 6)}-${text.slice(-4)}`;
};

export const getDates = (
  startDate: string,
  stopDate: string,
  format = 'yyyy-MM-dd'
): string[] => {
  const dates: string[] = [];
  let currentDate = DateTime.fromFormat(startDate, format);
  const endDate = DateTime.fromFormat(stopDate, format);

  while (currentDate <= endDate) {
    dates.push(currentDate.toFormat(format));
    currentDate = currentDate.plus({ days: 1 });
  }

  return dates;
};

export const getMonths = (
  startDate: string,
  stopDate: string,
  dateFormat = 'yyyy-MM-dd',
  monthFormat = 'yyyy-MM'
): string[] => {
  const dates = getDates(startDate, stopDate, dateFormat);
  return [...new Set(dates.map(date => DateTime.fromFormat(date, dateFormat).toFormat(monthFormat)))];
};

export const showPrint = (
  ComponentToPrint: React.ComponentType,
  onAfterPrint?: () => void,
  fileName?: string
): void => {
  console.log('showPrint called with', { ComponentToPrint, onAfterPrint, fileName });
};

export const hidePrint = (): void => {
  console.log('hidePrint called');
};

export const getFields = (
  obj: Record<string, unknown>,
  fields: string[],
  prefix = '',
  current = ''
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  fields.forEach(field => {
    const key = prefix ? `${prefix}.${field}` : field;
    if (obj[field] !== undefined) {
      result[key] = obj[field];
    }
  });
  
  return result;
};

export const daysInMonth = (mth: string): number => {
  if (!mth) {
    return 30;
  }
  const month = mth.slice(-2);
  const year = mth.substr(0, 4);
  const days = new Date(Number(year), Number(month), 0).getDate();
  return days;
};

export const arrayToText = (arr: string[]): string => {
  if (!Array.isArray(arr)) return '';
  return arr.join(', ');
};

export const stripHtml = (str: string): string => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

export const getDaysInMonth = (year: number, month: number): number[] => {
  const days: number[] = [];
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    days.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
  
  return days;
};

export const getMonthNames = (): string[] => {
  const monthArray = Array.from({ length: 12 }, (_, i) => ({
    name: DateTime.fromObject({ month: i + 1 }).setLocale('th').toFormat('MMMM')
  }));
  
  return monthArray.map(m => m.name);
};


