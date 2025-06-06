import { useCollectionSync } from 'api/CustomHooks';
import {
  setProvinces,
  setBanks,
  setBankNames,
  setBranches,
  setDataSources,
  setDealers,
  setDepartments,
  setExecutives,
  setEmployees,
  setExpenseAccountNames,
  setExpenseCategories,
  setLocations,
  setPermissions,
  setPermissionCategories,
  setPlants,
  setUserGroups,
  setUsers,
  setWarehouses
} from 'redux/actions/data';

/**
 * Collection sync configuration
 * Organized by domain for better maintainability
 */
const COLLECTION_SYNC_CONFIG = {
  // Company-related collections
  company: [
    { path: 'data/company/banks', action: setBanks },
    { path: 'data/company/bankNames', action: setBankNames },
    { path: 'data/company/branches', action: setBranches },
    { path: 'data/company/departments', action: setDepartments },
    { path: 'data/company/executives', action: setExecutives },
    { path: 'data/company/employees', action: setEmployees },
    { path: 'data/company/locations', action: setLocations },
    { path: 'data/company/permissions', action: setPermissions },
    { path: 'data/company/permissionCategories', action: setPermissionCategories },
    { path: 'data/company/userGroups', action: setUserGroups },
    { path: 'data/company/warehouses', action: setWarehouses }
  ],

  // Sales-related collections
  sales: [
    { path: 'data/sales/dataSources', action: setDataSources },
    { path: 'data/sales/dealers', action: setDealers },
    { path: 'data/sales/plants', action: setPlants }
  ],

  // Account-related collections
  account: [
    { path: 'data/account/expenseName', action: setExpenseAccountNames },
    { path: 'data/account/expenseCategory', action: setExpenseCategories }
  ],

  // User management
  users: [
    { path: 'users', action: setUsers }
  ]

  // TODO: Add these collections when Redux actions are ready
  // customers: [
  //   { path: 'data/sales/customers', action: setCustomers }
  // ],
  // referrers: [
  //   { path: 'data/sales/referrers', action: setReferrers }
  // ],
  // giveaways: [
  //   { path: 'data/sales/giveaways', action: setGiveaways }
  // ],
  // products: [
  //   { path: 'data/products/vehicleList', action: setVehicleLists },
  //   { path: 'modelList', action: setModelLists }
  // ]
};

/**
 * Custom hook to handle all data collection synchronization
 * Automatically syncs all configured collections
 */
export const useDataSynchronization = () => {
  // Company-related collections
  useCollectionSync('data/company/provinces', setProvinces);
  useCollectionSync('data/company/banks', setBanks);
  useCollectionSync('data/company/bankNames', setBankNames);
  useCollectionSync('data/company/branches', setBranches);
  useCollectionSync('data/company/departments', setDepartments);
  useCollectionSync('data/company/executives', setExecutives);
  useCollectionSync('data/company/employees', setEmployees);
  useCollectionSync('data/company/locations', setLocations);
  useCollectionSync('data/company/permissions', setPermissions);
  useCollectionSync('data/company/permissionCategories', setPermissionCategories);
  useCollectionSync('data/company/userGroups', setUserGroups);
  useCollectionSync('data/company/warehouses', setWarehouses);

  // Sales-related collections
  useCollectionSync('data/sales/dataSources', setDataSources);
  useCollectionSync('data/sales/dealers', setDealers);
  useCollectionSync('data/sales/plants', setPlants);

  // Account-related collections
  useCollectionSync('data/account/expenseName', setExpenseAccountNames);
  useCollectionSync('data/account/expenseCategory', setExpenseCategories);

  // User management
  useCollectionSync('users', setUsers);
};

/**
 * Custom hook to sync only company-related collections
 */
export const useCompanySync = () => {
  useCollectionSync('data/company/provinces', setProvinces);
  useCollectionSync('data/company/banks', setBanks);
  useCollectionSync('data/company/bankNames', setBankNames);
  useCollectionSync('data/company/branches', setBranches);
  useCollectionSync('data/company/departments', setDepartments);
  useCollectionSync('data/company/executives', setExecutives);
  useCollectionSync('data/company/employees', setEmployees);
  useCollectionSync('data/company/locations', setLocations);
  useCollectionSync('data/company/permissions', setPermissions);
  useCollectionSync('data/company/permissionCategories', setPermissionCategories);
  useCollectionSync('data/company/userGroups', setUserGroups);
  useCollectionSync('data/company/warehouses', setWarehouses);
};

/**
 * Custom hook to sync only sales-related collections
 */
export const useSalesSync = () => {
  useCollectionSync('data/sales/dataSources', setDataSources);
  useCollectionSync('data/sales/dealers', setDealers);
  useCollectionSync('data/sales/plants', setPlants);
};

/**
 * Custom hook to sync only account-related collections
 */
export const useAccountSync = () => {
  useCollectionSync('data/account/expenseName', setExpenseAccountNames);
  useCollectionSync('data/account/expenseCategory', setExpenseCategories);
};

/**
 * Get all collection paths for a specific domain
 * @param {string} domain - Domain name
 * @returns {string[]} Array of collection paths
 */
export const getDomainPaths = (domain) => {
  return COLLECTION_SYNC_CONFIG[domain]?.map(config => config.path) || [];
};

/**
 * Get all configured collection paths
 * @returns {string[]} Array of all collection paths
 */
export const getAllSyncPaths = () => {
  return Object.values(COLLECTION_SYNC_CONFIG)
    .flat()
    .map(config => config.path);
};

export default useDataSynchronization; 