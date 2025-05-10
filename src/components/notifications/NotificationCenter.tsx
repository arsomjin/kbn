import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Dropdown, Button, List, Avatar, Typography, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../services/notificationService';
import { notificationController } from '../../controllers/notificationController';
import './NotificationCenter.css';

const { Text, Title } = Typography;

// Map notification types to their corresponding icons and colors
const notificationTypeConfig = {
  [NotificationType.SUCCESS]: { color: '#52c41a', icon: '✓' },
  [NotificationType.INFO]: { color: '#1890ff', icon: 'ℹ' },
  [NotificationType.WARNING]: { color: '#faad14', icon: '⚠' },
  [NotificationType.ERROR]: { color: '#f5222d', icon: '✕' }
};

/**
 * Single notification item component
 */
const NotificationItem: React.FC<{
  notification: Notification;
  onClick: (notification: Notification) => void;
}> = ({ notification, onClick }) => {
  const getTypeConfig = (type: NotificationType) => {
    return notificationTypeConfig[type] || notificationTypeConfig[NotificationType.INFO];
  };

  const config = getTypeConfig(notification.type);
  const formattedDate = typeof notification.createdAt === 'string' 
    ? new Date(notification.createdAt).toLocaleString()
    : new Date(notification.createdAt.seconds * 1000).toLocaleString();

  return (
    <List.Item
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={() => onClick(notification)}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            style={{ backgroundColor: config.color }}
            icon={notification.imageUrl ? null : config.icon}
            src={notification.imageUrl}
          />
        }
        title={
          <div className='notification-title'>
            <Text strong>{notification.title}</Text>
            <Text type='secondary' className='notification-time'>
              {formattedDate}
            </Text>
          </div>
        }
        description={<Text className='notification-description'>{notification.description}</Text>}
      />
    </List.Item>
  );
};

/**
 * NotificationCenter component with dropdown menu
 */
const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const { notifications, unreadCount, isLoading, hasMore, markAllAsRead, loadMoreNotifications } =
    useNotifications(userProfile);

  const [open, setOpen] = useState<boolean>(false);

  // Track notification view for analytics
  useEffect(() => {
    if (open && userProfile?.uid && notifications.length > 0) {
      // Track that user viewed notifications
      notifications.forEach(notification => {
        if (notification.id) {
          notificationController.trackEngagement(notification.id, userProfile.uid, 'view');
        }
      });
    }
  }, [open, notifications, userProfile]);

  const handleNotificationClick = (notification: Notification) => {
    if (!userProfile?.uid || !notification.id) return;

    // Track notification click
    notificationController.trackEngagement(notification.id, userProfile.uid, 'click');

    // Close dropdown
    setOpen(false);

    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleDropdownOpenChange = (flag: boolean) => {
    setOpen(flag);
  };

  const loadMore =
    hasMore && !isLoading ? (
      <div className='notification-load-more'>
        <Button type='link' onClick={loadMoreNotifications}>
          Load more
        </Button>
      </div>
    ) : null;

  const notificationMenu = (
    <div className='notification-dropdown-content' onClick={e => e.stopPropagation()}>
      <div className='notification-header'>
        <Title level={5}>Notifications</Title>
        {unreadCount > 0 && (
          <Button type='text' size='small' icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className='notification-list-container'>
        <Spin spinning={isLoading}>
          {notifications.length === 0 ? (
            <Empty description='No notifications' image={Empty.PRESENTED_IMAGE_SIMPLE} className='notification-empty' />
          ) : (
            <List
              className='notification-list'
              itemLayout='horizontal'
              loadMore={loadMore}
              dataSource={notifications}
              renderItem={notification => (
                <NotificationItem notification={notification} onClick={handleNotificationClick} />
              )}
            />
          )}
        </Spin>
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={['click']}
      open={open}
      onOpenChange={handleDropdownOpenChange}
      placement='bottomRight'
      overlayClassName='notification-dropdown'
      getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
    >
      <Badge count={unreadCount} overflowCount={99} className='notification-badge'>
        <Button type='text' icon={<BellOutlined />} className='notification-bell-button' aria-label='Notifications' />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter;
