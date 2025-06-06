import React, { useEffect, useState, useCallback } from 'react';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { ChevronLeftOutlined, EditOutlined } from '@material-ui/icons';
import { Collapse, Form } from 'antd';
import moment from 'moment-timezone';
import numeral from 'numeral';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, CardFooter } from 'shards-react';

import { useMergeState } from 'api/CustomHooks';
import { TableSummary, getRules } from 'api/Table';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import Footer from 'components/Footer';
import HiddenItem from 'components/HiddenItem';
import InputModal from 'components/InputModal';
import { ExpenseType } from 'data/Constant';
import { Button, NotificationIcon } from 'elements';
import {
  errorHandler,
  deepEqual,
  cleanValuesBeforeSave,
  arrayForEach,
  Numb,
  showWarn,
  getVat,
  firstKey,
  distinctArr
} from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import { getEditArr } from 'utils';
import { checkExistingExpense } from '../../api';
import ExpenseHeader from '../expense-header';
import { columns, getInitItem, getInitValues, handleUpdate, initItemValues, renderInput, renderSummary } from './api';
import ChangeDepositModal from './components/ChangeDepositModal';
import { showConfirm } from 'functions';
import { showLog } from 'functions';

const ExpenseForm = ({ order, onConfirm, onBack, isEdit, readOnly, expenseType, setUnsaved }) => {
  const { user } = useSelector(state => state.auth);
  const { users, branches } = useSelector(state => state.data);
  const history = useHistory();

  // Always granted in this example (could be replaced by your own logic)
  const grant = true;

  // Header form (for document info) and item form (for adding new entries)
  const [headerForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  // State for table data, modal visibility, branch code, etc.
  const [data, setData] = useState([]);
  const [payByOther, setPayByOther] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useMergeState({ visible: false, data: [] });
  const [prev, setPrev] = useMergeState({ changeDeposit: [] });
  const [branchCode, setBranchCode] = useState(order?.branchCode || user.branch || '0450');

  // Track header date (required to enable lower form)
  const [headerDate, setHeaderDate] = useState(headerForm.getFieldValue('date') || null);

  /**
   * Reset header and item forms if the current header form values do not match the initial values.
   */
  const resetInitState = useCallback(
    (initValue = {}) => {
      const curValues = headerForm.getFieldsValue();
      const newValues = {
        ...getInitValues(order),
        branchCode: initValue.branchCode || branchCode,
        ...initValue
      };
      if (!deepEqual(curValues, newValues)) {
        headerForm.setFieldsValue(newValues);
        itemForm.setFieldsValue(getInitItem(null, initValue.branchCode || branchCode));
        setData([]);
      }
    },
    [branchCode, headerForm, itemForm, order]
  );

  /**
   * Update header data based on filters.
   */
  const updateData = useCallback(
    async filters => {
      try {
        const { date, branchCode: newBranchCode } = filters;
        setLoading(true);
        const updates = await handleUpdate(filters, { order, readOnly, onBack, isEdit }, user);
        if (!updates) {
          setLoading(false);
          return resetInitState({ date, branchCode: newBranchCode });
        }
        const {
          expenseId,
          expenseItems,
          changeDeposit,
          receiverEmployee,
          total,
          editedBy,
          totalDeposit,
          otherBranchPay
        } = updates;
        headerForm.setFieldsValue({
          expenseId,
          changeDeposit,
          receiverEmployee,
          total,
          billTotal: totalDeposit - total,
          editedBy
        });
        itemForm.setFieldsValue(getInitItem(null, newBranchCode));
        setBranchCode(newBranchCode);
        setPrev({ changeDeposit });
        if (totalDeposit && receiverEmployee) {
          await headerForm.validateFields();
        }
        setPayByOther(otherBranchPay);
        setData(expenseItems);
        setLoading(false);
      } catch (e) {
        showWarn(e);
        setLoading(false);
        errorHandler(e);
      }
    },
    [headerForm, itemForm, onBack, order, readOnly, isEdit, resetInitState, user, setPrev]
  );

  /**
   * Handle header form value changes.
   */
  const onHeaderValuesChange = changedValues => {
    const changedKey = firstKey(changedValues);
    const expenseId = headerForm.getFieldValue('expenseId');
    if (changedKey === 'branchCode') {
      const date = headerForm.getFieldValue('date');
      updateData({ ...changedValues, date, expenseId });
    } else if (changedKey === 'date') {
      setHeaderDate(changedValues.date);
      const branchCodeValue = headerForm.getFieldValue('branchCode');
      updateData({ ...changedValues, branchCode: branchCodeValue, expenseId });
    }
  };

  /**
   * Handle adding a new expense item.
   */
  const onAddConfirm = values => {
    const expenseItemId = createNewOrderId('KBN-ACC-EXP-IT');
    const newData = updateDataArr([
      ...data,
      {
        ...initItemValues,
        ...values,
        id: data.length,
        key: data.length,
        expenseItemId,
        _key: expenseItemId
      }
    ]);
    setData(newData);
    itemForm.resetFields();
    setUnsaved();
  };

  /**
   * Update an individual item in the table.
   */
  const onUpdateItem = row => {
    try {
      const newData = [...data];
      const index = newData.findIndex(item => row.key === item.key);
      if (index > -1) {
        newData.splice(index, 1, { ...newData[index], ...row });
      } else {
        newData.push(row);
      }
      setData(newData);
    } catch (errInfo) {
      showWarn('Update Failed:', errInfo);
    }
  };

  /**
   * Recalculate cumulative totals, balances, and VAT for the expense items.
   */
  const updateDataArr = dArr => {
    const changeDeposit = headerForm.getFieldValue('changeDeposit') || [];
    const totalChange = changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
    return dArr.map((it, i) => {
      if (it.total) {
        const pTotal = Numb(it.total) + dArr.slice(0, i).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
        const balance = totalChange - pTotal;
        const VAT = getVat(Number(it.total), it.priceType);
        return { ...it, balance, VAT };
      }
      return it;
    });
  };

  /**
   * Delete an expense item.
   */
  const onDeleteItem = key => {
    try {
      const expenseId = headerForm.getFieldValue('expenseId');
      let newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1 && expenseId) {
        const item = newData[index];
        // Mark as deleted if item exists on the server (_key exists)
        if (item._key) {
          newData.splice(index, 1, { ...item, deleted: true });
        } else {
          newData = newData.filter(l => l.key !== key);
        }
      } else {
        newData = newData
          .filter(l => l.key !== key)
          .map((l, n) => ({
            ...l,
            key: n,
            id: n
          }));
      }
      setData(newData);
    } catch (errInfo) {
      showWarn('Delete Failed:', errInfo);
    }
  };

  /**
   * Prepare values and show confirmation before final save.
   */
  const onPreConfirm = async values => {
    try {
      const updatedItems = updateDataArr(data);
      let nItems = [];
      // Process each expense item asynchronously
      await arrayForEach(updatedItems, async it => {
        const mItem = {
          ...initItemValues,
          ...it,
          expenseType,
          ...(!isEdit && {
            created: Date.now(),
            inputDate: moment().format('YYYY-MM-DD'),
            inputBy: user.uid
          })
        };
        // Remove unnecessary properties before saving
        delete mItem.balance;
        delete mItem.id;
        delete mItem.key;
        nItems.push(mItem);
      });
      let mValues = { ...values };
      const total = data.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      const totalDeposit = (values.changeDeposit || [])
        .filter(l => !l.deleted)
        .reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      mValues.total = total;
      mValues.billTotal = totalDeposit - total;
      mValues.items = nItems;

      if (!isEdit) {
        // Check if an expense already exists for the same branch/date/type
        const wheres = [
          ['expenseType', '==', 'dailyChange'],
          ['branchCode', '==', mValues.branchCode],
          ['date', '==', mValues.date]
        ];
        const eDoc = await checkExistingExpense(wheres);
        if (eDoc?.expenseId && eDoc.created && eDoc.date && eDoc.expenseId !== mValues.expenseId) {
          // Merge existing items if any
          if (eDoc?.items) {
            let mergedItems = nItems.concat(eDoc.items);
            nItems = distinctArr(mergedItems, ['expenseItemId']);
          }
          mValues = {
            ...eDoc,
            ...mValues,
            items: nItems,
            expenseId: eDoc.expenseId
          };
        }
      }
      showLog('[Expense-DailyChange]: ', {mValues})
      mValues = cleanValuesBeforeSave(mValues);
      showConfirm(
        () => onConfirm(mValues, resetInitState),
        `การบันทึกรายจ่ายเงินทอนประจำวัน สาขา${branches[mValues.branchCode].branchName} วันที่ ${moment(
          mValues.date,
          'YYYY-MM-DD'
        ).format('DD/MM/YYYY')} จำนวน ${nItems.length} รายการ`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  /**
   * Open the Change Deposit modal.
   */
  const showChangeDepositModal = () => {
    const depositArr = headerForm.getFieldValue('changeDeposit');
    setShowModal({ visible: true, data: depositArr || [] });
  };

  /**
   * Handle deposit change confirmation from modal.
   */
  const onDepositChange = changeDeposit => {
    headerForm.setFieldsValue({ changeDeposit });
    // Update table data after deposit change
    setData(updateDataArr(data));
    setShowModal({ visible: false, data: [] });
  };

  // Update header form when props change (for edit vs. new)
  useEffect(() => {
    if (isEdit) {
      headerForm.setFieldsValue({
        ...getInitValues(order),
        branchCode: branchCode
      });
      const { branchCode: bCode, date, expenseId } = order;
      updateData({ branchCode: bCode, date, expenseId });
    } else {
      resetInitState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, order, readOnly]);

  return (
    <div className="bg-white px-3 py-3">
      {/* Header Form */}
      <Form
        form={headerForm}
        onFinish={onPreConfirm}
        onValuesChange={onHeaderValuesChange}
        initialValues={{
          ...getInitValues(order),
          branchCode: order?.branchCode || user.branch || '0450'
        }}
        size="small"
        layout="vertical"
      >
        {values => {
          showLog({ values });
          const changeDepositTotal = (values.changeDeposit || [])
            .filter(l => !l.deleted)
            .reduce((sum, elem) => sum + Numb(elem.total), 0);

          const editData = values.editedBy ? getEditArr(values.editedBy, users) : [];
          return (
            <>
              <HiddenItem name="expenseId" />
              <HiddenItem name="changeDeposit" />
              <Row form>
                <Col md="8">
                  <ExpenseHeader disabled={!grant || readOnly} disableAllBranches />
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <div className="px-3 bg-white border mb-3 pt-3">
                <Row>
                  <Col md="4">
                    <Form.Item label={`รับ${expenseType === 'executive' ? 'เงิน' : ''}${ExpenseType[expenseType]}`}>
                      <Row className="justify-content-center">
                        <h6 className="text-primary mx-3">{numeral(changeDepositTotal).format('0,0.00')}</h6>
                        <h6 className="text-muted mr-3">บาท</h6>
                        <InputModal
                          name="changeDeposit"
                          onChange={val => {
                            const newChanges = [
                              ...(values.changeDeposit || []),
                              {
                                time: Date.now(),
                                total: val.changeDeposit,
                                by: user.uid,
                                deleted: false
                              }
                            ];
                            headerForm.setFieldsValue({
                              changeDeposit: newChanges
                            });
                            setData(updateDataArr(data));
                          }}
                          icon={<PlusOutlined />}
                          title={ExpenseType[expenseType]}
                          placeholder="จำนวนเงิน"
                          currency
                          rules={[
                            { required: true, message: 'กรุณาป้อนจำนวนเงิน' },
                            {
                              validator: (_, value) =>
                                !value || !isNaN(value)
                                  ? Promise.resolve()
                                  : Promise.reject('กรุณาป้อนจำนวนเงินเป็นตัวเลข')
                            }
                          ]}
                          disabled={!grant || readOnly}
                          okText="ตกลง"
                          cancelText="ยกเลิก"
                        />
                        {values.changeDeposit && values.changeDeposit.length > 0 && (
                          <Button
                            icon={<EditOutlined />}
                            shape="circle"
                            className="ml-3"
                            onClick={showChangeDepositModal}
                          />
                        )}
                      </Row>
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="receiverEmployee" label="ผู้รับเงิน" rules={getRules(['required'])}>
                      <EmployeeSelector disabled={!grant || readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          );
        }}
      </Form>

      {/* Lower Form (disabled if header date is missing) */}
      <fieldset disabled={!headerDate} style={{ border: 'none', padding: 0 }}>
        {!headerDate && (
          <div style={{ marginBottom: 16, color: 'red' }}>กรุณากรอกวันที่ในส่วนหัว เพื่อเปิดใช้งานแบบฟอร์มด้านล่าง</div>
        )}
        <Form
          form={itemForm}
          initialValues={getInitItem(null, branchCode)}
          layout="vertical"
          size="small"
          onFinish={onAddConfirm}
        >
          {values => (
            <Collapse className="mb-3">
              <Collapse.Panel header="บันทึกข้อมูล" key="1">
                {renderInput({ values, grant, readOnly, user })}
                <Footer
                  onConfirm={() => itemForm.submit()}
                  onCancel={() => itemForm.resetFields()}
                  cancelText="ล้างข้อมูล"
                  cancelPopConfirmText="ล้าง?"
                  okPopConfirmText="ยืนยัน?"
                  okText="เพิ่มรายการ"
                  okIcon={<PlusOutlined />}
                  disabled={!grant || readOnly}
                />
              </Collapse.Panel>
            </Collapse>
          )}
        </Form>
      </fieldset>

      <EditableCellTable
        dataSource={data.filter(l => !l.isChevrolet)}
        columns={columns}
        onUpdate={onUpdateItem}
        onDelete={onDeleteItem}
        loading={loading}
        summary={pageData => <TableSummary pageData={pageData} dataLength={columns.length} startAt={7} />}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
      />

      {data.some(l => l.isChevrolet) && (
        <div className="mt-2">
          <label className="text-primary">รายจ่าย เชฟโรเลต</label>
          <EditableCellTable
            dataSource={data.filter(l => l.isChevrolet)}
            columns={columns}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            loading={loading}
            summary={pageData => <TableSummary pageData={pageData} dataLength={columns.length} startAt={5} />}
          />
        </div>
      )}

      {renderSummary(data, headerForm, branches, payByOther)}

      <CardFooter className="d-flex justify-content-end m-3">
        {readOnly && (
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
          onClick={() => headerForm.submit()}
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

      <ChangeDepositModal
        obj={showModal}
        onCancel={() => setShowModal({ visible: false, data: [] })}
        onOk={onDepositChange}
      />
    </div>
  );
};

export default ExpenseForm;
