import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Avatar, Dropdown, Drawer, Space } from 'antd';
import type { MenuProps } from 'antd';
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
  CloseOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Custom hooks
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';

// Components
import NotificationCenter from '../notifications/NotificationCenter';
import ThemeSwitch from '../common/ThemeSwitch';
import LanguageSwitcher from '../common/LanguageSwitcher';
import UserAvatar from '../common/UserAvatar';

// Utils
import { hasPrivilegedAccess, getLandingPage } from '../../utils/roleUtils';

// Constants
import { ROLES, RoleCategory } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasRole, hasPermission } = usePermissions();
  const photoURL =
    user?.photoURL || (userProfile && 'photoURL' in userProfile ? (userProfile as any).photoURL : undefined);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && drawerVisible) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerVisible]);

  // Fade effect for mobile top bar
  const [mobileHeaderFade, setMobileHeaderFade] = useState(1);
  useEffect(() => {
    if (!isMobile) {
      setMobileHeaderFade(1);
      return;
    }
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      let opacity = 1;
      if (scrollY > 32) {
        opacity = Math.max(0, 1 - (scrollY - 32) / 64);
      }
      setMobileHeaderFade(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Handle language change
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile', { ns: 'common' }),
      onClick: () => navigate('/profile')
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: t('settings', { ns: 'common' }),
    //   onClick: () => navigate('/settings')
    // },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: t('changeLanguage', { ns: 'language' }),
      children: [
        {
          key: 'en',
          label: t('english', { ns: 'language' }),
          onClick: () => changeLanguage('en')
        },
        {
          key: 'th',
          label: t('thai', { ns: 'language' }),
          onClick: () => changeLanguage('th')
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout', { ns: 'auth' }),
      onClick: handleLogout
    }
  ];

  // Determine landing page and label for the main sidebar item
  let homeKey = 'home';
  let homeLabel = t('common:home') || 'Home';
  let homePath = getLandingPage(userProfile);
  const homeIcon = <DashboardOutlined />;

  if (userProfile?.role === ROLES.PROVINCE_MANAGER || userProfile?.role === ROLES.GENERAL_MANAGER) {
    homeKey = 'dashboard';
    homeLabel = t('dashboard:title') || 'Dashboard';
    homePath = '/dashboard';
  } else if (userProfile?.role === ROLES.BRANCH_MANAGER) {
    homeKey = 'branch-dashboard';
    homeLabel = t('branchDashboard:title') || 'Branch Dashboard';
    homePath = '/branch-dashboard';
  } else if (hasPrivilegedAccess(userProfile)) {
    homeKey = 'overview';
    homeLabel = t('overview:title') || 'Overview';
    homePath = '/overview';
  }

  // Main navigation items
  const navItemsRaw = [
    {
      key: homeKey,
      icon: homeIcon,
      label: homeLabel,
      onClick: () => navigate(homePath)
    },
    // Only add dashboard/branch-dashboard/overview if not the same as home
    homeKey !== 'overview' &&
      hasRole(ROLES.PRIVILEGE) && {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: t('overview:title') || 'Overview',
        onClick: () => navigate('/overview')
      },
    homeKey !== 'dashboard' &&
      hasRole(ROLES.PROVINCE_MANAGER) && {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: t('dashboard:title') || 'Dashboard',
        onClick: () => navigate('/dashboard')
      },
    homeKey !== 'branch-dashboard' &&
      hasRole(ROLES.BRANCH_MANAGER) && {
        key: 'branch-dashboard',
        icon: <DashboardOutlined />,
        label: t('dashboard:branchDashboard') || 'Branch Dashboard',        
        onClick: () => navigate('/branch-dashboard')
      },
    hasRole(ROLES.PROVINCE_ADMIN) && {
      key: 'user-review',
      icon: <TeamOutlined />,
      label: t('userReview:title'),
      onClick: () => navigate('/admin/review-users')
    },
    hasRole(ROLES.PROVINCE_ADMIN) && {
      key: 'send-notification',
      icon: <TeamOutlined />,
      label: t('sendNotification:title') || 'Send Notification',
      onClick: () => navigate('/admin/send-notification')
    },
    hasRole(ROLES.DEVELOPER) && {
      key: 'developer',
      icon: <DashboardOutlined />,
      label: t('developer:title') || 'Developer',
      onClick: () => navigate('/developer')
    },
    hasPermission(PERMISSIONS.CONTENT_EDIT) && {
      key: 'content',
      icon: <DashboardOutlined />,
      label: t('content:title') || 'Content',
      onClick: () => navigate('/admin/content')
    },
    // Settings submenu
    (hasPermission(PERMISSIONS.USER_VIEW) ||
     hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW)) && {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common:settings') || 'Settings',
      children: [
        // User management
        hasPermission(PERMISSIONS.USER_VIEW) && {
          key: 'user-management',
          icon: <TeamOutlined />,
          label: t('userManagement:title') || 'User Management',
          onClick: () => navigate('/admin/users')
        },
        // System settings
        hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW) && {
          key: 'system-settings',
          icon: <SettingOutlined />,
          label: t('systemSettings:title') || 'System Settings',
          onClick: () => navigate('/admin/settings')
        },
        // Branch settings (only SUPER_ADMIN and PRIVILEGE)
        (hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE])) && {
          key: 'branches',
          icon: <BankOutlined />,
          label: t('branches:title') || 'Branches',
          onClick: () => navigate('/admin/branches')
        },
        // Province settings (only SUPER_ADMIN and PRIVILEGE)
        (hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE])) && {
          key: 'provinces',
          icon: <SettingOutlined />,
          label: t('provinces:title') || 'Provinces',
          onClick: () => navigate('/admin/provinces')
        }
      ].filter(Boolean)
    }
  ];
  const navItems: MenuProps['items'] = navItemsRaw.filter(Boolean) as MenuProps['items'];

  // Map pathname to menu key and determine open menu keys
  const [openKeys, setOpenKeys] = useState<string[]>(['settings']);
  
  const getSelectedKey = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/landing')) return 'home';
    if (location.pathname.startsWith('/overview')) return 'overview';
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/branch-dashboard')) return 'branch-dashboard';
    if (location.pathname.startsWith('/admin/review-users')) return 'user-review';
    if (location.pathname.startsWith('/admin/send-notification')) return 'send-notification';
    if (location.pathname.startsWith('/developer')) return 'developer';
    if (location.pathname.startsWith('/admin/content')) return 'content';
    // Settings submenu items
    if (location.pathname.startsWith('/admin/users')) {
      if (!openKeys.includes('settings')) setOpenKeys(['settings']);
      return 'user-management';
    }
    if (location.pathname.startsWith('/admin/settings')) {
      if (!openKeys.includes('settings')) setOpenKeys(['settings']);
      return 'system-settings';
    }
    if (location.pathname.startsWith('/admin/provinces')) {
      if (!openKeys.includes('settings')) setOpenKeys(['settings']);
      return 'provinces';
    }
    if (location.pathname.startsWith('/admin/branches')) {
      if (!openKeys.includes('settings')) setOpenKeys(['settings']);
      return 'branches';
    }
    return '';
  };

  return (
    <Layout className='min-h-screen'>
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className='bg-white dark:bg-gray-800 shadow hidden md:block'
        >
          <div className='h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700'>
            <img
              src={require('../../assets/logo/kbn_pwa_assets/android-chrome-192x192.png')}
              alt='KBN Logo'
              style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
            />
            <h1 className='text-primary font-bold text-lg'>{collapsed ? 'KBN' : 'KBN Platform'}</h1>
          </div>
          <Menu
            theme={theme === 'dark' ? 'dark' : 'light'}
            mode='inline'
            selectedKeys={[getSelectedKey()]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={navItems}
            className='mt-2'
          />
        </Sider>
      )}

      {/* Mobile sidebar drawer - Change placement to "right" */}
      <Drawer
        title={
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <img
                src={require('../../assets/logo/kbn_pwa_assets/android-chrome-192x192.png')}
                alt='KBN Logo'
                style={{ height: 32, marginRight: 8 }}
              />
              <h1 className='text-gray-500 font-bold text-lg'>{t('title', { ns: 'app' })}</h1>
            </div>
            <Button
              type='text'
              size='small'
              icon={<CloseOutlined />}
              aria-label={t('common.close')}
              onClick={() => setDrawerVisible(false)}
              className='ml-2'
            />
          </div>
        }
        placement='right'
        closable={!isMobile}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={320}
        bodyStyle={{ padding: 0 }}
        className={theme === 'dark' ? 'kbn-dark-drawer' : ''}
        style={{
          background: theme === 'dark' ? '#111827' : '' // Darker background in dark mode (equivalent to gray-900)
        }}
      >
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode='inline'
          selectedKeys={[getSelectedKey()]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={navItems}
          onClick={(info) => {
            // Only close drawer when clicking a menu item without children
            if (!info.keyPath.includes('settings')) {
              setDrawerVisible(false);
            }
          }}
          style={{
            background: theme === 'dark' ? '#111827' : '', // Darker background in dark mode
            borderRight: 'none'
          }}
        />
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200'}`}>
          <div className='flex items-center justify-center gap-6'>
            <ThemeSwitch />
            <LanguageSwitcher />
          </div>
        </div>
      </Drawer>

      {/* Main content */}
      <Layout>
        {/* Header - Redesigned for mobile UI */}
        <Header
          className='bg-white dark:bg-gray-800 p-0 flex items-center justify-between shadow'
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
                  pointerEvents: mobileHeaderFade < 0.1 ? 'none' : 'auto'
                }
              : {}
          }
        >
          {isMobile ? (
            <>
              {/* Clean mobile header with NotificationCenter, profile in middle, burger menu on right */}
              <div className='flex items-center ml-4'>
                {/* NotificationCenter on the left */}
                <NotificationCenter />
                {/* Profile avatar in center */}
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <div className='cursor-pointer'>
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className='bg-primary ml-4'
                      size={36}
                    />
                  </div>
                </Dropdown>
              </div>
              {/* Burger menu on right */}
              <Button
                type='text'
                icon={<MenuOutlined style={{ fontSize: 20 }} />}
                onClick={() => setDrawerVisible(true)}
                className='flex items-center justify-center mr-4'
                style={{ height: 40, width: 40 }}
              />
            </>
          ) : (
            <>
              <div className='flex items-center'>
                <Button
                  type='text'
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className='h-16 w-16 text-lg'
                />
              </div>
              <div className='flex items-center mr-4'>
                <Space size={16}>
                  <ThemeSwitch />
                  {/* NotificationCenter for desktop */}
                  <NotificationCenter />
                  {/* User menu */}
                  <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                    <div className='cursor-pointer'>
                      <UserAvatar
                        photoURL={photoURL}
                        displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                        className='bg-primary'
                        size={32}
                      />
                    </div>
                  </Dropdown>
                </Space>
              </div>
            </>
          )}
        </Header>

        {/* Main content */}
        <Content
          className='p-3 sm:p-6 bg-background dark:bg-gray-900 min-h-[calc(100vh-64px)]'
          style={isMobile ? { paddingTop: 64 } : {}}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
