/**
 * RBAC Utility Functions for KBN Multi-Province System
 * Provides functions for permission checking, geographic access, and data filtering
 */

import { ACCESS_LEVELS } from '../redux/actions/rbac';

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of user permissions
 * @param {string} requiredPermission - Permission to check
 * @param {Object} context - Context for geographic checks
 * @returns {boolean}
 */
export const checkPermission = (userPermissions, requiredPermission, context = {}) => {
  // Super admin check
  if (userPermissions.includes('*')) return true;

  // Direct permission check
  if (!userPermissions.includes(requiredPermission)) return false;

  // If permission exists, check geographic access
  return true; // Geographic checks are handled separately
};

/**
 * Check if user has geographic access to a specific context
 * @param {Object} user - User object with geographic access info
 * @param {Object} context - Geographic context to check
 * @returns {boolean}
 */
export const checkGeographicAccess = (user, context) => {
  const { province, branch } = context;

  // All access
  if (user.accessLevel === 'all') return true;

  // Province level access
  if (user.accessLevel === 'province') {
    if (province) {
      return (user.allowedProvinces || []).includes(province);
    }
    return true; // No province restriction in context
  }

  // Branch level access
  if (user.accessLevel === 'branch') {
    if (branch) {
      return (user.allowedBranches || []).includes(branch);
    }
    if (province) {
      // Check if user has any branches in this province
      const userBranches = user.allowedBranches || [];
      const provinceBranches = getBranchesInProvince(province); // Will need to be implemented
      return userBranches.some(branchCode => provinceBranches.includes(branchCode));
    }
    return true; // No geographic restriction in context
  }

  return false;
};

/**
 * Check both permission and geographic access
 * @param {Object} user - User object with permissions and geographic info
 * @param {string} permission - Permission to check
 * @param {Object} context - Geographic context
 * @returns {boolean}
 */
export const hasAccess = (user, permission, context = {}) => {
  // Check basic permission
  const hasPermission = checkPermission(user.permissions || [], permission, context);
  if (!hasPermission) return false;

  // Check geographic access
  return checkGeographicAccess(user, context);
};

/**
 * Filter data based on user's geographic access
 * @param {Array} data - Data array to filter
 * @param {Object} user - User with geographic access info
 * @param {string} geographicField - Field name containing geographic info
 * @returns {Array}
 */
export const filterDataByAccess = (data, user, geographicField = 'provinceId') => {
  if (!data || !Array.isArray(data)) return [];

  // Super admin or all access
  if (user.accessLevel === 'all') return data;

  // Province level access
  if (user.accessLevel === 'province') {
    const allowedProvinces = user.allowedProvinces || [];
    return data.filter(item => {
      const itemProvince = item[geographicField];
      return allowedProvinces.includes(itemProvince);
    });
  }

  // Branch level access
  if (user.accessLevel === 'branch') {
    const allowedBranches = user.allowedBranches || [];
    return data.filter(item => {
      // Try to match by branch code
      if (item.branchCode && allowedBranches.includes(item.branchCode)) {
        return true;
      }
      // Try to match by province (if branch belongs to allowed province)
      if (item[geographicField]) {
        // This would need branch-to-province mapping
        return isProvinceAccessibleToBranches(item[geographicField], allowedBranches);
      }
      return false;
    });
  }

  return [];
};

/**
 * Get accessible provinces for a user
 * @param {Object} user - User with geographic access info
 * @param {Array} allProvinces - All available provinces
 * @returns {Array}
 */
export const getAccessibleProvinces = (user, allProvinces = []) => {
  if (user.accessLevel === 'all') return allProvinces;
  
  if (user.accessLevel === 'province') {
    return allProvinces.filter(province => 
      (user.allowedProvinces || []).includes(province.key || province.id)
    );
  }

  if (user.accessLevel === 'branch') {
    // Get provinces that contain user's allowed branches
    const userBranches = user.allowedBranches || [];
    return allProvinces.filter(province => {
      const provinceBranches = province.branches || [];
      return userBranches.some(branchCode => provinceBranches.includes(branchCode));
    });
  }

  return [];
};

/**
 * Get accessible branches for a user
 * @param {Object} user - User with geographic access info
 * @param {Array} allBranches - All available branches
 * @returns {Array}
 */
export const getAccessibleBranches = (user, allBranches = []) => {
  if (user.accessLevel === 'all') return allBranches;

  if (user.accessLevel === 'province') {
    const allowedProvinces = user.allowedProvinces || [];
    return allBranches.filter(branch => 
      allowedProvinces.includes(branch.provinceId || branch.province)
    );
  }

  if (user.accessLevel === 'branch') {
    const allowedBranches = user.allowedBranches || [];
    return allBranches.filter(branch => 
      allowedBranches.includes(branch.branchCode || branch.code || branch.id)
    );
  }

  return [];
};

/**
 * Create user RBAC object from role
 * @param {string} roleKey - Role key
 * @param {Object} geographic - Geographic access info
 * @returns {Object}
 */
export const createUserRBAC = (roleKey, geographic = {}) => {
  const roleConfig = ACCESS_LEVELS[roleKey];
  if (!roleConfig) {
    throw new Error(`Invalid role: ${roleKey}`);
  }

  return {
    role: roleKey,
    permissions: roleConfig.permissions,
    accessLevel: roleConfig.level,
    ...geographic
  };
};

/**
 * Helper function to check if province is accessible to user's branches
 * @param {string} provinceId - Province ID to check
 * @param {Array} userBranches - User's allowed branches
 * @returns {boolean}
 */
const isProvinceAccessibleToBranches = (provinceId, userBranches) => {
  // This would need a mapping of branches to provinces
  // For now, return false - this should be implemented with actual data
  return false;
};

/**
 * Helper function to get branches in a province
 * @param {string} provinceId - Province ID
 * @returns {Array}
 */
const getBranchesInProvince = (provinceId) => {
  // This would need actual province-to-branches mapping
  // For now, return empty array - this should be implemented with actual data
  return [];
};

// Export commonly used permission constants
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_USERS: 'manage_users',
  
  // Province management
  VIEW_PROVINCE_REPORTS: 'view_province_reports',
  MANAGE_BRANCHES_IN_PROVINCE: 'manage_branches_in_province',
  VIEW_ALL_DATA_IN_PROVINCE: 'view_all_data_in_province',
  MANAGE_USERS_IN_PROVINCE: 'manage_users_in_province',
  
  // Branch management
  VIEW_BRANCH_REPORTS: 'view_branch_reports',
  MANAGE_BRANCH_OPERATIONS: 'manage_branch_operations',
  VIEW_BRANCH_DATA: 'view_branch_data',
  
  // Operations
  CREATE_SALES: 'create_sales',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_FINANCIAL_DATA: 'view_financial_data'
}; 