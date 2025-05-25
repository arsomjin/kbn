import { uniqueNamesGenerator, Config, names } from 'unique-names-generator';
import { useAntdModal, Modal } from '../hooks/useAntModal';
import { FieldMapping, FieldMappingToThai } from '../data/fields-mapping';
import { DateTime } from 'luxon';
// import ProgressManager from 'api/Progress/Progress';
import numeral from 'numeral';
// import { PrinterManager } from 'api/Printer';
import { __DEV__ } from '../utils';
import { isVerySmallNumber } from './number';
import type { ModalFuncProps } from 'antd/es/modal/interface';
import { message } from 'antd';
import { useAntdUi } from '../hooks/useAntdUi';
// import { useLoading } from 'hooks/useLoading';
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
  osVersion
} from 'react-device-detect';
import { useModal } from '../contexts/ModalContext';
import dayjs from '../utils/dayjs';
type Dayjs = import('dayjs').Dayjs;

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
  showPrinter: (config: {
    ComponentToPrint: React.ComponentType;
    onAfterPrint?: () => void;
    fileName?: string;
  }) => void;
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
export const showLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export const showWarn = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

export const showError = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

/**
 * Create new ID with prefix
 * @param prefix - ID prefix
 * @returns New unique ID
 */
export const createNewId = (prefix: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`;
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
  return DateTime.fromFormat(text, 'yyyy-MM-dd').plus({ years: 543 }).setLocale('th').toFormat('d MMM yy');
};

// Number utilities
export const Numb = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
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
    if (
      (areObjects && !deepEqual(val1 as Record<string, unknown>, val2 as Record<string, unknown>)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
};

// Error handling
/**
 * errorHandler - Universal error handler for both utility and React component usage.
 * @param error - The error object
 * @param showAlertFn - (optional) A context-aware alert function (e.g. from useModal)
 */
export const errorHandler = (error: Error, showAlertFn?: (config: { title: string; content: string }) => void) => {
  let msg = 'กรุณาทำรายการใหม่อีกครั้ง';
  if (error?.message) {
    msg = getErrorMessage(error.message);
  }
  if (showAlertFn) {
    showAlertFn({
      title: 'ไม่สำเร็จ',
      content: msg
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
  return (error: Error) => errorHandler(error, ({ title, content }) => showWarning(`${title}: ${content}`));
};

export const getErrorMessage = (eMsg: string): string => {
  if (!eMsg) return 'กรุณาทำรายการใหม่อีกครั้ง';

  if (eMsg.includes('Query.where')) {
    return 'กรุณาตรวจสอบพารามิเตอร์ที่ใช้ในการค้นหาข้อมูล';
  }

  return 'กรุณาทำรายการใหม่อีกครั้ง';
};

// Action sheet utilities
// DEPRECATED: Use modal.confirm from useAntdUi hook instead
export const showActionSheet = (modal: any, onClick?: () => void, title?: string, info?: string): void => {
  modal.confirm({
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
// DEPRECATED: Use modal.info/warning/error from useAntdUi hook instead
export const showMessageBar2 = (
  modal: any, // Added modal parameter
  title?: string,
  info?: string,
  theme?: string,
  link?: string,
  linkLabel?: string
): void => {
  // const { modal } = useAntdUi(); // Removed hook call
  const modalProps: ModalFuncProps = {
    title,
    content: link ? `${info}\n\n${linkLabel || 'คลิกที่นี่'}: ${link}` : info,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false
  };

  if (theme === 'warning') {
    modal.warning(modalProps);
  } else if (theme === 'error') {
    modal.error(modalProps);
  } else {
    modal.info(modalProps);
  }
};

export const hideMessageBar = (): void => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

export const showMessageBar = (
  modal: any, // Added modal parameter
  title?: string,
  info?: string,
  theme?: string,
  link?: string,
  linkLabel?: string
): void => {
  showMessageBar2(modal, title, info, theme, link, linkLabel);
};

// Alert utilities
// DEPRECATED: Use modal.info/warning/error from useAntdUi hook instead
export const showAlert2 = (modal: any, title?: string, info?: string, theme?: string, onOk?: () => void): void => {
  // Added modal parameter
  // const { modal } = useAntdUi(); // Removed hook call
  const modalProps: ModalFuncProps = {
    title,
    content: info,
    onOk,
    okText: 'ตกลง',
    centered: true,
    maskClosable: false
  };

  if (theme === 'warning') {
    modal.warning(modalProps);
  } else if (theme === 'error') {
    modal.error(modalProps);
  } else {
    modal.info(modalProps);
  }
};

export const hideAlert = (): void => {
  // No need for this function as Ant Design's Modal handles its own lifecycle
};

// Confirm utilities
// DEPRECATED: Use modal.confirm from useAntdUi hook instead
export const showConfirm = (modal: any, onOk: () => void, messageText: string) => {
  // Added modal parameter, renamed message to messageText to avoid conflict
  // const { modal } = useAntdUi(); // Removed hook call
  modal.confirm({
    title: 'ยืนยัน',
    content: messageText, // Used messageText
    onOk
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

export const validateMobileNumber = (mobile: string): boolean => {
  const mobileRegex = /^0[1-9][0-9]{8}$/;
  return mobileRegex.test(mobile);
};

export const getPermCatFromPermissions = (permissions: string[], permCats: Record<string, string[]>): string[] => {
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

export const showConfirmDelete = (
  modal: any,
  deleteAction?: () => void,
  itemName?: string,
  unRecoverable?: boolean
): void => {
  showActionSheet(
    modal,
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
  return arrayOfElements.reduce((p, v) => (p < v ? p : v));
};

export const arrayMax = <T extends number>(arrayOfElements: T[]): T => {
  return arrayOfElements.reduce((p, v) => (p > v ? p : v));
};

export function sortArr<T extends Record<string, unknown>>(arrItems: T[], sortKey: string): T[] {
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

export function sortArrByMultiKeys<T extends Record<string, unknown>>(arrItems: T[], sortKeys: string[]): T[] {
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

export function searchArr<T extends Record<string, unknown>>(arrItems: T[], search: string, keys: string[]): T[] {
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

export function insertArr<T>(arr: T[], index: number, insertItems: T[]): T[] {
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

export const maskCurrency = (value: string | number, maxLength = 12, radix = ','): string => {
  if (!value) return '';
  const str = value.toString().replace(/\D/g, '');
  return str.slice(0, maxLength).replace(/\B(?=(\d{3})+(?!\d))/g, radix);
};

export const cleanNumberFields = (valObj: Record<string, unknown>, fieldArr: string[]): Record<string, unknown> => {
  const result = { ...valObj };

  fieldArr.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = Numb(result[field]);
    }
  });

  return result;
};

export const cleanNumberFieldsInArray = <T extends Record<string, unknown>>(valArr: T[], fieldArr: string[]): T[] => {
  if (!Array.isArray(valArr) || !Array.isArray(fieldArr)) {
    return valArr;
  }

  return valArr.map(item => cleanNumberFields(item, fieldArr) as T);
};

export const getChanges = (
  oldObject: Record<string, unknown> = {},
  newObject: Record<string, unknown> = {}
): Record<string, unknown> => {
  const a = oldObject && typeof oldObject === 'object' ? oldObject : {};
  const b = newObject && typeof newObject === 'object' ? newObject : {};

  const changes: Record<string, unknown> = {};

  Object.keys(b).forEach(key => {
    if (!deepEqual(a[key] as Record<string, unknown>, b[key] as Record<string, unknown>)) {
      changes[key] = b[key];
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

export const isDateTypeField = (field: unknown): boolean => {
  if (typeof field !== 'string') return false;
  return (
    field.toLowerCase().includes('date') || field.toLowerCase().includes('day') || field.toLowerCase().includes('time')
  );
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

export const getWHTax = (total: number, priceType: string, hasWHTax: boolean): number => {
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

export const parser = (value: string): string => {
  return value.replace(/[^\d.-]/g, '');
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

interface FirestoreTimestampLike {
  toDate: () => Date;
}

export const normalizeToDate = (input: unknown): Date | null => {
  if (!input) return null;
  if (typeof input === 'object' && input !== null && typeof (input as FirestoreTimestampLike).toDate === 'function') {
    return (input as FirestoreTimestampLike).toDate();
  }
  if (input instanceof Date) return input;
  if (typeof input === 'number' || typeof input === 'string') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/**
 * Options for cleanValuesBeforeSave function
 */
export interface CleanValuesOptions {
  /** Skip date conversion for date fields */
  skipDate?: boolean;
  /** Remove empty arrays from result */
  removeEmptyArrays?: boolean;
  /** Remove empty objects from result */
  removeEmptyObjects?: boolean;
  /** Convert JS Date objects to Firestore Timestamps */
  convertDatesToTimestamps?: boolean;
  /** Fields to preserve even if they're empty */
  preserveFields?: string[];
}

/**
 * @deprecated Use processFormDataForFirestore from utils/dateHandling.ts for better reliability
 * Cleans and formats data before saving to Firebase
 * - Removes undefined, null, and empty string values
 * - Handles nested objects and arrays recursively
 * - Formats date fields appropriately
 * - Converts JS Date objects to Firestore Timestamps when specified
 *
 * @param values - Object to clean before saving
 * @param options - Options for cleaning behavior
 * @returns Clean object ready for Firebase
 */
export const cleanValuesBeforeSave = (
  values: Record<string, unknown>,
  options?: CleanValuesOptions | boolean
): Record<string, unknown> => {
  // DEPRECATED WARNING - Guide developers to new system
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '🚨 cleanValuesBeforeSave is deprecated! Please migrate to the new date handling system:\n' +
        'import { processFormDataForFirestore } from "utils/dateHandling";\n' +
        'const cleanData = processFormDataForFirestore(formData);'
    );
  }

  // For new implementations, use the improved version from dateHandling.ts
  // import { processFormDataForFirestore } from 'utils/dateHandling';

  const opts: CleanValuesOptions =
    typeof options === 'boolean'
      ? { skipDate: options }
      : {
          skipDate: false,
          removeEmptyArrays: true,
          removeEmptyObjects: true,
          convertDatesToTimestamps: true,
          preserveFields: [],
          ...options
        };
  if (!values || typeof values !== 'object' || Array.isArray(values)) return {};
  const result: Record<string, unknown> = {};
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
        .filter(item => item !== undefined && item !== null)
        .map(item =>
          typeof item === 'object' && item !== null
            ? cleanValuesBeforeSave(item as Record<string, unknown>, opts)
            : item
        );
      if (cleanedArr.length > 0 || !opts.removeEmptyArrays || shouldPreserve) {
        result[key] = cleanedArr;
      }
      return;
    }
    // --- Objects ---
    if (typeof value === 'object' && value !== null) {
      const cleanedObj = cleanValuesBeforeSave(value as Record<string, unknown>, opts);
      if (Object.keys(cleanedObj).length > 0 || !opts.removeEmptyObjects || shouldPreserve) {
        result[key] = cleanedObj;
      }
      return;
    }
    // --- Parser fields ---
    if (hasToParse(key)) {
      result[key] =
        typeof value === 'string'
          ? parser(value as string)
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
export const formatValuesBeforeLoad = (values: Record<string, unknown>): Record<string, unknown> => {
  // DEPRECATED WARNING - Guide developers to new system
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '🚨 formatValuesBeforeLoad is deprecated! Please migrate to the new date handling system:\n' +
        'import { processFirestoreDataForForm } from "utils/dateHandling";\n' +
        'const formData = processFirestoreDataForForm(firestoreData);'
    );
  }

  // For new implementations, use the improved version from dateHandling.ts
  // import { processFirestoreDataForForm } from 'utils/dateHandling';

  if (typeof values !== 'object' || !values) {
    return values;
  }
  const mValues: Record<string, unknown> = { ...values };
  Object.keys(mValues).forEach(k => {
    const v = mValues[k];
    if (isDateField(k) && v) {
      mValues[k] = toDayjs(v);
    } else if (isDateField(k) && !v) {
      mValues[k] = undefined;
    } else if (v === undefined && !isDateField(k)) {
      mValues[k] = null;
    } else if (hasToParse(k)) {
      mValues[k] = typeof v === 'string' ? parser(v as string) : typeof v === 'number' ? parser(String(v)) : parser('');
    } else if (Array.isArray(v)) {
      mValues[k] = v.map(item =>
        typeof item === 'object' && item !== null ? formatValuesBeforeLoad(item as Record<string, unknown>) : item
      );
    } else if (typeof v === 'object' && v !== null) {
      mValues[k] = formatValuesBeforeLoad(v as Record<string, unknown>);
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

export const getDates = (startDate: string, stopDate: string, format = 'yyyy-MM-dd'): string[] => {
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
    name: DateTime.fromObject({ month: i + 1 })
      .setLocale('th')
      .toFormat('MMMM')
  }));

  return monthArray.map(m => m.name);
};

// Modular Firestore error logging
export const addErrorLogs = async (error: Record<string, unknown>) => {
  try {
    const db = getFirestore();
    const errorLog = {
      ...error,
      createdAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : ''
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
export const getChangesDeep = (
  oldObject: Record<string, any> = {},
  newObject: Record<string, any> = {}
): Record<string, any> => {
  const changes: Record<string, any> = {};
  const keys = new Set([...Object.keys(oldObject || {}), ...Object.keys(newObject || {})]);

  keys.forEach(key => {
    const oldVal = oldObject[key];
    const newVal = newObject[key];
    if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
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
export const isDateField = (key: string): boolean => typeof key === 'string' && /date|day|time|at$/i.test(key);

/**
 * @deprecated Use toJSDate from utils/dateHandling.ts for better error handling
 * Converts any Firestore/JS/Dayjs/ISO date value to a JS Date, or null if invalid
 */
export const toJSDate = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
  if (dayjs.isDayjs(val) && typeof val.isValid === 'function') return val.isValid() ? val.toDate() : null;
  // Defensive: Only call isValid if this is a real dayjs object
  // This prevents runtime errors like "val.isValid is not a function"
  if (typeof val === 'object' && val !== null && 'isValid' in val && typeof val.isValid === 'function') {
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
export const toFirestoreTimestamp = (val: any): Timestamp | null => {
  const d = toJSDate(val);
  return d ? Timestamp.fromDate(d) : null;
};

/**
 * @deprecated Use toDayjs from utils/dateHandling.ts for better error handling
 * Converts any Firestore/JS/Dayjs/ISO date value to a dayjs object, or undefined if invalid
 */
export const toDayjs = (val: any): Dayjs | undefined => {
  const d = toJSDate(val);
  return d ? dayjs(d) : undefined;
};
