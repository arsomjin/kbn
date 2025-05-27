import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Input, InputNumber, Row, Col } from 'antd';
import MaskedInput from 'antd-mask-input';
import { formatNumber, parser } from 'utils/functions';

import './index.css';

export default forwardRef((props, ref) => {
  const {
    lastField,
    preventAutoSubmit: _preventAutoSubmit,
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
    spans: _spans,
    ...mProps
  } = props;

  const input = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        input.current.focus();
      },

      blur: () => {
        input.current.blur();
      },

      clear: () => {
        input.current.clear();
      },

      isFocused: () => {
        return input.current.isFocused();
      },

      setNativeProps(nativeProps) {
        input.current.setNativeProps(nativeProps);
      },
    }),
    [],
  );

  const formatter = (val) => formatNumber(val);
  const inputParser = (val) => parser(val);
  const _onKeyPress = (e) => {
    if (e.key === 'Enter') {
      // if (preventAutoSubmit) {
      //   e.preventDefault();
      // }
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        let nextFocus = 1;
        if (focusNextField) {
          nextFocus = focusNextField;
        }
        if (form.elements[index + nextFocus]) {
          form.elements[index + nextFocus].focus();
          e.preventDefault();
        }
        if (lastField) {
          e.target.blur();
        }
      }
      onKeyPress && onKeyPress(e);
    }
  };

  const isNumber = number || decimals || currency;

  const InputComponent = mask ? MaskedInput : isNumber ? InputNumber : Input;

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
        <Row className="align-items-center" style={{ width: '100%' }}>
          {addonBefore && (
            <Col>
              <div className={`text-nowrap px-1`} style={{ height }}>
                <label {...(primaryBefore && primaryClass)}>{addonBefore}</label>
              </div>
            </Col>
          )}
          <Col style={{ flex: 1 }}>
            <InputComponent
              ref={input}
              onKeyPress={_onKeyPress}
              formatter={formatter}
              parser={inputParser}
              // bordered={!(center || alignRight)}
              variant="borderless"
              size={size}
              style={{
                ...mProps.style,
                ...(!(center || alignRight) && { width: '100%' }),
              }}
              {...mProps}
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

  return (
    <InputComponent
      ref={input}
      mask={mask}
      className={alignClass}
      onKeyPress={_onKeyPress}
      size={size}
      addonAfter={addonAfter}
      addonBefore={addonBefore}
      {...mProps}
    />
  );
});
