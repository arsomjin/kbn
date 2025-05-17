import React, { useCallback } from 'react';
import { Modal, Form } from 'antd';
import { showConfirm } from 'utils/functions';
import BankNameSelector from 'components/BankNameSelector';
import { Input } from 'elements';
import { getRules } from 'api/Table';

interface Bank {
  bankName: string;
  accNo: string;
  name: string;
  branch?: string;
}

interface BankDetailsProps {
  onOk: (values: Bank) => void;
  onCancel: () => void;
  visible: boolean;
}

const BankDetails: React.FC<BankDetailsProps> = ({ onOk, onCancel, visible }) => {
  const [form] = Form.useForm<Bank>();

  const onConfirm = useCallback(
    (values: Bank) => {
      form.resetFields();
      onOk && onOk(values);
    },
    [form, onOk]
  );

  const onPreConfirm = useCallback(
    (values: Bank) => {
      showConfirm(
        () => onConfirm(values),
        `เพิ่มธนาคาร ${values.bankName}`,
        false
      );
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มธนาคาร"
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
          bankName: '',
          accNo: '',
          name: '',
          branch: ''
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item name="bankName" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]} label="ธนาคาร">
          <BankNameSelector />
        </Form.Item>
        <Form.Item name="accNo" label="เลขที่บัญชี" rules={getRules({ rules: ['required'] })}>
          <Input placeholder="กรุณาป้อน เลขบัญชีธนาคาร" />
        </Form.Item>
        <Form.Item name="name" label="ชื่อบัญชี" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="พิมพ์ชื่อบัญชี" />
        </Form.Item>
        <Form.Item name="branch" label="สาขา">
          <Input placeholder="สาขา" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BankDetails; 