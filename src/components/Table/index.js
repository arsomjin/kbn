import React, { useState, useEffect } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { getRenderColumns } from './helper';
import { useSelector } from 'react-redux';

import './table.css';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { showLog } from 'functions';

// Example shape for a new row (optional)
const defaultNewRow = {};

const ReusableEditableTable = ({
  columns = [],
  dataSource = [],
  onChange,
  defaultRowItem = defaultNewRow, // optional
  readOnly = false,
  canDelete = false,
  canAdd = false,
  canEdit = false,
  permanentDelete = false,
  disabled = false,
  tableProps = {} // pass additional antd table props
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [data, setData] = useState([]);
  const {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  } = useSelector(state => state.data);

  // On mount or whenever dataSource changes, initialize local state
  useEffect(() => {
    console.log({ dataSource });
    const initData = dataSource.map((item, idx) => ({
      ...item,
      key: item.key || idx.toString()
    }));
    setData(initData);
  }, [dataSource]);

  // Called by each cell after user finishes editing.
  // Now it also accepts dataIndex and rowIndex and passes them to the onChange callback.
  const handleSave = (updatedRow, dataIndex, rowIndex) => {
    const newData = [...data];
    const index = newData.findIndex(row => row.key === updatedRow.key);
    if (index > -1) {
      newData[index] = updatedRow;
      setData(newData);
      onChange && onChange(newData, dataIndex, rowIndex);
    }
  };

  // Add a new row to the table
  const handleAdd = async () => {
    if (disabled) return;
    if (typeof canAdd === 'function') {
      try {
        const newData = await canAdd(data);
        setData(newData);
        onChange && onChange(newData, null, -1); // explicit recalculation
      } catch (err) {
        console.error(err);
      }
    } else {
      const newKey = `${Date.now()}`;
      const newRow = {
        ...defaultRowItem,
        _key: newKey,
        key: data.length,
        id: data.length
      };
      const newData = [...data, newRow];
      setData(newData);
      onChange && onChange(newData, null, -1); // explicit recalculation
    }
  };

  // Delete a row
  const handleDelete = async key => {
    // Override delete function.
    if (typeof canDelete === 'function') {
      const newData = await canDelete(key);
      setData(newData);
      onChange && onChange(newData, null, -1); // explicit recalculation
      return;
    }

    // Clone the current data array
    let newData = [...data];

    if (!permanentDelete) {
      // Find the record by key
      const index = newData.findIndex(item => item.key === key);

      if (index > -1) {
        // Set deleted: true
        newData[index].deleted = true;
      }
    } else {
      newData = data.filter(item => item.key !== key);
    }

    // Update local state
    setData(newData);

    // Trigger parent onChange if defined
    onChange && onChange(newData, null, -1);
  };

  const handleEdit = async record => {
    const cannotEdit = record?.deleted || record?.rejected || record?.completed;
    const rowIndex = data.findIndex(r => r.key === record.key);
    if (!cannotEdit && typeof canEdit === 'function') {
      canEdit(record, null, rowIndex);
    }
  };

  // Prepare object for getRenderColumns
  const db = {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  };

  // Instead of mapping columns manually, call getRenderColumns:
  const mergedCols = getRenderColumns(columns, db, handleSave, editingCell, setEditingCell);

  // Optionally insert a 'Delete' column if canDelete is true
  if (canDelete && !readOnly && !disabled) {
    mergedCols.push({
      title: 'ลบ',
      dataIndex: '__delete__',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="ยืนยันการลบ?"
          onConfirm={() => handleDelete(record.key)}
          okText="ตกลง"
          cancelText="ยกเลิก"
          overlayClassName="my-popconfirm"
        >
          <DeleteOutlined className="text-danger mb-2" />
        </Popconfirm>
      )
    });
  }

  if (canEdit && !(disabled || readOnly)) {
    const editCol = {
      title: '🖊',
      dataIndex: '__edit__',
      key: 'editColumn',
      render: (_, record) => <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />,
      align: 'center',
      width: 50
    };

    // Place it right next to "id" or "key" if that column exists
    const idIndex = mergedCols.findIndex(col => ['id', 'key'].includes(col.dataIndex));
    if (idIndex > -1) {
      mergedCols.splice(idIndex + 1, 0, editCol);
    } else {
      mergedCols.push(editCol);
    }
  }

  return (
    <div>
      {canAdd && !readOnly && !disabled && (
        <Button onClick={handleAdd} style={{ margin: 8 }}>
          + เพิ่มรายการ
        </Button>
      )}
      <Table
        dataSource={data}
        columns={mergedCols}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell
          }
        }}
        pagination={false}
        tableLayout="auto" // flexible column widths
        size="small"
        {...tableProps}
      />
    </div>
  );
};

export default ReusableEditableTable;
