/**
 * Document Approval Flow Example
 * 
 * Comprehensive example demonstrating the complete document approval flow
 * integration with LayoutWithRBAC for different document types.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  message,
  Tag,
  Alert
} from 'antd';
import { 
  FileTextOutlined, 
  DollarOutlined, 
  ToolOutlined, 
  InboxOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { DocumentWorkflowWrapper, ApprovalStatusBadge, ApprovalHistory } from '../components/DocumentApprovalFlow';
import { usePermissions } from '../hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Mock data for demonstration
 */
const MOCK_DOCUMENTS = {
  'invoice': {
    id: 'INV-2024-001',
    type: 'invoice',
    status: 'draft',
    currentStep: 0,
    customerName: 'บริษัท ABC จำกัด',
    amount: 150000,
    dueDate: dayjs().add(30, 'days').valueOf(),
    description: 'ขายรถแทรกเตอร์ Kubota M7040',
    createdAt: dayjs().subtract(2, 'hours').valueOf(),
    lastModifiedAt: dayjs().subtract(1, 'hour').valueOf()
  },
  'sales_order': {
    id: 'SO-2024-001',
    type: 'sales_order',
    status: 'price_review',
    currentStep: 1,
    customerName: 'นายสมชาย ใจดี',
    vehicleModel: 'Kubota M6040',
    quantity: 1,
    unitPrice: 1200000,
    totalAmount: 1200000,
    specialDiscount: 50000,
    createdAt: dayjs().subtract(1, 'day').valueOf(),
    lastModifiedAt: dayjs().subtract(2, 'hours').valueOf()
  },
  'service_order': {
    id: 'SRV-2024-001',
    type: 'service_order',
    status: 'assessed',
    currentStep: 1,
    customerName: 'นายประยุทธ์ ทำนา',
    vehicleModel: 'Kubota L4508',
    serviceType: 'ซ่อมเครื่องยนต์',
    estimatedCost: 25000,
    estimatedHours: 8,
    description: 'เครื่องยนต์ติดยาก เสียงดังผิดปกติ',
    createdAt: dayjs().subtract(3, 'hours').valueOf(),
    lastModifiedAt: dayjs().subtract(1, 'hour').valueOf()
  },
  'inventory_import': {
    id: 'IMP-2024-001',
    type: 'inventory_import',
    status: 'inspection',
    currentStep: 1,
    supplierName: 'Kubota Corporation',
    itemCount: 50,
    totalValue: 2500000,
    description: 'นำเข้าอะไหล่เครื่องยนต์',
    expectedDate: dayjs().add(7, 'days').valueOf(),
    createdAt: dayjs().subtract(1, 'day').valueOf(),
    lastModifiedAt: dayjs().subtract(4, 'hours').valueOf()
  }
};

/**
 * Mock audit trail data
 */
const MOCK_AUDIT_TRAIL = [
  {
    id: 'audit_1',
    action: 'create',
    time: dayjs().subtract(2, 'hours').valueOf(),
    userInfo: { name: 'สมชาย ใจดี', employeeCode: 'EMP001' },
    notes: 'สร้างเอกสารใหม่',
    geographic: { branchCode: '0450', provinceId: 'NMA' }
  },
  {
    id: 'audit_2',
    action: 'update',
    time: dayjs().subtract(1, 'hour').valueOf(),
    userInfo: { name: 'สุดา ขยัน', employeeCode: 'EMP002' },
    notes: 'แก้ไขข้อมูลลูกค้า',
    geographic: { branchCode: '0450', provinceId: 'NMA' }
  }
];

/**
 * Document Form Components
 */
const InvoiceForm = ({ documentData, onSave, permissions, isLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentData) {
      form.setFieldsValue({
        customerName: documentData.customerName,
        amount: documentData.amount,
        dueDate: documentData.dueDate ? dayjs(documentData.dueDate) : null,
        description: documentData.description
      });
    }
  }, [documentData, form]);

  const handleSubmit = async (values) => {
    const updatedData = {
      ...documentData,
      ...values,
      dueDate: values.dueDate ? values.dueDate.valueOf() : null,
      lastModifiedAt: Date.now()
    };
    
    if (onSave) {
      await onSave(updatedData);
    }
  };

  return (
    <Card title="ข้อมูลใบแจ้งหนี้" icon={<FileTextOutlined />}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={!permissions?.canEdit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="ชื่อลูกค้า"
              rules={[{ required: true, message: 'กรุณาระบุชื่อลูกค้า' }]}
            >
              <Input placeholder="ระบุชื่อลูกค้า" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="จำนวนเงิน (บาท)"
              rules={[{ required: true, message: 'กรุณาระบุจำนวนเงิน' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="วันที่ครบกำหนด"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่ครบกำหนด' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="รายละเอียด"
        >
          <TextArea rows={3} placeholder="ระบุรายละเอียดเพิ่มเติม" />
        </Form.Item>

        {permissions?.canEdit && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              บันทึกข้อมูล
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};

const SalesOrderForm = ({ documentData, onSave, permissions, isLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (documentData) {
      form.setFieldsValue({
        customerName: documentData.customerName,
        vehicleModel: documentData.vehicleModel,
        quantity: documentData.quantity,
        unitPrice: documentData.unitPrice,
        specialDiscount: documentData.specialDiscount
      });
    }
  }, [documentData, form]);

  const handleSubmit = async (values) => {
    const totalAmount = (values.quantity * values.unitPrice) - (values.specialDiscount || 0);
    const updatedData = {
      ...documentData,
      ...values,
      totalAmount,
      lastModifiedAt: Date.now()
    };
    
    if (onSave) {
      await onSave(updatedData);
    }
  };

  return (
    <Card title="ใบสั่งขาย" icon={<DollarOutlined />}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={!permissions?.canEdit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="ชื่อลูกค้า"
              rules={[{ required: true, message: 'กรุณาระบุชื่อลูกค้า' }]}
            >
              <Input placeholder="ระบุชื่อลูกค้า" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vehicleModel"
              label="รุ่นรถแทรกเตอร์"
              rules={[{ required: true, message: 'กรุณาเลือกรุ่นรถ' }]}
            >
              <Select placeholder="เลือกรุ่นรถ">
                <Option value="Kubota M6040">Kubota M6040</Option>
                <Option value="Kubota M7040">Kubota M7040</Option>
                <Option value="Kubota L4508">Kubota L4508</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="quantity"
              label="จำนวน"
              rules={[{ required: true, message: 'กรุณาระบุจำนวน' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="unitPrice"
              label="ราคาต่อหน่วย (บาท)"
              rules={[{ required: true, message: 'กรุณาระบุราคา' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="specialDiscount"
              label="ส่วนลดพิเศษ (บาท)"
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        {permissions?.canEdit && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              บันทึกข้อมูล
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};

/**
 * Main Example Component
 */
const DocumentApprovalFlowExample = () => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('invoice');
  const [documentData, setDocumentData] = useState(MOCK_DOCUMENTS.invoice);
  const { userRBAC } = usePermissions();

  // Handle document type change
  const handleDocumentTypeChange = (type) => {
    setSelectedDocumentType(type);
    setDocumentData(MOCK_DOCUMENTS[type]);
  };

  // Mock document save function
  const handleDocumentSave = async (updatedData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDocumentData(updatedData);
    message.success('บันทึกเอกสารเรียบร้อย');
    
    console.log('Document saved:', updatedData);
  };

  // Mock document load function
  const handleDocumentLoad = async (documentId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_DOCUMENTS[selectedDocumentType];
  };

  // Render document form based on type
  const renderDocumentForm = (props) => {
    switch (selectedDocumentType) {
      case 'invoice':
        return <InvoiceForm {...props} />;
      case 'sales_order':
        return <SalesOrderForm {...props} />;
      case 'service_order':
        return (
          <Card title="ใบสั่งซ่อม" icon={<ToolOutlined />}>
            <Alert
              message="Service Order Form"
              description="This would be the service order form component"
              type="info"
              showIcon
            />
          </Card>
        );
      case 'inventory_import':
        return (
          <Card title="ใบนำเข้าสินค้า" icon={<InboxOutlined />}>
            <Alert
              message="Inventory Import Form"
              description="This would be the inventory import form component"
              type="info"
              showIcon
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined /> Document Approval Flow Example
        </Title>
        <Paragraph>
          ตัวอย่างการใช้งานระบบอนุมัติเอกสารแบบครบวงจร พร้อมการผสานรวมกับ LayoutWithRBAC
        </Paragraph>

        {/* Document Type Selector */}
        <div style={{ marginTop: '16px' }}>
          <Text strong>เลือกประเภทเอกสาร: </Text>
          <Select
            value={selectedDocumentType}
            onChange={handleDocumentTypeChange}
            style={{ width: '200px', marginLeft: '8px' }}
          >
            <Option value="invoice">
              <FileTextOutlined /> ใบแจ้งหนี้
            </Option>
            <Option value="sales_order">
              <DollarOutlined /> ใบสั่งขาย
            </Option>
            <Option value="service_order">
              <ToolOutlined /> ใบสั่งซ่อม
            </Option>
            <Option value="inventory_import">
              <InboxOutlined /> ใบนำเข้าสินค้า
            </Option>
          </Select>
        </div>

        {/* Current Document Status */}
        <div style={{ marginTop: '16px' }}>
          <Space>
            <Text strong>สถานะปัจจุบัน:</Text>
            <ApprovalStatusBadge status={documentData.status} />
            <Text type="secondary">
              เอกสารเลขที่: {documentData.id}
            </Text>
          </Space>
        </div>

        {/* User Info */}
        <div style={{ marginTop: '16px' }}>
          <Space>
            <UserOutlined />
            <Text strong>ผู้ใช้งาน:</Text>
            <Text>{userRBAC?.displayName || 'ไม่ระบุ'}</Text>
            <Tag color="blue">{userRBAC?.accessLevel || 'ไม่ระบุสิทธิ์'}</Tag>
          </Space>
        </div>
      </Card>

      {/* Document Workflow */}
      <DocumentWorkflowWrapper
        documentId={documentData.id}
        documentType={selectedDocumentType}
        documentData={documentData}
        onDocumentSave={handleDocumentSave}
        onDocumentLoad={handleDocumentLoad}
        title={`จัดการ${documentData.id}`}
        subtitle={`${selectedDocumentType} Management`}
        showApprovalFlow={true}
        showStepper={true}
        showAuditTrail={true}
      >
        {renderDocumentForm}
      </DocumentWorkflowWrapper>

      {/* Additional Examples */}
      <Card 
        title="ตัวอย่างการใช้งานเพิ่มเติม" 
        style={{ marginTop: '24px' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="Approval History">
              <ApprovalHistory
                auditTrail={MOCK_AUDIT_TRAIL}
                statusHistory={[]}
                compact={true}
                maxItems={5}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Status Examples">
              <Space direction="vertical" style={{ width: '100%' }}>
                <ApprovalStatusBadge status="draft" />
                <ApprovalStatusBadge status="review" />
                <ApprovalStatusBadge status="approved" />
                <ApprovalStatusBadge status="rejected" />
                <ApprovalStatusBadge status="completed" />
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Implementation Notes */}
      <Card 
        title="หมายเหตุการใช้งาน" 
        style={{ marginTop: '24px' }}
      >
        <Alert
          message="การใช้งานระบบอนุมัติเอกสาร"
          description={
            <div>
              <p><strong>1. DocumentWorkflowWrapper:</strong> ใช้สำหรับการผสานรวมกับ LayoutWithRBAC อย่างสมบูรณ์</p>
              <p><strong>2. การตรวจสอบสิทธิ์:</strong> ระบบจะตรวจสอบสิทธิ์อัตโนมัติตามประเภทเอกสาร</p>
              <p><strong>3. Audit Trail:</strong> บันทึกการเปลี่ยนแปลงทั้งหมดพร้อมข้อมูลผู้ใช้และที่ตั้ง</p>
              <p><strong>4. Permission Warnings:</strong> แสดงคำเตือนเมื่อผู้ใช้ไม่มีสิทธิ์</p>
              <p><strong>5. Responsive Design:</strong> รองรับการใช้งานบนอุปกรณ์ทุกขนาด</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default DocumentApprovalFlowExample;