import React from 'react';
import { PrintContainerProps } from './types';

const PrintContainer: React.FC<PrintContainerProps> = ({ children, className, style }) => {
  return (
    <div className={className} style={{ padding: 48, ...style }}>
      {children}
    </div>
  );
};

export default PrintContainer; 