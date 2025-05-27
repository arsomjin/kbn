import React, { useCallback } from 'react';
import { Modal, Form } from 'antd';
import { useModal } from 'contexts/ModalContext';
import BankNameSelector from 'components/BankNameSelector';
import { Input } from 'elements';
import { getRules } from 'api/Table';

const BankDetails = ({ onOk, onCancel, visible }) => {
  const [form] = Form.useForm();
  const { showConfirm } = useModal();

  const onConfirm = useCallback(
    (values) => {
      //  showLog({ values });
      form.resetFields();
      onOk && onOk(values);
    },
    [form, onOk],
  );

  const onPreConfirm = useCallback(
    (values) => {
      let mValues = JSON.parse(JSON.stringify(values));
      showConfirm({
        title: 'ยืนยัน',
        content: `เพิ่มธนาคาร ${mValues.bankName}`,
        onOk: () => onConfirm(mValues),
      });
    },
    [onConfirm, showConfirm],
  );

  return (
    <Modal
      title="เพิ่มธนาคาร"
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
          bankName: null,
          accNo: null,
          name: null,
          branch: null,
        }}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 14,
        }}
      >
        <Form.Item
          name="bankName"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
          label="ธนาคาร"
        >
          <BankNameSelector />
        </Form.Item>
        <Form.Item name="accNo" label="เลขที่บัญชี" rules={getRules(['required'])}>
          <Input placeholder="กรุณาป้อน เลขบัญชีธนาคาร" />
        </Form.Item>
        <Form.Item
          name="name"
          label="ชื่อบัญชี"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
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
