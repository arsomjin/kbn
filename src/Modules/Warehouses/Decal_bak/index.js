import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form } from 'antd';
import { Container } from 'shards-react';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import { columns, getInitialValues, renderInput } from './api';
import Footer from 'components/Footer';
import EditableCellTable from 'components/EditableCellTable';
import { FirebaseContext } from '../../../firebase';
import { showLog, showWarn, cleanValuesBeforeSave, firstKey, showSuccess, load, waitFor } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { createNewId } from 'utils';

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
        items.push({ ...doc.data(), id: items.length });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    let query = firestore.collection('sections').doc('stocks').collection('decal').where('date', '==', date);
    if (branch !== 'all') {
      query = query.where('branchCode', '==', branch);
    }
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
      let _key = createNewId('DECAL');
      await api.setItem(
        {
          ...sValues,
          branchCode: branch,
          date,
          deleted: false,
          created: Date.now(),
          inputBy: user.uid,
          _key
        },
        'sections/stocks/decal',
        _key
      );
      //  showLog({ addDecal: addDecal.id });
      load(false);
      _resetToInitial();
      showSuccess(() => showLog('Success'), `บันทึกทะเบียนคุมลอกลาย ${sValues.chassisNumber} สำเร็จ`);
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
      await api.updateItem(newValues, 'sections/stocks/decal', newValues._key);
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
      await api.updateItem(newValues, 'sections/stocks/decal', nData[index]._key);
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
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="ทะเบียนคุมลอกลายรถ"
                  subtitle="งานคลังสินค้า"
                  // disableAllBranches
                  steps={CommonSteps}
                  activeStep={0}
                />
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
      />
    </Container>
  );
};
