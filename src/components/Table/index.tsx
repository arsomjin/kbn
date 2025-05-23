import React, { useState, useEffect, useMemo } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { EditableRow } from './EditableRow';
import EditableCell from './EditableCell';
import { getRenderColumns } from './helper';
import './table.css';
import { useBranchesForProvince } from 'hooks/useBranchesForProvince';
import { useResponsive } from 'hooks/useResponsive';

/**
 * Base table row type for MTable. Extend this in your module for stricter typing.
 */
export interface TableData {
  key: string;
  _key?: string;
  id?: number | string;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  [key: string]: any;
}

/**
 * Props for the reusable MTable component.
 * @template T - Row data type (should extend TableData)
 */
export interface MTableProps<T extends TableData = TableData> {
  columns?: ColumnType<T>[];
  dataSource?: T[];
  onChange?: (data: T[], dataIndex: string | null, rowIndex: number) => void;
  defaultRowItem?: Partial<T>;
  readOnly?: boolean;
  canDelete?: boolean | ((key: string) => Promise<T[]>);
  canAdd?: boolean | ((data: T[]) => Promise<T[]>);
  canEdit?: boolean | ((record: T, dataIndex: string | null, rowIndex: number) => void);
  permanentDelete?: boolean;
  disabled?: boolean;
  tableProps?: Partial<TableProps<T>>;
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  footer?: React.ReactNode | (() => React.ReactNode);
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

/**
 * Professional, robust, and reusable Ant Design Table wrapper with editable row/cell support.
 *
 * @template T - Row data type (should extend TableData)
 */
const MTable = <T extends TableData = TableData>({
  columns = [],
  dataSource = [],
  onChange,
  defaultRowItem = {} as Partial<T>, // fix type error
  readOnly = false,
  canDelete = false,
  canAdd = false,
  canEdit = false,
  permanentDelete = false,
  disabled = false,
  tableProps = {},
  rowKey = 'key',
  loading = false,
  footer
}: MTableProps<T>) => {
  const { isMobile } = useResponsive();
  const [editingCell, setEditingCell] = useState<{ key: string; dataIndex: string } | null>(null);
  const [data, setData] = useState<T[]>([]);

  const employees = useSelector((state: any) => state.employees?.employees || {});
  const { branches } = useBranchesForProvince({ includeAll: true });
  const departments = useSelector((state: any) => state.departments?.departments || {});

  const { userGroups, dealers, banks, expenseCategories, executives, expenseAccountNames } = useSelector(
    (state: RootState) => state.data
  );

  useEffect(() => {
    const initData = dataSource.map((item, idx) => ({
      ...item,
      key: item.key || idx.toString()
    }));
    setData(initData);
  }, [dataSource]);

  const handleSave = (record: T) => {
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
    if (typeof canAdd === 'function') {
      try {
        const newData = await canAdd(data);
        setData(newData);
        onChange?.(newData, null, -1);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newKey = `${Date.now()}`;
      const newRow: T = {
        ...defaultRowItem,
        _key: newKey,
        key: data.length.toString()
      } as T;
      const newData = [...data, newRow];
      setData(newData);
      onChange?.(newData, null, -1);
    }
  };

  const handleDelete = async (key: string) => {
    if (typeof canDelete === 'function') {
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

  const handleEdit = async (record: T) => {
    const cannotEdit = record?.deleted || record?.rejected || record?.completed;
    const rowIndex = data.findIndex(r => r.key === record.key);
    if (!cannotEdit && typeof canEdit === 'function') {
      canEdit(record, null, rowIndex);
    }
  };

  // Memoize columns for performance
  const db = useMemo(
    () => ({
      branches,
      departments,
      userGroups,
      dealers,
      banks,
      expenseCategories,
      employees,
      executives,
      expenseAccountNames
    }),
    [branches, departments, userGroups, dealers, banks, expenseCategories, employees, executives, expenseAccountNames]
  );

  const mergedCols = useMemo(
    () => getRenderColumns(columns, db, handleSave, editingCell, setEditingCell),
    [columns, db, handleSave, editingCell]
  );

  // Add delete/edit columns if enabled
  if (canDelete && !readOnly && !disabled) {
    mergedCols.push({
      title: 'ลบ',
      dataIndex: '__delete__',
      align: 'center',
      render: (_: any, record: T) => (
        <Popconfirm
          title='ยืนยันการลบ?'
          onConfirm={() => handleDelete(record.key)}
          okText='ตกลง'
          cancelText='ยกเลิก'
          overlayClassName='my-popconfirm'
        >
          <DeleteOutlined className='text-danger mb-2' />
        </Popconfirm>
      )
    } as ColumnType<T>);
  }

  if (canEdit && !(disabled || readOnly)) {
    const editCol: ColumnType<T> = {
      title: '🖊',
      dataIndex: '__edit__',
      render: (_: any, record: T) => <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)} />,
      align: 'center',
      width: 50
    };
    const idIndex = mergedCols.findIndex(col => ['id', 'key'].includes(col.dataIndex as string));
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
      <Table<T>
        dataSource={data}
        columns={mergedCols}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell
          }
        }}
        rowKey={rowKey}
        loading={loading}
        footer={typeof footer === 'function' ? (footer as any) : footer ? () => footer : undefined}
        tableLayout='auto'
        size={tableProps?.size || (isMobile ? 'small' : 'middle')}
        scroll={tableProps?.scroll || { x: 'max-content', y: 'max-content' }}
        {...tableProps}
      />
    </div>
  );
};

export default MTable;
