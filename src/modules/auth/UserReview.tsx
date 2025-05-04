import React, { useEffect, useState } from 'react';
import { Table, Button, Select, Spin, Empty, Tooltip, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { collection, onSnapshot, query, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { firestore } from '../../services/firebase';
import { ROLES } from '../../constants/roles';
import { notificationController } from '../../controllers/notificationController';
import { UserProfile } from '../../services/authService';
import { NotificationType } from '../../services/notificationService';
import { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// Fallback roles in case Firestore access fails
const DEFAULT_ROLES = [
  {
    value: ROLES.USER,
    label: 'User',
    description: 'Standard user with basic access'
  },
  {
    value: ROLES.GENERAL_MANAGER,
    label: 'Manager',
    description: 'Manager with privileged access'
  },
  {
    value: ROLES.ADMIN,
    label: 'Admin',
    description: 'Admin with full access'
  }
];

interface PendingUser {
  uid: string;
  displayName?: string;
  email?: string;
  createdAt?: Date;
  selectedRole: string;
  permissions?: any;
}

const UserReview: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // Replace with your actual user selector if needed
  const USER = useSelector((state: any) => state.user?.USER);

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

  // Real-time listener for pending users
  useEffect(() => {
    setLoading(true);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef);
    const unsubscribe = onSnapshot(
      q,
      async snapshot => {
        try {
          const pendingUsers: PendingUser[] = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (data?.role === ROLES.PENDING) {
              pendingUsers.push({
                ...data,
                uid: docSnap.id,
                createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
                selectedRole: ROLES.USER
              });
            }
          }
          pendingUsers.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
          setUsers(pendingUsers);
          setLoading(false);
        } catch (e) {
          message.error(t('userReview.errors.fetchUsers'));
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [t]);

  const handleRoleChange = (uid: string, role: string) => {
    setUsers(prev => prev.map(user => (user.uid === uid ? { ...user, selectedRole: role } : user)));
  };

  const approveUser = async (uid: string, userData: PendingUser) => {
    setProcessingUsers(prev => ({ ...prev, [uid]: true }));
    try {
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userDataSnap = userSnap.data();
      if (userDataSnap) {
        const selectedRole = userData.selectedRole || ROLES.USER;
        await updateDoc(userRef, {
          role: selectedRole,
          permissions: {
            ...userDataSnap.permissions,
            granted: true,
            approvedBy: USER?.uid,
            approvedAt: new Date().toISOString()
          }
        });
        // Send notification to the approved user
        await notificationController.sendNotification(
          {
            title: t('userReview.notifications.userTitle'),
            description: t('userReview.notifications.userDescription', { role: selectedRole }),
            type: NotificationType.SUCCESS,
            link: '/dashboard',
            imageUrl: undefined
          },
          { userIds: [uid], sendPush: true }
        );
        // Send notification to admins
        await notificationController.sendNotification({
          title: t('userReview.notifications.adminTitle'),
          description: t('userReview.notifications.adminDescription', {
            user: userDataSnap.displayName || userDataSnap.email,
            role: selectedRole
          }),
          type: NotificationType.INFO,
          targetRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER],
          link: '/review-users'
        });
        message.success(t('userReview.success.approved', { role: selectedRole }));
      }
    } catch (e: any) {
      message.error(t('userReview.errors.approveUser', { error: e?.message || t('userReview.errors.unknown') }));
    }
    setProcessingUsers(prev => ({ ...prev, [uid]: false }));
  };

  const rejectUser = async (uid: string) => {
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
          title: t('userReview.notifications.userRejectedTitle'),
          description: t('userReview.notifications.userRejectedDescription'),
          type: NotificationType.ERROR,
          link: '/pending',
          imageUrl: undefined
        },
        { userIds: [uid], sendPush: true }
      );
      // Send notification to admins
      await notificationController.sendNotification({
        title: t('userReview.notifications.adminRejectedTitle'),
        description: t('userReview.notifications.adminRejectedDescription', {
          user: userDataSnap ? userDataSnap.displayName || userDataSnap.email : ''
        }),
        type: NotificationType.WARNING,
        targetRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PROVINCE_MANAGER, ROLES.GENERAL_MANAGER],
        link: '/review-users'
      });
      message.success(t('userReview.success.rejected'));
    } catch {
      message.error(t('userReview.errors.rejectUser'));
    }
    setProcessingUsers(prev => ({ ...prev, [uid]: false }));
  };

  // Responsive columns configuration
  const getColumns = (): ColumnsType<PendingUser> => {
    const baseColumns: ColumnsType<PendingUser> = [
      {
        title: t('userReview.columns.name'),
        dataIndex: 'displayName',
        key: 'displayName',
        render: (text: string, record: PendingUser) => text || record.email || t('userReview.unnamed')
      },
      {
        title: t('userReview.columns.email'),
        dataIndex: 'email',
        key: 'email',
        responsive: ['md']
      },
      {
        title: t('userReview.columns.requestedDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        responsive: ['lg'],
        render: (date: Date) => (date ? date.toLocaleDateString() : t('userReview.unknown'))
      },
      {
        title: t('userReview.columns.role'),
        key: 'role',
        render: (_: any, record: PendingUser) => (
          <Select
            value={record.selectedRole}
            style={{ width: isMobile ? 120 : 160 }}
            size={isMobile ? 'small' : 'middle'}
            onChange={value => handleRoleChange(record.uid, value)}
          >
            {availableRoles.map(role => (
              <Option key={role.value} value={role.value}>
                <Tooltip title={role.description}>{role.label || role.value}</Tooltip>
              </Option>
            ))}
          </Select>
        )
      },
      {
        title: t('userReview.columns.actions'),
        key: 'actions',
        render: (_: any, record: PendingUser) => (
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Button
              type='primary'
              icon={<CheckCircleOutlined />}
              onClick={() => approveUser(record.uid, record)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid]}
              size={isMobile ? 'small' : 'middle'}
            >
              {!isMobile && t('userReview.buttons.approve')}
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => rejectUser(record.uid)}
              loading={processingUsers[record.uid]}
              disabled={processingUsers[record.uid]}
              size={isMobile ? 'small' : 'middle'}
            >
              {!isMobile && t('userReview.buttons.reject')}
            </Button>
          </div>
        )
      }
    ];

    // For mobile, add email as expandable content
    if (isMobile) {
      return baseColumns.map(col => {
        if (col.key === 'email') {
          return {
            ...col,
            responsive: undefined  // Remove responsive property
          };
        }
        return col;
      });
    }

    return baseColumns;
  };

  // Expandable row configuration for mobile view
  const expandableConfig = isMobile ? {
    expandedRowRender: (record: PendingUser) => (
      <div>
        <p><strong>{t('userReview.columns.email')}:</strong> {record.email}</p>
        <p><strong>{t('userReview.columns.requestedDate')}:</strong> {record.createdAt ? record.createdAt.toLocaleDateString() : t('userReview.unknown')}</p>
      </div>
    ),
  } : undefined;

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-${isMobile ? 'start' : 'center'} mb-${isMobile ? '4' : '6'}`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-${isMobile ? '2' : '0'}`}>{t('userReview.title')}</h2>
        <Tooltip title={t('userReview.tooltip')}>
          <QuestionCircleOutlined className={`text-${isMobile ? 'base' : 'lg'} cursor-pointer`} />
        </Tooltip>
      </div>
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Spin size={isMobile ? 'default' : 'large'} tip={t('userReview.loading')} />
        </div>
      ) : users.length > 0 ? (
        <Table
          dataSource={users}
          columns={getColumns()}
          rowKey='uid'
          expandable={expandableConfig}
          pagination={{ 
            pageSize: isMobile ? 5 : 10, 
            showSizeChanger: !isMobile, 
            pageSizeOptions: isMobile ? ['5', '10'] : ['5', '10', '20'],
            size: isMobile ? 'small' : 'default'
          }}
          size={isMobile ? 'small' : 'middle'}
          scroll={{ x: isMobile ? 400 : 800 }}
        />
      ) : (
        <Empty description={t('userReview.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default UserReview;
