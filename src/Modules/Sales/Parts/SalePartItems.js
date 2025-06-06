import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { StatusMap } from 'data/Constant';
import { useLocation } from 'react-router-dom';
import { formatPartItemData } from 'Modules/Utils';
import Text from 'antd/lib/typography/Text';
import MTable from 'components/Table';

const initItem = {
  pCode: '',
  productName: '',
  partType: null,
  detail: '',
  unitPrice: 0,
  qty: 1,
  discount: null,
  total: 0,
  status: StatusMap.pending,
  _key: ''
};

const SalePartItems = ({ saleId, items, onChange, grant, readOnly, permanentDelete = false }) => {
  const location = useLocation();
  // showLog('items_location', location.pathname);
  const isSale = location.pathname === '/sale-parts';
  const [loading, setLoading] = useState(false);
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
        formatted = await formatPartItemData(newData, dataIndex, validRowIndex);
      } else {
        // If no dataIndex is provided, treat it as an addition or deletion (full recalculation)
        formatted = await formatPartItemData(newData, null, -1);
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
      const saleItemId = `SALE-PART-ITEM${moment().format('YYYYMMDD')}${padLastNo}`;

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

  const columns = [
    {
      title: 'ลำดับที่',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
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
      dataIndex: 'pCode',
      editable: grant && !readOnly,
      required: true
    },
    {
      title: 'ประเภท',
      dataIndex: 'partType',
      editable: grant && !readOnly
      // required: true,
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      // editable: grant && !readOnly,
      required: true,
      ellipsis: true
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'unitPrice',
      // editable: grant && !readOnly,
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
      title: 'ราคา',
      dataIndex: 'total',
      editable: false,
      required: true,
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
              startAt={4}
              sumKeys={['qty', 'total']}
              customAlign={{ qty: 'center' }}
            />
          ),
          rowClassName: (record, index) => (record?.deleted ? 'deleted-row' : ''),
          loading
        }}
      />
    </div>
  );
};

export default SalePartItems;
