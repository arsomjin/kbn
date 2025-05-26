import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';

export default ({
  percent = 0,
  type = 'circle',
  strokeColor = {
    '0%': '#108ee9',
    '100%': '#87d068'
  }
}) => {
  const [progress, setPercent] = useState(percent);
  useEffect(() => {
    setPercent(percent);
  }, [percent]);

  return <Progress {...{ percent: progress, type, strokeColor }} />;
};
