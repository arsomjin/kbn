import { UserProfile } from '../services/authService';
import { ROLES, isInRoleCategory, RoleCategory } from '../constants/roles';
import { PERMISSIONS } from '../constants/Permissions';

/**
 * Determines if the user has privileged access based on their role and permissions
 *
 * @param userProfile The user's profile
 * @param userPermissions Array of permission strings assigned to the user
 * @returns boolean indicating if user has privileged access
 */
export const hasPrivilegedAccess = (userProfile: UserProfile | null, userPermissions: string[] = []): boolean => {
  if (!userProfile) return false;

  // Only allow PRIVILEGED and SUPER_ADMIN roles
  if (
    isInRoleCategory(userProfile.role, RoleCategory.PRIVILEGED) ||
    isInRoleCategory(userProfile.role, RoleCategory.SUPER_ADMIN) ||
    isInRoleCategory(userProfile.role, RoleCategory.DEVELOPER)
  ) {
    return true;
  }

  // Optionally, check for specific permissions if you want to allow permission-based access
  // (Remove or comment out the following block if you want only role-based access)
  // if (
  //   userPermissions.includes(PERMISSIONS.USER_VIEW) ||
  //   userPermissions.includes(PERMISSIONS.CONTENT_EDIT) ||
  //   userPermissions.includes(PERMISSIONS.DATA_EDIT)
  // ) {
  //   return true;
  // }

  return false;
};

/**
 * Determines the appropriate landing page for a user based on their role/permissions
 *
 * @param userProfile The user's profile
 * @param userPermissions Array of permission strings assigned to the user
 * @returns string path to the appropriate landing page
 */
export const getLandingPage = (userProfile: UserProfile | null, userPermissions: string[] = []): string => {
  if (!userProfile) {
    return '/login';
  }

  if (userProfile.role === ROLES.PENDING) {
    return '/pending';
  }

  // Privileged users go to the overview page
  if (hasPrivilegedAccess(userProfile, userPermissions)) {
    return '/overview';
  }
  
  // GENERAL_MANAGER and PROVINCE_MANAGER go to dashboard
  if (userProfile.role === ROLES.GENERAL_MANAGER || userProfile.role === ROLES.PROVINCE_MANAGER) {
    return '/dashboard';
  }
  
  // BRANCH_MANAGER goes to branch-dashboard
  if (userProfile.role === ROLES.BRANCH_MANAGER) {
    return '/branch-dashboard';
  }
  
  // All other authenticated users go to landing
  return '/landing';
};

/**
 * Gets a display-friendly name for a given role
 *
 * @param role Role identifier
 * @returns User-friendly label for the role
 */
export const getRoleDisplayName = (role: string): string => {
  const roleLabels: Record<string, string> = {
    [ROLES.GUEST]: 'Guest',
    [ROLES.USER]: 'Standard User',
    [ROLES.PENDING]: 'Pending Approval',
    [ROLES.BRANCH]: 'Branch User',
    [ROLES.LEAD]: 'Team Lead',
    [ROLES.BRANCH_MANAGER]: 'Branch Manager',
    [ROLES.PROVINCE_MANAGER]: 'Province Manager',
    [ROLES.GENERAL_MANAGER]: 'General Manager',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.PRIVILEGED]: 'Privileged User',
    [ROLES.SUPER_ADMIN]: 'System Administrator',
    [ROLES.DEVELOPER]: 'Developer'
  };

  return roleLabels[role] || role;
};

/**
 * Checks if the user has all of the required permissions
 *
 * @param userPermissions Array of permission strings assigned to the user
 * @param requiredPermissions Single permission or array of permissions to check for
 * @returns boolean indicating if user has all required permissions
 */
export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string | string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (typeof requiredPermissions === 'string') {
    return userPermissions.includes(requiredPermissions);
  }

  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/**
 * Checks if the user has any of the required permissions
 *
 * @param userPermissions Array of permission strings assigned to the user
 * @param requiredPermissions Array of permissions to check for
 * @returns boolean indicating if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Returns a numeric privilege level for a given role for easy comparison.
 * Higher number = higher privilege.
 */
export const getPrivilegeLevel = (role: string): number => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 9;
    case ROLES.DEVELOPER:
      return 8; 
    case ROLES.PRIVILEGED:
      return 7;
    case ROLES.ADMIN:
      return 6;
    case ROLES.GENERAL_MANAGER:
      return 5; // Higher than PROVINCE_MANAGER
    case ROLES.PROVINCE_MANAGER:
      return 4;
    case ROLES.BRANCH_MANAGER:
      return 3;
    case ROLES.LEAD:
      return 2;
    case ROLES.USER:
      return 1;
    case ROLES.BRANCH:
      return 1;
    case ROLES.PENDING:
      return 0.5;
    case ROLES.GUEST:
    default:
      return 0;
  }
};
