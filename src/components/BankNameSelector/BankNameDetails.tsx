import React, { useCallback } from 'react';
import { Modal, Form, Input } from 'antd';
import { showConfirm } from 'utils/functions';

interface BankNameDetailsProps {
  onOk: (values: { name: string; remark?: string | null }) => void;
  onCancel: () => void;
  visible: boolean;
}

const BankNameDetails: React.FC<BankNameDetailsProps> = ({ onOk, onCancel, visible }) => {
  const [form] = Form.useForm<{ name: string; remark?: string | null }>();

  const onConfirm = useCallback(
    (values: { name: string; remark?: string | null }) => {
      form.resetFields();
      onOk && onOk(values);
    },
    [form, onOk]
  );

  const onPreConfirm = useCallback(
    (values: { name: string; remark?: string | null }) => {
      let mValues = JSON.parse(JSON.stringify(values));
      showConfirm(() => onConfirm(mValues), `เพิ่มรายการชื่อธนาคาร ${mValues.name || ''}`);
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มรายการชื่อธนาคาร"
      open={visible}
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
        <Form.Item name="name" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]} label="ชื่อธนาคาร">
          <Input placeholder="ชื่อธนาคาร" />
        </Form.Item>
        <Form.Item name="remark" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BankNameDetails;
