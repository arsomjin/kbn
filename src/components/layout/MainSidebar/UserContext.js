import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Tag, Typography } from 'antd';
import { EnvironmentOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const UserContext = () => {
  const { user } = useSelector(state => state.auth);
  const { branches } = useSelector(state => state.data);
  const { provinces } = useSelector(state => state.provinces);

  // For BRANCH_MANAGER, show their specific branch and province
  // For PROVINCE_MANAGER, show their province(s)
  // For SUPER_ADMIN, show "ทั้งหมด"
  const getProvinceDisplay = () => {
    // Safety check for missing provinces data
    if (!provinces || typeof provinces !== 'object') {
      console.warn('UserContext: provinces data not loaded yet');
      return 'กำลังโหลด...';
    }

    if (user?.accessLevel === 'SUPER_ADMIN') {
      return 'ทั้งหมด';
    }
    
    if (user?.accessLevel === 'PROVINCE_MANAGER') {
      if (user?.allowedProvinces && user.allowedProvinces.length === 1) {
        const provinceData = provinces[user.allowedProvinces[0]];
        return provinceData?.provinceName || provinceData?.name || 'ไม่ระบุ';
      } else if (user?.allowedProvinces && user.allowedProvinces.length > 1) {
        return `${user.allowedProvinces.length} จังหวัด`;
      }
      // Fallback for PROVINCE_MANAGER without allowedProvinces - use first available province
      const availableProvinces = Object.keys(provinces);
      if (availableProvinces.length > 0) {
        const provinceData = provinces[availableProvinces[0]];
        return provinceData?.provinceName || provinceData?.name || 'นครราชสีมา';
      }
    }
    
    if (user?.accessLevel === 'BRANCH_MANAGER') {
      if (user?.allowedBranches && user.allowedBranches.length > 0 && branches) {
        const firstBranch = branches[user.allowedBranches[0]];
        if (firstBranch) {
          const provinceData = provinces[firstBranch.provinceId];
          return provinceData?.provinceName || provinceData?.name || 'ไม่ระบุ';
        }
      }
    }
    
    // Fallback to home province
    if (user?.homeProvince && provinces[user.homeProvince]) {
      const provinceData = provinces[user.homeProvince];
      return provinceData?.provinceName || provinceData?.name || 'ไม่ระบุ';
    }
    
    // Ultimate fallback - use the first available province or default
    const availableProvinces = Object.keys(provinces);
    if (availableProvinces.length > 0) {
      const provinceData = provinces[availableProvinces[0]];
      return provinceData?.provinceName || provinceData?.name || 'นครราชสีมา';
    }
    
    return 'นครราชสีมา'; // Default to main province
  };

  const getBranchDisplay = () => {
    // Safety check for missing branches data
    if (!branches || typeof branches !== 'object') {
      console.warn('UserContext: branches data not loaded yet');
      return 'กำลังโหลด...';
    }

    if (user?.accessLevel === 'SUPER_ADMIN') {
      return 'ทั้งหมด';
    }
    
    if (user?.accessLevel === 'PROVINCE_MANAGER') {
      return 'ทั้งหมดในจังหวัด';
    }
    
    if (user?.accessLevel === 'BRANCH_MANAGER') {
      if (user?.allowedBranches && user.allowedBranches.length === 1) {
        return branches[user.allowedBranches[0]]?.branchName || 'ไม่ระบุ';
      } else if (user?.allowedBranches && user.allowedBranches.length > 1) {
        return `${user.allowedBranches.length} สาขา`;
      }
    }
    
    // Fallback to home branch
    return user?.homeBranch && branches[user.homeBranch]?.branchName || 'ไม่ระบุ';
  };

  const provinceName = getProvinceDisplay();
  const branchName = getBranchDisplay();

  // Determine access level display
  const getAccessLevelInfo = () => {
    console.log('🔄 UserContext: user?.accessLevel', user?.accessLevel);
    switch (user?.accessLevel) {
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

  const accessLevelInfo = getAccessLevelInfo();

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
              {user?.name || user?.displayName || 'ผู้ใช้งาน'}
            </Text>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            {provinceName} • {branchName}
          </div>
        </div>
      </Card>
    );
  }

  // Full development version
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
            {user?.name || user?.displayName || 'ผู้ใช้งาน'}
          </Text>
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