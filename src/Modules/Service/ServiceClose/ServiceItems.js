import React, { useEffect, useState } from 'react';
import moment from 'moment';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { tableScroll } from 'data/Constant';
import { TableSummary } from 'api/Table';
import Text from 'antd/lib/typography/Text';
import { formatServiceItemData } from 'Modules/Utils';

export const initItem = {
  item: '',
  serviceItemType: 'อะไหล่',
  serviceCode: '',
  description: '',
  qty: 1,
  returnQty: null,
  unit: null,
  unitPrice: null,
  discount: null,
  returnDiscount: null,
  returnTotal: null,
  advance: null,
  total: null,
  WR: false,
  FOC: false,
  status: 'Complete',
  discountCouponPercent: 20,
  _key: ''
};

const ServiceItems = ({ serviceId, items, onChange, disabled, readOnly }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

  const onAddNewItem = async dArr => {
    try {
      const lastNo = parseInt(Math.floor(Math.random() * 10000));
      const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
      const serviceItemId = `INV-SV-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;

      let newItem = {
        ...initItem,
        serviceItemId,
        serviceId,
        key: dArr.length,
        id: dArr.length
      };
      const nData = [...dArr, newItem];
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e);
    }
  };

  const onDeleteItem = async dKey => {
    try {
      let nData = [...data];
      nData = nData.filter(l => l.key !== dKey);
      nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e);
    }
  };

  const onUpdateItem = async (arr, dataIndex, rowIndex) => {
    try {
      // showLog({ dArr, editKey });
      // setData(dArr);
      if (dataIndex && ['unitPrice', 'qty', 'serviceCode', 'discount', 'returnQty'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await formatServiceItemData(arr, dataIndex, rowIndex);
        setLoading(false);
        onChange && onChange(formatArr);
      } else {
        onChange && onChange(arr);
      }
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ประเภท',
      dataIndex: 'serviceItemType',
      required: true
    },
    {
      title:
        !disabled && !readOnly ? (
          <span role="img" aria-label="search">
            🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ</Text>
          </span>
        ) : (
          'รหัสสินค้า'
        ),
      ellipsis: true,
      dataIndex: 'serviceCode',
      required: true
    },
    {
      title: 'รายการ',
      dataIndex: 'item',
      required: true
    },
    {
      title: 'เบิก',
      dataIndex: 'qty',
      align: 'center'
    },
    {
      title: 'คืน',
      dataIndex: 'returnQty',
      align: 'center',
      editable: !disabled
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice'
    },
    {
      title: 'ส่วนลด',
      dataIndex: 'discount'
    },
    {
      title: 'ราคารวม',
      dataIndex: 'total'
    },
    {
      title: 'WR',
      dataIndex: 'WR',
      align: 'center',
      width: 80
    },
    {
      title: 'F.O.C',
      dataIndex: 'FOC',
      align: 'center',
      width: 80
    }
  ];

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      // onDelete={onDeleteItem}
      scroll={{ ...tableScroll, x: 840 }}
      disabled={disabled}
      miniAddButton
      pagination={false}
      size="small"
      summary={pageData => (
        <TableSummary pageData={pageData} dataLength={data.length} startAt={6} sumKeys={['discount', 'total']} />
      )}
      loading={loading}
    />
  );
};

export default ServiceItems;
