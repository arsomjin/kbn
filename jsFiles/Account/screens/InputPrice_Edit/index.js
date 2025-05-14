import React, { useCallback, useContext } from 'react';
import { Form } from 'antd';
import { FirebaseContext } from '../../../../firebase';
import { useMergeState } from 'api/CustomHooks';
import { Container, Col, Row } from 'shards-react';

import {
  renderHeader,
  checkItemsUpdated,
  RenderSummary,
  initialValues,
} from './api';
import { CheckOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  showWarn,
  arrayForEach,
  showConfirm,
  showSuccess,
  showAlert,
  firstKey,
} from 'functions';
import { Button, Stepper } from 'elements';
import { AccountSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import { checkCollection } from 'firebase/api';
import InputItems from './InputItems';
import { cleanValuesBeforeSave } from 'functions';
import { getEditArr } from 'utils';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import { Numb } from 'functions';

export default () => {
  const initMergeState = {
    mReceiveNo: null,
    noItemUpdated: false,
    deductDeposit: null,
    billDiscount: null,
    priceType: null,
    total: null,
    prevExpense: {},
  };

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const [cState, setCState] = useMergeState(initMergeState);

  const [form] = Form.useForm();

  const isInput = true;
  const activeStep = 1;

  const resetToInitial = useCallback(() => {
    form.resetFields();
    setCState(initMergeState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = async (val) => {
    try {
      let changeKey = firstKey(val);
      if (changeKey === 'billNoSKC') {
        let snap = await checkCollection('sections/account/expenses', [
          ['expenseType', '==', 'purchaseTransfer'],
          ['billNoSKC', '==', val[changeKey]],
        ]);
        if (snap) {
          snap.forEach((doc) => {
            form.setFieldsValue({
              items: doc.data().items,
              priceType: doc.data().priceType,
              taxInvoiceNo: doc.data().taxInvoiceNo,
              taxInvoiceDate: doc.data().taxInvoiceDate,
              taxFiledPeriod: doc.data().taxFiledPeriod,
              creditDays: doc.data().creditDays,
              dueDate: doc.data().dueDate,
              total: doc.data().total,
              billVAT: doc.data().billVAT,
              billTotal: doc.data().billTotal,
              receiveNo: doc.data().receiveNo,
            });
            setCState({
              total: doc.data().total,
              billDiscount: doc.data().billDiscount,
              deductDeposit: doc.data().deductDeposit,
              priceType: doc.data().priceType,
              mReceiveNo: doc.data().receiveNo,
              prevExpense: doc.data(),
            });
          });
        }
      }
    } catch (e) {
      showWarn(e);
    }
  };

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

  const { billDiscount, deductDeposit, priceType, total } = cState;

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
    async (mValues) => {
      try {
        mValues.dueDate = moment(mValues.dueDate).format('YYYY-MM-DD');
        const { billDiscount, deductDeposit, prevExpense } = cState;
        // Update expense
        // mValues = { billDiscount, creditDays, deductDeposit, dueDate, priceType, taxFiledPeriod, taxInvoiceDate, taxInvoiceNo }
        // {billDiscount, billTotal, billVAT, deductDeposit, billNo, branchCode, date, dealer, department, expenseType, inputBy, priceType, time, total}
        let expense = {
          ...prevExpense,
          ...mValues,
          total,
          billDiscount,
          deductDeposit,
          billVAT,
          billTotal,
          receiveNo: mValues.taxInvoiceNo,
        };

        let changes = getChanges(prevExpense, expense);
        if (!!mValues.items && mValues.items.length > 0) {
          const itemChanges = getArrayChanges(prevExpense.items, mValues.items);
          if (itemChanges) {
            changes = [...changes, ...itemChanges];
          }
        }
        expense.editedBy = !!expense?.editedBy
          ? [...expense.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];

        expense = cleanValuesBeforeSave(expense);

        await api.updateItem(
          expense,
          'sections/account/expenses',
          prevExpense.expenseId
        );

        // Update Payment Info
        !!mValues?.items &&
          (await arrayForEach(mValues.items, async (it) => {
            !!it?._id &&
              (await api.updateItem(
                {
                  // accountChecked: Date.now(),
                  // accountCheckedBy: user.uid,
                  // accountCheckedDate: moment().format('YYYY-MM-DD'),
                  unitPrice: it.unitPrice,
                  discount: it.discount,
                  total: it.total,
                  expenseId: prevExpense.expenseId,
                },
                mValues.docType === 'อะไหล่'
                  ? 'sections/stocks/importParts'
                  : 'sections/stocks/importVehicles',
                it._id
              ));
          }));
        showSuccess(
          () => resetToInitial(),
          !!mValues.billNoSKC
            ? `บันทึกราคาสินค้า ใบรับสินค้าเลขที่ ${mValues.billNoSKC} สำเร็จ`
            : 'บันทึกข้อมูลสำเร็จ',
          true
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [api, billTotal, billVAT, cState, resetToInitial, total, user.uid]
  );

  const preConfirm = useCallback(
    async (currentValues) => {
      const values = await form.validateFields();
      let mValues = { ...currentValues, ...values };
      if (!!mValues?.items && mValues.items.length === 0) {
        showAlert('ตรวจสอบข้อมูล', 'กรุณาป้อนรายการสินค้า', 'warning');
        return;
      }
      const itemsUpdated = checkItemsUpdated(mValues.items);
      if (!itemsUpdated) {
        setCState({ noItemUpdated: true });
        return;
      }
      let mItems = mValues.items.map((it) => ({
        ...it,
        priceType: mValues.priceType || null,
      }));
      mValues.items = mItems;
      showConfirm(
        () => onConfirm(mValues),
        `การบันทึกรายการ ${mValues?.billNoSKC || ''}`
      );
    },
    [form, onConfirm, setCState]
  );

  return (
    <div>
      <Container fluid className="main-content-container p-3">
        <Row noGutters className="page-header px-3 bg-light">
          <PageTitle
            sm="4"
            title="แก้ไขบันทึกราคาสินค้า"
            subtitle="บัญชี"
            className="text-sm-left"
          />
          {isInput && (
            <Col>
              <Stepper
                className="bg-light"
                steps={AccountSteps}
                activeStep={activeStep}
                alternativeLabel={false} // In-line labels
              />
            </Col>
          )}
        </Row>
        <Form
          form={form}
          layout="vertical"
          className="mt-2"
          // onFinish={onFinish}
          initialValues={initialValues}
          onValuesChange={_onValuesChange}
          style={{ alignItems: 'center' }}
          size="small"
        >
          {(values) => {
            //  showLog({ values });
            let editData = [];
            if (values.editedBy) {
              editData = getEditArr(values.editedBy, users);
            }
            return (
              <>
                {renderHeader({
                  form,
                  onPriceTypeChange,
                  values,
                  editData,
                })}
                <InputItems
                  items={values.items}
                  onChange={(dat) => {
                    form.setFieldsValue({
                      items: dat,
                      // billDiscount: dat.reduce(
                      //   (sum, elem) =>
                      //     sum + Numb(elem?.discount) * Numb(elem?.qty),
                      //   0
                      // ),
                    });
                    setCState({
                      total: dat.reduce(
                        (sum, elem) =>
                          sum +
                          (Number(elem?.qty) * Numb(elem?.unitPrice) -
                            Numb(elem?.discount)),
                        0
                      ),
                      // billDiscount: dat.reduce(
                      //   (sum, elem) =>
                      //     sum + Numb(elem?.discount) * Numb(elem?.qty),
                      //   0
                      // ),
                      ...(cState.noItemUpdated && { noItemUpdated: false }),
                    });
                  }}
                  // grant={grant}
                  noItemUpdated={cState.noItemUpdated}
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
                    onClick={() => preConfirm(values)}
                    icon={<CheckOutlined />}
                    className="mr-2 my-2"
                    size="middle"
                  >
                    บันทึกข้อมูล
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
      </Container>
    </div>
  );
};
