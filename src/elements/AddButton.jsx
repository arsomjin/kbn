import React from 'react';
import { Tooltip, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AddButton = ({ onClick }) => {
  return (
    <Tooltip title="เพิ่มรายการ">
      <Button type="default" onClick={onClick} icon={<PlusOutlined />} />
    </Tooltip>
  );
};

export default AddButton;
