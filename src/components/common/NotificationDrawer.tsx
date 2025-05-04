import React from 'react';
import { Drawer, List, Typography, Tag, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Notification, NotificationType } from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { createSafeHtml } from '../../utils/htmlUtils';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onLoadMore,
  hasMore = false
}) => {
  const { t } = useTranslation();

  // Get appropriate color for notification type
  const getTagColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.INFO:
      default:
        return 'processing';
    }
  };

  return (
    <Drawer
      title={
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <BellOutlined className='mr-2' />
            <span>{t('notifications.title')}</span>
          </div>
          {notifications.length > 0 && onMarkAllAsRead && (
            <Button type='text' size='small' onClick={onMarkAllAsRead} className='text-xs'>
              {t('notifications.markAllAsRead')}
            </Button>
          )}
        </div>
      }
      placement='right'
      onClose={onClose}
      open={open}
      width={350}
    >
      {loading && notifications.length === 0 ? (
        <div className='flex justify-center py-8'>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description={t('notifications.noNotifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} className='my-8' />
      ) : (
        <List
          itemLayout='vertical'
          dataSource={notifications}
          renderItem={notification => (
            <List.Item
              className={`relative p-4 mb-2 rounded ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              extra={
                !notification.isRead && onMarkAsRead ? (
                  <Button
                    type='text'
                    size='small'
                    icon={<CheckOutlined />}
                    onClick={() => onMarkAsRead(notification.id as string)}
                    className='absolute top-2 right-2'
                  />
                ) : null
              }
            >
              <div className='flex flex-col'>
                {/* Notification header */}
                <div className='flex justify-between items-center mb-2'>
                  <Tag color={getTagColor(notification.type)}>{t(`common.${notification.type}`)}</Tag>
                  <Typography.Text type='secondary' className='text-xs'>
                    {formatRelativeTime(notification.createdAt)}
                  </Typography.Text>
                </div>

                {/* Notification title */}
                <Typography.Title level={5} className='m-0'>
                  {notification.title}
                </Typography.Title>

                {/* Notification content */}
                <Typography.Paragraph
                  className='mt-1 mb-0'
                  ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                  dangerouslySetInnerHTML={createSafeHtml(notification.description)}
                />
              </div>
            </List.Item>
          )}
          className='overflow-auto max-h-[calc(100vh-120px)]'
          footer={
            hasMore && onLoadMore ? (
              <div className='flex justify-center mt-4'>
                <Button onClick={onLoadMore} loading={loading}>
                  {t('notifications.loadMore')}
                </Button>
              </div>
            ) : null
          }
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
