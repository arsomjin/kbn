/**
 * ProvinceSelector Component for KBN Multi-Province System
 * Dropdown selector for provinces with RBAC filtering
 */

import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import { fetchProvinces } from '../redux/actions/provinces';
import { getProvinces, getProvincesLoading, getProvincesError } from '../redux/reducers/provinces';

const { Option } = Select;

/**
 * Province Selector Component
 * @param {Object} props
 * @param {string} props.value - Selected province value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.allowClear - Allow clearing selection
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disable the selector
 * @param {string} props.size - Size of the selector
 * @param {string} props.className - CSS class name
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.showAll - Show "All Provinces" option
 * @param {string} props.allText - Text for "All" option
 * @param {boolean} props.respectRBAC - Whether to filter by user permissions
 * @param {Function} props.onProvinceChange - Additional callback with province data
 * @param {boolean} props.autoSelect - Auto-select if only one option
 * @param {boolean} props.includeInactive - Include inactive provinces
 */
const ProvinceSelector = ({
  value,
  onChange,
  allowClear = true,
  placeholder = 'เลือกจังหวัด',
  disabled = false,
  size = 'default',
  className,
  style,
  showAll = false,
  allText = 'ทุกจังหวัด',
  respectRBAC = true,
  onProvinceChange,
  autoSelect = false,
  includeInactive = false,
  loading: externalLoading = false,
  error: externalError = null,
  fetchOnMount = true,
  ...rest
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const provinces = useSelector(getProvinces);
  const loading = useSelector(getProvincesLoading);
  const error = useSelector(getProvincesError);
  
  // RBAC permissions
  const {
    accessibleProvinces,
    isSuperAdmin,
    hasProvinceAccess
  } = usePermissions();

  // Fetch provinces on mount
  useEffect(() => {
    if (fetchOnMount && Object.keys(provinces).length === 0 && !loading) {
      dispatch(fetchProvinces());
    }
  }, [dispatch, fetchOnMount, provinces, loading]);

  // Filter provinces based on RBAC
  const availableProvinces = useMemo(() => {
    let provinceList = [];

    if (respectRBAC && !isSuperAdmin) {
      // Use RBAC-filtered provinces
      provinceList = accessibleProvinces;
    } else {
      // Use all provinces
      provinceList = Object.keys(provinces).map(key => ({
        key,
        ...provinces[key]
      }));
    }

    // Filter by active status
    if (!includeInactive) {
      provinceList = provinceList.filter(province => province.isActive !== false);
    }

    // Sort by name
    return provinceList.sort((a, b) => {
      const nameA = a.provinceName || a.name || a.key;
      const nameB = b.provinceName || b.name || b.key;
      return nameA.localeCompare(nameB, 'th');
    });
  }, [provinces, respectRBAC, isSuperAdmin, accessibleProvinces, includeInactive]);

  // Auto-select logic
  useEffect(() => {
    if (autoSelect && !value && availableProvinces.length === 1) {
      const defaultProvince = availableProvinces[0];
      if (onChange) {
        onChange(defaultProvince.key, defaultProvince);
      }
      if (onProvinceChange) {
        onProvinceChange(defaultProvince);
      }
    }
  }, [autoSelect, value, availableProvinces, onChange, onProvinceChange]);

  // Handle selection change
  const handleChange = (selectedValue, option) => {
    if (onChange) {
      onChange(selectedValue, option);
    }

    // Find province data and call additional callback
    if (onProvinceChange) {
      if (selectedValue && selectedValue !== 'all') {
        const selectedProvince = availableProvinces.find(p => p.key === selectedValue);
        onProvinceChange(selectedProvince);
      } else {
        onProvinceChange(null);
      }
    }
  };

  // Handle clear
  const handleClear = () => {
    if (onChange) {
      onChange(undefined, null);
    }
    if (onProvinceChange) {
      onProvinceChange(null);
    }
  };

  // Loading state
  if (loading || externalLoading) {
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
  if (error || externalError) {
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

  // No access
  if (respectRBAC && !isSuperAdmin && !hasProvinceAccess && availableProvinces.length === 0) {
    return (
      <Select
        className={className}
        style={style}
        size={size}
        disabled
        placeholder="ไม่มีสิทธิ์เข้าถึง"
        {...rest}
      />
    );
  }

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
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...rest}
    >
      {showAll && (
        <Option key="all" value="all">
          {allText}
        </Option>
      )}
      
      {availableProvinces.map(province => (
        <Option 
          key={province.key} 
          value={province.key}
          title={`${province.provinceName || province.name || province.key} (${province.provinceCode || ''})`}
        >
          {province.provinceName || province.name || province.key}
          {province.provinceNameEn && (
            <span style={{ color: '#999', marginLeft: 8, fontSize: '12px' }}>
              {province.provinceNameEn}
            </span>
          )}
        </Option>
      ))}
    </Select>
  );
};

ProvinceSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  allowClear: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
  showAll: PropTypes.bool,
  allText: PropTypes.string,
  respectRBAC: PropTypes.bool,
  onProvinceChange: PropTypes.func,
  autoSelect: PropTypes.bool,
  includeInactive: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.string,
  fetchOnMount: PropTypes.bool
};

/**
 * Controlled Province Selector with local state
 */
export const ControlledProvinceSelector = (props) => {
  const [selectedProvince, setSelectedProvince] = React.useState(props.defaultValue || null);
  
  const handleChange = (value, option) => {
    setSelectedProvince(value);
    if (props.onChange) {
      props.onChange(value, option);
    }
  };

  return (
    <ProvinceSelector
      {...props}
      value={selectedProvince}
      onChange={handleChange}
    />
  );
};

ControlledProvinceSelector.propTypes = {
  defaultValue: PropTypes.string,
  onChange: PropTypes.func
};

/**
 * Hook for province selector state management
 */
export const useProvinceSelector = (initialValue = null) => {
  const [selectedProvince, setSelectedProvince] = React.useState(initialValue);
  const [provinceData, setProvinceData] = React.useState(null);

  const handleProvinceChange = (value, option) => {
    setSelectedProvince(value);
    setProvinceData(option || null);
  };

  const reset = () => {
    setSelectedProvince(null);
    setProvinceData(null);
  };

  return {
    selectedProvince,
    provinceData,
    handleProvinceChange,
    reset,
    // Convenience methods
    isSelected: selectedProvince !== null && selectedProvince !== undefined,
    isAll: selectedProvince === 'all'
  };
};

export default ProvinceSelector;