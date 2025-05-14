import React, { useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Tooltip } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { Notification } from '../../types/notification';
import { markNotificationAsRead } from '../../services/notificationService';
import { useUserProfile } from '../../hooks/useUserProfile';
import NotificationItem from './NotificationItem';
import './NotificationCenter.css';

const { Text, Title } = Typography;

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const notifications = useAppSelector((state: any) => state.notifications.notifications);
  const { userProfile } = useUserProfile();

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification.read && userProfile) {
      markNotificationAsRead(notification.id, userProfile.uid);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (userProfile) {
      // TODO: Implement mark all as read functionality
    }
  };

  const content = (
    <div className='notification-popover'>
      <div className='notification-header'>
        <Title className='mt-2 mr-10' level={5}>{t('notifications:title')}</Title>
        {unreadCount > 0 && (
          <Button type='link' onClick={handleMarkAllAsRead}>
            {t('notifications:markAllAsRead')}
          </Button>
        )}
      </div>
      <List
        className='notification-list'
        itemLayout='horizontal'
        dataSource={notifications}
        locale={{
          emptyText: <Empty description={t('notifications:noNotifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} className='notification-empty' />
        }}
        renderItem={(notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
          />
        )}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger='click'
      open={isOpen}
      onOpenChange={setIsOpen}
      placement='bottomRight'
      overlayClassName='notification-popover-container'
    >
      <Badge count={unreadCount} offset={[-2, 2]}>
        <Tooltip title={t('notifications:title')}>
          <BellOutlined className='notification-bell' />
        </Tooltip>
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;
