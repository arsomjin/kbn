import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Row, Col } from 'antd';
import Input from './Input';
import DatePicker from './DatePicker';
import BankSelector from 'components/BankSelector';
import SelfBankSelector from 'components/SelfBankSelector';
import VehicleSelector from 'components/VehicleSelector';
import SaleTypeSelector from 'components/SaleTypeSelector';
import TransferTypeSelector from 'components/TransferTypeSelector';
import BranchSelector from 'components/BranchSelector';
import CustomerSelector from '../modules/Customers/CustomerSelector';

export default forwardRef((props, ref) => {
  const {
    addonBefore,
    addonAfter,
    primary,
    primaryBefore,
    primaryAfter,
    value,
    onChange,
    spans,
    date,
    bank,
    selfBank,
    vehicle,
    vehicleModel,
    peripheral,
    saleType,
    transferType,
    transferInType,
    branch,
    customer,
    size,
    inputComponent,
    onlyUserBranch,
    ...mProps
  } = props;

  // showLog({ mProps });

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

  const mSpans = spans || [12, 8, 4];
  const primaryClass = { className: 'text-primary' };
  const height = size ? (size === 'small' ? 24 : size === 'large' ? 40 : 32) : 24;

  const InputComponent = date
    ? DatePicker
    : bank
      ? BankSelector
      : selfBank
        ? SelfBankSelector
        : vehicle || peripheral
          ? VehicleSelector
          : saleType
            ? SaleTypeSelector
            : transferType || transferInType
              ? TransferTypeSelector
              : branch
                ? BranchSelector
                : customer
                  ? CustomerSelector
                  : Input;

  return (
    <Row>
      {addonBefore && (
        <Col span={mSpans[0]}>
          <div
            className={`d-flex border bg-light text-nowrap px-1`}
            style={{
              height,
            }}
          >
            <label {...(primaryBefore && primaryClass)}>{addonBefore}</label>
          </div>
        </Col>
      )}
      <Col span={mSpans[1]}>
        {typeof inputComponent !== 'undefined' ? (
          inputComponent({ value, onChange, ...mProps })
        ) : (
          <InputComponent
            ref={input}
            value={value}
            onChange={onChange}
            size={size}
            {...(primary && primaryClass)}
            {...(peripheral && { peripheral: true })}
            {...(transferInType && { transferIn: true })}
            {...(!!onlyUserBranch && { onlyUserBranch })}
            {...mProps}
          />
        )}
      </Col>
      {addonAfter && (
        <Col span={mSpans[2]}>
          <div
            className={`d-flex border bg-light text-nowrap justify-content-center`}
            style={{ height }}
          >
            <label {...(primaryBefore && primaryClass)}>{addonAfter}</label>
          </div>
        </Col>
      )}
    </Row>
  );
});
