import React, { forwardRef } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const LabelWithTooltip = forwardRef(({ title, detail, className, ...props }, ref) => {
  let defaultClass = 'd-flex align-items-center flex-direction-center';
  return (
    <div className={`${className || ''} ${defaultClass}`} {...props}>
      <div>{title}</div>
      <Tooltip title={detail} className="m-3">
        <InfoCircleOutlined style={{ fontSize: 18 }} className="text-light" />
      </Tooltip>
    </div>
  );
});

export default LabelWithTooltip;
