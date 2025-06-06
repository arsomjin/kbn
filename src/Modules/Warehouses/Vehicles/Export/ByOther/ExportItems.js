import React, { useEffect, useState } from 'react';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import { tableScroll } from 'data/Constant';
import { TableSummary } from 'api/Table';
import Text from 'antd/lib/typography/Text';
import { formatItemData } from '../../api';
import { getItemId } from 'Modules/Account/api';
import { InitItem } from './api';

const ExportItems = ({ exportId, items, onChange, grant, readOnly }) => {
  let initData = items.map((l, i) => ({ ...l, id: i, key: i }));

  const [data, setData] = useState(initData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let initData = items.map((l, i) => ({ ...l, id: i, key: i }));
    setData(initData);
  }, [items]);

  const onAddNewItem = async dArr => {
    try {
      let newItem = {
        ...InitItem,
        id: dArr.length,
        key: dArr.length,
        exportItemId: getItemId('WH-VH'),
        exportId,
        fromOrigin: dArr[0]?.fromOrigin,
        branchCode: dArr[0]?.branchCode,
        destination: dArr[0]?.destination || null,
        isUsed: dArr[0]?.isUsed || false
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
      if (dataIndex && ['qty', 'productCode'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await formatItemData(arr, dataIndex, rowIndex);
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
      title: 'ลำดับที่',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ประเภทสินค้า',
      dataIndex: 'vehicleType',
      editable: grant && !readOnly,
      // required: true,
      width: 140
    },
    {
      title: (
        <span role="img" aria-label="search">
          🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
        </span>
      ),
      ellipsis: true,
      dataIndex: 'productCode',
      editable: grant && !readOnly,
      required: true
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      ellipsis: true
    },
    {
      title: 'เลขรถ',
      dataIndex: 'vehicleNo',
      editable: grant && !readOnly
      // required: true,
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
      editable: grant && !readOnly
      // required: true,
    },
    {
      title: 'จำนวน',
      dataIndex: 'qty',
      number: true,
      editable: grant && !readOnly,
      required: true,
      align: 'center'
    }
  ];

  return (
    <EditableRowTable
      dataSource={data}
      columns={columns}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      scroll={{ ...tableScroll, x: 840 }}
      miniAddButton
      summary={pageData => <TableSummary pageData={pageData} dataLength={data.length} startAt={7} sumKeys={['qty']} />}
      pagination={false}
      size="small"
      disabled={!grant}
      readOnly={readOnly}
      loading={loading}
      rowClassName={(record, index) => {
        //  showLog({ record });
        return record?.deleted
          ? 'deleted-row'
          : record?.completed
            ? 'recorded-row'
            : record?.rejected
              ? 'rejected-row'
              : 'editable-row';
      }}
    />
  );
};

export default ExportItems;
