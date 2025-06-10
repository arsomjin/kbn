import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form, Skeleton } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import Footer from 'components/Footer';
import { renderInput, getInitialValues, columns, ExpandedRowRender } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { checkEditRecord } from 'Modules/Utils';
import { showLog, showWarn, showSuccess, cleanValuesBeforeSave, waitFor, firstKey } from 'functions';
import { FirebaseContext } from '../../../../firebase';
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
import { createDoubleKeywords } from 'Modules/Utils';
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
  const history = useHistory();
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
    let isEdit = !!pOrder && !!pOrder.deliverId && !!pOrder.created;
    const activeStep = !(pOrder && pOrder.deliveredDate) ? 0 : StatusMapToStep[pOrder?.status || 'pending'];
    // const readOnly = onBack?.path
    //   ? onBack.path === '/reports/income-expense-summary'
    //   : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let deliverId = createNewOrderId('PLAN-BRANCH');
      pOrder = { deliverId };
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
    setDate(pOrder?.date || moment().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = val => {
    const changeKey = firstKey(val);
    if (['fromOrigin', 'date'].includes(changeKey)) {
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
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('deliver')
      .where('fromOrigin', '==', branch)
      .where('deliverType', '==', 'branchDelivery')
      .where('date', '==', date);
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, firestore, date]);

  const _resetToInitial = async () => {
    let prevBranch = branch;
    let prevDate = date;
    let deliverId = createNewOrderId('PLAN-BRANCH');
    form.resetFields();
    setProps({ ...initProps, order: { deliverId } });
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user, { deliverId }),
      branchCode: prevBranch,
      date: prevDate,
      fromOrigin: prevBranch
    });
    setBranch(prevBranch);
    setDate(prevDate);
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
      const dupSnap = await checkCollection('sections/stocks/deliver', [
        ['keywords', 'array-contains', mValues.docNo.toLowerCase()],
        ['deleted', '==', false]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.docNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }
      showConfirm(() => _onConfirm(mValues, mItems), `แผนขนส่ง โอนย้ายสินค้า ${mItems.length} รายการ`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async (mValues, mItems) => {
    try {
      load(true);
      mItems = mValues.items.map(item => ({
        ...item,
        deliverId: mValues.deliverId
      }));
      mItems = cleanNumberFieldsInArray(mItems, ['qty']);
      mValues.items = mItems;
      mValues.keywords = createDoubleKeywords(mValues.docNo);
      const sValues = cleanValuesBeforeSave(mValues);
      const deliverRef = firestore.collection('sections').doc('stocks').collection('deliver');
      await deliverRef.doc(mValues.deliverId).set({
        ...sValues,
        docNo_lower: mValues.docNo.toLowerCase(),
        docNo_partial: partialText(mValues.docNo),
        deleted: false,
        completed: false,
        rejected: false,
        created: Date.now(),
        inputBy: user.uid
      });
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกแผนขนส่ง โอนย้ายสินค้า ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'PlanDeliverBranch'
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
      let newValues = checkEditRecord(nValues, data, user, nValues.deliverId);
      await api.updateItem(newValues, 'sections/stocks/deliver', newValues.deliverId);
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
      let newValues = checkEditRecord(nValues, data, user, nData[index].deliverId);
      await api.updateItem(newValues, 'sections/stocks/deliver', nData[index].deliverId);
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
              <HiddenItem name="deliverType" />
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="แผนการส่งรถสาขา"
                  subtitle="คลังสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={mProps.activeStep}
                  branchName={'fromOrigin'}
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
