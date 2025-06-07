/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState, useMemo } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import { sortArr } from 'functions';
import PropTypes from 'prop-types';

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
  const { branches = {} } = useSelector(state => state.data || {});
  const { provinces = {} } = useSelector(state => state.provinces || {});
  const { getAccessibleBranches } = usePermissions();
  const [sBranches, setBranches] = useState([]);
  
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

  // Memoize the filtered branches to prevent unnecessary recalculations
  const filteredBranches = useMemo(() => {
    if (!branches || Object.keys(branches).length === 0) {
      return [];
    }

    try {
      // First apply geographic access control
      const accessibleBranches = getAccessibleBranches(branches);
      
      // Then apply province filter if provided
      let filtered = Object.keys(accessibleBranches)
        .map(k => accessibleBranches[k])
        .filter(branch => branch && branch.branchCode); // Filter out null/undefined branches
      
      if (provinceFilter) {
        filtered = filtered.filter(branch => branch.provinceId === provinceFilter);
      }
      
      if (regionFilter) {
        filtered = filtered.filter(branch => branch.region === regionFilter);
      }
      
      return getSortBranches(
        filtered.reduce((acc, branch) => {
          if (branch && branch.branchCode) {
            acc[branch.branchCode] = branch;
          }
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Error filtering branches:', error);
      return [];
    }
  }, [branches, getAccessibleBranches, provinceFilter, regionFilter]);

  // Update local state when filtered branches change, but only if component is still mounted
  useEffect(() => {
    if (isMountedRef.current) {
      setBranches(filteredBranches);
    }
  }, [filteredBranches]);

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder}
      dropdownStyle={branchCode ? { minWidth: 200 } : undefined}
      {...props}
    >
      {hasAll && (!onlyUserBranch || onlyUserBranch === '0450')
        ? [
            ...sBranches.map(branch => (
              <Option key={branch.branchCode} value={branch.branchCode}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {branch.branchName || branch.branchCode}
                  </div>
                  {showProvinceInfo && provinces[branch.provinceId] && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ({provinces[branch.provinceId].name})
                    </div>
                  )}
                </div>
                {/* For regular display without provinceFilter, show province info */}
                {showProvinceInfo && !provinceFilter && provinces[branch.provinceId] && (
                  <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                    - {provinces[branch.provinceId].name}
                  </span>
                )}
              </Option>
            )),
            <Option key="all" value="all">
              ทุกสาขา
            </Option>
          ]
        : sBranches.map(branch => (
            <Option
              key={branch.branchCode}
              value={branch.branchCode}
              disabled={!!onlyUserBranch && onlyUserBranch !== '0450' && onlyUserBranch !== branch.branchCode}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {branch.branchName || branch.branchCode}
                </div>
                {showProvinceInfo && provinces[branch.provinceId] && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ({provinces[branch.provinceId].name})
                  </div>
                )}
              </div>
              {/* For regular display without provinceFilter, show province info */}
              {showProvinceInfo && !provinceFilter && provinces[branch.provinceId] && (
                <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                  - {provinces[branch.provinceId].name}
                </span>
              )}
            </Option>
          ))}
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
