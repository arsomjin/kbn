import React, { forwardRef, useMemo } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { isMobile } from 'react-device-detect';
import PropTypes from 'prop-types';

// Custom Thai locale for dayjs compatibility
const thaiDatePickerLocale = {
  lang: {
    locale: 'th_TH',
    placeholder: 'เลือกวันที่',
    rangePlaceholder: ['วันที่เริ่มต้น', 'วันที่สิ้นสุด'],
    today: 'วันนี้',
    now: 'ตอนนี้',
    backToToday: 'กลับไปวันนี้',
    ok: 'ตกลง',
    clear: 'ล้าง',
    month: 'เดือน',
    year: 'ปี',
    timeSelect: 'เลือกเวลา',
    dateSelect: 'เลือกวันที่',
    monthSelect: 'เลือกเดือน',
    yearSelect: 'เลือกปี',
    decadeSelect: 'เลือกทศวรรษ',
    yearFormat: 'YYYY',
    dateFormat: 'D/M/YYYY',
    dayFormat: 'D',
    dateTimeFormat: 'D/M/YYYY HH:mm:ss',
    monthBeforeYear: true,
    previousMonth: 'เดือนก่อนหน้า (PageUp)',
    nextMonth: 'เดือนถัดไป (PageDown)',
    previousYear: 'ปีก่อนหน้า (Control + left)',
    nextYear: 'ปีถัดไป (Control + right)',
    previousDecade: 'ทศวรรษก่อนหน้า',
    nextDecade: 'ทศวรรษถัดไป',
    previousCentury: 'ศตวรรษก่อนหน้า',
    nextCentury: 'ศตวรรษถัดไป',
  },
  timePickerLocale: {
    placeholder: 'เลือกเวลา',
  },
};

const DatePick = forwardRef(
  (
    {
      value,
      onChange,
      format,
      mFormat,
      dFormat,
      placeholder,
      picker,
      disabledDate,
      ...props
    },
    ref
  ) => {
    const isMonth = picker === 'month';
    const isYear = picker === 'year';
    const isTime = picker === 'time';

    const _onChange = (date, dateString) => {
      //   showLog({ date, dateString });
      if (onChange) {
        if (date) {
          // 🔧 CRITICAL FIX: Ensure we're working with dayjs objects
          const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
          onChange(dayjsDate.format(mFormat), dateString);
        } else {
          onChange(null, dateString);
        }
      }
    };

    // 🔧 CRITICAL FIX: Enhanced dayjs value handling
    const dayjsValue = useMemo(() => {
      if (typeof value === 'undefined' || value === null || value === '') {
        return null;
      }

      // If value is already a dayjs object, return it as-is
      if (dayjs.isDayjs(value)) {
        return value.isValid() ? value : null;
      }

      // Handle various input formats
      try {
        let parsed;
        if (typeof value === 'string') {
          // Try parsing with the specified format first
          if (mFormat) {
            parsed = dayjs(value, mFormat);
            if (parsed.isValid()) return parsed;
          }
          // Fallback to default parsing
          parsed = dayjs(value);
        } else if (value instanceof Date) {
          parsed = dayjs(value);
        } else {
          parsed = dayjs(value);
        }

        return parsed.isValid() ? parsed : null;
      } catch (error) {
        console.warn('DatePicker: Invalid date value:', value, error);
        return null;
      }
    }, [value, mFormat]);

    return (
      <DatePicker
        ref={ref}
        format={format || dFormat}
        placeholder={
          placeholder ||
          (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่')
        }
        locale={thaiDatePickerLocale}
        onChange={_onChange}
        value={dayjsValue}
        allowClear={true}
        picker={picker}
        disabledDate={disabledDate}
        onFocus={(e) => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        {...props}
      />
    );
  }
);

DatePick.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  format: PropTypes.string,
  mFormat: PropTypes.string,
  dFormat: PropTypes.string,
  placeholder: PropTypes.string,
  picker: PropTypes.string,
  disabledDate: PropTypes.func,
};

DatePick.displayName = 'DatePick';

export default DatePick;
