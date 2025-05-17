import React, { useCallback, useState } from "react";
import { Modal, Form } from "antd";
import { default as EInput } from "elements/Input";
import { showConfirm } from "utils/functions";
import ExecutiveSelector from ".";
import { useSelector } from "react-redux";

export interface ExecutiveFormValues {
  executiveId: string | null;
  executiveCode: string | null;
  executiveName: string | null;
}

interface ExecutiveDetailsProps {
  onOk: (values: ExecutiveFormValues, type: "add" | "edit" | "delete") => void;
  onCancel: () => void;
  visible: boolean;
  initDoc?: any;
}

const initialValues: ExecutiveFormValues = {
  executiveId: null,
  executiveCode: null,
  executiveName: null
};

const ExecutiveDetails: React.FC<ExecutiveDetailsProps> = ({ onOk, onCancel, visible, initDoc }) => {
  const { executives } = useSelector((state: any) => state.data);
  const [type, setType] = useState<"add" | "edit" | "delete">("add");

  const [executiveForm] = Form.useForm<ExecutiveFormValues>();

  const onConfirm = useCallback(
    (values: ExecutiveFormValues) => {
      executiveForm.resetFields();
      onOk && onOk(values, type);
    },
    [executiveForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: ExecutiveFormValues) => {
      showConfirm(
        () => onConfirm(values),
        `${type === "add" ? "สร้าง" : "บันทึก"}รายชื่อผู้บริหาร ${values.executiveName}`
      );
    },
    [onConfirm, type]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as "add" | "edit" | "delete");
  };

  const onSelect = (it: string | string[]) => {
    if (typeof it === "string") {
      const executive = { ...initialValues, ...executives[it] };
      executiveForm.setFieldsValue(executive);
    }
  };

  return (
    <Modal
      title="ผู้บริหาร"
      open={visible}
      onOk={() => {
        executiveForm
          .validateFields()
          .then((values) => {
            onPreConfirm(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      onCancel={onCancel}
      okText={type === "add" ? "สร้างรายชื่อ" : type === "edit" ? "บันทึก" : "ลบ"}
      cancelText="ยกเลิก"
      okType={type === "delete" ? "danger" : "primary"}
    >
      <Form form={executiveForm} layout="horizontal" initialValues={initialValues}>
        <Form.Item name="executiveId" noStyle>
          <EInput type="hidden" />
        </Form.Item>
        <Form.Item
          name="executiveCode"
          rules={[{ required: true, message: "กรุณาป้อนข้อมูล" }]}
        >
          {type === "add" ? (
            <EInput placeholder="รหัสผู้บริหาร" />
          ) : (
            <ExecutiveSelector onChange={onSelect} noAddable />
          )}
        </Form.Item>
        <Form.Item
          name="executiveName"
          rules={[{ required: true, message: "กรุณาป้อนข้อมูล" }]}
        >
          <EInput placeholder="ชื่อผู้บริหาร" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExecutiveDetails; 