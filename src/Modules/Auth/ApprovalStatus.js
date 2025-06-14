import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Alert, Card, Steps, Typography, Space, Divider, Modal, Row, Col } from 'antd';
import { logoutUser } from 'redux/actions/auth';
import CustomButton from '../../elements/Button';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  SendOutlined
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
import ReapplicationForm from './components/ReapplicationForm';

// Import glassmorphism styles for rejection screen
import '../../styles/glassmorphism-system.css';

// Import digital user manual
import ScreenWithManual from '../../components/ScreenWithManual';

const { Title, Text, Paragraph } = Typography;

const ApprovalStatus = ({ userData, user, onBackToLogin }) => {
  const dispatch = useDispatch();
  const [showReapplicationForm, setShowReapplicationForm] = useState(false);
  
  // Use user prop if available, otherwise fallback to userData
  const currentUser = user || userData;

  // Check if user is rejected - Show rejection screen immediately when status is rejected
  const isRejected = currentUser?.approvalStatus === 'rejected' && 
                   currentUser?.rejectedAt; // Must have been explicitly rejected (no time delay needed)
                   
                   
                   // Check if user is a resigned employee pending approval
                   const isResignedEmployee = currentUser?.isResignedEmployee === true || 
                   currentUser?.employeeStatus === 'ลาออก' ||
                   currentUser?.approvalStatus === 'resigned_pending';
                   
                   const userType = isResignedEmployee 
                     ? 'พนักงานเดิม (ลาออกแล้ว)' 
                     : getUserTypeName(currentUser?.userType || 'new');
                   
  // 🔧 DEBUG: Add detailed rejection detection logging
  if (process.env.NODE_ENV === 'development' && currentUser) {
    const rejectionDebug = {
      approvalStatus: currentUser?.approvalStatus,
      hasRejectedAt: !!currentUser?.rejectedAt,
      rejectedAt: currentUser?.rejectedAt,
      timeSinceRejection: currentUser?.rejectedAt ? Date.now() - currentUser.rejectedAt : 0,
      meetsTimeRequirement: true, // No time requirement anymore
      finalIsRejected: isRejected
    };
    
    console.log('🔍 ApprovalStatus - Rejection Detection:', rejectionDebug);
    
    if (currentUser?.approvalStatus === 'rejected' && !isRejected) {
      console.log('⚠️ User has rejected status but not showing rejection screen:', {
        reason: !currentUser?.rejectedAt ? 'Missing rejectedAt timestamp' : 
                'Unknown reason (time requirement removed)'
      });
    }
  }
  
  // Read from Clean Slate RBAC structure ONLY - no fallbacks
  const department = getDepartmentName(
    currentUser?.access?.departments?.[0] || 
    currentUser?.department || 
    'ไม่ระบุ'
  );
  const province = getProvinceName(
    currentUser?.access?.geographic?.homeProvince ||
    currentUser?.access?.geographic?.allowedProvinces?.[0] || 
    currentUser?.homeProvince || 
    'นครสวรรค์'  // Default to Nakhon Sawan for new system
  );
  const branch = getBranchName(
    currentUser?.access?.geographic?.homeBranch ||
    currentUser?.access?.geographic?.allowedBranches?.[0] ||
    currentUser?.homeBranch || 
    'ไม่ระบุ'
  );
  
  // Determine approval level from Clean Slate RBAC structure ONLY
  // Resigned employees always need province manager approval
  const approvalLevel = currentUser?.approvalLevel || 
    (isResignedEmployee ? 'province_manager' :
     currentUser?.access?.authority === 'ADMIN' ? 'super_admin' :
     currentUser?.access?.authority === 'MANAGER' ? 'province_manager' :
     currentUser?.access?.authority === 'LEAD' ? 'branch_manager' :
     currentUser?.userType === 'existing' ? 'branch_manager' : 'province_manager');
  const approvalLevelName = getApprovalLevelName(approvalLevel);
  
  // DEBUG: Add detailed logging to understand RBAC structure
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && currentUser) {
      console.log('🔍 ApprovalStatus Debug - User Data:', {
        uid: currentUser.uid,
        email: currentUser.email,
        userType: currentUser.userType,
        employeeStatus: currentUser.employeeStatus,
        requiresSpecialApproval: currentUser.requiresSpecialApproval,
        access: currentUser.access,
        homeProvince: currentUser.homeProvince,
        homeBranch: currentUser.homeBranch,
        approvalLevel: currentUser.approvalLevel,
        isActive: currentUser.isActive,
        isApproved: currentUser.isApproved,
        approvalStatus: currentUser.approvalStatus,
        isPendingApproval: currentUser.isPendingApproval,
        isRejected,
        isResignedEmployee
      });
      
      // Validate Clean Slate RBAC structure only
      const hasCleanSlate = !!currentUser.access?.authority;
      const hasLegacyAuth = !!(currentUser.accessLevel || currentUser.homeProvince);
      
      console.log('📊 ApprovalStatus RBAC Structure Analysis:', {
        hasCleanSlate,
        hasLegacyAuth,
        migrationStatus: hasCleanSlate ? 'Clean Slate ✅' : 
                        hasLegacyAuth ? 'Legacy - Needs Migration 🔄' : 
                        'No RBAC Data ❌'
      });
      
      // Warn about missing essential data
      if (!department || department === 'ไม่ระบุ') {
        console.warn('⚠️ ApprovalStatus: Missing department data');
      }
      if (!province || province === 'นครสวรรค์') {
        console.warn('⚠️ ApprovalStatus: Using default province (Nakhon Sawan)');
      }
      if (!branch || branch === 'ไม่ระบุ') {
        console.warn('⚠️ ApprovalStatus: Missing branch data');
      }
    }
  }, [currentUser, department, province, branch]);
  
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
    
    // 🔧 Add utility function for testing rejected users
    if (process.env.NODE_ENV === 'development') {
      window.testRejectedUser = (customData = {}) => {
        console.log('🧪 Testing rejected user scenario...');
        
        const testRejectedUserData = {
          uid: 'test-rejected-user',
          email: 'rejected@test.com',
          firstName: 'Test',
          lastName: 'Rejected',
          displayName: 'Test Rejected',
          approvalStatus: 'rejected',
          rejectedAt: Date.now() - 120000, // 2 minutes ago
          rejectionReason: 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง',
          rejectedBy: 'ผู้จัดการจังหวัด',
          isApproved: false,
          isActive: false,
          userType: 'new',
          access: {
            authority: 'STAFF',
            departments: ['SALES'],
            geographic: {
              scope: 'BRANCH',
              homeProvince: 'nakhon-sawan',
              homeBranch: 'NSN001'
            }
          },
          ...customData
        };
        
        console.log('🔧 Test rejected user data:', testRejectedUserData);
        
        // Force re-render with test data
        const event = new CustomEvent('testRejectedUser', {
          detail: testRejectedUserData
        });
        window.dispatchEvent(event);
        
        return testRejectedUserData;
      };
      
      // 🔧 Add utility to manually reject current user for testing
      window.rejectCurrentUser = async (reason = 'ข้อมูลไม่ครบถ้วนสำหรับการทดสอบ') => {
        console.log('🧪 Manually rejecting current user for testing...');
        
        try {
          const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
          const db = getFirestore();
          
          if (currentUser?.uid) {
            const userRef = doc(db, 'users', currentUser.uid);
            const rejectionData = {
              approvalStatus: 'rejected',
              rejectedAt: Date.now(),
              rejectionReason: reason,
              rejectedBy: 'ผู้ดูแลระบบ (ทดสอบ)',
              isApproved: false,
              isActive: false,
              updatedAt: Date.now()
            };
            
            await updateDoc(userRef, rejectionData);
            
            console.log('✅ User rejected successfully! Refreshing page...');
            setTimeout(() => window.location.reload(), 1000);
            
            return rejectionData;
          } else {
            console.error('❌ No current user to reject');
          }
        } catch (error) {
          console.error('❌ Error rejecting user:', error);
        }
      };
      
      console.log('🧪 Rejection testing utilities loaded:');
      console.log('  - window.testRejectedUser() - Test with mock data');
      console.log('  - window.rejectCurrentUser("reason") - Reject current user in Firebase');
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('userApproved', handleUserApproved);
      if (window.testRejectedUser) {
        delete window.testRejectedUser;
      }
    };
  }, []);

  // Render rejection screen for rejected users
  if (isRejected) {
    const rejectionReason = currentUser?.rejectionReason || 'ไม่ได้ระบุเหตุผล';
    const rejectedBy = currentUser?.rejectedBy || currentUser?.rejectorName || 'ผู้ดูแลระบบ';
    const rejectedAt = currentUser?.rejectedAt ? new Date(currentUser.rejectedAt).toLocaleDateString('th-TH') : 'ไม่ทราบวันที่';
    
    return (
      <>
        <div className="nature-login-page">
          <div 
            className="nature-login-background" 
            style={{
              backgroundImage: `url(${welcomeImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '100vh',
              padding: '60px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* Enhanced Glassmorphism Overlay */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.15) 0%, rgba(26, 78, 44, 0.25) 50%, rgba(45, 80, 22, 0.15) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            />
            
            {/* Floating Glassmorphism Elements */}
            <div 
              className="glass-floating-element" 
              style={{ 
                top: '10%', 
                left: '10%',
                width: '120px',
                height: '120px',
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'float 6s ease-in-out infinite'
              }} 
            />
            <div 
              className="glass-floating-element" 
              style={{ 
                top: '60%', 
                right: '15%',
                width: '80px',
                height: '80px',
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'float 8s ease-in-out infinite reverse'
              }} 
            />
            <div 
              className="glass-floating-element" 
              style={{ 
                bottom: '20%', 
                left: '20%',
                width: '60px',
                height: '60px',
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'float 7s ease-in-out infinite'
              }} 
            />
            <div 
              className="glass-floating-element" 
              style={{ 
                top: '30%', 
                right: '5%',
                width: '90px',
                height: '90px',
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'float 9s ease-in-out infinite reverse'
              }} 
            />
            
            {/* Main Glass Container */}
            <div className="glass-card glass-error" style={{ 
              maxWidth: '600px', 
              width: '100%', 
              padding: '48px',
              position: 'relative',
              zIndex: 10,
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '32px' }}>
                <ExclamationCircleOutlined 
                  style={{ 
                    fontSize: '64px', 
                    color: '#ff4d4f',
                    marginBottom: '24px',
                    display: 'block'
                  }} 
                />
                <Title level={2} style={{ color: '#cf1322', marginBottom: '16px' }}>
                  คำขอถูกปฏิเสธ
                </Title>
                <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  ขออภัย คำขอเข้าใช้งานระบบของคุณไม่ได้รับการอนุมัติ
                </Text>
              </div>

              {/* Rejection Details in Glass Cards */}
              <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '32px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
                  <Text strong style={{ color: '#2d5016' }}>เหตุผลที่ปฏิเสธ:</Text>
                  <br />
                  <Text style={{ color: '#595959' }}>{rejectionReason}</Text>
                </div>
                
                {/* Not easy to show real rejector name because of security, so skip this.
                <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
                  <Text strong style={{ color: '#2d5016' }}>ปฏิเสธโดย:</Text>
                  <br />
                  <Text style={{ color: '#595959' }}>{rejectedBy}</Text>
                </div> */}
                
                <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
                  <Text strong style={{ color: '#2d5016' }}>วันที่ปฏิเสธ:</Text>
                  <br />
                  <Text style={{ color: '#595959' }}>{rejectedAt}</Text>
                </div>
              </Space>

              {/* Contact Information */}
              <div className="glass-card glass-info" style={{ padding: '24px', marginBottom: '32px' }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
                  <InfoCircleOutlined style={{ marginRight: '8px' }} />
                  ติดต่อสอบถาม
                </Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text>อีเมล: admin@kbn.co.th</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text>โทรศัพท์: 044-123-456</Text>
                  </div>
                </Space>
              </div>

              {/* Action Buttons - Responsive Layout */}
              <Row gutter={[20, 16]} justify="center" className="reapplication-buttons-row" >
                <Col xs={24} sm={8} md={8} lg={8}>
                  <CustomButton 
                    variant="primary"
                    size="xlarge"
                    icon={<SendOutlined />}
                    onClick={() => setShowReapplicationForm(true)}
                    block
                  >
                    ส่งคำขอใหม่
                  </CustomButton>
                </Col>
                <Col xs={24} sm={8} md={8} lg={8} >
                  <CustomButton 
                    variant="warning"
                    size="xlarge"
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                    block
                  >
                    ตรวจสอบสถานะ
                  </CustomButton>
                </Col>
                <Col xs={24} sm={8} md={8} lg={8}>
                  <CustomButton 
                    variant="secondary"
                    size="xlarge"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                  >
                    ออกจากระบบ
                  </CustomButton>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        
        {/* Re-application Modal */}
        <Modal
          title={null}
          visible={showReapplicationForm}
          onCancel={() => setShowReapplicationForm(false)}
          footer={null}
          width="90%"
          style={{ maxWidth: '900px' }}
          centered
          bodyStyle={{ padding: 0 }}
          className="reapplication-modal"
        >
          <ReapplicationForm
            user={currentUser}
            rejectionData={{
              rejectionReason: currentUser.rejectionReason,
              rejectedAt: currentUser.rejectedAt,
              rejectedBy: currentUser.rejectedBy || currentUser.rejectorName
            }}
            onSuccess={(data) => {
              setShowReapplicationForm(false);
              
              console.log('🎉 Reapplication submitted successfully, triggering auth refresh...');
              
              // Force immediate auth verification to pick up the new status
              if (window.store && window.store.dispatch) {
                const { verifyAuth } = require('../../redux/actions/auth');
                window.store.dispatch(verifyAuth());
              }
              
              // Also refresh the page as backup after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }}
            onCancel={() => setShowReapplicationForm(false)}
          />
        </Modal>
      </>
    );
  }

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
        title: isResignedEmployee 
          ? 'ตรวจสอบสถานะพนักงานเดิม' 
          : isExisting 
            ? 'ตรวจสอบข้อมูลพนักงาน' 
            : 'รอการตรวจสอบ',
        description: isResignedEmployee
          ? 'ระบบกำลังตรวจสอบสถานะพนักงานเดิมที่ลาออกแล้ว'
          : isExisting 
            ? 'ระบบกำลังตรวจสอบข้อมูลพนักงานในระบบ' 
            : 'ผู้ดูแลกำลังตรวจสอบข้อมูลของคุณ',
        status: 'process',
        icon: (
          <ClockCircleOutlined 
            style={{ 
              color: isResignedEmployee ? '#fa8c16' : '#faad14',
              animation: 'pulse 2s infinite'
            }} 
          />
        )
      },
      {
        title: isResignedEmployee ? 'รอการอนุมัติพิเศษ' : 'รอการอนุมัติ',
        description: isResignedEmployee 
          ? `รอการอนุมัติพิเศษจาก${approvalLevelName} (พนักงานเดิมที่ลาออกแล้ว)`
          : `รอการอนุมัติจาก${approvalLevelName}`,
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
      currentUser?.homeProvince || 'ไม่ระบุ', 
      currentUser?.access?.geographic?.homeBranch || 
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
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
        `}
      </style>
      
      <ScreenWithManual screenType="approval-status" showManualOnFirstVisit={true}>
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
              message={isResignedEmployee 
                ? 'สำหรับพนักงานเดิม (ลาออกแล้ว) - ต้องการอนุมัติพิเศษ'
                : currentUser?.userType === 'existing' 
                  ? 'สำหรับพนักงานเดิม' 
                  : 'สำหรับพนักงานใหม่'
              }
              description={
                <div>
                  <Paragraph style={{ margin: '8px 0 16px 0' }}>
                    {isResignedEmployee
                      ? 'คุณเป็นพนักงานเดิมที่ลาออกแล้ว การสมัครใช้งานระบบจะต้องได้รับการอนุมัติพิเศษจากผู้จัดการจังหวัด เนื่องจากต้องตรวจสอบสิทธิ์และความเหมาะสมในการกลับมาใช้งานระบบ'
                      : currentUser?.userType === 'existing' 
                        ? 'ระบบจะตรวจสอบข้อมูลของคุณกับฐานข้อมูลพนักงาน หากข้อมูลถูกต้องจะได้รับการอนุมัติโดยอัตโนมัติ'
                        : 'การสมัครสำหรับพนักงานใหม่จะต้องผ่านการตรวจสอบและอนุมัติจากผู้จัดการ'
                    }
                  </Paragraph>
                  
                  <div style={{ 
                    background: isResignedEmployee 
                      ? 'rgba(250, 140, 22, 0.1)' 
                      : 'rgba(250, 173, 20, 0.1)', 
                    border: isResignedEmployee 
                      ? '1px solid rgba(250, 140, 22, 0.3)' 
                      : '1px solid rgba(250, 173, 20, 0.3)', 
                    borderRadius: '8px', 
                    padding: '12px',
                    marginTop: '12px'
                  }}>
                    <Text style={{ 
                      fontSize: '13px', 
                      color: isResignedEmployee ? '#d4380d' : '#d48806',
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
                      color: isResignedEmployee ? '#d4380d' : '#d48806'
                    }}>
                      {isResignedEmployee ? (
                        <>
                          <li>พนักงานเดิม (ลาออกแล้ว): 3-7 วันทำการ</li>
                          <li>ต้องการการอนุมัติพิเศษจากผู้จัดการจังหวัด</li>
                        </>
                      ) : (
                        <>
                          <li>พนักงานเดิม: 1-2 ชั่วโมง</li>
                          <li>พนักงานใหม่: 1-3 วันทำการ</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              }
              type={isResignedEmployee ? "warning" : "info"}
              showIcon
              style={{ 
                marginBottom: '24px',
                background: isResignedEmployee 
                  ? 'rgba(250, 140, 22, 0.05)' 
                  : 'rgba(24, 144, 255, 0.05)',
                border: isResignedEmployee 
                  ? '1px solid rgba(250, 140, 22, 0.2)' 
                  : '1px solid rgba(24, 144, 255, 0.2)',
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
                <CustomButton
                  variant="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                >
                  รีเฟรชสถานะ
                </CustomButton>
                
                <CustomButton
                  variant="secondary"
                  size="large"
                  icon={<LogoutOutlined />}
                  onClick={onBackToLogin || handleLogout}
                >
                  ออกจากระบบ
                </CustomButton>
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
      </ScreenWithManual>
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