import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { DatePicker } from 'antd';
import 'moment/locale/th';
import locale from 'antd/es/date-picker/locale/th_TH';
import moment from 'moment';
const { RangePicker } = DatePicker;

export default forwardRef(({ value, onChange, format, placeholder, ...props }, ref) => {
  const dateRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        dateRef.current.focus();
      },

      blur: () => {
        dateRef.current.blur();
      },

      clear: () => {
        dateRef.current.clear();
      },

      isFocused: () => {
        return dateRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        dateRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const _onChange = (date, dateString) => {
    //  showLog({ date, dateString, value });
    onChange && onChange([moment(date[0]).format('YYYY-MM-DD'), moment(date[1]).format('YYYY-MM-DD')], dateString);
    // onChange && onChange(date, dateString);
  };

  //  showLog({ value });
  return (
    <RangePicker
      ref={dateRef}
      format={format || 'DD/MM/YYYY'}
      // placeholder={placeholder || 'วันที่'}
      locale={locale}
      onChange={_onChange}
      {...(value && {
        value: [moment(value[0]).format('YYYY-MM-DD'), moment(value[1]).format('YYYY-MM-DD')]
      })}
      allowClear={false}
      {...props}
    />
  );
});
