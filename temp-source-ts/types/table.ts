import { FormInstance } from 'antd';
import { Rule } from 'antd/es/form';
import { ReactNode } from 'react';

export interface TableBaseRecord {
  key: string;
  [key: string]: any;
}

export interface TableColumnConfig<T extends TableBaseRecord> {
  title: ReactNode;
  dataIndex: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  editable?: boolean;
  required?: boolean;
  number?: boolean;
  inputType?: 'text' | 'number' | 'select' | 'date' | 'status';
  rules?: Rule[];
  render?: (text: any, record: T) => ReactNode;
  children?: TableColumnConfig<T>[];
}

export interface TableContext {
  form: FormInstance;
}

export interface TableEventHandlers<T extends TableBaseRecord> {
  onKeyDown?: (key: string, dataIndex: string) => void;
  onBlur?: (dataIndex: string) => void;
  onSelect?: () => void;
  onSave?: (record: T) => void;
}

export interface TableState {
  editingKey: string;
}

export interface EditableRowProps {
  index: number;
  [key: string]: any;
}

export interface EditableCellProps<T extends TableBaseRecord> {
  title: ReactNode;
  editable?: boolean;
  children: ReactNode;
  dataIndex: string;
  record: T;
  handleSave: (record: T) => void;
  inputType?: string;
  rules?: Rule[];
  required?: boolean;
}

export interface GetInputNodeProps {
  dataIndex: string;
  number?: boolean;
  ref?: React.RefObject<any>;
  save?: (value: any) => void;
  size?: 'small' | 'middle' | 'large';
  record?: any;
  onBlur?: () => void;
  path?: string;
}

export interface GetRenderColumnsProps {
  columns: TableColumnConfig<any>[];
  handleSave?: (record: any) => void;
  db: {
    dealers: Record<string, any>;
    branches: Record<string, any>;
    banks: Record<string, any>;
    departments: Record<string, any>;
    userGroups: Record<string, any>;
    expenseCategories: Record<string, any>;
    employees: Record<string, any>;
    executives: Record<string, any>;
    expenseAccountNames: Record<string, any>;
  };
  isEditing?: (record: any) => boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, dataIndex: string) => void;
  onBlur?: (dataIndex: string) => void;
  size?: 'small' | 'middle' | 'large';
}

export interface GetColumnsProps {
  columns: TableColumnConfig<any>[];
  handleDelete?: (key: string) => void;
  handleSave?: (record: any) => void;
  handleSelect?: (record: any) => void;
  handleEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  isEditing?: (record: any) => boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, dataIndex: string) => void;
  onBlur?: (dataIndex: string) => void;
  size?: 'small' | 'middle' | 'large';
  hasChevron?: boolean;
  hasEdit?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  deletedButtonAtEnd?: boolean;
}

export interface CreateValidatorProps {
  dataIndex: string;
  number?: boolean;
  getFieldValue: (field: string) => any;
}

export interface TableSummaryProps {
  columns: TableColumnConfig<any>[];
  data: any[];
  sumKeys?: string[];
  align?: 'left' | 'right' | 'center';
  noDecimal?: boolean;
}

export interface GetRulesProps {
  rules: (string | { pattern: RegExp; message?: string } | { minLength: number; message?: string })[];
}

export interface GetIndexFromColumnsProps {
  columns: TableColumnConfig<any>[];
  startAt?: number;
}

export interface GetColumnDataIndexProps {
  columns: TableColumnConfig<any>[];
  startAt?: number;
}

export interface GetColumnTitlesProps {
  columns: TableColumnConfig<any>[];
  startAt?: number;
}
