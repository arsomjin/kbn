/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Table } from "antd";
import moment from "moment";
import numeral from "numeral";
import { Card } from "shards-react";
import { FinancialDataPoint } from "../data";

/**
 * Props interface for AccountTable component
 */
interface AccountTableProps {
  data: FinancialDataPoint[];
  range: string;
}

/**
 * Component that displays financial data in a tabular format
 */
const AccountTable: React.FC<AccountTableProps> = ({ data, range }) => {
  const columns = [
    {
      title: range,
      dataIndex: "x",
      key: "x",
      render: (text: number) => {
        let label = text;
        if (range === "เดือน") {
          label = moment(text, "MM").format("MMM");
        }
        return <a>{label}</a>;
      },
    },
    {
      title: "รายรับ",
      dataIndex: "income",
      key: "income",
      render: (txt: number) => <a>{numeral(txt).format("0,0.00")}</a>,
      align: "right" as const,
    },
    {
      title: "รายจ่าย",
      dataIndex: "expense",
      key: "expense",
      render: (txt: number) => <a>{numeral(txt).format("0,0.00")}</a>,
      align: "right" as const,
    },
    {
      title: "ภาษี",
      key: "tax",
      dataIndex: "tax",
      render: (txt: number) => <a>{numeral(txt).format("0,0.00")}</a>,
      align: "right" as const,
    },
  ];

  return (
    <Card small className="px-4 py-4">
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default AccountTable;