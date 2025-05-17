import React, { useCallback } from 'react';
import { Form } from 'antd';
import { getFirestore, collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { useMergeState } from '../../../hooks/useMergeState';

import { CheckOutlined } from '@ant-design/icons';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { showWarn, arrayForEach, showSuccess, firstKey, sortArr } from '../../../utils/functions';
import { Button } from '../../../elements';
import PageTitle from '../../../components/common/PageTitle';
import { createNewId } from '../../../utils';
import { removeAllNonAlphaNumericCharacters } from '../../../utils/RegEx';
import InputItems from './InputItems';
import { cleanValuesBeforeSave } from '../../../utils/functions';
import { Numb } from '../../../utils/number';
import { renderHeader, checkItemsUpdated, RenderSummary, initialValues } from './api';
import { InputPriceState, InputPriceFormValues, InputPriceProps, InputPriceItem } from './types';
import { useTranslation } from 'react-i18next';

const InputPrice: React.FC<InputPriceProps> = ({ grant, readOnly }) => {
  const { t } = useTranslation('inputPrice');
  const firestore = getFirestore();
  
  const initMergeState: InputPriceState = {
    mReceiveNo: null,
    noItemUpdated: false,
    deductDeposit: null,
    billDiscount: null,
    priceType: null,
    total: null
  };

  const { user } = useSelector((state: any) => state.auth);
  const [cState, setCState] = useMergeState<InputPriceState>(initMergeState);

  const [form] = Form.useForm<InputPriceFormValues>();

  const isInput = true;
  const activeStep = 0;

  const resetToInitial = useCallback(() => {
    form.resetFields();
    setCState(initMergeState);
  }, [form, setCState]);

  const _onValuesChange = async (val: Partial<InputPriceFormValues>) => {
    try {
      const changeKey = firstKey(val);
      if (changeKey === 'billNoSKC' && val[changeKey]) {
        const importVehiclesRef = collection(firestore, 'sections/stocks/importVehicles');
        const q = query(importVehiclesRef, where('billNoSKC', '==', val[changeKey]));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const arr: InputPriceItem[] = [];
          snap.forEach(doc => {
            const data = doc.data() as Partial<InputPriceItem>;
            const item: InputPriceItem = {
              ...data,
              id: arr.length,
              key: arr.length.toString(),
              qty: data?.import || 1,
              productCode: data?.productCode || '',
              productName: data?.productName || '',
              vehicleNo: data?.vehicleNo || [],
              peripheralNo: data?.peripheralNo || [],
              engineNo: data?.engineNo || [],
              productType: data?.productType || null,
              detail: data?.detail || '',
              unitPrice: data?.unitPrice || 0,
              total: data?.total || 0,
              status: data?.status || 'pending',
              _key: doc.id
            };
            arr.push(item);
          });
          
          if (arr.length > 0) {
            const mArr: InputPriceItem[] = [];
            await arrayForEach(
              arr.filter(l => !l.deleted),
              async (it: InputPriceItem) => {
                const productPCode = removeAllNonAlphaNumericCharacters(it.productCode);
                const vehicleListRef = collection(firestore, 'data/products/vehicleList');
                const lpQuery = query(vehicleListRef, where('productPCode', '==', productPCode));
                const lpSnap = await getDocs(lpQuery);
                let lp: any = null;
                
                if (!lpSnap.empty) {
                  lpSnap.forEach(lpDoc => {
                    lp = { ...lpDoc.data(), _id: lpDoc.id };
                  });
                }
                
                if (lp) {
                  mArr.push({
                    ...it,
                    creditTerm: lp.creditTerm,
                    unitPrice: lp.listPrice,
                    unitPrice_original: lp.listPrice,
                    total: Numb(lp.listPrice) * Numb(it.qty)
                  });
                } else {
                  mArr.push(it);
                }
              }
            );
            const sortedArr = sortArr(mArr as unknown as Record<string, unknown>[], 'importTime').map((od, id) => ({
              ...od,
              id,
              key: id.toString()
            })) as InputPriceItem[];
            
            form.setFieldsValue({
              items: sortedArr as any,
              priceType: sortedArr[0]?.priceType,
              creditDays: sortedArr[0]?.creditTerm
            });
            setCState({
              total: sortedArr.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0)
            });
          }
        }
      } else if (changeKey && ['creditDays', 'taxInvoiceDate'].includes(changeKey)) {
        const taxInvoiceDate = form.getFieldValue('taxInvoiceDate');
        const creditDays = form.getFieldValue('creditDays');
        if (!creditDays || isNaN(Number(creditDays))) {
          return;
        }
        if (taxInvoiceDate) {
          form.setFieldsValue({
            dueDate: DateTime.fromJSDate(taxInvoiceDate.toJSDate()).plus({ days: Number(creditDays) })
          });
        } else {
          form.setFieldsValue({
            dueDate: DateTime.now().plus({ days: Number(creditDays) })
          });
        }
      }
    } catch (error) {
      showWarn(error instanceof Error ? error.message : String(error));
    }
  };

  const footer = cState.noItemUpdated ? <h6 className="text-danger">{t('pleaseEnterPrice')}</h6> : undefined;

  const onBillDiscountChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return;
    }
    setCState({ billDiscount: value });
  };

  const onDeductDepositChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return;
    }
    setCState({ deductDeposit: value });
  };

  const onPriceTypeChange = (priceType: string) => {
    const items = form.getFieldValue('items') as InputPriceItem[];
    if (!items) return;

    const arr = items.map((it: InputPriceItem) => {
      const unitPrice = priceType === 'separateVat' 
        ? Number((Numb(it.unitPrice_original || 0) / 1.07).toFixed(3))
        : it.unitPrice_original || 0;
      return { ...it, priceType, unitPrice };
    });

    const total = arr.reduce((sum: number, elem: InputPriceItem) => 
      sum + (Numb(elem.qty) * Numb(elem.unitPrice) - Numb(elem.discount || 0)), 0);

    form.setFieldsValue({ priceType, items: arr as any });
    setCState({ priceType, total: Number(total.toFixed(4)) });
  };

  const { billDiscount, deductDeposit, priceType, total } = cState;

  const afterDiscount = Numb(total) - Numb(billDiscount);
  const afterDepositDeduct = Numb(total) - Numb(billDiscount) - Numb(deductDeposit);
  const billVAT = priceType === 'noVat' ? 0 : afterDepositDeduct ? afterDepositDeduct * 0.07 : 0;
  const billTotal =
    Numb(total) - Numb(billDiscount) - Numb(deductDeposit) + (priceType === 'includeVat' ? 0 : Numb(billVAT));

  const onConfirm = useCallback(
    async (mValues: InputPriceFormValues) => {
      try {
        const dueDate = mValues.dueDate ? DateTime.fromJSDate(mValues.dueDate.toJSDate()).toFormat('yyyy-MM-dd') : undefined;
        const { billDiscount, deductDeposit } = cState;
        const expense = {
          ...mValues,
          dueDate,
          total,
          billDiscount,
          deductDeposit,
          billVAT,
          billTotal,
          expenseType: 'purchaseTransfer',
          receiveNo: mValues.taxInvoiceNo,
          branchCode: '0450',
          date: DateTime.now().toFormat('yyyy-MM-dd'),
          time: Date.now(),
          inputBy: user.uid,
          isPart: false
        };
        const expenseId = createNewId('ACC-EXP');
        const expenseItem = cleanValuesBeforeSave({
          ...expense,
          expenseId,
          _key: expenseId
        });
        
        const expensesRef = collection(firestore, 'sections/account/expenses');
        await setDoc(doc(expensesRef, expenseId), expenseItem);
        
        if (mValues?.items) {
          await arrayForEach(mValues.items, async (it: InputPriceItem) => {
            // Update payment info
          });
        }
        showSuccess(t('saveSuccess'));
        resetToInitial();
      } catch (error) {
        showWarn(error instanceof Error ? error.message : String(error));
      }
    },
    [cState, total, billVAT, billTotal, user.uid, firestore, resetToInitial, t]
  );

  return (
    <div className="main-content-container px-4">
      <div className="page-header py-4">
        <PageTitle title={t('title')} subtitle={t('subtitle')} className="text-sm-left mb-3" />
      </div>
      <div className="card">
        <div className="card-body">
          <Form
            form={form}
            onValuesChange={_onValuesChange}
            onFinish={onConfirm}
            initialValues={initialValues}
            layout="vertical"
          >
            {renderHeader({ form, onPriceTypeChange })}
            <InputItems
              items={form.getFieldValue('items') || []}
              onChange={items => form.setFieldsValue({ items: items as any })}
              grant={grant}
              readOnly={readOnly}
              footer={footer}
              noItemUpdated={cState.noItemUpdated}
            />
            <RenderSummary
              total={total || 0}
              afterDiscount={afterDiscount}
              afterDepositDeduct={afterDepositDeduct}
              billVAT={billVAT}
              billTotal={billTotal}
              onBillDiscountChange={onBillDiscountChange}
              onDeductDepositChange={onDeductDepositChange}
            />
            <div className="d-flex justify-content-end mt-4">
              <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                {t('save')}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default InputPrice; 