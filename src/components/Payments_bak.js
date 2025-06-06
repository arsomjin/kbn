import { showWarn } from 'functions';
import { formatPaymentItemData } from 'Modules/Utils';
import React, { useEffect, useState } from 'react';
import EditableRowTable from './EditableRowTable';

export default ({ value, onChange, disabled, byCustomer, ...props }) => {
  const initPaymentItem = {
    key: 0,
    id: 0,
    paymentType: 'cash',
    amount: null,
    ...(byCustomer ? { customer: null, customerName: null } : { person: null, personName: null }),
    selfBank: null
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.length === 0) {
      onChange && onChange([initPaymentItem]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddNewItem = () => {
    onChange && onChange(value.concat([{ ...initPaymentItem, key: value.length, id: value.length }]));
  };
  const onDeleteItem = dKey => {
    let nData = [...value];
    nData = nData.filter(l => l.key !== dKey);
    nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
    onUpdateItem(nData);
  };

  const onUpdateItem = async (arr, dataIndex, rowIndex) => {
    try {
      // showLog({ arr, dataIndex, rowIndex });
      // setData(dArr);
      if (dataIndex && ['customer'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await formatPaymentItemData(arr, dataIndex, rowIndex);
        setLoading(false);
        //  showLog({ formatArr });
        onChange && onChange(formatArr);
      } else {
        onChange && onChange(arr);
      }
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  return (
    <EditableRowTable
      dataSource={value}
      columns={[
        {
          title: 'ลำดับ',
          dataIndex: 'id',
          align: 'center'
        },
        {
          title: 'ประเภท',
          dataIndex: 'paymentType',
          required: true,
          editable: !disabled,
          align: 'center'
        },
        {
          title: 'จำนวนเงิน',
          dataIndex: 'amount',
          number: true,
          required: true,
          align: 'right',
          editable: !disabled
        },
        {
          title: 'ธนาคาร',
          dataIndex: 'selfBank',
          ellipsis: true,
          editable: !disabled,
          align: 'center'
        },
        {
          title: 'วิธีโอนเงิน',
          dataIndex: 'paymentMethod',
          ellipsis: true,
          editable: !disabled,
          align: 'center'
        },
        {
          title: byCustomer ? 'ลูกค้า' : 'ผู้โอน/ฝากเงิน',
          dataIndex: byCustomer ? 'customer' : 'person',
          editable: !disabled,
          align: 'center'
        }
      ]}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      size="small"
      miniAddButton
      deletedButtonAtEnd
      pagination={false}
      scroll={{ x: 320, y: 320 }}
      disabled={disabled}
      loading={loading}
      {...props}
    />
  );
};
