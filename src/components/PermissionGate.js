/**
 * Unified PermissionGate Component - SINGLE VERSION
 * Migrated to use Clean Slate RBAC system with backward compatibility
 * This replaces both legacy PermissionGate and CleanSlatePermissionGate
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Alert, Button } from 'antd';
import {
  LockOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

// Use Clean Slate RBAC system as the core
import { usePermissions } from '../hooks/usePermissions';
import { showPermissionWarning } from '../utils/permissionWarnings';

/**
 * Unified Permission Gate Component
 * @param {Object} props
 * @param {string} props.permission - Required permission (department.action format)
 * @param {Array} props.anyOf - Array of permissions (user needs any one)
 * @param {Array} props.allOf - Array of permissions (user needs all)
 * @param {string} props.authority - Required authority level
 * @param {string} props.department - Required department access
 * @param {string} props.role - Legacy role support (mapped to authority)
 * @param {string} props.province - Province context for permission check
 * @param {string} props.branch - Branch context for permission check
 * @param {Object} props.geographic - Geographic context object (Clean Slate format)
 * @param {React.ReactNode} props.children - Content to show if access granted
 * @param {React.ReactNode} props.fallback - Content to show if access denied
 * @param {boolean} props.showFallback - Whether to show fallback or hide completely
 * @param {boolean} props.showLoading - Show loading state
 * @param {boolean} props.loading - Show loading state (alias)
 * @param {boolean} props.requireGeographic - Require geographic context
 * @param {Function} props.customCheck - Custom permission check function
 * @param {string} props.fallbackPermission - Fallback permission if main check fails
 * @param {boolean} props.debug - Enable debug logging
 */
const PermissionGate = ({
  permission,
  anyOf,
  allOf,
  authority,
  department,
  role, // Legacy prop - mapped to authority
  province, // Legacy prop - mapped to geographic.provinceId
  branch, // Legacy prop - mapped to geographic.branchCode
  geographic = {}, // Clean Slate format
  children,
  fallback = null,
  showFallback = true,
  showLoading = false,
  loading = false,
  requireGeographic = false,
  customCheck,
  fallbackPermission,
  debug = false,
  className,
  style,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAuthorityLevel,
    worksInDepartment,
    canAccessProvince,
    canAccessBranch,
    isActive,
    userRBAC,
  } = usePermissions();

  // Normalize geographic context (support both legacy and new formats)
  const normalizedGeographic = {
    provinceId: geographic.provinceId || province,
    branchCode: geographic.branchCode || branch,
    ...geographic,
  };

  // Map legacy role to authority (backward compatibility)
  const normalizedAuthority = authority || role;

  // Loading state
  if (loading || showLoading) {
    return (
      <div className={className} style={style}>
        <Spin size='small' />
      </div>
    );
  }

  // DEV USERS BYPASS ALL CHECKS
  if (userRBAC?.isDev) {
    if (debug)
      console.log('🔧 DEV USER - Access granted (bypassing all checks)');
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Check if user is active
  if (!isActive) {
    if (debug) console.log('🚫 ACCESS DENIED: User not active');
    return showFallback
      ? fallback || (
          <div
            style={{
              padding: '20px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fff2e8 0%, #fff7e6 100%)',
              border: '1px solid #ffec99',
            }}
          >
            <Alert
              message='Account Not Active'
              description='Your account is currently inactive. Please contact your administrator.'
              type='warning'
              showIcon
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
              }}
            />
          </div>
        )
      : null;
  }

  // Custom check function
  if (customCheck && typeof customCheck === 'function') {
    const hasAccess = customCheck({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasAuthorityLevel,
      worksInDepartment,
      canAccessProvince,
      canAccessBranch,
      userRBAC,
      geographic: normalizedGeographic,
    });

    if (!hasAccess) {
      // Try fallback permission if custom check fails
      if (
        fallbackPermission &&
        hasPermission(fallbackPermission, normalizedGeographic)
      ) {
        if (debug)
          console.log(
            '✅ ACCESS GRANTED: Fallback permission succeeded',
            fallbackPermission
          );
        return (
          <div className={className} style={style}>
            {children}
          </div>
        );
      }

      if (debug)
        console.log(
          '🚫 ACCESS DENIED: Custom check failed, no fallback permission'
        );
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message='Access Denied'
                description="You don't have permission to view this content."
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Authority level check (including legacy role mapping)
  if (normalizedAuthority) {
    if (!hasAuthorityLevel(normalizedAuthority)) {
      if (debug)
        console.log(
          `🚫 ACCESS DENIED: Authority check failed - required ${normalizedAuthority}, user has ${userRBAC?.authority}`
        );
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message={`${normalizedAuthority} Access Required`}
                description={`You need ${normalizedAuthority} level access to view this content.`}
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // Department check
  if (department) {
    if (!worksInDepartment(department)) {
      if (debug)
        console.log(
          `🚫 ACCESS DENIED: Department check failed - required ${department}, user departments: ${userRBAC?.departments}`
        );
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message={`${department} Department Access Required`}
                description={`You need access to the ${department} department to view this content.`}
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // Multiple permissions check (all required)
  if (allOf && Array.isArray(allOf)) {
    if (!hasAllPermissions(allOf, normalizedGeographic)) {
      if (debug) console.log(`🚫 All permissions check failed:`, allOf);
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message='Insufficient Permissions'
                description="You don't have all the required permissions to view this content."
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // Multiple permissions check (any required)
  if (anyOf && Array.isArray(anyOf)) {
    if (!hasAnyPermission(anyOf, normalizedGeographic)) {
      if (debug) console.log(`🚫 Any permissions check failed:`, anyOf);
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message='Access Denied'
                description="You don't have the required permissions to view this content."
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // Single permission check
  if (permission) {
    if (!hasPermission(permission, normalizedGeographic)) {
      if (debug)
        console.log(
          `🚫 ACCESS DENIED: Permission check failed - ${permission} with context:`,
          normalizedGeographic
        );
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message={`${permission} Permission Required`}
                description={`You need the '${permission}' permission to view this content.`}
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // Geographic access check
  if (
    requireGeographic ||
    normalizedGeographic.provinceId ||
    normalizedGeographic.branchCode
  ) {
    const hasGeoAccess =
      (!normalizedGeographic.provinceId ||
        canAccessProvince(normalizedGeographic.provinceId)) &&
      (!normalizedGeographic.branchCode ||
        canAccessBranch(normalizedGeographic.branchCode));

    if (!hasGeoAccess) {
      if (debug)
        console.log(
          `🚫 ACCESS DENIED: Geographic access check failed:`,
          normalizedGeographic
        );
      return showFallback
        ? fallback || (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%)',
                border: '1px solid #ffccc7',
              }}
            >
              <Alert
                message='Geographic Access Denied'
                description="You don't have access to the selected geographic location."
                type='error'
                icon={<LockOutlined />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                }}
              />
            </div>
          )
        : null;
    }
  }

  // All checks passed
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

PermissionGate.propTypes = {
  permission: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  allOf: PropTypes.arrayOf(PropTypes.string),
  authority: PropTypes.string,
  department: PropTypes.string,
  role: PropTypes.string, // Legacy support
  province: PropTypes.string, // Legacy support
  branch: PropTypes.string, // Legacy support
  geographic: PropTypes.shape({
    provinceId: PropTypes.string,
    branchCode: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  showFallback: PropTypes.bool,
  showLoading: PropTypes.bool,
  loading: PropTypes.bool,
  requireGeographic: PropTypes.bool,
  customCheck: PropTypes.func,
  fallbackPermission: PropTypes.string,
  debug: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * Higher-order component version (unified)
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
 * Hook version for conditional rendering (unified)
 */
export const usePermissionGate = (permissionConfig) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAuthorityLevel,
    worksInDepartment,
    canAccessProvince,
    canAccessBranch,
    isActive,
    userRBAC,
  } = usePermissions();

  const {
    permission,
    anyOf,
    allOf,
    authority,
    department,
    role,
    province,
    branch,
    geographic = {},
    requireGeographic = false,
    customCheck,
  } = permissionConfig;

  // Normalize geographic context
  const normalizedGeographic = {
    provinceId: geographic.provinceId || province,
    branchCode: geographic.branchCode || branch,
    ...geographic,
  };

  // Map legacy role to authority
  const normalizedAuthority = authority || role;

  // Check if user is active
  if (!isActive) return false;

  // Custom check function
  if (customCheck && typeof customCheck === 'function') {
    return customCheck({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasAuthorityLevel,
      worksInDepartment,
      canAccessProvince,
      canAccessBranch,
      userRBAC,
      geographic: normalizedGeographic,
    });
  }

  // Authority level check
  if (normalizedAuthority && !hasAuthorityLevel(normalizedAuthority))
    return false;

  // Department check
  if (department && !worksInDepartment(department)) return false;

  // Multiple permissions check (all required)
  if (
    allOf &&
    Array.isArray(allOf) &&
    !hasAllPermissions(allOf, normalizedGeographic)
  )
    return false;

  // Multiple permissions check (any required)
  if (
    anyOf &&
    Array.isArray(anyOf) &&
    !hasAnyPermission(anyOf, normalizedGeographic)
  )
    return false;

  // Single permission check
  if (permission && !hasPermission(permission, normalizedGeographic))
    return false;

  // Geographic access check
  if (
    requireGeographic ||
    normalizedGeographic.provinceId ||
    normalizedGeographic.branchCode
  ) {
    const hasGeoAccess =
      (!normalizedGeographic.provinceId ||
        canAccessProvince(normalizedGeographic.provinceId)) &&
      (!normalizedGeographic.branchCode ||
        canAccessBranch(normalizedGeographic.branchCode));
    if (!hasGeoAccess) return false;
  }

  return true;
};

/**
 * Convenience permission components for common use cases (unified)
 */
export const AccountingGate = ({ children, action = 'view', ...props }) => (
  <PermissionGate permission={`accounting.${action}`} {...props}>
    {children}
  </PermissionGate>
);

export const SalesGate = ({ children, action = 'view', ...props }) => (
  <PermissionGate permission={`sales.${action}`} {...props}>
    {children}
  </PermissionGate>
);

export const ServiceGate = ({ children, action = 'view', ...props }) => (
  <PermissionGate permission={`service.${action}`} {...props}>
    {children}
  </PermissionGate>
);

export const InventoryGate = ({ children, action = 'view', ...props }) => (
  <PermissionGate permission={`inventory.${action}`} {...props}>
    {children}
  </PermissionGate>
);

export const AdminGate = ({ children, action = 'view', ...props }) => (
  <PermissionGate permission={`admin.${action}`} {...props}>
    {children}
  </PermissionGate>
);

// Prop types for convenience components
AccountingGate.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.string,
};

SalesGate.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.string,
};

ServiceGate.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.string,
};

InventoryGate.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.string,
};

AdminGate.propTypes = {
  children: PropTypes.node.isRequired,
  action: PropTypes.string,
};

export default PermissionGate;
