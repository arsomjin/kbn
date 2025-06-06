/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';
import { showLog, showWarn } from 'functions';
import EditableRowTable from 'components/EditableRowTable';
import { h } from 'api';
import { initialItemValues } from './api';
import moment from 'moment';
import Text from 'antd/lib/typography/Text';
import { formatItemData } from '../../api';

const ItemList = ({ originData, onSubmit, reset, mainForm, noItemAdded, forceValidate }) => {
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(
    forceValidate ? `กรุณาตรวจสอบข้อมูลในตาราง แถวที่ ${forceValidate}` : null
  );
  const [loading, setLoading] = useState(false);

  const updateArr = useCallback(dArr => {
    return dArr.map((l, i) => ({
      ...l,
      id: i,
      key: i,
      ...(l.inputDate && {
        inputDate: moment(l.inputDate, 'YYYY-MM-DD')
      })
    }));
  }, []);

  useEffect(() => {
    const nData = updateArr(originData);
    setData(nData);
  }, [originData, updateArr]);

  useEffect(() => {
    setShowError(forceValidate ? `กรุณาตรวจสอบข้อมูลในตาราง แถวที่ ${forceValidate}` : null);
  }, [forceValidate]);

  const onAddNewItem = async id => {
    try {
      let newItem = {
        ...initialItemValues,
        key: id,
        id: id
      };
      const nData = [...data, newItem];
      //  showLog({ nData });
      // setData(nData);
      onSubmit && onSubmit(nData);
    } catch (e) {
      showWarn(e);
    }
  };

  const onUpdateItem = async (arr, dataIndex, rowIndex) => {
    try {
      // showLog({ dArr, editKey });
      // setData(dArr);
      if (dataIndex && ['unitPrice', 'qty', 'productCode'].includes(dataIndex)) {
        setLoading(true);
        let formatArr = await formatItemData(arr, dataIndex, rowIndex);
        setLoading(false);
        //  showLog({ formatArr });
        setShowError(null);
        // setData(nData);
        onSubmit && onSubmit(formatArr);
      } else {
        onSubmit && onSubmit(arr);
      }
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const onDeleteItem = dKey => {
    //  showLog({ dKey });
    let nData = [...data];
    nData = nData.filter(l => l.key !== dKey);
    nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
    setShowError(null);
    // setData(nData);
    // onSubmit && onSubmit(nData);
    onUpdateItem(nData);
  };

  const footer = () => <h6 className="m-0 text-danger">{noItemAdded ? 'ไม่มีรายการสินค้า' : ''}</h6>;

  const header = () => <h6 className="m-0 text-danger">{showError || ''}</h6>;

  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'id',
      ellipsis: true,
      align: 'center'
    },
    {
      title: 'ผู้ขาย',
      dataIndex: 'dealer',
      editable: true,
      required: true,
      ellipsis: true
    },
    {
      title: (
        <span role="img" aria-label="search">
          🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
        </span>
      ),
      dataIndex: 'productCode',
      editable: true,
      required: true,
      ellipsis: true
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      ellipsis: true
    },
    {
      title: 'คลัง',
      dataIndex: 'storeLocationCode',
      editable: true,
      required: true,
      align: 'center'
    },
    {
      title: 'จำนวน',
      dataIndex: 'import',
      editable: true,
      required: true,
      number: true,
      align: 'center'
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      editable: true,
      required: true,
      align: 'center'
    },
    {
      title: 'สาขาที่รับสินค้า',
      dataIndex: 'branchCode',
      editable: true,
      required: true,
      align: 'center'
    },
    {
      title: 'วันที่คีย์',
      dataIndex: 'inputDate',
      editable: true,
      required: true
    },
    {
      title: 'หมายเลขรถ',
      dataIndex: 'vehicleNo',
      editable: true
    },
    {
      title: 'หมายเลขเครื่องยนต์',
      dataIndex: 'engineNo',
      editable: true
    },
    {
      title: 'เลขอุปกรณ์ต่อพ่วง',
      dataIndex: 'peripheralNo',
      editable: true
    }
  ];

  showLog({ data });
  return (
    <EditableRowTable
      columns={columns}
      dataSource={data}
      title={header}
      onAdd={onAddNewItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
      scroll={{ x: 1900, y: h(40) }}
      forceValidate={forceValidate}
      loading={loading}
    />
  );
};

export default ItemList;
