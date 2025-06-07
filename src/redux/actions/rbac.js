/**
 * RBAC Actions for KBN Multi-Province System
 * Handles Role-Based Access Control with Geographic Restrictions
 */

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

// RBAC Role Definitions
export const ACCESS_LEVELS = {
  SUPER_ADMIN: {
    level: 'all',
    description: 'ผู้ดูแลระบบสูงสุด',
    permissions: ['*'],
    geographic: { type: 'all' }
  },
  PROVINCE_MANAGER: {
    level: 'province',
    description: 'ผู้จัดการจังหวัด',
    permissions: [
      'view_province_reports',
      'manage_branches_in_province',
      'view_all_data_in_province',
      'manage_users_in_province'
    ],
    geographic: { type: 'province', restrictions: 'allowedProvinces' }
  },
  BRANCH_MANAGER: {
    level: 'branch',
    description: 'ผู้จัดการสาขา',
    permissions: [
      'view_branch_reports',
      'manage_branch_operations',
      'view_branch_data'
    ],
    geographic: { type: 'branch', restrictions: 'allowedBranches' }
  },
  BRANCH_STAFF: {
    level: 'branch',
    description: 'พนักงานสาขา',
    permissions: [
      'view_branch_data',
      'create_sales',
      'manage_customers'
    ],
    geographic: { type: 'branch', restrictions: 'allowedBranches' }
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

// Permission Check Action (synchronous)
export const checkPermission = (permission, context = {}) => ({
  type: CHECK_PERMISSION,
  payload: { permission, context }
});

// Async Action Creators (Thunks)
export const initializeUserRBAC = (userId) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setRbacLoading(true));
      
      const { api } = getState().firebase || {};
      const { auth } = getState();
      
      if (api && api.getUserRBACData && auth.user) {
        const rbacData = await api.getUserRBACData(userId);
        
        if (rbacData) {
          dispatch(setUserPermissions(userId, rbacData.permissions, rbacData.geographic));
          dispatch(setUserRole(userId, rbacData.role));
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
      
      const { api } = getState().firebase || {};
      
      if (api && api.updateUserRBAC) {
        await api.updateUserRBAC(userId, rbacUpdates);
        dispatch(updateUserAccess(userId, rbacUpdates));
        
        // Clear access cache since permissions changed
        dispatch(clearAccessCache());
      }
    } catch (error) {
      console.error('Error updating user RBAC:', error);
      dispatch(setRbacError(error.message));
    } finally {
      dispatch(setRbacLoading(false));
    }
  };
};

export const assignUserToProvince = (userId, provinceKey, role = 'BRANCH_STAFF') => {
  return async (dispatch, getState) => {
    try {
      const roleConfig = ACCESS_LEVELS[role];
      if (!roleConfig) {
        throw new Error(`Invalid role: ${role}`);
      }

      const geographic = {
        accessLevel: roleConfig.level,
        allowedProvinces: roleConfig.level === 'province' || roleConfig.level === 'all' ? [provinceKey] : [],
        allowedBranches: [], // Will be set when branches are assigned
        homeProvince: provinceKey,
        homeBranch: null
      };

      dispatch(setUserRole(userId, role, roleConfig));
      dispatch(setGeographicAccess(userId, geographic));
      
      // Save to Firebase
      const rbacUpdates = {
        role,
        permissions: roleConfig.permissions,
        geographic
      };
      
      dispatch(updateUserRBAC(userId, rbacUpdates));
    } catch (error) {
      console.error('Error assigning user to province:', error);
      dispatch(setRbacError(error.message));
    }
  };
};

export const assignUserToBranch = (userId, branchCode, provinceKey, role = 'BRANCH_STAFF') => {
  return async (dispatch, getState) => {
    try {
      const roleConfig = ACCESS_LEVELS[role];
      if (!roleConfig) {
        throw new Error(`Invalid role: ${role}`);
      }

      const geographic = {
        accessLevel: roleConfig.level,
        allowedProvinces: [provinceKey],
        allowedBranches: [branchCode],
        homeProvince: provinceKey,
        homeBranch: branchCode
      };

      dispatch(setUserRole(userId, role, roleConfig));
      dispatch(setGeographicAccess(userId, geographic));
      
      // Save to Firebase
      const rbacUpdates = {
        role,
        permissions: roleConfig.permissions,
        geographic
      };
      
      dispatch(updateUserRBAC(userId, rbacUpdates));
    } catch (error) {
      console.error('Error assigning user to branch:', error);
      dispatch(setRbacError(error.message));
    }
  };
}; 