import { useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { checkPermission, checkGeographicAccess } from "utils/rbac";

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);
  const { branches } = useSelector((state) => state.data);
  
  const hasPermission = useCallback((permission, context = {}) => {
    // Fallback for users without new RBAC structure
    if (!user.permissions && !user.accessLevel) {
      return true; // Default access for backward compatibility
    }
    
    return checkPermission(user.permissions || [], permission, context);
  }, [user.permissions, user.accessLevel]);
  
  const hasGeographicAccess = useCallback((context) => {
    // Fallback for users without new RBAC structure
    if (!user.accessLevel) {
      return true; // Default access for backward compatibility
    }
    
    return checkGeographicAccess(user, context);
  }, [user]);
  
  const getAccessibleBranches = useCallback((allBranches) => {
    // Fallback for users without new RBAC structure
    if (!user.accessLevel || user.accessLevel === "all") {
      return allBranches || {};
    }
    
    if (!allBranches || Object.keys(allBranches).length === 0) {
      return {};
    }
    
    return Object.keys(allBranches)
      .filter((branchCode) => {
        const branch = allBranches[branchCode];
        if (!branch) return false;
        
        return hasGeographicAccess({
          province: branch.provinceCode,
          branch: branchCode,
        });
      })
      .reduce((acc, branchCode) => {
        acc[branchCode] = allBranches[branchCode];
        return acc;
      }, {});
  }, [user.accessLevel, hasGeographicAccess]);
  
  const getAccessibleProvinces = useCallback((allProvinces) => {
    // Fallback for users without new RBAC structure
    if (!user.accessLevel || user.accessLevel === "all") {
      return allProvinces || {};
    }
    
    if (!allProvinces || Object.keys(allProvinces).length === 0) {
      return {};
    }
    
    if (user.accessLevel === "province") {
      return Object.keys(allProvinces)
        .filter((provinceCode) => {
          return user.allowedProvinces?.includes(provinceCode);
        })
        .reduce((acc, provinceCode) => {
          acc[provinceCode] = allProvinces[provinceCode];
          return acc;
        }, {});
    }
    
    // For branch level, get provinces that contain user's branches
    if (user.accessLevel === "branch") {
      return Object.keys(allProvinces)
        .filter((provinceCode) => {
          const province = allProvinces[provinceCode];
          return province?.branches?.some(branchCode => 
            user.allowedBranches?.includes(branchCode)
          );
        })
        .reduce((acc, provinceCode) => {
          acc[provinceCode] = allProvinces[provinceCode];
          return acc;
        }, {});
    }
    
    return {};
  }, [user.accessLevel, user.allowedProvinces, user.allowedBranches]);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    hasPermission,
    hasGeographicAccess, 
    getAccessibleBranches,
    getAccessibleProvinces,
    userAccessLevel: user.accessLevel || "all", // Default to "all" for backward compatibility
    userProvinces: user.allowedProvinces || [],
    userBranches: user.allowedBranches || [],
  }), [
    hasPermission, 
    hasGeographicAccess, 
    getAccessibleBranches, 
    getAccessibleProvinces,
    user.accessLevel,
    user.allowedProvinces,
    user.allowedBranches
  ]);
}; 