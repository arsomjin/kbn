import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form, Skeleton } from 'antd';
import { Container } from 'shards-react';
// import { useHistory } from 'react-router'; // Unused
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import Footer from 'components/Footer';
import { renderInput, getInitialValues, columns, ExpandedRowRender, statusSnap } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { checkEditRecord } from 'Modules/Utils';
import { showLog, showWarn, showSuccess, cleanValuesBeforeSave, firstKey } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { load } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { useLocation } from 'react-router-dom';
import { createNewOrderId } from 'Modules/Account/api';
import { showMessageBar } from 'functions';
import { cleanNumberFieldsInArray } from 'functions';
import { partialText } from 'utils';
import { showAlert } from 'functions';
import { checkCollection } from 'firebase/api';
import { errorHandler } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import { StatusMapToStep } from 'data/Constant';
import { showConfirm } from 'functions';
import { createKeywords } from 'utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { uniq } from 'lodash';
import { Numb } from 'functions';

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
  columns: []
};

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  // const history = useHistory(); // Unused but kept for future use
  let location = useLocation();
  const params = location.state?.params;

  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || '0450');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.transferId && !!pOrder.created;
    const activeStep = !(pOrder && pOrder.exportDate) ? 0 : StatusMapToStep[pOrder?.status || 'pending'];
    // const readOnly = onBack?.path
    //   ? onBack.path === '/reports/income-expense-summary'
    //   : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let transferId = createNewOrderId('WH-VEH');
      pOrder = { transferId };
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        // readOnly,
        onBack
        // columns,
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        // readOnly,
        onBack
        // columns,
      });
    }
    setBranch(pOrder?.fromOrigin || user.homeBranch || (user?.allowedBranches?.[0]) || '0450');
    setDate(pOrder?.exportDate || moment().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = val => {
    const changeKey = firstKey(val);
    if (['fromOrigin', 'exportDate'].includes(changeKey)) {
      if (changeKey === 'fromOrigin') {
        setBranch(val[changeKey]);
        let mItems = form.getFieldValue('items');
        form.setFieldsValue({
          items: mItems.map(l => ({
            ...l,
            branchCode: val['fromOrigin'],
            fromOrigin: val['fromOrigin']
          })),
          branchCode: val['fromOrigin']
        });
      } else {
        setDate(val[changeKey]);
      }
    }
    if (changeKey === 'toDestination') {
      let mItems = form.getFieldValue('items');
      form.setFieldsValue({
        items: mItems.map(l => ({
          ...l,
          toDestination: val[changeKey]
        }))
      });
    }
    if (changeKey === 'isUsed') {
      let mItems = form.getFieldValue('items');
      form.setFieldsValue({
        items: mItems.map(l => ({ ...l, isUsed: val['isUsed'] }))
      });
    }
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let items = [];
      snap.forEach(doc => {
        items.push({
          ...doc.data(),
          ...(!doc.data()?.isUsed && { isUsed: false }),
          id: items.length,
          key: items.length,
          status: !!doc.data()?.completed
            ? 'สำเร็จ'
            : !!doc.data()?.rejected
              ? 'ตีกลับ'
              : !!doc.data()?.deleted
                ? 'ยกเลิก'
                : 'รอดำเนินการ'
        });
      });
      // showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('transfer')
      .where('fromOrigin', '==', branch)
      .where('transferType', '==', 'transfer')
      .where('exportDate', '==', date);
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, firestore, date]);

  const _resetToInitial = async () => {
    let transferId = createNewOrderId('WH-VEH');
    form.resetFields();
    setProps({ ...initProps, order: { transferId } });
    form.setFieldsValue({
      ...getInitialValues(user, { transferId }),
      branchCode: branch,
      fromOrigin: branch,
      exportDate: date
    });
    setBranch(branch);
    setDate(date);
  };

  const _preConfirm = async values => {
    try {
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      mValues = { ...values, ...mValues };
      delete mValues.id;
      // Check items.
      if (!mValues?.items) {
        load(false);
        showMessageBar('ไม่มีรายการสินค้า', 'กรุณาเลือกรายการรถหรืออุปกรณ์', 'warning');
        return;
      }

      let mItems = mValues.items.filter(l => !!l.productCode && Numb(l.qty) > 0);
      if (mItems.length === 0) {
        load(false);
        showMessageBar('ไม่มีรายการสินค้า', 'กรุณาเลือกรายการรถหรืออุปกรณ์', 'warning');
        return;
      }
      const dupSnap = await checkCollection('sections/stocks/transfer', [
        ['keywords', 'array-contains', mValues.docNo.toLowerCase()],
        ['deleted', '==', null]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.docNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }
      showConfirm(() => _onConfirm(mValues, mItems), `โอนสินค้าออก ${mItems.length} รายการ`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async (mValues, mItems) => {
    try {
      load(true);
      mItems = mValues.items.map(item => ({
        ...item,
        transferId: mValues.transferId
      }));
      mItems = cleanNumberFieldsInArray(mItems, ['qty']);
      mValues.items = mItems;
      let docNo_lower = mValues.docNo.toLowerCase();
      let key1 = createKeywords(docNo_lower);
      let key2 = createKeywords(removeAllNonAlphaNumericCharacters(docNo_lower));
      let keywords = uniq([...key1, ...key2]);
      const sValues = cleanValuesBeforeSave(mValues);
      const transferRef = firestore.collection('sections').doc('stocks').collection('transfer');
      await transferRef.doc(mValues.transferId).set({
        ...sValues,
        docNo_lower,
        keywords,
        docNo_partial: partialText(mValues.docNo),
        ...statusSnap,
        created: Date.now(),
        inputBy: user.uid
      });
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกการโอนสินค้าออก ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'ExportVehiclesByTransfer'
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
      // Check editing.
      let newValues = checkEditRecord(nValues, data, user, nValues.transferId);
      await api.updateItem(newValues, 'sections/stocks/transfer', newValues.transferId);
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
      let nValues = {
        ...nData[index],
        deleted: { by: user.uid, time: Date.now() }
      };
      delete nValues.id;
      let newValues = checkEditRecord(nValues, data, user, nData[index].transferId);
      await api.updateItem(newValues, 'sections/stocks/transfer', nData[index].transferId);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onItemEdit = record => {
    // For debugging: show log and update record
    showLog({ edit_record: record });
    onUpdate(record);
  };

  if (!ready) {
    return <Skeleton active />;
  }

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={getInitialValues(user, mProps.order)}
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
                  activeStep={mProps.activeStep}
                  branchName={'fromOrigin'}
                  dateName="exportDate"
                  branchRequired
                  dateRequired
                />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values, form)}
                  <Footer
                    onConfirm={() => _preConfirm(values)}
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
        expandable={{
          expandedRowRender: rec => ExpandedRowRender(rec, _onItemEdit)
        }}
        rowClassName={(record, index) => {
          //  showLog({ record });
          return record?.deleted
            ? 'deleted-row'
            : record?.completed
              ? 'recorded-row'
              : record?.rejected
                ? 'rejected-row'
                : 'editable-row';
        }}
      />
    </Container>
  );
};
