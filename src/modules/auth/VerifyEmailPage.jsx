import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useModal } from 'contexts/ModalContext';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { Button, Space } from 'antd';
import { CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import styles from './VerifyEmailPage.module.css';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const { verifyEmail, sendEmailVerification } = useAuth();
  const { showError, showSuccess } = useModal();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const oobCode = searchParams.get('oobCode');

  const handleVerifyEmail = async () => {
    if (!oobCode) {
      showError(t('auth.invalidVerificationCode'));
      return;
    }

    try {
      setVerifying(true);
      await verifyEmail(oobCode);
      showSuccess(t('auth.emailVerificationSuccess'));
      navigate('/auth/login');
    } catch (error) {
      console.error('Email verification error:', error);
      showError(t('auth.emailVerificationError'), error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await sendEmailVerification();
      showSuccess(t('auth.verificationEmailSent'));
    } catch (error) {
      console.error('Resend verification error:', error);
      showError(t('auth.resendVerificationError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || verifying) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.verifyEmailTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.verifyEmailSubtitle')}</p>
        </div>

        {oobCode ? (
          <div className={styles.verification}>
            <CheckCircleOutlined className={styles.icon} />
            <p>{t('auth.verificationCodeFound')}</p>
            <Button
              type="primary"
              onClick={handleVerifyEmail}
              block
              size={isMobile ? 'large' : 'middle'}
              loading={verifying}
            >
              {t('auth.verifyEmailButton')}
            </Button>
          </div>
        ) : (
          <div className={styles.resend}>
            <MailOutlined className={styles.icon} />
            <p>{t('auth.noVerificationCode')}</p>
            <Button
              type="primary"
              onClick={handleResendVerification}
              block
              size={isMobile ? 'large' : 'middle'}
              loading={loading}
            >
              {t('auth.resendVerificationButton')}
            </Button>
          </div>
        )}

        <Space direction="vertical" className={styles.links}>
          <Link to="/auth/login" className={styles.link}>
            {t('auth.backToLogin')}
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 