import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Form, Card, Row, Col, Modal, Alert, Timeline, Collapse, Divider, Tooltip } from 'antd';
import { getFirestore, collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { useMergeState } from 'hooks/useMergeState';

import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { showWarn, arrayForEach, firstKey, sortArr, useErrorHandler } from 'utils/functions';
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
import dayjs, { Dayjs } from 'dayjs';
import { isString, isNumber, isDayjs } from '../../../utils/validation';
import { useModal } from '../../../contexts/ModalContext';
import { PERMISSIONS } from '../../../constants/Permissions';
import { usePermissions } from 'hooks/usePermissions';
import { RootState } from '../../../store';
import EmployeeSelector from 'components/EmployeeSelector';
import DocumentAuditTrail, { DocumentAuditTrailValue } from 'components/DocumentAuditTrail';
import AuditHistory from '../../../components/AuditHistory';
import { ROLES, RoleType } from '../../../constants/roles';
import { getPrivilegeLevel } from '../../../utils/roleUtils';
import AuditTrailSection from '../../../components/AuditTrailSection';
import PageDoc from 'components/PageDoc';

// Add custom styles for the summary component
import './inputPrice.css';
import { isMobile } from 'react-device-detect';
import { useAuth } from 'contexts/AuthContext';
import { DocumentStatusActions, DocumentStatusWatermark } from 'components/DocumentStatusActions';
import { message } from 'hooks/useAntdUi';

const initMergeState: InputPriceState = {
  mReceiveNo: null,
  noItemUpdated: false,
  deductDeposit: null,
  billDiscount: null,
  priceType: null,
  total: null
};

/**
 * InputPrice screen component for account module
 */
const InputPrice: React.FC<InputPriceProps> = ({ grant, readOnly: readOnlyProp, provinceId, departmentId }) => {
  const { t } = useTranslation('inputPrice');
  const firestore = getFirestore();
  const { hasPermission, hasProvinceAccess } = usePermissions();
  const { user, userProfile } = useAuth();
  const [cState, setCState] = useMergeState<InputPriceState>(initMergeState);
  const [form] = Form.useForm<InputPriceFormValues>();
  // const [showSuccessModal, setShowSuccessModal] = useState(false); // Removed: will use useModal

  const resetToInitial = useCallback(() => {
    form.resetFields();
    setCState(initMergeState);
  }, [form, setCState]);
  const [items, setItems] = useState<InputPriceItem[]>(initialValues.items);
  useEffect(() => {
    const total = items.reduce(
      (sum, elem) => sum + (Numb(elem.qty) * Numb(elem.unitPrice) - Numb(elem.discount || 0)),
      0
    );
    setCState({ total: Number(total.toFixed(4)) });
  }, [items, setCState]);
  const errorHandler = useErrorHandler();
  const summary = useMemo(() => {
    const safeTotal = Numb(cState.total);
    const safeDiscount = Numb(cState.billDiscount);
    const safeDeposit = Numb(cState.deductDeposit);
    const afterDiscount = safeTotal - safeDiscount;
    const afterDepositDeduct = afterDiscount - safeDeposit;
    const billVAT = cState.priceType === 'noVat' ? 0 : afterDepositDeduct * 0.07;
    const billTotal = afterDepositDeduct + billVAT;
    return { afterDiscount, afterDepositDeduct, billVAT, billTotal };
  }, [cState.total, cState.billDiscount, cState.deductDeposit, cState.priceType]);
  const { showConfirm, showSuccess, showSuccessModal } = useModal();
  // Placeholder: get document status from props, form, or API
  // Replace this with real status logic as needed
  // Derive document status from form or loaded document, fallback to 'draft'
  const loadedDoc = form.getFieldsValue(); // Replace with actual loaded document if available
  const docStatus: 'draft' | 'reviewed' | 'approved' | 'rejected' =
    loadedDoc?.status === 'reviewed' || loadedDoc?.status === 'approved' || loadedDoc?.status === 'rejected'
      ? loadedDoc.status
      : 'draft';
  // Permission checks for edit, review, approve, reject, etc.
  const canEdit = hasPermission(PERMISSIONS.DOCUMENT_EDIT) && hasProvinceAccess(provinceId);
  const canReview = hasPermission(PERMISSIONS.DOCUMENT_REVIEW) && hasProvinceAccess(provinceId);
  const canApprove = hasPermission(PERMISSIONS.DOCUMENT_APPROVE) && hasProvinceAccess(provinceId);
  const canReject = hasPermission(PERMISSIONS.DOCUMENT_REJECT) && hasProvinceAccess(provinceId);

  // Determine readOnly state based on permissions and document status
  const isReadOnly =
    readOnlyProp ||
    (docStatus === 'reviewed' && !canReview && !canApprove) ||
    (docStatus === 'approved' && !canApprove) ||
    (!canEdit && !canReview && !canApprove);
  // Stepper logic by permission
  let activeStep = 0;
  if (canEdit) activeStep = 0;
  if (canReview) activeStep = 1;
  if (canApprove) activeStep = 2;
  // Department access check
  // RBAC: Determine privilege level and access rights
  const userRole = userProfile?.role;
  const userPermissions = userProfile?.permissions || [];
  const isManager = !!userRole && getPrivilegeLevel(userRole) >= getPrivilegeLevel(ROLES.BRANCH_MANAGER);

  // Department access: allow if manager, has explicit permission, or matches department
  const canAccessDepartment =
    isManager ||
    userPermissions.includes(PERMISSIONS.VIEW_ACCOUNTS) ||
    (!!userProfile?.department && userProfile.department === departmentId);

  // Province-level access: allow if manager or has permission + province access
  const canAccess = isManager || (hasPermission(PERMISSIONS.MANAGE_EXPENSE) && hasProvinceAccess(provinceId));

  const onConfirm = useCallback(
    async (mValues: InputPriceFormValues) => {
      console.log(`[mValues]`, mValues);
      const expensesRef = collection(firestore, 'sections', 'account', 'expenses');
      // Find existing expense by billNoSKC
      const expenseQ = query(expensesRef, where('billNoSKC', '==', mValues.billNoSKC));
      const expenseSnap = await getDocs(expenseQ);
      let expenseId = createNewId('ACC-EXP');
      let prevDoc: any = undefined;
      let isUpdate = false;
      if (!expenseSnap.empty) {
        prevDoc = expenseSnap.docs[0].data();
        expenseId = expenseSnap.docs[0].id;
        isUpdate = true;
      }
      showConfirm({
        content: t('confirmSubmit', 'Are you sure you want to submit?'),
        onOk: async () => {
          try {
            let dueDate: string | undefined = undefined;
            let taxInvoiceDate: string | undefined = undefined;
            if (mValues.dueDate) {
              const due = typeof mValues.dueDate === 'string' ? dayjs(mValues.dueDate) : mValues.dueDate;
              if (due && typeof (due as any).format === 'function') {
                dueDate = due.format('YYYY-MM-DD');
              } else {
                errorHandler(new Error(t('invalidDueDate', 'Due date is invalid. Please select a valid date.')));
                return;
              }
            }
            if (mValues.taxInvoiceDate) {
              const taxDate =
                typeof mValues.taxInvoiceDate === 'string' ? dayjs(mValues.taxInvoiceDate) : mValues.taxInvoiceDate;
              if (taxDate && typeof (taxDate as any).format === 'function') {
                taxInvoiceDate = taxDate.format('YYYY-MM-DD');
              } else {
                errorHandler(
                  new Error(t('invalidTaxInvoiceDate', 'Tax invoice date is invalid. Please select a valid date.'))
                );
                return;
              }
            }
            const { billDiscount, deductDeposit } = cState;
            const expense = {
              ...mValues,
              dueDate,
              taxInvoiceDate,
              total: cState.total,
              billDiscount,
              deductDeposit,
              billVAT: summary.billVAT,
              billTotal: summary.billTotal,
              expenseType: 'purchaseTransfer',
              receiveNo: mValues.taxInvoiceNo,
              branchCode: '0450',
              date: dayjs().format('YYYY-MM-DD'),
              time: Date.now(),
              inputBy: user?.uid,
              isPart: false
            };
            // --- Audit Trail Logic ---
            let auditTrailArr = (prevDoc?.auditTrail as any[]) || [];
            // Compute changes
            const getChangesFn = (await import('utils/functions')).getChangesDeep;
            const changes = getChangesFn(prevDoc || {}, expense);
            if (Object.keys(changes).length > 0) {
              const auditEntry = {
                uid: user?.uid,
                time: Date.now(),
                changes,
                action: isUpdate ? 'update' : 'create',
                userInfo: {
                  name: userProfile?.displayName || user?.email,
                  email: user?.email,
                  department: userProfile?.department,
                  role: userProfile?.role
                },
                documentInfo: {
                  expenseId,
                  billNoSKC: mValues.billNoSKC,
                  taxInvoiceNo: mValues.taxInvoiceNo,
                  total: expense.total
                }
              };
              auditTrailArr = [...auditTrailArr, auditEntry];
            }

            // Add status tracking
            const currentStatus = isUpdate ? prevDoc?.status || 'draft' : 'draft';
            const statusHistory = prevDoc?.statusHistory || [];
            if (currentStatus !== prevDoc?.status) {
              statusHistory.push({
                status: currentStatus,
                time: Date.now(),
                uid: user?.uid,
                userInfo: {
                  name: userProfile?.displayName || user?.email,
                  email: user?.email,
                  department: userProfile?.department,
                  role: userProfile?.role
                }
              });
            }

            const expenseItem = cleanValuesBeforeSave({
              ...expense,
              expenseId,
              _key: expenseId,
              auditTrail: auditTrailArr || [],
              status: currentStatus,
              statusHistory: statusHistory || [],
              lastModified: {
                time: Date.now(),
                uid: user?.uid,
                userInfo: {
                  name: userProfile?.displayName || user?.email,
                  email: user?.email,
                  department: userProfile?.department,
                  role: userProfile?.role
                }
              }
            });
            console.log('[Firestore Save] expenseId:', expenseId);
            console.log('[Firestore Save] expenseItem:', expenseItem);
            await setDoc(doc(expensesRef, expenseId), expenseItem);
            console.log('[Firestore Save] setDoc success');

            // Update related import vehicles
            const importVehiclesRef = collection(firestore, 'sections', 'stocks', 'importVehicles');
            const latestItems = form.getFieldValue('items') || [];
            if (latestItems.length > 0) {
              await arrayForEach(latestItems, async (item: InputPriceItem) => {
                if (item._key) {
                  await setDoc(
                    doc(importVehiclesRef, item._key),
                    {
                      ...item,
                      total: Numb(item.unitPrice) * Numb(item.qty),
                      processed: true,
                      lastExpenseId: expenseId
                    },
                    { merge: true }
                  );
                }
              });
            }

            showSuccessModal({
              title: t('saveSuccess', 'Data Saved Successfully'),
              content: t('saveSuccessDescription', 'Your information has been recorded.'),
              onOk: () => {
                resetToInitial();
                setItems(initialValues.items);
              }
            });
          } catch (error) {
            console.error('[Firestore Save] error:', error);
            errorHandler(error instanceof Error ? error : new Error(String(error)));
          }
        }
      });
    },
    [
      cState,
      summary.billVAT,
      summary.billTotal,
      user?.uid,
      firestore,
      resetToInitial,
      t,
      showConfirm,
      errorHandler,
      form
    ]
  );

  if (!canAccessDepartment) {
    return (
      <Alert
        message={t('accessDenied', 'Access Denied')}
        description={t('noDepartmentAccess', 'You do not have permission to access this department.')}
        type='error'
        showIcon
        className='my-8'
      />
    );
  }
  if (!canAccess) {
    return (
      <Alert
        message={t('accessDenied', 'Access Denied')}
        description={t('noPermissionProvince', 'You do not have permission to manage expenses for this province.')}
        type='error'
        showIcon
        className='my-8'
      />
    );
  }

  const defaultSteps = [
    t('inputPrice.step.record', 'บันทึกรายการ'),
    t('inputPrice.step.review', 'ตรวจสอบ'),
    t('inputPrice.step.approve', 'อนุมัติ')
  ];

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
            setItems(sortedArr);
            setCState({
              total: (sortedArr || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0)
            });
          }
        }
        // --- Merge with existing expense data if found ---
        const formValues = form.getFieldsValue();
        if (formValues.billNoSKC) {
          const expensesRef = collection(firestore, 'sections', 'account', 'expenses');
          const expenseQ = query(expensesRef, where('billNoSKC', '==', val[changeKey]));
          const expenseSnap = await getDocs(expenseQ);
          if (!expenseSnap.empty) {
            const docData = expenseSnap.docs[0].data();
            // Merge: use found expense data (excluding items), but always use arr for items
            const { items: _ignore, ...restDocData } = docData;
            form.setFieldsValue({
              ...formValues,
              ...restDocData,
              billDiscount: restDocData.billDiscount ?? 0,
              deductDeposit: restDocData.deductDeposit ?? 0,
              auditTrail: docData.auditTrail || undefined
            });
            setCState({
              total: (restDocData.items || []).reduce(
                (sum: number, elem: InputPriceItem) => sum + Numb(elem?.total || 0),
                0
              ),
              billDiscount: restDocData.billDiscount ?? 0,
              deductDeposit: restDocData.deductDeposit ?? 0
            });
            return;
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
      errorHandler(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const footer = cState.noItemUpdated ? <h6>{t('pleaseEnterPrice')}</h6> : undefined;

  const { billDiscount, deductDeposit, priceType, total } = cState;

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
      const unitPrice =
        priceType === 'separateVat'
          ? Number((Numb(it.unitPrice_original || 0) / 1.07).toFixed(3))
          : it.unitPrice_original || 0;
      return { ...it, priceType, unitPrice };
    });

    const total = (arr || []).reduce(
      (sum: number, elem: InputPriceItem) => sum + (Numb(elem.qty) * Numb(elem.unitPrice) - Numb(elem.discount || 0)),
      0
    );

    form.setFieldsValue({ priceType, items: arr as any });
    setCState({ priceType, total: Number(total.toFixed(4)) });
  };

  const summaryContent = (
    <div className='flex flex-col justify-between h-full'>
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
    </div>
  );

  // Wire audit trail data from loaded document (replace 'loadedDoc' with actual variable if different)
  const editedBy = (loadedDoc as any)?.editedBy ?? '';
  const reviewedBy = (loadedDoc as any)?.reviewedBy ?? '';
  const approvedBy = (loadedDoc as any)?.approvedBy ?? '';
  const editedDate = (loadedDoc as any)?.editedDate ?? undefined;
  const reviewedDate = (loadedDoc as any)?.reviewedDate ?? undefined;
  const approvedDate = (loadedDoc as any)?.approvedDate ?? undefined;

  // Determine enabled/disabled state for each block based on permissions
  const canEditEditedBy = canEdit;
  const canEditReviewedBy = canReview;
  const canEditApprovedBy = canApprove;

  return (
    <div className='space-y-6' style={{ marginTop: isMobile ? '60px' : '0px' }}>
      <PageTitle
        title={t('title')}
        subtitle={t('subtitle', 'รถและอุปกรณ์')}
        steps={defaultSteps}
        activeStep={activeStep}
        showStepper={true}
      />

      <Card size={isMobile ? 'small' : 'default'}>
        <Form
          id='input-price-form'
          form={form}
          onValuesChange={(changed, all) => {
            _onValuesChange(changed);
            console.log('Changed:', changed);
            console.log('All values:', all);
          }}
          onFinish={onConfirm}
          initialValues={initialValues}
          layout='vertical'
          disabled={isReadOnly}
        >
          <Form.Item
            label={
              <span>
                <SearchOutlined /> {t('searchByReceiptNumber')}
              </span>
            }
            name='billNoSKC'
          >
            <DocSelector
              collection='sections/stocks/importVehicles'
              orderBy={['billNoSKC']}
              wheres={[
                ['warehouseChecked', '!=', null]
                // ['total', '==', null]
              ]}
              size='middle'
              placeholder={t('receiptNumber')}
              hasKeywords
            />
          </Form.Item>

          {/* Form Fields in 2 Column Grid */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name='taxInvoiceNo'
                label={<span className='font-medium'>* {t('taxInvoiceNo')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <Input placeholder={t('taxInvoiceNo')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name='taxInvoiceDate'
                label={<span className='font-medium'>* {t('taxInvoiceDate')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <DatePicker placeholder={t('taxInvoiceDate')} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name='priceType'
                label={<span className='font-medium'>* {t('priceType')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <PriceTypeSelector onChange={onPriceTypeChange} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name='taxFiledPeriod'
                label={<span className='font-medium'>* {t('taxFiledPeriod')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <Input placeholder={t('taxFiledPeriod')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name='creditDays'
                label={<span className='font-medium'>* {t('credit')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <InputNumber placeholder={t('credit')} addonAfter={t('days')} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name='dueDate'
                label={<span className='font-medium'>* {t('dueDate')}</span>}
                rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
              >
                <DatePicker placeholder={t('dueDate')} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Table */}
          <div className='mt-4'>
            <InputItems
              items={items || []}
              onChange={newItems => {
                setItems(newItems);
                form.setFieldsValue({ items: newItems as any });
              }}
              grant={grant}
              readOnly={isReadOnly}
              footer={footer}
              noItemUpdated={cState.noItemUpdated}
            />
          </div>

          <div className='w-full mt-4' style={{ width: '100%' }}>
            {summaryContent}
          </div>

          {/* Edited/Reviewed/Approved By Section - Ant Design Row/Col Responsive Layout */}
          <AuditTrailSection
            canEditEditedBy={canEditEditedBy}
            canEditReviewedBy={canEditReviewedBy}
            canEditApprovedBy={canEditApprovedBy}
          />
          {/* Change History and Status History (outside Form.Item, so errors don't overlap) */}
          <AuditHistory
            auditTrail={form.getFieldValue('auditTrail') || []}
            statusHistory={form.getFieldValue('statusHistory') || []}
          />

          {/* Save Button at Bottom Center */}
          <div className='flex justify-center mt-10'>
            <Button
              type='primary'
              htmlType='submit'
              icon={<CheckOutlined />}
              form='input-price-form'
              className='save-button'
              style={{ minWidth: 160, fontSize: 16, height: 40 }}
              disabled={isReadOnly}
            >
              {t('save')}
            </Button>
            <DocumentStatusActions
              canApprove={canApprove}
              docStatus={docStatus}
              isReadOnly={isReadOnly}
              onApprove={async () => {
                form.setFieldsValue({ status: 'approved' });
                await form.validateFields();
                onConfirm(form.getFieldsValue());
              }}
              onReject={async () => {
                form.setFieldsValue({ status: 'rejected' });
                await form.validateFields();
                onConfirm(form.getFieldsValue());
              }}
            />
          </div>
          <DocumentStatusWatermark docStatus={docStatus} />
        </Form>
      </Card>
      <PageDoc />
      {/* Removed ActionStatusModal component usage */}
    </div>
  );
};

export default InputPrice;
