import PDFViewer from 'components/PDFViewer';
import React from 'react';
import pdf from './Account.pdf';

export default () => {
  return <PDFViewer pdf={pdf} />;
};
