import { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';
import { NAVIGATION_CONFIG } from 'data/navigationConfig';

/**
 * SIMPLIFIED Hook to generate navigation menu based on user's RBAC permissions
 * Focused on reactivity and simplicity
 */
export const useNavigationGenerator = () => {
  const { hasPermission, userRBAC, authority, departments, isDev } =
    usePermissions();
  const { user } = useSelector((state) => state.auth);

  // SIMPLIFIED: Extract user role from Clean Slate RBAC structure
  const userRole = useMemo(() => {
    return authority || user?.auth?.accessLevel || user?.accessLevel || 'STAFF';
  }, [authority, user]);

  /**
   * ENHANCED: Check if we should respect RBAC filtering (even for dev users during role simulation)
   */
  const shouldRespectRBAC = useMemo(() => {
    // Always respect RBAC for non-dev users
    if (!isDev) return true;

    // For dev users, check if we're in role simulation mode
    // Role simulation is detected by checking if the user has a test profile structure
    const isRoleSimulation =
      user?.uid?.startsWith('test_') ||
      user?.email?.includes('@test.com') ||
      user?.displayName?.includes('Test ') ||
      window.localStorage.getItem('rbac_simulation_mode') === 'true';

    return isRoleSimulation;
  }, [isDev, user]);

  // Debug logging for simulation mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isDev) {
      if (shouldRespectRBAC) {
        console.log(
          '🎭 Navigation: Role simulation mode ACTIVE - RBAC filtering enabled'
        );
        console.log('👤 Simulated Role:', userRole);
        console.log(
          '💡 Tip: Use window.exitSimulation() to restore dev navigation'
        );
      } else {
        console.log(
          '🔧 Navigation: Dev mode - showing ALL items (RBAC bypassed)'
        );
      }
    }
  }, [isDev, shouldRespectRBAC, userRole]);

  /**
   * ENHANCED: Filter navigation items based on permissions with role simulation support
   */
  const filterItems = useMemo(() => {
    return (items) => {
      if (!items || !Array.isArray(items)) return [];

      return items.filter((item) => {
        // Dev users bypass RBAC only when NOT in simulation mode
        if (isDev && !shouldRespectRBAC) {
          return true;
        }

        // Check authority-based access first (hierarchical access)
        if (item.authorities && Array.isArray(item.authorities)) {
          const currentAuthority =
            authority || user?.access?.authority || user?.accessLevel;
          if (currentAuthority && item.authorities.includes(currentAuthority)) {
            // User has required authority level - allow access
            return true;
          }
        }

        // Check permission-based access
        if (item.permission) {
          // Handle single permission (string)
          if (typeof item.permission === 'string') {
            if (!hasPermission(item.permission)) {
              return false;
            }
          }
          // Handle multiple permissions (array) - user needs ANY one of them
          else if (Array.isArray(item.permission)) {
            const hasAnyPermission = item.permission.some((perm) =>
              hasPermission(perm)
            );
            if (!hasAnyPermission) {
              return false;
            }
          }
        }

        // Recursively filter sub-items
        if (item.items && Array.isArray(item.items)) {
          const filteredSubItems = filterItems(item.items);
          item.items = filteredSubItems;

          // Keep parent if it has visible children or if it's a direct menu item
          return filteredSubItems.length > 0 || item.to;
        }

        return true;
      });
    };
  }, [hasPermission, isDev, shouldRespectRBAC, authority, user]);

  /**
   * SIMPLIFIED: Generate filtered navigation based on user permissions
   */
  const navigation = useMemo(() => {
    const result = [];

    Object.entries(NAVIGATION_CONFIG).forEach(([key, section]) => {
      // Special handling for developer-only sections
      if (section.isDeveloperOnly && (!isDev || shouldRespectRBAC)) {
        return;
      }

      // Check authority-based access for section
      if (section.authorities && Array.isArray(section.authorities)) {
        const currentAuthority =
          authority || user?.access?.authority || user?.accessLevel;

        // Debug logging for admin and accounting sections
        if (
          (key === 'admin' || key === 'accounting') &&
          process.env.NODE_ENV === 'development'
        ) {
          console.log(`🔍 ${key.toUpperCase()} Section Access Check:`, {
            sectionKey: key,
            sectionTitle: section.title,
            sectionAuthorities: section.authorities,
            sectionPermission: section.permission,
            currentAuthority,
            userAuthority: authority,
            userAccessAuthority: user?.access?.authority,
            userAccessLevel: user?.accessLevel,
            hasAuthorityAccess:
              currentAuthority &&
              section.authorities &&
              section.authorities.includes(currentAuthority),
            hasPermissionAccess: section.permission
              ? hasPermission(section.permission)
              : 'N/A',
            willShowSection:
              (section.authorities &&
                currentAuthority &&
                section.authorities.includes(currentAuthority)) ||
              (!section.authorities &&
                section.permission &&
                hasPermission(section.permission)) ||
              (!section.authorities && !section.permission),
          });
        }

        if (
          !currentAuthority ||
          !section.authorities.includes(currentAuthority)
        ) {
          // User doesn't have required authority level - check permissions as fallback
          if (section.permission && !hasPermission(section.permission)) {
            return;
          }
        }
      } else if (section.permission && !hasPermission(section.permission)) {
        // Check section permission only if no authority-based access
        return;
      }

      // Filter section items
      const filteredItems = filterItems(section.items || []);

      // Debug logging for accounting section filtering
      if (key === 'accounting' && process.env.NODE_ENV === 'development') {
        console.log(`🔍 ACCOUNTING Section Filtering:`, {
          sectionKey: key,
          originalItemsCount: section.items?.length || 0,
          filteredItemsCount: filteredItems.length,
          hasDirectRoute: !!section.to,
          willShowSection: filteredItems.length > 0 || section.to,
          filteredItems: filteredItems.map((item) => ({
            key: item.key,
            title: item.title,
            permission: item.permission,
            hasPermission: item.permission
              ? hasPermission(item.permission)
              : 'N/A',
            subItemsCount: item.items?.length || 0,
          })),
        });
      }

      // Include section if it has visible items OR if it's a direct navigation item
      if (filteredItems.length > 0 || section.to) {
        result.push({
          ...section,
          key,
          items: filteredItems.length > 0 ? filteredItems : undefined,
        });
      }
    });

    return result;
  }, [hasPermission, filterItems, isDev, shouldRespectRBAC, authority, user]);

  /**
   * SIMPLIFIED: Get navigation statistics
   */
  const navigationStats = useMemo(() => {
    let totalSections = 0;
    let totalItems = 0;

    navigation.forEach((section) => {
      totalSections++;
      if (section.items) {
        section.items.forEach((item) => {
          totalItems++;
          if (item.items) {
            totalItems += item.items.length;
          }
        });
      }
    });

    return {
      totalSections,
      totalItems,
      userRole,
      isDev,
      isSimulating: shouldRespectRBAC && isDev,
      rbacActive: shouldRespectRBAC,
    };
  }, [navigation, userRole, isDev]);

  /**
   * Find navigation item by path
   */
  const findItemByPath = (path) => {
    for (const section of navigation) {
      if (section.items) {
        for (const item of section.items) {
          if (item.to === path) {
            return {
              section,
              item,
              breadcrumb: [section.title, item.title],
            };
          }
          if (item.items) {
            for (const subItem of item.items) {
              if (subItem.to === path) {
                return {
                  section,
                  item,
                  subItem,
                  breadcrumb: [section.title, item.title, subItem.title],
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  return {
    navigation,
    navigationStats,
    findItemByPath,
    userRole,
    isDev,
    // Legacy compatibility
    filteredNavigation: navigation,
    highPriorityItems: [],
    dailyItems: [],
    hasAccessToPath: (path) => !!findItemByPath(path),
    getBreadcrumb: (currentPath) =>
      findItemByPath(currentPath)?.breadcrumb || [],
  };
};

export default useNavigationGenerator;
