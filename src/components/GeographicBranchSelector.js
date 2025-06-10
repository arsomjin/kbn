/**
 * GeographicBranchSelector Component for KBN Multi-Province System
 * Branch selector with geographic filtering and province context
 */

import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';

const { Option } = Select;

/**
 * Geographic Branch Selector Component
 * @param {Object} props
 * @param {string} props.value - Selected branch value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.province - Selected province to filter branches
 * @param {boolean} props.allowClear - Allow clearing selection
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disable the selector
 * @param {string} props.size - Size of the selector
 * @param {string} props.className - CSS class name
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.showAll - Show "All Branches" option
 * @param {string} props.allText - Text for "All" option
 * @param {boolean} props.respectRBAC - Whether to filter by user permissions
 * @param {Function} props.onBranchChange - Additional callback with branch data
 * @param {boolean} props.autoSelect - Auto-select if only one option
 * @param {boolean} props.includeInactive - Include inactive branches
 * @param {boolean} props.showBranchCode - Show branch codes in options
 * @param {boolean} props.groupByProvince - Group branches by province
 */
const GeographicBranchSelector = ({
  value,
  onChange,
  province,
  allowClear = true,
  placeholder = 'เลือกสาขา',
  disabled = false,
  size = 'default',
  className,
  style,
  showAll = false,
  allText = 'ทุกสาขา',
  respectRBAC = true,
  onBranchChange,
  autoSelect = false,
  includeInactive = false,
  showBranchCode = true,
  groupByProvince = false,
  loading: externalLoading = false,
  error: externalError = null,
  ...rest
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  // Redux state
  const { branches } = useSelector((state) => state.data);
  const { provinces } = useSelector((state) => state.provinces);

  // RBAC permissions
  const {
    accessibleBranches,
    isSuperAdmin
  } = usePermissions();

  // Filter branches based on RBAC and province
  const availableBranches = useMemo(() => {
    let branchList = [];

    if (respectRBAC && !isSuperAdmin) {
      // Use RBAC-filtered branches
      branchList = accessibleBranches.map(branch => ({
        ...branch,
        branchCode: branch.branchCode || branch.key
      }));
    } else {
      // Use all branches
      branchList = Object.keys(branches || {}).map(key => ({
        key,
        branchCode: key,
        ...branches[key]
      }));
    }

    // Filter by province if specified
    if (province && province !== 'all') {
      branchList = branchList.filter(branch => 
        branch.provinceId === province || 
        branch.province === province ||
        branch.provinceCode === province
      );
    }

    // Filter by active status
    if (!includeInactive) {
      branchList = branchList.filter(branch => branch.status !== 'inactive' && branch.isActive !== false);
    }

    // Sort by name
    return branchList.sort((a, b) => {
      const nameA = a.branchName || a.name || a.branchCode || a.key;
      const nameB = b.branchName || b.name || b.branchCode || b.key;
      return nameA.localeCompare(nameB, 'th');
    });
  }, [branches, respectRBAC, isSuperAdmin, accessibleBranches, province, includeInactive]);

  // Group branches by province for display
  const groupedBranches = useMemo(() => {
    if (!groupByProvince) return null;

    const grouped = {};
    availableBranches.forEach(branch => {
      const provinceKey = branch.provinceId || branch.province || 'unknown';
      if (!grouped[provinceKey]) {
        grouped[provinceKey] = [];
      }
      grouped[provinceKey].push(branch);
    });

    return grouped;
  }, [availableBranches, groupByProvince]);

  // Auto-select logic
  useEffect(() => {
    if (autoSelect && !value && availableBranches.length === 1) {
      const defaultBranch = availableBranches[0];
      if (onChange) {
        onChange(defaultBranch.branchCode, defaultBranch);
      }
      if (onBranchChange) {
        onBranchChange(defaultBranch);
      }
    }
  }, [autoSelect, value, availableBranches, onChange, onBranchChange]);

  // Clear selection when province changes and current selection is not valid
  useEffect(() => {
    if (value && province && availableBranches.length > 0) {
      const isCurrentSelectionValid = availableBranches.some(
        branch => branch.branchCode === value || branch.key === value
      );
      
      if (!isCurrentSelectionValid) {
        if (onChange) {
          onChange(undefined, null);
        }
        if (onBranchChange) {
          onBranchChange(null);
        }
      }
    }
  }, [province, value, availableBranches, onChange, onBranchChange]);

  // Handle selection change
  const handleChange = (selectedValue, option) => {
    if (onChange) {
      onChange(selectedValue, option);
    }

    // Find branch data and call additional callback
    if (onBranchChange) {
      if (selectedValue && selectedValue !== 'all') {
        const selectedBranch = availableBranches.find(
          b => b.branchCode === selectedValue || b.key === selectedValue
        );
        onBranchChange(selectedBranch);
      } else {
        onBranchChange(null);
      }
    }
  };

  // Handle clear
  const handleClear = () => {
    if (onChange) {
      onChange(undefined, null);
    }
    if (onBranchChange) {
      onBranchChange(null);
    }
  };

  // Loading state
  if (internalLoading || externalLoading) {
    return (
      <Select
        className={className}
        style={style}
        size={size}
        disabled
        placeholder={placeholder}
        suffixIcon={<Spin size="small" />}
        {...rest}
      />
    );
  }

  // Error state
  if (externalError) {
    return (
      <Select
        className={className}
        style={style}
        size={size}
        disabled
        placeholder="เกิดข้อผิดพลาด"
        status="error"
        {...rest}
      />
    );
  }

  // No province selected
  if (province === null || province === undefined) {
    return (
      <Select
        className={className}
        style={style}
        size={size}
        disabled
        placeholder="เลือกจังหวัดก่อน"
        {...rest}
      />
    );
  }

  // No access
  if (respectRBAC && !isSuperAdmin && availableBranches.length === 0) {
    return (
      <Select
        className={className}
        style={style}
        size={size}
        disabled
        placeholder="ไม่มีสิทธิ์เข้าถึงสาขา"
        {...rest}
      />
    );
  }

  // Format option display
  const formatBranchOption = (branch) => {
    const branchCode = branch.branchCode || branch.key;
    const branchName = branch.branchName || branch.name || branchCode;
    
    if (showBranchCode && branchCode !== branchName) {
      return `${branchCode} - ${branchName}`;
    }
    return branchName;
  };

  // Render grouped options
  const renderGroupedOptions = () => {
    return Object.keys(groupedBranches).map(provinceKey => {
      const provinceName = provinces[provinceKey]?.provinceName || provinceKey;
      const provinceBranches = groupedBranches[provinceKey];

      return (
        <Select.OptGroup key={provinceKey} label={provinceName}>
          {provinceBranches.map(branch => (
            <Option 
              key={branch.branchCode || branch.key} 
              value={branch.branchCode || branch.key}
              title={`${formatBranchOption(branch)} (${provinceName})`}
            >
              {formatBranchOption(branch)}
            </Option>
          ))}
        </Select.OptGroup>
      );
    });
  };

  // Render regular options
  const renderOptions = () => {
    return availableBranches.map(branch => (
      <Option 
        key={branch.branchCode || branch.key} 
        value={branch.branchCode || branch.key}
        title={formatBranchOption(branch)}
      >
        {formatBranchOption(branch)}
        {branch.address && (
          <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
            {branch.address}
          </span>
        )}
      </Option>
    ));
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      onClear={handleClear}
      allowClear={allowClear}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      className={className}
      style={style}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        if (option.children) {
          if (Array.isArray(option.children)) {
            return option.children.some(child => 
              typeof child === 'string' && child.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
        return false;
      }}
      {...rest}
    >
      {showAll && (
        <Option key="all" value="all">
          {allText}
        </Option>
      )}
      
      {groupByProvince ? renderGroupedOptions() : renderOptions()}
    </Select>
  );
};

GeographicBranchSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  province: PropTypes.string,
  allowClear: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
  showAll: PropTypes.bool,
  allText: PropTypes.string,
  respectRBAC: PropTypes.bool,
  onBranchChange: PropTypes.func,
  autoSelect: PropTypes.bool,
  includeInactive: PropTypes.bool,
  showBranchCode: PropTypes.bool,
  groupByProvince: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.string
};

/**
 * Hook for geographic branch selector state management
 */
export const useGeographicBranchSelector = (initialProvince = null, initialBranch = null) => {
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [provinceData, setProvinceData] = useState(null);
  const [branchData, setBranchData] = useState(null);

  const handleProvinceChange = (provinceValue, provinceOption) => {
    setSelectedProvince(provinceValue);
    setProvinceData(provinceOption || null);
    
    // Clear branch selection when province changes
    setSelectedBranch(null);
    setBranchData(null);
  };

  const handleBranchChange = (branchValue, branchOption) => {
    setSelectedBranch(branchValue);
    setBranchData(branchOption || null);
  };

  const reset = () => {
    setSelectedProvince(null);
    setSelectedBranch(null);
    setProvinceData(null);
    setBranchData(null);
  };

  return {
    // Values
    selectedProvince,
    selectedBranch,
    provinceData,
    branchData,
    
    // Handlers
    handleProvinceChange,
    handleBranchChange,
    reset,
    
    // Convenience methods
    isProvinceSelected: selectedProvince !== null && selectedProvince !== undefined,
    isBranchSelected: selectedBranch !== null && selectedBranch !== undefined,
    isAllProvinces: selectedProvince === 'all',
    isAllBranches: selectedBranch === 'all',
    
    // Setters
    setProvince: setSelectedProvince,
    setBranch: setSelectedBranch
  };
};

export default GeographicBranchSelector; 