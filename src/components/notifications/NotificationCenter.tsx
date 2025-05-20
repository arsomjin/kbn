import React, { useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Tooltip } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { Notification } from '../../types/notification';
import { markNotificationAsRead } from '../../services/notificationService';
import { useUserProfile } from 'hooks/useUserProfile';
import NotificationItem from './NotificationItem';
import './NotificationCenter.css';
import { useResponsive } from 'hooks/useResponsive';
import NotificationDrawer from './NotificationDrawer';

const { Text, Title } = Typography;

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const notifications = useAppSelector((state: any) => state.notifications.notifications);
  const { userProfile } = useUserProfile();
  const { isMobile } = useResponsive();

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification.read && userProfile) {
      markNotificationAsRead(notification.id, userProfile.uid);
    }
    if (isMobile) setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (userProfile) {
      // TODO: Implement mark all as read functionality
    }
  };

  const content = (
    <div
      className='notification-popover'
      style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        maxWidth: isMobile ? '75vw' : '350px',
        minWidth: isMobile ? '280px' : '350px'
      }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <BellOutlined className='mr-2' />
          <span>{t('notifications:title')}</span>
        </div>
        {notifications.length > 0 && handleMarkAllAsRead && (
          <Button type='default' size='small' onClick={handleMarkAllAsRead} className='text-xs'>
            {t('notifications:markAllAsRead')}
          </Button>
        )}
      </div>
      <List
        className='notification-list'
        itemLayout='horizontal'
        dataSource={notifications}
        locale={{
          emptyText: (
            <Empty
              description={t('notifications:noNotifications')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className='notification-empty'
            />
          )
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
    <>
      {/* {!isMobile ? (
        <>
          <Badge
            count={unreadCount}
            offset={[8, -8]}
            style={{
              minWidth: 24,
              height: 24,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(75,96,67,0.15)',
              border: '2px solid #fff',
              background: '#384D3A',
              color: '#fff',
              position: 'absolute',
              top: 0,
              right: 0
            }}
            onClick={() => setIsOpen(true)}
          >
            <Tooltip title={t('notifications:title')}>
              <BellOutlined className='notification-bell' />
            </Tooltip>
          </Badge>
          <NotificationDrawer
            open={isOpen}
            onClose={() => setIsOpen(false)}
            notifications={notifications}
            onMarkAsRead={id => {
              const notif = notifications.find((n: Notification) => n.id === id);
              if (notif) handleNotificationClick(notif);
            }}
            onMarkAllAsRead={handleMarkAllAsRead}
            loading={false}
            hasMore={false}
          />
        </>
      ) : ( */}
      <Popover
        content={content}
        trigger='click'
        open={isOpen}
        onOpenChange={setIsOpen}
        placement='bottomRight'
        overlayClassName='notification-popover-container'
      >
        <Badge
          count={unreadCount}
          offset={[8, -8]}
          style={{
            minWidth: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(75,96,67,0.15)',
            border: '2px solid #fff',
            background: '#384D3A',
            color: '#fff',
            position: 'absolute',
            top: 0,
            right: 0
          }}
        >
          <Tooltip title={t('notifications:title')}>
            <BellOutlined className='notification-bell' />
          </Tooltip>
        </Badge>
      </Popover>
    </>
  );
};

export default NotificationCenter;
