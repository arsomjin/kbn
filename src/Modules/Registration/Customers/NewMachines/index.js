import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, renderInput } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { FirebaseContext } from '../../../../firebase';
import { showLog, showWarn, load } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { useMergeState } from 'api/CustomHooks';
import { arrayForEach } from 'functions';
import RegistrationHeader from 'Modules/Registration/components/registration-header';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValues, setSearchValues] = useMergeState({
    date: moment().format('YYYY-MM-DD'),
    branchCode: user?.branch || '0450',
    saleType: 'cash'
  });

  const _onValuesChange = val => {
    //  showLog({ val });
    setSearchValues(val);
  };

  useEffect(() => {
    const handleUpdates = async snap => {
      try {
        setLoading(true);
        let sales = [];
        snap.forEach(doc => {
          sales.push({ ...doc.data(), id: sales.length, key: sales.length });
        });
        //  showLog({ sales });
        let mItems = [];
        await arrayForEach(sales, sale => {
          if (sale.items) {
            const { saleId, date, saleNo, branchCode, saleType } = sale;
            let dItems = sale.items.map(l => ({
              ...l,
              saleId,
              date,
              saleNo,
              branchCode,
              saleType
            }));
            mItems = [...mItems, ...dItems];
          }
        });
        setData(mItems.map((l, id) => ({ ...l, id, key: id })));
        setLoading(false);
      } catch (e) {
        showWarn(e);
      }
    };
    let query = firestore
      .collection('sections')
      .doc('registrations')
      .collection('customers')
      .doc('vehicles')
      .collection('new')
      .where('date', '==', searchValues.date);
    if (searchValues.branchCode !== 'all') {
      query = query.where('branchCode', '==', searchValues.branchCode);
    }
    if (searchValues.saleType !== 'all') {
      query = query.where('saleType', '==', searchValues.saleType);
    }

    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, firestore, searchValues.branchCode, searchValues.date, searchValues.saleType]);

  const onUpdate = async row => {
    try {
      //  showLog('save', row);
      if (row.deleted) {
        return;
      }
      load(true);
      let nValues = { ...row };
      delete nValues.id;
      let newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/services/gasCost', newValues._key);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onDelete = async key => {
    try {
      load(true);
      let nData = [...data];
      let index = nData.findIndex(item => item.key === key);
      //  showLog('deleted', nData[index]);
      let nValues = { ...nData[index], deleted: true };
      delete nValues.id;
      const newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/services/gasCost', nData[index]._key);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form form={form} initialValues={searchValues} layout="vertical" size="small" onValuesChange={_onValuesChange}>
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <RegistrationHeader title="รถลูกค้า" subtitle="งานทะเบียน" type="sale" />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values)}
                </Collapse.Panel>
              </Collapse>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        onUpdate={onUpdate}
        // onDelete={onDelete}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={6} sumKeys={['qty', 'total']} />
        )}
      />
    </Container>
  );
};
