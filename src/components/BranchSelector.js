/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useEffect, useState, useCallback } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase';
import { sortArr } from 'functions';
import { waitFor } from 'functions';
import { showLog } from 'functions';
const { Option } = Select;

const getSortBranches = br => {
  let bArr = Object.keys(br).map(k => br[k]);
  return bArr.length > 0 && bArr[1]?.queue > 0 ? sortArr(bArr, 'queue') : bArr;
};
export default forwardRef(({ hasAll, branchCode, onlyUserBranch, ...props }, ref) => {
  const { api } = useContext(FirebaseContext);
  const { branches } = useSelector(state => state.data);
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
      api.getLocations();
      api.getWarehouses();
      await waitFor(1000);
      let arr = getSortBranches(br);
      setBranches(arr);
    },
    [api]
  );

  useEffect(() => {
    // Checking added branch.
    let bArr = Object.keys(branches).map(k => branches[k]);
    if (bArr.length <= 7 || (bArr.length > 0 && !bArr[1]?.queue)) {
      initBranches(branches);
    }
  }, [branches, initBranches]);

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || 'สาขา'}
      dropdownStyle={branchCode ? { minWidth: 200 } : undefined}
      {...props}
    >
      {hasAll && (!onlyUserBranch || onlyUserBranch === '0450')
        ? [
            ...sBranches.map(branch => (
              <Option key={branch.branchCode} value={branch.branchCode}>
                {branch.branchName}
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
            </Option>
          ))}
    </Select>
  );
});
