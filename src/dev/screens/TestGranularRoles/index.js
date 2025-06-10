import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Alert, 
  Descriptions, 
  List, 
  message,
  Divider,
  Collapse,
  Table
} from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  MenuOutlined,
  SecurityScanOutlined,
  TeamOutlined
} from '@ant-design/icons';

import { usePermissions } from 'hooks/usePermissions';
import { useNavigationGenerator } from 'hooks/useNavigationGenerator';
import PermissionGate, { withPermission } from 'components/PermissionGate';
import { setUserRole } from 'redux/actions/rbac';
import { 
  hasEnhancedPermission, 
  getEffectivePermissions 
} from 'utils/rbac-enhanced';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TestGranularRoles = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [selectedRole, setSelectedRole] = useState('ACCOUNTING_STAFF_SALES_VIEWER');
  
  const { 
    hasPermission, 
    userRole, 
    userPermissions,
    isSuperAdmin 
  } = usePermissions();
  
  const { navigation: filteredNavigation = [] } = useNavigationGenerator();

  // Enhanced component using withPermission HOC
  const ProtectedButton = withPermission({
    permission: 'accounting.edit',
    fallback: <Button disabled>🚫 No Permission</Button>
  })(({ children, ...props }) => (
    <Button type="primary" {...props}>✅ {children}</Button>
  ));

  // Test granular roles
  const granularRoleTests = [
    {
      category: 'Cross-Department Staff',
      description: 'บทบาทที่ให้พนักงานเข้าถึงข้อมูลข้ามแผนกเพื่อทำงานอย่างมีประสิทธิภาพ',
      roles: [
        {
          key: 'ACCOUNTING_STAFF_SALES_VIEWER',
          name: 'พนักงานบัญชี + ดูการขาย',
          description: 'เข้าถึงระบบบัญชีและดูข้อมูลการขายเพื่อตรวจสอบรายได้',
          permissions: ['accounting.view', 'accounting.edit', 'sales.view', 'reports.view'],
          menuAccess: ['บัญชีและการเงิน', 'งานขาย', 'รายงาน'],
          businessCase: 'พนักงานบัญชีต้องดูข้อมูลการขายเพื่อจับคู่รายได้กับใบเสร็จ'
        },
        {
          key: 'SALES_STAFF_INVENTORY_VIEWER',
          name: 'พนักงานขาย + ดูคลัง',
          description: 'เข้าถึงระบบขายและดูข้อมูลคลังสินค้า',
          permissions: ['sales.view', 'sales.edit', 'inventory.view', 'reports.view'],
          menuAccess: ['งานขาย', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'พนักงานขายต้องดูสต็อกสินค้าเพื่อแนะนำลูกค้าได้ถูกต้อง'
        },
        {
          key: 'SERVICE_STAFF_PARTS_MANAGER',
          name: 'ช่างบริการ + จัดการอะไหล่',
          description: 'เข้าถึงระบบบริการและจัดการอะไหล่',
          permissions: ['service.view', 'service.edit', 'inventory.view', 'inventory.edit', 'reports.view'],
          menuAccess: ['งานบริการ', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'ช่างต้องเบิกและจัดการอะไหล่สำหรับงานซ่อม'
        }
      ]
    },
    {
      category: 'Management Hierarchy',
      description: 'บทบาทสำหรับผู้บริหารในระดับต่างๆ',
      roles: [
        {
          key: 'PROVINCE_MANAGER',
          name: 'ผู้จัดการจังหวัด',
          description: 'ควบคุมงานทุกแผนกในระดับจังหวัด',
          permissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.manage', 'admin.view'],
          menuAccess: ['บัญชีและการเงิน', 'งานขาย', 'งานบริการ', 'คลังสินค้า', 'รายงาน', 'จัดการระบบ'],
          businessCase: 'ผู้จัดการจังหวัดต้องควบคุมและอนุมัติงานทุกแผนก'
        },
        {
          key: 'BRANCH_MANAGER',
          name: 'ผู้จัดการสาขา',
          description: 'ควบคุมงานทุกแผนกในระดับสาขา',
          permissions: ['accounting.approve', 'sales.approve', 'service.approve', 'inventory.approve', 'users.edit'],
          menuAccess: ['บัญชีและการเงิน', 'งานขาย', 'งานบริการ', 'คลังสินค้า', 'รายงาน'],
          businessCase: 'ผู้จัดการสาขาต้องควบคุมและอนุมัติงานในสาขา'
        }
      ]
    },
    {
      category: 'Specialists',
      description: 'บทบาทสำหรับผู้เชี่ยวชาญเฉพาะทาง',
      roles: [
        {
          key: 'FINANCE_ANALYST',
          name: 'นักวิเคราะห์การเงิน',
          description: 'วิเคราะห์และอนุมัติเรื่องการเงิน',
          permissions: ['accounting.approve', 'credit.approve', 'reports.edit'],
          menuAccess: ['บัญชีและการเงิน', 'สินเชื่อ', 'รายงาน'],
          businessCase: 'ผู้เชี่ยวชาญการเงินต้องวิเคราะห์และอนุมัติธุรกรรมทางการเงิน'
        },
        {
          key: 'OPERATIONS_COORDINATOR',
          name: 'ผู้ประสานงานปฏิบัติการ',
          description: 'ประสานงานระหว่างแผนกต่างๆ',
          permissions: ['inventory.approve', 'service.edit', 'sales.view'],
          menuAccess: ['คลังสินค้า', 'งานบริการ', 'งานขาย', 'รายงาน'],
          businessCase: 'ผู้ประสานงานต้องควบคุมการไหลของสินค้าและงานบริการ'
        }
      ]
    }
  ];

  // Switch role function
  const switchRole = (roleKey) => {
    setSelectedRole(roleKey);
    dispatch(setUserRole(user?.uid, roleKey));
    message.success(`✅ สลับไปใช้บทบาท: ${roleKey}`);
  };

  // Check navigation access
  const checkNavigationAccess = (menuTitle) => {
    if (!filteredNavigation || filteredNavigation.length === 0) return false;
    return filteredNavigation.some(section => 
      section.title === menuTitle || 
      (section.items && section.items.some(item => item.title === menuTitle))
    );
  };

  // Get effective permissions for current role
  const effectivePermissions = getEffectivePermissions(userRole, []);

  // Permission test data
  const permissionTestData = [
    { key: 'accounting.view', name: 'ดูข้อมูลบัญชี', type: 'view' },
    { key: 'accounting.edit', name: 'แก้ไขข้อมูลบัญชี', type: 'edit' },
    { key: 'accounting.approve', name: 'อนุมัติบัญชี', type: 'approve' },
    { key: 'sales.view', name: 'ดูข้อมูลการขาย', type: 'view' },
    { key: 'sales.edit', name: 'แก้ไขข้อมูลการขาย', type: 'edit' },
    { key: 'sales.approve', name: 'อนุมัติการขาย', type: 'approve' },
    { key: 'service.view', name: 'ดูข้อมูลบริการ', type: 'view' },
    { key: 'service.edit', name: 'แก้ไขข้อมูลบริการ', type: 'edit' },
    { key: 'inventory.view', name: 'ดูข้อมูลคลัง', type: 'view' },
    { key: 'inventory.edit', name: 'แก้ไขข้อมูลคลัง', type: 'edit' },
    { key: 'reports.view', name: 'ดูรายงาน', type: 'view' },
    { key: 'users.manage', name: 'จัดการผู้ใช้', type: 'manage' },
    { key: 'admin.view', name: 'ดูข้อมูลระบบ', type: 'view' }
  ];

  const permissionColumns = [
    {
      title: 'สิทธิ์',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Tag color={
            record.type === 'view' ? 'blue' : 
            record.type === 'edit' ? 'orange' : 
            record.type === 'approve' ? 'green' : 
            record.type === 'manage' ? 'red' : 'default'
          }>
            {record.type}
          </Tag>
          {text}
        </Space>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'key',
      key: 'status',
      render: (permission) => {
        const hasAccess = hasPermission(permission);
        return (
          <Tag color={hasAccess ? 'success' : 'error'}>
            {hasAccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            {hasAccess ? ' มีสิทธิ์' : ' ไม่มีสิทธิ์'}
          </Tag>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <SecurityScanOutlined /> ทดสอบระบบบทบาทแบบละเอียด (Granular Roles)
      </Title>
      
      <Paragraph>
        ระบบบทบาทแบบละเอียดใหม่ รองรับการทำงานข้ามแผนกและลำดับชั้นการจัดการที่ซับซ้อน 
        โดยแก้ปัญหาความซับซ้อนของการกำหนดสิทธิ์แบบเดิม
      </Paragraph>

      {/* Current Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Alert
            message={`บทบาทปัจจุบัน: ${userRole || 'ไม่ได้กำหนด'}`}
            description={`สิทธิ์ที่มีผล: ${effectivePermissions.length} สิทธิ์`}
            type="info"
            showIcon
            action={
              <Button size="small" onClick={() => console.log('Current permissions:', effectivePermissions)}>
                ดูรายละเอียด
              </Button>
            }
          />
        </Col>
      </Row>

      {/* Granular Role Tests */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<><TeamOutlined /> ทดสอบบทบาทแบบละเอียด</>}>
            <Collapse defaultActiveKey={['0']} ghost>
              {granularRoleTests.map((category, categoryIndex) => (
                <Panel 
                  header={
                    <Space>
                      <Text strong>{category.category}</Text>
                      <Text type="secondary">({category.roles.length} บทบาท)</Text>
                    </Space>
                  } 
                  key={categoryIndex}
                >
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {category.description}
                  </Text>
                  
                  <Row gutter={[16, 16]}>
                    {category.roles.map((role, roleIndex) => (
                      <Col span={24} key={roleIndex}>
                        <Card 
                          size="small"
                          title={
                            <Space>
                              <Tag color="blue">{role.key}</Tag>
                              <Text strong>{role.name}</Text>
                              {userRole === role.key && <Tag color="success">กำลังใช้งาน</Tag>}
                            </Space>
                          }
                          extra={
                            <Button 
                              type={userRole === role.key ? 'default' : 'primary'}
                              size="small"
                              onClick={() => switchRole(role.key)}
                              disabled={userRole === role.key}
                            >
                              {userRole === role.key ? 'กำลังใช้งาน' : 'ทดสอบบทบาทนี้'}
                            </Button>
                          }
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={24}>
                              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                📋 {role.businessCase}
                              </Text>
                            </Col>
                            
                            <Col span={8}>
                              <Text strong>สิทธิ์ที่คาดหวัง:</Text>
                              <div style={{ marginTop: 4 }}>
                                {role.permissions.map(permission => (
                                  <Tag 
                                    key={permission}
                                    color={hasPermission(permission) ? 'success' : 'error'}
                                    style={{ marginBottom: 4 }}
                                  >
                                    {permission} {hasPermission(permission) ? '✓' : '✗'}
                                  </Tag>
                                ))}
                              </div>
                            </Col>
                            
                            <Col span={8}>
                              <Text strong>เมนูที่เข้าถึงได้:</Text>
                              <div style={{ marginTop: 4 }}>
                                {role.menuAccess.map(menuItem => (
                                  <Tag 
                                    key={menuItem}
                                    color={checkNavigationAccess(menuItem) ? 'success' : 'error'}
                                    style={{ marginBottom: 4 }}
                                  >
                                    {menuItem} {checkNavigationAccess(menuItem) ? '✓' : '✗'}
                                  </Tag>
                                ))}
                              </div>
                            </Col>
                            
                            <Col span={8}>
                              <Text strong>RBAC Components:</Text>
                              <div style={{ marginTop: 4 }}>
                                <Space direction="vertical" size="small">
                                  <PermissionGate 
                                    permission="accounting.edit"
                                    fallback={<Tag color="error">🚫 No Access</Tag>}
                                  >
                                    <Tag color="success">✅ PermissionGate</Tag>
                                  </PermissionGate>
                                  
                                  <ProtectedButton size="small">
                                    HOC Test
                                  </ProtectedButton>
                                </Space>
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>

      {/* Current Permissions Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title={<><SecurityScanOutlined /> สิทธิ์ปัจจุบัน</>} size="small">
            <Table
              dataSource={permissionTestData}
              columns={permissionColumns}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={<><MenuOutlined /> เมนูที่เข้าถึงได้</>} size="small">
            <List
              size="small"
              dataSource={filteredNavigation}
              renderItem={section => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Tag color="blue">{section.title}</Tag>
                      {section.items && <Text type="secondary">({section.items.length} รายการ)</Text>}
                    </Space>
                    {section.items && section.items.length > 0 && (
                      <div style={{ paddingLeft: 16 }}>
                        {section.items.slice(0, 3).map(item => (
                          <Tag key={item.key} size="small" color="green" style={{ marginBottom: 2 }}>
                            {item.title}
                          </Tag>
                        ))}
                        {section.items.length > 3 && (
                          <Tag size="small" color="default">
                            +{section.items.length - 3} อื่นๆ
                          </Tag>
                        )}
                      </div>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Technical Details */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="🔧 รายละเอียดทางเทคนิค" size="small">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Current Role">{userRole || 'None'}</Descriptions.Item>
              <Descriptions.Item label="Is Super Admin">{isSuperAdmin ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="Total Permissions">{effectivePermissions.length}</Descriptions.Item>
              <Descriptions.Item label="Navigation Items">{filteredNavigation.length}</Descriptions.Item>
              <Descriptions.Item label="Enhanced Permission System">Active</Descriptions.Item>
              <Descriptions.Item label="Legacy Compatibility">Enabled</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Effective Permissions Array:</Text>
              <Text code style={{ wordBreak: 'break-all' }}>
                {JSON.stringify(effectivePermissions, null, 2)}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestGranularRoles; 