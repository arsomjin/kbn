import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Alert, Space, Checkbox } from 'antd';
import { LockOutlined, MailOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const NatureLogin = ({ handleConfirm, change }) => {
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const { loginError, isLoggingIn } = useSelector(state => state.auth);

  // Handle login error with user-friendly messages
  useEffect(() => {
    if (loginError) {
      // loginError from Redux is already an interpreted message string
      // Set the error directly without any re-interpretation
      const errorInfo = {
        message: loginError,
        code: 'login-error',
        severity: 'error'
      };
      
      // Set error directly without calling handleError to avoid re-interpretation
      setError(errorInfo);
    } else {
      setError(null);
    }
  }, [loginError]);

  // Cleanup on unmount to prevent React state update warnings
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      // Only cleanup if component is actually unmounting
      setError(null);
    };
  }, []);

  const handleFinish = (values) => {
    setError(null); // Clear any previous errors
    const loginData = {
      ...values,
      rememberMe
    };
    handleConfirm(loginData);
  };

  return (
    <div>
      {/* Logo and Title Section */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img
          className="nature-login-logo"
          src={require('../../images/logo192.png')}
          alt="KBN"
          style={{
            width: '88px',
            height: '88px',
            marginBottom: '16px'
          }}
        />
        <h1 className="nature-login-title">เข้าสู่ระบบ</h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '500'
        }}>
          คูโบต้า เบญจพล
        </p>
      </div>

      {/* Login Form */}
      <Form
        form={form}
        name="nature-login"
        onFinish={handleFinish}
        size="large"
        layout="vertical"
        className="nature-login-form"
      >
        {/* Email Field */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="อีเมล"
            autoComplete="email"
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="รหัสผ่าน"
            autoComplete="current-password"
          />
        </Form.Item>

        {/* Remember Me and Forgot Password */}
        <Form.Item>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            {/* <Checkbox 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              >
              จดจำการเข้าสู่ระบบ
              </Checkbox> */}
              <div />
            <Button 
              type="link"
              onClick={() => change('ForgetPassword')}
              className="nature-login-link"
              style={{ padding: '0', height: 'auto' }}
            >
              ลืมรหัสผ่าน?
            </Button>
          </div>
        </Form.Item>

        {/* Error Display */}
        {error && (
          <Form.Item>
            <Alert
              message={error.message}
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              className="nature-login-error"
              style={{ marginBottom: '24px' }}
            />
          </Form.Item>
        )}

        {/* Login Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoggingIn}
            block
            className="nature-login-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </Form.Item>

        {/* Sign Up Link */}
        <Form.Item style={{ textAlign: 'center', marginBottom: '0' }}>
          <Space 
            direction="vertical" 
            size="small"
            style={{ width: '100%' }}
          >
            <div style={{ 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent 0%, rgba(45, 80, 22, 0.2) 50%, transparent 100%)',
              margin: '16px 0'
            }} />
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px',
              margin: '0'
            }}>
              ยังไม่มีบัญชี?{' '}
              <Button 
                type="link"
                onClick={() => change('SignUp')}
                className="nature-login-link"
                style={{ 
                  padding: '0', 
                  height: 'auto',
                  fontSize: '16px'
                }}
              >
                สมัครสมาชิก
              </Button>
            </p>
          </Space>
        </Form.Item>
      </Form>

      {/* Footer */}
      <div className="nature-login-footer">
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '12px' }}>
          <p>© {new Date().getFullYear()} KBN</p>
        </div>
      </div>
    </div>
  );
};

NatureLogin.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

export default NatureLogin; 