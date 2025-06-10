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
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from 'hooks/usePermissions';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';

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
      const updates = {
        'auth.accessLevel': values.accessLevel,
        'auth.department': values.department,
        'auth.homeProvince': values.homeProvince,
        'auth.homeBranch': values.homeBranch,
        'auth.allowedProvinces': values.allowedProvinces || [values.homeProvince],
        'auth.allowedBranches': values.allowedBranches || [values.homeBranch],
        'auth.lastUpdated': Date.now(),
        'auth.updatedBy': currentUser.uid
      };

      await app.firestore()
        .collection('users')
        .doc(selectedUser.uid)
        .update(updates);

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
    const statusConfig = {
      active: { color: 'green', text: 'ใช้งานได้' },
      pending: { color: 'orange', text: 'รออนุมัติ' },
      rejected: { color: 'red', text: 'ถูกปฏิเสธ' },
      inactive: { color: 'default', text: 'ไม่ใช้งาน' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRoleTag = (accessLevel) => {
    const roleColors = {
      SUPER_ADMIN: 'red',
      EXECUTIVE: 'purple',
      PROVINCE_MANAGER: 'blue',
      BRANCH_MANAGER: 'green',
      ACCOUNTING_STAFF: 'orange',
      SALES_STAFF: 'cyan',
      SERVICE_STAFF: 'lime',
      INVENTORY_STAFF: 'gold'
    };

    return <Tag color={roleColors[accessLevel] || 'default'}>{accessLevel}</Tag>;
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
      render: (department) => department ? <Tag>{department}</Tag> : '-',
    },
    {
      title: 'จังหวัด/สาขา',
      key: 'location',
      render: (_, record) => (
        <div>
          <div><EnvironmentOutlined /> {record.homeProvince || '-'}</div>
          <div><BankOutlined /> {record.homeBranch || '-'}</div>
        </div>
      ),
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
              form.setFieldsValue({
                accessLevel: record.accessLevel,
                department: record.department,
                homeProvince: record.homeProvince,
                homeBranch: record.homeBranch
              });
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
    <LayoutWithRBAC permission="users.view" title="จัดการผู้ใช้งาน">
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
                style={{ width: 200 }}
                placeholder="กรองตามบทบาท"
              >
                <Option value="all">ทุกบทบาท</Option>
                <Option value="SUPER_ADMIN">Super Admin</Option>
                <Option value="EXECUTIVE">Executive</Option>
                <Option value="PROVINCE_MANAGER">Province Manager</Option>
                <Option value="BRANCH_MANAGER">Branch Manager</Option>
                <Option value="SALES_STAFF">Sales Staff</Option>
                <Option value="ACCOUNTING_STAFF">Accounting Staff</Option>
                <Option value="SERVICE_STAFF">Service Staff</Option>
                <Option value="INVENTORY_STAFF">Inventory Staff</Option>
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
        open={modalVisible}
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
                  {selectedUser.department || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  {getStatusTag(selectedUser.status)}
                </Descriptions.Item>
                <Descriptions.Item label="จังหวัดหลัก">
                  {selectedUser.homeProvince || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="สาขาหลัก">
                  {selectedUser.homeBranch || '-'}
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
                    {selectedUser.latestApprovalRequest.requestType}
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
        title={<><EditOutlined /> แก้ไขข้อมูลผู้ใช้</>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUserRole}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="accessLevel" label="บทบาท" rules={[{ required: true }]}>
                <Select placeholder="เลือกบทบาท">
                  <Option value="SUPER_ADMIN">Super Admin</Option>
                  <Option value="EXECUTIVE">Executive</Option>
                  <Option value="PROVINCE_MANAGER">Province Manager</Option>
                  <Option value="BRANCH_MANAGER">Branch Manager</Option>
                  <Option value="SALES_STAFF">Sales Staff</Option>
                  <Option value="ACCOUNTING_STAFF">Accounting Staff</Option>
                  <Option value="SERVICE_STAFF">Service Staff</Option>
                  <Option value="INVENTORY_STAFF">Inventory Staff</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="แผนก" rules={[{ required: true }]}>
                <Select placeholder="เลือกแผนก">
                  <Option value="accounting">บัญชี</Option>
                  <Option value="sales">ขาย</Option>
                  <Option value="service">บริการ</Option>
                  <Option value="inventory">คลังสินค้า</Option>
                  <Option value="management">จัดการ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="homeProvince" label="จังหวัดหลัก" rules={[{ required: true }]}>
                <Select placeholder="เลือกจังหวัด">
                  <Option value="nakhon-ratchasima">นครราชสีมา</Option>
                  <Option value="nakhon-sawan">นครสวรรค์</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="homeBranch" label="สาขาหลัก" rules={[{ required: true }]}>
                <Select placeholder="เลือกสาขา">
                  <Option value="0450">0450</Option>
                  <Option value="NMA002">NMA002</Option>
                  <Option value="NMA003">NMA003</Option>
                  <Option value="NSN001">NSN001</Option>
                  <Option value="NSN002">NSN002</Option>
                  <Option value="NSN003">NSN003</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </LayoutWithRBAC>
  );
};

UserManagement.propTypes = {
  // Add any props if needed
};

export default UserManagement; 