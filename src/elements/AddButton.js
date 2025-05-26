import React from 'react';
import { Tooltip } from 'antd';
import { Button } from 'shards-react';

export default ({ onClick }) => {
  return (
    <Tooltip title="เพิ่มรายการ">
      <Button theme="light" onClick={onClick}>
        <i className="material-icons text-primary" style={{ fontSize: 22 }}>
          add
        </i>
      </Button>
    </Tooltip>
  );
};
