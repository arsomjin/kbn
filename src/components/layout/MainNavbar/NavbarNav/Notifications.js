import React from 'react';
import { Space } from 'antd';
import UserApprovalNotifications from '../../../UserApprovalNotifications';
import UserPersonalNotifications from '../../../UserPersonalNotifications';
import { usePermissions } from '../../../../hooks/usePermissions';

const Notifications = () => {
  const { hasPermission } = usePermissions();

  // Check if user can see approval notifications (for admins/managers)
  const canSeeApprovals =
    hasPermission('users.approve') || hasPermission('users.manage');

  return (
    <Space size={8}>
      {/* Show EITHER approval notifications OR personal notifications to avoid double bell icons */}
      {canSeeApprovals ? (
        /* Admin/Manager: Show approval notifications (they can access personal notifications via /notifications page) */
        <UserApprovalNotifications />
      ) : (
        /* Regular Users: Show personal notifications */
        <UserPersonalNotifications />
      )}
    </Space>
  );
};

export default Notifications;
