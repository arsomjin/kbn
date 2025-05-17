import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import type { SelectProps, RefSelectProps } from 'antd/es/select';
import { PriceType, PriceTypeKey } from 'data/Constant';

const { Option } = Select;

interface PriceTypeSelectorProps extends Omit<SelectProps<string>, 'children'> {
  placeholder?: string;
}

const PriceTypeSelector = forwardRef<RefSelectProps, PriceTypeSelectorProps>(
  ({ placeholder, ...props }, ref) => {
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
        scrollTo: (...args: any[]) => {
          // @ts-ignore
          selectRef.current?.scrollTo?.(...args);
        },
        get nativeElement() {
          // @ts-ignore
          return selectRef.current?.nativeElement ?? document.createElement('div');
        }
      }),
      []
    );

    return (
      <Select ref={selectRef} placeholder={placeholder || 'ประเภทราคา'} {...props} style={{ ...props.style }}>
        {(Object.keys(PriceType) as PriceTypeKey[]).map(k => (
          <Option value={k} key={k}>
            {PriceType[k]}
          </Option>
        ))}
      </Select>
    );
  }
);

PriceTypeSelector.displayName = 'PriceTypeSelector';

export default PriceTypeSelector; 