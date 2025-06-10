/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { FormSelect } from 'shards-react';
import { useSelector } from 'react-redux';
import { getBranchName } from '../utils/mappings';

export default props => {
  const { branches } = useSelector(state => state.data);
  return (
    <>
      <label>สาขา</label>
      <FormSelect {...props}>
        {Object.keys(branches).map(key => (
          <option key={key} value={key}>
            {getBranchName(key) || branches[key].branchName}
          </option>
        ))}
      </FormSelect>
      {props.error && <a className="text-danger">{props.error}</a>}
    </>
  );
};
