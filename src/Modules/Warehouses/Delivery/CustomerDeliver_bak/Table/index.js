import React, { useContext, useEffect, useState } from 'react';
import EditableCellTable from 'components/EditableCellTable';
import { FirebaseContext } from '../../../../../firebase';
import { columns, expandedRowRender } from './api';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { showLog } from 'functions';
import { firstKey } from 'functions';
import { waitFor } from 'functions';
import BranchDateHeader from 'components/branch-date-header';
import { Form } from 'antd';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || '0450');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));

  const _onValuesChange = val => {
    //  showLog({ val });
    const changeKey = firstKey(val);
    if (['branchCode', 'date'].includes(changeKey)) {
      if (changeKey === 'branchCode') {
        setBranch(val[changeKey]);
      } else {
        setDate(val[changeKey]);
      }
    }
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let items = [];
      snap.forEach(doc => {
        items.push({
          ...doc.data(),
          ...doc.data().address,
          id: items.length,
          key: items.length
        });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    let query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('deliver')
      .where('deliverDate', '==', date)
      .where('deliverType', '==', 'customerDelivery');
    if (branch !== 'all') {
      query = query.where('branchCode', '==', branch);
    }
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, date, firestore]);

  const _resetToInitial = async () => {
    form.resetFields();
    await waitFor(0);
    form.setFieldsValue({
      branchCode: branch,
      date
    });
  };

  return (
    <>
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || '0450',
          date: moment()
        }}
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="saleId" /> */}
              <BranchDateHeader />
            </div>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        // onDelete={onDelete}
        loading={loading}
        expandable={{ expandedRowRender }}
      />
    </>
  );
};
