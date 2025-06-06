import React from 'react';
import { Field } from 'formik';
import { TextInput } from 'elements';

export default ({ name, commaNumber, ...props }) => {
  // showLog('fInput_props', props);
  return (
    <Field name={name} id={name}>
      {({ field: { value }, form: { setFieldValue, handleBlur, errors } }) => {
        //  {(fieldProps) => {
        // //  showLog('field_props', fieldProps);
        //   const {
        //     field: { value },
        //     form: { setFieldValue },
        //   } = fieldProps;
        // let mValue = commaNumber ? numeral(value).format('0,0') : value;
        return (
          <TextInput
            value={value}
            onChange={e => {
              setFieldValue(name, e.target.value);
            }}
            onBlur={handleBlur}
            error={errors[name]}
            {...props}
          />
        );
      }}
    </Field>
  );
};
