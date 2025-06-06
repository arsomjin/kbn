import React, { useContext, useEffect } from 'react';
import { Modal, Form, Input, Select, Popconfirm } from 'antd';
import { showLog, showConfirm } from 'functions';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { getChanges } from 'functions';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { createNewId } from 'utils';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { Button } from 'elements';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import HiddenItem from 'components/HiddenItem';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import ExpenseSubCategorySelector from 'components/ExpenseSubCategorySelector';
const { Option } = Select;

export default ({ initDoc, onCancel, onDelete, visible, ...props }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      expenseNameId: null,
      expenseCategoryId: null,
      expenseCategoryName: null,
      expenseSubCategoryId: null,
      expenseSubCategoryName: null,
      expenseName: null,
      ...initDoc
    });
  }, [form, initDoc]);

  const onConfirm = async mValues => {
    try {
      load(true);
      let keywords = [];
      AccountNameKeywords.map(kw => {
        if (mValues.expenseName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(mValues.expenseName)];

      let expenseCategoryName = mValues.expenseCategoryName;
      let expenseSubCategoryName = mValues.expenseSubCategoryName;
      if (!expenseCategoryName && !!mValues.expenseCategoryId) {
        let catDoc = await checkDoc('data', `account/expenseCategory/${mValues.expenseCategoryId}`);
        if (!!catDoc) {
          expenseCategoryName = catDoc.data().expenseCategoryName;
          keywords = [...keywords, ...catDoc.data().keywords];
        }
      }

      if (!expenseSubCategoryName && !!mValues.expenseSubCategoryId) {
        let subCatDoc = await checkDoc('data', `account/expenseSubCategory/${mValues.expenseSubCategoryId}`);
        if (!!subCatDoc) {
          expenseSubCategoryName = subCatDoc.data().expenseSubCategoryName;
          keywords = [...keywords, ...subCatDoc.data().keywords];
        }
      }

      let values = cleanValuesBeforeSave({
        ...mValues,
        expenseCategoryName,
        expenseSubCategoryName,
        keywords,
        deleted: false
      });

      let expenseNameId = values.expenseNameId || createNewId('ACC-NAME');
      values.expenseNameId = expenseNameId;
      let isDocExists = await checkDoc('data', `account/expenseName/${expenseNameId}`);
      if (isDocExists) {
        await api.updateItem(values, 'data/account/expenseName', expenseNameId);
      } else {
        let _key = expenseNameId;
        await api.setItem(
          {
            ...values,
            inputBy: user.uid,
            _key,
            expenseNameId
          },
          'data/account/expenseName',
          _key
        );
      }

      const oldValues = initDoc;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: expenseNameId,
          changes
        },
        'expenseName',
        expenseNameId
      );
      load(false);
      showSuccess(() => onCancel && onCancel(true), `บันทึกข้อมูล ชื่อบัญชี ${values.expenseName} สำเร็จ`);
      // alert('Done!');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onPreConfirm = async values => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      if (!initDoc.expenseNameId && !!values.expenseNameId) {
        // Check before add.
        let isDocExists = await checkDoc('data', `account/expenseName/${values.expenseNameId}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสชื่อบัญชี ${values.expenseNameId} ได้บันทึกข้อมูลแล้วในชื่อ "${isDocExists.data().expenseName}"`,
            'warning'
          );
        }
      }
      // showLog('mValues', mValues);
      showConfirm(
        () => onConfirm(mValues),
        `${!!initDoc.expenseNameId ? 'แก้ไข' : 'เพิ่ม'}ชื่อบัญชี ${mValues.expenseName}`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _onDelete = async () => {
    let values = form.getFieldsValue();
    load(true);
    let isDocExists = await checkDoc('data', `account/expenseName/${values.expenseNameId}`);
    if (isDocExists) {
      await api.updateItem({ deleted: true }, 'data/account/expenseName', values.expenseNameId);
      load(false);
      showSuccess(() => onCancel && onCancel(true), `ลบข้อมูล ชื่อบัญชี ${values.expenseName} สำเร็จ`);
    } else {
      load(false);
      showAlert('ไม่สำเร็จ', `ไม่พบรหัสชื่อบัญชี ${values.expenseName}`);
    }
  };

  let buttons = [
    <Button key="close" onClick={() => onCancel()}>
      ยกเลิก
    </Button>,
    <Button
      key="ok"
      icon={<CheckOutlined />}
      onClick={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      type="primary"
    >
      ยืนยัน
    </Button>
  ];

  if (!!initDoc?.expenseNameId) {
    buttons = [
      buttons[0],
      <Popconfirm
        title="ลบรายการ ?"
        onConfirm={() => _onDelete()}
        onCancel={() => showLog('cancel')}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        key="delete"
      >
        <Button type="danger" icon={<DeleteOutlined />}>
          ลบ
        </Button>
      </Popconfirm>,
      buttons[1]
    ];
  }

  return (
    <Modal
      title={!!initDoc?.expenseNameId ? 'แก้ไขชื่อบัญชี' : 'เพิ่มชื่อบัญชี'}
      visible={visible}
      footer={buttons}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={onPreConfirm}
        initialValues={{
          expenseCategoryId: null,
          expenseSubCategoryId: null,
          expenseName: null,
          expenseNameId: null,
          expenseCategoryName: null,
          expenseSubCategoryName: null
        }}
        labelCol={{
          span: 8
        }}
        wrapperCol={{
          span: 16
        }}
      >
        {values => {
          return (
            <>
              <HiddenItem name="expenseNameId" />
              <HiddenItem name="expenseCategoryName" />
              <HiddenItem name="expenseSubCategoryName" />
              {values?.expenseNameId && (
                <Form.Item
                  name="expenseNameId"
                  label="รหัสชื่อบัญชี"
                  rules={[{ required: true, message: 'กรุณาป้อนชื่อบัญชี' }]}
                >
                  <Input readOnly={!!initDoc?.expenseNameId} />
                </Form.Item>
              )}
              <Form.Item
                name="expenseCategoryId"
                label="รหัสหมวดรายจ่าย"
                rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
              >
                <ExpenseCategorySelector disabled={!!initDoc?.expenseCategoryId} noAddable />
              </Form.Item>
              <Form.Item
                name="expenseSubCategoryId"
                label="รหัสหมวดย่อย"
                // rules={[{ required: true, message: 'กรุณาป้อนชื่อบัญชี' }]}
              >
                <ExpenseSubCategorySelector disabled={!!initDoc?.expenseSubCategoryId} record={values} noAddable />
              </Form.Item>
              <Form.Item
                name="expenseName"
                label="ชื่อบัญชี"
                rules={[{ required: true, message: 'กรุณาป้อนชื่อบัญชี' }]}
              >
                <Input placeholder="พิมพ์ชื่อชื่อบัญชี" />
              </Form.Item>
            </>
          );
        }}
      </Form>
    </Modal>
  );
};
