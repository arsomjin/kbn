import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import type { FormInstance } from "antd";
import { collection, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "services/firebase";
import { showWarn, showSuccess } from "utils/functions";
import { createNewId } from "utils/functions";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

interface Customer {
  customerId: string;
  customerNo: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface CustomerDetailsModalProps {
  selectedCustomer: Partial<Customer>;
  visible: boolean;
  onOk: (customer: Customer) => void;
  onCancel: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  selectedCustomer,
  visible,
  onOk,
  onCancel
}) => {
  const [form] = Form.useForm<Customer>();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"add" | "edit" | "delete">("add");
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible) {
      if (Object.keys(selectedCustomer).length > 0) {
        setType("edit");
        form.setFieldsValue(selectedCustomer);
      } else {
        setType("add");
        form.resetFields();
      }
    }
  }, [visible, selectedCustomer, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      let mCustomers = JSON.parse(JSON.stringify(selectedCustomer));
      const customersRef = collection(firestore, "data/sales/customers");
      let customerId: string;

      if (type === "add") {
        customerId = createNewId("CUST");
        await setDoc(doc(customersRef, customerId), {
          ...values,
          customerId,
          created: Date.now(),
          inputBy: user.uid
        });
        mCustomers[customerId] = {
          ...values,
          customerId,
          created: Date.now(),
          inputBy: user.uid
        };
      } else if (type === "edit") {
        customerId = values.customerId || "";
        await updateDoc(doc(customersRef, customerId), {
          ...values,
          customerId,
          updated: Date.now(),
          updateBy: user.uid
        });
        mCustomers[customerId] = {
          ...values,
          customerId,
          updated: Date.now(),
          updateBy: user.uid
        };
      } else {
        customerId = values.customerId || "";
        await deleteDoc(doc(customersRef, customerId));
        mCustomers = Object.fromEntries(
          Object.entries(mCustomers).filter(([_, l]: [string, any]) => l.customerId !== customerId)
        );
      }

      dispatch({ type: "SET_CUSTOMERS", payload: mCustomers });
      showSuccess({ content: "บันทึกข้อมูลสำเร็จ" });
      onOk(values as Customer);
    } catch (e) {
      showWarn((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={type === "add" ? "เพิ่มข้อมูลลูกค้า" : "แก้ไขข้อมูลลูกค้า"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          prefix: "นาย",
          customerNo: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          address: "",
          subDistrict: "",
          district: "",
          province: "",
          postalCode: ""
        }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="prefix"
              label="คำนำหน้า"
              rules={[{ required: true, message: "กรุณากรอกคำนำหน้า" }]}
            >
              <Select>
                <Option value="นาย">นาย</Option>
                <Option value="นาง">นาง</Option>
                <Option value="นางสาว">นางสาว</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="customerNo"
              label="รหัสลูกค้า"
              rules={[{ required: true, message: "กรุณากรอกรหัสลูกค้า" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="firstName"
              label="ชื่อ"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="lastName"
              label="นามสกุล"
              rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="เบอร์โทรศัพท์"
              rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="อีเมล"
              rules={[
                { type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง" },
                { required: true, message: "กรุณากรอกอีเมล" }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="ที่อยู่"
              rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="subDistrict"
              label="ตำบล/แขวง"
              rules={[{ required: true, message: "กรุณากรอกตำบล/แขวง" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="district"
              label="อำเภอ/เขต"
              rules={[{ required: true, message: "กรุณากรอกอำเภอ/เขต" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="province"
              label="จังหวัด"
              rules={[{ required: true, message: "กรุณากรอกจังหวัด" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="postalCode"
              label="รหัสไปรษณีย์"
              rules={[{ required: true, message: "กรุณากรอกรหัสไปรษณีย์" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerDetailsModal; 