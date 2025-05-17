import React, { useState, useCallback } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useSelector } from "react-redux";

export interface ServiceFormValues {
  serviceId?: string;
  serviceCode: string;
  serviceName: string;
  [key: string]: any;
}

interface ServiceDetailsProps {
  onOk: (values: ServiceFormValues, type: "add" | "edit" | "delete") => Promise<void>;
  onCancel: () => void;
  visible: boolean;
  initDoc?: ServiceFormValues;
}

const initialValues: ServiceFormValues = {
  serviceCode: "",
  serviceName: ""
};

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ onOk, onCancel, visible, initDoc }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { services } = useSelector((state: any) => state.data);

  const handleOk = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onOk(values, initDoc ? "edit" : "add");
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  }, [form, onOk, initDoc]);

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onOk(values, "delete");
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  }, [form, onOk]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [form, onCancel]);

  React.useEffect(() => {
    if (visible && initDoc) {
      form.setFieldsValue(initDoc);
    } else {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initDoc, form]);

  return (
    <Modal
      title={initDoc ? "แก้ไขข้อมูลบริการ" : "เพิ่มข้อมูลบริการ"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      footer={[
        initDoc && (
          <Button key="delete" danger onClick={handleDelete} loading={loading}>
            ลบ
          </Button>
        ),
        <Button key="cancel" onClick={handleCancel}>
          ยกเลิก
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} loading={loading}>
          บันทึก
        </Button>
      ].filter(Boolean)}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initDoc || initialValues}
      >
        <Form.Item
          name="serviceCode"
          label="รหัสบริการ"
          rules={[{ required: true, message: "กรุณากรอกรหัสบริการ" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="serviceName"
          label="ชื่อบริการ"
          rules={[{ required: true, message: "กรุณากรอกชื่อบริการ" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceDetails; 