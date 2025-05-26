import React, { useCallback } from 'react';
import { Modal, Form, Select } from 'antd';
import { Input } from 'elements';
import { showConfirm } from 'functions';
import BranchSelector from 'components/BranchSelector';
import DepartmentSelector from 'components/DepartmentSelector';
import GroupSelector from 'components/GroupSelector';
import { getRules } from 'api/Table';
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
    values => {
      let mValues = JSON.parse(JSON.stringify(values));
      showConfirm(() => onConfirm(mValues), `เพิ่มรายชื่อ ${mValues.firstName}`);
    },
    [onConfirm]
  );

  return (
    <Modal
      title="เพิ่มรายชื่อพนักงาน"
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
          employeeCode: null,
          prefix: null,
          firstName: null,
          lastName: null,
          branch: '0450',
          department: null,
          email: null,
          group: null,
          phoneNumber: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item name="employeeCode" label="รหัสพนักงาน" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="พิมพ์รหัสพนักงาน" />
        </Form.Item>

        <Form.Item name="prefix" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]} label="คำนำหน้า">
          <Select placeholder="คำนำหน้า">
            <Option value="นาย">นาย</Option>
            <Option value="นาง">นาง</Option>
            <Option value="นางสาว">นางสาว</Option>
          </Select>
        </Form.Item>
        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true, message: 'กรุณาป้อนชื่อ' }]}>
          <Input placeholder="พิมพ์ชื่อพนักงาน" />
        </Form.Item>
        <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true, message: 'กรุณาป้อนนามสกุล' }]}>
          <Input placeholder="พิมพ์นามสกุลพนักงาน" />
        </Form.Item>
        <Form.Item name="branch" label="สาขา">
          <BranchSelector />
        </Form.Item>
        <Form.Item name="department" label="แผนก">
          <DepartmentSelector />
        </Form.Item>
        <Form.Item name="group" label="กลุ่ม">
          <GroupSelector />
        </Form.Item>
        <Form.Item name="phoneNumber" label="เบอร์โทรศัพท์" rules={getRules(['mobileNumber'])}>
          <Input mask="111-1111111" placeholder="012-3456789" />
        </Form.Item>
        <Form.Item name="email" label="อีเมล">
          <Input placeholder="name@email.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
