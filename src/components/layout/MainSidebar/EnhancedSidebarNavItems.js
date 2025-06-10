import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { Menu, Badge, Typography, Input, Empty } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DashboardOutlined, 
  CalculatorOutlined, 
  ShoppingCartOutlined,
  ToolOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  DatabaseOutlined,
  HomeOutlined,
  CodeOutlined,
  DollarOutlined,
  NotificationOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';

import { useNavigationGenerator } from 'hooks/useNavigationGenerator';
import UserContext from './UserContext';
import { toggleSidebar } from 'redux/actions/unPersisted';
import { setSelectedKeys, setOpenKeys } from 'redux/actions/unPersisted';
import { isMobile } from 'react-device-detect';

const { SubMenu } = Menu;
const { Text } = Typography;

// Icon mapping for different navigation sections
const ICON_MAP = {
  dashboard: DashboardOutlined,
  calculator: CalculatorOutlined,
  'shopping-cart': ShoppingCartOutlined,
  tool: ToolOutlined,
  'bar-chart': BarChartOutlined,
  team: TeamOutlined,
  setting: SettingOutlined,
  database: DatabaseOutlined,
  home: HomeOutlined,
  code: CodeOutlined,
  dollar: DollarOutlined,
  notification: NotificationOutlined
};

const EnhancedSidebarNavItems = () => {
  const { navigation, highPriorityItems, navigationStats } = useNavigationGenerator();
  const { openKeys } = useSelector(state => state.unPersisted);
  const { user } = useSelector(state => state.auth);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-expand developer menu for developer users (only on initial load)
  useEffect(() => {
    // Extract isDev to avoid complex dependency array warning
    const isUserDev = user?.isDev;
    
    if (isUserDev && navigation.length > 0 && openKeys.length === 0) {
      const developerSection = navigation.find(section => section.key === 'developer');
      if (developerSection) {
        // Expand both the main developer section and its primary sub-section
        const keysToOpen = ['developer'];
        
        // Also expand the main developer sub-section if it exists
        if (developerSection.items && developerSection.items.length > 0) {
          const mainDeveloperItem = developerSection.items[0]; // 'developer-main'
          if (mainDeveloperItem && mainDeveloperItem.key) {
            keysToOpen.push(mainDeveloperItem.key);
          }
        }
        
        dispatch(setOpenKeys(keysToOpen));
      }
    }
  }, [user?.isDev, navigation, dispatch, openKeys.length]);

  // Listen for forced user data refresh events
  useEffect(() => {
    const handleUserDataRefresh = (event) => {
      console.log('🔄 Navigation received user data refresh event');
      // Force re-render by updating a dummy state or triggering navigation regeneration
      window.location.hash = '#refreshed'; // Trigger a subtle change
      setTimeout(() => {
        window.location.hash = ''; // Clear the hash
      }, 100);
    };

    window.addEventListener('userDataRefreshed', handleUserDataRefresh);
    return () => {
      window.removeEventListener('userDataRefreshed', handleUserDataRefresh);
    };
  }, []);

  /*
   * Production Mode Behavior:
   * - Navigation statistics are hidden
   * - Search results count is hidden  
   * - Developer-only sections are automatically filtered out
   * - Only essential UI elements are shown for optimal UX
   */

  // Search filtering logic
  const filteredNavigation = useMemo(() => {
    if (!searchTerm.trim()) {
      return navigation;
    }

    const searchLower = searchTerm.toLowerCase();
    const searchResults = [];

    navigation.forEach(section => {
      const matchingItems = [];
      
      // Check if section title matches
      const sectionMatches = section.title.toLowerCase().includes(searchLower);
      
      if (section.items) {
        section.items.forEach(item => {
          // Check if item matches
          const itemMatches = 
            item.title.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower));
          
          if (itemMatches || sectionMatches) {
            // If item has sub-items, check those too
            if (item.items) {
              const matchingSubItems = item.items.filter(subItem =>
                subItem.title.toLowerCase().includes(searchLower) ||
                (subItem.description && subItem.description.toLowerCase().includes(searchLower)) ||
                itemMatches ||
                sectionMatches
              );
              
              if (matchingSubItems.length > 0) {
                matchingItems.push({
                  ...item,
                  items: matchingSubItems
                });
              }
            } else {
              matchingItems.push(item);
            }
          } else if (item.items) {
            // Check sub-items even if parent doesn't match
            const matchingSubItems = item.items.filter(subItem =>
              subItem.title.toLowerCase().includes(searchLower) ||
              (subItem.description && subItem.description.toLowerCase().includes(searchLower))
            );
            
            if (matchingSubItems.length > 0) {
              matchingItems.push({
                ...item,
                items: matchingSubItems
              });
            }
          }
        });
      }
      
      if (matchingItems.length > 0 || sectionMatches) {
        searchResults.push({
          ...section,
          items: matchingItems.length > 0 ? matchingItems : section.items
        });
      }
    });

    return searchResults;
  }, [navigation, searchTerm]);

  // Handle menu item click
  const handleClick = (item) => {
    if (item.to) {
      history.push(item.to);
      
      // Close sidebar on mobile after navigation
      if (isMobile) {
        dispatch(toggleSidebar(false));
      }
    }
  };

  // Handle menu selection and opening
  const handleMenuClick = ({ key }) => {
    dispatch(setSelectedKeys([key]));
  };

  const handleOpenChange = (openKeys) => {
    dispatch(setOpenKeys(openKeys));
  };

  // Get current selected keys based on location
  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    
    // Find matching navigation item
    for (const section of navigation) {
      if (section.items) {
        for (const item of section.items) {
          if (item.to === currentPath) {
            return [item.key];
          }
          if (item.items) {
            for (const subItem of item.items) {
              if (subItem.to === currentPath) {
                return [subItem.key];
              }
            }
          }
        }
      }
    }
    return [];
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : part
    );
  };

  // Render individual menu item
  const renderMenuItem = (item, parentKey = '') => {
    const IconComponent = ICON_MAP[item.icon];
    const itemKey = item.key || item.title;
    
    return (
      <Menu.Item 
        key={itemKey}
        icon={IconComponent && <IconComponent style={{ fontSize: '14px' }} />}
        onClick={() => handleClick(item)}
        className={item.priority === 'high' ? 'high-priority-item' : ''}
      >
        <div className="menu-item-content">
          <span className="menu-title">{highlightSearchTerm(item.title, searchTerm)}</span>
          <div className="menu-badges">
            {item.frequency === 'daily' && (
              <Badge 
                count="ประจำวัน" 
                size="small" 
                style={{ 
                  backgroundColor: '#52c41a',
                  fontSize: '9px',
                  marginLeft: '4px'
                }}
              />
            )}
            {item.priority === 'high' && (
              <Badge 
                count="สำคัญ" 
                size="small" 
                style={{ 
                  backgroundColor: '#ff4d4f',
                  fontSize: '9px',
                  marginLeft: '4px'
                }}
              />
            )}
          </div>
        </div>
        {item.description && (
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '10px', 
              display: 'block',
              marginTop: '2px',
              lineHeight: '12px'
            }}
          >
            {highlightSearchTerm(item.description, searchTerm)}
          </Text>
        )}
      </Menu.Item>
    );
  };

  // Render menu group
  const renderMenuGroup = (group, parentKey = '') => {
    if (group.type === 'group') {
      return (
        <Menu.ItemGroup 
          key={group.key || group.title}
          title={
            <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {group.title}
            </Text>
          }
        >
          {group.items && group.items.map(item => renderMenuGroup(item, parentKey))}
        </Menu.ItemGroup>
      );
    }
    
    // Handle submenu items (items with sub-items but not group type)
    if (group.items && group.items.length > 0) {
      return (
        <SubMenu
          key={group.key || group.title}
          title={
            <div className="submenu-title">
              <span style={{ fontSize: '14px', fontWeight: 400 }}>
                {highlightSearchTerm(group.title, searchTerm)}
              </span>
              {group.badge && (
                <Badge 
                  count={group.badge} 
                  size="small" 
                  style={{ marginLeft: '8px' }}
                />
              )}
            </div>
          }
          className="enhanced-submenu-item"
        >
          {group.items.map(item => renderMenuItem(item, group.key || group.title))}
        </SubMenu>
      );
    }
    
    // Single item
    return renderMenuItem(group, parentKey);
  };

  // Render submenu
  const renderSubMenu = (section, parentKey = '') => {
    const IconComponent = ICON_MAP[section.icon];
    const sectionKey = section.key || section.title;
    
    return (
      <SubMenu
        key={sectionKey}
        icon={IconComponent && <IconComponent style={{ fontSize: '16px' }} />}
        title={
          <div className="submenu-title">
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {highlightSearchTerm(section.title, searchTerm)}
            </span>
            {section.badge && (
              <Badge 
                count={section.badge} 
                size="small" 
                style={{ marginLeft: '8px' }}
              />
            )}
          </div>
        }
        className="enhanced-submenu"
      >
        {section.items && section.items.map(item => renderMenuGroup(item, sectionKey))}
      </SubMenu>
    );
  };

  return (
    <div className="enhanced-navigation">
      {/* User Context Card */}
      <UserContext />

      {/* Menu Search Box */}
      <div className="menu-search-box">
        <Input
          placeholder="ค้นหาเมนู... (เช่น รับเงิน, รายงาน, บันทึก)"
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          suffix={
            searchTerm ? (
              <ClearOutlined 
                style={{ color: '#8c8c8c', cursor: 'pointer' }}
                onClick={() => setSearchTerm('')}
              />
            ) : null
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          allowClear
        />
        {searchTerm && (
          <div className="search-results-count">
            พบ {filteredNavigation.reduce((total, section) => 
              total + (section.items ? section.items.length : 0), 0
            )} รายการ
          </div>
        )}
      </div>

      {/* Navigation Statistics (Debug - can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          padding: '8px 16px', 
          fontSize: '10px', 
          color: '#8c8c8c',
          borderBottom: '1px solid #f0f0f0'
        }}>
          เมนู: {navigationStats.totalSections} หมวด, {navigationStats.totalMenuItems} รายการ
          {searchTerm && ` | กรองแล้ว: ${filteredNavigation.length} หมวด`}
        </div>
      )}

      {/* Main Navigation Menu */}
      {filteredNavigation.length > 0 ? (
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          className="enhanced-menu"
          style={{ border: 'none' }}
        >
          {filteredNavigation.map(section => (
            <Fragment key={section.key}>
              {section.items && section.items.length > 0 ? (
                renderSubMenu(section)
              ) : (
                renderMenuItem(section)
              )}
            </Fragment>
          ))}
        </Menu>
      ) : (
        <div className="search-empty-state">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                ไม่พบเมนูที่ตรงกับ &quot;{searchTerm}&quot;
                <br />
                ลองใช้คำค้นหาอื่น เช่น &quot;รับเงิน&quot; หรือ &quot;รายงาน&quot;
              </span>
            }
          />
        </div>
      )}

      {/* Quick Access Section (if there are high priority items and no search) */}
      {!searchTerm && highPriorityItems.length > 0 && (
        <div style={{ 
          margin: '16px 8px 8px 8px',
          padding: '8px',
          background: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #f0f0f0'
        }}>
          <Text strong style={{ fontSize: '11px', color: '#8c8c8c' }}>
            งานสำคัญ
          </Text>
          <div style={{ marginTop: '4px' }}>
            {highPriorityItems.slice(0, 3).map(item => (
              <div 
                key={item.key}
                onClick={() => handleClick(item)}
                style={{ 
                  fontSize: '10px',
                  padding: '2px 0',
                  cursor: 'pointer',
                  color: '#1890ff'
                }}
              >
                • {item.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSidebarNavItems; 