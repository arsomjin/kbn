import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { showLog } from 'functions';
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
import { getNetTotal, renderSale, renderBAACBody } from './api';
import { cleanNumberFields } from 'functions';
import { getChanges } from 'functions';
import moment from 'moment';
import { StatusMap } from 'data/Constant';
import { getEditArr } from 'utils';
import { NotificationIcon } from 'elements';
import { errorHandler } from 'functions';

const InputDataModal = ({ selectedData = {}, saleData, visible, onOk, onCancel, title = 'Title', ...mProps }) => {
  showLog({ selectedData, saleData });
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const [sale, setSale] = useState(saleData || {});

  const grant = true;

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const netTotal = useRef(null);
  const isEdit = selectedData && selectedData.inputBy && selectedData.created;

  const getSaleData = useCallback(async sData => {
    try {
      load(true);
      const saleDoc = await checkDoc('sections', `sales/vehicles/${sData.saleId}`);
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
    async mValues => {
      try {
        load(true);
        let newValues = cleanValuesBeforeSave(mValues);
        const oldValues = JSON.parse(JSON.stringify(selectedData));
        //  showLog({ newValues, oldValues });
        // Update changes.
        if (isEdit) {
          let changes = getChanges(oldValues, newValues);
          newValues.editedBy = !!selectedData.editedBy
            ? [...selectedData.editedBy, { uid: user.uid, time: Date.now(), changes }]
            : [{ uid: user.uid, time: Date.now(), changes }];
        } else {
          newValues.created = moment().valueOf();
          newValues.createdBy = user.uid;
          newValues.status = StatusMap.pending;
        }

        newValues.incomeCategory = 'BAAC';

        const accountRef = firestore.collection('sections').doc('account').collection('incomes');
        // Add account order.
        const docSnap = await accountRef.doc(newValues.accountId).get();
        if (docSnap.exists) {
          await accountRef.doc(newValues.accountId).update(newValues);
        } else {
          await accountRef.doc(newValues.accountId).set(newValues);
        }

        // Update sale.
        const saleRef = firestore.collection('sections').doc('sales').collection('vehicles').doc(newValues.saleId);
        const saleDoc = await saleRef.get();
        if (saleDoc.exists) {
          let accountRecorded = saleDoc.data().accountRecorded
            ? [
                ...saleDoc.data().accountRecorded,
                {
                  time: Date.now(),
                  by: newValues.inputBy
                }
              ]
            : [
                {
                  time: Date.now(),
                  by: newValues.inputBy
                }
              ];
          await saleRef.update({ accountRecorded });
        }

        // Record log.
        api.addLog(
          isEdit
            ? {
                time: Date.now(),
                type: 'edited',
                by: user.uid,
                docId: newValues.accountId
              }
            : {
                time: Date.now(),
                type: 'created',
                by: user.uid,
                docId: newValues.accountId
              },
          'account',
          'vehicle'
        );

        load(false);
        showSuccess(() => onOk && onOk(newValues), 'บันทึกข้อมูลสำเร็จ', true);
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
        errorHandler({
          code: e?.code || '',
          message: e?.message || '',
          snap: { ...mValues, module: 'IncomeBAAC' }
        });
      }
    },
    [api, firestore, isEdit, onOk, selectedData, user.uid]
  );

  const onPreConfirm = useCallback(
    async values => {
      try {
        const vValues = await form.validateFields();
        let mValues = cleanNumberFields(vValues, [
          'amtFull',
          'downPayment',
          'totalDownDiscount',
          'firstInstallment',
          'amtInsurance',
          'amtActOfLegal',
          'loanInfoIncome',
          'vat',
          'wht'
        ]);
        //  showLog({ values, vValues, mValues, netTotal: netTotal.current });
        showConfirm(
          () =>
            onConfirm({
              ...selectedData,
              ...mValues,
              netTotal: netTotal.current
            }),
          `บันทึกข้อมูลเลขที่ ${mValues.accountId}`
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [form, onConfirm, selectedData]
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
          readOnly: true
        })}
      <Form
        form={form}
        onFinish={onPreConfirm}
        size="small"
        initialValues={selectedData}
        // layout="vertical"
      >
        {values => {
          //  showLog({ values });
          netTotal.current = getNetTotal(values);
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <Card small className="mb-4">
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <HiddenItem name="accountId" />
              <CardBody>{renderBAACBody({ values, grant, netTotal: netTotal.current })}</CardBody>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

export default InputDataModal;
