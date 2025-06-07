/**
 * RBAC Navigation Filter Component for KBN Multi-Province System
 * Filters navigation items based on user permissions and geographic access
 */

import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../hooks/usePermissions';

/**
 * RBAC Navigation Filter Component
 * @param {Object} props
 * @param {Array} props.menuItems - Array of menu items to filter
 * @param {React.ReactNode} props.children - Function that receives filtered menu items
 * @param {boolean} props.strict - If true, hides items with no explicit permission
 * @param {Object} props.defaultPermissions - Default permissions for common items
 */
const RBACNavigationFilter = ({ 
  menuItems = [], 
  children, 
  strict = false,
  defaultPermissions = {}
}) => {
  const { hasPermission, hasGeographicAccess, isSuperAdmin } = usePermissions();

  const filterMenuItems = (items) => {
    return items.filter(item => {
      // Skip filtering for super admin if not in strict mode
      if (isSuperAdmin && !strict) {
        return true;
      }

      // Check if item has permission requirements
      if (item.permission || item.permissions) {
        const requiredPermissions = item.permissions || [item.permission];
        const hasRequiredPermission = requiredPermissions.some(permission => 
          hasPermission(permission, {
            province: item.province,
            branch: item.branch
          })
        );

        if (!hasRequiredPermission) {
          return false;
        }
      }

      // Check geographic access if specified
      if (item.requiredGeography) {
        const hasGeoAccess = hasGeographicAccess({
          province: item.requiredGeography.province,
          branch: item.requiredGeography.branch
        });

        if (!hasGeoAccess) {
          return false;
        }
      }

      // Check access level requirements
      if (item.minAccessLevel) {
        const accessLevels = {
          'branch': 1,
          'province': 2, 
          'all': 3
        };
        
        const userLevel = accessLevels[hasPermission('*') ? 'all' : 'branch']; // Simplified
        const requiredLevel = accessLevels[item.minAccessLevel];
        
        if (userLevel < requiredLevel) {
          return false;
        }
      }

      // Apply default permissions if item has no explicit permissions
      if (!item.permission && !item.permissions && defaultPermissions[item.key]) {
        return hasPermission(defaultPermissions[item.key]);
      }

      // Filter child items recursively
      if (item.children && item.children.length > 0) {
        item.children = filterMenuItems(item.children);
        // Hide parent if no children remain (unless parent has its own content)
        if (item.children.length === 0 && item.hideIfNoChildren) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredMenuItems = filterMenuItems([...menuItems]);

  // Call children function with filtered menu items
  if (typeof children === 'function') {
    return children(filteredMenuItems);
  }

  // Return filtered items directly if no children function provided
  return filteredMenuItems;
};

RBACNavigationFilter.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    permission: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    requiredGeography: PropTypes.shape({
      province: PropTypes.string,
      branch: PropTypes.string
    }),
    minAccessLevel: PropTypes.oneOf(['branch', 'province', 'all']),
    hideIfNoChildren: PropTypes.bool,
    children: PropTypes.array
  })).isRequired,
  children: PropTypes.func.isRequired,
  strict: PropTypes.bool,
  defaultPermissions: PropTypes.object
};

/**
 * Higher Order Component for RBAC Navigation Filtering
 */
export const withRBACNavigation = (Component, navigationConfig = {}) => {
  const RBACNavigationComponent = (props) => {
    return (
      <RBACNavigationFilter {...navigationConfig}>
        {(filteredMenuItems) => (
          <Component {...props} menuItems={filteredMenuItems} />
        )}
      </RBACNavigationFilter>
    );
  };

  RBACNavigationComponent.displayName = `withRBACNavigation(${Component.displayName || Component.name})`;
  return RBACNavigationComponent;
};

/**
 * Hook for filtering menu items in functional components
 */
export const useRBACNavigation = (menuItems, options = {}) => {
  const { hasPermission, hasGeographicAccess, isSuperAdmin } = usePermissions();

  return React.useMemo(() => {
    const filter = new RBACNavigationFilter({
      menuItems,
      ...options
    });
    
    // Create dummy component to use the filter logic
    let filteredItems = [];
    filter.props.children = (items) => {
      filteredItems = items;
      return null;
    };
    
    // Execute the filter
    React.createElement(RBACNavigationFilter, filter.props);
    
    return filteredItems;
  }, [menuItems, hasPermission, hasGeographicAccess, isSuperAdmin, options]);
};

export default RBACNavigationFilter; 