import React, { useEffect, useState } from 'react';
import { Progress, ProgressProps } from 'antd';

interface CustomProgressProps {
  percent?: number;
  type?: 'circle' | 'line' | 'dashboard';
  strokeColor?: { '0%': string; '100%': string };
}

export default ({
  percent = 0,
  type = 'circle',
  strokeColor = {
    '0%': '#108ee9',
    '100%': '#87d068'
  }
}: CustomProgressProps) => {
  const [progress, setPercent] = useState(percent);
  useEffect(() => {
    setPercent(percent);
  }, [percent]);

  return <Progress {...{ percent: progress, type, strokeColor }} />;
};
