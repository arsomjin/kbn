import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { BuyType } from "data/Constant";

const { Option } = Select;

interface BuyTypeSelectorProps extends Omit<SelectProps, "ref"> {
  placeholder?: string;
  isBaac?: boolean;
}

export interface BuyTypeSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const BuyTypeSelector = forwardRef<BuyTypeSelectorRef, BuyTypeSelectorProps>(
  ({ placeholder, isBaac, ...props }, ref) => {
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
      <Select ref={selectRef} placeholder={placeholder || "การชำระเงิน"} {...props}>
        {Object.keys(BuyType).map(sl => (
          <Option key={sl} value={sl}>
            {BuyType[sl as keyof typeof BuyType]}
          </Option>
        ))}
      </Select>
    );
  }
);

BuyTypeSelector.displayName = "BuyTypeSelector";

export default BuyTypeSelector; 