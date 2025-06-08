/**
 * User Migration Utility for RBAC System
 * Handles automatic migration of legacy permissions to new system
 */

import { 
  migrateLegacyPermissions, 
  determineRoleFromPermissions,
  ROLE_PERMISSIONS 
} from '../data/permissions';

/**
 * Check if user needs RBAC migration
 * @param {Object} user - User object
 * @param {Object} currentRBAC - Current RBAC data
 * @returns {boolean}
 */
export const needsMigration = (user, currentRBAC) => {
  // No migration needed if user already has new RBAC structure (role exists)
  if (currentRBAC && currentRBAC.role) {
    return false;
  }
  
  // No migration needed if user already has permissions (even empty array)
  if (currentRBAC && Array.isArray(currentRBAC.permissions)) {
    return false;
  }
  
  // Migration needed if user has legacy permissions or is developer
  return user && (user.isDev || (user.permissions && Object.keys(user.permissions).length > 0));
};

/**
 * Migrate user from legacy permission system to new RBAC
 * @param {Object} user - Legacy user object
 * @param {Object} branches - Branches data for geographic mapping
 * @returns {Object} New RBAC structure
 */
export const migrateUserToRBAC = (user, branches = {}) => {
  if (!user) return null;
  
  // Migrate permissions
  const newPermissions = migrateLegacyPermissions(user);
  
  // Determine role
  const role = determineRoleFromPermissions(newPermissions, user);
  
  // Create geographic access
  const geographic = createGeographicAccess(user, branches, role);
  
  return {
    userId: user.uid,
    permissions: newPermissions,
    role,
    geographic,
    migrated: true,
    migratedAt: Date.now(),
    migratedFrom: 'legacy_permissions'
  };
};

/**
 * Create geographic access from legacy user data
 * @param {Object} user - Legacy user object
 * @param {Object} branches - Branches data
 * @param {string} role - Determined role
 * @returns {Object} Geographic access structure
 */
export const createGeographicAccess = (user, branches = {}, role) => {
  // Super admin gets all access
  if (user?.isDev || role === 'SUPER_ADMIN') {
    return {
      accessLevel: 'all',
      allowedProvinces: ['นครราชสีมา', 'นครสวรรค์'],
      allowedBranches: Object.keys(branches),
      homeProvince: null,
      homeBranch: user.homeBranch || user.branch || '0450'
    };
  }
  
  // Province manager gets province-level access
  if (role === 'PROVINCE_MANAGER') {
    const userBranch = user.homeBranch || user.branch || '0450';
    const branch = branches[userBranch];
    const provinceId = branch?.provinceId || 'นครราชสีมา';
    
    // Get all branches in the same province
    const provinceBranches = Object.keys(branches).filter(branchCode => 
      branches[branchCode]?.provinceId === provinceId
    );
    
    return {
      accessLevel: 'province',
      allowedProvinces: [provinceId],
      allowedBranches: provinceBranches,
      homeProvince: provinceId,
      homeBranch: userBranch
    };
  }
  
  // Default to branch-level access
  const userBranch = user.homeBranch || user.branch || '0450';
  const branch = branches[userBranch];
  const provinceId = branch?.provinceId || 'นครราชสีมา';
  
  return {
    accessLevel: 'branch',
    allowedProvinces: [provinceId],
    allowedBranches: [userBranch],
    homeProvince: provinceId,
    homeBranch: userBranch
  };
};

/**
 * Validate migrated RBAC data
 * @param {Object} rbacData - RBAC data to validate
 * @returns {boolean}
 */
export const validateMigratedRBAC = (rbacData) => {
  if (!rbacData) return false;
  
  // Check required fields
  const requiredFields = ['userId', 'permissions', 'role', 'geographic'];
  const hasAllFields = requiredFields.every(field => rbacData.hasOwnProperty(field));
  
  if (!hasAllFields) return false;
  
  // Check permissions array
  if (!Array.isArray(rbacData.permissions)) return false;
  
  // Check geographic structure
  const geo = rbacData.geographic;
  if (!geo || !geo.accessLevel || !geo.allowedBranches || !geo.allowedProvinces) {
    return false;
  }
  
  return true;
};

/**
 * Create fallback RBAC for users without any permissions
 * @param {Object} user - User object
 * @param {Object} branches - Branches data
 * @returns {Object} Basic RBAC structure
 */
export const createFallbackRBAC = (user, branches = {}) => {
  if (!user) return null;
  
  const userBranch = user.homeBranch || user.branch || '0450';
  const branch = branches[userBranch];
  const provinceId = branch?.provinceId || 'นครราชสีมา';
  
  return {
    userId: user.uid,
    permissions: ROLE_PERMISSIONS.SALES_STAFF, // Default permissions
    role: 'SALES_STAFF',
    geographic: {
      accessLevel: 'branch',
      allowedProvinces: [provinceId],
      allowedBranches: [userBranch],
      homeProvince: provinceId,
      homeBranch: userBranch
    },
    migrated: true,
    migratedAt: Date.now(),
    migratedFrom: 'fallback_creation'
  };
};

/**
 * Log migration for debugging
 * @param {Object} user - Original user
 * @param {Object} rbacData - Migrated RBAC data
 */
export const logMigration = (user, rbacData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 User RBAC Migration:', {
      userId: user?.uid,
      originalPermissions: user?.permissions,
      isDev: user?.isDev,
      newRole: rbacData?.role,
      newPermissions: rbacData?.permissions,
      geographic: rbacData?.geographic,
      migratedAt: new Date(rbacData?.migratedAt || Date.now()).toISOString()
    });
  }
}; 