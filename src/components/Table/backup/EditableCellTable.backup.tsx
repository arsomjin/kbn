import React from 'react';
import MTable from '../Table';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PanelRender } from 'rc-table/lib/interface';
import { TableData, CustomColumnsType } from '../Table/types';

interface EditableCellTableProps extends Omit<TableProps<TableData>, 'columns' | 'footer'> {
  columns: CustomColumnsType<TableData>;
  dataSource: TableData[];
  onAdd?: (count: number) => void;
  onUpdate?: (row: TableData) => void;
  onDelete?: (key: string) => void;
  scroll?: { x?: number | string; y?: number | string };
  size?: 'small' | 'middle' | 'large';
  locale?: TableProps<TableData>['locale'];
  footer?: PanelRender<TableData>;
  hasChevron?: boolean;
  hasEdit?: boolean;
  handleEdit?: (record: TableData) => void;
  handleSelect?: (record: TableData) => void;
  rowClassName?: string | ((record: TableData, index: number) => string);
  pagination?: TableProps<TableData>['pagination'];
  noScroll?: boolean;
}

/**
 * EditableCellTable - Legacy shim that uses the unified MTable component
 * with cell-based editing mode
 */
const EditableCellTable: React.FC<EditableCellTableProps> = ({
  columns,
  dataSource,
  onAdd,
  onUpdate,
  onDelete,
  scroll,
  size,
  locale,
  footer,
  hasChevron,
  hasEdit,
  handleEdit,
  handleSelect,
  rowClassName,
  pagination,
  noScroll,
  ...tableProps
}) => {
  // Create handlers compatible with MTable's expected types
  const handleAdd = onAdd ? 
    async (data: TableData[]) => {
      onAdd(data.length);
      return data; // Return unchanged data as MTable expects Promise<TableData[]>
    } : 
    false;
    
  const handleDelete = onDelete ?
    async (key: string) => {
      onDelete(key);
      return dataSource; // Return original data as MTable expects Promise<TableData[]>
    } :
    false;

  // Convert footer to expected type
  const footerFn = footer ? () => footer(dataSource) : undefined;
  
  return (
    <MTable
      columns={columns}
      dataSource={dataSource}
      canAdd={handleAdd}
      onChange={(data, dataIndex, rowIndex) => {
        if (onUpdate && dataIndex !== null) {
          onUpdate(data[rowIndex]);
        }
      }}
      canDelete={handleDelete}
      canEdit={handleEdit || false}
      editMode="cell"
      scroll={scroll}
      size={size}
      locale={locale}
      footer={footerFn}
      noScroll={noScroll}
      rowClassName={rowClassName}
      pagination={pagination}
      tableProps={tableProps}
    />
  );
};

export default EditableCellTable; 