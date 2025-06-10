/**
 * Simplified Permission System for KBN Multi-Province System
 * Department Access + Document Flow Permissions
 */

// Department Access Permissions
export const DEPARTMENTS = {
  accounting: { name: 'บัญชีและการเงิน', key: 'accounting' },
  sales: { name: 'ขายและลูกค้า', key: 'sales' },
  service: { name: 'บริการและซ่อมบำรุง', key: 'service' },
  inventory: { name: 'คลังสินค้าและอะไหล่', key: 'inventory' },
  hr: { name: 'ทรัพยากรบุคคล', key: 'hr' },
  management: { name: 'ผู้บริหาร', key: 'management' },
  admin: { name: 'ระบบและผู้ดูแล', key: 'admin' },
  users: { name: 'จัดการผู้ใช้งาน', key: 'users' },
  reports: { name: 'รายงานทั้งหมด', key: 'reports' },
  notifications: { name: 'การแจ้งเตือนและเผยแพร่', key: 'notifications' }
};

// Legacy department constants for backward compatibility
export const LEGACY_DEPARTMENTS = {
  ACCOUNTING: 'accounting',
  SALES: 'sales', 
  SERVICE: 'service',
  INVENTORY: 'inventory',
  HR: 'hr',
  ADMIN: 'admin',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications'
};

// Document Flow Permissions
export const DOCUMENT_FLOWS = {
  VIEW: 'view',
  EDIT: 'edit', 
  REVIEW: 'review',
  APPROVE: 'approve'
};

// Department Descriptions
export const DEPARTMENT_DESCRIPTIONS = {
  [DEPARTMENTS.ACCOUNTING]: 'บัญชีและการเงิน',
  [DEPARTMENTS.SALES]: 'ขายและลูกค้า',
  [DEPARTMENTS.SERVICE]: 'บริการและซ่อมบำรุง',
  [DEPARTMENTS.INVENTORY]: 'คลังสินค้าและอะไหล่',
  [DEPARTMENTS.HR]: 'ทรัพยากรบุคคล',
  [DEPARTMENTS.ADMIN]: 'ระบบและผู้ดูแล',
  [DEPARTMENTS.REPORTS]: 'รายงานทั้งหมด',
  [DEPARTMENTS.NOTIFICATIONS]: 'การแจ้งเตือนและเผยแพร่'
};

// Document Flow Descriptions
export const FLOW_DESCRIPTIONS = {
  [DOCUMENT_FLOWS.VIEW]: 'ดูข้อมูล',
  [DOCUMENT_FLOWS.EDIT]: 'แก้ไขข้อมูล', 
  [DOCUMENT_FLOWS.REVIEW]: 'ตรวจสอบข้อมูล',
  [DOCUMENT_FLOWS.APPROVE]: 'อนุมัติข้อมูล'
};

// Permission combination helper
export const combinePermission = (department, flow) => `${department}.${flow}`;

// Check if permission has both department and flow
export const parsePermission = (permission) => {
  if (permission === '*') {
    return { department: '*', flow: '*', isValid: true, isSuperAdmin: true };
  }
  
  const parts = permission.split('.');
  if (parts.length === 2) {
    return {
      department: parts[0],
      flow: parts[1],
      isValid: Object.values(DEPARTMENTS).includes(parts[0]) && 
               Object.values(DOCUMENT_FLOWS).includes(parts[1]),
      isSuperAdmin: false
    };
  }
  return { department: null, flow: null, isValid: false, isSuperAdmin: false };
};

// Legacy Permission Migration Mapping
export const LEGACY_TO_NEW_MAPPING = {
  // Accounting permissions
  'permission202': [
    combinePermission(DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.EDIT)
  ],
  'permission801': [
    combinePermission(DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW)
  ],
  
  // Sales permissions
  'permission802': [
    combinePermission(DEPARTMENTS.SALES, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.SALES, DOCUMENT_FLOWS.EDIT)
  ],
  
  // Service permissions
  'permission803': [
    combinePermission(DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.EDIT)
  ],
  
  // Inventory permissions
  'permission804': [
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.EDIT)
  ],
  
  // HR permissions
  'permission805': [
    combinePermission(DEPARTMENTS.HR, DOCUMENT_FLOWS.VIEW)
  ],
  'permission806': [
    combinePermission(DEPARTMENTS.HR, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.HR, DOCUMENT_FLOWS.EDIT)
  ],
  
  // Admin permissions
  'permission601': [
    combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.EDIT),
    combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.APPROVE)
  ],
  'permission613': [
    combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.VIEW)
  ],
  'permission614': [
    combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.EDIT)
  ]
};

// Predefined Role Permission Sets
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions
  EXECUTIVE: ['*'], // Executive role with full permissions (same as super admin)
  
  PROVINCE_MANAGER: [
    // Full access to all departments except admin approve
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.REVIEW),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.APPROVE),
    
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.REVIEW),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.APPROVE),
    
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.REVIEW),
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.APPROVE),
    
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.REVIEW),
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.APPROVE),
    
    combinePermission(LEGACY_DEPARTMENTS.HR, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.HR, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.HR, DOCUMENT_FLOWS.REVIEW),
    
    combinePermission(LEGACY_DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.EDIT),
    
    combinePermission(LEGACY_DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.VIEW),
    
    // User management permissions for province managers
    'users.view',
    'users.manage',
    'users.approve',
    
    // Notification permissions for province managers
    combinePermission(LEGACY_DEPARTMENTS.NOTIFICATIONS, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.NOTIFICATIONS, DOCUMENT_FLOWS.EDIT)
  ],
  
  BRANCH_MANAGER: [
    // Accounting access
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.REVIEW),
    
    // Sales access
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.REVIEW),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.APPROVE),
    
    // Service access
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.REVIEW),
    
    // Inventory access
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.EDIT),
    
    // Reports access
    combinePermission(LEGACY_DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW),
    
    // User management permissions for branch managers
    'users.view',
    'users.manage',
    
    // Notification permissions for branch managers  
    combinePermission(LEGACY_DEPARTMENTS.NOTIFICATIONS, DOCUMENT_FLOWS.VIEW)
  ],
  
  ACCOUNTING_STAFF: [
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.ACCOUNTING, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW)
  ],
  
  SALES_STAFF: [
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.SALES, DOCUMENT_FLOWS.EDIT),
    combinePermission(LEGACY_DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(LEGACY_DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW)
  ],
  
  SERVICE_STAFF: [
    combinePermission(DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.SERVICE, DOCUMENT_FLOWS.EDIT),
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.EDIT),
    combinePermission(DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW)
  ],
  
  INVENTORY_STAFF: [
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.VIEW),
    combinePermission(DEPARTMENTS.INVENTORY, DOCUMENT_FLOWS.EDIT),
    combinePermission(DEPARTMENTS.REPORTS, DOCUMENT_FLOWS.VIEW)
  ]
};

/**
 * Convert legacy user permissions to new system
 * @param {Object} user - Legacy user object
 * @returns {Array} New permission array
 */
export const migrateLegacyPermissions = (user) => {
  if (user?.isDev) {
    return ['*']; // Super admin
  }
  
  const newPermissions = new Set();
  
  if (user?.permissions) {
    Object.keys(user.permissions).forEach(legacyPerm => {
      if (user.permissions[legacyPerm] && LEGACY_TO_NEW_MAPPING[legacyPerm]) {
        LEGACY_TO_NEW_MAPPING[legacyPerm].forEach(newPerm => {
          newPermissions.add(newPerm);
        });
      }
    });
  }
  
  return Array.from(newPermissions);
};

/**
 * Determine role from permissions
 * @param {Array} permissions - Permission array
 * @param {Object} user - User object for additional context
 * @returns {string} Role key
 */
export const determineRoleFromPermissions = (permissions, user) => {
  if (permissions.includes('*') || user?.isDev) {
    // Check if user is specifically marked as executive
    if (user?.isExecutive || user?.accessLevel === 'EXECUTIVE') {
      return 'EXECUTIVE';
    }
    return 'SUPER_ADMIN';
  }
  
  // Check if user has admin permissions
  const hasAdminEdit = permissions.includes(combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.EDIT));
  const hasAdminApprove = permissions.includes(combinePermission(DEPARTMENTS.ADMIN, DOCUMENT_FLOWS.APPROVE));
  
  if (hasAdminEdit || hasAdminApprove) {
    return 'PROVINCE_MANAGER';
  }
  
  // Check for manager-level permissions (multiple departments with review/approve)
  const hasApprovePermissions = permissions.some(perm => perm.includes('.approve'));
  const hasReviewPermissions = permissions.some(perm => perm.includes('.review'));
  const departmentCount = new Set(
    permissions
      .filter(perm => perm !== '*')
      .map(perm => parsePermission(perm).department)
      .filter(dept => dept && dept !== '*')
  ).size;
  
  if ((hasApprovePermissions || hasReviewPermissions) && departmentCount >= 2) {
    return 'BRANCH_MANAGER';
  }
  
  // Determine specific staff role based on primary department
  const departmentCounts = {};
  permissions.forEach(perm => {
    const { department } = parsePermission(perm);
    if (department && department !== '*') {
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    }
  });
  
  const primaryDepartment = Object.keys(departmentCounts).reduce((a, b) => 
    departmentCounts[a] > departmentCounts[b] ? a : b, 
    Object.keys(departmentCounts)[0]
  );
  
  switch (primaryDepartment) {
    case DEPARTMENTS.ACCOUNTING:
      return 'ACCOUNTING_STAFF';
    case DEPARTMENTS.SALES:
      return 'SALES_STAFF';
    case DEPARTMENTS.SERVICE:
      return 'SERVICE_STAFF';
    case DEPARTMENTS.INVENTORY:
      return 'INVENTORY_STAFF';
    default:
      return 'SALES_STAFF'; // Default fallback
  }
}; 