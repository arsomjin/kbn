/**
 * Hierarchical Dashboard Switcher - Collapsible Version
 * Allows higher-level users to view lower-level dashboards
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Badge,
  Divider,
} from 'antd';
import {
  BankOutlined,
  ShopOutlined,
  UserOutlined,
  GlobalOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { Title, Text } = Typography;

const HierarchicalDashboardSwitcher = ({
  currentUserRole,
  onDashboardSwitch,
  currentViewingRole,
  onResetToOriginal,
}) => {
  const {
    isSuperAdmin,
    isExecutive,
    hasProvinceAccess,
    hasBranchAccessOnly,
    accessibleProvinces,
    accessibleBranches,
    userProvinces,
    userBranches,
  } = usePermissions();

  const provinces = useSelector((state) => state.provinces?.provinces || []);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [availableBranches, setAvailableBranches] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get branches for selected province
  useEffect(() => {
    if (selectedProvince) {
      let provinceBranches = [];

      // For executives and super admins, get all branches from the selected province
      if (isExecutive || isSuperAdmin) {
        // If we have branches data, filter by province
        if (accessibleBranches && accessibleBranches.length > 0) {
          provinceBranches = accessibleBranches.filter(
            (branch) =>
              branch.provinceId === selectedProvince ||
              branch.provinceName === selectedProvince ||
              branch.province === selectedProvince
          );
        } else {
          // If no accessible branches, try to get from provinces data
          const allProvinces = getAllProvinces();
          const selectedProvinceData = allProvinces.find(
            (p) => (p.key || p.id) === selectedProvince
          );
          if (selectedProvinceData && selectedProvinceData.branches) {
            provinceBranches = selectedProvinceData.branches.map((branch) => ({
              branchCode: branch.code || branch.branchCode,
              branchName: branch.name || branch.branchName,
              provinceId: selectedProvince,
              ...branch,
            }));
          }
        }
      } else {
        // For other roles, use the filtered accessible branches
        provinceBranches = accessibleBranches.filter(
          (branch) =>
            branch.provinceId === selectedProvince ||
            branch.provinceName === selectedProvince
        );
      }

      setAvailableBranches(provinceBranches);
      setSelectedBranch(''); // Reset branch selection
    } else {
      // No province selected - show all accessible branches
      setAvailableBranches(accessibleBranches);
    }
  }, [selectedProvince, accessibleBranches, isExecutive, isSuperAdmin]);

  // Get all provinces for executives and super admins (they should see all)
  const getAllProvinces = () => {
    if (!provinces) return [];

    if (typeof provinces === 'object' && !Array.isArray(provinces)) {
      // Convert object to array format
      const result = Object.keys(provinces).map((key) => {
        const province = provinces[key];
        return {
          key: key,
          id: key,
          name: province.name || province.provinceName || key,
          nameEn: province.nameEn || province.englishName,
          code: province.code,
          region: province.region,
          ...province,
        };
      });
      return result;
    }

    if (Array.isArray(provinces)) {
      const result = provinces.map((province) => ({
        key: province.key || province.id || province.provinceId,
        id: province.id || province.key || province.provinceId,
        name: province.name || province.provinceName || province.key,
        nameEn: province.nameEn || province.englishName,
        code: province.code,
        region: province.region,
        ...province,
      }));
      return result;
    }

    return [];
  };

  // Get provinces to display - executives and super admins get all provinces
  const getProvincesToDisplay = () => {
    if (isExecutive || isSuperAdmin) {
      const allProvinces = getAllProvinces();
      return allProvinces;
    }
    return accessibleProvinces;
  };

  // Handle context changes - update dashboard when province/branch/role changes
  useEffect(() => {
    if (currentViewingRole && onDashboardSwitch) {
      const switchData = {
        role: currentViewingRole,
        province: selectedProvince,
        branch: selectedBranch,
        timestamp: new Date().toISOString(),
      };
      onDashboardSwitch(switchData);
    }
  }, [selectedProvince, selectedBranch, currentViewingRole]); // Removed onDashboardSwitch from deps to prevent infinite loops

  // Check if user should see this feature (exclude staff-only roles)
  const shouldShowSwitcher = () => {
    // Staff roles should not see the switcher
    const isStaffOnly =
      !isSuperAdmin &&
      !isExecutive &&
      !hasProvinceAccess &&
      !hasBranchAccessOnly;
    return !isStaffOnly;
  };

  // Don't render anything for staff roles
  if (!shouldShowSwitcher()) {
    return null;
  }

  // Define role hierarchy - what roles can this user view
  const getAvailableRoles = () => {
    const roles = [];

    if (isExecutive || isSuperAdmin) {
      // Executive and Super Admin can view all roles
      roles.push(
        {
          key: 'EXECUTIVE',
          name: 'ระดับผู้บริหาร',
          icon: <GlobalOutlined />,
          level: 1,
        },
        {
          key: 'PROVINCE_MANAGER',
          name: 'ผู้จัดการระดับจังหวัด',
          icon: <BankOutlined />,
          level: 2,
        },
        {
          key: 'BRANCH_MANAGER',
          name: 'ผู้จัดการสาขา',
          icon: <ShopOutlined />,
          level: 3,
        },
        { key: 'STAFF', name: 'เจ้าหน้าที่', icon: <UserOutlined />, level: 4 }
      );
    } else if (hasProvinceAccess) {
      // Province Manager can view branch and staff roles
      roles.push(
        {
          key: 'PROVINCE_MANAGER',
          name: 'ผู้จัดการระดับจังหวัด',
          icon: <BankOutlined />,
          level: 2,
        },
        {
          key: 'BRANCH_MANAGER',
          name: 'ผู้จัดการสาขา',
          icon: <ShopOutlined />,
          level: 3,
        },
        { key: 'STAFF', name: 'เจ้าหน้าที่', icon: <UserOutlined />, level: 4 }
      );
    } else if (hasBranchAccessOnly) {
      // Branch Manager can view staff roles only
      roles.push(
        {
          key: 'BRANCH_MANAGER',
          name: 'ผู้จัดการสาขา',
          icon: <ShopOutlined />,
          level: 3,
        },
        { key: 'STAFF', name: 'เจ้าหน้าที่', icon: <UserOutlined />, level: 4 }
      );
    }

    return roles;
  };

  const handleRoleSwitch = (roleKey) => {
    const switchData = {
      role: roleKey,
      province: selectedProvince,
      branch: selectedBranch,
      timestamp: new Date().toISOString(),
    };

    onDashboardSwitch(switchData);
  };

  const handleResetView = () => {
    setSelectedProvince('');
    setSelectedBranch('');
    onResetToOriginal();
  };

  const availableRoles = getAvailableRoles();
  const currentRoleName =
    availableRoles.find((r) => r.key === currentUserRole)?.name || 'ไม่ทราบ';
  const viewingRoleName =
    availableRoles.find((r) => r.key === currentViewingRole)?.name ||
    currentRoleName;

  // Compact header when collapsed
  const renderCompactHeader = () => (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
        border: '1px solid #e6f7ff',
        transition: 'all 0.3s ease',
        marginBottom: '16px',
      }}
      className='hierarchical-switcher-compact'
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <EyeOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
        <div>
          <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
            มุมมองแดชบอร์ด
          </Text>
          {currentViewingRole !== currentUserRole && (
            <div style={{ marginTop: '2px' }}>
              <Badge
                status='processing'
                text={
                  <Text style={{ fontSize: '11px', color: '#666' }}>
                    กำลังดูในมุมมอง: {viewingRoleName}
                  </Text>
                }
              />
            </div>
          )}
          {currentViewingRole === currentUserRole && (
            <div style={{ marginTop: '2px' }}>
              <Text type='secondary' style={{ fontSize: '11px' }}>
                คลิกเพื่อเปลี่ยนมุมมอง
              </Text>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {currentViewingRole !== currentUserRole && (
          <Button
            size='small'
            type='text'
            icon={<ArrowLeftOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleResetView();
            }}
            style={{ fontSize: '10px', padding: '2px 6px' }}
          >
            รีเซ็ต
          </Button>
        )}
        {isExpanded ? (
          <DownOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
        ) : (
          <RightOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
        )}
      </div>
    </div>
  );

  // Full expanded content
  const renderExpandedContent = () => (
    <Card
      className='hierarchical-switcher-card'
      style={{
        marginBottom: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
        border: '1px solid #e6f7ff',
      }}
    >
      {/* Header with collapse button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EyeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <div>
            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
              เปลี่ยนมุมมองแดชบอร์ด
            </Title>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              ดูระบบในมุมมองของบทบาทต่างๆ
            </Text>
          </div>
        </div>

        <Button
          size='small'
          type='text'
          icon={<DownOutlined />}
          onClick={() => setIsExpanded(false)}
          style={{ fontSize: '12px' }}
        >
          ซ่อน
        </Button>
      </div>

      <Row gutter={[16, 16]} align='middle'>
        {/* Current Role Display */}
        <Col xs={24} sm={8} md={6}>
          <div>
            <Text strong style={{ fontSize: '11px', color: '#666' }}>
              บทบาทปัจจุบัน:
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Badge
                color='#52c41a'
                text={
                  <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {currentRoleName}
                  </Text>
                }
              />
            </div>
          </div>
        </Col>

        {/* Role Selector */}
        <Col xs={24} sm={8} md={6}>
          <div>
            <Text strong style={{ fontSize: '11px', color: '#666' }}>
              ดูในมุมมอง:
            </Text>
            <Select
              placeholder='เลือกระดับ'
              style={{ width: '100%', marginTop: '4px' }}
              size='small'
              value={currentViewingRole}
              onChange={handleRoleSwitch}
              optionLabelProp='label'
            >
              {availableRoles.map((role) => (
                <Option key={role.key} value={role.key} label={role.name}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {role.icon}
                    <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {role.name}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Province Selector - Only show if user has multi-province access */}
        {(isExecutive || isSuperAdmin || userProvinces?.length > 1) && (
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ fontSize: '11px', color: '#666' }}>
                จังหวัด:
              </Text>
              <Select
                placeholder='เลือกจังหวัด'
                style={{ width: '100%', marginTop: '4px' }}
                size='small'
                value={selectedProvince}
                onChange={setSelectedProvince}
                allowClear
              >
                {getProvincesToDisplay().map((province) => {
                  return (
                    <Option
                      key={province.key || province.id}
                      value={province.key || province.id}
                    >
                      <span style={{ fontSize: '12px' }}>{province.name}</span>
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>
        )}

        {/* Branch Selector - Only show if viewing branch level or below */}
        {(currentViewingRole === 'BRANCH_MANAGER' ||
          currentViewingRole === 'STAFF') &&
          availableBranches.length > 0 && (
            <Col xs={24} sm={8} md={6}>
              <div>
                <Text strong style={{ fontSize: '11px', color: '#666' }}>
                  สาขา:
                </Text>
                <Select
                  placeholder='เลือกสาขา'
                  style={{ width: '100%', marginTop: '4px' }}
                  size='small'
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  allowClear
                >
                  {availableBranches.map((branch) => (
                    <Option
                      key={branch.branchCode || branch.id}
                      value={branch.branchCode || branch.id}
                    >
                      <span style={{ fontSize: '12px' }}>
                        {branch.branchName} ({branch.branchCode})
                      </span>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          )}
      </Row>

      {/* Reset Button */}
      {currentViewingRole !== currentUserRole && (
        <div style={{ marginTop: '16px' }}>
          <Divider style={{ margin: '8px 0' }} />
          <Button
            size='small'
            icon={<ArrowLeftOutlined />}
            onClick={handleResetView}
            style={{ fontSize: '11px' }}
          >
            กลับสู่มุมมองเดิม
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className='hierarchical-dashboard-switcher'>
      {isExpanded ? renderExpandedContent() : renderCompactHeader()}
    </div>
  );
};

HierarchicalDashboardSwitcher.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  onDashboardSwitch: PropTypes.func.isRequired,
  currentViewingRole: PropTypes.string,
  onResetToOriginal: PropTypes.func.isRequired,
};

HierarchicalDashboardSwitcher.defaultProps = {
  currentViewingRole: null,
};

export default HierarchicalDashboardSwitcher;
