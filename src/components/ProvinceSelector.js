import React, { forwardRef, useRef, useImperativeHandle, useContext, useEffect, useState, useCallback } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase';
import { usePermissions } from 'hooks/usePermissions';
import { sortArr } from 'functions';
import { waitFor } from 'functions';
import PropTypes from 'prop-types';

const { Option } = Select;

const getSortProvinces = pr => {
  let pArr = Object.keys(pr).map(k => pr[k]);
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
  const { api } = useContext(FirebaseContext);
  const { provinces } = useSelector(state => state.data);
  const { getAccessibleProvinces } = usePermissions();
  const [sProvinces, setProvinces] = useState([]);

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

  const initProvinces = useCallback(
    async pr => {
      api.getProvinces();
      await waitFor(1000);
      const accessibleProvinces = getAccessibleProvinces(pr);
      let arr = getSortProvinces(accessibleProvinces);
      setProvinces(arr);
    },
    [api, getAccessibleProvinces]
  );

  const filterProvinces = useCallback((allProvinces) => {
    // First apply geographic access control
    const accessibleProvinces = getAccessibleProvinces(allProvinces);
    
    // Then apply region filter if provided
    let filtered = Object.keys(accessibleProvinces).map(k => accessibleProvinces[k]);
    
    if (regionFilter) {
      filtered = filtered.filter(province => province.region === regionFilter);
    }
    
    if (onlyUserProvince) {
      filtered = filtered.filter(province => province.provinceName === onlyUserProvince);
    }
    
    return getSortProvinces(
      filtered.reduce((acc, province) => {
        acc[province.provinceName || province._key] = province;
        return acc;
      }, {})
    );
  }, [getAccessibleProvinces, regionFilter, onlyUserProvince]);

  useEffect(() => {
    // Checking added provinces.
    let pArr = Object.keys(provinces).map(k => provinces[k]);
    if (pArr.length <= 1 || (pArr.length > 0 && !pArr[0]?.provinceName)) {
      initProvinces(provinces);
    } else {
      const filteredProvinces = filterProvinces(provinces);
      setProvinces(filteredProvinces);
    }
  }, [provinces, initProvinces, filterProvinces]);

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
            {province.provinceName}
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