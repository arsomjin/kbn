import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Select,
  Spin,
  Empty,
  Tooltip,
  message,
  Modal,
  Checkbox,
  Tag,
  Card,
  Typography,
  Avatar,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { firestore } from '../../services/firebase';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import { usePermissions } from 'hooks/usePermissions';
import UserRoleEditor from './UserRoleEditor';
import styles from './UserReview.module.css';
import { useAntdModal } from 'hooks/useAntModal';
import { useTheme } from 'hooks/useTheme';
import { useModal } from 'contexts/ModalContext';
import { useAuth } from 'contexts/AuthContext';
import PageDoc from '../../components/PageDoc';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

// Fallback roles in case Firestore access fails - ordered by privilege level
const DEFAULT_ROLES = [
  {
    value: ROLES.USER,
    label: 'roles.user.label',
    description: 'roles.user.description',
  },
  {
    value: ROLES.LEAD,
    label: 'roles.lead.label',
    description: 'roles.lead.description',
  },
  {
    value: ROLES.BRANCH_MANAGER,
    label: 'roles.branch_manager.label',
    description: 'roles.branch_manager.description',
  },
  {
    value: ROLES.PROVINCE_MANAGER,
    label: 'roles.province_manager.label',
    description: 'roles.province_manager.description',
  },
  {
    value: ROLES.PROVINCE_ADMIN,
    label: 'roles.province_admin.label',
    description: 'roles.province_admin.description',
  },
  {
    value: ROLES.GENERAL_MANAGER,
    label: 'roles.general_manager.label',
    description: 'roles.general_manager.description',
  },
  {
    value: ROLES.SUPER_ADMIN,
    label: 'roles.super_admin.label',
    description: 'roles.super_admin.description',
  },
  {
    value: ROLES.EXECUTIVE,
    label: 'roles.executive.label',
    description: 'roles.executive.description',
  },
];

const UserReview = () => {
  const { t } = useTranslation(['userReview', 'roles', 'common']);
  const { theme } = useTheme();
  const { showWarning } = useModal();

  // Get data from Redux store
  const usersFromStore = useSelector((state) => state.data.users || {});
  const provincesFromStore = useSelector((state) => state.data.provinces || {});

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

  const [processingUsers, setProcessingUsers] = useState({});
  const [availableRoles] = useState(DEFAULT_ROLES);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update user selector to access correct Redux state path
  const { user: USER, userProfile } = useAuth();
  const { hasPermission, shouldHideUserFromView } = usePermissions();

  // State for available permissions
  const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { modal } = useAntdModal();

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 480;

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

      // Super admin and above can see all pending users
      if (
        [ROLES.DEVELOPER, ROLES.SUPER_ADMIN, ROLES.EXECUTIVE, ROLES.GENERAL_MANAGER].includes(
          currentUser.role,
        )
      ) {
        return true;
      }

      // Province admin can see pending users in their accessible provinces
      if (currentUser.role === ROLES.PROVINCE_ADMIN) {
        const userProvinceIds = [targetUser.provinceId].filter(Boolean);
        const hasProvinceOverlap = userProvinceIds.some(
          (pid) =>
            currentUser.accessibleProvinceIds?.includes(pid) || currentUser.provinceId === pid,
        );
        return hasProvinceOverlap;
      }

      // Province manager can see pending users in their province
      if (currentUser.role === ROLES.PROVINCE_MANAGER) {
        return targetUser.provinceId === currentUser.provinceId;
      }

      // Branch manager can see pending users in their branch
      if (currentUser.role === ROLES.BRANCH_MANAGER) {
        // Must be same province and same branch
        return (
          targetUser.provinceId === currentUser.provinceId &&
          targetUser.branchId === currentUser.employeeInfo?.branch
        );
      }

      // Lead and regular users typically cannot approve users
      // But we'll allow them to see pending users in their branch for reference
      if ([ROLES.LEAD, ROLES.USER].includes(currentUser.role)) {
        return (
          targetUser.provinceId === currentUser.provinceId &&
          targetUser.branchId === currentUser.employeeInfo?.branch
        );
      }

      return false;
    },
    [shouldHideUserFromView],
  );

  // Local state for selected user configurations (not affecting Redux data)
  const [userSelections, setUserSelections] = useState({});

  // Process users data from Redux store to get pending users
  const users = useMemo(() => {
    const pendingUsers = Object.entries(usersFromStore)
      .map(([uid, userData]) => {
        // Only include pending users
        if (userData.role !== ROLES.PENDING) return null;

        // Apply role-based filtering
        if (!canUserSeeUser(userData, userProfile)) return null;

        const defaultRole = ROLES.USER;
        const defaultPermissions = rolePermissions[defaultRole] || [];
        const defaultProvinceIds = userData.provinceId ? [userData.provinceId] : [];

        // Merge with user selections
        const userSelection = userSelections[uid] || {};

        return {
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
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          role: userData.role || ROLES.PENDING,
          selectedRole: userSelection.selectedRole || defaultRole,
          selectedPermissions: userSelection.selectedPermissions || defaultPermissions,
          selectedProvinceIds: userSelection.selectedProvinceIds || defaultProvinceIds,
          type: userData.type,
          branchId: userData.branchId,
          departmentId: userData.departmentId,
          provinceId: userData.provinceId,
          status: userData.status || 'pending',
          isEmailVerified: userData.auth?.emailVerified,
          ...userData?.auth,
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    return pendingUsers;
  }, [usersFromStore, userProfile, canUserSeeUser, rolePermissions, userSelections]);

  // Initialize role permissions on mount
  useEffect(() => {
    // Attempt to load role-permission mappings from Firestore
    const fetchRolePermissions = async () => {
      try {
        const rolePermissionsDoc = await getDoc(doc(firestore, 'systemConfig', 'rolePermissions'));
        if (rolePermissionsDoc.exists()) {
          setRolePermissions(rolePermissionsDoc.data());
        }
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        // Fallback to default permissions
      }
    };
    fetchRolePermissions();
  }, []);

  // Handle role change and update corresponding permissions
  const handleRoleChange = (uid, role) => {
    const defaultPermissions = rolePermissions[role] || [];
    setUserSelections((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        selectedRole: role,
        selectedPermissions: defaultPermissions,
      },
    }));
  };

  // Open the edit modal for a user
  const openEditModal = (user) => {
    setCurrentUser(user);
    setEditModalVisible(true);
  };

  // Save changes from the modal back to the user selections state
  const handleEditSave = (editedUser) => {
    setUserSelections((prev) => ({
      ...prev,
      [editedUser.uid]: {
        ...prev[editedUser.uid],
        ...editedUser,
      },
    }));

    setEditModalVisible(false);
    setCurrentUser(null);
  };

  const approveUser = async (uid, userData) => {
    // Check permissions first
    if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT)) {
      console.error('User lacks USER_ROLE_EDIT permission');
      showWarning(t('errors.insufficientPermissions'));
      return;
    }

    modal.confirm({
      title: t('confirm.approveTitle'),
      content: (
        <div>
          <p>
            {t('confirm.approveContent', {
              user: userData.displayName || userData.email,
              role: userData.selectedRole,
            })}
          </p>
          <p>{t('confirm.approveWarning')}</p>
        </div>
      ),
      okText: t('buttons.approve', 'อนุมัติ'),
      okType: 'primary',
      cancelText: t('common.cancel', 'ยกเลิก'),
      onOk: async () => {
        setProcessingUsers((prev) => ({ ...prev, [uid]: true }));
        try {
          console.log('Current user context:', USER);
          const userRef = doc(firestore, 'users', uid);
          const userSnap = await getDoc(userRef);
          const userDataSnap = userSnap.data();

          if (!USER?.uid) {
            throw new Error('No authenticated user found');
          }

          if (userDataSnap) {
            const selectedRole = userData.selectedRole || ROLES.USER;

            // Prepare permission update
            const permissionsUpdate = {
              role: selectedRole,
              permissions: userData.selectedPermissions,
              permissionsChanges: [
                ...(userDataSnap.permissionsChanges || []),
                {
                  granted: true,
                  approvedBy: USER?.uid,
                  approvedAt: new Date().toISOString(),
                  permissionList: userData.selectedPermissions,
                },
              ],
              accessibleProvinceIds: userData.selectedProvinceIds || [],
              provinceId: userData.selectedProvinceIds?.[0] || userDataSnap.provinceId || null,
              status: 'active',
            };

            console.log('Updating user with:', permissionsUpdate);

            // Update user document with role and permissions
            await updateDoc(userRef, permissionsUpdate);

            // Send notification to the approved user
            await notificationController.sendNotification(
              {
                title: t('notifications.userTitle'),
                description: t('notifications.userDescription', { role: selectedRole }),
                type: NotificationType.SUCCESS,
                link: '/dashboard',
                imageUrl: undefined,
                targetUserIds: [uid],
              },
              { userIds: [uid], sendPush: true },
            );

            // Send notification to appropriate admins based on province
            await notificationController.sendNotification({
              title: t('notifications.adminTitle'),
              description: t('notifications.adminDescription'),
              type: NotificationType.INFO,
              targetRoles: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER],
              provinceId: userData.provinceId || userData.selectedProvinceIds?.[0],
              link: '/review-users',
              params: {
                name: userDataSnap.displayName || userDataSnap.firstName || '',
                email: userDataSnap.email || '',
              },
            });

            message.success(t('success.approved', { role: selectedRole }));
          }
        } catch (e) {
          message.error(t('errors.approveUser', { error: e?.message || t('errors.unknown') }));
        }
        setProcessingUsers((prev) => ({ ...prev, [uid]: false }));
      },
    });
  };

  const rejectUser = async (uid) => {
    modal.confirm({
      title: t('confirm.rejectTitle'),
      content: (
        <div>
          <p>{t('confirm.rejectContent')}</p>
          <p>{t('confirm.rejectWarning')}</p>
        </div>
      ),
      okText: t('buttons.reject', 'Reject'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Cancel'),
      onOk: async () => {
        setProcessingUsers((prev) => ({ ...prev, [uid]: true }));
        try {
          const userRef = doc(firestore, 'users', uid);
          const userSnap = await getDoc(userRef);
          const userDataSnap = userSnap.data();
          await updateDoc(userRef, {
            role: ROLES.PENDING,
            permissions: {
              granted: false,
              rejected: true,
              rejectedBy: USER?.uid,
              rejectedAt: new Date().toISOString(),
            },
          });
          // Send notification to the rejected user
          await notificationController.sendNotification(
            {
              title: t('notifications.userRejectedTitle'),
              description: t('notifications.userRejectedDescription'),
              type: NotificationType.ERROR,
              link: '/pending',
              imageUrl: undefined,
            },
            { userIds: [uid], sendPush: true },
          );
          // Send notification to admins about rejected user
          await notificationController.sendNotification({
            title: t('notifications.adminRejectedTitle'),
            description: t('notifications.adminRejectedDescription'),
            type: NotificationType.WARNING,
            targetRoles: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER],
            provinceId: userDataSnap?.provinceId || userDataSnap?.selectedProvinceIds?.[0],
            link: '/review-users',
            params: {
              name: userDataSnap?.displayName || userDataSnap?.firstName || '',
              email: userDataSnap?.email || '',
            },
          });
          message.success(t('success.rejected'));
        } catch {
          message.error(t('errors.rejectUser'));
        }
        setProcessingUsers((prev) => ({ ...prev, [uid]: false }));
      },
    });
  };

  // Responsive columns configuration
  const getColumns = () => {
    const baseColumns = [
      {
        title: t('columns.name'),
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
              </div>
            </div>
          );
        },
      },
      {
        title: t('columns.email'),
        dataIndex: 'email',
        key: 'email',
        width: 220,
        responsive: ['md'],
        className: styles.emailColumn,
        render: (email) => (
          <div className="flex items-center space-x-2">
            <MailOutlined className="text-gray-400" />
            <Text ellipsis>{email}</Text>
          </div>
        ),
      },
      {
        title: t('columns.requestedDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        responsive: ['lg'],
        className: styles.dateColumn,
        render: (date) => (
          <div style={{ justifyContent: 'center' }} className="flex items-center space-x-2">
            <CalendarOutlined className="text-gray-400" />
            <Text>{date ? date.toLocaleDateString() : t('unknown')}</Text>
          </div>
        ),
      },
      {
        title: t('columns.role'),
        key: 'role',
        width: 170,
        className: styles.roleColumn,
        render: (_, record) => (
          <Select
            value={record.selectedRole}
            style={{ width: '100%' }}
            size={isMobile ? 'small' : 'middle'}
            onChange={(value) => handleRoleChange(record.uid, value)}
            dropdownMatchSelectWidth={false}
            className={styles.roleSelector}
            listHeight={320}
          >
            {availableRoles.map((role) => (
              <Option key={role.value} value={role.value}>
                {t(role.label) || role.value}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: t('columns.permissions'),
        key: 'permissions',
        responsive: ['lg'],
        width: 180,
        className: styles.permissionsColumn,
        render: (_, record) => (
          <div className={styles.permissionsContainer}>
            {renderPermissionSummary(record.selectedPermissions)}
            <div className={styles.actionButtonContainer}>
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
                title={t('buttons.configurePage')}
                className={styles.actionButton}
              />
            </div>
          </div>
        ),
      },
      {
        title: t('columns.provinces'),
        key: 'provinces',
        responsive: ['lg'],
        width: 180,
        className: styles.provincesColumn,
        render: (_, record) => (
          <div className={styles.permissionsContainer}>
            {renderProvinceTags(record.selectedProvinceIds)}
            <div className={styles.actionButtonContainer}>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
                title={t('buttons.configureProvinces')}
                className={styles.actionButton}
              />
            </div>
          </div>
        ),
      },
      {
        title: t('columns.actions'),
        key: 'actions',
        ...(!isMobile ? { fixed: 'right' } : {}),
        width: 216,
        className: styles.actionsColumn,
        render: (_, record) => (
          <div className={`flex space-x-3`}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => approveUser(record.uid, record)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid] || !hasPermission(PERMISSIONS.USER_ROLE_EDIT)}
              size={isMobile ? 'small' : 'middle'}
              className="approve-button flex items-center shadow-sm hover:shadow transition-all"
            >
              {!isMobile && <span className="ml-1">{t('buttons.approve', 'Approve')}</span>}
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => rejectUser(record.uid)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid] || !hasPermission(PERMISSIONS.USER_ROLE_EDIT)}
              size={isMobile ? 'small' : 'middle'}
              className="reject-button flex items-center shadow-sm hover:shadow transition-all"
            >
              {!isMobile && <span className="ml-1">{t('buttons.reject', 'Reject')}</span>}
            </Button>
          </div>
        ),
      },
    ];

    // if (!isMobile) {
    //   // Add advanced settings button for non-mobile view
    //   baseColumns.splice(4, 0, {
    //     title: t("userReview.columns.settings"),
    //     key: "settings",
    //     responsive: ["md"],
    //     render: (_: any, record: PendingUser) => (
    //       <Button icon={<SettingOutlined />} onClick={() => openEditModal(record)} size={isMobile ? "small" : "middle"}>
    //         {t("userReview.buttons.configure")}
    //       </Button>
    //     ),
    //   });
    // }

    // For mobile, modify columns for better display
    if (isMobile) {
      return baseColumns.map((col) => {
        if (col.key === 'email') {
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
                    {t('columns.email')}
                  </Text>
                  <Text strong>{record.email}</Text>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarOutlined className="text-gray-400 mt-1 mr-2" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    {t('columns.requestedDate')}
                  </Text>
                  <Text>
                    {record.createdAt ? record.createdAt.toLocaleDateString() : t('unknown')}
                  </Text>
                </div>
              </div>

              {record.provinceId && (
                <div className="flex items-start">
                  <div className="text-gray-400 mt-1 mr-2">🏢</div>
                  <div>
                    <Text type="secondary" className="block text-xs">
                      {t('columns.province')}
                    </Text>
                    <Text>
                      {provinces.find((p) => p.id === record.provinceId)?.name || record.provinceId}
                    </Text>
                  </div>
                </div>
              )}
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

  // Render permission summary for display
  /**
   * Renders a summary of permissions as a tag with count.
   * @param permissions - Array of permission keys
   * @returns JSX.Element
   */
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
          {t('permissionCount', { count: permissions.length })}
        </Tag>
      </div>
    );
  };
  console.log('users', users);
  return (
    <>
      <div className={styles.userReviewContainer}>
        <Card className={styles.headerCard}>
          <div
            className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-${isMobile ? 'start' : 'center'}`}
          >
            <div>
              <Title
                level={isMobile ? 2 : 3}
                className={`mb-1`}
                style={{ color: theme === 'dark' ? 'white' : 'black' }}
              >
                {t('title')}
              </Title>
              <Paragraph>
                {t('subtitle', 'Review and approve user registration requests')}
              </Paragraph>
            </div>
            <Tooltip title={t('tooltip')}>
              <Button type="text" icon={<QuestionCircleOutlined className="text-xl" />} />
            </Tooltip>
          </div>
        </Card>

        {users.length === 0 && Object.keys(usersFromStore).length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Spin size={isMobile ? 'default' : 'large'} tip={t('loading')} />
          </div>
        ) : users.length > 0 ? (
          <Card className={styles.tableCard}>
            <Table
              dataSource={users}
              columns={getColumns()}
              rowKey="uid"
              expandable={expandableConfig}
              pagination={{
                pageSize: isMobile ? 5 : 10,
                showSizeChanger: !isMobile,
                pageSizeOptions: isMobile ? ['5', '10'] : ['5', '10', '20'],
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
                <Text className="text-gray-500">{t('empty', 'No pending user requests')}</Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}

        {/* Use the shared UserRoleEditor component */}
        <UserRoleEditor
          visible={editModalVisible}
          user={currentUser}
          availableRoles={availableRoles}
          availableProvinces={provinces}
          rolePermissions={rolePermissions}
          onCancel={() => setEditModalVisible(false)}
          onSave={handleEditSave}
          isSaving={false}
          modalTitle={t('editModal.title')}
          namespace="userReview"
        />
      </div>
      <PageDoc />
    </>
  );
};

export default UserReview;
