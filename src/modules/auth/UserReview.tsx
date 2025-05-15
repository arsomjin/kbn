import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';
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
  Avatar
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { collection, onSnapshot, query, doc, getDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { firestore } from '../../services/firebase';
import { ROLES, RoleType } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import { ColumnsType } from 'antd/es/table';
import { usePermissions } from '../../hooks/usePermissions';
import UserRoleEditor, { EditableUser } from '../../components/auth/UserRoleEditor';
import { Province } from '../../types/province';
import styles from './UserReview.module.css';
import { useAntdModal } from '../../hooks/useAntModal';
import { getPrivilegeLevel } from '../../utils/roleUtils';
import { useTheme } from '../../hooks/useTheme';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

// Fallback roles in case Firestore access fails - ordered by privilege level
const DEFAULT_ROLES = [
  {
    value: ROLES.USER,
    label: 'roles.user.label',
    description: 'roles.user.description'
  },
  {
    value: ROLES.BRANCH,
    label: 'roles.branch.label',
    description: 'roles.branch.description'
  },
  {
    value: ROLES.LEAD,
    label: 'roles.lead.label',
    description: 'roles.lead.description'
  },
  {
    value: ROLES.BRANCH_MANAGER,
    label: 'roles.branch_manager.label',
    description: 'roles.branch_manager.description'
  },
  {
    value: ROLES.PROVINCE_MANAGER,
    label: 'roles.province_manager.label',
    description: 'roles.province_manager.description'
  },
  {
    value: ROLES.PROVINCE_ADMIN,
    label: 'roles.province_admin.label',
    description: 'roles.province_admin.description'
  },
  {
    value: ROLES.GENERAL_MANAGER,
    label: 'roles.general_manager.label',
    description: 'roles.general_manager.description'
  },
  {
    value: ROLES.SUPER_ADMIN,
    label: 'roles.super_admin.label',
    description: 'roles.super_admin.description'
  },
  {
    value: ROLES.PRIVILEGE,
    label: 'roles.privilege.label',
    description: 'roles.privilege.description'
  }
];

// Permission sets based on role (fallback if Firestore access fails)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.USER]: [PERMISSIONS.DATA_VIEW, PERMISSIONS.CONTENT_VIEW],
  [ROLES.BRANCH]: [PERMISSIONS.DATA_VIEW, PERMISSIONS.CONTENT_VIEW],
  [ROLES.LEAD]: [PERMISSIONS.DATA_VIEW, PERMISSIONS.DATA_EDIT, PERMISSIONS.CONTENT_VIEW],
  [ROLES.BRANCH_MANAGER]: [
    PERMISSIONS.DATA_VIEW,
    PERMISSIONS.DATA_EDIT,
    PERMISSIONS.DATA_CREATE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT
  ],
  [ROLES.PROVINCE_MANAGER]: [
    PERMISSIONS.DATA_VIEW,
    PERMISSIONS.DATA_EDIT,
    PERMISSIONS.DATA_CREATE,
    PERMISSIONS.DATA_DELETE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT
  ],
  [ROLES.GENERAL_MANAGER]: [
    PERMISSIONS.DATA_VIEW,
    PERMISSIONS.DATA_EDIT,
    PERMISSIONS.DATA_CREATE,
    PERMISSIONS.DATA_DELETE,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_CREATE
  ],
  [ROLES.PROVINCE_ADMIN]: [
    PERMISSIONS.DATA_VIEW,
    PERMISSIONS.DATA_EDIT,
    PERMISSIONS.DATA_CREATE,
    PERMISSIONS.DATA_DELETE,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.DATA_IMPORT,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ROLE_EDIT,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.SYSTEM_SETTINGS_VIEW
  ],
  [ROLES.PRIVILEGE]: [
    PERMISSIONS.DATA_VIEW,
    PERMISSIONS.DATA_EDIT,
    PERMISSIONS.DATA_CREATE,
    PERMISSIONS.DATA_DELETE,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.DATA_IMPORT,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ROLE_EDIT,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.SYSTEM_SETTINGS_VIEW,
    PERMISSIONS.SYSTEM_SETTINGS_EDIT,
    PERMISSIONS.SYSTEM_LOGS_VIEW
  ]
};

interface PendingUser extends EditableUser {
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

const UserReview: React.FC = () => {
  const { t } = useTranslation(['userReview', 'roles']);
  const { theme } = useTheme();

  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update user selector to access correct Redux state path
  const USER = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const { hasPermission } = usePermissions();

  // State for available provinces and permissions
  const [availableProvinces, setAvailableProvinces] = useState<Province[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(DEFAULT_ROLE_PERMISSIONS);
  const [allPermissions, setAllPermissions] = useState<{ key: string; title: string }[]>([]);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<PendingUser | null>(null);
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
  const isTablet = windowWidth >= 480 && windowWidth < 768;

  // Fetch available roles from system
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const testDoc = doc(firestore, 'systemConfig/roles');
        const testSnapshot = await getDoc(testDoc);
        if (!testSnapshot.exists()) return;
        // If you have a Firestore collection for roles, fetch and map them here
        // Otherwise, fallback to DEFAULT_ROLES
      } catch {
        // Fallback to default roles
      }
    };
    fetchRoles();
  }, []);

  // Fetch available provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provincesRef = collection(firestore, 'data/company/provinces');
        const provincesSnapshot = await getDocs(provincesRef);
        const provinces = provincesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id,
          code: doc.data().code || '',
          nameEn: doc.data().nameEn || doc.data().name || '',
          status: doc.data().status || 'active',
          createdAt: doc.data().createdAt || Date.now(),
          updatedAt: doc.data().updatedAt || Date.now(),
        }));
        setAvailableProvinces(provinces);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        message.error(t('errors.fetchProvinces'));
      }
    };
    fetchProvinces();
  }, [t]);

  // Fetch permission structure for UI display
  useEffect(() => {
    // Convert permissions to format needed for Transfer component
    const permissionItems = Object.keys(PERMISSIONS).map(key => ({
      key: PERMISSIONS[key as keyof typeof PERMISSIONS],
      title: key.replace(/_/g, ' ')
    }));
    setAllPermissions(permissionItems);

    // Attempt to load role-permission mappings from Firestore
    const fetchRolePermissions = async () => {
      try {
        const rolePermissionsDoc = await getDoc(doc(firestore, 'systemConfig', 'rolePermissions'));
        if (rolePermissionsDoc.exists()) {
          setRolePermissions(rolePermissionsDoc.data() as Record<string, string[]>);
        }
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        // Fallback to default permissions
      }
    };
    fetchRolePermissions();
  }, []);

  // Real-time listener for pending users
  useEffect(() => {
    setLoading(true);
    const usersRef = collection(firestore, 'users');
    let q = query(usersRef, where('role', '==', ROLES.PENDING));

    // If user is province_admin, only show users from their province
    if (userProfile?.role === ROLES.PROVINCE_ADMIN && userProfile?.province) {
      console.log(`Filtering users for province_admin in province: ${userProfile.province}`);
      q = query(usersRef, where('role', '==', ROLES.PENDING), where('province', '==', userProfile.province));
    }

    const unsubscribe = onSnapshot(
      q,
      async snapshot => {
        try {
          const pendingUsers: PendingUser[] = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const defaultRole = ROLES.USER;

            // Get default permissions for the selected role
            const defaultPermissions = rolePermissions[defaultRole] || [];

            // Determine province access - use existing or default to empty array
            const defaultProvinceIds = data.provinceId ? [data.provinceId] : [];

            pendingUsers.push({
              ...data,
              uid: docSnap.id,
              email: data.email,
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
              role: data.role || ROLES.PENDING,
              selectedRole: defaultRole,
              selectedPermissions: defaultPermissions,
              selectedProvinceIds: defaultProvinceIds,
              type: data.type,
              branchId: data.branchId,
              departmentId: data.departmentId,
              provinceId: data.provinceId,
              firstName: data.firstName,
              lastName: data.lastName,
              photoURL: data.photoURL
            });
          }
          pendingUsers.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
          setUsers(pendingUsers);
          setLoading(false);
        } catch (e) {
          message.error(t('errors.fetchUsers'));
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [t, rolePermissions, userProfile?.role, userProfile?.province]);

  // Handle role change and update corresponding permissions
  const handleRoleChange = (uid: string, role: string) => {
    const defaultPermissions = rolePermissions[role] || [];
    setUsers(prev =>
      prev.map(user =>
        user.uid === uid
          ? {
              ...user,
              selectedRole: role as RoleType,
              selectedPermissions: defaultPermissions
            }
          : user
      )
    );
  };

  // Open the edit modal for a user
  const openEditModal = (user: PendingUser) => {
    setCurrentUser(user);
    setEditModalVisible(true);
  };

  // Save changes from the modal back to the users state
  const handleEditSave = (editedUser: EditableUser) => {
    setUsers(prev => prev.map(user => (user.uid === editedUser.uid ? { ...user, ...editedUser } : user)));

    setEditModalVisible(false);
    setCurrentUser(null);
  };

  // Function to update a specific user in the state
  const updateUserInState = (updatedUser: PendingUser) => {
    setUsers(prev => prev.map(user => (user.uid === updatedUser.uid ? updatedUser : user)));
  };

  const approveUser = async (uid: string, userData: PendingUser) => {
    // Check permissions first
    if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT)) {
      console.error('User lacks USER_ROLE_EDIT permission');
      message.error(t('errors.insufficientPermissions'));
      return;
    }

    modal.confirm({
      title: t('confirm.approveTitle'),
      content: (
        <div>
          <p>
            {t('confirm.approveContent', {
              user: userData.displayName || userData.email,
              role: userData.selectedRole
            })}
          </p>
          <p>{t('confirm.approveWarning')}</p>
        </div>
      ),
      okText: t('buttons.approve', 'Approve'),
      okType: 'primary',
      cancelText: t('common.cancel', 'Cancel'),
      onOk: async () => {
        setProcessingUsers(prev => ({ ...prev, [uid]: true }));
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
              permissions: {
                ...(userDataSnap.permissions || {}),
                granted: true,
                approvedBy: USER?.uid,
                approvedAt: new Date().toISOString(),
                permissionList: userData.selectedPermissions || rolePermissions[selectedRole] || []
              },
              // Update province access - critical for multi-province architecture
              provinces: userData.selectedProvinceIds || [],
              // Always include provinceId for backward compatibility
              provinceId: userData.selectedProvinceIds?.[0] || userDataSnap.provinceId || null
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
                imageUrl: undefined
              },
              { userIds: [uid], sendPush: true }
            );

            // Send notification to appropriate admins based on province
            await notificationController.sendNotification({
              title: t('notifications.adminTitle'),
              description: t('notifications.adminDescription', {
                user: userDataSnap.displayName || userDataSnap.email,
                role: selectedRole
              }),
              type: NotificationType.INFO,
              targetRoles: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER],
              // For PROVINCE_ADMIN and PROVINCE_MANAGER, restrict to the user's province
              provinceId: userData.provinceId || userData.selectedProvinceIds?.[0],
              link: '/review-users'
            });

            message.success(t('success.approved', { role: selectedRole }));
          }
        } catch (e: any) {
          message.error(t('errors.approveUser', { error: e?.message || t('errors.unknown') }));
        }
        setProcessingUsers(prev => ({ ...prev, [uid]: false }));
      }
    });
  };

  const rejectUser = async (uid: string) => {
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
        setProcessingUsers(prev => ({ ...prev, [uid]: true }));
        try {
          const userRef = doc(firestore, 'users', uid);
          const userSnap = await getDoc(userRef);
          const userDataSnap = userSnap.data();
          await updateDoc(userRef, {
            role: ROLES.PENDING,
            permissions: { granted: false, rejected: true, rejectedBy: USER?.uid, rejectedAt: new Date().toISOString() }
          });
          // Send notification to the rejected user
          await notificationController.sendNotification(
            {
              title: t('notifications.userRejectedTitle'),
              description: t('notifications.userRejectedDescription'),
              type: NotificationType.ERROR,
              link: '/pending',
              imageUrl: undefined
            },
            { userIds: [uid], sendPush: true }
          );
          // Send notification to admins about rejected user
          await notificationController.sendNotification({
            title: t('notifications.adminRejectedTitle'),
            description: t('notifications.adminRejectedDescription', {
              user: userDataSnap ? userDataSnap.displayName || userDataSnap.email : ''
            }),
            type: NotificationType.WARNING,
            // Only include roles that should receive all notifications (regardless of province)
            targetRoles: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER],
            // For PROVINCE_ADMIN and PROVINCE_MANAGER, restrict to the user's province
            provinceId: userDataSnap?.provinceId || userDataSnap?.selectedProvinceIds?.[0],
            link: '/review-users'
          });
          message.success(t('success.rejected'));
        } catch {
          message.error(t('errors.rejectUser'));
        }
        setProcessingUsers(prev => ({ ...prev, [uid]: false }));
      }
    });
  };

  // Responsive columns configuration
  const getColumns = (): ColumnsType<PendingUser> => {
    const baseColumns: ColumnsType<PendingUser> = [
      {
        title: t('columns.name'),
        dataIndex: 'displayName',
        key: 'displayName',
        width: 220,
        className: styles.nameColumn,
        render: (text: string, record: PendingUser) => {
          const userName = text
            ? text
            : record.firstName || record.lastName
              ? `${record.firstName || ''} ${record.lastName || ''}`.trim()
              : record.email || t('unnamed');

          return (
            <div className='flex items-center space-x-3'>
              <Avatar icon={<UserOutlined />} src={record.photoURL} />
              <div>
                <Text strong className='block leading-tight'>
                  {userName}
                </Text>
              </div>
            </div>
          );
        }
      },
      {
        title: t('columns.email'),
        dataIndex: 'email',
        key: 'email',
        width: 220,
        responsive: ['md'],
        className: styles.emailColumn,
        render: (email: string) => (
          <div className='flex items-center space-x-2'>
            <MailOutlined className='text-gray-400' />
            <Text ellipsis>{email}</Text>
          </div>
        )
      },
      {
        title: t('columns.requestedDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        responsive: ['lg'],
        className: styles.dateColumn,
        render: (date: Date) => (
          <div style={{ justifyContent: 'center' }} className='flex items-center space-x-2'>
            <CalendarOutlined className='text-gray-400' />
            <Text>{date ? date.toLocaleDateString() : t('unknown')}</Text>
          </div>
        )
      },
      {
        title: t('columns.role'),
        key: 'role',
        width: 170,
        className: styles.roleColumn,
        render: (_: any, record: PendingUser) => (
          <Select
            value={record.selectedRole}
            style={{ width: '100%' }}
            size={isMobile ? 'small' : 'middle'}
            onChange={value => handleRoleChange(record.uid, value)}
            dropdownMatchSelectWidth={false}
            className={styles.roleSelector}
            listHeight={320}
          >
            {availableRoles.map(role => (
              <Option key={role.value} value={role.value}>
                {t(role.label) || role.value}
              </Option>
            ))}
          </Select>
        )
      },
      {
        title: t('columns.permissions'),
        key: 'permissions',
        responsive: ['lg'],
        width: 180,
        className: styles.permissionsColumn,
        render: (_, record: PendingUser) => (
          <div className={styles.permissionsContainer}>
            {renderPermissionSummary(record.selectedPermissions)}
            <div className={styles.actionButtonContainer}>
              <Button
                type='text'
                icon={<SettingOutlined />}
                size='small'
                onClick={() => openEditModal(record)}
                title={t('buttons.configurePage')}
                className={styles.actionButton}
              />
            </div>
          </div>
        )
      },
      {
        title: t('columns.provinces'),
        key: 'provinces',
        responsive: ['lg'],
        width: 180,
        className: styles.provincesColumn,
        render: (_, record: PendingUser) => (
          <div className={styles.permissionsContainer}>
            {renderProvinceTags(record.selectedProvinceIds)}
            <div className={styles.actionButtonContainer}>
              <Button
                type='text'
                icon={<EditOutlined />}
                size='small'
                onClick={() => openEditModal(record)}
                title={t('buttons.configureProvinces')}
                className={styles.actionButton}
              />
            </div>
          </div>
        )
      },
      {
        title: t('columns.actions'),
        key: 'actions',
        ...(!isMobile ? { fixed: 'right' } : {}),
        width: 216,
        className: styles.actionsColumn,
        render: (_: any, record: PendingUser) => (
          <div className={`flex space-x-3`}>
            <Button
              type='primary'
              icon={<CheckCircleOutlined />}
              onClick={() => approveUser(record.uid, record)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid]}
              size={isMobile ? 'small' : 'middle'}
              className='approve-button flex items-center shadow-sm hover:shadow transition-all'
            >
              {!isMobile && <span className='ml-1'>{t('buttons.approve', 'Approve')}</span>}
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => rejectUser(record.uid)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid]}
              size={isMobile ? 'small' : 'middle'}
              className='reject-button flex items-center shadow-sm hover:shadow transition-all'
            >
              {!isMobile && <span className='ml-1'>{t('buttons.reject', 'Reject')}</span>}
            </Button>
          </div>
        )
      }
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
      return baseColumns.map(col => {
        if (col.key === 'email') {
          return {
            ...col,
            responsive: undefined // Remove responsive property
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
        expandedRowRender: (record: PendingUser) => (
          <Card size='small' bordered={false} className='bg-gray-50 dark:bg-gray-800 mb-2'>
            <div className='space-y-3 py-1'>
              <div className='flex items-start'>
                <MailOutlined className='text-gray-400 mt-1 mr-2' />
                <div>
                  <Text type='secondary' className='block text-xs'>
                    {t('columns.email')}
                  </Text>
                  <Text strong>{record.email}</Text>
                </div>
              </div>

              <div className='flex items-start'>
                <CalendarOutlined className='text-gray-400 mt-1 mr-2' />
                <div>
                  <Text type='secondary' className='block text-xs'>
                    {t('columns.requestedDate')}
                  </Text>
                  <Text>{record.createdAt ? record.createdAt.toLocaleDateString() : t('unknown')}</Text>
                </div>
              </div>

              {record.provinceId && (
                <div className='flex items-start'>
                  <div className='text-gray-400 mt-1 mr-2'>🏢</div>
                  <div>
                    <Text type='secondary' className='block text-xs'>
                      {t('columns.province')}
                    </Text>
                    <Text>{availableProvinces.find(p => p.id === record.provinceId)?.name || record.provinceId}</Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ),
        expandIcon: ({
          expanded,
          onExpand,
          record
        }: {
          expanded: boolean;
          onExpand: (record: PendingUser, e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
          record: PendingUser;
        }) =>
          expanded ? (
            <Button
              type='text'
              onClick={e => onExpand(record, e)}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M18 15l-6-6-6 6' />
                </svg>
              }
              size='small'
            />
          ) : (
            <Button
              type='text'
              onClick={e => onExpand(record, e)}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M6 9l6 6 6-6' />
                </svg>
              }
              size='small'
            />
          )
      }
    : undefined;

  // Render province tags for display
  const renderProvinceTags = (provinceIds: string[]) => {
    if (!provinceIds || provinceIds.length === 0) {
      return (
        <Text type='secondary' italic>
          {t('noProvinces', 'No provinces assigned')}
        </Text>
      );
    }

    return (
      <div className='flex flex-wrap gap-1'>
        {provinceIds.map(provinceId => {
          const province = availableProvinces.find(p => p.id === provinceId);
          return (
            <Tag key={provinceId} color='blue' className='flex items-center rounded-full px-3 py-1'>
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
  const renderPermissionSummary = (permissions: string[]): JSX.Element => {
    if (!permissions || permissions.length === 0) {
      return (
        <Text type='secondary' italic>
          {t('noPermissions', 'No permissions')}
        </Text>
      );
    }

    return (
      <div className='flex items-center'>
        <Tag color='green' className={`rounded-full ${styles.permissionsTag}`}>
          {t('permissionCount', { count: permissions.length })}
        </Tag>
      </div>
    );
  };

  return (
    <div className={styles.userReviewContainer}>
      <Card className={styles.headerCard}>
        <div
          className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-${isMobile ? 'start' : 'center'}`}
        >
          <div>
            <Title level={isMobile ? 3 : 2} className={`mb-1`} style={{ color: theme === 'dark' ? 'white' : 'black' }}>
              {t('title')}
            </Title>
            <Paragraph>{t('subtitle', 'Review and approve user registration requests')}</Paragraph>
          </div>
          <Tooltip title={t('tooltip')}>
            <Button type='text' icon={<QuestionCircleOutlined className='text-xl' />} />
          </Tooltip>
        </div>
      </Card>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Spin size={isMobile ? 'default' : 'large'} tip={t('loading')} />
        </div>
      ) : users.length > 0 ? (
        <Card className={styles.tableCard}>
          <Table
            dataSource={users}
            columns={getColumns()}
            rowKey='uid'
            expandable={expandableConfig}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              pageSizeOptions: isMobile ? ['5', '10'] : ['5', '10', '20'],
              size: isMobile ? 'small' : 'default',
              position: ['bottomCenter'],
              className: 'mt-4'
            }}
            size={isMobile ? 'small' : 'middle'}
            scroll={{ x: isMobile ? 800 : 1200 }}
            rowClassName='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
            className={styles.userTable}
          />
        </Card>
      ) : (
        <Card className={`${styles.tableCard} ${styles.emptyState}`}>
          <Empty
            description={<Text className='text-gray-500'>{t('empty', 'No pending user requests')}</Text>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Use the shared UserRoleEditor component */}
      <UserRoleEditor
        visible={editModalVisible}
        user={currentUser}
        availableRoles={availableRoles}
        availableProvinces={availableProvinces}
        rolePermissions={rolePermissions}
        onCancel={() => setEditModalVisible(false)}
        onSave={handleEditSave}
        isSaving={false}
        allPermissions={allPermissions}
        modalTitle={t('editModal.title')}
        namespace="userReview"
      />
    </div>
  );
};

export default UserReview;
