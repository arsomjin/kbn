import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spin, Modal, message } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

import {
  // MessageBar,
  // Snackbar,
  ActionSheet,
  MessageBar,
  AlertDialog,
  Loader,
  Progressor,
  // Updater,
  // DialogSheet,
  Success,
  // PinCode,
  NoWifi,
  NetworkStatusIndicator,
  Printer
} from '../elements';

// Enhanced Loading Overlay Component for Auth Flow
const AuthFlowOverlay = ({ isVisible, stage, message: loadingMessage, error }) => {
  const [localVisible, setLocalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setLocalVisible(true);
    } else {
      // Smooth fade out
      const timer = setTimeout(() => setLocalVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!localVisible) return null;

  const getStageConfig = () => {
    switch (stage) {
      case 'signing-in':
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />,
          title: 'กำลังเข้าสู่ระบบ...',
          description: 'กรุณารอสักครู่ เรากำลังตรวจสอบข้อมูลของคุณ'
        };
      case 'verifying':
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: '#52c41a' }} spin />,
          title: 'กำลังตรวจสอบข้อมูล...',
          description: 'ตรวจสอบสิทธิ์การเข้าถึงและข้อมูลผู้ใช้'
        };
      case 'loading-profile':
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: '#722ed1' }} spin />,
          title: 'กำลังโหลดข้อมูลโปรไฟล์...',
          description: 'เตรียมข้อมูลและการตั้งค่าสำหรับคุณ'
        };
      case 'setting-up':
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: '#fa8c16' }} spin />,
          title: 'กำลังเตรียมระบบ...',
          description: 'ตั้งค่าสิทธิ์การเข้าถึงและข้อมูลส่วนบุคคล'
        };
      case 'success':
        return {
          icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
          title: 'เข้าสู่ระบบสำเร็จ!',
          description: 'ยินดีต้อนรับเข้าสู่ระบบ KBN'
        };
      case 'error':
        return {
          icon: <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />,
          title: 'เกิดข้อผิดพลาด',
          description: error || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง'
        };
      default:
        return {
          icon: <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />,
          title: 'กำลังดำเนินการ...',
          description: loadingMessage || 'กรุณารอสักครู่'
        };
    }
  };

  const config = getStageConfig();

  return (
    <Modal
      open={isVisible}
      centered
      closable={false}
      footer={null}
      maskClosable={false}
      width={400}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      style={{
        background: 'transparent'
      }}
      bodyStyle={{
        padding: '40px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        {config.icon}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
        {config.title}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.6 }}>
        {config.description}
      </div>
      {stage === 'signing-in' && (
        <div style={{ marginTop: '20px' }}>
          <Spin size="small" />
          <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
            กำลังตรวจสอบ...
          </span>
        </div>
      )}
    </Modal>
  );
};

// PropTypes for AuthFlowOverlay
AuthFlowOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  stage: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.string
};

// Smart Auth Stage Detector
const useAuthStageDetection = (authState) => {
  const [currentStage, setCurrentStage] = useState(null);
  const [stageMessage, setStageMessage] = useState('');

  useEffect(() => {
    const { 
      isLoggingIn, 
      isVerifying, 
      isAuthenticated, 
      loginError, 
      signUpError,
      user,
      registrationPending 
    } = authState;

    // Determine current authentication stage
    if (loginError || signUpError) {
      setCurrentStage('error');
      setStageMessage(loginError || signUpError);
    } else if (registrationPending) {
      setCurrentStage('verifying');
      setStageMessage('ตรวจสอบสถานะการลงทะเบียน');
    } else if (isLoggingIn && !isAuthenticated) {
      setCurrentStage('signing-in');
      setStageMessage('กำลังเข้าสู่ระบบ');
    } else if (isVerifying) {
      setCurrentStage('verifying');
      setStageMessage('ตรวจสอบข้อมูลผู้ใช้');
    } else if (isAuthenticated && user && Object.keys(user).length > 0 && !user.displayName) {
      setCurrentStage('loading-profile');
      setStageMessage('โหลดข้อมูลโปรไฟล์');
    } else if (isAuthenticated && user && Object.keys(user).length > 0 && user.displayName && !user.branchCode) {
      setCurrentStage('setting-up');
      setStageMessage('เตรียมข้อมูลระบบ');
    } else if (isAuthenticated && user && user.displayName) {
      // Success state - show briefly then hide
      setCurrentStage('success');
      setStageMessage('เข้าสู่ระบบสำเร็จ');
      setTimeout(() => setCurrentStage(null), 1500);
    } else {
      setCurrentStage(null);
      setStageMessage('');
    }
  }, [authState]);

  return { currentStage, stageMessage };
};

const EventEmitter = () => {
  const { networkStatus } = useSelector(state => state.global);
  const authState = useSelector(state => state.auth);
  const { currentStage, stageMessage } = useAuthStageDetection(authState);

  // Show auth overlay when there's an active auth stage
  const showAuthOverlay = currentStage !== null;

  // Handle success message display
  useEffect(() => {
    if (currentStage === 'success') {
      message.success({
        content: 'เข้าสู่ระบบสำเร็จ!',
        duration: 2,
        style: {
          marginTop: '20vh'
        }
      });
    }
  }, [currentStage]);

  // Handle error message display
  useEffect(() => {
    if (currentStage === 'error' && (authState.loginError || authState.signUpError)) {
      message.error({
        content: authState.loginError || authState.signUpError,
        duration: 4,
        style: {
          marginTop: '20vh'
        }
      });
    }
  }, [currentStage, authState.loginError, authState.signUpError]);

  return (
    <Fragment>
      {/* Enhanced Auth Flow Overlay */}
      <AuthFlowOverlay
        isVisible={showAuthOverlay}
        stage={currentStage}
        message={stageMessage}
        error={authState.loginError || authState.signUpError}
      />

      {/* Original EventEmitter Components */}
      <Printer />
      <ActionSheet />
      <Loader />
      <Progressor />
      <MessageBar />
      <AlertDialog />
      <Success />
      {/* <DialogSheet />
      <Updater />
      <Snackbar style={styles.snack} />
      <MessageBar />*/}
      
      {/* Enhanced Network Status Component */}
      {networkStatus.enabled && (
        <NetworkStatusIndicator
          detailedStatus={networkStatus.detailedStatus}
          showRetryButton={networkStatus.showRetryButton}
          autoRetry={networkStatus.autoRetry}
          enableQualityCheck={networkStatus.enableQualityCheck}
          showWhenOnline={networkStatus.showWhenOnline}
          retryInterval={networkStatus.retryInterval}
        />
      )}
      
      {/* Fallback to original component if enhanced is disabled */}
      {!networkStatus.enabled && <NoWifi />}
    </Fragment>
  );
};

export default EventEmitter;
