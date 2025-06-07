import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';
import { NAVIGATION_CONFIG } from 'data/navigationConfig';

/**
 * Hook to generate navigation menu based on user's RBAC permissions
 * @returns {Object} Object containing filtered navigation and helper functions
 */
export const useNavigationGenerator = () => {
  const { hasPermission } = usePermissions();
  const { user } = useSelector(state => state.auth);

  /**
   * Recursively filters navigation items based on user permissions
   * @param {Array} items - Array of navigation items
   * @returns {Array} Filtered navigation items
   */
  const filterItems = useMemo(() => {
    return (items) => {
      return items.filter(item => {
        // Check if user has permission for this item
        if (item.permission && !hasPermission(item.permission)) {
          return false;
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
  }, [hasPermission]);

  /**
   * Generate filtered navigation based on user permissions
   */
  const filteredNavigation = useMemo(() => {
    const result = [];
    
    Object.entries(NAVIGATION_CONFIG).forEach(([key, section]) => {
      // Special handling for developer-only sections
      if (section.isDeveloperOnly && !user?.isDev) {
        return;
      }

      // Check section permission
      if (section.permission && !hasPermission(section.permission)) {
        return;
      }

      // Filter section items
      const filteredItems = filterItems(section.items || []);
      
      // Include section if it has visible items OR if it's a direct navigation item (has 'to' property)
      if (filteredItems.length > 0 || section.to) {
        result.push({
          ...section,
          key,
          items: filteredItems.length > 0 ? filteredItems : undefined
        });
      }
    });

    return result;
  }, [hasPermission, filterItems, user?.isDev, user?.group]);

  /**
   * Get high priority navigation items
   */
  const highPriorityItems = useMemo(() => {
    const items = [];
    
    filteredNavigation.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.priority === 'high') {
            items.push({ ...item, sectionTitle: section.title });
          }
          if (item.items) {
            item.items.forEach(subItem => {
              if (subItem.priority === 'high') {
                items.push({ 
                  ...subItem, 
                  sectionTitle: section.title,
                  parentTitle: item.title 
                });
              }
            });
          }
        });
      }
    });
    
    return items;
  }, [filteredNavigation]);

  /**
   * Get daily frequency items (commonly used)
   */
  const dailyItems = useMemo(() => {
    const items = [];
    
    filteredNavigation.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.frequency === 'daily') {
            items.push({ ...item, sectionTitle: section.title });
          }
          if (item.items) {
            item.items.forEach(subItem => {
              if (subItem.frequency === 'daily') {
                items.push({ 
                  ...subItem, 
                  sectionTitle: section.title,
                  parentTitle: item.title 
                });
              }
            });
          }
        });
      }
    });
    
    return items;
  }, [filteredNavigation]);

  /**
   * Get navigation statistics
   */
  const navigationStats = useMemo(() => {
    let totalSections = 0;
    let totalItems = 0;
    let totalSubItems = 0;
    
    filteredNavigation.forEach(section => {
      totalSections++;
      if (section.items) {
        section.items.forEach(item => {
          totalItems++;
          if (item.items) {
            totalSubItems += item.items.length;
          }
        });
      }
    });
    
    return {
      totalSections,
      totalItems,
      totalSubItems,
      totalMenuItems: totalItems + totalSubItems
    };
  }, [filteredNavigation]);

  /**
   * Find navigation item by path
   * @param {string} path - The route path to find
   * @returns {Object|null} Navigation item info or null if not found
   */
  const findItemByPath = (path) => {
    for (const section of filteredNavigation) {
      if (section.items) {
        for (const item of section.items) {
          if (item.to === path) {
            return { 
              section, 
              item, 
              breadcrumb: [section.title, item.title] 
            };
          }
          if (item.items) {
            for (const subItem of item.items) {
              if (subItem.to === path) {
                return { 
                  section, 
                  item, 
                  subItem,
                  breadcrumb: [section.title, item.title, subItem.title] 
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  /**
   * Check if user has access to specific path
   * @param {string} path - The route path to check
   * @returns {boolean} True if user has access
   */
  const hasAccessToPath = (path) => {
    const item = findItemByPath(path);
    return !!item;
  };

  /**
   * Get navigation breadcrumb for current path
   * @param {string} currentPath - Current route path
   * @returns {Array} Breadcrumb array
   */
  const getBreadcrumb = (currentPath) => {
    const item = findItemByPath(currentPath);
    return item ? item.breadcrumb : [];
  };

  return {
    navigation: filteredNavigation,
    highPriorityItems,
    dailyItems,
    navigationStats,
    findItemByPath,
    hasAccessToPath,
    getBreadcrumb
  };
};

export default useNavigationGenerator; 