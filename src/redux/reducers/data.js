import { distinctArr } from 'functions';
import {
  GET_PRODUCTS_SUCCESS,
  GET_BRANCHES,
  GET_PROVINCES,
  GET_LOCATIONS,
  GET_WAREHOUSES,
  GET_USER_GROUPS,
  GET_USERS,
  GET_EXECUTIVES,
  GET_CUSTOMERS,
  GET_EMPLOYEES,
  GET_REFERRERS,
  GET_BANKS,
  GET_BANK_NAME,
  GET_VEHICLE_LIST,
  GET_MODEL_LIST,
  GET_PLANTS,
  GET_GIVEAWAYS,
  GET_DEPARTMENTS,
  GET_EXPENSE_CATEGORIES,
  GET_EXPENSE_ACCOUNT_NAMES,
  GET_DEALERS,
  GET_EQUIPMENT_LISTS,
  GET_PERMISSION_CATEGORIES,
  GET_PERMISSIONS,
  GET_NOTIFICATIONS,
  SET_NOTIFICATIONS_SUPPORTED,
  SET_UPDATES,
  GET_DATA_SOURCE
} from '../actions/data';

const filterEmployees = dataObj => {
  let dataArr = Object.keys(dataObj).map(k => ({ ...dataObj[k], _key: k }));
  dataArr = dataArr.filter(l => l.group !== 'group001' && !l.isDev && !l.isHidden);
  let result = {};
  let dArr = distinctArr(dataArr, ['_key']);
  dArr.forEach(it => {
    result[it._key] = it;
  });
  return result;
};

const initialState = {
  bankNames: {},
  banks: {},
  branches: {},
  provinces: {},
  dealers: {},
  departments: {},
  employees: {},
  expenseAccountNames: {},
  expenseCategories: {},
  giveaways: {},
  locations: {},
  permissions: {},
  plants: {},
  users: {},
  warehouses: {},
  products: [],
  customers: {},
  referrers: {},
  vehicles: {},
  vehicleList: {},
  modelList: {},
  equipmentLists: {},
  userGroups: {},
  permissionCategories: {},
  notifications: [],
  isMessagingSupported: true,
  updates: null,
  allEmployees: {},
  dataSources: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    // Example: we handle partial merges if action.isPartial === true
    case GET_PRODUCTS_SUCCESS: {
      if (action.isPartial) {
        // partial update for an array might be unusual, but example shown
        const newProducts = [...state.products, ...action.products];
        return { ...state, products: newProducts };
      } else {
        return { ...state, products: action.products };
      }
    }

    case GET_BRANCHES: {
      if (action.isPartial) {
        const merged = { ...state.branches };
        Object.keys(action.branches).forEach(docId => {
          if (action.branches[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.branches[docId];
          }
        });
        return { ...state, branches: merged };
      } else {
        return { ...state, branches: action.branches };
      }
    }

    case GET_PROVINCES: {
      if (action.isPartial) {
        const merged = { ...state.provinces };
        Object.keys(action.provinces).forEach(docId => {
          if (action.provinces[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.provinces[docId];
          }
        });
        return { ...state, provinces: merged };
      } else {
        return { ...state, provinces: action.provinces };
      }
    }

    case GET_LOCATIONS: {
      if (action.isPartial) {
        const merged = { ...state.locations };
        Object.keys(action.locations).forEach(docId => {
          if (action.locations[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.locations[docId];
          }
        });
        return { ...state, locations: merged };
      } else {
        return { ...state, locations: action.locations };
      }
    }

    case GET_WAREHOUSES: {
      if (action.isPartial) {
        const merged = { ...state.warehouses };
        Object.keys(action.warehouses).forEach(docId => {
          if (action.warehouses[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.warehouses[docId];
          }
        });
        return { ...state, warehouses: merged };
      } else {
        return { ...state, warehouses: action.warehouses };
      }
    }

    case GET_USER_GROUPS: {
      if (action.isPartial) {
        const merged = { ...state.userGroups };
        Object.keys(action.userGroups).forEach(docId => {
          if (action.userGroups[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.userGroups[docId];
          }
        });
        return { ...state, userGroups: merged };
      } else {
        return { ...state, userGroups: action.userGroups };
      }
    }

    case GET_USERS: {
      if (action.isPartial) {
        let merged = { ...state.users };
        Object.keys(action.users).forEach(docId => {
          if (action.users[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.users[docId];
          }
        });
        return {
          ...state,
          users: merged,
          allEmployees: filterEmployees({ ...state.employees, ...merged })
        };
      } else {
        return {
          ...state,
          users: action.users,
          allEmployees: filterEmployees({ ...state.employees, ...action.users })
        };
      }
    }

    case GET_EXECUTIVES: {
      if (action.isPartial) {
        const merged = { ...state.executives };
        Object.keys(action.executives).forEach(docId => {
          if (action.executives[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.executives[docId];
          }
        });
        return { ...state, executives: merged };
      } else {
        return { ...state, executives: action.executives };
      }
    }

    case GET_CUSTOMERS: {
      if (action.isPartial) {
        const merged = { ...state.customers };
        Object.keys(action.customers).forEach(docId => {
          if (action.customers[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.customers[docId];
          }
        });
        return { ...state, customers: merged };
      } else {
        return { ...state, customers: action.customers };
      }
    }

    case GET_EMPLOYEES: {
      if (action.isPartial) {
        let merged = { ...state.employees };
        Object.keys(action.employees).forEach(docId => {
          if (action.employees[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.employees[docId];
          }
        });
        return {
          ...state,
          employees: merged,
          allEmployees: filterEmployees({ ...merged, ...state.users })
        };
      } else {
        return {
          ...state,
          employees: action.employees,
          allEmployees: filterEmployees({
            ...action.employees,
            ...state.users
          })
        };
      }
    }

    case GET_REFERRERS: {
      if (action.isPartial) {
        const merged = { ...state.referrers };
        Object.keys(action.referrers).forEach(docId => {
          if (action.referrers[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.referrers[docId];
          }
        });
        return { ...state, referrers: merged };
      } else {
        return { ...state, referrers: action.referrers };
      }
    }

    case GET_BANKS: {
      if (action.isPartial) {
        const merged = { ...state.banks };
        Object.keys(action.banks).forEach(docId => {
          if (action.banks[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.banks[docId];
          }
        });
        return { ...state, banks: merged };
      } else {
        return { ...state, banks: action.banks };
      }
    }

    case GET_BANK_NAME: {
      if (action.isPartial) {
        const merged = { ...state.bankNames };
        Object.keys(action.bankNames).forEach(docId => {
          if (action.bankNames[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.bankNames[docId];
          }
        });
        return { ...state, bankNames: merged };
      } else {
        return { ...state, bankNames: action.bankNames };
      }
    }

    case GET_DATA_SOURCE: {
      if (action.isPartial) {
        const merged = { ...state.dataSources };
        Object.keys(action.dataSources).forEach(docId => {
          if (action.dataSources[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.dataSources[docId];
          }
        });
        return { ...state, dataSources: merged };
      } else {
        return { ...state, dataSources: action.dataSources };
      }
    }

    case GET_VEHICLE_LIST: {
      if (action.isPartial) {
        const merged = { ...state.vehicleList };
        Object.keys(action.vehicleList).forEach(docId => {
          if (action.vehicleList[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.vehicleList[docId];
          }
        });
        return { ...state, vehicleList: merged };
      } else {
        return { ...state, vehicleList: action.vehicleList };
      }
    }

    case GET_MODEL_LIST: {
      if (action.isPartial) {
        const merged = { ...state.modelList };
        Object.keys(action.modelList).forEach(docId => {
          if (action.modelList[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.modelList[docId];
          }
        });
        return { ...state, modelList: merged };
      } else {
        return { ...state, modelList: action.modelList };
      }
    }

    case GET_PLANTS: {
      if (action.isPartial) {
        const merged = { ...state.plants };
        Object.keys(action.plants).forEach(docId => {
          if (action.plants[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.plants[docId];
          }
        });
        return { ...state, plants: merged };
      } else {
        return { ...state, plants: action.plants };
      }
    }

    case GET_GIVEAWAYS: {
      if (action.isPartial) {
        const merged = { ...state.giveaways };
        Object.keys(action.giveaways).forEach(docId => {
          if (action.giveaways[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.giveaways[docId];
          }
        });
        return { ...state, giveaways: merged };
      } else {
        return { ...state, giveaways: action.giveaways };
      }
    }

    case GET_DEPARTMENTS: {
      if (action.isPartial) {
        const merged = { ...state.departments };
        Object.keys(action.departments).forEach(docId => {
          if (action.departments[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.departments[docId];
          }
        });
        return { ...state, departments: merged };
      } else {
        return { ...state, departments: action.departments };
      }
    }

    case GET_EXPENSE_ACCOUNT_NAMES: {
      if (action.isPartial) {
        const merged = { ...state.expenseAccountNames };
        Object.keys(action.expenseAccountNames).forEach(docId => {
          if (action.expenseAccountNames[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.expenseAccountNames[docId];
          }
        });
        return { ...state, expenseAccountNames: merged };
      } else {
        return { ...state, expenseAccountNames: action.expenseAccountNames };
      }
    }

    case GET_EXPENSE_CATEGORIES: {
      if (action.isPartial) {
        const merged = { ...state.expenseCategories };
        Object.keys(action.expenseCategories).forEach(docId => {
          if (action.expenseCategories[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.expenseCategories[docId];
          }
        });
        return { ...state, expenseCategories: merged };
      } else {
        return { ...state, expenseCategories: action.expenseCategories };
      }
    }

    case GET_DEALERS: {
      if (action.isPartial) {
        const merged = { ...state.dealers };
        Object.keys(action.dealers).forEach(docId => {
          if (action.dealers[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.dealers[docId];
          }
        });
        return { ...state, dealers: merged };
      } else {
        return { ...state, dealers: action.dealers };
      }
    }

    case GET_EQUIPMENT_LISTS: {
      if (action.isPartial) {
        const merged = { ...state.equipmentLists };
        Object.keys(action.equipmentLists).forEach(docId => {
          if (action.equipmentLists[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.equipmentLists[docId];
          }
        });
        return { ...state, equipmentLists: merged };
      } else {
        return { ...state, equipmentLists: action.equipmentLists };
      }
    }

    case GET_PERMISSIONS: {
      if (action.isPartial) {
        const merged = { ...state.permissions };
        Object.keys(action.permissions).forEach(docId => {
          if (action.permissions[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.permissions[docId];
          }
        });
        return { ...state, permissions: merged };
      } else {
        return { ...state, permissions: action.permissions };
      }
    }

    case GET_PERMISSION_CATEGORIES: {
      if (action.isPartial) {
        const merged = { ...state.permissionCategories };
        Object.keys(action.permissionCategories).forEach(docId => {
          if (action.permissionCategories[docId] === null) {
            delete merged[docId];
          } else {
            merged[docId] = action.permissionCategories[docId];
          }
        });
        return { ...state, permissionCategories: merged };
      } else {
        return { ...state, permissionCategories: action.permissionCategories };
      }
    }

    case GET_NOTIFICATIONS:
      // This one is typically a full set. Keep your old logic if needed.
      return {
        ...state,
        notifications: action.notifications
      };

    case SET_NOTIFICATIONS_SUPPORTED:
      return { ...state, isMessagingSupported: action.isMessagingSupported };

    case SET_UPDATES:
      return { ...state, updates: action.updates };

    default:
      return state;
  }
}
