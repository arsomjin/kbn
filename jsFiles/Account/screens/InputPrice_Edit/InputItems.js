import React, { useEffect, useState } from 'react';
import moment from 'moment';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { StatusMap } from 'data/Constant';
import { expandedRowRender } from './api';
import { Numb } from 'functions';

const initItem = {
  productCode: '',
  productName: '',
  peripheralNo: [],
  productType: null,
  detail: '',
  unitPrice: 0,
  qty: 1,
  total: 0,
  status: StatusMap.pending,
  _key: '',
};

const InputItems = ({
  items,
  docId,
  onChange,
  grant,
  readOnly,
  footer,
  noItemUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  let initData = items.map((l, i) => ({ ...l, id: i, key: i }));

  const [data, setData] = useState(initData);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

  const onAddNewItem = async (dArr) => {
    try {
      const lastNo = parseInt(Math.floor(Math.random() * 10000));
      const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
      const itemId = `RES-VH-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;

      let newItem = {
        ...initItem,
        itemId,
        docId,
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

  const _formatItem = (arr, dataIndex, rowIndex) =>
    new Promise(async (r, j) => {
      try {
        // showLog({ arr, dataIndex });
        let newData = [...arr];
        let mItem = { ...arr[rowIndex] };
        if (['unitPrice', 'qty', 'discount'].includes(dataIndex)) {
          mItem.total = (
            Numb(mItem.unitPrice) * Numb(mItem.qty) -
            Numb(mItem.discount)
          ).toFixed(2);
        }
        newData.splice(rowIndex, 1, mItem);
        r(newData);
      } catch (e) {
        j(e);
      }
    });

  const onUpdateItem = async (arr, dataIndex, rowIndex) => {
    try {
      // showLog({ dArr, editKey });
      // setData(dArr);
      if (dataIndex && ['unitPrice', 'qty', 'discount'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await _formatItem(arr, dataIndex, rowIndex);
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

  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center',
    },
    {
      title: 'รหัส',
      dataIndex: 'productCode',
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: 'คลัง',
      dataIndex: 'storeLocationCode',
      align: 'center',
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      align: 'center',
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      align: 'center',
    },
    {
      title: 'ราคา / หน่วย',
      dataIndex: 'unitPrice',
      editable: true,
      required: true,
      number: true,
      width: 160,
    },
    {
      title: 'ส่วนลด',
      dataIndex: 'discount',
      editable: true,
      number: true,
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'total',
    },
  ];

  let startAt = columns.findIndex((l) => l.dataIndex === 'qty');
  // showLog({ startAt, columns });

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      // onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      // scroll={{ ...tableScroll, x: 840 }}
      miniAddButton
      summary={(pageData) => (
        <TableSummary
          pageData={pageData}
          dataLength={data.length}
          startAt={8}
          sumKeys={['total']}
        />
      )}
      pagination={false}
      size="small"
      disabled={!grant}
      readOnly={readOnly}
      loading={loading}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.name !== 'Not Expandable',
      }}
      noItemUpdated={noItemUpdated}
      footer={footer}
    />
  );
};

export default InputItems;
