import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Descriptions,
  Alert,
  message,
  Select,
  Input,
  Row,
  Col,
  Typography,
  Switch,
  Tabs,
  Form,
  Popconfirm,
  Badge
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BankOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from 'hooks/usePermissions';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import ProvinceSelector from 'components/ProvinceSelector';
import GeographicBranchSelector from 'components/GeographicBranchSelector';
import { 
  getProvinceName,
  getBranchName, 
  getDepartmentName,
  getUserTypeName,
  getApprovalLevelName,
  PROVINCE_MAPPINGS,
  BRANCH_MAPPINGS,
  DEPARTMENT_MAPPINGS,
  USER_TYPE_MAPPINGS,
  APPROVAL_LEVEL_MAPPINGS
} from 'utils/mappings';
import { 
  BASE_ROLES,
  GRANULAR_PERMISSIONS,
  PERMISSION_CATEGORIES,
  getRoleDisplayInfo, 
  getCompatiblePermissions,
  getPermissionsByCategory,
  validateRoleAssignment,
  createRoleChangeAuditLog,
  getEffectivePermissions
} from 'utils/rbac-enhanced';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Set form values when modal opens with selectedUser
  useEffect(() => {
    if (editModalVisible && selectedUser) {
      // Ensure form instance exists and reset it first
      if (form) {
        form.resetFields();
        
        // Set field values with user data (check multiple possible locations)
        const userData = selectedUser.fullData || selectedUser;
        const authData = userData.auth || {};
        const formValues = {
          accessLevel: selectedUser.accessLevel || userData.accessLevel || authData.accessLevel,
          department: selectedUser.department || userData.department || authData.department,
          homeProvince: selectedUser.homeProvince || userData.homeProvince || authData.homeProvince,
          homeBranch: selectedUser.homeBranch || userData.homeBranch || authData.homeBranch,
          additionalPermissions: selectedUser.additionalPermissions || userData.additionalPermissions || authData.additionalPermissions || []
        };
        
        // Use setTimeout to ensure form is fully mounted
        setTimeout(() => {
          form.setFieldsValue(formValues);
        }, 100);
      }
    }
  }, [editModalVisible, selectedUser, form]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await app.firestore().collection('users').get();

      const usersData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const authData = userData.auth || {};

          // Get approval requests for this user
          const approvalSnapshot = await app.firestore()
            .collection('approvalRequests')
            .where('userId', '==', doc.id)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          let latestApprovalRequest = null;
          if (!approvalSnapshot.empty) {
            latestApprovalRequest = approvalSnapshot.docs[0].data();
          }

          return {
            uid: doc.id,
            ...authData,
            fullData: userData,
            latestApprovalRequest,
            displayName: authData.displayName || `${authData.firstName} ${authData.lastName}`,
            status: authData.isActive && authData.isApproved ? 'active' :
              authData.approvalStatus === 'pending' ? 'pending' :
                authData.approvalStatus === 'rejected' ? 'rejected' : 'inactive'
          };
        })
      );

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
    setLoading(false);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      const newStatus = !currentStatus;
      await app.firestore()
        .collection('users')
        .doc(userId)
        .update({
          'auth.isActive': newStatus,
          'auth.lastStatusUpdate': Date.now(),
          'auth.statusUpdatedBy': currentUser.uid
        });

      message.success(`${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ผู้ใช้เรียบร้อยแล้ว`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('ไม่สามารถอัปเดตสถานะผู้ใช้ได้');
    }
    setActionLoading(false);
  };

  const handleUpdateUserRole = async (values) => {
    setActionLoading(true);
    try {
      const oldRole = selectedUser.accessLevel;
      const newRole = values.accessLevel;
      const oldAdditionalPerms = selectedUser.additionalPermissions || [];
      const newAdditionalPerms = values.additionalPermissions || [];
      
      // Validate role assignment
      const validation = validateRoleAssignment(newRole, currentUser.accessLevel);
      if (!validation.valid) {
        message.error(validation.reason);
        setActionLoading(false);
        return;
      }
      
      const updates = {
        'auth.accessLevel': values.accessLevel,
        'auth.department': values.department,
        'auth.homeProvince': values.homeProvince,
        'auth.homeBranch': values.homeBranch,
        'auth.additionalPermissions': values.additionalPermissions || [],
        'auth.allowedProvinces': values.allowedProvinces || [values.homeProvince],
        'auth.allowedBranches': values.allowedBranches || [values.homeBranch],
        'auth.lastUpdated': Date.now(),
        'auth.updatedBy': currentUser.uid
      };

      await app.firestore()
        .collection('users')
        .doc(selectedUser.uid)
        .update(updates);

      // Create audit log for role changes
      if (oldRole !== newRole || JSON.stringify(oldAdditionalPerms) !== JSON.stringify(newAdditionalPerms)) {
        const auditLog = createRoleChangeAuditLog(
          selectedUser.uid,
          oldRole,
          newRole,
          oldAdditionalPerms,
          newAdditionalPerms,
          currentUser.uid,
          `Updated via UserManagement by ${currentUser.displayName}`
        );
        
        await app.firestore()
          .collection('auditLogs')
          .add(auditLog);
      }

      message.success('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
    }
    setActionLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(true);
    try {
      // Mark as deleted rather than actually deleting
      await app.firestore()
        .collection('users')
        .doc(userId)
        .update({
          'auth.isDeleted': true,
          'auth.isActive': false,
          'auth.deletedAt': Date.now(),
          'auth.deletedBy': currentUser.uid
        });

      message.success('ลบผู้ใช้เรียบร้อยแล้ว');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('ไม่สามารถลบผู้ใช้ได้');
    }
    setActionLoading(false);
  };

  const getStatusTag = (status) => {
    const statusColors = {
      active: 'green',
      pending: 'orange', 
      rejected: 'red',
      inactive: 'default'
    };
    const statusTexts = {
      active: 'ใช้งานได้',
      pending: 'รออนุมัติ',
      rejected: 'ถูกปฏิเสธ', 
      inactive: 'ไม่ใช้งาน'
    };
    return <Tag color={statusColors[status] || 'default'}>{statusTexts[status] || status}</Tag>;
  };

  const getRoleTag = (accessLevel) => {
    if (!accessLevel) return <Tag color="default">ไม่ระบุ</Tag>;
    
    const roleInfo = getRoleDisplayInfo(accessLevel);
    const colors = {
      'purple': '#722ed1', // Super Admin
      'blue': '#1890ff',   // Province
      'green': '#52c41a',  // Branch
      'default': '#d9d9d9'
    };
    
    return (
      <Tag 
        color={roleInfo.tag} 
        style={{ 
          color: colors[roleInfo.tag] || colors.default,
          borderColor: colors[roleInfo.tag] || colors.default 
        }}
        title={roleInfo.description}
      >
        {roleInfo.name}
      </Tag>
    );
  };

  const getDepartmentTag = (department) => {
    if (!department) return '-';
    const departmentName = getDepartmentName(department);
    const departmentColors = {
      'accounting': 'orange',
      'sales': 'blue', 
      'service': 'green',
      'inventory': 'purple',
      'hr': 'cyan',
      'management': 'red'
    };
    return <Tag color={departmentColors[department] || 'default'}>{departmentName}</Tag>;
  };

  const getRequestTypeTag = (requestType) => {
    if (!requestType) return '-';
    const requestTypeColors = {
      new_registration: 'blue',
      existing_employee_registration: 'green',
      access_request: 'purple',
      role_change_request: 'orange'
    };
    const requestTypeTexts = {
      new_registration: 'ลงทะเบียนพนักงานใหม่',
      existing_employee_registration: 'ลงทะเบียนพนักงานเดิม',
      access_request: 'ขอสิทธิ์เข้าใช้งาน',
      role_change_request: 'ขอเปลี่ยนบทบาท'
    };
    return <Tag color={requestTypeColors[requestType] || 'default'}>{requestTypeTexts[requestType] || requestType}</Tag>;
  };

  // Helper functions for dropdowns
  const getAllRoles = () => {
    // Use base roles instead of enhanced roles
    return Object.entries(BASE_ROLES).map(([key, roleData]) => ({
      value: key,
      label: roleData.name,
      description: roleData.description,
      accessLevel: roleData.accessLevel,
      tag: getRoleDisplayInfo(key).tag
    }));
  };

  const getAllDepartments = () => {
    // Only return actual operational departments, not system permissions
    const operationalDepartments = {
      'accounting': 'บัญชีและการเงิน',
      'sales': 'ขายและลูกค้า', 
      'service': 'บริการและซ่อมบำรุง',
      'inventory': 'คลังสินค้าและอะไหล่',
      'hr': 'ทรัพยากรบุคคล',
      'management': 'ผู้บริหาร'
    };
    
    return Object.entries(operationalDepartments).map(([key, value]) => ({
      value: key,
      label: value
    }));
  };

  const getAllProvinces = () => {
    // Only return actual province codes, not Thai names or abbreviations
    return [
      { value: 'nakhon-ratchasima', label: 'นครราชสีมา' },
      { value: 'nakhon-sawan', label: 'นครสวรรค์' }
    ];
  };

  const getAllBranches = () => {
    return Object.entries(BRANCH_MAPPINGS).map(([key, value]) => ({
      value: key,
      label: value
    }));
  };

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (filterRole !== 'all' && user.accessLevel !== filterRole) return false;

    // Apply status filter  
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;

    // Apply search filter
    if (searchText && !user.displayName?.toLowerCase().includes(searchText.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchText.toLowerCase())) return false;

    return true;
  });

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
      render: (accessLevel) => getRoleTag(accessLevel),
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      render: (department) => getDepartmentTag(department),
    },
    {
      title: 'จังหวัด/สาขา',
      key: 'location',
      render: (_, record) => {
        const provinceName = getProvinceName(record.homeProvince);
        const branchName = getBranchName(record.homeBranch);
        return (
        <div>
            <div><EnvironmentOutlined /> {provinceName || '-'}</div>
            <div><BankOutlined /> {branchName || '-'}</div>
        </div>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical" size="small">
          {getStatusTag(status)}
          {record.latestApprovalRequest && (
            <Badge
              status={record.latestApprovalRequest.status === 'pending' ? 'processing' : 'success'}
              text={`อนุมัติ: ${record.latestApprovalRequest.status}`}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'การใช้งาน',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleUserStatus(record.uid, isActive)}
          loading={actionLoading}
          disabled={!hasPermission('users.manage')}
        />
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setModalVisible(true);
            }}
          >
            ดู
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => {
              setSelectedUser(record);
              setEditModalVisible(true);
            }}
            disabled={!hasPermission('users.manage')}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
            onConfirm={() => handleDeleteUser(record.uid)}
            disabled={!hasPermission('users.manage')}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              disabled={!hasPermission('users.manage')}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutWithRBAC 
      permission="users.view" 
      title="จัดการผู้ใช้งาน"
      requireBranchSelection={false}
      showAuditTrail={false}
      showStepper={false}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space size="large">
              <Title level={4} style={{ margin: 0 }}>
                <TeamOutlined /> จัดการผู้ใช้งาน
              </Title>
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 240 }}
                placeholder="กรองตามบทบาท"
              >
                <Option value="all">ทุกบทบาท</Option>
                {getAllRoles().map(role => (
                  <Option key={role.value} value={role.value}>{role.label}</Option>
                ))}
              </Select>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                placeholder="กรองตามสถานะ"
              >
                <Option value="all">ทุกสถานะ</Option>
                <Option value="active">ใช้งานได้</Option>
                <Option value="pending">รออนุมัติ</Option>
                <Option value="rejected">ถูกปฏิเสธ</Option>
                <Option value="inactive">ไม่ใช้งาน</Option>
              </Select>
              <Input.Search
                placeholder="ค้นหาชื่อหรืออีเมล"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Button onClick={fetchUsers} loading={loading}>
                รีเฟรช
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="uid"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} ผู้ใช้`,
          }}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title={<><UserOutlined /> รายละเอียดผู้ใช้</>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="ข้อมูลพื้นฐาน" key="basic">
              <Descriptions bordered size="small">
                <Descriptions.Item label="ชื่อ-สกุล" span={2}>
                  {selectedUser.displayName}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล" span={1}>
                  {selectedUser.email}
                </Descriptions.Item>
                <Descriptions.Item label="บทบาท">
                  {getRoleTag(selectedUser.accessLevel)}
                </Descriptions.Item>
                <Descriptions.Item label="แผนก">
                  {getDepartmentTag(selectedUser.department)}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  {getStatusTag(selectedUser.status)}
                </Descriptions.Item>
                <Descriptions.Item label="จังหวัดหลัก">
                  {getProvinceName(selectedUser.homeProvince) || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="สาขาหลัก">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getBranchName(selectedUser.homeBranch) || '-'}
                    {selectedUser.homeBranch && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({selectedUser.homeBranch})
                      </Text>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="การใช้งาน">
                  <Switch checked={selectedUser.isActive} disabled />
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="ข้อมูลการอนุมัติ" key="approval">
              {selectedUser.latestApprovalRequest ? (
                <Descriptions bordered size="small">
                  <Descriptions.Item label="สถานะคำขอ" span={2}>
                    <Tag color={selectedUser.latestApprovalRequest.status === 'approved' ? 'green' :
                      selectedUser.latestApprovalRequest.status === 'pending' ? 'orange' : 'red'}>
                      {selectedUser.latestApprovalRequest.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="ประเภทคำขอ" span={1}>
                    {getRequestTypeTag(selectedUser.latestApprovalRequest.requestType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ผู้อนุมัติ" span={2}>
                    {selectedUser.latestApprovalRequest.approvedBy || 'รอการอนุมัติ'}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่สร้างคำขอ" span={1}>
                    {new Date(selectedUser.latestApprovalRequest.createdAt).toLocaleString('th-TH')}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Alert message="ไม่มีข้อมูลการอนุมัติ" type="info" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={<><EditOutlined /> แก้ไขข้อมูลผู้ใช้: {selectedUser?.displayName}</>}
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        width={800}
        destroyOnClose={true}
      >
        {editModalVisible && selectedUser && (
        <Form
            key={selectedUser.uid}
          form={form}
          layout="vertical"
          onFinish={handleUpdateUserRole}
            preserve={false}
        >
            <Tabs defaultActiveKey="role">
              {/* Role & Permissions Tab */}
              <TabPane tab={<><UserOutlined /> บทบาทและสิทธิ์</>} key="role">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accessLevel" label="บทบาท" rules={[{ required: true }]}>
                      <Select placeholder="เลือกบทบาท" optionLabelProp="label">
                        {getAllRoles().map(role => (
                          <Option 
                            key={role.value} 
                            value={role.value}
                            label={role.label}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 500 }}>{role.label}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>{role.description}</div>
                              </div>
                              <Tag 
                                color={role.tag} 
                                size="small"
                                style={{ margin: 0 }}
                              >
                                {role.accessLevel}
                              </Tag>
                            </div>
                          </Option>
                        ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="แผนก" rules={[{ required: true }]}>
                <Select placeholder="เลือกแผนก">
                        {getAllDepartments().map(dept => (
                          <Option key={dept.value} value={dept.value}>{dept.label}</Option>
                        ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Alert 
                      message="ข้อมูลบทบาทและแผนก" 
                      description="การเปลี่ยนแปลงบทบาทจะส่งผลต่อสิทธิ์การเข้าถึงระบบของผู้ใช้" 
                      type="info" 
                      showIcon 
                      style={{ marginBottom: 16 }}
                    />
                  </Col>
                </Row>
              </TabPane>

              {/* Granular Roles Editor Tab */}
              <TabPane tab={<><SettingOutlined /> สิทธิ์เพิ่มเติม</>} key="granular">
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item shouldUpdate>
                      {({ getFieldValue }) => {
                        const selectedRole = getFieldValue('accessLevel');
                        const selectedAdditionalPerms = getFieldValue('additionalPermissions') || [];
                        const roleInfo = selectedRole ? getRoleDisplayInfo(selectedRole) : null;
                        const basePermissions = selectedRole ? BASE_ROLES[selectedRole]?.permissions || [] : [];
                        const effectivePermissions = selectedRole ? getEffectivePermissions(selectedRole, selectedAdditionalPerms) : [];
                        
                        return (
                          <div>
                            {/* Current Role Analysis */}
                            {roleInfo && (
                              <Card 
                                title="บทบาทหลักปัจจุบัน" 
                                size="small" 
                                style={{ marginBottom: 16 }}
                                extra={
                                  <Tag color={roleInfo.tag}>{roleInfo.accessLevel}</Tag>
                                }
                              >
          <Row gutter={16}>
            <Col span={12}>
                                    <Descriptions size="small" column={1}>
                                      <Descriptions.Item label="ชื่อบทบาท">{roleInfo.name}</Descriptions.Item>
                                      <Descriptions.Item label="คำอธิบาย">{roleInfo.description}</Descriptions.Item>
                                      <Descriptions.Item label="ระดับการเข้าถึง">{roleInfo.accessLevel}</Descriptions.Item>
                                      <Descriptions.Item label="สิทธิ์พื้นฐาน">{basePermissions.length} รายการ</Descriptions.Item>
                                      <Descriptions.Item label="สิทธิ์รวม">{effectivePermissions.length} รายการ</Descriptions.Item>
                                    </Descriptions>
                                  </Col>
                                  <Col span={12}>
                                    <div style={{ marginBottom: 8 }}>
                                      <Text strong>สิทธิ์ที่มีทั้งหมด:</Text>
                                    </div>
                                    <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                                      {effectivePermissions.includes('*') ? (
                                        <Tag color="red">ทุกสิทธิ์ (Super Admin)</Tag>
                                      ) : (
                                        effectivePermissions.map(permission => (
                                          <Tag 
                                            key={permission} 
                                            color={basePermissions.includes(permission) ? "blue" : "green"} 
                                            style={{ marginBottom: 4 }}
                                          >
                                            {permission}
                                            {!basePermissions.includes(permission) && " (+)"}
                                          </Tag>
                                        ))
                                      )}
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                      <Text>🔵 สิทธิ์พื้นฐาน | 🟢 สิทธิ์เพิ่มเติม (+)</Text>
                                    </div>
                                  </Col>
                                </Row>
                              </Card>
                            )}

                            {/* Live Permission Preview */}
                            {selectedRole && selectedAdditionalPerms.length > 0 && (
                              <Card 
                                title="🔍 ดูตัวอย่างผลลัพธ์" 
                                size="small" 
                                style={{ marginBottom: 16 }}
                                extra={
                                  <Tag color="processing">อัปเดตแบบ Real-time</Tag>
                                }
                              >
                                <Alert
                                  message="การเปลี่ยนแปลงที่จะเกิดขึ้น"
                                  description={
                                    <div>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text strong>จาก:</Text> {roleInfo?.name} ({basePermissions.length} สิทธิ์)
                                      </div>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text strong>เป็น:</Text> {roleInfo?.name} + สิทธิ์เพิ่มเติม ({effectivePermissions.length} สิทธิ์รวม)
                                      </div>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text strong>สิทธิ์ที่เพิ่ม:</Text>
                                        {selectedAdditionalPerms.map(permKey => {
                                          const perm = GRANULAR_PERMISSIONS[permKey];
                                          return perm ? (
                                            <Tag key={permKey} color="green" size="small" style={{ marginLeft: 4 }}>
                                              {perm.name}
                                            </Tag>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  }
                                  type="success"
                                  showIcon
                                />
                              </Card>
                            )}

                            {/* Additional Permissions Selection */}
                            {selectedRole && (
                              <Card 
                                title={
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>⚙️ เลือกสิทธิ์เพิ่มเติม</span>
                                    <Button 
                                      size="small" 
                                      onClick={() => form.setFieldsValue({ additionalPermissions: [] })}
                                      icon={<DeleteOutlined />}
                                    >
                                      ล้างทั้งหมด
                                    </Button>
                                  </div>
                                }
                                size="small"
                              >
                                <Alert 
                                  message="💡 วิธีการใช้งาน" 
                                  description={
                                    <div>
                                      <p><strong>คลิกที่การ์ด</strong> เพื่อเพิ่ม/ลบสิทธิ์เพิ่มเติม</p>
                                      <p>สิทธิ์เหล่านี้จะ<strong>เพิ่มเติม</strong>บนบทบาทหลัก &ldquo;{roleInfo?.name}&rdquo; <strong>ไม่ได้แทนที่</strong>บทบาทเดิม</p>
                                    </div>
                                  }
                                  type="info" 
                                  showIcon 
                                  style={{ marginBottom: 16 }}
                                />

                                <Form.Item 
                                  name="additionalPermissions" 
                                  label={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span>🎯 สิทธิ์เพิ่มเติม</span>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ({selectedAdditionalPerms.length} รายการ)
                                      </Text>
                                    </div>
                                  }
                                >
                                  <div>
                                    {Object.entries(getPermissionsByCategory(selectedRole)).map(([categoryKey, permissions]) => {
                                      const categoryInfo = PERMISSION_CATEGORIES[categoryKey];
                                      return (
                                        <Card
                                          key={categoryKey}
                                          title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                              <span>{categoryInfo.icon}</span>
                                              <span>{categoryInfo.name}</span>
                                            </div>
                                          }
                                          size="small"
                                          style={{ marginBottom: 12 }}
                                          type="inner"
                                        >
                                          <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                                            {categoryInfo.description}
                                          </div>
                                          <Row gutter={[8, 8]}>
                                            {permissions.map(permission => (
                                              <Col key={permission.key} span={12}>
                                                <Card 
                                                  size="small"
                                                  hoverable
                                                  style={{ 
                                                    cursor: 'pointer',
                                                    border: selectedAdditionalPerms.includes(permission.key) ? 
                                                      `3px solid #52c41a` : 
                                                      '2px dashed #d9d9d9',
                                                    backgroundColor: selectedAdditionalPerms.includes(permission.key) ? 
                                                      '#f6ffed' : 
                                                      '#fafafa',
                                                    transition: 'all 0.3s ease'
                                                  }}
                                                  onClick={() => {
                                                    const currentPerms = getFieldValue('additionalPermissions') || [];
                                                    let newPerms;
                                                    if (currentPerms.includes(permission.key)) {
                                                      newPerms = currentPerms.filter(p => p !== permission.key);
                                                    } else {
                                                      newPerms = [...currentPerms, permission.key];
                                                    }
                                                    form.setFieldsValue({ additionalPermissions: newPerms });
                                                  }}
                                                  actions={[
                                                    selectedAdditionalPerms.includes(permission.key) ? (
                                                      <Button 
                                                        key="remove"
                                                        type="text" 
                                                        size="small" 
                                                        danger
                                                        icon={<MinusOutlined />}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const currentPerms = getFieldValue('additionalPermissions') || [];
                                                          const newPerms = currentPerms.filter(p => p !== permission.key);
                                                          form.setFieldsValue({ additionalPermissions: newPerms });
                                                        }}
                                                      >
                                                        ลบ
                                                      </Button>
                                                    ) : (
                                                      <Button 
                                                        key="add"
                                                        type="text" 
                                                        size="small" 
                                                        icon={<PlusOutlined />}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const currentPerms = getFieldValue('additionalPermissions') || [];
                                                          const newPerms = [...currentPerms, permission.key];
                                                          form.setFieldsValue({ additionalPermissions: newPerms });
                                                        }}
                                                      >
                                                        เพิ่ม
                                                      </Button>
                                                    )
                                                  ]}
                                                >
                                                  <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                      <Text strong style={{ fontSize: '13px' }}>{permission.name}</Text>
                                                      {selectedAdditionalPerms.includes(permission.key) ? (
                                                        <Tag color="green" size="small" icon={<CheckOutlined />}>เลือกแล้ว</Tag>
                                                      ) : (
                                                        <Tag color="default" size="small">ยังไม่เลือก</Tag>
                                                      )}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                                      {permission.description}
                                                    </div>
                                                    <div>
                                                      {permission.permissions.map(perm => (
                                                        <Tag key={perm} color={categoryInfo.color} size="small" style={{ fontSize: '10px' }}>
                                                          {perm}
                                                        </Tag>
                                                      ))}
                                                      {permission.accessLevelUpgrade && (
                                                        <Tag color="purple" size="small" style={{ fontSize: '10px' }}>
                                                          ↗️ {permission.accessLevelUpgrade}
                                                        </Tag>
                                                      )}
                                                    </div>
                                                  </div>
                                                </Card>
                                              </Col>
                                            ))}
                                          </Row>
                                        </Card>
                                      );
                                    })}

                                    {Object.keys(getPermissionsByCategory(selectedRole)).length === 0 && (
                                      <Alert
                                        message="ไม่มีสิทธิ์เพิ่มเติม"
                                        description={`บทบาท &ldquo;${roleInfo?.name}&rdquo; ไม่มีสิทธิ์เพิ่มเติมที่สามารถเลือกได้`}
                                        type="warning"
                                        showIcon
                                      />
                                    )}
                                  </div>
                                </Form.Item>
                              </Card>
                            )}
                          </div>
                        );
                      }}
              </Form.Item>
            </Col>
                </Row>
              </TabPane>

              {/* Geographic Access Tab */}
              <TabPane tab={<><EnvironmentOutlined /> พื้นที่การเข้าถึง</>} key="geographic">
                <Row gutter={16}>
            <Col span={12}>
                    <Form.Item 
                      name="homeProvince" 
                      label="จังหวัดหลัก" 
                      rules={[
                        { required: true, message: 'กรุณาเลือกจังหวัดหลัก' }
                      ]}
                    >
                      <ProvinceSelector 
                        placeholder="เลือกจังหวัด"
                        respectRBAC={false}
                        fetchOnMount={true}
                        onChange={(value) => {
                          // Clear branch when province changes
                          form.setFieldsValue({ homeBranch: null });
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name="homeBranch" 
                      label="สาขาหลัก" 
                      rules={[
                        { required: true, message: 'กรุณาเลือกสาขาหลัก' }
                      ]}
                    >
                      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                        prevValues.homeProvince !== currentValues.homeProvince
                      }>
                        {({ getFieldValue }) => {
                          const selectedProvince = getFieldValue('homeProvince');
                          return (
                            <GeographicBranchSelector 
                              placeholder={selectedProvince ? "เลือกสาขา" : "กรุณาเลือกจังหวัดก่อน"}
                              province={selectedProvince}
                              respectRBAC={false}
                              showBranchCode={true}
                              disabled={!selectedProvince}
                            />
                          );
                        }}
                      </Form.Item>
              </Form.Item>
            </Col>
          </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Alert 
                      message="พื้นที่การเข้าถึง" 
                      description="จังหวัดและสาขาหลักกำหนดขอบเขตการเข้าถึงข้อมูลตาม RBAC" 
                      type="warning" 
                      showIcon 
                      style={{ marginBottom: 16 }}
                    />
                  </Col>
                </Row>
              </TabPane>

              {/* Summary Tab - Update to include additional permissions */}
              <TabPane tab={<><FileTextOutlined /> สรุปข้อมูล</>} key="summary">
                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const currentRole = getFieldValue('accessLevel') || selectedUser.accessLevel;
                    const currentAdditionalPerms = getFieldValue('additionalPermissions') || selectedUser.additionalPermissions || [];
                    const currentDepartment = getFieldValue('department') || selectedUser.department;
                    const currentProvince = getFieldValue('homeProvince') || selectedUser.homeProvince;
                    const currentBranch = getFieldValue('homeBranch') || selectedUser.homeBranch;
                    
                    const roleInfo = currentRole ? getRoleDisplayInfo(currentRole) : null;
                    const effectivePermissions = currentRole ? getEffectivePermissions(currentRole, currentAdditionalPerms) : [];
                    
                    return (
                      <div>
                        {/* User Overview */}
                        <Card title="ภาพรวมผู้ใช้" style={{ marginBottom: 16 }}>
                          <Row gutter={16}>
                            <Col span={8}>
                              <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '8px' }}>
                                  <UserOutlined />
                                </div>
                                <Title level={4} style={{ margin: 0 }}>{selectedUser.displayName}</Title>
                                <Text type="secondary">{selectedUser.email}</Text>
                              </div>
                            </Col>
                            <Col span={16}>
                              <Descriptions column={2} size="small">
                                <Descriptions.Item label="สถานะ">
                                  {getStatusTag(selectedUser.status)}
                                </Descriptions.Item>
                                <Descriptions.Item label="การใช้งาน">
                                  <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                                    {selectedUser.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                  </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="เข้าสู่ระบบล่าสุด">
                                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('th-TH') : 'ไม่เคย'}
                                </Descriptions.Item>
                                <Descriptions.Item label="ยืนยันอีเมล">
                                  <Tag color={selectedUser.emailVerified ? 'green' : 'orange'}>
                                    {selectedUser.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                                  </Tag>
                                </Descriptions.Item>
                              </Descriptions>
                            </Col>
                          </Row>
                        </Card>

                        <Row gutter={16}>
                          {/* Role & Permissions Summary */}
                          <Col span={12}>
                            <Card title="บทบาทและสิทธิ์" size="small" style={{ marginBottom: 16 }}>
                              {roleInfo && (
                                <div>
                                  <div style={{ marginBottom: 12 }}>
                                    <Text strong>บทบาทหลัก: </Text>
                                    <Tag color={roleInfo.tag}>{roleInfo.name}</Tag>
                                  </div>
                                  <div style={{ marginBottom: 12 }}>
                                    <Text strong>แผนก: </Text>
                                    {getDepartmentTag(currentDepartment)}
                                  </div>
                                  <div style={{ marginBottom: 12 }}>
                                    <Text strong>ระดับการเข้าถึง: </Text>
                                    <Tag color={roleInfo.tag}>{roleInfo.accessLevel}</Tag>
                                  </div>
                                  {currentAdditionalPerms.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                      <Text strong>สิทธิ์เพิ่มเติม: </Text>
                                      <div style={{ marginTop: 4 }}>
                                        {currentAdditionalPerms.map(permKey => {
                                          const perm = GRANULAR_PERMISSIONS[permKey];
                                          return perm ? (
                                            <Tag key={permKey} color="green" size="small">
                                              {perm.name}
                                            </Tag>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  <div style={{ marginBottom: 12 }}>
                                    <Text strong>คำอธิบาย: </Text>
                                    <Text type="secondary">{roleInfo.description}</Text>
                                  </div>
                                  <div>
                                    <Text strong>สิทธิ์การเข้าถึงทั้งหมด ({effectivePermissions.length}): </Text>
                                    <div style={{ marginTop: 8, maxHeight: 100, overflowY: 'auto' }}>
                                      {effectivePermissions.includes('*') ? (
                                        <Tag color="red">ทุกสิทธิ์ (Super Admin)</Tag>
                                      ) : (
                                        effectivePermissions.map(permission => (
                                          <Tag key={permission} color="blue" size="small" style={{ marginBottom: 4 }}>
                                            {permission}
                                          </Tag>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          </Col>

                          {/* Geographic Summary */}
                          <Col span={12}>
                            <Card title="พื้นที่การเข้าถึง" size="small" style={{ marginBottom: 16 }}>
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="จังหวัดหลัก">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <EnvironmentOutlined />
                                    <Text>{getProvinceName(currentProvince) || 'ไม่ระบุ'}</Text>
                                  </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="สาขาหลัก">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BankOutlined />
                                    <Text>{getBranchName(currentBranch) || 'ไม่ระบุ'}</Text>
                                    {currentBranch && (
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ({currentBranch})
                                      </Text>
                                    )}
                                  </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="ขอบเขตการเข้าถึง">
                                  {roleInfo && (
                                    <div>
                                      {roleInfo.accessLevel === 'all' && (
                                        <Tag color="purple">เข้าถึงทุกพื้นที่</Tag>
                                      )}
                                      {roleInfo.accessLevel === 'province' && (
                                        <Tag color="blue">ระดับจังหวัด</Tag>
                                      )}
                                      {roleInfo.accessLevel === 'branch' && (
                                        <Tag color="green">ระดับสาขา</Tag>
                                      )}
                                    </div>
                                  )}
                                </Descriptions.Item>
                              </Descriptions>
                            </Card>
                          </Col>
                        </Row>

                        {/* Contact & Activity Summary */}
                        <Row gutter={16}>
                          <Col span={12}>
                            <Card title="ข้อมูลติดต่อ" size="small">
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="ชื่อ-สกุล">{selectedUser.displayName || '-'}</Descriptions.Item>
                                <Descriptions.Item label="อีเมล">{selectedUser.email || '-'}</Descriptions.Item>
                                <Descriptions.Item label="เบอร์โทรศัพท์">{selectedUser.phoneNumber || 'ไม่ระบุ'}</Descriptions.Item>
                              </Descriptions>
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card title="กิจกรรมล่าสุด" size="small">
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="วันที่สร้างบัญชี">
                                  {selectedUser.created ? new Date(selectedUser.created).toLocaleDateString('th-TH') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="เข้าสู่ระบบล่าสุด">
                                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('th-TH') : 'ไม่เคย'}
                                </Descriptions.Item>
                                <Descriptions.Item label="อัปเดตล่าสุด">
                                  {selectedUser.lastUpdated ? new Date(selectedUser.lastUpdated).toLocaleDateString('th-TH') : '-'}
                                </Descriptions.Item>
                              </Descriptions>
                            </Card>
                          </Col>
                        </Row>

                        {/* Approval Information */}
                        {selectedUser.latestApprovalRequest && (
                          <Card title="ข้อมูลการอนุมัติ" size="small" style={{ marginTop: 16 }}>
                            <Descriptions size="small" column={3}>
                              <Descriptions.Item label="สถานะคำขอ">
                                <Tag color={selectedUser.latestApprovalRequest.status === 'approved' ? 'green' :
                                  selectedUser.latestApprovalRequest.status === 'pending' ? 'orange' : 'red'}>
                                  {selectedUser.latestApprovalRequest.status}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="ประเภทคำขอ">
                                {getRequestTypeTag(selectedUser.latestApprovalRequest.requestType)}
                              </Descriptions.Item>
                              <Descriptions.Item label="วันที่สร้างคำขอ">
                                {new Date(selectedUser.latestApprovalRequest.createdAt).toLocaleDateString('th-TH')}
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        )}
                      </div>
                    );
                  }}
                </Form.Item>
              </TabPane>
            </Tabs>
        </Form>
        )}
      </Modal>
    </LayoutWithRBAC>
  );
};

UserManagement.propTypes = {
  // Add any props if needed
};

export default UserManagement; 