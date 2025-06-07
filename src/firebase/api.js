import { app } from '.';
import { store } from 'App';
import { showWarn, showLog } from 'functions';
import { goOnline, goOffline } from 'redux/actions/unPersisted';
import { vapidKey } from './firebaseConfig';
import { sortArrByMultiKeys } from 'functions';
import moment from 'moment-timezone';
import { isMobile, browserName, browserVersion, osName, osVersion } from 'react-device-detect';
import { createNewId } from 'utils';
import { cleanValuesBeforeSave } from 'functions';

export const getMessagingToken = async () => {
  try {
    const messagingToken = await app.messaging().getToken({ vapidKey });
    return messagingToken || false;
  } catch (error) {
    throw error;
  }
};

// function to query data from the database and
// fire a Redux action to update the items in real-time

export const setMessageToken = (token, user) =>
  new Promise(async (r, j) => {
    try {
      let tokensRef = app.firestore().collection('messageTokens');
      const res = await tokensRef.doc(user.uid).set({
        token,
        group: user.group || null,
        branch: user.branch || null,
        department: user.department || null
      });
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const setBranch = branch => {
  let branchRef = app.firestore().collection('data').doc('company').collection('branches');
  branchRef
    .doc(branch.branchCode)
    .set(branch)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setProvince = province => {
  let provinceRef = app.firestore().collection('data').doc('company').collection('provinces');
  provinceRef
    .doc(province.provinceName)
    .set(province)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const checkCollection = (collection, wheres, orderBy, limit) =>
  new Promise(async (r, j) => {
    try {
      let checkRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          checkRef = checkRef.collection(txt);
        } else {
          checkRef = checkRef.doc(txt);
        }
        return txt;
      });
      // let checkRef = app.firestore().collection(colTxt);
      if (wheres) {
        wheres.map(wh => {
          // console.log({ wh });
          checkRef = checkRef.where(wh[0], wh[1], wh[2]);
          return wh;
        });
      }
      if (orderBy) {
        if (orderBy.startsWith('-')) {
          // Descending order.
          orderBy = orderBy.substring(1).trim();
          checkRef = checkRef.orderBy(orderBy, 'desc');
        } else {
          checkRef = checkRef.orderBy(orderBy);
        }
      }
      if (limit) {
        checkRef = checkRef.limit(limit);
      }
      const cSnap = await checkRef.get();
      r(!cSnap.empty ? cSnap : false);
    } catch (e) {
      j(e);
    }
  });

export const checkDoc = (collection, docPath) =>
  new Promise(async (r, j) => {
    try {
      // let checkRef = app.firestore().collection(collection).doc(docPath);
      let checkRef = app.firestore().collection(collection);
      docPath.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          checkRef = checkRef.doc(txt);
        } else {
          checkRef = checkRef.collection(txt);
        }
        return txt;
      });
      const doc = await checkRef.get();
      // console.log('doc', doc.data());
      r(doc.exists ? doc : false);
    } catch (e) {
      j(e);
    }
  });

export const getSearchData = (collection, sValues, sorts, mapFieldName) =>
  new Promise(async (r, j) => {
    showLog({ collection, sValues, sorts, mapFieldName });
    try {
      let dArr = [];
      let dataRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          dataRef = dataRef.collection(txt);
        } else {
          dataRef = dataRef.doc(txt);
        }
        return txt;
      });

      Object.keys(sValues).map(k => {
        if (typeof sValues[k] !== 'undefined' && sValues[k] !== 'all') {
          switch (k) {
            case 'startDate':
              dataRef = dataRef.where(
                mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                '>=',
                sValues[k]
              );
              break;
            case 'endDate':
              dataRef = dataRef.where(
                mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                '<=',
                sValues[k]
              );
              break;
            case 'month':
              dataRef = dataRef
                .where(mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date', '<=', `${sValues[k]}-31`)
                .where(mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date', '>=', `${sValues[k]}-01`);
              break;
            case 'monthRange':
              dataRef = dataRef
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '<=',
                  `${sValues[k][1]}-31`
                )
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '>=',
                  `${sValues[k][0]}-01`
                );
              break;
            case 'year':
              dataRef = dataRef
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '<=',
                  `${sValues[k]}-12-31`
                )
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '>=',
                  `${sValues[k]}-01-01`
                );
              break;
            case 'yearRange':
              dataRef = dataRef
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '<=',
                  `${sValues[k][1]}-12-31`
                )
                .where(
                  mapFieldName && mapFieldName['date'] ? mapFieldName['date'] : 'date',
                  '>=',
                  `${sValues[k][0]}-01-01`
                );
              break;
            default:
              dataRef = dataRef.where(k, '==', sValues[k]);
              // showLog(`${k} == ${sValues[k]}`);
              break;
          }
        }
        return k;
      });
      let cSnap = await dataRef.get();
      if (cSnap.empty) {
        showWarn('No document');
        r(dArr);
        return;
      }
      cSnap.forEach(doc => {
        // showLog('item', doc.data());
        let sItem = doc.data();
        sItem._key = doc.id;
        sItem.key = doc.id;
        dArr.push(sItem);
      });
      dArr = dArr.map((item, id) => ({
        ...item,
        id
      }));
      let mArr = JSON.parse(JSON.stringify(dArr));
      // showLog('mArr', mArr);
      if (sorts) {
        mArr = sortArrByMultiKeys(mArr, sorts);
        mArr = mArr.map((od, id) => ({
          ...od,
          id
        }));
      }
      r(mArr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getLatestData = ({ collection, wheres, orderBy, limit, desc }) =>
  new Promise(async (r, j) => {
    if (!(collection && orderBy)) {
      return r(false);
    }
    try {
      let dataRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          dataRef = dataRef.collection(txt);
        } else {
          dataRef = dataRef.doc(txt);
        }
        return txt;
      });
      if (wheres) {
        wheres.map(wh => {
          // console.log({ wh });
          dataRef = dataRef.where(wh[0], wh[1], wh[2]);
          return wh;
        });
      }
      if (orderBy) {
        dataRef = desc ? dataRef.orderBy(orderBy, 'desc') : dataRef.orderBy(orderBy);
      }
      dataRef = dataRef.limit(limit || 1);
      const cSnap = await dataRef.get();
      r(!cSnap.empty ? cSnap : false);
    } catch (e) {
      j(e);
    }
  });

export const addLog = async (log, category, collection) => {
  // log = { time, type, by, docId}
  console.log({ log, category, collection });

  try {
    const isCategoryExists = await checkDoc('logs', category);
    if (!isCategoryExists) {
      await app.firestore().collection('logs').doc(category).collection(collection).doc(log?.docId).set(log);
    } else {
      await app.firestore().collection('logs').doc(category).collection(collection).add(log);
    }
    // Update Active State.
    const { uid } = store.getState().auth.user;
    const stateExists = await checkDoc('status', uid);
    if (stateExists) {
      await app.firestore().collection('status').doc(uid).update({
        state: 'online',
        lastActive: Date.now(),
        last_online: Date.now()
      });
    }
  } catch (e) {
    console.warn(e);
  }
};

export const setWarehouse = warehouse => {
  let warehouseRef = app.firestore().collection('data').doc('company').collection('warehouses');
  warehouseRef
    .doc(warehouse.warehouseId)
    .set(warehouse)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setLocation = location => {
  let locationRef = app.firestore().collection('data').doc('company').collection('locations');
  locationRef
    .doc(location.locationId)
    .set(location)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setUserGroup = userGroup => {
  let userGroupRef = app.firestore().collection('data/company/userGroups');
  userGroupRef
    .doc(userGroup.userGroupId)
    .set(userGroup)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setPermission = permission => {
  let permissionRef = app.firestore().collection('data').doc('company').collection('permissions');
  permissionRef
    .doc(permission.permissionId)
    .set(permission)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setPermissionCategory = permission => {
  let permissionCategoryRef = app.firestore().collection('data').doc('company').collection('permissionCategories');
  permissionCategoryRef
    .doc(permission.permissionId)
    .set(permission)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setCustomer = customer => {
  let customerRef = app.firestore().collection('data').doc('sales').collection('customers');
  let customerId = createNewId('CUS');
  customerRef
    .doc(customerId)
    .set({ ...customer, customerId })
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setEmployee = employee => {
  let employeeRef = app.firestore().collection('data').doc('company').collection('employees');
  let employeeId = employee?.employeeCode || createNewId('EMP');
  employeeRef
    .doc(employeeId)
    .set({ ...employee, employeeId })
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setReferrer = referrer => {
  let referrerRef = app.firestore().collection('data/sales/referrers');
  let referrerId = createNewId('REF');
  referrerRef
    .doc(referrerId)
    .set({ ...referrer, referrerId })
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setPlant = plant => {
  let plantRef = app.firestore().collection('data').doc('sales').collection('plants');
  let plantId = createNewId('PLANT');
  plantRef
    .doc(plantId)
    .set(plant)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setDataSource = dataSource => {
  let dataSourceRef = app.firestore().collection('data').doc('sales').collection('dataSources');
  let dataSourceId = createNewId('MKT-CHA');

  dataSourceRef
    .doc(dataSourceId)
    .set(dataSource)
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setBank = bank => {
  let bankRef = app.firestore().collection('data').doc('company').collection('banks');
  let _key = bank?._key || createNewId('BANK');

  bankRef
    .doc(_key)
    .set({ ...bank, _key })
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setBankName = bank => {
  let bankRef = app.firestore().collection('data').doc('company').collection('bankNames');
  let _key = bank?._key || createNewId('BANK');
  bankRef
    .doc(_key)
    .set({ ...bank, _key })
    .then(() => {})
    .catch(error => console.warn(error));
};

export const setVehicleList = vehicle => {
  let vehicleRef = app.firestore().collection('data').doc('products').collection('vehicleList');
  if (vehicle.productCode) {
    vehicleRef.doc(vehicle.productCode).set(vehicle);
  } else {
    let _key = createNewId('VEH');
    vehicleRef
      .doc(_key)
      .set({ ...vehicle, _key, productCode: _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setPartList = part => {
  let partRef = app.firestore().collection('data').doc('products').collection('partList');
  if (part.pCode) {
    partRef.doc(part.pCode).set(part);
  } else {
    let _key = createNewId('PART');
    partRef
      .doc(_key)
      .set({ ...part, _key, pCode: _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setServiceList = service => {
  let serviceRef = app.firestore().collection('data').doc('services').collection('serviceList');
  if (service.serviceCode) {
    serviceRef.doc(service.serviceCode).set(service);
  } else {
    let _key = createNewId('SERV');
    serviceRef
      .doc(_key)
      .set({ ...service, _key, serviceCode: _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setGiveaway = giveaway => {
  let giveawayRef = app.firestore().collection('data').doc('sales').collection('giveaways');
  if (giveaway._key) {
    giveawayRef.doc(giveaway._key).update(giveaway);
  } else {
    let _key = createNewId('GIVE');
    giveawayRef
      .doc(_key)
      .set({ ...giveaway, _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setDepartment = department => {
  let departmentRef = app.firestore().collection('data').doc('company').collection('departments');
  if (department._key) {
    departmentRef.doc(department._key).update(department);
  } else {
    let _key = createNewId('DEP');
    departmentRef
      .doc(_key)
      .set({ ...department, _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setExpenseAccountName = expenseAccountName => {
  let expenseAccountNameRef = app.firestore().collection('data').doc('account').collection('expenseName');
  if (expenseAccountName._key) {
    expenseAccountNameRef.doc(expenseAccountName._key).update(expenseAccountName);
  } else {
    let _key = createNewId('ACC-NAME');
    expenseAccountNameRef
      .doc(_key)
      .set({ ...expenseAccountName, _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setDealer = dealer => {
  let dealerRef = app.firestore().collection('data').doc('sales').collection('dealers');
  if (dealer._key) {
    dealerRef.doc(dealer._key).update(dealer);
  } else {
    let _key = createNewId('DEAL');
    dealerRef
      .doc(_key)
      .set({ ...dealer, _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const setExpenseCategory = expenseCategory => {
  let expenseCategoryRef = app.firestore().collection('data').doc('account').collection('expenseCategory');
  if (expenseCategory._key) {
    expenseCategoryRef.doc(expenseCategory._key).update(expenseCategory);
  } else {
    let _key = createNewId('ACC-CAT');
    expenseCategoryRef
      .doc(_key)
      .set({ ...expenseCategory, _key })
      .then(() => {})
      .catch(error => console.warn(error));
  }
};

export const addItem = (item, collection) =>
  new Promise(async (r, j) => {
    if (!(!!item && !!collection)) {
      j({ message: 'ADD_ITEM_WRONG_INPUT' });
    }
    try {
      let addItemRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          addItemRef = addItemRef.collection(txt);
        } else {
          addItemRef = addItemRef.doc(txt);
        }
        return txt;
      });
      const res = await addItemRef.add(item);
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const setItem = (item, collection, doc) =>
  new Promise(async (r, j) => {
    if (!(!!item && !!collection && !!doc)) {
      j({ message: 'SET_ITEM_WRONG_INPUT' });
    }
    try {
      let setItemRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          setItemRef = setItemRef.collection(txt);
        } else {
          setItemRef = setItemRef.doc(txt);
        }
        return txt;
      });
      const res = await setItemRef.doc(doc).set(item);
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const updateItem = (item, collection, doc) =>
  new Promise(async (r, j) => {
    if (!(!!item && !!collection && !!doc)) {
      j({ message: 'UPDATE_ITEM_WRONG_INPUT' });
    }
    try {
      let updateItemRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          updateItemRef = updateItemRef.collection(txt);
        } else {
          updateItemRef = updateItemRef.doc(txt);
        }
        return txt;
      });
      const res = await updateItemRef.doc(doc).update(item);
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const deleteItem = (collection, doc) =>
  new Promise(async (r, j) => {
    if (!(!!collection && !!doc)) {
      j({ message: 'DELETE_ITEM_WRONG_INPUT' });
    }
    try {
      let deleteItemRef = app.firestore();
      collection.split('/').map((txt, n) => {
        if (n % 2 === 0) {
          deleteItemRef = deleteItemRef.collection(txt);
        } else {
          deleteItemRef = deleteItemRef.doc(txt);
        }
        return txt;
      });

      const res = await deleteItemRef.doc(doc).delete();
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const updateData = (collection, key) =>
  new Promise(async (r, j) => {
    if (!collection) {
      j({ message: 'UPDATE_DATA_WRONG_INPUT' });
    }
    try {
      const { uid } = store.getState().auth.user;
      if (!uid) {
        return j('FAILED');
      }
      const res = await addItem(
        {
          time: Date.now(),
          by: uid,
          _key: key || 'all'
        },
        `updates/keys/${collection}`
      );
      // const res = await updateItem(
      //   {
      //     [collection]: { time: Date.now(), by: uid },
      //   },
      //   'updates',
      //   'latest'
      // );
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const presenceListener = async uid => {
  try {
    if (!uid) {
      showWarn('NO_USER_ID', 'No uid to detecting presence.');
      return;
    }

    const databaseStatusRef = app.database().ref(`status/${uid}`);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: app.database.ServerValue.TIMESTAMP,
      last_offline: app.database.ServerValue.TIMESTAMP
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: app.database.ServerValue.TIMESTAMP,
      last_online: app.database.ServerValue.TIMESTAMP
    };

    return app
      .database()
      .ref('.info/connected')
      .on('value', snapshot => {
        if (!snapshot.val()) {
          // If we're not currently connected, don't do anything.
          return;
        }
        // If we are currently connected, then use the 'onDisconnect()'
        // method to add a set which will only trigger once this
        // client has disconnected by closing the app,
        // losing internet, or any other means.
        databaseStatusRef
          .onDisconnect()
          .update(isOfflineForDatabase)
          .then(async () => {
            try {
              // The promise returned from .onDisconnect().set() will
              // resolve as soon as the server acknowledges the onDisconnect()
              // request, NOT once we've actually disconnected:
              // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

              // We can now safely set ourselves as 'online' knowing that the
              // server will mark us as offline once we lose connection.
              await databaseStatusRef.update(isOnlineForDatabase);
            } catch (e) {
              showWarn(e);
            }
          });
      });
  } catch (e) {
    //  showLog(e);
    console.warn(e);
  }
};

export const userStatusListener = uid => {
  if (!uid) {
    return;
  }
  const userStatusRef = app.firestore().collection('status').doc(uid);
  return userStatusRef.onSnapshot(doc => {
    console.log('doc', doc.data());
    if (doc.exists) {
      const isOnline = doc.data().state === 'online';
      store.dispatch(isOnline ? goOnline() : goOffline());
    }
  });
};

export const addErrorLogs = error =>
  new Promise(async (r, j) => {
    try {
      // showLog('ADD_ERROR', error);
      if (!error) {
        r(false);
      }
      const { user, isAuthenticated } = store.getState().auth;
      let eYear = moment().format('YYYY');
      let eMonth = moment().format('YYYY-MM');
      let eTime = moment().format('YYYYMMDDHHmm');
      let collection = `errors/no_auth/handler`;
      if (!!user?.uid && isAuthenticated) {
        collection = `errors/auth/handler`;
      }
      let errorRef = app.firestore().collection(collection).doc(eTime);
      let errData = cleanValuesBeforeSave({
        ts: Date.now(),
        ...(!!user?.uid &&
          isAuthenticated && {
            by: `${user.firstName || ''} ${user.lastName || ''}`,
            uid: user.uid,
            email: user.email
          }),
        error: error || null,
        device: { isMobile, browserName, browserVersion, osName, osVersion },
        ...(error?.snap && { snap: error.snap }),
        ...(error?.module && { module: error.module })
      });
      const res = await errorRef.set(errData);
      r(res);
    } catch (e) {
      console.warn(e);
      j(e);
    }
  });

export const getCollection = (collection, wheres, limit, orderBy) =>
  new Promise(async (r, j) => {
    try {
      let result = {};
      const snap = await checkCollection(collection, wheres, orderBy, limit);
      if (snap) {
        snap.forEach(doc => {
          let item = doc.data();
          item._key = doc.id;
          result[doc.id] = item;
        });
      }
      r(Object.keys(result).length === 0 ? false : result);
    } catch (e) {
      j(e);
    }
  });

export const getDoc = (collection, docPath) =>
  new Promise(async (r, j) => {
    try {
      let result = null;
      const doc = await checkDoc(collection, docPath);
      if (!!doc) {
        result = doc.data();
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });

// Enhanced Province Management API Functions
export const getProvinces = async () => {
  try {
    const snapshot = await app.firestore()
      .collection('data')
      .doc('company') 
      .collection('provinces')
      .get();
    
    const provinces = {};
    snapshot.forEach((doc) => {
      provinces[doc.id] = { 
        ...doc.data(), 
        id: doc.id,
        _key: doc.id
      };
    });
    return provinces;
  } catch (error) {
    console.warn('Error getting provinces:', error);
    throw error;
  }
};

export const createProvince = async (provinceData) => {
  try {
    // Use key field or generate kebab-case key from name
    const provinceKey = provinceData.key || 
      (provinceData.name ? provinceData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '');
    
    const docRef = app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc(provinceKey);
    
    await docRef.set({
      ...provinceData,
      key: provinceKey,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      updatedAt: new Date().toISOString(),
      status: provinceData.status || 'active'
    });
    
    return provinceKey;
  } catch (error) {
    console.warn('Error creating province:', error);
    throw error;
  }
};

export const updateProvince = async (provinceKey, updateData) => {
  try {
    const docRef = app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc(provinceKey);
    
    await docRef.update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.warn('Error updating province:', error);
    throw error;
  }
};

export const deleteProvince = async (provinceKey) => {
  try {
    await app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc(provinceKey)
      .delete();
    
    return true;
  } catch (error) {
    console.warn('Error deleting province:', error);
    throw error;
  }
};

export const getProvinceByKey = async (provinceKey) => {
  try {
    const doc = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc(provinceKey)
      .get();
    
    if (doc.exists) {
      return { 
        ...doc.data(), 
        id: doc.id,
        _key: doc.id
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting province by key:', error);
    throw error;
  }
};

export const getProvinceByName = async (provinceName) => {
  try {
    const snapshot = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .where('name', '==', provinceName)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { 
        ...doc.data(), 
        id: doc.id,
        _key: doc.id
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting province by name:', error);
    throw error;
  }
};

export const getProvinceByCode = async (provinceCode) => {
  try {
    const snapshot = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .where('code', '==', provinceCode)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { 
        ...doc.data(), 
        id: doc.id,
        _key: doc.id
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting province by code:', error);
    throw error;
  }
};

export const getProvincesByRegion = async (region) => {
  try {
    const snapshot = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('provinces')
      .where('region', '==', region)
      .get();
    
    const provinces = {};
    snapshot.forEach((doc) => {
      provinces[doc.id] = { 
        ...doc.data(), 
        id: doc.id,
        _key: doc.id
      };
    });
    
    return provinces;
  } catch (error) {
    console.warn('Error getting provinces by region:', error);
    throw error;
  }
};

// RBAC Management API Functions
export const updateUserRBAC = async (userId, rbacData) => {
  try {
    const userRef = app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .doc(userId);

    await userRef.update({
      accessLevel: rbacData.accessLevel,
      allowedProvinces: rbacData.allowedProvinces || [],
      allowedBranches: rbacData.allowedBranches || [],
      permissions: rbacData.permissions || [],
      homeProvince: rbacData.homeProvince || null,
      homeBranch: rbacData.homeBranch || null,
      role: rbacData.role || null,
      updatedAt: Date.now(),
    });

    return true;
  } catch (error) {
    console.warn('Error updating user RBAC:', error);
    throw error;
  }
};

export const getUserRBAC = async (userId) => {
  try {
    const doc = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .doc(userId)
      .get();

    if (doc.exists) {
      const userData = doc.data();
      return {
        accessLevel: userData.accessLevel || "all",
        allowedProvinces: userData.allowedProvinces || [],
        allowedBranches: userData.allowedBranches || [],
        permissions: userData.permissions || [],
        homeProvince: userData.homeProvince || null,
        homeBranch: userData.homeBranch || null,
        role: userData.role || null
      };
    }

    return null;
  } catch (error) {
    console.warn('Error getting user RBAC:', error);
    throw error;
  }
};

export const setUserPermissions = async (userId, permissions) => {
  try {
    const userRef = app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .doc(userId);

    await userRef.update({
      permissions: permissions,
      updatedAt: Date.now(),
    });

    return true;
  } catch (error) {
    console.warn('Error setting user permissions:', error);
    throw error;
  }
};

export const setUserGeographicAccess = async (userId, accessLevel, provinces, branches) => {
  try {
    const userRef = app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .doc(userId);

    await userRef.update({
      accessLevel: accessLevel,
      allowedProvinces: provinces || [],
      allowedBranches: branches || [],
      updatedAt: Date.now(),
    });

    return true;
  } catch (error) {
    console.warn('Error setting user geographic access:', error);
    throw error;
  }
};

export const getUsersByAccessLevel = async (accessLevel) => {
  try {
    const snapshot = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .where('accessLevel', '==', accessLevel)
      .get();

    const users = {};
    snapshot.forEach((doc) => {
      users[doc.id] = {
        ...doc.data(),
        id: doc.id,
        _key: doc.id
      };
    });

    return users;
  } catch (error) {
    console.warn('Error getting users by access level:', error);
    throw error;
  }
};

export const getUsersByProvince = async (provinceKey) => {
  try {
    const snapshot = await app.firestore()
      .collection('users')
      .where('allowedProvinces', 'array-contains', provinceKey)
      .get();

    if (!snapshot.empty) {
      const users = {};
      snapshot.docs.forEach(doc => {
        users[doc.id] = {
          ...doc.data(),
          uid: doc.id
        };
      });
      return users;
    }
    
    return {};
  } catch (error) {
    console.warn('Error getting users by province:', error);
    throw error;
  }
};
