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
import { renderInput, getInitialValues, columns, expandedRowRender, getValuesFromDoc } from './api';
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
import { showAlert } from 'functions';
import { errorHandler, showConfirm } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import { StatusMapToStep } from 'data/Constant';
import { getDoc } from '../../../../../firebase/api';
import { checkDuplicateInventoryItem } from 'utils';
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
  const [transferType, setType] = useState('transfer');
  const [selects, setSelected] = useState([]);
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.transferId && !!pOrder.created;
    const activeStep = !(pOrder && pOrder.importDate) ? 0 : StatusMapToStep[pOrder?.status || 'pending'];
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
    setBranch(pOrder?.origin || user.branch || '0450');
    setDate(pOrder?.importDate || moment().format('YYYY-MM-DD'));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = async val => {
    try {
      //  showLog({ val });
      const changeKey = firstKey(val);
      if (changeKey === 'toDestination') {
        // form.resetFields();
        // form.setFieldsValue({
        //   toDestination: val[changeKey],
        //   importDate: date,
        // });
        setBranch(val[changeKey]);
      } else if (changeKey === 'importDate') {
        setDate(val[changeKey]);
      } else if (changeKey === 'transferType') {
        setType(val[changeKey]);
        val[changeKey] === 'skc' && form.setFieldsValue({ origin: 'SKC' });
      } else if (changeKey === 'docNo' && !!transferType) {
        // Get values from docNo.
        await getValuesFromDoc(val[changeKey], transferType, form);
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
      showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('stocks')
      .collection('transfer')
      .where('toDestination', '==', branch)
      .where('transferType', '==', 'transfer')
      .where('importDate', '==', date);
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
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user, { transferId }),
      toDestination: branch,
      importDate: date
    });
    setBranch(branch);
    setDate(date);
  };

  const _preConfirm = async values => {
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
      if (selects.length === 0) {
        load(false);
        showMessageBar('ไม่มีรายการสินค้าที่เลือก', 'กรุณาเลือกรายการรถหรืออุปกรณ์ เพื่อรับสินค้า/ตีกลับ', 'warning');
        return;
      }
      // Check duplicate existings inventory.
      const isDuplicate = await checkDuplicateInventoryItem(mItems, 'toDestination');
      if (isDuplicate) {
        const { duplicatedVehicles, duplicatedPeripherals } = isDuplicate;
        load(false);
        let info = duplicatedVehicles.length > 0 ? `หมายเลขรถที่ซ้ำ ${duplicatedVehicles.join(',')}, ` : '';
        info =
          duplicatedPeripherals.length > 0 ? `${info}หมายเลขอุปกรณ์ที่ซ้ำ ${duplicatedPeripherals.join(',')}` : info;
        showAlert('มีรายการสินค้าแล้วในคลังสินค้า', info, 'warning');
        return;
      }
      showConfirm(
        () => _onConfirm(mValues, mItems),
        `${mValues.acceptance ? 'รับสินค้า' : 'ตีกลับสินค้า'} ${selects.length} รายการ`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async (mValues, mItems) => {
    try {
      load(true);
      // Accept
      if (mValues.acceptance) {
        mItems = mValues.items.map(item => ({
          ...item,
          ...(selects.includes(item.key) &&
            !item.completed && {
              completed: {
                ref: mValues.transferId,
                importVerifiedBy: mValues.importVerifiedBy,
                time: Date.now()
              }
            })
        }));
      } else {
        // Reject
        mValues.rejected = true;
        mItems = mValues.items.map(item => ({
          ...item,
          ...(selects.includes(item.key) &&
            !item.rejected && {
              rejected: {
                ref: mValues.transferId,
                importVerifiedBy: mValues.importVerifiedBy,
                time: Date.now()
              }
            })
        }));
      }
      // Check numeric fields
      mItems = cleanNumberFieldsInArray(mItems, ['qty']);
      mValues.items = mItems;
      // Check values before saving.
      const sValues = cleanValuesBeforeSave(mValues);
      let doc = await getDoc('sections', `stocks/transfer/${mValues.transferId}`);
      // Check source documents.
      if (!doc) {
        return errorHandler({
          message: 'ไม่พบเอกสารย้ายสินค้าออกจากต้นทาง',
          snap: {
            ...sValues,
            module: 'ImportVehiclesByTransfer'
          }
        });
      }
      const transferRef = firestore.collection('sections').doc('stocks').collection('transfer');
      if (mValues.acceptance) {
        await transferRef.doc(mValues.transferId).set({
          ...doc,
          ...sValues,
          ...(mItems.filter(l => !l.completed).length === 0 && {
            completed: {
              ref: mValues.transferId,
              importVerifiedBy: mValues.importVerifiedBy,
              time: Date.now()
            }
          }),
          deleted: false
        });
      } else {
        await transferRef.doc(mValues.transferId).set({
          ...doc,
          ...sValues,
          ...(mItems.filter(l => !l.rejected).length === 0 && {
            rejected: {
              ref: mValues.transferId,
              importVerifiedBy: mValues.importVerifiedBy,
              time: Date.now()
            }
          }),
          deleted: false
        });
      }
      load(false);
      showSuccess(() => _resetToInitial(), `บันทึกการรับโอนสินค้าเข้า ${sValues.docNo} สำเร็จ`, true);
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(mValues),
          module: 'ImportVehiclesByTransfer'
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
      await api.updateItem(newValues, 'sections/stocks/transfer', newValues._key);
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
      await api.updateItem(newValues, 'sections/stocks/transfer', nData[index]._key);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onSelect = keys => {
    //  showLog({ keys });
    setSelected(keys);
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
                  title="การโอนสินค้าเข้า"
                  subtitle="การรับสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={mProps.activeStep}
                  branchName="toDestination"
                  dateName="importDate"
                  branchRequired
                  dateRequired
                />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values, form, onSelect, selects)}
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
          expandedRowRender
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
