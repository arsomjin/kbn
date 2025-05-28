import React, { useState } from 'react';
import { Drawer, Badge, Button, Typography, Space, Divider, Empty, Spin, Alert } from 'antd';
import {
  NotificationOutlined,
  CloseOutlined,
  CheckOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/AuthContext';
import { useNotifications } from 'hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { notificationController } from '../../controllers/notificationController';
import { useNotification } from './ToastNotification';
import NotificationItem from './NotificationItem';

const { Title, Text } = Typography;

/**
 * NotificationDrawer Component
 * A slide-out drawer that displays recent notifications with real-time updates
 */
const NotificationDrawer = ({ visible, onClose, onOpenSettings }) => {
  const { t } = useTranslation(['common', 'notifications']);
  const { userProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isDarkMode } = useTheme();

  const notifications = useSelector((state) => state.notifications.notifications);
  const {
    isLoading,
    unreadCount,
    hasMore,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);

  // Dark mode colors
  const drawerStyles = {
    header: {
      backgroundColor: isDarkMode ? '#2e2c26' : '#ffffff',
      borderBottom: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
      color: isDarkMode ? '#e9e5dd' : '#262626',
    },
    body: {
      backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
      color: isDarkMode ? '#e9e5dd' : '#262626',
    },
    actionBar: {
      backgroundColor: isDarkMode ? '#39382d' : '#fafafa',
      borderBottom: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
    },
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!userProfile?.uid || !notification.id) return;

    try {
      // Track engagement
      await notificationController.trackEngagement(notification.id, userProfile.uid, 'click');

      // Mark as read if unread
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigate if there's a link
      if (notification.link) {
        // Close drawer before navigation
        onClose();

        // Navigate to the link
        if (notification.link.startsWith('http')) {
          window.open(notification.link, '_blank');
        } else {
          window.location.href = notification.link;
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      showError(t('error'), t('errors.processNotificationClick'));
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!userProfile?.uid) return;

    try {
      setMarkingAllAsRead(true);
      await markAllAsRead();
      showSuccess(t('markAllAsRead'), t('success.markAllAsRead'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      showError(t('error'), t('errors.markAllAsRead'));
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      showError(t('error'), t('errors.refreshNotifications'));
    } finally {
      setRefreshing(false);
    }
  };

  // Handle drawer keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add staggered animation delay to notification items
  const getItemAnimationDelay = (index) => ({
    animationDelay: `${0.1 + index * 0.05}s`,
  });

  return (
    <Drawer
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <NotificationOutlined style={{ color: isDarkMode ? '#e9e5dd' : '#262626' }} />
            <Title level={4} style={{ margin: 0, color: isDarkMode ? '#e9e5dd' : '#262626' }}>
              {t('title', { ns: 'notifications' })}
            </Title>
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                size="small"
                style={{
                  backgroundColor: '#f5222d',
                  animation: 'badge-bounce 0.5s ease-out',
                }}
              />
            )}
          </Space>
          <Space>
            {/* Refresh button */}
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              title={t('common.refresh')}
              aria-label={t('common.refresh')}
              style={{
                color: isDarkMode ? '#b9b5ad' : '#8c8c8c',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
              }}
              className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-300`}
            />

            {/* Settings button */}
            {onOpenSettings && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                title={t('settings.title', { ns: 'notifications' })}
                aria-label={t('settings.title')}
                style={{
                  color: isDarkMode ? '#b9b5ad' : '#8c8c8c',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease',
                }}
                className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-300`}
              />
            )}
          </Space>
        </Space>
      }
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      closeIcon={<CloseOutlined style={{ color: isDarkMode ? '#e9e5dd' : '#262626' }} />}
      className={`notification-drawer ${isDarkMode ? 'dark-mode' : ''}`}
      styles={{
        body: {
          padding: 0,
          backgroundColor: drawerStyles.body.backgroundColor,
          color: drawerStyles.body.color,
        },
        header: {
          ...drawerStyles.header,
        },
      }}
      aria-label={t('accessibility.notificationList')}
      onKeyDown={handleKeyDown}
    >
      {/* Action Bar */}
      <div
        style={{
          padding: '16px',
          ...drawerStyles.actionBar,
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text
            type="secondary"
            style={{
              fontSize: '13px',
              color: isDarkMode ? '#b9b5ad' : '#8c8c8c',
              transition: 'color 0.3s ease',
            }}
          >
            {recentNotifications.length > 0
              ? t('showingRecent', { count: recentNotifications.length, ns: 'notifications' })
              : t('noNotifications', { ns: 'notifications' })}
          </Text>

          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              loading={markingAllAsRead}
              style={{
                padding: 0,
                height: 'auto',
                fontSize: '12px',
                color: isDarkMode ? '#9bc4a0' : '#1890ff',
                transition: 'all 0.3s ease',
              }}
              className={`${isDarkMode ? 'hover:text-green-300' : 'hover:text-blue-400'} transition-colors duration-300`}
            >
              {t('markAllAsRead', { ns: 'notifications' })}
            </Button>
          )}
        </Space>
      </div>

      {/* Notification List */}
      <div
        style={{
          height: 'calc(100vh - 180px)',
          overflow: 'auto',
          minHeight: '500px',
          backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
        }}
        className={`notification-list-container ${isDarkMode ? 'dark-scrollbar' : ''}`}
      >
        {isLoading && recentNotifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text
                type="secondary"
                style={{ color: isDarkMode ? '#b9b5ad' : '#8c8c8c' }}
                className="loading-text"
              >
                {t('loading', { ns: 'common' })}
              </Text>
            </div>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div style={{ padding: '32px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ color: isDarkMode ? '#b9b5ad' : '#8c8c8c' }}>
                  {t('noNotifications', { ns: 'notifications' })}
                </Text>
              }
              imageStyle={{ height: 60 }}
              className="notification-empty"
            />
          </div>
        ) : (
          <div>
            {recentNotifications.map((notification, index) => (
              <div
                key={`${notification.id}-${index}`}
                style={{
                  borderBottom:
                    index < recentNotifications.length - 1
                      ? `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`
                      : 'none',
                  padding: '16px 20px',
                  minHeight: '90px',
                  backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
                  transition: 'all 0.3s ease',
                  ...getItemAnimationDelay(index),
                }}
                className={`notification-drawer-item ${isDarkMode ? 'dark-hover' : ''}`}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onNotificationClick={handleNotificationClick}
                  compact={true}
                />
              </div>
            ))}

            {/* Load More Section */}
            {hasMore && (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderTop: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
                  backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
                  transition: 'all 0.3s ease',
                }}
              >
                <Button
                  type="link"
                  onClick={loadMoreNotifications}
                  loading={isLoading}
                  style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#9bc4a0' : '#1890ff',
                    transition: 'all 0.3s ease',
                  }}
                  className={`${isDarkMode ? 'hover:text-green-300' : 'hover:text-blue-400'} transition-colors duration-300`}
                >
                  {t('loadMore', { ns: 'notifications' })}
                </Button>
              </div>
            )}

            {/* View All Notifications Link */}
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                borderTop: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
                backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
                transition: 'all 0.3s ease',
              }}
            >
              <Button
                type="link"
                onClick={() => {
                  onClose();
                  window.location.href = '/notifications';
                }}
                style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#9bc4a0' : '#1890ff',
                  transition: 'all 0.3s ease',
                }}
                className={`${isDarkMode ? 'hover:text-green-300' : 'hover:text-blue-400'} transition-colors duration-300`}
              >
                {t('viewAll', { ns: 'notifications' })}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status Alert */}
      {!navigator.onLine && (
        <Alert
          message={t('common.offline')}
          description={t('common.offlineDesc')}
          type="warning"
          showIcon
          style={{
            margin: '16px',
            backgroundColor: isDarkMode ? '#39382d' : '#fffbe6',
            borderColor: isDarkMode ? '#434239' : '#ffd591',
            color: isDarkMode ? '#e9e5dd' : '#262626',
            animation: 'alert-slide-up 0.5s ease-out',
          }}
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
