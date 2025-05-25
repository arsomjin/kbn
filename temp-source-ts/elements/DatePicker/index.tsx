import React, { forwardRef } from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { DateTime } from 'luxon';
import DatePick from './DatePick';
import RangePick from './RangePick';

type BaseProps = Omit<DatePickerProps, 'onChange' | 'value' | 'placeholder'>;

export interface CustomDatePickerProps extends BaseProps {
  value?: string | [string, string];
  onChange?: (value: string | [string, string], dateString: string | [string, string]) => void;
  format?: string;
  placeholder?: string | [string, string];
  picker?: 'date' | 'month' | 'year' | 'time';
  isRange?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
  mFormat?: string;
  dFormat?: string;
}

const CustomDatePicker = forwardRef<any, CustomDatePickerProps>(
  ({ value, onChange, format, placeholder, picker, isRange, disabledDate, mFormat, dFormat, ...props }, ref) => {
    const isMonth = picker === 'month';
    const isYear = picker === 'year';
    const isTime = picker === 'time';

    const getFormat = () => {
      if (format) return format;
      if (isMonth) return dFormat || 'MM/YYYY';
      if (isYear) return dFormat || 'YYYY';
      if (isTime) return dFormat || 'HH:mm';
      return dFormat || 'DD/MM/YYYY';
    };

    if (isRange) {
      return (
        <RangePick
          ref={ref}
          value={value as [string, string]}
          onChange={onChange as (value: [string, string], dateString: [string, string]) => void}
          format={getFormat()}
          placeholder={placeholder as [string, string]}
          picker={picker}
          mFormat={mFormat}
          dFormat={dFormat}
          {...props}
        />
      );
    }

    return (
      <DatePick
        ref={ref}
        value={value as string}
        onChange={onChange as (value: string, dateString: string) => void}
        format={getFormat()}
        placeholder={placeholder as string}
        picker={picker}
        disabledDate={disabledDate}
        mFormat={mFormat}
        dFormat={dFormat}
        {...props}
      />
    );
  }
);

CustomDatePicker.displayName = 'CustomDatePicker';

export default CustomDatePicker;
