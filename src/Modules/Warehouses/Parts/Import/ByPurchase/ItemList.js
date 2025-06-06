/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { showLog, showWarn } from 'functions';
import { useSelector } from 'react-redux';
import EditableRowTable from 'components/EditableRowTable';
import { h } from 'api';
import { initialItemValues } from './api';
import moment from 'moment';
import { checkDoc } from 'firebase/api';
import { arrayForEach } from 'functions';
import Text from 'antd/lib/typography/Text';

const ItemList = ({ originData, onSubmit, reset, mainForm, noItemAdded, forceValidate }) => {
  const { branches } = useSelector(state => state.data);
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(
    forceValidate ? `กรุณาตรวจสอบข้อมูลในตาราง แถวที่ ${forceValidate}` : null
  );

  const pCodeRef = useRef(null);

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

  const onUpdateItem = async arr => {
    // showLog('update', arr);
    let mArr = [];
    await arrayForEach(arr, async it => {
      if (it?.branchCode) {
        it.branch = branches[it.branchCode].branchName;
      }
      if (it?.pCode && it.pCode !== pCodeRef.current) {
        //  showLog('pcode_update', it.pCode);
        pCodeRef.current = it.pCode;
        let doc = await checkDoc('data', `products/partList/${it.pCode}`);
        if (doc) {
          it.productName = doc.data().name;
        }
      }
      mArr.push(it);
      return it;
    });
    //  showLog({ mArr });
    setShowError(null);
    // setData(nData);
    onSubmit && onSubmit(mArr);
  };

  const onDeleteItem = dKey => {
    //  showLog({ dKey });
    let nData = [...data];
    nData = nData.filter(l => l.key !== dKey);
    nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
    setShowError(null);
    // setData(nData);
    onSubmit && onSubmit(nData);
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
      ellipsis: true,
      width: 120
    },
    {
      title: (
        <span role="img" aria-label="search">
          🔍 <Text className="ml-2">รหัส / รุ่น / ชื่อ / ประเภท</Text>
        </span>
      ),
      dataIndex: 'pCode',
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
      title: 'คลัง',
      dataIndex: 'partLocationCode',
      editable: true,
      required: true,
      align: 'center',
      isPart: true
    },
    {
      title: 'สาขาที่รับสินค้า',
      dataIndex: 'branchCode',
      editable: true,
      required: true,
      align: 'center'
    }
    // {
    //   title: 'วันที่คีย์',
    //   dataIndex: 'inputDate',
    //   editable: true,
    //   required: true,
    // },
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
    />
  );
};

export default ItemList;
