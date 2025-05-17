import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

const { Option } = Select;

const prefixes = [
  { value: 'นาย', label: 'นาย' },
  { value: 'นาง', label: 'นาง' },
  { value: 'นางสาว', label: 'นางสาว' },
  { value: 'หจก.', label: 'หจก.' },
  { value: 'บจก.', label: 'บจก.' },
  { value: 'บมจ.', label: 'บมจ.' },
  { value: 'ร้าน', label: 'ร้าน' }
];

interface PrefixAntProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (value: string) => void;
}

const PrefixAnt: React.FC<PrefixAntProps> = ({ onChange, ...props }) => {
  return (
    <Select
      {...props}
      onChange={onChange}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        const children = option?.children?.toString().toLowerCase() || '';
        return children.indexOf(input.toLowerCase()) >= 0;
      }}
    >
      {prefixes.map(prefix => (
        <Option key={prefix.value} value={prefix.value}>
          {prefix.label}
        </Option>
      ))}
    </Select>
  );
};

export default PrefixAnt; 