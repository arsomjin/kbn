import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import NotificationDrawer from './NotificationDrawer';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  return (
    <Space className="notification-center">
      <Badge count={unreadCount} offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={showDrawer}
          className="notification-bell"
          aria-label={t('notifications.open')}
        />
      </Badge>
      <NotificationDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </Space>
  );
};

export default NotificationCenter;
