import React from 'react';
import { Field } from 'formik';
import MDatePicker from 'components/common/MDatePicker';
import moment from 'moment';

export default ({ name, commaNumber, ...props }) => {
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <MDatePicker
            selected={new Date(moment(value, 'YYYY-MM-DD'))}
            onDateChange={val => setFieldValue(name, moment(val).format('YYYY-MM-DD'))}
            onBlur={handleBlur}
            error={errors[name]}
            {...props}
          />
        );
      }}
    </Field>
  );
};
