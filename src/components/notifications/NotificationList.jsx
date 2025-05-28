import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Typography, Space, Button, Empty, Badge, List, Spin } from 'antd';
import { useNotifications } from 'hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { notificationController } from '../../controllers/notificationController';
import './NotificationList.css';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationItem from './NotificationItem';

const { Text } = Typography;

/**
 * NotificationList - Full page list of notifications with filtering and pagination
 */
const NotificationList = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const notifications = useSelector((state) => state.notifications.notifications);
  const { isLoading, hasMore, loadMoreNotifications, markAsRead } = useNotifications();
  const { t } = useTranslation('notifications');

  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: null,
  });

  function isTimestamp(obj) {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.seconds === 'number' &&
      typeof obj.nanoseconds === 'number'
    );
  }

  // Apply filters whenever filters or notifications change
  useEffect(() => {
    const filtered = notifications.filter((notification) => {
      const desc = notification.description ?? notification.title ?? '';
      const matchesSearch =
        !filters.search ||
        notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        desc.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.type === 'all' || notification.type === filters.type;

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'read' && notification.isRead) ||
        (filters.status === 'unread' && !notification.isRead);

      let matchesDate = true;
      if (filters.dateRange) {
        let createdAtDate;
        if (isTimestamp(notification.createdAt)) {
          createdAtDate = new Date(notification.createdAt.seconds * 1000);
        } else if (typeof notification.createdAt === 'string') {
          createdAtDate = new Date(notification.createdAt);
        } else {
          createdAtDate = new Date();
        }
        const startDate = filters.dateRange[0].toDate();
        const endDate = filters.dateRange[1].toDate();
        endDate.setHours(23, 59, 59, 999);
        matchesDate = createdAtDate >= startDate && createdAtDate <= endDate;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    setFilteredNotifications(filtered);
  }, [filters, notifications]);

  const handleNotificationClick = (notification) => {
    if (!userProfile?.uid || !notification.id) return;

    // Track notification click for analytics
    notificationController.trackEngagement(notification.id, userProfile.uid, 'click');

    // Mark as read
    markAsRead(notification.id);

    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Add staggered animation delay for list items
  const getListItemDelay = (index) => ({
    animationDelay: `${index * 0.1}s`,
    opacity: 0,
    animation: `list-item-slide-in 0.5s ease-out ${index * 0.1}s forwards`,
  });

  if (isLoading && filteredNotifications.length === 0) {
    return (
      <div
        className={`notification-list-loading ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
          color: isDarkMode ? '#e9e5dd' : '#262626',
          padding: '32px',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text style={{ color: isDarkMode ? '#b9b5ad' : '#8c8c8c' }} className="loading-text">
            {t('common.loading')}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`notification-list-container ${isDarkMode ? 'dark-mode' : ''}`}
      style={{
        backgroundColor: isDarkMode ? '#23241e' : '#ffffff',
        color: isDarkMode ? '#e9e5dd' : '#262626',
        minHeight: '100vh',
        padding: '24px',
        animation: 'fade-in 0.6s ease-out',
      }}
    >
      {filteredNotifications.length === 0 ? (
        <div
          style={{
            backgroundColor: isDarkMode ? '#2e2c26' : '#ffffff',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            border: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
            animation: 'fade-in 0.6s ease-out',
          }}
        >
          <Empty
            description={
              <Text style={{ color: isDarkMode ? '#b9b5ad' : '#8c8c8c' }}>
                {t('noNotifications')}
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="notification-list-empty"
            imageStyle={{
              height: 60,
              filter: isDarkMode ? 'invert(0.8)' : 'none',
            }}
          />
        </div>
      ) : (
        <List
          className={`notification-list ${isDarkMode ? 'dark-mode' : ''}`}
          itemLayout="horizontal"
          dataSource={filteredNotifications}
          renderItem={(notification, index) => (
            <div
              style={{
                backgroundColor: isDarkMode ? '#2e2c26' : '#ffffff',
                borderRadius: '8px',
                marginBottom: '12px',
                border: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                ...getListItemDelay(index),
              }}
              className={`notification-list-item ${isDarkMode ? 'dark-hover' : ''}`}
            >
              <NotificationItem
                key={`notification-${notification.id}-${index}`}
                notification={notification}
                onMarkAsRead={handleNotificationClick}
              />
            </div>
          )}
          footer={
            hasMore && (
              <div
                className="notification-list-footer"
                style={{
                  backgroundColor: isDarkMode ? '#2e2c26' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#434239' : '#f0f0f0'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  marginTop: '16px',
                  animation: 'fade-in 0.6s ease-out 0.3s backwards',
                }}
              >
                <Button
                  onClick={loadMoreNotifications}
                  loading={isLoading}
                  style={{
                    color: isDarkMode ? '#9bc4a0' : '#1890ff',
                    borderColor: isDarkMode ? '#9bc4a0' : '#1890ff',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease',
                  }}
                  className={
                    isDarkMode
                      ? 'hover:bg-green-700 hover:text-white transition-all duration-300'
                      : 'hover:bg-blue-50 transition-all duration-300'
                  }
                >
                  {t('loadMore')}
                </Button>
              </div>
            )
          }
        />
      )}
    </div>
  );
};

export default NotificationList;
