import React from 'react';
import { Form, Input } from 'antd';

export default ({ name, required, message, ...props }) => {
  const rules = [{ required: true, message: message || 'กรุณาป้อนข้อมูล' }];
  return (
    <Form.Item name={name} noStyle {...(required && { rules })} {...props}>
      <Input type="hidden" />
    </Form.Item>
  );
};
