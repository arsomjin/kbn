/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { FormSelect } from 'shards-react';

export default ({ label, error, ...props }) => (
  <>
    <label>คำนำหน้า</label>
    <FormSelect {...props}>
      <option>นาย</option>
      <option>นาง</option>
      <option>นางสาว</option>
      <option>ร้าน</option>
      <option>หจก.</option>
      <option>บจก.</option>
      <option>บมจ.</option>
    </FormSelect>
    {/* {error && <a className="text-danger">{error}</a>} */}
  </>
);
