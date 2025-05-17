import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState, useCallback } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "services/firebase";
import { sortArr } from "utils/functions";
import { waitFor } from "utils/functions";
import { showLog } from "utils/functions";

const { Option } = Select;

interface Branch {
  branchCode: string;
  branchName: string;
  queue?: number;
  [key: string]: any;
}

interface BranchSelectorProps extends Omit<SelectProps, "ref"> {
  hasAll?: boolean;
  branchCode?: string;
  onlyUserBranch?: string;
  placeholder?: string;
}

const getSortBranches = (br: Record<string, Branch>): Branch[] => {
  const bArr = Object.keys(br).map(k => br[k]);
  return bArr.length > 0 && bArr[1]?.queue ? sortArr(bArr, "queue") : bArr;
};

const BranchSelector = forwardRef<any, BranchSelectorProps>(
  ({ hasAll, branchCode, onlyUserBranch, ...props }, ref) => {
    const { branches } = useSelector((state: any) => state.data);
    const [sBranches, setBranches] = useState<Branch[]>(getSortBranches(branches));
    const selectRef = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        clear: () => {
          selectRef.current?.clear();
        },
        isFocused: () => {
          return selectRef.current?.isFocused() ?? false;
        },
        setNativeProps: (nativeProps: any) => {
          selectRef.current?.setNativeProps?.(nativeProps);
        }
      }),
      []
    );

    const initBranches = useCallback(
      async (br: Record<string, Branch>) => {
        try {
          const branchesRef = collection(firestore, "data/branch/branches");
          const locationsRef = collection(firestore, "data/branch/locations");
          const warehousesRef = collection(firestore, "data/branch/warehouses");

          await Promise.all([
            getDocs(branchesRef),
            getDocs(locationsRef),
            getDocs(warehousesRef)
          ]);

          await waitFor(1000);
          const arr = getSortBranches(br);
          setBranches(arr);
        } catch (error) {
          console.error("Error initializing branches:", error);
          showLog("Error initializing branches", error);
        }
      },
      []
    );

    useEffect(() => {
      // Checking added branch.
      const bArr = Object.keys(branches).map(k => branches[k]);
      if (bArr.length <= 7 || (bArr.length > 0 && !bArr[1]?.queue)) {
        initBranches(branches);
      }
    }, [branches, initBranches]);

    return (
      <Select
        ref={selectRef}
        placeholder={props?.placeholder || "สาขา"}
        dropdownStyle={branchCode ? { minWidth: 200 } : undefined}
        {...props}
      >
        {hasAll && (!onlyUserBranch || onlyUserBranch === "0450")
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
                disabled={!!onlyUserBranch && onlyUserBranch !== "0450" && onlyUserBranch !== branch.branchCode}
              >
                {branch.branchName}
              </Option>
            ))}
      </Select>
    );
  }
);

BranchSelector.displayName = "BranchSelector";

export default BranchSelector; 