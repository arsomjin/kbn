import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import EditableRowTable from '../../../components/EditableRowTable';
import { showWarn } from '../../../utils/functions';
import { TableSummary } from 'api/Table';
import { ExpandedRowRender } from './api';
import { Numb } from '../../../utils/number';
import { InputPriceItem } from './types';
import { StatusMap } from '../../../data/Constant';
import { TableData } from 'components/Table/types';
import { useTranslation } from 'react-i18next';
import MTable from 'components/Table';

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
  const { t } = useTranslation('inputPrice');
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
      const itemId = `RES-VH-ITEM${dayjs().format('YYYYMMDD')}${padLastNo}`;

      const newItem: InputPriceItem = {
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
      const nData = [...data];
      const filtered = nData.filter(l => l.key !== dKey.toString());
      const mapped = filtered.map((l, n) => ({ ...l, key: n.toString(), id: n }));
      onUpdateItem(mapped);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const _formatItem = (arr: InputPriceItem[], dataIndex: string, rowIndex: number): Promise<InputPriceItem[]> =>
    new Promise(async (r, j) => {
      try {
        const newData = [...arr];
        const mItem = { ...arr[rowIndex] };
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
      console.log('[InputItems] onUpdateItem:', { arr, dataIndex, rowIndex });
      if (dataIndex && ['unitPrice', 'qty', 'discount'].includes(dataIndex) && rowIndex !== undefined) {
        setLoading(true);
        const formatArr = await _formatItem(arr, dataIndex, rowIndex);
        console.log('[InputItems] formatArr:', formatArr);
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
      title: t('order', 'ลำดับ'),
      dataIndex: 'id',
      ellipsis: true,
      align: 'center' as const
    },
    {
      title: t('productCode', 'รหัส'),
      dataIndex: 'productCode',
      ellipsis: true
    },
    {
      title: t('productName', 'ชื่อสินค้า'),
      dataIndex: 'productName',
      ellipsis: true
    },
    {
      title: t('warehouse', 'คลัง'),
      dataIndex: 'storeLocationCode',
      align: 'center' as const,
      ellipsis: true
    },
    {
      title: t('quantity', 'จำนวน'),
      dataIndex: 'qty',
      align: 'center' as const,
      ellipsis: true
    },
    {
      title: t('unit', 'หน่วย'),
      dataIndex: 'unit',
      align: 'center' as const,
      ellipsis: true
    },
    {
      title: t('unitPrice', 'ราคา / หน่วย'),
      dataIndex: 'unitPrice',
      editable: true,
      required: true,
      number: true,
      ellipsis: true
    },
    {
      title: t('discount', 'ส่วนลด'),
      dataIndex: 'discount',
      editable: true,
      number: true,
      ellipsis: true
    },
    {
      title: t('total', 'จำนวนเงิน'),
      dataIndex: 'total',
      ellipsis: true
    }
  ];

  const startAt = columns.findIndex(l => l.dataIndex === 'qty');

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
      summary={(pageData: InputPriceItem[]) => (
        <TableSummary pageData={pageData} dataLength={data.length} startAt={8} sumKeys={['total']} />
      )}
      pagination={false}
      size='small'
      disabled={!grant}
      readOnly={readOnly}
      loading={loading}
      scroll={{ x: 'max-content', y: 400 }}
      locale={{ emptyText: '' }}
      initialItemValues={undefined}
      onAdd={undefined}
      forceValidate={undefined}
      noScroll={false}
      handleEdit={undefined}
      handleSelect={undefined}
      rowClassName={undefined}
      deletedButtonAtEnd={undefined}
      expandable={{
        expandedRowRender: (record: TableData) => <ExpandedRowRender record={record as InputPriceItem} />,
        rowExpandable: () => true
      }}
    />
  );
};

export default InputItems;
