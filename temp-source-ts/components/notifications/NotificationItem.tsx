import React from 'react';
import { List, Avatar, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Notification, NotificationType } from '../../types/notification';
import { Timestamp } from 'firebase/firestore';

const { Text } = Typography;

// Map notification types to their corresponding icons and colors
const notificationTypeConfig = {
  [NotificationType.SUCCESS]: { color: '#52c41a', icon: '✓' },
  [NotificationType.INFO]: { color: '#1890ff', icon: 'ℹ' },
  [NotificationType.WARNING]: { color: '#faad14', icon: '⚠' },
  [NotificationType.ERROR]: { color: '#f5222d', icon: '✕' }
};

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { t } = useTranslation('notifications');
  const getTranslationKey = (key: string) => key?.replace(/^notifications\./, '');
  const getTypeConfig = (type: NotificationType) => {
    return notificationTypeConfig[type] || notificationTypeConfig[NotificationType.INFO];
  };

  const config = getTypeConfig(notification.type);
  const formattedDate = notification.createdAt
    ? typeof notification.createdAt === 'number'
      ? new Date(notification.createdAt).toLocaleString()
      : notification.createdAt instanceof Timestamp
        ? new Date(notification.createdAt.seconds * 1000).toLocaleString()
        : typeof notification.createdAt === 'string'
          ? new Date(notification.createdAt).toLocaleString()
          : '-'
    : '-';

  return (
    <List.Item
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={() => onClick(notification)}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            style={{ backgroundColor: config.color }}
            icon={notification.imageUrl ? null : config.icon}
            src={notification.imageUrl}
            size={24}
          />
        }
        title={
          <div className='notification-title'>
            <Text strong>{t(getTranslationKey(notification.title))}</Text>
            <span className='notification-time'>{formattedDate}</span>
          </div>
        }
        description={
          <Text className='notification-description'>
            {t(getTranslationKey(notification.description), notification.params || {})}
          </Text>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;
