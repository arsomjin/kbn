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
  Select,
  Input,
  Row,
  Col,
  Typography,
  Switch,
  Tabs,
  Form,
  Popconfirm,
  Badge,
  notification,
  Checkbox
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
  CheckOutlined,
  UnlockOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import { useResponsive } from 'hooks/useResponsive';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import ProvinceSelector from 'components/ProvinceSelector';
import GeographicBranchSelector from 'components/GeographicBranchSelector';
import ScreenWithManual from 'components/ScreenWithManual';
import { 
  getProvinceName,
  getBranchName, 
  getDepartmentName,
  getUserTypeName,
  getApprovalLevelName,
  getAccessLevelName,
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

// Import shared utilities for 100% accuracy with CleanSlatePermissionsDemo
import {
  fetchUsersWithCleanSlate,
  updateUserRoleCleanSlate,
  toggleUserStatusCleanSlate,
  deleteUserCleanSlate,
  handleUserManagementError,
  getUserDisplayInfo,
  validateCleanSlateStructure
} from 'utils/user-management-shared';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Add search and filter states
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSelector(state => state.auth);
  const { isMobile, isTablet, isDesktop } = useResponsive();
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

  // Use shared fetch function for 100% accuracy with CleanSlatePermissionsDemo
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsersWithCleanSlate({ includeDebug: true });
      setUsers(usersData);
    } catch (error) {
      handleUserManagementError(error, 'โหลดข้อมูลผู้ใช้');
    }
    setLoading(false);
  };

  // Use shared toggle function for 100% accuracy with CleanSlatePermissionsDemo  
  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      const result = await toggleUserStatusCleanSlate({ 
        userId, 
        currentStatus, 
        currentUser 
      });
      notification.success({
        message: 'อัปเดตสถานะสำเร็จ',
        description: result.message,
        duration: 3
      });
      fetchUsers();
    } catch (error) {
      handleUserManagementError(error, 'อัปเดตสถานะผู้ใช้');
    }
    setActionLoading(false);
  };

  // Use shared update function for 100% accuracy with CleanSlatePermissionsDemo
  const handleUpdateUserRole = async (values) => {
    setActionLoading(true);
    try {
      const result = await updateUserRoleCleanSlate({
        selectedUser,
        values,
        currentUser,
        validateRoleAssignment
      });
      
      notification.success({
        message: 'อัปเดตสิทธิ์สำเร็จ',
        description: result.message,
        duration: 3
      });

      // Refresh user list
      await fetchUsers();
      setModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
      
    } catch (error) {
      handleUserManagementError(error, 'อัปเดตข้อมูลผู้ใช้');
    } finally {
      setActionLoading(false);
    }
  };

  // Use shared delete function for 100% accuracy with CleanSlatePermissionsDemo
  const handleDeleteUser = async (userId) => {
    setActionLoading(true);
    try {
      const result = await deleteUserCleanSlate({ userId, currentUser });
      
      notification.success({
        message: 'ลบผู้ใช้สำเร็จ',
        description: result.message,
        duration: 3
      });
      
      fetchUsers();
    } catch (error) {
      handleUserManagementError(error, 'ลบผู้ใช้');
    }
    setActionLoading(false);
  };

  const getPermissionDisplay = (permissions) => {
    // Handle both legacy array format and Clean Slate object format
    let permissionArray = [];
    
    // Debug log to help with troubleshooting
    if (process.env.NODE_ENV === 'development' && permissions) {
      console.log('🔍 Permission format detected:', {
        isArray: Array.isArray(permissions),
        isObject: typeof permissions === 'object',
        hasDeparts: permissions?.departments ? 'yes' : 'no',
        hasFeatures: permissions?.features ? 'yes' : 'no',
        rawData: permissions
      });
    }
    
    if (Array.isArray(permissions)) {
      // Legacy format: array of permission strings
      permissionArray = permissions;
    } else if (permissions && typeof permissions === 'object') {
      // Clean Slate format: nested object structure
      if (permissions.departments) {
        // Extract permissions from Clean Slate departments structure
        Object.entries(permissions.departments).forEach(([dept, actions]) => {
          if (actions && typeof actions === 'object') {
            Object.entries(actions).forEach(([action, hasPermission]) => {
              if (hasPermission) {
                permissionArray.push(`${dept}.${action}`);
              }
            });
          }
        });
      }
      
      if (permissions.features) {
        // Extract permissions from Clean Slate features structure
        Object.entries(permissions.features).forEach(([feature, actions]) => {
          if (actions && typeof actions === 'object') {
            Object.entries(actions).forEach(([action, hasPermission]) => {
              if (hasPermission) {
                permissionArray.push(`${feature}.${action}`);
              }
            });
          }
        });
      }
    }
    
    if (!permissionArray || permissionArray.length === 0) {
      return <Tag color="default">ไม่มีสิทธิ์</Tag>;
    }

    const groupedPerms = {};
    permissionArray.forEach(perm => {
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

  // Helper function to map geographic scope to Thai names
  const getScopeName = (scope) => {
    const scopeMapping = {
      'ALL': 'ทุกพื้นที่',
      'PROVINCE': 'ระดับจังหวัด', 
      'BRANCH': 'ระดับสาขา'
    };
    return scopeMapping[scope] || scope || 'ไม่ระบุ';
  };

  // Helper function to get user display name with fallbacks
  const getUserDisplayName = (userData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PermissionManagement] getUserDisplayName input:', {
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        fullData: userData
      });
    }
    
    // Check displayName first
    if (userData.displayName && userData.displayName !== 'ไม่ระบุชื่อ') {
      return userData.displayName;
    }
    
    // Try firstName + lastName combination
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`.trim();
    }
    
    // Try individual name fields
    if (userData.firstName) {
      return userData.firstName;
    }
    if (userData.lastName) {
      return userData.lastName;
    }
    
    // Check if data is nested in auth object (legacy structure)
    if (userData.auth) {
      if (userData.auth.displayName && userData.auth.displayName !== 'ไม่ระบุชื่อ') {
        return userData.auth.displayName;
      }
      if (userData.auth.firstName && userData.auth.lastName) {
        return `${userData.auth.firstName} ${userData.auth.lastName}`.trim();
      }
      if (userData.auth.firstName) return userData.auth.firstName;
      if (userData.auth.lastName) return userData.auth.lastName;
    }
    
    // Use email prefix as fallback
    if (userData.email) {
      return userData.email.split('@')[0];
    }
    
    return 'ไม่ระบุชื่อ';
  };

  // Helper function to convert Clean Slate permissions to array format for form
  const convertPermissionsToArray = (permissions) => {
    let permissionArray = [];
    
    if (Array.isArray(permissions)) {
      // Already in array format
      return permissions;
    } else if (permissions && typeof permissions === 'object') {
      // Clean Slate format: convert to array
      if (permissions.departments) {
        Object.entries(permissions.departments).forEach(([dept, actions]) => {
          if (actions && typeof actions === 'object') {
            Object.entries(actions).forEach(([action, hasPermission]) => {
              if (hasPermission) {
                permissionArray.push(`${dept}.${action}`);
              }
            });
          }
        });
      }
      
      if (permissions.features) {
        Object.entries(permissions.features).forEach(([feature, actions]) => {
          if (actions && typeof actions === 'object') {
            Object.entries(actions).forEach(([action, hasPermission]) => {
              if (hasPermission) {
                permissionArray.push(`${feature}.${action}`);
              }
            });
          }
        });
      }
    }
    
    return permissionArray;
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

  // Add filtering logic for users
  const filteredUsers = users.filter(user => {
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const displayName = getUserDisplayName(user).toLowerCase();
      const email = (user.email || '').toLowerCase();
      if (!displayName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

    // Apply role filter
    if (filterRole !== 'all' && user.accessLevel !== filterRole) {
      return false;
    }

    // Apply department filter
    if (filterDepartment !== 'all' && user.department !== filterDepartment) {
      return false;
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const userStatus = user.isActive && user.isApproved ? 'active' :
        user.approvalStatus === 'pending' ? 'pending' :
          user.approvalStatus === 'rejected' ? 'rejected' : 'inactive';
      if (userStatus !== filterStatus) {
        return false;
      }
    }

    return true;
  });

  // Helper functions for dropdown options
  const getAllRoles = () => {
    return [
      { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
      { value: 'MANAGER', label: 'ผู้จัดการ' },
      { value: 'LEAD', label: 'หัวหน้าแผนก' },
      { value: 'STAFF', label: 'เจ้าหน้าที่' }
    ];
  };

  const getAllDepartments = () => {
    return [
      { value: 'accounting', label: 'บัญชีการเงิน' },
      { value: 'sales', label: 'ขายและลูกค้า' },
      { value: 'service', label: 'บริการซ่อม' },
      { value: 'inventory', label: 'คลังสินค้า' },
      { value: 'hr', label: 'ทรัพยากรบุคคล' },
      { value: 'general', label: 'ทั่วไป' }
    ];
  };

  const columns = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'displayName',
      key: 'displayName',
      width: isMobile ? 120 : isTablet ? 140 : 150,
      render: (text, record) => {
        const displayName = getUserDisplayName(record);
        return (
          <Space direction={'horizontal'} size="small">
            <UserOutlined />
            <div>
              <div style={{ 
                fontWeight: 500,
                fontSize: isMobile ? '13px' : '14px'
              }}>
                {isMobile && displayName.length > 12 
                  ? `${displayName.substring(0, 12)}...` 
                  : displayName
                }
              </div>
              {!isMobile && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {record.email}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'บทบาท',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: isMobile ? 80 : isTablet ? 90 : 100,
      responsive: ['sm'],
      render: (accessLevel, record) => {
        // Get Thai name for accessLevel/authority
        const authorityName = getAccessLevelName(accessLevel);
        
        // Get scope from Clean Slate structure if available
        const scope = record.access?.geographic?.scope;
        const scopeName = scope ? getScopeName(scope) : null;
        
        return (
          <div>
            <Tag 
              color="blue"
              style={{ fontSize: isMobile ? '10px' : '12px' }}
            >
              {isMobile 
                ? authorityName.substring(0, 4) + (authorityName.length > 4 ? '...' : '')
                : authorityName
              }
            </Tag>
            {!isMobile && scopeName && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {scopeName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'สิทธิ์การใช้งาน',
      dataIndex: 'permissions',
      key: 'permissions',
      width: isMobile ? 100 : isTablet ? 120 : 150,
      responsive: ['md'],
      ellipsis: isMobile,
      render: (permissions) => {
        const display = getPermissionDisplay(permissions);
        if (isMobile && display && display.length > 2) {
          // Show only first 2 permissions on mobile
          return (
            <div>
              {display.slice(0, 2)}
              {display.length > 2 && (
                <Tag size="small" style={{ fontSize: '10px' }}>
                  +{display.length - 2}
                </Tag>
              )}
            </div>
          );
        }
        return display;
      },
    },
    {
      title: isMobile ? 'จำนวน' : 'จำนวนสิทธิ์',
      dataIndex: 'permissions',
      key: 'permissionCount',
      width: isMobile ? 60 : isTablet ? 80 : 100,
      responsive: ['lg'],
      render: (permissions) => {
        let count = 0;
        
        if (Array.isArray(permissions)) {
          count = permissions.length;
        } else if (permissions && typeof permissions === 'object') {
          // Count permissions from Clean Slate structure
          if (permissions.departments) {
            Object.values(permissions.departments).forEach(actions => {
              if (actions && typeof actions === 'object') {
                count += Object.values(actions).filter(Boolean).length;
              }
            });
          }
          if (permissions.features) {
            Object.values(permissions.features).forEach(actions => {
              if (actions && typeof actions === 'object') {
                count += Object.values(actions).filter(Boolean).length;
              }
            });
          }
        }
        
        return (
          <Tag 
            color="cyan" 
            style={{ fontSize: isMobile ? '10px' : '12px' }}
          >
            {isMobile ? count : `${count} สิทธิ์`}
          </Tag>
        );
      },
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: isMobile ? 60 : isTablet ? 100 : 120,
      fixed: !isMobile ? 'right' : undefined,
      render: (_, record) => (
        <Button
          icon={<SettingOutlined />}
          size="small"
          type="primary"
          onClick={() => {
            setSelectedUser(record);
            // Convert Clean Slate permissions to array format for the form
            const permissionsArray = convertPermissionsToArray(record.permissions);
            form.setFieldsValue({
              permissions: permissionsArray
            });
            setModalVisible(true);
          }}
          disabled={!hasPermission('admin.edit')}
        >
          {isMobile ? '' : 'จัดการสิทธิ์'}
        </Button>
      ),
    },
  ];

  return (
    <ScreenWithManual 
      screenType="permission-management"
      showManualOnFirstVisit={true}
    >
      <LayoutWithRBAC permission="admin.view" title="จัดการสิทธิ์การใช้งาน">
        <Row gutter={isMobile ? [8, 8] : [16, 16]}>
          <Col span={24}>
              <Alert
                message="คำแนะนำ"
                description={isMobile 
                  ? "จัดการสิทธิ์ผู้ใช้แต่ละคน"
                  : "หน้านี้ใช้สำหรับจัดการสิทธิ์การใช้งานของผู้ใช้แต่ละคน สิทธิ์จะถูกจัดกลุ่มตามแผนกและระดับการใช้งาน"
                }
                type="info"
                showIcon
                style={{ 
                  marginBottom: isMobile ? 12 : 16,
                  fontSize: isMobile ? '13px' : undefined
                }}
              />

              {/* Search and Filter Section */}
              <Card 
                size="small" 
                style={{ marginBottom: isMobile ? 12 : 16 }}
                title={
                  <Space>
                    <SearchOutlined />
                    <span>ค้นหาและกรองข้อมูล</span>
                  </Space>
                }
              >
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={12} md={6}>
                    <Input.Search
                      placeholder="ค้นหาชื่อหรืออีเมล"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: '100%' }}
                      size={isMobile ? 'small' : 'default'}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      value={filterRole}
                      onChange={setFilterRole}
                      style={{ width: '100%' }}
                      placeholder="กรองตามบทบาท"
                      size={isMobile ? 'small' : 'default'}
                    >
                      <Option value="all">ทุกบทบาท</Option>
                      {getAllRoles().map(role => (
                        <Option key={role.value} value={role.value}>{role.label}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      value={filterDepartment}
                      onChange={setFilterDepartment}
                      style={{ width: '100%' }}
                      placeholder="กรองตามแผนก"
                      size={isMobile ? 'small' : 'default'}
                    >
                      <Option value="all">ทุกแผนก</Option>
                      {getAllDepartments().map(dept => (
                        <Option key={dept.value} value={dept.value}>{dept.label}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      value={filterStatus}
                      onChange={setFilterStatus}
                      style={{ width: '100%' }}
                      placeholder="กรองตามสถานะ"
                      size={isMobile ? 'small' : 'default'}
                    >
                      <Option value="all">ทุกสถานะ</Option>
                      <Option value="active">ใช้งานได้</Option>
                      <Option value="pending">รออนุมัติ</Option>
                      <Option value="rejected">ถูกปฏิเสธ</Option>
                      <Option value="inactive">ไม่ใช้งาน</Option>
                    </Select>
                  </Col>
                </Row>
              </Card>

              {/* Filter Summary */}
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                แสดง {filteredUsers.length} จาก {users.length} ผู้ใช้
                {searchText && (
                  <Tag size="small" style={{ marginLeft: 8 }}>
                    ค้นหา: {searchText}
                  </Tag>
                )}
                {filterRole !== 'all' && (
                  <Tag size="small" color="blue">
                    บทบาท: {getAllRoles().find(r => r.value === filterRole)?.label}
                  </Tag>
                )}
                {filterDepartment !== 'all' && (
                  <Tag size="small" color="green">
                    แผนก: {getAllDepartments().find(d => d.value === filterDepartment)?.label}
                  </Tag>
                )}
                {filterStatus !== 'all' && (
                  <Tag size="small" color="orange">
                    สถานะ: {filterStatus === 'active' ? 'ใช้งานได้' : 
                            filterStatus === 'pending' ? 'รออนุมัติ' :
                            filterStatus === 'rejected' ? 'ถูกปฏิเสธ' : 'ไม่ใช้งาน'}
                  </Tag>
                )}
              </div>
          </Col>
          
          <Col span={24}>
            <Card title={<><SafetyOutlined /> สิทธิ์ที่มีในระบบ</>}>
              <Row gutter={isMobile ? 8 : 16}>
                {Object.entries(permissionCategories).map(([key, category]) => (
                  <Col 
                    span={isMobile ? 24 : isTablet ? 12 : 12} 
                    key={key} 
                    style={{ marginBottom: 16 }}
                  >
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
                            <Text 
                              strong 
                              style={{ fontSize: isMobile ? '13px' : '14px' }}
                            >
                              {perm.name}
                            </Text>
                            <br />
                            <Text 
                              type="secondary" 
                              style={{ fontSize: isMobile ? '11px' : '12px' }}
                            >
                              {isMobile && perm.description.length > 50
                                ? `${perm.description.substring(0, 50)}...`
                                : perm.description
                              }
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
        {selectedUser && (
          <Modal
            title={
              <Space>
                <SettingOutlined />
                <span>จัดการสิทธิ์: {getUserDisplayName(selectedUser)}</span>
              </Space>
            }
            visible={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setSelectedUser(null);
              form.resetFields();
            }}
            onOk={() => form.submit()}
            confirmLoading={actionLoading}
            width={isMobile ? '95%' : isTablet ? 600 : 800}
            style={isMobile ? { top: 20 } : {}}
            className="permission-management-modal"
            okText="บันทึก"
            cancelText="ยกเลิก"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateUserRole}
            >
              <Alert
                message={`กำหนดสิทธิ์สำหรับ: ${getUserDisplayName(selectedUser)}`}
                description={`บทบาท: ${getAccessLevelName(selectedUser.accessLevel)} | แผนก: ${getDepartmentName(selectedUser.department) || 'ไม่ระบุ'}`}
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
                          <Row gutter={isMobile ? 4 : 8}>
                            {category.permissions.map(perm => (
                              <Col 
                                span={isMobile ? 24 : isTablet ? 12 : 24} 
                                key={perm.key} 
                                style={{ marginBottom: isMobile ? 4 : 8 }}
                              >
                                <Checkbox value={perm.key}>
                                  <div>
                                    <Text 
                                      strong 
                                      style={{ fontSize: isMobile ? '13px' : '14px' }}
                                    >
                                      {perm.name}
                                    </Text>
                                    <br />
                                    <Text 
                                      type="secondary" 
                                      style={{ fontSize: isMobile ? '11px' : '12px' }}
                                    >
                                      {isMobile && perm.description.length > 40
                                        ? `${perm.description.substring(0, 40)}...`
                                        : perm.description
                                      }
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

              <Row gutter={isMobile ? 8 : 16}>
                <Col span={isMobile ? 24 : 12} style={{ marginBottom: isMobile ? 8 : 0 }}>
                  <Button
                    block
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => {
                      form.setFieldValue('permissions', getAllPermissions());
                    }}
                  >
                    <UnlockOutlined /> {isMobile ? 'เลือกทั้งหมด' : 'เลือกทั้งหมด'}
                  </Button>
                </Col>
                <Col span={isMobile ? 24 : 12}>
                  <Button
                    block
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => {
                      form.setFieldValue('permissions', []);
                    }}
                  >
                    <LockOutlined /> {isMobile ? 'ยกเลิกทั้งหมด' : 'ยกเลิกทั้งหมด'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Modal>
        )}
      </LayoutWithRBAC>
    </ScreenWithManual>
  );
};

export default PermissionManagement; 