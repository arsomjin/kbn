import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, Space, Upload, Avatar, Typography } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { EmployeeFormData, EmployeeStatus } from "../types";
import { useProvince } from "../../../hooks/useProvince";
import { useAuth } from "../../../hooks/useAuth";
import { employeeService } from "../services/employeeService";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const { Title } = Typography;

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormData>;
  employeeId?: string;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialValues, employeeId }) => {
  const { t } = useTranslation("employees");
  const [form] = Form.useForm();
  const { currentProvince } = useProvince();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialValues?.photoUrl);

  const onFinish = async (values: EmployeeFormData) => {
    try {
      setLoading(true);
      if (employeeId) {
        await employeeService.updateEmployee(employeeId, values, user!.uid);
        message.success(t("success.updated"));
      } else {
        await employeeService.createEmployee(
          { ...values, provinceId: currentProvince!.id },
          user!.uid
        );
        message.success(t("success.created"));
      }
      navigate("/admin/employees");
    } catch (error) {
      message.error(t("error.saving"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (info: any) => {
    if (info.file.status === "done") {
      // Simulate upload and preview
      setPhotoUrl(URL.createObjectURL(info.file.originFileObj));
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <Button type="link" onClick={() => navigate("/admin/employees")}>{t("form.back")}</Button>
      <Title level={4} className="mb-4">{t("form.personalInfo")}</Title>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center w-full md:w-1/3">
          <Avatar size={120} src={photoUrl} icon={<UserOutlined />} />
          <Upload showUploadList={false} onChange={handlePhotoChange} className="mt-2">
            <Button icon={<UploadOutlined />}>{t("form.uploadPhoto")}</Button>
          </Upload>
          <div className="mt-4 text-center font-bold">
            {initialValues?.prefix || ""}{initialValues?.firstName || ""} {initialValues?.lastName || ""}
          </div>
          <div className="text-center text-gray-500">
            {initialValues?.position || ""}
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="prefix"
                label={<span>{t("fields.prefix")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Select>
                  <Select.Option value="นาย">นาย</Select.Option>
                  <Select.Option value="นาง">นาง</Select.Option>
                  <Select.Option value="นางสาว">นางสาว</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="firstName"
                label={<span>{t("fields.firstName")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="lastName"
                label={<span>{t("fields.lastName")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="nickName"
                label={t("fields.nickName")}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="employeeCode"
                label={<span>{t("fields.employeeCode")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="status"
                label={<span>{t("fields.status")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Select>
                  {Object.values(EmployeeStatus).map((status) => (
                    <Select.Option key={status} value={status}>
                      {t(`status.${status.toLowerCase()}`)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="position"
                label={<span>{t("fields.position")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="department"
                label={<span>{t("fields.department")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="branch"
                label={t("fields.branch")}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="startDate"
                label={<span>{t("fields.startDate")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name="endDate"
                label={t("fields.endDate")}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name="workBegin"
                label={t("fields.workBegin")}
              >
                <Input type="time" className="w-full" />
              </Form.Item>
              <Form.Item
                name="workEnd"
                label={t("fields.workEnd")}
              >
                <Input type="time" className="w-full" />
              </Form.Item>
              <Form.Item
                name="salary"
                label={<span>{t("fields.salary")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/฿\s?|(,*)/g, "")}
                />
              </Form.Item>
              <Form.Item
                name="bankName"
                label={<span>{t("fields.bankName")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="bankAccount"
                label={<span>{t("fields.bankAccount")} <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: t("validation.required") }]}
              >
                <Input />
              </Form.Item>
            </div>
            <Form.Item
              name="details"
              label={t("fields.details")}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Card title={t("fields.emergencyContact")} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name={["emergencyContact", "name"]}
                  label={<span>{t("fields.emergencyContactName")} <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: t("validation.required") }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={["emergencyContact", "relationship"]}
                  label={<span>{t("fields.emergencyContactRelationship")} <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: t("validation.required") }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={["emergencyContact", "phone"]}
                  label={<span>{t("fields.emergencyContactPhone")} <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: t("validation.required") }]}
                >
                  <Input />
                </Form.Item>
              </div>
            </Card>
            <Form.Item
              name="documents"
              label={t("fields.documents")}
            >
              <Upload multiple>
                <Button icon={<UploadOutlined />}>{t("form.uploadDocument")}</Button>
              </Upload>
            </Form.Item>
            <Form.Item className="text-right">
              <Space>
                <Button onClick={() => navigate("/admin/employees")}>{t("form.cancel")}</Button>
                <Button type="primary" htmlType="submit" loading={loading}>{t("form.save")}</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Card>
  );
}; 