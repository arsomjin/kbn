import { useCollectionSync } from 'api/CustomHooks';
import {
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
import { setProvinces } from 'redux/actions/provinces';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';

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
 * 🔧 FIX: Wait for complete authentication before starting data sync
 */
export const useDataSynchronization = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // 🔧 CHECK: Only sync data when authentication is complete and user has RBAC structure
  const isAuthenticationComplete = isAuthenticated && 
                                   user && 
                                   user.uid && 
                                   (user.access || user.isPendingApproval);
  
  // 🔧 DEBUG: Log authentication state for debugging (reduced frequency)
  if (process.env.NODE_ENV === 'development') {
    // Only log once when auth state changes, not on every hook call
    const authStateKey = `${isAuthenticated}-${!!user}-${!!user?.uid}-${!!user?.access}-${!!user?.isPendingApproval}`;
    if (!window._lastAuthStateKey || window._lastAuthStateKey !== authStateKey) {
      console.log('🔍 Data Sync State Change:', {
        isAuthenticated,
        hasUser: !!user,
        hasUID: !!user?.uid,
        hasAccess: !!user?.access,
        isPending: !!user?.isPendingApproval,
        authComplete: isAuthenticationComplete
      });
      window._lastAuthStateKey = authStateKey;
    }
  }
  
  // Company-related collections - wait for authentication completion
  useCollectionSync(isAuthenticationComplete ? 'data/company/provinces' : null, setProvinces);
  useCollectionSync(isAuthenticationComplete ? 'data/company/banks' : null, setBanks);
  useCollectionSync(isAuthenticationComplete ? 'data/company/bankNames' : null, setBankNames);
  useCollectionSync(isAuthenticationComplete ? 'data/company/branches' : null, setBranches);
  useCollectionSync(isAuthenticationComplete ? 'data/company/departments' : null, setDepartments);
  useCollectionSync(isAuthenticationComplete ? 'data/company/executives' : null, setExecutives);
  useCollectionSync(isAuthenticationComplete ? 'data/company/employees' : null, setEmployees);
  useCollectionSync(isAuthenticationComplete ? 'data/company/locations' : null, setLocations);
  useCollectionSync(isAuthenticationComplete ? 'data/company/permissions' : null, setPermissions);
  useCollectionSync(isAuthenticationComplete ? 'data/company/permissionCategories' : null, setPermissionCategories);
  useCollectionSync(isAuthenticationComplete ? 'data/company/userGroups' : null, setUserGroups);
  useCollectionSync(isAuthenticationComplete ? 'data/company/warehouses' : null, setWarehouses);

  // Sales-related collections - wait for authentication completion
  useCollectionSync(isAuthenticationComplete ? 'data/sales/dataSources' : null, setDataSources);
  useCollectionSync(isAuthenticationComplete ? 'data/sales/dealers' : null, setDealers);
  useCollectionSync(isAuthenticationComplete ? 'data/sales/plants' : null, setPlants);

  // Account-related collections - wait for authentication completion
  useCollectionSync(isAuthenticationComplete ? 'data/account/expenseName' : null, setExpenseAccountNames);
  useCollectionSync(isAuthenticationComplete ? 'data/account/expenseCategory' : null, setExpenseCategories);

  // User management - only sync if user has admin-level permissions AND authentication is complete
  // Check both legacy (accessLevel) and Clean Slate (access.authority) structures
  const hasUserManagementAccess = user?.accessLevel === 'SUPER_ADMIN' || 
                                  user?.accessLevel === 'PROVINCE_MANAGER' || 
                                  user?.accessLevel === 'BRANCH_MANAGER' ||
                                  user?.access?.authority === 'PROVINCE_MANAGER' ||
                                  user?.access?.authority === 'BRANCH_MANAGER' ||
                                  user?.isDev;
  
  // Check if user is approved using Clean Slate structure
  const isUserApproved = user?.isApproved !== false && user?.isActive !== false;
  
  // Pass null as collectionPath when user doesn't have access or auth isn't complete
  const usersCollectionPath = (isAuthenticationComplete && hasUserManagementAccess && isUserApproved) ? 'users' : null;
  useCollectionSync(usersCollectionPath, setUsers);
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
 * Custom hook to sync user management data
 * Should only be used by components that need user management functionality
 * and when the user has appropriate permissions
 */
export const useUserManagementSync = () => {
  const { user } = useSelector(state => state.auth);
  
  // Check both legacy (accessLevel) and Clean Slate (access.authority) structures
  const hasUserManagementAccess = user?.accessLevel === 'SUPER_ADMIN' || 
                                  user?.accessLevel === 'PROVINCE_MANAGER' || 
                                  user?.accessLevel === 'BRANCH_MANAGER' ||
                                  user?.access?.authority === 'PROVINCE_MANAGER' ||
                                  user?.access?.authority === 'BRANCH_MANAGER' ||
                                  user?.isDev;
  
  // Check if user is approved using Clean Slate structure
  const isUserApproved = user?.isApproved !== false && user?.isActive !== false;
  
  const usersCollectionPath = (hasUserManagementAccess && isUserApproved) ? 'users' : null;
  
  useCollectionSync(usersCollectionPath, setUsers);
};

/**
 * Hook to manually retry data synchronization
 * Useful after role switching or permission changes
 */
export const useManualDataSync = () => {
  const { user } = useSelector(state => state.auth);
  
  const retryUsersSync = useCallback(() => {
    // Check both legacy (accessLevel) and Clean Slate (access.authority) structures
    const hasUserManagementAccess = user?.accessLevel === 'SUPER_ADMIN' || 
                                    user?.accessLevel === 'PROVINCE_MANAGER' || 
                                    user?.accessLevel === 'BRANCH_MANAGER' ||
                                    user?.access?.authority === 'PROVINCE_MANAGER' ||
                                    user?.access?.authority === 'BRANCH_MANAGER' ||
                                    user?.isDev;
    
    if (hasUserManagementAccess) {
      console.log('🔄 Manually retrying users collection sync...');
      // This will trigger a fresh useCollectionSync attempt
      return { success: true, message: 'Users sync retry initiated' };
    } else {
      console.warn('⚠️ User does not have permission to sync users collection');
      return { success: false, message: 'Insufficient permissions for users sync' };
    }
  }, [user?.accessLevel, user?.access?.authority, user?.isDev]);

  return { retryUsersSync };
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