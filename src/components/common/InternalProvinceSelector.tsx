import React from 'react';
import ProvinceSelector from './ProvinceSelector';

const INTERNAL_PROVINCES = [
  "nakhon-ratchasima",
  "nakhon-sawan"
];

const InternalProvinceSelector: React.FC<React.ComponentProps<typeof ProvinceSelector>> = (props) => {
  return <ProvinceSelector {...props} allowedProvinces={INTERNAL_PROVINCES} />;
};

export default InternalProvinceSelector; 