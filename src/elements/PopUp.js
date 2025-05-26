import React, { useState } from 'react';
import { Popover, Tag } from 'antd';
const PopUp = ({ title, label, content, color }) => {
  const [open, setOpen] = useState(false);
  const hide = () => {
    setOpen(false);
  };
  const handleOpenChange = newOpen => {
    setOpen(newOpen);
  };
  return (
    <Popover
      {...(content && { content })}
      title={title || 'Title'}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Tag color={color || 'green'} style={{ fontSize: 13 }}>
        {label || 'Click me'}
      </Tag>
      {/* <Button type={type || 'primary'}>{label || 'Click me'}</Button> */}
    </Popover>
  );
};
export default PopUp;
