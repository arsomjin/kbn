import React from 'react';
import { Field } from 'formik';
import { Selector } from 'elements';

export default ({ name, commaNumber, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name} type="number">
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <Selector
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
