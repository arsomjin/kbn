import React, { useCallback } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { checkDoc } from 'services/firebase';
import { useModal } from 'contexts/ModalContext';
const { Option } = Select;

const ServiceDetails = ({ onOk, onCancel, visible }) => {
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
        let isDocExists = await checkDoc('data', `services/serviceList/${values.serviceCode}`);
        if (isDocExists) {
          return showAlert({
            title: 'บันทึกแล้ว',
            content: `รหัสงานบริการ ${values.serviceCode} ได้บันทึกข้อมูลแล้วในชื่อ "${isDocExists.data().name}"`,
            type: 'warning',
          });
        }
        showConfirm({
          title: 'ยืนยัน',
          content: `เพิ่มงานบริการ ${mValues.name}`,
          onOk: () => onConfirm(mValues),
        });
      } catch (e) {
        showWarn(e.message || e);
      }
    },
    [onConfirm, showConfirm, showWarn, showAlert],
  );

  const nameRule = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];

  return (
    <Modal
      title="เพิ่มงานบริการ"
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
          serviceCode: null,
          name: null,
          unit: null,
          discount: null,
          unitPrice: null,
          creditTerm: null,
          description: null,
          remark: null,
        }}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 14,
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

export default ServiceDetails;
