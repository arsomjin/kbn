import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  setUserPermissions,
  setGeographicAccess,
  updateUserRole,
  setRbacLoading,
  setRbacError
} from "redux/actions/rbac";
import {
  updateUserRBAC,
  getUserRBAC,
  setUserPermissions as setUserPermissionsAPI,
  setUserGeographicAccess,
  getUsersByAccessLevel,
  getUsersByProvince,
  assignUserRBAC,
  removeUserRBAC,
  bulkAssignRBAC,
  updateUserAccess
} from "firebase/api";

export const useRBAC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const rbacState = useSelector((state) => state.rbac);
  const { provinces } = useSelector((state) => state.provinces);
  const { branches } = useSelector((state) => state.data);

  // Update user RBAC data
  const updateUserRBACData = useCallback(async (userId, rbacData) => {
    try {
      dispatch(setRbacLoading(true));
      
      // Update in Firebase
      await updateUserRBAC(userId, rbacData);
      
      // Update Redux state
      if (rbacData.permissions) {
        dispatch(setUserPermissions(userId, rbacData.permissions, {
          accessLevel: rbacData.accessLevel,
          allowedProvinces: rbacData.allowedProvinces,
          allowedBranches: rbacData.allowedBranches
        }));
      }
      
      if (rbacData.accessLevel) {
        dispatch(setGeographicAccess(
          userId,
          rbacData.accessLevel,
          rbacData.allowedProvinces || [],
          rbacData.allowedBranches || []
        ));
      }
      
      if (rbacData.role) {
        dispatch(updateUserRole(userId, rbacData.role, rbacData.permissions || []));
      }
      
      dispatch(setRbacLoading(false));
      return { success: true };
      
    } catch (error) {
      dispatch(setRbacError(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Get user RBAC data
  const getUserRBACData = useCallback(async (userId) => {
    try {
      dispatch(setRbacLoading(true));
      const rbacData = await getUserRBAC(userId);
      dispatch(setRbacLoading(false));
      return rbacData;
    } catch (error) {
      dispatch(setRbacError(error.message));
      return null;
    }
  }, [dispatch]);

  // Update user permissions only
  const updatePermissions = useCallback(async (userId, permissions) => {
    try {
      await setUserPermissionsAPI(userId, permissions);
      dispatch(setUserPermissions(userId, permissions, {}));
      return { success: true };
    } catch (error) {
      dispatch(setRbacError(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Update user geographic access only
  const updateGeographicAccess = useCallback(async (userId, accessLevel, provinces, branches) => {
    try {
      await setUserGeographicAccess(userId, accessLevel, provinces, branches);
      dispatch(setGeographicAccess(userId, accessLevel, provinces, branches));
      return { success: true };
    } catch (error) {
      dispatch(setRbacError(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Get users by access level
  const getUsersByLevel = useCallback(async (accessLevel) => {
    try {
      return await getUsersByAccessLevel(accessLevel);
    } catch (error) {
      dispatch(setRbacError(error.message));
      return {};
    }
  }, [dispatch]);

  // Get users by province
  const getUsersByProvinceFn = useCallback(async (provinceKey) => {
    try {
      return await getUsersByProvince(provinceKey);
    } catch (error) {
      console.error("Error getting users by province:", error);
      throw error;
    }
  }, []);

  // Get current user's RBAC data from state
  const currentUserRBAC = useMemo(() => {
    if (!user?.uid) return null;
    
    return {
      permissions: rbacState.userPermissions[user.uid] || {},
      geographic: rbacState.userGeographicAccess[user.uid] || {},
      role: rbacState.userRoles[user.uid] || {}
    };
  }, [user?.uid, rbacState]);

  // Check if current user has RBAC admin permissions
  const isRBACAdmin = useMemo(() => {
    return user?.permissions?.rbac?.admin === true || 
           user?.accessLevel === "SUPER_ADMIN";
  }, [user]);

  // Check if current user can manage users
  const canManageUsers = useMemo(() => {
    return user?.permissions?.users?.manage === true ||
           user?.accessLevel === "SUPER_ADMIN" ||
           user?.accessLevel === "PROVINCE_MANAGER";
  }, [user]);

  // Check if current user can view reports
  const canViewReports = useCallback(() => {
    return user?.permissions?.reports?.view === true ||
           ["SUPER_ADMIN", "PROVINCE_MANAGER", "BRANCH_MANAGER"].includes(user?.accessLevel);
  }, [user]);

  // Legacy admin check for backward compatibility
  const isAdmin = useMemo(() => {
    return user?.accessLevel === "all" || 
           user?.permissions?.includes("*") ||
           user?.role === "SUPER_ADMIN" ||
           user?.accessLevel === "SUPER_ADMIN";
  }, [user]);

  // Geographic access checking
  const canManageProvince = useCallback((provinceKey) => {
    if (user?.accessLevel === "SUPER_ADMIN" || isAdmin) return true;
    if (user?.accessLevel === "PROVINCE_MANAGER" || user?.accessLevel === "province") {
      return user?.allowedProvinces?.includes(provinceKey);
    }
    return false;
  }, [user, isAdmin]);

  const canManageBranch = useCallback((branchCode) => {
    if (user?.accessLevel === "SUPER_ADMIN" || isAdmin) return true;
    
    if (user?.accessLevel === "BRANCH_MANAGER" || user?.accessLevel === "branch") {
      return user?.allowedBranches?.includes(branchCode);
    }
    
    if (user?.accessLevel === "PROVINCE_MANAGER" || user?.accessLevel === "province") {
      const branch = branches?.[branchCode];
      return branch && user?.allowedProvinces?.includes(branch.provinceId);
    }
    
    return false;
  }, [user, branches, isAdmin]);

  const canViewBranch = useCallback((branchCode) => {
    if (user?.accessLevel === "SUPER_ADMIN" || isAdmin) return true;
    
    if (user?.accessLevel === "BRANCH_STAFF") {
      return user?.allowedBranches?.includes(branchCode);
    }
    
    if (user?.accessLevel === "BRANCH_MANAGER") {
      return user?.allowedBranches?.includes(branchCode);
    }
    
    if (user?.accessLevel === "PROVINCE_MANAGER") {
      const branch = branches?.[branchCode];
      return branch && user?.allowedProvinces?.includes(branch.provinceId);
    }
    
    return false;
  }, [user, branches, isAdmin]);

  // Get available provinces for user management
  const getManageableProvinces = useMemo(() => {
    if (isAdmin || user?.accessLevel === "SUPER_ADMIN") return provinces;
    
    if (user?.accessLevel === "province" || user?.accessLevel === "PROVINCE_MANAGER") {
      return Object.keys(provinces)
        .filter(code => user?.allowedProvinces?.includes(code))
        .reduce((acc, code) => {
          acc[code] = provinces[code];
          return acc;
        }, {});
    }
    
    return {};
  }, [user, provinces, isAdmin]);

  // Get available branches for user management
  const getManageableBranches = useMemo(() => {
    if (isAdmin || user?.accessLevel === "SUPER_ADMIN") return branches;
    
    if (user?.accessLevel === "branch" || user?.accessLevel === "BRANCH_MANAGER") {
      return Object.keys(branches)
        .filter(code => user?.allowedBranches?.includes(code))
        .reduce((acc, code) => {
          acc[code] = branches[code];
          return acc;
        }, {});
    }
    
    if (user?.accessLevel === "province" || user?.accessLevel === "PROVINCE_MANAGER") {
      return Object.keys(branches)
        .filter(code => {
          const branch = branches[code];
          return branch && user?.allowedProvinces?.includes(branch.provinceId);
        })
        .reduce((acc, code) => {
          acc[code] = branches[code];
          return acc;
        }, {});
    }
    
    return {};
  }, [user, branches, isAdmin]);

  // Assign RBAC to user
  const assignRBAC = useCallback(async (userId, rbacData) => {
    if (!isRBACAdmin) {
      throw new Error("Insufficient permissions to assign RBAC");
    }
    
    return await assignUserRBAC(userId, rbacData);
  }, [isRBACAdmin]);

  // Remove RBAC from user
  const removeRBAC = useCallback(async (userId) => {
    if (!isRBACAdmin) {
      throw new Error("Insufficient permissions to remove RBAC");
    }
    
    return await removeUserRBAC(userId);
  }, [isRBACAdmin]);

  // Bulk assign RBAC
  const bulkAssignRBACToUsers = useCallback(async (userIds, rbacData) => {
    if (!isRBACAdmin) {
      throw new Error("Insufficient permissions to bulk assign RBAC");
    }
    
    return await bulkAssignRBAC(userIds, rbacData);
  }, [isRBACAdmin]);

  // Update user access
  const updateUserAccessLevel = useCallback(async (userId, accessData) => {
    if (!canManageUsers) {
      throw new Error("Insufficient permissions to update user access");
    }
    
    return await updateUserAccess(userId, accessData);
  }, [canManageUsers]);

  // Get accessible users based on current user's geographic scope
  const getAccessibleUsers = useCallback((allUsers) => {
    if (user?.accessLevel === "SUPER_ADMIN") {
      return allUsers;
    }
    
    if (user?.accessLevel === "PROVINCE_MANAGER") {
      return allUsers.filter(targetUser => {
        return targetUser.allowedProvinces?.some(p => 
          user.allowedProvinces?.includes(p)
        );
      });
    }
    
    if (user?.accessLevel === "BRANCH_MANAGER") {
      return allUsers.filter(targetUser => {
        return targetUser.allowedBranches?.some(b => 
          user.allowedBranches?.includes(b)
        );
      });
    }
    
    return [];
  }, [user]);

  // Permission checking functions
  const hasPermission = useCallback((permission, context = {}) => {
    if (!user || !user.permissions) {
      return false;
    }
    
    const [module, action] = permission.split('.');
    return user.permissions[module]?.[action] === true;
  }, [user]);

  // Role hierarchy checking
  const canManageRole = useCallback((targetRole) => {
    const roleHierarchy = {
      "SUPER_ADMIN": 4,
      "PROVINCE_MANAGER": 3,
      "BRANCH_MANAGER": 2,
      "BRANCH_STAFF": 1
    };
    
    const currentLevel = roleHierarchy[user?.accessLevel] || 0;
    const targetLevel = roleHierarchy[targetRole] || 0;
    
    return currentLevel > targetLevel;
  }, [user]);

  return {
    // State
    rbacState,
    currentUserRBAC,
    loading: rbacState.loading,
    error: rbacState.error,
    
    // User management functions
    updateUserRBACData,
    getUserRBACData,
    updatePermissions,
    updateGeographicAccess,
    
    // Query functions
    getUsersByLevel,
    getUsersByProvinceFn,
    
    // Permission checks
    isAdmin,
    isRBACAdmin,
    canManageUsers,
    canViewReports,
    hasPermission,
    
    // Geographic access
    canManageProvince,
    canManageBranch,
    canViewBranch,
    canManageRole,
    
    // Available data for management
    getManageableProvinces,
    getManageableBranches,
    
    // User management
    getAccessibleUsers,
    
    // RBAC operations
    assignRBAC,
    removeRBAC,
    bulkAssignRBACToUsers,
    updateUserAccessLevel,
    
    // Current user info
    userAccessLevel: user?.accessLevel || "all",
    userProvinces: user?.allowedProvinces || [],
    userBranches: user?.allowedBranches || [],
  };
}; 