import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

const { Option } = Select;

interface WithHoldingTaxSelectorProps extends Omit<SelectProps, 'ref'> {
  placeholder?: string;
}

export interface WithHoldingTaxSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const WithHoldingTaxSelector = forwardRef<WithHoldingTaxSelectorRef, WithHoldingTaxSelectorProps>(
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
      <Select ref={selectRef} placeholder={placeholder || 'หัก ณ ที่จ่าย'} dropdownStyle={{ minWidth: 140 }} {...props}>
        <Option value={0}>ไม่หัก ณ ที่จ่าย</Option>
        <Option value={1}>หัก ณ ที่จ่าย 1%</Option>
        <Option value={2}>หัก ณ ที่จ่าย 2%</Option>
        <Option value={3}>หัก ณ ที่จ่าย 3%</Option>
        <Option value={5}>หัก ณ ที่จ่าย 5%</Option>
      </Select>
    );
  }
);

WithHoldingTaxSelector.displayName = 'WithHoldingTaxSelector';

export default WithHoldingTaxSelector;
