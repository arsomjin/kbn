import React, { useCallback, useState } from "react";
import { Modal, Form } from "antd";
import { default as EInput } from "elements/Input";
import { showConfirm } from "utils/functions";
import ExpenseNameSelector from ".";
import { useSelector } from "react-redux";

export interface ExpenseNameFormValues {
  expenseNameId: string | null;
  expenseName: string | null;
}

interface ExpenseNameDetailsProps {
  onOk: (values: ExpenseNameFormValues, type: "add" | "edit" | "delete") => void;
  onCancel: () => void;
  visible: boolean;
}

const initialValues: ExpenseNameFormValues = {
  expenseNameId: null,
  expenseName: null
};

const ExpenseNameDetails: React.FC<ExpenseNameDetailsProps> = ({ onOk, onCancel, visible }) => {
  const { expenseNames } = useSelector((state: any) => state.data);
  const [type, setType] = useState<"add" | "edit" | "delete">("add");

  const [expenseNameForm] = Form.useForm<ExpenseNameFormValues>();

  const onConfirm = useCallback(
    (values: ExpenseNameFormValues) => {
      expenseNameForm.resetFields();
      onOk && onOk(values, type);
    },
    [expenseNameForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: ExpenseNameFormValues) => {
      showConfirm(
        () => onConfirm(values),
        `${type === "add" ? "สร้าง" : "บันทึก"}รายชื่อรายจ่าย ${values.expenseName}`
      );
    },
    [onConfirm, type]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as "add" | "edit" | "delete");
  };

  const onSelect = (it: string | string[]) => {
    if (typeof it === "string") {
      const expenseName = { ...initialValues, ...expenseNames[it] };
      expenseNameForm.setFieldsValue(expenseName);
    }
  };

  return (
    <Modal
      title="รายชื่อรายจ่าย"
      open={visible}
      onOk={() => {
        expenseNameForm
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
      <Form form={expenseNameForm} layout="horizontal" initialValues={initialValues}>
        <Form.Item name="expenseNameId" noStyle>
          <EInput type="hidden" />
        </Form.Item>
        <Form.Item
          name="expenseName"
          rules={[{ required: true, message: "กรุณาป้อนข้อมูล" }]}
        >
          {type === "add" ? (
            <EInput placeholder="ชื่อรายจ่าย" />
          ) : (
            <ExpenseNameSelector onChange={onSelect} noAddable />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseNameDetails;