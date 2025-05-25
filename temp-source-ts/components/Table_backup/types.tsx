import React from 'react';
import type { ColumnType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import type { PanelRender } from 'rc-table/lib/interface';

export interface TableData {
  key: string;
  [key: string]: any;
}

export interface EditingCell {
  key: string;
  dataIndex: string;
}

export type CustomColumnType<T> = ColumnType<T> & {
  editable?: boolean;
  number?: boolean;
  required?: boolean;
  titleAlign?: 'left' | 'right' | 'center';
  title?: React.ReactNode | ((props: {}) => React.ReactNode);
};

export type CustomColumnsType<T> = (CustomColumnType<T> & {
  children?: CustomColumnsType<T>;
})[];

export interface EditableCellProps {
  record: TableData;
  dataIndex: string;
  title: React.ReactNode;
  children: React.ReactNode;
  editable?: boolean;
  handleSave?: (record: TableData) => void;
  columns?: CustomColumnsType<TableData>;
  editingCell?: EditingCell | null;
  setEditingCell?: (cell: EditingCell | null) => void;
  rowKey?: string;
  rowIndex?: number;
  colIndex?: number;
  align?: 'left' | 'right' | 'center';
  [key: string]: any;
}

export interface EditableRowProps {
  index: number;
  [key: string]: any;
}

export type TableColumnConfig<T> = ColumnType<T> & {
  title: React.ReactNode;
  dataIndex: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  editable?: boolean;
  required?: boolean;
  number?: boolean;
  inputType?: 'text' | 'number' | 'select' | 'date' | 'status';
  rules?: any[];
  render?: (text: any, record: any) => React.ReactNode;
  children?: TableColumnConfig<T>[];
};
