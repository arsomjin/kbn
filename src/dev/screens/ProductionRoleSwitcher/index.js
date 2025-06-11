import React, { useState } from 'react';
import { Card, Select, Button, Alert, Typography, Descriptions, Tag, Space } from 'antd';
import { UserOutlined, BankOutlined, ShopOutlined } from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { AUTHORITY_LEVELS, GEOGRAPHIC_SCOPE, DEPARTMENTS } from 'utils/orthogonal-rbac';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductionRoleSwitcher = () => {
  const { userRole, userRBAC, updateUserRole } = usePermissions();
  const [selectedRole, setSelectedRole] = useState(userRole);
  const [isLoading, setIsLoading] = useState(false);

  // Clean Slate RBAC role options (replaces legacy roles)
  const roleOptions = [
    {
      key: 'ADMIN',
      label: 'ผู้ดูแลระบบ',
      authority: AUTHORITY_LEVELS.ADMIN,
      geographic: GEOGRAPHIC_SCOPE.ALL,
      departments: Object.values(DEPARTMENTS),
      description: 'เข้าถึงได้ทุกอย่างในระบบ'
    },
    {
      key: 'EXECUTIVE',  // Legacy support
      label: 'ผู้บริหารระดับสูง (เลิกใช้แล้ว)',
      authority: AUTHORITY_LEVELS.ADMIN,
      geographic: GEOGRAPHIC_SCOPE.ALL,
      departments: Object.values(DEPARTMENTS),
      description: 'ผู้บริหารระดับสูง - ใช้ ADMIN แทน',
      deprecated: true
    },
    {
      key: 'PROVINCE_MANAGER',
      label: 'ผู้จัดการจังหวัด',
      authority: AUTHORITY_LEVELS.MANAGER,
      geographic: GEOGRAPHIC_SCOPE.PROVINCE,
      departments: [DEPARTMENTS.GENERAL, DEPARTMENTS.ACCOUNTING, DEPARTMENTS.SALES],
      description: 'จัดการในระดับจังหวัด'
    },
    {
      key: 'BRANCH_MANAGER',
      label: 'ผู้จัดการสาขา',
      authority: AUTHORITY_LEVELS.MANAGER,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.GENERAL, DEPARTMENTS.SALES, DEPARTMENTS.SERVICE],
      description: 'จัดการในระดับสาขา'
    },
    {
      key: 'DEPARTMENT_LEAD',
      label: 'หัวหน้าแผนก',
      authority: AUTHORITY_LEVELS.LEAD,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.ACCOUNTING], // Example department
      description: 'หัวหน้าแผนกในสาขา'
    },
    {
      key: 'STAFF',
      label: 'เจ้าหน้าที่',
      authority: AUTHORITY_LEVELS.STAFF,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.GENERAL],
      description: 'เจ้าหน้าที่ระดับพื้นฐาน'
    },
    
    // Legacy roles (marked as deprecated)
    {
      key: 'ACCOUNTING_STAFF',
      label: 'เจ้าหน้าที่บัญชี (เลิกใช้แล้ว)',
      authority: AUTHORITY_LEVELS.STAFF,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.ACCOUNTING],
      description: 'ใช้ STAFF + ACCOUNTING แทน',
      deprecated: true
    },
    {
      key: 'SALES_STAFF',
      label: 'เจ้าหน้าที่ขาย (เลิกใช้แล้ว)',
      authority: AUTHORITY_LEVELS.STAFF,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.SALES],
      description: 'ใช้ STAFF + SALES แทน',
      deprecated: true
    },
    {
      key: 'SERVICE_STAFF',
      label: 'เจ้าหน้าที่บริการ (เลิกใช้แล้ว)',
      authority: AUTHORITY_LEVELS.STAFF,
      geographic: GEOGRAPHIC_SCOPE.BRANCH,
      departments: [DEPARTMENTS.SERVICE],
      description: 'ใช้ STAFF + SERVICE แทน',
      deprecated: true
    }
  ];

  const handleRoleChange = async () => {
    setIsLoading(true);
    
    try {
      const selectedRoleData = roleOptions.find(r => r.key === selectedRole);
      
      if (selectedRoleData) {
        // Create Clean Slate access structure
        const newAccess = {
          authority: selectedRoleData.authority,
          geographic: {
            scope: selectedRoleData.geographic,
            allowedProvinces: userRBAC?.geographic?.allowedProvinces || [],
            allowedBranches: userRBAC?.geographic?.allowedBranches || [],
            homeProvince: userRBAC?.geographic?.homeProvince,
            homeBranch: userRBAC?.geographic?.homeBranch
          },
          departments: selectedRoleData.departments
        };

        await updateUserRole(selectedRole, newAccess);
        
        // Refresh page to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error switching role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedRoleInfo = () => {
    return roleOptions.find(r => r.key === selectedRole);
  };

  const getAuthorityColor = (authority) => {
    switch (authority) {
      case AUTHORITY_LEVELS.ADMIN: return 'red';
      case AUTHORITY_LEVELS.MANAGER: return 'orange';
      case AUTHORITY_LEVELS.LEAD: return 'blue';
      case AUTHORITY_LEVELS.STAFF: return 'green';
      default: return 'default';
    }
  };

  const getGeographicIcon = (geographic) => {
    switch (geographic) {
      case GEOGRAPHIC_SCOPE.ALL: return <BankOutlined />;
      case GEOGRAPHIC_SCOPE.PROVINCE: return <BankOutlined />;
      case GEOGRAPHIC_SCOPE.BRANCH: return <ShopOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🔄 Production Role Switcher (Clean Slate RBAC)</Title>
      
      <Alert
        message="⚠️ เครื่องมือสำหรับการพัฒนา"
        description="เครื่องมือนี้ใช้สำหรับทดสอบบทบาทต่างๆ ในระบบ Clean Slate RBAC เท่านั้น ไม่ควรใช้ในระบบจริง"
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Card title="ข้อมูลบทบาทปัจจุบัน" style={{ marginBottom: '24px' }}>
        <Descriptions column={1}>
          <Descriptions.Item label="บทบาท">
            <Tag color={getAuthorityColor(userRBAC?.authority)}>
              {userRole || 'ไม่ระบุ'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ระดับอำนาจ">
            <Tag color={getAuthorityColor(userRBAC?.authority)}>
              {userRBAC?.authority || 'ไม่ระบุ'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ขอบเขตทางภูมิศาสตร์">
            <Space>
              {getGeographicIcon(userRBAC?.geographic?.scope)}
              <Text>{userRBAC?.geographic?.scope || 'ไม่ระบุ'}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="แผนก">
            <Space>
              {userRBAC?.departments?.map(dept => (
                <Tag key={dept} color="blue">{dept}</Tag>
              )) || <Text>ไม่ระบุ</Text>}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="เปลี่ยนบทบาท">
        <div style={{ marginBottom: '16px' }}>
          <Text strong>เลือกบทบาทใหม่:</Text>
        </div>
        
        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ width: '100%', marginBottom: '16px' }}
          placeholder="เลือกบทบาท"
        >
          {roleOptions.map(role => (
            <Option key={role.key} value={role.key} disabled={role.deprecated}>
              <Space>
                <Tag color={getAuthorityColor(role.authority)} size="small">
                  {role.authority}
                </Tag>
                {getGeographicIcon(role.geographic)}
                <span style={{ 
                  textDecoration: role.deprecated ? 'line-through' : 'none',
                  color: role.deprecated ? '#999' : 'inherit'
                }}>
                  {role.label}
                </span>
                {role.deprecated && <Tag color="red" size="small">เลิกใช้แล้ว</Tag>}
              </Space>
            </Option>
          ))}
        </Select>

        {selectedRole && getSelectedRoleInfo() && (
          <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f9f9f9' }}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="คำอธิบาย">
                {getSelectedRoleInfo().description}
              </Descriptions.Item>
              <Descriptions.Item label="ระดับอำนาจ">
                <Tag color={getAuthorityColor(getSelectedRoleInfo().authority)}>
                  {getSelectedRoleInfo().authority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ขอบเขตภูมิศาสตร์">
                <Space>
                  {getGeographicIcon(getSelectedRoleInfo().geographic)}
                  <Text>{getSelectedRoleInfo().geographic}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="แผนก">
                <Space>
                  {getSelectedRoleInfo().departments.map(dept => (
                    <Tag key={dept} color="blue" size="small">{dept}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              {getSelectedRoleInfo().deprecated && (
                <Descriptions.Item label="สถานะ">
                  <Tag color="red">เลิกใช้แล้ว</Tag>
                  <Text type="secondary"> - ใช้เพื่อทดสอบการรองรับเท่านั้น</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        <Button 
          type="primary" 
          onClick={handleRoleChange}
          loading={isLoading}
          disabled={selectedRole === userRole}
          style={{ width: '100%' }}
        >
          เปลี่ยนบทบาท
        </Button>

        {selectedRole === userRole && (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
            บทบาทที่เลือกเหมือนกับบทบาทปัจจุบัน
          </Text>
        )}
      </Card>

      <Alert
        message="📋 Clean Slate RBAC Pattern"
        description={
          <div>
            <p><strong>Authority Levels:</strong> ADMIN → MANAGER → LEAD → STAFF</p>
            <p><strong>Geographic Scope:</strong> ALL → PROVINCE → BRANCH</p>
            <p><strong>Departments:</strong> GENERAL, ACCOUNTING, SALES, SERVICE, INVENTORY, HR</p>
            <p><strong>Legacy Roles:</strong> แปลงเป็น Authority + Geographic + Department combinations</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};

export default ProductionRoleSwitcher; 