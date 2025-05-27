import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { sortArr } from 'utils/array';

const { Option } = Select;

/**
 * Get sorted branches array
 * @param {Object} br - Branches object
 * @returns {Array} Sorted branches array
 */
const getSortBranches = (br) => {
  let bArr = Object.keys(br).map((k) => br[k]);
  return bArr.length > 0 && bArr[1]?.queue > 0 ? sortArr(bArr, 'queue') : bArr;
};

/**
 * Branch Selector Component
 * Provides dropdown selection for branches with RBAC filtering
 * @param {Object} props - Component props
 * @param {boolean} props.hasAll - Include "All branches" option
 * @param {string} props.branchCode - Current branch code
 * @param {string} props.onlyUserBranch - Restrict to user's branch only
 * @param {Object} ref - Component reference
 */
export default forwardRef(({ hasAll, branchCode, onlyUserBranch, ...props }, ref) => {
  const { t } = useTranslation('components');
  const { isMobile } = useResponsive();
  const { branches } = useSelector((state) => state.data);
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
      },
    }),
    [],
  );

  const initBranches = useCallback(async (br) => {
    // Modern branch initialization using Redux state
    let arr = getSortBranches(br);
    setBranches(arr);
  }, []);

  useEffect(() => {
    // Checking added branch.
    let bArr = Object.keys(branches).map((k) => branches[k]);
    if (bArr.length <= 7 || (bArr.length > 0 && !bArr[1]?.queue)) {
      initBranches(branches);
    }
  }, [branches, initBranches]);

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || t('branch.placeholder')}
      styles={{
        popup: {
          root: {
            minWidth: isMobile ? 180 : branchCode ? 200 : undefined,
            maxHeight: 300,
          },
        },
      }}
      className="w-full"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {hasAll && (!onlyUserBranch || onlyUserBranch === '0450')
        ? [
            ...sBranches.map((branch) => (
              <Option key={branch.branchCode} value={branch.branchCode}>
                {branch.branchName}
              </Option>
            )),
            <Option key="all" value="all">
              {t('branch.all')}
            </Option>,
          ]
        : sBranches.map((branch) => (
            <Option
              key={branch.branchCode}
              value={branch.branchCode}
              disabled={
                !!onlyUserBranch &&
                onlyUserBranch !== '0450' &&
                onlyUserBranch !== branch.branchCode
              }
            >
              {branch.branchName}
            </Option>
          ))}
    </Select>
  );
});
