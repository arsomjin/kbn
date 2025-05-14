import React, { useEffect, useState } from 'react';
import moment from 'moment';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { tableScroll } from 'data/Constant';

const initItem = {
  item: '',
  description: '',
  status: 'Complete',
  _key: '',
};

const IncomeItems = ({ incomeId, items, onChange, disabled }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

  const onAddNewItem = async (dArr) => {
    try {
      const lastNo = parseInt(Math.floor(Math.random() * 10000));
      const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
      const incomeItemId = `INV-SV-ITEM${moment().format(
        'YYYYMMDD'
      )}${padLastNo}`;

      let newItem = {
        ...initItem,
        incomeItemId,
        incomeId,
        key: dArr.length,
        id: dArr.length,
      };
      const nData = [...dArr, newItem];
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e);
    }
  };

  const onDeleteItem = async (dKey) => {
    try {
      let nData = [...data];
      nData = nData.filter((l) => l.key !== dKey);
      nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e);
    }
  };

  const onUpdateItem = async (dArr) => {
    try {
      //  showLog({ dArr });
      // setData(dArr);
      onChange && onChange(dArr);
    } catch (e) {
      showWarn(e);
    }
  };

  const columns = [
    {
      title: 'ลำดับที่',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center',
    },
    {
      title: 'รายการ',
      dataIndex: 'item',
      editable: !disabled,
      required: true,
    },
  ];

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      scroll={{ ...tableScroll, x: 840 }}
      disabled={disabled}
      miniAddButton
      pagination={false}
      size="small"
    />
  );
};

export default IncomeItems;
