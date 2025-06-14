/**
 * Comprehensive Notifications Page
 * Central hub for all types of notifications and alerts
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  List,
  Badge,
  Button,
  Space,
  Typography,
  Avatar,
  Tag,
  Empty,
  Row,
  Col,
  Divider,
  Tooltip,
  Switch,
  Select,
  DatePicker,
  Input,
  message,
  Modal,
  Alert,
} from 'antd';
import {
  BellOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  MarkAllReadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  NotificationOutlined,
  SoundOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { app } from '../../firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { useResponsive } from '../../hooks/useResponsive';
import LayoutWithRBAC from '../../components/layout/LayoutWithRBAC';
import {
  getBranchName,
  getProvinceName,
  getDepartmentName,
} from '../../utils/mappings';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('activities'); // Default to activities for all users
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Browser notification states
  const [browserNotificationEnabled, setBrowserNotificationEnabled] =
    useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState('default');
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    approvals: true,
    system: true,
    activities: false,
    sound: true,
  });

  const { user } = useSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  const { isMobile, isTablet } = useResponsive();
  const history = useHistory();

  // Check permissions - Allow all users to see their personal notifications
  const canSeeApprovals =
    hasPermission('users.approve') || hasPermission('users.manage');
  const canSeeSystemNotifications =
    hasPermission('admin.notifications') || hasPermission('users.manage');
  const canSeePersonalNotifications = true; // All users can see their own notifications

  useEffect(() => {
    fetchNotifications();
    checkNotificationPermission();
    loadNotificationPreferences();
  }, [activeTab, statusFilter, dateRange]);

  // Browser notification functions
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationPermission(permission);
      setBrowserNotificationEnabled(permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      message.error('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setBrowserNotificationEnabled(true);
        saveNotificationPreferences({
          ...notificationPreferences,
          enabled: true,
        });
        message.success('เปิดการแจ้งเตือนเบราว์เซอร์สำเร็จ!');

        // Show test notification
        showBrowserNotification({
          title: 'KBN - การแจ้งเตือนเปิดใช้งานแล้ว',
          body: 'คุณจะได้รับการแจ้งเตือนสำหรับกิจกรรมสำคัญ',
          icon: '/favicon.ico',
          tag: 'test-notification',
        });
      } else if (permission === 'denied') {
        message.error(
          'การแจ้งเตือนถูกปฏิเสธ กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์'
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      message.error('เกิดข้อผิดพลาดในการขอสิทธิ์การแจ้งเตือน');
    }
  };

  const toggleBrowserNotifications = async () => {
    if (!browserNotificationEnabled) {
      await requestNotificationPermission();
    } else {
      setBrowserNotificationEnabled(false);
      saveNotificationPreferences({
        ...notificationPreferences,
        enabled: false,
      });
      message.info('ปิดการแจ้งเตือนเบราว์เซอร์แล้ว');
    }
  };

  const showBrowserNotification = (options) => {
    if (!browserNotificationEnabled || notificationPermission !== 'granted') {
      return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || 'kbn-notification',
      requireInteraction: options.requireInteraction || false,
      silent: !notificationPreferences.sound,
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };
  };

  const loadNotificationPreferences = () => {
    try {
      const saved = localStorage.getItem(`kbn_notification_prefs_${user?.uid}`);
      if (saved) {
        const prefs = JSON.parse(saved);
        setNotificationPreferences(prefs);
        setBrowserNotificationEnabled(
          prefs.enabled && notificationPermission === 'granted'
        );
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const saveNotificationPreferences = (prefs) => {
    try {
      localStorage.setItem(
        `kbn_notification_prefs_${user?.uid}`,
        JSON.stringify(prefs)
      );
      setNotificationPreferences(prefs);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (activeTab === 'approvals' && canSeeApprovals) {
        await fetchApprovalRequests();
      } else if (activeTab === 'system' && canSeeSystemNotifications) {
        await fetchSystemNotifications();
      } else if (activeTab === 'activities') {
        await fetchUserActivities();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const fetchApprovalRequests = async () => {
    try {
      let query = app.firestore().collection('approvalRequests');

      if (statusFilter !== 'all') {
        query = query.where('status', '==', statusFilter);
      }

      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();

      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'approval',
      }));

      // Filter by user's geographic permissions
      const filteredRequests = requests.filter((request) => {
        return hasPermission('users.approve', {
          provinceId: request.targetProvince,
          branchCode: request.targetBranch,
        });
      });

      setApprovalRequests(filteredRequests);

      // Show browser notification for new approvals
      if (browserNotificationEnabled && notificationPreferences.approvals) {
        const newRequests = filteredRequests.filter(
          (req) =>
            req.status === 'pending' &&
            moment(req.createdAt).isAfter(moment().subtract(5, 'minutes'))
        );

        if (newRequests.length > 0) {
          showBrowserNotification({
            title: 'KBN - คำขออนุมัติใหม่',
            body: `มีคำขออนุมัติใหม่ ${newRequests.length} รายการรอการดำเนินการ`,
            tag: 'approval-notification',
            requireInteraction: true,
            onClick: () => setActiveTab('approvals'),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching approval requests:', error);
    }
  };

  const fetchSystemNotifications = async () => {
    try {
      let query = app.firestore().collection('systemNotifications');

      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();

      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'system',
      }));

      setSystemNotifications(notifications);

      // Show browser notification for critical system notifications
      if (browserNotificationEnabled && notificationPreferences.system) {
        const criticalNotifications = notifications.filter(
          (notif) =>
            (notif.severity === 'critical' || notif.level === 'error') &&
            moment(notif.createdAt).isAfter(moment().subtract(5, 'minutes'))
        );

        if (criticalNotifications.length > 0) {
          criticalNotifications.forEach((notif) => {
            showBrowserNotification({
              title: 'KBN - แจ้งเตือนระบบสำคัญ',
              body: notif.message || notif.title || 'มีการแจ้งเตือนระบบสำคัญ',
              tag: `system-${notif.id}`,
              requireInteraction: true,
              onClick: () => setActiveTab('system'),
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching system notifications:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      let query = app
        .firestore()
        .collection('userActivities')
        .where('userId', '==', user.uid);

      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();

      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'activity',
      }));

      setUserActivities(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  const getNotificationIcon = (notification) => {
    const iconProps = { style: { fontSize: 16 } };

    switch (notification.type) {
      case 'approval':
        return <UserAddOutlined {...iconProps} style={{ color: '#faad14' }} />;
      case 'system':
        switch (notification.severity || notification.level) {
          case 'error':
            return (
              <ExclamationCircleOutlined
                {...iconProps}
                style={{ color: '#ff4d4f' }}
              />
            );
          case 'warning':
            return (
              <WarningOutlined {...iconProps} style={{ color: '#faad14' }} />
            );
          case 'success':
            return (
              <CheckCircleOutlined
                {...iconProps}
                style={{ color: '#52c41a' }}
              />
            );
          default:
            return (
              <InfoCircleOutlined {...iconProps} style={{ color: '#1890ff' }} />
            );
        }
      case 'activity':
        return <BellOutlined {...iconProps} style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined {...iconProps} />;
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'รอดำเนินการ' },
      approved: { color: 'green', text: 'อนุมัติแล้ว' },
      rejected: { color: 'red', text: 'ปฏิเสธ' },
      completed: { color: 'blue', text: 'เสร็จสิ้น' },
      active: { color: 'green', text: 'ใช้งาน' },
      inactive: { color: 'default', text: 'ไม่ใช้งาน' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderApprovalItem = (item) => (
    <List.Item
      key={item.id}
      actions={[
        <Button
          key='view-details'
          type='link'
          size='small'
          onClick={() => history.push('/admin/user-approval')}
        >
          ดูรายละเอียด
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#fff2e8' }}
          />
        }
        title={
          <Space>
            <Text strong>
              {item.userData?.displayName ||
                `${item.userData?.firstName} ${item.userData?.lastName}` ||
                item.userData?.email?.split('@')[0] ||
                'ผู้ใช้ใหม่'}
            </Text>
            {getStatusTag(item.status)}
          </Space>
        }
        description={
          <div>
            <Text type='secondary'>
              {getDepartmentName(item.userData?.department)} •{' '}
              {getBranchName(item.targetBranch)}
            </Text>
            <br />
            <Text type='secondary' style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderSystemNotification = (item) => (
    <List.Item key={item.id}>
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#f6ffed' }}
          />
        }
        title={<Text strong>{item.title || 'ระบบแจ้งเตือน'}</Text>}
        description={
          <div>
            <Paragraph>{item.message || item.description}</Paragraph>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderActivityItem = (item) => (
    <List.Item key={item.id}>
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#f9f0ff' }}
          />
        }
        title={<Text>{item.action || item.description}</Text>}
        description={
          <div>
            <Text type='secondary'>{item.details}</Text>
            <br />
            <Text type='secondary' style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const getTabCount = (tab) => {
    switch (tab) {
      case 'approvals':
        return approvalRequests.filter((r) => r.status === 'pending').length;
      case 'system':
        return systemNotifications.filter((n) => !n.read).length;
      case 'activities':
        return userActivities.length;
      default:
        return 0;
    }
  };

  const filteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'approvals':
        data = approvalRequests;
        break;
      case 'system':
        data = systemNotifications;
        break;
      case 'activities':
        data = userActivities;
        break;
    }

    if (searchText) {
      data = data.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (showOnlyUnread) {
      data = data.filter((item) => !item.read);
    }

    return data;
  };

  return (
    <LayoutWithRBAC
      title='การแจ้งเตือน'
      customCheck={({ userRBAC }) => {
        // Allow any authenticated user to access their personal notifications
        return (
          userRBAC &&
          (userRBAC.isActive || userRBAC.isDev || userRBAC.authority)
        );
      }}
      showGeographicSelector={false}
      requireBranchSelection={false}
      debug={process.env.NODE_ENV === 'development'}
    >
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row align='middle' justify='space-between' gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Title level={3} style={{ margin: 0 }}>
                <Space>
                  <BellOutlined />
                  ศูนย์การแจ้งเตือน
                </Space>
              </Title>
            </Col>
            <Col xs={24} sm={12}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Tooltip
                  title={
                    browserNotificationEnabled
                      ? 'การแจ้งเตือนเบราว์เซอร์เปิดอยู่'
                      : 'เปิดการแจ้งเตือนเบราว์เซอร์'
                  }
                >
                  <Button
                    type={browserNotificationEnabled ? 'primary' : 'default'}
                    icon={<NotificationOutlined />}
                    onClick={toggleBrowserNotifications}
                    style={{
                      backgroundColor: browserNotificationEnabled
                        ? '#52c41a'
                        : undefined,
                      borderColor: browserNotificationEnabled
                        ? '#52c41a'
                        : undefined,
                    }}
                  >
                    {isMobile
                      ? ''
                      : browserNotificationEnabled
                        ? 'เปิดแจ้งเตือน'
                        : 'แจ้งเตือนเบราว์เซอร์'}
                  </Button>
                </Tooltip>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchNotifications}
                  loading={loading}
                >
                  รีเฟรช
                </Button>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setShowNotificationSettings(true)}
                >
                  ตั้งค่า
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Card size='small' style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={8} md={6}>
              <Search
                placeholder='ค้นหาการแจ้งเตือน'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder='กรองตามสถานะ'
              >
                <Option value='all'>ทั้งหมด</Option>
                <Option value='pending'>รอดำเนินการ</Option>
                <Option value='approved'>อนุมัติแล้ว</Option>
                <Option value='rejected'>ปฏิเสธ</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                placeholder={['เริ่มต้น', 'สิ้นสุด']}
              />
            </Col>
            <Col xs={24} md={4}>
              <Space>
                <Text>แสดงเฉพาะที่ยังไม่อ่าน:</Text>
                <Switch
                  checked={showOnlyUnread}
                  onChange={setShowOnlyUnread}
                  size='small'
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size={isMobile ? 'small' : 'default'}
        >
          {canSeeApprovals && (
            <Tabs.TabPane
              key='approvals'
              tab={
                <Space>
                  <UserAddOutlined />
                  คำขออนุมัติ
                  <Badge count={getTabCount('approvals')} size='small' />
                </Space>
              }
            >
              <div style={{ minHeight: 400 }}>
                {filteredData().length === 0 ? (
                  <Empty
                    description='ไม่มีการแจ้งเตือน'
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    loading={loading}
                    dataSource={filteredData()}
                    renderItem={renderApprovalItem}
                    pagination={{
                      pageSize: isMobile ? 5 : 10,
                      showSizeChanger: !isMobile,
                      showQuickJumper: !isMobile,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} จาก ${total} รายการ`,
                    }}
                  />
                )}
              </div>
            </Tabs.TabPane>
          )}

          {canSeeSystemNotifications && (
            <Tabs.TabPane
              key='system'
              tab={
                <Space>
                  <BellOutlined />
                  แจ้งเตือนระบบ
                  <Badge count={getTabCount('system')} size='small' />
                </Space>
              }
            >
              <div style={{ minHeight: 400 }}>
                {filteredData().length === 0 ? (
                  <Empty
                    description='ไม่มีการแจ้งเตือน'
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    loading={loading}
                    dataSource={filteredData()}
                    renderItem={renderSystemNotification}
                    pagination={{
                      pageSize: isMobile ? 5 : 10,
                      showSizeChanger: !isMobile,
                      showQuickJumper: !isMobile,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} จาก ${total} รายการ`,
                    }}
                  />
                )}
              </div>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane
            key='activities'
            tab={
              <Space>
                <InfoCircleOutlined />
                กิจกรรมของฉัน
              </Space>
            }
          >
            <div style={{ minHeight: 400 }}>
              {filteredData().length === 0 ? (
                <Empty
                  description='ไม่มีการแจ้งเตือน'
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  loading={loading}
                  dataSource={filteredData()}
                  renderItem={renderActivityItem}
                  pagination={{
                    pageSize: isMobile ? 5 : 10,
                    showSizeChanger: !isMobile,
                    showQuickJumper: !isMobile,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} จาก ${total} รายการ`,
                  }}
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Notification Settings Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            ตั้งค่าการแจ้งเตือน
          </Space>
        }
        open={showNotificationSettings}
        onCancel={() => setShowNotificationSettings(false)}
        footer={[
          <Button
            key='cancel'
            onClick={() => setShowNotificationSettings(false)}
          >
            ปิด
          </Button>,
          <Button
            key='test'
            type='dashed'
            icon={<BellOutlined />}
            onClick={() => {
              if (browserNotificationEnabled) {
                showBrowserNotification({
                  title: 'KBN - ทดสอบการแจ้งเตือน',
                  body: 'นี่คือการทดสอบการแจ้งเตือนเบราว์เซอร์ของคุณ',
                  tag: 'test-notification',
                });
                message.success('ส่งการแจ้งเตือนทดสอบแล้ว!');
              } else {
                message.warning('กรุณาเปิดการแจ้งเตือนเบราว์เซอร์ก่อน');
              }
            }}
            disabled={!browserNotificationEnabled}
          >
            ทดสอบการแจ้งเตือน
          </Button>,
        ]}
        width={600}
      >
        <Space direction='vertical' style={{ width: '100%' }} size='large'>
          {/* Browser Notification Status */}
          <Card size='small' style={{ backgroundColor: '#fafafa' }}>
            <Row align='middle' justify='space-between'>
              <Col>
                <Space>
                  <MobileOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                  <div>
                    <Text strong>การแจ้งเตือนเบราว์เซอร์</Text>
                    <br />
                    <Text type='secondary' style={{ fontSize: 12 }}>
                      รับการแจ้งเตือนแม้ไม่ได้เปิดหน้าเว็บ
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Switch
                  checked={browserNotificationEnabled}
                  onChange={toggleBrowserNotifications}
                  checkedChildren='เปิด'
                  unCheckedChildren='ปิด'
                />
              </Col>
            </Row>

            {/* Permission Status */}
            <Divider style={{ margin: '12px 0' }} />
            <Row align='middle'>
              <Col span={24}>
                <Space>
                  <Text style={{ fontSize: 12 }}>สถานะสิทธิ์:</Text>
                  {notificationPermission === 'granted' && (
                    <Tag color='success' icon={<CheckCircleOutlined />}>
                      อนุญาต
                    </Tag>
                  )}
                  {notificationPermission === 'denied' && (
                    <Tag color='error' icon={<ExclamationCircleOutlined />}>
                      ปฏิเสธ
                    </Tag>
                  )}
                  {notificationPermission === 'default' && (
                    <Tag color='warning' icon={<WarningOutlined />}>
                      ยังไม่ได้ตั้งค่า
                    </Tag>
                  )}
                </Space>
              </Col>
            </Row>

            {notificationPermission === 'denied' && (
              <Alert
                message='การแจ้งเตือนถูกปฏิเสธ'
                description='กรุณาเปิดใช้งานการแจ้งเตือนในการตั้งค่าเบราว์เซอร์ของคุณ'
                type='warning'
                showIcon
                style={{ marginTop: 12 }}
                action={
                  <Button
                    size='small'
                    type='link'
                    onClick={() => {
                      message.info(
                        'กรุณาไปที่การตั้งค่าเบราว์เซอร์ > ความเป็นส่วนตัวและความปลอดภัย > การแจ้งเตือน'
                      );
                    }}
                  >
                    วิธีเปิดใช้งาน
                  </Button>
                }
              />
            )}
          </Card>

          {/* Notification Preferences */}
          {browserNotificationEnabled && (
            <Card size='small' title='ประเภทการแจ้งเตือนที่ต้องการรับ'>
              <Space direction='vertical' style={{ width: '100%' }}>
                {canSeeApprovals && (
                  <Row align='middle' justify='space-between'>
                    <Col>
                      <Space>
                        <UserAddOutlined style={{ color: '#faad14' }} />
                        <div>
                          <Text>คำขออนุมัติใหม่</Text>
                          <br />
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            แจ้งเตือนเมื่อมีคำขออนุมัติใหม่
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Switch
                        checked={notificationPreferences.approvals}
                        onChange={(checked) => {
                          const newPrefs = {
                            ...notificationPreferences,
                            approvals: checked,
                          };
                          saveNotificationPreferences(newPrefs);
                        }}
                        size='small'
                      />
                    </Col>
                  </Row>
                )}

                {canSeeSystemNotifications && (
                  <Row align='middle' justify='space-between'>
                    <Col>
                      <Space>
                        <ExclamationCircleOutlined
                          style={{ color: '#ff4d4f' }}
                        />
                        <div>
                          <Text>แจ้งเตือนระบบสำคัญ</Text>
                          <br />
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            แจ้งเตือนเมื่อมีปัญหาระบบหรือข้อมูลสำคัญ
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Switch
                        checked={notificationPreferences.system}
                        onChange={(checked) => {
                          const newPrefs = {
                            ...notificationPreferences,
                            system: checked,
                          };
                          saveNotificationPreferences(newPrefs);
                        }}
                        size='small'
                      />
                    </Col>
                  </Row>
                )}

                <Row align='middle' justify='space-between'>
                  <Col>
                    <Space>
                      <InfoCircleOutlined style={{ color: '#722ed1' }} />
                      <div>
                        <Text>กิจกรรมส่วนตัว</Text>
                        <br />
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          แจ้งเตือนกิจกรรมที่เกี่ยวข้องกับคุณ
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch
                      checked={notificationPreferences.activities}
                      onChange={(checked) => {
                        const newPrefs = {
                          ...notificationPreferences,
                          activities: checked,
                        };
                        saveNotificationPreferences(newPrefs);
                      }}
                      size='small'
                    />
                  </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <Row align='middle' justify='space-between'>
                  <Col>
                    <Space>
                      <SoundOutlined style={{ color: '#1890ff' }} />
                      <div>
                        <Text>เสียงแจ้งเตือน</Text>
                        <br />
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          เปิด/ปิดเสียงเมื่อมีการแจ้งเตือน
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch
                      checked={notificationPreferences.sound}
                      onChange={(checked) => {
                        const newPrefs = {
                          ...notificationPreferences,
                          sound: checked,
                        };
                        saveNotificationPreferences(newPrefs);
                      }}
                      size='small'
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          )}

          {/* Browser Support Info */}
          {!('Notification' in window) && (
            <Alert
              message='เบราว์เซอร์ไม่รองรับ'
              description='เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่า'
              type='error'
              showIcon
            />
          )}
        </Space>
      </Modal>
    </LayoutWithRBAC>
  );
};

export default NotificationsPage;
