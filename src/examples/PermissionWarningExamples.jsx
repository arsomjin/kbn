/**
 * Permission Warning System Examples
 * 
 * Comprehensive examples showing how to implement user-friendly
 * permission warnings across different components and scenarios.
 */

import React, { useState } from 'react';
import { Card, Space, Divider, Typography, Row, Col, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined 
} from '@ant-design/icons';

// Import permission components and utilities
import PermissionGate from '../components/PermissionGate';
import PermissionButton, { 
  ApproveButton, 
  EditButton, 
  DeleteButton, 
  CreateButton, 
  ViewButton 
} from '../components/PermissionButton';
import { 
  showPermissionWarning, 
  showPermissionAlert,
  withPermissionCheck,
  PermissionChecker 
} from '../utils/permissionWarnings';
import { usePermissions } from '../hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;

const PermissionWarningExamples = () => {
  const [selectedItem, setSelectedItem] = useState({ id: 1, status: 'draft' });
  const { hasPermission, userRBAC } = usePermissions();

  // Example: Basic permission warning
  const handleBasicAction = () => {
    showPermissionWarning('NO_PERMISSION', {
      context: 'ตัวอย่างการแสดงข้อความเตือนพื้นฐาน'
    });
  };

  // Example: Custom warning message
  const handleCustomWarning = () => {
    showPermissionWarning('NO_PERMISSION', {
      customMessage: {
        title: 'ไม่สามารถเข้าถึงข้อมูลลูกค้า',
        description: 'คุณต้องได้รับอนุญาตจากผู้จัดการสาขาก่อนเข้าถึงข้อมูลลูกค้า'
      },
      context: 'กรุณาติดต่อผู้จัดการสาขาของคุณ'
    });
  };

  // Example: Geographic permission warning
  const handleGeographicWarning = () => {
    showPermissionWarning('WRONG_BRANCH', {
      context: 'คุณพยายามเข้าถึงข้อมูลของสาขา NSN001 แต่คุณมีสิทธิ์เฉพาะสาขา 0450'
    });
  };

  // Example: Status-based warning
  const handleStatusWarning = () => {
    showPermissionWarning('ITEM_ALREADY_APPROVED', {
      context: 'เอกสารเลขที่ ACC-001 ได้รับการอนุมัติแล้วเมื่อ 15/12/2024'
    });
  };

  // Example: Alert modal instead of notification
  const handleAlertWarning = () => {
    showPermissionAlert('CANNOT_DELETE', {
      context: 'เอกสารนี้เชื่อมโยงกับรายการอื่น ๆ ในระบบ',
      onOk: () => console.log('User acknowledged the warning')
    });
  };

  // Example: Higher-order function with permission check
  const protectedAction = withPermissionCheck(
    () => {
      console.log('Action executed successfully!');
      // Actual action logic here
    },
    () => hasPermission('accounting.approve'),
    'CANNOT_APPROVE',
    {
      context: 'ต้องการสิทธิ์ accounting.approve เพื่อดำเนินการนี้'
    }
  );

  // Example: Using PermissionChecker utility
  const handleEditWithChecker = () => {
    if (PermissionChecker.canEdit(userRBAC, selectedItem)) {
      console.log('Edit action allowed');
      // Proceed with edit
    }
    // Warning is automatically shown by PermissionChecker
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🚨 Permission Warning System Examples</Title>
      <Paragraph>
        ตัวอย่างการใช้งานระบบเตือนสิทธิ์การเข้าถึงที่เป็นมิตรกับผู้ใช้
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* Basic Warning Examples */}
        <Col xs={24} lg={12}>
          <Card title="🔔 Basic Warning Notifications" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button onClick={handleBasicAction} block>
                แสดงข้อความเตือนพื้นฐาน
              </Button>
              
              <Button onClick={handleCustomWarning} block>
                แสดงข้อความเตือนแบบกำหนดเอง
              </Button>
              
              <Button onClick={handleGeographicWarning} block>
                แสดงข้อความเตือนสิทธิ์พื้นที่
              </Button>
              
              <Button onClick={handleStatusWarning} block>
                แสดงข้อความเตือนสถานะเอกสาร
              </Button>
              
              <Button onClick={handleAlertWarning} block>
                แสดงข้อความเตือนแบบ Modal
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Permission Buttons */}
        <Col xs={24} lg={12}>
          <Card title="🔘 Permission-Aware Buttons" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <ApproveButton 
                permission="accounting.approve"
                onClick={() => console.log('Approve clicked')}
                block
              />
              
              <EditButton 
                permission="accounting.edit"
                onClick={() => console.log('Edit clicked')}
                block
              />
              
              <DeleteButton 
                permission="accounting.delete"
                onClick={() => console.log('Delete clicked')}
                block
              />
              
              <CreateButton 
                permission="accounting.create"
                onClick={() => console.log('Create clicked')}
                block
              />
              
              <ViewButton 
                permission="accounting.view"
                onClick={() => console.log('View clicked')}
                block
              />
            </Space>
          </Card>
        </Col>

        {/* Custom Permission Button */}
        <Col xs={24} lg={12}>
          <Card title="⚙️ Custom Permission Button" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <PermissionButton
                permission="sales.approve"
                authority="BRANCH_MANAGER"
                type="primary"
                icon={<CheckCircleOutlined />}
                warningType="CANNOT_APPROVE"
                onClick={() => console.log('Sales approval')}
                block
              >
                อนุมัติการขาย (ต้องการสิทธิ์ผู้จัดการ)
              </PermissionButton>
              
              <PermissionButton
                anyOf={['inventory.view', 'inventory.edit']}
                type="default"
                icon={<EyeOutlined />}
                warningMessage="คุณต้องมีสิทธิ์เข้าถึงระบบคลังสินค้า"
                onClick={() => console.log('Inventory access')}
                block
              >
                เข้าถึงข้อมูลคลังสินค้า
              </PermissionButton>
              
              <PermissionButton
                permission="service.delete"
                geographic={{ branchCode: 'NSN001' }}
                type="danger"
                icon={<DeleteOutlined />}
                warningType="WRONG_BRANCH"
                hideWhenDenied={true}
                onClick={() => console.log('Service delete')}
                block
              >
                ลบข้อมูลบริการ (เฉพาะสาขา NSN001)
              </PermissionButton>
            </Space>
          </Card>
        </Col>

        {/* Permission Gates */}
        <Col xs={24} lg={12}>
          <Card title="🚪 Permission Gates" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <PermissionGate permission="accounting.view">
                <div style={{ 
                  padding: '12px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  ✅ คุณมีสิทธิ์ดูข้อมูลบัญชี
                </div>
              </PermissionGate>
              
              <PermissionGate 
                permission="admin.system"
                fallback={
                  <div style={{ 
                    padding: '12px', 
                    background: '#fff2f0', 
                    border: '1px solid #ffccc7',
                    borderRadius: '6px'
                  }}>
                    ❌ คุณไม่มีสิทธิ์เข้าถึงการตั้งค่าระบบ
                  </div>
                }
              >
                <div style={{ 
                  padding: '12px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  ✅ คุณมีสิทธิ์เข้าถึงการตั้งค่าระบบ
                </div>
              </PermissionGate>
              
              <PermissionGate 
                authority="PROVINCE_MANAGER"
                showFallback={false}
              >
                <div style={{ 
                  padding: '12px', 
                  background: '#e6f7ff', 
                  border: '1px solid #91d5ff',
                  borderRadius: '6px'
                }}>
                  🏢 เนื้อหาสำหรับผู้จัดการจังหวัดเท่านั้น
                </div>
              </PermissionGate>
            </Space>
          </Card>
        </Col>

        {/* Advanced Examples */}
        <Col xs={24}>
          <Card title="🎯 Advanced Permission Scenarios" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="Higher-Order Function">
                  <Button onClick={protectedAction} block>
                    Protected Action (HOF)
                  </Button>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ใช้ withPermissionCheck wrapper
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card size="small" title="Permission Checker Utility">
                  <Button onClick={handleEditWithChecker} block>
                    Edit with Checker
                  </Button>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ใช้ PermissionChecker.canEdit()
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card size="small" title="Multiple Conditions">
                  <PermissionButton
                    allOf={['accounting.view', 'accounting.edit']}
                    authority="BRANCH_MANAGER"
                    geographic={{ branchCode: '0450' }}
                    warningMessage="ต้องการสิทธิ์หลายประการพร้อมกัน"
                    onClick={() => console.log('Complex permission')}
                    block
                  >
                    Complex Permission
                  </PermissionButton>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ตรวจสอบหลายเงื่อนไขพร้อมกัน
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* User Status Display */}
        <Col xs={24}>
          <Card title="👤 Current User Status" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Authority Level: </Text>
                <Text code>{userRBAC?.authority || 'Unknown'}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Departments: </Text>
                <Text code>{userRBAC?.departments?.join(', ') || 'Unknown'}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Is Active: </Text>
                <Text code>{userRBAC?.isActive ? 'Yes' : 'No'}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Is Dev: </Text>
                <Text code>{userRBAC?.isDev ? 'Yes' : 'No'}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />
      
      <Card title="📋 Implementation Guide" size="small">
        <Paragraph>
          <Title level={4}>การใช้งานระบบเตือนสิทธิ์:</Title>
          <ul>
            <li><strong>showPermissionWarning()</strong> - แสดงการแจ้งเตือนแบบ notification</li>
            <li><strong>showPermissionAlert()</strong> - แสดงการแจ้งเตือนแบบ modal</li>
            <li><strong>PermissionButton</strong> - ปุ่มที่ตรวจสอบสิทธิ์อัตโนมัติ</li>
            <li><strong>PermissionGate</strong> - ซ่อน/แสดงเนื้อหาตามสิทธิ์</li>
            <li><strong>withPermissionCheck()</strong> - HOF สำหรับ wrap functions</li>
            <li><strong>PermissionChecker</strong> - Utility functions สำหรับตรวจสอบสิทธิ์</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default PermissionWarningExamples; 