import { DatePicker } from 'antd';
import { showLog } from 'utils/functions';
import dayjs from 'dayjs';
import React, { forwardRef, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
const { RangePicker } = DatePicker;

export default forwardRef(
  ({ value, onChange, format, placeholder, picker, mFormat, dFormat, ...props }, ref) => {
    const [dates, setDates] = useState(null);
    const [cValue, setCValue] = useState(null);

    useEffect(() => {
      showLog({ YES_ISRANGE: value });
      setCValue(value);
    }, [value]);

    const disabledDateRange = (current) => {
      if (!dates) {
        return false;
      }
      const tooLate = dates[0] && current.diff(dates[0], 'month') > 0;
      const tooEarly = dates[1] && dates[1].diff(current, 'month') > 0;
      return !!tooEarly || !!tooLate;
    };

    const onOpenChange = (open) => {
      if (open) {
        setDates([null, null]);
      } else {
        setDates(null);
      }
    };

    const _onChange = (date, dateString) => {
      //   showLog({ date, dateString });
      if (onChange) {
        onChange([dateString[0], dateString[1]]);
        setCValue([dateString[0], dateString[1]]);
      }
    };

    const getValue = (valueD, valueC) => {
      if (typeof valueC === 'undefined') {
        return undefined;
      }

      if (valueC) {
        if (!!valueD && !!valueD[0]) {
          return [valueD[0], valueD[1]];
        } else {
          return [dayjs(valueC[0], mFormat), dayjs(valueC[1], mFormat)];
        }
      } else {
        return dayjs();
      }
    };

    return (
      <RangePicker
        ref={ref}
        value={() => getValue(dates, cValue)}
        disabledDate={disabledDateRange}
        onChange={_onChange}
        onCalendarChange={(val) => setDates(val)}
        onOpenChange={onOpenChange}
        allowClear={false}
        picker={picker}
        onFocus={(e) => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        onBlur={() => console.log('blur has been triggered')}
        {...props}
      />
    );
  },
);
