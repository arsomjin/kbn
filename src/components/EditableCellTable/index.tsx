import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PanelRender } from 'rc-table/lib/interface';
import { PlusOutlined } from '@ant-design/icons';
import { EditableEachCell } from 'api/Table/EditableEachCell';
import EditableRow from 'components/Table/EditableRow';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TableData, TableContext } from 'components/Table/types';
import { getRenderColumns } from 'components/Table/helper';
import { Numb } from 'utils/functions';

interface EditableCellTableProps extends Omit<TableProps<TableData>, 'columns' | 'footer'> {
  columns: ColumnsType<TableData>;
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
  const { t } = useTranslation();
  const { dealers, branches, departments, userGroups, banks, expenseCategories, employees, executives, expenseAccountNames } = useSelector((state: any) => state.data);
  const [data, setData] = useState<TableData[]>(dataSource);
  const [count, setCount] = useState<number>(dataSource.length);

  useEffect(() => {
    setData(dataSource);
    setCount(dataSource.length);
  }, [dataSource]);

  const handleAdd = () => {
    onAdd?.(count);
  };

  const handleSave = (row: TableData) => {
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

  const tableContext: TableContext = {
    dealers,
    branches,
    departments,
    userGroups,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  };

  const mColumns = getRenderColumns(columns, tableContext, handleSave, null, () => {});

  const totalWidth = mColumns.reduce((sum: number, elem: { width?: number | string }) => sum + Numb(elem.width), 0);
  const tableWidth = typeof totalWidth === 'number' && totalWidth > 100 ? '100%' : totalWidth;

  const defaultFooter: PanelRender<TableData> = () => (
    <Button
      onClick={handleAdd}
      className="my-2"
      icon={<PlusOutlined />}
    >
      {t('common.addItem')}
    </Button>
  );

  return (
    <Table
      components={components}
      dataSource={data}
      columns={mColumns}
      scroll={noScroll ? undefined : scroll ? { x: tableWidth, y: 400, ...scroll } : { x: tableWidth, y: 400 }}
      size={size || 'small'}
      locale={locale || { emptyText: t('common.noData') }}
      rowClassName={
        rowClassName ||
        ((record) =>
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
          ? footer
          : typeof onAdd !== 'undefined'
            ? defaultFooter
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