import React, { useCallback, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { checkDoc } from 'services/firebase';
import { useModal } from 'contexts/ModalContext';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
const { Option } = Select;

const ExpenseSubCategoryDetails = ({ initDoc, onOk, onCancel, visible }) => {
  const [form] = Form.useForm();
  const { showConfirm, showWarn, showAlert } = useModal();

  useEffect(() => {
    let curValues = form.getFieldsValue();
    form.setFieldsValue({
      ...curValues,
      ...initDoc,
    });
  }, [form, initDoc]);

  const onConfirm = useCallback(
    (values) => {
      //  showLog({ values });
      form.resetFields();
      onOk && onOk(values);
    },
    [form, onOk],
  );

  const onPreConfirm = useCallback(
    async (values) => {
      try {
        let mValues = JSON.parse(JSON.stringify(values));
        let isDocExists = await checkDoc(
          'data',
          `account/expenseSubCategory/${values.expenseSubCategoryId}`,
        );
        if (isDocExists) {
          return showAlert({
            title: 'บันทึกแล้ว',
            content: `รหัสหมวดรายจ่าย ${values.expenseSubCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseSubCategoryName
            }"`,
            type: 'warning',
          });
        }
        showConfirm({
          title: 'ยืนยัน',
          content: `เพิ่มหมวดรายจ่าย ${mValues.expenseSubCategoryName}`,
          onOk: () => onConfirm(mValues),
        });
      } catch (e) {
        showWarn(e.message || e);
      }
    },
    [onConfirm, showConfirm, showWarn, showAlert],
  );

  return (
    <Modal
      title="เพิ่มหมวดรายจ่าย"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onPreConfirm(values);
          })
          .catch((info) => {
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
          expenseSubCategoryName: null,
        }}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 14,
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

export default ExpenseSubCategoryDetails;
