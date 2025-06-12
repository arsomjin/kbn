import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Select, 
  Input, 
  Checkbox, 
  Alert, 
  message,
  Descriptions,
  Tabs,
  Tree
} from 'antd';
import { 
  SafetyOutlined, 
  SettingOutlined, 
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from 'hooks/usePermissions';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  // Permission categories and permissions mapping
  const permissionCategories = {
    accounting: {
      name: 'บัญชี',
      color: 'blue',
      permissions: [
        { key: 'accounting.view', name: 'ดูข้อมูลบัญชี', description: 'ดูรายงานและข้อมูลทางบัญชี' },
        { key: 'accounting.edit', name: 'แก้ไขข้อมูลบัญชี', description: 'สร้างและแก้ไขรายการบัญชี' },
        { key: 'accounting.approve', name: 'อนุมัติบัญชี', description: 'อนุมัติรายการบัญชีและการเงิน' },
        { key: 'accounting.report', name: 'รายงานบัญชี', description: 'สร้างและส่งออกรายงานบัญชี' }
      ]
    },
    sales: {
      name: 'ขาย',
      color: 'green',
      permissions: [
        { key: 'sales.view', name: 'ดูข้อมูลขาย', description: 'ดูข้อมูลลูกค้าและยอดขาย' },
        { key: 'sales.edit', name: 'แก้ไขข้อมูลขาย', description: 'สร้างและแก้ไขใบสั่งขาย' },
        { key: 'sales.approve', name: 'อนุมัติการขาย', description: 'อนุมัติส่วนลดและเงื่อนไขพิเศษ' },
        { key: 'sales.report', name: 'รายงานขาย', description: 'ดูรายงานยอดขายและผลงาน' }
      ]
    },
    service: {
      name: 'บริการ',
      color: 'orange',
      permissions: [
        { key: 'service.view', name: 'ดูข้อมูลบริการ', description: 'ดูข้อมูลการซ่อมและบริการ' },
        { key: 'service.edit', name: 'แก้ไขข้อมูลบริการ', description: 'จัดการใบสั่งซ่อมและบริการ' },
        { key: 'service.approve', name: 'อนุมัติบริการ', description: 'อนุมัติค่าซ่อมและรับประกัน' },
        { key: 'service.report', name: 'รายงานบริการ', description: 'รายงานการซ่อมและความพึงพอใจ' }
      ]
    },
    inventory: {
      name: 'คลังสินค้า',
      color: 'purple',
      permissions: [
        { key: 'inventory.view', name: 'ดูสต็อกสินค้า', description: 'ดูข้อมูลสต็อกและการเคลื่อนไหว' },
        { key: 'inventory.edit', name: 'จัดการสต็อก', description: 'รับ-จ่ายสินค้าและปรับปรุงสต็อก' },
        { key: 'inventory.approve', name: 'อนุมัติคลัง', description: 'อนุมัติการสั่งซื้อและโอนสต็อก' },
        { key: 'inventory.report', name: 'รายงานคลัง', description: 'รายงานสต็อกและการเคลื่อนไหว' }
      ]
    },
    admin: {
      name: 'ระบบ',
      color: 'red',
      permissions: [
        { key: 'admin.view', name: 'ดูข้อมูลระบบ', description: 'ดูข้อมูลผู้ใช้และการตั้งค่า' },
        { key: 'admin.edit', name: 'จัดการระบบ', description: 'จัดการผู้ใช้และการตั้งค่า' },
        { key: 'admin.approve', name: 'อนุมัติผู้ใช้', description: 'อนุมัติผู้ใช้ใหม่และเปลี่ยนสิทธิ์' },
        { key: 'users.manage', name: 'จัดการผู้ใช้', description: 'เพิ่ม แก้ไข ลบผู้ใช้งาน' }
      ]
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await app.firestore().collection('users').get();
      
      const usersData = snapshot.docs.map((doc) => {
        const userData = doc.data();
        const authData = userData.auth || {};
        const accessData = userData.access || {};
        
        return {
          uid: doc.id,
          ...authData,
          displayName: authData.displayName || `${authData.firstName} ${authData.lastName}`,
          // Read permissions from Clean Slate RBAC structure with fallbacks
          permissions: accessData.permissions || userData.userRBAC?.permissions || authData.permissions || [],
          accessLevel: accessData.authority || userData.userRBAC?.authority || authData.accessLevel || 'STAFF',
          department: accessData.departments?.[0] || userData.userRBAC?.departments?.[0] || authData.department || 'general',
          // Store raw data for debugging
          _rawAccessData: accessData,
          _rawUserRBAC: userData.userRBAC,
          _rawAuthData: authData
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
    setLoading(false);
  };

  const handleUpdatePermissions = async (values) => {
    setActionLoading(true);
    try {
      const { permissions } = values;
      const timestamp = Date.now();
      
      // Update Clean Slate RBAC structure
      const updateData = {
        'access.permissions': permissions,
        'access.lastUpdate': timestamp,
        'access.updatedBy': currentUser.uid
      };
            
      await app.firestore()
        .collection('users')
        .doc(selectedUser.uid)
        .update(updateData);

      message.success('อัปเดตสิทธิ์การใช้งานเรียบร้อยแล้ว');
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating permissions:', error);
      message.error('ไม่สามารถอัปเดตสิทธิ์การใช้งานได้');
    }
    setActionLoading(false);
  };

  const getPermissionDisplay = (permissions) => {
    if (!permissions || permissions.length === 0) {
      return <Tag color="default">ไม่มีสิทธิ์</Tag>;
    }

    const groupedPerms = {};
    permissions.forEach(perm => {
      const [category] = perm.split('.');
      if (!groupedPerms[category]) groupedPerms[category] = [];
      groupedPerms[category].push(perm);
    });

    return (
      <Space wrap>
        {Object.entries(groupedPerms).map(([category, perms]) => {
          const categoryInfo = permissionCategories[category];
          return (
            <Tag 
              key={category} 
              color={categoryInfo?.color || 'default'}
              title={perms.join(', ')}
            >
              {categoryInfo?.name || category} ({perms.length})
            </Tag>
          );
        })}
      </Space>
    );
  };

  const getAllPermissions = () => {
    const allPerms = [];
    Object.values(permissionCategories).forEach(category => {
      category.permissions.forEach(perm => {
        allPerms.push(perm.key);
      });
    });
    return allPerms;
  };

  const getPermissionTree = () => {
    return Object.entries(permissionCategories).map(([key, category]) => ({
      title: (
        <span>
          <Tag color={category.color}>{category.name}</Tag>
        </span>
      ),
      key: key,
      children: category.permissions.map(perm => ({
        title: (
          <div>
            <strong>{perm.name}</strong>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {perm.description}
            </Text>
          </div>
        ),
        key: perm.key
      }))
    }));
  };

  const columns = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (accessLevel) => (
        <Tag color="blue">{accessLevel}</Tag>
      ),
    },
    {
      title: 'สิทธิ์การใช้งาน',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => getPermissionDisplay(permissions),
    },
    {
      title: 'จำนวนสิทธิ์',
      dataIndex: 'permissions',
      key: 'permissionCount',
      render: (permissions) => (
        <Tag color="cyan">{permissions?.length || 0} สิทธิ์</Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<SettingOutlined />}
          size="small"
          type="primary"
          onClick={() => {
            setSelectedUser(record);
            form.setFieldsValue({
              permissions: record.permissions || []
            });
            setModalVisible(true);
          }}
          disabled={!hasPermission('admin.edit')}
        >
          จัดการสิทธิ์
        </Button>
      ),
    },
  ];

  return (
    <LayoutWithRBAC permission="admin.view" title="จัดการสิทธิ์การใช้งาน">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={4}>
              <KeyOutlined /> จัดการสิทธิ์การใช้งาน
            </Title>
            
            <Alert
              message="คำแนะนำ"
              description="หน้านี้ใช้สำหรับจัดการสิทธิ์การใช้งานของผู้ใช้แต่ละคน สิทธิ์จะถูกจัดกลุ่มตามแผนกและระดับการใช้งาน"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={columns}
              dataSource={users}
              rowKey="uid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} จาก ${total} ผู้ใช้`,
              }}
            />
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title={<><SafetyOutlined /> สิทธิ์ที่มีในระบบ</>}>
            <Row gutter={16}>
              {Object.entries(permissionCategories).map(([key, category]) => (
                <Col span={12} key={key} style={{ marginBottom: 16 }}>
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <Tag color={category.color}>{category.name}</Tag>
                        <Text type="secondary">({category.permissions.length} สิทธิ์)</Text>
                      </Space>
                    }
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {category.permissions.map(perm => (
                        <div key={perm.key}>
                          <Text strong>{perm.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {perm.description}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Permission Management Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>จัดการสิทธิ์: {selectedUser?.displayName}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        width={800}
      >
        {selectedUser && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdatePermissions}
          >
            <Alert
              message={`กำหนดสิทธิ์สำหรับ: ${selectedUser.displayName}`}
              description={`บทบาท: ${selectedUser.accessLevel} | แผนก: ${selectedUser.department || 'ไม่ระบุ'}`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="permissions"
              label="สิทธิ์การใช้งาน"
              rules={[{ required: true, message: 'กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ' }]}
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={16}>
                  {Object.entries(permissionCategories).map(([categoryKey, category]) => (
                    <Col span={24} key={categoryKey} style={{ marginBottom: 16 }}>
                      <Card 
                        size="small"
                        title={
                          <Space>
                            <Tag color={category.color}>{category.name}</Tag>
                            <Button
                              size="small"
                              type="link"
                              onClick={() => {
                                const currentPerms = form.getFieldValue('permissions') || [];
                                const categoryPerms = category.permissions.map(p => p.key);
                                const hasAll = categoryPerms.every(p => currentPerms.includes(p));
                                
                                if (hasAll) {
                                  // Remove all from this category
                                  const newPerms = currentPerms.filter(p => !categoryPerms.includes(p));
                                  form.setFieldValue('permissions', newPerms);
                                } else {
                                  // Add all from this category
                                  const newPerms = [...new Set([...currentPerms, ...categoryPerms])];
                                  form.setFieldValue('permissions', newPerms);
                                }
                              }}
                            >
                              เลือกทั้งหมด
                            </Button>
                          </Space>
                        }
                      >
                        <Row gutter={8}>
                          {category.permissions.map(perm => (
                            <Col span={24} key={perm.key} style={{ marginBottom: 8 }}>
                              <Checkbox value={perm.key}>
                                <div>
                                  <Text strong>{perm.name}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {perm.description}
                                  </Text>
                                </div>
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Button
                  block
                  onClick={() => {
                    form.setFieldValue('permissions', getAllPermissions());
                  }}
                >
                  <UnlockOutlined /> เลือกทั้งหมด
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  onClick={() => {
                    form.setFieldValue('permissions', []);
                  }}
                >
                  <LockOutlined /> ยกเลิกทั้งหมด
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </LayoutWithRBAC>
  );
};

export default PermissionManagement; 