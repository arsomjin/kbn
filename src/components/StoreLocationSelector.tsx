import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { StoreVehicleLocation, StorePartLocation } from "data/Constant";

const { Option } = Select;

interface StoreLocationSelectorProps extends Omit<SelectProps, "ref"> {
  placeholder?: string;
  isPart?: boolean;
  isUsed?: boolean;
}

export interface StoreLocationSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const StoreLocationSelector = forwardRef<StoreLocationSelectorRef, StoreLocationSelectorProps>(
  ({ placeholder, isPart, isUsed, ...props }, ref) => {
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

    const locationMap = isPart ? StorePartLocation : StoreVehicleLocation;
    const optionArr = Object.keys(locationMap)
      .map(k => ({
        key: k,
        value: locationMap[k as keyof typeof locationMap] as string
      }))
      .filter(l => (isUsed ? l?.value.indexOf("มือสอง") > -1 : l?.value.indexOf("มือสอง") === -1));

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || "คลัง"}
        {...props}
        style={{ ...props.style, maxWidth: 320 }}
        dropdownStyle={{ minWidth: 280 }}
      >
        {optionArr.map(it => (
          <Option key={it.key} value={it.value}>
            {`${it.key} - ${it.value}`}
          </Option>
        ))}
      </Select>
    );
  }
);

StoreLocationSelector.displayName = "StoreLocationSelector";

export default StoreLocationSelector; 