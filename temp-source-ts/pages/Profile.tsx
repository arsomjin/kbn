import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Typography,
  Avatar,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Tag,
  Skeleton,
  Modal,
  message
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TeamOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { ROLES } from '../constants/roles';
import BranchName from '../components/common/BranchName';
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserData {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  firstName?: string;
  lastName?: string;
  branch?: string;
  department?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  passwordLastChanged?: string | null;
}

const Profile: React.FC = () => {
  const { t } = useTranslation(['profile', 'common']);
  const { user, userProfile } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [lastPasswordChanged, setLastPasswordChanged] = useState(
    userProfile && 'passwordLastChanged' in userProfile ? (userProfile as any).passwordLastChanged : null
  );

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className='p-6'>
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </div>
    );
  }

  const userData: UserData = {
    ...userProfile,
    ...user
  };

  console.log(userData);

  const handleOpenPasswordModal = () => setIsPasswordModalOpen(true);
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    form.resetFields();
  };

  const handlePasswordChange = async () => {
    try {
      await form.validateFields();
      setPasswordLoading(true);
      const values = form.getFieldsValue();
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');
      if (user.providerData.some(p => p.providerId === 'password')) {
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPassword);
        // Update last changed in store (simulate API call)
        const now = new Date().toISOString();
        setLastPasswordChanged(now);
        // Optionally, update in Firestore/profile
        // await updateUserProfile(user.uid, { passwordLastChanged: now });
        message.success(t('messages.success', 'Password updated successfully'));
        handleClosePasswordModal();
      } else {
        await sendPasswordResetEmail(auth, user.email);
        message.info(t('messages.passwordResetSent', 'Password reset email sent'));
        handleClosePasswordModal();
      }
    } catch (err: any) {
      message.error(err.message || t('messages.error', 'Error changing password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='mb-6'>
        <Title level={2} className='text-gray-800 dark:text-gray-200'>
          {t('title', 'User Profile')}
        </Title>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Left Column - User Info Card */}
        <Card className='md:col-span-1 bg-white dark:bg-gray-800 shadow-sm'>
          <div className='flex flex-col items-center'>
            <Avatar size={120} src={userData.photoURL} icon={<UserOutlined />} className='mb-4 bg-primary' />
            <Title level={4} className='text-center text-gray-800 dark:text-gray-200'>
              {userData.displayName || t('noName', 'No Name')}
            </Title>
            <Tag color='blue' className='mb-4'>
              {t(`${userData.role?.toLowerCase()}.label`, { ns: 'roles' })}
            </Tag>
            <Divider className='w-full' />
            <Space direction='vertical' className='w-full'>
              <div className='flex items-center text-gray-600 dark:text-gray-400'>
                <MailOutlined className='mr-2' />
                <Text>{userData.email || t('noEmail', 'No Email')}</Text>
              </div>
              {userData.phoneNumber && (
                <div className='flex items-center text-gray-600 dark:text-gray-400'>
                  <PhoneOutlined className='mr-2' />
                  <Text>{userData.phoneNumber}</Text>
                </div>
              )}
              {userData.branch && (
                <div className='flex items-center text-gray-600 dark:text-gray-400'>
                  <BankOutlined className='mr-2' />
                  <Text>
                    <BranchName code={userData.branch} />
                  </Text>
                </div>
              )}
              {userData.department && (
                <div className='flex items-center text-gray-600 dark:text-gray-400'>
                  <TeamOutlined className='mr-2' />
                  <Text>{userData.department}</Text>
                </div>
              )}
            </Space>
          </div>
        </Card>

        {/* Right Column - Tabs */}
        <Card className='md:col-span-2 bg-white dark:bg-gray-800 shadow-sm'>
          <Tabs defaultActiveKey='personal'>
            <TabPane tab={t('tabs.personal', 'Personal Information')} key='personal'>
              <Form layout='vertical' className='mt-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item label={t('fields.firstName', 'First Name')}>
                    <Input value={userData.firstName} disabled />
                  </Form.Item>
                  <Form.Item label={t('fields.lastName', 'Last Name')}>
                    <Input value={userData.lastName} disabled />
                  </Form.Item>
                  <Form.Item label={t('fields.email', 'Email')}>
                    <Input value={userData.email || ''} disabled />
                  </Form.Item>
                  <Form.Item label={t('fields.phone', 'Phone Number')}>
                    <Input value={userData.phoneNumber || ''} disabled />
                  </Form.Item>
                </div>
              </Form>
            </TabPane>

            <TabPane tab={t('tabs.work', 'Work Information')} key='work'>
              <Form layout='vertical' className='mt-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Form.Item label={t('fields.branch', 'Branch')}>
                    <div className='p-1 text-gray-600 dark:text-gray-400'>
                      {userData.branch ? <BranchName code={userData.branch} /> : '-'}
                    </div>
                  </Form.Item>
                  <Form.Item label={t('fields.department', 'Department')}>
                    <Input value={userData.department} disabled />
                  </Form.Item>
                  <Form.Item label={t('fields.role', 'Role')}>
                    <Input value={t(`${userData.role?.toLowerCase()}.label`, { ns: 'roles' })} disabled />
                  </Form.Item>
                  <Form.Item label={t('fields.status', 'Status')}>
                    <Input value={userData.status || t('fields.noStatus', 'No Status')} disabled />
                  </Form.Item>
                </div>
              </Form>
            </TabPane>

            <TabPane tab={t('tabs.security', 'Security')} key='security'>
              <div className='mt-4'>
                <Space direction='vertical' className='w-full'>
                  <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                    <div>
                      <Text strong className='block text-gray-800 dark:text-gray-200'>
                        {t('security.emailVerification', 'Email Verification')}
                      </Text>
                      <Text className='text-gray-600 dark:text-gray-400'>
                        {userData.emailVerified
                          ? t('security.verified', 'Verified')
                          : t('security.notVerified', 'Not Verified')}
                      </Text>
                    </div>
                    {!userData.emailVerified && <Button type='primary'>{t('security.verify', 'Verify Email')}</Button>}
                  </div>
                  {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <Text strong className="block text-gray-800 dark:text-gray-200">
                        {t('security.password', 'Password')}
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400">
                        {t('security.lastChanged', { date: lastPasswordChanged ? new Date(lastPasswordChanged).toLocaleString() : t('security.never', 'Never') })}
                      </Text>
                    </div>
                    <Button onClick={handleOpenPasswordModal}>
                      {t('security.changePassword', 'Change Password')}
                    </Button>
                  </div> */}
                </Space>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>

      <Modal
        title={t('security.changePassword', 'Change Password')}
        open={isPasswordModalOpen}
        onCancel={handleClosePasswordModal}
        onOk={handlePasswordChange}
        confirmLoading={passwordLoading}
        okText={t('actions.save', 'Save Changes')}
        cancelText={t('actions.cancel', 'Cancel')}
        okButtonProps={{
          disabled:
            passwordLoading ||
            !form.isFieldsTouched(true) ||
            !!form.getFieldsError().filter(({ errors }) => errors.length).length
        }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='currentPassword'
            label={t('security.password', 'Current Password')}
            rules={[{ required: true, message: t('security.password', 'Current Password') + ' is required' }]}
          >
            <Input.Password
              autoFocus
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              disabled={passwordLoading}
            />
          </Form.Item>
          <Form.Item
            name='newPassword'
            label={t('security.newPassword', 'New Password')}
            rules={[
              { required: true, message: t('security.newPassword', 'New Password') + ' is required' },
              { min: 8, message: t('security.newPassword', 'New Password') + ' must be at least 8 characters' },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
                message: t('security.newPassword', 'New Password') + ' must contain an uppercase letter and a number'
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('currentPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('security.newPassword', 'New Password') + ' must be different from current password')
                  );
                }
              })
            ]}
          >
            <Input.Password
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              disabled={passwordLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
