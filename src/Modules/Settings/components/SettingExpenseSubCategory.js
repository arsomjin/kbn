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
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { Button } from 'elements';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
const { Option } = Select;

export default ({ initDoc, onCancel, onDelete, visible, ...props }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      expenseCategoryId: null,
      expenseSubCategoryId: null,
      expenseSubCategoryName: null,
      ...initDoc
    });
  }, [form, initDoc]);

  const onConfirm = async mValues => {
    try {
      //  showLog('values', values);
      load(true);
      let keywords = createKeywords(mValues.expenseSubCategoryId);
      AccountNameKeywords.map(kw => {
        if (mValues.expenseSubCategoryName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(mValues.expenseSubCategoryName)];

      let values = cleanValuesBeforeSave({
        ...mValues,
        keywords,
        deleted: false
      });

      let isDocExists = await checkDoc('data', `account/expenseSubCategory/${values.expenseSubCategoryId}`);
      if (isDocExists) {
        await api.updateItem(values, 'data/account/expenseSubCategory', values.expenseSubCategoryId);
      } else {
        let _key = values.expenseSubCategoryId;
        await api.setItem(
          {
            ...values,
            inputBy: user.uid,
            _key
          },
          'data/account/expenseSubCategory',
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
          docId: values.expenseSubCategoryId,
          changes
        },
        'expenseSubCategory',
        values.expenseSubCategoryId
      );
      load(false);
      showSuccess(
        () => onCancel && onCancel(true),
        `บันทึกข้อมูล หมวดย่อยรายจ่าย ${values.expenseSubCategoryName} สำเร็จ`
      );
      // alert('Done!');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onPreConfirm = async values => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      if (!initDoc.expenseSubCategoryId) {
        // Check before add.
        let isDocExists = await checkDoc('data', `account/expenseSubCategory/${values.expenseSubCategoryId}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสหมวดย่อยรายจ่าย ${values.expenseSubCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseSubCategoryName
            }"`,
            'warning'
          );
        }
      }
      showConfirm(
        () => onConfirm(mValues),
        `${!!initDoc.expenseSubCategoryId ? 'แก้ไข' : 'เพิ่ม'}หมวดย่อยรายจ่าย ${mValues.expenseSubCategoryName}`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _onDelete = async () => {
    let values = form.getFieldsValue();
    load(true);
    let isDocExists = await checkDoc('data', `account/expenseSubCategory/${values.expenseSubCategoryId}`);
    if (isDocExists) {
      await api.updateItem({ deleted: true }, 'data/account/expenseSubCategory', values.expenseSubCategoryId);
      load(false);
      showSuccess(() => onCancel && onCancel(true), `ลบข้อมูล หมวดย่อยรายจ่าย ${values.expenseSubCategoryName} สำเร็จ`);
    } else {
      load(false);
      showAlert('ไม่สำเร็จ', `ไม่พบรหัสหมวดย่อยรายจ่าย ${values.expenseSubCategoryId}`);
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

  if (!!initDoc?.expenseSubCategoryId) {
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
      title={!!initDoc?.expenseSubCategoryId ? 'แก้ไขหมวดย่อยรายจ่าย' : 'เพิ่มหมวดย่อยรายจ่าย'}
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
          expenseSubCategoryName: null
        }}
        labelCol={{
          span: 8
        }}
        wrapperCol={{
          span: 16
        }}
      >
        <Form.Item
          name="expenseCategoryId"
          label="รหัสหมวดรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
        >
          <ExpenseCategorySelector disabled={!!initDoc?.expenseCategoryId} noAddable />
        </Form.Item>
        <Form.Item
          name="expenseSubCategoryId"
          label="รหัสหมวดย่อยรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดย่อยรายจ่าย' }]}
        >
          <Input placeholder="expenseSubCategory99" disabled={!!initDoc?.expenseSubCategoryId} />
        </Form.Item>
        <Form.Item
          name="expenseSubCategoryName"
          label="หมวดย่อยรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดย่อยรายจ่าย' }]}
        >
          <Input placeholder="พิมพ์ชื่อหมวดย่อยรายจ่าย" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
