import React from 'react';
import { Field } from 'formik';
import DealerSelector from 'components/DealerSelector';

export default ({ name, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <DealerSelector
            value={value}
            onChange={val => setFieldValue(name, val)}
            onBlur={handleBlur}
            error={errors[name]}
            {...props}
          />
        );
      }}
    </Field>
  );
};
