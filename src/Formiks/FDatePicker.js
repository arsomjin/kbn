import React from 'react';
import { Field } from 'formik';
import MDatePicker from 'components/common/MDatePicker';
import dayjs from 'dayjs';

export default ({ name, commaNumber, ...props }) => {
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <MDatePicker
            selected={
              value ? new Date(dayjs(value, 'YYYY-MM-DD').toDate()) : null
            }
            onDateChange={(val) =>
              setFieldValue(name, val ? dayjs(val).format('YYYY-MM-DD') : null)
            }
            onBlur={handleBlur}
            error={errors[name]}
            {...props}
          />
        );
      }}
    </Field>
  );
};
