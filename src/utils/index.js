import React from 'react';
import { Tag } from 'antd';
import { sortArr } from 'functions';
import { showToBeContinue } from 'functions';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { Chip } from '@material-ui/core';
import { isTimeTypeField } from 'functions';
import moment from 'moment';
import { uniq } from 'lodash-es';
import { distinctArr } from 'functions';
import { arrayForEach } from 'functions';
import { checkDoc } from 'firebase/api';
import { parser } from 'functions';
import { checkCollection, getCollection } from 'firebase/api';
import { removeAllNonAlphaNumericCharacters } from './RegEx';
import { VehicleNameKeywords } from 'data/Constant';
import getSidebarNavItems from 'data/sidebar-nav-items';

const _ = require('lodash');

export const tagColors = ['blue', 'gold', 'cyan', 'red', 'green'];

export const __DEV__ = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

export const tagRender = props => {
  const { label, closable, onClose, ...mProps } = props;
  const onPreventMouseDown = event => {
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

export const getEditArr_bak = (editData, users) =>
  new Promise(async (r, j) => {
    try {
      let changeArr = sortArr(editData, '-time');
      // showLog('sorted_data', editData);
      let result = await arrayForEach(changeArr, async item => {
        const detail = item.changes ? (
          <div className="d-flex my-2" style={{ flexWrap: 'wrap' }}>
            {item.changes.map((ch, k) => {
              // showLog({ ch });
              let dCh = { ...ch };
              Object.keys(ch).forEach(k => {
                // showLog({ k });
                if (isTimeTypeField(k)) {
                  // showLog('timeField', k);
                  dCh[k] = moment(dCh[k]).format('HH:mm');
                }
              });
              return (
                <Chip
                  key={k}
                  label={JSON.stringify(dCh).slice(1, JSON.stringify(dCh).length - 1)}
                  // color="primary"
                  variant="outlined"
                  size="small"
                  className="mx-1"
                  style={{
                    marginTop: 5,
                    maxWidth: isMobile ? 320 : w(60)
                  }}
                />
              );
            })}
          </div>
        ) : (
          'ไม่มีข้อมูล...'
        );
        let userDoc = await checkDoc('users', item.uid);
        let user = userDoc ? userDoc.data() : {};

        return {
          time: item.time,
          title: userDoc ? `${user.firstName}${user.nickName ? `(${user.nickName})` : ''}` : '',
          detail,
          onClick: () => showToBeContinue()
        };
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });

// Helper function to format time fields in a change object
const formatChangeTimeFields = change => {
  let formattedChange = { ...change };
  Object.keys(change).forEach(key => {
    if (isTimeTypeField(key)) {
      formattedChange[key] = moment(formattedChange[key]).format('HH:mm');
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

  return changeArr.map(item => {
    let changes = [];
    // Support both new (array) and old (object) data structure
    if (Array.isArray(item.changes)) {
      changes = item.changes;
    } else if (typeof item.changes === 'object') {
      changes = Object.keys(item.changes).map(key => ({
        [key]: item.changes[key]
      }));
    }

    // Format change details into readable components
    const detail = changes.length ? (
      <div className="d-flex my-2" style={{ flexWrap: 'wrap' }}>
        {changes.map((change, index) => {
          const formattedChange = formatChangeTimeFields(change);

          return (
            <Chip
              key={index}
              label={JSON.stringify(formattedChange).slice(1, -1)}
              variant="outlined"
              size="small"
              className="mx-1"
              style={{
                marginTop: 5,
                maxWidth: isMobile ? 320 : w(60)
              }}
            />
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
      onClick: () => showToBeContinue()
    };
  });
};

export const createOptionsFromFirestore = ({ searchText, searchCollection, orderBy, wheres, firestore, labels }) =>
  new Promise(async (r, j) => {
    try {
      // console.log({ searchText, searchCollection, orderBy, wheres, labels });
      
      // Check if there's a deleted field filter in wheres
      const { hasDeletedFilter, cleanWheres } = processDeletedFilter(wheres);
      
      let dataArr = [];
      let fields = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (labels) {
        fields = fields.concat(labels);
        fields = uniq(fields);
      }

      if (hasDeletedFilter) {
        // Use the helper function for non-deleted documents
        const documents = await queryNonDeletedDocuments(searchCollection, cleanWheres);
        
        if (Array.isArray(orderBy)) {
          // search multiple fields.
          await arrayForEach(orderBy, async field => {
            const arr = documents.filter(doc => {
              const fieldValue = doc[field];
              return fieldValue && fieldValue.toString().toLowerCase().includes(searchText.toLowerCase());
            }).map(doc => ({ ...doc, _key: doc._id }));
            dataArr = dataArr.concat(arr);
          });
          dataArr = distinctArr(dataArr, [orderBy[0]]);
        } else {
          // search 1 field.
          dataArr = documents.filter(doc => {
            const fieldValue = doc[orderBy];
            return fieldValue && fieldValue.toString().toLowerCase().includes(searchText.toLowerCase());
          }).map(doc => ({ ...doc, _key: doc._id }));
        }
      } else {
        // Use original firestore query method
        let searchRef = firestore;
        searchCollection.split('/').map((txt, n) => {
          if (n % 2 === 0) {
            searchRef = searchRef.collection(txt);
          } else {
            searchRef = searchRef.doc(txt);
          }
          return txt;
        });
        if (wheres) {
          wheres.map(wh => {
            // console.log({ wh });
            searchRef = searchRef.where(wh[0], wh[1], wh[2]);
            return wh;
          });
        }

        if (Array.isArray(orderBy)) {
          // search multiple fields.
          await arrayForEach(orderBy, async field => {
            const arr = await fetchSearchsEachField(searchText, field, searchRef, fields);
            dataArr = dataArr.concat(arr);
          });
          dataArr = distinctArr(dataArr, [orderBy[0]]);
        } else {
          // search 1 field.
          dataArr = await fetchSearchsEachField(searchText, orderBy, searchRef, fields);
        }
      }

      const option = dataArr.map(item => {
        if (labels || Array.isArray(orderBy)) {
          let label = '';
          (labels || orderBy).map((l, i) => {
            label = `${label}${
              item[l] && i > 0 ? (l === 'lastName' ? ' ' : l === 'firstName' ? '' : ' - ') : ''
            }${item[l] || ''}${['saleNo', 'bookNo', 'serviceNo'].includes(l) ? ' ' : ''}`;
            // showLog({ label, item: item[l] });
            return l;
          });
          return {
            label,
            value: item[Array.isArray(orderBy) ? orderBy[0] : orderBy]
          };
        }
        return {
          label: item[orderBy],
          value: item[orderBy]
        };
      });
      r(option);
    } catch (e) {
      j(e);
    }
  });

export const createSelectOptions = (arr, orderBy, labels) =>
  new Promise(async (r, j) => {
    try {
      // console.log({ searchText, searchCollection, orderBy, wheres });
      const option = arr.map(item => {
        if (labels || Array.isArray(orderBy)) {
          let label = '';
          (labels || orderBy).map((l, i) => {
            label = `${label}${
              item[l] && i > 0 ? (l === 'lastName' ? ' ' : l === 'firstName' ? '' : ' - ') : ''
            }${item[l] || ''}${['saleNo', 'bookNo'].includes(l) ? ' ' : ''}`;
            // showLog({ label, item: item[l] });
            return l;
          });
          return {
            label,
            value: item[Array.isArray(orderBy) ? orderBy[0] : orderBy]
          };
        }
        return {
          label: item[orderBy],
          value: item[orderBy]
        };
      });
      r(option);
    } catch (e) {
      j(e);
    }
  });

export const fetchFirestoreKeywords = ({
  searchText,
  searchCollection,
  orderBy,
  wheres,
  firestore,
  startSearchAt,
  labels,
  limit = 30
}) =>
  new Promise(async (r, j) => {
    try {
      // console.log({ searchText, searchCollection, orderBy, wheres });
      if (!searchText || searchText?.length < (startSearchAt || 3)) {
        // Search after 3 characters
        // showLog('LESS_THAN', startSearchAt);
        return;
      }
      
      // Check if there's a deleted field filter in wheres
      const { hasDeletedFilter, cleanWheres } = processDeletedFilter(wheres);
      
      let dataArr = [];
      let fields = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (labels) {
        fields = fields.concat(labels);
        fields = uniq(fields);
      }

      if (hasDeletedFilter) {
        // Use the helper function for non-deleted documents
        const documents = await queryNonDeletedDocuments(searchCollection, cleanWheres);
        
        // Filter documents that match the keywords search
        dataArr = documents.filter(doc => {
          const keywords = doc.keywords || [];
          return keywords.some(keyword => 
            keyword.toLowerCase().includes(searchText.toLowerCase())
          );
        }).slice(0, limit);
        
      } else {
        // Use original firestore query method
        let searchRef = firestore;
        searchCollection.split('/').map((txt, n) => {
          if (n % 2 === 0) {
            searchRef = searchRef.collection(txt);
          } else {
            searchRef = searchRef.doc(txt);
          }
          return txt;
        });
        if (wheres) {
          wheres.map(wh => {
            // console.log({ wh });
            searchRef = searchRef.where(wh[0], wh[1], wh[2]);
            return wh;
          });
        }

        // search from keywords field.
        dataArr = await fetchSearchsKeywords(searchText, searchRef, fields, limit);
      }
      
      dataArr = distinctArr(dataArr, [orderBy[0]]);
      //  showLog({ dataArr });
      r(dataArr);
    } catch (e) {
      j(e);
    }
  });

export const createOptionsFromFirestoreKeywords = ({
  searchText,
  searchCollection,
  orderBy,
  wheres,
  firestore,
  startSearchAt,
  labels,
  isUsed
}) =>
  new Promise(async (r, j) => {
    try {
      let dataArr = await fetchFirestoreKeywords({
        searchText,
        searchCollection,
        orderBy,
        wheres,
        firestore,
        startSearchAt,
        labels
      });
      if (dataArr.length === 0 && !!dataArr[0]?.productCode) {
        let ArrIsUsed = dataArr.filter(l => l.productCode.startsWith('2-'));
        let ArrIsNew = dataArr.filter(l => !l.productCode.startsWith('2-'));
        let limit = 50;
        while (ArrIsUsed.length > 0 && ArrIsNew.length === 0 && !isUsed) {
          // Fetch until we have new product code.
          limit += 50;
          dataArr = await fetchFirestoreKeywords({
            searchText,
            searchCollection,
            orderBy,
            wheres,
            firestore,
            startSearchAt,
            labels,
            limit
          });
          ArrIsUsed = dataArr.filter(l => l.productCode.startsWith('2-'));
          ArrIsNew = dataArr.filter(l => !l.productCode.startsWith('2-'));
        }
        dataArr = [...ArrIsNew, ...ArrIsUsed];
      }
      const option = await createSelectOptions(dataArr, orderBy, labels);
      r(option);
    } catch (e) {
      j(e);
    }
  });

export const partialText = str => {
  const parts = str.split(' ');
  if (parts.length > 1) {
    parts.shift();
    return parts.join(' ').toLowerCase();
  } else {
    return str.toLowerCase();
  }
};

export const fetchSearchsEachField = (searchText, orderBy, searchRef, fields) =>
  new Promise(async (r, j) => {
    let limit = 30;
    try {
      let lowerArr = [];
      let partialArr = [];
      let sTxt = searchText.toLowerCase();
      const lowerSnap = await searchRef
        .orderBy(`${orderBy}_lower`)
        .startAt(sTxt)
        .endAt(sTxt + '\uf8ff')
        .limit(limit)
        .get();
      // Partial word.
      // const partialSnap = await searchRef
      //   .orderBy(`${orderBy}_partial`)
      //   .startAt(sTxt)
      //   .endAt(sTxt + '\uf8ff')
      //   .get();
      // Search in array
      // const arraySnap = await searchRef.where(orderBy, 'array-contains', term).get()
      if (!lowerSnap.empty) {
        lowerSnap.forEach(doc => {
          let item = { _id: doc.id };
          fields.map(l => {
            item = { ...item, [l]: doc.data()[l] };
            // showLog({ item });
            return l;
          });
          lowerArr.push(item);
        });
      }
      // if (partialSnap) {
      //   partialSnap.forEach((doc) => {
      //     let item = { _id: doc.id };
      //     fields.map((l) => {
      //       item = { ...item, [l]: doc.data()[l] };
      //     //  showLog({ item });
      //       return l;
      //     });
      //     partialArr.push(item);
      //   });
      // }
      // showLog({ lowerArr, partialArr });
      r(lowerArr);
    } catch (e) {
      j(e);
    }
  });

export const fetchSearchsKeywords = (searchText, searchRef, fields, limit) =>
  new Promise(async (r, j) => {
    if (!(!!searchText && !!searchRef)) {
      return [];
    }
    try {
      let arr = [];
      let sTxt = '';
      if (Array.isArray(searchText)) {
        sTxt = searchText.length > 0 ? searchText[searchText.length - 1].toLowerCase() : '';
      } else {
        sTxt = searchText.toLowerCase();
      }
      const snapshot = await searchRef
        .where('keywords', 'array-contains', sTxt.toLowerCase())
        // .orderBy('name.last')
        // .startAfter(lastNameOfLastPerson)
        .limit(limit)
        .get();
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            let item = { _id: doc.id };
            fields.map(l => {
              item = { ...item, [l]: doc.data()[l] };
              // showLog({ item });
              return l;
            });
            arr.push(item);
          });
        }
        // showLog({ arr });
        console.log("[fetchSearchsKeywords]",{ searchRef, sTxt: sTxt.toLowerCase(), arr });
      r(arr);
    } catch (e) {
      j(e);
    }
  });

export const addSearchFields = (values, fields) => {
  if (!values || !(fields && Array.isArray(fields))) {
    return values;
  }
  let mValues = { ...values };
  fields.map(field => {
    if (values[field]) {
      mValues[`${field}_lower`] = values[field].toLowerCase();
      mValues[`${field}_partial`] = partialText(values[field]);
    }
    return field;
  });
  return mValues;
};

export const createKeywords = name => {
  const arrName = [];
  let curName = '';
  name.split('').forEach(letter => {
    curName += letter;
    arrName.push(curName);
  });
  return arrName;
};

export const removeTabsNewLines = txt => {
  if (!txt || !['number', 'string'].includes(typeof txt)) {
    return txt;
  }
  let str = txt.toString();
  return str.replace(/\s\s+/g, ' ');
};

export const removeDoubleSpaces = txt => {
  if (!txt || !['number', 'string'].includes(typeof txt)) {
    return txt;
  }
  let str = txt.toString();
  return str.replace(/  +/g, ' ');
};

export const insertStringsAtIndex = (str, insertStr, idx) => {
  if (!str && isNaN(idx) && !insertStr) {
    return str;
  }
  return `${str.toString().substring(0, idx)}${insertStr}${str.toString().substring(idx)}`;
};

export const formatBankAccNo = str => {
  if (!str) {
    return str;
  }
  let result = parser(str);
  result = insertStringsAtIndex(result, '-', 3);
  result = insertStringsAtIndex(result, '-', 5);
  result = insertStringsAtIndex(result, '-', 11);
  return result;
};

export const createNewId = (suffix = 'KBN-ACC-INC') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  const orderId = `${suffix}${moment().format('YYYYMMDD')}${padLastNo}`;
  return orderId;
};

export const createNewItemId = (suffix = 'KBN-ACC-INC') => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000));
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${suffix}-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;
};

export const isVehicleNoDuplicate = (vArr, branch, productCode) =>
  new Promise(async (r, j) => {
    try {
      let result = false;
      await arrayForEach(vArr, async vNo => {
        let wheres = [['vehicleNo_lower', '==', vNo.toLowerCase()]];
        if (!!branch) {
          wheres = wheres.concat([['branchCode', '==', branch]]);
        }
        if (!!productCode) {
          wheres = wheres.concat([['productPCode', '==', removeAllNonAlphaNumericCharacters(productCode)]]);
        }
        let doc = await checkCollection('sections/stocks/vehicles', wheres);
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
      await arrayForEach(pArr, async pNo => {
        let wheres = [['peripheralNo_lower', '==', pNo.toLowerCase()]];
        if (!!branch) {
          wheres = wheres.concat([['branchCode', '==', branch]]);
        }
        if (!!peripheralNoFull) {
          wheres = wheres.concat([['peripheralNoFull', '==', peripheralNoFull]]);
        }
        let doc = await checkCollection('sections/stocks/peripherals', wheres);
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
      let duplicatedVehicles = [];
      let duplicatedPeripherals = [];
      await arrayForEach(arr, async it => {
        if (
          it?.vehicleNo &&
          Array.isArray(it.vehicleNo) &&
          it.vehicleNo.length > 0 &&
          !!it[branchName || 'branchCode']
        ) {
          let isDuplicate = await isVehicleNoDuplicate(it.vehicleNo, it[branchName || 'branchCode'], it.productCode);
          if (isDuplicate) {
            duplicatedVehicles = duplicatedVehicles.concat(it.vehicleNo);
          }
        }
        if (
          it?.peripheralNo &&
          Array.isArray(it.peripheralNo) &&
          it.peripheralNo.length > 0 &&
          !!it[branchName || 'branchCode']
        ) {
          let isPDuplicate = await isPeripheralNoDuplicate(it.peripheralNo, it[branchName || 'branchCode']);
          if (isPDuplicate) {
            duplicatedPeripherals = duplicatedPeripherals.concat(it.peripheralNo);
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

export const convertToArray = elem => {
  let result = !!elem ? (Array.isArray(elem) ? elem : elem.split(',')) : [];
  return result === [''] ? [] : result;
};

export const checkIsVehicleFromName = name => {
  return VehicleNameKeywords.some(kw => name.indexOf(kw) > -1 && name.indexOf(kw) < 4);
};

export const isAlphaNumeric = inputtxt => {
  if (!inputtxt || !['number', 'string'].includes(typeof inputtxt)) {
    return false;
  }
  var letterNumber = /^[0-9a-zA-Z]+$/;
  return inputtxt.toString().match(letterNumber);
};

export const cleanIdentityNumber = str => {
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

export const cleanIdentityArray = arr => {
  // Remove non-alphanumeric from element in array.
  if (!arr || !Array.isArray(arr)) {
    return [];
  }
  const cleaned = arr.map(l => cleanIdentityNumber(l));
  return cleaned;
};

export const getNavBarSearchData = () => {
  let navItems = getSidebarNavItems();
  let items = [];
  navItems.map(it => {
    if (it.to) {
      items.push({ title: it.title, to: it.to });
    } else if (!!it.items) {
      it.items.map(it2 => {
        if (it2.to) {
          items.push({ title: `${it2.title}`, to: it2.to });
        } else if (!!it2.items) {
          it2.items.map(it3 => {
            if (it3.to) {
              items.push({
                title: `${it2.title} - ${it3.title}`,
                to: it3.to
              });
            } else if (!!it3.items) {
              it3.items.map(it4 => {
                if (it4.to) {
                  items.push({
                    title: `${it2.title} - ${it3.title} - ${it4.title}`,
                    to: it4.to
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

export const getEmployeeStatus = async record =>
  new Promise(async (r, j) => {
    try {
      let status = undefined;
      let wheres = [['firstName', '==', record.firstName]];
      if (!!record?.lastName) {
        wheres = wheres.concat([['lastName', '==', record.lastName]]);
      }
      const userData = await getCollection('data/company/employees', wheres);
      if (userData) {
        let arr = Object.keys(userData || {}).map(k => userData[k]);
        status = arr[0]?.status || 'ปกติ';
      }
      r(status);
    } catch (e) {
      j(e);
    }
  });

export async function queryFirestoreArrayContainAny(field, ids, path, wheresArr = []) {
  // don't run if there aren't any ids or a path for the collection
  if (!ids || !ids.length || !path) return [];

  const batches = [];

  while (ids.length) {
    // firestore limits batches to 10
    const batch = ids.splice(0, 10);

    // add the batch request to to a queue
    let wheres = [[field, 'array-contains-any', batch]].concat(wheresArr);

    const snap = await checkCollection(path, wheres);
    if (snap) {
      snap.forEach(doc => {
        batches.push({
          ...doc.data(),
          _id: doc.id
        });
      });
    }
  }

  // after all of the data is fetched, return it
  return Promise.all(batches).then(content => content.flat());
}

/**
 * Helper function to query documents where deleted is either null or false
 * This is imported from the ByTransfer api but placed here for wider usage
 * @param {string} collection - Firestore collection path
 * @param {Array} additionalWheres - Additional where clauses (excluding deleted)
 * @returns {Promise} - Combined results from both queries
 */
export const queryNonDeletedDocuments = async (collection, additionalWheres = []) => {
  // Query for documents with deleted == null
  const sSnapNull = await checkCollection(collection, [
    ...additionalWheres,
    ['deleted', '==', null]
  ]);
  
  // Query for documents with deleted == false  
  const sSnapFalse = await checkCollection(collection, [
    ...additionalWheres,
    ['deleted', '==', false]
  ]);
  
  let data = [];
  
  // Combine results from both queries
  if (sSnapNull) {
    sSnapNull.forEach(doc => {
      data.push({ ...doc.data(), _id: doc.id });
    });
  }
  
  if (sSnapFalse) {
    sSnapFalse.forEach(doc => {
      data.push({ ...doc.data(), _id: doc.id });
    });
  }
  
  return data;
};

/**
 * Helper to detect if wheres contains deleted field filter for non-deleted documents and separate it
 */
const processDeletedFilter = (wheres) => {
  if (!wheres || !Array.isArray(wheres)) return { hasDeletedFilter: false, cleanWheres: [] };
  
  // Look for deleted field filters that are looking for non-deleted documents
  const deletedFilter = wheres.find(wh => {
    if (!Array.isArray(wh) || wh[0] !== 'deleted') return false;
    
    const [field, operator, value] = wh;
    
    // These are filters looking for non-deleted documents
    return (
      (operator === '==' && (value === null || value === false)) ||
      (operator === '!=' && value === true)
    );
  });
  
  const cleanWheres = wheres.filter(wh => !Array.isArray(wh) || wh[0] !== 'deleted');
  
  return {
    hasDeletedFilter: deletedFilter !== undefined,
    cleanWheres,
    deletedFilter
  };
};
