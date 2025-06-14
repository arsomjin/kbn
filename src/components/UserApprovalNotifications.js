/**
 * User Approval Notifications Component
 * Real-time notifications for pending user approvals
 */

import React, { useState, useEffect } from 'react';
import { Badge, notification, Button, Dropdown, Menu, Typography, Space, Avatar } from 'antd';
import { 
  BellOutlined, 
  UserAddOutlined, 
  ExclamationCircleOutlined,
  CheckOutlined,
  EyeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { app } from '../firebase';
import { usePermissions } from '../hooks/usePermissions';
import { getBranchName, getProvinceName, getDepartmentName } from '../utils/mappings';

const { Text } = Typography;

const UserApprovalNotifications = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  const { user } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();
  const history = useHistory();

  // Check if user can see approval notifications
  const canSeeApprovals = hasPermission('users.approve') || hasPermission('users.manage');

  useEffect(() => {
    if (!canSeeApprovals) return;

    // Initial fetch
    fetchPendingRequests();

    // Set up real-time listener
    const unsubscribe = app.firestore()
      .collection('approvalRequests')
      .where('status', '==', 'pending')
      .onSnapshot(
        (snapshot) => {
          console.log('🔔 Approval requests updated:', snapshot.docs.length);
          
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt)
          }));

          // Filter by user's geographic permissions
          const filteredRequests = requests.filter(request => {
            return hasPermission('users.approve', {
              provinceId: request.targetProvince,
              branchCode: request.targetBranch
            });
          });

          setPendingRequests(filteredRequests);

          // Show notification for new requests
          if (filteredRequests.length > lastNotificationCount && lastNotificationCount > 0) {
            const newRequestsCount = filteredRequests.length - lastNotificationCount;
            // FIXED: Get the actual newest requests (they're at the beginning since ordered by createdAt DESC)
            const newestRequests = filteredRequests.slice(0, newRequestsCount);
            
            // Enhanced debug logging
            if (process.env.NODE_ENV === 'development') {
              console.log('🔔 New notification trigger:', {
                totalRequests: filteredRequests.length,
                lastCount: lastNotificationCount,
                newCount: newRequestsCount,
                newestRequests: newestRequests.map(r => ({
                  id: r.id,
                  userName: getRequestDisplayName(r),
                  createdAt: r.createdAt,
                  userData: r.userData
                }))
              });
            }
            
            showNewApprovalNotification(newRequestsCount, newestRequests);
          }

          setLastNotificationCount(filteredRequests.length);
        },
        (error) => {
          console.error('❌ Error listening to approval requests:', error);
        }
      );

    return () => unsubscribe();
  }, [canSeeApprovals, hasPermission, lastNotificationCount]);

  const fetchPendingRequests = async () => {
    if (!canSeeApprovals) return;

    setLoading(true);
    try {
      const snapshot = await app.firestore()
        .collection('approvalRequests')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      }));

      // Filter by user's geographic permissions
      const filteredRequests = requests.filter(request => {
        return hasPermission('users.approve', {
          provinceId: request.targetProvince,
          branchCode: request.targetBranch
        });
      });

      setPendingRequests(filteredRequests);
      setLastNotificationCount(filteredRequests.length);
    } catch (error) {
      console.error('❌ Error fetching pending requests:', error);
    }
    setLoading(false);
  };

  const showNewApprovalNotification = (count, newRequests) => {
    const firstRequest = newRequests[0];
    // FIXED: Use the same name resolution logic as the dropdown list
    const userName = getRequestDisplayName(firstRequest);

    // Debug log for popup notifications
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 Popup notification debug:', {
        requestId: firstRequest?.id,
        resolvedUserName: userName,
        userData: firstRequest?.userData,
        count
      });
    }

    notification.open({
      message: count === 1 ? 'มีการสมัครสมาชิกใหม่' : `มีการสมัครสมาชิกใหม่ ${count} คน`,
      description: count === 1 ? 
        `${userName} รอการอนุมัติ` : 
        `${userName} และอีก ${count - 1} คน รอการอนุมัติ`,
      icon: <UserAddOutlined style={{ color: '#faad14' }} />,
      placement: 'topRight',
      duration: 8,
      btn: (
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            history.push('/admin/user-approval');
            notification.destroy();
          }}
        >
          อนุมัติทันที
        </Button>
      ),
      style: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px'
      }
    });
  };

  const getRequestDisplayName = (request) => {
    const userData = request.userData || {};
    
    // Enhanced name resolution with multiple fallback sources
    const displayName = userData.displayName || 
                       `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                       userData.email?.split('@')[0] ||
                       request.userEmail?.split('@')[0] || // Fallback to request email
                       request.email?.split('@')[0] || // Another fallback
                       'ไม่ระบุชื่อ';
    
    // Debug log to help identify the issue
    if (process.env.NODE_ENV === 'development' && !userData.displayName && !userData.firstName) {
      console.log('🔍 Notification name debug:', {
        requestId: request.id,
        userData: userData,
        userEmail: request.userEmail,
        email: request.email,
        resolvedName: displayName
      });
    }
    
    return displayName;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'view-all') {
      history.push('/notifications');
      setVisible(false);
    } else if (key === 'mark-read') {
      // Optional: Mark notifications as read
      setVisible(false);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      {pendingRequests.length === 0 ? (
        <Menu.Item key="empty" disabled>
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#999' }}>
            <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <br />
            <Text type="secondary">ไม่มีคำขออนุมัติรอดำเนินการ</Text>
          </div>
        </Menu.Item>
      ) : (
        <>
          <Menu.ItemGroup title={`คำขออนุมัติที่รอดำเนินการ (${pendingRequests.length})`}>
            {pendingRequests.slice(0, 5).map((request) => (
              <Menu.Item 
                key={request.id}
                style={{ 
                  height: 'auto', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={() => {
                  history.push('/admin/user-approval');
                  setVisible(false);
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <Avatar 
                      size="small" 
                      icon={<UserAddOutlined />} 
                      style={{ backgroundColor: '#faad14', marginRight: 8 }}
                    />
                    <Text strong>{getRequestDisplayName(request)}</Text>
                  </div>
                  <div style={{ marginLeft: 32 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {getDepartmentName(request.userData?.department || request.userData?.access?.departments?.[0])} • {' '}
                      {getBranchName(request.targetBranch)} • {' '}
                      {getTimeAgo(request.createdAt)}
                    </Text>
                  </div>
                </div>
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
          
          {pendingRequests.length > 5 && (
            <Menu.Divider />
          )}
          
          <Menu.Item key="view-all" style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <EyeOutlined /> ดูทั้งหมด ({pendingRequests.length})
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  // Don't render if user can't see approvals
  if (!canSeeApprovals) {
    return null;
  }

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
      overlayStyle={{ 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div 
        style={{ 
          cursor: 'pointer', 
          padding: '8px',
          borderRadius: '6px',
          transition: 'all 0.3s ease',
          ':hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Badge 
          count={pendingRequests.length} 
          size="small"
          style={{ 
            backgroundColor: pendingRequests.length > 0 ? '#faad14' : '#d9d9d9'
          }}
        >
          <BellOutlined 
            style={{ 
              fontSize: 18,
              color: pendingRequests.length > 0 ? '#faad14' : '#999'
            }} 
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default UserApprovalNotifications; 