import React, { forwardRef } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import locale from 'antd/es/date-picker/locale/th_TH';
import { isMobile } from 'react-device-detect';

const CustomDatePicker = forwardRef(
  (
    { value, onChange, format, mFormat, dFormat, placeholder, picker, disabledDate, ...props },
    ref,
  ) => {
    const isMonth = picker === 'month';
    const isYear = picker === 'year';
    const isTime = picker === 'time';

    const _onChange = (date, dateString) => {
      //   showLog({ date, dateString });
      onChange && onChange(date ? date.valueOf() : null);
    };

    return (
      <DatePicker
        ref={ref}
        value={value ? dayjs(value) : null}
        onChange={_onChange}
        locale={locale}
        placeholder={
          placeholder || (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่')
        }
        allowClear={false}
        picker={picker}
        disabledDate={disabledDate}
        onFocus={(e) => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        {...props}
      />
    );
  },
);

export default CustomDatePicker;
