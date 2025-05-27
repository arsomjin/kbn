import { ROLES, ROLE_CATEGORIES, RoleCategory, UserRole } from '../constants/roles';

/**
 * =============================================================================
 * CORE ROLE CHECKING FUNCTIONS
 * =============================================================================
 */

/**
 * Check if user has admin access (super-admin, executive, or developer)
 * @param role The user's role
 * @returns boolean indicating if user has admin access
 */
export const hasAdminAccess = (role) => {
  if (!role) return false;
  return (
    hasRolePrivilege(role, ROLES.EXECUTIVE) ||
    hasRolePrivilege(role, ROLES.SUPER_ADMIN) ||
    hasRolePrivilege(role, ROLES.DEVELOPER)
  );
};

/**
 * Check if user has privileged access
 * @param userProfile The user's profile
 * @returns boolean indicating if user has privileged access
 */
export const hasPrivilegedAccess = (userProfile) => {
  if (!userProfile) return false;
  return hasAdminAccess(userProfile?.role);
};

/**
 * Returns a numeric privilege level for a given role for easy comparison.
 * Higher number = higher privilege.
 *
 * @param role Role identifier
 * @returns number representing the privilege level (higher number = higher privilege)
 */
export const getPrivilegeLevel = (role) => {
  switch (role) {
    case ROLES.DEVELOPER:
      return 100;
    case ROLES.SUPER_ADMIN:
      return 90;
    case ROLES.EXECUTIVE:
      return 80;
    case ROLES.GENERAL_MANAGER:
      return 70;
    case ROLES.PROVINCE_ADMIN:
      return 60;
    case ROLES.PROVINCE_MANAGER:
      return 50;
    case ROLES.BRANCH_MANAGER:
      return 40;
    case ROLES.LEAD:
      return 30;
    case ROLES.USER:
      return 20;
    case ROLES.PENDING:
      return 5;
    case ROLES.GUEST:
    default:
      return 0;
  }
};

/**
 * Helper function to check if a role has higher or equal privileges than another
 * @param userRole - The role of the current user
 * @param requiredRole - The role being checked against
 * @returns boolean indicating if the user has sufficient privileges
 */
export const hasRolePrivilege = (userRole, requiredRole) => {
  const userRoleLevel = getPrivilegeLevel(userRole);
  const requiredRoleLevel = getPrivilegeLevel(requiredRole);
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * =============================================================================
 * PERMISSION CHECKING FUNCTIONS
 * =============================================================================
 */

/**
 * Checks if the user has all of the required permissions
 * @param userPermissions Array of permission strings assigned to the user
 * @param requiredPermissions Single permission or array of permissions to check for
 * @returns boolean indicating if user has all required permissions
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (typeof requiredPermissions === 'string') {
    return userPermissions.includes(requiredPermissions);
  }

  return requiredPermissions.every((permission) => userPermissions.includes(permission));
};

/**
 * Checks if the user has any of the required permissions
 * @param userPermissions Array of permission strings assigned to the user
 * @param requiredPermissions Array of permissions to check for
 * @returns boolean indicating if user has any of the required permissions
 */
export const hasAnyPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || userPermissions.length === 0 || requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

/**
 * =============================================================================
 * ROUTE AND PATH GENERATION FUNCTIONS
 * =============================================================================
 */

/**
 * Gets the user's access layer based on their role
 * @param userProfile The user's profile
 * @returns string indicating the access layer
 */
export const getUserAccessLayer = (userProfile) => {
  if (!userProfile) return 'guest';

  const role = userProfile?.role;

  if (role === ROLES.EXECUTIVE || role === ROLES.DEVELOPER || role === ROLES.SUPER_ADMIN) {
    return 'executive';
  }

  if (role === ROLES.GENERAL_MANAGER) {
    return 'general_manager';
  }

  if (role === ROLES.PROVINCE_MANAGER || role === ROLES.PROVINCE_ADMIN) {
    return 'province';
  }

  if (role === ROLES.BRANCH_MANAGER) {
    return 'branch_manager';
  }

  if (role === ROLES.LEAD || role === ROLES.USER) {
    return 'branch_staff';
  }

  return 'guest';
};

/**
 * Gets the appropriate route prefix for a user based on their role and context
 * Implements the 4-layer route structure as defined in the route guide:
 * - Executive: /
 * - Province: /{provinceId}/
 * - Branch Manager: /{provinceId}/{branchCode}/
 * - Branch Staff: /{provinceId}/{branchCode}/
 *
 * @param userProfile The user's profile
 * @returns string route prefix for the user's access layer
 */
export const getUserRoutePrefix = (userProfile) => {
  if (!userProfile) return '/';

  const role = userProfile?.role;

  // Executive layer - root level access
  if (
    role === ROLES.EXECUTIVE ||
    role === ROLES.DEVELOPER ||
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.GENERAL_MANAGER
  ) {
    return '/';
  }

  // Province layer
  if (role === ROLES.PROVINCE_MANAGER || role === ROLES.PROVINCE_ADMIN) {
    const provinceId = userProfile.provinceId || userProfile.province;
    if (provinceId) {
      return `/${provinceId}/`;
    }
    return '/';
  }

  // Branch layer (both manager and staff)
  if (role === ROLES.BRANCH_MANAGER || role === ROLES.LEAD || role === ROLES.USER) {
    const provinceId = userProfile.provinceId || userProfile.province;
    const branchCode =
      userProfile?.employeeInfo?.branch || userProfile?.branch || userProfile?.branchCode;

    if (provinceId && branchCode) {
      return `/${provinceId}/${branchCode}/`;
    } else if (provinceId) {
      return `/${provinceId}/`;
    }
  }

  // Fallback to root
  return '/';
};

/**
 * UNIFIED HOME PATH FUNCTION - Merges getUserHomePath and getLandingPage
 * Returns the correct home/landing path based on user profile and role.
 * @param userProfile The user's profile
 * @param isProfileComplete Whether the profile is complete (optional)
 * @returns string path to the appropriate home page
 */
export const getUserHomePath = (userProfile, isProfileComplete = true) => {
  // If profile is incomplete or missing, go to complete-profile
  if (!isProfileComplete || !userProfile) return '/complete-profile';

  const role = userProfile?.role;

  // Handle special roles first
  if (role === ROLES.PENDING) return '/pending';
  if (role === ROLES.GUEST) return '/visitor/dashboard';

  // Executive level roles
  if (role === ROLES.EXECUTIVE || role === ROLES.DEVELOPER) {
    return '/overview';
  }

  // Admin/Manager level roles
  if (role === ROLES.SUPER_ADMIN || role === ROLES.GENERAL_MANAGER) {
    return '/dashboard';
  }

  // Province level roles
  if (role === ROLES.PROVINCE_MANAGER || role === ROLES.PROVINCE_ADMIN) {
    const provinceId = userProfile.provinceId || userProfile.province;
    if (provinceId) {
      return `/${provinceId}/dashboard`;
    }
    return '/landing';
  }

  // Branch level roles
  if (role === ROLES.BRANCH_MANAGER || role === ROLES.LEAD || role === ROLES.USER) {
    const provinceId = userProfile.provinceId || userProfile.province;
    const branchCode =
      userProfile?.employeeInfo?.branch || userProfile?.branch || userProfile?.branchCode;

    if (provinceId && branchCode) {
      // Branch managers and leads get dashboard, users get landing
      const pageSuffix =
        role === ROLES.BRANCH_MANAGER || role === ROLES.LEAD ? 'dashboard' : 'landing';
      return `/${provinceId}/${branchCode}/${pageSuffix}`;
    }

    if (provinceId) {
      return `/${provinceId}/landing`;
    }

    return '/landing';
  }

  // Fallback
  return '/landing';
};

/**
 * LEGACY SUPPORT - Alias for getUserHomePath for backward compatibility
 * @deprecated Use getUserHomePath instead
 */
export const getLandingPage = getUserHomePath;

/**
 * Generate path based on user role and path name
 * @param userProfile The user's profile
 * @param pathName The path name to generate
 * @returns string path with appropriate prefix
 */
export const getPathFromRole = (userProfile, pathName) => {
  const prefix = getUserRoutePrefix(userProfile);

  // Handle root prefix
  if (prefix === '/') {
    return `/${pathName}`;
  }

  // Handle prefixed paths
  return `${prefix}${pathName}`;
};

/**
 * =============================================================================
 * LAYER ACCESS CONTROL FUNCTIONS
 * =============================================================================
 */

/**
 * Checks if a user should have access to a specific route based on their layer
 * @param userProfile The user's profile
 * @param routePath The route path to check
 * @returns boolean indicating if access should be allowed
 */
export const shouldAllowRouteAccess = (userProfile, routePath) => {
  if (!userProfile || !routePath) return false;

  const userLayer = getUserAccessLayer(userProfile);
  const userPrefix = getUserRoutePrefix(userProfile);

  // Executive layer can access all routes
  if (['executive', 'general_manager'].includes(userLayer)) {
    return true;
  }

  // For other layers, check if route starts with their allowed prefix
  return routePath.startsWith(userPrefix);
};

/**
 * Gets the correct redirect path for a user trying to access a route outside their layer
 * @param userProfile The user's profile
 * @param attemptedPath The path they tried to access
 * @returns string redirect path
 */
export const getLayerRedirectPath = (userProfile, attemptedPath = '') => {
  if (!userProfile) return '/landing';

  const userPrefix = getUserRoutePrefix(userProfile);
  const userLayer = getUserAccessLayer(userProfile);

  // For executive, no redirection needed
  if (['executive', 'general_manager'].includes(userLayer)) {
    return attemptedPath || getUserHomePath(userProfile);
  }

  // Extract the module/feature from attempted path
  const pathParts = attemptedPath.replace(/^\/+/, '').split('/');
  let targetModule = '';

  // Try to preserve the intended module/feature
  if (userLayer === 'province') {
    // For province users, skip province ID and get the module
    targetModule = pathParts.length > 1 ? pathParts[1] : '';
  } else if (userLayer === 'branch_manager' || userLayer === 'branch_staff') {
    // For branch users, skip province and branch, get the module
    targetModule = pathParts.length > 2 ? pathParts[2] : '';
  } else {
    // For other cases, take the first part as module
    targetModule = pathParts[0] || '';
  }

  // Redirect to user's layer with the same module if possible
  if (targetModule && targetModule !== 'admin' && targetModule !== 'special-settings') {
    return `${userPrefix}${targetModule}`;
  }

  // Fallback to user's home path
  return getUserHomePath(userProfile);
};

/**
 * =============================================================================
 * DISPLAY AND UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Gets a display-friendly name for a given role
 * @param role Role identifier
 * @returns User-friendly label for the role
 */
export const getRoleDisplayName = (role) => {
  const roleLabels = {
    [ROLES.GUEST]: 'Guest',
    [ROLES.USER]: 'Standard User',
    [ROLES.PENDING]: 'Pending Approval',
    [ROLES.LEAD]: 'Team Lead',
    [ROLES.BRANCH_MANAGER]: 'Branch Manager',
    [ROLES.PROVINCE_MANAGER]: 'Province Manager',
    [ROLES.PROVINCE_ADMIN]: 'Province Administrator',
    [ROLES.GENERAL_MANAGER]: 'General Manager',
    [ROLES.EXECUTIVE]: 'Privileged User',
    [ROLES.SUPER_ADMIN]: 'System Administrator',
    [ROLES.DEVELOPER]: 'Developer',
  };

  return roleLabels[role] || role;
};

/**
 * Get color for role tag based on role type
 * @param role - The role to get color for
 * @returns string - Color name for Ant Design Tag component
 */
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.SUPER_ADMIN]: 'magenta',
    [ROLES.PROVINCE_ADMIN]: 'red',
    [ROLES.EXECUTIVE]: 'volcano',
    [ROLES.GENERAL_MANAGER]: 'orange',
    [ROLES.PROVINCE_MANAGER]: 'gold',
    [ROLES.BRANCH_MANAGER]: 'lime',
    [ROLES.LEAD]: 'green',
    [ROLES.USER]: 'cyan',
    [ROLES.PENDING]: 'purple',
    [ROLES.GUEST]: 'default',
    [ROLES.DEVELOPER]: 'geekblue',
  };

  return roleColors[role] || 'default';
};

/**
 * =============================================================================
 * HELPER FUNCTIONS FOR ROLE CATEGORIES
 * =============================================================================
 */

// Helper to map role strings to UserRole enum
const mapRoles = (roles) => roles.map((role) => UserRole[role.toUpperCase()]);

// Helper for PermissionProtectedRoute props
export const getAllowedRolesByCategory = (category) => mapRoles(ROLE_CATEGORIES[category]);

/**
 * Check if a role belongs to a specific category
 * @param role The role to check
 * @param category The category to check against
 * @returns boolean indicating if role belongs to category
 */
export const isRoleInCategory = (role, category) => {
  const allowedRoles = getAllowedRolesByCategory(category);
  return allowedRoles.includes(role);
};
