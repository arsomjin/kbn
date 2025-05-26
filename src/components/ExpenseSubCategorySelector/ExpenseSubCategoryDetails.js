import React, { useCallback, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { showConfirm } from 'functions';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
const { Option } = Select;

export default ({ initDoc, onOk, onCancel, visible, ...props }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    let curValues = form.getFieldsValue();
    form.setFieldsValue({
      ...curValues,
      ...initDoc
    });
  }, [form, initDoc]);

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
        let isDocExists = await checkDoc('data', `account/expenseSubCategory/${values.expenseSubCategoryId}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสหมวดรายจ่าย ${values.expenseSubCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseSubCategoryName
            }"`,
            'warning'
          );
        }
        showConfirm(() => onConfirm(mValues), `เพิ่มหมวดรายจ่าย ${mValues.expenseSubCategoryName}`);
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
          expenseSubCategoryId: null,
          expenseCategoryId: null,
          expenseSubCategoryName: null
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
          rules={[{ required: true, message: 'กรุณาป้อนรหัสหมวดรายจ่าย' }]}
        >
          <ExpenseCategorySelector disabled />
        </Form.Item>
        <Form.Item
          name="expenseSubCategoryId"
          label="รหัสหมวดย่อย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดย่อย' }]}
        >
          <Input placeholder="expenseSubCategory99" />
        </Form.Item>
        <Form.Item
          name="expenseSubCategoryName"
          label="หมวดรายจ่าย"
          rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
        >
          <Input placeholder="พิมพ์ชื่อหมวดรายจ่าย" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
