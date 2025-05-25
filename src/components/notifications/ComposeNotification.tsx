import React from 'react';
import { Form, Input, Select, Button, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './ComposeNotification.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ComposeNotification = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // TODO: Implement notification sending
      console.log('Notification to send:', values);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div className="compose-notification">
      <Card>
        <Title level={4}>{t('notifications.compose.title')}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'info',
            priority: 'normal',
          }}
        >
          <Form.Item
            name="type"
            label={t('notifications.compose.type')}
            rules={[{ required: true, message: t('notifications.compose.typeRequired') }]}
          >
            <Select>
              <Option value="info">{t('notifications.types.info')}</Option>
              <Option value="success">{t('notifications.types.success')}</Option>
              <Option value="warning">{t('notifications.types.warning')}</Option>
              <Option value="error">{t('notifications.types.error')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label={t('notifications.compose.title')}
            rules={[{ required: true, message: t('notifications.compose.titleRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label={t('notifications.compose.message')}
            rules={[{ required: true, message: t('notifications.compose.messageRequired') }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="priority" label={t('notifications.compose.priority')}>
            <Select>
              <Option value="low">{t('notifications.priority.low')}</Option>
              <Option value="normal">{t('notifications.priority.normal')}</Option>
              <Option value="high">{t('notifications.priority.high')}</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('notifications.compose.send')}
              </Button>
              <Button onClick={() => form.resetFields()}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ComposeNotification;
