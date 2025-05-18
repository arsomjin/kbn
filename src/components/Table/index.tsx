import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Button } from "antd";
import type { TableProps, ColumnType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { EditableRow } from "./EditableRow";
import EditableCell from "./EditableCell";
import { getRenderColumns } from "./helper";

import "./table.css";

interface TableData {
  key: string;
  _key?: string;
  id?: number;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  [key: string]: any;
}

interface ReusableEditableTableProps {
  columns?: ColumnType<TableData>[];
  dataSource?: TableData[];
  onChange?: (data: TableData[], dataIndex: string | null, rowIndex: number) => void;
  defaultRowItem?: Record<string, any>;
  readOnly?: boolean;
  canDelete?: boolean | ((key: string) => Promise<TableData[]>);
  canAdd?: boolean | ((data: TableData[]) => Promise<TableData[]>);
  canEdit?: boolean | ((record: TableData, dataIndex: string | null, rowIndex: number) => void);
  permanentDelete?: boolean;
  disabled?: boolean;
  tableProps?: Partial<TableProps<TableData>>;
}

interface RootState {
  data: {
    branches: any[];
    departments: any[];
    userGroups: any[];
    dealers: any[];
    banks: any[];
    expenseCategories: any[];
    employees: any[];
    executives: any[];
    expenseAccountNames: any[];
  };
}

const defaultNewRow: Record<string, any> = {};

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
  tableProps = {}
}) => {
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
  } = useSelector((state: RootState) => state.data);

  useEffect(() => {
    console.log({ dataSource });
    const initData = dataSource.map((item, idx) => ({
      ...item,
      key: item.key || idx.toString()
    }));
    setData(initData);
  }, [dataSource]);

  const handleSave = (record: TableData) => {
    const newData = [...data];
    const index = newData.findIndex(row => row.key === record.key);
    if (index > -1) {
      newData[index] = record;
      setData(newData);
      onChange?.(newData, null, index);
    }
  };

  const handleAdd = async () => {
    if (disabled) return;
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
      const newRow: TableData = {
        ...defaultRowItem,
        _key: newKey,
        key: data.length.toString(),
        id: data.length
      };
      const newData = [...data, newRow];
      setData(newData);
      onChange?.(newData, null, -1);
    }
  };

  const handleDelete = async (key: string) => {
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
    const cannotEdit = record?.deleted || record?.rejected || record?.completed;
    const rowIndex = data.findIndex(r => r.key === record.key);
    if (!cannotEdit && typeof canEdit === "function") {
      canEdit(record, null, rowIndex);
    }
  };

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

  if (canDelete && !readOnly && !disabled) {
    mergedCols.push({
      title: "ลบ",
      dataIndex: "__delete__",
      align: "center",
      render: (_: any, record: TableData) => (
        <Popconfirm
          title="ยืนยันการลบ?"
          onConfirm={() => handleDelete(record.key)}
          okText="ตกลง"
          cancelText="ยกเลิก"
          overlayClassName="my-popconfirm"
        >
          <DeleteOutlined className="text-danger mb-2" />
        </Popconfirm>
      )
    } as ColumnType<TableData>);
  }

  if (canEdit && !(disabled || readOnly)) {
    const editCol: ColumnType<TableData> = {
      title: "🖊",
      dataIndex: "__edit__",
      render: (_: any, record: TableData) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      ),
      align: "center",
      width: 50
    };

    const idIndex = mergedCols.findIndex(col => ["id", "key"].includes(col.dataIndex as string));
    if (idIndex > -1) {
      mergedCols.splice(idIndex + 1, 0, editCol);
    } else {
      mergedCols.push(editCol);
    }
  }

  return (
    <div>
      {canAdd && !readOnly && !disabled && (
        <Button onClick={handleAdd} style={{ margin: 8 }}>
          + เพิ่มรายการ
        </Button>
      )}
      <Table<TableData>
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