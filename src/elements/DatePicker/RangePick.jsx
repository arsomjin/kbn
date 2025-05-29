import { DatePicker } from 'antd';
import React, { forwardRef, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { ensureDayjs } from '.';

const { RangePicker } = DatePicker;

export default forwardRef(
  ({ value, onChange, picker, mFormat = 'YYYY-MM-DD', dFormat = 'DD/MM/YYYY', ...props }, ref) => {
    const [dates, setDates] = useState(null);
    const [pickerValue, setPickerValue] = useState(null);

    // Initialize picker value when value prop changes
    useEffect(() => {
      if (value && Array.isArray(value) && value.length === 2) {
        try {
          const startDate = ensureDayjs(value[0], mFormat);
          const endDate = ensureDayjs(value[1], mFormat);

          if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
            setPickerValue([startDate, endDate]);
          } else {
            console.warn('[RangePick] Invalid date values provided:', value);
            setPickerValue(null);
          }
        } catch (error) {
          console.error('[RangePick] Error processing value:', error);
          setPickerValue(null);
        }
      } else {
        setPickerValue(null);
      }
    }, [value, mFormat]);

    // Disable dates outside of selected month range
    const disabledDateRange = (current) => {
      if (!dates || !dates[0]) {
        return false;
      }

      // Only allow dates within the same month as the first selected date
      const firstDate = dates[0];
      const tooLate = current.diff(firstDate, 'month') > 0;
      const tooEarly = firstDate.diff(current, 'month') > 0;

      return tooEarly || tooLate;
    };

    const onOpenChange = (open) => {
      if (open) {
        setDates([null, null]);
      } else {
        setDates(null);
      }
    };

    const handleChange = (dateValues, dateStrings) => {
      if (onChange && dateStrings) {
        // Ensure we always pass valid date strings or null values
        const formattedStrings = [dateStrings[0] || null, dateStrings[1] || null];
        onChange(formattedStrings);
      }

      // Update internal state
      if (dateValues && dateValues[0] && dateValues[1]) {
        setPickerValue(dateValues);
      }
    };

    const handleCalendarChange = (dateValues) => {
      setDates(dateValues);
    };

    // Debug logging (can be removed in production)
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'development') {
      console.log('[RangePick] value:', value);
      console.log('[RangePick] pickerValue:', pickerValue);
      console.log('[RangePick] dates:', dates);
      console.log('[RangePick] mFormat:', mFormat);
      console.log('[RangePick] dFormat:', dFormat);
    }

    return (
      <RangePicker
        ref={ref}
        value={pickerValue}
        disabledDate={disabledDateRange}
        onChange={handleChange}
        onCalendarChange={handleCalendarChange}
        onOpenChange={onOpenChange}
        allowClear={false}
        picker={picker}
        format={dFormat}
        onFocus={(e) => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile
        onBlur={() => {
          // eslint-disable-next-line no-undef
          if (process.env.NODE_ENV === 'development') {
            console.log('[RangePick] blur triggered');
          }
        }}
        {...props}
      />
    );
  },
);
