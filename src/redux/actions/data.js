export const GET_PRODUCTS_SUCCESS = 'GET_PRODUCTS_SUCCESS';
export const GET_BRANCHES = 'GET_BRANCHES';
export const GET_LOCATIONS = 'GET_LOCATIONS';
export const GET_WAREHOUSES = 'GET_WAREHOUSES';
export const GET_USERS = 'GET_USERS';
export const GET_EXECUTIVES = 'GET_EXECUTIVES';
export const GET_CUSTOMERS = 'GET_CUSTOMERS';
export const GET_EMPLOYEES = 'GET_EMPLOYEES';
export const GET_REFERRERS = 'GET_REFERRERS';
export const GET_BANKS = 'GET_BANKS';
export const GET_BANK_NAME = 'GET_BANK_NAME';
export const GET_DATA_SOURCE = 'GET_DATA_SOURCE';
export const GET_VEHICLE_LIST = 'GET_VEHICLE_LIST';
export const GET_MODEL_LIST = 'GET_MODEL_LIST';
export const GET_PLANTS = 'GET_PLANTS';
export const GET_EQUIPMENT_LISTS = 'GET_EQUIPMENT_LISTS';
export const GET_USER_GROUPS = 'GET_USER_GROUPS';
export const GET_GIVEAWAYS = 'GET_GIVEAWAYS';
export const GET_DEPARTMENTS = 'GET_DEPARTMENTS';
export const GET_EXPENSE_ACCOUNT_NAMES = 'GET_EXPENSE_ACCOUNT_NAMES';
export const GET_EXPENSE_CATEGORIES = 'GET_EXPENSE_CATEGORIES';
export const GET_DEALERS = 'GET_DEALERS';
export const GET_PERMISSIONS = 'GET_PERMISSIONS';
export const GET_PERMISSION_CATEGORIES = 'GET_PERMISSION_CATEGORIES';
export const GET_NOTIFICATIONS = 'GET_NOTIFICATIONS';
export const SET_NOTIFICATIONS_SUPPORTED = 'SET_NOTIFICATIONS_SUPPORTED';
export const SET_UPDATES = 'SET_UPDATES';

// Example: each setter can accept isPartial = false by default
export function getProductsSuccess(products, isPartial = false) {
  return {
    type: GET_PRODUCTS_SUCCESS,
    products,
    isPartial
  };
}

export const setBranches = (branches, isPartial = false) => ({
  type: GET_BRANCHES,
  branches,
  isPartial
});

export const setLocations = (locations, isPartial = false) => ({
  type: GET_LOCATIONS,
  locations,
  isPartial
});

export const setWarehouses = (warehouses, isPartial = false) => ({
  type: GET_WAREHOUSES,
  warehouses,
  isPartial
});

export const setUserGroups = (userGroups, isPartial = false) => ({
  type: GET_USER_GROUPS,
  userGroups,
  isPartial
});

export const setUsers = (users, isPartial = false) => ({
  type: GET_USERS,
  users,
  isPartial
});

export const setExecutives = (executives, isPartial = false) => ({
  type: GET_EXECUTIVES,
  executives,
  isPartial
});

export const setCustomers = (customers, isPartial = false) => ({
  type: GET_CUSTOMERS,
  customers,
  isPartial
});

export const setEmployees = (employees, isPartial = false) => ({
  type: GET_EMPLOYEES,
  employees,
  isPartial
});

export const setReferrers = (referrers, isPartial = false) => ({
  type: GET_REFERRERS,
  referrers,
  isPartial
});

export const setBanks = (banks, isPartial = false) => ({
  type: GET_BANKS,
  banks,
  isPartial
});

export const setBankNames = (bankNames, isPartial = false) => ({
  type: GET_BANK_NAME,
  bankNames,
  isPartial
});

export const setDataSources = (dataSources, isPartial = false) => ({
  type: GET_DATA_SOURCE,
  dataSources,
  isPartial
});

export const setVehicleLists = (vehicleList, isPartial = false) => ({
  type: GET_VEHICLE_LIST,
  vehicleList,
  isPartial
});

export const setModelLists = (modelList, isPartial = false) => ({
  type: GET_MODEL_LIST,
  modelList,
  isPartial
});

export const setPlants = (plants, isPartial = false) => ({
  type: GET_PLANTS,
  plants,
  isPartial
});

export const setGiveaways = (giveaways, isPartial = false) => ({
  type: GET_GIVEAWAYS,
  giveaways,
  isPartial
});

export const setDepartments = (departments, isPartial = false) => ({
  type: GET_DEPARTMENTS,
  departments,
  isPartial
});

export const setExpenseAccountNames = (expenseAccountNames, isPartial = false) => ({
  type: GET_EXPENSE_ACCOUNT_NAMES,
  expenseAccountNames,
  isPartial
});

export const setExpenseCategories = (expenseCategories, isPartial = false) => ({
  type: GET_EXPENSE_CATEGORIES,
  expenseCategories,
  isPartial
});

export const setDealers = (dealers, isPartial = false) => ({
  type: GET_DEALERS,
  dealers,
  isPartial
});

export const setEquipmentLists = (equipmentLists, isPartial = false) => ({
  type: GET_EQUIPMENT_LISTS,
  equipmentLists,
  isPartial
});

export const setPermissions = (permissions, isPartial = false) => ({
  type: GET_PERMISSIONS,
  permissions,
  isPartial
});

export const setPermissionCategories = (permissionCategories, isPartial = false) => ({
  type: GET_PERMISSION_CATEGORIES,
  permissionCategories,
  isPartial
});

export const setNotifications = notifications => ({
  type: GET_NOTIFICATIONS,
  notifications
});

export const setIsFCMSupported = isMessagingSupported => ({
  type: SET_NOTIFICATIONS_SUPPORTED,
  isMessagingSupported
});

export const setUpdates = updates => ({
  type: SET_UPDATES,
  updates
});
