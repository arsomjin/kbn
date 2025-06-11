import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { EnvironmentOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { getProvinceName, getBranchName } from 'utils/mappings';

const { Text } = Typography;

const UserContext = () => {
  // Use the unified permissions hook for Clean Slate RBAC
  const {
    userRBAC,
    isAdmin,
    isProvinceLevel,
    isBranchLevel,
    isDepartmentLevel,
    isExecutive,
    accessibleProvinces,
    accessibleBranches,
    homeProvince,
    homeBranch
  } = usePermissions();

  // Get user-friendly province display using Clean Slate RBAC
  const getProvinceDisplay = () => {
    if (!userRBAC) return 'กำลังโหลด...';
    
    // Admin sees all provinces
    if (isAdmin) {
      return 'ทั้งหมด';
    }
    
    // Province level - show accessible provinces
    if (isProvinceLevel) {
      const provinceCount = accessibleProvinces.length;
      if (provinceCount === 1) {
        return getProvinceName(accessibleProvinces[0]?.provinceKey || accessibleProvinces[0]?.key);
      } else if (provinceCount > 1) {
        return `${provinceCount} จังหวัด`;
      }
    }
    
    // Branch level - show province of home branch
    if (isBranchLevel && homeBranch) {
      return getProvinceName(homeBranch.provinceKey || homeBranch.provinceId);
    }
    
    // Fallback to home province
    if (homeProvince) {
      return getProvinceName(homeProvince.provinceKey || homeProvince.key);
    }
    
    // Final fallback
    return accessibleProvinces.length > 0 
      ? getProvinceName(accessibleProvinces[0]?.provinceKey || accessibleProvinces[0]?.key)
      : 'นครราชสีมา';
  };

  // Get user-friendly branch display using Clean Slate RBAC
  const getBranchDisplay = () => {
    if (!userRBAC) return 'กำลังโหลด...';
    
    // Admin sees all branches
    if (isAdmin) {
      return 'ทั้งหมด';
    }
    
    // Province level sees all branches in province
    if (isProvinceLevel) {
      return 'ทั้งหมดในจังหวัด';
    }
    
    // Branch level - show accessible branches
    if (isBranchLevel) {
      const branchCount = accessibleBranches.length;
      if (branchCount === 1) {
        return getBranchName(accessibleBranches[0]?.branchCode || accessibleBranches[0]?.code);
      } else if (branchCount > 1) {
        return `${branchCount} สาขา`;
      }
    }
    
    // Fallback to home branch
    if (homeBranch) {
      return getBranchName(homeBranch.branchCode || homeBranch.code);
    }
    
    return 'ไม่ระบุ';
  };

  // Map Clean Slate authority levels to display info
  const getAccessLevelInfo = () => {
    if (!userRBAC) return { label: 'ผู้ใช้งาน', color: 'default' };
    
    // Handle Clean Slate authority levels first
    const departments = userRBAC.departments || [];
    
    // Special cases
    if (userRBAC.isDev) {
      return { label: 'นักพัฒนา', color: 'purple' };
    }
    
    if (isExecutive) {
      return { label: 'ผู้บริหาร', color: 'gold' };
    }
    
    // Authority-based mapping
    if (isAdmin) {
      return { label: 'ผู้ดูแลระบบ', color: 'red' };
    }
    
    if (isProvinceLevel) {
      return { label: 'ผู้จัดการจังหวัด', color: 'purple' };
    }
    
    if (isBranchLevel) {
      return { label: 'ผู้จัดการสาขา', color: 'blue' };
    }
    
    // Department-based staff roles
    if (isDepartmentLevel && departments.length > 0) {
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
        default:
          return { label: 'พนักงาน', color: 'default' };
      }
    }
    
    // Legacy fallback for backward compatibility
    const legacyRole = userRBAC.legacyRole || userRBAC.accessLevel;
    switch (legacyRole) {
      case 'EXECUTIVE':
      case 'Executive':
        return { label: 'ผู้บริหาร', color: 'gold' };      
      case 'SUPER_ADMIN':
        return { label: 'ผู้ดูแลสูงสุด', color: 'red' };
      case 'PROVINCE_MANAGER':
        return { label: 'ผู้จัดการจังหวัด', color: 'purple' };
      case 'BRANCH_MANAGER':
        return { label: 'ผู้จัดการสาขา', color: 'blue' };
      case 'ACCOUNTING_STAFF':
        return { label: 'เจ้าหน้าที่บัญชี', color: 'green' };
      case 'SALES_STAFF':
        return { label: 'เจ้าหน้าที่ขาย', color: 'orange' };
      case 'SERVICE_STAFF':
        return { label: 'เจ้าหน้าที่บริการ', color: 'cyan' };
      case 'INVENTORY_STAFF':
        return { label: 'เจ้าหน้าที่คลัง', color: 'geekblue' };
      default:
        return { label: 'ผู้ใช้งาน', color: 'default' };
    }
  };

  const provinceName = getProvinceDisplay();
  const branchName = getBranchDisplay();
  const accessLevelInfo = getAccessLevelInfo();
  
  // Get user name from Clean Slate or legacy format
  const userName = userRBAC?.uid 
    ? (userRBAC.name || userRBAC.displayName || 'ผู้ใช้งาน')
    : 'ผู้ใช้งาน';

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
            Authority: {userRBAC.authority} | Depts: {userRBAC.departments?.join(', ') || 'None'}
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