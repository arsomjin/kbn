import React from 'react';
import { Drawer, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import NotificationList from './NotificationList';
import NotificationSettings from './NotificationSettings';
import './NotificationCenter.css';

const NotificationDrawer = ({ visible, onClose, onUnreadCountChange }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('notifications');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleUnreadCountChange = (count) => {
    if (onUnreadCountChange) {
      onUnreadCountChange(count);
    }
  };

  const items = [
    {
      key: 'notifications',
      label: t('notifications.title'),
      children: <NotificationList onUnreadCountChange={handleUnreadCountChange} />,
    },
    {
      key: 'settings',
      label: t('notifications.settings'),
      children: <NotificationSettings />,
    },
  ];

  return (
    <Drawer
      title={t('notifications.title')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      className="notification-drawer"
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
    </Drawer>
  );
};

export default NotificationDrawer;
