import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;

interface BooleanSelectorProps extends Omit<SelectProps, "ref"> {
  hasAll?: boolean;
  branchCode?: boolean;
}

export interface BooleanSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const BooleanSelector = forwardRef<BooleanSelectorRef, BooleanSelectorProps>(
  ({ hasAll, branchCode, ...props }, ref) => {
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

    return (
      <Select ref={selectRef} dropdownStyle={branchCode ? { minWidth: 80 } : undefined} {...props}>
        {[
          [
            { label: <CheckOutlined />, value: true },
            { label: <CloseOutlined />, value: false }
          ].map((it, i) => (
            <Option key={i} value={it.value}>
              {it.label}
            </Option>
          ))
        ]}
      </Select>
    );
  }
);

BooleanSelector.displayName = "BooleanSelector";

export default BooleanSelector; 