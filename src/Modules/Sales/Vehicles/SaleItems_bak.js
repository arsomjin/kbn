import React, { useEffect, useState } from 'react';
import moment from 'moment';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { StatusMap } from 'data/Constant';
import { useLocation } from 'react-router-dom';
import { formatVehicleItemData } from 'Modules/Utils';
import Text from 'antd/lib/typography/Text';

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
  status: StatusMap.pending,
  _key: ''
};

const SaleItems = ({ saleId, items, onChange, grant, readOnly }) => {
  const location = useLocation();
  // showLog('items_location', location.pathname);
  const isSale = location.pathname === '/sale-machines';
  const [loading, setLoading] = useState(false);
  let initData = items.map((l, i) => ({ ...l, id: i, key: i }));

  const [data, setData] = useState(initData);
  const [isUsed, setIsUsed] = useState(false);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

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
      // Set isUsed to provide the vehicle selector input data.
      rowIndex !== undefined && setIsUsed(arr[rowIndex]?.isUsed);
      // Format item data.
      if (dataIndex && ['unitPrice', 'qty', 'productCode'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await formatVehicleItemData(arr, dataIndex, rowIndex);
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
      title: 'ลำดับที่',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
    },
    // {
    //   title: 'ประเภท',
    //   dataIndex: 'productType',
    //   editable: grant && !readOnly,
    //   required: true,
    //   width: 140,
    // },
    {
      title: 'ประเภทสินค้า',
      dataIndex: 'vehicleType',
      editable: grant && !readOnly,
      // required: true,
      width: 140
    },
    {
      title: 'ใหม่/มือสอง',
      dataIndex: 'isUsed',
      editable: grant && !readOnly,
      align: 'center',
      className: 'text-primary',
      width: 100
    },
    {
      title:
        grant && !readOnly ? (
          <span role="img" aria-label="search">
            🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
          </span>
        ) : (
          'รหัสสินค้า'
        ),
      ellipsis: true,
      dataIndex: 'productCode',
      editable: grant && !readOnly,
      required: true
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      // editable: grant && !readOnly,
      required: true,
      width: 180,
      ellipsis: true
    },
    {
      title: 'เลขรถ',
      dataIndex: 'vehicleNo',
      editable: grant && !readOnly,
      // required: true,
      ellipsis: true
    },
    {
      title: 'เลขเครื่อง',
      dataIndex: 'engineNo',
      editable: grant && !readOnly
      // required: true,
    },
    {
      title: 'เลขอุปกรณ์ต่อพ่วง',
      dataIndex: 'peripheralNo',
      editable: grant && !readOnly,
      // required: true,
      ellipsis: true
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice',
      editable: isUsed && grant && !readOnly,
      required: true,
      number: true,
      align: 'right'
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      number: true,
      editable: grant && !readOnly,
      required: true,
      align: 'center'
    },
    {
      title: 'ส่วนลด',
      dataIndex: 'discount',
      editable: grant && !readOnly,
      required: true,
      number: true,
      align: 'right'
    },
    {
      title: 'ราคา',
      dataIndex: 'total',
      editable: false,
      required: true,
      number: true,
      align: 'right'
    }
  ];

  let qtyIndex = columns.findIndex(l => l.dataIndex === 'qty');
  let startAt = qtyIndex > 0 ? qtyIndex - 1 : 8;
  if (isSale) {
    startAt = startAt += 1;
  }
  // showLog({ startAt, columns });
  // showLog({ data });

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      // scroll={{ ...tableScroll, x: 840 }}
      miniAddButton
      summary={pageData => (
        <TableSummary pageData={pageData} dataLength={data.length} startAt={startAt} sumKeys={['qty', 'total']} />
      )}
      pagination={false}
      size="small"
      disabled={!grant}
      readOnly={readOnly}
      loading={loading}
    />
  );
};

export default SaleItems;
