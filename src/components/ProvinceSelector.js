import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState, useMemo } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import { sortArr } from 'functions';
import PropTypes from 'prop-types';

const { Option } = Select;

const getSortProvinces = pr => {
  if (!pr || typeof pr !== 'object') return [];
  
  let pArr = Object.keys(pr).map(k => pr[k]).filter(province => province && province.provinceName);
  return pArr.length > 0 && pArr[0]?.queue > 0 ? sortArr(pArr, 'queue') : pArr;
};

const ProvinceSelector = forwardRef(({ 
  hasAll, 
  provinceCode, 
  onlyUserProvince,
  regionFilter, 
  placeholder = "จังหวัด",
  showBranchCount = false,
  ...props 
}, ref) => {
  const { provinces = {} } = useSelector(state => state.data || {});
  const { getAccessibleProvinces } = usePermissions();
  const [sProvinces, setProvinces] = useState([]);
  
  // Add ref to track component mount status
  const isMountedRef = useRef(true);

  const selectRef = useRef();

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        return selectRef.current?.focus();
      },

      blur: () => {
        return selectRef.current?.blur();
      },

      clear: () => {
        return selectRef.current?.clear();
      },

      isFocused: () => {
        return selectRef.current?.isFocused();
      },

      setNativeProps: (nativeProps) => {
        return selectRef.current?.setNativeProps(nativeProps);
      }
    }),
    []
  );

  // Memoize the filtered provinces to prevent unnecessary recalculations
  const filteredProvinces = useMemo(() => {
    if (!provinces || Object.keys(provinces).length === 0) {
      return [];
    }

    try {
      // First apply geographic access control
      const accessibleProvinces = getAccessibleProvinces(provinces);
      
      // Then apply region filter if provided
      let filtered = Object.keys(accessibleProvinces)
        .map(k => accessibleProvinces[k])
        .filter(province => province && province.provinceName); // Filter out null/undefined provinces
      
      if (regionFilter) {
        filtered = filtered.filter(province => province.region === regionFilter);
      }
      
      if (onlyUserProvince) {
        filtered = filtered.filter(province => province.provinceName === onlyUserProvince);
      }
      
      return getSortProvinces(
        filtered.reduce((acc, province) => {
          if (province && (province.provinceName || province._key)) {
            const key = province.provinceName || province._key;
            acc[key] = province;
          }
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Error filtering provinces:', error);
      return [];
    }
  }, [provinces, getAccessibleProvinces, regionFilter, onlyUserProvince]);

  // Update local state when filtered provinces change, but only if component is still mounted
  useEffect(() => {
    if (isMountedRef.current) {
      setProvinces(filteredProvinces);
    }
  }, [filteredProvinces]);

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder}
      dropdownStyle={provinceCode ? { minWidth: 250 } : undefined}
      {...props}
    >
      {hasAll && (
        <Option key="all" value="all">
          ทุกจังหวัด
        </Option>
      )}
      {sProvinces.map(province => {
        const key = province.provinceName || province._key;
        const value = province.provinceName || province._key;
        const branchCount = province.branches ? province.branches.length : 0;
        
        return (
          <Option 
            key={key} 
            value={value}
            disabled={!!onlyUserProvince && onlyUserProvince !== province.provinceName}
          >
            {province.provinceName || key}
            {showBranchCount && (
              <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                ({branchCount} สาขา)
              </span>
            )}
            {province.region && (
              <span style={{ color: '#666', fontSize: '11px', marginLeft: '4px' }}>
                - {province.region}
              </span>
            )}
          </Option>
        );
      })}
    </Select>
  );
});

ProvinceSelector.displayName = 'ProvinceSelector';

ProvinceSelector.propTypes = {
  hasAll: PropTypes.bool,
  provinceCode: PropTypes.string,
  onlyUserProvince: PropTypes.string,
  regionFilter: PropTypes.string,
  placeholder: PropTypes.string,
  showBranchCount: PropTypes.bool
};

export default ProvinceSelector;