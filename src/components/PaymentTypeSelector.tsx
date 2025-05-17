import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { PaymentType } from "data/Constant";

const { Option } = Select;

interface PaymentTypeSelectorProps extends Omit<SelectProps, "ref"> {
  placeholder?: string;
  isBaac?: boolean;
}

export interface PaymentTypeSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const PaymentTypeSelector = forwardRef<PaymentTypeSelectorRef, PaymentTypeSelectorProps>(
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
        {Object.keys(PaymentType).map(sl => (
          <Option key={sl} value={sl}>
            {PaymentType[sl as keyof typeof PaymentType]}
          </Option>
        ))}
      </Select>
    );
  }
);

PaymentTypeSelector.displayName = "PaymentTypeSelector";

export default PaymentTypeSelector;