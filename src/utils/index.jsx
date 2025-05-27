import React from 'react';
import { Tag } from 'antd';
import { isTimeTypeField, arrayForEach, parser, showToBeContinue } from 'utils/functions';
import { sortArr } from 'utils/array';
import { w } from 'api';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { distinctArr } from 'utils/functions';
import { removeAllNonAlphaNumericCharacters } from './RegEx';
import { VehicleNameKeywords } from 'data/Constant';
import getSidebarNavItems from 'data/sidebar-nav-items.jsx';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  query,
  where,
  getDoc,
  orderBy,
  startAt,
  endAt,
  limit as limitFn,
} from 'firebase/firestore';
import { app } from 'services/firebase';
import _ from 'lodash';

// Helper function to get firestore instance
const getDb = () => getFirestore(app);

// Helper functions to replace removed legacy Firebase API functions
const checkCollection = async (collectionPath, wheres) => {
  try {
    const db = getDb();
    const collRef = collection(db, collectionPath);
    let q = query(collRef);

    if (wheres && wheres.length) {
      wheres.forEach(([field, op, value]) => {
        q = query(q, where(field, op, value));
      });
    }

    const snapshot = await getDocs(q);
    return !snapshot.empty ? snapshot : null;
  } catch (error) {
    console.error('Error checking collection:', error);
    return null;
  }
};

const checkDoc = async (collectionPath, docId) => {
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

const getCollection = async (collectionPath, wheres) => {
  const snapshot = await checkCollection(collectionPath, wheres);
  if (!snapshot) return null;

  const result = {};
  snapshot.forEach((doc) => {
    result[doc.id] = { ...doc.data(), _id: doc.id };
  });
  return result;
};

export const tagColors = ['blue', 'gold', 'cyan', 'red', 'green'];

export const __DEV__ = process.env.NODE_ENV !== 'production';

export const tagRender = (props) => {
  const { label, closable, onClose, ...mProps } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={tagColors[Math.floor(Math.random() * 5)]}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
      {...mProps}
    >
      {label}
    </Tag>
  );
};

// Helper function to format time fields in a change object
const formatChangeTimeFields = (change) => {
  let formattedChange = { ...change };
  Object.keys(change).forEach((key) => {
    if (isTimeTypeField(key)) {
      formattedChange[key] = dayjs(formattedChange[key]).format('HH:mm');
    }
  });
  return formattedChange;
};

export const getEditArr = (editData, users) => {
  if (!Array.isArray(editData) || typeof users !== 'object') {
    console.warn('Invalid input: editData should be an array and users should be an object.');
    return [];
  }

  const changeArr = sortArr(editData, '-time');

  return changeArr.map((item) => {
    const changes = [];
    // Support both new (array) and old (object) data structure
    if (Array.isArray(item.changes)) {
      changes.push(...item.changes);
    } else if (typeof item.changes === 'object') {
      Object.keys(item.changes).forEach((key) => {
        changes.push({ [key]: item.changes[key] });
      });
    }

    // Format change details into readable components
    const detail = changes.length ? (
      <div className="d-flex my-2" style={{ flexWrap: 'wrap' }}>
        {changes.map((change, index) => {
          const formattedChange = formatChangeTimeFields(change);

          return (
            <Tag
              key={index}
              className="mx-1"
              style={{
                marginTop: 5,
                maxWidth: w(90),
              }}
            >
              {JSON.stringify(formattedChange).slice(1, -1)}
            </Tag>
          );
        })}
      </div>
    ) : (
      'ไม่มีข้อมูล...'
    );

    return {
      time: item.time,
      title: `${users[item.uid]?.firstName || ''}${users[item.uid]?.nickName ? `(${users[item.uid]?.nickName})` : ''}`,
      detail,
      onClick: () => showToBeContinue(),
    };
  });
};

export const createSelectOptions = ({ arr, orderBy, labels }) =>
  new Promise(async (r, j) => {
    try {
      const option = arr.map((item) => {
        if (labels || Array.isArray(orderBy)) {
          let label = '';
          const items = Array.isArray(labels) ? labels : Array.isArray(orderBy) ? orderBy : [];
          items.forEach((l, i) => {
            label = `${label}${
              item[l] && i > 0 ? (l === 'lastName' ? ' ' : l === 'firstName' ? '' : ' - ') : ''
            }${item[l] || ''}${['saleNo', 'bookNo'].includes(l) ? ' ' : ''}`;
          });
          return {
            label,
            value: item[Array.isArray(orderBy) ? orderBy[0] : orderBy],
          };
        }
        return {
          label: item[orderBy],
          value: item[orderBy],
        };
      });
      r(option);
    } catch (e) {
      j(e);
    }
  });

// Set global search limit and minimum characters
const GLOBAL_SEARCH_LIMIT = 20;
const GLOBAL_MIN_CHARS = 4;

export const fetchFirestoreKeywords = async ({
  searchText,
  searchCollection,
  orderBy,
  wheres,
  firestore,
  startSearchAt,
  labels,
  limit = GLOBAL_SEARCH_LIMIT,
}) => {
  if (!searchText || searchText.length < (startSearchAt || GLOBAL_MIN_CHARS)) {
    return [];
  }
  const segments = searchCollection.split('/');
  const colRef = collection(firestore, ...segments);
  let whereClauses = [];

  console.log('searchText:', searchText);
  console.log('wheres:', wheres);

  // Use keywords array-contains as default
  whereClauses.push(where('keywords', 'array-contains', searchText.toLowerCase()));

  if (wheres && wheres.length) {
    whereClauses = [
      ...whereClauses,
      ...wheres.map(([field, op, value]) => where(field, op, value)),
    ];
  }

  let q;
  if (whereClauses.length > 0) {
    q = query(colRef, ...whereClauses, limitFn(limit));
  } else {
    q = query(colRef, limitFn(limit));
  }

  const snap = await getDocs(q);
  let dataArr = [];
  snap.forEach((doc) => {
    const docData = doc.data();
    if (docData) {
      dataArr.push({ _id: doc.id, ...docData });
    }
  });
  dataArr = distinctArr(dataArr, [Array.isArray(orderBy) ? orderBy[0] : orderBy], []);
  console.log(`[fetchFirestoreKeywords] dataArr: ${JSON.stringify(dataArr)}`);
  console.log(`[fetchFirestoreKeywords] array_length: ${dataArr.length}`);
  console.log(`[fetchFirestoreKeywords] limit: ${limit}`);
  // Add too many results message if needed
  if (dataArr.length === limit) {
    dataArr.push({ label: 'Too many results, please type more', value: '', disabled: true });
  }
  return dataArr;
};

export const partialText = (str) => {
  const parts = str.split(' ');
  if (parts.length > 1) {
    parts.shift();
    return parts.join(' ').toLowerCase();
  } else {
    return str.toLowerCase();
  }
};

export const fetchSearchsEachField = async (
  searchText,
  orderByField,
  searchCollection,
  firestore,
  fields,
) => {
  const limitValue = GLOBAL_SEARCH_LIMIT;
  try {
    console.log('fetchSearchsEachField input:', {
      searchText,
      orderByField,
      searchCollection,
      fields,
    });
    const segments = searchCollection.split('/');
    const colRef = collection(firestore, ...segments);
    const sTxt = searchText.toLowerCase();
    console.log('Search text (lowercase):', sTxt);

    const q = query(
      colRef,
      orderBy(`${orderByField}_lower`),
      startAt(sTxt),
      endAt(sTxt + '\uf8ff'),
      limitFn(limitValue),
    );

    const snap = await getDocs(q);
    console.log('Query snapshot size:', snap.size);

    const lowerArr = [];
    snap.forEach((doc) => {
      let item = { _id: doc.id };
      fields.forEach((l) => {
        item = { ...item, [l]: doc.data()[l] };
      });
      lowerArr.push(item);
    });
    console.log('Found items:', lowerArr);
    if (lowerArr.length === limitValue) {
      lowerArr.push({ label: 'Too many results, please type more', value: '', disabled: true });
    }
    return lowerArr;
  } catch (e) {
    console.error('Error in fetchSearchsEachField:', e);
    return [];
  }
};

export const fetchSearchsKeywords = async (
  searchText,
  searchCollection,
  firestore,
  fields,
  limitValue = GLOBAL_SEARCH_LIMIT,
) => {
  if (!searchText || !searchCollection || searchText.length < GLOBAL_MIN_CHARS) {
    console.log('fetchSearchsKeywords: Invalid input', { searchText, searchCollection });
    return [];
  }
  try {
    console.log('fetchSearchsKeywords input:', {
      searchText,
      searchCollection,
      fields,
      limitValue,
    });
    const segments = searchCollection.split('/');
    const colRef = collection(firestore, ...segments);
    let sTxt = '';

    if (Array.isArray(searchText)) {
      sTxt = searchText.length > 0 ? searchText[searchText.length - 1].toLowerCase() : '';
    } else {
      sTxt = searchText.toLowerCase();
    }
    console.log('Search text (lowercase):', sTxt);

    const q = query(
      colRef,
      where('keywords', 'array-contains', sTxt.toLowerCase()),
      limitFn(limitValue),
    );

    const snapshot = await getDocs(q);
    console.log('Query snapshot size:', snapshot.size);

    const arr = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        let item = { _id: doc.id };
        fields.forEach((l) => {
          item = { ...item, [l]: doc.data()[l] };
        });
        arr.push(item);
      });
    }
    console.log('Found items:', arr);
    if (arr.length === limitValue) {
      arr.push({ label: 'Too many results, please type more', value: '', disabled: true });
    }
    return arr;
  } catch (e) {
    console.error('Error in fetchSearchsKeywords:', e);
    return [];
  }
};

export const addSearchFields = (values, fields) => {
  if (!values || !(fields && Array.isArray(fields))) {
    return values;
  }
  const mValues = { ...values };
  fields.map((field) => {
    if (values[field]) {
      mValues[`${field}_lower`] = values[field].toLowerCase();
      mValues[`${field}_partial`] = partialText(values[field]);
    }
    return field;
  });
  return mValues;
};

export const createKeywords = (name) => {
  const arrName = [];
  let curName = '';
  name.split('').forEach((letter) => {
    curName += letter;
    arrName.push(curName);
  });
  return arrName;
};

export const removeTabsNewLines = (txt) => {
  if (!txt || !['number', 'string'].includes(typeof txt)) {
    return txt;
  }
  const str = txt.toString();
  return str.replace(/\s\s+/g, ' ');
};

export const removeDoubleSpaces = (txt) => {
  if (!txt || !['number', 'string'].includes(typeof txt)) {
    return txt;
  }
  const str = txt.toString();
  return str.replace(/  +/g, ' ');
};

export const insertStringsAtIndex = (str, insertStr, idx) => {
  if (!str && isNaN(idx) && !insertStr) {
    return str;
  }
  return `${str.toString().substring(0, idx)}${insertStr}${str.toString().substring(idx)}`;
};

export const formatBankAccNo = (str) => {
  if (!str) {
    return str;
  }
  let result = parser(str);
  result = insertStringsAtIndex(result, '-', 3);
  result = insertStringsAtIndex(result, '-', 5);
  result = insertStringsAtIndex(result, '-', 11);
  return result;
};

export const createNewItemId = (suffix = 'KBN-ACC-INC') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${suffix}-ITEM${dayjs().format('YYYYMMDD')}${padLastNo}`;
};

export const isVehicleNoDuplicate = (vArr, branch, productCode) =>
  new Promise(async (r, j) => {
    try {
      let result = false;
      await arrayForEach(vArr, async (vNo) => {
        let wheres = [['vehicleNo_lower', '==', vNo.toLowerCase()]];
        if (branch) {
          wheres = wheres.concat([['branchCode', '==', branch]]);
        }
        if (productCode) {
          wheres = wheres.concat([
            ['productPCode', '==', removeAllNonAlphaNumericCharacters(productCode)],
          ]);
        }
        const doc = await checkCollection('sections/stocks/vehicles', wheres);
        if (doc) {
          result = true;
        }
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const isPeripheralNoDuplicate = (pArr, branch, peripheralNoFull) =>
  new Promise(async (r, j) => {
    try {
      let result = false;
      await arrayForEach(pArr, async (pNo) => {
        let wheres = [['peripheralNo_lower', '==', pNo.toLowerCase()]];
        if (branch) {
          wheres = wheres.concat([['branchCode', '==', branch]]);
        }
        if (peripheralNoFull) {
          wheres = wheres.concat([['peripheralNoFull', '==', peripheralNoFull]]);
        }
        const doc = await checkCollection('sections/stocks/peripherals', wheres);
        if (doc) {
          result = true;
        }
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const checkDuplicateInventoryItem = (arr, branchName) =>
  new Promise(async (r, j) => {
    try {
      const duplicatedVehicles = [];
      const duplicatedPeripherals = [];
      await arrayForEach(arr, async (it) => {
        if (
          it?.vehicleNo &&
          Array.isArray(it.vehicleNo) &&
          it.vehicleNo.length > 0 &&
          !!it[branchName || 'branchCode']
        ) {
          const isDuplicate = await isVehicleNoDuplicate(
            it.vehicleNo,
            it[branchName || 'branchCode'],
            it.productCode,
          );
          if (isDuplicate) {
            duplicatedVehicles.push(...it.vehicleNo);
          }
        }
        if (
          it?.peripheralNo &&
          Array.isArray(it.peripheralNo) &&
          it.peripheralNo.length > 0 &&
          !!it[branchName || 'branchCode']
        ) {
          const isPDuplicate = await isPeripheralNoDuplicate(
            it.peripheralNo,
            it[branchName || 'branchCode'],
          );
          if (isPDuplicate) {
            duplicatedPeripherals.push(...it.peripheralNo);
          }
        }
      });
      if (duplicatedVehicles.length > 0 || duplicatedPeripherals.length > 0) {
        r({ duplicatedVehicles, duplicatedPeripherals });
      } else {
        r(false);
      }
    } catch (e) {
      j(e);
    }
  });

export const convertToArray = (elem) => {
  const result = elem ? (Array.isArray(elem) ? elem : elem.split(',')) : [];
  return result.length === 1 && result[0] === '' ? [] : result;
};

export const checkIsVehicleFromName = (name) => {
  return VehicleNameKeywords.some((kw) => name.indexOf(kw) > -1 && name.indexOf(kw) < 4);
};

export const isAlphaNumeric = (inputtxt) => {
  if (!inputtxt || !['number', 'string'].includes(typeof inputtxt)) {
    return false;
  }
  const letterNumber = /^[0-9a-zA-Z]+$/;
  return !!inputtxt.toString().match(letterNumber);
};

export const cleanIdentityNumber = (str) => {
  // Remove non-alphanumeric from before and after.
  if (!str || !['number', 'string'].includes(typeof str)) {
    return str;
  }
  let result = str.trim();
  let before = result.substring(0, 1);
  let middle = result.substring(1, result.length - 1);
  let after = result.substring(result.length - 1, result.length);
  while (!(isAlphaNumeric(before) && isAlphaNumeric(after))) {
    before = result.substring(0, 1);
    middle = result.substring(1, result.length - 1);
    after = result.substring(result.length - 1, result.length);
    result = `${before.replace(/[^a-z0-9]/gi, '')}${middle}${after.replace(/[^a-z0-9]/gi, '')}`;
  }
  return result;
};

export const cleanIdentityArray = (arr) => {
  // Remove non-alphanumeric from element in array.
  if (!arr || !Array.isArray(arr)) {
    return [];
  }
  const cleaned = arr.map((l) => cleanIdentityNumber(l));
  return cleaned;
};

export const getNavBarSearchData = () => {
  const navItems = getSidebarNavItems();
  const items = [];
  navItems.map((it) => {
    if (it.to) {
      items.push({ title: it.title, to: it.to });
    } else if (it.items) {
      it.items.map((it2) => {
        if (it2.to) {
          items.push({ title: `${it2.title}`, to: it2.to });
        } else if (it2.items) {
          it2.items.map((it3) => {
            if (it3.to) {
              items.push({
                title: `${it2.title} - ${it3.title}`,
                to: it3.to,
              });
            } else if (it3.items) {
              it3.items.map((it4) => {
                if (it4.to) {
                  items.push({
                    title: `${it2.title} - ${it3.title} - ${it4.title}`,
                    to: it4.to,
                  });
                  return it4;
                }
                return it3;
              });
            }
            return it3;
          });
        }
        return it2;
      });
    }
    return it;
  });
  return items.map((it, id) => ({ ...it, id, key: id }));
};

export const getEmployeeStatus = async (record) =>
  new Promise(async (r, j) => {
    try {
      let status = undefined;
      let wheres = [['firstName', '==', record.firstName]];
      if (record?.lastName) {
        wheres = wheres.concat([['lastName', '==', record.lastName]]);
      }
      const userData = await getCollection('data/company/employees', wheres);
      if (userData) {
        const arr = Object.keys(userData || {}).map((k) => userData[k]);
        status = arr[0]?.status || 'ปกติ';
      }
      r(status);
    } catch (e) {
      j(e);
    }
  });

export async function queryFirestoreArrayContainAny(field, ids, path, wheresArr = []) {
  if (!ids || !ids.length || !path) return [];

  const batches = [];

  while (ids.length) {
    const batch = ids.splice(0, 10);
    const wheres = [[field, 'array-contains-any', batch], ...wheresArr];

    const snap = await checkCollection(path, wheres);
    if (snap) {
      snap.forEach((doc) => {
        batches.push({
          ...doc.data(),
          _id: doc.id,
        });
      });
    }
  }

  return Promise.all(batches).then((content) => content.flat());
}

/**
 * Generate a new ID with optional prefix
 * @param prefix Optional prefix for the ID
 * @returns A unique string ID
 */
export const createNewId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

export const createOptionsFromFirestoreKeywords = ({
  searchText,
  searchCollection,
  orderBy,
  wheres,
  firestore,
  startSearchAt = GLOBAL_MIN_CHARS,
  labels,
  isUsed,
}) =>
  new Promise(async (r, j) => {
    try {
      // Only fetch up to GLOBAL_SEARCH_LIMIT results ONCE
      let dataArr = await fetchFirestoreKeywords({
        searchText,
        searchCollection,
        orderBy,
        wheres,
        firestore,
        startSearchAt,
        labels,
        limit: GLOBAL_SEARCH_LIMIT,
      });
      if (dataArr.length === 0 && !!dataArr[0]?.productCode) {
        let ArrIsUsed = dataArr.filter((l) => l.productCode.startsWith('2-'));
        let ArrIsNew = dataArr.filter((l) => !l.productCode.startsWith('2-'));
        let limit = 50;
        while (ArrIsUsed.length > 0 && ArrIsNew.length === 0 && !isUsed) {
          limit += 50;
          dataArr = await fetchFirestoreKeywords({
            searchText,
            searchCollection,
            orderBy,
            wheres,
            firestore,
            startSearchAt,
            labels,
            limit,
          });
          ArrIsUsed = dataArr.filter((l) => l.productCode.startsWith('2-'));
          ArrIsNew = dataArr.filter((l) => !l.productCode.startsWith('2-'));
        }
        dataArr = [...ArrIsNew, ...ArrIsUsed];
      }
      const option = await createSelectOptions({ arr: dataArr, orderBy, labels });
      r(option);
    } catch (e) {
      j(e);
    }
  });

export const createOptionsFromFirestore = ({
  searchText,
  searchCollection,
  orderBy,
  wheres,
  firestore,
  labels,
}) =>
  new Promise(async (r, j) => {
    try {
      let searchRef = firestore;
      searchCollection.split('/').forEach((txt, n) => {
        if (n % 2 === 0) {
          searchRef = searchRef.collection(txt);
        } else {
          searchRef = searchRef.doc(txt);
        }
      });

      if (wheres) {
        wheres.forEach((wh) => {
          searchRef = searchRef.where(wh[0], wh[1], wh[2]);
        });
      }

      let dataArr = [];
      let fields = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (labels) {
        fields = fields.concat(labels);
        fields = uniq(fields);
      }

      if (Array.isArray(orderBy)) {
        await arrayForEach(orderBy, async (field) => {
          const arr = await fetchSearchsEachField(
            searchText,
            field,
            searchCollection,
            firestore,
            fields,
          );
          dataArr = dataArr.concat(arr);
        });
        dataArr = distinctArr(dataArr, [orderBy[0]], []);
        // Limit the total number of results after concatenation
        if (dataArr.length > GLOBAL_SEARCH_LIMIT) {
          dataArr = dataArr.slice(0, GLOBAL_SEARCH_LIMIT);
          dataArr.push({ label: 'Too many results, please type more', value: '', disabled: true });
        }
      } else {
        dataArr = await fetchSearchsEachField(
          searchText,
          orderBy,
          searchCollection,
          firestore,
          fields,
        );
      }

      const option = dataArr.map((item) => {
        if (labels || Array.isArray(orderBy)) {
          let label = '';
          const items = Array.isArray(labels) ? labels : Array.isArray(orderBy) ? orderBy : [];
          items.forEach((l, i) => {
            label = `${label}${
              item[l] && i > 0 ? (l === 'lastName' ? ' ' : l === 'firstName' ? '' : ' - ') : ''
            }${item[l] || ''}${['saleNo', 'bookNo', 'serviceNo'].includes(l) ? ' ' : ''}`;
          });
          return {
            label,
            value: item[Array.isArray(orderBy) ? orderBy[0] : orderBy],
          };
        }
        return {
          label: item[orderBy],
          value: item[orderBy],
        };
      });
      r(option);
    } catch (e) {
      j(e);
    }
  });

export const isDev = (user) => {
  if (!user) {
    return false;
  }
  if (user?.role === 'developer') {
    return true;
  }
  const devEmails = [
    'arsomjin@gmail.com',
    'arsom.racing@gmail.com',
    'arsom.happy@gmail.com',
    'phichayanansuksungnorn@gmail.com',
    'phichayanan_ytt@hotmail.com',
  ];
  if (devEmails.includes(user?.email)) {
    return true;
  }
  return false;
};
