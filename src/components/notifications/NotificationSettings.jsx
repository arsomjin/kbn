import React, { useEffect, useState } from 'react';
import {
  Form,
  Switch,
  Select,
  Button,
  Card,
  Space,
  Typography,
  Alert,
  Spin,
  Tooltip,
  Row,
  Col,
  Badge,
  Divider,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  InfoCircleOutlined,
  NotificationOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import './NotificationSettings.css';
import { useDispatch } from 'react-redux';
import { useAuth } from 'contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore as db } from 'services/firebase';
import { useNotification } from './ToastNotification';
import { saveFcmToken } from 'services/notificationService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * NotificationSettings Component
 * Allows users to configure their notification preferences including push notifications
 */
const NotificationSettings = () => {
  const { t } = useTranslation(['notifications', 'common']);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { showSuccess, showError, showInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushPermissionStatus, setPushPermissionStatus] = useState('default');
  const [fcmSupported, setFcmSupported] = useState(true);
  const [fcmTokenStatus, setFcmTokenStatus] = useState('none'); // 'none', 'saving', 'saved', 'error'

  // Check if browser supports notifications and get current permission status
  useEffect(() => {
    const checkNotificationSupport = () => {
      if (!('Notification' in window)) {
        setFcmSupported(false);
        return;
      }

      setPushPermissionStatus(Notification.permission);
    };

    checkNotificationSupport();
  }, []);

  // Load user notification preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          form.setFieldsValue({
            emailNotifications: data.emailNotifications ?? true,
            pushNotifications: data.pushNotifications ?? false,
            notificationFrequency: data.notificationFrequency ?? 'realtime',
            notificationTypes: data.notificationTypes ?? ['info', 'success', 'warning', 'error'],
          });

          // Set FCM token status based on saved settings
          if (data.pushNotifications && data.fcmToken) {
            setFcmTokenStatus('saved');
          }
        } else {
          // Set default values if no settings exist
          form.setFieldsValue({
            emailNotifications: true,
            pushNotifications: false,
            notificationFrequency: 'realtime',
            notificationTypes: ['info', 'success', 'warning', 'error'],
          });
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        showError(t('settings.loadError'), error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, form, t, showError]);

  // Request notification permission and save FCM token
  const requestNotificationPermission = async () => {
    if (!fcmSupported) {
      showError(t('settings.saveError'), t('settings.errors.pushNotSupported'));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermissionStatus(permission);

      if (permission === 'granted') {
        // Save FCM token
        setFcmTokenStatus('saving');
        const tokenSaved = await saveFcmToken(user.uid);

        if (tokenSaved) {
          setFcmTokenStatus('saved');
          showSuccess(t('settings.saveSuccess'), t('settings.success.pushEnabled'));
          return true;
        } else {
          setFcmTokenStatus('error');
          showError(t('settings.saveError'), t('settings.errors.failedSaveToken'));
          return false;
        }
      } else if (permission === 'denied') {
        setFcmTokenStatus('none');
        showError(t('settings.saveError'), t('settings.permissionRequiredDesc'));
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setFcmTokenStatus('error');
      showError(t('settings.saveError'), error.message);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!user?.uid) {
      showError(t('settings.saveError'), t('settings.errors.userNotAuthenticated'));
      return;
    }

    try {
      setSaving(true);

      // If user is enabling push notifications and permission not granted
      if (values.pushNotifications && pushPermissionStatus !== 'granted') {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          // Update form to reflect that push notifications couldn't be enabled
          form.setFieldValue('pushNotifications', false);
          values.pushNotifications = false;
        }
      }

      // If user is disabling push notifications, clear the token status
      if (!values.pushNotifications && fcmTokenStatus === 'saved') {
        setFcmTokenStatus('none');
      }

      // Save settings to Firestore
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
      await setDoc(
        settingsRef,
        {
          ...values,
          fcmToken: values.pushNotifications ? fcmTokenStatus === 'saved' : null,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      // Update Redux store if needed
      dispatch({
        type: 'notifications/setPreferences',
        payload: values,
      });

      showSuccess(t('settings.saveSuccess'), t('settings.success.preferencesUpdated'));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showError(t('settings.saveError'), error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle push notification toggle
  const handlePushNotificationChange = async (checked) => {
    if (checked) {
      if (pushPermissionStatus === 'denied') {
        showInfo(t('settings.permissionRequired'), t('settings.permissionRequiredDesc'));
        form.setFieldValue('pushNotifications', false);
        return;
      }

      if (pushPermissionStatus === 'default') {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          form.setFieldValue('pushNotifications', false);
          return;
        }
      }
    } else {
      // User is disabling push notifications
      setFcmTokenStatus('none');
    }
  };

  // Get push notification status text and color
  const getPushStatusInfo = () => {
    if (!fcmSupported) {
      return {
        status: t('settings.pushBlocked'),
        color: 'red',
        icon: <CloseCircleOutlined />,
      };
    }

    switch (pushPermissionStatus) {
      case 'granted':
        return {
          status: t('settings.pushEnabled'),
          color: 'green',
          icon: <CheckCircleOutlined />,
        };
      case 'denied':
        return {
          status: t('settings.pushBlocked'),
          color: 'red',
          icon: <CloseCircleOutlined />,
        };
      default:
        return {
          status: t('settings.pushDisabled'),
          color: 'orange',
          icon: <ExclamationCircleOutlined />,
        };
    }
  };

  if (loading) {
    return (
      <div className="notification-settings">
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spin size="large" />
            <div style={{ marginTop: '1rem' }}>
              <Text type="secondary">{t("settings.loading")}</Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const pushStatusInfo = getPushStatusInfo();

  return (
    <div className="notification-settings">
      <Card>
        <Title level={4}>
          <NotificationOutlined style={{ marginRight: '0.5rem' }} />
          {t('settings.title')}
        </Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
          {/* Push Notification Status Alert */}
          <Alert
            message={t('settings.pushNotificationsStatus', { status: pushStatusInfo.status })}
            type={
              pushStatusInfo.color === 'green'
                ? 'success'
                : pushStatusInfo.color === 'red'
                  ? 'error'
                  : 'warning'
            }
            icon={pushStatusInfo.icon}
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[24, 0]}>
            <Col xs={24} md={24}>
              <Card type="inner" style={{ height: '100%' }}>
                <Title level={5}>
                  <MailOutlined style={{ marginRight: '0.5rem' }} />
                  {t('settings.emailNotifications')}
                </Title>
                <Paragraph type="secondary">{t('settings.emailNotificationsDesc')}</Paragraph>

                <Form.Item
                  name="emailNotifications"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch
                    checkedChildren={t('enabled', { ns: 'common' })}
                    unCheckedChildren={t('disabled', { ns: 'common' })}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={24}>
              <Card type="inner" style={{ height: '100%' }}>
                <Title level={5}>
                  <NotificationOutlined style={{ marginRight: '0.5rem' }} />
                  {t('settings.pushNotifications')}
                </Title>
                <Paragraph type="secondary">{t('settings.pushNotificationsDesc')}</Paragraph>
                <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                  {t('settings.pushNotificationsHelp')}
                </Paragraph>

                <Form.Item
                  name="pushNotifications"
                  valuePropName="checked"
                  style={{ marginBottom: 8 }}
                >
                  <Switch
                    onChange={handlePushNotificationChange}
                    disabled={!fcmSupported || pushPermissionStatus === 'denied'}
                    loading={fcmTokenStatus === 'saving'}
                    checkedChildren={t('enabled', { ns: 'common' })}
                    unCheckedChildren={t('disabled', { ns: 'common' })}
                  />
                </Form.Item>

                {fcmTokenStatus === 'saved' && (
                  <Badge status="success" text={t("settings.success.tokenSaved")} style={{ fontSize: '12px' }} />
                )}
                {fcmTokenStatus === 'error' && (
                  <Badge status="error" text={t("settings.status.tokenError")} style={{ fontSize: '12px' }} />
                )}
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="notificationFrequency"
                label={
                  <span>
                    {t('settings.frequency')}
                    <Tooltip title={t('settings.frequencyDesc')}>
                      <InfoCircleOutlined style={{ marginLeft: '0.5rem', color: '#8c8c8c' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Select>
                  <Option value="realtime">{t('settings.frequency.realtime')}</Option>
                  <Option value="daily">{t('settings.frequency.daily')}</Option>
                  <Option value="weekly">{t('settings.frequency.weekly')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="notificationTypes"
                label={
                  <span>
                    {t('settings.types')}
                    <Tooltip title={t('settings.typesDesc')}>
                      <InfoCircleOutlined style={{ marginLeft: '0.5rem', color: '#8c8c8c' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Select mode="multiple" placeholder={t('settings.typesDesc')}>
                  <Option value="info">{t('types.info')}</Option>
                  <Option value="success">{t('types.success')}</Option>
                  <Option value="warning">{t('types.warning')}</Option>
                  <Option value="error">{t('types.error')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<NotificationOutlined />}
              >
                {t('save', { ns: 'common' })}
              </Button>
              <Button onClick={() => form.resetFields()}>{t('reset', { ns: 'common' })}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NotificationSettings;
