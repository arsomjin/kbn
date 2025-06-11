/**
 * Clean Slate RBAC Actions
 * Simplified role-based access control using orthogonal system
 */

import { 
  AUTHORITY_LEVELS, 
  GEOGRAPHIC_SCOPE, 
  DEPARTMENTS,
  generateUserPermissions,
  hasOrthogonalPermission,
  migrateToOrthogonalSystem,
  getLegacyRoleName,
  getUserRoleDescription
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

// Clean Slate Access Level Mappings (replaces legacy ACCESS_LEVELS)
export const ACCESS_LEVELS = {
  // Admin levels
  ADMIN: {
    level: 'all',
    description: 'ผู้ดูแลระบบ',
    authority: AUTHORITY_LEVELS.ADMIN,
    geographic: { scope: GEOGRAPHIC_SCOPE.ALL }
  },
  
  // Manager levels  
  PROVINCE_MANAGER: {
    level: 'province',
    description: 'ผู้จัดการจังหวัด',
    authority: AUTHORITY_LEVELS.MANAGER,
    geographic: { scope: GEOGRAPHIC_SCOPE.PROVINCE }
  },
  
  BRANCH_MANAGER: {
    level: 'branch',
    description: 'ผู้จัดการสาขา',
    authority: AUTHORITY_LEVELS.MANAGER,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH }
  },
  
  // Lead levels
  DEPARTMENT_LEAD: {
    level: 'branch',
    description: 'หัวหน้าแผนก',
    authority: AUTHORITY_LEVELS.LEAD,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH }
  },
  
  // Staff levels
  STAFF: {
    level: 'branch',
    description: 'พนักงาน',
    authority: AUTHORITY_LEVELS.STAFF,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH }
  },

  // Legacy role mappings (deprecated)
  SUPER_ADMIN: {
    level: 'all',
    description: 'ผู้ดูแลระบบสูงสุด (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.ADMIN,
    geographic: { scope: GEOGRAPHIC_SCOPE.ALL },
    deprecated: true
  },
  
  EXECUTIVE: {
    level: 'all', 
    description: 'ผู้บริหารระดับสูง (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.ADMIN,
    geographic: { scope: GEOGRAPHIC_SCOPE.ALL },
    isExecutive: true,
    deprecated: true
  },
  
  ACCOUNTING_STAFF: {
    level: 'branch',
    description: 'พนักงานบัญชี (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.STAFF,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH },
    departments: [DEPARTMENTS.ACCOUNTING],
    deprecated: true
  },
  
  SALES_STAFF: {
    level: 'branch',
    description: 'พนักงานขาย (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.STAFF,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH },
    departments: [DEPARTMENTS.SALES],
    deprecated: true
  },
  
  SERVICE_STAFF: {
    level: 'branch',
    description: 'พนักงานบริการ (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.STAFF,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH },
    departments: [DEPARTMENTS.SERVICE],
    deprecated: true
  },
  
  INVENTORY_STAFF: {
    level: 'branch',
    description: 'พนักงานคลัง (เลิกใช้แล้ว)',
    authority: AUTHORITY_LEVELS.STAFF,
    geographic: { scope: GEOGRAPHIC_SCOPE.BRANCH },
    departments: [DEPARTMENTS.INVENTORY],
    deprecated: true
  }
};

// Action Creators
export const setUserPermissions = (userId, permissions, geographic = null) => ({
  type: SET_USER_PERMISSIONS,
  payload: { userId, permissions, geographic }
});

export const setUserRole = (userId, role, roleConfig = null) => ({
  type: SET_USER_ROLE,
  payload: { 
    userId, 
    role, 
    config: roleConfig || ACCESS_LEVELS[role] || null 
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

// Clean Slate Permission Check Action
export const checkPermission = (permission, context = {}) => ({
  type: CHECK_PERMISSION,
  payload: { permission, context }
});

// Async Action Creators (Thunks)
export const initializeUserRBAC = (userId) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));
      
      const { auth } = getState();
      
      if (auth.user) {
        // Use unified Clean Slate migration
        const { migrateUserToCleanSlate, getUserRBACData } = await import('../../utils/unified-migration');
        
        const cleanSlateUser = migrateUserToCleanSlate(auth.user);
        const rbacData = getUserRBACData(cleanSlateUser);
        
        if (rbacData && cleanSlateUser) {
          dispatch(setUserPermissions(userId, rbacData.permissions, rbacData.geographic));
          dispatch(setUserRole(userId, getLegacyRoleName(cleanSlateUser)));
        }
      }
    } catch (error) {
      console.error('Error initializing user RBAC:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

export const updateUserRBAC = (userId, rbacUpdates) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));
      
      // Update local state
      dispatch(updateUserAccess(userId, rbacUpdates));
      
      // Clear access cache since permissions changed
      dispatch(clearAccessCache());
      
    } catch (error) {
      console.error('Error updating user RBAC:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

export const assignUserToProvince = (userId, provinceKey, authority = 'STAFF') => {
  return async (dispatch, getState) => {
    try {
      const accessLevel = ACCESS_LEVELS[authority];
      if (!accessLevel) {
        throw new Error(`Invalid authority level: ${authority}`);
      }

      const geographic = {
        scope: GEOGRAPHIC_SCOPE.PROVINCE,
        allowedProvinces: [provinceKey],
        allowedBranches: [],
        homeProvince: provinceKey,
        homeBranch: null
      };

      dispatch(setUserRole(userId, authority, accessLevel));
      dispatch(setGeographicAccess(userId, geographic));
      
      // Create Clean Slate user structure
      const rbacUpdates = {
        access: {
          authority: accessLevel.authority,
          geographic,
          departments: accessLevel.departments || [DEPARTMENTS.GENERAL]
        }
      };
      
      dispatch(updateUserRBAC(userId, rbacUpdates));
    } catch (error) {
      console.error('Error assigning user to province:', error);
      dispatch(setRbacError(error.message));
    }
  };
};

export const assignUserToBranch = (userId, branchCode, provinceKey, authority = 'STAFF', departments = [DEPARTMENTS.GENERAL]) => {
  return async (dispatch, getState) => {
    try {
      const accessLevel = ACCESS_LEVELS[authority];
      if (!accessLevel) {
        throw new Error(`Invalid authority level: ${authority}`);
      }

      const geographic = {
        scope: GEOGRAPHIC_SCOPE.BRANCH,
        allowedProvinces: [provinceKey],
        allowedBranches: [branchCode],
        homeProvince: provinceKey,
        homeBranch: branchCode
      };

      dispatch(setUserRole(userId, authority, accessLevel));
      dispatch(setGeographicAccess(userId, geographic));
      
      // Create Clean Slate user structure
      const rbacUpdates = {
        access: {
          authority: accessLevel.authority,
          geographic,
          departments: departments
        }
      };
      
      dispatch(updateUserRBAC(userId, rbacUpdates));
    } catch (error) {
      console.error('Error assigning user to branch:', error);
      dispatch(setRbacError(error.message));
    }
  };
};

// Clean Slate RBAC Helpers
export const createUserAccess = (authority, geographic, departments = [DEPARTMENTS.GENERAL]) => {
  return {
    access: {
      authority,
      geographic,
      departments,
      createdAt: new Date().toISOString(),
      version: '2.0' // Clean Slate version
    }
  };
};

export const validateUserAccess = (user) => {
  try {
    if (!user?.access) return false;
    
    const { authority, geographic, departments } = user.access;
    
    // Validate authority
    if (!Object.values(AUTHORITY_LEVELS).includes(authority)) return false;
    
    // Validate geographic scope
    if (!Object.values(GEOGRAPHIC_SCOPE).includes(geographic?.scope)) return false;
    
    // Validate departments
    if (!Array.isArray(departments) || departments.length === 0) return false;
    
    return true;
  } catch (error) {
    console.error('Error validating user access:', error);
    return false;
  }
};

// Legacy support functions (deprecated)
export const migrateFromLegacyRole = (legacyRole, geographic = {}) => {
  console.warn(`migrateFromLegacyRole is deprecated. Legacy role: ${legacyRole}`);
  
  // Map legacy roles to Clean Slate structure
  switch (legacyRole) {
    case 'SUPER_ADMIN':
    case 'EXECUTIVE':
      return createUserAccess(AUTHORITY_LEVELS.ADMIN, { scope: GEOGRAPHIC_SCOPE.ALL });
    case 'PROVINCE_MANAGER':
      return createUserAccess(AUTHORITY_LEVELS.MANAGER, { scope: GEOGRAPHIC_SCOPE.PROVINCE, ...geographic });
    case 'BRANCH_MANAGER':
      return createUserAccess(AUTHORITY_LEVELS.MANAGER, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic });
    case 'ACCOUNTING_STAFF':
      return createUserAccess(AUTHORITY_LEVELS.STAFF, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic }, [DEPARTMENTS.ACCOUNTING]);
    case 'SALES_STAFF':
      return createUserAccess(AUTHORITY_LEVELS.STAFF, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic }, [DEPARTMENTS.SALES]);
    case 'SERVICE_STAFF':
      return createUserAccess(AUTHORITY_LEVELS.STAFF, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic }, [DEPARTMENTS.SERVICE]);
    case 'INVENTORY_STAFF':
      return createUserAccess(AUTHORITY_LEVELS.STAFF, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic }, [DEPARTMENTS.INVENTORY]);
    default:
      return createUserAccess(AUTHORITY_LEVELS.STAFF, { scope: GEOGRAPHIC_SCOPE.BRANCH, ...geographic });
  }
};

/**
 * DEPRECATION NOTICE
 * 
 * Legacy role patterns are deprecated:
 * - SUPER_ADMIN → ADMIN with ALL scope
 * - PROVINCE_MANAGER → MANAGER with PROVINCE scope
 * - BRANCH_MANAGER → MANAGER with BRANCH scope
 * - *_STAFF → STAFF with specific departments
 * 
 * Use Clean Slate RBAC patterns instead:
 * - createUserAccess(authority, geographic, departments)
 * - validateUserAccess(user)
 * - generateUserPermissions(user)
 */ 