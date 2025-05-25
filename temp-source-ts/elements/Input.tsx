import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Input as AntInput, InputNumber, Row, Col } from 'antd';
import MaskedInput from 'antd-mask-input';
import { formatNumber, parser } from 'utils/functions';

import './index.css';

interface InputProps extends Omit<React.ComponentProps<typeof AntInput>, 'mask'> {
  lastField?: boolean;
  preventAutoSubmit?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  focusNextField?: number;
  mask?: string;
  number?: boolean;
  currency?: boolean;
  decimals?: boolean;
  center?: boolean;
  alignLeft?: boolean;
  alignRight?: boolean;
  size?: 'small' | 'middle' | 'large';
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  primaryBefore?: boolean;
  spans?: number[];
}

interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    lastField,
    preventAutoSubmit,
    onKeyPress,
    focusNextField,
    mask,
    number,
    currency,
    decimals,
    center,
    alignLeft,
    alignRight,
    size,
    addonBefore,
    addonAfter,
    primaryBefore,
    spans,
    value,
    onChange,
    ...mProps
  } = props;

  const input = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        input.current?.focus();
      },

      blur: () => {
        input.current?.blur();
      },

      clear: () => {
        input.current?.clear();
      },

      isFocused: () => {
        return input.current?.isFocused();
      },

      setNativeProps(nativeProps: any) {
        input.current?.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const formatter = (val: string | number | undefined) => formatNumber(val) as string;
  const inputParser = (val: string | undefined) => parser(val ?? '') as string | number;
  const _onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = (e.target as HTMLInputElement).form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        let nextFocus = 1;
        if (focusNextField) {
          nextFocus = focusNextField;
        }
        if (form.elements[index + nextFocus]) {
          (form.elements[index + nextFocus] as HTMLElement).focus();
          e.preventDefault();
        }
        if (lastField) {
          (e.target as HTMLInputElement).blur();
        }
      }
      onKeyPress && onKeyPress(e);
    }
  };

  const isNumber = number || decimals || currency;

  let alignClass = isNumber ? 'justify-content-start' : 'text-left';

  if (alignLeft) {
    alignClass = isNumber ? 'justify-content-start' : 'text-left';
  }
  if (alignRight) {
    alignClass = isNumber ? 'justify-content-end' : 'text-right';
  }
  if (center) {
    alignClass = isNumber ? 'justify-content-center' : 'text-center';
  }

  const primaryClass = { className: 'text-primary' };

  if (isNumber) {
    const height = size ? (size === 'small' ? 24 : size === 'large' ? 40 : 32) : 24;
    return (
      <div className={`d-flex ${alignClass} border`} style={{ height }}>
        <Row className='align-items-center' style={{ width: '100%' }}>
          {addonBefore && (
            <Col>
              <div className={`text-nowrap px-1`} style={{ height }}>
                <label {...(primaryBefore && primaryClass)}>{addonBefore}</label>
              </div>
            </Col>
          )}
          <Col style={{ flex: 1 }}>
            <InputNumber
              ref={input}
              onKeyPress={_onKeyPress}
              formatter={formatter}
              parser={inputParser}
              bordered={false}
              size={size}
              value={value as number}
              onChange={val => onChange && onChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
              style={{
                ...mProps.style,
                ...(!(center || alignRight) && { width: '100%' })
              }}
              {...(mProps as any)}
            />
          </Col>
          {addonAfter && (
            <Col>
              <div className={`text-nowrap mx-1`} style={{ height }}>
                <label {...(primaryBefore && primaryClass)}>{addonAfter}</label>
              </div>
            </Col>
          )}
        </Row>
      </div>
    );
  }

  if (mask) {
    return (
      <MaskedInput
        ref={input}
        mask={mask}
        className={alignClass}
        onKeyPress={_onKeyPress}
        size={size}
        addonAfter={addonAfter}
        addonBefore={addonBefore}
        value={value as string}
        onChange={e => onChange && onChange(e)}
        {...(mProps as any)}
      />
    );
  }

  return (
    <AntInput
      ref={input}
      className={alignClass}
      onKeyPress={_onKeyPress}
      size={size}
      addonAfter={addonAfter}
      addonBefore={addonBefore}
      value={value}
      onChange={onChange}
      {...mProps}
    />
  );
});

export default Input;
