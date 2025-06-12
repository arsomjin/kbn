import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Alert, Button, Card, Steps, Typography, Space, Divider } from 'antd';
import { logoutUser } from 'redux/actions/auth';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import welcomeImage from '../../images/welcome.png';
import { 
  getProvinceName, 
  getBranchName, 
  getDepartmentName, 
  getUserTypeName,
  getApprovalLevelName,
  getContactInfo,
  getAdditionalPhoneNumbers
} from '../../utils/mappings';
import SelfApprovalButton from './components/SelfApprovalButton';

const { Title, Text, Paragraph } = Typography;

const ApprovalStatus = ({ userData, user, onBackToLogin }) => {
  const dispatch = useDispatch();
  
  // Use user prop if available, otherwise fallback to userData
  const currentUser = user || userData;
  const userType = getUserTypeName(currentUser?.userType || 'new');
  
  // DEBUG: Add detailed logging to understand RBAC structure
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && currentUser) {
      console.log('🔍 ApprovalStatus Debug - User Data:', {
        uid: currentUser.uid,
        email: currentUser.email,
        userType: currentUser.userType,
        access: currentUser.access,
        userRBAC: currentUser.userRBAC,
        homeProvince: currentUser.homeProvince,
        homeBranch: currentUser.homeBranch,
        approvalLevel: currentUser.approvalLevel,
        isActive: currentUser.isActive,
        isPendingApproval: currentUser.isPendingApproval
      });
    }
  }, [currentUser]);
  
  // Read from Clean Slate RBAC structure with legacy fallbacks
  const department = getDepartmentName(
    currentUser?.access?.departments?.[0] || 
    currentUser?.userRBAC?.departments?.[0] ||
    currentUser?.department || 
    'ไม่ระบุ'
  );
  const province = getProvinceName(
    currentUser?.access?.geographic?.homeProvince ||
    currentUser?.access?.geographic?.allowedProvinces?.[0] || 
    currentUser?.userRBAC?.geographic?.homeProvince ||
    currentUser?.homeProvince || 
    'นครสวรรค์'  // Default to Nakhon Sawan for new system
  );
  const branch = getBranchName(
    currentUser?.access?.geographic?.homeBranch ||
    currentUser?.access?.geographic?.allowedBranches?.[0] ||
    currentUser?.userRBAC?.geographic?.homeBranch ||
    currentUser?.homeBranch || 
    'ไม่ระบุ'
  );
  
  // Determine approval level from Clean Slate RBAC structure
  const approvalLevel = currentUser?.approvalLevel || 
    (currentUser?.access?.authority === 'ADMIN' ? 'super_admin' :
     currentUser?.access?.authority === 'MANAGER' ? 'province_manager' :
     currentUser?.access?.authority === 'LEAD' ? 'branch_manager' :
     currentUser?.userRBAC?.authority === 'ADMIN' ? 'super_admin' :
     currentUser?.userRBAC?.authority === 'MANAGER' ? 'province_manager' :
     currentUser?.userRBAC?.authority === 'LEAD' ? 'branch_manager' :
     currentUser?.userType === 'existing' ? 'branch_manager' : 'province_manager');
  const approvalLevelName = getApprovalLevelName(approvalLevel);

  const handleLogout = () => {
    console.log('🔄 User manually logging out from approval status page');
    dispatch(logoutUser());
  };

  useEffect(() => {
    // Set up listener for approval events
    const handleUserApproved = (event) => {
      console.log('🎉 User approved event received!', event.detail);
      
      // Show a success message
      console.log('✅ You have been approved! Redirecting to dashboard...');
      
      // The auth verification should handle the redirect automatically
      // But we can also force a page reload if needed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // Listen for user approval events
    window.addEventListener('userApproved', handleUserApproved);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('userApproved', handleUserApproved);
    };
  }, []);

  const getApprovalSteps = () => {
    const isExisting = currentUser?.userType === 'existing';
    const steps = [
      {
        title: 'ส่งข้อมูลสำเร็จ',
        description: 'ระบบได้รับข้อมูลการสมัครของคุณแล้ว',
        status: 'finish',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      },
      {
        title: isExisting ? 'ตรวจสอบข้อมูลพนักงาน' : 'รอการตรวจสอบ',
        description: isExisting 
          ? 'ระบบกำลังตรวจสอบข้อมูลพนักงานในระบบ' 
          : 'ผู้ดูแลกำลังตรวจสอบข้อมูลของคุณ',
        status: 'process',
        icon: (
          <ClockCircleOutlined 
            style={{ 
              color: '#faad14',
              animation: 'pulse 2s infinite'
            }} 
          />
        )
      },
      {
        title: 'รอการอนุมัติ',
        description: `รอการอนุมัติจาก${approvalLevelName}`,
        status: 'wait',
        icon: <UserOutlined style={{ color: '#d9d9d9' }} />
      },
      {
        title: 'เสร็จสิ้น',
        description: 'สามารถเข้าใช้งานระบบได้',
        status: 'wait',
        icon: <CheckCircleOutlined style={{ color: '#d9d9d9' }} />
      }
    ];
    return steps;
  };

  const getContactInfoData = () => {
    return getContactInfo(
      approvalLevel, 
      currentUser?.access?.geographic?.homeProvince || 
      currentUser?.userRBAC?.geographic?.homeProvince || 
      currentUser?.homeProvince || 'ไม่ระบุ', 
      currentUser?.access?.geographic?.homeBranch || 
      currentUser?.userRBAC?.geographic?.homeBranch || 
      currentUser?.homeBranch || 'ไม่ระบุ'
    );
  };

  const contactInfo = getContactInfoData();

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}
      </style>
      <div className="nature-login-page">
        {/* Nature-inspired background with tractor image */}
        <div 
          className="nature-login-background" 
          style={{
            backgroundImage: `url(${welcomeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.25
          }}
        />
        {/* Glassmorphism overlay */}
        <div className="nature-glassmorphism-overlay"></div>
      
      {/* Main content container */}
      <div className="nature-login-container">
        <div className="nature-auth-card">
          {/* Header with KBN branding */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img
              className="nature-login-logo"
              src={require('../../images/logo192.png')}
              alt="KBN"
              style={{
                width: '72px',
                height: '72px',
                marginBottom: '16px'
              }}
            />
            <Title level={2} className="nature-login-title" style={{ margin: '0 0 8px 0' }}>
              รอการอนุมัติ
            </Title>
            <Text style={{ 
              fontSize: '16px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              คูโบต้า เบญจพล
            </Text>
            <Text style={{ 
              fontSize: '14px', 
              color: '#9ca3af',
              display: 'block',
              marginTop: '8px'
            }}>
              การสมัครสมาชิกของคุณอยู่ระหว่างการพิจารณา
            </Text>
          </div>

          {/* Registration Info */}
          <Card 
            style={{ 
              marginBottom: '24px', 
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(26, 78, 44, 0.1)'
            }}
          >
            <Title level={4} style={{ margin: '0 0 16px 0', color: '#2d5016' }}>
              ข้อมูลการสมัคร
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>ประเภทการสมัคร:</Text>
                <Text>{userType}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>แผนก:</Text>
                <Text>{department}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>จังหวัด:</Text>
                <Text>{province}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>สาขา:</Text>
                <Text>{branch}</Text>
              </div>
            </Space>
          </Card>

          {/* Progress Steps */}
          <Card 
            style={{ 
              marginBottom: '24px', 
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(26, 78, 44, 0.1)'
            }}
          >
            <Title level={4} style={{ margin: '0 0 24px 0', color: '#2d5016' }}>
              สถานะการดำเนินการ
            </Title>
            <Steps
              direction="vertical"
              size="small"
              current={1}
              items={getApprovalSteps()}
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                padding: '16px'
              }}
            />
          </Card>

          {/* Information Alert */}
          <Alert
            message={currentUser?.userType === 'existing' ? 'สำหรับพนักงานเดิม' : 'สำหรับพนักงานใหม่'}
            description={
              <div>
                <Paragraph style={{ margin: '8px 0 16px 0' }}>
                  {currentUser?.userType === 'existing' 
                    ? 'ระบบจะตรวจสอบข้อมูลของคุณกับฐานข้อมูลพนักงาน หากข้อมูลถูกต้องจะได้รับการอนุมัติโดยอัตโนมัติ'
                    : 'การสมัครสำหรับพนักงานใหม่จะต้องผ่านการตรวจสอบและอนุมัติจากผู้จัดการ'
                  }
                </Paragraph>
                
                <div style={{ 
                  background: 'rgba(250, 173, 20, 0.1)', 
                  border: '1px solid rgba(250, 173, 20, 0.3)', 
                  borderRadius: '8px', 
                  padding: '12px',
                  marginTop: '12px'
                }}>
                  <Text style={{ 
                    fontSize: '13px', 
                    color: '#d48806',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    <ExclamationCircleOutlined style={{ marginRight: '6px' }} />
                    ระยะเวลาการอนุมัติ:
                  </Text>
                  <ul style={{ 
                    margin: '0', 
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: '#d48806'
                  }}>
                    <li>พนักงานเดิม: 1-2 ชั่วโมง</li>
                    <li>พนักงานใหม่: 1-3 วันทำการ</li>
                  </ul>
                </div>
              </div>
            }
            type="info"
            showIcon
            style={{ 
              marginBottom: '24px',
              background: 'rgba(24, 144, 255, 0.05)',
              border: '1px solid rgba(24, 144, 255, 0.2)',
              borderRadius: '12px'
            }}
          />

          {/* Contact Information */}
          <Card 
            style={{ 
              marginBottom: '24px', 
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(26, 78, 44, 0.1)'
            }}
          >
            <Title level={4} style={{ margin: '0 0 16px 0', color: '#2d5016' }}>
              {contactInfo.title}
            </Title>
            <Paragraph style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              {contactInfo.description}
            </Paragraph>
            
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {(() => {
                const phoneNumbers = getAdditionalPhoneNumbers(currentUser?.homeProvince || 'ไม่ระบุ');
                return phoneNumbers.map((phone, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>โทรศัพท์{phoneNumbers.length > 1 ? ` ${index + 1}` : ''}: {phone}</Text>
                  </div>
                ));
              })()}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                <Text>อีเมล: {contactInfo.email}</Text>
              </div>
            </Space>
          </Card>

          {/* Actions */}
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                className="nature-login-button"
                style={{ 
                  borderRadius: '12px',
                  height: '48px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: '600'
                }}
              >
                รีเฟรชสถานะ
              </Button>
              
              <Button
                size="large"
                icon={<LogoutOutlined />}
                onClick={onBackToLogin || handleLogout}
                style={{ 
                  borderRadius: '12px',
                  height: '48px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(45, 80, 22, 0.2)',
                  color: '#2d5016'
                }}
              >
                ออกจากระบบ
              </Button>
            </Space>
            
            <Divider style={{ 
              borderColor: 'rgba(45, 80, 22, 0.2)',
              margin: '24px 0'
            }} />
            
            <Text style={{ 
              fontSize: '12px', 
              color: '#9ca3af',
              display: 'block',
              marginTop: '8px'
            }}>
              คุณจะได้รับอีเมลแจ้งเตือนเมื่อบัญชีของคุณได้รับการอนุมัติแล้ว
            </Text>
            
            {/* Self-Approval Button for Development */}
            <SelfApprovalButton />
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

ApprovalStatus.propTypes = {
  userData: PropTypes.shape({
    userType: PropTypes.string,
    department: PropTypes.string,
    homeProvince: PropTypes.string,
    homeBranch: PropTypes.string,
    approvalLevel: PropTypes.string
  }),
  user: PropTypes.shape({
    userType: PropTypes.string,
    department: PropTypes.string,
    homeProvince: PropTypes.string,
    homeBranch: PropTypes.string,
    approvalLevel: PropTypes.string,
    isPendingApproval: PropTypes.bool,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string
  }),
  onBackToLogin: PropTypes.func
};

ApprovalStatus.defaultProps = {
  userData: {},
  user: null,
  onBackToLogin: null
};

export default ApprovalStatus; 