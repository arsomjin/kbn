/**
 * Enhanced RBAC System for KBN
 * Implements additive granular permissions without individual permission complexity
 * Base Role + Additional Granular Permissions approach
 */

/**
 * Base Role Definitions (Core roles that define primary responsibilities)
 */
export const BASE_ROLES = {
  // Super Admin
  'SUPER_ADMIN': {
    name: 'ผู้ดูแลระบบสูงสุด',
    accessLevel: 'all',
    permissions: ['*'],
    departments: ['*'],
    description: 'เข้าถึงทุกฟังก์ชันในระบบ'
  },

  // Management Roles
  'PROVINCE_MANAGER': {
    name: 'ผู้จัดการจังหวัด',
    accessLevel: 'province',
    permissions: [
      'users.view', 'users.manage',
      'reports.view', 'reports.export',
      'accounting.view', 'sales.view', 'service.view', 'inventory.view',
      'approvals.manage'
    ],
    departments: ['management'],
    description: 'จัดการทุกสาขาในจังหวัด'
  },

  'BRANCH_MANAGER': {
    name: 'ผู้จัดการสาขา',
    accessLevel: 'branch',
    permissions: [
      'users.view',
      'reports.view', 'reports.export',
      'accounting.view', 'sales.view', 'service.view', 'inventory.view',
      'approvals.approve'
    ],
    departments: ['management'],
    description: 'จัดการสาขาเดียว'
  },

  // Department Staff (Basic)
  'ACCOUNTING_STAFF': {
    name: 'เจ้าหน้าที่บัญชี',
    accessLevel: 'branch',
    permissions: ['accounting.view', 'accounting.edit'],
    departments: ['accounting'],
    description: 'จัดการข้อมูลบัญชีสาขา'
  },

  'SALES_STAFF': {
    name: 'เจ้าหน้าที่ขาย',
    accessLevel: 'branch',
    permissions: ['sales.view', 'sales.edit'],
    departments: ['sales'],
    description: 'จัดการข้อมูลขายสาขา'
  },

  'SERVICE_STAFF': {
    name: 'เจ้าหน้าที่บริการ',
    accessLevel: 'branch',
    permissions: ['service.view', 'service.edit'],
    departments: ['service'],
    description: 'จัดการข้อมูลบริการสาขา'
  },

  'INVENTORY_STAFF': {
    name: 'เจ้าหน้าที่คลังสินค้า',
    accessLevel: 'branch',
    permissions: ['inventory.view', 'inventory.edit'],
    departments: ['inventory'],
    description: 'จัดการสต๊อกสินค้าสาขา'
  },

  'HR_STAFF': {
    name: 'เจ้าหน้าที่ทรัพยากรบุคคล',
    accessLevel: 'branch',
    permissions: ['hr.view', 'hr.edit', 'users.view'],
    departments: ['hr'],
    description: 'จัดการข้อมูลพนักงาน'
  },

  // Executive Roles
  'EXECUTIVE': {
    name: 'ผู้บริหาร',
    accessLevel: 'all',
    permissions: [
      'reports.view', 'reports.export',
      'accounting.view', 'sales.view', 'service.view', 'inventory.view',
      'users.view'
    ],
    departments: ['management'],
    description: 'ดูภาพรวมระดับองค์กร'
  }
};

/**
 * Granular Additional Permissions
 * These can be added to base roles for enhanced capabilities
 */
export const GRANULAR_PERMISSIONS = {
  // Cross-Department View Permissions
  'SALES_DATA_ACCESS': {
    name: 'ดูข้อมูลขาย',
    permissions: ['sales.view'],
    description: 'เข้าถึงข้อมูลการขายและลูกค้า',
    compatibleRoles: ['ACCOUNTING_STAFF', 'INVENTORY_STAFF', 'SERVICE_STAFF'],
    category: 'cross_department'
  },

  'INVENTORY_DATA_ACCESS': {
    name: 'ดูข้อมูลสต๊อก',
    permissions: ['inventory.view'],
    description: 'เข้าถึงข้อมูลสต๊อกและคลังสินค้า',
    compatibleRoles: ['SALES_STAFF', 'SERVICE_STAFF', 'ACCOUNTING_STAFF'],
    category: 'cross_department'
  },

  'ACCOUNTING_DATA_ACCESS': {
    name: 'ดูข้อมูลบัญชี',
    permissions: ['accounting.view'],
    description: 'เข้าถึงข้อมูลการเงินและบัญชี',
    compatibleRoles: ['SALES_STAFF', 'SERVICE_STAFF'],
    category: 'cross_department'
  },

  'SERVICE_DATA_ACCESS': {
    name: 'ดูข้อมูลบริการ',
    permissions: ['service.view'],
    description: 'เข้าถึงข้อมูลบริการและซ่อมบำรุง',
    compatibleRoles: ['SALES_STAFF', 'INVENTORY_STAFF'],
    category: 'cross_department'
  },

  // Advanced Management Permissions
  'INVENTORY_MANAGEMENT': {
    name: 'จัดการสต๊อกขั้นสูง',
    permissions: ['inventory.view', 'inventory.edit', 'inventory.approve'],
    description: 'จัดการสต๊อก อนุมัติการเบิก-จ่าย',
    compatibleRoles: ['SERVICE_STAFF'],
    category: 'management'
  },

  'REPORTING_ACCESS': {
    name: 'เข้าถึงรายงาน',
    permissions: ['reports.view'],
    description: 'ดูรายงานสรุปและวิเคราะห์',
    compatibleRoles: ['ACCOUNTING_STAFF', 'SALES_STAFF', 'SERVICE_STAFF', 'INVENTORY_STAFF'],
    category: 'reporting'
  },

  'ADVANCED_REPORTING': {
    name: 'รายงานขั้นสูง',
    permissions: ['reports.view', 'reports.export', 'reports.analytics'],
    description: 'ส่งออกรายงานและวิเคราะห์ข้อมูล',
    compatibleRoles: ['ACCOUNTING_STAFF', 'SALES_STAFF'],
    category: 'reporting'
  },

  // Province Level Enhancements
  'PROVINCE_REPORTING': {
    name: 'รายงานระดับจังหวัด',
    permissions: ['reports.view', 'reports.export'],
    description: 'ดูรายงานข้ามสาขาในจังหวัด',
    accessLevelUpgrade: 'province',
    compatibleRoles: ['ACCOUNTING_STAFF', 'SALES_STAFF'],
    category: 'geographic'
  },

  'MULTI_BRANCH_COORDINATION': {
    name: 'ประสานงานข้ามสาขา',
    permissions: ['sales.view', 'service.view', 'inventory.view'],
    description: 'ประสานงานและดูข้อมูลข้ามสาขา',
    accessLevelUpgrade: 'province',
    compatibleRoles: ['SALES_STAFF', 'SERVICE_STAFF'],
    category: 'geographic'
  }
};

/**
 * Permission Categories for UI Organization
 */
export const PERMISSION_CATEGORIES = {
  'cross_department': {
    name: 'ข้ามแผนก',
    description: 'สิทธิ์เข้าถึงข้อมูลแผนกอื่น',
    icon: '🔄',
    color: 'blue'
  },
  'management': {
    name: 'การจัดการ',
    description: 'สิทธิ์จัดการและอนุมัติ',
    icon: '⚙️',
    color: 'orange'
  },
  'reporting': {
    name: 'รายงาน',
    description: 'การเข้าถึงและส่งออกรายงาน',
    icon: '📊',
    color: 'green'
  },
  'geographic': {
    name: 'ข้ามพื้นที่',
    description: 'การเข้าถึงข้ามสาขา/จังหวัด',
    icon: '🌍',
    color: 'purple'
  }
};

/**
 * Permission Compatibility Layer
 * Maps granular roles to legacy permission patterns used in navigation and existing components
 */

// Legacy permission patterns used in navigation and components
const LEGACY_PERMISSION_PATTERNS = {
  // Department-based patterns (accounting.view, sales.edit, etc.)
  'accounting.view': ['accounting.view', 'finance.view', 'admin.view', 'audit.view'],
  'accounting.edit': ['accounting.edit', 'finance.edit', 'admin.edit'],
  'accounting.approve': ['accounting.approve', 'finance.approve', 'admin.approve'],
  'accounting.delete': ['accounting.delete', 'admin.delete'],
  
  'sales.view': ['sales.view', 'admin.view', 'reports.view'],
  'sales.edit': ['sales.edit', 'admin.edit'],
  'sales.approve': ['sales.approve', 'admin.approve'],
  'sales.review': ['sales.review', 'sales.approve', 'admin.approve'],
  'sales.delete': ['sales.delete', 'admin.delete'],
  
  'service.view': ['service.view', 'admin.view', 'reports.view'],
  'service.edit': ['service.edit', 'admin.edit'],
  'service.approve': ['service.approve', 'admin.approve'],
  'service.delete': ['service.delete', 'admin.delete'],
  
  'inventory.view': ['inventory.view', 'warehouse.view', 'admin.view', 'reports.view'],
  'inventory.edit': ['inventory.edit', 'warehouse.edit', 'admin.edit'],
  'inventory.approve': ['inventory.approve', 'warehouse.approve', 'admin.approve'],
  'inventory.delete': ['inventory.delete', 'warehouse.delete', 'admin.delete'],
  
  'reports.view': ['reports.view', 'admin.view', 'accounting.view', 'sales.view', 'service.view', 'inventory.view'],
  'reports.edit': ['reports.edit', 'admin.edit'],
  
  'hr.view': ['hr.view', 'admin.view'],
  'hr.edit': ['hr.edit', 'admin.edit'],
  'hr.approve': ['hr.approve', 'admin.approve'],
  'hr.view_salary': ['hr.view_salary', 'hr.approve', 'admin.approve'],
  
  'admin.view': ['admin.view', 'super_admin.all'],
  'admin.edit': ['admin.edit', 'super_admin.all'],
  'admin.approve': ['admin.approve', 'super_admin.all'],
  'admin.delete': ['admin.delete', 'super_admin.all'],
  
  'users.manage': ['users.manage', 'admin.approve', 'super_admin.all'],
  'users.create': ['users.create', 'users.manage', 'admin.approve'],
  'users.edit': ['users.edit', 'users.manage', 'admin.edit'],
  'users.delete': ['users.delete', 'users.manage', 'admin.delete'],
  'users.approve': ['users.approve', 'users.manage', 'admin.approve'],
  
  'credit.view': ['credit.view', 'finance.view', 'admin.view'],
  'credit.edit': ['credit.edit', 'finance.edit', 'admin.edit'],
  'credit.approve': ['credit.approve', 'finance.approve', 'admin.approve'],
  
  'notifications.edit': ['notifications.edit', 'communications.edit', 'admin.edit'],
  'notifications.send': ['notifications.send', 'communications.send', 'admin.edit'],
  
  // Special patterns
  'super_admin.all': ['super_admin.all'],
  'province_admin.all': ['province_admin.all', 'admin.approve'],
  'branch_admin.all': ['branch_admin.all', 'admin.edit']
};

/**
 * Role-to-Permission mapping for granular roles
 * Maps each granular role to permissions that satisfy legacy permission checks
 */
const GRANULAR_ROLE_PERMISSIONS = {
  // Cross-department staff roles
  'ACCOUNTING_STAFF_SALES_VIEWER': [
    'accounting.view', 'accounting.edit',
    'sales.view', 
    'reports.view'
  ],
  
  'SALES_STAFF_INVENTORY_VIEWER': [
    'sales.view', 'sales.edit',
    'inventory.view',
    'reports.view'
  ],
  
  'SERVICE_STAFF_PARTS_MANAGER': [
    'service.view', 'service.edit',
    'inventory.view', 'inventory.edit',
    'reports.view'
  ],
  
  'INVENTORY_STAFF_SALES_SUPPORT': [
    'inventory.view', 'inventory.edit',
    'sales.view',
    'reports.view'
  ],
  
  'FINANCE_STAFF_MULTI_DEPT': [
    'accounting.view', 'accounting.edit', 'accounting.approve',
    'sales.view',
    'service.view',
    'credit.view', 'credit.edit',
    'reports.view'
  ],
  
  'HR_STAFF_BASIC_FINANCE': [
    'hr.view', 'hr.edit',
    'accounting.view',
    'reports.view'
  ],
  
  'COMMUNICATIONS_STAFF': [
    'notifications.edit', 'notifications.send',
    'hr.view',
    'reports.view'
  ],
  
  // Management hierarchy
  'PROVINCE_MANAGER': [
    'accounting.view', 'accounting.edit', 'accounting.approve',
    'sales.view', 'sales.edit', 'sales.approve', 'sales.review',
    'service.view', 'service.edit', 'service.approve',
    'inventory.view', 'inventory.edit', 'inventory.approve',
    'hr.view', 'hr.edit', 'hr.approve', 'hr.view_salary',
    'credit.view', 'credit.edit', 'credit.approve',
    'reports.view', 'reports.edit',
    'users.manage', 'users.create', 'users.edit', 'users.approve',
    'admin.view', 'admin.edit',
    'notifications.edit', 'notifications.send'
  ],
  
  'PROVINCE_ASSISTANT_MANAGER': [
    'accounting.view', 'accounting.edit',
    'sales.view', 'sales.edit', 'sales.review',
    'service.view', 'service.edit',
    'inventory.view', 'inventory.edit',
    'hr.view', 'hr.edit',
    'credit.view', 'credit.edit',
    'reports.view',
    'users.view', 'users.edit',
    'admin.view'
  ],
  
  'BRANCH_MANAGER': [
    'accounting.view', 'accounting.edit', 'accounting.approve',
    'sales.view', 'sales.edit', 'sales.approve', 'sales.review',
    'service.view', 'service.edit', 'service.approve',
    'inventory.view', 'inventory.edit', 'inventory.approve',
    'hr.view', 'hr.edit',
    'credit.view', 'credit.edit',
    'reports.view',
    'users.view', 'users.edit'
  ],
  
  'BRANCH_ASSISTANT_MANAGER': [
    'accounting.view', 'accounting.edit',
    'sales.view', 'sales.edit',
    'service.view', 'service.edit',
    'inventory.view', 'inventory.edit',
    'hr.view',
    'credit.view',
    'reports.view'
  ],
  
  // Specialists
  'FINANCE_ANALYST': [
    'accounting.view', 'accounting.edit', 'accounting.approve',
    'credit.view', 'credit.edit', 'credit.approve',
    'reports.view', 'reports.edit',
    'sales.view', 'service.view', 'inventory.view'
  ],
  
  'OPERATIONS_COORDINATOR': [
    'inventory.view', 'inventory.edit', 'inventory.approve',
    'service.view', 'service.edit',
    'sales.view',
    'reports.view',
    'hr.view'
  ],
  
  'SENIOR_ACCOUNTANT': [
    'accounting.view', 'accounting.edit', 'accounting.approve',
    'credit.view', 'credit.edit',
    'reports.view', 'reports.edit',
    'admin.view'
  ],
  
  'CUSTOMER_SERVICE_LEAD': [
    'sales.view', 'sales.edit', 'sales.review',
    'service.view', 'service.edit',
    'hr.view',
    'reports.view',
    'notifications.edit'
  ],
  
  'INVENTORY_SUPERVISOR': [
    'inventory.view', 'inventory.edit', 'inventory.approve',
    'sales.view',
    'service.view',
    'reports.view'
  ],
  
  // Legacy role mappings for backward compatibility
  'SALES_STAFF': [
    'sales.view', 'sales.edit',
    'inventory.view',
    'reports.view'
  ],
  
  'ACCOUNTING_STAFF': [
    'accounting.view', 'accounting.edit',
    'reports.view'
  ],
  
  'SERVICE_STAFF': [
    'service.view', 'service.edit',
    'inventory.view', 'inventory.edit',
    'reports.view'
  ],
  
  'INVENTORY_STAFF': [
    'inventory.view', 'inventory.edit',
    'reports.view'
  ]
};

/**
 * Enhanced permission checker that supports both granular roles and legacy permissions
 * @param {string} role - User's role
 * @param {string} permission - Permission to check (legacy format like 'accounting.view')
 * @param {Array} additionalPermissions - Additional permissions granted to user
 * @returns {boolean}
 */
export const hasEnhancedPermission = (role, permission, additionalPermissions = []) => {
  // Super admin has all permissions
  if (role === 'SUPER_ADMIN') return true;
  
  // Check if role has permission through granular role mapping
  const rolePermissions = GRANULAR_ROLE_PERMISSIONS[role] || [];
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Check additional permissions directly
  if (additionalPermissions.includes(permission)) {
    return true;
  }
  
  // Check if any additional permissions grant this permission through legacy patterns
  const legacyEquivalents = LEGACY_PERMISSION_PATTERNS[permission] || [];
  const hasLegacyEquivalent = additionalPermissions.some(perm => 
    legacyEquivalents.includes(perm)
  );
  
  if (hasLegacyEquivalent) {
    return true;
  }
  
  // Check if role permissions match any legacy equivalents
  const hasRoleLegacyEquivalent = rolePermissions.some(rolePerm =>
    legacyEquivalents.includes(rolePerm)
  );
  
  return hasRoleLegacyEquivalent;
};

/**
 * Get all effective permissions for a role (including legacy pattern matches)
 * @param {string} role - User's role
 * @param {Array} additionalPermissions - Additional permissions
 * @returns {Array} All effective permissions
 */
export const getEffectivePermissions = (role, additionalPermissions = []) => {
  if (!role) return additionalPermissions;
  
  // Get base permissions from role
  const rolePermissions = GRANULAR_ROLE_PERMISSIONS[role] || [];
  
  // Combine role permissions with additional permissions
  const allPermissions = [...new Set([...rolePermissions, ...additionalPermissions])];
  
  // Add wildcard permission for super admin
  if (role === 'SUPER_ADMIN') {
    allPermissions.push('*');
  }
  
  return allPermissions;
};

/**
 * Get effective access level (considering upgrades from granular permissions)
 */
export const getEffectiveAccessLevel = (baseRole, additionalPermissions = []) => {
  const roleData = BASE_ROLES[baseRole];
  if (!roleData) return 'branch';

  let accessLevel = roleData.accessLevel;

  // Check for access level upgrades
  additionalPermissions.forEach(permissionKey => {
    const granularPerm = GRANULAR_PERMISSIONS[permissionKey];
    if (granularPerm?.accessLevelUpgrade) {
      if (granularPerm.accessLevelUpgrade === 'province' && accessLevel === 'branch') {
        accessLevel = 'province';
      }
      if (granularPerm.accessLevelUpgrade === 'all') {
        accessLevel = 'all';
      }
    }
  });

  return accessLevel;
};

/**
 * Get compatible granular permissions for a base role
 */
export const getCompatiblePermissions = (baseRole) => {
  const compatiblePerms = [];
  
  Object.entries(GRANULAR_PERMISSIONS).forEach(([key, permission]) => {
    if (permission.compatibleRoles.includes(baseRole)) {
      compatiblePerms.push({ key, ...permission });
    }
  });

  return compatiblePerms;
};

/**
 * Get permissions grouped by category
 */
export const getPermissionsByCategory = (baseRole) => {
  const compatiblePerms = getCompatiblePermissions(baseRole);
  const grouped = {};

  compatiblePerms.forEach(permission => {
    const category = permission.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });

  return grouped;
};

/**
 * Enhanced role assignment validation
 */
export const validateRoleAssignment = (targetRole, currentUserRole) => {
  const targetRoleData = BASE_ROLES[targetRole];
  const currentUserRoleData = BASE_ROLES[currentUserRole];
  
  if (!targetRoleData || !currentUserRoleData) {
    return { valid: false, reason: 'บทบาทไม่ถูกต้อง' };
  }
  
  // Super admin can assign any role
  if (currentUserRoleData.permissions.includes('*')) {
    return { valid: true };
  }
  
  // Province managers can only assign branch/staff roles
  if (currentUserRoleData.accessLevel === 'province') {
    if (['SUPER_ADMIN', 'PROVINCE_MANAGER'].includes(targetRole)) {
      return { valid: false, reason: 'ไม่มีสิทธิ์มอบหมายบทบาทนี้' };
    }
  }
  
  // Branch managers can only assign staff roles
  if (currentUserRoleData.accessLevel === 'branch') {
    if (!targetRole.includes('STAFF')) {
      return { valid: false, reason: 'สามารถมอบหมายได้เฉพาะบทบาทเจ้าหน้าที่' };
    }
  }
  
  return { valid: true };
};

/**
 * Generate audit log for role changes
 */
export const createRoleChangeAuditLog = (userId, oldRole, newRole, oldAdditionalPerms = [], newAdditionalPerms = [], changedBy, reason = '') => {
  return {
    type: 'ROLE_CHANGE',
    userId,
    oldRole,
    newRole,
    oldAdditionalPermissions: oldAdditionalPerms,
    newAdditionalPermissions: newAdditionalPerms,
    changedBy,
    reason,
    timestamp: Date.now(),
    oldEffectivePermissions: getEffectivePermissions(oldRole, oldAdditionalPerms),
    newEffectivePermissions: getEffectivePermissions(newRole, newAdditionalPerms)
  };
};

/**
 * Get user-friendly role descriptions for UI
 */
export const getRoleDisplayInfo = (roleKey) => {
  const roleData = BASE_ROLES[roleKey];
  if (!roleData) return { name: roleKey, description: '', tag: 'default' };
  
  const accessLevelColors = {
    'all': 'purple',
    'province': 'blue', 
    'branch': 'green'
  };
  
  return {
    name: roleData.name,
    description: roleData.description,
    accessLevel: roleData.accessLevel,
    tag: accessLevelColors[roleData.accessLevel] || 'default',
    permissionCount: roleData.permissions.length,
    departments: roleData.departments
  };
};

/**
 * Migration helper for existing users
 */
export const migrateExistingUserRole = (oldAccessLevel, department) => {
  // Map old system to new base roles
  const migrationMap = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'PROVINCE_MANAGER': 'PROVINCE_MANAGER',
    'BRANCH_MANAGER': 'BRANCH_MANAGER',
    'ACCOUNTING_STAFF': 'ACCOUNTING_STAFF',
    'SALES_STAFF': 'SALES_STAFF',
    'SERVICE_STAFF': 'SERVICE_STAFF',
    'INVENTORY_STAFF': 'INVENTORY_STAFF',
    'EXECUTIVE': 'EXECUTIVE'
  };
  
  return migrationMap[oldAccessLevel] || 'SALES_STAFF';
};

// For backward compatibility - export both old and new systems
export const ENHANCED_ROLES = BASE_ROLES; // Keep for existing code

export default {
  BASE_ROLES,
  GRANULAR_PERMISSIONS,
  PERMISSION_CATEGORIES,
  getEffectivePermissions,
  getEffectiveAccessLevel,
  hasEnhancedPermission,
  getCompatiblePermissions,
  getPermissionsByCategory,
  validateRoleAssignment,
  createRoleChangeAuditLog,
  getRoleDisplayInfo,
  migrateExistingUserRole,
  // Backward compatibility
  ENHANCED_ROLES: BASE_ROLES
}; 