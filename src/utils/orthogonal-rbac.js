/**
 * KBN Orthogonal RBAC System
 * Eliminates redundancy by separating authority, geographic, and department concerns
 * 
 * Instead of 50+ mixed roles, uses 4 orthogonal dimensions:
 * - Authority Level (4 types)
 * - Geographic Scope (3 types) 
 * - Department Access (6 types)
 * - Document Actions (4 types)
 */

// 1. AUTHORITY LEVELS - What level of power/responsibility
export const AUTHORITY_LEVELS = {
  ADMIN: {
    name: "ผู้ดูแลระบบ",
    nameTh: "ผู้ดูแลระบบ",
    nameEn: "System Administrator",
    actions: ["VIEW", "EDIT", "APPROVE", "MANAGE", "DELETE"],
    canManageUsers: true,
    canManageSystem: true,
    canManageSettings: true,
    level: 4,
    description: "Full system authority across all functions"
  },
  
  MANAGER: {
    name: "ผู้จัดการ",
    nameTh: "ผู้จัดการ", 
    nameEn: "Manager",
    actions: ["VIEW", "EDIT", "APPROVE"],
    canManageUsers: true,
    canManageSystem: false,
    canManageSettings: false,
    level: 3,
    description: "Management authority within assigned scope"
  },
  
  LEAD: {
    name: "หัวหน้าแผนก",
    nameTh: "หัวหน้าแผนก",
    nameEn: "Department Lead",
    actions: ["VIEW", "EDIT", "REVIEW"],
    canManageUsers: false,
    canManageSystem: false,
    canManageSettings: false,
    level: 2,
    description: "Team leadership within department"
  },
  
  STAFF: {
    name: "พนักงาน",
    nameTh: "พนักงาน",
    nameEn: "Staff",
    actions: ["VIEW", "EDIT"],
    canManageUsers: false,
    canManageSystem: false,
    canManageSettings: false,
    level: 1,
    description: "Operational access only"
  }
};

// 2. GEOGRAPHIC SCOPE - What geographic coverage
export const GEOGRAPHIC_SCOPE = {
  ALL: {
    name: "ทุกจังหวัด",
    nameTh: "ทุกจังหวัด",
    nameEn: "All Provinces",
    access: "all_provinces",
    level: 3,
    description: "Access to all provinces and branches nationwide"
  },
  
  PROVINCE: {
    name: "ระดับจังหวัด",
    nameTh: "ระดับจังหวัด",
    nameEn: "Province Level",
    access: "province_branches", 
    level: 2,
    description: "Access to all branches within assigned provinces"
  },
  
  BRANCH: {
    name: "ระดับสาขา",
    nameTh: "ระดับสาขา",
    nameEn: "Branch Level",
    access: "specific_branches",
    level: 1,
    description: "Access to specific branches only"
  }
};

// 3. DEPARTMENTS - Which business functions
export const DEPARTMENTS = {
  ACCOUNTING: { 
    name: "บัญชีการเงิน", 
    nameTh: "บัญชีการเงิน",
    nameEn: "Accounting & Finance",
    code: "ACC",
    color: "blue"
  },
  SALES: { 
    name: "ขายและลูกค้า", 
    nameTh: "ขายและลูกค้า",
    nameEn: "Sales & Customer",
    code: "SAL",
    color: "green"
  },  
  SERVICE: { 
    name: "บริการซ่อม", 
    nameTh: "บริการซ่อม",
    nameEn: "Service & Repair",
    code: "SVC",
    color: "orange"
  },
  INVENTORY: { 
    name: "คลังสินค้า", 
    nameTh: "คลังสินค้า",
    nameEn: "Inventory & Parts",
    code: "INV",
    color: "purple"
  },
  HR: { 
    name: "ทรัพยากรบุคคล", 
    nameTh: "ทรัพยากรบุคคล",
    nameEn: "Human Resources",
    code: "HR",
    color: "cyan"
  },
  GENERAL: { 
    name: "ทั่วไป", 
    nameTh: "ทั่วไป",
    nameEn: "General",
    code: "GEN",
    color: "gray"
  }
};

// 4. DOCUMENT ACTIONS - What actions can be performed
export const DOCUMENT_ACTIONS = {
  VIEW: { 
    name: "ดูข้อมูล", 
    nameTh: "ดูข้อมูล",
    nameEn: "View",
    level: 1,
    color: "blue"
  },
  EDIT: { 
    name: "แก้ไขข้อมูล", 
    nameTh: "แก้ไขข้อมูล",
    nameEn: "Edit",
    level: 2,
    color: "orange"
  },
  APPROVE: { 
    name: "อนุมัติข้อมูล", 
    nameTh: "อนุมัติข้อมูล",
    nameEn: "Approve",
    level: 3,
    color: "green"
  },
  MANAGE: { 
    name: "จัดการระบบ", 
    nameTh: "จัดการระบบ",
    nameEn: "Manage",
    level: 4,
    color: "red"
  }
};

/**
 * Generate user permissions dynamically based on orthogonal access control
 * @param {Object} user - User object with access property
 * @returns {Object} Generated permissions and geographic access
 */
export const generateUserPermissions = (user) => {
  if (!user?.access) {
    return { permissions: [], geographic: null };
  }

  const { authority, geographic, departments = ['GENERAL'] } = user.access;
  
  const authorityLevel = AUTHORITY_LEVELS[authority];
  const geoScope = GEOGRAPHIC_SCOPE[geographic];
  
  if (!authorityLevel || !geoScope) {
    console.warn('Invalid authority or geographic scope', { authority, geographic });
    return { permissions: [], geographic: null };
  }

  const permissions = [];
  
  // Special case: ADMIN authority with ALL geographic = Super Admin
  if (authority === 'ADMIN' && geographic === 'ALL') {
    permissions.push('*');
  } else {
    // Generate department.action permissions
    departments.forEach(dept => {
      const deptKey = dept.toLowerCase();
      authorityLevel.actions.forEach(action => {
        permissions.push(`${deptKey}.${action.toLowerCase()}`);
      });
    });
    
    // Add special permissions based on authority
    if (authorityLevel.canManageUsers) {
      permissions.push("users.manage", "users.view");
    }
    
    if (authorityLevel.canManageSystem) {
      permissions.push("admin.manage", "admin.view");
    }
    
    // Add reporting permissions for managers and above
    if (authorityLevel.level >= 2) {
      permissions.push("reports.view");
    }
    
    if (authorityLevel.level >= 3) {
      permissions.push("reports.export");
    }
  }
  
  return {
    permissions: [...new Set(permissions)], // Remove duplicates
    geographic: {
      scope: geographic,
      level: geoScope.level,
      provinces: geographic === "ALL" ? null : user.access.assignedProvinces,
      branches: geographic === "BRANCH" ? user.access.assignedBranches : null
    }
  };
};

/**
 * Map new orthogonal system to legacy role names for backward compatibility
 * @param {Object} user - User with access property
 * @returns {string} Legacy role name
 */
export const getLegacyRoleName = (user) => {
  if (!user?.access) return 'STAFF';
  
  const { authority, geographic, departments } = user.access;
  
  // System admin
  if (authority === "ADMIN" && geographic === "ALL") {
    return "SUPER_ADMIN";
  }
  
  // Executive (Admin with specific departments)
  if (authority === "ADMIN" && geographic !== "ALL") {
    return "EXECUTIVE";
  }
  
  // Province manager  
  if (authority === "MANAGER" && geographic === "PROVINCE") {
    return "PROVINCE_MANAGER";
  }
  
  // Branch manager
  if (authority === "MANAGER" && geographic === "BRANCH") {
    return "BRANCH_MANAGER";
  }
  
  // Department staff
  if (authority === "STAFF" && departments && departments.length === 1) {
    return `${departments[0]}_STAFF`;
  }
  
  // Department leads
  if (authority === "LEAD" && departments && departments.length === 1) {
    return `${departments[0]}_LEAD`;
  }
  
  // Multi-department or complex roles
  return "CUSTOM_ROLE";
};

/**
 * Check if user has specific permission using orthogonal system
 * @param {Object} user - User object with access
 * @param {string} permission - Permission to check (e.g., "accounting.edit")
 * @param {Object} context - Geographic context (optional)
 * @returns {boolean}
 */
export const hasOrthogonalPermission = (user, permission, context = {}) => {
  if (!user?.access) return false;
  
  const userPermissions = generateUserPermissions(user);
  
  // Check super admin
  if (userPermissions.permissions.includes('*')) {
    return true;
  }
  
  // Check specific permission
  if (userPermissions.permissions.includes(permission)) {
    // Check geographic constraints if context provided
    if (context.province || context.branch) {
      return checkGeographicAccess(user, context);
    }
    return true;
  }
  
  return false;
};

/**
 * Check if user has geographic access to specified context
 * @param {Object} user - User object with access
 * @param {Object} context - Geographic context { province, branch }
 * @returns {boolean}
 */
export const checkGeographicAccess = (user, context) => {
  if (!user?.access) return false;
  
  const { geographic, assignedProvinces, assignedBranches } = user.access;
  
  // ALL scope - can access anything
  if (geographic === 'ALL') {
    return true;
  }
  
  // PROVINCE scope - check province access
  if (geographic === 'PROVINCE') {
    if (context.province) {
      return !assignedProvinces || assignedProvinces.includes(context.province);
    }
    // If checking branch, need to verify it's in allowed province
    if (context.branch) {
      // This would need branch-to-province mapping logic
      return true; // Simplified for now
    }
    return true;
  }
  
  // BRANCH scope - check specific branch access
  if (geographic === 'BRANCH') {
    if (context.branch) {
      return !assignedBranches || assignedBranches.includes(context.branch);
    }
    return false; // Branch-level users can't access province-level data
  }
  
  return false;
};

/**
 * Create user access object for new system
 * @param {string} authority - Authority level
 * @param {string} geographic - Geographic scope
 * @param {Array} departments - Department array
 * @param {Object} assignments - Geographic assignments
 * @returns {Object} User access object
 */
export const createUserAccess = (authority, geographic, departments, assignments = {}) => {
  return {
    authority,
    geographic,
    departments,
    assignedProvinces: assignments.provinces || [],
    assignedBranches: assignments.branches || [],
    homeBranch: assignments.homeBranch || null,
    effectiveDate: new Date().toISOString().split('T')[0],
    grantedBy: 'system' // Should be actual granting user
  };
};

/**
 * Migration helper: Convert legacy user to orthogonal system
 * @param {Object} legacyUser - Legacy user object
 * @returns {Object} User with new access structure
 */
export const migrateToOrthogonalSystem = (legacyUser) => {
  if (!legacyUser) return null;
  
  // Determine authority level
  let authority = 'STAFF';
  if (legacyUser.accessLevel === 'SUPER_ADMIN' || legacyUser.isDev) {
    authority = 'ADMIN';
  } else if (legacyUser.accessLevel === 'EXECUTIVE') {
    authority = 'ADMIN';
  } else if (legacyUser.accessLevel?.includes('MANAGER')) {
    authority = 'MANAGER';
  } else if (legacyUser.accessLevel?.includes('LEAD')) {
    authority = 'LEAD';
  }
  
  // Determine geographic scope
  let geographic = 'BRANCH';
  if (legacyUser.allowedProvinces?.length > 1 || authority === 'ADMIN') {
    geographic = 'ALL';
  } else if (legacyUser.allowedBranches?.length > 1) {
    geographic = 'PROVINCE';
  }
  
  // Determine departments from legacy permissions or access level
  const departments = determineDepartmentsFromLegacy(legacyUser);
  
  return {
    ...legacyUser,
    access: createUserAccess(
      authority,
      geographic,
      departments,
      {
        provinces: legacyUser.allowedProvinces,
        branches: legacyUser.allowedBranches,
        homeBranch: legacyUser.homeBranch
      }
    ),
    // Keep legacy fields for compatibility
    legacyRole: legacyUser.accessLevel
  };
};

/**
 * Helper to determine departments from legacy user data
 * @param {Object} legacyUser - Legacy user object
 * @returns {Array} Department array
 */
const determineDepartmentsFromLegacy = (legacyUser) => {
  const accessLevel = legacyUser.accessLevel || '';
  const permissions = legacyUser.permissions || [];
  
  // Based on access level
  if (accessLevel.includes('ACCOUNTING')) return ['ACCOUNTING'];
  if (accessLevel.includes('SALES')) return ['SALES'];
  if (accessLevel.includes('SERVICE')) return ['SERVICE'];
  if (accessLevel.includes('INVENTORY')) return ['INVENTORY'];
  if (accessLevel.includes('HR')) return ['HR'];
  
  // Based on permissions (simplified)
  const depts = [];
  if (permissions.some(p => p.includes('accounting'))) depts.push('ACCOUNTING');
  if (permissions.some(p => p.includes('sales'))) depts.push('SALES');
  if (permissions.some(p => p.includes('service'))) depts.push('SERVICE');
  if (permissions.some(p => p.includes('inventory'))) depts.push('INVENTORY');
  if (permissions.some(p => p.includes('hr'))) depts.push('HR');
  
  return depts.length > 0 ? depts : ['GENERAL'];
};

/**
 * Get user's effective role description
 * @param {Object} user - User with access property
 * @returns {string} Human-readable role description
 */
export const getUserRoleDescription = (user) => {
  if (!user?.access) return 'ไม่ระบุตำแหน่ง';
  
  const { authority, geographic, departments } = user.access;
  
  const authorityName = AUTHORITY_LEVELS[authority]?.nameTh || authority;
  const geoName = GEOGRAPHIC_SCOPE[geographic]?.nameTh || geographic;
  const deptNames = departments?.map(d => DEPARTMENTS[d]?.nameTh || d).join(', ') || 'ทั่วไป';
  
  return `${authorityName}${geographic !== 'ALL' ? ` (${geoName})` : ''} - ${deptNames}`;
};

// Export all constants and functions
export default {
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS,
  DOCUMENT_ACTIONS,
  generateUserPermissions,
  getLegacyRoleName,
  hasOrthogonalPermission,
  checkGeographicAccess,
  createUserAccess,
  migrateToOrthogonalSystem,
  getUserRoleDescription
}; 