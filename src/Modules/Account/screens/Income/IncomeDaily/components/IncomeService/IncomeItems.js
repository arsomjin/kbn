import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { tableScroll } from 'data/Constant';
import { Form, Input, Select, Button } from 'antd';
import { getRules } from 'api/Table';
import { Numb } from 'functions';

const { Option } = Select;

const initItem = {
  item: '',
  description: '',
  status: 'Complete',
  _key: '',
};

const IncomeItems = ({ incomeId, items, onChange, disabled }) => {
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (items && items.length > 0) {
      setData(items.map((item, index) => ({ ...item, key: index, id: index })));
    } else {
      setData([]);
    }
  }, [items]);

  const onAddNewItem = async () => {
    try {
      const lastNo = items.length || 0;
      const padLastNo = String(lastNo + 1).padStart(3, '0');
      const incomeItemId = `INV-SV-ITEM${dayjs().format('YYYYMMDD')}${padLastNo}`;

      let newItem = {
        incomeItemId,
        incomeId,
        key: items.length,
        id: items.length,
      };
      const nData = [...items, newItem];
      onChange(nData);
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
      size='small'
    />
  );
};

export default IncomeItems;
