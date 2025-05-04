import React, { useState } from 'react';
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
  TeamOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Custom hooks
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';

// Components (to be created)
import NotificationDrawer from '../common/NotificationDrawer';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, isNotificationDrawerOpen, toggleNotificationDrawer } =
    useNotifications(userProfile);
  const { hasRole, hasPermission } = usePermissions();
  const [avatarError, setAvatarError] = useState(false);
  const photoURL =
    user?.photoURL || (userProfile && 'photoURL' in userProfile ? (userProfile as any).photoURL : undefined);
  const location = useLocation();

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
      label: t('common.profile'),
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common.settings'),
      onClick: () => navigate('/settings')
    },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: t('language.changeLanguage'),
      children: [
        {
          key: 'en',
          label: t('language.english'),
          onClick: () => changeLanguage('en')
        },
        {
          key: 'th',
          label: t('language.thai'),
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
      label: t('auth.logout'),
      onClick: handleLogout
    }
  ];

  // Determine landing page and label for the main sidebar item
  let homeKey = 'home';
  let homeLabel = t('common.home') || 'Home';
  let homePath = getLandingPage(userProfile);
  const homeIcon = <DashboardOutlined />;

  if (userProfile?.role === ROLES.PROVINCE_MANAGER || userProfile?.role === ROLES.GENERAL_MANAGER) {
    homeKey = 'dashboard';
    homeLabel = t('app.title') || 'Dashboard';
    homePath = '/dashboard';
  } else if (userProfile?.role === ROLES.BRANCH_MANAGER) {
    homeKey = 'branch-dashboard';
    homeLabel = t('branchDashboard.title') || 'Branch Dashboard';
    homePath = '/branch-dashboard';
  } else if (hasPrivilegedAccess(userProfile)) {
    homeKey = 'overview';
    homeLabel = t('overview.title') || 'Overview';
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
    (homeKey !== 'overview' && hasRole(ROLES.PRIVILEGED)) && {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: t('overview.title') || 'Overview',
      onClick: () => navigate('/overview')
    },
    (homeKey !== 'dashboard' && hasRole(ROLES.PROVINCE_MANAGER)) && {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('app.title'),
      onClick: () => navigate('/dashboard')
    },
    (homeKey !== 'branch-dashboard' && hasRole(ROLES.BRANCH_MANAGER)) && {
      key: 'branch-dashboard',
      icon: <DashboardOutlined />,
      label: t('branchDashboard.title') || 'Branch Dashboard',
      onClick: () => navigate('/branch-dashboard')
    },
    hasRole(ROLES.ADMIN) && {
      key: 'user-review',
      icon: <TeamOutlined />,
      label: t('userReview.title'),
      onClick: () => navigate('/review-users')
    },
    hasRole(ROLES.ADMIN) && {
      key: 'send-notification',
      icon: <TeamOutlined />,
      label: t('sendNotification.title') || 'Send Notification',
      onClick: () => navigate('/send-notification')
    },
    hasRole(ROLES.DEVELOPER) && {
      key: 'developer',
      icon: <DashboardOutlined />,
      label: t('developer.title') || 'Developer',
      onClick: () => navigate('/developer')
    },
    hasPermission(PERMISSIONS.CONTENT_EDIT) && {
      key: 'content',
      icon: <DashboardOutlined />,
      label: t('content.title') || 'Content',
      onClick: () => navigate('/admin/content')
    },
    hasPermission(PERMISSIONS.USER_VIEW) && {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: t('userManagement.title') || 'User Management',
      onClick: () => navigate('/admin/users')
    },
    hasPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW) && {
      key: 'system-settings',
      icon: <SettingOutlined />,
      label: t('systemSettings.title') || 'System Settings',
      onClick: () => navigate('/admin/settings')
    }
  ];
  const navItems: MenuProps['items'] = navItemsRaw.filter(Boolean) as MenuProps['items'];

  // Map pathname to menu key
  const getSelectedKey = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/landing')) return 'home';
    if (location.pathname.startsWith('/overview')) return 'overview';
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/branch-dashboard')) return 'branch-dashboard';
    if (location.pathname.startsWith('/review-users')) return 'user-review';
    if (location.pathname.startsWith('/send-notification')) return 'send-notification';
    if (location.pathname.startsWith('/developer')) return 'developer';
    if (location.pathname.startsWith('/admin/content')) return 'content';
    if (location.pathname.startsWith('/admin/users')) return 'user-management';
    if (location.pathname.startsWith('/admin/settings')) return 'system-settings';
    return '';
  };

  console.log('MainLayout:', {
    user,
    userProfile,
    theme,
    unreadCount,
    isNotificationDrawerOpen,
    notifications
  });

  return (
    <Layout className='min-h-screen'>
      {/* Sidebar */}
      <Sider trigger={null} collapsible collapsed={collapsed} className='bg-white dark:bg-gray-800 shadow'>
        <div className='h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700'>
          <h1 className='text-primary font-bold text-lg'>{collapsed ? 'KBN' : 'KBN Admin'}</h1>
        </div>
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode='inline'
          selectedKeys={[getSelectedKey()]}
          items={navItems}
          className='mt-2'
        />
      </Sider>

      {/* Main content */}
      <Layout>
        {/* Header */}
        <Header className='bg-white dark:bg-gray-800 p-0 flex items-center justify-between shadow'>
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className='h-16 w-16 text-lg'
          />

          {/* Right side controls */}
            <Space className='mr-6' size={24}>
                <ThemeSwitch />

                {/* Notification bell */}
                <Badge count={unreadCount} overflowCount={99}>
                  <Button
                  type='text'
                  icon={<BellOutlined />}
                  onClick={() => toggleNotificationDrawer()}
                  className='h-10 w-10 flex items-center justify-center text-lg'
                  />
                </Badge>

                {/* User menu */}
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                  <Space className='cursor-pointer' size={12}>
                    <UserAvatar
                      photoURL={photoURL}
                      displayName={userProfile?.displayName ?? user?.displayName ?? undefined}
                      className='bg-primary'
                    />
                    {/* {!collapsed && <span className='text-primary'>{userProfile?.displayName || t('common.user')}</span>} */}
                  </Space>
                </Dropdown>
            </Space>
        </Header>

        {/* Main content */}
        <Content className='p-6 bg-background dark:bg-gray-900 min-h-[calc(100vh-64px)]'>
          <Outlet />
        </Content>
      </Layout>

      {/* Notification drawer */}
      <NotificationDrawer
        open={isNotificationDrawerOpen}
        onClose={() => toggleNotificationDrawer(false)}
        notifications={notifications}
      />
    </Layout>
  );
};

export default MainLayout;
