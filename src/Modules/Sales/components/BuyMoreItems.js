import React, { useEffect, useState } from 'react';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { formatVehicleItemData } from 'Modules/Utils';
import Text from 'antd/lib/typography/Text';
import MTable from 'components/Table';

const initItem = {
  productCode: '',
  productName: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  productType: null,
  unitPrice: 0,
  qty: 1,
  total: 0,
  buyType: 'cash',
  isUsed: false
};

const BuyMoreItems = ({ docId, items = [], onChange, grant, readOnly, permanentDelete = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      let newItem = {
        ...initItem,
        docId,
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
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ประเภทสินค้า',
      dataIndex: 'vehicleType',
      editable: grant && !readOnly
      // required: true,
    },
    {
      title: 'ใหม่/มือสอง',
      dataIndex: 'isUsed',
      editable: grant && !readOnly
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
      editable: grant && !readOnly,
      required: true,
      ellipsis: true
    },
    {
      title: 'เลขรถ',
      dataIndex: 'vehicleNo',
      editable: grant && !readOnly,
      // required: true,
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'เลขเครื่อง',
      dataIndex: 'engineNo',
      editable: grant && !readOnly,
      // required: true,
      align: 'center'
    },
    {
      title: 'เลขอุปกรณ์ต่อพ่วง',
      dataIndex: 'peripheralNo',
      editable: grant && !readOnly,
      // required: true,
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice',
      editable: grant && !readOnly,
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
      align: 'right'
    },
    {
      title: 'ราคา',
      dataIndex: 'total',
      editable: false,
      required: true,
      number: true,
      align: 'right'
    },
    {
      title: 'การชำระเงิน',
      dataIndex: 'buyType',
      editable: grant && !readOnly,
      width: 120,
      align: 'center'
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
};

export default BuyMoreItems;
