import React from 'react';
import MTable from '../Table';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableData, CustomColumnsType } from '../Table/types';

interface EditableRowTableProps {
  columns: CustomColumnsType<TableData>;
  dataSource: TableData[];
  scroll?: { x?: number | string; y?: number | string };
  size?: 'small' | 'middle' | 'large';
  locale?: Record<string, string>;
  footer?: (() => React.ReactNode) | undefined;
  initialItemValues?: Record<string, any>;
  onAdd?: (data: TableData[]) => void;
  onDelete?: (key: string | number) => void;
  onUpdate?: (data: TableData[], dataIndex: string | null, rowIndex: string | number) => void;
  forceValidate?: boolean | number;
  noScroll?: boolean;
  pagination?: any;
  miniAddButton?: boolean;
  handleEdit?: (record: TableData) => void;
  handleSelect?: (record: TableData) => void;
  disabled?: boolean;
  readOnly?: boolean;
  rowClassName?: string | ((record: TableData, index: number) => string);
  deletedButtonAtEnd?: boolean;
  [key: string]: any;
}

/**
 * EditableRowTable - Legacy shim that uses the unified MTable component
 * with row-based editing mode
 */
const EditableRowTable: React.FC<EditableRowTableProps> = ({
  columns,
  dataSource,
  scroll,
  size,
  locale,
  footer,
  initialItemValues = {},
  onAdd,
  onDelete,
  onUpdate,
  forceValidate,
  noScroll,
  pagination,
  miniAddButton,
  handleEdit,
  handleSelect,
  disabled,
  readOnly,
  rowClassName,
  deletedButtonAtEnd,
  ...tableProps
}) => {
  // Create handlers compatible with MTable's expected types
  const handleAdd = onAdd ? 
    async (data: TableData[]) => {
      onAdd(data);
      return data;
    } : 
    false;
    
  const handleDelete = onDelete ?
    async (key: string) => {
      onDelete(key);
      // We need to return the data after deletion, but since this is a shim,
      // we'll just filter out the deleted item from dataSource
      return dataSource.filter(item => item.key !== key);
    } :
    false;

  const editHandler = handleEdit || false;

  return (
    <MTable
      columns={columns}
      dataSource={dataSource}
      canAdd={handleAdd}
      onChange={onUpdate}
      canDelete={handleDelete}
      canEdit={editHandler}
      editMode="row"
      forceValidate={forceValidate}
      scroll={scroll}
      size={size}
      locale={locale}
      footer={footer}
      noScroll={noScroll}
      miniAddButton={miniAddButton}
      pagination={pagination}
      rowClassName={rowClassName}
      disabled={disabled}
      readOnly={readOnly}
      initialItemValues={initialItemValues}
      tableProps={tableProps}
    />
  );
};

export default EditableRowTable;
