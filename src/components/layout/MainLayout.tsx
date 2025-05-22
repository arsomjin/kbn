import React, { useState, useEffect, ReactElement } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
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
  CloseOutlined,
  UsergroupAddOutlined,
  AccountBookOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Custom hooks
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'hooks/useTheme';
import { useNotifications } from 'hooks/useNotifications';
import { usePermissions } from 'hooks/usePermissions';
import { useAccountMenuChildren } from './useAccountMenuChildren';

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

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface NavItemType {
  title: string;
  items?: Array<{
    title: string;
    key: string;
    icon?: React.ReactNode;
    label: string;
    to?: string;
    onClick?: () => void;
    children?: Array<{
      key: string;
      icon?: React.ReactNode;
      label: string;
      onClick?: () => void;
    }>;
  }>;
}

interface ValidMenuNavItem {
  key: string;
  icon: ReactElement;
  label: string;
  onClick?: () => void | Promise<void>;
  children?: ValidMenuNavItem[];
}

/**
 * Returns the correct account base path depending on context.
 */
const useAccountBasePath = (): string => {
  const params = useParams();
  if (params.provinceId && params.branchCode) {
    return `/${params.provinceId}/${params.branchCode}/account`;
  } else if (params.provinceId) {
    return `/${params.provinceId}/account`;
  }
  return '/account';
};

/**
 * Returns the correct home menu config based on user role.
 */
const useHomeMenu = (userProfile: any, t: any): { key: string; label: string; path: string; icon: React.ReactNode } => {
  if (!userProfile) {
    return { key: 'home', label: t('common:home') || 'Home', path: '/', icon: <DashboardOutlined /> };
  }
  if (userProfile.role === ROLES.PROVINCE_MANAGER || userProfile.role === ROLES.GENERAL_MANAGER) {
    return {
      key: 'dashboard',
      label: t('dashboard:title') || 'Dashboard',
      path: '/dashboard',
      icon: <DashboardOutlined />
    };
  }
  if (userProfile.role === ROLES.BRANCH_MANAGER) {
    return {
      key: 'branch-dashboard',
      label: t('dashboard:branchDashboard') || 'Branch Dashboard',
      path: '/branch-dashboard',
      icon: <DashboardOutlined />
    };
  }
  if (hasPrivilegedAccess(userProfile)) {
    return {
      key: 'overview',
      label: t('overview:title') || 'Overview',
      path: '/overview',
      icon: <DashboardOutlined />
    };
  }
  return { key: 'home', label: t('common:home') || 'Home', path: '/', icon: <DashboardOutlined /> };
};

/**
 * Returns the selected menu key based on the current location.
 */
const getSelectedKey = (
  location: any,
  isBranchContext: boolean,
  openKeys: string[],
  setOpenKeys: (keys: string[]) => void
): string => {
  const pathname = location.pathname;
  if (pathname === '/' || pathname.startsWith('/landing')) return 'home';
  if (pathname.startsWith('/overview')) return 'overview';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/branch-dashboard')) return 'branch-dashboard';
  if (isBranchContext && pathname.includes('/account')) {
    if (pathname.endsWith('/account') || pathname.endsWith('/account/')) return 'account-overview';
    if (pathname.includes('/account/income')) return 'account-income';
    if (pathname.includes('/account/expense')) return 'account-expense';
    if (pathname.includes('/account/input-price')) return 'account-price-input';
    return 'account';
  }
  if (pathname.startsWith('/account')) {
    if (pathname === '/account') return 'account-overview';
    if (pathname.startsWith('/account/income')) return 'account-income';
    if (pathname.startsWith('/account/expense')) return 'account-expense';
    if (pathname.startsWith('/account/input-price')) return 'account-price-input';
    return 'account';
  }
  if (pathname.startsWith('/admin/review-users')) return 'user-review';
  if (pathname.startsWith('/admin/send-notification')) return 'send-notification';
  if (pathname.startsWith('/developer')) return 'developer';
  if (pathname.startsWith('/admin/content')) return 'content';
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
  if (pathname.startsWith('/admin/provinces')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'provinces';
  }
  if (pathname.startsWith('/admin/branches')) {
    if (!openKeys.includes('settings')) setOpenKeys(['settings']);
    return 'branches';
  }
  if (pathname.startsWith('/about/system-overview')) {
    return 'system-overview';
  }
  return '';
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openKeys, setOpenKeys] = useState<string[]>(['settings']);
  const [mobileHeaderFade, setMobileHeaderFade] = useState(1);

  // Hooks
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { theme } = useTheme();
  const { hasRole, hasPermission } = usePermissions();
  const location = useLocation();
  const params = useParams();
  const isBranchContext = Boolean(params.provinceId && params.branchCode);
  const accountBasePath = useAccountBasePath();
  const accountMenuChildren = useAccountMenuChildren(accountBasePath);
  const photoURL =
    user?.photoURL || (userProfile && 'photoURL' in userProfile ? (userProfile as any).photoURL : undefined);

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

  // Language change
  const changeLanguage = (language: string) => i18n.changeLanguage(language);

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
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile', { ns: 'common' }),
      onClick: () => navigate('/personal-profile')
    },
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
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout', { ns: 'auth' }),
      onClick: handleLogout
    }
  ];

  // Home menu config
  const homeMenu = useHomeMenu(userProfile, t);

  // Navigation items
  const navItemsRaw = [
    {
      key: homeMenu.key,
      icon: homeMenu.icon,
      label: homeMenu.label,
      onClick: () => navigate(homeMenu.path)
    },
    homeMenu.key !== 'overview' &&
      hasRole(ROLES.PRIVILEGE) && {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: t('overview:title') || 'Overview',
        onClick: () => navigate('/overview')
      },
    homeMenu.key !== 'dashboard' &&
      hasRole(ROLES.PROVINCE_MANAGER) && {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: t('dashboard:title') || 'Dashboard',
        onClick: () => navigate('/dashboard')
      },
    homeMenu.key !== 'branch-dashboard' &&
      hasRole(ROLES.BRANCH_MANAGER) && {
        key: 'branch-dashboard',
        icon: <DashboardOutlined />,
        label: t('dashboard:branchDashboard') || 'Branch Dashboard',
        onClick: () => navigate('/branch-dashboard')
      },
    hasPermission(PERMISSIONS.VIEW_ACCOUNTS) && {
      key: 'account',
      icon: <AccountBookOutlined />,
      label: t('account:title') || 'Account Management',
      children: accountMenuChildren
    },
    hasPermission(PERMISSIONS.USER_VIEW) && {
      key: 'employee-management',
      icon: <UsergroupAddOutlined />,
      label: t('employees:title') || 'Employee Management',
      onClick: () => navigate('/admin/employees')
    },
    hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE, ROLES.GENERAL_MANAGER, ROLES.DEVELOPER]) && {
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
    (hasPermission(PERMISSIONS.USER_VIEW) || hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW)) && {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common:settings') || 'Settings',
      children: [
        hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE, ROLES.GENERAL_MANAGER, ROLES.DEVELOPER]) && {
          key: 'user-management',
          icon: <TeamOutlined />,
          label: t('userManagement:title') || 'User Management',
          onClick: () => navigate('/admin/users')
        },
        hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW) && {
          key: 'system-settings',
          icon: <SettingOutlined />,
          label: t('systemSettings:title') || 'System Settings',
          onClick: () => navigate('/admin/settings')
        },
        hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE, ROLES.BRANCH_MANAGER, ROLES.PROVINCE_ADMIN, ROLES.DEVELOPER]) && {
          key: 'branches',
          icon: <BankOutlined />,
          label: t('branches:title') || 'Branches',
          onClick: () => navigate('/admin/branches')
        },
        hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE, ROLES.DEVELOPER]) && {
          key: 'provinces',
          icon: <SettingOutlined />,
          label: t('provinces:title') || 'Provinces',
          onClick: () => navigate('/admin/provinces')
        }
      ].filter(Boolean)
    },
    {
      key: 'system-overview',
      icon: <DashboardOutlined />,
      label: t('about:systemOverview') || 'System Overview',
      onClick: () => navigate('/about/system-overview')
    }
  ];

  // Clean up nav items and ensure type safety
  const validNavItems = (navItemsRaw.filter(Boolean) as ValidMenuNavItem[]).map(item => ({
    ...item,
    key: item.key || String(item.label || '').toLowerCase()
  }));

  // When collapsed, remove children to prevent popover
  const navItems = (
    collapsed ? validNavItems.map(item => ({ ...item, children: undefined })) : validNavItems
  ) as MenuProps['items'];

  // --- Render ---
  return (
    <Layout className='min-h-screen'>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={80}
          className='bg-white dark:bg-gray-800 shadow hidden md:block fixed top-0 left-0 h-screen z-40'
          style={{ height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 40 }}
        >
          <div className='h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700'>
            <img
              src={require('../../assets/logo/kbn_pwa_assets/android-chrome-192x192.png')}
              alt='KBN Logo'
              style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
            />
            <h1 className='text-primary font-bold text-lg'>{collapsed ? 'KBN' : 'KBN Platform'}</h1>
          </div>
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
            <Menu
              theme={theme === 'dark' ? 'dark' : 'light'}
              mode='inline'
              selectedKeys={[getSelectedKey(location, isBranchContext, openKeys, setOpenKeys)]}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              items={navItems}
              className='mt-2'
              getPopupContainer={() => document.querySelector('.ant-layout-sider') || document.body}
              triggerSubMenuAction='click'
            />
          </div>
        </Sider>
      )}
      {/* Mobile Sidebar Drawer */}
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
        style={{ background: theme === 'dark' ? '#111827' : '' }}
      >
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode='inline'
          selectedKeys={[getSelectedKey(location, isBranchContext, openKeys, setOpenKeys)]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={navItems}
          onClick={info => {
            if (!info.keyPath.includes('settings')) setDrawerVisible(false);
          }}
          style={{ background: theme === 'dark' ? '#111827' : '', borderRight: 'none' }}
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
        {/* Header */}
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
              : { marginLeft: collapsed ? 80 : 260 }
          }
        >
          {isMobile ? (
            <>
              <div className='flex items-center gap-4 ml-4' style={{ height: 40 }}>
                <ThemeSwitch />
                <NotificationCenter />
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <div className='cursor-pointer flex items-center' style={{ height: 36, marginLeft: 4 }}>
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className='bg-primary'
                      size={36}
                    />
                  </div>
                </Dropdown>
              </div>
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
              <div className='flex items-center gap-6 mr-4' style={{ height: 40 }}>
                <ThemeSwitch />
                <NotificationCenter />
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <div className='cursor-pointer flex items-center' style={{ height: 32, marginLeft: 10 }}>
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className='bg-primary'
                      size={32}
                    />
                  </div>
                </Dropdown>
              </div>
            </>
          )}
        </Header>
        <Content
          className='p-3 sm:p-6 bg-background dark:bg-gray-900 min-h-[calc(100vh-64px)]'
          style={isMobile ? { paddingTop: 64 } : { marginLeft: collapsed ? 80 : 260, minHeight: 'calc(100vh - 64px)' }}
        >
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
