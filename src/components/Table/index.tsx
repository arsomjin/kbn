import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Button } from "antd";
import type { ColumnType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import EditableRow from "./EditableRow";
import EditableCell from "./EditableCell";
import { getRenderColumns } from "./helper";
import { showLog } from "utils/functions";
import { ReusableEditableTableProps, TableData } from "./types";
import { useProvince } from "hooks/useProvince";
import { usePermission } from "hooks/usePermission";
import "./table.css";

// Example shape for a new row (optional)
const defaultNewRow: Partial<TableData> = {};

const ReusableEditableTable: React.FC<ReusableEditableTableProps> = ({
  columns = [],
  dataSource = [],
  onChange,
  defaultRowItem = defaultNewRow,
  readOnly = false,
  canDelete = false,
  canAdd = false,
  canEdit = false,
  permanentDelete = false,
  disabled = false,
  tableProps = {},
  provinceId
}) => {
  const { t } = useTranslation();
  const { currentProvince } = useProvince();
  const { hasPermission } = usePermission();
  const [editingCell, setEditingCell] = useState<{ key: string; dataIndex: string } | null>(null);
  const [data, setData] = useState<TableData[]>([]);
  const {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  } = useSelector((state: any) => state.data);

  // Filter data by province if provinceId is provided
  useEffect(() => {
    const filteredData = dataSource.filter(item => 
      !provinceId || item.provinceId === provinceId || item.provinceId === currentProvince?.id
    );
    const initData = filteredData.map((item, idx) => ({
      ...item,
      key: item.key || idx.toString()
    }));
    setData(initData);
  }, [dataSource, provinceId, currentProvince]);

  // Called by each cell after user finishes editing.
  const handleSave = (updatedRow: TableData, dataIndex: string, rowIndex: number) => {
    const newData = [...data];
    const index = newData.findIndex(row => row.key === updatedRow.key);
    if (index > -1) {
      newData[index] = {
        ...updatedRow,
        provinceId: provinceId || currentProvince?.id
      };
      setData(newData);
      onChange?.(newData, dataIndex, rowIndex);
    }
  };

  // Add a new row to the table
  const handleAdd = async () => {
    if (disabled || !hasPermission("CREATE")) return;
    if (typeof canAdd === "function") {
      try {
        const newData = await canAdd(data);
        setData(newData);
        onChange?.(newData, null, -1);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newKey = `${Date.now()}`;
      const newRow = {
        ...defaultRowItem,
        _key: newKey,
        key: data.length.toString(),
        id: data.length,
        provinceId: provinceId || currentProvince?.id
      };
      const newData = [...data, newRow];
      setData(newData);
      onChange?.(newData, null, -1);
    }
  };

  // Delete a row
  const handleDelete = async (key: string) => {
    if (!hasPermission("DELETE")) return;
    if (typeof canDelete === "function") {
      const newData = await canDelete(key);
      setData(newData);
      onChange?.(newData, null, -1);
      return;
    }

    let newData = [...data];

    if (!permanentDelete) {
      const index = newData.findIndex(item => item.key === key);
      if (index > -1) {
        newData[index].deleted = true;
      }
    } else {
      newData = data.filter(item => item.key !== key);
    }

    setData(newData);
    onChange?.(newData, null, -1);
  };

  const handleEdit = async (record: TableData) => {
    if (!hasPermission("UPDATE")) return;
    const cannotEdit = record?.deleted || record?.rejected || record?.completed;
    const rowIndex = data.findIndex(r => r.key === record.key);
    if (!cannotEdit && typeof canEdit === "function") {
      canEdit(record, null, rowIndex);
    }
  };

  // Prepare object for getRenderColumns
  const db = {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  };

  const mergedCols = getRenderColumns(columns, db, handleSave, editingCell, setEditingCell);

  if (canDelete && !readOnly && !disabled && hasPermission("DELETE")) {
    mergedCols.push({
      title: t("common.delete"),
      dataIndex: "__delete__",
      align: "center",
      render: (_: unknown, record: TableData) => (
        <Popconfirm
          title={t("common.confirmDelete")}
          onConfirm={() => handleDelete(record.key)}
          okText={t("common.ok")}
          cancelText={t("common.cancel")}
          overlayClassName="my-popconfirm"
        >
          <DeleteOutlined className="text-danger mb-2" />
        </Popconfirm>
      )
    });
  }

  if (canEdit && !(disabled || readOnly) && hasPermission("UPDATE")) {
    const editCol: ColumnType<TableData> = {
      title: "🖊",
      dataIndex: "__edit__",
      key: "editColumn",
      render: (_: unknown, record: TableData) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      ),
      align: "center",
      width: 50
    };

    const idIndex = mergedCols.findIndex((col: ColumnType<TableData>) => {
      const typedCol = col as ColumnType<TableData>;
      return typedCol.dataIndex && ["id", "key"].includes(typedCol.dataIndex as string);
    });
    if (idIndex > -1) {
      mergedCols.splice(idIndex + 1, 0, editCol);
    } else {
      mergedCols.push(editCol);
    }
  }

  return (
    <div>
      {canAdd && !readOnly && !disabled && hasPermission("CREATE") && (
        <Button onClick={handleAdd} style={{ margin: 8 }}>
          + {t("common.addItem")}
        </Button>
      )}
      <Table
        dataSource={data}
        columns={mergedCols}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell
          }
        }}
        pagination={false}
        tableLayout="auto"
        size="small"
        {...tableProps}
      />
    </div>
  );
};

export default ReusableEditableTable; 