/**
 * Orthogonal RBAC System Demo
 * Demonstrates how the new system eliminates redundancy and simplifies access control
 */

import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  Typography, 
  Table, 
  Tag, 
  Alert, 
  Divider, 
  Space,
  Button,
  Collapse
} from 'antd';
import { 
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS,
  generateUserPermissions,
  getLegacyRoleName,
  getUserRoleDescription,
  createUserAccess
} from '../../../utils/orthogonal-rbac';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const OrthogonalRBACDemo = () => {
  // Selected user configuration
  const [selectedAuthority, setSelectedAuthority] = useState('STAFF');
  const [selectedGeographic, setSelectedGeographic] = useState('BRANCH');
  const [selectedDepartments, setSelectedDepartments] = useState(['SALES']);

  // Sample geographic assignments
  const [assignments] = useState({
    provinces: ['nakhon-sawan'],
    branches: ['NSN001', 'NSN002'],
    homeBranch: 'NSN001'
  });

  // Generate current user based on selections
  const currentUser = useMemo(() => {
    return {
      uid: 'demo-user',
      email: 'demo@example.com',
      access: createUserAccess(
        selectedAuthority,
        selectedGeographic,
        selectedDepartments,
        assignments
      )
    };
  }, [selectedAuthority, selectedGeographic, selectedDepartments, assignments]);

  // Generate permissions for current user
  const userPermissions = useMemo(() => {
    return generateUserPermissions(currentUser);
  }, [currentUser]);

  // Legacy role mapping
  const legacyRole = useMemo(() => {
    return getLegacyRoleName(currentUser);
  }, [currentUser]);

  // Permission comparison table data
  const permissionTableData = useMemo(() => {
    const permissions = userPermissions.permissions;
    
    return [
      {
        key: 'accounting',
        department: 'บัญชีการเงิน',
        view: permissions.includes('accounting.view'),
        edit: permissions.includes('accounting.edit'),
        approve: permissions.includes('accounting.approve'),
        manage: permissions.includes('accounting.manage')
      },
      {
        key: 'sales',
        department: 'ขายและลูกค้า',
        view: permissions.includes('sales.view'),
        edit: permissions.includes('sales.edit'),
        approve: permissions.includes('sales.approve'),
        manage: permissions.includes('sales.manage')
      },
      {
        key: 'service',
        department: 'บริการซ่อม',
        view: permissions.includes('service.view'),
        edit: permissions.includes('service.edit'),
        approve: permissions.includes('service.approve'),
        manage: permissions.includes('service.manage')
      },
      {
        key: 'inventory',
        department: 'คลังสินค้า',
        view: permissions.includes('inventory.view'),
        edit: permissions.includes('inventory.edit'),
        approve: permissions.includes('inventory.approve'),
        manage: permissions.includes('inventory.manage')
      },
      {
        key: 'hr',
        department: 'ทรัพยากรบุคคล',
        view: permissions.includes('hr.view'),
        edit: permissions.includes('hr.edit'),
        approve: permissions.includes('hr.approve'),
        manage: permissions.includes('hr.manage')
      }
    ];
  }, [userPermissions]);

  const permissionColumns = [
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      width: 150
    },
    {
      title: 'ดู',
      dataIndex: 'view',
      key: 'view',
      align: 'center',
      render: (value) => value ? <Tag color="blue">✓</Tag> : <Tag color="default">✗</Tag>
    },
    {
      title: 'แก้ไข',
      dataIndex: 'edit',
      key: 'edit',
      align: 'center',
      render: (value) => value ? <Tag color="orange">✓</Tag> : <Tag color="default">✗</Tag>
    },
    {
      title: 'อนุมัติ',
      dataIndex: 'approve',
      key: 'approve',
      align: 'center',
      render: (value) => value ? <Tag color="green">✓</Tag> : <Tag color="default">✗</Tag>
    },
    {
      title: 'จัดการ',
      dataIndex: 'manage',
      key: 'manage',
      align: 'center',
      render: (value) => value ? <Tag color="red">✓</Tag> : <Tag color="default">✗</Tag>
    }
  ];

  // Sample role combinations for comparison
  const roleExamples = [
    {
      title: 'ผู้จัดการจังหวัดฝ่ายขาย',
      authority: 'MANAGER',
      geographic: 'PROVINCE',
      departments: ['SALES'],
      legacy: 'จำเป็นต้องสร้างตำแหน่งใหม่ PROVINCE_SALES_MANAGER',
      orthogonal: 'ใช้การผสม: MANAGER + PROVINCE + SALES'
    },
    {
      title: 'พนักงานหลายแผนก',
      authority: 'STAFF',
      geographic: 'BRANCH',
      departments: ['SALES', 'SERVICE'],
      legacy: 'จำเป็นต้องสร้าง SALES_SERVICE_STAFF (ไม่มีอยู่)',
      orthogonal: 'ใช้การผสม: STAFF + BRANCH + [SALES, SERVICE]'
    },
    {
      title: 'หัวหน้าแผนกบัญชี',
      authority: 'LEAD',
      geographic: 'BRANCH',
      departments: ['ACCOUNTING'],
      legacy: 'จำเป็นต้องสร้าง ACCOUNTING_LEAD (ไม่มีอยู่)',
      orthogonal: 'ใช้การผสม: LEAD + BRANCH + ACCOUNTING'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🎯 ระบบ RBAC แบบ Orthogonal - การลดความซ้ำซ้อน</Title>
      
      <Alert
        type="success"
        message="จุดประสงค์: แยกมิติการควบคุมการเข้าถึงออกเป็น 4 ส่วนอิสระ เพื่อลดความซ้ำซ้อนและเพิ่มความยืดหยุ่น"
        description="แทนที่จะมี 50+ ตำแหน่งผสม ใช้ 4 × 3 × 6 = 72 การผสมที่สร้างได้อัตโนมัติ"
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={[16, 16]}>
        {/* Configuration Panel */}
        <Col span={8}>
          <Card title="📋 กำหนดสิทธิ์ผู้ใช้" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>1. ระดับอำนาจ (Authority Level)</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedAuthority}
                  onChange={setSelectedAuthority}
                >
                  {Object.entries(AUTHORITY_LEVELS).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.nameTh} ({value.nameEn})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>2. ขอบเขตภูมิศาสตร์ (Geographic Scope)</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedGeographic}
                  onChange={setSelectedGeographic}
                >
                  {Object.entries(GEOGRAPHIC_SCOPE).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.nameTh} ({value.nameEn})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>3. แผนกที่เข้าถึงได้ (Departments)</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  mode="multiple"
                  value={selectedDepartments}
                  onChange={setSelectedDepartments}
                  placeholder="เลือกแผนก"
                >
                  {Object.entries(DEPARTMENTS).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.nameTh}
                    </Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Results Panel */}
        <Col span={16}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Generated Role Info */}
            <Card title="📊 ผลลัพธ์ที่สร้างได้" bordered>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>ตำแหน่งที่สร้างได้:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      {getUserRoleDescription(currentUser)}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>ตำแหน่งเดิม (Legacy):</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="orange" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      {legacyRole}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div>
                <Text strong>สิทธิ์ที่สร้างได้อัตโนมัติ:</Text>
                <div style={{ marginTop: 8 }}>
                  {userPermissions.permissions.map(permission => (
                    <Tag key={permission} color="green" style={{ margin: '2px' }}>
                      {permission}
                    </Tag>
                  ))}
                </div>
              </div>
            </Card>

            {/* Permissions Table */}
            <Card title="🔐 ตารางสิทธิ์การเข้าถึง" bordered>
              <Table
                dataSource={permissionTableData}
                columns={permissionColumns}
                pagination={false}
                size="small"
                bordered
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Comparison Examples */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="💡 ตัวอย่างการเปรียบเทียบ: ระบบเดิม vs ระบบใหม่" bordered>
            <Collapse>
              {roleExamples.map((example, index) => (
                <Panel header={example.title} key={index}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Alert
                        type="warning"
                        message="ระบบเดิม (ปัญหา)"
                        description={example.legacy}
                      />
                    </Col>
                    <Col span={12}>
                      <Alert
                        type="success"
                        message="ระบบใหม่ (ลดความซ้ำซ้อน)"
                        description={example.orthogonal}
                      />
                    </Col>
                  </Row>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>

      {/* Benefits Summary */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="🎯 ประโยชน์ของระบบใหม่" bordered>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title="🔄 ลดความซ้ำซ้อน">
                  <Text>จาก 50+ ตำแหน่งผสม → 4×3×6 การผสมที่สร้างอัตโนมัติ</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="⚡ ง่ายต่อการบำรุงรักษา">
                  <Text>เพิ่มแผนกใหม่ = แก้ไข 1 ที่ (แทนที่ 8+ ตำแหน่ง)</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="📈 ขยายตัวได้ดี">
                  <Text>เพิ่มสาขาใหม่ = อัปเดต Geographic เท่านั้น</Text>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title="🎛️ จัดการผู้ใช้ง่าย">
                  <Text>เลือก dropdown 3 ช่อง แทนที่เลือกจาก 50+ ตำแหน่ง</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="🔄 ยืดหยุ่น">
                  <Text>รองรับบทบาทผสม เช่น พนักงานหลายแผนก</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="🛡️ ปลอดภัย">
                  <Text>สิทธิ์สร้างอัตโนมัติ ลดข้อผิดพลาดจากการตั้งค่าด้วยมือ</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Implementation Info */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="🛠️ การนำไปใช้" bordered>
            <Paragraph>
              <Text strong>ขั้นตอนการย้าย:</Text>
            </Paragraph>
            <ol>
              <li><Text>สร้างระบบใหม่ทำงานควบคู่กับระบบเดิม</Text></li>
              <li><Text>ย้ายผู้ใช้ปัจจุบันด้วย Migration Script</Text></li>
              <li><Text>อัปเดต Components ให้รองรับระบบใหม่</Text></li>
              <li><Text>ทดสอบและลบระบบเดิม</Text></li>
            </ol>
            
            <Paragraph style={{ marginTop: '16px' }}>
              <Text strong>ผลลัพธ์:</Text> ลดโค้ดจาก 500+ บรรทัด → 100 บรรทัด ✨
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrthogonalRBACDemo; 