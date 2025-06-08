import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { ChevronLeftOutlined, EditOutlined } from '@material-ui/icons';
import { Collapse, Form } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import { TableSummary } from 'api/Table';
import { getRules } from 'api/Table';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import Footer from 'components/Footer';
import HiddenItem from 'components/HiddenItem';
import InputModal from 'components/InputModal';
import { ExpenseType } from 'data/Constant';
import { Button } from 'elements';
import { NotificationIcon } from 'elements';
import { errorHandler } from 'functions';
import { deepEqual } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { showConfirm } from 'functions';
import { arrayForEach } from 'functions';
import { Numb } from 'functions';
import { showWarn } from 'functions';
import { getVat } from 'functions';
import { firstKey } from 'functions';
import { distinctArr } from 'functions';
import { createNewOrderId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, CardFooter } from 'shards-react';
import { getEditArr } from 'utils';
import { checkExistingExpense } from '../../api';
import ExpenseHeader from '../expense-header';
import { columns, getInitItem, getInitValues, handleUpdate, initItemValues, renderInput, renderSummary } from './api';
import ChangeDepositModal from './components/ChangeDepositModal';

export default ({ order, onConfirm, onBack, isEdit, readOnly, expenseType, setUnsaved }) => {
  const { user } = useSelector(state => state.auth);
  const { users, branches } = useSelector(state => state.data);

  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  const history = useHistory();

  const grant = true;

  const [nProps, setProps] = useMergeState({
    order,
    readOnly,
    onBack,
    isEdit
  });

  const [data, setData] = useState([]);
  const [payByOther, setPayByOther] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useMergeState({ visible: false, data: [] });
  const [prev, setPrev] = useMergeState({ changeDeposit: [] });
  const [cBranch, setCBranch] = useState(order?.branchCode || user.homeBranch || (user?.allowedBranches?.[0]) || '0450');

  const _resetInitState = initValue => {
    let curValues = form.getFieldsValue();
    if (
      !deepEqual(curValues, {
        ...getInitValues(order),
        branchCode: initValue?.branchCode || cBranch,
        ...initValue
      })
    ) {
      // Reset form.
      form.setFieldsValue({
        ...getInitValues(order),
        branchCode: initValue?.branchCode || cBranch,
        ...initValue
      });
      form2.setFieldsValue(getInitItem(null, initValue?.branchCode || cBranch));
      setData([]);
    }
  };

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
        branchCode: cBranch
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
      const updates = await handleUpdate(filters, nProps, user);
      if (!updates) {
        setLoading(false);
        return _resetInitState({ date, branchCode });
      }
      const {
        expenseId,
        expenseItems,
        changeDeposit,
        receiverEmployee,
        total,
        editedBy,
        totalDeposit,
        otherBranchPay
      } = updates;
      form.setFieldsValue({
        expenseId,
        changeDeposit,
        receiverEmployee,
        total,
        billTotal: totalDeposit - total,
        editedBy
      });
      form2.setFieldsValue(getInitItem(null, branchCode));
      setCBranch(branchCode);
      setPrev({ changeDeposit });
      !!totalDeposit && !!receiverEmployee && form.validateFields();
      setPayByOther(otherBranchPay);
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
    } else if (firstKey(val) === 'date') {
      let branchCode = form.getFieldValue('branchCode');
      updateData({ ...val, branchCode, expenseId });
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
    setUnsaved();
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
      // showLog({ newData });
      setData(newData);
    } catch (errInfo) {
      showWarn('Update Failed:', errInfo);
    }
  };

  const updateDataArr = dArr => {
    let change = form.getFieldValue('changeDeposit');
    const totalChange = change.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
    let result = dArr.map((it, i) => {
      if (it.total) {
        const pTotal = Numb(it.total) + dArr.slice(0, i).reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
        const balance = totalChange - pTotal;
        const VAT = getVat(Number(it.total), it.priceType);
        it.balance = balance;
        it.VAT = VAT;
      }
      return it;
    });
    return result;
  };

  const onDeleteItem = async key => {
    try {
      let expenseId = form.getFieldValue('expenseId');
      let newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1 && !!expenseId) {
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

  const _onPreConfirm = async values => {
    try {
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
            inputDate: dayjs().format('YYYY-MM-DD'),
            inputBy: user.uid
          })
        };
        delete mItem.balance;
        delete mItem.id;
        delete mItem.key;
        nItems.push(mItem);
      });
      let mValues = { ...values };
      const total = data.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      const totalDeposit = mValues.changeDeposit
        .filter(l => !l.deleted)
        .reduce((sum, elem) => sum + Numb(elem?.total || 0), 0);
      mValues.total = total;
      mValues.billTotal = totalDeposit - total;
      mValues.items = nItems;
      if (!nProps.isEdit) {
        // Recheck existing expenseId (In case duplicate doc while recording data.)
        let wheres = [
          ['expenseType', '==', 'dailyChange'],
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
        `การบันทึกรายจ่ายเงินทอนประจำวัน สาขา${branches[mValues.branchCode].branchName} วันที่ ${dayjs(
          mValues.date,
          'YYYY-MM-DD'
        ).format('DD/MM/YYYY')} จำนวน ${nItems.length} รายการ`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _showChangeDeposit = () => {
    let arr = form.getFieldValue('changeDeposit');
    setShow({ visible: true, data: arr || [] });
  };

  const _onDepositChange = changeDeposit => {
    form.setFieldsValue({ changeDeposit });
    updateDataArr(data);
    setShow({ visible: false, data: [] });
  };

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitValues(nProps.order),
          branchCode: nProps.order?.branchCode || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
        }}
        size="small"
        layout="vertical"
      >
        {values => {
          const changeDeposit = (values?.changeDeposit || [])
            .filter(l => !l.deleted)
            .reduce((sum, elem) => sum + Numb(elem.total), 0);

          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <>
              <HiddenItem name="expenseId" />
              <HiddenItem name="changeDeposit" />
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
              <div className="px-3 bg-white border mb-3 pt-3">
                <Row>
                  <Col md="4">
                    <Form.Item label={`รับ${expenseType === 'executive' ? 'เงิน' : ''}${ExpenseType[expenseType]}`}>
                      <Row className="justify-content-center  ">
                        <h6 className="text-primary mx-3">{numeral(changeDeposit).format('0,0.00')}</h6>
                        <h6 className="text-muted mr-3">บาท</h6>
                        <InputModal
                          name="changeDeposit"
                          onChange={val => {
                            let nChanges = [
                              ...values.changeDeposit,
                              {
                                time: Date.now(),
                                total: val.changeDeposit,
                                by: user.uid,
                                deleted: false
                              }
                            ];
                            form.setFieldsValue({ changeDeposit: nChanges });
                            updateDataArr(data);
                          }}
                          icon={<PlusOutlined />}
                          title={ExpenseType[expenseType]}
                          placeholder="จำนวนเงิน"
                          currency
                          rules={[
                            { required: true, message: 'กรุณาป้อนจำนวนเงิน' },
                            ({ getFieldValue }) => ({
                              validator(rule, value) {
                                if (!value || !isNaN(value)) {
                                  return Promise.resolve();
                                }

                                return Promise.reject('กรุณาป้อนจำนวนเงินเป็นตัวเลข');
                              }
                            })
                          ]}
                          disabled={!grant || readOnly}
                          okText="ตกลง"
                          cancelText="ยกเลิก"
                        />
                        {!!values?.changeDeposit && values.changeDeposit.length > 0 && (
                          <Button
                            icon={<EditOutlined />}
                            shape="circle"
                            className="ml-3"
                            onClick={_showChangeDeposit}
                          />
                        )}
                      </Row>
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="receiverEmployee" label="ผู้รับเงิน" rules={getRules(['required'])}>
                      <EmployeeSelector disabled={!grant || readOnly} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          );
        }}
      </Form>
      <Form
        form={form2}
        initialValues={getInitItem(null, cBranch)}
        layout="vertical"
        size="small"
        onFinish={_onAddConfirm}
      >
        {values => {
          return (
            <Collapse className="mb-3">
              <Collapse.Panel header="บันทึกข้อมูล" key="1">
                {renderInput({ values, grant, readOnly, user })}
                <Footer
                  onConfirm={() => form2.submit()}
                  onCancel={() => form2.resetFields()}
                  cancelText="ล้างข้อมูล"
                  cancelPopConfirmText="ล้าง?"
                  okPopConfirmText="ยืนยัน?"
                  okText="เพิ่มรายการ"
                  okIcon={<PlusOutlined />}
                  disabled={!grant || readOnly}
                />
              </Collapse.Panel>
            </Collapse>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data.filter(l => !l.isChevrolet)}
        columns={columns}
        onUpdate={onUpdateItem}
        onDelete={onDeleteItem}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={7}
            // sumKeys={['expenses', 'distance']}
          />
        )}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
      />
      {data.filter(l => l.isChevrolet).length > 0 && (
        <div className="mt-2">
          <label className="text-primary">รายจ่าย เชฟโรเลต</label>
          <EditableCellTable
            dataSource={data.filter(l => l.isChevrolet)}
            columns={columns}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            loading={loading}
            summary={pageData => (
              <TableSummary
                pageData={pageData}
                dataLength={columns.length}
                startAt={5}
                // sumKeys={['expenses', 'distance']}
              />
            )}
          />
        </div>
      )}
      {renderSummary(data, form, branches, payByOther)}
      <CardFooter className="d-flex justify-content-end m-3">
        {readOnly && (
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
          onClick={() => form.submit()}
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
      <ChangeDepositModal obj={show} onCancel={() => setShow({ visible: false, data: [] })} onOk={_onDepositChange} />
    </div>
  );
};
