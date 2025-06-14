import React, { useCallback, useContext, useState } from 'react';
import { Form } from 'antd';
import { FirebaseContext } from '../../../../firebase';
import { useMergeState } from 'api/CustomHooks';
import { Container, Col, Row } from 'shards-react';

import { renderHeader, checkItemsUpdated, RenderSummary, initialValues } from './api';
import { CheckOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { showWarn, arrayForEach, showConfirm, showSuccess, showAlert, firstKey, sortArr } from 'functions';
import { Button, Stepper } from 'elements';
import { AccountSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import { createNewId } from 'utils';
import { checkCollection } from 'firebase/api';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import InputItems from './InputItems';
import { cleanValuesBeforeSave } from 'functions';
import { getNameFromUid } from 'Modules/Utils';
import { Numb } from 'functions';

export default () => {
  const initMergeState = {
    mReceiveNo: null,
    noItemUpdated: false,
    deductDeposit: null,
    billDiscount: null,
    priceType: null,
    total: null
  };

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { users, employees } = useSelector(state => state.data);
  const [cState, setCState] = useMergeState(initMergeState);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const isInput = true;
  const activeStep = 0;

  const resetToInitial = useCallback(() => {
    form.resetFields();
    setCState(initMergeState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = async val => {
    try {
      let changeKey = firstKey(val);
      if (changeKey === 'billNoSKC') {
        setLoading(true);
        let snap = await checkCollection('sections/stocks/importParts', [
          ['billNoSKC', '==', val[changeKey]]
          // ['warehouseChecked', '!=', null],
        ]);
        if (snap) {
          let arr = [];
          let warehouseNotCheckedArr = [];
          let warehouseCheckedArr = [];
          let accountCheckedArr = [];
          snap.forEach(doc => {
            const {
              billNoSKC,
              branch,
              branchCode,
              discount,
              docDate,
              docNo,
              invoiceDate,
              peripheralNo,
              priceType,
              productCode,
              productName,
              purchaseNo,
              seller,
              startBalance,
              storeLocationCode,
              total,
              unit,
              unitPrice,
              warehouseChecked,
              warehouseCheckedBy,
              warehouseCheckedDate,
              warehouseInputBy,
              warehouseReceiveDate,
              keywords,
              accountChecked
            } = doc.data();
            let item = {
              billNoSKC,
              branch,
              branchCode,
              discount,
              docDate,
              docNo,
              invoiceDate,
              peripheralNo,
              priceType,
              productCode,
              productName,
              purchaseNo,
              seller,
              startBalance,
              storeLocationCode,
              total,
              unit,
              unitPrice,
              unitPrice_original: unitPrice,
              warehouseChecked,
              warehouseCheckedBy,
              warehouseCheckedDate,
              warehouseInputBy,
              warehouseReceiveDate,
              keywords,
              _id: doc.id,
              qty: doc.data()?.import || 1
            };
            if (!!accountChecked) {
              accountCheckedArr.push(item);
            }
            if (!warehouseChecked) {
              warehouseNotCheckedArr.push(item);
            } else {
              warehouseCheckedArr.push(item);
            }
            arr.push(item);
          });
          // showLog({
          //   accountCheckedArr,
          //   warehouseCheckedArr,
          //   warehouseNotCheckedArr,
          // });
          // Check document.
          if (accountCheckedArr.length === arr.length) {
            showAlert(
              'บันทึกราคาสินค้าแล้ว',
              `ฝ่ายบัญชีบันทึกราคาสินค้าแล้ว ${
                !!accountCheckedArr[0].accountCheckedDate
                  ? `เมื่อวันที่ ${moment(accountCheckedArr[0].accountCheckedDate, 'YYYY-MM-DD').format('D/MM/YYYY')}`
                  : ''
              } ${
                !!accountCheckedArr[0].accountCheckedBy
                  ? `โดยคุณ ${getNameFromUid({
                      uid: accountCheckedArr[0].accountCheckedBy,
                      users,
                      employees
                    })}`
                  : ''
              }`,
              'warning'
            );
            return;
          }
          if (warehouseCheckedArr.length === 0) {
            showAlert(
              'ยังไม่ได้ตรวจรับ',
              `ฝ่ายคลังสินค้า ยังไม่ได้ตรวจรับ ${warehouseNotCheckedArr[0]?.billNoSKC || ''}`
            );
            return;
          }

          if (warehouseCheckedArr.length > 0) {
            // showLog('arr', arr);
            let mArr = [];
            await arrayForEach(
              warehouseCheckedArr.filter(l => !l.deleted),
              async (it, id) => {
                let productPCode = removeAllNonAlphaNumericCharacters(it.productCode);
                let lpSnap = await checkCollection('data/products/partList', [['pCode', '==', productPCode]]);
                let lp = null;
                if (lpSnap) {
                  lpSnap.forEach(lpDoc => {
                    lp = { ...lpDoc.data(), _id: lpDoc.id };
                  });
                }
                // creditTerm, listPrice
                // showLog({ productPCode, lp });
                mArr.push({
                  ...it,
                  ...(!!lp && {
                    // creditTerm: lp.creditTerm,
                    unitPrice: lp.slp,
                    unitPrice_original: lp.slp,
                    total: Numb(lp.slp) * Numb(it.qty)
                  })
                });
              }
            );
            mArr = sortArr(mArr, 'importTime');
            mArr = mArr.map((od, id) => ({
              ...od,
              id,
              key: id
            }));
            // showLog({ val, mArr });
            form.setFieldsValue({
              items: mArr,
              priceType: mArr[0].priceType
              // creditDays: mArr[0].creditTerm,
            });
            setCState({
              total: mArr.reduce((sum, elem) => sum + Numb(elem?.total), 0)
            });
          }
        }
        setLoading(false);
      } else if (['creditDays', 'taxInvoiceDate'].includes(changeKey)) {
        let taxInvoiceDate = form.getFieldValue('taxInvoiceDate');
        let creditDays = form.getFieldValue('creditDays');
        //  showLog({ value, taxInvoiceDate });
        if (!creditDays || isNaN(creditDays)) {
          return;
        }
        if (!!taxInvoiceDate) {
          form.setFieldsValue({
            dueDate: moment(taxInvoiceDate).add(creditDays, 'days')
          });
        } else {
          form.setFieldsValue({
            dueDate: moment().add(creditDays, 'days')
          });
        }
      }
    } catch (e) {
      setLoading(false);
      showWarn(e);
    }
  };

  const footer = cState.noItemUpdated ? () => <h6 className="text-danger">กรุณาป้อนราคาสินค้า</h6> : undefined;

  const onBillDiscountChange = e => {
    const billDiscount = Numb(e.target.value);
    if (isNaN(billDiscount)) {
      return;
    }
    // showLog({ billDiscount });
    setCState({ billDiscount });
  };

  const onDeductDepositChange = e => {
    const deductDeposit = Numb(e.target.value);
    if (isNaN(deductDeposit)) {
      return;
    }
    setCState({ deductDeposit });
  };

  const onPriceTypeChange = priceType => {
    // total, items (unitPrice),
    let items = form.getFieldValue('items');
    // showLog({ priceType, items });
    let arr = items.map(it => {
      let unitPrice =
        priceType === 'separateVat' ? (Number(it.unitPrice_original) / 1.07).toFixed(3) : it.unitPrice_original;
      return { ...it, priceType, unitPrice };
    });
    let total = arr.reduce((sum, elem) => sum + (Number(elem?.qty) * Numb(elem?.unitPrice) - Numb(elem?.discount)), 0);
    // showLog({ total });
    total = total.toFixed(4);
    form.setFieldsValue({ priceType, items: arr });
    setCState({ priceType, total });
  };

  const { billDiscount, deductDeposit, priceType, total } = cState;

  const afterDiscount = Numb(total) - Numb(billDiscount);
  const afterDepositDeduct = Numb(total) - Numb(billDiscount) - Numb(deductDeposit);
  const billVAT = priceType === 'noVat' ? 0 : afterDepositDeduct ? afterDepositDeduct * 0.07 : null;
  const billTotal =
    Numb(total) - Numb(billDiscount) - Numb(deductDeposit) + (priceType === 'includeVat' ? 0 : Numb(billVAT));

  const onConfirm = useCallback(
    async mValues => {
      try {
        mValues.dueDate = moment(mValues.dueDate).format('YYYY-MM-DD');
        const { billDiscount, deductDeposit } = cState;
        // showLog({
        //   mValues,
        //   total,
        //   billDiscount,
        //   deductDeposit,
        //   afterDiscount,
        //   afterDepositDeduct,
        //   billVAT,
        //   billTotal,
        // });
        // Add expense
        // mValues = { billDiscount, creditDays, deductDeposit, dueDate, priceType, taxFiledPeriod, taxInvoiceDate, taxInvoiceNo }
        // {billDiscount, billTotal, billVAT, deductDeposit, billNo, branchCode, date, dealer, department, expenseType, inputBy, priceType, time, total}
        let expense = {
          ...mValues,
          total,
          billDiscount,
          deductDeposit,
          billVAT,
          billTotal,
          expenseType: 'purchaseTransfer',
          receiveNo: mValues.taxInvoiceNo,
          branchCode: '0450',
          date: moment().format('YYYY-MM-DD'),
          time: Date.now(),
          inputBy: user.uid,
          isPart: true
        };
        let expenseId = createNewId('ACC-EXP');
        let expenseItem = cleanValuesBeforeSave({
          ...expense,
          expenseId,
          _key: expenseId
        });
        await firestore.collection('sections').doc('account').collection('expenses').doc(expenseId).set(expenseItem);
        // Update Payment Info
        !!mValues?.items &&
          (await arrayForEach(mValues.items, async it => {
            !!it?._id &&
              (await api.updateItem(
                {
                  accountChecked: Date.now(),
                  accountCheckedBy: user.uid,
                  accountCheckedDate: moment().format('YYYY-MM-DD'),
                  unitPrice: it.unitPrice,
                  discount: it.discount,
                  total: it.total,
                  expenseId
                },
                'sections/stocks/importParts',
                it._id
              ));
          }));
        showSuccess(
          () => resetToInitial(),
          !!mValues.billNoSKC ? `บันทึกราคาสินค้า ใบรับสินค้าเลขที่ ${mValues.billNoSKC} สำเร็จ` : 'บันทึกข้อมูลสำเร็จ',
          true
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [api, billTotal, billVAT, cState, firestore, resetToInitial, total, user.uid]
  );

  const preConfirm = useCallback(
    async currentValues => {
      const values = await form.validateFields();
      // showLog({ values, currentValues });
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
      let mItems = mValues.items.map(it => ({
        ...it,
        priceType: mValues.priceType || null
      }));
      mValues.items = mItems;
      showConfirm(() => onConfirm(mValues), `การบันทึกรายการ ${mValues?.billNoSKC || ''}`);
    },
    [form, onConfirm, setCState]
  );

  return (
    <div>
      <Container fluid className="main-content-container p-3">
        <Row noGutters className="page-header px-3 bg-light">
          <PageTitle sm="4" title="บันทึกราคาสินค้า" subtitle="อะไหล่" className="text-sm-left" />
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
          {values => {
            // showLog({ values });
            return (
              <>
                {renderHeader({
                  form,
                  onPriceTypeChange
                })}
                <InputItems
                  items={values.items}
                  onChange={dat => {
                    form.setFieldsValue({
                      items: dat
                      // billDiscount: dat.reduce(
                      //   (sum, elem) =>
                      //     sum + Numb(elem?.discount) * Numb(elem?.qty),
                      //   0
                      // ),
                    });
                    let total = dat.reduce(
                      (sum, elem) => sum + (Number(elem?.qty) * Numb(elem?.unitPrice) - Numb(elem?.discount)),
                      0
                    );
                    // showLog({ total });
                    total = total.toFixed(4);
                    setCState({
                      total,
                      // billDiscount: dat.reduce(
                      //   (sum, elem) =>
                      //     sum + Numb(elem?.discount) * Numb(elem?.qty),
                      //   0
                      // ),
                      ...(cState.noItemUpdated && { noItemUpdated: false })
                    });
                  }}
                  loading={loading}
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
                  onDeductDepositChange
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
