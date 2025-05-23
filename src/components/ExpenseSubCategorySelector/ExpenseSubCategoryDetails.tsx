import React, { useCallback, useState } from 'react';
import { Modal, Form } from 'antd';
import { default as EInput } from 'elements/Input';
import { showConfirm } from 'utils/functions';
import ExpenseSubCategorySelector from '.';
import { useSelector } from 'react-redux';
import { useModal } from 'contexts/ModalContext';

export interface ExpenseSubCategoryFormValues {
  expenseSubCategoryId: string | null;
  expenseSubCategory: string | null;
}

interface ExpenseSubCategoryDetailsProps {
  onOk: (values: ExpenseSubCategoryFormValues, type: 'add' | 'edit' | 'delete') => void;
  onCancel: () => void;
  visible: boolean;
  initDoc?: any;
}

const initialValues: ExpenseSubCategoryFormValues = {
  expenseSubCategoryId: null,
  expenseSubCategory: null
};

const ExpenseSubCategoryDetails: React.FC<ExpenseSubCategoryDetailsProps> = ({ onOk, onCancel, visible, initDoc }) => {
  const { showConfirm } = useModal();
  const { expenseSubCategories } = useSelector((state: any) => state.data);
  const [type, setType] = useState<'add' | 'edit' | 'delete'>('add');

  const [expenseSubCategoryForm] = Form.useForm<ExpenseSubCategoryFormValues>();

  const onConfirm = useCallback(
    (values: ExpenseSubCategoryFormValues) => {
      expenseSubCategoryForm.resetFields();
      onOk && onOk(values, type);
    },
    [expenseSubCategoryForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: ExpenseSubCategoryFormValues) => {
      showConfirm({
        onOk: () => onConfirm(values),
        title: type === 'add' ? 'สร้างรายชื่อหมวดหมู่ย่อยรายจ่าย' : 'บันทึกรายชื่อหมวดหมู่ย่อยรายจ่าย',
        content: values.expenseSubCategory
      });
    },
    [onConfirm, type]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as 'add' | 'edit' | 'delete');
  };

  const onSelect = (it: string | string[]) => {
    if (typeof it === 'string') {
      const expenseSubCategory = { ...initialValues, ...expenseSubCategories[it] };
      expenseSubCategoryForm.setFieldsValue(expenseSubCategory);
    }
  };

  return (
    <Modal
      title='หมวดหมู่ย่อยรายจ่าย'
      open={visible}
      onOk={() => {
        expenseSubCategoryForm
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
      <Form form={expenseSubCategoryForm} layout='horizontal' initialValues={initialValues}>
        <Form.Item name='expenseSubCategoryId' noStyle>
          <EInput type='hidden' />
        </Form.Item>
        <Form.Item name='expenseSubCategory' rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          {type === 'add' ? (
            <EInput placeholder='ชื่อหมวดหมู่ย่อยรายจ่าย' />
          ) : (
            <ExpenseSubCategorySelector onChange={onSelect} noAddable />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseSubCategoryDetails;
