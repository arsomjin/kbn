import React, { useEffect, useState } from 'react';
import { Progress as AntProgress } from 'antd';

const Progress = ({
  percent = 0,
  type = 'circle',
  strokeColor = {
    '0%': '#108ee9',
    '100%': '#87d068',
  },
  trailColor,
  strokeWidth,
  size,
  showInfo,
  format,
  ...props
}) => {
  const [progress, setPercent] = useState(percent);
  useEffect(() => {
    setPercent(percent);
  }, [percent]);

  return <AntProgress {...{ percent: progress, type, strokeColor }} />;
};

export default Progress;
