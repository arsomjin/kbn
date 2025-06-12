import React, { useEffect, useState } from 'react';
import { Card, Tag, Typography } from 'antd';
import { EnvironmentOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import { getProvinceName, getBranchName } from 'utils/mappings';

const { Text } = Typography;

const UserContext = () => {
  // Get user from Redux state directly to ensure updates
  const { user } = useSelector(state => state.auth);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Use Clean Slate RBAC hook
  const {
    userRBAC,
    isAdmin,
    isManager,
    authority,
    accessibleProvinces,
    accessibleBranches,
    homeLocation,
    departments,
    hasPermission
  } = usePermissions();

  // Force component update when user changes (for role switching)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 UserContext: User changed', user?.displayName || user?.email);
    }
    setForceUpdate(prev => prev + 1);
  }, [user?.uid, user?.role, user?.displayName, user?.email, user?._forceUpdate]);

  // Listen for manual RBAC refresh events
  useEffect(() => {
    const handleRBACRefresh = (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 UserContext: Received RBAC refresh event');
      }
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('rbac-refresh', handleRBACRefresh);
    
    return () => {
      window.removeEventListener('rbac-refresh', handleRBACRefresh);
    };
  }, []);

  // Debug logging for role switching
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserContext Debug:', {
        userRBAC: !!userRBAC,
        isAdmin,
        isManager,
        authority,
        accessibleProvincesCount: accessibleProvinces?.length || 0,
        accessibleBranchesCount: accessibleBranches?.length || 0,
        homeProvince: homeLocation?.province,
        homeBranch: homeLocation?.branch,
        userName: userRBAC?.displayName || user?.displayName,
        departments: departments?.join(', ') || 'None',
        
        // ADDITIONAL DEBUG INFO for permission troubleshooting
        hasAccountingView: userRBAC ? hasPermission('accounting.view') : 'No userRBAC',
        hasAccountingEdit: userRBAC ? hasPermission('accounting.edit') : 'No userRBAC',
        userPermissions: userRBAC?.permissions || 'No permissions object',
        rawUserAccess: user?.access || 'No access object',
        rawUserUserRBAC: user?.userRBAC || 'No userRBAC object',
        isAccountingStaff: authority === 'ACCOUNTING_STAFF' || departments?.includes('accounting'),
        isDeveloper: userRBAC?.isDev
      });
    }
  }, [userRBAC, isAdmin, isManager, authority, accessibleProvinces, accessibleBranches, homeLocation, user, departments, forceUpdate, hasPermission]);

  // Get user-friendly province display using Clean Slate RBAC
  const getProvinceDisplay = () => {
    if (!userRBAC) return 'กำลังโหลด...';
    
    // Admin sees all provinces
    if (isAdmin) {
      return 'ทั้งหมด';
    }
    
    // Home province first priority - fix the access pattern
    if (homeLocation?.province) {
      return getProvinceName(homeLocation.province) || homeLocation.province;
    }
    
    // If user has access to multiple provinces, show count
    if (accessibleProvinces.length > 1) {
      return `${accessibleProvinces.length} จังหวัด`;
    }
    
    // Single province access - fix the access pattern
    if (accessibleProvinces.length === 1) {
      return getProvinceName(accessibleProvinces[0]) || accessibleProvinces[0];
    }
    
    // Default fallback - use Nakhon Sawan for new system
    return 'นครสวรรค์';
  };

  // Get user-friendly branch display using Clean Slate RBAC
  const getBranchDisplay = () => {
    if (!userRBAC) return 'กำลังโหลด...';
    
    // Admin sees all branches
    if (isAdmin) {
      return 'ทั้งหมด';
    }
    
    // Home branch first priority - fix the access pattern
    if (homeLocation?.branch) {
      return getBranchName(homeLocation.branch) || homeLocation.branch;
    }
    
    // Manager level - show scope description
    if (isManager && authority === 'MANAGER') {
      if (accessibleBranches.length > 1) {
        return `${accessibleBranches.length} สาขา`;
      } else if (accessibleBranches.length === 1) {
        return getBranchName(accessibleBranches[0]) || accessibleBranches[0];
      }
      return 'ทั้งหมดในจังหวัด';
    }
    
    // Single branch access - fix the access pattern
    if (accessibleBranches.length === 1) {
      return getBranchName(accessibleBranches[0]) || accessibleBranches[0];
    }
    
    // Multiple branches
    if (accessibleBranches.length > 1) {
      return `${accessibleBranches.length} สาขา`;
    }
    
    return 'ไม่ระบุ';
  };

  // Map Clean Slate authority levels to display info
  const getAccessLevelInfo = () => {
    if (!userRBAC) return { label: 'ผู้ใช้งาน', color: 'default' };
    
    // Special cases
    if (userRBAC.isDev) {
      return { label: 'นักพัฒนา', color: 'purple' };
    }
    
    // Authority-based mapping
    if (isAdmin) {
      return { label: 'ผู้ดูแลระบบ', color: 'red' };
    }
    
    if (isManager && authority === 'MANAGER') {
      // Determine manager type based on scope
      if (accessibleProvinces.length > 1) {
        return { label: 'ผู้จัดการภูมิภาค', color: 'gold' };
      } else if (accessibleBranches.length > 1) {
        return { label: 'ผู้จัดการจังหวัด', color: 'purple' };
      } else {
        return { label: 'ผู้จัดการสาขา', color: 'blue' };
      }
    }
    
    // Department-based staff roles
    if (authority === 'STAFF' && departments && departments.length > 0) {
      const primaryDept = departments[0];
      switch (primaryDept.toLowerCase()) {
        case 'accounting':
          return { label: 'เจ้าหน้าที่บัญชี', color: 'green' };
        case 'sales':
          return { label: 'เจ้าหน้าที่ขาย', color: 'orange' };
        case 'service':
          return { label: 'เจ้าหน้าที่บริการ', color: 'cyan' };
        case 'inventory':
          return { label: 'เจ้าหน้าที่คลัง', color: 'geekblue' };
        case 'hr':
          return { label: 'เจ้าหน้าที่ HR', color: 'magenta' };
        case 'general':
          return { label: 'พนักงานทั่วไป', color: 'default' };
        default:
          return { label: 'พนักงาน', color: 'default' };
      }
    }
    
    // Default based on authority
    switch (authority) {
      case 'ADMIN':
        return { label: 'ผู้ดูแลระบบ', color: 'red' };
      case 'MANAGER':
        return { label: 'ผู้จัดการ', color: 'blue' };
      case 'LEAD':
        return { label: 'หัวหน้างาน', color: 'cyan' };
      case 'STAFF':
        return { label: 'พนักงาน', color: 'default' };
      default:
        return { label: 'ผู้ใช้งาน', color: 'default' };
    }
  };

  const provinceName = getProvinceDisplay();
  const branchName = getBranchDisplay();
  const accessLevelInfo = getAccessLevelInfo();
  
  // Get user name from Clean Slate or legacy format
  const userName = userRBAC?.uid 
    ? (userRBAC.name || userRBAC.displayName || user?.displayName || user?.email || 'ผู้ใช้งาน')
    : (user?.displayName || user?.email || 'ผู้ใช้งาน');

  // Simplified version for production
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return (
      <Card 
        size="small" 
        className="mb-3 mx-2" 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white'
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <div style={{ fontSize: '11px', textAlign: 'center' }}>
          <div style={{ marginBottom: '4px' }}>
            <UserOutlined className="mr-1" />
            <Text strong style={{ color: 'white', fontSize: '11px' }}>
              {userName}
            </Text>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            {provinceName} • {branchName}
          </div>
        </div>
      </Card>
    );
  }

  // Full development version with Clean Slate RBAC info
  return (
    <Card 
      size="small" 
      className="mb-3 mx-2" 
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: 'white'
      }}
      bodyStyle={{ padding: '12px' }}
    >
      <div style={{ fontSize: '12px' }}>
        {/* User Info */}
        <div className="mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
          <UserOutlined className="mr-1" />
          <Text strong style={{ color: 'white', fontSize: '12px' }}>
            {userName}
          </Text>
          {userRBAC?.isDev && (
            <Tag size="small" color="volcano" style={{ marginLeft: '4px', fontSize: '9px' }}>
              DEV
            </Tag>
          )}
        </div>

        {/* Geographic Context */}
        <div className="mb-1">
          <EnvironmentOutlined className="mr-1" />
          <Text strong style={{ color: 'white', fontSize: '11px' }}>จังหวัด:</Text>{' '}
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px' }}>
            {provinceName}
          </Text>
        </div>
        
        <div className="mb-2">
          <HomeOutlined className="mr-1" />
          <Text strong style={{ color: 'white', fontSize: '11px' }}>สาขา:</Text>{' '}
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px' }}>
            {branchName}
          </Text>
        </div>

        {/* Clean Slate RBAC Info (Development Only) */}
        {userRBAC && (
          <div className="mb-2" style={{ fontSize: '10px', opacity: 0.7 }}>
            Authority: {authority} | Depts: {departments?.join(', ') || 'None'}
          </div>
        )}

        {/* DEBUG: Permission status for accounting (Development Only) */}
        {process.env.NODE_ENV === 'development' && userRBAC && (
          <div className="mb-2" style={{ 
            fontSize: '9px', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '4px', 
            borderRadius: '4px',
            opacity: 0.8
          }}>
            <div>🔍 Acct.View: {hasPermission('accounting.view') ? '✅' : '❌'}</div>
            <div>🔍 Acct.Edit: {hasPermission('accounting.edit') ? '✅' : '❌'}</div>
            <div>🔍 HomeProvince: {homeLocation?.province || 'None'}</div>
            <div>🔍 HomeBranch: {homeLocation?.branch || 'None'}</div>
            <div>🔍 Authority: {authority || 'None'}</div>
            <div>🔍 Depts: {departments?.join(',') || 'None'}</div>
            <div>🔍 GeoScope: {userRBAC?.geographic?.scope || 'None'}</div>
            <div>🔍 IsActive: {userRBAC?.isActive ? '✅' : '❌'}</div>
          </div>
        )}

        {/* Access Level */}
        <div style={{ textAlign: 'center' }}>
          <Tag 
            color={accessLevelInfo.color} 
            size="small"
            style={{ fontSize: '10px', margin: 0 }}
          >
            {accessLevelInfo.label}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default UserContext; 