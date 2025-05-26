import React, { useCallback, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { showConfirm } from 'functions';
import { showWarn } from 'functions';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import ExpenseSubCategorySelector from 'components/ExpenseSubCategorySelector';
import HiddenItem from 'components/HiddenItem';
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
        showConfirm(() => onConfirm(mValues), `เพิ่มชื่อบัญชี ${mValues.expenseName}`);
      } catch (e) {
        showWarn(e);
      }
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มชื่อบัญชี"
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
          expenseSubCategoryId: null,
          expenseNameId: null,
          expenseName: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        {values => {
          // showLog({ expense_name_values: values });
          return (
            <>
              <HiddenItem name="expenseNameId" />
              <Form.Item
                name="expenseCategoryId"
                label="รหัสหมวดรายจ่าย"
                rules={[{ required: true, message: 'กรุณาป้อนหมวดรายจ่าย' }]}
              >
                <ExpenseCategorySelector disabled />
              </Form.Item>
              <Form.Item name="expenseSubCategoryId" label="รหัสหมวดย่อย">
                <ExpenseSubCategorySelector record={values} noAddable />
              </Form.Item>
              <Form.Item
                name="expenseName"
                label="ชื่อบัญชี"
                rules={[{ required: true, message: 'กรุณาป้อนชื่อบัญชี' }]}
              >
                <Input placeholder="พิมพ์ชื่อบัญชี" />
              </Form.Item>
            </>
          );
        }}
      </Form>
    </Modal>
  );
};
