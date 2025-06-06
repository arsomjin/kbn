import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { ChevronLeftOutlined } from '@material-ui/icons';
import { Collapse, Form, Modal } from 'antd';
import { w } from 'api';
import { PageSummary } from 'api';
import { useMergeState } from 'api/CustomHooks';
import EditableCellTable from 'components/EditableCellTable';
import Footer from 'components/Footer';
import HiddenItem from 'components/HiddenItem';
import { ExpenseType } from 'data/Constant';
import { Button } from 'elements';
import { NotificationIcon } from 'elements';
import { errorHandler } from 'functions';
import { deepEqual } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showSuccess } from 'functions';
import { getWHTax } from 'functions';
import { getBeforeVat } from 'functions';
import { showConfirm } from 'functions';
import { arrayForEach } from 'functions';
import { Numb } from 'functions';
import { showWarn } from 'functions';
import { getVat } from 'functions';
import { firstKey } from 'functions';
import { showLog } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import { getSumData } from 'Modules/Utils';
import moment from 'moment-timezone';
import numeral from 'numeral';
import React, { useContext, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, CardFooter } from 'shards-react';
import { getEditArr } from 'utils';
import ExpenseHeader from '../expense-header';
import { columns, getInitItem, getInitValues, handleUpdate, initItemValues, renderInput, renderSummary } from './api';
import { FirebaseContext } from '../../../../../../firebase';
import ExpenseExecutive from './components';
import { checkExistingExpense } from '../../api';
import { distinctArr } from 'functions';

export default ({ order, onConfirm, onBack, isEdit, readOnly, expenseType, expenseNames }) => {
  const grant = true;
  const { firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { banks, dealers, users, branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expenseModal, setExpenseModal] = useMergeState({
    visible: false,
    expense: {}
  });

  const [nProps, setProps] = useMergeState({
    order,
    readOnly,
    onBack,
    isEdit
  });

  const [branchCode, setBranch] = useState(order?.branchCode || user.branch || '0450');

  const _resetInitState = initValue => {
    let curValues = form.getFieldsValue();
    if (
      !deepEqual(curValues, {
        ...getInitValues(order),
        branchCode: order?.branchCode || user.branch || '0450',
        ...initValue
      })
    ) {
      // Reset form.
      form.setFieldsValue({
        ...getInitValues(order),
        branchCode: order?.branchCode || user.branch || '0450',
        ...initValue
      });
      form2.setFieldsValue(getInitItem());
      setData([]);
    }
  };

  useEffect(() => {
    setProps({ expenseNames });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseNames]);

  useEffect(() => {
    setProps({
      order,
      readOnly,
      onBack,
      isEdit
    });
    if (isEdit) {
      form.setFieldsValue({
        ...getInitValues(order),
        branchCode: order?.branchCode || user.branch || '0450'
      });
      const { branchCode, date, expenseId } = order;
      updateData({ branchCode, date, expenseId });
    } else {
      _resetInitState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, order, readOnly]);

  const updateData = async filters => {
    try {
      const { date, branchCode } = filters;
      setLoading(true);
      const updates = await handleUpdate(filters, nProps);
      if (!updates) {
        setLoading(false);
        return _resetInitState({ date, branchCode });
      }
      const { expenseId, expenseItems, total, editedBy } = updates;

      form.setFieldsValue({
        expenseId,
        total,
        editedBy
      });
      setData(expenseItems);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
      errorHandler(e);
    }
  };

  const _onValuesChange = val => {
    let expenseId = form.getFieldValue('expenseId');
    if (firstKey(val) === 'branchCode') {
      let date = form.getFieldValue('date');
      updateData({ ...val, date, expenseId });
      setBranch(val.branchCode);
    } else if (firstKey(val) === 'date') {
      let branchCode = form.getFieldValue('branchCode');
      updateData({ ...val, branchCode, expenseId });
    }
  };

  const _onValuesChange2 = val => {
    if (firstKey(val) === 'dealer') {
      form2.setFieldsValue({
        bank: dealers[val.dealer].dealerBank || null,
        accNo: dealers[val.dealer].dealerBankAccNo || null,
        bankName: dealers[val.dealer].dealerBankName || null
      });
    }
    if (['total', 'priceType', 'hasWHTax'].includes(firstKey(val))) {
      let values = form2.getFieldsValue();
      const VAT = getVat(Number(values.total), values.priceType);
      const beforeVAT = getBeforeVat(Number(values.total), values.priceType);
      const whTax = getWHTax(Numb(values.total), values.priceType, values.hasWHTax);

      form2.setFieldsValue({
        beforeVAT,
        VAT,
        whTax,
        netTotal: Numb(values.total) + (values.priceType === 'separateVat' ? Numb(VAT) : 0) - Numb(whTax)
      });
    }
  };

  const _onAddConfirm = values => {
    // showLog('add_confirm', values);
    const expenseItemId = createNewOrderId('KBN-ACC-EXP-IT');
    let newData = [
      ...data,
      {
        ...initItemValues,
        ...values,
        id: data.length,
        key: data.length,
        expenseItemId,
        _key: expenseItemId
      }
    ];
    newData = updateDataArr(newData);
    setData(newData);
    form2.resetFields();
  };

  const onUpdateItem = async row => {
    try {
      const newData = [...data];
      const index = newData.findIndex(item => row.key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
      } else {
        newData.push(row);
      }
      setData(newData);
    } catch (errInfo) {
      showWarn('Update Failed:', errInfo);
    }
  };

  const updateDataArr = dArr => {
    let result = dArr.map((it, i) => {
      if (it.total) {
        const VAT = getVat(Number(it.total), it.priceType);
        it.VAT = VAT;
      }
      return it;
    });
    return result;
  };

  const onDeleteItem = async key => {
    try {
      // let expenseId = form.getFieldValue('expenseId');
      let newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        if (newData[index]._key) {
          newData.splice(index, 1, { ...item, deleted: true });
        } else {
          newData = newData.filter(l => l.key !== key);
        }
      } else {
        newData = newData.filter(l => l.key !== key);
        newData = newData.map((l, n) => ({ ...l, key: n, id: n }));
      }
      // showLog({ newData });
      setData(newData);
    } catch (errInfo) {
      showWarn('Delete Failed:', errInfo);
    }
  };

  const handleSelect = rec => {
    setExpenseModal({ expense: rec, visible: true });
  };

  const _onPreConfirm = async () => {
    try {
      let values = await form.validateFields();
      //  showLog({ values });
      let nItems = [];
      let dArr = updateDataArr(data);
      await arrayForEach(dArr, async it => {
        let mItem = JSON.parse(JSON.stringify(it));
        mItem = {
          ...initItemValues,
          ...it,
          expenseType,
          ...(!nProps.isEdit && {
            created: Date.now(),
            inputDate: moment().format('YYYY-MM-DD'),
            inputBy: user.uid
          })
        };
        delete mItem.id;
        delete mItem.key;
        nItems.push(mItem);
      });
      let mValues = { ...values };
      const total = data.reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      const beforeVAT = data.reduce((sum, elem) => sum + Numb(elem?.beforeVAT || 0), 0);
      const VAT = data.reduce((sum, elem) => sum + Numb(elem?.VAT || 0), 0);
      const whTax = data.reduce((sum, elem) => sum + Numb(elem?.whTax || 0), 0);
      const netTotal = data.reduce((sum, elem) => sum + Numb(elem?.netTotal || 0), 0);
      const hasWHTax = data.length === 1 ? data[0].hasWHTax : 'Mixed';
      const whTaxDoc = data.length === 1 ? data[0].whTaxDoc : 'Mixed';
      const priceType = data.length === 1 ? data[0].priceType : 'Mixed';

      mValues = {
        ...mValues,
        total,
        items: nItems,
        beforeVAT,
        VAT,
        whTax,
        netTotal,
        hasWHTax,
        whTaxDoc,
        priceType
      };
      if (!nProps.isEdit) {
        // Recheck existing expenseId (In case duplicate doc while recording data.)
        let wheres = [
          ['expenseType', '==', 'executive'],
          ['branchCode', '==', mValues.branchCode],
          ['date', '==', mValues.date]
        ];
        const eDoc = await checkExistingExpense(wheres);
        if (!!eDoc?.expenseId && !!eDoc?.created && !!eDoc?.date && eDoc?.expenseId !== mValues.expenseId) {
          if (eDoc?.items) {
            nItems = distinctArr(nItems.concat(eDoc.items), ['expenseItemId']);
          }
          mValues = { ...eDoc, ...mValues, items: nItems };
        }
      }
      mValues = cleanValuesBeforeSave(mValues);
      showConfirm(
        () => onConfirm(mValues, _resetInitState),
        `การบันทึกรายจ่าย${ExpenseType[expenseType]} สาขา${branches[mValues.branchCode].branchName} วันที่ ${moment(
          mValues.date,
          'YYYY-MM-DD'
        ).format('DD/MM/YYYY')} จำนวน ${nItems.length} รายการ`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const handleLedgerRecordsUpdate = async mValues => {
    const expenseKey = expenseModal.expense.expenseItemId;
    const ledgerTotal = mValues.reduce((sum, elem) => sum + Numb(elem.netTotal), 0);
    // const whTotal = mValues.reduce((sum, elem) => sum + Numb(elem.whTax), 0);
    let nData = [...data];
    let eIndex = nData.findIndex(l => l._key === expenseKey);
    if (eIndex > -1) {
      // nData[eIndex].ledgerRecords = mValues;
      nData[eIndex].ledgerTotal = ledgerTotal;
      nData[eIndex].ledgerCompleted = ledgerTotal === Numb(nData[eIndex].netTotal);
      // ledgerTotal - whTotal === Numb(nData[eIndex].total);
      const mArr = mValues.map(l => {
        let mItem = l;
        delete mItem.id;
        delete mItem.key;
        return cleanValuesBeforeSave(mItem);
      });
      nData[eIndex].ledgerRecords = mArr;
      setData(nData);
      // showLog({ nData });
      showSuccess(() => showLog('Success'), `บันทึกแยกประเภทบัญชี สำเร็จ`);
    }
  };

  const handleInvoiceUpdate = async newData => {
    const expenseKey = expenseModal.expense.expenseItemId;
    try {
      let nData = [...data];
      let eIndex = nData.findIndex(l => l._key === expenseKey);
      if (eIndex > -1) {
        nData[eIndex].taxInvoiceInfo = newData;
        nData[eIndex].taxInvoiceCompleted = !!newData?.taxInvoiceNo;
        setData(nData);
        //  showLog({ nData });
      }
      showSuccess(() => showLog('Success'), `บันทึกข้อมูลใบกำกับภาษีเลขที่ ${newData.taxInvoiceNo} สำเร็จ`);
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitValues(nProps.order),
          branchCode: nProps.order?.branchCode || user.branch || '0450'
        }}
        size="small"
        layout="vertical"
      >
        {values => {
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <>
              <HiddenItem name="expenseId" />
              <Row form>
                <Col md="8">
                  <ExpenseHeader disabled={!grant || readOnly} disableAllBranches />
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
            </>
          );
        }}
      </Form>
      <Form
        form={form2}
        onFinish={_onAddConfirm}
        onValuesChange={_onValuesChange2}
        initialValues={getInitItem}
        size="small"
        layout="vertical"
      >
        {values => {
          const sumData = getSumData(values);
          return (
            <>
              <Collapse className="mb-3">
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values, expenseType)}
                  <PageSummary data={sumData} />
                  <Footer
                    onConfirm={() => form2.submit()}
                    onCancel={() => form2.resetFields()}
                    cancelText="ล้างข้อมูล"
                    cancelPopConfirmText="ล้าง?"
                    okPopConfirmText="ยืนยัน?"
                    okText="เพิ่มรายการ"
                    okIcon={<PlusOutlined />}
                  />
                </Collapse.Panel>
              </Collapse>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        onUpdate={onUpdateItem}
        onDelete={onDeleteItem}
        handleEdit={handleSelect}
        hasEdit
        loading={loading}
      />
      {renderSummary(data)}
      <CardFooter className="d-flex justify-content-end m-3">
        {isEdit && (
          <Button
            onClick={() => history.push(onBack.path, { params: onBack })}
            size="middle"
            icon={<ChevronLeftOutlined />}
            className="mr-3"
          >
            {'กลับ'}
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => _onPreConfirm()}
          size="middle"
          icon={<CheckOutlined />}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {'บันทึกข้อมูล'}
        </Button>
      </CardFooter>
      <Modal
        title={`เลขที่: ${expenseModal.expense.docNo} | ผู้จำหน่าย ${
          dealers[expenseModal.expense.receiver] ? dealers[expenseModal.expense.receiver].dealerName : ''
        } | จำนวนเงิน ${numeral(expenseModal.expense.netTotal).format('0,0.00')} บาท`}
        visible={expenseModal.visible}
        onCancel={() => setExpenseModal({ visible: false, expense: {} })}
        footer={[
          <Button key="close" onClick={() => setExpenseModal({ visible: false, expense: {} })}>
            ปิด
          </Button>
        ]}
        cancelText="ปิด"
        width={isMobile ? '90vw' : '77vw'}
        bodyStyle={{ height: '75vh', overflowY: 'scroll' }}
        style={{ left: isMobile ? 0 : w(7) }}
        destroyOnClose
      >
        <ExpenseExecutive
          branchCode={branchCode}
          expenseNames={expenseNames}
          handleLedgerRecordsUpdate={handleLedgerRecordsUpdate}
          handleInvoiceUpdate={handleInvoiceUpdate}
          user={user}
          firestore={firestore}
          banks={banks}
          {...{ record: expenseModal.expense, grant: true, readOnly: true }}
        />
      </Modal>
    </div>
  );
};
