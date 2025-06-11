import React, { useState } from 'react';
import { Button, Card, Typography, message, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { verifyAuth } from 'redux/actions/auth';
import { app } from '../firebase';

const { Title, Text } = Typography;

const RBACSwitch = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const switchRole = async (role) => {
    setLoading(true);
    
    try {
      let updateData = {};
      
      if (role === 'DEV') {
        updateData = {
          isDev: true,
          isActive: true,
          'auth.isActive': true,
          'auth.isApproved': true
        };
      } else if (role === 'ADMIN') {
        updateData = {
          isDev: false,
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
        };
      } else if (role === 'STAFF') {
        updateData = {
          isDev: false,
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
        };
      }

      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .update(updateData);

      message.success(`Now you are: ${role}`);
      
      // Wait a bit then refresh auth
      setTimeout(() => {
        dispatch(verifyAuth());
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to switch role');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
        RBAC Role Switcher
      </Title>
      
      <Card style={{ marginBottom: '30px' }}>
        <Text strong>Current User: </Text>
        <Text code>{user?.displayName || user?.email || user?.uid}</Text>
        <br />
        <Text strong>Current Role: </Text>
        <Text>{user?.isDev ? 'DEV' : user?.access?.authority || 'None'}</Text>
      </Card>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={() => switchRole('DEV')}
          style={{ height: '60px', fontSize: '18px' }}
        >
          🔧 DEV - Full Access to Everything
        </Button>

        <Button
          size="large"
          block
          loading={loading}
          onClick={() => switchRole('ADMIN')}
          style={{ height: '60px', fontSize: '18px' }}
        >
          👑 ADMIN - Normal Admin Role
        </Button>

        <Button
          size="large"
          block
          loading={loading}
          onClick={() => switchRole('STAFF')}
          style={{ height: '60px', fontSize: '18px' }}
        >
          👤 STAFF - Limited Access
        </Button>
      </Space>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Text type="secondary">
          Click any button to instantly switch your role. 
          <br />
          Changes take effect immediately.
        </Text>
      </div>
    </div>
  );
};

export default RBACSwitch; 