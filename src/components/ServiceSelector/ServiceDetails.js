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
        let isDocExists = await checkDoc('data', `services/serviceList/${values.serviceCode}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสงานบริการ ${values.serviceCode} ได้บันทึกข้อมูลแล้วในชื่อ "${isDocExists.data().name}"`,
            'warning'
          );
        }
        showConfirm(() => onConfirm(mValues), `เพิ่มงานบริการ ${mValues.name}`);
      } catch (e) {
        showWarn(e);
      }
    },
    [onConfirm]
  );

  const nameRule = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];

  return (
    <Modal
      title="เพิ่มงานบริการ"
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
          serviceCode: null,
          name: null,
          unit: null,
          discount: null,
          unitPrice: null,
          creditTerm: null,
          description: null,
          remark: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item name="serviceCode" label="รหัสบริการ" rules={nameRule}>
          <Input placeholder="SUBLT-07FIX" />
        </Form.Item>
        <Form.Item name="name" label="ชื่อบริการ" rules={nameRule}>
          <Input placeholder="ชื่อบริการ" />
        </Form.Item>
        <Form.Item name="unit" label="หน่วย" rules={nameRule}>
          <Input placeholder="หน่วย" />
        </Form.Item>
        <Form.Item name="unitPrice" label="ราคาต่อหน่วย" rules={nameRule}>
          <Input placeholder="บาท" />
        </Form.Item>
        <Form.Item name="creditTerm" label="เครดิต">
          <Input placeholder="วัน" />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <Input placeholder="ข้อความ" />
        </Form.Item>
        <Form.Item name="remark" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
