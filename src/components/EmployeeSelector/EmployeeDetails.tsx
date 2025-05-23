import React, { useCallback, useState } from 'react';
import { Modal, Form } from 'antd';
import { default as EInput } from 'elements/Input';
import { showConfirm } from 'utils/functions';
import EmployeeSelector from '.';
import { useSelector } from 'react-redux';
import type { EmployeeFormValues } from './types';
import { useModal } from 'contexts/ModalContext';

interface EmployeeDetailsProps {
  onOk: (values: EmployeeFormValues, type: 'add' | 'edit' | 'delete') => void;
  onCancel: () => void;
  visible: boolean;
  initDoc?: any;
}

const initialValues: EmployeeFormValues = {
  employeeId: null,
  employeeCode: null,
  employeeName: null
};

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ onOk, onCancel, visible, initDoc }) => {
  const { showConfirm } = useModal();
  const employees = useSelector((state: any) => state.employees?.employees || {});
  const [type, setType] = useState<'add' | 'edit' | 'delete'>('add');

  const [employeeForm] = Form.useForm<EmployeeFormValues>();

  const onConfirm = useCallback(
    (values: EmployeeFormValues) => {
      employeeForm.resetFields();
      onOk && onOk(values, type);
    },
    [employeeForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: EmployeeFormValues) => {
      showConfirm({
        onOk: () => onConfirm(values),
        title: `${type === 'add' ? 'สร้าง' : 'บันทึก'}รายชื่อพนักงาน`,
        content: `คุณต้องการ${type === 'add' ? 'สร้าง' : 'บันทึก'}รายชื่อพนักงาน ${values.employeeName} ใช่หรือไม่?`
      });
    },
    [onConfirm, type]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as 'add' | 'edit' | 'delete');
  };

  const onSelect = (it: string | string[]) => {
    if (typeof it === 'string') {
      const employee = { ...initialValues, ...employees[it] };
      employeeForm.setFieldsValue(employee);
    }
  };

  return (
    <Modal
      title='พนักงาน'
      open={visible}
      onOk={() => {
        employeeForm
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText={type === 'add' ? 'สร้างรายชื่อ' : type === 'edit' ? 'บันทึก' : 'ลบ'}
      cancelText='ยกเลิก'
      okType={type === 'delete' ? 'danger' : 'primary'}
    >
      <Form form={employeeForm} layout='horizontal' initialValues={initialValues}>
        <Form.Item name='employeeId' noStyle>
          <EInput type='hidden' />
        </Form.Item>
        <Form.Item name='employeeCode' rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          {type === 'add' ? <EInput placeholder='รหัสพนักงาน' /> : <EmployeeSelector onChange={onSelect} noAddable />}
        </Form.Item>
        <Form.Item name='employeeName' rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <EInput placeholder='ชื่อพนักงาน' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeDetails;
