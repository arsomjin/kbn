import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import ScreenWithManual from '../components/ScreenWithManual';

const { Title, Paragraph } = Typography;

/**
 * Example: How to add Digital User Manual to any screen
 *
 * SUPER EASY TO USE:
 * 1. Wrap your screen with <ScreenWithManual>
 * 2. Set screenType prop
 * 3. Done! Manual appears automatically
 */

// Example 1: Signup Screen with Manual
const SignupScreenExample = () => {
  return (
    <ScreenWithManual screenType='signup' showManualOnFirstVisit={false}>
      {/* Your original signup form here */}
      <Card style={{ maxWidth: 400, margin: '50px auto' }}>
        <Title level={3}>สมัครสมาชิก</Title>
        <Paragraph>ฟอร์มสมัครสมาชิกของคุณ...</Paragraph>
        {/* Manual will appear as floating button automatically */}
      </Card>
    </ScreenWithManual>
  );
};

// Example 2: Sales Screen with Manual
const SalesScreenExample = () => {
  return (
    <ScreenWithManual screenType='sales'>
      <div style={{ padding: 24 }}>
        <Title level={2}>🚗 ระบบขายรถ</Title>
        <Space direction='vertical' size='large'>
          <Button type='primary'>เพิ่มลูกค้าใหม่</Button>
          <Button>ค้นหาลูกค้า</Button>
          <Button>ดูใบจอง</Button>
        </Space>
        {/* Manual explains how to use sales system */}
      </div>
    </ScreenWithManual>
  );
};

// Example 3: Service Screen with Manual
const ServiceScreenExample = () => {
  return (
    <ScreenWithManual screenType='service'>
      <div style={{ padding: 24 }}>
        <Title level={2}>🔧 ระบบบริการ</Title>
        <Space direction='vertical' size='large'>
          <Button type='primary'>รับงานซ่อมใหม่</Button>
          <Button>ดูงานที่รอ</Button>
          <Button>ติดตามงาน</Button>
        </Space>
        {/* Manual explains service workflow */}
      </div>
    </ScreenWithManual>
  );
};

// Example 4: Any existing screen - just wrap it!
const ExistingScreenExample = ({ children }) => {
  return (
    <ScreenWithManual screenType='dashboard'>
      {/* Your existing screen content - NO CHANGES NEEDED! */}
      {children}
    </ScreenWithManual>
  );
};

/**
 * HOW TO USE IN YOUR SCREENS:
 *
 * 1. WRAP YOUR SCREEN:
 *    <ScreenWithManual screenType="signup">
 *      <YourExistingComponent />
 *    </ScreenWithManual>
 *
 * 2. AVAILABLE SCREEN TYPES:
 *    - "signup" - Registration process
 *    - "login" - Login process
 *    - "dashboard" - Main dashboard
 *    - "sales" - Sales module
 *    - "service" - Service module
 *    - "parts" - Parts/inventory
 *    - "accounting" - Accounting module
 *    - "userManagement" - User management
 *
 * 3. FEATURES:
 *    - Floating help button (green ? icon)
 *    - Auto-show on first visit
 *    - Step-by-step instructions
 *    - Easy Thai language
 *    - No technical terms
 *    - Remember user preferences
 *
 * 4. CUSTOMIZATION:
 *    - showManualOnFirstVisit={true/false}
 *    - Different content per screen type
 *    - Automatic positioning
 */

export {
  SignupScreenExample,
  SalesScreenExample,
  ServiceScreenExample,
  ExistingScreenExample,
};
