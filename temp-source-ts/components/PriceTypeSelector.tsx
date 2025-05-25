import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import type { SelectProps, RefSelectProps } from 'antd/es/select';
import { PriceType, PriceTypeKey } from 'data/Constant';

const { Option } = Select;

interface PriceTypeOption {
  label: string;
  value: string;
}

interface PriceTypeSelectorProps extends Omit<SelectProps, 'options'> {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const PriceTypeSelector = forwardRef<RefSelectProps, PriceTypeSelectorProps>(
  ({ placeholder, value, onChange, ...props }, ref) => {
    const selectRef = useRef<RefSelectProps>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        scrollTo: (arg: any) => {
          selectRef.current?.scrollTo?.(arg);
        },
        get nativeElement() {
          return selectRef.current?.nativeElement ?? document.createElement('div');
        }
      }),
      []
    );

    const options: PriceTypeOption[] = (Object.keys(PriceType) as PriceTypeKey[]).map(k => ({
      label: PriceType[k],
      value: k
    }));

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || 'ประเภทราคา'}
        value={value}
        onChange={onChange}
        options={options}
        {...props}
        style={{ ...props.style }}
      />
    );
  }
);

PriceTypeSelector.displayName = 'PriceTypeSelector';

export default PriceTypeSelector;
