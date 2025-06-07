import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { Select, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';

const { Option } = Select;
const { Text } = Typography;

/**
 * Enhanced Ant Design Select Component with RBAC Integration
 * Replaces react-select with modern Ant Design Select and RBAC filtering
 */
const AntdSelect = forwardRef(({
  // Data
  options = [],
  value,
  onChange,
  
  // Filtering & RBAC
  filterByPermission,
  filterByGeographic = false,
  geographicField = 'branchCode',
  respectRBAC = true,
  
  // Appearance
  placeholder = 'กรุณาเลือก',
  allowClear = true,
  showSearch = true,
  optionFilterProp = 'children',
  mode, // 'multiple', 'tags', etc.
  
  // Behavior
  disabled = false,
  loading = false,
  
  // Validation
  error,
  
  // Styling
  size = 'default',
  style,
  className,
  
  // Custom rendering
  optionLabelProp,
  optionRender,
  labelInValue = false,
  
  // Search behavior
  filterOption,
  onSearch,
  notFoundContent,
  
  // Events
  onBlur,
  onFocus,
  onClear,
  onSelect,
  onDeselect,
  
  ...restProps
}, ref) => {
  const selectRef = useRef();
  const { hasPermission, filterDataByUserAccess } = usePermissions();
  const { branches } = useSelector(state => state.data);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => selectRef.current?.focus(),
    blur: () => selectRef.current?.blur(),
    clear: () => selectRef.current?.clearValue?.(),
    getPopupContainer: () => selectRef.current?.getPopupContainer?.()
  }), []);

  // Filter options based on RBAC permissions
  const filteredOptions = useMemo(() => {
    let processedOptions = [...options];

    // Filter by permission if specified
    if (filterByPermission && respectRBAC) {
      processedOptions = processedOptions.filter(option => {
        if (option.permission) {
          return hasPermission(option.permission);
        }
        return true;
      });
    }

    // Filter by geographic access if specified
    if (filterByGeographic && respectRBAC) {
      processedOptions = filterDataByUserAccess(processedOptions, {
        provinceField: 'provinceId',
        branchField: geographicField
      });
    }

    return processedOptions;
  }, [options, filterByPermission, filterByGeographic, geographicField, respectRBAC, hasPermission, filterDataByUserAccess]);

  // Custom filter function for search
  const defaultFilterOption = (input, option) => {
    const searchText = input.toLowerCase();
    const label = option.children || option.label || '';
    const value = option.value || '';
    
    return (
      label.toLowerCase().includes(searchText) ||
      value.toLowerCase().includes(searchText)
    );
  };

  // Handle value change
  const handleChange = (selectedValue, option) => {
    onChange && onChange(selectedValue, option);
  };

  // Render option content
  const renderOption = (option) => {
    if (optionRender && typeof optionRender === 'function') {
      return optionRender(option);
    }

    return (
      <div>
        <div>{option.label || option.children}</div>
        {option.description && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
            {option.description}
          </Text>
        )}
      </div>
    );
  };

  // Error styling
  const errorStyle = error ? {
    borderColor: '#ff4d4f',
    boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)'
  } : {};

  return (
    <>
      <Select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        allowClear={allowClear}
        showSearch={showSearch}
        optionFilterProp={optionFilterProp}
        filterOption={filterOption || defaultFilterOption}
        mode={mode}
        disabled={disabled}
        loading={loading}
        size={size}
        style={{ ...style, ...errorStyle }}
        className={`${className} ${error ? 'ant-select-error' : ''}`}
        optionLabelProp={optionLabelProp}
        labelInValue={labelInValue}
        notFoundContent={notFoundContent || 'ไม่พบข้อมูล'}
        onBlur={onBlur}
        onFocus={onFocus}
        onClear={onClear}
        onSelect={onSelect}
        onDeselect={onDeselect}
        onSearch={onSearch}
        {...restProps}
      >
        {filteredOptions.map(option => (
          <Option 
            key={option.value || option.key} 
            value={option.value || option.key}
            disabled={option.disabled}
            title={option.title || option.label}
          >
            {renderOption(option)}
          </Option>
        ))}
      </Select>
      
      {/* Error message */}
      {error && (
        <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
          {error}
        </Text>
      )}
    </>
  );
});

AntdSelect.displayName = 'AntdSelect';

export default AntdSelect;

// Re-export common variations for convenience
export const UserSelect = (props) => (
  <AntdSelect
    filterByPermission={true}
    geographicField="branchCode"
    {...props}
  />
);

export const BranchSelect = (props) => (
  <AntdSelect
    filterByGeographic={true}
    geographicField="branchCode"
    placeholder="เลือกสาขา"
    {...props}
  />
);

export const ProvinceSelect = (props) => (
  <AntdSelect
    filterByGeographic={true}
    geographicField="provinceId"
    placeholder="เลือกจังหวัด"
    {...props}
  />
);

/**
 * Usage Examples:
 * 
 * // Basic select
 * <AntdSelect
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * 
 * // RBAC-filtered select
 * <AntdSelect
 *   options={userOptions}
 *   filterByPermission={true}
 *   filterByGeographic={true}
 *   respectRBAC={true}
 * />
 * 
 * // Multiple select
 * <AntdSelect
 *   mode="multiple"
 *   options={options}
 *   value={selectedValues}
 *   onChange={setSelectedValues}
 * />
 * 
 * // With custom option rendering
 * <AntdSelect
 *   options={complexOptions}
 *   optionRender={(option) => (
 *     <div>
 *       <strong>{option.label}</strong>
 *       <br />
 *       <small>{option.description}</small>
 *     </div>
 *   )}
 * />
 */ 