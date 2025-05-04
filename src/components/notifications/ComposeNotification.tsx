import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Form, Input, Button, Select, Radio, Spin, Typography, message, Space, Divider } from 'antd';
import { SendOutlined, BellOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp
import './ComposeNotification.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

// Define role options
const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'lead', label: 'Lead' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'province_manager', label: 'Province Manager' },
  { value: 'general_manager', label: 'General Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'developer', label: 'Developer' },
  { value: 'guest', label: 'Guest' },
  { value: 'pending', label: 'Pending' }
];

/**
 * ComposeNotification component for creating and sending notifications
 */
const ComposeNotification: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [recipientType, setRecipientType] = useState<string>('role');
  const [users, setUsers] = useState<any[]>([]);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const isDarkMode = useSelector((state: RootState) => state.theme?.darkMode);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This would typically be a call to your API/Firestore to get all users
      // For now, we'll just simulate this with a timeout
      setTimeout(() => {
        // Dummy data - in a real application, you'd fetch this from your database
        setUsers([
          { id: 'user1', displayName: 'User One', email: 'user1@example.com', role: 'member' },
          { id: 'user2', displayName: 'User Two', email: 'user2@example.com', role: 'branch-employee' },
          { id: 'user3', displayName: 'User Three', email: 'user3@example.com', role: 'branch-manager' },
          { id: 'user4', displayName: 'User Four', email: 'user4@example.com', role: 'system-admin' }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleRecipientTypeChange = (e: any) => {
    setRecipientType(e.target.value);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Determine target users based on selection
      let targetUsers: string[] = [];
      let targetRoles: string[] | undefined = undefined;
      let targetBranch: string | undefined = undefined;
      let targetDepartment: string | undefined = undefined;

      switch (recipientType) {
        case 'specific':
          targetUsers = values.recipients || [];
          break;
        case 'role':
          targetRoles = values.roles || [];
          // Get user IDs for selected roles for push notifications
          targetUsers = users.filter(user => values.roles?.includes(user.role)).map(user => user.id);
          break;
        case 'branch':
          targetBranch = values.branch;
          // In a real app, you would fetch users by branch
          break;
        case 'department':
          targetDepartment = values.department;
          // In a real app, you would fetch users by department
          break;
        case 'all':
          // No targeting - will go to everyone
          // For push notifications, include all user IDs
          targetUsers = users.map(user => user.id);
          break;
      }

      // Convert Date to Timestamp for Firestore compatibility
      let expiresAt = undefined;
      if (values.expiresAt) {
        const date = new Date(values.expiresAt);
        expiresAt = Timestamp.fromDate(date);
      }

      // Prepare notification data
      const notificationData = {
        title: values.title,
        description: values.message,
        type: values.type as NotificationType,
        targetRoles,
        targetBranch,
        targetDepartment,
        link: values.link || undefined,
        expiresAt
      };

      // Send notification
      const result = await notificationController.sendNotification(notificationData, {
        sendPush: values.sendPush,
        userIds: targetUsers
      });

      if (result.success) {
        message.success('Notification sent successfully');
        form.resetFields();
      } else {
        message.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      message.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`compose-notification ${isDarkMode ? 'dark' : ''}`}>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>Compose Notification</span>
          </Space>
        }
        className='notification-card'
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            initialValues={{
              type: NotificationType.INFO,
              recipientType: 'role',
              sendPush: true
            }}
          >
            <Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please enter a title' }]}>
              <Input placeholder='Notification title' maxLength={100} />
            </Form.Item>

            <Form.Item name='message' label='Message' rules={[{ required: true, message: 'Please enter a message' }]}>
              <TextArea
                placeholder='Notification message'
                autoSize={{ minRows: 3, maxRows: 6 }}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item name='type' label='Notification Type'>
              <Select>
                <Option value={NotificationType.INFO}>Information</Option>
                <Option value={NotificationType.SUCCESS}>Success</Option>
                <Option value={NotificationType.WARNING}>Warning</Option>
                <Option value={NotificationType.ERROR}>Error</Option>
              </Select>
            </Form.Item>

            <Form.Item name='link' label='Link (Optional)'>
              <Input placeholder='e.g. /dashboard' />
            </Form.Item>

            <Divider orientation='left'>Recipients</Divider>

            <Form.Item name='recipientType' label='Send To'>
              <Radio.Group onChange={handleRecipientTypeChange} value={recipientType}>
                <Radio value='specific'>Specific Users</Radio>
                <Radio value='role'>By Role</Radio>
                <Radio value='branch'>By Branch</Radio>
                <Radio value='department'>By Department</Radio>
                <Radio value='all'>All Users</Radio>
              </Radio.Group>
            </Form.Item>

            {recipientType === 'specific' && (
              <Form.Item
                name='recipients'
                label='Select Recipients'
                rules={[{ required: true, message: 'Please select at least one recipient' }]}
              >
                <Select
                  mode='multiple'
                  placeholder='Select users'
                  optionFilterProp='children'
                  style={{ width: '100%' }}
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.displayName || user.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {recipientType === 'role' && (
              <Form.Item
                name='roles'
                label='Select Roles'
                rules={[{ required: true, message: 'Please select at least one role' }]}
              >
                <Select
                  mode='multiple'
                  placeholder='Select roles'
                  optionFilterProp='children'
                  style={{ width: '100%' }}
                >
                  {ROLE_OPTIONS.map(role => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {recipientType === 'branch' && (
              <Form.Item
                name='branch'
                label='Select Branch'
                rules={[{ required: true, message: 'Please select a branch' }]}
              >
                <Select placeholder='Select branch'>
                  <Option value='branch1'>Branch 1</Option>
                  <Option value='branch2'>Branch 2</Option>
                  <Option value='branch3'>Branch 3</Option>
                </Select>
              </Form.Item>
            )}

            {recipientType === 'department' && (
              <Form.Item
                name='department'
                label='Select Department'
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select placeholder='Select department'>
                  <Option value='department1'>Department 1</Option>
                  <Option value='department2'>Department 2</Option>
                  <Option value='department3'>Department 3</Option>
                </Select>
              </Form.Item>
            )}

            <Divider orientation='left'>Delivery Options</Divider>

            <Form.Item name='sendPush' valuePropName='checked'>
              <Radio.Group>
                <Radio value={true}>Send as push notification</Radio>
                <Radio value={false}>In-app notification only</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading} icon={<SendOutlined />}>
                Send Notification
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default ComposeNotification;
