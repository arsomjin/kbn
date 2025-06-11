/**
 * Clean Slate Layout Demo
 * Demonstrates LayoutWithRBAC with enhanced ProvinceId injection
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  Alert, 
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tag,
  Descriptions,
  Steps,
  Timeline,
  Divider
} from 'antd';
import { 
  GlobalOutlined, 
  BankOutlined, 
  SaveOutlined,
  EyeOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import { getProvinceName, getBranchName } from 'utils/mappings';
import PropTypes from 'prop-types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DEMO_STEPS = [
  { title: 'Geographic Selection', description: 'เลือกจังหวัดและสาขา' },
  { title: 'Data Entry', description: 'บันทึกข้อมูลทดสอบ' },
  { title: 'Enhancement Preview', description: 'ดู Enhanced Data' },
  { title: 'Submission', description: 'บันทึกข้อมูลพร้อม Audit Trail' }
];

const CleanSlateLayoutDemoContent = ({ geographic, auditTrail, canEdit, stepperInfo }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [demoConfig, setDemoConfig] = useState({
    requireBranch: false,
    autoInject: true,
    showAuditTrail: true,
    showStepper: true
  });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [enhancedPreview, setEnhancedPreview] = useState(null);

  // Handle form submission with enhanced data
  const handleSubmit = useCallback(async (values) => {
    if (!geographic) {
      console.error('Geographic context not available');
      return;
    }

    console.log('🔍 Original form values:', values);
    
    // Test data enhancement
    const enhancedData = geographic.enhanceDataForSubmission(values);
    console.log('✨ Enhanced data:', enhancedData);
    
    setEnhancedPreview(enhancedData);
    setCurrentStep(2);

    // Test audit trail if available
    if (auditTrail && auditTrail.saveWithAuditTrail) {
      try {
        const result = await auditTrail.saveWithAuditTrail({
          collection: 'test/clean-slate-demo',
          data: enhancedData,
          isEdit: false,
          notes: 'Clean Slate Layout Demo - ทดสอบระบบ ProvinceId Injection'
        });
        
        setSubmissionResult(result);
        setCurrentStep(3);
        console.log('💾 Audit trail result:', result);
      } catch (error) {
        console.error('❌ Audit trail error:', error);
      }
    }
  }, [geographic, auditTrail]);

  // Preview enhanced data without submitting
  const previewEnhancedData = useCallback(() => {
    const values = form.getFieldsValue();
    if (!geographic) return;
    
    const enhanced = geographic.enhanceDataForSubmission(values);
    setEnhancedPreview(enhanced);
    setCurrentStep(2);
  }, [form, geographic]);

  // Reset demo
  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setSubmissionResult(null);
    setEnhancedPreview(null);
    form.resetFields();
  }, [form]);

  // Geographic info display
  const geographicInfo = geographic ? {
    selectedProvince: geographic.selectedProvince,
    selectedBranch: geographic.selectedBranch,
    provinceName: geographic.provinceName,
    branchName: geographic.branchName,
    provinceId: geographic.provinceId,
    branchCode: geographic.branchCode,
    hasEnhancement: !!geographic.enhanceDataForSubmission,
    hasFilters: !!geographic.getQueryFilters,
    hasSubmissionData: !!geographic.getSubmissionData
  } : null;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      
      {/* Layout Configuration Demo */}
      <Alert
        message="LayoutWithRBAC - Enhanced ProvinceId Injection Demo"
        description="ทดสอบการทำงานของ Layout component ใหม่ที่มี ProvinceId injection, Audit Trail, และ Workflow Stepper"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />

      {/* Demo Configuration */}
      <Card title={<><SettingOutlined /> Demo Configuration</>} size="small">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Require Branch Selection:</Text>
                <Switch 
                  size="small"
                  checked={demoConfig.requireBranch}
                  onChange={(checked) => setDemoConfig(prev => ({ ...prev, requireBranch: checked }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Auto Inject ProvinceId:</Text>
                <Switch 
                  size="small"
                  checked={demoConfig.autoInject}
                  onChange={(checked) => setDemoConfig(prev => ({ ...prev, autoInject: checked }))}
                />
              </div>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Show Audit Trail:</Text>
                <Switch 
                  size="small"
                  checked={demoConfig.showAuditTrail}
                  onChange={(checked) => setDemoConfig(prev => ({ ...prev, showAuditTrail: checked }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Show Stepper:</Text>
                <Switch 
                  size="small"
                  checked={demoConfig.showStepper}
                  onChange={(checked) => setDemoConfig(prev => ({ ...prev, showStepper: checked }))}
                />
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={resetDemo} size="small">
                Reset Demo
              </Button>
              <Button onClick={previewEnhancedData} size="small" icon={<EyeOutlined />}>
                Preview Enhanced Data
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Geographic Context Display */}
      {geographicInfo && (
        <Card title={<><GlobalOutlined /> Geographic Context (Auto-injected Props)</>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Selected Province">
                  <Space>
                    <Tag color="blue">{geographicInfo.selectedProvince}</Tag>
                    <Text type="secondary">({geographicInfo.provinceName})</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Selected Branch">
                  <Space>
                    <Tag color="green">{geographicInfo.selectedBranch}</Tag>
                    <Text type="secondary">({geographicInfo.branchName})</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Auto-injected ProvinceId">
                  <Tag color="purple">{geographicInfo.provinceId || 'Not set'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Auto-injected BranchCode">
                  <Tag color="orange">{geographicInfo.branchCode || 'Not set'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Available Enhancement Functions:</Text>
                <Space direction="vertical" size="small">
                  <div>
                    <CheckCircleOutlined style={{ color: geographicInfo.hasEnhancement ? '#52c41a' : '#d9d9d9' }} />
                    <Text style={{ marginLeft: 8 }}>enhanceDataForSubmission()</Text>
                  </div>
                  <div>
                    <CheckCircleOutlined style={{ color: geographicInfo.hasFilters ? '#52c41a' : '#d9d9d9' }} />
                    <Text style={{ marginLeft: 8 }}>getQueryFilters()</Text>
                  </div>
                  <div>
                    <CheckCircleOutlined style={{ color: geographicInfo.hasSubmissionData ? '#52c41a' : '#d9d9d9' }} />
                    <Text style={{ marginLeft: 8 }}>getSubmissionData()</Text>
                  </div>
                  <div>
                    <CheckCircleOutlined style={{ color: auditTrail ? '#52c41a' : '#d9d9d9' }} />
                    <Text style={{ marginLeft: 8 }}>auditTrail.saveWithAuditTrail()</Text>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Demo Form */}
      <Card title={<><ThunderboltOutlined /> Test Data Entry Form</>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            customerName: 'ทดสอบ ระบบใหม่',
            amount: 50000,
            description: 'ทดสอบระบบ Clean Slate RBAC',
            itemType: 'vehicle'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                <Input placeholder="ชื่อลูกค้า" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="จำนวนเงิน"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="itemType" label="Item Type">
                <Select placeholder="ประเภทสินค้า">
                  <Option value="vehicle">รถยนต์</Option>
                  <Option value="parts">อะไหล่</Option>
                  <Option value="service">บริการ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="รายละเอียด" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Submit with Enhancement
              </Button>
              <Button onClick={previewEnhancedData} icon={<EyeOutlined />}>
                Preview Only
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Enhanced Data Preview */}
      {enhancedPreview && (
        <Card title="✨ Enhanced Data Preview">
          <Alert
            message="Data Enhancement Result"
            description="ข้อมูลต้นฉบับถูกเพิ่ม provinceId, branchCode และ geographicContext อัตโนมัติ"
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Original Data:</Text>
              <pre style={{ 
                background: '#f6f8fa', 
                padding: '12px', 
                borderRadius: '4px', 
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {JSON.stringify(form.getFieldsValue(), null, 2)}
              </pre>
            </Col>
            <Col span={12}>
              <Text strong>Enhanced Data:</Text>
              <pre style={{ 
                background: '#f0f9ff', 
                padding: '12px', 
                borderRadius: '4px', 
                fontSize: '12px',
                marginTop: '8px',
                border: '1px solid #1890ff'
              }}>
                {JSON.stringify(enhancedPreview, null, 2)}
              </pre>
            </Col>
          </Row>
        </Card>
      )}

      {/* Audit Trail Result */}
      {submissionResult && (
        <Card title="💾 Audit Trail Submission Result">
          <Alert
            message="Data Saved Successfully with Audit Trail"
            description="ข้อมูลถูกบันทึกพร้อม Audit Trail และ Geographic Context"
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <pre style={{ 
            background: '#f6ffed', 
            padding: '16px', 
            borderRadius: '6px', 
            fontSize: '12px',
            border: '1px solid #52c41a'
          }}>
            {JSON.stringify(submissionResult, null, 2)}
          </pre>
        </Card>
      )}

      {/* Implementation Guide */}
      <Card title="📖 Implementation Guide">
        <Timeline>
          <Timeline.Item color="blue">
            <strong>Step 1: Wrap with LayoutWithRBAC</strong>
            <Paragraph code>
              {`<LayoutWithRBAC
  title="Your Page Title"
  permission="department.action"
  autoInjectProvinceId={true}
  showAuditTrail={true}
>
  <YourComponent />
</LayoutWithRBAC>`}
            </Paragraph>
          </Timeline.Item>
          
          <Timeline.Item color="green">
            <strong>Step 2: Use Geographic Props</strong>
            <Paragraph code>
              {`const YourComponent = ({ geographic, auditTrail }) => {
  // Access auto-injected geographic data
  console.log(geographic.provinceId);     // Auto-injected
  console.log(geographic.branchCode);     // Auto-injected
  
  // Enhance data before submission
  const enhanced = geographic.enhanceDataForSubmission(formData);
}`}
            </Paragraph>
          </Timeline.Item>
          
          <Timeline.Item color="purple">
            <strong>Step 3: Enhanced Data Submission</strong>
            <Paragraph code>
              {`const handleSubmit = async (data) => {
  const enhanced = geographic.enhanceDataForSubmission(data);
  // enhanced now contains: provinceId, branchCode, geographicContext
  
  if (auditTrail) {
    await auditTrail.saveWithAuditTrail({
      collection: 'your-collection',
      data: enhanced,
      notes: 'Your operation description'
    });
  }
}`}
            </Paragraph>
          </Timeline.Item>
        </Timeline>
      </Card>

    </Space>
  );
};

CleanSlateLayoutDemoContent.propTypes = {
  geographic: PropTypes.object,
  auditTrail: PropTypes.object,
  canEdit: PropTypes.bool,
  stepperInfo: PropTypes.object
};

const CleanSlateLayoutDemo = () => {
  const [layoutConfig, setLayoutConfig] = useState({
    requireBranchSelection: false,
    autoInjectProvinceId: true,
    showAuditTrail: true,
    showStepper: true
  });

  const handleGeographicChange = useCallback((geoContext) => {
    console.log('🌍 Geographic context changed in demo:', geoContext);
  }, []);

  return (
    <LayoutWithRBAC
      title="Clean Slate Layout Demo"
      subtitle="Enhanced ProvinceId Injection & Audit Trail"
      permission="admin.view"
      requireBranchSelection={layoutConfig.requireBranchSelection}
      autoInjectProvinceId={layoutConfig.autoInjectProvinceId}
      showAuditTrail={layoutConfig.showAuditTrail}
      showStepper={layoutConfig.showStepper}
      steps={DEMO_STEPS}
      currentStep={0}
      documentId="clean-slate-layout-demo"
      documentType="demo"
      onBranchChange={handleGeographicChange}
      showGeographicSelector={true}
    >
      <CleanSlateLayoutDemoContent />
    </LayoutWithRBAC>
  );
};

export default CleanSlateLayoutDemo; 