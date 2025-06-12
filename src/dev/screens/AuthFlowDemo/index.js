import React, { useState } from 'react';
import { Button, Space, Card, Typography, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

const { Title, Text } = Typography;

const AuthFlowDemo = () => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const [demoStage, setDemoStage] = useState('idle');

  // Mock auth actions to test EventEmitter
  const simulateSignIn = () => {
    // Mock LOGIN_REQUEST
    dispatch({ type: 'LOGIN_REQUEST' });
    
    setTimeout(() => {
      // Mock successful auth after delay
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        user: { 
          uid: 'demo-user',
          email: 'demo@kbn.com'
        }
      });
      
      // Simulate profile loading delay
      setTimeout(() => {
        dispatch({
          type: 'USER_UPDATE',
          user: {
            uid: 'demo-user',
            email: 'demo@kbn.com',
            displayName: 'Demo User',
            branchCode: '0450',
            province: 'นครราชสีมา'
          }
        });
      }, 1000);
    }, 2000);
  };

  const simulateSignInError = () => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    setTimeout(() => {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      });
    }, 1500);
  };

  const simulateSignUp = () => {
    dispatch({ type: 'SIGNUP_REQUEST' });
    
    setTimeout(() => {
      dispatch({
        type: 'REGISTRATION_PENDING',
        userData: {
          email: 'newuser@kbn.com',
          displayName: 'New User',
          status: 'pending_approval'
        }
      });
    }, 2000);
  };

  const clearAuthState = () => {
    dispatch({ type: 'LOGOUT_SUCCESS' });
    dispatch({ type: 'CLEAR_REGISTRATION_PENDING' });
  };

  const simulateVerification = () => {
    dispatch({ type: 'VERIFY_REQUEST' });
    
    setTimeout(() => {
      dispatch({ type: 'VERIFY_SUCCESS' });
    }, 1500);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🎭 Enhanced EventEmitter - Auth Flow Demo</Title>
      
      <Text type="secondary">
        ทดสอบ Enhanced EventEmitter ที่ปรับปรุงแล้วสำหรับจัดการ UX ระหว่างการเข้าสู่ระบบ
      </Text>

      <Divider />

      <Card title="🔍 Current Auth State" style={{ marginBottom: '24px' }}>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {JSON.stringify(authState, null, 2)}
        </pre>
      </Card>

      <Card title="🎬 Demo Actions">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          
          <div>
            <Title level={4}>✅ Successful Sign In Flow</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              จำลองการเข้าสู่ระบบสำเร็จ: กำลังเข้าสู่ระบบ → โหลดโปรไฟล์ → เตรียมระบบ → สำเร็จ
            </Text>
            <Button 
              type="primary" 
              onClick={simulateSignIn}
              loading={authState.isLoggingIn}
            >
              จำลองการเข้าสู่ระบบสำเร็จ
            </Button>
          </div>

          <div>
            <Title level={4}>❌ Failed Sign In</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              จำลองการเข้าสู่ระบบล้มเหลว: กำลังเข้าสู่ระบบ → ข้อผิดพลาด
            </Text>
            <Button 
              danger 
              onClick={simulateSignInError}
              loading={authState.isLoggingIn}
            >
              จำลองการเข้าสู่ระบบล้มเหลว
            </Button>
          </div>

          <div>
            <Title level={4}>📝 Registration Flow</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              จำลองการลงทะเบียน: กำลังลงทะเบียน → รอการอนุมัติ
            </Text>
            <Button 
              type="default" 
              onClick={simulateSignUp}
              loading={authState.isLoggingIn}
            >
              จำลองการลงทะเบียน
            </Button>
          </div>

          <div>
            <Title level={4}>🔍 Verification Flow</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              จำลองการตรวจสอบข้อมูล
            </Text>
            <Button 
              type="default" 
              onClick={simulateVerification}
              loading={authState.isVerifying}
            >
              จำลองการตรวจสอบ
            </Button>
          </div>

          <Divider />

          <div>
            <Title level={4}>🧹 Reset State</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              เคลียร์สถานะการเข้าสู่ระบบเพื่อทดสอบใหม่
            </Text>
            <Button onClick={clearAuthState}>
              เคลียร์สถานะ
            </Button>
          </div>

        </Space>
      </Card>

      <Card title="📋 Enhanced Features" style={{ marginTop: '24px' }}>
        <ul>
          <li>🎯 <strong>Smart Stage Detection</strong> - ตรวจจับสถานะการเข้าสู่ระบบอัตโนมัติ</li>
          <li>🎨 <strong>Beautiful Loading Overlays</strong> - หน้าจอโหลดที่สวยงามและชัดเจน</li>
          <li>⚡ <strong>Smooth Transitions</strong> - การเปลี่ยนหน้าจออย่างนุ่มนวล</li>
          <li>🌐 <strong>Thai Language Support</strong> - ข้อความภาษาไทยที่เหมาะสม</li>
          <li>🔔 <strong>Smart Notifications</strong> - การแจ้งเตือนที่เหมาะสมกับแต่ละสถานการณ์</li>
          <li>🛡️ <strong>Error Handling</strong> - จัดการข้อผิดพลาดอย่างสง่างาม</li>
        </ul>
      </Card>

      <Card title="💡 Usage Instructions" style={{ marginTop: '24px' }}>
        <Text>
          Enhanced EventEmitter จะทำงานอัตโนมัติเมื่อมีการเปลี่ยนแปลงสถานะการเข้าสู่ระบบ:
        </Text>
        <ol style={{ marginTop: '12px' }}>
          <li>ไม่ต้องเรียกใช้ manual - ทำงานผ่าน Redux state</li>
          <li>ปรับแต่งข้อความได้ตามแต่ละขั้นตอน</li>
          <li>รองรับหลายสถานการณ์: เข้าสู่ระบบ, ลงทะเบียน, ตรวจสอบ</li>
          <li>แสดงผลข้อผิดพลาดและความสำเร็จอย่างเหมาะสม</li>
        </ol>
      </Card>
    </div>
  );
};

export default AuthFlowDemo; 