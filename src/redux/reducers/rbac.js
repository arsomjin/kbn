/**
 * Clean Slate RBAC Reducer for KBN Multi-Province System
 * Pure Clean Slate RBAC system with no legacy fallback support
 * Aligned with DATA_STRUCTURES_REFERENCE.md version 2.1
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
  RBAC_INITIALIZED,
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS,
} from '../actions/rbac';

/**
 * Helper function to validate Clean Slate user access structure
 * @param {Object} access - Access structure to validate
 * @returns {boolean} - True if valid Clean Slate structure
 */
const isValidCleanSlateAccess = (access) => {
  return !!(
    access?.authority && 
    access?.geographic && 
    Array.isArray(access?.departments)
  );
};

/**
 * Helper function to generate cache key for permissions
 * @param {string} userId - User ID
 * @param {string} permission - Permission string
 * @param {Object} context - Context object
 * @returns {string} - Cache key
 */
const generateCacheKey = (userId, permission, context = {}) => {
  return `${userId}_${permission}_${JSON.stringify(context)}`;
};

const initialState = {
  // Clean Slate user access structures
  userAccess: {}, // Clean Slate access structures keyed by userId
  
  // Generated permissions cache
  userPermissions: {}, // Generated permissions keyed by userId
  
  // Geographic access cache
  userGeographic: {}, // Geographic access keyed by userId
  
  // Permission check cache for performance
  accessCache: {},
  
  // System state
  loading: false,
  error: null,
  initialized: false,
  
  // Performance metrics
  lastUpdated: null,
  cacheHits: 0,
  cacheMisses: 0,
  
  // Clean Slate validation
  validUsers: {}, // Track which users have valid Clean Slate structure
  migrationQueue: [], // Users pending migration
  
  systemPermissions: Object.values(DEPARTMENTS).map(dept => 
    ['view', 'edit', 'create', 'delete', 'approve'].map(action => `${dept}.${action}`)
  ).flat()
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

    case RBAC_INITIALIZED:
      return {
        ...state,
        initialized: true,
        lastUpdated: Date.now()
      };

    case SET_USER_PERMISSIONS: {
      const { userId, permissions, geographic } = action.payload;
      
      return {
        ...state,
        userPermissions: {
          ...state.userPermissions,
          [userId]: Array.isArray(permissions) ? permissions : []
        },
        userGeographic: geographic ? {
          ...state.userGeographic,
          [userId]: geographic
        } : state.userGeographic,
        lastUpdated: Date.now()
      };
    }

    case SET_USER_ROLE: {
      const { userId, access } = action.payload;
      
      // Validate Clean Slate structure
      if (!isValidCleanSlateAccess(access)) {
        console.error('Invalid Clean Slate access structure for user:', userId);
        return {
          ...state,
          error: `Invalid Clean Slate access structure for user ${userId}`
        };
      }
      
      return {
        ...state,
        userAccess: {
          ...state.userAccess,
          [userId]: access
        },
        validUsers: {
          ...state.validUsers,
          [userId]: true
        },
        // Remove from migration queue if present
        migrationQueue: state.migrationQueue.filter(id => id !== userId),
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
      
      // Update Clean Slate access structure
      if (updates.access) {
        if (!isValidCleanSlateAccess(updates.access)) {
          console.error('Invalid Clean Slate access structure in update for user:', userId);
          return {
            ...state,
            error: `Invalid Clean Slate access structure in update for user ${userId}`
          };
        }
        
        updatedState.userAccess = {
          ...state.userAccess,
          [userId]: updates.access
        };
        
        updatedState.validUsers = {
          ...state.validUsers,
          [userId]: true
        };
      }
      
      // Update generated permissions
      if (updates.permissions) {
        updatedState.userPermissions = {
          ...state.userPermissions,
          [userId]: Array.isArray(updates.permissions) ? updates.permissions : []
        };
      }
      
      // Update geographic access
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
            timestamp: Date.now(),
          }
        },
        cacheHits: state.cacheHits + 1
      };
    }

    case CLEAR_ACCESS_CACHE:
      return {
        ...state,
        accessCache: {},
        cacheHits: 0,
        cacheMisses: 0
      };

    case CHECK_PERMISSION: {
      const { permission, context } = action.payload;
      
      return {
        ...state,
        cacheMisses: state.cacheMisses + 1
      };
    }

    case 'ADD_USER_TO_MIGRATION_QUEUE': {
      const { userId } = action.payload;
      
      if (!state.migrationQueue.includes(userId)) {
        return {
          ...state,
          migrationQueue: [...state.migrationQueue, userId]
        };
      }
      
      return state;
    }

    case 'REMOVE_USER_FROM_MIGRATION_QUEUE': {
      const { userId } = action.payload;
      
      return {
        ...state,
        migrationQueue: state.migrationQueue.filter(id => id !== userId)
      };
    }

    case 'CLEAR_RBAC_STATE':
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

// Enhanced Selectors for Clean Slate RBAC

/**
 * Get user's Clean Slate access structure
 */
export const getUserAccess = (state, userId) => 
  state.rbac.userAccess[userId] || null;

/**
 * Get user's generated permissions array
 */
export const getUserPermissions = (state, userId) => 
  state.rbac.userPermissions[userId] || [];

/**
 * Get user's geographic access
 */
export const getUserGeographic = (state, userId) => 
  state.rbac.userGeographic[userId] || null;

/**
 * Check if user has valid Clean Slate structure
 */
export const isUserValidCleanSlate = (state, userId) => 
  state.rbac.validUsers[userId] || false;

/**
 * Get users pending migration
 */
export const getUsersMigrationQueue = (state) => 
  state.rbac.migrationQueue || [];

/**
 * Get RBAC system state
 */
export const getRbacLoading = (state) => state.rbac.loading;
export const getRbacError = (state) => state.rbac.error;
export const isRbacInitialized = (state) => state.rbac.initialized;

/**
 * Get permission cache entry
 */
export const getAccessCache = (state, cacheKey) => 
  state.rbac.accessCache[cacheKey] || null;

/**
 * Get current user's RBAC data (Clean Slate only)
 */
export const getCurrentUserRBAC = (state) => {
  const { auth } = state;
  
  if (!auth?.user?.uid) return null;
  
  const userId = auth.user.uid;
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess) {
    // User needs migration or initialization
    console.warn('Current user missing Clean Slate RBAC structure:', userId);
    return null;
  }
  
  return {
    userId,
    access: userAccess,
    permissions: getUserPermissions(state, userId),
    geographic: getUserGeographic(state, userId),
    isValid: isUserValidCleanSlate(state, userId)
  };
};

/**
 * Check if user has specific permission (Clean Slate)
 */
export const hasPermission = (state, userId, permission, context = {}) => {
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess) {
    console.warn('hasPermission: User missing Clean Slate structure:', userId);
    return false;
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(userId, permission, context);
  const cached = getAccessCache(state, cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < 60000) { // 1 minute cache
    return cached.result;
  }
  
  // Check permissions array
  const permissions = getUserPermissions(state, userId);
  
  // Super admin check
  if (permissions.includes('*')) return true;
  
  // Direct permission check
  if (!permissions.includes(permission)) return false;
  
  // Geographic access check
  const geographic = userAccess.geographic;
  
  if (context.province && geographic?.scope === GEOGRAPHIC_SCOPE.PROVINCE) {
    if (!geographic.allowedProvinces?.includes(context.province)) return false;
  }
  
  if (context.branch && geographic?.scope === GEOGRAPHIC_SCOPE.BRANCH) {
    if (!geographic.allowedBranches?.includes(context.branch)) return false;
  }
  
  return true;
};

/**
 * Get accessible provinces for user (Clean Slate)
 */
export const getAccessibleProvinces = (state, userId) => {
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess?.geographic) return [];
  
  const geographic = userAccess.geographic;
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.ALL) {
    // Return all active provinces from provinces state
    return state.provinces?.activeProvinces || [];
  }
  
  return geographic.allowedProvinces || [];
};

/**
 * Get accessible branches for user (Clean Slate)
 */
export const getAccessibleBranches = (state, userId) => {
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess?.geographic) return [];
  
  const geographic = userAccess.geographic;
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.ALL) {
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
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.PROVINCE) {
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

/**
 * Check if user can access specific province (Clean Slate)
 */
export const canAccessProvince = (state, userId, provinceKey) => {
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess?.geographic) return false;
  
  const geographic = userAccess.geographic;
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.ALL) return true;
  
  return (geographic.allowedProvinces || []).includes(provinceKey);
};

/**
 * Check if user can access specific branch (Clean Slate)
 */
export const canAccessBranch = (state, userId, branchCode) => {
  const userAccess = getUserAccess(state, userId);
  
  if (!userAccess?.geographic) return false;
  
  const geographic = userAccess.geographic;
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.ALL) return true;
  
  if (geographic.scope === GEOGRAPHIC_SCOPE.PROVINCE) {
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

/**
 * Get user's authority level (Clean Slate)
 */
export const getUserAuthority = (state, userId) => {
  const userAccess = getUserAccess(state, userId);
  return userAccess?.authority || null;
};

/**
 * Get user's departments (Clean Slate)
 */
export const getUserDepartments = (state, userId) => {
  const userAccess = getUserAccess(state, userId);
  return userAccess?.departments || [];
};

/**
 * Get system performance metrics
 */
export const getRbacMetrics = (state) => ({
  cacheHits: state.rbac.cacheHits,
  cacheMisses: state.rbac.cacheMisses,
  cacheEfficiency: state.rbac.cacheHits + state.rbac.cacheMisses > 0 
    ? state.rbac.cacheHits / (state.rbac.cacheHits + state.rbac.cacheMisses) * 100 
    : 0,
  validUsers: Object.keys(state.rbac.validUsers).length,
  migrationQueue: state.rbac.migrationQueue.length,
  lastUpdated: state.rbac.lastUpdated
});

export default rbacReducer; 