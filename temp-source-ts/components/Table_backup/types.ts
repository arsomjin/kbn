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

export interface EditableContextType {
  form: FormInstance;
}

export type TableColumnConfig<T> = {
  title: React.ReactNode;
  dataIndex: string;
  key?: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  editable?: boolean;
  required?: boolean;
  number?: boolean;
  inputType?: 'text' | 'number' | 'select' | 'date' | 'status';
  rules?: any[];
  render?: (text: any, record: any) => React.ReactNode;
  children?: TableColumnConfig<T>[];
  onCell?: (record: T) => any;
  ellipsis?: boolean;
  sorter?: boolean | ((a: T, b: T) => number);
  defaultSortOrder?: 'ascend' | 'descend';
  sortDirections?: ('ascend' | 'descend')[];
  showSorterTooltip?: boolean;
  filters?: { text: string; value: string }[];
  onFilter?: (value: string, record: T) => boolean;
  filterMultiple?: boolean;
  filterMode?: 'menu' | 'tree';
  filterSearch?: boolean;
  filteredValue?: string[];
  defaultFilteredValue?: string[];
  fixed?: boolean | 'left' | 'right';
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  onHeaderCell?: (column: TableColumnConfig<T>) => any;
};

export type MTableProps = {
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
  tableProps?: any;
  provinceId?: string;
  editMode?: 'cell' | 'row' | 'inline';
  forceValidate?: boolean;
  scroll?: any;
  size?: 'small' | 'middle' | 'large';
  locale?: any;
  footer?: React.ReactNode;
  noScroll?: boolean;
  miniAddButton?: boolean;
  rowClassName?: string | ((record: TableData) => string);
  pagination?: any;
  initialItemValues?: Partial<TableData>;
  onAdd?: () => void;
};

export const asReactChild = (content: React.ReactNode): React.ReactNode => {
  if (typeof content === 'string') {
    return React.createElement('span', null, content);
  }
  return content;
};
