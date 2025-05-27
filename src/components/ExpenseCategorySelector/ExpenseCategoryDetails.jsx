import React, { useCallback } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useModal } from 'contexts/ModalContext';
import { checkDoc } from 'services/firebase';
const { Option } = Select;

const ExpenseCategoryDetails = ({ onOk, onCancel, visible }) => {
  const [form] = Form.useForm();
  const { showConfirm, showWarn, showAlert } = useModal();

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
          `account/expenseCategory/${values.expenseCategoryId}`,
        );
        if (isDocExists) {
          return showAlert({
            title: 'บันทึกแล้ว',
            content: `รหัสหมวดรายจ่าย ${values.expenseCategoryId} ได้บันทึกข้อมูลแล้วในชื่อ "${
              isDocExists.data().expenseCategoryName
            }"`,
            type: 'warning',
          });
        }
        showConfirm({
          title: 'ยืนยัน',
          content: `เพิ่มหมวดรายจ่าย ${mValues.expenseCategoryName}`,
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
          expenseCategoryId: null,
          expenseCategoryName: null,
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

export default ExpenseCategoryDetails;
