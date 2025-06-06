import React, { useState, useCallback } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import BranchSelector from './BranchSelector';
import ProvinceSelector from './ProvinceSelector';
import PropTypes from 'prop-types';

const GeographicBranchSelector = ({
  onProvinceChange,
  onBranchChange,
  provinceValue,
  branchValue,
  hasAllProvinces = false,
  hasAllBranches = false,
  provincePlaceholder = "เลือกจังหวัด",
  branchPlaceholder = "เลือกสาขา",
  showProvinceSelector = true,
  disabled = false,
  colLayout = { province: 12, branch: 12 },
  ...props
}) => {
  const { user } = useSelector(state => state.auth);
  const { branches, provinces } = useSelector(state => state.data);
  const { getAccessibleBranches, getAccessibleProvinces } = usePermissions();
  
  const [selectedProvince, setSelectedProvince] = useState(provinceValue);

  const handleProvinceChange = useCallback((value) => {
    setSelectedProvince(value);
    if (onProvinceChange) {
      onProvinceChange(value);
    }
    // Clear branch selection when province changes
    if (onBranchChange) {
      onBranchChange(null);
    }
  }, [onProvinceChange, onBranchChange]);

  const handleBranchChange = useCallback((value) => {
    if (onBranchChange) {
      onBranchChange(value);
    }
  }, [onBranchChange]);

  // Get accessible data based on user permissions
  const accessibleProvinces = getAccessibleProvinces(provinces);
  const accessibleBranches = getAccessibleBranches(branches);

  // Filter branches by selected province
  const getFilteredBranches = useCallback(() => {
    if (!selectedProvince || selectedProvince === 'all') {
      return accessibleBranches;
    }
    
    return Object.keys(accessibleBranches)
      .filter(branchCode => {
        const branch = accessibleBranches[branchCode];
        return branch.provinceCode === selectedProvince;
      })
      .reduce((acc, branchCode) => {
        acc[branchCode] = accessibleBranches[branchCode];
        return acc;
      }, {});
  }, [selectedProvince, accessibleBranches]);

  // If user has only one province access, auto-select it
  const shouldShowProvinceSelector = showProvinceSelector && 
    (user.accessLevel === 'all' || 
     (user.accessLevel === 'province' && user.allowedProvinces?.length > 1));

  return (
    <Row gutter={8} {...props}>
      {shouldShowProvinceSelector && (
        <Col span={colLayout.province}>
          <ProvinceSelector
            value={provinceValue}
            placeholder={provincePlaceholder}
            onChange={handleProvinceChange}
            hasAll={hasAllProvinces}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        </Col>
      )}
      <Col span={shouldShowProvinceSelector ? colLayout.branch : 24}>
        <BranchSelector
          value={branchValue}
          placeholder={branchPlaceholder}
          onChange={handleBranchChange}
          provinceFilter={selectedProvince !== 'all' ? selectedProvince : null}
          hasAll={hasAllBranches}
          onlyUserBranch={user.accessLevel === 'branch' ? user.homeBranch : null}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      </Col>
    </Row>
  );
};

GeographicBranchSelector.propTypes = {
  onProvinceChange: PropTypes.func,
  onBranchChange: PropTypes.func,
  provinceValue: PropTypes.string,
  branchValue: PropTypes.string,
  hasAllProvinces: PropTypes.bool,
  hasAllBranches: PropTypes.bool,
  provincePlaceholder: PropTypes.string,
  branchPlaceholder: PropTypes.string,
  showProvinceSelector: PropTypes.bool,
  disabled: PropTypes.bool,
  colLayout: PropTypes.shape({
    province: PropTypes.number,
    branch: PropTypes.number
  })
};

export default GeographicBranchSelector; 