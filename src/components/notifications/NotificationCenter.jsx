import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import NotificationDrawer from './NotificationDrawer';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { t } = useTranslation(['notifications']);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const prevUnreadCount = useRef(0);
  const bellRef = useRef(null);
  const badgeRef = useRef(null);

  // Get unread count from Redux store via useNotifications hook
  const { unreadCount, toggleNotificationDrawer } = useNotifications();

  // Trigger animations when unread count changes
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && prevUnreadCount.current > 0) {
      // New notification arrived - shake the bell
      if (bellRef.current) {
        bellRef.current.classList.remove('has-new');
        // Force reflow
        bellRef.current.offsetHeight;
        bellRef.current.classList.add('has-new');

        // Remove class after animation
        setTimeout(() => {
          if (bellRef.current) {
            bellRef.current.classList.remove('has-new');
          }
        }, 600);
      }

      // Animate badge count update
      if (badgeRef.current) {
        const badgeElement = badgeRef.current.querySelector('.ant-badge-count');
        if (badgeElement) {
          badgeElement.classList.add('updating');
          setTimeout(() => {
            badgeElement.classList.remove('updating');
          }, 400);
        }
      }
    }

    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const showDrawer = () => {
    setDrawerVisible(true);
    toggleNotificationDrawer(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    toggleNotificationDrawer(false);
  };

  const handleBellClick = () => {
    // Add a small scale effect on click
    if (bellRef.current) {
      bellRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (bellRef.current) {
          bellRef.current.style.transform = '';
        }
      }, 150);
    }
    showDrawer();
  };

  return (
    <Space className="notification-center">
      <div ref={badgeRef}>
        <Badge count={unreadCount} offset={[-2, 12]} className="notification-badge-container">
          <Button
            ref={bellRef}
            type="text"
            icon={<BellOutlined />}
            onClick={handleBellClick}
            className="notification-bell"
            aria-label={t('open')}
            shape="circle"
          />
        </Badge>
      </div>
      <NotificationDrawer visible={drawerVisible} onClose={closeDrawer} />
    </Space>
  );
};

export default NotificationCenter;
