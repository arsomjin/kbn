import React from "react";
import { Form } from "antd";
import type { FormInstance } from "antd/es/form";
import { EditableRowProps, EditableContextType } from "./types";

export const EditableContext = React.createContext<FormInstance | null>(null);

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export default EditableRow; 