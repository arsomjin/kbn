import React, { useCallback } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { documentExists } from 'utils/firestoreUtils';
import { useAntdUi } from 'hooks/useAntdUi';
import { ExpenseCategoryDetailsProps, ExpenseCategory } from './types';

const ExpenseCategoryDetails: React.FC<ExpenseCategoryDetailsProps> = ({ onOk, onCancel, visible }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ExpenseCategory>();
  const { modal } = useAntdUi();

  const onConfirm = useCallback(
    (values: ExpenseCategory) => {
      form.resetFields();
      onOk?.(values);
    },
    [form, onOk]
  );

  const onPreConfirm = useCallback(
    async (values: ExpenseCategory) => {
      try {
        const mValues = { ...values };
        const exists = await documentExists('data/account/expenseCategory', values.expenseCategoryId);

        if (exists) {
          return modal.info({
            title: t('expenseCategory.alreadyExists'),
            content: t('expenseCategory.alreadyExistsMessage', {
              id: values.expenseCategoryId,
              name: values.expenseCategoryName
            })
          });
        }

        modal.confirm({
          title: t('common:confirm'),
          content: t('expenseCategory.confirmAdd', { name: mValues.expenseCategoryName }),
          onOk: () => onConfirm(mValues)
        });
      } catch (e) {
        console.error(e);
      }
    },
    [onConfirm, t, modal]
  );

  return (
    <Modal
      title={t('expenseCategory.addTitle')}
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
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
    >
      <Form
        form={form}
        layout='horizontal'
        className='mt-2'
        onFinish={onPreConfirm}
        initialValues={{
          expenseCategoryId: null,
          expenseCategoryName: null
        }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
      >
        <Form.Item
          name='expenseCategoryId'
          label={t('expenseCategory.idLabel')}
          rules={[{ required: true, message: t('expenseCategory.idRequired') }]}
        >
          <Input placeholder='expenseCategory99' />
        </Form.Item>
        <Form.Item
          name='expenseCategoryName'
          label={t('expenseCategory.nameLabel')}
          rules={[{ required: true, message: t('expenseCategory.nameRequired') }]}
        >
          <Input placeholder={t('expenseCategory.namePlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseCategoryDetails;
