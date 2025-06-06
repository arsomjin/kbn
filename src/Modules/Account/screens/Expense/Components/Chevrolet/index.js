import React, { useContext, useEffect, useRef, useState } from 'react';
import { Container, CardFooter } from 'shards-react';
import { createNewOrderId } from 'Modules/Account/api';
import { StatusMapToStep } from 'data/Constant';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { renderInput, getInitValues } from './api';
import {
  showWarn,
  getChanges,
  showLog,
  load,
  showSuccess,
  showConfirm,
  getVat,
  getArrayChanges,
  cleanValuesBeforeSave,
  firstKey,
  showMessageBar,
  arrayForEach,
  formatDate
} from 'functions';
import { FirebaseContext } from '../../../../../../firebase';
import { Button, Collapse, Form } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import Footer from 'components/Footer';
import { PlusOutlined } from '@ant-design/icons';
import { CommonSteps } from 'data/Constant';
import { getEditArr } from 'utils';
import { CheckOutlined, ChevronLeftOutlined } from '@material-ui/icons';
import { checkCollection } from 'firebase/api';
import { Numb } from 'functions';

export default props => {
  // showLog('props', props);
  const history = useHistory();
  let location = useLocation();
  //  showLog('location', location.pathname);
  const isInput = location.pathname === '/expense-chevrolet';
  const params = location.state?.params;

  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const { firestore, api } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [order, setOrder] = useState({});
  const [isEdit, setIsEdit] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const { readOnly, onBack } = params || {};

  const grant = true;
  // user.isDev || (user.permissions && user.permissions.permission202);

  const [form] = Form.useForm();

  const expenseRef = useRef(null);
  const expenseItemsRef = useRef(null);

  const _onValuesChange = val => {
    //  showLog({ val });
    const changeKey = firstKey(val);
    if (['branchCode', 'date'].includes(changeKey)) {
      if (changeKey === 'branchCode') {
        form.setFieldsValue({ branchCode: val[changeKey] });
      } else {
        form.setFieldsValue({ selectedDate: val[changeKey] });
      }
    }
  };

  useEffect(() => {
    let mOrder = params?.order;
    if (!(mOrder && mOrder?.orderId)) {
      let orderId = createNewOrderId();
      mOrder = { orderId };
    }

    const initBranchCode = mOrder?.branchCode || user.branch || '0450';
    const initDate = mOrder?.date || moment().format('YYYY-MM-DD');
    const mEdit = !!mOrder && !!mOrder.date && !!mOrder.created;
    const mActive = !mOrder?.date ? 0 : StatusMapToStep[mOrder?.status || 'pending'];

    setOrder(mOrder);
    setIsEdit(mEdit);
    setActiveStep(mActive);
    form.setFieldsValue({
      branchCode: initBranchCode,
      selectedDate: initDate
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onAddConfirm = values => {
    // showLog('add_confirm', values);
    const expenseItemId = createNewOrderId('KBN-ACC-EXP-IT');
    let newData = [
      ...data,
      {
        // ...initItemValues,
        ...values,
        id: data.length,
        key: data.length,
        expenseItemId,
        _key: expenseItemId
      }
    ];
    newData = updateDataArr(newData);
    setData(newData);
    // form2.resetFields();
  };

  const onUpdateItem = async row => {
    try {
      const newData = [...data];
      const index = newData.findIndex(item => row.key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
      } else {
        newData.push(row);
      }
      setData(newData);
    } catch (errInfo) {
      showWarn('Update Failed:', errInfo);
    }
  };

  const updateDataArr = dArr => {
    let result = dArr.map((it, i) => {
      if (it.total) {
        const pTotal = Numb(it.total) + dArr.slice(0, i).reduce((sum, elem) => sum + Numb(elem?.total), 0);
        // const balance = Numb(change) - pTotal;
        const VAT = getVat(Number(it.total), it.priceType);
        // it.balance = balance;
        it.VAT = VAT;
      }
      return it;
    });
    return result;
  };

  const onDeleteItem = async key => {
    try {
      // let expenseId = form.getFieldValue('expenseId');
      let newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        if (newData[index]._key) {
          newData.splice(index, 1, { ...item, deleted: true });
        } else {
          newData = newData.filter(l => l.key !== key);
        }
      } else {
        newData = newData.filter(l => l.key !== key);
        newData = newData.map((l, n) => ({ ...l, key: n, id: n }));
      }
      // showLog({ newData });
      setData(newData);
    } catch (errInfo) {
      showWarn('Delete Failed:', errInfo);
    }
  };

  const confirmUpdate = async mItems => {
    try {
      //  showLog({ row, mItems });
      load(true);
      let updateRef = firestore.collection('sections').doc('account').collection('expenses');
      let updateItemsRef = firestore.collection('sections').doc('account').collection('expenseItems');

      // Add Expense
      // { billTotal, branchCode, date, changeDeposit, expenseId, expenseType, inputBy, time, total }
      const total = mItems.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      const beforeVAT = mItems.reduce((sum, elem) => sum + Numb(elem.beforeVAT), 0);
      const VAT = mItems.reduce((sum, elem) => sum + Numb(elem.VAT), 0);
      const whTax = mItems.reduce((sum, elem) => sum + Numb(elem.whTax), 0);
      const netTotal = mItems.reduce((sum, elem) => sum + Numb(elem.netTotal), 0);
      const hasWHTax = mItems.length === 1 ? mItems[0].hasWHTax : 'Mixed';
      const whTaxDoc = mItems.length === 1 ? mItems[0].whTaxDoc : 'Mixed';
      const priceType = mItems.length === 1 ? mItems[0].priceType : 'Mixed';
      const branchCode = form.getFieldValue('branchCode');
      const selectedDate = form.getFieldValue('selectedDate');

      let expense = {
        branchCode,
        date: formatDate(selectedDate),
        // expenseType,
        ...(!isEdit && { inputDate: moment().format('YYYY-MM-DD') }),
        ...(!isEdit && { inputBy: user.uid }),
        created: Date.now(),
        total,
        beforeVAT,
        VAT,
        whTax,
        netTotal,
        hasWHTax,
        whTaxDoc,
        priceType
      };
      if (!expenseRef.current?.expenseId) {
        // Check today branch's expense list to find expenseId.
        let expenses = [];
        let expenseId = '';
        const snap = await checkCollection('sections/account/expenses', [
          ['date', '==', selectedDate],
          ['branchCode', '==', branchCode],
          ['expenseType', '==', 'executive']
        ]);
        if (snap) {
          snap.forEach(doc => {
            expenses.push({
              ...doc.data(),
              _key: doc.id,
              id: expenses.length,
              key: expenses.length
            });
          });
          // showLog({ expenses });
          if (expenses.length > 0) {
            expense = { ...expenses[0], ...expense };
            expenseId = expense[0].expenseId;
          }
        } else {
          expenseId = createNewOrderId('KBN-ACC-EXP');
        }

        let cValues = cleanValuesBeforeSave(
          {
            ...expense,
            expenseId,
            _key: expenseId
          },
          true
        );
        await updateRef.doc(expenseId).set(cValues);
        // Add Items
        await arrayForEach(mItems, async it => {
          const mIt = cleanValuesBeforeSave(
            {
              ...it,
              expenseId
            },
            true
          );
          await updateItemsRef.doc(it._key).set(mIt);
        });
      } else {
        let expenseId;
        if (isEdit) {
          expenseId = order.expenseId;
          let values = { ...order, ...expense };
          let changes = getChanges(order, values);
          if (expenseItemsRef.current && mItems) {
            const itemChanges = getArrayChanges(expenseItemsRef.current, mItems);
            if (itemChanges) {
              changes = [...changes, ...itemChanges];
            }
          }
          values.editedBy = !!order?.editedBy
            ? [...order.editedBy, { uid: user.uid, time: Date.now(), changes }]
            : [{ uid: user.uid, time: Date.now(), changes }];
          let mValues = cleanValuesBeforeSave(values, true);
          await updateRef.doc(order.expenseId).set(mValues);
        } else if (expenseRef?.current) {
          expenseId = expenseRef.current.expenseId || createNewOrderId('KBN-ACC-EXP');
          let values = { ...expenseRef.current, ...expense };
          if (expenseRef.current?.created && expense.created - expenseRef.current.created > 300000) {
            let changes = getChanges(expenseRef.current, values);
            if (expenseItemsRef.current && mItems) {
              const itemChanges = getArrayChanges(expenseItemsRef.current, mItems);
              if (itemChanges) {
                changes = [...changes, ...itemChanges];
              }
            }
            values.editedBy = !!expenseRef.current?.editedBy
              ? [...expenseRef.current.editedBy, { uid: user.uid, time: Date.now(), changes }]
              : [{ uid: user.uid, time: Date.now(), changes }];
          }
          let mValues = cleanValuesBeforeSave(values, true);
          await updateRef.doc(expenseId).set(mValues);
        }
        await arrayForEach(mItems, async it => {
          let mIt = { ...it, expenseId };
          delete mIt.key;
          delete mIt.id;
          mIt = cleanValuesBeforeSave(mIt, true);
          await updateItemsRef.doc(it._key).set(mIt);
        });
      }
      load(false);
      showSuccess(
        () => (isEdit ? history.push(onBack.path, { params: onBack }) : showLog('Success!')),
        // : _resetToInitial(),
        'บันทึกข้อมูลสำเร็จ',
        true
      );
    } catch (e) {
      showWarn(e);
      showMessageBar(e.message);
      load(false);
    }
  };

  const _onConfirm = async () => {
    try {
      // showLog('confirm', values);
      const branchCode = form.getFieldValue('branchCode');
      const selectedDate = form.getFieldValue('selectedDate');
      let nItems = [];
      let dArr = updateDataArr(data);
      await arrayForEach(dArr, async it => {
        let mItem = JSON.parse(JSON.stringify(it));
        mItem = {
          // ...initItemValues,
          ...it,
          created: Date.now(),
          date: selectedDate,
          branchCode,
          // expenseType,
          ...(!isEdit && { inputBy: user.uid })
        };
        delete mItem.balance;
        delete mItem.id;
        delete mItem.key;
        nItems.push(mItem);
      });
      showConfirm(() => confirmUpdate(nItems), `การบันทึกรายจ่าย ${nItems.length} รายการ`);
    } catch (e) {
      showWarn(e);
    }
  };

  //   const columns = getColumns(isEdit);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={getInitValues(order)}
        layout="vertical"
        size="small"
        onFinish={_onAddConfirm}
        onValuesChange={_onValuesChange}
      >
        {values => {
          //  showLog({ values });
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
          }
          return (
            <>
              <div className="bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="รายจ่าย เชฟโรเลต"
                  subtitle="บัญชี"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={0}
                  dateLabel="วันที่บันทึก"
                />
              </div>
              <Collapse className="mb-3">
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput()}
                  <Footer
                    onConfirm={() => form.submit()}
                    onCancel={() => form.resetFields()}
                    cancelText="ล้างข้อมูล"
                    cancelPopConfirmText="ล้าง?"
                    okPopConfirmText="ยืนยัน?"
                    okText="เพิ่มรายการ"
                    okIcon={<PlusOutlined />}
                  />
                </Collapse.Panel>
              </Collapse>
            </>
          );
        }}
      </Form>
      {/* <EditableCellTable
        dataSource={data}
        columns={columns}
        onUpdate={onUpdate}
        onDelete={onDelete}
        loading={loading}
        summary={(pageData) => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={6}
          />
        )}
      /> */}
      <CardFooter className="d-flex justify-content-end m-3">
        {isEdit && (
          <Button
            onClick={() => history.push(onBack.path, { params: onBack })}
            size="middle"
            icon={<ChevronLeftOutlined />}
            className="mr-3"
          >
            {'กลับ'}
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => _onConfirm()}
          size="middle"
          icon={<CheckOutlined />}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {'บันทึกข้อมูล'}
        </Button>
      </CardFooter>
    </Container>
  );
};
