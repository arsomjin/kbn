/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import { sortArr } from 'functions';
import PropTypes from 'prop-types';
import { getBranchName } from '../utils/mappings';

// Helper function to get province code from provinceId
const getProvinceCodeFromId = (provinceId) => {
  const provinceCodeMap = {
    'nakhon-ratchasima': 'NMA',
    'nakhon-sawan': 'NSN',
    'นครราชสีมา': 'NMA',
    'นครสวรรค์': 'NSN'
  };
  
  // Try direct mapping first
  if (provinceCodeMap[provinceId]) {
    return provinceCodeMap[provinceId];
  }
  
  // If it's already a short code (2-3 uppercase letters), return as is
  if (typeof provinceId === 'string' && /^[A-Z]{2,3}$/.test(provinceId)) {
    return provinceId;
  }
  
  // For any other case, try to create a meaningful abbreviation
  if (typeof provinceId === 'string') {
    // If it's a long name, create abbreviation from first letters
    const words = provinceId.split(/[\s-]+/);
    if (words.length > 1) {
      return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 3);
    }
    
    // Single word - take first 3 characters and uppercase
    return provinceId.slice(0, 3).toUpperCase();
  }
  
  return 'N/A';
};

const { Option } = Select;

const getSortBranches = br => {
  if (!br || typeof br !== 'object') return [];
  
  let bArr = Object.keys(br).map(k => br[k]).filter(branch => branch && branch.branchCode);
  return bArr.length > 0 && bArr[1]?.queue > 0 ? sortArr(bArr, 'queue') : bArr;
};

const BranchSelector = forwardRef(({ 
  hasAll, 
  branchCode, 
  onlyUserBranch, 
  provinceFilter, 
  regionFilter, 
  placeholder = 'สาขา',
  showProvinceInfo = false,
  ...props 
}, ref) => {
  const { provinces = {} } = useSelector(state => state.provinces || {});
  const { userBranches } = usePermissions();
  
  const selectRef = useRef();

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

  // Memoize the filtered and grouped branches by province
  const processedBranches = useMemo(() => {
    if (!userBranches || Object.keys(userBranches).length === 0) {
      return { grouped: {}, sortedProvinces: [], flattened: [] };
    }

    try {
      // userBranches already contains only accessible branches
      let filtered = Object.keys(userBranches)
        .map(k => userBranches[k])
        .filter(branch => branch && branch.branchCode); // Filter out null/undefined branches
      
      if (provinceFilter) {
        filtered = filtered.filter(branch => branch.provinceId === provinceFilter);
      }
      
      if (regionFilter) {
        filtered = filtered.filter(branch => branch.region === regionFilter);
      }
      
      // Group branches by province
      const grouped = filtered.reduce((acc, branch) => {
        const provinceId = branch.provinceId || 'ไม่ระบุจังหวัด';
        if (!acc[provinceId]) {
          acc[provinceId] = [];
        }
        acc[provinceId].push(branch);
        return acc;
      }, {});
      
      // Sort branches within each province
      Object.keys(grouped).forEach(provinceId => {
        grouped[provinceId] = getSortBranches(
          grouped[provinceId].reduce((acc, branch) => {
            acc[branch.branchCode] = branch;
            return acc;
          }, {})
        );
      });
      
      // Sort provinces alphabetically
      const sortedProvinces = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'th'));
      
      // Flatten grouped branches for easier iteration
      const flattened = [];
      sortedProvinces.forEach(provinceId => {
        flattened.push(...grouped[provinceId]);
      });
      
      return { grouped, sortedProvinces, flattened };
    } catch (error) {
      console.error('Error filtering branches:', error);
      return { grouped: {}, sortedProvinces: [], flattened: [] };
    }
  }, [userBranches, provinceFilter, regionFilter]);

  // Memoize option components to prevent recreation
  const branchOptions = useMemo(() => {
    const { grouped, sortedProvinces } = processedBranches;
    
    if (!sortedProvinces.length) return [];

    return sortedProvinces.map(provinceId => 
      grouped[provinceId].map(branch => (
        <Option 
          key={branch.branchCode} 
          value={branch.branchCode}
          disabled={!!onlyUserBranch && onlyUserBranch !== '0450' && onlyUserBranch !== branch.branchCode}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>
                {getBranchName(branch.branchCode) || branch.branchName || branch.branchCode}
              </div>
              {showProvinceInfo && (
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {getProvinceCodeFromId(provinceId)}
                </div>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>
              {provinces[provinceId]?.provinceCode || getProvinceCodeFromId(provinceId)}
            </div>
          </div>
        </Option>
      ))
    ).flat();
  }, [processedBranches, onlyUserBranch, showProvinceInfo, provinces]);

  // Memoize the "All" option
  const allOption = useMemo(() => (
    <Option key="all" value="all">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ fontWeight: 'bold' }}>ทุกสาขา</div>
        <div style={{ fontSize: '11px', color: '#999' }}>ALL</div>
      </div>
    </Option>
  ), []);

  // Determine which options to show
  const shouldShowAll = hasAll && (!onlyUserBranch || onlyUserBranch === '0450');

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder}
      dropdownStyle={branchCode ? { minWidth: 200 } : undefined}
      {...props}
    >
      {shouldShowAll ? [allOption, ...branchOptions] : branchOptions}
    </Select>
  );
});

BranchSelector.displayName = 'BranchSelector';

BranchSelector.propTypes = {
  hasAll: PropTypes.bool,
  branchCode: PropTypes.string,
  onlyUserBranch: PropTypes.string,
  provinceFilter: PropTypes.string,
  regionFilter: PropTypes.string,
  placeholder: PropTypes.string,
  showProvinceInfo: PropTypes.bool
};

export default BranchSelector;
