import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useModal } from 'contexts/ModalContext';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { Button, Form, Input, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { confirmPasswordReset } = useAuth();
  const { showError, showSuccess } = useModal();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const oobCode = searchParams.get('oobCode');

  const onFinish = async (values) => {
    if (!oobCode) {
      showError(t('auth.invalidResetCode'));
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(oobCode, values.password);
      showSuccess(t('auth.resetPasswordSuccess'));
      navigate('/auth/login');
    } catch (error) {
      console.error('Password reset error:', error);
      showError(t('auth.resetPasswordError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.resetPasswordTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.resetPasswordSubtitle')}</p>
        </div>

        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          className={styles.form}
          size={isMobile ? 'large' : 'middle'}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 8, message: t('auth.passwordMinLength') }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.newPasswordPlaceholder')}
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordsDoNotMatch')));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size={isMobile ? 'large' : 'middle'}
              loading={loading}
            >
              {t('auth.resetPasswordButton')}
            </Button>
          </Form.Item>
        </Form>

        <Space direction="vertical" className={styles.links}>
          <Link to="/auth/login" className={styles.link}>
            {t('auth.backToLogin')}
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 