import React, { useContext, useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Collapse, Form, Skeleton } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import Footer from 'components/Footer';
import { renderInput, getInitialValues, columns, ExpandedRowRender, InitItem } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { checkEditRecord } from 'Modules/Utils';
import { showLog, showWarn, showSuccess, cleanValuesBeforeSave, waitFor, firstKey } from 'functions';
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
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.importId && !!pOrder.created;
    const activeStep = !(pOrder && pOrder.importDate) ? 0 : StatusMapToStep[pOrder?.status || 'pending'];
    // const readOnly = onBack?.path
    //   ? onBack.path === '/reports/income-expense-summary'
    //   : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let importId = createNewOrderId('WH-VEH');
      pOrder = { importId };
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
    setBranch(pOrder?.toDestination || user.homeBranch || (user?.allowedBranches?.[0]) || '0450');
    setDate(pOrder?.importDate || moment().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async val => {
    try {
      const changeKey = firstKey(val);
      if (['toDestination', 'importDate'].includes(changeKey)) {
        if (changeKey === 'toDestination') {
          setBranch(val[changeKey]);
          let mItems = form.getFieldValue('items');
          form.setFieldsValue({
            items: mItems.map(l => ({
              ...l,
              branchCode: val['toDestination'],
              toDestination: val['toDestination']
            }))
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
      if (changeKey === 'saleNo') {
        // TODO: Get saleId, saleNo, customerId, customer
        let sSnap = await checkCollection('sections/sales/vehicles', [['saleNo', '==', val[changeKey]]]);
        if (sSnap) {
          let sale = {};
          sSnap.forEach(doc => {
            sale = { ...doc.data(), _id: doc.id };
          });
          const { turnOverItems, saleId, saleNo, customer, customerId } = sale;
          let items = (turnOverItems || []).map(it => ({
            ...InitItem,
            vehicleType: it.vehicleType || null,
            productCode: it.productCode || null,
            productName: it.productName || null,
            vehicleNo: it.turnOverVehicleNo || [],
            peripheralNo: it.turnOverPeripheralNo || [],
            engineNo: it.turnOverEngineNo || [],
            year: it.year || null,
            workHours: it.workHours || null,
            unitPrice: it.unitPrice || null,
            model: it.model || null,
            qty: it.qty || 0,
            total: it.total || 0,
            completed: null,
            rejected: null,
            cancelled: null,
            deleted: null,
            toDestination: null
          }));
          form.setFieldsValue({
            items,
            saleId,
            saleNo,
            customer: customer || `${sale.prefix}${sale.firstName} ${sale.lastName}`.trim(),
            customerId: customerId || null
          });
        }
      }
    } catch (e) {
      showWarn(e);
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
      .collection('otherVehicleIn')
      .where('toDestination', '==', branch)
      .where('transferType', '==', 'other')
      .where('importDate', '==', date);
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, firestore, date]);

  const _resetToInitial = async () => {
    let importId = createNewOrderId('WH-VEH');
    form.resetFields();
    setProps({ ...initProps, order: { importId } });
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user, { importId }),
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
      const dupSnap = await checkCollection('sections/stocks/otherVehicleIn', [
        ['keywords', 'array-contains', mValues.docNo.toLowerCase()],
        ['deleted', '==', false]
      ]);
      if (dupSnap) {
        showAlert('มีรายการซ้ำ', `เอกสารเลขที่ ${mValues.docNo} มีบันทึกไว้แล้วในฐานข้อมูล`, 'warning');
        return;
      }
      showConfirm(() => _onConfirm(mValues, mItems), `รับสินค้าเข้า ${mItems.length} รายการ`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async (mValues, mItems) => {
    try {
      load(true);
      mItems = mValues.items.map(item => ({
        ...item,
        importId: mValues.importId
      }));
      mItems = cleanNumberFieldsInArray(mItems, ['qty']);
      mValues.items = mItems;
      mValues.keywords = createDoubleKeywords(mValues.docNo);
      const sValues = cleanValuesBeforeSave(mValues);
      const transferRef = firestore.collection('sections').doc('stocks').collection('otherVehicleIn');
      await transferRef.doc(mValues.importId).set({
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
      showSuccess(() => _resetToInitial(), `บันทึกการรับสินค้าเข้า ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'ImportVehiclesByOther'
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
      let newValues = checkEditRecord(nValues, data, user, nValues.importId);
      await api.updateItem(newValues, 'sections/stocks/otherVehicleIn', newValues.importId);
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
      let newValues = checkEditRecord(nValues, data, user, nData[index].importId);
      await api.updateItem(newValues, 'sections/stocks/otherVehicleIn', nData[index].importId);
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
                <HiddenItem name="saleId" />
                <HiddenItem name="saleNo" />
                <HiddenItem name="customerId" />
                <HiddenItem name="customer" />
                <BranchDateHeader
                  title="การรับสินค้าเข้า"
                  subtitle="อื่นๆ"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={mProps.activeStep}
                  branchName={'toDestination'}
                  dateName="importDate"
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
