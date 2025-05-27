import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Select,
  Tag,
  Card,
  Input,
  Space,
  Spin,
  Typography,
  Form,
  Alert,
  Tooltip,
  Empty,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from '../../constants/Permissions';
import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../constants/roles';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import UserRoleEditor from './UserRoleEditor';
import styles from './UserRoleManager.module.css';
import PageDoc from '../../components/PageDoc';
import { useModal } from 'contexts/ModalContext';
import { useAuth } from 'contexts/AuthContext';
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * UserRoleManager component for administrators to manage user roles and permissions
 * This component allows viewing, filtering, and editing user roles and permissions
 */
const UserRoleManager = () => {
  const { t } = useTranslation(['userRoleManager', 'roles', 'permissions', 'common']);
  const { hasPermission, shouldHideUserFromView } = usePermissions();
  const { showWarning, showSuccess } = useModal();
  const { userProfile } = useAuth();

  // Memoize permission checks to prevent unnecessary useEffect reruns
  const canViewUsers = hasPermission(PERMISSIONS.USER_VIEW);

  // Get data from Redux store
  const usersFromStore = useSelector((state) => state.data.users || {});
  const provincesFromStore = useSelector((state) => state.data.provinces || {});

  // State for UI
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterProvince, setFilterProvince] = useState(null);

  // Edit modal states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingInProgress, setEditingInProgress] = useState(false);

  // Available roles for selection
  const [availableRoles, setAvailableRoles] = useState([]);

  // Window width for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize available roles
  useEffect(() => {
    // Create available roles array based on ROLES object
    const roles = Object.values(ROLES)
      .filter((role) => role !== ROLES.DEVELOPER)
      .map((role) => ({
        value: role,
        label: `roles.${role.toLowerCase()}.label`,
        description: `roles.${role.toLowerCase()}.description`,
      }));

    setAvailableRoles(roles);
  }, []);

  // Helper function to determine which users the current user can see
  const canUserSeeUser = useCallback(
    (targetUser, currentUser) => {
      if (!targetUser?.role) {
        return false;
      }
      // Skip developer role users if current user doesn't have permission to see them
      if (
        shouldHideUserFromView({
          email: targetUser.email || targetUser.auth?.email || '',
          role: targetUser.role,
        })
      ) {
        return false;
      }

      // Super admin and above can see all users
      if (
        [ROLES.DEVELOPER, ROLES.SUPER_ADMIN, ROLES.EXECUTIVE, ROLES.GENERAL_MANAGER].includes(
          currentUser.role,
        )
      ) {
        return true;
      }

      // Province admin can see users in their accessible provinces
      if (currentUser.role === ROLES.PROVINCE_ADMIN) {
        const userProvinceIds =
          targetUser.accessibleProvinceIds || [targetUser.provinceId].filter(Boolean);
        const hasProvinceOverlap = userProvinceIds.some(
          (pid) =>
            currentUser.accessibleProvinceIds?.includes(pid) || currentUser.provinceId === pid,
        );
        return hasProvinceOverlap;
      }

      // Province manager can see users in their province
      if (currentUser.role === ROLES.PROVINCE_MANAGER) {
        const userProvinceIds =
          targetUser.accessibleProvinceIds || [targetUser.provinceId].filter(Boolean);
        return userProvinceIds.includes(currentUser.provinceId);
      }

      // Branch manager can see users in their branch
      if (currentUser.role === ROLES.BRANCH_MANAGER) {
        // Must be same province and same branch
        return (
          targetUser.provinceId === currentUser.provinceId &&
          targetUser.employeeInfo?.branch === currentUser.employeeInfo?.branch
        );
      }

      // Lead can see users in their branch but not other managers
      if (currentUser.role === ROLES.LEAD) {
        // Can see users in same branch but not managers or above
        const canSeeRole = [ROLES.USER, ROLES.LEAD].includes(targetUser.role);
        const sameBranch =
          targetUser.provinceId === currentUser.provinceId &&
          targetUser.employeeInfo?.branch === currentUser.employeeInfo?.branch;
        return canSeeRole && sameBranch;
      }

      // Regular users can only see themselves and other users in same branch
      if (currentUser.role === ROLES.USER) {
        // Can only see other users (not managers) in same branch
        const canSeeRole = targetUser.role === ROLES.USER;
        const sameBranch =
          targetUser.provinceId === currentUser.provinceId &&
          targetUser.employeeInfo?.branch === currentUser.employeeInfo?.branch;
        return canSeeRole && sameBranch;
      }

      return false;
    },
    [shouldHideUserFromView],
  );

  // Convert Redux data to arrays with role-based filtering
  const users = useMemo(() => {
    const usersArray = Object.entries(usersFromStore)
      .map(([uid, userData]) => ({
        uid,
        email: userData.email || userData.auth?.email || '',
        displayName:
          userData.displayName ||
          userData.auth?.displayName ||
          `${userData.firstName || userData.auth?.firstName || ''} ${userData.lastName || userData.auth?.lastName || ''}`.trim() ||
          '',
        firstName: userData.firstName || userData.auth?.firstName,
        lastName: userData.lastName || userData.auth?.lastName,
        photoURL: userData.photoURL || userData.auth?.photoURL,
        role: userData.role,
        permissions: userData.permissions || [],
        accessibleProvinceIds: userData.accessibleProvinceIds || [],
        province: userData.provinceId || '',
        department: userData.employeeInfo?.department || '',
        branch: userData.employeeInfo?.branch || '',
        lastLogin: userData.lastLogin,
        status: userData.status || 'active',
        isEmailVerified: userData.auth?.emailVerified,
        deleted: userData.deleted,
      }))
      .filter((userData) => {
        // Filter out deleted users
        if (userData.deleted) return false;

        // Apply role-based filtering
        return canUserSeeUser(userData, userProfile);
      });

    return usersArray;
  }, [usersFromStore, userProfile, canUserSeeUser]);

  const provinces = useMemo(() => {
    return Object.entries(provincesFromStore)
      .map(([id, provinceData]) => ({
        id,
        name: provinceData.name,
        code: provinceData.code || '',
        status: provinceData.status || 'active',
        nameEn: provinceData.nameEn || provinceData.name || '',
        createdAt: provinceData.createdAt || Date.now(),
        updatedAt: provinceData.updatedAt || Date.now(),
      }))
      .filter((province) => province.status === 'active' && !province.deleted);
  }, [provincesFromStore]);

  // Check permissions
  useEffect(() => {
    if (!canViewUsers) {
      console.log('[UserRoleManager] User does not have USER_VIEW permission');
      showWarning(t('permissions.insufficientPermissions'));
    }
  }, [canViewUsers, showWarning, t]);
  // Filter users based on search text, role, and province, then sort by role
  const filteredUsers = users
    .filter((user) => {
      if (!user?.role) {
        return false;
      }
      // Skip developer role users from UI display
      if (shouldHideUserFromView({ email: user.email, role: user.role })) {
        return false;
      }

      const matchesSearch =
        searchText === '' ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchText.toLowerCase()));

      const matchesRole = !filterRole || user.role === filterRole;
      const matchesProvince =
        !filterProvince ||
        user.province === filterProvince ||
        (user.accessibleProvinceIds && user.accessibleProvinceIds.includes(filterProvince));

      return matchesSearch && matchesRole && matchesProvince;
    })
    .sort((a, b) => {
      // Use ROLE_HIERARCHY for sorting if available, otherwise alphabetical
      const aIndex = ROLE_HIERARCHY[a.role];
      const bIndex = ROLE_HIERARCHY[b.role];
      if (typeof aIndex === 'number' && typeof bIndex === 'number') {
        return aIndex - bIndex;
      }
      return a.role.localeCompare(b.role);
    });

  // Handle edit user button click
  const handleEditUser = (user) => {
    // Create editing user object with current values as defaults
    const editingUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      selectedRole: user.role,
      selectedPermissions: [...(ROLE_PERMISSIONS[user.role] || []), ...(user.permissions || [])],
      selectedProvinceIds: user.accessibleProvinceIds || [user.province].filter(Boolean),
      branchId: user.branch,
      departmentId: user.department,
      provinceId: user.province,
    };

    setCurrentUser(editingUser);
    setIsEditModalVisible(true);
  };

  // Handle save changes in edit modal
  const handleSaveChanges = async (editedUser) => {
    console.log('[UserRoleManager] editedUser', editedUser);
    setEditingInProgress(true);
    try {
      const userRef = doc(firestore, 'users', editedUser.uid);

      // Prepare update data
      const updateData = {
        role: editedUser.selectedRole,
        permissions: editedUser.selectedPermissions,
        accessibleProvinceIds: editedUser.selectedProvinceIds,
        updatedAt: new Date(),
      };

      // Update user in Firestore
      await updateDoc(userRef, updateData);

      // Note: Local state will be updated automatically by Redux store changes

      // Send notification to the user
      await notificationController.sendNotification(
        {
          title: t('notifications.roleUpdatedTitle'),
          description: t('notifications.roleUpdatedDescription', {
            role: editedUser.selectedRole,
          }),
          type: NotificationType.INFO,
          link: '/profile',
        },
        { userIds: [editedUser.uid], sendPush: true },
      );

      showSuccess(
        t('messages.success.updateUserDescription', {
          user: editedUser.displayName || editedUser.email,
        }),
      );

      // Close modal
      setIsEditModalVisible(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      showWarning(error instanceof Error ? error.message : t('common.unexpectedError'));
    } finally {
      setEditingInProgress(false);
    }
  };

  // Reset search and filters
  const resetFilters = () => {
    setSearchText('');
    setFilterRole(null);
    setFilterProvince(null);
  };

  // Render permission summary for display
  const renderPermissionSummary = (permissions) => {
    if (!permissions || permissions.length === 0) {
      return (
        <Text type="secondary" italic>
          {t('noPermissions', 'No permissions')}
        </Text>
      );
    }

    return (
      <div className="flex items-center">
        <Tag color="green" className={`rounded-full ${styles.permissionsTag}`}>
          {t('editModal.permissionCount', { count: permissions.length })}
        </Tag>
      </div>
    );
  };

  // Render province tags for display
  const renderProvinceTags = (provinceIds) => {
    if (!provinceIds || provinceIds.length === 0) {
      return (
        <Text type="secondary" italic>
          {t('noProvinces', 'No provinces assigned')}
        </Text>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {provinceIds.map((provinceId) => {
          const province = provinces.find((p) => p.id === provinceId);
          return (
            <Tag key={provinceId} color="blue" className="flex items-center rounded-full px-3 py-1">
              {province?.name || provinceId}
            </Tag>
          );
        })}
      </div>
    );
  };

  // Define table columns
  const getColumns = () => {
    const baseColumns = [
      {
        title: t('columns.name', { ns: 'userRoleManager' }),
        dataIndex: 'displayName',
        key: 'displayName',
        width: 220,
        className: styles.nameColumn,
        render: (text, record) => {
          const userName = text
            ? text
            : record.firstName || record.lastName
              ? `${record.firstName || ''} ${record.lastName || ''}`.trim()
              : record.email || t('unnamed');

          return (
            <div className="flex items-center space-x-3">
              <Avatar icon={<UserOutlined />} src={record.photoURL} />
              <div>
                <Text strong className="block leading-tight">
                  {userName}
                </Text>
                <Text type="secondary" className="text-sm">
                  {record.email}
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: t('columns.role', { ns: 'userRoleManager' }),
        dataIndex: 'role',
        key: 'role',
        width: 160,
        className: styles.roleColumn,
        render: (role) => (
          <Tag color={getRoleColor(role)} className="px-2 py-1">
            {t(`${role.toLowerCase()}.label`, { ns: 'roles' })}
          </Tag>
        ),
        filters: Object.values(ROLES)
          .filter((role) => role !== ROLES.DEVELOPER)
          .map((role) => ({
            text: t(`${role.toLowerCase()}.label`, { ns: 'roles' }),
            value: role,
          })),
        onFilter: (value, record) => record.role === value,
      },
      {
        title: t('columns.province', { ns: 'userRoleManager' }),
        dataIndex: 'province',
        key: 'province',
        width: 180,
        responsive: ['md'],
        className: styles.provincesColumn,
        render: (text, record) => (
          <div className={styles.permissionsContainer}>
            {renderProvinceTags(
              record.accessibleProvinceIds || (record.province ? [record.province] : []),
            )}
          </div>
        ),
      },
      {
        title: t('columns.permissions', { ns: 'userRoleManager' }),
        dataIndex: 'permissions',
        key: 'permissions',
        width: 180,
        responsive: ['lg'],
        className: styles.permissionsColumn,
        render: (permissions, record) => (
          <div className={styles.permissionsContainer}>
            {permissions.length > 0 ? (
              renderPermissionSummary(permissions)
            ) : (
              <Tooltip title={t('roleDefaultPermissions')}>
                <Tag color="blue" className={`rounded-full ${styles.permissionsTag}`}>
                  {ROLE_PERMISSIONS[record.role]?.length || 0} {t('defaultPermissions')}
                </Tag>
              </Tooltip>
            )}
            <div className={styles.actionButtonContainer}>
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="small"
                onClick={() => handleEditUser(record)}
                title={t('buttons.configure')}
                className={styles.actionButton}
              />
            </div>
          </div>
        ),
      },
      {
        title: t('columns.status', { ns: 'userRoleManager' }),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        responsive: ['md'],
        className: styles.statusColumn,
        render: (status) => {
          const statusColors = {
            active: 'green',
            inactive: 'red',
            pending: 'orange',
          };
          const color = statusColors[status] || 'default';

          return (
            <Tag color={color} className="rounded-full px-2 py-0">
              {t(`status.${status}`)}
            </Tag>
          );
        },
        filters: [
          { text: t('status.active'), value: 'active' },
          { text: t('status.inactive'), value: 'inactive' },
          { text: t('status.pending'), value: 'pending' },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: t('columns.actions', { ns: 'userRoleManager' }),
        key: 'actions',
        ...(!isMobile ? { fixed: 'right' } : {}),
        width: 130,
        className: styles.actionsColumn,
        render: (_, record) => (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            disabled={!hasPermission(PERMISSIONS.USER_ROLE_EDIT)}
            size={isMobile ? 'small' : 'middle'}
            className="shadow-sm hover:shadow transition-all"
          >
            {!isMobile && t('actions.edit')}
          </Button>
        ),
      },
    ];

    // For mobile views, adjust columns for better display
    if (isMobile) {
      return baseColumns.map((col) => {
        if (col.key === 'status') {
          return {
            ...col,
            responsive: undefined, // Remove responsive property
          };
        }
        return col;
      });
    }

    return baseColumns;
  };

  // Expandable row configuration for mobile view
  const expandableConfig = isMobile
    ? {
        expandedRowRender: (record) => (
          <Card size="small" bordered={false} className="bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="space-y-3 py-1">
              <div className="flex items-start">
                <MailOutlined className="text-gray-400 mt-1 mr-2" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    {t('columns.email', { ns: 'userRoleManager' })}
                  </Text>
                  <Text>{record.email}</Text>
                </div>
              </div>

              {record.province && (
                <div className="flex items-start">
                  <div className="text-gray-400 mt-1 mr-2">🏢</div>
                  <div>
                    <Text type="secondary" className="block text-xs">
                      {t('columns.province', { ns: 'userRoleManager' })}
                    </Text>
                    <Text>
                      {provinces.find((p) => p.id === record.province)?.name || record.province}
                    </Text>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <LockOutlined className="text-gray-400 mt-1 mr-2" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    {t('columns.permissions', { ns: 'userRoleManager' })}
                  </Text>
                  <Text>
                    {record.permissions.length > 0
                      ? `${record.permissions.length} ${t('userRoleManager.permissions')}`
                      : `${ROLE_PERMISSIONS[record.role]?.length || 0} ${t('userRoleManager.defaultPermissions')}`}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        ),
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <Button
              type="text"
              onClick={(e) => onExpand(record, e)}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              }
              size="small"
            />
          ) : (
            <Button
              type="text"
              onClick={(e) => onExpand(record, e)}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              }
              size="small"
            />
          ),
      }
    : undefined;

  // Get color for role tag
  const getRoleColor = (role) => {
    const roleColors = {
      [ROLES.SUPER_ADMIN]: 'magenta',
      [ROLES.PROVINCE_ADMIN]: 'red',
      [ROLES.EXECUTIVE]: 'volcano',
      [ROLES.GENERAL_MANAGER]: 'orange',
      [ROLES.PROVINCE_MANAGER]: 'gold',
      [ROLES.BRANCH_MANAGER]: 'lime',
      [ROLES.LEAD]: 'green',
      [ROLES.USER]: 'cyan',
      [ROLES.PENDING]: 'purple',
      [ROLES.GUEST]: 'default',
      [ROLES.DEVELOPER]: 'geekblue',
    };

    return roleColors[role] || 'default';
  };

  return (
    <div className={styles.userRoleManagerContainer}>
      <Card className={styles.headerCard}>
        <div
          className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-${isMobile ? 'start' : 'center'}`}
        >
          <div>
            <Title level={isMobile ? 2 : 3} className="mb-1">
              {t('title')}
            </Title>
            <Paragraph>{t('description')}</Paragraph>
          </div>
          <Tooltip title={t('tooltip')}>
            <Button type="text" icon={<QuestionCircleOutlined className="text-xl" />} />
          </Tooltip>
        </div>
      </Card>

      <Card className={styles.tableCard} style={{ marginBottom: '16px' }}>
        <div className={styles.filterControls}>
          <Input
            placeholder={t('filters.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 240 }}
            allowClear
          />

          <Select
            placeholder={t('filters.filterByRole')}
            allowClear
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: isMobile ? '100%' : 180 }}
          >
            {Object.values(ROLES)
              .filter((role) => role !== ROLES.DEVELOPER)
              .map((role) => (
                <Option key={role} value={role}>
                  {t(`${role.toLowerCase()}.label`, { ns: 'roles' })}
                </Option>
              ))}
          </Select>

          <Select
            placeholder={t('filters.filterByProvince')}
            allowClear
            value={filterProvince}
            onChange={setFilterProvince}
            style={{ width: isMobile ? '100%' : 180 }}
            loading={false}
          >
            {provinces.map((province) => (
              <Option key={province.id} value={province.id}>
                {province.name}
              </Option>
            ))}
          </Select>

          <Button icon={<ReloadOutlined />} onClick={resetFilters} type="default">
            {!isMobile && t('filters.resetFilters')}
          </Button>
        </div>
      </Card>

      {users.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spin size={isMobile ? 'default' : 'large'} tip={t('loading', 'Loading users...')} />
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card className={styles.tableCard}>
          <Table
            dataSource={filteredUsers}
            columns={getColumns()}
            rowKey="uid"
            expandable={expandableConfig}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              pageSizeOptions: isMobile ? ['5', '10'] : ['10', '20', '50', '100'],
              size: isMobile ? 'small' : 'default',
              position: ['bottomCenter'],
              className: 'mt-4',
            }}
            size={isMobile ? 'small' : 'middle'}
            scroll={{ x: isMobile ? 800 : 1200 }}
            rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            className={styles.userTable}
          />
        </Card>
      ) : (
        <Card className={`${styles.tableCard} ${styles.emptyState}`}>
          <Empty
            description={
              <Text className="text-gray-500">
                {searchText || filterRole || filterProvince
                  ? t('noMatchingUsers', 'No users match your search criteria')
                  : t('noUsers', 'No users found')}
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Use the shared UserRoleEditor component */}
      <UserRoleEditor
        visible={isEditModalVisible}
        user={currentUser}
        availableRoles={availableRoles}
        availableProvinces={provinces}
        rolePermissions={ROLE_PERMISSIONS}
        onCancel={() => setIsEditModalVisible(false)}
        onSave={handleSaveChanges}
        isSaving={editingInProgress}
        modalTitle="editModal.title"
      />
      <PageDoc />
    </div>
  );
};

export default UserRoleManager;
