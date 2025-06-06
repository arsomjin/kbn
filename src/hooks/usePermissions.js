import { useSelector } from "react-redux";
import { checkPermission, checkGeographicAccess } from "utils/rbac";

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);
  const { branches } = useSelector((state) => state.data);
  
  const hasPermission = (permission, context = {}) => {
    return checkPermission(user.permissions || [], permission, context);
  };
  
  const hasGeographicAccess = (context) => {
    return checkGeographicAccess(user, context);
  };
  
  const getAccessibleBranches = (allBranches) => {
    if (user.accessLevel === "all") return allBranches;
    
    return Object.keys(allBranches)
      .filter((branchCode) => {
        const branch = allBranches[branchCode];
        return hasGeographicAccess({
          province: branch.provinceCode,
          branch: branchCode,
        });
      })
      .reduce((acc, branchCode) => {
        acc[branchCode] = allBranches[branchCode];
        return acc;
      }, {});
  };
  
  const getAccessibleProvinces = (allProvinces) => {
    if (user.accessLevel === "all") return allProvinces;
    
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
          return province.branches?.some(branchCode => 
            user.allowedBranches?.includes(branchCode)
          );
        })
        .reduce((acc, provinceCode) => {
          acc[provinceCode] = allProvinces[provinceCode];
          return acc;
        }, {});
    }
    
    return {};
  };
  
  return {
    hasPermission,
    hasGeographicAccess, 
    getAccessibleBranches,
    getAccessibleProvinces,
    userAccessLevel: user.accessLevel,
    userProvinces: user.allowedProvinces || [],
    userBranches: user.allowedBranches || [],
  };
}; 