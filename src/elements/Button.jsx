import React, { forwardRef } from 'react';
import { Button } from 'antd';

export default forwardRef(({ className, ...props }, ref) => {
  let defaultClass = 'align-items-center justify-content-center';
  return <Button className={`${className || ''} ${defaultClass}`} {...props} />;
});
