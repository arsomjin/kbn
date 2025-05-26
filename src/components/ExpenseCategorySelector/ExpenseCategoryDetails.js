import React, { useCallback } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { showConfirm } from 'functions';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
const { Option } = Select;

export default ({ onOk, onCancel, visible, ...props }) => {
  const [form] = Form.useForm();

  const onConfirm = useCallback(
    values => {
      //  showLog({ values });
      form.resetFields();
      onOk && onOk(values);
    },
    [form, onOk]
  );

  const onPreConfirm = useCallback(
    async values => {
      try {
        let mValues = JSON.parse(JSON.stringify(values));
        let isDocExists = await checkDoc('data', `account/expenseCategory/${values.expenseCategoryId}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสหมวดรายจ่าย ${values.expenseCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseCategoryName
            }"`,
            'warning'
          );
        }
        showConfirm(() => onConfirm(mValues), `เพิ่มหมวดรายจ่าย ${mValues.expenseCategoryName}`);
      } catch (e) {
        showWarn(e);
      }
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มหมวดรายจ่าย"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText="ยืนยัน"
      cancelText="ยกเลิก"
    >
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={onPreConfirm}
        initialValues={{
          expenseCategoryId: null,
          expenseCategoryName: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item
          name="expenseCategoryId"
          label="รหัสหมวดรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
        >
          <Input placeholder="expenseCategory99" />
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
