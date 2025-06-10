import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Select, Alert, Row, Col, Radio, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined, EnvironmentOutlined, ArrowLeftOutlined, CheckCircleOutlined, UserAddOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { fetchProvinces } from '../../redux/actions/provinces';
import { DEPARTMENTS } from '../../data/permissions';
import { getBranchName } from '../../utils/mappings';
import { 
  verifyEmployee, 
  CONFIDENCE_LEVELS,
  formatEmployeeInfo,
  getEmployeeStatusInfo 
} from '../../utils/employeeVerification';

const { Option } = Select;
const { Text } = Typography;

const EnhancedSignUp = ({ handleConfirm, change }) => {
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userType, setUserType] = useState('new'); // 'new' or 'existing'
  const [error, setError] = useState(null);
  const [employeeVerificationResult, setEmployeeVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const dispatch = useDispatch();
  const { signUpError, isLoggingIn } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);
  const { employees } = useSelector(state => state.data);

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  // Default branches for provinces
  const DEFAULT_BRANCHES = {
    'nakhon-ratchasima': [
      { branchCode: '0450', branchName: 'สาขานครราชสีมา สำนักงานใหญ่', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0451', branchName: 'สาขาบัวใหญ่', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0452', branchName: 'สาขาจักราช', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0453', branchName: 'สาขาสีดา', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0454', branchName: 'สาขาโคกกรวด', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0455', branchName: 'สาขาหนองบุญมาก', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0456', branchName: 'สาขาขามสะแกแสง', provinceId: 'nakhon-ratchasima' },
      { branchCode: '0500', branchName: 'สาขาฟาร์มหนองบุญมาก', provinceId: 'nakhon-ratchasima' },
    ],
    'nakhon-sawan': [
      { branchCode: 'NSN001', branchName: 'สาขานครสวรรค์', provinceId: 'nakhon-sawan' },
      { branchCode: 'NSN002', branchName: 'สาขาตาคลี', provinceId: 'nakhon-sawan' },
      { branchCode: 'NSN003', branchName: 'สาขาหนองบัว', provinceId: 'nakhon-sawan' }
    ]
  };

  // Filter branches by selected province
  const availableBranches = selectedProvince 
    ? Object.values(branches || {}).filter(branch => 
        branch.provinceId === selectedProvince || 
        branch.province === selectedProvince ||
        branch.provinceKey === selectedProvince
      )
    : [];

  // If no branches found from Redux state, use default branches
  const branchesToShow = availableBranches.length > 0 
    ? availableBranches 
    : (selectedProvince ? DEFAULT_BRANCHES[selectedProvince] || [] : []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ branch: undefined }); // Reset branch when province changes
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    form.resetFields(); // Reset form when switching user types
  };

  const determineDefaultAccessLevel = (department, userType) => {
    if (userType === 'existing') {
      // Existing employees get staff level initially, can be upgraded later
      return 'STAFF';
    }
    
    // New users get basic staff access
    switch (department) {
      case 'management':
        return 'BRANCH_MANAGER'; // Will need approval from province manager
      case 'accounting':
      case 'sales':
      case 'service':
      case 'inventory':
        return 'STAFF';
      default:
        return 'STAFF';
    }
  };

  const handleSubmit = async (values) => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    setEmployeeVerificationResult(null);

    try {
      console.log('📝 Starting registration process:', values);

      // Enhanced employee verification for existing employees
      if (values.userType === 'existing') {
        console.log('🔍 Starting enhanced employee verification');
        
        const verificationResult = await verifyEmployee({
          employeeCode: values.employeeId,
          firstName: values.firstName,
          lastName: values.lastName,
          employees: employees // Use Redux employee data for faster lookup
        });

        console.log('📊 Employee verification result:', verificationResult);
        setEmployeeVerificationResult(verificationResult);

        // Handle verification results
        if (!verificationResult.success) {
          let errorMessage = verificationResult.message;
          
          if (verificationResult.confidence === CONFIDENCE_LEVELS.MULTIPLE_MATCHES) {
            errorMessage += '\n\nพนักงานที่พบ:\n' + 
              verificationResult.suggestions.slice(2).join('\n');
          } else if (verificationResult.suggestions.length > 0) {
            errorMessage += '\n\nคำแนะนำ:\n' + 
              verificationResult.suggestions.join('\n');
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }

        // Verification successful - populate employee data
        const employee = verificationResult.employee;
        const employeeInfo = formatEmployeeInfo(employee);
        const statusInfo = getEmployeeStatusInfo(employee);

        console.log('✅ Employee verification successful:', {
          employee: employeeInfo,
          status: statusInfo,
          confidence: verificationResult.confidence
        });

        // Check if employee can register
        if (!statusInfo.canRegister) {
          setError(statusInfo.message + '\n\n' + statusInfo.suggestions.join('\n'));
          setLoading(false);
          return;
        }

        // Auto-populate employee data for registration
        const enhancedValues = {
          ...values,
          // Employee identity verification
          employeeId: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          nickName: employee.nickName,
          
          // Geographic data from employee record
          province: employee.provinceId === 'nakhon-ratchasima' ? 'นครราชสีมา' : 'นครสวรรค์',
          branch: employee.affiliate, // Branch name from employee record
          
          // Additional metadata for approval process
          verificationConfidence: verificationResult.confidence,
          employeePosition: employee.position,
          employeeStartDate: employee.startDate,
          employeeAffiliate: employee.affiliate,
          
          // Registration metadata
          registrationSource: 'enhanced_verification',
          verificationTimestamp: Date.now()
        };

        console.log('🚀 Proceeding with enhanced registration data:', enhancedValues);
        values = enhancedValues;
      }

      setSubmitting(true);
      setError(null); // Clear any previous errors
      
      const accessLevel = determineDefaultAccessLevel(values.department, userType);
      
      const signUpData = {
        ...values,
        userType,
        accessLevel,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestType: userType === 'existing' ? 'existing_employee_registration' : 'new_employee_registration',
        // Geographic data for RBAC
        allowedProvinces: [values.province],
        allowedBranches: values.branch ? [values.branch] : [],
        // Additional metadata
        registrationSource: 'web',
        needsManagerApproval: true,
        approvalLevel: userType === 'existing' ? 'branch_manager' : 'province_manager'
      };

      console.log('📝 Submitting registration:', signUpData);
      const result = await handleConfirm(signUpData);
      
      // Check if registration was successful but requires approval
      if (result && result.type === 'REGISTRATION_PENDING') {
        console.log('✅ Registration successful, pending approval - reloading page for clean state');
        // Clear form and reload page for clean state transition
        form.resetFields();
        // Small delay to ensure the registration is completed, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      } else if (result && result.type === 'SIGNUP_SUCCESS') {
        console.log('✅ Registration completed successfully');
        setRegistrationSuccess(true);
        form.resetFields();
      } else {
        // For any other result, do not set registration success
        // The error will be handled by the signUpError state
        console.log('⚠️ Registration result:', result);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      // Don't set registration success if there's an error
      // The error will be handled by the useEffect hook for signUpError
      // Don't reset form on error so user can fix the issue
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Handle signup error with user-friendly messages
  useEffect(() => {
    if (signUpError) {
      // signUpError from Redux is already an interpreted message string
      // Set the error directly without any re-interpretation
      const errorInfo = {
        message: signUpError,
        code: 'signup-error',
        severity: 'error'
      };
      
      // Set error directly without calling handleError to avoid re-interpretation
      setError(errorInfo);
    } else {
      setError(null);
    }
  }, [signUpError]);

  // Cleanup on unmount to prevent React state update warnings
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setSubmitting(false);
      setError(null);
    };
  }, []);

  // Auto-redirect for successful registrations (Navigation will handle pending users)
  useEffect(() => {
    if (registrationSuccess) {
      // For pending users, Navigation component will automatically redirect to approval page
      // No need to manually redirect - just show the success state briefly
      console.log('✅ Registration success state shown, Navigation will handle redirect');
    }
  }, [registrationSuccess]);

  // Success screen
  if (registrationSuccess) {
    // For pending users, redirect will be handled by Navigation component
    // Show a brief success message with automatic redirect
    return (
      <>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
            .redirect-loading {
              animation: pulse 2s infinite;
            }
          `}
        </style>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <CheckCircleOutlined 
              className="redirect-loading"
              style={{ 
                fontSize: '64px', 
                color: '#52c41a',
                marginBottom: '16px'
              }} 
            />
            <h1 className="nature-login-title" style={{ fontSize: '28px' }}>
              สมัครสมาชิกสำเร็จ!
            </h1>
            <p style={{ 
              color: '#6b7280',
              fontSize: '16px',
              margin: '16px 0 0 0',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              กำลังเปลี่ยนหน้าไปยังสถานะการอนุมัติ...
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <Alert
              message="การสมัครสมาชิกเสร็จสิ้น"
              description="ระบบได้รับข้อมูลการสมัครของคุณแล้ว กำลังเปลี่ยนหน้าไปยังหน้าติดตามสถานะการอนุมัติ"
              type="success"
              showIcon
              className="nature-login-success"
            />
          </div>

          <div className="nature-login-footer">
            <p>© {new Date().getFullYear()} KBN</p>
          </div>
        </div>
      </>
    );
  }

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
            transition: 'all 0.3s ease',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            height: '100%'
          }}
        >
          กลับ
        </Button>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="nature-login-title" style={{ fontSize: '28px' }}>
          สมัครสมาชิก
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '16px',
          margin: '16px 0 0 0',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          สร้างบัญชีผู้ใช้งานสำหรับระบบ KBN
        </p>
      </div>

      {/* Enhanced User Type Selection with Glassmorphism */}
      <div style={{ 
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(26, 78, 44, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          color: '#2d5016'
        }}>
          <SafetyCertificateOutlined style={{ 
            fontSize: '18px', 
            marginRight: '8px', 
            color: '#52c41a' 
          }} />
          <Text strong style={{ 
            fontSize: '16px', 
            color: '#2d5016',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            ประเภทการสมัครสมาชิก
          </Text>
        </div>
        
        <Radio.Group 
          value={userType} 
          onChange={handleUserTypeChange}
          style={{ width: '100%' }}
          className="nature-user-type-selector"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div 
                className={`nature-user-type-card ${userType === 'new' ? 'selected' : ''}`}
                onClick={() => handleUserTypeChange({ target: { value: 'new' } })}
                style={{
                  cursor: 'pointer',
                  padding: '20px 16px',
                  borderRadius: '12px',
                  border: userType === 'new' 
                    ? '2px solid #52c41a' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  background: userType === 'new' 
                    ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(45, 80, 22, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: userType === 'new' 
                    ? '0 8px 25px rgba(82, 196, 26, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <Radio value="new" style={{ display: 'none' }} />
                <div style={{
                  background: userType === 'new' 
                    ? 'linear-gradient(135deg, #52c41a, #389e0d)' 
                    : 'linear-gradient(135deg, #6b7280, #4b5563)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}>
                  <UserAddOutlined style={{ 
                    fontSize: '20px', 
                    color: '#ffffff',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }} />
                </div>
                <Text strong style={{ 
                  fontSize: '16px',
                  color: userType === 'new' ? '#2d5016' : '#4b5563',
                  display: 'block',
                  marginBottom: '4px',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                  transition: 'color 0.3s ease'
                }}>
                  พนักงานใหม่
                </Text>
                <Text style={{ 
                  fontSize: '13px',
                  color: userType === 'new' ? '#52c41a' : '#6b7280',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                  transition: 'color 0.3s ease'
                }}>
                  ยังไม่เคยทำงานกับ KBN
                </Text>
                {userType === 'new' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#52c41a',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.4)'
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '12px', color: '#fff' }} />
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div 
                className={`nature-user-type-card ${userType === 'existing' ? 'selected' : ''}`}
                onClick={() => handleUserTypeChange({ target: { value: 'existing' } })}
                style={{
                  cursor: 'pointer',
                  padding: '20px 16px',
                  borderRadius: '12px',
                  border: userType === 'existing' 
                    ? '2px solid #52c41a' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  background: userType === 'existing' 
                    ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(45, 80, 22, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: userType === 'existing' 
                    ? '0 8px 25px rgba(82, 196, 26, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <Radio value="existing" style={{ display: 'none' }} />
                <div style={{
                  background: userType === 'existing' 
                    ? 'linear-gradient(135deg, #52c41a, #389e0d)' 
                    : 'linear-gradient(135deg, #6b7280, #4b5563)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}>
                  <UserOutlined style={{ 
                    fontSize: '20px', 
                    color: '#ffffff',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }} />
                </div>
                <Text strong style={{ 
                  fontSize: '16px',
                  color: userType === 'existing' ? '#2d5016' : '#4b5563',
                  display: 'block',
                  marginBottom: '4px',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                  transition: 'color 0.3s ease'
                }}>
                  พนักงานเดิม
                </Text>
                <Text style={{ 
                  fontSize: '13px',
                  color: userType === 'existing' ? '#52c41a' : '#6b7280',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                  transition: 'color 0.3s ease'
                }}>
                  ทำงานกับ KBN อยู่แล้ว
                </Text>
                {userType === 'existing' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#52c41a',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.4)'
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '12px', color: '#fff' }} />
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Radio.Group>
      </div>

      {/* Information Alert based on user type */}
      <Alert
        message={userType === 'new' ? 'สำหรับพนักงานใหม่' : 'สำหรับพนักงานเดิม'}
        description={
          userType === 'new' 
            ? 'ระบบจะส่งข้อมูลของคุณไปยังผู้จัดการสาขาเพื่อยืนยันข้อมูลและอนุมัติการเข้าใช้งาน'
            : 'ระบบจะตรวจสอบข้อมูลของคุณกับฐานข้อมูลพนักงานและดำเนินการอนุมัติอัตโนมัติหากข้อมูลถูกต้อง'
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

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

      {/* Registration Form */}
      <Form
        form={form}
        name="enhancedSignUp"
        onFinish={handleSubmit}
        size="large"
        layout="vertical"
        className="nature-login-form"
        scrollToFirstError
      >
        {/* Employee Verification Result Display */}
        {employeeVerificationResult && employeeVerificationResult.success && (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            message="ยืนยันข้อมูลพนักงานสำเร็จ"
            description={
              <div>
                <Text strong>{employeeVerificationResult.message}</Text>
                {employeeVerificationResult.employee && (
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    <div>ตำแหน่ง: {employeeVerificationResult.employee.position || 'ไม่ระบุ'}</div>
                    <div>สาขา: {employeeVerificationResult.employee.affiliate || 'ไม่ระบุ'}</div>
                    <div>ระดับความมั่นใจ: {
                      employeeVerificationResult.confidence === CONFIDENCE_LEVELS.EXACT_MATCH 
                        ? 'สูงมาก (รหัส + ชื่อตรงกัน)' 
                        : employeeVerificationResult.confidence === CONFIDENCE_LEVELS.CODE_MATCH
                        ? 'สูง (รหัสพนักงานตรงกัน)'
                        : 'ปานกลาง (ชื่อตรงกัน)'
                    }</div>
                  </div>
                )}
              </div>
            }
          />
        )}

        {/* Personal Information */}
        <Divider orientation="left">ข้อมูลส่วนตัว</Divider>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label="ชื่อ"
              rules={[
                { required: true, message: 'กรุณากรอกชื่อ' },
                { min: 1, message: 'กรุณากรอกชื่อ' },
                { 
                  pattern: /^[ก-๙a-zA-Z\s]+$/, 
                  message: 'ชื่อสามารถใส่ได้เฉพาะภาษาไทย ภาษาอังกฤษ และช่องว่างเท่านั้น' 
                }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="ชื่อ"
                autoComplete="given-name"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label="นามสกุล"
              rules={[
                { required: true, message: 'กรุณากรอกนามสกุล' },
                { min: 1, message: 'กรุณากรอกนามสกุล' },
                { 
                  pattern: /^[ก-๙a-zA-Z\s]+$/, 
                  message: 'นามสกุลสามารถใส่ได้เฉพาะภาษาไทย ภาษาอังกฤษ และช่องว่างเท่านั้น' 
                }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="นามสกุล"
                autoComplete="family-name"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Email */}
        <Form.Item
          name="email"
          label="อีเมล"
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

        {/* Password Fields */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[
                { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="รหัสผ่าน"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="confirmPassword"
              label="ยืนยันรหัสผ่าน"
              dependencies={['password']}
              rules={[
                { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="ยืนยันรหัสผ่าน"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Work Information */}
        <Divider orientation="left">ข้อมูลการทำงาน</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="province"
              label="จังหวัด"
              rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}
            >
              <Select
                placeholder="เลือกจังหวัด"
                onChange={handleProvinceChange}
                suffixIcon={<EnvironmentOutlined />}
                
                optionFilterProp="children"
              >
                {Object.entries(provinces || {}).map(([key, province]) => (
                  <Option key={key} value={key}>
                    {province.name || key}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="department"
              label="แผนก/ฝ่าย"
              rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}
            >
              <Select
                placeholder="เลือกแผนก"
                suffixIcon={<BankOutlined />}
                
                optionFilterProp="children"
              >
                {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                  <Option key={dept.key} value={dept.key}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Branch Selection */}
        <Form.Item
          name="branch"
          label="สาขา"
          rules={[{ required: true, message: 'กรุณาเลือกสาขา' }]}
        >
          <Select
            placeholder={selectedProvince ? "เลือกสาขา" : "กรุณาเลือกจังหวัดก่อน"}
            disabled={!selectedProvince || branchesToShow.length === 0}
            suffixIcon={<BankOutlined />}
            
            optionFilterProp="children"
          >
            {branchesToShow.map((branch) => {
              const branchCode = branch.branchCode || branch.id || branch.branchId;
              const branchName = getBranchName(branchCode) || branch.branchName || branch.name;
              return (
                <Option key={branchCode} value={branchCode}>
                  {branchName}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {/* Additional Information for existing employees */}
        {userType === 'existing' && (
          <>
            <Divider orientation="left">ข้อมูลเพิ่มเติม (ทางเลือก)</Divider>
            <Form.Item
              name="employeeId"
              label="รหัสพนักงาน (หากมี)"
              help="กรอกรหัสพนักงานเพื่อเร่งการอนุมัติ"
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="รหัสพนักงาน"
              />
            </Form.Item>
          </>
        )}

        {/* Submit Button */}
        <Form.Item style={{ marginBottom: '32px', marginTop: '24px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting || isLoggingIn}
            block
            className="nature-login-button"
            disabled={submitting || isLoggingIn}
          >
            {submitting || isLoggingIn ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </Form.Item>
      </Form>

      {/* Navigation Links */}
      <div style={{ 
        textAlign: 'center', 
        padding: '24px 0 16px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div>
          <span style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Button
              type="link"
              onClick={() => change('Login')}
              className="nature-login-link"
              style={{
                padding: '0',
                fontSize: '16px',
                height: 'auto'
              }}
            >
              เข้าสู่ระบบ
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

EnhancedSignUp.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired
};

export default EnhancedSignUp; 