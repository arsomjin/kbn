/**
 * Simplified RBAC Utility Functions for KBN Multi-Province System
 * Department + Document Flow Permission System
 */

import { parsePermission, DEPARTMENTS, DOCUMENT_FLOWS } from '../data/permissions';
import { ACCESS_LEVELS } from '../redux/actions/rbac';

/**
 * Check if user has a specific permission (department.flow format)
 * @param {Array} userPermissions - Array of user permissions
 * @param {string} requiredPermission - Permission to check (e.g., "accounting.view")
 * @param {Object} context - Context for geographic checks
 * @returns {boolean}
 */
export const checkPermission = (userPermissions, requiredPermission, context = {}) => {
  // Ensure userPermissions is always an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  
  // Super admin check
  if (permissions.includes('*')) return true;

  // Parse the permission
  const { department, flow, isValid } = parsePermission(requiredPermission);
  
  if (!isValid) {
    // Direct permission check for non-standard permissions
    return permissions.includes(requiredPermission);
  }

  // Check for exact permission match
  if (permissions.includes(requiredPermission)) return true;

  // Check for department-level access (department.*)
  const departmentWildcard = `${department}.*`;
  if (permissions.includes(departmentWildcard)) return true;

  // Check for flow-level access (*.flow)
  const flowWildcard = `*.${flow}`;
  if (permissions.includes(flowWildcard)) return true;

  return false;
};

/**
 * Check if user has access to a department
 * @param {Array} userPermissions - Array of user permissions
 * @param {string} department - Department to check
 * @returns {boolean}
 */
export const hasDepartmentAccess = (userPermissions, department) => {
  // Ensure userPermissions is always an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  
  if (permissions.includes('*')) return true;
  
  // Check if user has any permission in this department
  const departmentPermissions = permissions.filter(perm => {
    const { department: permDept } = parsePermission(perm);
    return permDept === department;
  });
  
  return departmentPermissions.length > 0;
};

/**
 * Check if user has specific flow access across departments
 * @param {Array} userPermissions - Array of user permissions
 * @param {string} flow - Document flow to check
 * @returns {boolean}
 */
export const hasFlowAccess = (userPermissions, flow) => {
  // Ensure userPermissions is always an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  
  if (permissions.includes('*')) return true;
  
  // Check if user has this flow permission in any department
  const flowPermissions = permissions.filter(perm => {
    const { flow: permFlow } = parsePermission(perm);
    return permFlow === flow;
  });
  
  return flowPermissions.length > 0;
};

/**
 * Get user's accessible departments
 * @param {Array} userPermissions - Array of user permissions
 * @returns {Array} List of accessible departments
 */
export const getAccessibleDepartments = (userPermissions) => {
  // Ensure userPermissions is always an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  
  if (permissions.includes('*')) {
    return Object.values(DEPARTMENTS);
  }
  
  const departments = new Set();
  permissions.forEach(perm => {
    const { department, isValid } = parsePermission(perm);
    if (isValid && department) {
      departments.add(department);
    }
  });
  
  return Array.from(departments);
};

/**
 * Get user's accessible document flows for a department
 * @param {Array} userPermissions - Array of user permissions
 * @param {string} department - Department to check
 * @returns {Array} List of accessible flows for the department
 */
export const getAccessibleFlows = (userPermissions, department) => {
  // Ensure userPermissions is always an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : [];
  
  if (permissions.includes('*')) {
    return Object.values(DOCUMENT_FLOWS);
  }
  
  const flows = new Set();
  permissions.forEach(perm => {
    const { department: permDept, flow, isValid } = parsePermission(perm);
    if (isValid && permDept === department && flow) {
      flows.add(flow);
    }
  });
  
  return Array.from(flows);
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
  // Super admin
  ALL: '*',
  
  // Accounting permissions
  ACCOUNTING_VIEW: 'accounting.view',
  ACCOUNTING_EDIT: 'accounting.edit',
  ACCOUNTING_REVIEW: 'accounting.review',
  ACCOUNTING_APPROVE: 'accounting.approve',
  
  // Sales permissions
  SALES_VIEW: 'sales.view',
  SALES_EDIT: 'sales.edit',
  SALES_REVIEW: 'sales.review',
  SALES_APPROVE: 'sales.approve',
  
  // Service permissions
  SERVICE_VIEW: 'service.view',
  SERVICE_EDIT: 'service.edit',
  SERVICE_REVIEW: 'service.review',
  SERVICE_APPROVE: 'service.approve',
  
  // Inventory permissions
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_EDIT: 'inventory.edit',
  INVENTORY_REVIEW: 'inventory.review',
  INVENTORY_APPROVE: 'inventory.approve',
  
  // HR permissions
  HR_VIEW: 'hr.view',
  HR_EDIT: 'hr.edit',
  HR_REVIEW: 'hr.review',
  HR_APPROVE: 'hr.approve',
  
  // Admin permissions
  ADMIN_VIEW: 'admin.view',
  ADMIN_EDIT: 'admin.edit',
  ADMIN_REVIEW: 'admin.review',
  ADMIN_APPROVE: 'admin.approve',
  
  // Reports permissions
  REPORTS_VIEW: 'reports.view',
  REPORTS_EDIT: 'reports.edit'
}; 