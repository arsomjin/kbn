import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Form, Collapse, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { FirebaseContext } from '@/contexts/FirebaseContext';
import { useMergeState } from '@/hooks/useMergeState';
import { showLog, showWarn, showSuccess, showConfirm, errorHandler } from '@/utils/notifications';
import { cleanValuesBeforeSave, firstKey, waitFor, deepEqual, load, getChanges } from '@/utils/helpers';
import { checkEditRecord } from '@/modules/utils';
import { createNewOrderId } from '@/modules/account/api';
import { StatusMapToStep, StatusMap } from '@/constants/status';
import { Button } from '@/components/elements';
import EditableCellTable from '@/components/EditableCellTable';
import { TableSummary } from '@/api/Table';
import BranchDateHeader from '@/components/branch-date-header';
import Footer from '@/components/Footer';

import { getColumns, getInitItem, renderInput } from './api';
import { BankDepositItem, BankDepositState } from './types';

interface FirebaseContextType {
  firestore: any;
  api: {
    updateItem: (values: any, path: string, key: string) => Promise<void>;
    addLog: (log: any, type: string, category: string) => void;
  };
}

interface ErrorWithCode extends Error {
  code?: string;
}

const initProps: BankDepositState = {
  order: {} as BankDepositItem,
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true
};

const DailyBankDeposit: React.FC = () => {
  const { t } = useTranslation('dailyBankDeposit');
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state?.params;

  const { user } = useSelector((state: any) => state.auth);
  const { users } = useSelector((state: any) => state.data);
  const { firestore, api } = useContext(FirebaseContext) as FirebaseContextType;

  const [form] = Form.useForm();

  const [mProps, setProps] = useMergeState<BankDepositState>(initProps);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BankDepositItem[]>([]);
  const [branch, setBranch] = useState(user.branch || '0450');
  const [date, setDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit = !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.depositId;
    const activeStep = !(pOrder && pOrder.date) ? 0 : StatusMapToStep[pOrder.status || 'pending'];
    const readOnly = onBack?.path ? onBack.path === '/reports/daily-bank-deposit' : false;

    if (!isEdit) {
      let depositId = createNewOrderId();
      pOrder = { depositId } as BankDepositItem;
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
  }, [params, user.branch]);

  const _onValuesChange = (val: Record<string, any>) => {
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
    const handleUpdates = (snap: any) => {
      setLoading(true);
      let items: BankDepositItem[] = [];
      snap.forEach((doc: any) => {
        items.push({
          ...doc.data(),
          id: items.length,
          _key: doc.id,
          key: doc.id
        });
      });
      setData(items);
      setLoading(false);
    };

    const query = firestore
      .collection('sections')
      .doc('account')
      .collection('bankDeposit')
      .where('branchCode', '==', branch)
      .where('date', '==', date || DateTime.now().toFormat('yyyy-MM-dd'));

    let unsubscribe = query.onSnapshot(handleUpdates, (err: any) => showLog(err));
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

  const onUpdate = async (row: BankDepositItem) => {
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

  const onDelete = async (key: string) => {
    try {
      load(true);
      let nData = [...data];
      let index = nData.findIndex(item => item.key === key);
      let nValues = { ...nData[index], deleted: true };
      delete nValues.id;
      let newValues = checkEditRecord(nValues, data, user);
      if (!nData[index]._key) {
        throw new Error('Document key is missing');
      }
      await api.updateItem(newValues, 'sections/account/bankDeposit', nData[index]._key as string);
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirmOrder = async (values: BankDepositItem) => {
    try {
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
        mValues.created = DateTime.now().toMillis();
        mValues.createdBy = user.uid;
        mValues.status = StatusMap.pending;
      }
      const bankDepositRef = firestore
        .collection('sections')
        .doc('account')
        .collection('bankDeposit')
        .doc(values.depositId);

      const docSnap = await bankDepositRef.get();
      if (docSnap.exists) {
        bankDepositRef.update(mValues);
      } else {
        bankDepositRef.set(mValues);
      }

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
            navigate(mProps.onBack.path, { state: { params: mProps.onBack } });
          } else {
            let depositId = createNewOrderId();
            resetToInitial();
            setProps({ ...initProps, order: { depositId } as BankDepositItem });
            form.setFieldsValue({
              ...getInitItem({ depositId }),
              branchCode: user.branch || '0450'
            });
          }
        },
        t('success.save', { id: mValues.depositId }),
        true
      );
    } catch (e) {
      showWarn(e);
      const error = e as ErrorWithCode;
      errorHandler({
        code: error.code || '',
        message: error.message || '',
        snap: { ...values, module: 'DailyBankDeposit' }
      });
      load(false);
    }
  };

  if (!ready) {
    return <Skeleton active />;
  }

  return (
    <div className="container-fluid">
      <BranchDateHeader
        form={form}
        branch={branch}
        date={date}
        onValuesChange={_onValuesChange}
        readOnly={mProps.readOnly}
      />
      <div className="main-content-container container-fluid px-4">
        <div className="page-header py-4">
          <h1 className="page-title">{t('title')}</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <Form
              form={form}
              onFinish={_onConfirmOrder}
              initialValues={getInitItem(mProps.order)}
              onValuesChange={_onValuesChange}
            >
              {renderInput()}
              <EditableCellTable
                columns={getColumns(mProps.isEdit)}
                dataSource={data}
                loading={loading}
                onUpdate={onUpdate}
                onDelete={onDelete}
                summary={(pageData: BankDepositItem[]) => {
                  const total = pageData.reduce((sum: number, item: BankDepositItem) => sum + (item.total || 0), 0);
                  return <TableSummary total={total} />;
                }}
              />
              <Footer>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  disabled={mProps.readOnly}
                >
                  {t('button.save')}
                </Button>
              </Footer>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBankDeposit; 