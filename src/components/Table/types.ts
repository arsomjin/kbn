import { FormInstance } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ReactNode } from 'react';

export interface TableData {
  key: string;
  id?: number;
  _key?: string;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  provinceId?: string;
  [key: string]: unknown;
}

export interface EditingCell {
  key: string;
  dataIndex: string;
}

export interface EditableCellProps {
  record: TableData;
  dataIndex: string;
  title: string;
  children: ReactNode;
  editable?: boolean;
  handleSave: (record: TableData, dataIndex: string, rowIndex: number) => void;
  columns: ColumnsType<TableData>;
  editingCell: EditingCell | null;
  setEditingCell: (cell: EditingCell | null) => void;
  rowKey: string;
  rowIndex: number;
  colIndex: number;
  align?: 'left' | 'center' | 'right';
}

export interface EditableRowProps {
  index: number;
  [key: string]: unknown;
}

export interface ReusableEditableTableProps {
  columns: ColumnsType<TableData>;
  dataSource: TableData[];
  onChange?: (data: TableData[], dataIndex: string | null, rowIndex: number) => void;
  defaultRowItem?: Partial<TableData>;
  readOnly?: boolean;
  canDelete?: boolean | ((key: string) => Promise<TableData[]>);
  canAdd?: boolean | ((data: TableData[]) => Promise<TableData[]>);
  canEdit?: boolean | ((record: TableData, dataIndex: string | null, rowIndex: number) => void);
  permanentDelete?: boolean;
  disabled?: boolean;
  tableProps?: Record<string, unknown>;
  provinceId?: string;
}

export interface TableContext {
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  userGroups: Array<{ id: string; name: string }>;
  dealers: Array<{ id: string; name: string }>;
  banks: Array<{ id: string; name: string }>;
  expenseCategories: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; name: string }>;
  executives: Array<{ id: string; name: string }>;
  expenseAccountNames: Array<{ id: string; name: string }>;
}

export interface EditableContextType {
  form: FormInstance;
} 