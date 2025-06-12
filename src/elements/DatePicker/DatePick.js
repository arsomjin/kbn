import React, { forwardRef, useMemo } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import locale from 'antd/es/date-picker/locale/th_TH';
import { isMobile } from 'react-device-detect';

export default forwardRef(
  ({ value, onChange, format, mFormat, dFormat, placeholder, picker, disabledDate, ...props }, ref) => {
    const isMonth = picker === 'month';
    const isYear = picker === 'year';
    const isTime = picker === 'time';

    const _onChange = (date, dateString) => {
      //   showLog({ date, dateString });
      if (onChange) {
        if (date) {
          onChange(dayjs(date).format(mFormat), dateString);
        } else {
          onChange(null, dateString);
        }
      }
    };

    // Memoize the dayjs value to prevent infinite re-renders
    const dayjsValue = useMemo(() => {
      if (typeof value === 'undefined' || value === null) {
        return null;
      }
      // If value is already a dayjs object, return it as-is
      if (dayjs.isDayjs(value)) {
        return value;
      }
      // Parse string value to dayjs object
      return dayjs(value, mFormat);
    }, [value, mFormat]);

    return (
      <DatePicker
        ref={ref}
        format={format || dFormat}
        placeholder={placeholder || (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่')}
        locale={locale}
        onChange={_onChange}
        value={dayjsValue}
        allowClear={true}
        picker={picker}
        disabledDate={disabledDate}
        onFocus={e => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        {...props}
      />
    );
  }
);
