import React, { useContext, useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import { columns, renderInput } from './api';
import Footer from 'components/Footer';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { FirebaseContext } from '../../../../firebase';
import { showLog, showWarn, cleanValuesBeforeSave, Numb, firstKey, showSuccess, load, waitFor } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { createNewId } from 'utils';

export default ({}) => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450');
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
        items.push({ ...doc.data(), id: items.length, key: items.length });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('gasCost')
      .where('branchCode', '==', branch)
      .where('date', '==', date);
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, date, firestore]);

  const _onConfirm = async values => {
    try {
      load(true);
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      let sValues = cleanValuesBeforeSave(mValues);
      delete sValues.id;
      delete sValues.key;
      let _key = createNewId('WH-TR-SUM');
      await api.setItem(
        {
          ...sValues,
          distance: Numb(sValues.meterEnd) - Numb(sValues.meterStart),
          deleted: false,
          created: Date.now(),
          inputBy: user.uid,
          _key
        },
        'sections/services/gasCost',
        _key
      );
      load(false);
      _resetToInitial();
      showSuccess(() => showLog('Success'), `บันทึกค่าน้ำมันรถทะเบียน ${sValues.vehicleRegNumber} สำเร็จ`);
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
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          date: moment(),
          vehicleRegNumber: null,
          gasCost: null,
          origin: null,
          destination: null,
          meterStart: null,
          meterEnd: null
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="บันทึกค่าน้ำมัน"
                  subtitle="งานบริการ"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={0}
                />
              </div>
              {renderInput()}
              <Footer
                onConfirm={() => _onConfirm(values)}
                onCancel={() => _resetToInitial()}
                cancelText="ล้างข้อมูล"
                cancelPopConfirmText="ล้าง?"
                okPopConfirmText="ยืนยัน?"
                okIcon={<PlusOutlined />}
              />
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
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={2} sumKeys={['gasCost', 'distance']} />
        )}
      />
    </Container>
  );
};
