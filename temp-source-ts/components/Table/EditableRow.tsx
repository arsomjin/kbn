import React from 'react';
import { Form } from 'antd';

export const EditableContext = React.createContext<ReturnType<typeof Form.useForm>[0] | null>(null);

interface EditableRowProps {
  index: number;
  children: React.ReactNode;
}

export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
