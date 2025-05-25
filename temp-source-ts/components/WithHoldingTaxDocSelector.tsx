import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

const { Option } = Select;

interface WithHoldingTaxDocSelectorProps extends Omit<SelectProps, 'ref'> {
  placeholder?: string;
}

export interface WithHoldingTaxDocSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const WithHoldingTaxDocSelector = forwardRef<WithHoldingTaxDocSelectorRef, WithHoldingTaxDocSelectorProps>(
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
      <Select ref={selectRef} placeholder={placeholder || 'แบบแสดงภาษี หัก ณ ที่จ่าย'} {...props}>
        <Option value={1}>ภงด. 1</Option>
        <Option value={3}>ภงด. 3</Option>
        <Option value={53}>ภงด. 53</Option>
      </Select>
    );
  }
);

WithHoldingTaxDocSelector.displayName = 'WithHoldingTaxDocSelector';

export default WithHoldingTaxDocSelector;
