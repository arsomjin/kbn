import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import { Button, Input } from 'elements';
import { getRules } from 'api/Table';

export default ({ name, onChange, title, icon, label, rules, placeholder, currency, disabled, okText, cancelText }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setVisible(true);
  };

  const handleSubmit = values => {
    //  showLog({ values });
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
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {label}
      </Button>
      <Modal
        title={title}
        visible={visible}
        onOk={form.submit}
        onCancel={handleCancel}
        destroyOnClose
        {...(okText && { okText })}
        {...(cancelText && { cancelText })}
        width={280}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item name={name} rules={rules || getRules(['required'])}>
            <Input
              autoFocus
              {...(currency && { currency: true })}
              placeholder={placeholder || 'กรุณาป้อนข้อมูล'}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
