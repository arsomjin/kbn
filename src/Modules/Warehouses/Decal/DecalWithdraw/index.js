import { PlusOutlined } from '@ant-design/icons';
import { Collapse, Form, Skeleton } from 'antd';
import EditableCellTable from 'components/EditableCellTable';
import Footer from 'components/Footer';
import { FirebaseContext } from '../../../../firebase';
import { showWarn } from 'functions';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row } from 'shards-react';
import { renderInput, columns, getInitialValues, expandedRowRender } from './api';
import BranchDateHeader from 'components/branch-date-header';
import { CommonSteps } from 'data/Constant';
import { showLog } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';
import { StatusMapToStep } from 'data/Constant';
import { createNewOrderId } from 'Modules/Account/api';
import { useMergeState } from 'api/CustomHooks';
import dayjs from 'dayjs';
import { waitFor } from 'functions';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import { firstKey } from 'functions';
import { checkCollection } from 'firebase/api';
import { getChanges } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { load } from 'functions';
import { showSuccess, showAlert } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { errorHandler } from 'functions';
import { showConfirm } from 'functions';

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

  const { users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [branch, setBranch] = useState(user?.branch || '0450');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const prevDoc = useRef({});

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.docId && !!pOrder.created;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder?.status || 'pending'];
    // const readOnly = onBack?.path
    //   ? onBack.path === '/reports/income-expense-summary'
    //   : false;
    // const columns = getColumns(isEdit);

    if (!isEdit) {
      let docId = createNewOrderId('WH-DECAL');
      pOrder = { docId };
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
    setDate(pOrder?.date || dayjs().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _resetToInitial = async () => {
    let prevBranch = branch;
    let prevDate = date;
    let docId = createNewOrderId('WH-DECAL');
    form.resetFields();
    setProps({ ...initProps, order: { docId } });
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user, { docId }),
      branchCode: prevBranch,
      date: prevDate
    });
    setBranch(prevBranch);
    setDate(prevDate);
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
          ...(!doc.data()?.decalWithdrawDate && {
            decalWithdrawDate: undefined
          })
        });
      });
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

  const _onValuesChange = async val => {
    try {
      let changeKey = firstKey(val);
      if (changeKey === 'docNo') {
        let vSnap = await checkCollection('sections/stocks/decal', [
          ['docNo', '==', val[changeKey]],
          ['deleted', '!=', true],
          ['isTakeOut', '==', false]
        ]);
        if (vSnap) {
          let item = {};
          vSnap.forEach(doc => {
            item = { ...doc.data(), _key: doc.id };
          });
          prevDoc.current = item;
          form.setFieldsValue({ ...item, decalWithdrawDate: undefined });
          setDate(item.date);
        } else {
          showAlert(
            'มีการเบิก / ยกเลิก ไปแล้ว',
            `เอกสารเลขที่ ${val[changeKey]} มีการเบิกแล้ว / หรือยกเลิกแล้ว`,
            'warning'
          );
        }
      } else if (changeKey === 'branchCode') {
        let prevDate = date;
        form.resetFields();
        await waitFor(0);
        form.setFieldsValue({
          ...getInitialValues(user, mProps.order),
          branchCode: val[changeKey],
          date: prevDate
        });
        setDate(prevDate);
        setBranch(val[changeKey]);
      } else if (changeKey === 'date') {
        setDate(val[changeKey]);
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const _onPreConfirm = async currentValues => {
    try {
      let values = await form.validateFields();
      let mValues = {
        ...currentValues,
        ...values,
        decalRecordedDate: currentValues.date
      };

      if (!mValues?.decalWithdrawDate || !mValues.picker || !mValues.urlChassis) {
        showAlert('กรุณาตรวจสอบข้อมูล', undefined, 'warning');
        return;
      }

      // const dupSnap = await checkCollection('sections/stocks/decal', [
      //   ['docNo', '==', mValues.docNo],
      // ]);
      // if (dupSnap) {
      //   showAlert(
      //     'มีรายการซ้ำ',
      //     `เอกสารเลขที่ ${mValues.docNo} มีบันทึกไว้แล้วในฐานข้อมูล`,
      //     'warning'
      //   );
      //   return;
      // }

      mValues.isDecal = true;

      showConfirm(() => _onConfirm(mValues), `การเบิกลอกลาย ${mValues.docNo}`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async mValues => {
    try {
      load(true);
      let docId;
      docId = mValues.docId;
      let changes = getChanges(prevDoc.current, mValues);
      mValues.editedBy = !!prevDoc?.editedBy
        ? [...prevDoc.editedBy, { uid: user.uid, time: Date.now(), changes }]
        : [{ uid: user.uid, time: Date.now(), changes }];
      mValues = cleanValuesBeforeSave(mValues);
      const { decalWithdrawDate, picker } = mValues;
      !!docId && (await api.updateItem({ decalWithdrawDate, picker, isTakeOut: true }, 'sections/stocks/decal', docId));

      //  showLog({ addDecal: addDecal.id });
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกการเบิกลอกลาย ${mValues.docNo} สำเร็จ`);
    } catch (e) {
      load(false);
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: cleanValuesBeforeSave({
          ...mValues,
          module: 'DecalWithdraw'
        })
      });
    }
  };

  const onUpdate = async row => {
    try {
      //  showLog('save', row);
      if (row.deleted) {
        return;
      }
      setLoading(true);
      let nValues = { ...row };
      delete nValues.id;
      //   let newValues = checkEditRecord(nValues, data, user);
      //   await api.updateItem(newValues, 'sections/stocks/decal', newValues._key);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const onDelete = async key => {
    try {
      setLoading(true);
      let nData = [...data];
      let index = nData.findIndex(item => item.key === key);
      //  showLog('deleted', nData[index]);
      let nValues = { ...nData[index], deleted: true };
      delete nValues.id;
      const newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/stocks/decal', nData[index]._key);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
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
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <>
              <div className="px-3 bg-white">
                <BranchDateHeader
                  title="เบิกลอกลายรถ"
                  subtitle="งานคลังสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={0}
                  dateRequired
                />
              </div>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values, form)}
                  <Footer
                    onConfirm={() => _onPreConfirm(values)}
                    onCancel={() => _resetToInitial()}
                    // cancelText="ล้างข้อมูล"
                    // cancelPopConfirmText="ล้าง?"
                    // okPopConfirmText="ยืนยัน?"
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
          expandedRowRender
        }}
      />
    </Container>
  );
};
