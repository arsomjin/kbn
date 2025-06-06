/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import EditableCellTable from 'components/EditableCellTable';
import { columns, expandedRowRender } from './api';

const ImportList = ({ originData, onSelect, onDelete, noItemChecked, reset }) => {
  const [selecteds, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [reset]);

  const selectRow = record => {
    const selectedRowKeys = [...selecteds];
    if (selectedRowKeys.indexOf(record.key) >= 0) {
      selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
    } else {
      selectedRowKeys.push(record.key);
    }
    setSelected(selectedRowKeys);
  };

  const _onSelect = selects => {
    setSelected(selects);
    onSelect && onSelect(selects);
  };

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys: selecteds,
    onChange: (selectedRowKeys, selectedRows) => {
      _onSelect(selectedRowKeys);
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: record => ({
      disabled: record.deleted === true,
      // Column configuration not to be checked
      name: record.name
    })
  };

  const onDeleteItem = dKey => {
    onDelete && onDelete(dKey);
    // let nData = [...data];
    // nData = nData.filter((l) => l.key !== dKey);
    // nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
    // onSubmit && onSubmit(nData);
  };

  const selection = {
    selections: [
      {
        key: 'allInPage',
        text: 'เลือกหน้านี้',
        onSelect: changableRowKeys => {
          _onSelect([...selecteds, ...changableRowKeys]);
        }
      },
      {
        key: 'all',
        text: 'เลือกทั้งหมด',
        onSelect: changableRowKeys => {
          //  showLog({ changableRowKeys, originData });
          let allKeys = originData.map(l => l.key);
          _onSelect(allKeys);
        }
      },
      {
        key: 'clearInPage',
        text: 'ไม่เลือกหน้านี้',
        onSelect: changableRowKeys => {
          //  showLog({ changableRowKeys, originData });
          let remainKeys = selecteds.filter(l => !changableRowKeys.includes(l));
          _onSelect(remainKeys);
        }
      },
      {
        key: 'clearAll',
        text: 'ไม่เลือกทั้งหมด',
        onSelect: changableRowKeys => {
          _onSelect([]);
        }
      }
    ]
  };

  const hasSelected = selecteds.length > 0;

  const header = () => (
    <h6 className={noItemChecked ? 'm-0 text-danger' : 'm-0'}>
      {hasSelected ? `ตรวจสอบ ${selecteds.length} จาก ${originData.length} รายการ` : 'ตรวจสอบรายการสินค้า'}
    </h6>
  );

  const footer = () => (
    <h6 className="m-0">{hasSelected ? `ตรวจสอบ ${selecteds.length} จาก ${originData.length} รายการ` : ''}</h6>
  );

  const mRowSelection = originData.length > 10 ? { ...rowSelection, ...selection } : rowSelection;

  return (
    <EditableCellTable
      rowSelection={{
        type: 'checkbox',
        ...mRowSelection
      }}
      columns={columns}
      dataSource={originData}
      title={header}
      footer={footer}
      expandable={{
        expandedRowRender,
        rowExpandable: record => record.name !== 'Not Expandable'
      }}
      onRow={(record, rowIndex) => {
        return {
          onClick: () => selectRow(record)
        };
      }}
      onDelete={onDeleteItem}
    />
  );
};

export default ImportList;
