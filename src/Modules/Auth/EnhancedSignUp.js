import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Select, Alert, Row, Col, Radio, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined, EnvironmentOutlined, ArrowLeftOutlined, CheckCircleOutlined, UserAddOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { fetchProvinces } from '../../redux/actions/provinces';
import { DEPARTMENTS } from '../../data/permissions';
import { getBranchName } from '../../utils/mappings';
import { createCleanSlateUser, validateCleanSlateUser } from '../../utils/clean-slate-helpers';

const { Option } = Select;
const { Text } = Typography;

const EnhancedSignUp = ({ handleConfirm, change }) => {
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userType, setUserType] = useState('new');
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const dispatch = useDispatch();
  const { signUpError, isLoggingIn } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);
  const { employees } = useSelector(state => state.data);

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  // Static fallback data for signup form
  const STATIC_PROVINCES = {
    'nakhon-ratchasima': { 
      name: 'นครราชสีมา', 
      nameTh: 'นครราชสีมา',
      nameEn: 'Nakhon Ratchasima' 
    },
    'nakhon-sawan': { 
      name: 'นครสวรรค์', 
      nameTh: 'นครสวรรค์',
      nameEn: 'Nakhon Sawan' 
    }
  };

  // Handle data loading completion
  useEffect(() => {
    const hasProvinces = Object.keys(provinces || {}).length > 0;
    const hasFallbackData = Object.keys(STATIC_PROVINCES).length > 0;
    
    if (hasProvinces || hasFallbackData) {
      setDataLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces]);

  const provincesToShow = Object.keys(provinces || {}).length > 0 ? provinces : STATIC_PROVINCES;

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

  // Get branches for selected province
  const availableBranches = selectedProvince 
    ? Object.values(branches || {}).filter(branch => 
        branch.provinceId === selectedProvince || 
        branch.province === selectedProvince ||
        branch.provinceKey === selectedProvince
      )
    : [];

  const branchesToShow = availableBranches.length > 0 
    ? availableBranches 
    : (selectedProvince ? DEFAULT_BRANCHES[selectedProvince] || [] : []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ branch: undefined });
    form.setFields([{ name: 'province', errors: [] }]);
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    form.resetFields();
    form.setFieldsValue({ userType: e.target.value });
  };

  // Simplified employee lookup function
  const findEmployee = (employeeCode, firstName, lastName) => {
    if (!employees || Object.keys(employees).length === 0) {
      return null;
    }

    const employeeList = Object.values(employees);
    
    // Try exact employee code match first
    if (employeeCode) {
      const codeMatch = employeeList.find(emp => 
        emp.employeeCode === employeeCode || emp.id === employeeCode
      );
      if (codeMatch) return codeMatch;
    }

    // Try name match
    if (firstName && lastName) {
      const nameMatch = employeeList.find(emp => 
        emp.firstName === firstName && emp.lastName === lastName
      );
      if (nameMatch) return nameMatch;
    }

    return null;
  };

  // Simplified submission handler using unified Clean Slate helpers
  const handleSubmit = async (values) => {
    if (submitting) return;
    
    setSubmitting(true);
    setError(null);

    try {
      console.log('📝 Starting Clean Slate registration process:', values);

      let finalValues = {
        ...values,
        userType: values.userType || userType
      };

      // Handle existing employee verification
      if (finalValues.userType === 'existing') {
        console.log('🔍 Verifying existing employee');
        
        if (!employees || Object.keys(employees).length === 0) {
          setError('ไม่สามารถตรวจสอบข้อมูลพนักงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
          setSubmitting(false);
          return;
        }

        const employee = findEmployee(
          finalValues.employeeId,
          finalValues.firstName,
          finalValues.lastName
        );

        if (!employee) {
          setError('ไม่พบข้อมูลพนักงานที่ตรงกับข้อมูลที่กรอก กรุณาตรวจสอบข้อมูลอีกครั้ง');
          setSubmitting(false);
          return;
        }

        console.log('✅ Employee found:', employee);

        // Enhance values with employee data
        finalValues = {
          ...finalValues,
          employeeId: employee.employeeCode || employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          province: employee.provinceId || finalValues.province,
          branch: employee.affiliate || finalValues.branch,
          employeePosition: employee.position,
          registrationSource: 'employee_verification'
        };
      }

      // Normalize province format
      let normalizedProvince = finalValues.province;
      if (finalValues.province === 'นครราชสีมา') {
        normalizedProvince = 'nakhon-ratchasima';
      } else if (finalValues.province === 'นครสวรรค์') {
        normalizedProvince = 'nakhon-sawan';
      }

      // Prepare data for Clean Slate user creation (unified structure)
      const cleanSlateUserData = {
        // Will be set by auth.js after Firebase Auth creation
        uid: null, // Set by signUpUserWithRBAC
        email: finalValues.email,
        firstName: finalValues.firstName,
        lastName: finalValues.lastName,
        displayName: `${finalValues.firstName} ${finalValues.lastName}`,
        
        // Clean Slate mapping fields
        department: finalValues.department,
        accessLevel: 'STAFF', // New users start as STAFF
        province: normalizedProvince,
        branch: finalValues.branch,
        userType: finalValues.userType
      };

      // Validate the structure before sending
      console.log('🔍 Validating Clean Slate user data structure:', cleanSlateUserData);

      const signUpData = {
        // Core registration data
        firstName: finalValues.firstName,
        lastName: finalValues.lastName,
        email: finalValues.email,
        password: finalValues.password,
        
        // Work information
        department: finalValues.department ? finalValues.department.toUpperCase() : 'GENERAL',
        province: normalizedProvince,
        branch: finalValues.branch,
        
        // Registration metadata
        userType: finalValues.userType,
        employeeId: finalValues.employeeId || null,
        requestType: finalValues.userType === 'existing' ? 'existing_employee_registration' : 'new_employee_registration',
        registrationSource: 'web',
        needsManagerApproval: true,
        approvalLevel: finalValues.userType === 'existing' ? 'branch_manager' : 'province_manager',
        
        // Additional metadata
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      console.log('📝 Submitting unified Clean Slate regitration:', signUpData);
      
      const result = await handleConfirm(signUpData);
      
      if (result && (result.type === 'REGISTRATION_PENDING' || result.type === 'SIGNUP_SUCCESS')) {
        console.log('✅ Registration successful, auth system will handle redirect');
        
        // Don't show success screen - let navigation handle the redirect
        // The user is now logged in with isPendingApproval: true
        // Navigation component will automatically redirect to approval page
        return;
      }

      console.log('⚠️ Unexpected registration result:', result);
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle signup error from Redux
  useEffect(() => {
    if (signUpError) {
      setError(signUpError);
    } else {
      setError(null);
    }
  }, [signUpError]);

  // Show loading state while data is loading
  if (dataLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="ant-spin ant-spin-lg">
          <span className="ant-spin-dot ant-spin-dot-spin">
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
          </span>
        </div>
        <Text style={{ color: '#6b7280', fontSize: '16px' }}>
          กำลังโหลดข้อมูลสำหรับการสมัครสมาชิก...
        </Text>
      </div>
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

      {/* User Type Selection */}
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

      {/* Information Alert */}
      <Alert
        message={userType === 'new' ? 'สำหรับพนักงานใหม่' : 'สำหรับพนักงานเดิม'}
        description={
          userType === 'new' 
            ? 'ระบบจะส่งข้อมูลของคุณไปยังผู้จัดการสาขาเพื่อยืนยันข้อมูลและอนุมัติการเข้าใช้งาน'
            : 'ระบบจะตรวจสอบข้อมูลของคุณกับฐานข้อมูลพนักงานและดำเนินการอนุมัติ'
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
            description={error}
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
        {/* Hidden field for userType */}
        <Form.Item name="userType" initialValue={userType} style={{ display: 'none' }}>
          <Input type="hidden" />
        </Form.Item>

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
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {Object.entries(provincesToShow).map(([key, province]) => (
                  <Option key={key} value={key}>
                    {province.name || province.nameTh || key}
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
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                  <Option key={key} value={key.toLowerCase()}>
                    {dept.name || dept.nameTh}
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
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={selectedProvince ? "ไม่พบสาขาในจังหวัดนี้" : "กรุณาเลือกจังหวัดก่อน"}
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

        {/* Employee ID for existing employees */}
        {userType === 'existing' && (
          <>
            <Divider orientation="left">ข้อมูลเพิ่มเติม</Divider>
            <Form.Item
              name="employeeId"
              label="รหัสพนักงาน (ทางเลือก)"
              help="กรอกรหัสพนักงานเพื่อความแม่นยำในการตรวจสอบ"
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