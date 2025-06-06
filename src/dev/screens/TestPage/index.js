import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container } from 'shards-react';
import { Button, Form } from 'antd';
import { FirebaseContext } from '../../../firebase';
import { showWarn } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import { CheckOutlined } from '@ant-design/icons';
import { getBillOptions } from 'api/Input';
import { columns, expandedRowRender, renderHeader, getWarehouseCheckedData } from './api';
import EditableCellTable from 'components/EditableCellTable';

export default () => {
  const initMergeState = {
    mReceiveNo: null,
    noItemUpdated: false
  };

  const { firestore } = useContext(FirebaseContext);

  const [data, setData] = useState([]);
  const [filteredData, setFData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cState, setCState] = useMergeState(initMergeState);

  const [form] = Form.useForm();

  const _getData = useCallback(async () => {
    try {
      const stockImportArr = await getWarehouseCheckedData(firestore);
      //  showLog({ stockImportArr });
      setData(stockImportArr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    _getData();
  }, [_getData]);

  const onBillSelect = bl => {
    let fData = data.filter(l => l.receiveNo === bl.value || l.billNoSKC === bl.value);
    fData = fData.map((it, i) => ({ ...it, id: i + 1 }));
    setFData(fData);
    setCState({ mReceiveNo: bl, mPurchaseDoc: null, mVpNo: null });
  };

  const onAdd = count => {
    const newItem = {
      // name: `Edward King ${count}`,
      // age: '32',
      // address: `London, Park Lane no. ${count}`,
    };
    const newData = {
      key: count,
      ...newItem
    };
    setData([...data, newData]);
  };

  const onUpdate = row => {
    //  showLog('save', row);
    let newData = [...data];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setData(newData);
  };

  const onDelete = key => {
    let nData = [...data];
    nData = nData.filter(item => item.key !== key);
    setData(nData);
  };

  const billOptions = getBillOptions(data, ['receiveNo', 'billNoSKC']);

  return (
    <Container fluid className="main-content-container p-3">
      {renderHeader({ form, onBillSelect, cState, billOptions })}
      <EditableCellTable
        dataSource={data}
        columns={columns}
        expandable={{
          expandedRowRender,
          rowExpandable: record => record.name !== 'Not Expandable'
        }}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        noItemUpdated={cState.noItemUpdated}
        loading={loading}
        // reset={reset}
      />
      <div className="border-bottom bg-white p-3 text-right">
        <Button className="mr-2 my-2">ยกเลิก</Button>
        <Button type="primary" icon={<CheckOutlined />} className="mr-2 my-2">
          ยืนยัน
        </Button>
      </div>
    </Container>
  );
};
