import React from 'react';

export default ({ info, className }) => (
  <h6 className={className || 'm-0 text-danger'}>{info || 'กรุณาตรวจสอบข้อมูล'}</h6>
);
