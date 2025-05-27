import { PERMISSIONS } from './Permissions';

/**
 * User role enum defining all possible roles in the system
 */
export const UserRole = {
  EXECUTIVE: 'executive',
  DEVELOPER: 'developer',
  SUPER_ADMIN: 'super_admin',
  GENERAL_MANAGER: 'general_manager',
  PROVINCE_ADMIN: 'province_admin', // Province level admin
  PROVINCE_MANAGER: 'province_manager', // Province level manager
  BRANCH_MANAGER: 'branch_manager', // Branch level manager
  LEAD: 'lead', // Document reviewers
  USER: 'user',
  GUEST: 'guest',
  PENDING: 'pending',
};

/**
 * Role categories for grouping roles by access level
 */
export const RoleCategory = {
  DEVELOPER: 'developer',
  SUPER_ADMIN: 'super_admin',
  EXECUTIVE: 'executive',
  GENERAL_MANAGER: 'general_manager',
  PROVINCE_ADMIN: 'province_admin',
  PROVINCE_MANAGER: 'province_manager',
  BRANCH_MANAGER: 'branch_manager',
  BRANCH_STAFF: 'branch_staff', // For LEAD and USER roles at branch level
  LEAD: 'lead',
  USER: 'user',
  GUEST: 'guest',
};

/**
 * Role constants for consistent role references throughout the app
 */
export const ROLES = {
  EXECUTIVE: 'executive',
  DEVELOPER: 'developer',
  SUPER_ADMIN: 'super_admin',
  GENERAL_MANAGER: 'general_manager',
  PROVINCE_ADMIN: 'province_admin',
  PROVINCE_MANAGER: 'province_manager',
  BRANCH_MANAGER: 'branch_manager',
  LEAD: 'lead',
  USER: 'user',
  GUEST: 'guest',
  PENDING: 'pending',
};

/**
 * Role hierarchy - used for permission checking
 * Lower numbers are higher in the hierarchy (have more permissions)
 */
export const ROLE_HIERARCHY = {
  // Following the specified hierarchy:
  // developer -> super_admin -> executive -> general_manager ->
  // province_admin -> province_manager -> branch_manager -> lead -> user -> branch -> pending -> guest
  [ROLES.DEVELOPER]: 0,
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.EXECUTIVE]: 2,
  [ROLES.GENERAL_MANAGER]: 3,
  [ROLES.PROVINCE_ADMIN]: 4,
  [ROLES.PROVINCE_MANAGER]: 5,
  [ROLES.BRANCH_MANAGER]: 6,
  [ROLES.LEAD]: 7,
  [ROLES.USER]: 8,
  [ROLES.PENDING]: 9,
  [ROLES.GUEST]: 10,
};

/**
 * Role display names for UI presentation
 * These are translation keys that should be defined in the i18n files
 */
export const ROLE_DISPLAY_KEYS = {
  [ROLES.GUEST]: 'roles.guest',
  [ROLES.PENDING]: 'roles.pending',
  [ROLES.USER]: 'roles.user',
  [ROLES.LEAD]: 'roles.lead',
  [ROLES.BRANCH_MANAGER]: 'roles.branch_manager',
  [ROLES.PROVINCE_MANAGER]: 'roles.province_manager',
  [ROLES.GENERAL_MANAGER]: 'roles.general_manager',
  [ROLES.PROVINCE_ADMIN]: 'roles.province_admin',
  [ROLES.SUPER_ADMIN]: 'roles.super_admin',
  [ROLES.EXECUTIVE]: 'roles.executive',
  [ROLES.DEVELOPER]: 'roles.developer',
};

/**
 * Role categorization - defines which roles belong to each category
 */
export const ROLE_CATEGORIES = {
  [RoleCategory.DEVELOPER]: [ROLES.DEVELOPER],
  [RoleCategory.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER],
  [RoleCategory.EXECUTIVE]: [ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.EXECUTIVE],
  [RoleCategory.GENERAL_MANAGER]: [
    ROLES.GENERAL_MANAGER,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
    ROLES.EXECUTIVE,
  ],
  [RoleCategory.PROVINCE_ADMIN]: [
    ROLES.PROVINCE_ADMIN,
    ROLES.GENERAL_MANAGER,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
    ROLES.EXECUTIVE,
  ],
  [RoleCategory.PROVINCE_MANAGER]: [
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
  [RoleCategory.BRANCH_MANAGER]: [
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
  [RoleCategory.BRANCH_STAFF]: [
    ROLES.LEAD,
    ROLES.USER,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
  [RoleCategory.LEAD]: [
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
  [RoleCategory.USER]: [
    ROLES.USER,
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
  [RoleCategory.GUEST]: [
    ROLES.GUEST,
    ROLES.PENDING,
    ROLES.USER,
    ROLES.LEAD,
    ROLES.BRANCH_MANAGER,
    ROLES.PROVINCE_MANAGER,
    ROLES.GENERAL_MANAGER,
    ROLES.PROVINCE_ADMIN,
    ROLES.EXECUTIVE,
    ROLES.SUPER_ADMIN,
    ROLES.DEVELOPER,
  ],
};

// Role-Permission mapping
// Define permissions for each role
const GUEST_PERMISSIONS = [
  // Public access permissions
  PERMISSIONS.CONTENT_VIEW,
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
  PERMISSIONS.DOCUMENT_CREATE,
  // Basic HR permissions
  PERMISSIONS.EMPLOYEE_VIEW,
  PERMISSIONS.LEAVE_VIEW,
  PERMISSIONS.LEAVE_CREATE,
  PERMISSIONS.ATTENDANCE_VIEW,
  PERMISSIONS.ATTENDANCE_CREATE,
];

const LEAD_PERMISSIONS = [
  // Include all USER permissions
  ...USER_PERMISSIONS,
  // Lead permissions
  PERMISSIONS.DOCUMENT_REVIEW,
  PERMISSIONS.DOCUMENT_EDIT,
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
  PERMISSIONS.BRANCH_ANALYTICS_VIEW,
  // HR management permissions
  PERMISSIONS.EMPLOYEE_EDIT,
  PERMISSIONS.EMPLOYEE_CREATE,
  PERMISSIONS.LEAVE_APPROVE,
  PERMISSIONS.LEAVE_REJECT,
  PERMISSIONS.ATTENDANCE_EDIT,
  PERMISSIONS.ATTENDANCE_IMPORT,
  PERMISSIONS.HR_REPORTS_VIEW,
  PERMISSIONS.HR_SETTINGS_VIEW,
  // Additional account permissions
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.MANAGE_REPORTS,
  PERMISSIONS.VIEW_ACCOUNTS,
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
  PERMISSIONS.PROVINCE_ANALYTICS_VIEW,
  // HR administrative permissions
  PERMISSIONS.EMPLOYEE_DELETE,
  PERMISSIONS.HR_REPORTS_CREATE,
  PERMISSIONS.HR_SETTINGS_EDIT,
  // Additional account permissions
  PERMISSIONS.MANAGE_ACCOUNTS,
  PERMISSIONS.VIEW_SETTINGS,
  PERMISSIONS.MANAGE_INCOME,
  PERMISSIONS.MANAGE_EXPENSE,
  PERMISSIONS.MANAGE_REPORTS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.MANAGE_SETTINGS,
];

const PROVINCE_ADMIN_PERMISSIONS = [
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
  PERMISSIONS.DOCUMENT_DELETE,
  // HR administrative permissions
  PERMISSIONS.LEAVE_EDIT,
  // Additional account permissions
  PERMISSIONS.MANAGE_SETTINGS,
  PERMISSIONS.VIEW_USERS,
  PERMISSIONS.VIEW_ROLES,
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
  PERMISSIONS.SYSTEM_SETTINGS_VIEW,
  // Additional account permissions
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.MANAGE_PROVINCES,
];

/**
 * Map roles to their permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: GUEST_PERMISSIONS,
  [ROLES.PENDING]: GUEST_PERMISSIONS,
  [ROLES.USER]: USER_PERMISSIONS,
  [ROLES.LEAD]: LEAD_PERMISSIONS,
  [ROLES.BRANCH_MANAGER]: BRANCH_MANAGER_PERMISSIONS,
  [ROLES.PROVINCE_MANAGER]: PROVINCE_MANAGER_PERMISSIONS,
  [ROLES.PROVINCE_ADMIN]: PROVINCE_ADMIN_PERMISSIONS,
  [ROLES.GENERAL_MANAGER]: GENERAL_MANAGER_PERMISSIONS,
  [ROLES.EXECUTIVE]: Object.values(PERMISSIONS),
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.DEVELOPER]: Object.values(PERMISSIONS),
};
