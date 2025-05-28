import React from 'react';
import { Tooltip, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AddButton = ({ onClick, ...props }) => {
  return (
    <Tooltip title="เพิ่มรายการ">
      <Button
        // type="ghost"
        size={props?.size || 'middle'}
        shape={props?.shape || 'circle'}
        onClick={onClick}
        icon={props?.icon || <PlusOutlined />}
        {...props}
      />
    </Tooltip>
  );
};

export default AddButton;
