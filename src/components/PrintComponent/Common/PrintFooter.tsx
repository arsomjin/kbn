import React from 'react';
import { Row } from 'antd';
import { PrintFooterProps } from './types';

const PrintFooter: React.FC<PrintFooterProps> = ({ text, className }) => {
  return (
    <Row style={{ marginTop: 48, justifyContent: 'center' }} className={className}>
      {text}
    </Row>
  );
};

export default PrintFooter; 