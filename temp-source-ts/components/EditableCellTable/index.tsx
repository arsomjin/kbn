import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import type { TablePaginationConfig, ColumnsType, ColumnType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { h } from '../../api';
import { EditableEachCell } from 'api/Table/EditableEachCell';
import { GetColumns, EditableRow } from '../../api/Table';
import { Numb } from '../../utils/functions';
import { TableBaseRecord, TableColumnConfig } from '../../types/table';

interface EditableCellTableProps {
  columns: TableColumnConfig<TableBaseRecord>[];
  dataSource: TableBaseRecord[];
  onAdd?: (count: number) => void;
  onUpdate?: (record: TableBaseRecord) => void;
  onDelete?: (key: string) => void;
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  size?: 'small' | 'middle' | 'large';
  locale?: {
    emptyText: string;
  };
  footer?: (data: readonly TableBaseRecord[]) => React.ReactNode;
  hasChevron?: boolean;
  hasEdit?: boolean;
  handleEdit?: (record: TableBaseRecord) => void;
  handleSelect?: (record: TableBaseRecord) => void;
  rowClassName?: string | ((record: TableBaseRecord, index: number) => string);
  pagination?: false | TablePaginationConfig;
  noScroll?: boolean;
  [key: string]: any;
}

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
  const { dealers } = useSelector((state: any) => state.data);
  const [data, setData] = useState<TableBaseRecord[]>(dataSource);
  const [count, setCount] = useState<number>(dataSource.length);

  useEffect(() => {
    setData(dataSource);
    setCount(dataSource.length);
  }, [dataSource]);

  const handleAdd = () => {
    onAdd?.(count);
  };

  const handleSave = (row: TableBaseRecord) => {
    const mRow = { ...row };
    Object.keys(row).forEach(k => {
      if (row[k] === undefined) {
        mRow[k] = null;
      }
    });
    onUpdate?.(mRow);
  };

  const handleDelete = (deleteKey: string) => {
    onDelete?.(deleteKey);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableEachCell
    }
  };

  const mColumns = GetColumns({
    columns: columns as any[],
    handleDelete,
    handleSave,
    onDelete,
    hasChevron,
    hasEdit,
    handleEdit,
    handleSelect
  }) as ColumnsType<TableBaseRecord>;

  const totalWidth = mColumns.reduce((sum: number, col: ColumnType<TableBaseRecord>) => {
    const width = typeof col.width === 'number' ? col.width : 0;
    return sum + width;
  }, 0);

  const tableWidth = totalWidth > 100 ? '100%' : totalWidth;

  return (
    <Table<TableBaseRecord>
      components={components}
      dataSource={data}
      columns={mColumns}
      scroll={noScroll ? undefined : scroll ? { x: tableWidth, y: h(40), ...scroll } : { x: tableWidth, y: h(40) }}
      size={size || 'small'}
      locale={locale || { emptyText: 'ไม่มีข้อมูล' }}
      rowClassName={
        rowClassName ||
        ((record, index) =>
          record?.deleted
            ? 'deleted-row'
            : record?.transferCompleted
              ? 'completed-row'
              : record?.rejected
                ? 'rejected-row'
                : 'editable-row')
      }
      bordered
      footer={
        typeof footer !== 'undefined'
          ? data => footer(data)
          : typeof onAdd !== 'undefined'
            ? () => (
                <Button onClick={handleAdd} className='my-2' icon={<PlusOutlined />}>
                  เพิ่มรายการ
                </Button>
              )
            : undefined
      }
      pagination={
        typeof pagination !== 'undefined'
          ? pagination
          : {
              showSizeChanger: true
            }
      }
      {...tableProps}
    />
  );
};

export default EditableCellTable;
