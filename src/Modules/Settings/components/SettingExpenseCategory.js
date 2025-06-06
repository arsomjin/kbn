import React, { useContext, useEffect } from 'react';
import { Modal, Form, Input, Popconfirm } from 'antd';
import { useSelector } from 'react-redux';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';

import { FirebaseContext } from '../../../firebase';
import {
  showLog,
  showConfirm,
  showWarn,
  showAlert,
  load,
  cleanValuesBeforeSave,
  getChanges,
  showSuccess
} from 'functions';
import { checkDoc } from 'firebase/api';
import { createNewId, createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { Button } from 'elements';

const ExpenseCategoryModal = ({ initDoc, onCancel, visible }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  // Set default values when the modal is shown
  useEffect(() => {
    form.setFieldsValue({
      expenseCategoryId: null,
      expenseCategoryName: null,
      ...initDoc
    });
  }, [form, initDoc]);

  const handleConfirm = async modifiedValues => {
    try {
      load(true);
      // If new, create a new ID
      if (!modifiedValues.expenseCategoryId) {
        const expenseCategoryId = createNewId('ACC-CAT');
        modifiedValues = { ...modifiedValues, expenseCategoryId };
      }

      // Generate keywords from the expense category name
      let keywords = createKeywords(modifiedValues.expenseCategoryName);
      AccountNameKeywords.forEach(kw => {
        if (modifiedValues.expenseCategoryName.toString().includes(kw)) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
      });

      const values = cleanValuesBeforeSave({
        ...modifiedValues,
        keywords,
        deleted: false
      });

      // Check if the document exists; update if it does, otherwise create new
      const isDocExists = await checkDoc('data', `account/expenseCategory/${values.expenseCategoryId}`);

      if (isDocExists) {
        await api.updateItem(values, 'data/account/expenseCategory', values.expenseCategoryId);
      } else {
        await api.setItem({ ...values, inputBy: user.uid }, 'data/account/expenseCategory', values.expenseCategoryId);
      }

      // Log changes
      const changes = getChanges(initDoc, values);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.expenseCategoryId,
          changes
        },
        'expenseCategory',
        values.expenseCategoryId
      );

      load(false);
      showSuccess(() => onCancel && onCancel(true), `บันทึกข้อมูล หมวดรายจ่าย ${values.expenseCategoryName} สำเร็จ`);
    } catch (error) {
      showWarn(error);
      load(false);
    }
  };

  const handlePreConfirm = async values => {
    try {
      const modifiedValues = JSON.parse(JSON.stringify(values));
      if (!initDoc?.expenseCategoryId) {
        // Check if the document already exists before adding
        const isDocExists = await checkDoc('data', `account/expenseCategory/${values.expenseCategoryId}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสหมวดรายจ่าย ${values.expenseCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseCategoryName
            }"`,
            'warning'
          );
        }
      }
      showLog('PRE_CONFIRM', modifiedValues);
      showConfirm(
        () => handleConfirm(modifiedValues),
        `${initDoc?.expenseCategoryId ? 'แก้ไข' : 'เพิ่ม'}หมวดรายจ่าย ${modifiedValues.expenseCategoryName}`
      );
    } catch (error) {
      showWarn(error);
    }
  };

  const handleDelete = async () => {
    const values = form.getFieldsValue();
    load(true);
    const isDocExists = await checkDoc('data', `account/expenseCategory/${values.expenseCategoryId}`);
    if (isDocExists) {
      await api.updateItem({ deleted: true }, 'data/account/expenseCategory', values.expenseCategoryId);
      load(false);
      showSuccess(() => onCancel && onCancel(true), `ลบข้อมูล หมวดรายจ่าย ${values.expenseCategoryName} สำเร็จ`);
    } else {
      load(false);
      showAlert('ไม่สำเร็จ', `ไม่พบรหัสหมวดรายจ่าย ${values.expenseCategoryId}`);
    }
  };

  const footerButtons = initDoc?.expenseCategoryId
    ? [
        <Button key="close" onClick={() => onCancel()}>
          ยกเลิก
        </Button>,
        <Popconfirm
          key="delete"
          title="ลบรายการ ?"
          onConfirm={handleDelete}
          onCancel={() => showLog('cancel')}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <Button type="danger" icon={<DeleteOutlined />}>
            ลบ
          </Button>
        </Popconfirm>,
        <Button
          key="ok"
          icon={<CheckOutlined />}
          onClick={() => {
            form
              .validateFields()
              .then(values => handlePreConfirm(values))
              .catch(info => console.log('Validate Failed:', info));
          }}
          type="primary"
        >
          ยืนยัน
        </Button>
      ]
    : [
        <Button key="close" onClick={() => onCancel()}>
          ยกเลิก
        </Button>,
        <Button
          key="ok"
          icon={<CheckOutlined />}
          onClick={() => {
            form
              .validateFields()
              .then(values => handlePreConfirm(values))
              .catch(info => console.log('Validate Failed:', info));
          }}
          type="primary"
        >
          ยืนยัน
        </Button>
      ];

  return (
    <Modal
      title={initDoc?.expenseCategoryId ? 'แก้ไขหมวดรายจ่าย' : 'เพิ่มหมวดรายจ่าย'}
      visible={visible}
      footer={footerButtons}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={handlePreConfirm}
        initialValues={{
          expenseCategoryId: null,
          expenseCategoryNo: null,
          expenseCategoryName: null
        }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
      >
        <Form.Item name="expenseCategoryId" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="expenseCategoryNumber"
          label="รหัสหมวดรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
        >
          <Input placeholder="00007" />
        </Form.Item>
        <Form.Item
          name="expenseCategoryName"
          label="หมวดรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
        >
          <Input placeholder="พิมพ์ชื่อหมวดรายจ่าย" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseCategoryModal;
