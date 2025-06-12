/**
 * Clean Slate RBAC Actions
 * Pure Clean Slate RBAC system with no legacy fallback support
 * Aligned with DATA_STRUCTURES_REFERENCE.md version 2.1
 */

import { 
  AUTHORITY_LEVELS, 
  GEOGRAPHIC_SCOPE, 
  DEPARTMENTS,
  generateUserPermissions,
  hasOrthogonalPermission,
  migrateToOrthogonalSystem
} from '../../utils/orthogonal-rbac';

// Action Types
export const SET_USER_PERMISSIONS = 'SET_USER_PERMISSIONS';
export const SET_USER_ROLE = 'SET_USER_ROLE';
export const SET_GEOGRAPHIC_ACCESS = 'SET_GEOGRAPHIC_ACCESS';
export const UPDATE_USER_ACCESS = 'UPDATE_USER_ACCESS';
export const CHECK_PERMISSION = 'CHECK_PERMISSION';
export const SET_ACCESS_CACHE = 'SET_ACCESS_CACHE';
export const CLEAR_ACCESS_CACHE = 'CLEAR_ACCESS_CACHE';
export const SET_RBAC_LOADING = 'SET_RBAC_LOADING';
export const SET_RBAC_ERROR = 'SET_RBAC_ERROR';
export const RBAC_INITIALIZED = 'RBAC_INITIALIZED';

/**
 * Helper function to validate Clean Slate user structure
 * @param {Object} user - User object to validate
 * @returns {boolean} - True if valid Clean Slate structure
 */
const isValidCleanSlateUser = (user) => {
  return !!(
    user?.access?.authority && 
    user?.access?.geographic && 
    Array.isArray(user?.access?.departments)
  );
};

/**
 * Helper function to create Clean Slate geographic structure
 * @param {string} scope - Geographic scope
 * @param {Object} options - Geographic options
 * @returns {Object} - Clean Slate geographic structure
 */
const createGeographicStructure = (scope, options = {}) => {
  const {
    allowedProvinces = [],
    allowedBranches = [],
    homeProvince = null,
    homeBranch = null
  } = options;

  return {
    scope,
    allowedProvinces,
    allowedBranches,
    homeProvince,
    homeBranch
  };
};

/**
 * Helper function to create Clean Slate access structure
 * @param {string} authority - Authority level
 * @param {Object} geographic - Geographic structure
 * @param {Array} departments - Department array
 * @returns {Object} - Clean Slate access structure
 */
const createCleanSlateAccess = (authority, geographic, departments = [DEPARTMENTS.GENERAL]) => {
  return {
    authority,
    geographic,
    departments,
    permissions: {},
    createdAt: Date.now(),
  };
};

// Basic Action Creators
export const setUserPermissions = (userId, permissions, geographic = null) => ({
  type: SET_USER_PERMISSIONS,
  payload: { userId, permissions, geographic }
});

export const setUserRole = (userId, authority, geographic, departments) => ({
  type: SET_USER_ROLE,
  payload: { 
    userId, 
    access: createCleanSlateAccess(authority, geographic, departments)
  }
});

export const setGeographicAccess = (userId, geographic) => ({
  type: SET_GEOGRAPHIC_ACCESS,
  payload: { userId, geographic }
});

export const updateUserAccess = (userId, accessUpdates) => ({
  type: UPDATE_USER_ACCESS,
  payload: { userId, updates: accessUpdates }
});

export const setAccessCache = (cacheKey, result) => ({
  type: SET_ACCESS_CACHE,
  payload: { cacheKey, result }
});

export const clearAccessCache = () => ({
  type: CLEAR_ACCESS_CACHE
});

export const setRbacLoading = (loading) => ({
  type: SET_RBAC_LOADING,
  payload: loading
});

export const setRbacError = (error) => ({
  type: SET_RBAC_ERROR,
  payload: error
});

export const rbacInitialized = () => ({
  type: RBAC_INITIALIZED
});

export const checkPermission = (permission, context = {}) => ({
  type: CHECK_PERMISSION,
  payload: { permission, context }
});

// Complex Action Creators (Thunks)

/**
 * Initialize User RBAC - Clean Slate Only
 * Automatically migrates legacy users to Clean Slate structure
 */
export const initializeUserRBAC = (userId) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));
      
      const { auth } = getState();
      
      if (!auth?.user) {
        throw new Error('No authenticated user found');
      }

      const user = auth.user;

      // Validate Clean Slate structure
      if (!isValidCleanSlateUser(user)) {
        console.log('🔄 Auto-migrating user to Clean Slate during RBAC initialization:', userId);
        
        // Auto-migrate legacy user
        const cleanSlateUser = migrateToOrthogonalSystem(user);
        
        if (!cleanSlateUser?.access) {
          throw new Error('Failed to migrate user to Clean Slate structure');
        }

        // Update Redux with migrated user
        dispatch(updateUserAccess(userId, cleanSlateUser.access));
        
        console.log('✅ User migrated to Clean Slate successfully');
      }

      // Generate permissions using Clean Slate system
      const rbacData = generateUserPermissions(user.access ? user : { access: user.access });
      
      if (rbacData) {
        dispatch(setUserPermissions(userId, rbacData.permissions, rbacData.geographic));
        
        // Set user role based on Clean Slate structure
        dispatch(setUserRole(
          userId, 
          user.access.authority, 
          user.access.geographic, 
          user.access.departments
        ));
      }

      dispatch(rbacInitialized());
      
    } catch (error) {
      console.error('Error initializing user RBAC:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Update User RBAC - Clean Slate Only
 * Updates user's RBAC data and clears permission cache
 */
export const updateUserRBAC = (userId, rbacUpdates) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));
      
      // Validate updates have Clean Slate structure
      if (rbacUpdates.access && !rbacUpdates.access.authority) {
        throw new Error('Invalid Clean Slate structure - missing authority');
      }

      // Update local state
      dispatch(updateUserAccess(userId, rbacUpdates));
      
      // Clear access cache since permissions changed
      dispatch(clearAccessCache());
      
      console.log('✅ User RBAC updated successfully:', userId);
      
    } catch (error) {
      console.error('Error updating user RBAC:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Assign User to Province - Clean Slate Structure
 * Creates Clean Slate access with province-level scope
 */
export const assignUserToProvince = (userId, provinceId, authority = AUTHORITY_LEVELS.STAFF) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));

      // Validate authority level
      if (!Object.values(AUTHORITY_LEVELS).includes(authority)) {
        throw new Error(`Invalid authority level: ${authority}`);
      }

      // Create Clean Slate geographic structure
      const geographic = createGeographicStructure(GEOGRAPHIC_SCOPE.PROVINCE, {
        allowedProvinces: [provinceId],
        allowedBranches: [],
        homeProvince: provinceId,
        homeBranch: null
      });

      // Create Clean Slate access structure
      const access = createCleanSlateAccess(authority, geographic, [DEPARTMENTS.GENERAL]);

      // Update user RBAC
      dispatch(updateUserRBAC(userId, { access }));
      
      console.log('✅ User assigned to province successfully:', userId, provinceId);
      
    } catch (error) {
      console.error('Error assigning user to province:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Assign User to Branch - Clean Slate Structure  
 * Creates Clean Slate access with branch-level scope
 */
export const assignUserToBranch = (userId, branchCode, provinceId, authority = AUTHORITY_LEVELS.STAFF, departments = [DEPARTMENTS.GENERAL]) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));

      // Validate authority level
      if (!Object.values(AUTHORITY_LEVELS).includes(authority)) {
        throw new Error(`Invalid authority level: ${authority}`);
      }

      // Validate departments
      if (!Array.isArray(departments) || departments.length === 0) {
        throw new Error('Invalid departments array');
      }

      // Create Clean Slate geographic structure
      const geographic = createGeographicStructure(GEOGRAPHIC_SCOPE.BRANCH, {
        allowedProvinces: [provinceId],
        allowedBranches: [branchCode],
        homeProvince: provinceId,
        homeBranch: branchCode
      });

      // Create Clean Slate access structure
      const access = createCleanSlateAccess(authority, geographic, departments);

      // Update user RBAC
      dispatch(updateUserRBAC(userId, { access }));
      
      console.log('✅ User assigned to branch successfully:', userId, branchCode);
      
    } catch (error) {
      console.error('Error assigning user to branch:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Grant Admin Access - Clean Slate Structure
 * Creates Clean Slate access with ALL geographic scope
 */
export const grantAdminAccess = (userId, departments = Object.values(DEPARTMENTS)) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));

      // Create Clean Slate geographic structure for admin (ALL scope)
      const geographic = createGeographicStructure(GEOGRAPHIC_SCOPE.ALL, {
        allowedProvinces: [],
        allowedBranches: [],
        homeProvince: null,
        homeBranch: null
      });

      // Create Clean Slate access structure for admin
      const access = createCleanSlateAccess(AUTHORITY_LEVELS.ADMIN, geographic, departments);

      // Update user RBAC
      dispatch(updateUserRBAC(userId, { access }));
      
      console.log('✅ Admin access granted successfully:', userId);
      
    } catch (error) {
      console.error('Error granting admin access:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Update User Departments - Clean Slate Structure
 * Updates departments in user's Clean Slate access structure
 */
export const updateUserDepartments = (userId, departments) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));

      // Validate departments
      if (!Array.isArray(departments) || departments.length === 0) {
        throw new Error('Invalid departments array');
      }

      const validDepartments = departments.filter(dept => 
        Object.values(DEPARTMENTS).includes(dept)
      );

      if (validDepartments.length === 0) {
        throw new Error('No valid departments provided');
      }

      // Get current user access
      const { auth } = getState();
      const currentAccess = auth.user?.access;

      if (!currentAccess) {
        throw new Error('User has no Clean Slate access structure');
      }

      // Update departments in access structure
      const updatedAccess = {
        ...currentAccess,
        departments: validDepartments,
        updatedAt: Date.now()
      };

      dispatch(updateUserRBAC(userId, { access: updatedAccess }));
      
      console.log('✅ User departments updated successfully:', userId, validDepartments);
      
    } catch (error) {
      console.error('Error updating user departments:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

/**
 * Validate User Access Structure
 * Ensures user has valid Clean Slate structure
 */
export const validateUserAccess = (user) => {
  try {
    if (!user?.access) {
      return { isValid: false, errors: ['Missing access structure'] };
    }
    
    const { authority, geographic, departments } = user.access;
    const errors = [];
    
    // Validate authority
    if (!Object.values(AUTHORITY_LEVELS).includes(authority)) {
      errors.push(`Invalid authority: ${authority}`);
    }
    
    // Validate geographic scope
    if (!geographic || !Object.values(GEOGRAPHIC_SCOPE).includes(geographic.scope)) {
      errors.push(`Invalid geographic scope: ${geographic?.scope}`);
    }
    
    // Validate departments
    if (!Array.isArray(departments) || departments.length === 0) {
      errors.push('Invalid departments array');
    } else {
      const invalidDepts = departments.filter(dept => 
        !Object.values(DEPARTMENTS).includes(dept)
      );
      if (invalidDepts.length > 0) {
        errors.push(`Invalid departments: ${invalidDepts.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
    
  } catch (error) {
    console.error('Error validating user access:', error);
    return { isValid: false, errors: [error.message] };
  }
};

/**
 * Check User Permission - Clean Slate System
 * Uses orthogonal permission checking
 */
export const checkUserPermission = (permission, context = {}) => {
  return (dispatch, getState) => {
    try {
      const { auth } = getState();
      const user = auth.user;

      if (!user) {
        return false;
      }

      // Validate Clean Slate structure
      if (!isValidCleanSlateUser(user)) {
        console.warn('User missing Clean Slate structure for permission check:', user.uid);
        return false;
      }

      // Use orthogonal permission checking
      const hasPermission = hasOrthogonalPermission(user, permission, context);
      
      // Cache the result
      const cacheKey = `${user.uid}_${permission}_${JSON.stringify(context)}`;
      dispatch(setAccessCache(cacheKey, hasPermission));
      
      return hasPermission;
      
    } catch (error) {
      console.error('Error checking user permission:', error);
      dispatch(setRbacError(error.message));
      return false;
    }
  };
};

// Utility exports for components
export {
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS
} from '../../utils/orthogonal-rbac';

