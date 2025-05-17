import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { VehicleItemType } from "data/Constant";

interface VehicleItemTypeSelectorProps extends Omit<SelectProps, "ref"> {
  placeholder?: string;
}

export interface VehicleItemTypeSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const VehicleItemTypeSelector = forwardRef<VehicleItemTypeSelectorRef, VehicleItemTypeSelectorProps>(
  ({ placeholder, ...props }, ref) => {
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
      <Select ref={selectRef} {...props} dropdownStyle={{ minWidth: 180 }}>
        {Object.keys(VehicleItemType).map(k => (
          <Select.Option value={k} key={k}>
            {VehicleItemType[k as keyof typeof VehicleItemType]}
          </Select.Option>
        ))}
      </Select>
    );
  }
);

VehicleItemTypeSelector.displayName = "VehicleItemTypeSelector";

export default VehicleItemTypeSelector; 