import { PlusOutlined } from '@ant-design/icons';
import { Collapse, Form, Skeleton } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import BranchDateHeader from 'components/branch-date-header';
import { StatusMapToStep } from 'data/Constant';
import { showLog, showWarn } from 'functions';
import { showConfirm } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { firstKey } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { CardFooter, Container, Row } from 'shards-react';
import { getEditArr } from 'utils';
import { getColumns, getInitItem, renderInput } from './api';
import Footer from 'components/Footer';
import { FirebaseContext } from '../../../../../firebase';
import dayjs from 'dayjs';
import { waitFor } from 'functions';
import { deepEqual } from 'functions';
import { checkEditRecord } from 'Modules/Utils';
import { load } from 'functions';
import { getChanges } from 'functions';
import { StatusMap } from 'data/Constant';
import { showSuccess } from 'functions';
import { Button } from 'elements';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import HiddenItem from 'components/HiddenItem';
import { errorHandler } from 'functions';
import { PermissionGate } from 'components';
import { usePermissions } from 'hooks/usePermissions';

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true
};

const DailyBankDeposit = () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const { firestore, api } = useContext(FirebaseContext);
  const { hasPermission } = usePermissions();

  const [form] = Form.useForm();

  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [branch, setBranch] = useState(user.branch || '0450');
  const [date, setDate] = useState(undefined);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.depositId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/daily-bank-deposit' : false;

    if (!isEdit) {
      let depositId = createNewOrderId();
      pOrder = { depositId };
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack
      });
    }
    setBranch(pOrder?.branchCode || user.branch || '0450');
    setDate(pOrder?.date || undefined);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _onValuesChange = val => {
    const changeKey = firstKey(val);
    if (['branchCode', 'date'].includes(changeKey)) {
      if (changeKey === 'branchCode') {
        setBranch(val[changeKey]);
      } else {
        setDate(val[changeKey]);
      }
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
          _key: doc.id,
          key: doc.id
        });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    const query = firestore
      .collection('sections')
      .doc('account')
      .collection('bankDeposit')
      .where('branchCode', '==', branch)
      .where('date', '==', date || dayjs().format('YYYY-MM-DD'));
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, date, firestore]);

  const resetToInitial = async () => {
    form.resetFields();
    await waitFor(100);
    form.setFieldsValue({
      branchCode: branch,
      date
    });
  };

  const onUpdate = async row => {
    try {
      let editId = data.findIndex(l => l._key === row._key);
      if (row.deleted || deepEqual(data[editId], row)) {
        return;
      }
      load(true);
      let nValues = { ...row };
      delete nValues.id;
      let newValues = checkEditRecord(nValues, data, user);
      await api.updateItem(newValues, 'sections/account/bankDeposit', newValues._key);
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
      await api.updateItem(newValues, 'sections/account/bankDeposit', nData[index]._key);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirmOrder = async values => {
    try {
      //  showLog('confirm_values', values);

      let mValues = JSON.parse(JSON.stringify(values));
      if (!mProps?.order && !mProps.order?.depositId) {
        errorHandler({ message: 'NO_BANK_DEPOSIT_ID' });
        return;
      }
      if (mProps.isEdit) {
        let changes = getChanges(mProps.order, values);
        mValues.editedBy = !!mProps.order.editedBy
          ? [...mProps.order.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
      } else {
        mValues.created = dayjs().valueOf();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }
      const bankDepositRef = firestore
        .collection('sections')
        .doc('account')
        .collection('bankDeposit')
        .doc(values.depositId);
      // Add bankDeposit order.
      const docSnap = await bankDepositRef.get();
      if (docSnap.exists) {
        bankDepositRef.update(mValues);
      } else {
        bankDepositRef.set(mValues);
      }
      // Record log.
      api.addLog(
        mProps.isEdit
          ? {
              time: Date.now(),
              type: 'edited',
              by: user.uid,
              docId: mValues.depositId
            }
          : {
              time: Date.now(),
              type: 'created',
              by: user.uid,
              docId: mValues.depositId
            },
        'bankDeposit',
        'daily'
      );
      load(false);
      showSuccess(
        () => {
          if (mProps.isEdit && mProps.onBack) {
            history.push(mProps.onBack.path, { params: mProps.onBack });
          } else {
            let depositId = createNewOrderId();
            resetToInitial();
            setProps({ ...initProps, order: { depositId } });
            form.setFieldsValue({
              ...getInitItem({ depositId }),
              branchCode: user.branch || '0450'
            });
          }
        },
        `บันทึกข้อมูลเลขที่ ${mValues.depositId} สำเร็จ`,
        true
      );
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { ...values, module: 'DailyBankDeposit' }
      });
      load(false);
    }
  };

  const _onPreConfirm = async values => {
    try {
      //  showLog({ values });
      let mValues = cleanValuesBeforeSave(values);

      // showLog('clean values', mValues);
      showConfirm(() => _onConfirmOrder(mValues), `บันทึกข้อมูลเลขที่ ${mValues.depositId}`);
    } catch (e) {
      showWarn(e);
    }
  };

  const mColumns = getColumns(mProps.isEdit);
  showLog({ data });

  return !ready ? (
    <Skeleton active />
  ) : (
    <PermissionGate permission="accounting.view">
      <Container fluid className="main-content-container p-3">
        <Form
          form={form}
          initialValues={{
            ...getInitItem(mProps.order),
            branchCode: mProps.order?.branchCode || user.branch || '0450'
          }}
          layout="vertical"
          size="small"
          onFinish={_onPreConfirm}
          onValuesChange={_onValuesChange}
        >
        {values => {
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
          }
          return (
            <>
              <HiddenItem name="depositId" />
              <div className="bg-white border-bottom">
                <BranchDateHeader
                  title="เงินฝากธนาคาร - ประจำวัน"
                  subtitle="บัญชี"
                  disableAllBranches
                  // steps={CommonSteps}
                  activeStep={0}
                  dateLabel="วันที่บันทึก"
                  onlyUserBranch={user.branch}
                />
              </div>
              <Collapse className="mb-3">
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput()}
                  <PermissionGate permission="accounting.edit">
                    <Footer
                      onConfirm={() => form.submit()}
                      onCancel={() => form.resetFields()}
                      cancelText="ล้างหน้าจอ"
                      cancelPopConfirmText="ล้าง?"
                      okPopConfirmText="ยืนยัน?"
                      okText="บันทึกรายการ"
                      okIcon={<PlusOutlined />}
                    />
                  </PermissionGate>
                </Collapse.Panel>
              </Collapse>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={mColumns}
        onUpdate={onUpdate}
        onDelete={onDelete}
        loading={loading}
        summary={pageData => <TableSummary pageData={pageData} dataLength={mColumns.length} startAt={5} />}
      />
      {mProps.isEdit && (
        <CardFooter className="border-top ">
          <Row style={{ justifyContent: 'flex-end' }} form>
            <Row
              style={{
                justifyContent: 'flex-end',
                marginRight: 10
              }}
              form
            >
              <Button
                onClick={() => history.push(mProps.onBack.path, { params: mProps.onBack })}
                className="mr-3"
                size="middle"
                // type="primary"
              >
                &larr; กลับ
              </Button>
            </Row>
          </Row>
        </CardFooter>
      )}
      </Container>
    </PermissionGate>
  );
};

export default DailyBankDeposit;
