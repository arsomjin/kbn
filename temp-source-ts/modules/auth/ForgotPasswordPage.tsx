import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { sendPasswordReset } from '../../services/authService';
import AuthContainer from '../../components/auth/AuthContainer';
import { getAuthErrorMessage } from '../../utils/firebaseErrorMessages';
import { motion } from 'framer-motion';
import { useAntdModal } from 'hooks/useAntModal';
import PageDoc from '../../components/PageDoc';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const isMobile = window.innerWidth < 480;
  const { modal } = useAntdModal();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const onFinish = async (values: { email: string }) => {
    modal.confirm({
      title: t('auth:confirmResetTitle', 'Confirm Password Reset'),
      content: t(
        'auth:confirmResetContent',
        'Are you sure you want to send a password reset email to {email}?'
      ).replace('{email}', values.email),
      onOk: async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
          await sendPasswordReset(values.email);
          setSuccess(true);
          form.resetFields();
        } catch (error: any) {
          setError(getAuthErrorMessage(error, t));
        } finally {
          setLoading(false);
        }
      },
      okText: t('common:confirm', 'Confirm'),
      cancelText: t('common:cancel', 'Cancel'),
      centered: true
    });
  };

  return (
    <>
      <AuthContainer
        title={t('auth:resetPassword')}
        subtitle={t('auth:resetPasswordInstruction')}
        animationKey='forgot-password'
      >
        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerVariants}
          className={`max-w-md w-full mx-auto ${isMobile ? 'px-4' : ''}`}
        >
          <motion.div variants={itemVariants}>
            {error && (
              <Alert
                message={t('auth:passwordResetError')}
                description={error}
                type='error'
                showIcon
                closable
                onClose={() => setError(null)}
                className='mb-6'
              />
            )}

            {success && (
              <Alert
                message={t('auth:passwordResetSuccess')}
                description={t('auth:passwordResetSuccessDescription')}
                type='success'
                showIcon
                className='mb-6'
              />
            )}

            <Form form={form} name='forgotPassword' onFinish={onFinish} layout='vertical' requiredMark={false}>
              <Form.Item
                name='email'
                rules={[
                  { required: true, message: t('validation:required') },
                  { type: 'email', message: t('validation:email') }
                ]}
              >
                <Input
                  prefix={<MailOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                  placeholder={t('auth:email')}
                  size='large'
                  className='text-primay'
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  className='btn btn-primary w-full'
                  size='large'
                  loading={loading}
                >
                  {t('auth:resetPassword')}
                </Button>
              </Form.Item>

              <div className='text-center mt-4'>
                <Link to='/login' className={`text-primary hover:text-primary-dark ${isMobile ? 'text-sm' : ''}`}>
                  &larr; {t('auth:backToLogin')}
                </Link>
              </div>
            </Form>
          </motion.div>
        </motion.div>
      </AuthContainer>
      <PageDoc />
    </>
  );
};

export default ForgotPasswordPage;
