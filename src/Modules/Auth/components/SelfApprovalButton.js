import React, { useState } from 'react';
import { Button, message, Popconfirm } from 'antd';
import { UnlockOutlined, LoadingOutlined } from '@ant-design/icons';
import { guidedSelfApproval } from '../../../utils/selfApproval';

const SelfApprovalButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSelfApproval = async () => {
    setLoading(true);
    try {
      const success = await guidedSelfApproval();
      if (success) {
        message.success('Self-approval successful! Refreshing page...');
        // Delay to show success message, then reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        message.error('Self-approval failed. Check console for details.');
      }
    } catch (error) {
      console.error('Self-approval error:', error);
      message.error('Self-approval failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show in development mode
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  if (!isDev) {
    return null;
  }

  return (
    <div style={{ marginTop: '16px', textAlign: 'center' }}>
      <Popconfirm
        title="Self-Approve Account"
        description="This will approve your account for development/testing purposes. Continue?"
        onConfirm={handleSelfApproval}
        okText="Yes, Approve"
        cancelText="Cancel"
        disabled={loading}
      >
        <Button
          type="primary"
          danger
          icon={loading ? <LoadingOutlined /> : <UnlockOutlined />}
          loading={loading}
          style={{
            background: '#722ed1',
            borderColor: '#722ed1',
            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)'
          }}
        >
          {loading ? 'Approving...' : 'Self-Approve (Dev)'}
        </Button>
      </Popconfirm>
      
      <div style={{ 
        fontSize: '12px', 
        color: '#999', 
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Development mode only - for testing purposes
      </div>
    </div>
  );
};

export default SelfApprovalButton; 