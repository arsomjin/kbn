// firebase.js
// contains the Firebase context and provider

import React, { createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import firebaseConfig from './firebaseConfig';
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/messaging';
import { useDispatch } from 'react-redux';

import {
  setBranches,
  setLocations,
  setWarehouses,
  setUserGroups,
  setPermissionCategories,
  setPermissions,
  setExecutives,
  setCustomers,
  setEmployees,
  setReferrers,
  setPlants,
  setBanks,
  setBankNames,
  setDataSources,
  setVehicleLists,
  setModelLists,
  setGiveaways,
  setDepartments,
  setExpenseAccountNames,
  setDealers,
  setExpenseCategories,
  setIsFCMSupported,
  setNotifications
} from 'redux/actions/data';

import {
  getMessagingToken,
  setMessageToken,
  setBranch,
  setProvince,
  checkCollection,
  checkDoc,
  addLog,
  setWarehouse,
  setLocation,
  setUserGroup,
  setPermission,
  setPermissionCategory,
  setCustomer,
  setEmployee,
  setReferrer,
  setPlant,
  setBank,
  setBankName,
  setDataSource,
  setVehicleList,
  setPartList,
  setServiceList,
  setGiveaway,
  setDepartment,
  setExpenseAccountName,
  setDealer,
  setExpenseCategory,
  addItem,
  setItem,
  updateItem,
  deleteItem,
  updateData
} from './api';
import { setVersion } from 'redux/actions/global';
import { setUsers } from 'redux/actions/data';
import { setProvinces } from 'redux/actions/provinces';
import { getPathFromCollectionName } from 'Modules/Utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { checkIsVehicleFromName } from 'utils';
import { arrayForEach } from 'functions';
import { getEmployeeStatus } from 'utils';

// check if firebase app has been initialized previously
// if not, initialize with the config we saved earlier
if (!app.apps.length) {
  app.initializeApp(firebaseConfig);
}
// we create a React Context, for this to be accessible
// from a component later
const FirebaseContext = createContext(null);
export { FirebaseContext, app };

const FirebaseProvider = ({ children }) => {
  let firebase = {
    app: null,
    database: null,
    firestore: null,
    storage: null,
    serverTimestamp: null,
    messaging: null
  };

  const dispatch = useDispatch();

  useEffect(() => {
    const isSupported = app.messaging.isSupported();
    dispatch(setIsFCMSupported(isSupported));
  }, []);

  const dispatchNotifications = notifs => dispatch(setNotifications(notifs));

  const getBranches = () => {
    let branches = {};
    let branchRef = firebase.firestore.collection('data').doc('company').collection('branches');
    branchRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setBranches(branches));
        return;
      }
      cSnap.forEach(doc => {
        let branch = doc.data();
        branch._key = doc.id;
        branches[doc.id] = branch;
        // branches.push(branch);
      });
      dispatch(setBranches(branches));
    });
  };

  const getProvinces = () => {
    let provinces = {};
    let provinceRef = firebase.firestore.collection('data').doc('company').collection('provinces');
    provinceRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setProvinces(provinces));
        return;
      }
      cSnap.forEach(doc => {
        let province = doc.data();
        province._key = doc.id;
        provinces[doc.id] = province;
        // provinces.push(province);
      });
      dispatch(setProvinces(provinces));
    });
  };

  const getVersion = () => {
    let latestVersion = '';
    let versionRef = firebase.firestore.collection('changeLogs').orderBy('version', 'desc').limit(1);
    versionRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // showMessageBar('ไม่มีสัญญาณอินเตอร์เน็ต');
        // showMessageBar('No version exists.');
        return;
      }
      cSnap.forEach(doc => {
        latestVersion = doc.data().version;
      });
      dispatch(setVersion(latestVersion));
    });
  };

  const getWarehouses = () => {
    let warehouses = {};
    let warehouseRef = firebase.firestore.collection('data').doc('company').collection('warehouses');
    warehouseRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setWarehouses(warehouses));
        return;
      }
      cSnap.forEach(doc => {
        let warehouse = doc.data();
        warehouse._key = doc.id;
        warehouses[doc.id] = warehouse;
        // warehouses.push(warehouse);
      });
      dispatch(setWarehouses(warehouses));
    });
  };

  const getLocations = () => {
    let locations = {};
    let locationRef = firebase.firestore.collection('data').doc('company').collection('locations');
    locationRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setLocations(locations));
        return;
      }
      cSnap.forEach(doc => {
        let location = doc.data();
        location._key = doc.id;
        locations[doc.id] = location;
        // locations.push(location);
      });
      dispatch(setLocations(locations));
    });
  };

  const getUserGroups = () => {
    let userGroups = {};
    let userGroupRef = firebase.firestore.collection('data').doc('company').collection('userGroups');
    userGroupRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setUserGroups(userGroups));
        return;
      }
      cSnap.forEach(doc => {
        if (!['group004', 'group005', 'group006', 'group007'].includes(doc.id)) {
          let userGroup = doc.data();
          userGroup._key = doc.id;
          userGroups[doc.id] = userGroup;
        }
        // userGroups.push(userGroup);
      });
      dispatch(setUserGroups(userGroups));
    });
  };

  const getPermissions = () => {
    let permissions = {};
    let permissionRef = firebase.firestore.collection('data').doc('company').collection('permissions');
    permissionRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setPermissions(permissions));
        return;
      }
      cSnap.forEach(doc => {
        let permission = doc.data();
        permission._key = doc.id;
        permissions[doc.id] = permission;
        // permissions.push(permission);
      });
      dispatch(setPermissions(permissions));
    });
  };

  const getPermissionCategories = () => {
    let permissionCategories = {};
    let permissionCategoriesRef = firebase.firestore
      .collection('data')
      .doc('company')
      .collection('permissionCategories');
    permissionCategoriesRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setPermissionCategories(permissionCategories));
        return;
      }
      cSnap.forEach(doc => {
        let permissionCategory = doc.data();
        permissionCategory._key = doc.id;
        permissionCategories[doc.id] = permissionCategory;
        // permissionCategories.push(permissionCategory);
      });
      dispatch(setPermissionCategories(permissionCategories));
    });
  };

  const getExecutives = () => {
    let executives = {};
    let executiveRef = firebase.firestore.collection('data').doc('sales').collection('executives');
    executiveRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setExecutives(executives));
        return;
      }
      cSnap.forEach(doc => {
        let executive = doc.data();
        executive._key = doc.id;
        executives[doc.id] = executive;
        // executives.push(executive);
      });
      dispatch(setExecutives(executives));
    });
  };

  const getCustomers = () => {
    let customers = {};
    let customerRef = firebase.firestore.collection('data').doc('sales').collection('customers');
    customerRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setCustomers(customers));
        return;
      }
      cSnap.forEach(doc => {
        let customer = doc.data();
        customer._key = doc.id;
        customers[doc.id] = customer;
        // customers.push(customer);
      });
      dispatch(setCustomers(customers));
    });
  };

  const getEmployees = () => {
    let employees = {};
    let employeeRef = firebase.firestore.collection('data').doc('company').collection('employees');
    employeeRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setEmployees(employees));
        return;
      }
      cSnap.forEach(doc => {
        let employee = doc.data();
        employee._key = doc.id;
        employees[doc.id] = employee;
        // employees.push(employee);
      });
      dispatch(setEmployees(employees));
    });
  };

  const getReferrers = () => {
    let referrers = {};
    let referrerRef = firebase.firestore.collection('data').doc('sales').collection('referrers');
    referrerRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setReferrers(referrers));
        return;
      }
      cSnap.forEach(doc => {
        let referrer = doc.data();
        referrer._key = doc.id;
        referrers[doc.id] = referrer;
        // referrers.push(referrer);
      });
      dispatch(setReferrers(referrers));
    });
  };

  const getPlants = () => {
    let plants = {};
    let plantRef = firebase.firestore.collection('data').doc('sales').collection('plants');
    plantRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setPlants(plants));
        return;
      }
      cSnap.forEach(doc => {
        let plant = doc.data();
        plant._key = doc.id;
        plants[doc.id] = plant;
        // plants.push(plant);
      });
      dispatch(setPlants(plants));
    });
  };

  const getDataSources = () => {
    let dataSources = {};
    let dataSourceRef = firebase.firestore.collection('data').doc('sales').collection('dataSources');
    dataSourceRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setDataSources(dataSources));
        return;
      }
      cSnap.forEach(doc => {
        let dataSource = doc.data();
        dataSource._key = doc.id;
        dataSources[doc.id] = dataSource;
        // dataSources.push(dataSource);
      });
      dispatch(setDataSources(dataSources));
    });
  };

  const getBanks = () => {
    let banks = {};
    let bankRef = firebase.firestore.collection('data').doc('company').collection('banks');
    bankRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setBanks(banks));
        return;
      }
      cSnap.forEach(doc => {
        let bank = doc.data();
        bank._key = doc.id;
        banks[doc.id] = bank;
        // banks.push(bank);
      });
      dispatch(setBanks(banks));
    });
  };

  const getBankNames = () => {
    let banks = {};
    let bankRef = firebase.firestore.collection('data').doc('company').collection('bankNames');
    bankRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setBankNames(banks));
        return;
      }
      cSnap.forEach(doc => {
        let bank = doc.data();
        bank._key = doc.id;
        banks[doc.id] = bank;
        // banks.push(bank);
      });
      dispatch(setBankNames(banks));
    });
  };

  const getVehicleLists = () => {
    let vehicleList = {};
    let vehicleModelRef = firebase.firestore.collection('data').doc('products').collection('vehicleList');
    vehicleModelRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setVehicleLists(vehicleList));
        return;
      }
      cSnap.forEach(doc => {
        let vehicleModel = doc.data();
        vehicleModel._key = doc.id;
        vehicleList[doc.id] = vehicleModel;
        // vehicleList.push(vehicleModel);
      });
      dispatch(setVehicleLists(vehicleList));
    });
  };

  const getModelLists = () => {
    let modelList = {};
    let vehicleModelRef = firebase.firestore.collection('data').doc('products').collection('vehicleList');
    vehicleModelRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setModelLists({ ts: Date.now(), data: modelList }));
        return;
      }
      cSnap.forEach(doc => {
        let item = doc.data();
        let _key = doc.id;
        const { productCode, name, model, isUsed, header } = item;
        let productPCode = removeAllNonAlphaNumericCharacters(productCode);

        modelList[doc.id] = {
          _key,
          header,
          productCode,
          productName: name,
          model,
          productPCode,
          isUsed,
          isVehicle: checkIsVehicleFromName(name)
        };
        // modelList.push(vehicleModel);
      });
      dispatch(setModelLists({ ts: Date.now(), data: modelList }));
    });
  };

  const getGiveaways = () => {
    let giveaways = {};
    let giveawayRef = firebase.firestore.collection('data').doc('sales').collection('giveaways');
    giveawayRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setGiveaways(giveaways));
        return;
      }
      cSnap.forEach(doc => {
        let giveaway = doc.data();
        giveaway._key = doc.id;
        giveaways[doc.id] = giveaway;
        // giveaways.push(giveaway);
      });
      dispatch(setGiveaways(giveaways));
    });
  };

  const getDepartments = () => {
    let departments = {};
    let departmentRef = firebase.firestore.collection('data').doc('company').collection('departments');
    departmentRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setDepartments(departments));
        return;
      }
      cSnap.forEach(doc => {
        let department = doc.data();
        department._key = doc.id;
        departments[doc.id] = department;
        // departments.push(department);
      });
      dispatch(setDepartments(departments));
    });
  };

  const getExpenseAccountNames = () => {
    let expenseAccountNames = {};
    let expenseAccountNameRef = firebase.firestore.collection('data').doc('account').collection('expenseName');
    expenseAccountNameRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setExpenseAccountNames(expenseAccountNames));
        return;
      }
      cSnap.forEach(doc => {
        let expenseAccountName = doc.data();
        expenseAccountName._key = doc.id;
        expenseAccountNames[doc.id] = expenseAccountName;
        // expenseAccountNames.push(expenseAccountName);
      });
      dispatch(setExpenseAccountNames(expenseAccountNames));
    });
  };

  const getDealers = () => {
    let dealers = {};
    let dealerRef = firebase.firestore.collection('data').doc('sales').collection('dealers');
    dealerRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setDealers(dealers));
        return;
      }
      cSnap.forEach(doc => {
        let dealer = doc.data();
        dealer._key = doc.id;
        dealers[doc.id] = dealer;
        // dealers.push(dealer);
      });
      dispatch(setDealers(dealers));
    });
  };

  const getUsers = () => {
    let users = {};
    let userRef = firebase.firestore.collection('users');
    userRef.get().then(async cSnap => {
      if (cSnap.empty) {
        dispatch(setUsers(users));
        return;
      }
      cSnap.forEach(doc => {
        let user = doc.data();
        let mUser = {
          ...user.auth,
          ...user,
          group: user.group || 'group011',
          branch: user.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          description: user.description || ''
        };
        delete mUser.auth;
        users[doc.id] = mUser;
      });
      let arrUser = Object.keys(users).map(k => users[k]);

      await arrayForEach(arrUser, async us => {
        let status = await getEmployeeStatus(us);
        if (users[us.uid]) {
          users[us.uid].status = status;
        }
      });
      dispatch(setUsers(users));
    });
  };

  const getExpenseCategories = () => {
    let expenseCategories = {};
    let expenseCategorieRef = firebase.firestore.collection('data').doc('account').collection('expenseCategory');
    expenseCategorieRef.get().then(async cSnap => {
      if (cSnap.empty) {
        // console.log('No document');
        dispatch(setExpenseCategories(expenseCategories));
        return;
      }
      cSnap.forEach(doc => {
        let expenseCategorie = doc.data();
        expenseCategorie._key = doc.id;
        expenseCategories[doc.id] = expenseCategorie;
        // expenseCategories.push(expenseCategorie);
      });
      dispatch(setExpenseCategories(expenseCategories));
    });
  };

  const updateCollection = async (collectionName, updateId, updateCol) => {
    try {
      const paths = getPathFromCollectionName(collectionName);
      // console.log({
      //   collectionName,
      //   updateId,
      //   updateCol,
      //   paths,
      // });
      if (paths) {
        if (paths.length > 1) {
          const doc = await checkDoc(paths[0], `${paths[1]}/${updateId}`);
          if (doc) {
            updateCol[updateId] = doc.data();
            dispatchByCollectionName(collectionName, updateCol);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const dispatchByCollectionName = (colName, col) => {
    switch (colName) {
      case 'banks':
        dispatch(setBanks(col));
        break;
      case 'branches':
        dispatch(setBranches(col));
        break;
      case 'provinces':
        dispatch(setProvinces(col));
        break;
      case 'customers':
        dispatch(setCustomers(col));
        break;
      case 'dealers':
        dispatch(setDealers(col));
        break;
      case 'departments':
        dispatch(setDepartments(col));
        break;
      case 'employees':
        dispatch(setEmployees(col));
        break;
      case 'expenseAccountNames':
        dispatch(setExpenseAccountNames(col));
        break;
      case 'expenseCategories':
        dispatch(setExpenseCategories(col));
        break;
      case 'locations':
        dispatch(setLocations(col));
        break;
      case 'permissionCategories':
        dispatch(setPermissionCategories(col));
        break;
      case 'permissions':
        dispatch(setPermissions(col));
        break;
      case 'userGroups':
        dispatch(setUserGroups(col));
        break;
      case 'users':
        dispatch(setUsers(col));
        break;
      case 'vehicleList':
        dispatch(setVehicleLists(col));
        break;
      case 'warehouses':
        dispatch(setWarehouses(col));
        break;
      case 'referrers':
        dispatch(setReferrers(col));
        break;
      case 'plants':
        dispatch(setPlants(col));
        break;
      case 'bankNames':
        dispatch(setBankNames(col));
        break;
      case 'dataSources':
        dispatch(setDataSources(col));
        break;
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

  const getCollectionSize = collection =>
    new Promise(async (r, j) => {
      try {
        let updateRef = firebase.firestore;
        collection.split('/').map((txt, n) => {
          if (n % 2 === 0) {
            updateRef = updateRef.collection(txt);
          } else {
            updateRef = updateRef.doc(txt);
          }
          return txt;
        });
        const cSnap = await updateRef.get();
        if (cSnap.empty) {
          return r(0);
        }
        r(cSnap.size);
      } catch (e) {
        j(e);
      }
    });

  firebase = {
    app: app,
    database: app.database(),
    firestore: app.firestore(),
    storage: app.storage(),
    serverTimestamp: app.firestore.FieldValue.serverTimestamp(),
    ...(app.messaging.isSupported() && { messaging: app.messaging() }),
    api: {
      getMessagingToken,
      setMessageToken,
      dispatchNotifications,
      getBranches,
      getProvinces,
      setBranch,
      setProvince,
      getLocations,
      setLocation,
      getWarehouses,
      setWarehouse,
      getUserGroups,
      setUserGroup,
      getPermissions,
      setPermission,
      getPermissionCategories,
      setPermissionCategory,
      getExecutives,
      getCustomers,
      setCustomer,
      getEmployees,
      setEmployee,
      getReferrers,
      setReferrer,
      getPlants,
      setPlant,
      getBanks,
      setBank,
      getBankNames,
      setBankName,
      getDataSources,
      setDataSource,
      getVehicleLists,
      setVehicleList,
      setPartList,
      setServiceList,
      getModelLists,
      setModelLists,
      getGiveaways,
      setGiveaway,
      getDepartments,
      setDepartment,
      getExpenseAccountNames,
      setExpenseAccountName,
      getDealers,
      setDealer,
      getUsers,
      getExpenseCategories,
      setExpenseCategory,
      getVersion,
      addLog,
      checkCollection,
      checkDoc,
      addItem,
      setItem,
      updateItem,
      deleteItem,
      updateData,
      updateCollection,
      dispatchByCollectionName,
      getCollectionSize
    }
  };
  // }

  return <FirebaseContext.Provider value={firebase}>{children}</FirebaseContext.Provider>;
};

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default FirebaseProvider;
