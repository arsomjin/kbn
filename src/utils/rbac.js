/**
 * RBAC (Role-Based Access Control) Utilities
 * For KBN Multi-Province Expansion Phase 1
 */

/**
 * Check if user has a specific permission with context
 */
export const checkPermission = (
  userPermissions,
  requiredPermission,
  context = {}
) => {
  // Super admin check
  if (userPermissions.includes("*")) return true;
  
  // Direct permission check
  if (userPermissions.includes(requiredPermission)) {
    return true; // Additional geographic checks can be added here
  }
  
  return false;
};

/**
 * Check if user has geographic access to a specific location
 */
export const checkGeographicAccess = (user, context) => {
  const { province, branch } = context;
  
  // All access
  if (user.accessLevel === "all") return true;
  
  // Province level access
  if (user.accessLevel === "province") {
    return !province || (user.allowedProvinces || []).includes(province);
  }
  
  // Branch level access  
  if (user.accessLevel === "branch") {
    return !branch || (user.allowedBranches || []).includes(branch);
  }
  
  return false;
};

/**
 * Filter data based on user's geographic access
 */
export const filterDataByAccess = (data, user, dataType) => {
  if (user.accessLevel === "all") return data;
  
  return data.filter((item) => {
    switch (dataType) {
      case "sales":
        return checkGeographicAccess(user, {
          province: item.provinceCode,
          branch: item.branchCode,
        });
      case "customers":
        return checkGeographicAccess(user, {
          province: item.address?.province,
          branch: item.branchCode,
        });
      case "vehicles":
        return checkGeographicAccess(user, {
          province: item.provinceCode,
          branch: item.branchCode,
        });
      case "parts":
        return checkGeographicAccess(user, {
          province: item.provinceCode,
          branch: item.branchCode,
        });
      case "services":
        return checkGeographicAccess(user, {
          province: item.serviceAddress?.province,
          branch: item.branchCode,
        });
      default:
        return true;
    }
  });
};

/**
 * Get user's accessible geographic scope
 */
export const getUserGeographicScope = (user) => {
  return {
    accessLevel: user.accessLevel || "branch",
    provinces: user.allowedProvinces || [],
    branches: user.allowedBranches || [],
    homeProvince: user.homeProvince || null,
    homeBranch: user.homeBranch || null,
  };
};

/**
 * Check if user can access a specific province
 */
export const canAccessProvince = (user, provinceCode) => {
  if (user.accessLevel === "all") return true;
  if (user.accessLevel === "province") {
    return (user.allowedProvinces || []).includes(provinceCode);
  }
  return false;
};

/**
 * Check if user can access a specific branch
 */
export const canAccessBranch = (user, branchCode) => {
  if (user.accessLevel === "all") return true;
  if (user.accessLevel === "branch") {
    return (user.allowedBranches || []).includes(branchCode);
  }
  if (user.accessLevel === "province") {
    // Check if branch belongs to user's allowed provinces
    // This would need branch-province mapping
    return true; // Implement based on branch-province relationship
  }
  return false;
};

/**
 * Predefined access levels
 */
export const ACCESS_LEVELS = {
  SUPER_ADMIN: {
    level: "all",
    description: "ผู้ดูแลระบบสูงสุด",
    permissions: ["*"],
    geographic: { type: "all" },
  },
  PROVINCE_MANAGER: {
    level: "province", 
    description: "ผู้จัดการจังหวัด",
    permissions: [
      "view_province_reports",
      "manage_branches_in_province", 
      "view_all_data_in_province",
      "manage_users_in_province",
    ],
    geographic: { type: "province", restrictions: "allowedProvinces" },
  },
  BRANCH_MANAGER: {
    level: "branch",
    description: "ผู้จัดการสาขา", 
    permissions: [
      "view_branch_reports",
      "manage_branch_operations",
      "view_branch_data",
    ],
    geographic: { type: "branch", restrictions: "allowedBranches" },
  },
  BRANCH_STAFF: {
    level: "branch",
    description: "พนักงานสาขา",
    permissions: ["view_branch_data", "create_sales", "manage_customers"],
    geographic: { type: "branch", restrictions: "allowedBranches" },
  },
}; 