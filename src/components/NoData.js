import React from 'react';

export default ({ text }) => (
  <div className="text-center my-4">
    <small className="text-reagent-gray">{text || 'ไม่มีข้อมูล'}</small>
  </div>
);
