import React from 'react';
import { Form, Switch, Select, Button, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './NotificationSettings.css';

const { Title } = Typography;
const { Option } = Select;

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // TODO: Implement settings update
      console.log('Settings updated:', values);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="notification-settings">
      <Card>
        <Title level={4}>{t('notifications.settings.title')}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            emailNotifications: true,
            pushNotifications: true,
            notificationFrequency: 'realtime',
            notificationTypes: ['info', 'success', 'warning', 'error'],
          }}
        >
          <Form.Item
            name="emailNotifications"
            label={t('notifications.settings.emailNotifications')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="pushNotifications"
            label={t('notifications.settings.pushNotifications')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="notificationFrequency" label={t('notifications.settings.frequency')}>
            <Select>
              <Option value="realtime">{t('notifications.settings.frequency.realtime')}</Option>
              <Option value="daily">{t('notifications.settings.frequency.daily')}</Option>
              <Option value="weekly">{t('notifications.settings.frequency.weekly')}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notificationTypes" label={t('notifications.settings.types')}>
            <Select mode="multiple">
              <Option value="info">{t('notifications.types.info')}</Option>
              <Option value="success">{t('notifications.types.success')}</Option>
              <Option value="warning">{t('notifications.types.warning')}</Option>
              <Option value="error">{t('notifications.types.error')}</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={() => form.resetFields()}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NotificationSettings;
