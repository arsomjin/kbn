import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import { columns, renderInput, getInitialValues, renderHeader, getDateFromMonth } from './api';
import Footer from 'components/Footer';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { FirebaseContext } from '../../../firebase';
import { showLog, showWarn, cleanValuesBeforeSave, firstKey, showSuccess, load, waitFor } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { createNewId } from 'utils';
import { getModelFromName } from 'Modules/Utils';
import { checkDoc } from 'firebase/api';

export default ({}) => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { vehicleList } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || '0450');
  const [date, setDate] = useState(moment(getDateFromMonth(moment().format('YYYY-MM'))).format('YYYY-MM-DD'));
  const [month, setMonth] = useState(moment().format('YYYY-MM'));

  const _onValuesChange = async val => {
    //  showLog({ val });
    const changeKey = firstKey(val);
    if (changeKey === 'branchCode') {
      setBranch(val[changeKey]);
    }
    if (changeKey === 'month') {
      setMonth(val[changeKey]);
      form.setFieldsValue({ date: getDateFromMonth(val[changeKey]) });
    }
    if (changeKey === 'date') {
      setDate(val[changeKey]);
    }
    if (changeKey === 'productCode') {
      try {
        load(true);
        const doc = await checkDoc('data', `products/vehicleList/${val[changeKey]}`);
        if (doc) {
          let selectVehicle = doc.data();
          form.setFieldsValue({
            productName: selectVehicle.name,
            productType: selectVehicle.productType
          });
        }
        load(false);
      } catch (e) {
        showWarn(e);
      }
    }
  };

  const _resetToInitial = async () => {
    form.resetFields();
    await waitFor(0);
    form.setFieldsValue({
      branchCode: branch,
      date
    });
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let items = [];
      snap.forEach(doc => {
        items.push({
          ...doc.data(),
          id: items.length,
          key: items.length,
          model: getModelFromName(doc.data().productName)
        });
      });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('purchasePlan')
      .where('branchCode', '==', branch)
      .where('month', '==', month);
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, firestore, month]);

  const _onConfirm = async values => {
    try {
      load(true);
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      let sValues = cleanValuesBeforeSave(mValues);
      delete sValues.id;
      delete sValues.key;
      let _key = createNewId('WH-PLAN-PUR');
      const addPurchasePlan = await api.setItem(
        {
          ...sValues,
          deleted: false,
          created: Date.now(),
          inputBy: user.uid,
          _key
        },
        'sections/stocks/purchasePlan',
        _key
      );
      //  showLog({ addPurchasePlan: addPurchasePlan.id });
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกแผนสั่งซื้อสินค้า ${sValues.productCode} สำเร็จ`);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onUpdate = async row => {
    try {
      //  showLog('save', row);
      if (row.deleted) {
        return;
      }
      load(true);
      let nValues = { ...row };
      delete nValues.id;
      delete nValues.key;
      let newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/stocks/purchasePlan', newValues._key);
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
      delete nValues.key;
      const newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/stocks/purchasePlan', nData[index]._key);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={getInitialValues(user)}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {renderHeader({
                  title: 'วางแผนสั่งซื้อสินค้า',
                  subtitle: 'คลังสินค้า',
                  disableAllBranches: true,
                  steps: CommonSteps,
                  activeStep: 0,
                  values
                })}
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values)}
                  <Footer
                    onConfirm={() => _onConfirm(values)}
                    onCancel={() => _resetToInitial()}
                    cancelText="ล้างข้อมูล"
                    cancelPopConfirmText="ล้าง?"
                    okPopConfirmText="ยืนยัน?"
                    okIcon={<PlusOutlined />}
                  />
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
        onDelete={onDelete}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={5} sumKeys={['qty']} />
        )}
      />
    </Container>
  );
};
