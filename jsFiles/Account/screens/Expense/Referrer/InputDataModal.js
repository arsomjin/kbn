import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Card, Row, CardBody } from 'shards-react';
import { Form, Modal } from 'antd';
import { showConfirm, load } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { checkDoc } from 'firebase/api';
import { formatValuesBeforeLoad } from 'functions';


import { cleanNumberFields } from 'functions';
import { getChanges } from 'functions';
import moment from 'moment';
import { StatusMap } from 'data/Constant';
import { getEditArr } from 'utils';
import { NotificationIcon } from 'elements';
import { errorHandler } from 'functions';
import { getNetTotal } from 'Modules/Credit/api';
import { renderSale } from 'Modules/Credit/Components';
import { referrerCheck } from 'Modules/Credit/Components';
import { createNewOrderId } from 'Modules/Account/api';

const InputDataModal = ({
  selectedData = {},
  saleData,
  visible,
  onOk,
  onCancel,
  title = 'Title',
  ...mProps
}) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const [sale, setSale] = useState(saleData || {});

  // const renderBody =
  //   selectedData.saleType === 'sklLeasing'
  //     ? renderSKLBody
  //     : selectedData.saleType === 'baac'
  //     ? renderBAACBody
  //     : selectedData.saleType === 'cash'
  //     ? renderCashBody
  //     : renderKBNBody;

  const grant = true;

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const netTotal = useRef(null);
  const isEdit = selectedData && selectedData.inputBy && selectedData.created;
  const isRecorded =
    selectedData &&
    !!saleData?.creditInfo &&
    saleData.creditInfo?.contractAmtReceivedDate;

  const getSaleData = useCallback(async (sData) => {
    try {
      load(true);
      const saleDoc = await checkDoc(
        'sections',
        `sales/vehicles/${sData.saleId}`
      );
      if (saleDoc) {
        let loadSale = formatValuesBeforeLoad(saleDoc.data());
        setSale(loadSale);
        //  showLog('sale', loadSale);
      }
      load(false);
    } catch (e) {
      load(false);
      showWarn(e);
    }
  }, []);

  useEffect(() => {
    if (!saleData && selectedData?.saleId) {
      // Get Sale Data.
      getSaleData(selectedData);
    }
  }, [getSaleData, saleData, selectedData]);

  const onConfirm = useCallback(
    async (mValues) => {
      try {
        load(true);
        let newValues = cleanValuesBeforeSave({
          ...mValues,
          itemType: selectedData.itemType,
        });
        const oldValues = JSON.parse(JSON.stringify(selectedData));
        //  showLog({ newValues, oldValues });
        // Update changes.
        if (isEdit) {
          let changes = getChanges(oldValues, newValues);
          newValues.editedBy = !!selectedData.editedBy
            ? [
                ...selectedData.editedBy,
                { uid: user.uid, time: Date.now(), changes },
              ]
            : [{ uid: user.uid, time: Date.now(), changes }];
        } else {
          newValues.created = moment().valueOf();
          newValues.createdBy = user.uid;
          newValues.status = StatusMap.pending;
        }

        const { referringDetails } = newValues;
        const {
          forHQ,
          bank,
          bankAcc,
          bankName,
          total,
          whTax,
          saleCutoffDate,
          saleId,
          saleItems,
          saleNo,
        } = referringDetails;

        // Add expense.
        // date, expenseId, expenseType: 'referrer', 'total', 'whTax', 'referringDetails'
        let expenseId = createNewOrderId('ACC-EXP');
        let expense = {
          date: forHQ.hqAuditorDate,
          expenseId,
          expenseType: 'referrer',
          total: total,
          whTax: whTax,
          creditInfo: newValues,
          created: moment().valueOf(),
          createdBy: user.uid,
          hqAuditor: forHQ.hqAuditor,
          hqAccountAuditor: forHQ.hqAccountAuditor,
          hqAuditorDate: forHQ.hqAuditorDate,
          bank,
          bankAcc,
          bankName,
          saleCutoffDate,
          saleId,
          saleItems,
          saleNo,
        };
        expense = cleanValuesBeforeSave(expense);
        const expenseRef = firestore
          .collection('sections')
          .doc('account')
          .collection('expenses')
          .doc(expenseId);
        expenseRef.set(expense);

        // Record log.
        api.addLog(
          {
            time: Date.now(),
            type: 'created',
            by: user.uid,
            docId: expenseId,
          },
          'expenses',
          'daily'
        );

        // Update credit.
        const creditRef = firestore
          .collection('sections')
          .doc('credits')
          .collection('credits');
        // // Add credit order.
        const docSnap = await creditRef.doc(newValues.saleId).get();
        if (docSnap.exists) {
          await creditRef.doc(newValues.saleId).update({ referringDetails });
        } else {
          await creditRef.doc(newValues.saleId).set(newValues);
        }

        // Update sale.
        const saleRef = firestore
          .collection('sections')
          .doc('sales')
          .collection('vehicles')
          .doc(newValues.saleId);
        const saleDoc = await saleRef.get();
        if (saleDoc.exists) {
          let sale = saleDoc.data();
          let accountReferrerChecked = sale.accountReferrerChecked
            ? [
                ...sale.accountReferrerChecked,
                {
                  time: Date.now(),
                  checkId: newValues.saleId,
                  by: newValues.inputBy,
                  creditInfo: newValues,
                },
              ]
            : [
                {
                  time: Date.now(),
                  checkId: newValues.saleId,
                  by: newValues.inputBy,
                  creditInfo: newValues,
                },
              ];
          let creditInfo = sale.creditInfo || newValues;
          creditInfo.referringDetails = referringDetails;
          // await saleRef.set(mSale);
          let saleObj = cleanValuesBeforeSave({
            ...sale,
            accountReferrerChecked,
            creditInfo,
            referringDetails,
          });
          await saleRef.set(saleObj);
          // Record log.
          api.addLog(
            isEdit
              ? {
                  time: Date.now(),
                  type: 'edited',
                  by: user.uid,
                  docId: newValues.saleId,
                }
              : {
                  time: Date.now(),
                  type: 'created',
                  by: user.uid,
                  docId: newValues.saleId,
                },
            'expenseReferrer',
            'vehicle'
          );
          showSuccess(
            () => onOk && onOk(newValues),
            'บันทึกข้อมูลสำเร็จ',
            true
          );
        } else {
          errorHandler({ message: 'NO_SALE_ID' });
        }
        load(false);

        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
        errorHandler({
          code: e?.code || '',
          message: e?.message || '',
          snap: { ...mValues, module: 'ExpenseReferrer' },
        });
      }
    },
    [api, firestore, isEdit, onOk, selectedData, user.uid]
  );

  const onPreConfirm = useCallback(
    async (values) => {
      try {
        // const dupSnap = await checkCollection('sections/credits/credits', [
        //   ['keywords', 'array-contains', values.creditNo.toLowerCase()],
        // ]);
        // if (dupSnap) {
        //   showAlert(
        //     'มีรายการซ้ำ',
        //     `เอกสารเลขที่ ${values.creditNo} มีบันทึกไว้แล้วในฐานข้อมูล`,
        //     'warning'
        //   );
        //   return;
        // }

        let mValues = cleanNumberFields(values, [
          'amtFull',
          'downPayment',
          'totalDownDiscount',
          'firstInstallment',
          'amtInsurance',
          'amtActOfLegal',
          'loanInfoIncome',
          'vat',
          'wht',
        ]);
        //  showLog({ values, vValues, mValues, netTotal: netTotal.current });
        showConfirm(
          () =>
            onConfirm({
              ...selectedData,
              ...mValues,
              netTotal: netTotal.current,
            }),
          `บันทึกข้อมูลเลขที่ ${selectedData.saleNo}`
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [onConfirm, selectedData]
  );

  return (
    <Modal
      // title={<h6 className="text-primary">{title}</h6>}
      visible={visible}
      onOk={form.submit}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ปิด"
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
    >
      {sale?.saleId &&
        renderSale({
          sale,
          grant: true,
          readOnly: true,
        })}
      <Form
        form={form}
        onFinish={onPreConfirm}
        size="small"
        initialValues={selectedData}
        // layout="vertical"
      >
        {(values) => {
          //  showLog({ values });
          netTotal.current = getNetTotal(values);
          let editData = [];
          if (values.editedBy && values.editedBy.length > 1) {
            editData = getEditArr(values.editedBy, users);
          }
          return (
            <Card small className="mb-4">
              {values.editedBy && values.editedBy.length > 1 && (
                <Row
                  form
                  className="mb-3 ml-2"
                  style={{ alignItems: 'center' }}
                >
                  <NotificationIcon
                    icon="edit"
                    data={editData}
                    badgeNumber={values.editedBy.length}
                    theme="warning"
                  />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <HiddenItem name="creditId" />
              <CardBody>
                {referrerCheck({ values, isAccountCheck: true })}
              </CardBody>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

export default InputDataModal;
