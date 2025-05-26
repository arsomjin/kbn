import { showWarn } from 'functions';
import { formatPaymentItemData } from 'Modules/Utils';
import React, { useEffect, useState } from 'react';
import MTable from 'components/Table';
import { TableSummary } from './Table/helper';

export default ({ value, onChange, disabled, byCustomer, permanentDelete = false, ...props }) => {
  const initPaymentItem = {
    key: 0,
    id: 0,
    paymentType: 'cash',
    amount: null,
    ...(byCustomer ? { customer: null, customerName: null } : { person: null, personName: null }),
    selfBank: null
  };

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    // Initialize table data from props
    const initData = value.map((item, i) => ({
      ...item,
      key: i.toString(),
      id: i
    }));
    setData(initData);
  }, [value]);

  const handleDataChange = async (arr, dataIndex, rowIndex) => {
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
    <div style={{ width: '100%' }}>
      <MTable
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
        canAdd={!disabled}
        onChange={handleDataChange}
        permanentDelete={permanentDelete}
        defaultRowItem={initPaymentItem}
        disabled={disabled}
        tableProps={{
          pagination: false,
          bordered: true,
          tableLayout: 'auto',
          scroll: { x: 'max-content' },
          summary: pageData => (
            <TableSummary pageData={pageData} dataLength={data.length} startAt={1} sumKeys={['amount']} />
          ),
          rowClassName: (record, index) => (record?.deleted ? 'deleted-row' : '')
        }}
      />
    </div>
  );
};
