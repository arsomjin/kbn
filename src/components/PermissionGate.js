import React from "react";
import { usePermissions } from "hooks/usePermissions";
import PropTypes from 'prop-types';

const PermissionGate = ({ 
  permission, 
  province, 
  branch, 
  children, 
  fallback = null,
  requireAll = false,
  permissions = []
}) => {
  const { hasPermission, hasGeographicAccess } = usePermissions();
  
  // Check individual permission if provided
  if (permission) {
    if (!hasPermission(permission, { province, branch })) {
      return fallback;
    }
  }
  
  // Check multiple permissions if provided
  if (permissions.length > 0) {
    const permissionChecks = permissions.map(perm => 
      hasPermission(perm, { province, branch })
    );
    
    if (requireAll) {
      // Require ALL permissions to pass
      if (!permissionChecks.every(check => check)) {
        return fallback;
      }
    } else {
      // Require ANY permission to pass
      if (!permissionChecks.some(check => check)) {
        return fallback;
      }
    }
  }
  
  // Check geographic access if province or branch is specified
  if (province || branch) {
    if (!hasGeographicAccess({ province, branch })) {
      return fallback;
    }
  }
  
  return children;
};

PermissionGate.propTypes = {
  permission: PropTypes.string,
  province: PropTypes.string,
  branch: PropTypes.string,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  requireAll: PropTypes.bool,
  permissions: PropTypes.arrayOf(PropTypes.string)
};

export default PermissionGate; 