import React, { forwardRef } from 'react';
import 'dayjs/locale/th';
import DatePick from './DatePick';
import RangePick from './RangePick';

export default forwardRef(({ value, onChange, format, placeholder, picker, isRange, disabledDate, ...props }, ref) => {
  // showLog({ disabledDate });

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
      ...props
    }
  };

  return isRange ? <RangePick ref={ref} {...mProps} /> : <DatePick ref={ref} disabledDate={disabledDate} {...mProps} />;
});
