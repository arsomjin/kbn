/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useEffect, useState, useCallback } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase';
import { usePermissions } from 'hooks/usePermissions';
import { sortArr } from 'functions';
import { waitFor } from 'functions';
import PropTypes from 'prop-types';

const { Option } = Select;

const getSortBranches = br => {
  let bArr = Object.keys(br).map(k => br[k]);
  return bArr.length > 0 && bArr[1]?.queue > 0 ? sortArr(bArr, 'queue') : bArr;
};

const BranchSelector = forwardRef(({ 
  hasAll, 
  branchCode, 
  onlyUserBranch, 
  provinceFilter, 
  regionFilter, 
  placeholder = 'สาขา',
  ...props 
}, ref) => {
  const { api } = useContext(FirebaseContext);
  const { branches, provinces } = useSelector(state => state.data);
  const { getAccessibleBranches } = usePermissions();
  const [sBranches, setBranches] = useState(getSortBranches(branches));

  const selectRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current.focus();
      },

      blur: () => {
        selectRef.current.blur();
      },

      clear: () => {
        selectRef.current.clear();
      },

      isFocused: () => {
        return selectRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const initBranches = useCallback(
    async br => {
      api.getBranches();
      api.getProvinces();
      api.getLocations();
      api.getWarehouses();
      await waitFor(1000);
      let arr = getSortBranches(br);
      setBranches(arr);
    },
    [api]
  );

  const filterBranches = useCallback((allBranches) => {
    // First apply geographic access control
    const accessibleBranches = getAccessibleBranches(allBranches);
    
    // Then apply province filter if provided
    let filtered = Object.keys(accessibleBranches).map(k => accessibleBranches[k]);
    
    if (provinceFilter) {
      filtered = filtered.filter(branch => branch.provinceCode === provinceFilter);
    }
    
    if (regionFilter) {
      filtered = filtered.filter(branch => branch.region === regionFilter);
    }
    
    return getSortBranches(
      filtered.reduce((acc, branch) => {
        acc[branch.branchCode] = branch;
        return acc;
      }, {})
    );
  }, [getAccessibleBranches, provinceFilter, regionFilter]);

  useEffect(() => {
    // Checking added branch.
    let bArr = Object.keys(branches).map(k => branches[k]);
    if (bArr.length <= 7 || (bArr.length > 0 && !bArr[1]?.queue)) {
      initBranches(branches);
    } else {
      const filteredBranches = filterBranches(branches);
      setBranches(filteredBranches);
    }
  }, [branches, initBranches, filterBranches]);

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
                {branch.branchName}
                {provinceFilter && provinces[branch.provinceCode] && (
                  <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                    ({provinces[branch.provinceCode].provinceName})
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
              {branch.branchName}
              {provinceFilter && provinces[branch.provinceCode] && (
                <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                  ({provinces[branch.provinceCode].provinceName})
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
  placeholder: PropTypes.string
};

export default BranchSelector;
