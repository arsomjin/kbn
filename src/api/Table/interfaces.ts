import { ReactNode } from 'react';
import { Rule } from 'antd/lib/form';

export interface TableRecord {
  key: string;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  [key: string]: any;
}

export interface TableColumn {
  title: ReactNode;
  dataIndex: string;
  key?: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  editable?: boolean;
  required?: boolean;
  number?: boolean;
  children?: TableColumn[];
  render?: (text: any, record: TableRecord) => ReactNode;
}

export type ValidationRule = Rule & {
  validator?: (rule: Rule, value: any) => Promise<void>;
};

export interface TableCell {
  record: TableRecord;
  dataIndex: string;
  title: string;
  editing?: boolean;
  editable?: boolean;
  index?: number;
  children?: ReactNode;
  [key: string]: any;
}

export interface TableContext {
  handleSave?: (record: TableRecord) => void;
  handleDelete?: (key: string) => void;
  handleAdd?: () => void;
  handleEdit?: (record: TableRecord) => void;
  isEditing?: (record: TableRecord) => boolean;
  onKeyDown?: (key: string, dataIndex: string) => void;
  onBlur?: (dataIndex: string) => void;
  size?: 'small' | 'middle' | 'large';
}

export interface ConstantMap {
  [key: string]: string;
}
