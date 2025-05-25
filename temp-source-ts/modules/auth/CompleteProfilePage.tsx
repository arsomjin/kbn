import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  Radio,
  Typography,
  Divider,
  Tooltip,
  Space,
  Row,
  Col,
  Card,
  Layout,
  Avatar
} from 'antd';
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  HomeOutlined,
  GlobalOutlined,
  IdcardOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from 'contexts/AuthContext';
import { UserProfile, updateUserProfile } from '../../services/authService';
import { UserRole } from '../../constants/roles';
import { fetchUserProfile } from 'store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import AuthContainer from '../../components/auth/AuthContainer';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useAntdModal } from 'hooks/useAntModal';
import { createNotification, NotificationType } from '../../services/notificationService';
import ProvinceSelector from '../../components/common/ProvinceSelector';
import BranchSelector from '../../components/BranchSelector';
import { transformUserData, transformToUserProfile, removeUndefinedFields } from '../../utils/userTransform';
import { useLoading } from 'hooks/useLoading';
import DepartmentSelector from 'components/DepartmentSelector';
import PageDoc from '../../components/PageDoc';

const { Option } = Select;
const { Text, Title } = Typography;
const { Content } = Layout;

type UserType = 'employee' | 'visitor';

const CompleteProfilePage: React.FC = () => {
  const { t } = useTranslation(['profile', 'common', 'branches', 'validation']);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, userProfile } = useAuth();
  const isDarkMode = useSelector((state: RootState) => state.theme?.darkMode);
  const { modal } = useAntdModal();
  const { withLoading } = useLoading();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [userType, setUserType] = useState<UserType>('employee');

  // Initialize form with user info if available
  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || ''
      });
    } else if (user) {
      // If no profile but we have user info, initialize with that
      form.setFieldsValue({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
      });
    }
  }, [userProfile, user, form]);

  // Add effect to handle province changes
  const [currentProvince, setCurrentProvince] = useState<string | undefined>();

  useEffect(() => {
    const province = form.getFieldValue('province');
    if (province !== currentProvince) {
      setCurrentProvince(province);
      if (province) {
        // Clear branch selection when province changes
        form.setFieldsValue({ branch: undefined });
      }
    }
  }, [form, currentProvince]);

  const onUserTypeChange = (type: UserType) => {
    setUserType(type);
    // Reset fields that are specific to each user type
    if (type === 'employee') {
      form.setFieldsValue({
        company: undefined,
        purpose: undefined,
        province: undefined
      });
    } else {
      form.setFieldsValue({
        branch: undefined,
        department: undefined,
        employeeId: undefined
      });
    }
  };

  // Move Firestore update logic to a separate function
  const handleProfileSubmit = async (values: {
    firstName: string;
    lastName: string;
    branch?: string;
    department?: string;
    employeeId?: string;
    province?: string;
    purpose?: string;
    phoneNumber?: string;
  }) => {
    if (!user) {
      console.error('[CompleteProfile] No authenticated user found');
      setError('Not authenticated');
      return;
    }
    setLoading(true);
    try {
      await withLoading(
        (async () => {
          // Build formData for transformation
          const formData = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: user.email || '',
            phoneNumber: values.phoneNumber,
            province: values.province,
            branch: values.branch,
            department: values.department,
            employeeId: values.employeeId,
            purpose: values.purpose,
            accessibleProvinceIds: [values.province]
          };
          // 1. Transform to User object
          const userObj = transformUserData(formData, user.uid, userType);
          const userProfileData = transformToUserProfile(userObj as any);
          const cleanedProfileData = removeUndefinedFields(userProfileData);

          // Update profile in Firestore
          await updateUserProfile(user.uid, { ...cleanedProfileData, ...cleanedProfileData?.auth });
          console.log('[CompleteProfile] Profile saved successfully');

          // Send notification to admins about new pending user
          await createNotification({
            title: t('profile:adminTitle', 'มีผู้ใช้ลงทะเบียนใหม่'),
            description: t('profile:adminDescription', {
              name: `${values.firstName} ${values.lastName}`,
              email: user.email || '',
              type: userType
            }),
            type: NotificationType.INFO,
            targetRoles: ['province_admin', 'super_admin', 'general_manager', 'developer', 'executive']
          });

          // Refresh profile in Redux store and wait for it to complete
          // console.log('[CompleteProfile] Refreshing profile in Redux store');
          await dispatch(fetchUserProfile(user.uid)).unwrap();

          // Add a small delay to ensure the store is updated
          await new Promise(resolve => setTimeout(resolve, 500));

          console.log('[CompleteProfile] Navigating to pending page');
          navigate('/pending', { replace: true, state: { params: cleanedProfileData } });
        })()
      );
    } catch (err: any) {
      console.error('[CompleteProfile] Error saving profile:', err);
      setError(getFirebaseErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: any) => {
    console.log('[CompleteProfile] Form submitted with values:', values);
    modal.confirm({
      title: t('profile:confirmSubmitTitle', 'Confirm Profile Submission'),
      content: t('profile:confirmSubmitContent', 'Are you sure you want to submit your profile information?'),
      onOk: async () => {
        await handleProfileSubmit(values);
      },
      okText: t('common:confirm', 'Confirm'),
      cancelText: t('common:cancel', 'Cancel'),
      centered: true
    });
  };

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

  const options = [
    { label: t('profile:employee', 'Employee'), value: 'employee' },
    { label: t('profile:visitor', 'Visitor'), value: 'visitor' }
  ];

  return (
    <>
      <AuthContainer
        title={t('profile:completeProfileTitle', 'Complete Your Profile')}
        subtitle={t('profile:completeProfileSubtitle', 'Please provide your information to continue')}
        showAnimatedBackground={true}
        animationKey='complete-profile'
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='mb-4'
          >
            <Alert
              message={t('common:error', 'Error')}
              description={error}
              type='error'
              showIcon
              closable
              onClose={() => setError(null)}
            />
          </motion.div>
        )}
        <motion.div variants={containerVariants} initial='hidden' animate='visible' exit='exit'>
          <Form
            form={form}
            name='complete_profile'
            onFinish={onFinish}
            layout='vertical'
            requiredMark={false}
            className='space-y-4'
          >
            {/* Greeting with user photo and displayName, only if either exists */}
            {(user?.displayName || user?.photoURL) && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                  alignItems: 'center',
                  gap: window.innerWidth < 480 ? 8 : 16,
                  marginBottom: 24,
                  background: isDarkMode
                    ? 'linear-gradient(90deg, #232526 0%, #414345 100%)'
                    : 'linear-gradient(90deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 16,
                  padding: window.innerWidth < 480 ? '12px' : '16px',
                  boxShadow: '0 2px 8px rgba(75, 96, 67, 0.08)'
                }}
              >
                <Avatar
                  src={user.photoURL}
                  size={window.innerWidth < 480 ? 48 : 64}
                  style={{ border: '3px solid #4B6043', background: '#fff' }}
                  alt={user.displayName || undefined}
                >
                  {user.displayName?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{ textAlign: window.innerWidth < 480 ? 'center' : 'left' }}>
                  <span
                    style={{
                      fontSize: window.innerWidth < 480 ? 18 : 24,
                      fontWeight: 700,
                      color: '#4B6043',
                      display: 'block'
                    }}
                  >
                    {t('profile:greeting', { name: user.displayName })}
                  </span>
                  <div style={{ fontSize: window.innerWidth < 480 ? 12 : 14, color: '#888' }}>
                    {t('profile:greetingWelcome')}
                  </div>
                </div>
              </div>
            )}

            <Content>
              <motion.div initial='hidden' animate='visible' variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <Title level={5} className='mb-4'>
                    {t('profile:selectUserType', 'Please select your user type:')}
                  </Title>
                  <div style={{ marginBottom: 8 }}>
                    <Radio.Group
                      optionType='button'
                      style={{ width: '100%' }}
                      buttonStyle='solid'
                      value={userType}
                      onChange={e => onUserTypeChange(e.target.value)}
                    >
                      {options.map(option => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          style={{
                            width: '50%',
                            textAlign: 'center',
                            padding: window.innerWidth < 480 ? '0 4px' : undefined
                          }}
                        >
                          {option.value === 'employee' ? (
                            <UserOutlined style={{ marginRight: 8 }} />
                          ) : (
                            <GlobalOutlined style={{ marginRight: 8 }} />
                          )}
                          {option.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider className='my-6' />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item shouldUpdate>
                    {() => {
                      // const values = form.getFieldsValue(true);
                      // console.log('[CompleteProfile] Current form values:', values);
                      return null;
                    }}
                  </Form.Item>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name='firstName'
                        label={t('profile:firstName')}
                        rules={[{ required: true, message: t('validation:required') }]}
                        initialValue={userProfile?.firstName || user?.displayName?.split(' ')[0] || ''}
                      >
                        <Input
                          prefix={<UserOutlined className='text-primary mr-2' />}
                          placeholder={t('profile:firstName')}
                          size='large'
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name='lastName'
                        label={t('profile:lastName')}
                        rules={[{ required: true, message: t('validation:required') }]}
                        initialValue={userProfile?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || ''}
                      >
                        <Input
                          prefix={<UserOutlined className='text-primary mr-2' />}
                          placeholder={t('profile:lastName')}
                          size='large'
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Employee-specific fields */}
                  {userType === 'employee' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Form.Item
                        name='province'
                        label={t('profile:province')}
                        rules={[{ required: true, message: t('validation:required') }]}
                      >
                        <ProvinceSelector
                          value={form.getFieldValue('province')}
                          onChange={value => {
                            // Update province but let the effect handle clearing branch
                            form.setFieldsValue({ province: value });
                          }}
                          size='large'
                          allowedProvinces={['nakhon-ratchasima', 'nakhon-sawan']}
                        />
                      </Form.Item>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12}>
                          <Form.Item noStyle dependencies={['province']}>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name='branch'
                                label={t('profile:branch')}
                                rules={[{ required: true, message: t('common:required') }]}
                              >
                                <BranchSelector
                                  provinceId={getFieldValue('province')}
                                  disabled={!getFieldValue('province')}
                                  size='large'
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item noStyle dependencies={['province']}>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name='department'
                                label={t('profile:department')}
                                rules={[{ required: true, message: t('validation:required') }]}
                              >
                                <DepartmentSelector size='large' />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name='employeeId'
                        label={t('profile:employeeId', 'Employee ID')}
                        rules={[{ required: true, message: t('validation:required') }]}
                      >
                        <Input
                          prefix={<IdcardOutlined className='text-primary mr-2' />}
                          placeholder={t('profile:employeeId', 'Employee ID')}
                          size='large'
                        />
                      </Form.Item>
                    </motion.div>
                  )}

                  {/* Visitor-specific fields */}
                  {userType === 'visitor' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} sm={24}>
                          <Form.Item
                            name='phoneNumber'
                            label={t('profile:phoneNumber') || 'Phone Number'}
                            rules={[
                              { required: true, message: t('validation:required') },
                              {
                                pattern: /^[0-9]{9,15}$/,
                                message: t('validation:phoneNumber') || 'Please enter a valid phone number'
                              }
                            ]}
                          >
                            <Input
                              type='tel'
                              placeholder={t('profile:phoneNumber') || 'Phone Number'}
                              size='large'
                              className='text-primay'
                              autoComplete='tel'
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name='purpose'
                        label={t('profile:purpose', 'Purpose of Visit')}
                        rules={[{ required: true, message: t('validation:required') }]}
                      >
                        <Input
                          prefix={<GlobalOutlined className='text-primary mr-2' />}
                          placeholder={t('profile:purpose', 'Purpose of Visit')}
                          size='large'
                        />
                      </Form.Item>
                    </motion.div>
                  )}

                  <Form.Item className='mt-6'>
                    <Button type='primary' htmlType='submit' size='large' loading={loading} block>
                      {t('profile:completeProfile', 'Complete Profile')}
                    </Button>
                  </Form.Item>
                </motion.div>
              </motion.div>
            </Content>
          </Form>
        </motion.div>
      </AuthContainer>
      <PageDoc />
    </>
  );
};

export default CompleteProfilePage;
