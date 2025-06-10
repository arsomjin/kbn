import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const ForgetPassword = ({ handleConfirm, change }) => {
  const [form] = Form.useForm();
  const { resetPasswordError, isLoggingIn } = useSelector(state => state.auth);
  const [resetted, setResetted] = useState(null);
  const [error, setError] = useState(null);

  // Handle reset password error with user-friendly messages
  useEffect(() => {
    if (resetPasswordError) {
      // resetPasswordError from Redux is already an interpreted message string
      // Set the error directly without any re-interpretation
      const errorInfo = {
        message: resetPasswordError,
        code: 'reset-password-error',
        severity: 'error'
      };
      
      // Set error directly without calling handleError to avoid re-interpretation
      setError(errorInfo);
    } else {
      setError(null);
    }
  }, [resetPasswordError]);

  // Cleanup on unmount to prevent React state update warnings
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setError(null);
    };
  }, []);

  const handleFinish = (values) => {
    setError(null); // Clear any previous errors
    handleConfirm(values);
    setResetted(values.email);
  };

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => change('Login')}
          className="nature-login-link"
          style={{
            color: '#2d5016',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '12px',
            background: 'rgba(45, 80, 22, 0.1)',
            border: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          กลับ
        </Button>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="nature-login-title" style={{ fontSize: '28px' }}>ลืมรหัสผ่าน</h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '16px',
          margin: '16px 0 0 0',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          ระบบจะส่งลิงค์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ
        </p>
      </div>

      {/* Success Message */}
      {resetted && !resetPasswordError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message={
              <span>
                <CheckCircleOutlined style={{ marginRight: '8px', color: '#22c55e' }} />
                ส่งลิงค์เรียบร้อยแล้ว
              </span>
            }
            description={
              <div style={{ marginTop: '8px' }}>
                <p style={{ margin: '0 0 12px 0', color: '#374151' }}>
                  เราได้ส่งลิงค์การรีเซ็ตรหัสผ่านไปที่อีเมล{' '}
                  <strong style={{ color: '#2d5016' }}>{resetted}</strong> แล้ว
                </p>
                <div style={{ 
                  background: 'rgba(240, 253, 244, 0.8)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)', 
                  borderRadius: '12px', 
                  padding: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#166534',
                    margin: '0',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}>
                    <span role="img" aria-label="Email icon">📧</span> กรุณาตรวจสอบอีเมลของคุณ (รวมทั้งโฟลเดอร์สแปม) และคลิกที่ลิงค์เพื่อรีเซ็ตรหัสผ่าน
                  </p>
                </div>
              </div>
            }
            type="success"
            showIcon={false}
            className="nature-login-success"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error.message}
            type="error"
            showIcon
            className="nature-login-error"
          />
        </div>
      )}

      {/* Form */}
      <Form
        form={form}
        name="forgetPassword"
        onFinish={handleFinish}
        size="large"
        layout="vertical"
        className="nature-login-form"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="อีเมลของคุณ"
            autoComplete="email"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ marginBottom: '32px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoggingIn}
            block
            className="nature-login-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'กำลังส่งลิงค์...' : 'ส่งลิงค์รีเซ็ตรหัสผ่าน'}
          </Button>
        </Form.Item>
      </Form>

      {/* Navigation Links */}
      <div style={{ 
        textAlign: 'center', 
        padding: '24px 0 16px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            จำรหัสผ่านได้แล้ว?{' '}
            <Button
              type="link"
              onClick={() => change('Login')}
              className="nature-login-link"
              style={{
                padding: '0',
                fontSize: '14px',
                height: 'auto'
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </span>
        </div>
        
        <div>
          <span style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            ยังไม่มีบัญชี?{' '}
            <Button
              type="link"
              onClick={() => change('SignUp')}
              className="nature-login-link"
              style={{
                padding: '0',
                fontSize: '14px',
                height: 'auto'
              }}
            >
              สมัครสมาชิก
            </Button>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="nature-login-footer">
        <p>© {new Date().getFullYear()} KBN</p>
      </div>
    </div>
  );
};

ForgetPassword.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired
};

export default ForgetPassword;
