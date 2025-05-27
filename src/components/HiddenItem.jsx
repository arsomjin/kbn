import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input } from 'antd';

/**
 * HiddenItem Component
 *
 * A form component for hidden input fields with validation support.
 * Used to store form data that doesn't need to be visible to users.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Form field name
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.message - Custom validation message
 * @returns {React.ReactElement} Hidden form item component
 */
const HiddenItem = ({ name, required, message, ...props }) => {
  const { t } = useTranslation();

  const rules = [{ required: true, message: message || t('components.hiddenItem.defaultMessage') }];

  return (
    <Form.Item name={name} noStyle {...(required && { rules })} {...props}>
      <Input type="hidden" />
    </Form.Item>
  );
};

export default HiddenItem;
