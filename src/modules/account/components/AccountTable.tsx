import React from "react";
import { useTranslation } from "react-i18next";
import { Table } from "antd";
import { DateTime } from "luxon";
import { AccountTableProps } from "../types";
import { formatCurrency, formatDate } from "../../../utils/format";
import { useTheme } from "hooks/useTheme";

/**
 * Account table component
 */
export const AccountTable: React.FC<AccountTableProps> = ({ data, range }) => {
  const { t } = useTranslation("account", "common");
  const { isDarkMode } = useTheme();

  const columns = [
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (date: any) => {
        try {
          return formatDate(date, "dd/MM/yyyy");
        } catch {
          return "-";
        }
      }
    },
    {
      title: t("income"),
      dataIndex: "income",
      key: "income",
      render: (value: number) => formatCurrency(value),
      sorter: (a: any, b: any) => a.income - b.income
    },
    {
      title: t("expense"),
      dataIndex: "expense",
      key: "expense",
      render: (value: number) => formatCurrency(value),
      sorter: (a: any, b: any) => a.expense - b.expense
    },
    {
      title: t("tax"),
      dataIndex: "tax",
      key: "tax",
      render: (value: number) => formatCurrency(value),
      sorter: (a: any, b: any) => a.tax - b.tax
    },
    {
      title: t("total"),
      key: "total",
      render: (record: any) => formatCurrency(record.income + record.expense + record.tax),
      sorter: (a: any, b: any) => (a.income + a.expense + a.tax) - (b.income + b.expense + b.tax)
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="date"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => t("common.totalRecords", { total })
      }}
      scroll={{ x: true }}
      className="dark:bg-gray-800 dark:text-white"
      rowClassName="dark:hover:bg-gray-700"
    />
  );
}; 