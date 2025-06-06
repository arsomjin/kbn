import React from 'react';
import { Field } from 'formik';
import BranchSelector from 'components/BranchSelector';

export default ({ name, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <BranchSelector
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
