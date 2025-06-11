/**
 * Clean Slate RBAC Permissions System
 * Uses orthogonal 4×3×6 matrix: Authority × Geographic × Departments
 * 
 * This file now imports the Clean Slate system from orthogonal-rbac.js
 * and provides backward compatibility for legacy code during transition.
 */

import { 
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS,
  DOCUMENT_ACTIONS,
  generateUserPermissions,
  hasOrthogonalPermission,
  getLegacyRoleName,
  migrateToOrthogonalSystem,
  getUserRoleDescription
} from '../utils/orthogonal-rbac';

// Re-export Clean Slate constants for backward compatibility
export { AUTHORITY_LEVELS, GEOGRAPHIC_SCOPE, DEPARTMENTS, DOCUMENT_ACTIONS };

// Legacy department constants (deprecated - use DEPARTMENTS from orthogonal-rbac.js)
export const LEGACY_DEPARTMENTS = {
  ACCOUNTING: 'accounting',
  SALES: 'sales', 
  SERVICE: 'service',
  INVENTORY: 'inventory',
  HR: 'hr',
  REPORTS: 'reports',
  ADMIN: 'admin',
  NOTIFICATIONS: 'notifications'
};

// Legacy document flows (deprecated - use DOCUMENT_ACTIONS from orthogonal-rbac.js)
export const DOCUMENT_FLOWS = {
  VIEW: 'view',
  EDIT: 'edit',
  REVIEW: 'review',
  APPROVE: 'approve',
  MANAGE: 'manage'
};

/**
 * Combine department and action into permission string
 * @param {string} department - Department name
 * @param {string} action - Action name
 * @returns {string} Combined permission
 */
export const combinePermission = (department, action) => `${department}.${action}`;

/**
 * Parse permission string into components
 * @param {string} permission - Permission string
 * @returns {Object} Parsed permission components
 */
export const parsePermission = (permission) => {
  if (permission === '*') {
    return { department: '*', action: '*' };
  }
  
  const [department, action] = permission.split('.');
  return { department: department || '', action: action || '' };
};

/**
 * Generate permissions for user using Clean Slate RBAC
 * @param {Object} user - User object
 * @returns {Array} Permission array
 */
export const getUserPermissions = (user) => {
  const result = generateUserPermissions(user);
  return result.permissions || [];
};

/**
 * Check if user has specific permission using Clean Slate RBAC
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @param {Object} context - Additional context
 * @returns {boolean} Has permission
 */
export const hasPermission = (user, permission, context = {}) => {
  return hasOrthogonalPermission(user, permission, context);
};

/**
 * Get user role description using Clean Slate RBAC
 * @param {Object} user - User object
 * @returns {string} Role description
 */
export const getUserRole = (user) => {
  return getUserRoleDescription(user);
};

/**
 * Migrate legacy user to Clean Slate RBAC format
 * @param {Object} legacyUser - Legacy user object
 * @returns {Object} Clean Slate user structure
 */
export const migrateLegacyUser = (legacyUser) => {
  return migrateToOrthogonalSystem(legacyUser);
};

/**
 * Get legacy role name for backward compatibility
 * @param {Object} user - User object
 * @returns {string} Legacy role name
 */
export const getLegacyRole = (user) => {
  return getLegacyRoleName(user);
};

/**
 * Legacy role permission sets (DEPRECATED)
 * These are maintained for backward compatibility only.
 * New code should use the Clean Slate RBAC system from orthogonal-rbac.js
 */
export const ROLE_PERMISSIONS = {
  // Admin roles
  ADMIN: ['*'],
  SUPER_ADMIN: ['*'], // Deprecated: use ADMIN
  EXECUTIVE: ['*'],   // Deprecated: use ADMIN with isExecutive flag
  
  // Manager roles (deprecated - use AUTHORITY_LEVELS.MANAGER)
  PROVINCE_MANAGER: [
    'accounting.view', 'accounting.edit', 'accounting.review', 'accounting.approve',
    'sales.view', 'sales.edit', 'sales.review', 'sales.approve',
    'service.view', 'service.edit', 'service.review', 'service.approve',
    'inventory.view', 'inventory.edit', 'inventory.review', 'inventory.approve',
    'hr.view', 'hr.edit', 'hr.review',
    'reports.view', 'reports.edit',
    'admin.view',
    'users.view', 'users.manage', 'users.approve'
  ],
  
  BRANCH_MANAGER: [
    'accounting.view', 'accounting.edit', 'accounting.review',
    'sales.view', 'sales.edit', 'sales.review', 'sales.approve',
    'service.view', 'service.edit', 'service.review',
    'inventory.view', 'inventory.edit',
    'reports.view',
    'users.view', 'users.manage'
  ],
  
  // Staff roles (deprecated - use AUTHORITY_LEVELS.STAFF with departments)
  ACCOUNTING_STAFF: [
    'accounting.view', 'accounting.edit',
    'reports.view'
  ],
  
  SALES_STAFF: [
    'sales.view', 'sales.edit',
    'inventory.view',
    'reports.view'
  ],
  
  SERVICE_STAFF: [
    'service.view', 'service.edit',
    'inventory.view', 'inventory.edit',
    'reports.view'
  ],
  
  INVENTORY_STAFF: [
    'inventory.view', 'inventory.edit',
    'reports.view'
  ]
};

/**
 * Legacy permission checking (DEPRECATED)
 * Use hasOrthogonalPermission from orthogonal-rbac.js instead
 */
export const checkLegacyPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(requiredPermission);
};

/**
 * Determine role from permissions (DEPRECATED)
 * Use Clean Slate RBAC system instead
 */
export const determineRoleFromPermissions = (permissions, user) => {
  // Always use Clean Slate system for new implementations
  if (user?.access) {
    return getLegacyRoleName(user);
  }
  
  // Legacy fallback
  if (permissions.includes('*') || user?.isDev) {
    if (user?.isExecutive || user?.accessLevel === 'EXECUTIVE') {
      return 'EXECUTIVE';
    }
    return 'SUPER_ADMIN';
  }
  
  // Legacy staff role detection
  const hasAccounting = permissions.some(p => p.startsWith('accounting.'));
  const hasSales = permissions.some(p => p.startsWith('sales.'));
  const hasService = permissions.some(p => p.startsWith('service.'));
  const hasInventory = permissions.some(p => p.startsWith('inventory.'));
  
  // Determine primary department
  if (hasAccounting && !hasSales && !hasService) return 'ACCOUNTING_STAFF';
  if (hasSales && !hasAccounting && !hasService) return 'SALES_STAFF';
  if (hasService) return 'SERVICE_STAFF';
  if (hasInventory && !hasSales && !hasAccounting) return 'INVENTORY_STAFF';
  
  return 'SALES_STAFF'; // Default fallback
};

/**
 * Convert legacy user permissions to Clean Slate format (DEPRECATED)
 * Use migrateToOrthogonalSystem from orthogonal-rbac.js instead
 */
export const migrateLegacyPermissions = (user) => {
  const migrated = migrateToOrthogonalSystem(user);
  const result = generateUserPermissions(migrated);
  return result.permissions || [];
};

// Legacy mapping for transitional support (DEPRECATED)
export const LEGACY_TO_NEW_MAPPING = {
  // This is deprecated - Clean Slate RBAC handles migration automatically
  'accounting.view': ['accounting.view'],
  'accounting.edit': ['accounting.edit'],
  'sales.view': ['sales.view'],
  'sales.edit': ['sales.edit'],
  'service.view': ['service.view'],
  'service.edit': ['service.edit'],
  'inventory.view': ['inventory.view'],
  'inventory.edit': ['inventory.edit']
};

/**
 * DEPRECATION NOTICE
 * 
 * The following legacy patterns are deprecated and will be removed:
 * - SUPER_ADMIN, PROVINCE_MANAGER, BRANCH_MANAGER, *_STAFF roles
 * - ROLE_PERMISSIONS static definitions
 * - Legacy permission checking functions
 * 
 * Use the Clean Slate RBAC system from orthogonal-rbac.js instead:
 * - AUTHORITY_LEVELS (ADMIN, MANAGER, LEAD, STAFF)
 * - GEOGRAPHIC_SCOPE (ALL, PROVINCE, BRANCH)
 * - DEPARTMENTS (ACCOUNTING, SALES, SERVICE, INVENTORY, HR, GENERAL)
 * - generateUserPermissions(), hasOrthogonalPermission()
 */

export default {
  // Clean Slate exports
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS,
  DOCUMENT_ACTIONS,
  getUserPermissions,
  hasPermission,
  getUserRole,
  migrateLegacyUser,
  
  // Legacy exports (deprecated)
  ROLE_PERMISSIONS,
  LEGACY_DEPARTMENTS,
  DOCUMENT_FLOWS,
  combinePermission,
  parsePermission,
  checkLegacyPermission,
  determineRoleFromPermissions,
  migrateLegacyPermissions
}; 