import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import { h } from 'api';
import { PlusOutlined } from '@ant-design/icons';
import { EditableEachCell } from 'api/Table/EditableEachCell';
import { GetColumns, EditableRow } from 'api/Table';
import { useSelector } from 'react-redux';
import { Numb } from 'functions';

const EditableCellTable = ({
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
  const { dealers } = useSelector(state => state.data);
  const [data, setData] = useState(dataSource);
  const [count, setCount] = useState([dataSource.length]);

  useEffect(() => {
    setData(dataSource);
    setCount(dataSource.length);
  }, [dataSource]);

  const handleAdd = () => {
    onAdd && onAdd(count);
  };

  const handleSave = row => {
    let mRow = { ...row };
    Object.keys(row).map(k => {
      if (row[k] === undefined) {
        mRow[k] = null;
      }
      return mRow;
    });
    onUpdate && onUpdate(mRow);
  };

  const handleDelete = deleteKey => {
    onDelete && onDelete(deleteKey);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableEachCell
    }
  };

  let mColumns = GetColumns({
    columns,
    handleDelete,
    handleSave,
    onDelete,
    dealers,
    hasChevron,
    hasEdit,
    handleEdit,
    handleSelect
  });

  // showLog({ width: w(100), height: h(100) }); 1200 x 800
  let totalWidth = mColumns.reduce((sum, elem) => sum + Numb(elem.width), 0);
  let tableWidth = totalWidth > '100%' ? '100%' : totalWidth;

  return (
    <Table
      components={components}
      dataSource={data}
      columns={mColumns}
      scroll={noScroll ? undefined : scroll ? { x: tableWidth, y: h(40), ...scroll } : { x: tableWidth, y: h(40) }}
      size={size || 'small'}
      locale={locale || { emptyText: 'ไม่มีข้อมูล' }}
      rowClassName={
        rowClassName ||
        ((record, index) =>
          !!record?.deleted
            ? 'deleted-row'
            : !!record?.transferCompleted
              ? 'completed-row'
              : !!record?.rejected
                ? 'rejected-row'
                : 'editable-row')
      }
      bordered
      footer={
        typeof footer !== 'undefined'
          ? footer
          : typeof onAdd !== 'undefined'
            ? () => (
                <Button
                  onClick={handleAdd}
                  // type="primary"
                  className="my-2"
                  icon={<PlusOutlined />}
                >
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
