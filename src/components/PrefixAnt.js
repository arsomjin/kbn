/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Select } from 'antd';

export default ({ label, error, onlyPerson, ...props }) =>
  !onlyPerson ? (
    <>
      <Select {...props}>
        <Select.Option value="นาย">นาย</Select.Option>
        <Select.Option value="นาง">นาง</Select.Option>
        <Select.Option value="นางสาว">นางสาว</Select.Option>
        <Select.Option value="ร้าน">ร้าน</Select.Option>
        <Select.Option value="หจก.">หจก.</Select.Option>
        <Select.Option value="บจก.">บจก.</Select.Option>
        <Select.Option value="บมจ.">บมจ.</Select.Option>
      </Select>
    </>
  ) : (
    <>
      <Select {...props}>
        <Select.Option value="นาย">นาย</Select.Option>
        <Select.Option value="นาง">นาง</Select.Option>
        <Select.Option value="นางสาว">นางสาว</Select.Option>
      </Select>
    </>
  );
