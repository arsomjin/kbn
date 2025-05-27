import React, { useState, useEffect, ReactElement } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Avatar, Dropdown, Drawer, Space } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  DashboardOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  TranslationOutlined,
  TeamOutlined,
  BankOutlined,
  MenuOutlined,
  CloseOutlined,
  UsergroupAddOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/android-chrome-192x192.png';

// Custom hooks
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'hooks/useTheme';
import { usePermissions } from 'hooks/usePermissions';
import { useAccountMenu } from '../../modules/account/hooks/useAccountMenu';
import { useUserManagementMenu } from '../../modules/userManagement/hooks/useUserManagementMenu';

// Components
import NotificationCenter from '../notifications/NotificationCenter';
import ThemeSwitch from '../common/ThemeSwitch';
import LanguageSwitcher from '../common/LanguageSwitcher';
import UserAvatar from '../common/UserAvatar';
import RouteDebugInfo from '../common/RouteDebugInfo';

// Utils
import {
  getUserHomePath,
  getUserRoutePrefix,
  getUserAccessLayer,
  shouldAllowRouteAccess,
  getLayerRedirectPath,
} from '../../utils/roleUtils';

// Constants
import { ROLES, RoleCategory } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';

const { Header, Sider, Content } = Layout;

/**
 * Returns the selected menu key based on the current location.
 */
const getSelectedKey = (location, isBranchContext, openKeys, setOpenKeys) => {
  const pathname = location.pathname;
  // console.log('[getSelectedKey] pathname', pathname);

  // Home/Dashboard routes
  if (
    pathname === '/' ||
    pathname.match(/^\/\w+\/overview$/) ||
    pathname.match(/^\/\w+\/landing$/) ||
    pathname.match(/^\/\w+\/dashboard$/) ||
    pathname.match(/^\/\w+-\w+\/\d{4}\/dashboard$/) ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/branch-dashboard')
  ) {
    return 'home';
  }

  // Account routes - Branch context (/:provinceId/:branchCode/account/*)
  if (pathname.match(/^\/[^/]+\/[^/]+\/account/)) {
    if (pathname.includes('/account/overview')) return 'branch-account-overview';
    if (pathname.includes('/account/income')) return 'branch-account-income';
    if (pathname.includes('/account/expense')) return 'branch-account-expense';
    if (pathname.includes('/account/input-price')) return 'branch-account-input-price';
    return 'account-branch';
  }

  // Account routes - Province context (/:provinceId/account/*)
  if (pathname.match(/^\/[^/]+\/account/)) {
    if (pathname.includes('/account/overview')) return 'province-account-overview';
    if (pathname.includes('/account/income')) return 'province-account-income';
    if (pathname.includes('/account/expense')) return 'province-account-expense';
    if (pathname.includes('/account/input-price')) return 'province-account-input-price';
    return 'account-province';
  }

  // Account routes - Executive context (/account/*)
  if (pathname.startsWith('/account')) {
    if (pathname === '/account' || pathname.startsWith('/account/overview'))
      return 'account-overview';
    if (pathname.startsWith('/account/income')) return 'account-income';
    if (pathname.startsWith('/account/expense')) return 'account-expense';
    if (pathname.startsWith('/account/input-price')) return 'account-input-price';
    return 'account-executive';
  }

  // Admin routes
  if (pathname.startsWith('/admin/review-users')) return 'user-review';
  if (pathname.startsWith('/admin/user-role-manager')) return 'user-role-manager';
  if (pathname.startsWith('/admin/send-notification')) return 'send-notification';
  if (pathname.startsWith('/developer')) return 'developer';
  if (pathname.startsWith('/admin/content')) return 'content';

  // User Management routes - Province context (/:provinceId/admin/*)
  if (pathname.match(/^\/[^/]+\/admin\/review-users/)) return 'province-user-review';
  if (pathname.match(/^\/[^/]+\/admin\/user-role-manager/)) return 'province-user-role-manager';

  // User Management routes - Branch context (/:provinceId/:branchCode/admin/*)
  if (pathname.match(/^\/[^/]+\/[^/]+\/admin\/review-users/)) return 'branch-user-review';
  if (pathname.match(/^\/[^/]+\/[^/]+\/admin\/user-role-manager/))
    return 'branch-user-role-manager';

  // Settings routes (with submenu handling)
  if (pathname.startsWith('/admin/users')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'user-management';
  }
  if (pathname.startsWith('/admin/employees')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'employee-management';
  }
  if (pathname.startsWith('/admin/settings')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'system-settings';
  }
  if (
    pathname.startsWith('/admin/provinces') ||
    pathname.startsWith('/special-settings/provinces')
  ) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'special-settings-provinces';
  }
  if (pathname.startsWith('/admin/branches') || pathname.startsWith('/special-settings/branches')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'special-settings-branches';
  }

  // About routes - Handle both root and layer-based paths
  if (
    pathname.startsWith('/about/system-overview') ||
    pathname.match(/^\/[^/]+\/about\/system-overview/) ||
    pathname.match(/^\/[^/]+\/[^/]+\/about\/system-overview/)
  ) {
    return 'system-overview';
  }

  return '';
};

const MainLayout = ({ children }) => {
  // State
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openKeys, setOpenKeys] = useState(['settings']);
  const [mobileHeaderFade, setMobileHeaderFade] = useState(1);

  // Hooks
  const { t, i18n } = useTranslation(['hr']);
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { theme } = useTheme();
  const { hasRole, hasPermission } = usePermissions();
  const location = useLocation();
  const params = useParams();
  const isBranchContext = Boolean(params.provinceId && params.branchCode);
  const photoURL =
    user?.photoURL || (userProfile && 'photoURL' in userProfile ? userProfile.photoURL : undefined);
  const accountMenuItemsRaw = useAccountMenu();
  const userManagementMenuItemsRaw = useUserManagementMenu();

  // Layer-based navigation
  const userRoutePrefix = getUserRoutePrefix(userProfile);
  const userAccessLayer = getUserAccessLayer(userProfile);

  // Helper function to create layer-aware navigation
  const navigateWithLayerCheck = (targetPath) => {
    if (!userProfile) {
      navigate(targetPath);
      return;
    }

    // Check if user should have access to this route
    if (shouldAllowRouteAccess(userProfile, targetPath)) {
      navigate(targetPath);
    } else {
      // Redirect to appropriate layer-based path
      const redirectPath = getLayerRedirectPath(userProfile, targetPath);
      navigate(redirectPath);
    }
  };

  // Add onClick to each child in accountMenuItems
  const accountMenuItems = accountMenuItemsRaw.map((group) => ({
    ...group,
    children: group.children.map((child) => ({
      ...child,
      onClick: () => navigate(child.path),
    })),
  }));

  // Add onClick to each child in userManagementMenuItems
  const userManagementMenuItems = userManagementMenuItemsRaw.map((group) => ({
    ...group,
    children: group.children.map((child) => ({
      ...child,
      onClick: () => navigate(child.path),
    })),
  }));

  // console.log('[MainLayout] accountMenuItems', accountMenuItems);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && drawerVisible) setDrawerVisible(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerVisible]);

  // Mobile header fade effect
  useEffect(() => {
    if (!isMobile) {
      setMobileHeaderFade(1);
      return;
    }
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      let opacity = 1;
      if (scrollY > 32) opacity = Math.max(0, 1 - (scrollY - 32) / 64);
      setMobileHeaderFade(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Cross-layer access prevention
  useEffect(() => {
    if (!userProfile || !location.pathname) return;

    // Skip check for certain paths that don't need layer enforcement
    const skipPaths = [
      '/login',
      '/register',
      '/forgot-password',
      '/complete-profile',
      '/pending',
      '/landing',
    ];
    if (skipPaths.some((path) => location.pathname.startsWith(path))) return;

    // Check if current route is allowed for user's layer
    if (!shouldAllowRouteAccess(userProfile, location.pathname)) {
      console.warn(
        `[MainLayout] User at layer "${userAccessLayer}" attempted to access route outside their layer: ${location.pathname}`,
      );

      // Get the appropriate redirect path
      const redirectPath = getLayerRedirectPath(userProfile, location.pathname);

      if (redirectPath !== location.pathname) {
        console.info(
          `[MainLayout] Redirecting user to their layer-appropriate path: ${redirectPath}`,
        );
        navigate(redirectPath, { replace: true });
      }
    }
  }, [userProfile, location.pathname, userAccessLayer, navigate]);

  // Language change
  const changeLanguage = (language) => i18n.changeLanguage(language);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile', { ns: 'common' }),
      onClick: () => navigate('/personal-profile'),
    },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: t('changeLanguage', { ns: 'language' }),
      children: [
        {
          key: 'en',
          label: t('english', { ns: 'language' }),
          onClick: () => changeLanguage('en'),
        },
        {
          key: 'th',
          label: t('thai', { ns: 'language' }),
          onClick: () => changeLanguage('th'),
        },
      ],
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout', { ns: 'auth' }),
      onClick: handleLogout,
    },
  ];

  // Home menu config
  const homeMenu = {
    key: 'home',
    label: t('common:home') || 'Home',
    path: getUserHomePath(userProfile),
    icon: <DashboardOutlined />,
  };

  // Layer-aware navigation helper for admin/system routes
  const getLayerAwarePath = (basePath) => {
    // Only executive layer can access root-level admin routes
    if (userAccessLayer === 'executive') {
      return basePath;
    }

    // For non-executive users, prefix with their route prefix
    // but only for certain modules that support layer-based access
    const supportedModules = ['about', 'account'];
    const module = basePath.split('/')[1];

    if (supportedModules.includes(module)) {
      return `${userRoutePrefix.slice(0, -1)}${basePath}`;
    }

    // For admin-only routes, restrict access
    return null;
  };

  // Navigation items
  const navItemsRaw = [
    {
      key: homeMenu.key,
      icon: homeMenu.icon,
      label: homeMenu.label,
      onClick: () => navigate(homeMenu.path),
    },
    ...accountMenuItems,
    ...userManagementMenuItems,

    // Send Notification - Province admin and above
    hasRole(ROLES.PROVINCE_ADMIN) &&
      (['executive', 'general_manager'].includes(userAccessLayer) ||
        userAccessLayer === 'province') && {
        key: 'send-notification',
        icon: <TeamOutlined />,
        label: t('sendNotification:title') || 'Send Notification',
        onClick: () => {
          const path =
            userAccessLayer === 'executive'
              ? '/admin/send-notification'
              : `${userRoutePrefix}admin/send-notification`;
          navigateWithLayerCheck(path);
        },
      },

    // Developer tools - Developer role only
    hasRole(ROLES.DEVELOPER) && {
      key: 'developer',
      icon: <DashboardOutlined />,
      label: t('developer:title') || 'Developer',
      onClick: () => navigateWithLayerCheck('/developer'),
    },

    // Content management - Executive layer only
    hasPermission(PERMISSIONS.CONTENT_EDIT) &&
      userAccessLayer === 'executive' && {
        key: 'content',
        icon: <DashboardOutlined />,
        label: t('content:title') || 'Content',
        onClick: () => navigateWithLayerCheck('/admin/content'),
      },

    // Settings - Role and layer based
    (hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW) ||
      hasPermission(PERMISSIONS.SPECIAL_SETTINGS_VIEW)) && {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common:settings') || 'Settings',
      children: [
        // Special Settings - Executive only
        hasRole([ROLES.SUPER_ADMIN, ROLES.EXECUTIVE, ROLES.DEVELOPER]) &&
          userAccessLayer === 'executive' && {
            key: 'special-settings',
            icon: <TeamOutlined />,
            label: t('systemSettings:specialSettings') || 'Special Settings',
            children: [
              {
                key: 'special-settings-provinces',
                label: t('systemSettings:provinces') || 'จังหวัด',
                onClick: () => navigateWithLayerCheck('/special-settings/provinces'),
              },
              {
                key: 'special-settings-branches',
                label: t('systemSettings:branches') || 'สาขา',
                onClick: () => navigateWithLayerCheck('/special-settings/branches'),
              },
            ],
          },
        // System Settings - Layer aware
        {
          key: 'system-settings',
          icon: <SettingOutlined />,
          label: t('systemSettings:title') || 'System Settings',
          onClick: () => {
            const path =
              userAccessLayer === 'executive'
                ? '/admin/settings'
                : `${userRoutePrefix}admin/settings`;
            navigateWithLayerCheck(path);
          },
        },
      ].filter(Boolean),
    },

    // System Overview - Available to all but layer-aware
    {
      key: 'system-overview',
      icon: <DashboardOutlined />,
      label: t('about:systemOverview') || 'System Overview',
      onClick: () => {
        const path = getLayerAwarePath('/about/system-overview');
        if (path) {
          navigateWithLayerCheck(path);
        } else {
          // Fallback to user's home if not supported at their layer
          navigate(getUserHomePath(userProfile));
        }
      },
    },
  ];

  // Clean up nav items and ensure type safety
  const validNavItems = navItemsRaw.filter(Boolean).map((item) => ({
    ...item,
    key: item.key || String(item.label || '').toLowerCase(),
  }));

  // When collapsed, remove children to prevent popover
  const navItems = collapsed
    ? validNavItems.map((item) => ({ ...item, children: undefined }))
    : validNavItems;

  // --- Render ---
  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={60}
          className="bg-white dark:bg-gray-800 shadow hidden md:block fixed top-0 left-0 h-screen z-40"
          style={{ height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 40 }}
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <img src={logo} alt="KBN Logo" style={{ height: 32, marginRight: collapsed ? 0 : 8 }} />
            <h1 className="text-primary font-bold text-lg">{collapsed ? '' : 'KBN Platform'}</h1>
          </div>
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
            <Menu
              theme={theme === 'dark' ? 'dark' : 'light'}
              mode="inline"
              selectedKeys={[getSelectedKey(location, isBranchContext, openKeys, setOpenKeys)]}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              items={navItems}
              className="mt-2"
              getPopupContainer={() => document.querySelector('.ant-layout-sider') || document.body}
              triggerSubMenuAction="click"
            />
          </div>
        </Sider>
      )}
      {/* Mobile Sidebar Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logo} alt="KBN Logo" style={{ height: 32, marginRight: 8 }} />
              <h1 className="text-gray-500 font-bold text-lg">{t('title', { ns: 'app' })}</h1>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              aria-label={t('common.close')}
              onClick={() => setDrawerVisible(false)}
              className="ml-2"
            />
          </div>
        }
        placement="right"
        closable={!isMobile}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={320}
        bodyStyle={{ padding: 0 }}
        className={theme === 'dark' ? 'kbn-dark-drawer' : ''}
        style={{ background: theme === 'dark' ? '#111827' : '' }}
      >
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[getSelectedKey(location, isBranchContext, openKeys, setOpenKeys)]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={navItems}
          onClick={(info) => {
            // Find the clicked item in navItems
            const clicked = navItems.find((item) => item.key === info.key);
            // If the item has no children, close the drawer
            if (!clicked?.children) setDrawerVisible(false);
          }}
          style={{ background: theme === 'dark' ? '#111827' : '', borderRight: 'none' }}
        />
        <div
          className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-center gap-6">
            <ThemeSwitch />
            <LanguageSwitcher />
          </div>
        </div>
      </Drawer>
      {/* Main content */}
      <Layout>
        {/* Header */}
        <Header
          className="bg-white dark:bg-gray-800 p-0 flex items-center justify-between shadow"
          style={
            isMobile
              ? {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  width: '100vw',
                  zIndex: 50,
                  opacity: mobileHeaderFade,
                  transition: 'opacity 0.2s',
                  pointerEvents: mobileHeaderFade < 0.1 ? 'none' : 'auto',
                }
              : { marginLeft: collapsed ? 60 : 260 }
          }
        >
          {isMobile ? (
            <>
              <div className="flex items-center gap-4 ml-4" style={{ height: 40 }}>
                <ThemeSwitch />
                <NotificationCenter />
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <div
                    className="cursor-pointer flex items-center"
                    style={{ height: 36, marginLeft: 4 }}
                  >
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className="bg-primary"
                      size={36}
                    />
                  </div>
                </Dropdown>
              </div>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 20 }} />}
                onClick={() => setDrawerVisible(true)}
                className="flex items-center justify-center mr-4"
                style={{ height: 40, width: 40 }}
              />
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-16 w-16 text-lg"
                />
              </div>
              <div className="flex items-center gap-6 mr-4" style={{ height: 40 }}>
                <ThemeSwitch />
                <NotificationCenter />
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <div
                    className="cursor-pointer flex items-center"
                    style={{ height: 32, marginLeft: 10 }}
                  >
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className="bg-primary"
                      size={32}
                    />
                  </div>
                </Dropdown>
              </div>
            </>
          )}
        </Header>
        <Content
          className="p-3 sm:p-6 bg-background dark:bg-gray-900 min-h-[calc(100vh-64px)]"
          style={
            isMobile
              ? { marginTop: 64 }
              : { marginLeft: collapsed ? 80 : 260, minHeight: 'calc(100vh - 64px)' }
          }
        >
          {children || <Outlet />}
          <RouteDebugInfo />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
