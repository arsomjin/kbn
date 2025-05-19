import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useSelector } from "react-redux";

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
    // Use departments from Redux store (populated by DepartmentProvider)
    const departments = useSelector((state: any) => state.departments?.departments || {});
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

    const Options = Object.keys(departments).map((it) =>
      departments[it].department ? (
        <Option key={it} value={it}>
          {departments[it].department}
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