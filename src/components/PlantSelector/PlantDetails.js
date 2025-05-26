import React, { useCallback } from 'react';
import { Modal, Form, Input } from 'antd';
import { showConfirm } from 'functions';

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
    values => {
      let mValues = JSON.parse(JSON.stringify(values));
      showConfirm(() => onConfirm(mValues), `เพิ่มรายการพืชไร่ ${mValues.name || ''}`);
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มรายการพืชไร่"
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
          name: null,
          remark: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item name="name" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]} label="พืชไร่">
          <Input placeholder="พืชไร่" />
        </Form.Item>
        <Form.Item name="remark" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
