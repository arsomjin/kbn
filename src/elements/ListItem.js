import React from 'react';
import { Tag } from 'antd';

const ListItem = ({ label, info, isTag, color }) => {
  return (
    <div className="d-flex flex-row">
      <div className="text-right" style={{ width: 160 }}>
        <label className="mr-3 text-muted">{label}:</label>
      </div>
      <div>
        {isTag ? (
          <Tag color={color || 'blue'} key={`${label}${info}`}>
            {info || '-'}
          </Tag>
        ) : (
          info || '-'
        )}
      </div>
    </div>
  );
};

export default ListItem;
