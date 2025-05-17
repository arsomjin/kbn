import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import EditableRowTable from '../../../components/EditableRowTable';
import { showWarn } from '../../../utils/functions';
import { TableSummary as ApiTableSummary } from '../../../api/Table';
import { expandedRowRender } from './api';
import { Numb } from '../../../utils/number';
import { InputPriceItem } from './types';
import { StatusMap } from '../../../data/Constant';
import { TableData } from '../../../components/Table/types';

interface InputItemsProps {
  items: InputPriceItem[];
  docId?: string;
  onChange: (items: InputPriceItem[]) => void;
  grant?: boolean;
  readOnly?: boolean;
  footer?: React.ReactNode;
  noItemUpdated?: boolean;
}

// Inline status map
const STATUS_PENDING = 'pending';

// Local TableSummary stub
const TableSummary: React.FC<{ pageData: InputPriceItem[]; dataLength: number; startAt: number; sumKeys: string[] }> = ({ pageData, dataLength, startAt, sumKeys }) => {
  // You can implement your own summary logic here if needed
  return null;
};

const initItem: InputPriceItem = {
  productCode: '',
  productName: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  productType: null,
  detail: '',
  unitPrice: 0,
  qty: 1,
  total: 0,
  status: StatusMap.pending,
  _key: '',
  id: 0,
  key: '0' // String key to match TableData
};

const InputItems: React.FC<InputItemsProps> = ({ items, docId, onChange, grant, readOnly, footer, noItemUpdated }) => {
  const [loading, setLoading] = useState(false);
  
  // Convert number keys to string keys for TableData compatibility
  const initData = items.map((l, i) => ({ ...l, id: i, key: i.toString() }));
  const [data, setData] = useState<InputPriceItem[]>(initData);

  useEffect(() => {
    // Convert number keys to string keys for TableData compatibility
    const initData = items.map((l, i) => ({ ...l, id: i, key: i.toString() }));
    setData(initData);
  }, [items]);

  const onAddNewItem = async (dArr: InputPriceItem[]) => {
    try {
      const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
      const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
      const itemId = `RES-VH-ITEM${DateTime.now().toFormat('yyyyMMdd')}${padLastNo}`;

      let newItem: InputPriceItem = {
        ...initItem,
        itemId,
        docId,
        key: dArr.length.toString(),
        id: dArr.length
      };
      const nData = [...dArr, newItem];
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const onDeleteItem = async (dKey: string | number) => {
    try {
      let nData = [...data];
      nData = nData.filter(l => l.key !== dKey.toString());
      nData = nData.map((l, n) => ({ ...l, key: n.toString(), id: n }));
      onUpdateItem(nData);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const _formatItem = (arr: InputPriceItem[], dataIndex: string, rowIndex: number): Promise<InputPriceItem[]> =>
    new Promise(async (r, j) => {
      try {
        let newData = [...arr];
        let mItem = { ...arr[rowIndex] };
        if (['unitPrice', 'qty', 'discount'].includes(dataIndex)) {
          mItem.total = Number((Numb(mItem.unitPrice) * Numb(mItem.qty) - Numb(mItem.discount || 0)).toFixed(2));
        }
        newData.splice(rowIndex, 1, mItem);
        r(newData);
      } catch (e) {
        j(e instanceof Error ? e.message : String(e));
      }
    });

  const onUpdateItem = async (arr: InputPriceItem[], dataIndex?: string, rowIndex?: number) => {
    try {
      if (dataIndex && ['unitPrice', 'qty', 'discount'].includes(dataIndex) && rowIndex !== undefined) {
        setLoading(true);
        let formatArr = await _formatItem(arr, dataIndex, rowIndex);
        setLoading(false);
        onChange && onChange(formatArr);
      } else {
        onChange && onChange(arr);
      }
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center' as const
    },
    {
      title: 'รหัส',
      dataIndex: 'productCode'
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      ellipsis: true
    },
    {
      title: 'คลัง',
      dataIndex: 'storeLocationCode',
      align: 'center' as const
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      align: 'center' as const
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      align: 'center' as const
    },
    {
      title: 'ราคา / หน่วย',
      dataIndex: 'unitPrice',
      editable: true,
      required: true,
      number: true,
      width: 160
    },
    {
      title: 'ส่วนลด',
      dataIndex: 'discount',
      editable: true,
      number: true
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'total'
    }
  ];

  let startAt = columns.findIndex(l => l.dataIndex === 'qty');

  return (
    <EditableRowTable
      dataSource={data as unknown as TableData[]}
      columns={columns}
      onUpdate={(updatedData, dataIndex, rowIndex) => {
        // Handle null dataIndex coming from EditableRowTable
        const actualDataIndex = dataIndex || undefined;
        // Convert string rowIndex to number if provided
        const actualRowIndex = rowIndex !== undefined && typeof rowIndex === 'string' ? parseInt(rowIndex) : rowIndex;
        // Cast back to InputPriceItem[]
        onUpdateItem(updatedData as unknown as InputPriceItem[], actualDataIndex, actualRowIndex);
      }}
      onDelete={onDeleteItem}
      miniAddButton
      pagination={false}
      size="small"
      disabled={!grant}
      readOnly={readOnly}
      loading={loading}
      scroll={undefined}
      locale={{}}
      initialItemValues={undefined}
      onAdd={undefined}
      forceValidate={undefined}
      noScroll={undefined}
      handleEdit={undefined}
      handleSelect={undefined}
      rowClassName={undefined}
      deletedButtonAtEnd={undefined}
      expandable={{
        expandedRowRender: (record: TableData) => expandedRowRender(record as unknown as InputPriceItem),
        rowExpandable: () => true
      }}
    />
  );
};

export default InputItems; 