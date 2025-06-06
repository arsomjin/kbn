import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { showWarn } from 'functions';
// Suppose you have some utility that recalculates item data:
import { formatVehicleItemData } from 'Modules/Utils';
// Import your new ReusableEditableTable component:
import MTable from 'components/Table';
import { TableSummary } from 'components/Table/helper';

// Example “initItem” for new rows
const initItem = {
  productCode: '',
  productName: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  vehicleType: null,
  isUsed: false,
  detail: '',
  unitPrice: 0,
  qty: 1,
  discount: 0,
  total: 0,
  status: 'pending'
};

function SaleItems({ saleId, items = [], onChange, grant = true, readOnly = false, permanentDelete = false }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Initialize table data from props
    const initData = items.map((item, i) => ({
      ...item,
      key: i.toString(),
      id: i
    }));
    setData(initData);
  }, [items]);

  // If you want to handle final data changes (row editing, adding, deleting),
  // you can do so here. The “new” table calls this on every update.
  const handleDataChange = async (newData, dataIndex, rowIndex) => {
    try {
      let formatted;
      if (dataIndex) {
        // If dataIndex is provided, treat it as a row update.
        // Ensure rowIndex is a valid number; if not, use the current row's index (or 0 as fallback)
        const validRowIndex = typeof rowIndex === 'number' && rowIndex > -1 ? rowIndex : 0;
        formatted = await formatVehicleItemData(newData, dataIndex, validRowIndex);
      } else {
        // If no dataIndex is provided, treat it as an addition or deletion (full recalculation)
        formatted = await formatVehicleItemData(newData, null, -1);
      }
      setData(formatted);
      onChange && onChange(formatted);
    } catch (err) {
      showWarn(err);
    }
  };

  const onAddNewItem = async dArr => {
    try {
      const lastNo = parseInt(Math.floor(Math.random() * 10000));
      const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
      const saleItemId = `SALE-VEH-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;

      let newItem = {
        ...initItem,
        saleItemId,
        saleId,
        key: dArr.length,
        id: dArr.length
      };
      const nData = [...dArr, newItem];
      handleDataChange(nData, null, -1);
    } catch (e) {
      showWarn(e);
    }
  };

  // Define columns for ReusableEditableTable
  const columns = [
    {
      title: 'ลำดับที่',
      dataIndex: 'id',
      editable: false,
      align: 'center'
    },
    {
      title: 'ประเภทสินค้า',
      dataIndex: 'vehicleType',
      editable: grant && !readOnly
    },
    {
      title: 'ใหม่/มือสอง',
      dataIndex: 'isUsed',
      align: 'center',
      className: 'text-primary',
      editable: grant && !readOnly
    },
    {
      title: 'รหัสสินค้า',
      dataIndex: 'productCode',
      editable: grant && !readOnly
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      editable: false
    },
    {
      title: 'เลขรถ',
      dataIndex: 'vehicleNo',
      editable: grant && !readOnly
    },
    {
      title: 'เลขเครื่อง',
      dataIndex: 'engineNo',
      editable: grant && !readOnly
    },
    {
      title: 'เลขอุปกรณ์ต่อพ่วง',
      dataIndex: 'peripheralNo',
      editable: grant && !readOnly
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice',
      editable: grant && !readOnly,
      align: 'right'
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      editable: grant && !readOnly,
      align: 'center'
    },
    {
      title: 'ส่วนลด',
      dataIndex: 'discount',
      editable: grant && !readOnly,
      align: 'right'
    },
    {
      title: 'ราคา',
      dataIndex: 'total',
      editable: false,
      align: 'right'
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <MTable
        columns={columns}
        dataSource={data}
        onChange={handleDataChange}
        canDelete={!readOnly && grant}
        permanentDelete={permanentDelete}
        canAdd={!readOnly && grant ? onAddNewItem : false}
        defaultRowItem={initItem}
        tableProps={{
          pagination: false,
          bordered: true,
          tableLayout: 'auto',
          scroll: { x: 'max-content' },
          summary: pageData => (
            <TableSummary
              pageData={pageData}
              dataLength={data.length}
              startAt={8}
              sumKeys={['qty', 'discount', 'total']}
              customAlign={{ qty: 'center' }}
            />
          ),
          rowClassName: (record, index) => (record?.deleted ? 'deleted-row' : '')
        }}
      />
    </div>
  );
}

export default SaleItems;
