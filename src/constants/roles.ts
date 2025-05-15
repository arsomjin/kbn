import { PERMISSIONS, Permission } from './permissions';

/**
 * User role enum defining all possible roles in the system
 */
export enum UserRole {
  PRIVILEGE = 'privilege',
  SUPER_ADMIN = 'super_admin',
  PROVINCE_ADMIN = 'province_admin', // Renamed from ADMIN to PROVINCE_ADMIN
  USER = 'user',
  GUEST = 'guest',
  PENDING = 'pending',
  DEVELOPER = 'developer',
  LEAD = 'lead', // Document reviewers
  BRANCH_MANAGER = 'branch_manager', // Branch level manager
  PROVINCE_MANAGER = 'province_manager', // Province level manager
  GENERAL_MANAGER = 'general_manager' // Renamed from MANAGER
}

/**
 * Role categories for grouping roles by access level
 */
export enum RoleCategory {
  SUPER_ADMIN = 'super_admin',
  PRIVILEGE = 'privilege',
  GENERAL_MANAGER = 'general_manager',
  PROVINCE_ADMIN = 'province_admin', // Renamed from ADMIN
  PROVINCE_MANAGER = 'province_manager',
  BRANCH_MANAGER = 'branch_manager',
  BRANCH = 'branch',
  LEAD = 'lead',
  GUEST = 'guest',
  DEVELOPER = 'developer'
}

/**
 * Role constants for consistent role references throughout the app
 */
export const ROLES = {
  GUEST: 'guest',
  PENDING: 'pending',
  USER: 'user',
  BRANCH: 'branch',
  LEAD: 'lead',
  BRANCH_MANAGER: 'branch_manager',
  PROVINCE_MANAGER: 'province_manager',
  GENERAL_MANAGER: 'general_manager',
  PROVINCE_ADMIN: 'province_admin', // Renamed from ADMIN
  PRIVILEGE: 'privilege',
  SUPER_ADMIN: 'super_admin',
  DEVELOPER: 'developer'
} as const;

/**
 * Role type derived from ROLES constant
 */
export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy - used for permission checking
 * Lower numbers are higher in the hierarchy (have more permissions)
 */
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  // Following the specified hierarchy:
  // developer -> super_admin -> privilege -> general_manager ->
  // province_admin -> province_manager -> branch_manager -> lead -> user -> branch -> pending -> guest
  [ROLES.DEVELOPER]: 0,
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.PRIVILEGE]: 2,
  [ROLES.GENERAL_MANAGER]: 3,
  [ROLES.PROVINCE_ADMIN]: 4,
  [ROLES.PROVINCE_MANAGER]: 5,
  [ROLES.BRANCH_MANAGER]: 6,
  [ROLES.LEAD]: 7,
  [ROLES.USER]: 8,
  [ROLES.BRANCH]: 9,
  [ROLES.PENDING]: 10,
  [ROLES.GUEST]: 11
};

/**
 * Role display names for UI presentation
 * These are translation keys that should be defined in the i18n files
 */
export const ROLE_DISPLAY_KEYS: Record<RoleType, string> = {
  [ROLES.GUEST]: 'roles.guest',
  [ROLES.PENDING]: 'roles.pending',
  [ROLES.USER]: 'roles.user',
  [ROLES.BRANCH]: 'roles.branch',
  [ROLES.LEAD]: 'roles.lead',
  [ROLES.BRANCH_MANAGER]: 'roles.branch_manager',
  [ROLES.PROVINCE_MANAGER]: 'roles.province_manager',
  [ROLES.GENERAL_MANAGER]: 'roles.general_manager',
  [ROLES.PROVINCE_ADMIN]: 'roles.province_admin',
  [ROLES.SUPER_ADMIN]: 'roles.super_admin',
  [ROLES.PRIVILEGE]: 'roles.privilege',
  [ROLES.DEVELOPER]: 'roles.developer'
};

/**
 * Role categorization - defines which roles belong to each category
 */
export const ROLE_CATEGORIES: Record<RoleCategory, Array<RoleType>> = {
  [RoleCategory.DEVELOPER]: [ROLES.DEVELOPER],
  [RoleCategory.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.PRIVILEGE]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE],
  [RoleCategory.GENERAL_MANAGER]: [ROLES.GENERAL_MANAGER, ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE],
  [RoleCategory.PROVINCE_ADMIN]: [
    ROLES.PROVINCE_ADMIN,
    ROLES.GENERAL_MANAGER,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
    ROLES.PRIVILEGE
  ],
  [RoleCategory.PROVINCE_MANAGER]: [
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.PRIVILEGE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER
  ],
  [RoleCategory.BRANCH_MANAGER]: [
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.PRIVILEGE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER
  ],
  [RoleCategory.LEAD]: [
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.PRIVILEGE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER
  ],
  [RoleCategory.BRANCH]: [
    ROLES.USER,
    ROLES.BRANCH,
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.PRIVILEGE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER
  ],
  [RoleCategory.GUEST]: [
    ROLES.GUEST,
    ROLES.PENDING,
    ROLES.USER,
    ROLES.BRANCH,
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.PRIVILEGE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER
  ]
};

/**
 * @deprecated Use ROLE_HIERARCHY object instead
 * Role hierarchy (higher index = higher permissions)
 */
export const ROLE_HIERARCHY_OLD: Array<RoleType> = [
  // Order from lowest privilege to highest:
  // guest -> pending -> branch -> user -> lead -> branch_manager -> province_manager ->
  // province_admin -> general_manager -> privilege -> super_admin -> developer
  ROLES.GUEST,
  ROLES.PENDING,
  ROLES.BRANCH,
  ROLES.USER,
  ROLES.LEAD,
  ROLES.BRANCH_MANAGER,
  ROLES.PROVINCE_MANAGER,
  ROLES.PROVINCE_ADMIN,
  ROLES.GENERAL_MANAGER,
  ROLES.PRIVILEGE,
  ROLES.SUPER_ADMIN,
  ROLES.DEVELOPER
];

/**
 * Helper function to check if a role has permission based on hierarchy
 * @param userRole - Current user's role
 * @param requiredRole - Required role for an action
 * @returns boolean indicating if user has sufficient role
 * @deprecated Use hasRolePrivilege instead
 */
export const hasRolePermission = (userRole: RoleType, requiredRole: RoleType): boolean => {
  const userRoleIndex = ROLE_HIERARCHY_OLD.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY_OLD.indexOf(requiredRole);

  // User role must be same or higher in the hierarchy
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Helper function to check if a user belongs to a specific role category
 * @param userRole - Current user's role
 * @param category - Category to check membership in
 * @returns boolean indicating if the role is in the category
 */
export const isInRoleCategory = (userRole: RoleType, category: RoleCategory): boolean => {
  return ROLE_CATEGORIES[category].includes(userRole);
};

/**
 * Helper function to check if a role has higher or equal privileges than another
 * @param userRole - The role of the current user
 * @param requiredRole - The role being checked against
 * @returns boolean indicating if the user has sufficient privileges
 */
export const hasRolePrivilege = (userRole: RoleType, requiredRole: RoleType): boolean => {
  const userRoleLevel = ROLE_HIERARCHY[userRole];
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

  // Lower numbers have higher privilege
  return userRoleLevel <= requiredRoleLevel;
};

// Role-Permission mapping
// Define permissions for each role
const GUEST_PERMISSIONS: Permission[] = [
  // Public access permissions
  PERMISSIONS.CONTENT_VIEW
];

const USER_PERMISSIONS: Permission[] = [
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

const LEAD_PERMISSIONS: Permission[] = [
  // Include all USER permissions
  ...USER_PERMISSIONS,
  // Lead permissions
  PERMISSIONS.DOCUMENT_REVIEW,
  PERMISSIONS.DOCUMENT_EDIT
];

const BRANCH_MANAGER_PERMISSIONS: Permission[] = [
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

const PROVINCE_MANAGER_PERMISSIONS: Permission[] = [
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

const PROVINCE_ADMIN_PERMISSIONS: Permission[] = [
  // Include all PROVINCE_MANAGER permissions
  ...PROVINCE_MANAGER_PERMISSIONS,
  // Province Admin permissions
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

const GENERAL_MANAGER_PERMISSIONS: Permission[] = [
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

/**
 * Map roles to their permissions
 */
export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  [ROLES.GUEST]: GUEST_PERMISSIONS,
  [ROLES.PENDING]: GUEST_PERMISSIONS,
  [ROLES.USER]: USER_PERMISSIONS,
  [ROLES.BRANCH]: USER_PERMISSIONS,
  [ROLES.LEAD]: LEAD_PERMISSIONS,
  [ROLES.BRANCH_MANAGER]: BRANCH_MANAGER_PERMISSIONS,
  [ROLES.PROVINCE_MANAGER]: PROVINCE_MANAGER_PERMISSIONS,
  [ROLES.PROVINCE_ADMIN]: PROVINCE_ADMIN_PERMISSIONS,
  [ROLES.GENERAL_MANAGER]: GENERAL_MANAGER_PERMISSIONS,
  [ROLES.PRIVILEGE]: Object.values(PERMISSIONS) as Permission[],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS) as Permission[],
  [ROLES.DEVELOPER]: Object.values(PERMISSIONS) as Permission[]
};
