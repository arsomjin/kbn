import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Select, Card, Row, Col } from 'antd';
import { UserOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../services/authService';
import { UserRole } from '../../constants/roles';
import { updateUserProfile } from '../../services/authService';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import AuthContainer from '../../components/auth/AuthContainer';
import { getAuthErrorMessage } from '../../utils/firebaseErrorMessages';
import { motion } from 'framer-motion';

const { Option } = Select;

interface LocationState {
  from?: {
    pathname: string;
  };
}

const CreateProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 480;
  const isTablet = windowWidth >= 480 && windowWidth < 768;

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

  // Get redirect location from router state, or default to dashboard
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  const onFinish = async (values: { displayName: string; role: UserRole; branch?: string; department?: string }) => {
    if (!user) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Create profile data
      const profileData: Partial<UserProfile> = {
        uid: user.uid,
        displayName: values.displayName,
        role: values.role,
        branch: values.branch,
        department: values.department
      };

      // Update user profile in Firestore
      await updateUserProfile(user.uid, profileData);

      // Refresh user profile in Redux store
      await dispatch(fetchUserProfile());

      // Refresh the auth hook state
      refreshUserProfile();

      // Navigate to the original destination or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(getAuthErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      title={t('profile:createProfile')}
      subtitle={t('profile:completeYourProfile')}
      animationKey='create-profile'
    >
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className={`max-w-md w-full mx-auto ${isMobile ? 'px-4' : ''}`}
      >
        <motion.div variants={itemVariants}>
          <Card className='rounded-xl shadow-card'>
            {error && (
              <Alert
                message={t('common:error')}
                description={error}
                type='error'
                showIcon
                closable
                onClose={() => setError(null)}
                className='mb-6'
              />
            )}

            <Form form={form} name='createProfile' onFinish={onFinish} layout='vertical' requiredMark={false}>
              <Form.Item
                name='displayName'
                label={t('profile:displayName')}
                rules={[{ required: true, message: t('validation:required') }]}
                initialValue={user?.displayName || ''}
              >
                <Input
                  prefix={<UserOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                  placeholder={t('profile:displayName')}
                  size='large'
                  className='text-primay'
                />
              </Form.Item>

              <Form.Item
                name='role'
                label={t('profile:role')}
                rules={[{ required: true, message: t('validation:required') }]}
                initialValue={UserRole.USER}
              >
                <Select size='large'>
                  <Option value={UserRole.USER}>{t('roles:user')}</Option>
                  <Option value={UserRole.LEAD}>{t('roles:lead')}</Option>
                  <Option value={UserRole.BRANCH_MANAGER}>{t('roles:branchManager')}</Option>
                  <Option value={UserRole.PROVINCE_MANAGER}>{t('roles:provinceManager')}</Option>
                  <Option value={UserRole.PROVINCE_ADMIN}>{t('roles:provinceAdmin')}</Option>
                  <Option value={UserRole.GENERAL_MANAGER}>{t('roles:generalManager')}</Option>
                </Select>
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name='branch' label={t('profile:branch')}>
                    <Input
                      prefix={<BankOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                      placeholder={t('profile:branch')}
                      size='large'
                      className='text-primay'
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name='department' label={t('profile:department')}>
                    <Input
                      prefix={<TeamOutlined className={`text-disable ${isMobile ? 'mr-1' : 'mr-2'}`} />}
                      placeholder={t('profile:department')}
                      size='large'
                      className='text-primay'
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className='mt-6'>
                <Button type='primary' htmlType='submit' className='w-full' size='large' loading={loading}>
                  {t('profile:createProfile')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </AuthContainer>
  );
};

export default CreateProfilePage;
