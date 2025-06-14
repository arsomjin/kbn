/**
 * User Personal Notifications Component
 * Shows notifications for the current user (approval status, system messages, etc.)
 */

import React, { useState, useEffect } from 'react';
import {
  Badge,
  notification,
  Button,
  Dropdown,
  Menu,
  Typography,
  Space,
  Avatar,
  List,
  Empty,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { app } from '../firebase';
import moment from 'moment';

const { Text } = Typography;

const UserPersonalNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const history = useHistory();

  useEffect(() => {
    if (!user?.uid) return;

    // Initial fetch
    fetchPersonalNotifications();

    // Set up real-time listener for user's personal notifications
    const unsubscribe = app
      .firestore()
      .collection('userNotifications')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          console.log(
            '🔔 Personal notifications updated:',
            snapshot.docs.length
          );

          const userNotifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt),
          }));

          setNotifications(userNotifications);

          // Count unread notifications
          const unread = userNotifications.filter((n) => !n.read).length;
          setUnreadCount(unread);

          // Show popup notification for new unread notifications
          const newNotifications = userNotifications.filter(
            (n) =>
              !n.read &&
              !n.popupShown &&
              Date.now() - n.createdAt.getTime() < 60000 // Only show popup for notifications less than 1 minute old
          );

          if (newNotifications.length > 0) {
            showNewPersonalNotification(newNotifications[0]);

            // Mark as popup shown to avoid repeated popups
            newNotifications.forEach(async (notif) => {
              await app
                .firestore()
                .collection('userNotifications')
                .doc(notif.id)
                .update({ popupShown: true });
            });
          }
        },
        (error) => {
          console.error('❌ Error listening to personal notifications:', error);
        }
      );

    return () => unsubscribe();
  }, [user?.uid]);

  const fetchPersonalNotifications = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const snapshot = await app
        .firestore()
        .collection('userNotifications')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const userNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
      }));

      setNotifications(userNotifications);

      // Count unread notifications
      const unread = userNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('❌ Error fetching personal notifications:', error);
    }
    setLoading(false);
  };

  const showNewPersonalNotification = (notif) => {
    const notificationConfig = getNotificationConfig(notif.type);

    notification.open({
      message: notif.title || notificationConfig.title,
      description: notif.message || notif.description,
      icon: notificationConfig.icon,
      placement: 'topRight',
      duration: notif.type === 'approval_approved' ? 0 : 8, // Keep approval notifications until manually closed
      btn:
        notif.type === 'approval_approved' ? (
          <Button
            type='primary'
            size='small'
            onClick={() => {
              history.push('/overview');
              notification.destroy();
            }}
          >
            เข้าสู่ระบบ
          </Button>
        ) : null,
      style: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
      },
    });
  };

  const getNotificationConfig = (type) => {
    const configs = {
      approval_approved: {
        title: '🎉 การสมัครสมาชิกได้รับการอนุมัติ!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a',
      },
      approval_rejected: {
        title: '❌ การสมัครสมาชิกถูกปฏิเสธ',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        color: '#ff4d4f',
      },
      system_message: {
        title: 'ข้อความจากระบบ',
        icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
        color: '#1890ff',
      },
      account_update: {
        title: 'อัปเดตบัญชีผู้ใช้',
        icon: <UserOutlined style={{ color: '#722ed1' }} />,
        color: '#722ed1',
      },
      default: {
        title: 'การแจ้งเตือน',
        icon: <BellOutlined style={{ color: '#faad14' }} />,
        color: '#faad14',
      },
    };

    return configs[type] || configs.default;
  };

  const markAsRead = async (notificationId) => {
    try {
      await app
        .firestore()
        .collection('userNotifications')
        .doc(notificationId)
        .update({
          read: true,
          readAt: Date.now(),
        });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = app.firestore().batch();

      notifications
        .filter((n) => !n.read)
        .forEach((notif) => {
          const ref = app
            .firestore()
            .collection('userNotifications')
            .doc(notif.id);
          batch.update(ref, {
            read: true,
            readAt: Date.now(),
          });
        });

      await batch.commit();
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await app
        .firestore()
        .collection('userNotifications')
        .doc(notificationId)
        .delete();
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'mark-all-read') {
      markAllAsRead();
      setVisible(false);
    } else if (key === 'view-all') {
      history.push('/notifications');
      setVisible(false);
    }
  };

  const handleNotificationClick = (notif) => {
    // Mark as read when clicked
    if (!notif.read) {
      markAsRead(notif.id);
    }

    // Handle different notification types
    if (notif.type === 'approval_approved') {
      history.push('/overview');
    } else if (notif.actionUrl) {
      history.push(notif.actionUrl);
    }

    setVisible(false);
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}
    >
      <Menu.Item
        key='header'
        disabled
        style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
      >
        <Space justify='space-between' style={{ width: '100%' }}>
          <Text strong>การแจ้งเตือนของฉัน</Text>
          {unreadCount > 0 && (
            <Button
              type='link'
              size='small'
              onClick={() => handleMenuClick({ key: 'mark-all-read' })}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </Space>
      </Menu.Item>

      {notifications.length === 0 ? (
        <Menu.Item key='empty' disabled>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='ไม่มีการแจ้งเตือน'
            style={{ margin: '20px 0' }}
          />
        </Menu.Item>
      ) : (
        notifications.map((notif) => {
          const config = getNotificationConfig(notif.type);
          return (
            <Menu.Item
              key={notif.id}
              style={{
                padding: '12px 16px',
                backgroundColor: notif.read ? 'transparent' : '#f6ffed',
                borderLeft: notif.read ? 'none' : `3px solid ${config.color}`,
              }}
              onClick={() => handleNotificationClick(notif)}
            >
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
              >
                <Avatar
                  size='small'
                  icon={config.icon}
                  style={{ backgroundColor: 'transparent', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    {notif.title}
                  </Text>
                  <Text
                    type='secondary'
                    style={{
                      fontSize: 12,
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {notif.message || notif.description}
                  </Text>
                  <Text type='secondary' style={{ fontSize: 11 }}>
                    {getTimeAgo(notif.createdAt)}
                  </Text>
                </div>
                <Button
                  type='text'
                  size='small'
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  style={{ flexShrink: 0, opacity: 0.5 }}
                />
              </div>
            </Menu.Item>
          );
        })
      )}

      {notifications.length > 0 && (
        <>
          <Menu.Divider />
          <Menu.Item key='view-all' style={{ textAlign: 'center' }}>
            <Button type='link' icon={<EyeOutlined />}>
              ดูการแจ้งเตือนทั้งหมด
            </Button>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={setVisible}
      placement='bottomRight'
      overlayStyle={{
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '6px',
          transition: 'all 0.3s ease',
        }}
      >
        <Badge
          count={unreadCount}
          size='small'
          style={{
            backgroundColor: unreadCount > 0 ? '#ff4d4f' : '#d9d9d9',
          }}
        >
          <BellOutlined
            style={{
              fontSize: 18,
              color: unreadCount > 0 ? '#ff4d4f' : '#999',
            }}
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default UserPersonalNotifications;
