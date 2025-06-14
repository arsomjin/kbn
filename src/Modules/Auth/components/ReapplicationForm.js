import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Alert, 
  Divider,
  Steps,
  Row,
  Col,
  message,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  SendOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  BankOutlined
} from '@ant-design/icons';
import { app } from '../../../firebase';
import { 
  getDepartmentName,
  getProvinceName,
  getBranchName,
  getUserTypeName,
  getStaticProvinces,
  getDefaultBranches,
  normalizeProvinceKey
} from '../../../utils/mappings';
import HiddenItem from 'components/HiddenItem';
import { DEPARTMENTS } from '../../../data/permissions';

// Import glassmorphism styles
import '../../../styles/glassmorphism-system.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReapplicationForm = ({ user, rejectionData, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get unified data from mappings.js
  const staticProvinces = getStaticProvinces();
  const branchesToShow = getDefaultBranches(selectedProvince);

  // Handle province change (from EnhancedSignUp pattern)
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ branch: undefined });
    form.setFields([{ name: 'province', errors: [] }]);
  };

  // Parse rejection reason to identify specific issues
  const parseRejectionReason = (reason) => {
    const issues = [];
    if (reason.includes('ข้อมูลไม่ครบถ้วน')) issues.push('incomplete_data');
    if (reason.includes('แผนกไม่ถูกต้อง')) issues.push('invalid_department');
    if (reason.includes('สาขาไม่ถูกต้อง')) issues.push('invalid_branch');
    if (reason.includes('รหัสพนักงาน')) issues.push('invalid_employee_code');
    if (reason.includes('บัญชีผู้ใช้ซ้ำ')) issues.push('duplicate_account');
    return issues;
  };

  const rejectionIssues = parseRejectionReason(rejectionData?.rejectionReason || '');

  // Department options based on RBAC system
  const DEPARTMENT_OPTIONS = [
    { value: 'SALES', label: 'ฝ่ายขาย', icon: '💼' },
    { value: 'SERVICE', label: 'ฝ่ายบริการ', icon: '🔧' },
    { value: 'PARTS', label: 'ฝ่ายอะไหล่', icon: '⚙️' },
    { value: 'ACCOUNTING', label: 'ฝ่ายบัญชี', icon: '💰' },
    { value: 'WAREHOUSE', label: 'ฝ่ายคลังสินค้า', icon: '📦' },
    { value: 'HR', label: 'ฝ่ายทรัพยากรบุคคล', icon: '👥' },
    { value: 'MANAGEMENT', label: 'ฝ่ายบริหาร', icon: '👨‍💼' }
  ];

  // User type options
  const USER_TYPE_OPTIONS = [
    { value: 'existing', label: 'พนักงานเดิม', description: 'มีรหัสพนักงานในระบบแล้ว' },
    { value: 'new', label: 'พนักงานใหม่', description: 'เข้าทำงานใหม่' },
    // { value: 'contractor', label: 'พนักงานสัญญาจ้าง', description: 'ทำงานตามสัญญา' }
  ];

  // Initialize form with existing user data
  useEffect(() => {
    if (user) {
      const userProvince = user.access?.geographic?.homeProvince || user.homeProvince || '';
      const userBranch = user.access?.geographic?.homeBranch || user.homeBranch || '';
      
      // Use unified normalization function
      const normalizedProvince = normalizeProvinceKey(userProvince);
      
      console.log('🔄 Initializing form with user data:', {
        userProvince,
        userBranch,
        normalizedProvince
      });
      
      form.setFieldsValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        employeeCode: user.employeeCode || '',
        userType: user.userType || 'new',
        department: user.access?.departments?.[0] || user.department || '',
        province: normalizedProvince, // Use normalized key
        branch: userBranch || '', // Keep original code for branch selector
        improvementNote: '' // New field for user to explain improvements
      });
      
      setSelectedProvince(normalizedProvince);
    }
  }, [user, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Submitting reapplication with values:', values);

      // Create enhanced RBAC structure for reapplication
      const enhancedAccess = {
        authority: 'STAFF', // Default to staff level for new applications
        departments: [values.department],
        geographic: {
          scope: 'BRANCH',
          homeProvince: values.province,
          homeBranch: values.branch,
          allowedProvinces: [values.province],
          allowedBranches: [values.branch]
        },
        status: 'reapplied',
        reappliedAt: Date.now(),
        previousRejection: {
          reason: rejectionData?.rejectionReason,
          rejectedAt: rejectionData?.rejectedAt,
          improvements: values.improvementNote
        }
      };

      // Prepare user data for reapplication
      const reapplicationData = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.toLowerCase().trim(),
        phoneNumber: values.phoneNumber?.trim() || '',
        employeeCode: values.employeeCode?.trim() || '',
        userType: values.userType,
        
        // Enhanced RBAC structure
        access: enhancedAccess,
        
        // Legacy compatibility fields
        department: values.department,
        homeProvince: values.province,
        homeBranch: values.branch,
        
        // Application status
        approvalStatus: 'pending',
        isPendingApproval: true,
        isApproved: false,
        isActive: false,
        
        // Reapplication metadata
        isReapplication: true,
        reappliedAt: Date.now(),
        previousRejectionData: {
          reason: rejectionData?.rejectionReason || 'ไม่ได้ระบุเหตุผล',
          rejectedAt: rejectionData?.rejectedAt || Date.now(),
          rejectedBy: rejectionData?.rejectedBy || rejectionData?.rejectorName || 'ระบบ'
        },
        improvementNote: values.improvementNote,
        
        // Clear rejection flags
        rejectedAt: null,
        rejectionReason: null,
        rejectedBy: null,
        
        // Update timestamps
        updatedAt: Date.now(),
        lastModified: Date.now()
      };

      console.log('📊 Reapplication data prepared:', reapplicationData);

      // Create new approval request
      const approvalRequestData = {
        userId: user.uid,
        userData: reapplicationData,
        requestType: 'reapplication',
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        
        // Geographic data for admin filtering
        targetProvince: values.province,
        targetBranch: values.branch,
        targetDepartment: values.department,
        
        // Reapplication specific data
        previousRejection: {
          reason: rejectionData?.rejectionReason || 'ไม่ได้ระบุเหตุผล',
          rejectedAt: rejectionData?.rejectedAt || Date.now(),
          rejectedBy: rejectionData?.rejectedBy || rejectionData?.rejectorName || 'ระบบ'
        },
        improvementNote: values.improvementNote,
        
        // Request metadata
        requestSource: 'reapplication_form',
        browserInfo: {
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      console.log('📝 Creating approval request:', approvalRequestData);

      // Batch update: User document + Approval request
      const batch = app.firestore().batch();

      // Update user document
      const userRef = app.firestore().collection('users').doc(user.uid);
      batch.update(userRef, reapplicationData);

      // Create new approval request
      const approvalRef = app.firestore().collection('approvalRequests').doc();
      batch.set(approvalRef, approvalRequestData);

      // Execute batch
      await batch.commit();

      console.log('✅ Reapplication submitted successfully!');
      
      message.success('ส่งคำขออนุมัติใหม่เรียบร้อยแล้ว');
      
      // Show success message and redirect after delay
      Modal.success({
        title: 'ส่งคำขออนุมัติสำเร็จ!',
        content: (
          <div>
            <Paragraph>คำขออนุมัติใหม่ของคุณได้ถูกส่งไปยังผู้ดูแลระบบแล้ว</Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              <strong>ระยะเวลาการพิจารณา:</strong> 1-3 วันทำการ
            </Paragraph>
          </div>
        ),
        onOk: () => {
          if (onSuccess) {
            onSuccess(reapplicationData);
          } else {
            // Refresh page to show pending status
            window.location.reload();
          }
        }
      });

    } catch (error) {
      console.error('❌ Error submitting reapplication:', error);
      message.error('เกิดข้อผิดพลาดในการส่งคำขออนุมัติ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    form.validateFields().then(values => {
      setPreviewData(values);
      setShowPreview(true);
    }).catch(error => {
      console.log('Form validation failed:', error);
      message.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    });
  };

  // Steps for the reapplication process
  const steps = [
    {
      title: 'ปรับปรุงข้อมูล',
      description: 'แก้ไขข้อมูลตามที่แจ้งไว้',
      icon: <UserOutlined />
    },
    {
      title: 'ตรวจสอบข้อมูล',
      description: 'ตรวจสอบความถูกต้อง',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'ส่งคำขออนุมัติ',
      description: 'ส่งคำขออนุมัติใหม่',
      icon: <SendOutlined />
    }
  ];

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#2d5016', marginBottom: '8px' }}>
          ส่งคำขออนุมัติใหม่
        </Title>
        <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
          แก้ไขข้อมูลตามที่แจ้งไว้และส่งคำขออนุมัติใหม่
        </Text>
      </div>

      {/* Steps */}
      <Steps
        current={currentStep}
        items={steps}
        style={{ marginBottom: '32px' }}
      />

      {/* Rejection Reason Alert */}
      <Alert
        message="เหตุผลที่ถูกปฏิเสธครั้งก่อน"
        description={rejectionData?.rejectionReason || 'ไม่ได้ระบุเหตุผล'}
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
        icon={<ExclamationCircleOutlined />}
      />

      {/* Improvement Guidelines */}
      {rejectionIssues.length > 0 && (
        <Card 
          size="small" 
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span>คำแนะนำในการปรับปรุง</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
            {rejectionIssues.includes('incomplete_data') && (
              <li>กรอกข้อมูลให้ครบถ้วนทุกช่องที่จำเป็น</li>
            )}
            {rejectionIssues.includes('invalid_department') && (
              <li>เลือกแผนกที่ตรงกับตำแหน่งงานจริง</li>
            )}
            {rejectionIssues.includes('invalid_branch') && (
              <li>เลือกสาขาที่ตรงกับสถานที่ปฏิบัติงาน</li>
            )}
            {rejectionIssues.includes('invalid_employee_code') && (
              <li>ตรวจสอบรหัสพนักงานให้ถูกต้อง</li>
            )}
            {rejectionIssues.includes('duplicate_account') && (
              <li>ใช้อีเมลที่ไม่ซ้ำกับบัญชีที่มีอยู่</li>
            )}
          </ul>
        </Card>
      )}

      {/* Main Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
        className="reapplication-form"
      >
        <HiddenItem name="rejectedBy" />
        <Row gutter={[24, 20]} style={{ marginBottom: '16px' }}>
          {/* Personal Information */}
          <Col xs={24} md={12}>
            <Form.Item
              label="ชื่อ"
              name="firstName"
              rules={[
                { required: true, message: 'กรุณากรอกชื่อ' },
                { min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="ชื่อจริง"
                className={rejectionIssues.includes('incomplete_data') ? 'highlight-field' : ''}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[
                { required: true, message: 'กรุณากรอกนามสกุล' },
                { min: 2, message: 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="นามสกุล"
                className={rejectionIssues.includes('incomplete_data') ? 'highlight-field' : ''}
              />
            </Form.Item>
          </Col>

          {/* Contact Information */}
          <Col xs={24} md={12}>
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                { required: true, message: 'กรุณากรอกอีเมล' },
                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="อีเมล"
                disabled={true} // Usually can't change email
                className={rejectionIssues.includes('duplicate_account') ? 'highlight-field' : ''}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phoneNumber"
              rules={[
                { pattern: /^[0-9]{9,10}$/, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="เบอร์โทรศัพท์"
                className={rejectionIssues.includes('incomplete_data') ? 'highlight-field' : ''}
              />
            </Form.Item>
          </Col>

          {/* Employee Information */}
          <Col xs={24} md={12}>
            <Form.Item
              label="รหัสพนักงาน (ถ้ามี)"
              name="employeeCode"
            >
              <Input 
                prefix={<IdcardOutlined />} 
                placeholder="รหัสพนักงาน"
                className={rejectionIssues.includes('invalid_employee_code') ? 'highlight-field' : ''}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="ประเภทพนักงาน"
              name="userType"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทพนักงาน' }]}
            >
              <Select placeholder="เลือกประเภทพนักงาน">
                {USER_TYPE_OPTIONS.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div>
                      <div>{type.label}</div>
                      <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {type.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Department */}
          <Col xs={24}>
            <Form.Item
              label="แผนก"
              name="department"
              rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}
            >
              <Select 
                placeholder="เลือกแผนก"
                className={rejectionIssues.includes('invalid_department') ? 'highlight-field' : ''}
              >
                {DEPARTMENT_OPTIONS.map(dept => (
                  <Option key={dept.value} value={dept.value}>
                    <Space>
                      <span>{dept.icon}</span>
                      <span>{dept.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Geographic Information */}
          <Col xs={24} md={12}>
            <Form.Item
              label="จังหวัด"
              name="province"
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
                className={rejectionIssues.includes('invalid_branch') ? 'highlight-field' : ''}
              >
                {Object.entries(staticProvinces).map(([key, province]) => (
                  <Option key={key} value={key}>
                    {province.name || province.nameTh || key}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="สาขา"
              name="branch"
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
                className={rejectionIssues.includes('invalid_branch') ? 'highlight-field' : ''}
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
          </Col>

          {/* Improvement Note */}
          <Col xs={24}>
            <Form.Item
              label="หมายเหตุการปรับปรุง"
              name="improvementNote"
              rules={[
                { required: true, message: 'กรุณาระบุการปรับปรุงที่ได้ทำ' },
                { min: 20, message: 'กรุณาอธิบายการปรับปรุงอย่างน้อย 20 ตัวอักษร (ปัจจุบัน: ${value?.length || 0} ตัวอักษร)' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="อธิบายการปรับปรุงหรือแก้ไขที่คุณได้ทำตามที่ได้รับแจ้ง... (ต้องมีอย่างน้อย 20 ตัวอักษร)&#10;&#10;ตัวอย่าง: ได้แก้ไขแผนกจาก 'ฝ่ายขาย' เป็น 'ฝ่ายบัญชี' ตามตำแหน่งงานจริง และเปลี่ยนสาขาเป็นสาขาที่ปฏิบัติงานจริง"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Divider />
        <Row justify="space-between" align="middle" style={{ marginTop: '24px' }}>
          <Col xs={24} sm={8} md={6}>
            <Button 
              onClick={onCancel} 
              disabled={loading}
              size="large"
              style={{ width: '100%' }}
            >
              ยกเลิก
            </Button>
          </Col>
          <Col xs={24} sm={16} md={18} style={{ textAlign: 'right' }}>
            <Space size="middle" wrap>
              <Button 
                type="default" 
                onClick={handlePreview}
                disabled={loading}
                size="large"
                style={{ minWidth: '120px' }}
              >
                ตรวจสอบข้อมูล
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                size="large"
                className="nature-login-button"
                style={{ minWidth: '180px' }}
              >
                ส่งคำขออนุมัติใหม่
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* Preview Modal */}
      <Modal
        title="ตรวจสอบข้อมูลก่อนส่ง"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="back" onClick={() => setShowPreview(false)}>
            แก้ไข
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => {
              setShowPreview(false);
              form.submit();
            }}
            icon={<SendOutlined />}
          >
            ยืนยันส่งคำขอ
          </Button>
        ]}
        width={600}
      >
        {previewData && (
          <div>
            <Title level={4}>ข้อมูลที่จะส่ง:</Title>
            <Row gutter={[16, 8]}>
              <Col span={12}><strong>ชื่อ-นามสกุล:</strong></Col>
              <Col span={12}>{previewData.firstName} {previewData.lastName}</Col>
              
              <Col span={12}><strong>อีเมล:</strong></Col>
              <Col span={12}>{previewData.email}</Col>
              
              <Col span={12}><strong>เบอร์โทร:</strong></Col>
              <Col span={12}>{previewData.phoneNumber || 'ไม่ระบุ'}</Col>
              
              <Col span={12}><strong>รหัสพนักงาน:</strong></Col>
              <Col span={12}>{previewData.employeeCode || 'ไม่ระบุ'}</Col>
              
              <Col span={12}><strong>ประเภทพนักงาน:</strong></Col>
              <Col span={12}>{getUserTypeName(previewData.userType)}</Col>
              
              <Col span={12}><strong>แผนก:</strong></Col>
              <Col span={12}>{getDepartmentName(previewData.department)}</Col>
              
              <Col span={12}><strong>จังหวัด:</strong></Col>
              <Col span={12}>{getProvinceName(previewData.province)}</Col>
              
              <Col span={12}><strong>สาขา:</strong></Col>
              <Col span={12}>{getBranchName(previewData.branch)}</Col>
            </Row>
            
            <Divider />
            <div>
              <strong>หมายเหตุการปรับปรุง:</strong>
              <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {previewData.improvementNote}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

ReapplicationForm.propTypes = {
  user: PropTypes.object.isRequired,
  rejectionData: PropTypes.shape({
    rejectionReason: PropTypes.string,
    rejectedAt: PropTypes.number,
    rejectedBy: PropTypes.string,
    rejectorName: PropTypes.string
  }).isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

ReapplicationForm.defaultProps = {
  onSuccess: null,
  onCancel: null
};

export default ReapplicationForm; 