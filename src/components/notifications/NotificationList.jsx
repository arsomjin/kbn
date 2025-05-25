import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Typography, Space, Button, Empty, Badge, List, Spin } from 'antd';
import { useNotifications } from 'hooks/useNotifications';
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    setCurrentPage(1);
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

  // For pagination
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === Math.ceil(filteredNotifications.length / pageSize) && hasMore) {
      loadMoreNotifications();
    }
  };

  if (isLoading && filteredNotifications.length === 0) {
    return (
      <div className="notification-list-loading">
        <Spin />
      </div>
    );
  }

  return (
    <div className="notification-list-container">
      {filteredNotifications.length === 0 ? (
        <Empty
          description={t('notifications.noNotifications')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="notification-list-empty"
        />
      ) : (
        <List
          className="notification-list"
          itemLayout="horizontal"
          dataSource={paginatedNotifications}
          renderItem={(notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleNotificationClick}
            />
          )}
          footer={
            hasMore && (
              <div className="notification-list-footer">
                <Button onClick={handlePageChange} loading={isLoading}>
                  {t('notifications.loadMore')}
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
