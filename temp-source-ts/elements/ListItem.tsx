import React from 'react';
import { Tag } from 'antd';

interface ListItemProps {
  label: string;
  info: string | number | null | undefined;
  isTag?: boolean;
  color?: string;
}

const ListItem: React.FC<ListItemProps> = ({ label, info, isTag, color }) => {
  return (
    <div className='d-flex flex-row'>
      <div className='text-right' style={{ width: 160 }}>
        <label className='mr-3 text-muted'>{label}:</label>
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
