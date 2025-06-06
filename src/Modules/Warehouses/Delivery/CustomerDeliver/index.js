import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Form, Skeleton } from 'antd';
import { Container } from 'shards-react';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import { renderHeader, getInitialValues, columns, ExpandedRowRender, getValues } from './api';
import { showLog, showWarn, showSuccess, cleanValuesBeforeSave, waitFor, firstKey, load, showAlert } from 'functions';
import { checkCollection } from 'firebase/api';
import { FirebaseContext } from '../../../../firebase';
import HiddenItem from 'components/HiddenItem';
import EditableCellTable from 'components/EditableCellTable';
import { errorHandler } from 'functions';
import { createNewId } from 'utils';
import { StatusMapToStep } from 'data/Constant';
import { useMergeState } from 'api/CustomHooks';
import { useHistory, useLocation } from 'react-router-dom';
import { showMessageBar } from 'functions';
import { showConfirm } from 'functions';
import { cleanNumberFieldsInArray } from 'functions';
import { partialText } from 'utils';
import Footer from 'components/Footer';
import { PlusOutlined } from '@ant-design/icons';
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
  const [saleItems, setItems] = useState([]);
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
      let deliverId = createNewId('PLAN-CUS');
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
    setBranch(pOrder?.branchCode || user.branch || '0450');
    setDate(pOrder?.date || moment().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async val => {
    try {
      //  showLog({ val });
      setLoading(true);
      const changeKey = firstKey(val);
      if (['branchCode', 'date'].includes(changeKey)) {
        if (changeKey === 'branchCode') {
          form.resetFields();
          let pDate = date;
          form.setFieldsValue({
            branchCode: val[changeKey],
            date: pDate
          });
          setBranch(val[changeKey]);
        } else {
          setDate(val[changeKey]);
        }
      } else if (changeKey === 'saleNo') {
        if (val[changeKey] && val[changeKey] !== 'all') {
          await getValues(val[changeKey], branch, date, form, setItems);
        }
      }
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let mItems = [];
      snap.forEach(doc => {
        mItems.push({
          ...doc.data(),
          ...(!doc.data()?.isUsed && { isUsed: false }),
          id: mItems.length,
          key: mItems.length,
          status: !!doc.data()?.completed
            ? 'สำเร็จ'
            : !!doc.data()?.rejected
              ? 'ตีกลับ'
              : !!doc.data()?.deleted
                ? 'ยกเลิก'
                : 'รอดำเนินการ'
        });
      });
      //  showLog({ mItems });
      setData(mItems);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('deliver')
      .where('branchCode', '==', branch)
      .where('deliverType', '==', 'customerDelivery')
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
    let deliverId = createNewId('PLAN-CUS');
    form.resetFields();
    setProps({ ...initProps, order: { deliverId } });
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user, { deliverId }),
      branchCode: prevBranch,
      date: prevDate
    });
    setBranch(prevBranch);
    setDate(prevDate);
  };

  const _onPreConfirm = async values => {
    try {
      let mValues = await form.validateFields();
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
      showConfirm(
        () => _onConfirm(mValues, mItems),
        `แผนการส่งรถลูกค้า เลขที่ ${mValues.docNo} จำนวน ${mItems.length} รายการ`
      );
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
        completed: !!mValues.receivedBy && !!mValues.receivedDate,
        rejected: false,
        canceled: false,
        created: Date.now(),
        inputBy: user.uid
      });
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกแผนการส่งรถลูกค้า ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'PlanDeliverCustomer'
        }
      });
    }
  };

  const onUpdate = row => {
    // showLog('update', row);
    let newData = [...data];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setData(newData);
  };

  showLog({ data });

  const _onItemEdit = record => {
    return showLog({ edit_record: record });
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
        onFinish={_onPreConfirm}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                <HiddenItem name="saleId" />
                <HiddenItem name="saleDate" />
                <HiddenItem name="saleNo" />
                <HiddenItem name="customerId" />
                <HiddenItem name="recordedBy" />
                <BranchDateHeader
                  title="แผนการส่งรถลูกค้า"
                  subtitle="คลังสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={1}
                  branchRequired
                  dateRequired
                />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderHeader(values, form)}
                  <Footer
                    onConfirm={() => _onPreConfirm(values)}
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
        // onDelete={onDelete}
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
