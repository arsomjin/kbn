import { FormInstance } from 'antd';
import { ColumnsType, ColumnType as AntColumnType, ColumnGroupType as AntColumnGroupType } from 'antd/es/table';
import { ReactNode } from 'react';

export interface TableData {
  key: string;
  id?: number;
  _key?: string;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  provinceId?: string;
  transferCompleted?: boolean;
  [key: string]: unknown;
}

export interface EditingCell {
  key: string;
  dataIndex: string;
}

// Extended column types with our custom properties
export interface CustomColumnType<T> extends AntColumnType<T> {
  editable?: boolean;
  dataIndex?: string | number;
  children?: CustomColumnType<T>[];
}

export interface CustomColumnGroupType<T> extends AntColumnGroupType<T> {
  editable?: boolean;
  children: CustomColumnType<T>[];
}

export type CustomColumnsType<T> = (CustomColumnType<T> | CustomColumnGroupType<T>)[];

// Type assertion helper
export function asReactChild(value: any): ReactNode {
  return value as ReactNode;
}

export interface EditableCellProps {
  record: TableData;
  dataIndex: string;
  title: any;
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

export interface MTableProps {
  columns: CustomColumnsType<TableData>;
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
  
  // Extended props from EditableCellTable and EditableRowTable
  editMode?: 'cell' | 'row' | 'inline'; // Table editing mode
  forceValidate?: boolean | number;     // Force validation on save
  scroll?: { x?: number | string; y?: number | string }; // Table scroll configuration
  size?: 'small' | 'middle' | 'large';  // Table size
  locale?: Record<string, any>;         // Table locale configuration
  footer?: (() => ReactNode) | undefined; // Table footer
  noScroll?: boolean;                   // Disable automatic scroll calculation
  miniAddButton?: boolean;              // Use smaller add button
  rowClassName?: string | ((record: TableData, index: number) => string); // Row class name
  pagination?: any;                     // Pagination configuration
  initialItemValues?: Record<string, any>; // Initial values for new rows
  onAdd?: () => void;                   // Legacy support for onAdd function
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