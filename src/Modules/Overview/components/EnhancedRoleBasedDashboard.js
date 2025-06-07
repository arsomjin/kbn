/**
 * Enhanced Role-Based Dashboard with Hierarchical Switching
 * Allows higher-level users to view lower-level dashboards
 */

import React, { useState, useEffect } from 'react';
import { Alert, Spin } from 'antd';
import { usePermissions } from 'hooks/usePermissions';
import HierarchicalDashboardSwitcher from 'components/HierarchicalDashboardSwitcher';
import {
  SuperAdminDashboard,
  ExecutiveDashboard,
  ProvinceManagerDashboard,
  BranchManagerDashboard,
  StaffDashboard
} from './RoleDashboards';

const EnhancedRoleBasedDashboard = () => {
  const { 
    userRole, 
    isSuperAdmin, 
    isExecutive,
    hasProvinceAccess, 
    hasBranchAccessOnly
  } = usePermissions();

  const [currentViewingRole, setCurrentViewingRole] = useState(null);
  const [viewingContext, setViewingContext] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize viewing role to user's actual role
  useEffect(() => {
    if (userRole && !currentViewingRole) {
      setCurrentViewingRole(userRole);
    }
  }, [userRole, currentViewingRole]);

  // Handle dashboard switching
  const handleDashboardSwitch = async (switchData) => {
    setLoading(true);
    
    try {
      // Set viewing context with selected filters
      setViewingContext({
        ...switchData,
        originalRole: userRole,
        isViewingAsOther: switchData.role !== userRole
      });
      
      setCurrentViewingRole(switchData.role);
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error switching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to original role
  const handleResetToOriginal = () => {
    setCurrentViewingRole(userRole);
    setViewingContext(null);
  };

  // Determine which dashboard component to render
  const getDashboardComponent = () => {
    const roleToRender = currentViewingRole || userRole;

    switch (roleToRender) {
      case 'EXECUTIVE':
        return <ExecutiveDashboard viewingContext={viewingContext} />;
      
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard viewingContext={viewingContext} />;
      
      case 'PROVINCE_MANAGER':
        return <ProvinceManagerDashboard viewingContext={viewingContext} />;
      
      case 'BRANCH_MANAGER':
        return <BranchManagerDashboard viewingContext={viewingContext} />;
      
      case 'STAFF':
      case 'ACCOUNTING_STAFF':
      case 'SALES_STAFF':
      case 'SERVICE_STAFF':
      case 'INVENTORY_STAFF':
        return <StaffDashboard viewingContext={viewingContext} />;
      
      default:
        // Fallback based on permissions
        if (isExecutive) {
          return <ExecutiveDashboard viewingContext={viewingContext} />;
        } else if (isSuperAdmin) {
          return <SuperAdminDashboard viewingContext={viewingContext} />;
        } else if (hasProvinceAccess) {
          return <ProvinceManagerDashboard viewingContext={viewingContext} />;
        } else if (hasBranchAccessOnly) {
          return <BranchManagerDashboard viewingContext={viewingContext} />;
        } else {
          return <StaffDashboard viewingContext={viewingContext} />;
        }
    }
  };

  // Check if user can switch dashboards (not staff level)
  const canSwitchDashboards = () => {
    return isSuperAdmin || isExecutive || hasProvinceAccess || hasBranchAccessOnly;
  };

  if (!userRole) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>กำลังโหลดข้อมูลบทบาทผู้ใช้...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Switcher - Only show for users who can switch */}
      {canSwitchDashboards() && (
        <HierarchicalDashboardSwitcher
          currentUserRole={userRole}
          currentViewingRole={currentViewingRole}
          onDashboardSwitch={handleDashboardSwitch}
          onResetToOriginal={handleResetToOriginal}
        />
      )}

      {/* Context Alert - Show when viewing as different role */}
      {viewingContext?.isViewingAsOther && (
        <Alert
          message={`กำลังดูในมุมมอง: ${getRoleDisplayName(currentViewingRole)}`}
          description={
            <span>
              คุณกำลังดูแดชบอร์ดในมุมมองของ{getRoleDisplayName(currentViewingRole)}
              {viewingContext.province && ` จังหวัด${viewingContext.province}`}
              {viewingContext.branch && ` สาขา ${viewingContext.branch}`}
              {' '}โดยยังคงสิทธิ์การเข้าถึงระดับ{getRoleDisplayName(userRole)}
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Dashboard Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>กำลังเปลี่ยนมุมมองแดชบอร์ด...</p>
        </div>
      ) : (
        getDashboardComponent()
      )}
    </div>
  );
};

// Helper function to get role display name in Thai
const getRoleDisplayName = (role) => {
  const roleNames = {
    'EXECUTIVE': 'ผู้บริหารระดับสูง',
    'SUPER_ADMIN': 'ผู้ดูแลระบบ',
    'PROVINCE_MANAGER': 'ผู้จัดการระดับจังหวัด',
    'BRANCH_MANAGER': 'ผู้จัดการสาขา',
    'STAFF': 'เจ้าหน้าที่',
    'ACCOUNTING_STAFF': 'เจ้าหน้าที่บัญชี',
    'SALES_STAFF': 'เจ้าหน้าที่ขาย',
    'SERVICE_STAFF': 'เจ้าหน้าที่บริการ',
    'INVENTORY_STAFF': 'เจ้าหน้าที่คลังสินค้า'
  };
  return roleNames[role] || role;
};

export default EnhancedRoleBasedDashboard; 