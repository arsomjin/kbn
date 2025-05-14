import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Empty
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Employee, EmployeeStatus } from "../types";
import { employeeService } from "../services/employeeService";
import { useAuth } from "../../../hooks/useAuth";
import { useProvince } from "../../../hooks/useProvince";
import ExcelImportExport from "../../../components/common/ExcelImportExport";
import LoadingScreen from "../../../components/common/LoadingScreen";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { firestore as db } from "../../../services/firebase";
import dayjs from "dayjs";

const { Option } = Select;

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
  "probation": EmployeeStatus.ON_LEAVE, // Map as needed
  "retired": EmployeeStatus.INACTIVE // Map as needed
};

function toJSDate(date: any): Date | null {
  if (!date) return null;
  if (typeof date === "object" && typeof date.toDate === "function") return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === "number" || typeof date === "string") {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export const EmployeeList: React.FC = () => {
  const { t } = useTranslation("employees");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProvince, loading: provinceLoading } = useProvince();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: undefined as EmployeeStatus | undefined,
    department: undefined as string | undefined,
    position: undefined as string | undefined,
  });

  useEffect(() => {
    if (!provinceLoading && currentProvince?.id) {
      loadEmployees();
    }
    // eslint-disable-next-line
  }, [provinceLoading, currentProvince?.id, filters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "data/company/employees"));
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let status = docData.status;
        if (statusMap[status]) {
          status = statusMap[status];
        }
        return {
          ...docData,
          status,
          id: doc.id,
        };
      });
      setEmployees(data as Employee[]);
    } catch (error) {
      message.error(t("messages.error.loading"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id, user!.uid);
      message.success(t("messages.success.deleted"));
      loadEmployees();
    } catch (error) {
      message.error(t("messages.error.deleting"));
    }
  };

  const excelColumns = [
    {
      title: t("fields.employeeCode"),
      dataIndex: "employeeCode",
      key: "employeeCode",
    },
    {
      title: t("fields.firstName"),
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: t("fields.lastName"),
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: t("fields.position"),
      dataIndex: "position",
      key: "position",
    },
    {
      title: t("fields.department"),
      dataIndex: "department",
      key: "department",
    },
    {
      title: t("fields.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("fields.startDate"),
      dataIndex: "startDate",
      key: "startDate",
    },
  ];

  const columns: ColumnsType<Employee> = [
    {
      title: t("fields.employeeCode"),
      dataIndex: "employeeCode",
      key: "employeeCode",
      sorter: (a, b) => (a.employeeCode || "").localeCompare(b.employeeCode || ""),
    },
    {
      title: t("fields.name"),
      key: "name",
      render: (_, record) => (
        <span>{`${record.firstName || ""} ${record.lastName || ""}`.trim()}</span>
      ),
      sorter: (a, b) =>
        `${a.firstName || ""} ${a.lastName || ""}`.localeCompare(`${b.firstName || ""} ${b.lastName || ""}`),
    },
    {
      title: t("fields.nickName"),
      dataIndex: "nickName",
      key: "nickName",
      render: (nickName) => nickName || "-",
    },
    {
      title: t("fields.position"),
      dataIndex: "position",
      key: "position",
      sorter: (a, b) => (a.position || "").localeCompare(b.position || ""),
    },
    {
      title: t("fields.department"),
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => (a.department || "").localeCompare(b.department || ""),
    },
    {
      title: t("fields.status"),
      dataIndex: "status",
      key: "status",
      render: (status: EmployeeStatus) => {
        if (!status) return <Tag color="default">-</Tag>;
        const statusColors = {
          [EmployeeStatus.ACTIVE]: "success",
          [EmployeeStatus.INACTIVE]: "default",
          [EmployeeStatus.ON_LEAVE]: "warning",
          [EmployeeStatus.TERMINATED]: "error",
        };
        const color = statusColors[status] || "default";
        const key = typeof status === "string" ? status.toLowerCase() : "";
        return <Tag color={color}>{t(`status.${key}`) || status}</Tag>;
      },
      filters: Object.values(EmployeeStatus).map((status) => ({
        text: t(`status.${status.toLowerCase()}`),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t("fields.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => {
        const d = toJSDate(date);
        return d && dayjs(d).isValid() ? dayjs(d).format("YYYY-MM-DD") : "-";
      },
      sorter: (a, b) => {
        const aDate = toJSDate(a.startDate);
        const bDate = toJSDate(b.startDate);
        return dayjs(aDate).unix() - dayjs(bDate).unix();
      },
    },
    {
      title: t("actions.actions", { ns: "common" }) || t("actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.edit") || t("edit", { ns: "common" })}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/employees/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title={t("messages.confirm.delete")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("yes", { ns: "common" })}
            cancelText={t("no", { ns: "common" })}
          >
            <Tooltip title={t("actions.delete") || t("delete", { ns: "common" })}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading || provinceLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <Space>
            <ExcelImportExport
              columns={excelColumns}
              data={employees}
              onImport={loadEmployees}
              templateDownload
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/employees/new")}
            >
              {t("actions.add")}
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-row md:flex-row gap-4">
          <Input
            placeholder={t("search.placeholder")}
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-xs"
          />
          <Select
            placeholder={t("filters.status")}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            className="min-w-[200px]"
          >
            {Object.values(EmployeeStatus).map((status) => (
              <Option key={status} value={status}>
                {t(`status.${status.toLowerCase()}`)}
              </Option>
            ))}
          </Select>
          <Select
            placeholder={t("filters.department")}
            allowClear
            value={filters.department}
            onChange={(value) => setFilters({ ...filters, department: value })}
            className="min-w-[200px]"
          >
            {/* Add department options */}
          </Select>
          <Select
            placeholder={t("filters.position")}
            allowClear
            value={filters.position}
            onChange={(value) => setFilters({ ...filters, position: value })}
            className="min-w-[200px]"
          >
            {/* Add position options */}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => t("common.total", { total, ns: "common" }),
          }}
          className="overflow-x-auto"
          locale={{
            emptyText: <Empty description={t("messages.empty")} />,
          }}
          size="small"
        />
      </Card>
    </div>
  );
}; 