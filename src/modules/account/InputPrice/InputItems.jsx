import React, { useEffect, useState } from 'react';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'utils/functions';
import { TableSummary } from 'api/Table';
import { ExpandedRowRender } from './api';
import { Numb } from 'utils/number';
import { useTranslation } from 'react-i18next';
import MTable from 'components/Table';

/**
 * @typedef {Object} InputItemsProps
 * @property {Array<import('./types').InputPriceItem>} items - Array of input price items
 * @property {function(Array<import('./types').InputPriceItem>): void} onChange - Change handler
 * @property {boolean} [grant] - Optional grant flag
 * @property {boolean} [readOnly] - Optional read-only flag
 */

/**
 * InputItems component for managing input price items
 */
const InputItems = ({ items, onChange, grant, readOnly }) => {
  const { t } = useTranslation('inputPrice');
  const [loading, setLoading] = useState(false);

  // Convert number keys to string keys for TableData compatibility
  const initData = items.map((l, i) => ({ ...l, id: i, key: i.toString() }));
  const [data, setData] = useState(initData);

  useEffect(() => {
    // Convert number keys to string keys for TableData compatibility
    const initData = items.map((l, i) => ({ ...l, id: i, key: i.toString() }));
    setData(initData);
  }, [items]);

  const onDeleteItem = async (dKey) => {
    try {
      const nData = [...data];
      const filtered = nData.filter((l) => l.key !== dKey.toString());
      const mapped = filtered.map((l, n) => ({ ...l, key: n.toString(), id: n }));
      onUpdateItem(mapped);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const _formatItem = (arr, dataIndex, rowIndex) =>
    new Promise((r, j) => {
      try {
        const newData = [...arr];
        const mItem = { ...arr[rowIndex] };
        if (['unitPrice', 'qty', 'discount'].includes(dataIndex)) {
          mItem.total = Number(
            (Numb(mItem.unitPrice) * Numb(mItem.qty) - Numb(mItem.discount || 0)).toFixed(2),
          );
        }
        newData.splice(rowIndex, 1, mItem);
        r(newData);
      } catch (e) {
        j(e instanceof Error ? e.message : String(e));
      }
    });

  const onUpdateItem = async (arr, dataIndex, rowIndex) => {
    try {
      console.log('[InputItems] onUpdateItem:', { arr, dataIndex, rowIndex });
      if (
        dataIndex &&
        ['unitPrice', 'qty', 'discount'].includes(dataIndex) &&
        rowIndex !== undefined
      ) {
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
      align: 'center',
    },
    {
      title: t('productCode', 'รหัส'),
      dataIndex: 'productCode',
      ellipsis: true,
    },
    {
      title: t('productName', 'ชื่อสินค้า'),
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: t('warehouse', 'คลัง'),
      dataIndex: 'storeLocationCode',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('quantity', 'จำนวน'),
      dataIndex: 'qty',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('unit', 'หน่วย'),
      dataIndex: 'unit',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('unitPrice', 'ราคา / หน่วย'),
      dataIndex: 'unitPrice',
      editable: true,
      required: true,
      number: true,
      ellipsis: true,
    },
    {
      title: t('discount', 'ส่วนลด'),
      dataIndex: 'discount',
      editable: true,
      number: true,
      ellipsis: true,
    },
    {
      title: t('total', 'จำนวนเงิน'),
      dataIndex: 'total',
      ellipsis: true,
    },
  ];

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      onUpdate={(updatedData, dataIndex, rowIndex) => {
        // Handle null dataIndex coming from EditableRowTable
        const actualDataIndex = dataIndex || undefined;
        // Convert string rowIndex to number if provided
        const actualRowIndex =
          rowIndex !== undefined && typeof rowIndex === 'string' ? parseInt(rowIndex) : rowIndex;
        onUpdateItem(updatedData, actualDataIndex, actualRowIndex);
      }}
      onDelete={onDeleteItem}
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
        expandedRowRender: (record) => <ExpandedRowRender record={record} />,
        rowExpandable: () => true,
      }}
    />
  );
};

export default InputItems;
