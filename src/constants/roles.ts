import { PERMISSIONS } from './Permissions';

// Define UserRole enum as per updated plan
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  PENDING = 'pending',
  DEVELOPER = 'developer',
  LEAD = 'lead', // Document reviewers
  BRANCH_MANAGER = 'branch_manager', // Branch level manager
  PROVINCE_MANAGER = 'province_manager', // Province level manager
  GENERAL_MANAGER = 'general_manager' // Renamed from MANAGER
}

// Define role categories
export enum RoleCategory {
  SUPER_ADMIN = 'super_admin',
  PRIVILEGED = 'privileged',
  GENERAL_MANAGER = 'general_manager', // Renamed from MANAGER
  ADMIN = 'admin',
  PROVINCE_MANAGER = 'province_manager',
  BRANCH_MANAGER = 'branch_manager',
  BRANCH = 'branch',
  LEAD = 'lead',
  GUEST = 'guest',
  DEVELOPER = 'developer',
}

// Define role types as described in documentation
export const ROLES = {
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  PRIVILEGED: RoleCategory.PRIVILEGED,
  ADMIN: UserRole.ADMIN,
  GENERAL_MANAGER: UserRole.GENERAL_MANAGER, // Renamed from MANAGER
  PROVINCE_MANAGER: UserRole.PROVINCE_MANAGER,
  BRANCH_MANAGER: UserRole.BRANCH_MANAGER,
  BRANCH: RoleCategory.BRANCH,
  USER: UserRole.USER,
  GUEST: UserRole.GUEST,
  PENDING: UserRole.PENDING,
  DEVELOPER: UserRole.DEVELOPER,
  LEAD: UserRole.LEAD,
};

// Role categorization
export const ROLE_CATEGORIES: Record<RoleCategory, Array<string | UserRole>> = {
  [RoleCategory.DEVELOPER]: [ROLES.DEVELOPER],
  [RoleCategory.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.PRIVILEGED]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGED],
  [RoleCategory.ADMIN]: [ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.GENERAL_MANAGER]: [ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.PROVINCE_MANAGER]: [ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.BRANCH_MANAGER]: [ROLES.BRANCH_MANAGER, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.LEAD]: [ROLES.LEAD, ROLES.BRANCH_MANAGER, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.BRANCH]: [ROLES.USER, ROLES.BRANCH, ROLES.LEAD, ROLES.BRANCH_MANAGER, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.GUEST]: [ROLES.GUEST, ROLES.PENDING, ROLES.USER, ROLES.BRANCH, ROLES.LEAD, ROLES.BRANCH_MANAGER, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER, ROLES.ADMIN, ROLES.PRIVILEGED, ROLES.SUPER_ADMIN, ROLES.DEVELOPER]
};

// Role hierarchy (higher index = higher permissions)
export const ROLE_HIERARCHY: Array<string | UserRole> = [
  ROLES.GUEST,
  ROLES.PENDING,
  ROLES.USER,
  ROLES.BRANCH,
  ROLES.LEAD,
  ROLES.BRANCH_MANAGER, 
  ROLES.PROVINCE_MANAGER,
  ROLES.GENERAL_MANAGER, // Renamed from MANAGER and positioned higher than PROVINCE_MANAGER
  ROLES.ADMIN,
  ROLES.PRIVILEGED,
  ROLES.SUPER_ADMIN,
  ROLES.DEVELOPER
];

// Helper function to check if a role has permission based on hierarchy
export const hasRolePermission = (userRole: string | UserRole, requiredRole: string | UserRole): boolean => {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  // User role must be same or higher in the hierarchy
  return userRoleIndex >= requiredRoleIndex;
};

// Helper function to check if a user belongs to a specific role category
export const isInRoleCategory = (userRole: string | UserRole, category: RoleCategory): boolean => {
  return ROLE_CATEGORIES[category].includes(userRole as any);
};

// Role-Permission mapping as described in documentation
// Define permissions for each role
const GUEST_PERMISSIONS = [
  // Public access permissions
  PERMISSIONS.CONTENT_VIEW
];

const USER_PERMISSIONS = [
  // Include all GUEST permissions
  ...GUEST_PERMISSIONS,
  // Basic user permissions
  PERMISSIONS.DATA_VIEW,
  PERMISSIONS.REPORT_VIEW,
  PERMISSIONS.TASK_COMPLETE,
  // Document creation permission
  PERMISSIONS.DOCUMENT_VIEW,
  PERMISSIONS.DOCUMENT_CREATE
];

const LEAD_PERMISSIONS = [
  // Include all USER permissions
  ...USER_PERMISSIONS,
  // Lead permissions
  PERMISSIONS.DOCUMENT_REVIEW,
  PERMISSIONS.DOCUMENT_EDIT
];

const BRANCH_MANAGER_PERMISSIONS = [
  // Include all LEAD permissions
  ...LEAD_PERMISSIONS,
  // Branch Manager permissions
  PERMISSIONS.DATA_EDIT,
  PERMISSIONS.DATA_CREATE,
  PERMISSIONS.DOCUMENT_APPROVE,
  PERMISSIONS.DOCUMENT_REJECT,
  PERMISSIONS.USER_VIEW,
  // Branch-specific permissions
  PERMISSIONS.BRANCH_MANAGE,
  PERMISSIONS.BRANCH_REPORTS_VIEW,
  PERMISSIONS.BRANCH_ANALYTICS_VIEW
];

const PROVINCE_MANAGER_PERMISSIONS = [
  // Include all BRANCH_MANAGER permissions
  ...BRANCH_MANAGER_PERMISSIONS,
  // Province Manager specific permissions
  PERMISSIONS.DATA_EXPORT,
  PERMISSIONS.DATA_IMPORT,
  // Province-specific permissions
  PERMISSIONS.PROVINCE_MANAGE,
  PERMISSIONS.PROVINCE_REPORTS_VIEW,
  PERMISSIONS.PROVINCE_ANALYTICS_VIEW
];

const GENERAL_MANAGER_PERMISSIONS = [
  // Include all PROVINCE_MANAGER permissions
  ...PROVINCE_MANAGER_PERMISSIONS,
  // General Manager permissions
  PERMISSIONS.CONTENT_EDIT,
  PERMISSIONS.CONTENT_CREATE,
  PERMISSIONS.TASK_ASSIGN,
  PERMISSIONS.REPORT_CREATE,
  // Additional strategic permissions
  PERMISSIONS.SYSTEM_SETTINGS_VIEW
];

const ADMIN_PERMISSIONS = [
  // Include all GENERAL_MANAGER permissions
  ...GENERAL_MANAGER_PERMISSIONS,
  // Admin permissions
  PERMISSIONS.USER_EDIT,
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_ROLE_EDIT,
  PERMISSIONS.USER_INVITE,
  PERMISSIONS.DATA_DELETE,
  PERMISSIONS.CONTENT_DELETE,
  PERMISSIONS.CONTENT_PUBLISH,
  PERMISSIONS.SYSTEM_LOGS_VIEW,
  // Document deletion permission
  PERMISSIONS.DOCUMENT_DELETE
];

// Map roles to their permissions
export const ROLE_PERMISSIONS: Record<string | UserRole, string[]> = {
  [ROLES.GUEST]: GUEST_PERMISSIONS,
  [ROLES.USER]: USER_PERMISSIONS,
  [ROLES.LEAD]: LEAD_PERMISSIONS,
  [ROLES.BRANCH_MANAGER]: BRANCH_MANAGER_PERMISSIONS,
  [ROLES.PROVINCE_MANAGER]: PROVINCE_MANAGER_PERMISSIONS,
  [ROLES.GENERAL_MANAGER]: GENERAL_MANAGER_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  [ROLES.DEVELOPER]: Object.values(PERMISSIONS) // All permissions
};
