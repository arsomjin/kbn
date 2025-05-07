import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Form } from 'antd';
import { Button } from 'elements';
import { FirebaseContext } from '../../../../../../firebase';
import { showWarn } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import EditableCellTable from 'components/EditableCellTable';
import { getBillOptions } from 'api/Input';

import {
  columns,
  expandedRowRender,
  renderHeader,
  getWarehouseCheckedData,
  checkItemsUpdated,
  RenderSummary,
  initialValues,
} from './api';
import { CheckOutlined } from '@ant-design/icons';
import moment from 'moment';
import { arrayForEach } from 'functions';
import { showConfirm } from 'functions';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { showAlert } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';

export default ({
  expenses,
  expenseNames,
  selectedDate,
  branchCode,
  expenseType,
}) => {
  const initMergeState = {
    mReceiveNo: null,
    noItemUpdated: false,
    deductDeposit: null,
    billDiscount: null,
    priceType: null,
  };

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [filteredData, setFData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cState, setCState] = useMergeState(initMergeState);

  const [form] = Form.useForm();

  const _getData = useCallback(async () => {
    try {
      const stockImportArr = await getWarehouseCheckedData(firestore);
      setData(stockImportArr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    _getData();
  }, [_getData]);

  const resetToInitial = useCallback(() => {
    setLoading(true);
    _getData();
    form.resetFields();
    setCState(initMergeState);
    setFData([]);
  }, [_getData, form, initMergeState, setCState]);

  const onBillSelect = (bl) => {
    let fData = data.filter(
      (l) => l.receiveNo === bl.value || l.billNoSKC === bl.value
    );
    fData = fData.map((it, i) => ({ ...it, id: i }));
    fData.length > 0 && form.setFieldsValue({ priceType: fData[0].priceType });
    setFData(fData);
    setCState({ mReceiveNo: bl, mPurchaseDoc: null, mVpNo: null });
  };

  const onUpdate = (row) => {
    // showLog('save', row);
    let mRow = { ...row };
    if (Number(mRow.unitPrice) > Numb(mRow.discount)) {
      mRow.total =
        (Number(mRow.unitPrice) - Numb(mRow.discount)) * Numb(mRow.import);
    }
    let newData = [...filteredData];
    const index = newData.findIndex((item) => mRow.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...mRow });
    setFData(newData);
    cState.noItemUpdated && setCState({ noItemUpdated: false });
  };

  const billOptions = getBillOptions(data, ['receiveNo', 'billNoSKC']);

  const footer = cState.noItemUpdated
    ? () => <h6 className="text-danger">กรุณาป้อนราคาสินค้า</h6>
    : undefined;

  const onBillDiscountChange = (e) => {
    const billDiscount = Numb(e.target.value);
    if (isNaN(billDiscount)) {
      return;
    }
    // showLog({ billDiscount });
    setCState({ billDiscount });
  };

  const onDeductDepositChange = (e) => {
    const deductDeposit = Numb(e.target.value);
    if (isNaN(deductDeposit)) {
      return;
    }
    setCState({ deductDeposit });
  };

  const onPriceTypeChange = (priceType) => {
    form.setFieldsValue({ priceType });
    setCState({ priceType });
  };

  const { billDiscount, deductDeposit, priceType } = cState;

  const total = filteredData.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  const afterDiscount = Numb(total) - Numb(billDiscount);
  const afterDepositDeduct =
    Numb(total) - Numb(billDiscount) - Numb(deductDeposit);
  const billVAT =
    priceType === 'noVat'
      ? 0
      : afterDepositDeduct
      ? afterDepositDeduct * 0.07
      : null;
  const billTotal =
    Numb(total) -
    Numb(billDiscount) -
    Numb(deductDeposit) +
    (priceType === 'includeVat' ? 0 : Numb(billVAT));

  const onConfirm = useCallback(
    async (values) => {
      try {
        const values = await form.validateFields();
        let mValues = { ...values };
        mValues.dueDate = moment(mValues.dueDate).format('YYYY-MM-DD');
        mValues.taxInvoiceDate = moment(mValues.taxInvoiceDate).format(
          'YYYY-MM-DD'
        );
        const itemsUpdated = checkItemsUpdated(filteredData);
        if (!itemsUpdated) {
          setCState({ noItemUpdated: true });
          return;
        }
        const { billDiscount, deductDeposit, mReceiveNo } = cState;
        // Add expense
        // mValues = { billDiscount, creditDays, deductDeposit, dueDate, priceType, taxFiledPeriod, taxInvoiceDate, taxInvoiceNo }
        // {billDiscount, billTotal, billVAT, deductDeposit, billNo, branchCode, date, dealer, department, expenseType, inputBy, priceType, time, total}
        let expense = {
          ...mValues,
          total,
          billVAT,
          billTotal,
          expenseType,
          receiveNo: mReceiveNo.value,
          branchCode,
          date: moment(selectedDate).format('YYYY-MM-DD'),
          time: Date.now(),
          inputBy: user.uid,
        };
        let expenseId = createNewOrderId('ACC-EXP');
        await firestore
          .collection('sections')
          .doc('account')
          .collection('expenses')
          .doc(expenseId)
          .set({ ...expense, expenseId });
        await api.updateItem(
          { _key: expenseId, expenseId },
          'sections/account/expenses',
          expenseId
        );
        // Update Payment Info
        await arrayForEach(filteredData, async (it) => {
          await api.updateItem(
            {
              accountChecked: Date.now(),
              accountCheckedBy: user.uid,
              accountCheckedDate: moment().format('YYYY-MM-DD'),
              unitPrice: it.unitPrice,
              discount: it.discount,
              total: it.total,
              expenseId: expenseId,
            },
            'sections/stocks/importVehicles',
            it._key
          );
        });
        showSuccess(
          () => resetToInitial(),
          cState.mReceiveNo
            ? `บันทึกข้อมูลใบรับสินค้าเลขที่ ${cState.mReceiveNo.value} สำเร็จ`
            : 'บันทึกข้อมูลสำเร็จ',
          true
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [
      api,
      billTotal,
      billVAT,
      branchCode,
      cState,
      expenseType,
      filteredData,
      firestore,
      form,
      resetToInitial,
      selectedDate,
      setCState,
      total,
      user.uid,
    ]
  );

  const preConfirm = useCallback(async () => {
    if (!cState.mReceiveNo) {
      showAlert('ตรวจสอบข้อมูล', 'กรุณาป้อนเลขที่ใบรับสินค้า', 'warning');
      return;
    }
    const values = await form.validateFields();
    if (filteredData.length === 0) {
      showAlert('ตรวจสอบข้อมูล', 'กรุณาป้อนรายการสินค้า', 'warning');
      return;
    }
    showConfirm(
      () => onConfirm(values),
      `การบันทึกรายการ ${cState.mReceiveNo ? cState.mReceiveNo?.value : ''}`
    );
  }, [cState.mReceiveNo, filteredData.length, form, onConfirm]);

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="mt-2"
        // onFinish={onFinish}
        initialValues={initialValues}
        style={{ alignItems: 'center' }}
        size="small"
      >
        {renderHeader({
          form,
          onBillSelect,
          cState,
          billOptions,
          onPriceTypeChange,
        })}
        <EditableCellTable
          dataSource={filteredData}
          columns={columns}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.name !== 'Not Expandable',
          }}
          onUpdate={onUpdate}
          noItemUpdated={cState.noItemUpdated}
          // reset={reset}
          loading={loading}
          footer={footer}
        />
        {RenderSummary({
          total,
          afterDiscount,
          afterDepositDeduct,
          billVAT,
          billTotal,
          priceType,
          onBillDiscountChange,
          onDeductDepositChange,
        })}
        <div className="border-bottom bg-white p-3 text-right">
          <Button
            type="primary"
            onClick={preConfirm}
            icon={<CheckOutlined />}
            className="mr-2 my-2"
            size="middle"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </Form>
    </div>
  );
};
