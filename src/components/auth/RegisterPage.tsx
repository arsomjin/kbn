import React from 'react';
import { Form, Input, Button, Typography, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  const handleSubmit = (values: any) => {
    console.log('Received values:', values);
  };

  return (
    <Form name='register' onFinish={handleSubmit} layout='vertical' className={styles.registerForm}>
      <Typography.Title level={2}>{t('auth.register.title')}</Typography.Title>

      <Form.Item
        name='name'
        label={t('common.label.name')}
        rules={[{ required: true, message: t('auth.validation.required') }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name='email'
        label={t('common.label.email')}
        rules={[
          { required: true, message: t('auth.validation.emailRequired') },
          { type: 'email', message: t('auth.validation.invalidEmail') }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name='password'
        label={t('common.label.password')}
        rules={[
          { required: true, message: t('auth.validation.passwordRequired') },
          { min: 8, message: t('auth.validation.passwordLength') },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            message: t('auth.validation.passwordStrength')
          }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name='confirmPassword'
        label={t('auth.confirmPassword')}
        dependencies={['password']}
        rules={[
          { required: true, message: t('auth.validation.required') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('auth.passwordMismatch')));
            }
          })
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit' className={styles.submitButton}>
          {t('auth.register.submit')}
        </Button>
      </Form.Item>

      <Divider>{t('common.or')}</Divider>

      <p className={styles.loginLink}>
        {t('auth.alreadyHaveAccount')} <Link to='/login'>{t('auth.login')}</Link>
      </p>
    </Form>
  );
};

export default RegisterPage;
