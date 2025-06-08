/**
 * PermissionGate Component for KBN Multi-Province System
 * Wrapper component that conditionally renders content based on user permissions and geographic access
 */

import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Permission Gate Component
 * @param {Object} props
 * @param {string} props.permission - Required permission to show content
 * @param {string} props.province - Province context for geographic checking
 * @param {string} props.branch - Branch context for geographic checking
 * @param {React.ReactNode} props.children - Content to show if permission granted
 * @param {React.ReactNode} props.fallback - Content to show if permission denied
 * @param {boolean} props.requireGeographic - Whether to enforce geographic access
 * @param {boolean} props.showLoading - Whether to show loading state while checking
 * @param {string} props.role - Required role (alternative to permission)
 * @param {Array} props.anyOf - Array of permissions (user needs any one)
 * @param {Array} props.allOf - Array of permissions (user needs all)
 * @param {Function} props.customCheck - Custom permission check function
 */
const PermissionGate = ({
  permission,
  province,
  branch,
  children,
  fallback = null,
  requireGeographic = true,
  showLoading = false,
  role,
  anyOf,
  allOf,
  customCheck,
  className,
  style,
  debug = false
}) => {
  const {
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    userRole,
    isSuperAdmin,
    isExecutive,
    canUserAccessProvince,
    canUserAccessBranch
  } = usePermissions();

  // Debug logging
  if (debug) {
    console.log('PermissionGate Debug:', {
      permission,
      province,
      branch,
      userRole,
      isSuperAdmin,
      requireGeographic
    });
  }

  // Super admin and executive bypass
  if (isSuperAdmin || isExecutive) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Custom check function
  if (customCheck && typeof customCheck === 'function') {
    const hasAccess = customCheck({
      hasPermission,
      hasGeographicAccess,
      userRole,
      province,
      branch,
      canUserAccessProvince,
      canUserAccessBranch
    });

    if (!hasAccess) {
      return fallback;
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Role-based check
  if (role) {
    if (userRole !== role) {
      return fallback;
    }

    // Still check geographic access if required
    if (requireGeographic) {
      const context = { province, branch };
      if (!hasGeographicAccess(context)) {
        return fallback;
      }
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Multiple permissions check (anyOf)
  if (anyOf && Array.isArray(anyOf)) {
    const hasAnyPermission = anyOf.some(perm => {
      if (requireGeographic) {
        return hasFullAccess(perm, { province, branch });
      }
      return hasPermission(perm);
    });

    if (!hasAnyPermission) {
      return fallback;
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Multiple permissions check (allOf)
  if (allOf && Array.isArray(allOf)) {
    const hasAllPermissions = allOf.every(perm => {
      if (requireGeographic) {
        return hasFullAccess(perm, { province, branch });
      }
      return hasPermission(perm);
    });

    if (!hasAllPermissions) {
      return fallback;
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Single permission check
  if (permission) {
    if (requireGeographic) {
      const context = { province, branch };
      if (!hasFullAccess(permission, context)) {
        return fallback;
      }
    } else {
      if (!hasPermission(permission)) {
        return fallback;
      }
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Geographic-only check
  if (!permission && !role && !anyOf && !allOf && requireGeographic) {
    const context = { province, branch };
    if (!hasGeographicAccess(context)) {
      return fallback;
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // No restrictions - show content
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

PermissionGate.propTypes = {
  permission: PropTypes.string,
  province: PropTypes.string,
  branch: PropTypes.string,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  requireGeographic: PropTypes.bool,
  showLoading: PropTypes.bool,
  role: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  allOf: PropTypes.arrayOf(PropTypes.string),
  customCheck: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  debug: PropTypes.bool
};

/**
 * Higher-order component version of PermissionGate
 */
export const withPermission = (permissionConfig) => (WrappedComponent) => {
  const WithPermissionComponent = (props) => (
    <PermissionGate {...permissionConfig}>
      <WrappedComponent {...props} />
    </PermissionGate>
  );

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithPermissionComponent;
};

/**
 * Hook version for conditional rendering
 */
export const usePermissionGate = (permissionConfig) => {
  const {
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    userRole,
    isSuperAdmin,
    isExecutive
  } = usePermissions();

  const {
    permission,
    province,
    branch,
    requireGeographic = true,
    role,
    anyOf,
    allOf
  } = permissionConfig;

  // Super admin and executive bypass
  if (isSuperAdmin || isExecutive) return true;

  // Role-based check
  if (role && userRole !== role) return false;

  // Multiple permissions check (anyOf)
  if (anyOf && Array.isArray(anyOf)) {
    return anyOf.some(perm => {
      if (requireGeographic) {
        return hasFullAccess(perm, { province, branch });
      }
      return hasPermission(perm);
    });
  }

  // Multiple permissions check (allOf)
  if (allOf && Array.isArray(allOf)) {
    return allOf.every(perm => {
      if (requireGeographic) {
        return hasFullAccess(perm, { province, branch });
      }
      return hasPermission(perm);
    });
  }

  // Single permission check
  if (permission) {
    if (requireGeographic) {
      return hasFullAccess(permission, { province, branch });
    }
    return hasPermission(permission);
  }

  // Geographic-only check
  if (!permission && !role && !anyOf && !allOf && requireGeographic) {
    return hasGeographicAccess({ province, branch });
  }

  return true;
};

export default PermissionGate; 