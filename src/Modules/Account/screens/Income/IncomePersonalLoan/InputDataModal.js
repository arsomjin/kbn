import React, { useCallback, useContext } from 'react';
import { showLog } from 'functions';
import { Form, Modal, Space } from 'antd';
import { showConfirm, load } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { renderPLoanBody } from './helper';
import { cleanNumberFields } from 'functions';
import moment from 'moment';
import { errorHandler } from 'functions';
import { createNewId } from 'utils';
import { getDoc } from 'firebase/api';

const InputDataModal = ({ record = {}, visible, onOk, onCancel, title = 'Title', ...mProps }) => {
  showLog({ record, mProps });
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const [form] = Form.useForm();

  const onConfirm = useCallback(
    async mValues => {
      try {
        load(true);
        // TODO: Add data to Firestore.

        let newValues = cleanValuesBeforeSave(mValues);

        newValues.loanIncomeId = createNewId();
        newValues.created = moment().valueOf();
        newValues.createdBy = user.uid;
        delete newValues.rowIndex;
        delete newValues.id;
        delete newValues.key;
        delete newValues.pLoanPayments;

        const loanIncomeRef = firestore.collection('sections').doc('account').collection('incomePersonalLoan');
        // Add account order.
        await loanIncomeRef.doc(newValues.loanIncomeId).set(newValues);

        let income = await getDoc('sections', `account/incomes/${newValues.incomeId}`);
        let pLoanPayments = [];
        const {
          loanIncomeId,
          incomeId,
          payDate,
          created,
          createdBy,
          amtReceived,
          loanIncomeReceiver,
          pLoanNo,
          selfBankId
        } = newValues;
        let incomeItem = {
          loanIncomeId,
          incomeId,
          payDate,
          created,
          createdBy,
          amtReceived,
          loanIncomeReceiver,
          pLoanNo,
          selfBankId
        };
        pLoanPayments.push(incomeItem);
        if (income) {
          const incomeRef = firestore.collection('sections').doc('account').collection('incomes');
          // Update income doc.
          if (income.pLoanPayments) {
            let arr = [...income.pLoanPayments];
            if (arr.filter(l => l.loanIncomeId === newValues.loanIncomeId).length > 0) return; // Already updated.
            arr.push(incomeItem);
            pLoanPayments = arr;
          }
          await incomeRef.doc(newValues.incomeId).update({ pLoanPayments });
        }
        // Record log.
        api.addLog(
          {
            time: Date.now(),
            type: 'created',
            by: user.uid,
            docId: newValues.loanIncomeId
          },
          'account',
          'incomePersonalLoan'
        );

        load(false);
        showSuccess(() => onOk && onOk(pLoanPayments), 'บันทึกข้อมูลสำเร็จ', true);
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
        errorHandler({
          code: e?.code || '',
          message: e?.message || '',
          snap: { ...mValues, module: 'IncomePersonalLoan' }
        });
      }
    },
[api, firestore, onOk, user.uid]
  );

  const onPreConfirm = useCallback(
    async values => {
      try {
        const vValues = await form.validateFields();
        let mValues = cleanNumberFields(vValues, ['totalLoan', 'amtReceived']);
        showLog({
          values,
          vValues,
          mValues,
          preConfirm: {
            ...record,
            ...mValues
          }
        });
        showConfirm(
          () =>
            onConfirm({
              ...record,
              ...mValues
            }),
          `บันทึกข้อมูลเลขที่ ${mValues.pLoanNo}`
        );
      } catch (e) {
        showWarn(e);
      }
    },
    [form, onConfirm, record]
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
      <Form form={form} onFinish={onPreConfirm} size="small" initialValues={record || {}} layout="vertical">
        {values => {
          //  showLog({ values });
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <HiddenItem name="accountId" />
              {renderPLoanBody({ values })}
            </Space>
          );
        }}
      </Form>
    </Modal>
  );
};

export default InputDataModal;
