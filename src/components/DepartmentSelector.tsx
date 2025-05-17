import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "services/firebase";
import { showWarn } from "utils/functions";

const { Option } = Select;

interface Department {
  department: string;
  deleted?: boolean;
  [key: string]: any;
}

interface DepartmentSelectorProps extends Omit<SelectProps, "ref"> {
  hasAll?: boolean;
}

export interface DepartmentSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const DepartmentSelector = forwardRef<DepartmentSelectorRef, DepartmentSelectorProps>(
  ({ hasAll, ...props }, ref) => {
    const { departments } = useSelector((state: any) => state.data);
    const [data, setData] = useState<Record<string, Department> | null>(null);
    const selectRef = useRef<any>(null);

    const _getData = async () => {
      try {
        const departmentsRef = collection(firestore, "data/company/departments");
        const q = query(departmentsRef, where("deleted", "!=", true));
        const querySnapshot = await getDocs(q);
        const departmentsData: Record<string, Department> = {};
        querySnapshot.forEach((doc) => {
          departmentsData[doc.id] = doc.data() as Department;
        });
        setData(departmentsData);
      } catch (e) {
        showWarn((e as Error).message);
      }
    };

    useEffect(() => {
      _getData();
    }, []);

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

    const Options = Object.keys(data || departments).map((it) =>
      (data || departments)[it].department ? (
        <Option key={it} value={it}>
          {(data || departments)[it].department}
        </Option>
      ) : null
    );

    return (
      <Select
        ref={selectRef}
        placeholder="แผนก"
        {...props}
      >
        {hasAll
          ? [
              <Option key="all" value="all">
                ทุกแผนก
              </Option>,
              ...Options
            ]
          : Options}
      </Select>
    );
  }
);

DepartmentSelector.displayName = "DepartmentSelector";

export default DepartmentSelector; 