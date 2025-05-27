import React, { useState } from 'react';
import { Row, Col, Typography } from 'antd';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from 'elements';

const { Text } = Typography;

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFViewer - A component for viewing PDF documents
 *
 * Features:
 * - i18next translation support for all text content
 * - Single page or multi-page viewing modes
 * - Navigation controls (first, previous, next, last page)
 * - Responsive design with mobile optimization
 * - Dark mode compatible styling
 * - Page counter display
 * - Ant Design Grid layout system
 *
 * @param {Object} props - Component props
 * @param {string|File|ArrayBuffer} props.pdf - PDF source (URL, file, or buffer)
 * @param {boolean} [props.singlePage=false] - Whether to show single page with navigation
 * @returns {JSX.Element} The PDF viewer component
 */
const PDFViewer = ({ pdf, singlePage = false }) => {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  if (singlePage) {
    return (
      <>
        <div
          className={`
          overflow-y-auto w-full
          ${isMobile ? 'h-[85vh]' : ''}
        `}
        >
          <Document
            file={pdf}
            options={{ workerSrc: '/pdf.worker.js' }}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <Page pageNumber={pageNumber} />
          </Document>
        </div>

        <div className="pdf-footer bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <Row gutter={[8, 8]} align="middle" justify="center" className="mb-3">
            <Col>
              <Button
                type="text"
                icon={<DoubleLeftOutlined className="text-gray-500 dark:text-gray-400" />}
                onClick={() => setPageNumber(1)}
                disabled={pageNumber <= 1}
                className={`mr-2 ${pageNumber <= 1 ? 'opacity-0' : 'opacity-100'}`}
                size="small"
              />
            </Col>

            {pageNumber > 1 && (
              <Col>
                <Button
                  shape="round"
                  size="small"
                  icon={<LeftOutlined />}
                  disabled={pageNumber <= 1}
                  onClick={previousPage}
                  className="w-24 mr-2"
                >
                  {t('pdfViewer.previous')}
                </Button>
              </Col>
            )}

            {pageNumber < numPages && (
              <Col>
                <Button
                  shape="round"
                  size="small"
                  icon={<RightOutlined />}
                  disabled={pageNumber >= numPages}
                  onClick={nextPage}
                  className="w-24"
                >
                  {t('pdfViewer.next')}
                </Button>
              </Col>
            )}

            <Col>
              <Button
                type="text"
                icon={<DoubleRightOutlined className="text-gray-500 dark:text-gray-400" />}
                onClick={() => setPageNumber(numPages)}
                disabled={pageNumber >= numPages}
                className={`ml-2 ${pageNumber >= numPages ? 'opacity-0' : 'opacity-100'}`}
                size="small"
              />
            </Col>
          </Row>

          <div className="text-center">
            <Text className="text-gray-500 dark:text-gray-400">
              {t('pdfViewer.pageInfo', {
                current: pageNumber || (numPages ? 1 : '--'),
                total: numPages || '--',
              })}
            </Text>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <Document
        file={pdf}
        options={{ workerSrc: '/pdf.worker.js' }}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} className="mb-4 shadow-lg" />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
