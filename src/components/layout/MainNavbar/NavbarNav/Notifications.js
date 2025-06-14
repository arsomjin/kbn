import React from 'react';
import { Space } from 'antd';
import UserApprovalNotifications from '../../../UserApprovalNotifications';
import { usePermissions } from '../../../../hooks/usePermissions';

const Notifications = () => {
  const { hasPermission } = usePermissions();

  // Check if user can see approval notifications
  const canSeeApprovals = hasPermission('users.approve') || hasPermission('users.manage');

  return (
    <Space size={8}>
      {/* Enhanced User Approval Notifications - Only show for users with approval permissions */}
      {canSeeApprovals && <UserApprovalNotifications />}
    </Space>
  );
};

export default Notifications;
