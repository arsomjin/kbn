import React, { useContext, useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Collapse, Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import Footer from 'components/Footer';
import { renderInput, getInitialValues, columns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { checkEditRecord } from 'Modules/Utils';
import { showLog, showWarn, showSuccess, cleanValuesBeforeSave, waitFor, firstKey } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { load } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { errorHandler } from 'functions';
import { createNewId } from 'utils';
import { checkCollection } from 'firebase/api';
import { showAlert } from 'functions';
import { createDoubleKeywords } from 'Modules/Utils';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { vehicleList } = useSelector(state => state.data);
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
    if (changeKey === 'productCode') {
      form.setFieldsValue({
        productName: vehicleList[val[changeKey]].name
      });
    }
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let items = [];
      snap.forEach((doc, id) => {
        items.push({ ...doc.data(), id: items.length });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('transferOut')
      .where('branchCode', '==', branch)
      .where('transferType', '==', 'transfer')
      .where('date', '==', date);
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

  const _onConfirm = async values => {
    try {
      load(true);
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      const dupSnap = await checkCollection('sections/stocks/transferOut', [
        ['keywords', 'array-contains', mValues.docNo.toLowerCase()]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.docNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }
      mValues.keywords = createDoubleKeywords(mValues.docNo);
      delete mValues.id;
      const sValues = cleanValuesBeforeSave(mValues);
      let _key = createNewId('WH-EX-TR');
      await api.setItem(
        {
          ...sValues,
          deleted: false,
          completed: false,
          created: Date.now(),
          inputBy: user.uid,
          _key
        },
        'sections/stocks/transferOut',
        _key
      );
      //  showLog({ addTransferOut: addTransferOut.id });
      load(false);
      _resetToInitial();
      showSuccess(() => showLog('Success'), `บันทึกสินค้าออก ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(values),
          module: 'ExportPartsByTransfer'
        }
      });
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
      await api.updateItem(newValues, 'sections/stocks/transferOut', newValues._key);
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
      let newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/stocks/transferOut', nData[index]._key);
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
          //  showLog({ values });
          return (
            <>
              <HiddenItem name="transferType" />
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="การโอนสินค้าออก"
                  subtitle="การจ่ายสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={1}
                />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values, form)}
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
