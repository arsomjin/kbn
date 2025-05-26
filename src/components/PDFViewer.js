import { FirstPageOutlined, LastPageOutlined } from '@material-ui/icons';
import Text from 'antd/lib/typography/Text';
import { Button } from 'elements';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Document, Page, pdfjs } from 'react-pdf';
import { Col, Row } from 'shards-react';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default ({ pdf, singlePage }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return singlePage ? (
    <>
      <div
        style={{
          overflowY: 'scroll',
          width: '100%',
          ...(isMobile && { height: '85vh' })
          // height: '85vh',
        }}
      >
        <Document file={pdf} options={{ workerSrc: '/pdf.worker.js' }} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="pdf-footer">
        <Row noGutters className="align-items-center">
          <Col>
            <Button
              type="text"
              icon={<FirstPageOutlined className="text-muted" />}
              onClick={() => setPageNumber(1)}
              className="mr-2"
              disabled={pageNumber <= 1}
              style={{ opacity: pageNumber <= 1 ? 0 : 1 }}
            />
          </Col>
          {pageNumber > 1 && (
            <Col>
              <Button
                shape="round"
                size="small"
                style={{
                  width: 100,
                  marginRight: pageNumber > 1 ? 10 : 0
                }}
                disabled={pageNumber <= 1}
                onClick={previousPage}
              >
                ก่อนหน้า
              </Button>
            </Col>
          )}
          {pageNumber < numPages && (
            <Col>
              <Button
                shape="round"
                size="small"
                style={{ width: 100 }}
                disabled={pageNumber >= numPages}
                onClick={nextPage}
              >
                ถัดไป
              </Button>
            </Col>
          )}
          <Col>
            <Button
              className="ml-2"
              type="text"
              icon={<LastPageOutlined className="text-muted" />}
              onClick={() => setPageNumber(numPages)}
              disabled={pageNumber >= numPages}
              style={{ opacity: pageNumber >= numPages ? 0 : 1 }}
            />
          </Col>
        </Row>
        <div className="mt-3">
          <Text className="text-muted">
            หน้า {pageNumber || (numPages ? 1 : '--')} จาก {numPages || '--'}
          </Text>
        </div>
      </div>
    </>
  ) : (
    <Document file={pdf} options={{ workerSrc: '/pdf.worker.js' }} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  );
};
