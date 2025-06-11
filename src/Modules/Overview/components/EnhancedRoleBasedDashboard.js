/**
 * Enhanced Role-Based Dashboard with Hierarchical Switching
 * Allows higher-level users to view lower-level dashboards
 */

import React, { useState, useEffect } from 'react';
import { Alert, Spin, Button } from 'antd';

// Dashboard Components
import {
  SuperAdminDashboard,
  ProvinceManagerDashboard,
  BranchManagerDashboard,
  StaffDashboard,
  ExecutiveDashboard
} from './RoleDashboards';
import HierarchicalDashboardSwitcher from 'components/HierarchicalDashboardSwitcher';

// RBAC Hooks
import { usePermissions } from 'hooks/usePermissions';

const EnhancedRoleBasedDashboard = () => {
  const {
    userRole,
    hasPermission,
    isSuperAdmin,
    isExecutive,
    hasProvinceAccess,
    hasBranchAccessOnly,
    isLoading
  } = usePermissions();

  const [currentViewingRole, setCurrentViewingRole] = useState(null);
  const [viewingContext, setViewingContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Initialize viewing role to user's actual role
  useEffect(() => {
    if (userRole && !currentViewingRole) {
      console.log('✅ Setting currentViewingRole to:', userRole);
      setCurrentViewingRole(userRole);
    }
  }, [userRole, currentViewingRole]);

  // Timeout mechanism for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!userRole) {
        setLoadingTimeout(true);
        console.warn('⚠️ Loading timeout reached, userRole still null');
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [userRole]);

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

  // Determine which dashboard component to render using Clean Slate RBAC
  const getDashboardComponent = () => {
    const roleToRender = currentViewingRole || userRole;

    // Clean Slate RBAC approach - use authority levels instead of specific roles
    
    // Admin level (replaces SUPER_ADMIN, EXECUTIVE)
    if (roleToRender === 'ADMIN' || roleToRender === 'SUPER_ADMIN' || isExecutive) {
      return isExecutive 
        ? <ExecutiveDashboard viewingContext={viewingContext} />
        : <SuperAdminDashboard viewingContext={viewingContext} />;
    }

    // Manager level (replaces PROVINCE_MANAGER, BRANCH_MANAGER)
    if (roleToRender === 'MANAGER' || roleToRender === 'PROVINCE_MANAGER') {
      return <ProvinceManagerDashboard viewingContext={viewingContext} />;
    }
    
    if (roleToRender === 'BRANCH_MANAGER') {
      return <BranchManagerDashboard viewingContext={viewingContext} />;
    }

    // Staff level (replaces specific *_STAFF roles)
    if (roleToRender === 'STAFF' || 
        roleToRender === 'LEAD' ||
        roleToRender?.includes('_STAFF')) {
      return <StaffDashboard viewingContext={viewingContext} />;
    }

    // Fallback based on permissions instead of hard-coded roles
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
  };

  // Check if user can switch dashboards (not staff level)
  const canSwitchDashboards = () => {
    return isSuperAdmin || isExecutive || hasProvinceAccess || hasBranchAccessOnly;
  };

  // Force fallback role creation if timeout
  const handleForceLoadDashboard = () => {
    console.log('🔧 Forcing dashboard load with fallback role');
    setCurrentViewingRole('STAFF');
    setLoadingTimeout(false);
  };

  if (!userRole) {
    if (loadingTimeout) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Alert
            message="การโหลดใช้เวลานานเกินไป"
            description="ระบบไม่สามารถระบุบทบาทผู้ใช้ได้ กรุณาลองรีเฟรชหน้าหรือติดต่อผู้ดูแลระบบ"
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Button type="primary" onClick={handleForceLoadDashboard}>
            เข้าสู่ระบบในฐานะเจ้าหน้าที่
          </Button>
          <br />
          <Button 
            type="default" 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '8px' }}
          >
            รีเฟรชหน้า
          </Button>
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>กำลังโหลดข้อมูลบทบาทผู้ใช้...</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          หากการโหลดใช้เวลานาน กรุณารอสักครู่...
        </p>
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

// Helper function to get role display name in Thai (Clean Slate RBAC)
const getRoleDisplayName = (role) => {
  const roleNames = {
    // Clean Slate roles
    'ADMIN': 'ผู้ดูแลระบบ',
    'MANAGER': 'ผู้จัดการ',
    'LEAD': 'หัวหน้าแผนก',
    'STAFF': 'เจ้าหน้าที่',
    
    // Legacy roles (deprecated but supported for transition)
    'EXECUTIVE': 'ผู้บริหารระดับสูง (เลิกใช้แล้ว)',
    'SUPER_ADMIN': 'ผู้ดูแลระบบ (เลิกใช้แล้ว)',
    'PROVINCE_MANAGER': 'ผู้จัดการระดับจังหวัด (เลิกใช้แล้ว)',
    'BRANCH_MANAGER': 'ผู้จัดการสาขา (เลิกใช้แล้ว)',
    'ACCOUNTING_STAFF': 'เจ้าหน้าที่บัญชี (เลิกใช้แล้ว)',
    'SALES_STAFF': 'เจ้าหน้าที่ขาย (เลิกใช้แล้ว)',
    'SERVICE_STAFF': 'เจ้าหน้าที่บริการ (เลิกใช้แล้ว)',
    'INVENTORY_STAFF': 'เจ้าหน้าที่คลังสินค้า (เลิกใช้แล้ว)'
  };
  return roleNames[role] || role;
};

export default EnhancedRoleBasedDashboard; 