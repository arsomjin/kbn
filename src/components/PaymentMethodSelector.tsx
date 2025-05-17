import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { PaymentMethod } from "data/Constant";

const { Option } = Select;

interface PaymentMethodSelectorProps extends Omit<SelectProps, "ref"> {
  placeholder?: string;
  isBaac?: boolean;
}

export interface PaymentMethodSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const PaymentMethodSelector = forwardRef<PaymentMethodSelectorRef, PaymentMethodSelectorProps>(
  ({ placeholder, isBaac, ...props }, ref) => {
    const selectMethodRef = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectMethodRef.current?.focus();
        },
        blur: () => {
          selectMethodRef.current?.blur();
        },
        clear: () => {
          selectMethodRef.current?.clear();
        },
        isFocused: () => {
          return selectMethodRef.current?.isFocused() ?? false;
        },
        setNativeProps: (nativeProps: any) => {
          selectMethodRef.current?.setNativeProps?.(nativeProps);
        }
      }),
      []
    );

    return (
      <Select
        ref={selectMethodRef}
        placeholder={placeholder || "วิธีโอนเงิน"}
        dropdownStyle={{ minWidth: 150 }}
        {...props}
      >
        {Object.keys(PaymentMethod).map(sl => (
          <Option key={sl} value={sl}>
            {PaymentMethod[sl as keyof typeof PaymentMethod]}
          </Option>
        ))}
      </Select>
    );
  }
);

PaymentMethodSelector.displayName = "PaymentMethodSelector";

export default PaymentMethodSelector;