import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Alert, Divider } from 'antd';
import AntdFormWrapper from 'components/enhanced/AntdFormWrapper';
import { usePermissions } from 'hooks/usePermissions';

const { Title, Text } = Typography;

/**
 * Example showing how to replace Formik forms with AntdFormWrapper
 * This demonstrates the modernization approach for Phase 2
 */
const ModernizedFormExample = () => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions();

  // Example form fields configuration
  const userFormFields = [
    {
      name: 'firstName',
      label: 'ชื่อ',
      type: 'text',
      required: true,
      rules: [
        { min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }
      ]
    },
    {
      name: 'lastName',
      label: 'นามสกุล',
      type: 'text',
      required: true,
      rules: [
        { min: 2, message: 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร' }
      ]
    },
    {
      name: 'email',
      label: 'อีเมล',
      type: 'email',
      required: true,
      rules: [
        { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
      ]
    },
    {
      name: 'phoneNumber',
      label: 'เบอร์โทรศัพท์',
      type: 'text',
      rules: [
        { pattern: /^[0-9-+().\s]+$/, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' }
      ]
    },
    {
      type: 'group',
      fields: [
        {
          name: 'province',
          label: 'จังหวัด',
          type: 'province',
          required: true,
          span: 12,
          permission: 'admin.view' // Only show if user has admin.view permission
        },
        {
          name: 'branch',
          label: 'สาขา',
          type: 'branch',
          required: true,
          span: 12,
          dependencies: ['province'] // Branch depends on province selection
        }
      ]
    },
    {
      name: 'department',
      label: 'แผนก',
      type: 'select',
      required: true,
      options: [
        { value: 'sales', label: 'ฝ่ายขาย' },
        { value: 'service', label: 'ฝ่ายบริการ' },
        { value: 'accounting', label: 'ฝ่ายบัญชี' },
        { value: 'warehouse', label: 'ฝ่ายคลังสินค้า' }
      ]
    },
    {
      name: 'startDate',
      label: 'วันที่เริ่มงาน',
      type: 'date',
      required: true
    },
    {
      name: 'salary',
      label: 'เงินเดือน',
      type: 'number',
      permission: 'hr.view_salary', // Only show if user can view salary
      rules: [
        { type: 'number', min: 0, message: 'เงินเดือนต้องไม่น้อยกว่า 0' }
      ]
    },
    {
      name: 'isActive',
      label: 'สถานะการใช้งาน',
      type: 'switch'
    },
    {
      name: 'permissions',
      label: 'สิทธิ์การเข้าถึง',
      type: 'select',
      mode: 'multiple',
      permission: 'admin.edit',
      options: [
        { value: 'sales.view', label: 'ดูข้อมูลการขาย' },
        { value: 'sales.edit', label: 'แก้ไขข้อมูลการขาย' },
        { value: 'service.view', label: 'ดูข้อมูลบริการ' },
        { value: 'service.edit', label: 'แก้ไขข้อมูลบริการ' },
        { value: 'accounting.view', label: 'ดูข้อมูลบัญชี' },
        { value: 'accounting.edit', label: 'แก้ไขข้อมูลบัญชี' }
      ]
    },
    {
      name: 'notes',
      label: 'หมายเหตุ',
      type: 'textarea',
      placeholder: 'ข้อมูลเพิ่มเติม...'
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted with values:', values);
      setFormData(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>📋 Modernized Form Example</Title>
      <Text type="secondary">
        Example showing replacement of Formik forms with AntdFormWrapper (Phase 2 Integration)
      </Text>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* Before - Old Formik Code */}
        <Col span={24}>
          <Alert
            message="🔄 Migration Process"
            description={
              <div>
                <strong>Before (Formik):</strong>
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '8px' }}>
{`import { Formik, Form, Field } from 'formik';
import { Selector } from 'elements';
import BranchSelector from 'components/BranchSelector';

<Formik initialValues={{}} onSubmit={handleSubmit}>
  {({ setFieldValue, errors }) => (
    <Form>
      <Field name="branch">
        {({ field: { value } }) => (
          <BranchSelector
            value={value}
            onChange={val => setFieldValue('branch', val)}
            error={errors.branch}
          />
        )}
      </Field>
    </Form>
  )}
</Formik>`}
                </pre>
                <strong>After (AntdFormWrapper):</strong>
                <pre style={{ background: '#f0f9ff', padding: '8px', borderRadius: '4px', marginTop: '8px' }}>
{`import AntdFormWrapper from 'components/enhanced/AntdFormWrapper';

<AntdFormWrapper
  fields={[
    {
      name: 'branch',
      label: 'สาขา',
      type: 'branch', // Built-in RBAC support
      required: true
    }
  ]}
  onFinish={handleSubmit}
  respectRBAC={true}
/>`}
                </pre>
              </div>
            }
            type="info"
            showIcon
          />
        </Col>

        {/* Live Form Example */}
        <Col span={24}>
          <Card title="🚀 Enhanced User Form (RBAC Integrated)" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <AntdFormWrapper
              fields={userFormFields}
              onFinish={handleSubmit}
              loading={loading}
              respectRBAC={true}
              submitText="บันทึกข้อมูลผู้ใช้"
              showResetButton={true}
              initialValues={{
                firstName: 'สมชาย',
                lastName: 'ใจดี',
                email: 'somchai@kbn.co.th',
                isActive: true,
                department: 'sales'
              }}
            />
          </Card>
        </Col>

        {/* Form Result Display */}
        {formData && (
          <Col span={24}>
            <Card title="✅ Form Submission Result" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
                {JSON.stringify(formData, null, 2)}
              </pre>
            </Card>
          </Col>
        )}

        {/* RBAC Features Demo */}
        <Col span={24}>
          <Card title="🔐 RBAC Features Demonstration">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={4}>Permission-Based Field Visibility</Title>
                <Text>
                  • <strong>Province/Branch fields:</strong> Only visible if user has 'admin.view' permission<br/>
                  • <strong>Salary field:</strong> Only visible if user has 'hr.view_salary' permission<br/>
                  • <strong>Permissions field:</strong> Only visible if user has 'admin.edit' permission
                </Text>
              </div>
              
              <Divider />
              
              <div>
                <Title level={4}>Geographic Filtering</Title>
                <Text>
                  • Branch selector automatically filters based on user's allowed provinces<br/>
                  • Province selector shows only accessible provinces<br/>
                  • Data is filtered according to user's geographic access level
                </Text>
              </div>
              
              <Divider />
              
              <div>
                <Title level={4}>Current User Permissions</Title>
                <Space wrap>
                  <Text type={hasPermission('admin.view') ? 'success' : 'secondary'}>
                    admin.view: {hasPermission('admin.view') ? '✅' : '❌'}
                  </Text>
                  <Text type={hasPermission('hr.view_salary') ? 'success' : 'secondary'}>
                    hr.view_salary: {hasPermission('hr.view_salary') ? '✅' : '❌'}
                  </Text>
                  <Text type={hasPermission('admin.edit') ? 'success' : 'secondary'}>
                    admin.edit: {hasPermission('admin.edit') ? '✅' : '❌'}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Migration Benefits */}
        <Col span={24}>
          <Card title="🎯 Migration Benefits">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Title level={3} style={{ color: '#1890ff' }}>90%</Title>
                  <Text>Less Code Required</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Title level={3} style={{ color: '#52c41a' }}>Built-in</Title>
                  <Text>RBAC Integration</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Title level={3} style={{ color: '#722ed1' }}>Modern</Title>
                  <Text>Ant Design UI</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModernizedFormExample; 