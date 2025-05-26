/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
const { Option } = Select;
const TransferCycleItems = {
  hqTransfer: {
    name: 'รายจ่ายเงินโอนสำนักงานใหญ่',
    itemId: 'hqTransfer'
  },
  purchaseTransfer: {
    name: 'เงินโอนค่าซื้อสินค้า',
    itemId: 'purchaseTransfer'
  },
  referralFee: {
    name: 'ค่าแนะนำ',
    itemId: 'referralFee'
  }
  // others: {
  //   name: 'อื่นๆ',
  //   itemId: 'others',
  // },
};

export default forwardRef(({ hasAll, ...props }, ref) => {
  const selectRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current.focus();
      },

      blur: () => {
        selectRef.current.blur();
      },

      clear: () => {
        selectRef.current.clear();
      },

      isFocused: () => {
        return selectRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  return (
    <Select ref={selectRef} placeholder={'รายการรอบโอนเงิน'} className="text-primary" {...props}>
      {hasAll
        ? [
            <Option key="all" value="all">
              ทั้งหมด
            </Option>,
            ...Object.keys(TransferCycleItems).map(key => (
              <Option key={key} value={key}>
                {TransferCycleItems[key].name}
              </Option>
            ))
          ]
        : Object.keys(TransferCycleItems).map(key => (
            <Option key={key} value={key}>
              {TransferCycleItems[key].name}
            </Option>
          ))}
    </Select>
  );
});
