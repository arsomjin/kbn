import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  Divider,
  Typography,
  Radio,
  Card,
  Layout,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BankOutlined,
  GoogleOutlined,
  TeamOutlined,
  HomeOutlined,
  GlobalOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, signInUser } from '../../services/authService';
import { useAuth } from 'contexts/AuthContext';
import AuthContainer from '../../components/auth/AuthContainer';
import { getAuthErrorMessage } from '../../utils/firebaseErrorMessages';
import { createNotification, NotificationType } from '../../services/notificationService';
import { motion } from 'framer-motion';
import InternalProvinceSelector from '../../components/common/InternalProvinceSelector';
import { useSelector } from 'react-redux';
import DepartmentSelector from 'components/common/DepartmentSelector';
import PageDoc from '../../components/PageDoc';
import BranchSelector from '../../components/common/BranchSelector';
import { useModal } from 'contexts/ModalContext';
import ProvinceSelector from '../../components/common/ProvinceSelector';

const { Option } = Select;
const { Title, Text } = Typography;
const { Content } = Layout;

const RegisterPage = () => {
  const { t } = useTranslation(['profile', 'common', 'notifications']);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('employee');
  const { loginWithGoogle, isAuthenticated, userProfile, hasNoProfile } = useAuth();
  const { showConfirm } = useModal();

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

  // Reset fields when changing user type
  const onUserTypeChange = (type) => {
    setUserType(type);
    // Reset fields that are specific to each user type
    if (type === 'employee') {
      form.setFieldsValue({
        purpose: undefined,
        phoneNumber: undefined,
      });
    } else {
      form.setFieldsValue({
        branch: undefined,
        department: undefined,
        employeeId: undefined,
        province: undefined,
      });
    }
  };

  // Redirect if user becomes authenticated to the role-check page (only if they have a profile)
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      navigate('/role-check', { replace: true });
    }
  }, [isAuthenticated, userProfile, navigate]);

  // Redirect to complete-profile if authenticated with Google and missing profile
  useEffect(() => {
    if (isAuthenticated && hasNoProfile) {
      navigate('/complete-profile', { replace: true });
    }
  }, [isAuthenticated, hasNoProfile, navigate]);

  // Add effect to handle province changes
  useEffect(() => {
    const province = form.getFieldValue('province');
    if (province) {
      // Clear branch selection when province changes
      form.setFieldsValue({ branch: undefined });
    }
  }, [form.getFieldValue('province')]);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      setError(t('auth:passwordMismatch'));
      return;
    }

    const confirmed = await showConfirm({
      title: t('auth:confirmRegisterTitle', 'Confirm Registration'),
      content: t(
        'auth:confirmRegisterContent',
        'Are you sure you want to register with these details?',
      ),
      okText: t('common:confirm', 'Confirm'),
      cancelText: t('common:cancel', 'Cancel'),
    });

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      // Create display name from first and last name
      const displayName = `${values.firstName} ${values.lastName}`;

      // Register the user
      await registerUser(
        values.email,
        values.password,
        displayName,
        values.firstName,
        values.lastName,
        userType,
        values.province,
        values.branch,
        values.department,
        values.employeeId,
        values.phoneNumber,
        values.purpose,
        userType,
      );

      // Notify admins, super_admins, and executive users about new pending user
      await createNotification({
        title: t('profile:adminTitle', 'มีผู้ใช้ลงทะเบียนใหม่'),
        description: `${displayName} (${values.email}) registered and is pending approval.`,
        type: NotificationType.INFO,
        targetRoles: ['province_admin', 'super_admin', 'general_manager', 'developer', 'executive'],
        link: '/review-users',
      });

      // Automatically sign in after successful registration
      try {
        await signInUser(values.email, values.password);
        // The useEffect hook will handle redirecting the user to the pending page
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        // If auto-login fails, navigate to login page with a success message
        navigate('/login', {
          replace: true,
          state: { registrationSuccess: true },
        });
      }
    } catch (error) {
      setError(getAuthErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await loginWithGoogle();
      // The auth hook will handle redirecting the user after successful sign-in
    } catch (error) {
      console.error('Google registration failed:', error);
      setError(getAuthErrorMessage(error, t));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <AuthContainer
        title={t('auth:createAccount')}
        animationKey="register"
        style={{ marginTop: 60 }}
      >
        {error && (
          <Alert
            message={t('auth:registerError')}
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Title level={5} className="mb-4 text-center">
              {t('profile:selectUserType', 'กรุณาเลือกประเภทผู้ใช้:')}
            </Title>
            <div className="mt-4">
              <Radio.Group
                optionType="button"
                style={{ width: '100%' }}
                buttonStyle="solid"
                value={userType}
                onChange={(e) => onUserTypeChange(e.target.value)}
              >
                <Radio
                  key="employee"
                  value="employee"
                  style={{
                    width: '50%',
                    textAlign: 'center',
                    padding: window.innerWidth < 480 ? '0 4px' : undefined,
                  }}
                >
                  <UserOutlined style={{ marginRight: window.innerWidth < 480 ? 4 : 8 }} />
                  {t('profile:employee', 'พนักงาน')}
                </Radio>
                <Radio
                  key="visitor"
                  value="visitor"
                  style={{
                    width: '50%',
                    textAlign: 'center',
                    padding: window.innerWidth < 480 ? '0 4px' : undefined,
                  }}
                >
                  <GlobalOutlined style={{ marginRight: window.innerWidth < 480 ? 4 : 8 }} />
                  {t('profile:visitor', 'ผู้เยี่ยมชม')}
                </Radio>
              </Radio.Group>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Divider />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={t('auth:email')}
                rules={[
                  { required: true, message: t('validation:required') },
                  { type: 'email', message: t('validation:email') },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-primary mr-2" />}
                  placeholder={t('auth:email')}
                  size="large"
                  className="text-primay"
                  autoComplete="email"
                />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label={t('profile:firstName')}
                    rules={[{ required: true, message: t('validation:required') }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-primary mr-2" />}
                      placeholder={t('profile:firstName')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label={t('profile:lastName')}
                    rules={[{ required: true, message: t('validation:required') }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-primary mr-2" />}
                      placeholder={t('profile:lastName')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label={t('auth:password')}
                    rules={[
                      { required: true, message: t('validation:required') },
                      { min: 6, message: t('validation:minLength', { length: 6 }) },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-primary mr-2" />}
                      placeholder={t('auth:password')}
                      size="large"
                      className="text-primay"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label={t('auth:confirmPassword')}
                    rules={[
                      { required: true, message: t('validation:required') },
                      { min: 6, message: t('validation:minLength', { length: 6 }) },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-primary mr-2" />}
                      placeholder={t('auth:confirmPassword')}
                      size="large"
                      className="text-primay"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Employee-specific fields */}
              {userType === 'employee' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item
                    name="province"
                    label={t('profile:province')}
                    rules={[{ required: true, message: t('validation:required') }]}
                  >
                    <ProvinceSelector
                      onChange={() => {
                        // Clear branch when province changes
                        form.setFieldsValue({ branch: undefined });
                      }}
                      size="large"
                    />
                  </Form.Item>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item noStyle dependencies={['province']}>
                        {({ getFieldValue }) => (
                          <Form.Item
                            name="branch"
                            label={t('profile:branch')}
                            rules={[{ required: true, message: t('validation:required') }]}
                          >
                            <BranchSelector
                              provinceId={getFieldValue('province')}
                              size="large"
                              disabled={!getFieldValue('province')}
                            />
                          </Form.Item>
                        )}
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="department"
                        label={t('profile:department')}
                        rules={[{ required: true, message: t('validation:required') }]}
                      >
                        <DepartmentSelector
                          placeholder={t('profile:selectDepartment')}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="employeeId"
                    label={t('profile:employeeId', 'Employee ID')}
                    rules={[{ required: true, message: t('validation:required') }]}
                  >
                    <Input
                      prefix={<IdcardOutlined className="text-primary mr-2" />}
                      placeholder={t('profile:employeeId', 'Employee ID')}
                      size="large"
                    />
                  </Form.Item>
                </motion.div>
              )}

              {/* Visitor-specific fields */}
              {userType === 'visitor' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item
                    name="phoneNumber"
                    label={t('profile:phoneNumber') || 'Phone Number'}
                    rules={[
                      { required: true, message: t('validation:required') },
                      {
                        pattern: /^[0-9]{9,15}$/,
                        message: t('validation:phoneNumber') || 'Please enter a valid phone number',
                      },
                    ]}
                  >
                    <Input
                      type="tel"
                      placeholder={t('profile:phoneNumber') || 'Phone Number'}
                      size="large"
                      className="text-primay"
                      autoComplete="tel"
                    />
                  </Form.Item>

                  <Form.Item
                    name="purpose"
                    label={t('profile:purpose', 'Purpose of Visit')}
                    rules={[{ required: true, message: t('validation:required') }]}
                  >
                    <Input
                      prefix={<GlobalOutlined className="text-primary mr-2" />}
                      placeholder={t('profile:purpose', 'Purpose of Visit')}
                      size="large"
                    />
                  </Form.Item>
                </motion.div>
              )}

              <Form.Item className="mt-6">
                <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                  {t('auth:register')}
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

              <div className="text-center text-sm mt-4">
                <p>
                  {t('auth:alreadyHaveAccount')}{' '}
                  <Link to="/login" className="text-secondary hover:text-primary-dark">
                    {t('auth:login')}
                  </Link>
                </p>
              </div>
            </Form>
          </motion.div>
        </motion.div>
      </AuthContainer>
      <PageDoc />
    </>
  );
};

export default RegisterPage;
