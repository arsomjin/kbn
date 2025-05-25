import { ROLES, ROLE_CATEGORIES, UserRole } from '../constants/roles';

/**
 * Determines if the user has privilege access based on their role and permissions
 *
 * @param userProfile The user's profile
 * @param userPermissions Array of permission strings assigned to the user
 * @returns boolean indicating if user has privilege access
 */
/**
 * Check if user has admin access (super-admin, privilege, or developer)
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

export const hasPrivilegedAccess = (userProfile) => {
  if (!userProfile) return false;

  // Only allow EXECUTIVE and SUPER_ADMIN roles
  if (hasAdminAccess(userProfile.role)) {
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
 * @returns string path to the appropriate landing page
 */
export const getLandingPage = (userProfile) => {
  console.log('getLandingPage', userProfile);
  if (!userProfile) return '/';
  const role = userProfile.role;
  if (role === ROLES.EXECUTIVE || role === ROLES.DEVELOPER) {
    return '/overview';
  }
  if (role === ROLES.SUPER_ADMIN || role === ROLES.GENERAL_MANAGER) {
    return '/dashboard';
  }
  if (role === ROLES.PROVINCE_MANAGER || role === ROLES.PROVINCE_ADMIN) {
    const provinceId = userProfile.provinceId || userProfile.province;
    if (provinceId) {
      return `/${provinceId}/dashboard`;
    }
    return '/landing';
  }
  if (role === ROLES.LEAD || role === ROLES.USER || role === ROLES.BRANCH_MANAGER) {
    const provinceId = userProfile.provinceId || userProfile.province;
    const branchCode =
      userProfile.employeeInfo?.branch || userProfile.branch || userProfile.branchCode;
    if (provinceId && branchCode) {
      return `/${provinceId}/${branchCode}/dashboard`;
    }
    return '/landing';
  }
  if (role === ROLES.GUEST) {
    return '/landing';
  }
  if (role === ROLES.PENDING) {
    return '/pending';
  }
  // fallback
  return '/landing';
};

export const getPathFromRole = (userProfile, pathName) => {
  const role = userProfile?.role;
  switch (role) {
    case ROLES.EXECUTIVE:
    case ROLES.DEVELOPER:
    case ROLES.SUPER_ADMIN:
    case ROLES.GENERAL_MANAGER:
      return `/${pathName}`;
    case ROLES.PROVINCE_MANAGER:
    case ROLES.PROVINCE_ADMIN: {
      const provinceId = userProfile?.provinceId || userProfile?.province;
      if (provinceId) {
        return `/${provinceId}/${pathName}`;
      }
      return getUserHomePath(userProfile);
    }
    case ROLES.LEAD:
    case ROLES.USER:
    case ROLES.BRANCH_MANAGER: {
      const branchCode =
        userProfile?.employeeInfo?.branch || userProfile?.branch || userProfile?.branchCode;
      const userProvinceId = userProfile?.provinceId || userProfile?.province;
      if (userProvinceId && branchCode) {
        return `/${userProvinceId}/${branchCode}/${pathName}`;
      } else if (userProvinceId) {
        return `/${userProvinceId}/${pathName}`;
      }
      return getUserHomePath(userProfile);
    }
    default:
      return '/landing';
  }
};

/**
 * Returns the correct landing/redirect path based on user profile and role.
 * Used for both menu and root redirect logic.
 */
export const getUserHomePath = (userProfile, isProfileComplete) => {
  // If profile is incomplete or missing, go to complete-profile
  if (!isProfileComplete || !userProfile) return '/complete-profile';
  const role = userProfile.role;
  if (role === UserRole.EXECUTIVE || role === UserRole.DEVELOPER) {
    return '/overview';
  }
  if (role === UserRole.SUPER_ADMIN || role === UserRole.GENERAL_MANAGER) {
    return '/dashboard';
  }
  if (role === UserRole.PROVINCE_MANAGER || role === UserRole.PROVINCE_ADMIN) {
    const provinceId = userProfile.provinceId;
    if (provinceId) {
      return `/${provinceId}/dashboard`;
    }
    return '/landing';
  }
  if (role === UserRole.LEAD || role === UserRole.USER || role === UserRole.BRANCH_MANAGER) {
    const provinceId = userProfile.provinceId;
    const branchCode = userProfile.employeeInfo?.branch;
    if (provinceId && branchCode) {
      return `/${provinceId}/${branchCode}/dashboard`;
    } else if (provinceId) {
      return `/${provinceId}/dashboard`;
    }
    return '/landing';
  }
  if (role === UserRole.GUEST) {
    return '/landing';
  }
  if (role === UserRole.PENDING) {
    return '/pending';
  }
  // fallback
  return '/landing';
};

/**
 * Gets a display-friendly name for a given role
 *
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
 * Checks if the user has all of the required permissions
 *
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
 *
 * @param userPermissions Array of permission strings assigned to the user
 * @param requiredPermissions Array of permissions to check for
 * @returns boolean indicating if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Returns a numeric privilege level for a given role for easy comparison.
 * Higher number = higher privilege.
 *
 * @param role Role identifier
 * @returns number representing the privilege level (higher number = higher privilege)
 */
export const getPrivilegeLevel = (role) => {
  // Hierarchy: developer -> super_admin -> privilege -> general_manager ->
  // province_admin -> province_manager -> branch_manager -> lead -> user -> branch -> pending -> guest

  switch (role) {
    // Super admin levels
    case ROLES.DEVELOPER:
      return 100;
    case ROLES.SUPER_ADMIN:
      return 90;

    // Privileged level
    case ROLES.EXECUTIVE:
      return 80;

    // General Manager level
    case ROLES.GENERAL_MANAGER:
      return 70;

    // Admin levels
    case ROLES.PROVINCE_ADMIN:
      return 60;

    // Manager levels
    case ROLES.PROVINCE_MANAGER:
      return 50;
    case ROLES.BRANCH_MANAGER:
      return 40;

    // Standard staff levels
    case ROLES.LEAD:
      return 30;
    case ROLES.USER:
      return 20;
    // Limited access levels
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

  // Lower numbers have higher privilege
  return userRoleLevel <= requiredRoleLevel;
};

// Helper to map role strings to UserRole enum
const mapRoles = (roles) => roles.map((role) => UserRole[role.toUpperCase()]);

// Helper for PermissionProtectedRoute props
export const getAllowedRolesByCategory = (category) => mapRoles(ROLE_CATEGORIES[category]);

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
