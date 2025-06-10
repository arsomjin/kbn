import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Space, Typography } from 'antd';
import { 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  ReloadOutlined,
  WifiOutlined,
  UserOutlined
} from '@ant-design/icons';
import FirebaseErrorHandler from '../utils/firebaseErrorHandler';

const { Text, Paragraph } = Typography;

/**
 * ErrorDisplay Component
 * Displays Firebase errors with user-friendly Thai messages and suggested actions
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onReauth, 
  onContactAdmin,
  showDetails = false,
  style = {}
}) => {
  if (!error) return null;

  // Interpret the error using our utility
  const errorInfo = FirebaseErrorHandler.interpret(error);
  
  // Get the appropriate icon based on severity
  const getIcon = (severity) => {
    switch (severity) {
      case 'critical': return <CloseCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'info': return <InfoCircleOutlined />;
      default: return <ExclamationCircleOutlined />;
    }
  };
  
  // Get the appropriate alert type based on severity
  const getAlertType = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  };
  
  // Get suggested action buttons
  const getSuggestedActionButton = (action) => {
    switch (action) {
      case 'checkNetwork':
        return (
          <Button 
            icon={<WifiOutlined />} 
            onClick={() => window.location.reload()}
            type="primary"
            size="small"
          >
            ตรวจสอบการเชื่อมต่อ
          </Button>
        );
      
      case 'reauth':
        return (
          <Button 
            icon={<UserOutlined />} 
            onClick={onReauth}
            type="primary"
            size="small"
          >
            เข้าสู่ระบบใหม่
          </Button>
        );
      
      case 'retry':
        return (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRetry}
            type="primary"
            size="small"
          >
            ลองใหม่
          </Button>
        );
      
      case 'waitAndRetry':
        return (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRetry}
            type="primary"
            size="small"
          >
            รอสักครู่แล้วลองใหม่
          </Button>
        );
      
      case 'contactAdmin':
        return (
          <Button 
            onClick={onContactAdmin}
            size="small"
          >
            ติดต่อผู้ดูแลระบบ
          </Button>
        );
      
      case 'checkEmail':
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            กรุณาตรวจสอบรูปแบบอีเมลและลองใหม่
          </Text>
        );
      
      case 'strengthenPassword':
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            กรุณาใช้รหัสผ่านที่แข็งแกร่งขึ้น (อย่างน้อย 6 ตัวอักษร)
          </Text>
        );
      
      case 'useExistingAccount':
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบแทน
          </Text>
        );
      
      default:
        return onRetry ? (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRetry}
            size="small"
          >
            ลองใหม่
          </Button>
        ) : null;
    }
  };
  
  const suggestedAction = FirebaseErrorHandler.getSuggestedAction(errorInfo.code);
  const actionButton = getSuggestedActionButton(suggestedAction);
  
  return (
    <Alert
      message="เกิดข้อผิดพลาด"
      description={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Paragraph style={{ margin: 0, fontSize: '14px' }}>
            {errorInfo.message}
          </Paragraph>
          
          {actionButton && (
            <div style={{ marginTop: '8px' }}>
              {actionButton}
            </div>
          )}
          
          {showDetails && (
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <strong>รหัสข้อผิดพลาด:</strong> {errorInfo.code}
                <br />
                <strong>ข้อความเดิม:</strong> {errorInfo.originalMessage}
              </Text>
            </div>
          )}
        </Space>
      }
      type={getAlertType(errorInfo.severity)}
      showIcon
      icon={getIcon(errorInfo.severity)}
      style={{
        borderRadius: '8px',
        ...style
      }}
    />
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.instanceOf(Error)
  ]),
  onRetry: PropTypes.func,
  onReauth: PropTypes.func,
  onContactAdmin: PropTypes.func,
  showDetails: PropTypes.bool,
  style: PropTypes.object
};

export default ErrorDisplay; 