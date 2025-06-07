/**
 * Geographic utility functions for KBN Multi-Province Expansion
 */

// Thailand provinces data structure
export const THAILAND_REGIONS = {
  เหนือ: "ภาคเหนือ",
  อีสาน: "ภาคอีสาน", 
  กลาง: "ภาคกลาง",
  ใต้: "ภาคใต้",
  ตะวันออก: "ภาคตะวันออก",
  ตะวันตก: "ภาคตะวันตก"
};

// Province codes mapping
export const PROVINCE_CODES = {
  "นครราชสีมา": "NMA",
  "นครสวรรค์": "NSN"
};

/**
 * Get province by kebab-case key (primary access method)
 */
export const getProvinceByKey = (provinces, provinceKey) => {
  return provinces[provinceKey];
};

/**
 * Get province by Thai name
 */
export const getProvinceByName = (provinces, provinceName) => {
  return Object.values(provinces).find(province => 
    province.name === provinceName
  );
};

/**
 * Get province by code
 */
export const getProvinceByCode = (provinces, provinceCode) => {
  return Object.values(provinces).find(province => 
    province.code === provinceCode
  );
};

/**
 * Get provinces by region
 */
export const getProvincesByRegion = (provinces, region) => {
  return Object.values(provinces).filter(province => 
    province.region === region
  );
};

/**
 * Get branches in province (using provinceId field that stores kebab-case keys)
 */
export const getBranchesInProvince = (branches, provinceKey) => {
  return Object.values(branches).filter(branch => 
    branch.provinceId === provinceKey
  );
};

/**
 * Check if user can access province (using kebab-case key)
 */
export const canAccessProvince = (user, provinceKey) => {
  if (!user || !user.accessLevel) return true; // Backward compatibility
  
  if (user.accessLevel === "all") return true;
  
  if (user.accessLevel === "province") {
    return (user.allowedProvinces || []).includes(provinceKey);
  }
  
  return false;
};

/**
 * Check if user can access branch
 */
export const canAccessBranch = (user, branchCode, branches = {}) => {
  if (!user || !user.accessLevel) return true; // Backward compatibility
  
  if (user.accessLevel === "all") return true;
  
  if (user.accessLevel === "branch") {
    return (user.allowedBranches || []).includes(branchCode);
  }
  
  if (user.accessLevel === "province") {
    const branch = branches[branchCode];
    if (branch) {
      return (user.allowedProvinces || []).includes(branch.provinceId);
    }
  }
  
  return false;
};

/**
 * Filter data by geographic access
 */
export const filterDataByGeographicAccess = (data, user, getLocationFn) => {
  if (!user || !user.accessLevel || user.accessLevel === "all") {
    return data;
  }
  
  return data.filter(item => {
    const location = getLocationFn(item);
    
    if (user.accessLevel === "province" && location.province) {
      return (user.allowedProvinces || []).includes(location.province);
    }
    
    if (user.accessLevel === "branch" && location.branch) {
      return (user.allowedBranches || []).includes(location.branch);
    }
    
    return true;
  });
};

/**
 * Get user's geographic scope summary
 */
export const getUserGeographicScope = (user, provinces = {}, branches = {}) => {
  if (!user || !user.accessLevel) {
    return {
      level: "all",
      provinces: Object.keys(provinces),
      branches: Object.keys(branches),
      description: "ทุกจังหวัดและสาขา"
    };
  }
  
  if (user.accessLevel === "all") {
    return {
      level: "all",
      provinces: Object.keys(provinces),
      branches: Object.keys(branches), 
      description: "ทุกจังหวัดและสาขา"
    };
  }
  
  if (user.accessLevel === "province") {
    const allowedProvinces = user.allowedProvinces || [];
    const allowedBranches = Object.keys(branches).filter(branchCode => {
      const branch = branches[branchCode];
      return branch && allowedProvinces.includes(branch.provinceId);
    });
    
    return {
      level: "province",
      provinces: allowedProvinces,
      branches: allowedBranches,
      description: `จังหวัด: ${allowedProvinces.join(", ")}`
    };
  }
  
  if (user.accessLevel === "branch") {
    const allowedBranches = user.allowedBranches || [];
    const allowedProvinces = [...new Set(allowedBranches.map(branchCode => {
      const branch = branches[branchCode];
      return branch ? branch.provinceId : null;
    }).filter(Boolean))];
    
    return {
      level: "branch", 
      provinces: allowedProvinces,
      branches: allowedBranches,
      description: `สาขา: ${allowedBranches.join(", ")}`
    };
  }
  
  return {
    level: "none",
    provinces: [],
    branches: [],
    description: "ไม่มีสิทธิ์เข้าถึง"
  };
}; 