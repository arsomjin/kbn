import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import classNames from 'classnames';
import { InputGroup, DatePicker, InputGroupAddon, InputGroupText } from 'shards-react';
import { isMobile } from 'react-device-detect';

import { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import { useMergeState } from 'api/CustomHooks';
import moment from 'moment';

export default forwardRef(({ value, onChange, format, placeholder, className, ...props }, ref) => {
  const [range, setRange] = useMergeState({
    startDate: undefined,
    endDate: undefined
  });
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

  useEffect(() => {
    registerLocale('th', th);
  }, []);

  useEffect(() => {
    if (value) {
      setRange({
        startDate: moment(value[0], 'YYYY-MM-DD'),
        endDate: moment(value[1], 'YYYY-MM-DD')
      });
    }
  }, [setRange, value]);

  const handleStartDateChange = value => {
    setRange({ startDate: new Date(value) });
    onChange && onChange([moment(value).format('YYYY-MM-DD'), moment(range.endDate).format('YYYY-MM-DD')]);
  };

  const handleEndDateChange = value => {
    setRange({ endDate: new Date(value) });
    onChange && onChange([moment(range.startDate).format('YYYY-MM-DD'), moment(value).format('YYYY-MM-DD')]);
  };

  const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

  return (
    <div ref={dateRef}>
      <InputGroup className={classes}>
        <DatePicker
          size="sm"
          selected={range.startDate}
          onChange={handleStartDateChange}
          placeholderText="เริ่มต้น"
          dropdownMode="select"
          className="text-center"
          locale="th"
          dateFormat="dd/MM/yyyy"
          onFocus={e => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
          maxDate={range.endDate || new Date()}
        />
        <DatePicker
          size="sm"
          selected={range.endDate}
          onChange={handleEndDateChange}
          placeholderText="สิ้นสุด"
          dropdownMode="select"
          className="text-center"
          locale="th"
          dateFormat="dd/MM/yyyy"
          onFocus={e => isMobile && (e.target.readOnly = true)}
          popperPlacement="auto-left"
          minDate={range.startDate || new Date()}
        />
        <InputGroupAddon type="append">
          <InputGroupText>
            <i className="material-icons">&#xE916;</i>
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
});
