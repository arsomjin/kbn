import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Form, Card, Row, Col, Modal, Alert, Timeline, Collapse, Divider, Tooltip } from 'antd';
import { getFirestore, collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { useMergeState } from 'hooks/useMergeState';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { arrayForEach, firstKey, useErrorHandler } from 'utils/functions';
import { sortArr } from 'utils/array';
import PageTitle from 'components/common/PageTitle';
import { createNewId } from 'utils';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import InputItems from './InputItems';
import { Numb } from 'utils/number';
import { RenderSummary, initialValues } from './api';
import { useTranslation } from 'react-i18next';
import { Button, Stepper } from 'elements';
import DocSelector from 'components/DocSelector';
import { Input, InputNumber } from 'antd';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { DatePicker } from 'elements';
import dayjs from 'dayjs';
import { isString, isNumber, isDayjs } from 'utils/validation';
import { useModal } from 'contexts/ModalContext';
import { PERMISSIONS } from 'constants/Permissions';
import { usePermissions } from 'hooks/usePermissions';
import { useAuth } from 'contexts/AuthContext';
import { DocumentStatusActions, DocumentStatusWatermark } from 'components/DocumentStatusActions';
import AuditTrailSection from 'components/AuditTrailSection';
import AuditHistory from 'components/AuditHistory';
import PageDoc from 'components/PageDoc';
import { isMobile } from 'react-device-detect';
import { RoleCategory } from 'constants/roles';
import { getAllowedRolesByCategory } from 'utils/roleUtils';

// Add custom styles for the summary component
import './inputPrice.css';
import {
  processFirestoreDataForForm,
  processFormDataForFirestore,
} from '../../../utils/dateHandling';

/**
 * @typedef {Object} InputPriceState
 * @property {string|null} mReceiveNo - Receive number
 * @property {boolean} noItemUpdated - Item update status
 * @property {number|null} deductDeposit - Deposit deduction
 * @property {number|null} billDiscount - Bill discount
 * @property {string|null} priceType - Price type
 * @property {number|null} total - Total amount
 */

/**
 * @typedef {Object} InputPriceProps
 * @property {boolean} [grant] - Optional grant flag
 * @property {boolean} [readOnly] - Optional read-only flag
 * @property {string} provinceId - Province ID
 * @property {string} departmentId - Department ID
 */

const initMergeState = {
  mReceiveNo: null,
  noItemUpdated: false,
  deductDeposit: null,
  billDiscount: null,
  priceType: null,
  total: null,
};

/**
 * InputPrice screen component for account module
 * @param {InputPriceProps} props - Component props
 */
const InputPrice = ({ grant, readOnly: readOnlyProp, provinceId, departmentId }) => {
  const { t } = useTranslation('inputPrice');
  const firestore = getFirestore();
  const { hasPermission, hasProvinceAccess, userProfile } = usePermissions();
  const { user } = useAuth();
  const [cState, setCState] = useMergeState(initMergeState);
  const [form] = Form.useForm();

  const resetToInitial = useCallback(() => {
    form.resetFields();
    setCState(initMergeState);
  }, [form, setCState]);

  const [items, setItems] = useState(initialValues.items);

  useEffect(() => {
    const total = items.reduce(
      (sum, elem) => sum + (Numb(elem.qty) * Numb(elem.unitPrice) - Numb(elem.discount || 0)),
      0,
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

  const { showConfirm, showSuccessModal } = useModal();

  // Derive document status from form or loaded document, fallback to 'draft'
  const loadedDoc = form.getFieldsValue();
  const docStatus =
    loadedDoc?.status === 'reviewed' ||
    loadedDoc?.status === 'approved' ||
    loadedDoc?.status === 'rejected'
      ? loadedDoc.status
      : 'draft';

  // Role-based access control using role categories
  const userRole = userProfile?.role;

  // Executive level: Full system access
  const hasExecutiveAccess = getAllowedRolesByCategory(RoleCategory.EXECUTIVE).includes(userRole);

  // Province level: Access to specific province
  const hasProvinceAccess_Role = getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER).includes(
    userRole,
  );

  // Branch level: Access to specific branch within province
  const hasBranchAccess_Role = getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER).includes(
    userRole,
  );

  // Permission checks for different actions

  const canEdit =
    hasPermission(PERMISSIONS.DOCUMENT_EDIT) ||
    hasPermission(PERMISSIONS.MANAGE_EXPENSE) ||
    hasExecutiveAccess;

  const canReview =
    hasPermission(PERMISSIONS.DOCUMENT_REVIEW) && (hasProvinceAccess_Role || hasExecutiveAccess);

  const canApprove =
    hasPermission(PERMISSIONS.DOCUMENT_APPROVE) && (hasProvinceAccess_Role || hasExecutiveAccess);

  // Province access validation
  const hasValidProvinceAccess = !provinceId || hasProvinceAccess(provinceId) || hasExecutiveAccess;

  // Department access validation - simplified based on role hierarchy
  const canAccessDepartment =
    hasExecutiveAccess ||
    hasProvinceAccess_Role ||
    hasBranchAccess_Role ||
    userProfile?.employeeInfo?.department === departmentId;

  // Determine readOnly state based on permissions and document status
  const isReadOnly =
    readOnlyProp ||
    !canEdit ||
    (docStatus === 'reviewed' && !canReview && !canApprove) ||
    (docStatus === 'approved' && !canApprove);

  // console.log('[InputPrice] docStatus:', docStatus);
  // console.log('[InputPrice] canEdit:', canEdit);
  // console.log('[InputPrice] canReview:', canReview);
  // console.log('[InputPrice] canApprove:', canApprove);
  // console.log('[InputPrice] isReadOnly:', isReadOnly);

  // Stepper logic based on role categories
  let activeStep = 0;
  if (hasBranchAccess_Role || canEdit) activeStep = 0;
  if (hasProvinceAccess_Role || canReview) activeStep = 1;
  if (hasExecutiveAccess || canApprove) activeStep = 2;

  const onConfirm = useCallback(
    async (mValues) => {
      console.log(`[mValues]`, form.getFieldsValue());
      console.log(`[InputItems]`, form.getFieldValue('items') || []);
      const expensesRef = collection(firestore, 'sections', 'account', 'expenses');
      // Find existing expense by billNoSKC
      const expenseQ = query(expensesRef, where('billNoSKC', '==', mValues.billNoSKC));
      const expenseSnap = await getDocs(expenseQ);
      let expenseId = createNewId('ACC-EXP');
      let prevDoc = undefined;
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
            let dueDate = undefined;
            let taxInvoiceDate = undefined;
            if (mValues.dueDate) {
              const due =
                typeof mValues.dueDate === 'string' ? dayjs(mValues.dueDate) : mValues.dueDate;
              if (due && typeof due.format === 'function') {
                dueDate = due.format('YYYY-MM-DD');
              } else {
                errorHandler(
                  new Error(
                    t('invalidDueDate', 'Due date is invalid. Please select a valid date.'),
                  ),
                );
                return;
              }
            }
            if (mValues.taxInvoiceDate) {
              const taxDate =
                typeof mValues.taxInvoiceDate === 'string'
                  ? dayjs(mValues.taxInvoiceDate)
                  : mValues.taxInvoiceDate;
              if (taxDate && typeof taxDate.format === 'function') {
                taxInvoiceDate = taxDate.format('YYYY-MM-DD');
              } else {
                errorHandler(
                  new Error(
                    t(
                      'invalidTaxInvoiceDate',
                      'Tax invoice date is invalid. Please select a valid date.',
                    ),
                  ),
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
              isPart: false,
            };

            // --- Audit Trail Logic ---
            let auditTrailArr = prevDoc?.auditTrail || [];
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
                  role: userProfile?.role,
                },
                documentInfo: {
                  expenseId,
                  billNoSKC: mValues.billNoSKC,
                  taxInvoiceNo: mValues.taxInvoiceNo,
                  total: expense.total,
                },
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
                  role: userProfile?.role,
                },
              });
            }

            const expenseItem = {
              ...processFormDataForFirestore(expense),
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
                  role: userProfile?.role,
                },
              },
            };

            console.log('[Firestore Save] expenseId:', expenseId);
            console.log('[Firestore Save] expenseItem:', expenseItem);

            // Verify audit trail timestamps before saving
            if (expenseItem.auditTrail && expenseItem.auditTrail.length > 0) {
              console.log('[Firestore Save] Audit Trail Verification:');
              expenseItem.auditTrail.forEach((entry, index) => {
                console.log(`  Entry ${index}:`, {
                  action: entry.action,
                  time: entry.time,
                  timeType: typeof entry.time,
                  timeValue: entry.time,
                  isValidTimestamp: entry.time && typeof entry.time === 'number' && entry.time > 0,
                  humanReadable: entry.time ? new Date(entry.time).toISOString() : 'Invalid',
                });
              });
            }

            // Verify status history timestamps
            if (expenseItem.statusHistory && expenseItem.statusHistory.length > 0) {
              console.log('[Firestore Save] Status History Verification:');
              expenseItem.statusHistory.forEach((entry, index) => {
                console.log(`  Entry ${index}:`, {
                  status: entry.status,
                  time: entry.time,
                  timeType: typeof entry.time,
                  timeValue: entry.time,
                  isValidTimestamp: entry.time && typeof entry.time === 'number' && entry.time > 0,
                  humanReadable: entry.time ? new Date(entry.time).toISOString() : 'Invalid',
                });
              });
            }

            // Verify lastModified timestamp
            if (expenseItem.lastModified) {
              console.log('[Firestore Save] LastModified Verification:', {
                time: expenseItem.lastModified.time,
                timeType: typeof expenseItem.lastModified.time,
                timeValue: expenseItem.lastModified.time,
                isValidTimestamp:
                  expenseItem.lastModified.time &&
                  typeof expenseItem.lastModified.time === 'number' &&
                  expenseItem.lastModified.time > 0,
                humanReadable: expenseItem.lastModified.time
                  ? new Date(expenseItem.lastModified.time).toISOString()
                  : 'Invalid',
              });
            }
            // Clean the data properly - remove undefined values without affecting timestamps
            const cleanExpenseItem = JSON.parse(
              JSON.stringify(expenseItem, (key, value) => {
                // Remove undefined values but keep null values and numbers
                return value === undefined ? null : value;
              }),
            );

            console.log('[Firestore Save] cleanExpenseItem:', cleanExpenseItem);

            // Final verification of audit trail timestamps after cleaning
            if (cleanExpenseItem.auditTrail && cleanExpenseItem.auditTrail.length > 0) {
              console.log('[Firestore Save] Final Audit Trail Verification:');
              cleanExpenseItem.auditTrail.forEach((entry, index) => {
                console.log(`  Entry ${index} FINAL:`, {
                  action: entry.action,
                  time: entry.time,
                  timeType: typeof entry.time,
                  isValidTimestamp: entry.time && typeof entry.time === 'number' && entry.time > 0,
                  humanReadable: entry.time ? new Date(entry.time).toISOString() : 'Invalid',
                });
              });
            }

            await setDoc(doc(expensesRef, expenseId), cleanExpenseItem);
            console.log('[Firestore Save] setDoc success');

            // Update related import vehicles
            const importVehiclesRef = collection(firestore, 'sections', 'stocks', 'importVehicles');
            const latestItems = form.getFieldValue('items') || [];
            if (latestItems.length > 0) {
              await arrayForEach(latestItems, async (item) => {
                if (item._key) {
                  // Clean the item data to remove undefined values
                  const updateData = JSON.parse(
                    JSON.stringify(
                      {
                        ...item,
                        accountChecked: Date.now(),
                        accountCheckedBy: user?.uid,
                        accountCheckedDate: dayjs().format('YYYY-MM-DD'),
                        unitPrice: item.unitPrice,
                        discount: item.discount,
                        total: item.total,
                        processed: true,
                        lastExpenseId: expenseId,
                      },
                      (key, value) => {
                        // Remove undefined values but keep null values and numbers
                        return value === undefined ? null : value;
                      },
                    ),
                  );

                  await setDoc(doc(importVehiclesRef, item._key), updateData, { merge: true });
                }
              });
            }

            showSuccessModal({
              title: t('saveSuccess', 'Data Saved Successfully'),
              content: t('saveSuccessDescription', 'Your information has been recorded.'),
              onOk: () => {
                resetToInitial();
                setItems(initialValues.items);
              },
            });
          } catch (error) {
            console.error('[Firestore Save] error:', error);
            errorHandler(error instanceof Error ? error : new Error(String(error)));
          }
        },
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
      form,
    ],
  );

  // Check basic view access first
  if (
    !hasPermission(PERMISSIONS.VIEW_ACCOUNTS) &&
    !hasPermission(PERMISSIONS.VIEW_EXPENSE) &&
    !hasExecutiveAccess
  ) {
    return (
      <Alert
        message={t('accessDenied', 'Access Denied')}
        description={t(
          'noAccountAccess',
          'You do not have permission to view account information.',
        )}
        type="error"
        showIcon
        className="my-8"
      />
    );
  }

  // Check province access
  if (!hasValidProvinceAccess) {
    return (
      <Alert
        message={t('accessDenied', 'Access Denied')}
        description={t('noProvinceAccess', 'You do not have permission to access this province.')}
        type="error"
        showIcon
        className="my-8"
      />
    );
  }

  // Check department access
  if (!canAccessDepartment) {
    return (
      <Alert
        message={t('accessDenied', 'Access Denied')}
        description={t(
          'noDepartmentAccess',
          'You do not have permission to access this department.',
        )}
        type="error"
        showIcon
        className="my-8"
      />
    );
  }

  // Step labels based on role categories and permissions
  const getStepLabel = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return t('inputPrice.step.record', 'บันทึกรายการ');
      case 1:
        return t('inputPrice.step.review', 'ตรวจสอบ');
      case 2:
        return t('inputPrice.step.approve', 'อนุมัติ');
      default:
        return '';
    }
  };

  const defaultSteps = [getStepLabel(0), getStepLabel(1), getStepLabel(2)];

  const _onValuesChange = async (val) => {
    try {
      const changeKey = firstKey(val);
      console.log('[InputPrice] _onValuesChange called:', { changeKey, val });

      if (changeKey === 'billNoSKC' && isString(val[changeKey])) {
        console.log('[InputPrice] Processing billNoSKC change:', val[changeKey]);
        const importVehiclesRef = collection(firestore, 'sections', 'stocks', 'importVehicles');
        const q = query(importVehiclesRef, where('billNoSKC', '==', val[changeKey]));
        const snap = await getDocs(q);
        console.log('[InputPrice] Firestore query result - snap.empty:', snap.empty);
        if (!snap.empty) {
          const arr = [];
          snap.forEach((docSnap) => {
            const data = processFirestoreDataForForm(docSnap.data());
            const item = {
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
              _key: docSnap.id,
            };
            arr.push(item);
          });

          if (arr.length > 0) {
            const mArr = [];
            await arrayForEach(
              arr.filter((l) => !l.deleted),
              async (it) => {
                const productPCode = removeAllNonAlphaNumericCharacters(it.productCode);
                const vehicleListRef = collection(firestore, 'data', 'products', 'vehicleList');
                const lpQuery = query(vehicleListRef, where('productPCode', '==', productPCode));
                const lpSnap = await getDocs(lpQuery);
                let lp = null;

                if (!lpSnap.empty) {
                  lpSnap.forEach((lpDoc) => {
                    lp = { ...lpDoc.data(), _id: lpDoc.id };
                  });
                }

                if (lp) {
                  mArr.push({
                    ...it,
                    creditTerm: lp.creditTerm,
                    unitPrice: lp.listPrice,
                    unitPrice_original: lp.listPrice,
                    total: Numb(lp.listPrice) * Numb(it.qty),
                  });
                } else {
                  mArr.push(it);
                }
              },
            );
            const sortedArr = sortArr(mArr, 'importTime').map((od, id) => ({
              ...od,
              id,
              key: id.toString(),
            }));

            form.setFieldsValue({
              items: sortedArr,
              priceType: sortedArr[0]?.priceType,
              creditDays: sortedArr[0]?.creditTerm,
            });
            setItems(sortedArr);
            setCState({
              total: (sortedArr || []).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0),
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
            const docData = processFirestoreDataForForm(expenseSnap.docs[0].data());
            // Merge: use found expense data (excluding items), but always use arr for items
            const { items: _ignore, ...restDocData } = docData;
            console.log('[InputPrice] restDocData:', restDocData);
            form.setFieldsValue({
              ...formValues,
              ...restDocData,
              billDiscount: restDocData.billDiscount ?? 0,
              deductDeposit: restDocData.deductDeposit ?? 0,
              auditTrail: docData.auditTrail || undefined,
            });
            setCState({
              total: (restDocData.items || []).reduce(
                (sum, elem) => sum + Numb(elem?.total || 0),
                0,
              ),
              billDiscount: restDocData.billDiscount ?? 0,
              deductDeposit: restDocData.deductDeposit ?? 0,
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
            dueDate: taxInvoiceDate.add(Number(creditDays), 'day'),
          });
        } else {
          form.setFieldsValue({
            dueDate: dayjs().add(Number(creditDays), 'day'),
          });
        }
      }
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const { billDiscount, deductDeposit, total } = cState;

  const onBillDiscountChange = (value) => {
    if (value === null || isNaN(value)) {
      setCState({ billDiscount: 0 });
      return;
    }
    setCState({ billDiscount: value });
  };

  const onDeductDepositChange = (value) => {
    if (value === null || isNaN(value)) {
      setCState({ deductDeposit: 0 });
      return;
    }
    setCState({ deductDeposit: value });
  };

  const onPriceTypeChange = (priceType) => {
    const items = form.getFieldValue('items');
    if (!items) return;

    const arr = items.map((it) => {
      const unitPrice =
        priceType === 'separateVat'
          ? Number((Numb(it.unitPrice_original || 0) / 1.07).toFixed(3))
          : it.unitPrice_original || 0;
      return { ...it, priceType, unitPrice };
    });

    const total = (arr || []).reduce(
      (sum, elem) => sum + (Numb(elem.qty) * Numb(elem.unitPrice) - Numb(elem.discount || 0)),
      0,
    );

    form.setFieldsValue({ priceType, items: arr });
    setCState({ priceType, total: Number(total.toFixed(4)) });
  };

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
    </div>
  );

  // Determine enabled/disabled state for each block based on permissions
  const canEditEditedBy = canEdit;
  const canEditReviewedBy = canReview;
  const canEditApprovedBy = canApprove;

  return (
    <div className="space-y-6" style={{ marginTop: isMobile ? '60px' : '0px' }}>
      <PageTitle
        title={t('title')}
        subtitle={t('subtitle', 'รถและอุปกรณ์')}
        steps={defaultSteps}
        activeStep={activeStep}
        showStepper={true}
      />

      <Card size={isMobile ? 'small' : 'default'}>
        <Form
          id="input-price-form"
          form={form}
          onValuesChange={(changed, all) => {
            _onValuesChange(changed);
            console.log('[InputPrice] _onValuesChange called:', { changed, all });
          }}
          onFinish={onConfirm}
          initialValues={initialValues}
          layout="vertical"
          disabled={isReadOnly}
        >
          <Form.Item
            label={
              <span>
                <SearchOutlined /> {t('searchByReceiptNumber')}
              </span>
            }
            name="billNoSKC"
          >
            <DocSelector
              collection="sections/stocks/importVehicles"
              orderBy={['billNoSKC']}
              wheres={[
                ['warehouseChecked', '!=', null],
                // ['total', '==', null]
              ]}
              size="middle"
              placeholder={t('receiptNumber')}
              hasKeywords
              firestore={firestore}
              onChange={(value) => {
                console.log('[DocSelector] Direct onChange called:', value);
                // This will also trigger the form's onValuesChange
              }}
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
                <InputNumber
                  placeholder={t('credit')}
                  addonAfter={t('days')}
                  style={{ width: '100%' }}
                />
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
              items={items || []}
              onChange={(newItems) => {
                setItems(newItems);
                form.setFieldsValue({ items: newItems });
              }}
              grant={grant}
              readOnly={isReadOnly}
            />
          </div>

          <div className="w-full mt-4" style={{ width: '100%' }}>
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
          <div className="flex justify-center mt-10">
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckOutlined />}
              form="input-price-form"
              className="save-button"
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
    </div>
  );
};

export default InputPrice;
