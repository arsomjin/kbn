import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Form, Switch, Button, Typography, Divider, Space, message, Select, Row, Col, Alert } from 'antd';
import {
  BellOutlined,
  SaveOutlined,
  NotificationOutlined,
  MobileOutlined,
  MailOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { notificationController } from '../../controllers/notificationController';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import './NotificationSettings.css';
import { useAuth } from 'contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'none';
  categories: {
    system: boolean;
    announcements: boolean;
    reminders: boolean;
    activities: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: false,
  frequency: 'immediate',
  categories: {
    system: true,
    announcements: true,
    reminders: true,
    activities: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

/**
 * NotificationSettings component for managing user notification preferences
 */
const NotificationSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { userProfile } = useAuth();
  const isDarkMode = useSelector((state: RootState) => state.theme?.darkMode);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    checkNotificationPermission();
    if (userProfile?.uid) {
      fetchUserPreferences();
    }
  }, [userProfile]);

  const checkNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestPermission = async () => {
    try {
      // If permission is blocked, show instructions to enable in browser settings
      if (Notification.permission === 'denied') {
        message.warning(
          'Notifications are blocked in your browser settings. Please enable them in your browser settings to receive notifications.',
          0 // Keep the message visible until manually closed
        );
        return;
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        // Initialize FCM with updated permissions
        if (userProfile?.uid) {
          await notificationController.initialize(userProfile.uid);
          message.success('Notification permissions granted!');
        }
      } else if (permission === 'denied') {
        message.warning('Notification permissions were denied. You can enable them later in your browser settings.', 0);
      } else {
        message.info('Notification permission request was dismissed.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      message.error('Failed to request notification permissions.');
    }
  };

  const fetchUserPreferences = async () => {
    try {
      if (!userProfile?.uid) {
        return;
      }

      setLoading(true);
      const firestore = getFirestore();
      const preferencesRef = doc(firestore, 'userPreferences', userProfile.uid);
      const docSnap = await getDoc(preferencesRef);

      if (docSnap.exists()) {
        const userPreferences = docSnap.data() as NotificationPreferences;
        setPreferences(userPreferences);
        form.setFieldsValue(userPreferences);
      } else {
        // Set defaults if no preferences exist
        setPreferences(defaultPreferences);
        form.setFieldsValue(defaultPreferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      message.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: NotificationPreferences) => {
    try {
      if (!userProfile?.uid) {
        message.error('User not logged in');
        return;
      }

      setLoading(true);
      const firestore = getFirestore();
      const preferencesRef = doc(firestore, 'userPreferences', userProfile.uid);

      await setDoc(
        preferencesRef,
        {
          ...values,
          updatedAt: new Date()
        },
        { merge: true }
      );

      setPreferences(values);
      message.success('Notification preferences saved successfully');

      // If push notifications are enabled, ensure we have permission
      if (values.pushEnabled && permissionStatus !== 'granted') {
        await requestPermission();
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      message.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  // Add a function to check if notifications are supported
  const isNotificationsSupported = () => {
    return 'Notification' in window;
  };

  // Add a function to get browser-specific instructions
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      return 'Click the lock icon in the address bar and enable notifications';
    } else if (userAgent.includes('firefox')) {
      return 'Click the shield icon in the address bar and enable notifications';
    } else if (userAgent.includes('safari')) {
      return 'Go to Safari Preferences > Websites > Notifications and enable notifications for this site';
    }
    return 'Enable notifications in your browser settings';
  };

  // Render permission status message
  const renderPermissionStatus = () => {
    if (!isNotificationsSupported()) {
      return <Alert type='warning' message='Notifications are not supported in your browser.' />;
    }

    switch (permissionStatus) {
      case 'granted':
        return <Alert type='success' message='Notifications are enabled.' />;
      case 'denied':
        return (
          <Alert
            type='error'
            message={
              <div>
                <p>Notifications are blocked. To enable them:</p>
                <ol>
                  <li>Open your browser settings</li>
                  <li>{getBrowserInstructions()}</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            }
          />
        );
      default:
        return <Alert type='info' message='Notification permissions have not been requested yet.' />;
    }
  };

  return (
    <div className={`notification-settings ${isDarkMode ? 'dark' : ''}`}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Notification Settings</span>
          </Space>
        }
        className='settings-card'
      >
        {renderPermissionStatus()}

        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={preferences}
          className='settings-form'
        >
          <Divider orientation='left'>Delivery Preferences</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='pushEnabled'
                label={
                  <Space>
                    <MobileOutlined />
                    <span>Push Notifications</span>
                  </Space>
                }
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
              <Text type='secondary'>Receive push notifications on this device</Text>
            </Col>

            <Col span={12}>
              <Form.Item
                name='emailEnabled'
                label={
                  <Space>
                    <MailOutlined />
                    <span>Email Notifications</span>
                  </Space>
                }
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
              <Text type='secondary'>Receive notifications via email</Text>
            </Col>
          </Row>

          <Form.Item name='frequency' label='Notification Frequency'>
            <Select>
              <Option value='immediate'>Immediate (As they occur)</Option>
              <Option value='daily'>Daily Digest</Option>
              <Option value='weekly'>Weekly Digest</Option>
              <Option value='none'>None</Option>
            </Select>
          </Form.Item>

          <Divider orientation='left'>Category Settings</Divider>

          <Form.Item label='Enable notifications for:'>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item name={['categories', 'system']} valuePropName='checked' noStyle>
                  <Switch style={{ marginRight: 8 }} />
                </Form.Item>
                <Text>System Notifications</Text>
              </Col>

              <Col span={12}>
                <Form.Item name={['categories', 'announcements']} valuePropName='checked' noStyle>
                  <Switch style={{ marginRight: 8 }} />
                </Form.Item>
                <Text>Announcements</Text>
              </Col>

              <Col span={12}>
                <Form.Item name={['categories', 'reminders']} valuePropName='checked' noStyle>
                  <Switch style={{ marginRight: 8 }} />
                </Form.Item>
                <Text>Reminders</Text>
              </Col>

              <Col span={12}>
                <Form.Item name={['categories', 'activities']} valuePropName='checked' noStyle>
                  <Switch style={{ marginRight: 8 }} />
                </Form.Item>
                <Text>Activities</Text>
              </Col>
            </Row>
          </Form.Item>

          <Divider orientation='left'>Quiet Hours</Divider>

          <Form.Item name={['quietHours', 'enabled']} valuePropName='checked' label='Enable Quiet Hours'>
            <Switch />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name={['quietHours', 'start']} label='Start Time' dependencies={['quietHours', 'enabled']}>
                <Select disabled={!form.getFieldValue(['quietHours', 'enabled'])}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <Option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['quietHours', 'end']} label='End Time' dependencies={['quietHours', 'enabled']}>
                <Select disabled={!form.getFieldValue(['quietHours', 'enabled'])}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <Option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Paragraph type='secondary'>
            During quiet hours, notifications will be saved but won't display or make sound.
          </Paragraph>

          <Form.Item className='settings-form-actions'>
            <Button type='primary' htmlType='submit' loading={loading} icon={<SaveOutlined />}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NotificationSettings;
