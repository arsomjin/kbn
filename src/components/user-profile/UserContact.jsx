import React from 'react';
import PropTypes from 'prop-types';
import { Card, Form, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

/**
 * UserContact Component
 *
 * A contact form component with modern Ant Design components
 * Features responsive design, dark mode support, and i18n translations
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The contact form title
 * @returns {JSX.Element} The user contact component
 */
const UserContact = ({ title }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Handle form submission here
  };

  return (
    <Card
      title={title}
      className="mb-4 dark:bg-gray-800 dark:border-gray-700"
      bodyStyle={{ padding: '24px' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="w-full">
        <Form.Item
          name="message"
          label={<span className="dark:text-gray-300">{t('userContact.messageLabel')}</span>}
          rules={[
            {
              required: true,
              message: t('userContact.messageRequired'),
            },
            {
              min: 10,
              message: t('userContact.messageMinLength'),
            },
          ]}
        >
          <TextArea
            rows={6}
            placeholder={t('userContact.messagePlaceholder')}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            style={{ minHeight: '150px' }}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            className="w-full sm:w-auto"
          >
            {t('userContact.sendMessage')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

UserContact.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
};

UserContact.defaultProps = {
  title: 'Send Message',
};

export default UserContact;
