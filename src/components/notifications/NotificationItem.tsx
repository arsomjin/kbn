import React from 'react';
import { List, Avatar, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Notification, NotificationType } from '../../types/notification';

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
  const { t } = useTranslation();
  const getTypeConfig = (type: NotificationType) => {
    return notificationTypeConfig[type] || notificationTypeConfig[NotificationType.INFO];
  };

  const config = getTypeConfig(notification.type);
  const formattedDate = typeof notification.createdAt === 'string' 
    ? new Date(notification.createdAt).toLocaleString()
    : new Date(notification.createdAt.seconds * 1000).toLocaleString();

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
          />
        }
        title={
          <div className='notification-title'>
            <Text strong>{t(notification.title, notification.title)}</Text>
            <span className='notification-time'>
              {formattedDate}
            </span>
          </div>
        }
        description={<Text className='notification-description'>{t(notification.description, notification.description)}</Text>}
      />
    </List.Item>
  );
};

export default NotificationItem; 