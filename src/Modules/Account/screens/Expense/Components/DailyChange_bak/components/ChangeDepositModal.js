import { Modal } from 'antd';
import { w } from 'api';
import { TableSummary } from 'api/Table';
import EditableRowTable from 'components/EditableRowTable';
import { showConfirm } from 'functions';
import { getNameFromUid } from 'Modules/Utils';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';

export default ({ obj, onOk, ...props }) => {
  const { user } = useSelector(state => state.auth);
  const { users, employees } = useSelector(state => state.data);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(
      (obj.data || []).map((it, id) => ({
        ...it,
        id,
        key: id,
        deleted: it?.deleted || false
      }))
    );
  }, [obj.data]);

  const getChangeDepositColumns = (users, employees) => [
    {
      title: '#',
      dataIndex: 'id',
      align: 'center'
    },
    {
      title: 'เวลา',
      dataIndex: 'time',
      render: ts => dayjs(ts).format('lll'),
      align: 'center'
    },
    {
      title: 'บันทึกโดย',
      dataIndex: 'by',
      render: uid => getNameFromUid({ uid, users, employees }),
      align: 'center'
    },
    { title: 'จำนวนเงิน', dataIndex: 'total' }
  ];

  const onAddNewItem = dArr => {
    let newItem = {
      time: Date.now(),
      by: user.uid,
      key: dArr.length,
      id: dArr.length,
      total: null,
      deleted: false
    };
    const nData = [...dArr, newItem];
    setData(nData);
  };

  const onDeleteItem = dKey => {
    let nData = [...data];
    let dId = nData.findIndex(l => l.key === dKey);
    if (dId > -1) {
      nData[dId].deleted = true;
    }
    // nData = nData.filter((l) => l.key !== dKey);
    nData = nData.map((l, n) => ({ ...l, key: n, id: n }));
    setData(nData);
  };

  const onUpdateItem = (arr, dataIndex, rowIndex) => {
    // setData(dArr);
    if (rowIndex && arr[rowIndex]) {
      let newData = [...arr];
      let mItem = { ...arr[rowIndex] };
      newData.splice(rowIndex, 1, mItem);
      setData(newData);
    }
  };

  const _onConfirm = () => {
    showConfirm(() => onConfirm(), 'ยืนยันการเปลี่ยนแปลง');
  };

  const onConfirm = () => {
    let nData = [...data]
      .filter(l => !!l.total)
      .map((l, n) => ({
        by: l.by,
        deleted: l.deleted || false,
        time: l.time,
        total: l.total
      }));
    onOk && onOk(nData);
    // showLog({ nData });
  };

  //   showLog({ data });

  return (
    <Modal
      title={`รายการรับเงินทอน`}
      okText="บันทึก"
      cancelText="ยกเลิก"
      visible={obj.visible}
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
      onOk={_onConfirm}
      {...props}
    >
      <EditableRowTable
        dataSource={data}
        columns={getChangeDepositColumns(users, employees)}
        // onAdd={onAddNewItem}
        // onUpdate={onUpdateItem}
        onDelete={onDeleteItem}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={(obj.data || []).length} startAt={3} sumKeys={['total']} />
        )}
        pagination={false}
      />
    </Modal>
  );
};
