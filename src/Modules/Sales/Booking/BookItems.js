import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { StatusMap } from 'data/Constant';
import { useLocation } from 'react-router';
import { formatVehicleItemData } from 'Modules/Utils';
import MTable from 'components/Table';

const initItem = {
  productCode: '',
  productName: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  productType: null,
  isUsed: false,
  detail: '',
  unitPrice: 0,
  qty: 1,
  total: 0,
  status: StatusMap.pending,
  _key: ''
};

const BookItems = ({
  bookId,
  items = [],
  onChange,
  grant = true,
  readOnly = false,
  isEquipment,
  permanentDelete = false
}) => {
  const location = useLocation();
  // showLog('items_location', location.pathname);
  const isBooking = location.pathname === '/sale-booking';

  let initData = items.map((l, i) => ({ ...l, id: i, key: i }));

  const [data, setData] = useState(initData);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

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
      const bookItemId = `BOOK-VEH-ITEM${dayjs().format('YYYYMMDD')}${padLastNo}`;

      let newItem = {
        ...initItem,
        bookItemId,
        bookId,
        key: dArr.length,
        id: dArr.length
      };
      const nData = [...dArr, newItem];
      handleDataChange(nData, null, -1);
    } catch (e) {
      showWarn(e);
    }
  };

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
              sumKeys={['qty', 'total']}
              customAlign={{ qty: 'center' }}
            />
          ),
          rowClassName: (record, index) => (record?.deleted ? 'deleted-row' : '')
        }}
      />
    </div>
  );
};

export default BookItems;
