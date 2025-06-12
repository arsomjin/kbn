/**
 * 1. ORTHOGONAL RBAC SYSTEM FOR KBN
 * Clean, systematic approach with 4 dimensions:
 * Authority × Geographic × Departments × Actions = Complete Permission System
 */

// 1. AUTHORITY LEVELS - What level of power/responsibility
const AUTHORITY_LEVELS = {
  ADMIN: {
    name: "ผู้ดูแลระบบ",
    nameTh: "ผู้ดูแลระบบ",
    nameEn: "System Administrator", 
    actions: ["VIEW", "EDIT", "APPROVE", "MANAGE"],
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
const GEOGRAPHIC_SCOPE = {
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
const DEPARTMENTS = {
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
const DOCUMENT_ACTIONS = {
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
const generateUserPermissions = (user) => {
  if (!user?.access) {
    return { permissions: [], geographic: null };
  }
  console.log('[generateUserPermissions] user.access', user.access);
  const { authority, geographic, departments = ['GENERAL'] } = user.access;
  
  // DEBUG: Enhanced logging for permission generation
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Permission Generation Debug:', {
      authority,
      geographic,
      departments,
      authorityObj: AUTHORITY_LEVELS[authority],
      geographicType: typeof geographic
    });
  }
  
  // Handle both new geographic object structure and legacy string format
  let geoScope;
  let geoScopeKey;
  
  if (typeof geographic === 'string') {
    // Legacy format: geographic is a string like "BRANCH", "PROVINCE", "ALL"
    geoScopeKey = geographic;
    geoScope = GEOGRAPHIC_SCOPE[geographic];
  } else if (geographic && typeof geographic === 'object' && geographic.scope) {
    // New format: geographic is an object with scope property
    geoScopeKey = geographic.scope;
    geoScope = GEOGRAPHIC_SCOPE[geographic.scope];
  } else {
    console.warn('Invalid geographic structure - expected string or object with scope property', { geographic });
    
    // FALLBACK: Default to BRANCH scope for regular users, ALL for admins
    geoScopeKey = authority === 'ADMIN' ? 'ALL' : 'BRANCH';
    geoScope = GEOGRAPHIC_SCOPE[geoScopeKey];
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Using fallback geographic scope: ${geoScopeKey} for authority: ${authority}`);
    }
  }
  
  const authorityLevel = AUTHORITY_LEVELS[authority];
  
  if (!authorityLevel || !geoScope) {
    console.warn('Invalid authority or geographic scope', { authority, geographic: geoScopeKey });
    return { permissions: [], geographic: null };
  }

  const permissions = [];
  
  // Special case: ADMIN authority with ALL geographic = Super Admin
  if (authority === 'ADMIN' && geoScopeKey === 'ALL') {
    permissions.push('*');
  } else {
    // Generate department.action permissions
    departments.forEach(dept => {
      const deptKey = dept.toLowerCase();
      authorityLevel.actions.forEach(action => {
        const permission = `${deptKey}.${action.toLowerCase()}`;
        permissions.push(permission);
        
        // DEBUG: Log each permission being generated
        if (process.env.NODE_ENV === 'development' && deptKey === 'accounting') {
          console.log(`🔍 Generated permission: ${permission} for dept: ${dept}, action: ${action}`);
        }
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
      permissions.push("reports.approve");
    }
  }

  // DEBUG: Log final permissions array
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Final Generated Permissions:', permissions);
  }

  return {
    permissions,
    geographic: {
      scope: geoScopeKey,
      level: geoScope.level,
      access: geoScope.access,
      // Preserve original geographic object if it was an object
      ...(typeof geographic === 'object' ? { 
        homeProvince: geographic.homeProvince,
        homeBranch: geographic.homeBranch,
        allowedProvinces: geographic.allowedProvinces,
        allowedBranches: geographic.allowedBranches
      } : {})
    },
    authority: {
      level: authority,
      actions: authorityLevel.actions,
      canManageUsers: authorityLevel.canManageUsers,
      canManageSystem: authorityLevel.canManageSystem
    }
  };
};

/**
 * Get legacy role name from new orthogonal structure (for backward compatibility)
 * @param {Object} user - User object with new access structure
 * @returns {string} Legacy role name
 */
const getLegacyRoleName = (user) => {
  if (!user?.access) return 'STAFF';
  
  const { authority, geographic, departments } = user.access;
  
  // Extract scope from geographic (handle both string and object formats)
  const scope = typeof geographic === 'string' ? geographic : geographic?.scope;
  
  // Super admin case
  if (authority === 'ADMIN' && scope === 'ALL') {
    return 'SUPER_ADMIN';
  }
  
  // Executive case (preserved for special users)
  if (authority === 'ADMIN' && user.isExecutive) {
    return 'EXECUTIVE';
  }
  
  // Manager cases
  if (authority === 'MANAGER') {
    if (scope === 'ALL') return 'PROVINCE_MANAGER';
    if (scope === 'PROVINCE') return 'PROVINCE_MANAGER';
    if (scope === 'BRANCH') return 'BRANCH_MANAGER';
  }
  
  // Department-specific roles
  if (departments.length === 1) {
    const dept = departments[0];
    switch (dept) {
      case 'ACCOUNTING': return 'ACCOUNTING_STAFF';
      case 'SALES': return 'SALES_STAFF';
      case 'SERVICE': return 'SERVICE_STAFF';
      case 'INVENTORY': return 'INVENTORY_STAFF';
      case 'HR': return 'HR_STAFF';
      default: return 'STAFF';
    }
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
const hasOrthogonalPermission = (user, permission, context = {}) => {
  if (!user?.access) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ hasOrthogonalPermission: No user access for ${permission}`);
    }
    return false;
  }
  
  const userPermissions = generateUserPermissions(user);
  
  // DEBUG: Enhanced permission checking logging
  if (process.env.NODE_ENV === 'development' && permission.startsWith('accounting.')) {
    console.log(`🔍 Permission Check Debug for ${permission}:`, {
      userHasAccess: !!user?.access,
      userPermissions: userPermissions.permissions,
      hasWildcard: userPermissions.permissions.includes('*'),
      hasSpecific: userPermissions.permissions.includes(permission),
      context
    });
  }
  
  // Check super admin
  if (userPermissions.permissions.includes('*')) {
    if (process.env.NODE_ENV === 'development' && permission.startsWith('accounting.')) {
      console.log(`✅ hasOrthogonalPermission: Super admin access for ${permission}`);
    }
    return true;
  }
  
  // Check specific permission
  if (userPermissions.permissions.includes(permission)) {
    // Check geographic constraints if context provided
    if (context.province || context.branch) {
      const geoAccess = checkGeographicAccess(user, context);
      if (process.env.NODE_ENV === 'development' && permission.startsWith('accounting.')) {
        console.log(`🔍 hasOrthogonalPermission: Geographic check for ${permission}: ${geoAccess}`);
      }
      return geoAccess;
    }
    
    if (process.env.NODE_ENV === 'development' && permission.startsWith('accounting.')) {
      console.log(`✅ hasOrthogonalPermission: Permission granted for ${permission}`);
    }
    return true;
  }
  
  if (process.env.NODE_ENV === 'development' && permission.startsWith('accounting.')) {
    console.log(`❌ hasOrthogonalPermission: Permission denied for ${permission}`);
  }
  return false;
};

/**
 * Check if user has geographic access to specified context
 * @param {Object} user - User object with access
 * @param {Object} context - Geographic context { province, branch }
 * @returns {boolean}
 */
const checkGeographicAccess = (user, context) => {
  if (!user?.access) return false;
  
  const { geographic, assignedProvinces, assignedBranches } = user.access;
  
  // Extract scope from geographic (handle both string and object formats)
  let scope;
  let allowedProvinces = assignedProvinces;
  let allowedBranches = assignedBranches;
  
  if (typeof geographic === 'string') {
    scope = geographic;
  } else if (geographic && typeof geographic === 'object') {
    scope = geographic.scope;
    // Use geographic object properties if available
    allowedProvinces = allowedProvinces || geographic.allowedProvinces;
    allowedBranches = allowedBranches || geographic.allowedBranches;
  }
  
  // ALL scope - can access anything
  if (scope === 'ALL') {
    return true;
  }
  
  // PROVINCE scope - check province access
  if (scope === 'PROVINCE') {
    if (context.province) {
      return !allowedProvinces || allowedProvinces.includes(context.province);
    }
    // If checking branch, need to verify it's in allowed province
    if (context.branch) {
      // This would need branch-to-province mapping logic
      return true; // Simplified for now
    }
    return true;
  }
  
  // BRANCH scope - check specific branch access
  if (scope === 'BRANCH') {
    if (context.branch) {
      return !allowedBranches || allowedBranches.includes(context.branch);
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
const createUserAccess = (authority, geographic, departments, assignments = {}) => {
  // Helper function to generate department permissions based on authority
  const generateDepartmentPermissions = (deptList, authorityLevel) => {
    const deptPermissions = {};
    
    // Define permissions based on authority level
    const permissionLevels = {
      'ADMIN': { view: true, edit: true, approve: true },
      'MANAGER': { view: true, edit: true, approve: true },
      'LEAD': { view: true, edit: true, approve: false },
      'STAFF': { view: true, edit: true, approve: false }
    };
    
    const permissions = permissionLevels[authorityLevel] || permissionLevels['STAFF'];
    
    // Generate permissions for each department
    const allDepartments = ['accounting', 'sales', 'service', 'inventory', 'hr'];
    allDepartments.forEach(dept => {
      if (deptList.includes(dept.toUpperCase()) || deptList.includes('GENERAL')) {
        deptPermissions[dept] = { ...permissions };
      } else {
        // Departments not assigned to user get view-only access
        deptPermissions[dept] = { view: false, edit: false, approve: false };
      }
    });
    
    return deptPermissions;
  };
  
  // Helper function to generate feature permissions
  const generateFeaturePermissions = (authorityLevel) => {
    const features = {
      reports: { view: false, export: false },
      admin: { userManagement: false, systemConfig: false },
      developer: { tools: false, migration: false }
    };
    
    switch (authorityLevel) {
      case 'ADMIN':
        return {
          reports: { view: true, export: true },
          admin: { userManagement: true, systemConfig: true },
          developer: { tools: true, migration: true }
        };
      case 'MANAGER':
        return {
          reports: { view: true, export: true },
          admin: { userManagement: true, systemConfig: false },
          developer: { tools: false, migration: false }
        };
      case 'LEAD':
        return {
          reports: { view: true, export: false },
          admin: { userManagement: false, systemConfig: false },
          developer: { tools: false, migration: false }
        };
      case 'STAFF':
      default:
        return features; // All false
    }
  };
  
  // Create structure according to DATA_STRUCTURES_REFERENCE.md Clean Slate format
  return {
    authority,
    geographic: {
      scope: geographic || 'BRANCH',
      allowedProvinces: assignments.provinces || [],
      allowedBranches: assignments.branches || [],
      homeProvince: assignments.provinces?.[0] || null,
      homeBranch: assignments.homeBranch || null
    },
    permissions: {
      departments: generateDepartmentPermissions(departments, authority),
      features: generateFeaturePermissions(authority)
    },
    departments,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Migration helper: Convert legacy user to orthogonal system
 * @param {Object} legacyUser - Legacy user object
 * @returns {Object} User with new access structure
 */
const migrateToOrthogonalSystem = (legacyUser) => {
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
  const rawPermissions = legacyUser.permissions;
  
  // Based on access level
  if (accessLevel.includes('ACCOUNTING')) return ['ACCOUNTING'];
  if (accessLevel.includes('SALES')) return ['SALES'];
  if (accessLevel.includes('SERVICE')) return ['SERVICE'];
  if (accessLevel.includes('INVENTORY')) return ['INVENTORY'];
  if (accessLevel.includes('HR')) return ['HR'];
  
  // Based on permissions - handle different permission formats
  const depts = [];
  
  if (rawPermissions) {
    let permissionArray = [];
    
    // Handle different permission formats
    if (Array.isArray(rawPermissions)) {
      permissionArray = rawPermissions;
    } else if (typeof rawPermissions === 'object') {
      // If permissions is an object, get its keys or values
      permissionArray = Object.keys(rawPermissions);
    } else if (typeof rawPermissions === 'string') {
      // If permissions is a string, split it
      permissionArray = [rawPermissions];
    }
    
    // Check for department permissions
    if (permissionArray.some(p => p && p.toString().includes('accounting'))) depts.push('ACCOUNTING');
    if (permissionArray.some(p => p && p.toString().includes('sales'))) depts.push('SALES');
    if (permissionArray.some(p => p && p.toString().includes('service'))) depts.push('SERVICE');
    if (permissionArray.some(p => p && p.toString().includes('inventory'))) depts.push('INVENTORY');
    if (permissionArray.some(p => p && p.toString().includes('hr'))) depts.push('HR');
  }
  
  return depts.length > 0 ? depts : ['GENERAL'];
};

/**
 * Get user's effective role description
 * @param {Object} user - User with access property
 * @returns {string} Human-readable role description
 */
const getUserRoleDescription = (user) => {
  if (!user?.access) return 'ไม่ระบุตำแหน่ง';
  
  const { authority, geographic, departments } = user.access;
  
  const authorityName = AUTHORITY_LEVELS[authority]?.nameTh || authority;
  const geoName = GEOGRAPHIC_SCOPE[geographic]?.nameTh || geographic;
  const deptNames = departments?.map(d => DEPARTMENTS[d]?.nameTh || d).join(', ') || 'ทั่วไป';
  
  return `${authorityName}${geographic !== 'ALL' ? ` (${geoName})` : ''} - ${deptNames}`;
};

/**
 * EXECUTIVE ROLE HELPERS
 * Create executive access patterns using orthogonal combinations
 */

/**
 * Create executive access with business-only permissions
 * @param {string} scope - 'ALL', 'PROVINCE', 'BRANCH'
 * @param {Object} assignments - Geographic assignments
 * @returns {Object} Executive access structure
 */
const createExecutiveAccess = (scope = 'ALL', assignments = {}) => {
  return createUserAccess(
    'ADMIN',                                    // High authority
    scope,                                      // Geographic scope
    ['ACCOUNTING', 'SALES', 'SERVICE', 'INVENTORY'], // All business departments
    assignments
  );
};

/**
 * Check if user has executive-level access
 * @param {Object} user - User object
 * @returns {boolean} Is executive
 */
const isExecutiveUser = (user) => {
  if (!user?.access) return false;
  
  const { authority, departments } = user.access;
  
  // Executive = ADMIN authority + broad access
  if (authority !== 'ADMIN') return false;
  
  // Must have access to multiple business departments
  const businessDepts = ['ACCOUNTING', 'SALES', 'SERVICE', 'INVENTORY'];
  const hasBusinessAccess = businessDepts.filter(dept => 
    departments.includes(dept)
  ).length >= 3; // At least 3 business departments
  
  return hasBusinessAccess;
};

/**
 * Create executive permissions with business focus
 * @param {Object} user - User with executive access
 * @returns {Object} Executive permissions structure
 */
const generateExecutivePermissions = (user) => {
  const basePermissions = generateUserPermissions(user);
  
  if (!isExecutiveUser(user)) {
    return basePermissions;
  }
  
  // Add executive-specific permissions
  const executivePermissions = [...basePermissions.permissions];
  
  // Add business analytics and reporting
  const executivePerms = [
    'reports.executive',
    'analytics.view', 
    'dashboard.executive',
    'export.all'
  ];
  
  executivePerms.forEach(perm => {
    if (!executivePermissions.includes(perm)) {
      executivePermissions.push(perm);
    }
  });
  
  return {
    ...basePermissions,
    permissions: executivePermissions,
    isExecutive: true
  };
};

/**
 * Executive type definitions and creation helpers
 */
const EXECUTIVE_TYPES = {
  BUSINESS: {
    name: "ผู้บริหารธุรกิจ",
    nameEn: "Business Executive",
    description: "เข้าถึงข้อมูลธุรกิจทั้งหมด ไม่สามารถจัดการระบบ",
    create: (scope = 'ALL', assignments = {}) => ({
      ...createExecutiveAccess(scope, assignments),
      executiveType: 'BUSINESS'
    })
  },
  
  COMPANY: {
    name: "ผู้บริหารบริษัท",
    nameEn: "Company Executive", 
    description: "เข้าถึงข้อมูลทั้งหมด สามารถอนุมัติธุรกิจ",
    create: (scope = 'ALL', assignments = {}) => ({
      ...createExecutiveAccess(scope, assignments),
      executiveType: 'COMPANY',
      canApprove: true
    })
  },
  
  REGIONAL: {
    name: "ผู้บริหารภูมิภาค",
    nameEn: "Regional Executive",
    description: "เข้าถึงข้อมูลในภูมิภาคที่รับผิดชอบ",
    create: (provinces = [], assignments = {}) => ({
      ...createUserAccess('MANAGER', 'PROVINCE', 
        ['ACCOUNTING', 'SALES', 'SERVICE', 'INVENTORY'], 
        { ...assignments, provinces }
      ),
      executiveType: 'REGIONAL'
    })
  }
};

/**
 * Get accessible provinces for user based on their geographic scope
 * @param {Object} user - User object with access
 * @param {Array} allProvinces - All available provinces
 * @returns {Array} Filtered provinces user can access
 */
const getAccessibleProvinces = (user, allProvinces = []) => {
  if (!user?.access || !allProvinces.length) return [];
  
  const { geographic, assignedProvinces } = user.access;
  
  // ALL scope - can access all provinces
  if (geographic === 'ALL') {
    return allProvinces;
  }
  
  // PROVINCE scope - only assigned provinces
  if (geographic === 'PROVINCE' && assignedProvinces) {
    return allProvinces.filter(province => 
      assignedProvinces.includes(province.key || province.provinceKey)
    );
  }
  
  // BRANCH scope - provinces that contain user's branches
  if (geographic === 'BRANCH' && user.access.assignedBranches) {
    // This would need branch-to-province mapping
    // For now, return empty array - branch users don't need province access
    return [];
  }
  
  return [];
};

/**
 * Get accessible branches for user based on their geographic scope  
 * @param {Object} user - User object with access
 * @param {Array} allBranches - All available branches
 * @returns {Array} Filtered branches user can access
 */
const getAccessibleBranches = (user, allBranches = []) => {
  if (!user?.access || !allBranches.length) return [];
  
  const { geographic, assignedProvinces, assignedBranches } = user.access;
  
  // ALL scope - can access all branches
  if (geographic === 'ALL') {
    return allBranches;
  }
  
  // PROVINCE scope - branches in assigned provinces
  if (geographic === 'PROVINCE' && assignedProvinces) {
    return allBranches.filter(branch => 
      assignedProvinces.includes(branch.provinceKey || branch.provinceId)
    );
  }
  
  // BRANCH scope - only assigned branches
  if (geographic === 'BRANCH' && assignedBranches) {
    return allBranches.filter(branch => 
      assignedBranches.includes(branch.branchCode || branch.code)
    );
  }
  
  return [];
};

/**
 * Filter data array based on user's geographic access
 * @param {Object} user - User object with access
 * @param {Array} data - Data array to filter
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered data
 */
const filterDataByUserAccess = (user, data = [], options = {}) => {
  if (!user?.access || !data.length) return [];
  
  const { geographic, assignedProvinces, assignedBranches } = user.access;
  const { provinceField = 'provinceId', branchField = 'branchCode' } = options;
  
  // ALL scope - can access all data
  if (geographic === 'ALL') {
    return data;
  }
  
  // PROVINCE scope - filter by assigned provinces
  if (geographic === 'PROVINCE' && assignedProvinces) {
    return data.filter(item => 
      assignedProvinces.includes(item[provinceField])
    );
  }
  
  // BRANCH scope - filter by assigned branches
  if (geographic === 'BRANCH' && assignedBranches) {
    return data.filter(item => 
      assignedBranches.includes(item[branchField])
    );
  }
  
  return [];
};

// ES6 exports for React components
export {
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
  getUserRoleDescription,
  // Executive functions
  createExecutiveAccess,
  isExecutiveUser,
  generateExecutivePermissions,
  EXECUTIVE_TYPES,
  // Geographic access functions
  getAccessibleProvinces,
  getAccessibleBranches,
  filterDataByUserAccess
};

 