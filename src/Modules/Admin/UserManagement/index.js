import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
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
  Badge,
} from 'antd';
import { Button, SearchInput } from 'elements';
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
  ReloadOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  fetchUsersWithCleanSlate,
  updateUserRoleCleanSlate,
  toggleUserStatusCleanSlate,
  deleteUserCleanSlate,
  getUserDisplayInfo,
  handleUserManagementError,
  refreshCurrentUserData,
} from 'utils/user-management-shared';
import { useSelector, useDispatch } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from 'hooks/usePermissions';
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
  APPROVAL_LEVEL_MAPPINGS,
} from 'utils/mappings';
import {
  GRANULAR_PERMISSIONS,
  PERMISSION_CATEGORIES,
  getCompatiblePermissions,
  getPermissionsByCategory,
  createRoleChangeAuditLog,
  getEffectivePermissions,
} from 'utils/rbac-enhanced';
import { useResponsive } from 'hooks/useResponsive';

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
  const [roleHelpModalVisible, setRoleHelpModalVisible] = useState(false);

  const { hasPermission } = usePermissions();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form initialization effect - populate form with selected user data
  useEffect(() => {
    if (editModalVisible && selectedUser) {
      // Populate form with selected user data
      const formValues = {
        accessLevel:
          selectedUser.access?.authority || selectedUser.accessLevel || 'STAFF',
        department: selectedUser.department || 'general',
        homeProvince:
          selectedUser.access?.geographic?.homeProvince ||
          selectedUser.homeProvince ||
          'nakhon-sawan',
        homeBranch:
          selectedUser.access?.geographic?.homeBranch ||
          selectedUser.homeBranch ||
          'NSN001',
        additionalPermissions: selectedUser.additionalPermissions || [],
      };

      console.log('🔄 Populating form with user data:', {
        selectedUser: selectedUser,
        formValues: formValues,
        userStructure: {
          cleanSlate: selectedUser.access,
          legacy: {
            accessLevel: selectedUser.accessLevel,
            homeProvince: selectedUser.homeProvince,
            homeBranch: selectedUser.homeBranch,
            department: selectedUser.department,
          },
        },
      });

      form.setFieldsValue(formValues);
    }
  }, [editModalVisible, selectedUser, form]);

  // Helper function to map geographic scope to Thai names
  const getScopeName = (scope) => {
    const scopeMapping = {
      ALL: 'ทุกพื้นที่',
      PROVINCE: 'ระดับจังหวัด',
      BRANCH: 'ระดับสาขา',
    };
    return scopeMapping[scope] || scope || 'ไม่ระบุ';
  };

  // Clean Slate role validation (replaces Enhanced RBAC validation)
  const validateRoleAssignment = (
    targetRole,
    currentUserRole,
    currentUserData = null
  ) => {
    const cleanSlateRoles = {
      ADMIN: { level: 4, name: 'ผู้ดูแลระบบ' },
      MANAGER: { level: 3, name: 'ผู้จัดการ' },
      LEAD: { level: 2, name: 'หัวหน้าแผนก' },
      STAFF: { level: 1, name: 'เจ้าหน้าที่' },
    };

    const targetRoleData = cleanSlateRoles[targetRole];
    const currentUserRoleData = cleanSlateRoles[currentUserRole];

    // Enhanced error messages with context
    if (!targetRoleData) {
      return {
        valid: false,
        reason: `บทบาท "${targetRole}" ไม่ถูกต้อง - กรุณาเลือกบทบาทที่ถูกต้อง (ผู้ดูแลระบบ, ผู้จัดการ, หัวหน้าแผนก, เจ้าหน้าที่)`,
        details: `บทบาทที่ระบุ "${targetRole}" ไม่มีอยู่ในระบบ`,
      };
    }

    if (!currentUserRoleData) {
      return {
        valid: false,
        reason: `บทบาทปัจจุบันของคุณ "${currentUserRole}" ไม่ถูกต้อง - กรุณาติดต่อผู้ดูแลระบบ`,
        details: `ระบบไม่สามารถระบุบทบาทปัจจุบันของคุณได้`,
      };
    }

    // Check if current user has Clean Slate RBAC structure
    const hasCleanSlateAccess = currentUserData?.access?.authority;
    if (!hasCleanSlateAccess) {
      return {
        valid: false,
        reason:
          'บัญชีของคุณยังไม่ได้อัปเดตเป็นระบบ RBAC ใหม่ - กรุณาติดต่อผู้ดูแลระบบ',
        details: 'ต้องมีโครงสร้าง Clean Slate RBAC เพื่อจัดการบทบาทผู้ใช้',
      };
    }

    // Use Clean Slate authority for validation
    const actualCurrentRole = currentUserData.access.authority;
    const actualCurrentRoleData = cleanSlateRoles[actualCurrentRole];

    if (!actualCurrentRoleData) {
      return {
        valid: false,
        reason: `บทบาทปัจจุบันของคุณในระบบ "${actualCurrentRole}" ไม่ถูกต้อง - กรุณาติดต่อผู้ดูแลระบบ`,
        details: 'โครงสร้าง RBAC ของคุณมีปัญหา',
      };
    }

    // Admin can assign any role
    if (actualCurrentRole === 'ADMIN') {
      return { valid: true };
    }

    // Manager can assign roles below them
    if (actualCurrentRole === 'MANAGER') {
      if (['ADMIN'].includes(targetRole)) {
        return {
          valid: false,
          reason: `คุณไม่มีสิทธิ์มอบหมายบทบาท "${targetRoleData.name}" - ผู้จัดการสามารถมอบหมายได้เฉพาะบทบาทที่ต่ำกว่าเท่านั้น`,
          details: `บทบาทปัจจุบัน: ${actualCurrentRoleData.name} (ระดับ ${actualCurrentRoleData.level}) ไม่สามารถมอบหมาย ${targetRoleData.name} (ระดับ ${targetRoleData.level}) ได้`,
        };
      }
      return { valid: true };
    }

    // Lead can only assign staff roles
    if (actualCurrentRole === 'LEAD') {
      if (!['STAFF'].includes(targetRole)) {
        return {
          valid: false,
          reason: `คุณสามารถมอบหมายได้เฉพาะบทบาท "เจ้าหน้าที่" เท่านั้น - หัวหน้าแผนกไม่สามารถมอบหมายบทบาท "${targetRoleData.name}" ได้`,
          details: `บทบาทปัจจุบัน: ${actualCurrentRoleData.name} สามารถมอบหมายได้เฉพาะเจ้าหน้าที่เท่านั้น`,
        };
      }
      return { valid: true };
    }

    // Staff cannot assign roles
    if (actualCurrentRole === 'STAFF') {
      return {
        valid: false,
        reason:
          'คุณไม่มีสิทธิ์มอบหมายบทบาทให้ผู้ใช้อื่น - เฉพาะหัวหน้าแผนกขึ้นไปเท่านั้นที่สามารถจัดการบทบาทได้',
        details: 'เจ้าหน้าที่ไม่สามารถเปลี่ยนแปลงบทบาทผู้ใช้ได้',
      };
    }

    return {
      valid: false,
      reason: `เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ - กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ`,
      details: `ไม่สามารถประมวลผลการตรวจสอบสิทธิ์สำหรับ ${actualCurrentRole} → ${targetRole}`,
    };
  };

  // Clean Slate role display info (replaces Enhanced RBAC function)
  const getRoleDisplayInfo = (roleKey) => {
    const cleanSlateRoleInfo = {
      ADMIN: {
        name: 'ผู้ดูแลระบบ',
        description: 'เข้าถึงทุกฟังก์ชันในระบบ',
        accessLevel: 'all',
        tag: 'red',
      },
      MANAGER: {
        name: 'ผู้จัดการ',
        description: 'จัดการในขอบเขตที่ได้รับมอบหมาย',
        accessLevel: 'province',
        tag: 'blue',
      },
      LEAD: {
        name: 'หัวหน้าแผนก',
        description: 'หัวหน้าทีมในแผนก',
        accessLevel: 'branch',
        tag: 'green',
      },
      STAFF: {
        name: 'เจ้าหน้าที่',
        description: 'การเข้าถึงระดับปฏิบัติการ',
        accessLevel: 'branch',
        tag: 'orange',
      },
    };

    return (
      cleanSlateRoleInfo[roleKey] || {
        name: roleKey,
        description: '',
        accessLevel: 'branch',
        tag: 'default',
      }
    );
  };

  // Clean Slate base roles (replaces BASE_ROLES)
  const BASE_ROLES = {
    ADMIN: {
      name: 'ผู้ดูแลระบบ',
      permissions: ['*'],
      description: 'เข้าถึงทุกฟังก์ชันในระบบ',
    },
    MANAGER: {
      name: 'ผู้จัดการ',
      permissions: [
        'accounting.view',
        'sales.view',
        'service.view',
        'inventory.view',
        'hr.view',
      ],
      description: 'จัดการในขอบเขตที่ได้รับมอบหมาย',
    },
    LEAD: {
      name: 'หัวหน้าแผนก',
      permissions: ['accounting.view', 'sales.view', 'service.view'],
      description: 'หัวหน้าทีมในแผนก',
    },
    STAFF: {
      name: 'เจ้าหน้าที่',
      permissions: ['sales.view'],
      description: 'การเข้าถึงระดับปฏิบัติการ',
    },
  };

  // Helper function to get user display name with fallbacks
  const getUserDisplayName = (userData) => {
    // Check displayName first (if valid)
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
      if (
        userData.auth.displayName &&
        userData.auth.displayName !== 'ไม่ระบุชื่อ'
      ) {
        return userData.auth.displayName;
      }
      if (userData.auth.firstName && userData.auth.lastName) {
        return `${userData.auth.firstName} ${userData.auth.lastName}`.trim();
      }
      if (userData.auth.firstName) return userData.auth.firstName;
      if (userData.auth.lastName) return userData.auth.lastName;
    }

    // Use email prefix as final fallback
    if (userData.email) {
      return userData.email.split('@')[0];
    }

    return 'ไม่ระบุชื่อ';
  };

  const handleUserManagementError = (error, operation) => {
    console.error(`❌ ${operation} Error:`, error);

    // Check for Firebase permission errors
    if (
      error.code === 'permission-denied' ||
      error.message?.includes('permission')
    ) {
      message.error({
        content: `ไม่มีสิทธิ์ในการ${operation} - กรุณาติดต่อผู้ดูแลระบบ`,
        duration: 8,
      });

      console.warn('🚫 Firebase Permission Error Details:', {
        operation,
        error: error,
        currentUser: currentUser,
        hasCleanSlateRBAC: !!currentUser?.access?.authority,
        suggestion:
          'User may need Clean Slate RBAC structure or Firebase rules update',
      });
    } else if (error.code === 'not-found') {
      message.error(`ไม่พบข้อมูลที่ต้องการ${operation}`);
    } else if (error.code === 'unavailable') {
      message.error('ระบบไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } else {
      message.error(
        `เกิดข้อผิดพลาดในการ${operation}: ${error.message || 'ไม่ทราบสาเหตุ'}`
      );
    }
  };

  // Filter users based on current user's authority level
  const getManageableUsers = (allUsers) => {
    const currentAuthority =
      currentUser?.access?.authority || currentUser?.accessLevel;

    if (!currentAuthority) {
      console.warn('⚠️ Current user has no authority defined');
      return [];
    }

    // ADMIN can manage all users
    if (currentAuthority === 'ADMIN') {
      return allUsers;
    }

    // MANAGER can manage LEAD and STAFF in their geographic scope
    if (currentAuthority === 'MANAGER') {
      const currentUserProvince =
        currentUser?.access?.geographic?.homeProvince ||
        currentUser?.homeProvince;

      return allUsers.filter((user) => {
        const userAuthority = user.access?.authority || user.accessLevel;
        const userProvince =
          user.access?.geographic?.homeProvince || user.homeProvince;

        // Can manage LEAD and STAFF in same province
        return (
          ['LEAD', 'STAFF'].includes(userAuthority) &&
          userProvince === currentUserProvince
        );
      });
    }

    // LEAD can manage STAFF in their branch
    if (currentAuthority === 'LEAD') {
      const currentUserBranch =
        currentUser?.access?.geographic?.homeBranch || currentUser?.homeBranch;

      return allUsers.filter((user) => {
        const userAuthority = user.access?.authority || user.accessLevel;
        const userBranch =
          user.access?.geographic?.homeBranch || user.homeBranch;

        // Can manage STAFF in same branch
        return userAuthority === 'STAFF' && userBranch === currentUserBranch;
      });
    }

    // STAFF cannot manage other users
    return [];
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use shared fetch function for 100% accuracy with CleanSlatePermissionsDemo
      const usersData = await fetchUsersWithCleanSlate({ includeDebug: true });

      // Add approval request data for each user
      const enrichedUsersData = await Promise.all(
        usersData.map(async (user) => {
          // Get approval requests for this user
          const approvalSnapshot = await app
            .firestore()
            .collection('approvalRequests')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          let latestApprovalRequest = null;
          if (!approvalSnapshot.empty) {
            latestApprovalRequest = approvalSnapshot.docs[0].data();
          }

          return {
            ...user,
            latestApprovalRequest,
            status:
              user.isActive && user.isApproved
                ? 'active'
                : user.approvalStatus === 'pending'
                  ? 'pending'
                  : user.approvalStatus === 'rejected'
                    ? 'rejected'
                    : 'inactive',
          };
        })
      );

      // Apply hierarchical filtering based on current user's authority
      const manageableUsers = getManageableUsers(enrichedUsersData);

      console.log('👥 User Management Access Control:', {
        currentUserAuthority:
          currentUser?.access?.authority || currentUser?.accessLevel,
        totalUsers: enrichedUsersData.length,
        manageableUsers: manageableUsers.length,
        currentUserScope: {
          province:
            currentUser?.access?.geographic?.homeProvince ||
            currentUser?.homeProvince,
          branch:
            currentUser?.access?.geographic?.homeBranch ||
            currentUser?.homeBranch,
        },
      });

      setUsers(manageableUsers);
    } catch (error) {
      handleUserManagementError(error, 'โหลดข้อมูลผู้ใช้');
    }
    setLoading(false);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      // Use shared toggle function for 100% accuracy with CleanSlatePermissionsDemo
      const result = await toggleUserStatusCleanSlate({
        userId,
        currentStatus,
        currentUser,
      });

      message.success(result.message);
      fetchUsers();
    } catch (error) {
      handleUserManagementError(error, 'อัปเดตสถานะผู้ใช้');
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
      const validation = validateRoleAssignment(
        newRole,
        currentUser?.access?.authority || currentUser?.accessLevel || 'UNKNOWN',
        currentUser
      );
      if (!validation.valid) {
        // Show detailed error message with proper styling
        message.error({
          content: validation.reason,
          duration: 6,
        });

        // Log detailed information for debugging
        if (validation.details) {
          console.warn('🚫 Role Assignment Validation Failed:', {
            targetRole: newRole,
            currentUserRole: currentUser?.accessLevel,
            currentUserAuthority: currentUser?.access?.authority,
            reason: validation.reason,
            details: validation.details,
            currentUser: currentUser,
          });
        }

        setActionLoading(false);
        return;
      }

      // Import Clean Slate helpers
      const { createUserAccess } = await import(
        '../../../utils/orthogonal-rbac'
      );
      const {
        mapDepartmentToAuthority,
        mapLocationToGeographic,
        mapDepartmentToDepartments,
      } = await import('../../../utils/clean-slate-helpers');

      // Map legacy values to Clean Slate structure
      const authority = mapDepartmentToAuthority(values.department, newRole);
      const geographic = mapLocationToGeographic(
        values.homeProvince,
        values.homeBranch
      );
      const departments = mapDepartmentToDepartments(values.department);

      // Create Clean Slate access structure
      const cleanSlateAccess = createUserAccess(
        authority,
        geographic,
        departments,
        {
          provinces: values.allowedProvinces || [values.homeProvince],
          branches: values.allowedBranches || [values.homeBranch],
          homeBranch: values.homeBranch,
        }
      );

      // Clean Slate updates (remove all legacy fields)
      const updates = {
        // Clean Slate structure ONLY
        access: cleanSlateAccess,

        // User metadata
        department: values.department,

        // Status tracking
        isActive: true,
        isApproved: true,
        approvalStatus: 'approved',

        // System metadata
        updatedAt: Date.now(),
        updatedBy: currentUser.uid,
        migrationType: 'admin_update',

        // REMOVE legacy fields (clean up existing users)
        'auth.accessLevel': null,
        'auth.department': null,
        'auth.homeProvince': null,
        'auth.homeBranch': null,
        'auth.allowedProvinces': null,
        'auth.allowedBranches': null,
        userRBAC: null,
        rbac: null,
        accessLevel: null,
        homeProvince: null,
        homeBranch: null,
        allowedProvinces: null,
        allowedBranches: null,
        role: null,
        permissions: null,
      };

      await app
        .firestore()
        .collection('users')
        .doc(selectedUser.uid)
        .update(updates);

      // Create audit log for role changes
      if (
        oldRole !== newRole ||
        JSON.stringify(oldAdditionalPerms) !==
          JSON.stringify(newAdditionalPerms)
      ) {
        const auditLog = createRoleChangeAuditLog(
          selectedUser.uid,
          oldRole,
          newRole,
          oldAdditionalPerms,
          newAdditionalPerms,
          currentUser.uid,
          `Updated via UserManagement to Clean Slate by ${currentUser.displayName}`
        );

        await app.firestore().collection('auditLogs').add(auditLog);
      }

      message.success('อัปเดตข้อมูลผู้ใช้ เรียบร้อยแล้ว');

      // Check if we updated the current user's role/permissions
      if (selectedUser.uid === currentUser.uid) {
        console.log(
          '🔄 Updated current user role - refreshing user context...'
        );
        try {
          await refreshCurrentUserData({ currentUser, dispatch });
          message.info('ข้อมูลและเมนูของคุณได้รับการอัปเดตแล้ว', 3);
        } catch (refreshError) {
          console.error('❌ Error refreshing current user data:', refreshError);
          message.warning('กรุณารีเฟรชหน้าเว็บเพื่อดูการเปลี่ยนแปลง', 5);
        }
      }

      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      handleUserManagementError(error, 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
    }
    setActionLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(true);
    try {
      // Use shared delete function for 100% accuracy with CleanSlatePermissionsDemo
      const result = await deleteUserCleanSlate({ userId, currentUser });

      message.success(result.message);
      fetchUsers();
    } catch (error) {
      handleUserManagementError(error, 'ลบผู้ใช้');
    }
    setActionLoading(false);
  };

  const getStatusTag = (status) => {
    const statusColors = {
      active: 'green',
      pending: 'orange',
      rejected: 'red',
      inactive: 'default',
    };
    const statusTexts = {
      active: 'ใช้งานได้',
      pending: 'รออนุมัติ',
      rejected: 'ถูกปฏิเสธ',
      inactive: 'ไม่ใช้งาน',
    };
    return (
      <Tag color={statusColors[status] || 'default'}>
        {statusTexts[status] || status}
      </Tag>
    );
  };

  const getRoleTag = (accessLevel) => {
    if (!accessLevel) return <Tag color='default'>ไม่ระบุ</Tag>;

    const roleInfo = getRoleDisplayInfo(accessLevel);
    const colors = {
      purple: '#722ed1', // Super Admin
      blue: '#1890ff', // Province
      green: '#52c41a', // Branch
      default: '#d9d9d9',
    };

    return (
      <Tag
        color={roleInfo.tag}
        style={{
          color: colors[roleInfo.tag] || colors.default,
          borderColor: colors[roleInfo.tag] || colors.default,
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
      accounting: 'orange',
      sales: 'blue',
      service: 'green',
      inventory: 'purple',
      hr: 'cyan',
      management: 'red',
      general: 'gray', // Add color for general department
    };
    return (
      <Tag color={departmentColors[department] || 'default'}>
        {departmentName}
      </Tag>
    );
  };

  const getRequestTypeTag = (requestType) => {
    if (!requestType) return '-';
    const requestTypeColors = {
      new_registration: 'blue',
      existing_employee_registration: 'green',
      access_request: 'purple',
      role_change_request: 'orange',
    };
    const requestTypeTexts = {
      new_registration: 'ลงทะเบียนพนักงานใหม่',
      existing_employee_registration: 'ลงทะเบียนพนักงานเดิม',
      access_request: 'ขอสิทธิ์เข้าใช้งาน',
      role_change_request: 'ขอเปลี่ยนบทบาท',
    };
    return (
      <Tag color={requestTypeColors[requestType] || 'default'}>
        {requestTypeTexts[requestType] || requestType}
      </Tag>
    );
  };

  // Helper functions for dropdowns
  const getAllRoles = () => {
    // Return Clean Slate RBAC authorities (not Enhanced RBAC roles)
    const cleanSlateRoles = [
      {
        value: 'ADMIN',
        label: 'ผู้ดูแลระบบ',
        description: 'เข้าถึงทุกฟังก์ชันในระบบ',
        accessLevel: 'ทุกพื้นที่',
        tag: 'red',
      },
      {
        value: 'MANAGER',
        label: 'ผู้จัดการ',
        description: 'จัดการในขอบเขตที่ได้รับมอบหมาย',
        accessLevel: 'ระดับจังหวัด',
        tag: 'blue',
      },
      {
        value: 'LEAD',
        label: 'หัวหน้าแผนก',
        description: 'หัวหน้าทีมในแผนก',
        accessLevel: 'ระดับสาขา',
        tag: 'green',
      },
      {
        value: 'STAFF',
        label: 'เจ้าหน้าที่',
        description: 'การเข้าถึงระดับปฏิบัติการ',
        accessLevel: 'ระดับสาขา',
        tag: 'orange',
      },
    ];

    return cleanSlateRoles;
  };

  const getAllDepartments = () => {
    // Use department mappings from mappings.js for consistent Thai names
    return Object.entries(DEPARTMENT_MAPPINGS).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  };

  const getAllProvinces = () => {
    // Only return actual province codes, not Thai names or abbreviations
    return [
      { value: 'nakhon-ratchasima', label: 'นครราชสีมา' },
      { value: 'nakhon-sawan', label: 'นครสวรรค์' },
    ];
  };

  const getAllBranches = () => {
    return Object.entries(BRANCH_MAPPINGS).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  };

  const filteredUsers = users.filter((user) => {
    // Apply role filter
    if (filterRole !== 'all' && user.accessLevel !== filterRole) return false;

    // Apply status filter
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;

    // Apply search filter
    if (
      searchText &&
      !user.displayName?.toLowerCase().includes(searchText.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;

    return true;
  });

  const columns = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'displayName',
      key: 'displayName',
      width: isMobile ? 120 : isTablet ? 140 : 150,
      ellipsis: isMobile,
      render: (text, record) => {
        const displayName = getUserDisplayName(record);
        return (
          <Space direction={isMobile ? 'vertical' : 'horizontal'} size='small'>
            <UserOutlined />
            <div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? '13px' : '14px',
                }}
              >
                {isMobile && displayName.length > 15
                  ? `${displayName.substring(0, 15)}...`
                  : displayName}
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
      width: isMobile ? 60 : isTablet ? 70 : 80,
      responsive: ['sm'],
      render: (accessLevel, record) => {
        // Get Thai name for accessLevel/authority using mapping utility
        const authorityName = getAccessLevelName(accessLevel);

        // Get scope from Clean Slate structure if available
        const scope = record.access?.geographic?.scope;
        const scopeName = scope ? getScopeName(scope) : null;

        return (
          <div>
            <Tag color='blue' style={{ fontSize: isMobile ? '10px' : '12px' }}>
              {isMobile
                ? authorityName.substring(0, 4) +
                  (authorityName.length > 4 ? '...' : '')
                : authorityName}
            </Tag>
            {!isMobile && scopeName && (
              <div
                style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}
              >
                {scopeName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      width: isMobile ? 60 : isTablet ? 70 : 80,
      responsive: ['md'],
      render: (department) => {
        const tag = getDepartmentTag(department);
        if (isMobile && React.isValidElement(tag)) {
          return React.cloneElement(tag, {
            style: { fontSize: '10px' },
            children:
              tag.props.children.length > 4
                ? tag.props.children.substring(0, 4) + '...'
                : tag.props.children,
          });
        }
        return tag;
      },
    },
    {
      title: isMobile ? 'ที่ตั้ง' : 'จังหวัด/สาขา',
      key: 'location',
      width: isMobile ? 80 : isTablet ? 90 : 100,
      responsive: ['lg'],
      render: (_, record) => {
        const provinceName = getProvinceName(record.homeProvince);
        const branchName = getBranchName(record.homeBranch);

        if (isMobile) {
          return (
            <div style={{ fontSize: '11px' }}>
              <div title={provinceName}>
                <EnvironmentOutlined style={{ marginRight: '2px' }} />
                {provinceName ? provinceName.substring(0, 6) + '...' : '-'}
              </div>
            </div>
          );
        }

        return (
          <div style={{ minWidth: isTablet ? '160px' : '180px' }}>
            <div style={{ marginBottom: '2px' }}>
              <EnvironmentOutlined style={{ marginRight: '4px' }} />
              <span style={{ fontSize: '13px' }}>{provinceName || '-'}</span>
            </div>
            <div>
              <BankOutlined style={{ marginRight: '4px' }} />
              <span style={{ fontSize: '13px' }}>{branchName || '-'}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      render: (status, record) => (
        <Space direction='vertical' size='small'>
          {getStatusTag(status)}
          {record.latestApprovalRequest && (
            <Badge
              status={
                record.latestApprovalRequest.status === 'pending'
                  ? 'processing'
                  : 'success'
              }
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
      align: 'center',
      width: 60,
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
      ...(!isMobile && { fixed: 'right' }),
      width: isMobile ? 80 : isTablet ? 120 : 160,
      render: (_, record) => (
        <Space direction={isMobile ? 'vertical' : 'horizontal'} size='small'>
          <Button
            icon={<EyeOutlined />}
            size='small'
            onClick={() => {
              setSelectedUser(record);
              setModalVisible(true);
            }}
          >
            {!isMobile && 'ดู'}
          </Button>
          <Button
            icon={<EditOutlined />}
            size='small'
            type='primary'
            onClick={() => {
              setSelectedUser(record);
              setEditModalVisible(true);
            }}
            disabled={!hasPermission('users.manage')}
          >
            {!isMobile && 'แก้ไข'}
          </Button>
          {!isMobile && (
            <Popconfirm
              title='คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?'
              onConfirm={() => handleDeleteUser(record.uid)}
              disabled={!hasPermission('users.manage')}
            >
              <Button
                icon={<DeleteOutlined />}
                size='small'
                danger
                disabled={!hasPermission('users.manage')}
              >
                ลบ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ScreenWithManual
      screenType='user-management'
      showManualOnFirstVisit={false}
    >
      <LayoutWithRBAC
        customCheck={({ userRBAC }) => {
          // Allow Level 2 (LEAD), Level 3 (MANAGER), Level 4 (ADMIN) to access user management
          const authority =
            userRBAC?.authority || // Clean Slate authority
            userRBAC?.access?.authority || // Nested authority
            userRBAC?.accessLevel; // Legacy fallback
          const allowedAuthorities = ['ADMIN', 'MANAGER', 'LEAD']; // Level 4, 3, 2

          const hasAccess = allowedAuthorities.includes(authority);

          console.log('🔐 UserManagement Access Check:', {
            authority,
            allowedAuthorities,
            hasAccess,
            userRBAC: userRBAC,
            accessStructure: {
              cleanSlate: userRBAC?.access,
              directAuthority: userRBAC?.authority,
              nestedAuthority: userRBAC?.access?.authority,
              legacy: {
                accessLevel: userRBAC?.accessLevel,
                authAccessLevel: userRBAC?.auth?.accessLevel,
              },
            },
          });

          return hasAccess;
        }}
        debug={true}
        permission='users.manage'
        fallbackPermission='team.manage'
        title='จัดการผู้ใช้งาน'
        requireBranchSelection={false}
        showAuditTrail={false}
        showStepper={false}
      >
        <Card
          title={
            <Row align='middle' justify='space-between'>
              <Col>
                <Space>
                  <TeamOutlined />
                  <span>จัดการผู้ใช้งาน</span>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<InfoCircleOutlined />}
                    onClick={() => setRoleHelpModalVisible(true)}
                    size={isMobile ? 'small' : 'default'}
                    type='dashed'
                  >
                    {!isMobile && 'คู่มือบทบาท'}
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => {
                      console.log('🔍 Current User Debug Info:', {
                        uid: currentUser?.uid,
                        email: currentUser?.email,
                        displayName: currentUser?.displayName,
                        accessLevel: currentUser?.accessLevel,
                        authority: currentUser?.access?.authority,
                        geographic: currentUser?.access?.geographic,
                        departments: currentUser?.access?.departments,
                        hasCleanSlate: !!currentUser?.access?.authority,
                        fullData: currentUser,
                      });
                      message.info(
                        'ข้อมูลการดีบักถูกแสดงใน Console (กด F12)',
                        3
                      );
                    }}
                    size={isMobile ? 'small' : 'default'}
                    type='dashed'
                  >
                    {!isMobile && 'ดีบัก'}
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchUsers}
                    loading={loading}
                    size={isMobile ? 'small' : 'default'}
                  >
                    {!isMobile && 'รีเฟรช'}
                  </Button>
                </Space>
              </Col>
            </Row>
          }
          bodyStyle={{
            padding: isMobile ? '12px' : '16px',
            overflowX: 'hidden',
          }}
        >
          {/* Filters Section with Responsive Grid */}
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: '100%' }}
                placeholder='กรองตามบทบาท'
                size={isMobile ? 'small' : 'default'}
              >
                <Option value='all'>ทุกบทบาท</Option>
                {getAllRoles().map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                placeholder='กรองตามสถานะ'
                size={isMobile ? 'small' : 'default'}
              >
                <Option value='all'>ทุกสถานะ</Option>
                <Option value='active'>ใช้งานได้</Option>
                <Option value='pending'>รออนุมัติ</Option>
                <Option value='rejected'>ถูกปฏิเสธ</Option>
                <Option value='inactive'>ไม่ใช้งาน</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={12}>
              <SearchInput
                placeholder='ค้นหาชื่อหรืออีเมล'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size={isMobile ? 'small' : 'default'}
                allowClear
                variant='outlined'
              />
            </Col>
          </Row>

          {/* Table Section - Remove extra wrapper and fixed height */}
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey='uid'
            loading={loading}
            scroll={{
              x: isMobile ? 'max-content' : isTablet ? 1000 : 1200,
              // Remove y scroll to prevent double scrollbar
            }}
            size={isMobile ? 'small' : 'middle'}
            pagination={{
              total: filteredUsers.length,
              pageSize: isMobile ? 5 : isTablet ? 8 : 10,
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              showTotal: !isMobile
                ? (total, range) =>
                    `${range[0]}-${range[1]} จาก ${total} ผู้ใช้`
                : undefined,
              simple: isMobile,
              position: isMobile ? ['bottomCenter'] : ['bottomRight'],
              size: isMobile ? 'small' : 'default',
            }}
          />
        </Card>

        {/* User Details Modal */}
        <Modal
          title={
            <>
              <UserOutlined /> รายละเอียดผู้ใช้
            </>
          }
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
          okText='ตกลง'
          cancelText='ยกเลิก'
        >
          {selectedUser && (
            <Tabs defaultActiveKey='basic'>
              <TabPane tab='ข้อมูลพื้นฐาน' key='basic'>
                <Descriptions bordered size='small'>
                  <Descriptions.Item label='ชื่อ-สกุล' span={2}>
                    {getUserDisplayName(selectedUser)}
                  </Descriptions.Item>
                  <Descriptions.Item label='อีเมล' span={1}>
                    {selectedUser.email}
                  </Descriptions.Item>
                  <Descriptions.Item label='บทบาท'>
                    {getRoleTag(selectedUser.accessLevel)}
                  </Descriptions.Item>
                  <Descriptions.Item label='แผนก'>
                    {getDepartmentTag(selectedUser.department)}
                  </Descriptions.Item>
                  <Descriptions.Item label='สถานะ'>
                    {getStatusTag(selectedUser.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label='จังหวัดหลัก'>
                    {getProvinceName(selectedUser.homeProvince) || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label='สาขาหลัก'>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {getBranchName(selectedUser.homeBranch) || '-'}
                      {selectedUser.homeBranch && (
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                          ({selectedUser.homeBranch})
                        </Text>
                      )}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label='การใช้งาน'>
                    <Switch checked={selectedUser.isActive} disabled />
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab='ข้อมูลการอนุมัติ' key='approval'>
                {selectedUser.latestApprovalRequest ? (
                  <Descriptions bordered size='small'>
                    <Descriptions.Item label='สถานะคำขอ' span={2}>
                      <Tag
                        color={
                          selectedUser.latestApprovalRequest.status ===
                          'approved'
                            ? 'green'
                            : selectedUser.latestApprovalRequest.status ===
                                'pending'
                              ? 'orange'
                              : 'red'
                        }
                      >
                        {selectedUser.latestApprovalRequest.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='ประเภทคำขอ' span={1}>
                      {getRequestTypeTag(
                        selectedUser.latestApprovalRequest.requestType
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label='ผู้อนุมัติ' span={2}>
                      {selectedUser.latestApprovalRequest.approvedBy ||
                        'รอการอนุมัติ'}
                    </Descriptions.Item>
                    <Descriptions.Item label='วันที่สร้างคำขอ' span={1}>
                      {new Date(
                        selectedUser.latestApprovalRequest.createdAt
                      ).toLocaleString('th-TH')}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Alert message='ไม่มีข้อมูลการอนุมัติ' type='info' />
                )}
              </TabPane>
            </Tabs>
          )}
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title={
            <>
              <EditOutlined /> แก้ไขข้อมูลผู้ใช้:{' '}
              {selectedUser ? getUserDisplayName(selectedUser) : ''}
            </>
          }
          visible={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedUser(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          confirmLoading={actionLoading}
          width={isMobile ? '95%' : isTablet ? 600 : 800}
          destroyOnClose={true}
          okText='บันทึก'
          cancelText='ยกเลิก'
          style={isMobile ? { top: 20 } : {}}
        >
          {editModalVisible && selectedUser && (
            <Form
              key={selectedUser.uid}
              form={form}
              layout='vertical'
              onFinish={handleUpdateUserRole}
              preserve={false}
            >
              <Tabs defaultActiveKey='role'>
                {/* Role & Permissions Tab */}
                <TabPane
                  tab={
                    <>
                      <UserOutlined /> บทบาทและสิทธิ์
                    </>
                  }
                  key='role'
                >
                  <Row gutter={isMobile ? 8 : 16}>
                    <Col span={isMobile ? 24 : 12}>
                      <Form.Item
                        name='accessLevel'
                        label='บทบาท'
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder='เลือกบทบาท'
                          optionLabelProp='label'
                        >
                          {getAllRoles().map((role) => (
                            <Option
                              key={role.value}
                              value={role.value}
                              label={role.label}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: isMobile ? '13px' : '14px',
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 500 }}>
                                    {role.label}
                                  </div>
                                  {!isMobile && (
                                    <div
                                      style={{
                                        fontSize: '12px',
                                        color: '#888',
                                      }}
                                    >
                                      {role.description}
                                    </div>
                                  )}
                                </div>
                                <Tag
                                  color={role.tag}
                                  size='small'
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
                    <Col span={isMobile ? 24 : 12}>
                      <Form.Item
                        name='department'
                        label='แผนก'
                        rules={[{ required: true }]}
                      >
                        <Select placeholder='เลือกแผนก'>
                          {getAllDepartments().map((dept) => (
                            <Option key={dept.value} value={dept.value}>
                              {dept.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Alert
                        message='ข้อมูลบทบาทและแผนก'
                        description='การเปลี่ยนแปลงบทบาทจะส่งผลต่อสิทธิ์การเข้าถึงระบบของผู้ใช้'
                        type='info'
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    </Col>
                  </Row>
                </TabPane>

                {/* Granular Roles Editor Tab */}
                <TabPane
                  tab={
                    <>
                      <SettingOutlined /> สิทธิ์เพิ่มเติม
                    </>
                  }
                  key='granular'
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item shouldUpdate>
                        {({ getFieldValue }) => {
                          const selectedRole = getFieldValue('accessLevel');
                          const selectedAdditionalPerms =
                            getFieldValue('additionalPermissions') || [];
                          const roleInfo = selectedRole
                            ? getRoleDisplayInfo(selectedRole)
                            : null;
                          const basePermissions = selectedRole
                            ? BASE_ROLES[selectedRole]?.permissions || []
                            : [];
                          const effectivePermissions = selectedRole
                            ? getEffectivePermissions(
                                selectedRole,
                                selectedAdditionalPerms
                              )
                            : [];

                          return (
                            <div>
                              {/* Current Role Analysis */}
                              {roleInfo && (
                                <Card
                                  title='บทบาทหลักปัจจุบัน'
                                  size='small'
                                  style={{ marginBottom: 16 }}
                                  extra={
                                    <Tag color={roleInfo.tag}>
                                      {roleInfo.accessLevel}
                                    </Tag>
                                  }
                                >
                                  <Row gutter={16}>
                                    <Col span={12}>
                                      <Descriptions size='small' column={1}>
                                        <Descriptions.Item label='ชื่อบทบาท'>
                                          {roleInfo.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label='คำอธิบาย'>
                                          {roleInfo.description}
                                        </Descriptions.Item>
                                        <Descriptions.Item label='ระดับการเข้าถึง'>
                                          {roleInfo.accessLevel}
                                        </Descriptions.Item>
                                        <Descriptions.Item label='สิทธิ์พื้นฐาน'>
                                          {basePermissions.length} รายการ
                                        </Descriptions.Item>
                                        <Descriptions.Item label='สิทธิ์รวม'>
                                          {effectivePermissions.length} รายการ
                                        </Descriptions.Item>
                                      </Descriptions>
                                    </Col>
                                    <Col span={12}>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text strong>สิทธิ์ที่มีทั้งหมด:</Text>
                                      </div>
                                      <div
                                        style={{
                                          maxHeight: 120,
                                          overflowY: 'auto',
                                        }}
                                      >
                                        {effectivePermissions.includes('*') ? (
                                          <Tag color='red'>
                                            ทุกสิทธิ์ (Super Admin)
                                          </Tag>
                                        ) : (
                                          effectivePermissions.map(
                                            (permission) => (
                                              <Tag
                                                key={permission}
                                                color={
                                                  basePermissions.includes(
                                                    permission
                                                  )
                                                    ? 'blue'
                                                    : 'green'
                                                }
                                                style={{ marginBottom: 4 }}
                                              >
                                                {permission}
                                                {!basePermissions.includes(
                                                  permission
                                                ) && ' (+)'}
                                              </Tag>
                                            )
                                          )
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          marginTop: 8,
                                          fontSize: '12px',
                                          color: '#666',
                                        }}
                                      >
                                        <Text>
                                          🔵 สิทธิ์พื้นฐาน | 🟢 สิทธิ์เพิ่มเติม
                                          (+)
                                        </Text>
                                      </div>
                                    </Col>
                                  </Row>
                                </Card>
                              )}

                              {/* Live Permission Preview */}
                              {selectedRole &&
                                selectedAdditionalPerms.length > 0 && (
                                  <Card
                                    title='🔍 ดูตัวอย่างผลลัพธ์'
                                    size='small'
                                    style={{ marginBottom: 16 }}
                                    extra={
                                      <Tag color='processing'>
                                        อัปเดตแบบ Real-time
                                      </Tag>
                                    }
                                  >
                                    <Alert
                                      message='การเปลี่ยนแปลงที่จะเกิดขึ้น'
                                      description={
                                        <div>
                                          <div style={{ marginBottom: 8 }}>
                                            <Text strong>จาก:</Text>{' '}
                                            {roleInfo?.name} (
                                            {basePermissions.length} สิทธิ์)
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <Text strong>เป็น:</Text>{' '}
                                            {roleInfo?.name} + สิทธิ์เพิ่มเติม (
                                            {effectivePermissions.length}{' '}
                                            สิทธิ์รวม)
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <Text strong>สิทธิ์ที่เพิ่ม:</Text>
                                            {selectedAdditionalPerms.map(
                                              (permKey) => {
                                                const perm =
                                                  GRANULAR_PERMISSIONS[permKey];
                                                return perm ? (
                                                  <Tag
                                                    key={permKey}
                                                    color='green'
                                                    size='small'
                                                    style={{ marginLeft: 4 }}
                                                  >
                                                    {perm.name}
                                                  </Tag>
                                                ) : null;
                                              }
                                            )}
                                          </div>
                                        </div>
                                      }
                                      type='success'
                                      showIcon
                                    />
                                  </Card>
                                )}

                              {/* Additional Permissions Selection */}
                              {selectedRole && (
                                <Card
                                  title={
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <span>⚙️ เลือกสิทธิ์เพิ่มเติม</span>
                                      <Button
                                        size='small'
                                        onClick={() =>
                                          form.setFieldsValue({
                                            additionalPermissions: [],
                                          })
                                        }
                                        icon={<DeleteOutlined />}
                                      >
                                        ล้างทั้งหมด
                                      </Button>
                                    </div>
                                  }
                                  size='small'
                                >
                                  <Alert
                                    message='💡 วิธีการใช้งาน'
                                    description={
                                      <div>
                                        <p>
                                          <strong>คลิกที่การ์ด</strong>{' '}
                                          เพื่อเพิ่ม/ลบสิทธิ์เพิ่มเติม
                                        </p>
                                        <p>
                                          สิทธิ์เหล่านี้จะ
                                          <strong>เพิ่มเติม</strong>บนบทบาทหลัก
                                          &ldquo;{roleInfo?.name}&rdquo;{' '}
                                          <strong>ไม่ได้แทนที่</strong>บทบาทเดิม
                                        </p>
                                      </div>
                                    }
                                    type='info'
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                  />

                                  <Form.Item
                                    name='additionalPermissions'
                                    label={
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8,
                                        }}
                                      >
                                        <span>🎯 สิทธิ์เพิ่มเติม</span>
                                        <Text
                                          type='secondary'
                                          style={{ fontSize: '12px' }}
                                        >
                                          ({selectedAdditionalPerms.length}{' '}
                                          รายการ)
                                        </Text>
                                      </div>
                                    }
                                  >
                                    <div>
                                      {Object.entries(
                                        getPermissionsByCategory(selectedRole)
                                      ).map(([categoryKey, permissions]) => {
                                        const categoryInfo =
                                          PERMISSION_CATEGORIES[categoryKey];
                                        return (
                                          <Card
                                            key={categoryKey}
                                            title={
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 8,
                                                }}
                                              >
                                                <span>{categoryInfo.icon}</span>
                                                <span>{categoryInfo.name}</span>
                                              </div>
                                            }
                                            size='small'
                                            style={{ marginBottom: 12 }}
                                            type='inner'
                                          >
                                            <div
                                              style={{
                                                marginBottom: 8,
                                                fontSize: '12px',
                                                color: '#666',
                                              }}
                                            >
                                              {categoryInfo.description}
                                            </div>
                                            <Row gutter={[8, 8]}>
                                              {permissions.map((permission) => (
                                                <Col
                                                  key={permission.key}
                                                  span={12}
                                                >
                                                  <Card
                                                    size='small'
                                                    hoverable
                                                    style={{
                                                      cursor: 'pointer',
                                                      border:
                                                        selectedAdditionalPerms.includes(
                                                          permission.key
                                                        )
                                                          ? `3px solid #52c41a`
                                                          : '2px dashed #d9d9d9',
                                                      backgroundColor:
                                                        selectedAdditionalPerms.includes(
                                                          permission.key
                                                        )
                                                          ? '#f6ffed'
                                                          : '#fafafa',
                                                      transition:
                                                        'all 0.3s ease',
                                                    }}
                                                    onClick={() => {
                                                      const currentPerms =
                                                        getFieldValue(
                                                          'additionalPermissions'
                                                        ) || [];
                                                      let newPerms;
                                                      if (
                                                        currentPerms.includes(
                                                          permission.key
                                                        )
                                                      ) {
                                                        newPerms =
                                                          currentPerms.filter(
                                                            (p) =>
                                                              p !==
                                                              permission.key
                                                          );
                                                      } else {
                                                        newPerms = [
                                                          ...currentPerms,
                                                          permission.key,
                                                        ];
                                                      }
                                                      form.setFieldsValue({
                                                        additionalPermissions:
                                                          newPerms,
                                                      });
                                                    }}
                                                    actions={[
                                                      selectedAdditionalPerms.includes(
                                                        permission.key
                                                      ) ? (
                                                        <Button
                                                          key='remove'
                                                          type='text'
                                                          size='small'
                                                          danger
                                                          icon={
                                                            <DeleteOutlined />
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentPerms =
                                                              getFieldValue(
                                                                'additionalPermissions'
                                                              ) || [];
                                                            const newPerms =
                                                              currentPerms.filter(
                                                                (p) =>
                                                                  p !==
                                                                  permission.key
                                                              );
                                                            form.setFieldsValue(
                                                              {
                                                                additionalPermissions:
                                                                  newPerms,
                                                              }
                                                            );
                                                          }}
                                                        >
                                                          ลบ
                                                        </Button>
                                                      ) : (
                                                        <Button
                                                          key='add'
                                                          type='text'
                                                          size='small'
                                                          icon={
                                                            <PlusOutlined />
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentPerms =
                                                              getFieldValue(
                                                                'additionalPermissions'
                                                              ) || [];
                                                            const newPerms = [
                                                              ...currentPerms,
                                                              permission.key,
                                                            ];
                                                            form.setFieldsValue(
                                                              {
                                                                additionalPermissions:
                                                                  newPerms,
                                                              }
                                                            );
                                                          }}
                                                        >
                                                          เพิ่ม
                                                        </Button>
                                                      ),
                                                    ]}
                                                  >
                                                    <div>
                                                      <div
                                                        style={{
                                                          display: 'flex',
                                                          justifyContent:
                                                            'space-between',
                                                          alignItems: 'center',
                                                          marginBottom: 4,
                                                        }}
                                                      >
                                                        <Text
                                                          strong
                                                          style={{
                                                            fontSize: '13px',
                                                          }}
                                                        >
                                                          {permission.name}
                                                        </Text>
                                                        {selectedAdditionalPerms.includes(
                                                          permission.key
                                                        ) ? (
                                                          <Tag
                                                            color='green'
                                                            size='small'
                                                            icon={
                                                              <CheckOutlined />
                                                            }
                                                          >
                                                            เลือกแล้ว
                                                          </Tag>
                                                        ) : (
                                                          <Tag
                                                            color='default'
                                                            size='small'
                                                          >
                                                            ยังไม่เลือก
                                                          </Tag>
                                                        )}
                                                      </div>
                                                      <div
                                                        style={{
                                                          fontSize: '12px',
                                                          color: '#666',
                                                          marginBottom: 8,
                                                        }}
                                                      >
                                                        {permission.description}
                                                      </div>
                                                      <div>
                                                        {permission.permissions.map(
                                                          (perm) => (
                                                            <Tag
                                                              key={perm}
                                                              color={
                                                                categoryInfo.color
                                                              }
                                                              size='small'
                                                              style={{
                                                                fontSize:
                                                                  '10px',
                                                              }}
                                                            >
                                                              {perm}
                                                            </Tag>
                                                          )
                                                        )}
                                                        {permission.accessLevelUpgrade && (
                                                          <Tag
                                                            color='purple'
                                                            size='small'
                                                            style={{
                                                              fontSize: '10px',
                                                            }}
                                                          >
                                                            ↗️{' '}
                                                            {
                                                              permission.accessLevelUpgrade
                                                            }
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

                                      {Object.keys(
                                        getPermissionsByCategory(selectedRole)
                                      ).length === 0 && (
                                        <Alert
                                          message='ไม่มีสิทธิ์เพิ่มเติม'
                                          description={`บทบาท &ldquo;${roleInfo?.name}&rdquo; ไม่มีสิทธิ์เพิ่มเติมที่สามารถเลือกได้`}
                                          type='warning'
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
                <TabPane
                  tab={
                    <>
                      <EnvironmentOutlined /> พื้นที่การเข้าถึง
                    </>
                  }
                  key='geographic'
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name='homeProvince'
                        label='จังหวัดหลัก'
                        rules={[
                          { required: true, message: 'กรุณาเลือกจังหวัดหลัก' },
                        ]}
                      >
                        <ProvinceSelector
                          placeholder='เลือกจังหวัด'
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
                        name='homeBranch'
                        label='สาขาหลัก'
                        dependencies={['homeProvince']}
                        rules={[
                          {
                            validator: (_, value) => {
                              const selectedProvince =
                                form.getFieldValue('homeProvince');

                              // Only require branch if province is selected
                              if (selectedProvince && !value) {
                                return Promise.reject(
                                  new Error('กรุณาเลือกสาขาหลัก')
                                );
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) =>
                            prev.homeProvince !== curr.homeProvince
                          }
                        >
                          {({ getFieldValue }) => (
                            <GeographicBranchSelector
                              placeholder={
                                getFieldValue('homeProvince')
                                  ? 'เลือกสาขา'
                                  : 'กรุณาเลือกจังหวัดก่อน'
                              }
                              province={getFieldValue('homeProvince')}
                              respectRBAC={false}
                              showBranchCode={true}
                              disabled={!getFieldValue('homeProvince')}
                              onChange={(branchValue) => {
                                console.log('🏢 Branch onChange triggered:', {
                                  branchValue,
                                  selectedProvince:
                                    getFieldValue('homeProvince'),
                                  formValues: form.getFieldsValue(),
                                });

                                // Explicitly set the form field value
                                form.setFieldsValue({
                                  homeBranch: branchValue,
                                });
                              }}
                            />
                          )}
                        </Form.Item>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Alert
                        message='พื้นที่การเข้าถึง'
                        description='จังหวัดและสาขาหลักกำหนดขอบเขตการเข้าถึงข้อมูล'
                        type='warning'
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    </Col>
                  </Row>
                </TabPane>

                {/* Summary Tab - Update to include additional permissions */}
                <TabPane
                  tab={
                    <>
                      <FileTextOutlined /> สรุปข้อมูล
                    </>
                  }
                  key='summary'
                >
                  <Form.Item shouldUpdate>
                    {({ getFieldValue }) => {
                      const currentRole =
                        getFieldValue('accessLevel') ||
                        selectedUser.accessLevel;
                      const currentAdditionalPerms =
                        getFieldValue('additionalPermissions') ||
                        selectedUser.additionalPermissions ||
                        [];
                      const currentDepartment =
                        getFieldValue('department') || selectedUser.department;
                      const currentProvince =
                        getFieldValue('homeProvince') ||
                        selectedUser.homeProvince;
                      const currentBranch =
                        getFieldValue('homeBranch') || selectedUser.homeBranch;

                      const roleInfo = currentRole
                        ? getRoleDisplayInfo(currentRole)
                        : null;
                      const effectivePermissions = currentRole
                        ? getEffectivePermissions(
                            currentRole,
                            currentAdditionalPerms
                          )
                        : [];

                      return (
                        <div>
                          {/* User Overview */}
                          <Card
                            title='ภาพรวมผู้ใช้'
                            style={{ marginBottom: 16 }}
                          >
                            <Row gutter={16}>
                              <Col span={8}>
                                <div
                                  style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '48px',
                                      color: '#1890ff',
                                      marginBottom: '8px',
                                    }}
                                  >
                                    <UserOutlined />
                                  </div>
                                  <Title level={4} style={{ margin: 0 }}>
                                    {getUserDisplayName(selectedUser)}
                                  </Title>
                                  <Text type='secondary'>
                                    {selectedUser.email}
                                  </Text>
                                </div>
                              </Col>
                              <Col span={16}>
                                <Descriptions column={2} size='small'>
                                  <Descriptions.Item label='สถานะ'>
                                    {getStatusTag(selectedUser.status)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='การใช้งาน'>
                                    <Tag
                                      color={
                                        selectedUser.isActive ? 'green' : 'red'
                                      }
                                    >
                                      {selectedUser.isActive
                                        ? 'เปิดใช้งาน'
                                        : 'ปิดใช้งาน'}
                                    </Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label='เข้าสู่ระบบล่าสุด'>
                                    {selectedUser.lastLogin
                                      ? new Date(
                                          selectedUser.lastLogin
                                        ).toLocaleDateString('th-TH')
                                      : 'ไม่เคย'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='ยืนยันอีเมล'>
                                    <Tag
                                      color={
                                        selectedUser.emailVerified
                                          ? 'green'
                                          : 'orange'
                                      }
                                    >
                                      {selectedUser.emailVerified
                                        ? 'ยืนยันแล้ว'
                                        : 'ยังไม่ยืนยัน'}
                                    </Tag>
                                  </Descriptions.Item>
                                </Descriptions>
                              </Col>
                            </Row>
                          </Card>

                          <Row gutter={16}>
                            {/* Role & Permissions Summary */}
                            <Col span={12}>
                              <Card
                                title='บทบาทและสิทธิ์'
                                size='small'
                                style={{ marginBottom: 16 }}
                              >
                                {roleInfo && (
                                  <div>
                                    <div style={{ marginBottom: 12 }}>
                                      <Text strong>บทบาทหลัก: </Text>
                                      <Tag color={roleInfo.tag}>
                                        {roleInfo.name}
                                      </Tag>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                      <Text strong>แผนก: </Text>
                                      {getDepartmentTag(currentDepartment)}
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                      <Text strong>ระดับการเข้าถึง: </Text>
                                      <Tag color={roleInfo.tag}>
                                        {roleInfo.accessLevel}
                                      </Tag>
                                    </div>
                                    {currentAdditionalPerms.length > 0 && (
                                      <div style={{ marginBottom: 12 }}>
                                        <Text strong>สิทธิ์เพิ่มเติม: </Text>
                                        <div style={{ marginTop: 4 }}>
                                          {currentAdditionalPerms.map(
                                            (permKey) => {
                                              const perm =
                                                GRANULAR_PERMISSIONS[permKey];
                                              return perm ? (
                                                <Tag
                                                  key={permKey}
                                                  color='green'
                                                  size='small'
                                                >
                                                  {perm.name}
                                                </Tag>
                                              ) : null;
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div style={{ marginBottom: 12 }}>
                                      <Text strong>คำอธิบาย: </Text>
                                      <Text type='secondary'>
                                        {roleInfo.description}
                                      </Text>
                                    </div>
                                    <div>
                                      <Text strong>
                                        สิทธิ์การเข้าถึงทั้งหมด (
                                        {effectivePermissions.length}):{' '}
                                      </Text>
                                      <div
                                        style={{
                                          marginTop: 8,
                                          maxHeight: 100,
                                          overflowY: 'auto',
                                        }}
                                      >
                                        {effectivePermissions.includes('*') ? (
                                          <Tag color='red'>
                                            ทุกสิทธิ์ (Super Admin)
                                          </Tag>
                                        ) : (
                                          effectivePermissions.map(
                                            (permission) => (
                                              <Tag
                                                key={permission}
                                                color='blue'
                                                size='small'
                                                style={{ marginBottom: 4 }}
                                              >
                                                {permission}
                                              </Tag>
                                            )
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            </Col>

                            {/* Geographic Summary */}
                            <Col span={12}>
                              <Card
                                title='พื้นที่การเข้าถึง'
                                size='small'
                                style={{ marginBottom: 16 }}
                              >
                                <Descriptions size='small' column={1}>
                                  <Descriptions.Item label='จังหวัดหลัก'>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                      }}
                                    >
                                      <EnvironmentOutlined />
                                      <Text>
                                        {getProvinceName(currentProvince) ||
                                          'ไม่ระบุ'}
                                      </Text>
                                    </div>
                                  </Descriptions.Item>
                                  <Descriptions.Item label='สาขาหลัก'>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                      }}
                                    >
                                      <BankOutlined />
                                      <Text>
                                        {getBranchName(currentBranch) ||
                                          'ไม่ระบุ'}
                                      </Text>
                                      {currentBranch && (
                                        <Text
                                          type='secondary'
                                          style={{ fontSize: '12px' }}
                                        >
                                          ({currentBranch})
                                        </Text>
                                      )}
                                    </div>
                                  </Descriptions.Item>
                                  <Descriptions.Item label='ขอบเขตการเข้าถึง'>
                                    {roleInfo && (
                                      <div>
                                        {roleInfo.accessLevel === 'all' && (
                                          <Tag color='purple'>
                                            เข้าถึงทุกพื้นที่
                                          </Tag>
                                        )}
                                        {roleInfo.accessLevel ===
                                          'province' && (
                                          <Tag color='blue'>ระดับจังหวัด</Tag>
                                        )}
                                        {roleInfo.accessLevel === 'branch' && (
                                          <Tag color='green'>ระดับสาขา</Tag>
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
                              <Card title='ข้อมูลติดต่อ' size='small'>
                                <Descriptions size='small' column={1}>
                                  <Descriptions.Item label='ชื่อ-สกุล'>
                                    {getUserDisplayName(selectedUser)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='อีเมล'>
                                    {selectedUser.email || '-'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='เบอร์โทรศัพท์'>
                                    {selectedUser.phoneNumber || 'ไม่ระบุ'}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card title='กิจกรรมล่าสุด' size='small'>
                                <Descriptions size='small' column={1}>
                                  <Descriptions.Item label='วันที่สร้างบัญชี'>
                                    {selectedUser.created
                                      ? new Date(
                                          selectedUser.created
                                        ).toLocaleDateString('th-TH')
                                      : '-'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='เข้าสู่ระบบล่าสุด'>
                                    {selectedUser.lastLogin
                                      ? new Date(
                                          selectedUser.lastLogin
                                        ).toLocaleDateString('th-TH')
                                      : 'ไม่เคย'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label='อัปเดตล่าสุด'>
                                    {selectedUser.lastUpdated
                                      ? new Date(
                                          selectedUser.lastUpdated
                                        ).toLocaleDateString('th-TH')
                                      : '-'}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>
                            </Col>
                          </Row>

                          {/* Approval Information */}
                          {selectedUser.latestApprovalRequest && (
                            <Card
                              title='ข้อมูลการอนุมัติ'
                              size='small'
                              style={{ marginTop: 16 }}
                            >
                              <Descriptions size='small' column={3}>
                                <Descriptions.Item label='สถานะคำขอ'>
                                  <Tag
                                    color={
                                      selectedUser.latestApprovalRequest
                                        .status === 'approved'
                                        ? 'green'
                                        : selectedUser.latestApprovalRequest
                                              .status === 'pending'
                                          ? 'orange'
                                          : 'red'
                                    }
                                  >
                                    {selectedUser.latestApprovalRequest.status}
                                  </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label='ประเภทคำขอ'>
                                  {getRequestTypeTag(
                                    selectedUser.latestApprovalRequest
                                      .requestType
                                  )}
                                </Descriptions.Item>
                                <Descriptions.Item label='วันที่สร้างคำขอ'>
                                  {new Date(
                                    selectedUser.latestApprovalRequest.createdAt
                                  ).toLocaleDateString('th-TH')}
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

        {/* Role Hierarchy Help Modal */}
        <Modal
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              คู่มือบทบาทและสิทธิ์ในระบบ
            </Space>
          }
          open={roleHelpModalVisible}
          onCancel={() => setRoleHelpModalVisible(false)}
          footer={[
            <Button
              key='close'
              type='primary'
              onClick={() => setRoleHelpModalVisible(false)}
            >
              เข้าใจแล้ว
            </Button>,
            <Button
              key='debug'
              type='dashed'
              onClick={() => {
                console.log('🔍 Current User Debug Info:', {
                  uid: currentUser?.uid,
                  email: currentUser?.email,
                  displayName: currentUser?.displayName,
                  accessLevel: currentUser?.accessLevel,
                  authority: currentUser?.access?.authority,
                  geographic: currentUser?.access?.geographic,
                  departments: currentUser?.access?.departments,
                  fullData: currentUser,
                });
                message.info('ข้อมูลการดีบักถูกแสดงใน Console (F12)');
              }}
            >
              ดีบักข้อมูลของฉัน
            </Button>,
          ]}
          width={800}
        >
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            {/* Current User Status */}
            <Card
              size='small'
              style={{
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
              }}
            >
              <Row align='middle'>
                <Col span={24}>
                  <Space>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    <div>
                      <Text strong>สถานะปัจจุบันของคุณ</Text>
                      <br />
                      <Text>
                        บทบาท:{' '}
                        <Tag color='blue'>
                          {
                            getRoleDisplayInfo(
                              currentUser?.access?.authority ||
                                currentUser?.accessLevel ||
                                'ไม่ระบุ'
                            ).name
                          }
                        </Tag>
                        {currentUser?.access?.authority && (
                          <Tag color='green'>Clean Slate RBAC ✓</Tag>
                        )}
                        {!currentUser?.access?.authority && (
                          <Tag color='orange'>ต้องอัปเดตระบบ</Tag>
                        )}
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Role Hierarchy */}
            <Card size='small' title='ลำดับชั้นบทบาทและสิทธิ์'>
              <Space direction='vertical' style={{ width: '100%' }}>
                <div>
                  <Tag color='red' style={{ marginBottom: 8 }}>
                    ระดับ 4
                  </Tag>
                  <Text strong style={{ marginLeft: 8 }}>
                    ผู้ดูแลระบบ (ADMIN)
                  </Text>
                  <ul style={{ marginTop: 4, marginBottom: 12 }}>
                    <li>สามารถมอบหมายบทบาทใดก็ได้ให้ผู้ใช้ทุกคน</li>
                    <li>เข้าถึงทุกฟังก์ชันในระบบ</li>
                    <li>จัดการผู้ใช้ทุกระดับ</li>
                    <li>ตั้งค่าระบบและการกำหนดสิทธิ์</li>
                  </ul>
                </div>

                <div>
                  <Tag color='blue' style={{ marginBottom: 8 }}>
                    ระดับ 3
                  </Tag>
                  <Text strong style={{ marginLeft: 8 }}>
                    ผู้จัดการ (MANAGER)
                  </Text>
                  <ul style={{ marginTop: 4, marginBottom: 12 }}>
                    <li>สามารถมอบหมายบทบาท: หัวหน้าแผนก, เจ้าหน้าที่</li>
                    <li>ไม่สามารถมอบหมายบทบาท: ผู้ดูแลระบบ</li>
                    <li>จัดการผู้ใช้ในขอบเขตที่ได้รับมอบหมาย</li>
                    <li>อนุมัติและตรวจสอบงาน</li>
                  </ul>
                </div>

                <div>
                  <Tag color='green' style={{ marginBottom: 8 }}>
                    ระดับ 2
                  </Tag>
                  <Text strong style={{ marginLeft: 8 }}>
                    หัวหน้าแผนก (LEAD)
                  </Text>
                  <ul style={{ marginTop: 4, marginBottom: 12 }}>
                    <li>สามารถมอบหมายบทบาท: เจ้าหน้าที่เท่านั้น</li>
                    <li>ไม่สามารถมอบหมายบทบาท: ผู้ดูแลระบบ, ผู้จัดการ</li>
                    <li>ดูแลทีมงานในแผนก</li>
                    <li>ตรวจสอบงานของเจ้าหน้าที่</li>
                  </ul>
                </div>

                <div>
                  <Tag color='orange' style={{ marginBottom: 8 }}>
                    ระดับ 1
                  </Tag>
                  <Text strong style={{ marginLeft: 8 }}>
                    เจ้าหน้าที่ (STAFF)
                  </Text>
                  <ul style={{ marginTop: 4, marginBottom: 12 }}>
                    <li>ไม่สามารถมอบหมายบทบาทใดๆ ได้</li>
                    <li>ปฏิบัติงานตามที่ได้รับมอบหมาย</li>
                    <li>เข้าถึงข้อมูลเฉพาะที่เกี่ยวข้องกับงาน</li>
                  </ul>
                </div>
              </Space>
            </Card>

            {/* Common Issues */}
            <Card size='small' title='ปัญหาที่พบบ่อยและวิธีแก้ไข'>
              <Space direction='vertical' style={{ width: '100%' }}>
                <Alert
                  message='บทบาทไม่ถูกต้อง'
                  description='หากพบข้อความนี้ แสดงว่าระบบไม่สามารถระบุบทบาทของคุณได้ กรุณาติดต่อผู้ดูแลระบบ'
                  type='warning'
                  showIcon
                />

                <Alert
                  message='ไม่มีสิทธิ์มอบหมายบทบาทนี้'
                  description='คุณพยายามมอบหมายบทบาทที่สูงกว่าหรือเท่ากับบทบาทของคุณ ตรวจสอบลำดับชั้นด้านบน'
                  type='info'
                  showIcon
                />

                <Alert
                  message='บัญชียังไม่ได้อัปเดตเป็นระบบ RBAC ใหม่'
                  description='บัญชีของคุณยังใช้ระบบเก่า กรุณาติดต่อผู้ดูแลระบบเพื่ออัปเดต'
                  type='error'
                  showIcon
                />
              </Space>
            </Card>

            {/* Quick Actions */}
            <Card size='small' title='การดำเนินการด่วน'>
              <Space wrap>
                <Button
                  type='dashed'
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                >
                  รีเฟรชหน้า
                </Button>
                <Button
                  type='dashed'
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    message.info('กรุณาออกจากระบบและเข้าใหม่');
                  }}
                >
                  แนะนำให้ Login ใหม่
                </Button>
                <Button
                  type='dashed'
                  icon={<QuestionCircleOutlined />}
                  onClick={() => {
                    message.info('กรุณาติดต่อผู้ดูแลระบบหากยังมีปัญหา');
                  }}
                >
                  ติดต่อผู้ดูแลระบบ
                </Button>
              </Space>
            </Card>
          </Space>
        </Modal>
      </LayoutWithRBAC>
    </ScreenWithManual>
  );
};

UserManagement.propTypes = {
  // Add any props if needed
};

export default UserManagement;
