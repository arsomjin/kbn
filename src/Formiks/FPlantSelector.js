import React from 'react';
import { Field } from 'formik';
import PlantSelector from 'components/PlantSelector';

export default ({ name, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        return (
          <PlantSelector value={value} onChange={val => setFieldValue(name, val)} error={errors[name]} {...props} />
        );
      }}
    </Field>
  );
};
