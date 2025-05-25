import React from 'react';
import { List, Tag, Typography, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../../utils/timestampUtils';
import './NotificationList.css';

const { Text, Paragraph } = Typography;

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const { t } = useTranslation();

  const getTagColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'processing';
    }
  };

  return (
    <List.Item
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      extra={
        !notification.read &&
        onMarkAsRead && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => onMarkAsRead(notification.id)}
            className="mark-as-read-button"
          />
        )
      }
    >
      <div className="notification-content">
        <div className="notification-header">
          <Tag color={getTagColor(notification.type)}>
            {t(`notifications.types.${notification.type}`)}
          </Tag>
          <Text type="secondary" className="notification-time">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </div>
        <Paragraph className="notification-title">{notification.title}</Paragraph>
        <Paragraph className="notification-description">{notification.description}</Paragraph>
      </div>
    </List.Item>
  );
};

export default NotificationItem;
