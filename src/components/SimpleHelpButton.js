import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Tooltip,
  Drawer,
  Typography,
  Steps,
  Space,
  Tag,
  Divider,
} from 'antd';
import {
  QuestionCircleOutlined,
  BookOutlined,
  UserOutlined,
  FormOutlined,
  SafetyOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './SimpleHelpButton.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * Simple Help Button with Elegant Drawer
 */
const SimpleHelpButton = ({ screenType = 'general', autoShow = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Auto-show for first-time users
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem(`help-seen-${screenType}`);
    const isFirstTimeUser = !hasSeenHelp;

    setIsFirstTime(isFirstTimeUser);

    if (autoShow && isFirstTimeUser) {
      setDrawerVisible(true);
    }
  }, [screenType, autoShow]);

  const handleClose = () => {
    setDrawerVisible(false);
    localStorage.setItem(`help-seen-${screenType}`, 'true');
    setIsFirstTime(false);
  };

  // Get help content based on screen type
  const getHelpContent = () => {
    switch (screenType) {
      case 'signup':
        return {
          title: '📝 วิธีสมัครสมาชิก',
          subtitle: 'ขั้นตอนง่ายๆ ในการเข้าร่วม KBN',
          steps: [
            {
              title: 'เลือกประเภทผู้ใช้',
              description: 'เลือกว่าคุณเป็นพนักงานใหม่ หรือพนักงานเดิม',
              icon: <UserOutlined />,
              details: [
                '🟢 พนักงานใหม่: สำหรับคนที่ยังไม่เคยใช้ระบบ KBN',
                '⚫ พนักงานเดิม: สำหรับคนที่เคยใช้ระบบแล้ว',
              ],
            },
            {
              title: 'กรอกข้อมูลส่วนตัว',
              description: 'ใส่ชื่อ-นามสกุล อีเมล และรหัสผ่าน',
              icon: <FormOutlined />,
              details: [
                '🟢 ใช้อีเมลที่เช็คได้ทุกวัน',
                '🔐 รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร',
                '👤 ใส่ชื่อจริงตามบัตรประชาชน',
              ],
            },
            {
              title: 'เลือกสาขาและแผนก',
              description: 'บอกระบบว่าคุณทำงานที่สาขาไหน แผนกอะไร',
              icon: <HomeOutlined />,
              details: [
                '🏢 เลือกจังหวัดที่ทำงาน',
                '🏪 เลือกสาขาที่ทำงาน',
                '👥 เลือกแผนกที่สังกัด (ขาย, บริการ, บัญชี, ฯลฯ)',
              ],
            },
            {
              title: 'รอการอนุมัติ',
              description: 'หัวหน้าจะตรวจสอบและอนุมัติให้เข้าใช้ระบบ',
              icon: <CheckCircleOutlined />,
              details: [
                '⏳ รอประมาณ 1-2 วันทำการ',
                '📱 จะได้รับแจ้งเตือนทางอีเมลเมื่ออนุมัติแล้ว',
                '🎉 พอได้รับการอนุมัติ ก็เข้าใช้ระบบได้เลย!',
              ],
            },
          ],
        };

      case 'login':
        return {
          title: '🔐 วิธีเข้าสู่ระบบ',
          subtitle: 'เข้าใช้งาน KBN อย่างง่ายดาย',
          steps: [
            {
              title: 'ใส่อีเมลและรหัสผ่าน',
              description: 'ใช้ข้อมูลเดียวกับตอนสมัครสมาชิก',
              icon: <FormOutlined />,
              details: [
                '📧 ใส่อีเมลที่ใช้สมัครสมาชิก',
                '🔐 ใส่รหัสผ่านที่ตั้งไว้',
                '👁️ กดปุ่มตาเพื่อดูรหัสผ่านได้',
              ],
            },
            {
              title: 'กดเข้าสู่ระบบ',
              description: 'ระบบจะตรวจสอบและพาเข้าไปในระบบ',
              icon: <CheckCircleOutlined />,
              details: [
                '✅ ถ้าข้อมูลถูกต้อง จะเข้าระบบได้ทันที',
                '❌ ถ้าผิด ระบบจะแจ้งให้แก้ไข',
                '🔄 ลืมรหัสผ่าน? กดลิงก์ "ลืมรหัสผ่าน" ได้เลย',
              ],
            },
          ],
        };

      case 'forgot-password':
        return {
          title: '🔄 วิธีรีเซ็ตรหัสผ่าน',
          subtitle: 'กู้คืนการเข้าใช้งาน KBN',
          steps: [
            {
              title: 'ใส่อีเมลที่ลงทะเบียนไว้',
              description: 'ใส่อีเมลเดียวกับที่ใช้สมัครสมาชิก',
              icon: <MailOutlined />,
              details: [
                '📧 ใส่อีเมลที่เคยใช้สมัครสมาชิก',
                '✅ ตรวจสอบให้แน่ใจว่าสะกดถูกต้อง',
                '📱 เตรียมเช็คอีเมลหลังกดส่ง',
              ],
            },
            {
              title: 'เช็คอีเมลรีเซ็ตรหัสผ่าน',
              description: 'ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลของคุณ',
              icon: <CheckCircleOutlined />,
              details: [
                '📧 เช็คกล่องขาเข้าในอีเมล',
                '📁 ถ้าไม่เจอ ให้เช็คกล่อง Spam',
                '🔗 กดลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่',
              ],
            },
          ],
        };

      default:
        return {
          title: '📖 คู่มือการใช้งาน',
          subtitle: 'วิธีใช้งานระบบ KBN',
          steps: [
            {
              title: 'การใช้งานทั่วไป',
              description: 'หลักการใช้งานระบบ KBN',
              icon: <InfoCircleOutlined />,
              details: [
                '🖱️ กดปุ่มเพื่อทำงาน',
                '📝 กรอกข้อมูลในช่องที่กำหนด',
                '💾 กด "บันทึก" เมื่อเสร็จแล้ว',
              ],
            },
          ],
        };
    }
  };

  const helpContent = getHelpContent();

  return (
    <>
      {/* Elegant Floating Help Button */}
      <Tooltip title='คู่มือการใช้งาน' placement='left'>
        <Button
          type='primary'
          shape='circle'
          icon={<QuestionCircleOutlined />}
          onClick={() => setDrawerVisible(true)}
          className={`simple-help-button ${isFirstTime ? 'first-time' : ''}`}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 60,
            height: 60,
            backgroundColor: 'rgba(82, 196, 26, 0.7)',
            borderColor: 'rgba(82, 196, 26, 0.8)',
            color: 'white',
            fontSize: '22px',
            zIndex: 1010, // Fixed z-index to respect navigation hierarchy
            boxShadow: '0 4px 20px rgba(82, 196, 26, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(82, 196, 26, 0.95)';
            e.target.style.boxShadow = '0 8px 30px rgba(82, 196, 26, 0.6)';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(82, 196, 26, 0.7)';
            e.target.style.boxShadow = '0 4px 20px rgba(82, 196, 26, 0.3)';
            e.target.style.transform = 'scale(1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        />
      </Tooltip>

      {/* Elegant Drawer - Slides from Right - NO BLOCKING MASK */}
      <Drawer
        title={
          <Space>
            <BookOutlined style={{ color: '#52c41a' }} />
            <span>{helpContent.title}</span>
          </Space>
        }
        placement='right'
        width={window.innerWidth <= 768 ? '100vw' : 480}
        visible={drawerVisible}
        onClose={handleClose}
        extra={
          <Button type='primary' onClick={handleClose}>
            เข้าใจแล้ว
          </Button>
        }
        styles={{
          body: {
            padding: '24px',
            background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)',
          },
          header: {
            borderBottom: '1px solid #d9f7be',
            background: 'linear-gradient(135deg, #f6ffed 0%, #fff 50%)',
          },
        }}
        mask={false}
        maskClosable={false}
        keyboard={true}
        destroyOnClose={false}
        zIndex={1025}
        maskStyle={{
          backgroundColor: 'transparent',
          pointerEvents: 'none', // ✅ CRITICAL: This allows clicking through the mask!
        }}
        bodyStyle={{
          pointerEvents: 'auto', // ✅ But drawer content is still interactive
        }}
      >
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)',
            }}
          >
            <Text
              type='secondary'
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            >
              {helpContent.subtitle}
            </Text>
          </div>

          {/* Interactive Steps */}
          <Steps
            direction='vertical'
            current={currentStep}
            onChange={setCurrentStep}
            size='small'
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            {helpContent.steps.map((step, index) => (
              <Step
                key={index}
                title={
                  <Space>
                    {step.icon}
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                      {step.title}
                    </span>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 12 }}>
                    <Paragraph
                      style={{
                        marginBottom: 16,
                        fontSize: '14px',
                        color: '#595959',
                        lineHeight: '1.6',
                      }}
                    >
                      {step.description}
                    </Paragraph>

                    {/* Detailed Instructions */}
                    <Space
                      direction='vertical'
                      size='small'
                      style={{ width: '100%' }}
                    >
                      {step.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#fafafa',
                            borderRadius: '8px',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            border: '1px solid #f0f0f0',
                            transition: 'all 0.2s ease',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f6ffed';
                            e.target.style.borderColor = '#d9f7be';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fafafa';
                            e.target.style.borderColor = '#f0f0f0';
                          }}
                        >
                          {detail}
                        </div>
                      ))}
                    </Space>
                  </div>
                }
              />
            ))}
          </Steps>

          <Divider style={{ margin: '24px 0' }} />

          {/* Pro Tips Section */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f0f8ff',
              border: '1px solid #91d5ff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.1)',
            }}
          >
            <Space direction='vertical' size='medium' style={{ width: '100%' }}>
              <Text
                strong
                style={{
                  color: '#1890ff',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <InfoCircleOutlined /> เคล็ดลับการใช้งาน
              </Text>

              <Space
                direction='vertical'
                size='small'
                style={{ width: '100%' }}
              >
                <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  💡 <strong>ติดปัญหา?</strong> กดปุ่มช่วยเหลือ (?) ได้ทุกหน้า
                </Text>
                <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  📞 <strong>ต้องการความช่วยเหลือ?</strong> ติดต่อ IT Support
                </Text>
                <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  🎯 <strong>ใช้งานครั้งแรก?</strong> ลองทำตามขั้นตอนทีละขั้น
                </Text>
              </Space>
            </Space>
          </div>

          {/* Status Tags */}
          <div style={{ textAlign: 'center', paddingTop: '12px' }}>
            <Space wrap size='middle'>
              <Tag
                color='green'
                style={{ padding: '4px 12px', borderRadius: '20px' }}
              >
                ใช้ง่าย
              </Tag>
              <Tag
                color='blue'
                style={{ padding: '4px 12px', borderRadius: '20px' }}
              >
                ปลอดภัย
              </Tag>
              <Tag
                color='orange'
                style={{ padding: '4px 12px', borderRadius: '20px' }}
              >
                รวดเร็ว
              </Tag>
            </Space>
          </div>
        </Space>
      </Drawer>
    </>
  );
};

SimpleHelpButton.propTypes = {
  screenType: PropTypes.oneOf([
    'general',
    'signup',
    'login',
    'forgot-password',
  ]),
  autoShow: PropTypes.bool,
};

SimpleHelpButton.defaultProps = {
  screenType: 'general',
  autoShow: false,
};

export default SimpleHelpButton;
