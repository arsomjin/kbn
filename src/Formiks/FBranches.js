import React from 'react';
import { Field } from 'formik';
import Branches from 'components/Branches';

export default ({ name, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <Branches
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
