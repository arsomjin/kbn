import React from 'react';
import { ListGroupItem, Progress } from 'shards-react';

const ProgressBars = () => (
  <ListGroupItem className="px-3">
    <div className="mb-2">
      <strong className="text-muted d-block mb-3">Progress Bars</strong>
      <Progress style={{ height: '5px' }} value={50} className="mb-3" />
      <Progress theme="royal-blue" style={{ height: '5px' }} className="mb-3" value={40} />
      <Progress theme="salmon" style={{ height: '5px' }} className="mb-3" value={60} />
      <Progress theme="warning" style={{ height: '5px' }} className="mb-3" value={80} />
    </div>
  </ListGroupItem>
);

export default ProgressBars;
