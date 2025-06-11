import React, { useState } from 'react';
import { Button, Card, Space, message, Typography, Tag, Alert } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { verifyAuth } from 'redux/actions/auth';
import { app } from '../firebase';

const { Title, Text } = Typography;

const SimpleRBAC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const makeDevUser = async () => {
    setLoading(true);
    try {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          isDev: true,
          isActive: true,
          'auth.isActive': true,
          'auth.isApproved': true
        });
      
      message.success('You are now a DEV user with full access!');
      dispatch(verifyAuth());
    } catch (error) {
      message.error('Failed to set dev access');
    }
    setLoading(false);
  };

  const makeAdminUser = async () => {
    setLoading(true);
    try {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          isActive: true,
          'auth.isActive': true,
          'auth.isApproved': true,
          access: {
            authority: 'ADMIN',
            departments: ['all'],
            permissions: ['*'],
            geographic: {
              assignedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
              assignedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
              homeProvince: 'nakhon-ratchasima',
              homeBranch: '0450'
            },
            isActive: true
          }
        });
      
      message.success('You are now an ADMIN user!');
      dispatch(verifyAuth());
    } catch (error) {
      message.error('Failed to set admin access');
    }
    setLoading(false);
  };

  const makeStaffUser = async () => {
    setLoading(true);
    try {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          isActive: true,
          'auth.isActive': true,
          'auth.isApproved': true,
          access: {
            authority: 'DEPARTMENT',
            departments: ['accounting'],
            permissions: ['accounting.view', 'accounting.edit'],
            geographic: {
              assignedProvinces: ['nakhon-ratchasima'],
              assignedBranches: ['0450'],
              homeProvince: 'nakhon-ratchasima',
              homeBranch: '0450'
            },
            isActive: true
          }
        });
      
      message.success('You are now a STAFF user!');
      dispatch(verifyAuth());
    } catch (error) {
      message.error('Failed to set staff access');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Simple RBAC Switcher</Title>
      
      <Alert 
        message="Quick Access Control"
        description="Click any button to instantly switch your role. No complexity, just works."
        type="info"
        style={{ marginBottom: '24px' }}
      />

      <Card title="Current Status">
        <Space direction="vertical">
          <div>
            <Text strong>User ID: </Text>
            <Text code>{user?.uid}</Text>
          </div>
          <div>
            <Text strong>Dev User: </Text>
            <Tag color={user?.isDev ? 'green' : 'red'}>
              {user?.isDev ? 'YES' : 'NO'}
            </Tag>
          </div>
          <div>
            <Text strong>Active: </Text>
            <Tag color={user?.isActive ? 'green' : 'red'}>
              {user?.isActive ? 'YES' : 'NO'}
            </Tag>
          </div>
          <div>
            <Text strong>Authority: </Text>
            <Tag color="blue">{user?.access?.authority || 'None'}</Tag>
          </div>
        </Space>
      </Card>

      <Card title="Switch Role" style={{ marginTop: '16px' }}>
        <Space>
          <Button 
            type="primary" 
            size="large"
            loading={loading}
            onClick={makeDevUser}
          >
            🔧 Make Me DEV (Full Access)
          </Button>
          
          <Button 
            type="default"
            size="large" 
            loading={loading}
            onClick={makeAdminUser}
          >
            👑 Make Me ADMIN
          </Button>
          
          <Button 
            type="default"
            size="large"
            loading={loading}
            onClick={makeStaffUser}
          >
            👤 Make Me STAFF
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default SimpleRBAC; 