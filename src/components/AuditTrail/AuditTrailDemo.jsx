import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Switch,
  message,
  Divider,
  Select,
  InputNumber,
  Tabs
} from 'antd';
import { 
  SaveOutlined, 
  EditOutlined, 
  CheckOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';

import AuditHistory from './AuditHistory';
import AuditTrailSection from './AuditTrailSection';
import { useAuditTrail } from './useAuditTrail';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../PermissionGate';
import ResponsiveStepper from '../ResponsiveStepper';
import AuditTrailStepper from '../AuditTrailStepper';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AuditTrailDemo = ({ 
  documentId = 'demo-doc-001',
  documentType = 'demo-document'
}) => {
  const [form] = Form.useForm();
  const [documentData, setDocumentData] = useState({
    title: 'เอกสารตัวอย่าง',
    description: 'รายละเอียดเอกสารตัวอย่างสำหรับทดสอบ Audit Trail',
    amount: 10000,
    status: 'draft'
  });
  const [oldData, setOldData] = useState(documentData);

  // Configuration
  const [showGeographicInfo, setShowGeographicInfo] = useState(true);
  const [showChangeDetails, setShowChangeDetails] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // ResponsiveStepper Demo States
  const [currentStep, setCurrentStep] = useState(0);
  const [stepperTheme, setStepperTheme] = useState('default');
  const [stepperDirection, setStepperDirection] = useState('horizontal');
  const [stepperSize, setStepperSize] = useState('default');
  const [showStepperDescription, setShowStepperDescription] = useState(true);
  const [showStepperProgress, setShowStepperProgress] = useState(true);
  const [stepperResponsive, setStepperResponsive] = useState(true);

  // Audit Trail Hook
  const {
    auditTrail,
    statusHistory,
    loading,
    error,
    addAuditEntry,
    addStatusEntry,
    saveWithAuditTrail,
    clearAll,
    canPerformAction,
    canViewAuditTrail
  } = useAuditTrail({
    documentId,
    documentType,
    config: {
      showChangeHistory: true,
      showAuditDetails: true,
      showGeographicInfo: true
    }
  });

  // Permissions
  const { hasPermission, userRole } = usePermissions();

  // Sample steps for different scenarios
  const documentSteps = [
    { 
      title: 'บันทึกรายการ', 
      description: 'กรอกข้อมูลเอกสาร',
      status: 'completed' 
    },
    { 
      title: 'ตรวจสอบ', 
      description: 'ผู้จัดการตรวจสอบความถูกต้อง',
      status: currentStep >= 1 ? 'completed' : 'pending'
    },
    { 
      title: 'อนุมัติ', 
      description: 'ผู้มีอำนาจอนุมัติเอกสาร',
      status: currentStep >= 2 ? 'completed' : 'pending'
    },
    { 
      title: 'เสร็จสิ้น', 
      description: 'เอกสารผ่านการอนุมัติแล้ว',
      status: currentStep >= 3 ? 'completed' : 'pending'
    }
  ];

  const serviceSteps = [
    { title: 'รับงาน', description: 'รับงานเข้าระบบ' },
    { title: 'ดำเนินการ', description: 'ช่างปฏิบัติงาน' },
    { title: 'ตรวจงาน', description: 'หัวหน้าช่างตรวจงาน' },
    { title: 'ส่งมอบ', description: 'ส่งมอบงานให้ลูกค้า' }
  ];

  // Simulate user info
  const getCurrentUser = () => ({
    uid: 'user-001',
    displayName: 'ทดสอบ ผู้ใช้งาน',
    name: 'ทดสอบ ผู้ใช้งาน',
    email: 'test@example.com',
    employeeCode: 'BAS00001',
    department: 'IT'
  });

  // Stepper handlers
  const handleStepClick = (stepIndex) => {
    console.log('Step clicked:', stepIndex);
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
      
      // Add audit entry for step change
      const currentUser = getCurrentUser();
      addAuditEntry(
        currentUser.uid,
        'step_change',
        currentUser,
        { currentStep },
        { currentStep: stepIndex },
        { documentId, documentType },
        null,
        `เปลี่ยนขั้นตอนเป็น: ${documentSteps[stepIndex]?.title}`
      );
    }
  };

  const advanceStep = () => {
    if (currentStep < documentSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Add audit entry for step advancement
      const currentUser = getCurrentUser();
      addAuditEntry(
        currentUser.uid,
        'step_advance',
        currentUser,
        { currentStep },
        { currentStep: newStep },
        { documentId, documentType },
        null,
        `ก้าวหน้าไปยังขั้นตอน: ${documentSteps[newStep]?.title}`
      );
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      // Add audit entry for step regression
      const currentUser = getCurrentUser();
      addAuditEntry(
        currentUser.uid,
        'step_back',
        currentUser,
        { currentStep },
        { currentStep: newStep },
        { documentId, documentType },
        null,
        `ย้อนกลับไปยังขั้นตอน: ${documentSteps[newStep]?.title}`
      );
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
    
    // Add audit entry for step reset
    const currentUser = getCurrentUser();
    addAuditEntry(
      currentUser.uid,
      'step_reset',
      currentUser,
      { currentStep },
      { currentStep: 0 },
      { documentId, documentType },
      null,
      'รีเซ็ตขั้นตอนกลับไปจุดเริ่มต้น'
    );
  };

  // Handle form submission
  const handleSave = async (values) => {
    try {
      const currentUser = getCurrentUser();
      const isEdit = JSON.stringify(documentData) !== JSON.stringify(oldData);
      
      // Update document data
      setOldData(documentData);
      setDocumentData({ ...documentData, ...values });

      // Add audit entry
      addAuditEntry(
        currentUser.uid,
        isEdit ? 'update' : 'create',
        currentUser,
        oldData,
        { ...documentData, ...values },
        { documentId, documentType },
        null,
        `${isEdit ? 'แก้ไข' : 'สร้าง'}เอกสาร: ${values.title}`
      );

      // Add status entry if status changed
      if (values.status && values.status !== documentData.status) {
        addStatusEntry(
          currentUser.uid,
          values.status,
          currentUser,
          `เปลี่ยนสถานะเป็น ${values.status}`
        );
      }

      message.success(isEdit ? 'บันทึกการแก้ไขเรียบร้อย' : 'สร้างเอกสารเรียบร้อย');
    } catch (err) {
      message.error('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Handle approval
  const handleApprove = (entry) => {
    const currentUser = getCurrentUser();
    
    // Add audit entry for approval
    addAuditEntry(
      currentUser.uid,
      'approve',
      currentUser,
      {},
      {},
      { documentId, documentType },
      null,
      'อนุมัติเอกสาร'
    );

    setDocumentData({ ...documentData, status: 'approved' });
    message.success('อนุมัติเอกสารเรียบร้อย');
  };

  // Handle document actions
  const handleAction = (action) => {
    const currentUser = getCurrentUser();
    
    addAuditEntry(
      currentUser.uid,
      action,
      currentUser,
      documentData,
      { ...documentData, status: action === 'delete' ? 'deleted' : action },
      { documentId, documentType },
      null,
      `ดำเนินการ: ${action}`
    );

    if (action === 'submit') {
      addStatusEntry(
        currentUser.uid,
        'submitted',
        currentUser,
        'ส่งเอกสารเพื่ออนุมัติ'
      );
      setDocumentData({ ...documentData, status: 'submitted' });
    }

    message.success(`ดำเนินการ ${action} เรียบร้อย`);
  };

  return (
    <div className="p-6">
      <Title level={2}>🧾 Audit Trail & ResponsiveStepper Demo with RBAC Integration</Title>
      
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="🧾 Audit Trail Demo" key="1">
          {/* Demo Controls */}
          <Card className="mb-6">
            <Title level={4}>การควบคุมการแสดงผล Audit Trail</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Space>
                  <Text>แสดงข้อมูลภูมิศาสตร์:</Text>
                  <Switch 
                    checked={showGeographicInfo} 
                    onChange={setShowGeographicInfo}
                  />
                </Space>
              </Col>
              <Col span={8}>
                <Space>
                  <Text>แสดงรายละเอียดการเปลี่ยนแปลง:</Text>
                  <Switch 
                    checked={showChangeDetails} 
                    onChange={setShowChangeDetails}
                  />
                </Space>
              </Col>
              <Col span={8}>
                <Space>
                  <Text>โหมดกะทัดรัด:</Text>
                  <Switch 
                    checked={compactMode} 
                    onChange={setCompactMode}
                  />
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <Space>
              <Text strong>สิทธิ์ปัจจุบัน:</Text>
              <Text>Role: {userRole}</Text>
              <Text>•</Text>
              <Text>Can View Audit: {canViewAuditTrail() ? '✅' : '❌'}</Text>
              <Text>•</Text>
              <Text>Can Edit: {canPerformAction('update', 'accounting') ? '✅' : '❌'}</Text>
              <Text>•</Text>
              <Text>Can Approve: {canPerformAction('approve', 'accounting') ? '✅' : '❌'}</Text>
            </Space>
          </Card>

      <Row gutter={16}>
        {/* Document Form */}
        <Col span={12}>
          <Card title="📝 แบบฟอร์มเอกสาร">
            <Form
              form={form}
              layout="vertical"
              initialValues={documentData}
              onFinish={handleSave}
            >
              <Form.Item
                name="title"
                label="ชื่อเอกสาร"
                rules={[{ required: true, message: 'กรุณากรอกชื่อเอกสาร' }]}
              >
                <Input placeholder="กรอกชื่อเอกสาร" />
              </Form.Item>

              <Form.Item
                name="description"
                label="รายละเอียด"
              >
                <TextArea rows={3} placeholder="กรอกรายละเอียดเอกสาร" />
              </Form.Item>

              <Form.Item
                name="amount"
                label="จำนวนเงิน"
                rules={[{ required: true, message: 'กรุณากรอกจำนวนเงิน' }]}
              >
                <Input type="number" placeholder="กรอกจำนวนเงิน" />
              </Form.Item>

              {/* Audit Trail Section */}
              <PermissionGate permission="accounting.view">
                <AuditTrailSection
                  canEditEditedBy={hasPermission('accounting.edit')}
                  canEditReviewedBy={hasPermission('accounting.review')}
                  canEditApprovedBy={hasPermission('accounting.approve')}
                />
              </PermissionGate>

              {/* Action Buttons */}
              <div className="mt-6">
                <Space>
                  <PermissionGate permission="accounting.edit">
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      htmlType="submit"
                      loading={loading}
                    >
                      บันทึก
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="accounting.edit">
                    <Button 
                      icon={<EditOutlined />}
                      onClick={() => handleAction('submit')}
                      disabled={documentData.status === 'submitted'}
                    >
                      ส่งเอกสาร
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="accounting.approve">
                    <Button 
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleAction('approve')}
                      disabled={documentData.status === 'approved'}
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                      อนุมัติ
                    </Button>
                  </PermissionGate>

                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={clearAll}
                  >
                    ล้างข้อมูล Audit
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Audit History */}
        <Col span={12}>
          <Card title="📊 ประวัติการตรวจสอบ">
            <AuditHistory
              auditTrail={auditTrail}
              statusHistory={statusHistory}
              loading={loading}
              error={error}
              onApprove={handleApprove}
              showGeographicInfo={showGeographicInfo}
              showChangeDetails={showChangeDetails}
              compact={compactMode}
            />
          </Card>
        </Col>
      </Row>

          {/* Current Status */}
          <Card className="mt-6">
            <Title level={4}>📋 ข้อมูลเอกสารปัจจุบัน</Title>
            <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
              {JSON.stringify(documentData, null, 2)}
            </pre>
          </Card>
        </TabPane>

        <TabPane tab="📊 ResponsiveStepper Demo" key="2">
          {/* Stepper Controls */}
          <Card className="mb-6">
            <Title level={4}>การควบคุมการแสดงผล ResponsiveStepper</Title>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Text strong>ธีม:</Text>
                <Select 
                  value={stepperTheme} 
                  onChange={setStepperTheme} 
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Option value="default">Default</Option>
                  <Option value="minimal">Minimal</Option>
                  <Option value="modern">Modern</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Text strong>ทิศทาง:</Text>
                <Select 
                  value={stepperDirection} 
                  onChange={setStepperDirection} 
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Option value="horizontal">แนวนอน</Option>
                  <Option value="vertical">แนวตั้ง</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Text strong>ขนาด:</Text>
                <Select 
                  value={stepperSize} 
                  onChange={setStepperSize} 
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Option value="default">ปกติ</Option>
                  <Option value="small">เล็ก</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Text strong>ขั้นตอนปัจจุบัน:</Text>
                <InputNumber 
                  min={0} 
                  max={documentSteps.length - 1}
                  value={currentStep} 
                  onChange={setCurrentStep} 
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={6}>
                <Space direction="vertical">
                  <Text strong>แสดงคำอธิบาย:</Text>
                  <Switch checked={showStepperDescription} onChange={setShowStepperDescription} />
                </Space>
              </Col>
              <Col span={6}>
                <Space direction="vertical">
                  <Text strong>แสดง Progress Bar:</Text>
                  <Switch checked={showStepperProgress} onChange={setShowStepperProgress} />
                </Space>
              </Col>
              <Col span={6}>
                <Space direction="vertical">
                  <Text strong>Responsive:</Text>
                  <Switch checked={stepperResponsive} onChange={setStepperResponsive} />
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <Button onClick={previousStep} disabled={currentStep === 0}>
                    ก่อนหน้า
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={advanceStep} 
                    disabled={currentStep === documentSteps.length - 1}
                  >
                    ถัดไป
                  </Button>
                  <Button onClick={resetSteps}>รีเซ็ต</Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Demo 1: Document Process with Audit Integration */}
          <Card title="Demo 1: ขั้นตอนการดำเนินการเอกสาร (พร้อม Audit Trail)" style={{ marginBottom: '24px' }}>
            <ResponsiveStepper
              steps={documentSteps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              auditInfo={auditTrail?.filter(entry => entry.action.includes('step'))}
              responsive={stepperResponsive}
              showDescription={showStepperDescription}
              showProgress={showStepperProgress}
              theme={stepperTheme}
              direction={stepperDirection}
              size={stepperSize}
            />
          </Card>

          {/* Demo 2: Service Process */}
          <Card title="Demo 2: ขั้นตอนการบริการ (แบบง่าย)" style={{ marginBottom: '24px' }}>
            <ResponsiveStepper
              steps={serviceSteps}
              currentStep={Math.min(currentStep, serviceSteps.length - 1)}
              responsive={stepperResponsive}
              showDescription={showStepperDescription}
              showProgress={showStepperProgress}
              theme={stepperTheme}
              direction={stepperDirection}
              size={stepperSize}
            />
          </Card>

          {/* Demo 3: Minimal Theme */}
          <Card title="Demo 3: Minimal Theme" style={{ marginBottom: '24px' }}>
            <ResponsiveStepper
              steps={[
                { title: 'เริ่มต้น' },
                { title: 'ดำเนินการ' },
                { title: 'เสร็จสิ้น' }
              ]}
              currentStep={1}
              theme="minimal"
              responsive={stepperResponsive}
              showDescription={false}
            />
          </Card>

          {/* Demo 4: Modern Theme */}
          <Card title="Demo 4: Modern Theme" style={{ marginBottom: '24px' }}>
            <ResponsiveStepper
              steps={[
                { title: 'วางแผน', description: 'กำหนดแผนการดำเนินงาน' },
                { title: 'ปฏิบัติ', description: 'ดำเนินการตามแผน' },
                { title: 'ประเมิน', description: 'ประเมินผลการดำเนินงาน' },
                { title: 'ปรับปรุง', description: 'ปรับปรุงและพัฒนา' }
              ]}
              currentStep={2}
              theme="modern"
              responsive={stepperResponsive}
              showDescription={showStepperDescription}
            />
          </Card>

          {/* Mobile Preview */}
          <Card title="Preview บนมือถือ (Responsive)" style={{ marginBottom: '24px' }}>
            <div style={{ 
              maxWidth: '375px', 
              margin: '0 auto', 
              border: '2px solid #d9d9d9', 
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: '#fafafa'
            }}>
              <ResponsiveStepper
                steps={documentSteps}
                currentStep={currentStep}
                responsive={true}
                showDescription={true}
                showProgress={true}
                theme="default"
              />
            </div>
          </Card>

          {/* Usage Guide */}
          <Card title="การใช้งาน ResponsiveStepper">
            <pre style={{ 
              backgroundColor: '#f6f8fa', 
              padding: '16px', 
              borderRadius: '6px', 
              overflow: 'auto' 
            }}>
{`import { ResponsiveStepper } from 'components';

const steps = [
  { 
    title: 'บันทึกรายการ', 
    description: 'กรอกข้อมูลรายรับประจำวัน' 
  },
  { 
    title: 'ตรวจสอบ', 
    description: 'ผู้จัดการตรวจสอบความถูกต้อง' 
  },
  { 
    title: 'อนุมัติ', 
    description: 'ผู้มีอำนาจอนุมัติเอกสาร' 
  }
];

<ResponsiveStepper
  steps={steps}
  currentStep={1}
  onStepClick={(stepIndex) => console.log(stepIndex)}
  responsive={true}
  theme="default"
  showDescription={true}
  showProgress={true}
  auditInfo={auditTrail}
/>
`}
            </pre>
          </Card>
        </TabPane>

        <TabPane tab="📦 Audit Trail Stepper Demo" key="3">
                      {/* Audit Trail Stepper Demo */}
            <Card title="AuditTrailStepper - พื้นที่น้อย ฟีเจอร์เต็ม" style={{ marginBottom: '24px' }}>
              <Typography.Paragraph>
                <Text strong>AuditTrailStepper</Text> ใช้พื้นที่น้อยแต่ยังคงฟีเจอร์ครบครัน 
                ผู้ใช้สามารถคลิกเพื่อขยายดูรายละเอียดเต็มรูปแบบได้
              </Typography.Paragraph>
            
            <AuditTrailStepper
              steps={documentSteps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              auditInfo={auditTrail?.filter(entry => entry.action.includes('step'))}
              status="process"
              showFullByDefault={false}
              compactHeight="56px"
            />
          </Card>

          {/* Show Full by Default */}
          <Card title="แสดงแบบเต็มโดยค่าเริ่มต้น" style={{ marginBottom: '24px' }}>
            <Typography.Paragraph>
              <Text strong>showFullByDefault={`{true}`}</Text> - สำหรับกรณีที่ต้องการแสดงแบบเต็มตั้งแต่เริ่มต้น
            </Typography.Paragraph>
            
            <AuditTrailStepper
              steps={serviceSteps}
              currentStep={Math.min(currentStep, serviceSteps.length - 1)}
              onStepClick={handleStepClick}
              status="process"
              showFullByDefault={true}
              compactHeight="56px"
            />
          </Card>

          {/* Different Heights */}
          <Card title="ความสูงที่แตกต่างกัน" style={{ marginBottom: '24px' }}>
            <Typography.Paragraph>
              <Text strong>compactHeight</Text> - ปรับความสูงของโหมดกะทัดรัดได้
            </Typography.Paragraph>
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title="สูง 48px">
                  <AuditTrailStepper
                    steps={[
                      { title: 'เริ่มต้น' },
                      { title: 'กำลังดำเนินการ' },
                      { title: 'เสร็จสิ้น' }
                    ]}
                    currentStep={1}
                    compactHeight="48px"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="สูง 64px">
                  <AuditTrailStepper
                    steps={[
                      { title: 'เริ่มต้น' },
                      { title: 'กำลังดำเนินการ' },
                      { title: 'เสร็จสิ้น' }
                    ]}
                    currentStep={1}
                    compactHeight="64px"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="สูง 72px">
                  <AuditTrailStepper
                    steps={[
                      { title: 'เริ่มต้น' },
                      { title: 'กำลังดำเนินการ' },
                      { title: 'เสร็จสิ้น' }
                    ]}
                    currentStep={1}
                    compactHeight="72px"
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Usage in Real Scenario */}
          <Card title="การใช้งานจริงในระบบ" style={{ marginBottom: '24px' }}>
            <Typography.Paragraph>
              ตัวอย่างการใช้งานใน LayoutWithRBAC
            </Typography.Paragraph>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e9ecef' 
            }}>
              <AuditTrailStepper
                steps={[
                  { title: 'บันทึกรายรับ', description: 'กรอกข้อมูลรายรับประจำวัน' },
                  { title: 'ตรวจสอบ', description: 'ผู้จัดการตรวจสอบความถูกต้อง' },
                  { title: 'อนุมัติ', description: 'ผู้มีอำนาจอนุมัติเอกสาร' },
                  { title: 'จ่ายเงิน', description: 'ดำเนินการจ่ายเงิน' },
                  { title: 'บันทึกบัญชี', description: 'บันทึกเข้าระบบบัญชี' }
                ]}
                currentStep={currentStep}
                onStepClick={handleStepClick}
                auditInfo={auditTrail?.filter(entry => entry.action.includes('step'))}
                status="process"
              />
            </div>
          </Card>

          {/* Integration Code Example */}
          <Card title="ตัวอย่างโค้ดการใช้งาน">
            <pre style={{ 
              backgroundColor: '#f6f8fa', 
              padding: '16px', 
              borderRadius: '6px', 
              overflow: 'auto' 
            }}>
{`import { AuditTrailStepper } from 'components';

// การใช้งานพื้นฐาน - กะทัดรัด
<AuditTrailStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  auditInfo={auditTrail}
  showFullByDefault={false}
  compactHeight="56px"
/>

// แสดงแบบเต็มตั้งแต่เริ่มต้น
<AuditTrailStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  auditInfo={auditTrail}
  showFullByDefault={true}
/>

// ใน LayoutWithRBAC
<LayoutWithRBAC
  showStepper={true}
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
>
  {/* เนื้อหา */}
</LayoutWithRBAC>
`}
            </pre>
          </Card>

          {/* Benefits */}
          <Card title="ข้อดีของ AuditTrailStepper">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Typography.Title level={5}>🎯 ประหยัดพื้นที่</Typography.Title>
                <ul>
                  <li>ใช้พื้นที่เพียง 56px (ค่าเริ่มต้น)</li>
                  <li>เหมาะสำหรับหน้าจอที่แน่น</li>
                  <li>รองรับทุกขนาดหน้าจอ</li>
                </ul>
              </Col>
              <Col span={12}>
                <Typography.Title level={5}>⚡ ฟีเจอร์ครบครัน</Typography.Title>
                <ul>
                  <li>แสดงขั้นตอนปัจจุบันและความก้าวหน้า</li>
                  <li>ขยายเป็นโหมดเต็มได้</li>
                  <li>รองรับ Audit Trail</li>
                </ul>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Typography.Title level={5}>🔧 ง่ายต่อการใช้งาน</Typography.Title>
                <ul>
                  <li>เปลี่ยนจาก ResponsiveStepper ได้ง่าย</li>
                  <li>API เหมือนกัน</li>
                  <li>Integration ง่าย</li>
                </ul>
              </Col>
              <Col span={12}>
                <Typography.Title level={5}>📱 Mobile-Friendly</Typography.Title>
                <ul>
                  <li>ปรับตัวอัตโนมัติบนมือถือ</li>
                  <li>ใช้งานสะดวกด้วยนิ้ว</li>
                  <li>แสดงผลดีทุกอุปกรณ์</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

AuditTrailDemo.propTypes = {
  documentId: PropTypes.string,
  documentType: PropTypes.string
};

export default AuditTrailDemo; 