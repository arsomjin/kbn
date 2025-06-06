/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import EditableCellTable from 'components/EditableCellTable';
import { useSelector } from 'react-redux';
import { TableSummary } from 'api/Table';
import { showMessageBar } from 'functions';
import Text from 'antd/lib/typography/Text';

const ImportList = ({ onSelect, noItemChecked, reset, items }) => {
  const { allEmployees } = useSelector(state => state.data);
  let initData = items.map((l, i) => ({ ...l, id: i, key: i }));

  const [data, setData] = useState(initData);
  const [selecteds, setSelected] = useState([]);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setSelected(initData.filter(l => l.completed).map(k => k.key));
    setData(initData);
  }, [items]);

  useEffect(() => {
    setSelected([]);
  }, [reset]);

  const selectRow = record => {
    if (record.completed) {
      return showMessageBar(
        `รายการนี้ ${record.productCode} ได้ตรวจรับสินค้าแล้วโดย ${
          allEmployees[record.completed.importVerifiedBy].firstName
        }`
      );
    }
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
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name
    })
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
          //  showLog({ changableRowKeys, data });
          let allKeys = data.map(l => l.key);
          _onSelect(allKeys);
        }
      },
      {
        key: 'clearInPage',
        text: 'ไม่เลือกหน้านี้',
        onSelect: changableRowKeys => {
          //  showLog({ changableRowKeys, data });
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

  const columns = [
    {
      title: 'ลำดับที่',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ประเภทสินค้า',
      dataIndex: 'vehicleType',
      // required: true,
      width: 140
    },
    {
      title: (
        <span role="img" aria-label="search">
          🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
        </span>
      ),
      ellipsis: true,
      dataIndex: 'productCode',
      required: true
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      ellipsis: true
    },
    {
      title: 'เลขรถ',
      dataIndex: 'vehicleNo'
      // required: true,
    },
    {
      title: 'เลขเครื่อง',
      dataIndex: 'engineNo'
      // required: true,
    },
    {
      title: 'เลขอุปกรณ์ต่อพ่วง',
      dataIndex: 'peripheralNo'
      // required: true,
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      number: true,
      required: true,
      align: 'center'
    }
  ];

  const header = () => (
    <h6 className={noItemChecked ? 'm-0 text-danger' : 'm-0'}>
      {hasSelected ? `ตรวจสอบ ${selecteds.length} จาก ${data.length} รายการ` : 'ตรวจสอบรายการสินค้า'}
    </h6>
  );

  const footer = () => (
    <h6 className="m-0">{hasSelected ? `ตรวจสอบ ${selecteds.length} จาก ${data.length} รายการ` : ''}</h6>
  );

  const mRowSelection = data.length > 10 ? { ...rowSelection, ...selection } : rowSelection;

  return (
    <EditableCellTable
      rowSelection={{
        type: 'checkbox',
        ...mRowSelection
      }}
      columns={columns}
      dataSource={data}
      title={header}
      footer={footer}
      summary={pageData => <TableSummary pageData={pageData} dataLength={data.length} startAt={7} sumKeys={['qty']} />}
      onRow={(record, rowIndex) => {
        return {
          onClick: () => selectRow(record)
        };
      }}
      rowClassName={(record, index) => {
        //  showLog({ record });
        return record?.deleted
          ? 'deleted-row'
          : record?.completed
            ? 'recorded-row'
            : record?.rejected
              ? 'rejected-row'
              : 'editable-row';
      }}
    />
  );
};

export default ImportList;
