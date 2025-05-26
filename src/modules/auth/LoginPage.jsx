import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Alert, Divider, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from 'contexts/AuthContext';
import AuthContainer from '../../components/auth/AuthContainer';
import {
  getFirebaseErrorMessage,
  getFirebaseErrorDetails,
} from '../../utils/firebaseErrorMessages';
import PageDoc from '../../components/PageDoc';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    isLoading,
    error,
    resetAuthError,
    userProfile,
    hasNoProfile,
  } = useAuth();
  const [form] = Form.useForm();
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forceResetLoading, setForceResetLoading] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const [errorVisible, setErrorVisible] = useState(true);

  // Get redirect location from router state, or default to role-check for role-based routing
  const from = location.state?.from?.pathname || '/role-check';

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }

      // Set a new timeout to force reset loading state after 5 seconds
      loadingTimeoutRef.current = window.setTimeout(() => {
        console.log('Loading timeout reached, forcing reset of loading state');
        setForceResetLoading(true);
      }, 5000);
    } else {
      // Clear timeout when loading ends normally
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      // Clean up timeout on component unmount
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (hasNoProfile) {
        navigate('/complete-profile', { replace: true });
      } else if (userProfile) {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, hasNoProfile, userProfile, navigate, from]);

  useEffect(() => {
    setErrorVisible(!!error);
  }, [error]);

  // Using useCallback to memoize the handler
  const onFinish = useCallback(
    async (values) => {
      try {
        setLocalLoading(true);
        // Reset the force loading state if it was set
        setForceResetLoading(false);
        console.log('Login form submitted');
        await login(values.email, values.password);
        // Navigation will happen automatically thanks to the effect
      } catch (error) {
        console.error('Login failed:', error);
        // Force error to be visible even if it's the same error
        setErrorVisible(true);
      } finally {
        setLocalLoading(false);
      }
    },
    [login],
  );

  const handleInputChange = () => {
    if (error) resetAuthError();
    setErrorVisible(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      setErrorVisible(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Don't show loading spinner indefinitely if there's an issue
  const showSpinner = (isLoading && !forceResetLoading) || localLoading || googleLoading;

  // Get error details for better UI representation
  const errorDetails = error ? getFirebaseErrorDetails(error, t) : null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const isMobile = window.innerWidth < 480;

  return (
    <>
      <AuthContainer title={t('app.title', 'KBN')} animationKey="login" backgroundIntensity="low">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`max-w-md w-full mx-auto `}
        >
          <motion.div variants={itemVariants}>
            {/* <Card className='rounded-xl shadow-card'> */}
            {error && errorVisible && errorDetails && (
              <Alert
                message={getFirebaseErrorMessage(error, t) || errorDetails.message}
                type={
                  errorDetails.severity === 'warning'
                    ? 'warning'
                    : errorDetails.severity === 'info'
                      ? 'info'
                      : 'error'
                }
                showIcon
                closable
                onClose={() => {
                  setErrorVisible(false);
                  resetAuthError();
                }}
                className="mb-6"
              />
            )}
            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              disabled={showSpinner}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: t('validation:required') },
                  { type: 'email', message: t('validation:email') },
                ]}
              >
                <Input
                  prefix={<UserOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                  placeholder={t('auth:email')}
                  size="large"
                  className="text-primay"
                  autoComplete="username"
                  onChange={handleInputChange}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: t('validation:required') },
                  { min: 6, message: t('validation:minLength', { length: 6 }) },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                  placeholder={t('auth:password')}
                  size="large"
                  className="text-primay"
                  autoComplete="current-password"
                  onChange={handleInputChange}
                />
              </Form.Item>
              <Form.Item>
                <div className="flex justify-between items-center mb-2">
                  <Link to="/auth/reset-password" className="text-accent hover:underline text-sm">
                    {t('auth:forgotPassword')}
                  </Link>
                </div>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn btn-primary w-full text-base h-12 rounded-lg shadow-sm"
                  size="large"
                  loading={showSpinner}
                  style={{ fontWeight: 600, letterSpacing: 1 }}
                >
                  {showSpinner ? t('app:loading') : t('auth:login')}
                </Button>
              </Form.Item>
              <Divider>{t('auth:or')}</Divider>
              <Form.Item>
                <Button
                  type="default"
                  icon={<GoogleOutlined />}
                  className="w-full text-base h-12 rounded-lg shadow-sm flex items-center justify-center"
                  size="large"
                  onClick={handleGoogleLogin}
                  loading={googleLoading}
                  style={{
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  {googleLoading ? t('app:loading') : t('auth:loginWithGoogle')}
                </Button>
              </Form.Item>
              <div className="text-center mt-4">
                <p className={`text-secondary text-md`}>
                  {t('auth:dontHaveAccount')}{' '}
                  <Link to="/auth/signup" className="text-accent hover:underline font-medium">
                    {t('auth:register')}
                  </Link>
                </p>
              </div>
            </Form>
            {/* </Card> */}
          </motion.div>
        </motion.div>
      </AuthContainer>
      <PageDoc />
    </>
  );
};

export default LoginPage;
