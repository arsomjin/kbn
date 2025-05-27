import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'elements';
import { getRules } from 'api/Table';

/**
 * InputModal - A component for displaying a modal with an input field
 *
 * Features:
 * - i18next translation support for all text content
 * - Modal integration with form validation
 * - Currency input support via currency prop
 * - Custom validation rules support
 * - Auto-focus on input when modal opens
 * - Customizable button icon and label
 * - Dark mode compatible styling
 * - Responsive design
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Form field name
 * @param {Function} props.onChange - Callback function when form is submitted
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} [props.icon] - Button icon
 * @param {string} [props.label] - Button label text
 * @param {Array} [props.rules] - Custom validation rules (defaults to required)
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {boolean} [props.currency=false] - Whether input should be currency type
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {string} [props.okText] - Custom OK button text
 * @param {string} [props.cancelText] - Custom Cancel button text
 * @returns {JSX.Element} The input modal component
 */
const InputModal = ({
  name,
  onChange,
  title,
  icon,
  label,
  rules,
  placeholder,
  currency = false,
  disabled = false,
  okText,
  cancelText,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setVisible(true);
  };

  const handleSubmit = (values) => {
    onChange && onChange(values);
    handleCancel();
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button
        {...(icon && { icon, shape: 'circle' })}
        type="primary"
        disabled={disabled}
        onClick={showModal}
        className="inline-flex items-center justify-center gap-2"
      >
        {label}
      </Button>

      <Modal
        title={title}
        open={visible}
        onOk={form.submit}
        onCancel={handleCancel}
        destroyOnHidden
        okText={okText || t('common.confirm')}
        cancelText={cancelText || t('common.cancel')}
        width={280}
        className="input-modal"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name={name} rules={rules || getRules(['required'])} className="mb-0">
            <Input
              autoFocus
              {...(currency && { currency: true })}
              placeholder={placeholder || t('inputModal.placeholder')}
              size="large"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InputModal;
