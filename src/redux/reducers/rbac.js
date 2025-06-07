/**
 * RBAC Reducer for KBN Multi-Province System
 * Manages Role-Based Access Control with Geographic Restrictions
 */

import {
  SET_USER_PERMISSIONS,
  SET_USER_ROLE,
  SET_GEOGRAPHIC_ACCESS,
  UPDATE_USER_ACCESS,
  CHECK_PERMISSION,
  SET_ACCESS_CACHE,
  CLEAR_ACCESS_CACHE,
  SET_RBAC_LOADING,
  SET_RBAC_ERROR,
  ACCESS_LEVELS
} from '../actions/rbac';

const initialState = {
  // User permissions and roles
  userPermissions: {},
  userRoles: {},
  userGeographic: {},
  
  // Permission cache for performance
  accessCache: {},
  
  // Loading states
  loading: false,
  error: null,
  
  // Current user context (derived from auth)
  currentUserRBAC: null,
  
  // Available access levels
  accessLevels: ACCESS_LEVELS,
  
  // Last updated timestamp
  lastUpdated: null
};

const rbacReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RBAC_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SET_RBAC_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case SET_USER_PERMISSIONS: {
      const { userId, permissions, geographic } = action.payload;
      
      return {
        ...state,
        userPermissions: {
          ...state.userPermissions,
          [userId]: permissions
        },
        userGeographic: geographic ? {
          ...state.userGeographic,
          [userId]: geographic
        } : state.userGeographic,
        lastUpdated: Date.now()
      };
    }

    case SET_USER_ROLE: {
      const { userId, role, config } = action.payload;
      
      return {
        ...state,
        userRoles: {
          ...state.userRoles,
          [userId]: { role, config }
        },
        // Auto-set permissions from role config
        userPermissions: config ? {
          ...state.userPermissions,
          [userId]: config.permissions
        } : state.userPermissions,
        lastUpdated: Date.now()
      };
    }

    case SET_GEOGRAPHIC_ACCESS: {
      const { userId, geographic } = action.payload;
      
      return {
        ...state,
        userGeographic: {
          ...state.userGeographic,
          [userId]: geographic
        },
        lastUpdated: Date.now()
      };
    }

    case UPDATE_USER_ACCESS: {
      const { userId, updates } = action.payload;
      
      const updatedState = { ...state };
      
      if (updates.permissions) {
        updatedState.userPermissions = {
          ...state.userPermissions,
          [userId]: updates.permissions
        };
      }
      
      if (updates.role) {
        updatedState.userRoles = {
          ...state.userRoles,
          [userId]: updates.role
        };
      }
      
      if (updates.geographic) {
        updatedState.userGeographic = {
          ...state.userGeographic,
          [userId]: updates.geographic
        };
      }
      
      updatedState.lastUpdated = Date.now();
      
      return updatedState;
    }

    case SET_ACCESS_CACHE: {
      const { cacheKey, result } = action.payload;
      
      return {
        ...state,
        accessCache: {
          ...state.accessCache,
          [cacheKey]: {
            result,
            timestamp: Date.now()
          }
        }
      };
    }

    case CLEAR_ACCESS_CACHE:
      return {
        ...state,
        accessCache: {}
      };

    case CHECK_PERMISSION: {
      // This is handled synchronously but can be used for tracking
      return state;
    }

    default:
      return state;
  }
};

// Selectors
export const getUserPermissions = (state, userId) => 
  state.rbac.userPermissions[userId] || [];

export const getUserRole = (state, userId) => 
  state.rbac.userRoles[userId] || null;

export const getUserGeographic = (state, userId) => 
  state.rbac.userGeographic[userId] || null;

export const getRbacLoading = (state) => state.rbac.loading;

export const getRbacError = (state) => state.rbac.error;

export const getAccessCache = (state, cacheKey) => 
  state.rbac.accessCache[cacheKey] || null;

export const getCurrentUserRBAC = (state) => {
  const { auth } = state;
  
  if (!auth?.user?.uid) return null;
  
  const userId = auth.user.uid;
  const userRoleObj = getUserRole(state, userId);
  
  return {
    userId,
    permissions: getUserPermissions(state, userId),
    role: userRoleObj?.role || userRoleObj, // Extract role string from object or use directly if string
    geographic: getUserGeographic(state, userId)
  };
};

export const hasPermission = (state, userId, permission, context = {}) => {
  const permissions = getUserPermissions(state, userId);
  const geographic = getUserGeographic(state, userId);
  
  // Super admin check
  if (permissions.includes('*')) return true;
  
  // Direct permission check
  if (!permissions.includes(permission)) return false;
  
  // Geographic access check
  if (context.province && geographic?.allowedProvinces) {
    if (!geographic.allowedProvinces.includes(context.province)) return false;
  }
  
  if (context.branch && geographic?.allowedBranches) {
    if (!geographic.allowedBranches.includes(context.branch)) return false;
  }
  
  return true;
};

export const getAccessibleProvinces = (state, userId) => {
  const geographic = getUserGeographic(state, userId);
  
  if (!geographic) return [];
  
  if (geographic.accessLevel === 'all') {
    // Return all active provinces
    return state.provinces?.activeProvinces || [];
  }
  
  return geographic.allowedProvinces || [];
};

export const getAccessibleBranches = (state, userId) => {
  const geographic = getUserGeographic(state, userId);
  
  if (!geographic) return [];
  
  if (geographic.accessLevel === 'all') {
    // Return all branches from all provinces
    const { provinces } = state.provinces || {};
    const allBranches = [];
    
    Object.values(provinces || {}).forEach(province => {
      if (province.branches) {
        allBranches.push(...province.branches);
      }
    });
    
    return allBranches;
  }
  
  if (geographic.accessLevel === 'province') {
    // Return all branches from allowed provinces
    const { provinces } = state.provinces || {};
    const provinceBranches = [];
    
    (geographic.allowedProvinces || []).forEach(provinceKey => {
      const province = provinces[provinceKey];
      if (province?.branches) {
        provinceBranches.push(...province.branches);
      }
    });
    
    return provinceBranches;
  }
  
  return geographic.allowedBranches || [];
};

export const canAccessProvince = (state, userId, provinceKey) => {
  const geographic = getUserGeographic(state, userId);
  
  if (!geographic) return false;
  
  if (geographic.accessLevel === 'all') return true;
  
  return (geographic.allowedProvinces || []).includes(provinceKey);
};

export const canAccessBranch = (state, userId, branchCode) => {
  const geographic = getUserGeographic(state, userId);
  
  if (!geographic) return false;
  
  if (geographic.accessLevel === 'all') return true;
  
  if (geographic.accessLevel === 'province') {
    // Check if branch belongs to allowed province
    const { provinces } = state.provinces || {};
    
    for (const provinceKey of geographic.allowedProvinces || []) {
      const province = provinces[provinceKey];
      if (province?.branches?.includes(branchCode)) {
        return true;
      }
    }
    
    return false;
  }
  
  return (geographic.allowedBranches || []).includes(branchCode);
};

export default rbacReducer; 