import React, { useCallback, useMemo } from 'react';
import { Form, Card, Row, Col, Modal } from 'antd';
import { getFirestore, collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { useMergeState } from 'hooks/useMergeState';

import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { showWarn, arrayForEach, showSuccess, firstKey, sortArr } from 'utils/functions';
import PageTitle from 'components/common/PageTitle';
import { createNewId } from 'utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import InputItems from './InputItems';
import { cleanValuesBeforeSave } from 'utils/functions';
import { Numb } from 'utils/number';
import { renderHeader, checkItemsUpdated, RenderSummary, initialValues } from './api';
import { InputPriceState, InputPriceFormValues, InputPriceProps, InputPriceItem } from './types';
import { useTranslation } from 'react-i18next';
import { Button, Stepper } from 'elements';
import DocSelector from 'components/DocSelector';
import { Input, InputNumber } from 'antd';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { DatePicker } from 'elements';
import dayjs from 'dayjs';
import { isString, isNumber, isDayjs } from '../../../utils/validation';
import { showConfirm } from '../../../utils/functions';

// Add custom styles for the summary component
import './inputPrice.css';
import { isMobile } from 'react-device-detect';

/**
 * InputPrice screen component for account module
 */
const InputPrice: React.FC<InputPriceProps> = ({ grant, readOnly }) => {
  const { t } = useTranslation('inputPrice');
  const firestore = getFirestore();
  
  const defaultSteps = [
    t('inputPrice.step.record', 'บันทึกรายการ'),
    t('inputPrice.step.review', 'ตรวจสอบ'),
    t('inputPrice.step.approve', 'อนุมัติ')
  ];

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
      console.log(changeKey);
      if (changeKey === 'billNoSKC' && isString(val[changeKey])) {
        const importVehiclesRef = collection(firestore, 'sections', 'stocks', 'importVehicles');
        const q = query(importVehiclesRef, where('billNoSKC', '==', val[changeKey]));
        const snap = await getDocs(q);
        console.log(snap.empty);
        if (!snap.empty) {
          const arr: InputPriceItem[] = [];
          snap.forEach(docSnap => {
            const data = docSnap.data() as Partial<InputPriceItem>;
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
              _key: docSnap.id
            };
            arr.push(item);
          });
          
          if (arr.length > 0) {
            const mArr: InputPriceItem[] = [];
            await arrayForEach(
              arr.filter(l => !l.deleted),
              async (it: InputPriceItem) => {
                const productPCode = removeAllNonAlphaNumericCharacters(it.productCode);
                const vehicleListRef = collection(firestore, 'data', 'products', 'vehicleList');
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
        if (!isNumber(creditDays)) return;
        if (isDayjs(taxInvoiceDate)) {
          form.setFieldsValue({
            dueDate: taxInvoiceDate.add(Number(creditDays), 'day')
          });
        } else {
          form.setFieldsValue({
            dueDate: dayjs().add(Number(creditDays), 'day')
          });
        }
      }
    } catch (error) {
      showWarn(error instanceof Error ? error.message : String(error));
    }
  };

  const footer = cState.noItemUpdated ? <h6>{t('pleaseEnterPrice')}</h6> : undefined;

  const { billDiscount, deductDeposit, priceType, total } = cState;

  // Calculate summary values in real-time
  const summary = useMemo(() => {
    const safeTotal = Numb(total);
    const safeDiscount = Numb(billDiscount);
    const safeDeposit = Numb(deductDeposit);
    const afterDiscount = safeTotal - safeDiscount;
    const afterDepositDeduct = afterDiscount - safeDeposit;
    const billVAT = priceType === 'noVat' ? 0 : afterDepositDeduct * 0.07;
    const billTotal = afterDepositDeduct + billVAT;
    return { afterDiscount, afterDepositDeduct, billVAT, billTotal };
  }, [total, billDiscount, deductDeposit, priceType]);

  const onBillDiscountChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      setCState({ billDiscount: 0 });
      return;
    }
    setCState({ billDiscount: value });
  };

  const onDeductDepositChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      setCState({ deductDeposit: 0 });
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

  const onConfirm = useCallback(
    async (mValues: InputPriceFormValues) => {
      showConfirm(async () => {
        try {
          const dueDate = mValues.dueDate ? mValues.dueDate.format('YYYY-MM-DD') : undefined;
          const { billDiscount, deductDeposit } = cState;
          const expense = {
            ...mValues,
            dueDate,
            total,
            billDiscount,
            deductDeposit,
            billVAT: summary.billVAT,
            billTotal: summary.billTotal,
            expenseType: 'purchaseTransfer',
            receiveNo: mValues.taxInvoiceNo,
            branchCode: '0450',
            date: dayjs().format('YYYY-MM-DD'),
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
          const expensesRef = collection(firestore, 'sections', 'account', 'expenses');
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
      }, t('confirmSubmit', 'Are you sure you want to submit?'));
    },
    [cState, total, summary.billVAT, summary.billTotal, user.uid, firestore, resetToInitial, t]
  );

  const summaryContent = (
    <div className="flex flex-col justify-between h-full">
      <RenderSummary
        total={total || 0}
        afterDiscount={summary.afterDiscount}
        afterDepositDeduct={summary.afterDepositDeduct}
        billVAT={summary.billVAT}
        billTotal={summary.billTotal}
        onBillDiscountChange={onBillDiscountChange}
        onDeductDepositChange={onDeductDepositChange}
        billDiscount={billDiscount}
        deductDeposit={deductDeposit}
      />

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<CheckOutlined />} 
          form="input-price-form" 
          className="save-button"
          style={{ 
            minWidth: 160, 
            fontSize: 16,
            height: 40
          }}
        >
          {t('save')}
        </Button>
      </div>
    </div>

  );

  return (
    <div className="space-y-6">
      <PageTitle 
        title={t('title')}
        subtitle={t('subtitle', 'รถและอุปกรณ์')}
        steps={defaultSteps}
        activeStep={0}
        showStepper={true}
      />

      <Card size={isMobile ? "small" : "default"}>
        <Form
          id="input-price-form"
          form={form}
          onValuesChange={(changed, all) => {
            _onValuesChange(changed);
            console.log('Changed:', changed);
            console.log('All values:', all);
          }}
          onFinish={onConfirm}
          initialValues={initialValues}
          layout="vertical"
        >
            <Form.Item 
              label={<span><SearchOutlined /> {t('searchByReceiptNumber')}</span>}
              name="billNoSKC"
            >
              <DocSelector
                collection="sections/stocks/importVehicles"
                orderBy={['billNoSKC']}
                wheres={[["warehouseChecked", "!=", null], ["total", "==", null]]}
                size="middle"
                placeholder={t('receiptNumber')}
                hasKeywords
              />
            </Form.Item>

            {/* Form Fields in 2 Column Grid */}
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="taxInvoiceNo"
                  label={<span className="font-medium">* {t('taxInvoiceNo')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <Input placeholder={t('taxInvoiceNo')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  name="taxInvoiceDate" 
                  label={<span className="font-medium">* {t('taxInvoiceDate')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <DatePicker placeholder={t('taxInvoiceDate')} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  name="priceType" 
                  label={<span className="font-medium">* {t('priceType')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <PriceTypeSelector onChange={onPriceTypeChange} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="taxFiledPeriod"
                  label={<span className="font-medium">* {t('taxFiledPeriod')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <Input placeholder={t('taxFiledPeriod')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="creditDays"
                  label={<span className="font-medium">* {t('credit')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <InputNumber placeholder={t('credit')} addonAfter={t('days')} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="dueDate"
                  label={<span className="font-medium">* {t('dueDate')}</span>}
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <DatePicker placeholder={t('dueDate')} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Table */}
            <div className="mt-4">
              <InputItems
                items={form.getFieldValue('items') || []}
                onChange={items => form.setFieldsValue({ items: items as any })}
                grant={grant}
                readOnly={readOnly}
                footer={footer}
                noItemUpdated={cState.noItemUpdated}
              />
            </div>      
          </Form>
      </Card>

      {!isMobile ?
        <Card className="sticky top-4" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          {summaryContent}
        </Card>
        :
        <div className="w-full" style={{ width: '100%' }}>{summaryContent}</div>
      }
    </div>
  );
};

export default InputPrice; 