import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Space, Tag, message } from "antd";
import { EditOutlined, DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Employee, EmployeeStatus } from "../types";
import { employeeService } from "../services/employeeService";
import LoadingScreen from "../../../components/common/LoadingScreen";

export const EmployeeDetails: React.FC = () => {
  const { t } = useTranslation("employees");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        setError(t("error.invalidId"));
        return;
      }
      const data = await employeeService.getEmployeeById(id);
      if (!data) {
        setError(t("error.notFound"));
        return;
      }
      setEmployee(data);
    } catch (error) {
      setError(t("error.loading"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      message.error(t("error.downloading"));
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">{error || t("error.notFound")}</h2>
            <Button onClick={() => navigate("/admin/employees")}>
              {t("common.back")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusColors = {
    [EmployeeStatus.ACTIVE]: "success",
    [EmployeeStatus.INACTIVE]: "default",
    [EmployeeStatus.ON_LEAVE]: "warning",
    [EmployeeStatus.TERMINATED]: "error",
  };

  const statusMap: Record<string, EmployeeStatus> = {
    "ปกติ": EmployeeStatus.ACTIVE,
    "ลาออก": EmployeeStatus.TERMINATED,
    "พักงาน": EmployeeStatus.ON_LEAVE,
    "ไม่ทำงาน": EmployeeStatus.INACTIVE,
    "active": EmployeeStatus.ACTIVE,
    "inactive": EmployeeStatus.INACTIVE,
    "on_leave": EmployeeStatus.ON_LEAVE,
    "terminated": EmployeeStatus.TERMINATED,
    "resigned": EmployeeStatus.TERMINATED,
    "probation": EmployeeStatus.ON_LEAVE,
    "retired": EmployeeStatus.INACTIVE
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/employees")}
          >
            {t("common.back")}
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/employees/${id}/edit`)}
          >
            {t("common.edit")}
          </Button>
        </div>

        <Descriptions title={t("details.title")} bordered>
          <Descriptions.Item label={t("fields.employeeCode")} span={3}>
            {employee.employeeCode || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.name")} span={3}>
            {`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.position")} span={3}>
            {employee.position || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.department")} span={3}>
            {employee.department || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.email")} span={3}>
            {employee.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.phone")} span={3}>
            {employee.phone || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.address")} span={3}>
            {employee.address || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.status")} span={3}>
            {(() => {
              let status = employee.status;
              if (statusMap[status]) status = statusMap[status];
              const color = statusColors[status] || "default";
              const key = typeof status === "string" ? status.toLowerCase() : "";
              return (
                <Tag color={color}>
                  {key ? t(`status.${key}`) : "-"}
                </Tag>
              );
            })()}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.startDate")} span={3}>
            {employee.startDate ? employeeService.formatDate(employee.startDate) : "-"}
          </Descriptions.Item>
          {employee.endDate && (
            <Descriptions.Item label={t("fields.endDate")} span={3}>
              {employeeService.formatDate(employee.endDate)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t("fields.salary")} span={3}>
            {employee.salary ? `฿${employee.salary.toLocaleString()}` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.bankName")} span={3}>
            {employee.bankName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("fields.bankAccount")} span={3}>
            {employee.bankAccount || "-"}
          </Descriptions.Item>
        </Descriptions>

        <Card title={t("fields.emergencyContact")} className="mt-6">
          <Descriptions bordered>
            <Descriptions.Item label={t("fields.emergencyContactName")} span={3}>
              {employee.emergencyContact?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("fields.emergencyContactRelationship")} span={3}>
              {employee.emergencyContact?.relationship || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("fields.emergencyContactPhone")} span={3}>
              {employee.emergencyContact?.phone || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {employee.documents && employee.documents.length > 0 && (
          <Card title={t("fields.documents")} className="mt-6">
            <Space direction="vertical" className="w-full">
              {employee.documents.map((doc) => (
                <Button
                  key={doc.id}
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(doc.url, doc.type)}
                >
                  {doc.type}
                </Button>
              ))}
            </Space>
          </Card>
        )}
      </Card>
    </div>
  );
}; 