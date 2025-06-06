import React from 'react';
import { Field } from 'formik';
import Prefix from 'components/Prefix';

export default ({ name, commaNumber, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <Prefix
            value={value}
            onChange={e => setFieldValue(name, e.target.value)}
            onBlur={handleBlur}
            error={errors[name]}
            {...props}
          />
        );
      }}
    </Field>
  );
};
