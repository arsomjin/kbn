import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import DatePick from './DatePick';
import RangePick from './RangePick';

export const ensureDayjs = (value, format) => {
  // Return null for null/undefined values
  if (!value) {
    return null;
  }

  // Already a valid Dayjs instance
  if (
    value &&
    typeof value === 'object' &&
    typeof value.isValid === 'function' &&
    value.isValid()
  ) {
    return value;
  }

  // Handle string values
  if (typeof value === 'string') {
    // Check for time-only string (HH:mm or HH:mm:ss)
    if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
      // Use today as the date
      const today = dayjs().format('YYYY-MM-DD');
      return dayjs(`${today}T${value}`);
    }

    // Try to parse with format if provided
    if (format) {
      const parsed = dayjs(value, format, true); // strict parsing
      if (parsed.isValid()) {
        return parsed;
      }
    }

    // Fallback to default parsing
    const fallback = dayjs(value);
    if (fallback.isValid()) {
      return fallback;
    }
  }

  // Try to convert if it's a number or Dayjs-like object
  if (value) {
    const converted = dayjs(value.$d || value); // $d is the native Date inside Dayjs
    if (converted.isValid()) {
      return converted;
    }
  }

  // If all else fails, return null
  console.warn('[ensureDayjs] Could not parse date value:', value, 'with format:', format);
  return null;
};

export default forwardRef(
  ({ value, onChange, format, placeholder, picker, isRange, disabledDate, ...props }, ref) => {
    // Set Thai locale for dayjs
    dayjs.locale('th');

    const isMonth = picker === 'month';
    const isYear = picker === 'year';
    const isTime = picker === 'time';

    const mFormat = isMonth ? 'YYYY-MM' : isYear ? 'YYYY' : isTime ? 'HH:mm' : 'YYYY-MM-DD';

    const dFormat = isMonth ? 'MM/YYYY' : isYear ? 'YYYY' : isTime ? 'HH:mm' : 'DD/MM/YYYY';

    const mProps = {
      ...{
        value,
        onChange,
        format,
        placeholder,
        picker,
        mFormat,
        dFormat,
        ...props,
      },
    };

    return isRange ? (
      <RangePick ref={ref} {...mProps} />
    ) : (
      <DatePick ref={ref} disabledDate={disabledDate} {...mProps} />
    );
  },
);
