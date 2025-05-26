import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button } from 'elements';
import { PrinterFilled } from '@ant-design/icons';

export default function PrintComponent({
  ComponentToPrint,
  buttonText,
  hideComponent,
  buttonSize,
  className,
  disabled,
  type,
  buttonStyle,
  onAfterPrint,
  fileName,
  validateBeforePrint // new prop added for validation
}) {
  let componentRef = useRef();

  const trigger = () => (
    <Button
      className={className}
      disabled={disabled}
      size={buttonSize || 'middle'}
      icon={<PrinterFilled />}
      type={type}
      style={
        buttonStyle || {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: 120
        }
      }
    >
      {buttonText || 'พิมพ์'}
    </Button>
  );

  return (
    <div>
      <ReactToPrint
        trigger={trigger}
        content={() => componentRef}
        onBeforePrint={async () => {
          if (typeof validateBeforePrint === 'function') {
            const isValid = await validateBeforePrint();
            if (!isValid) {
              // Validation failed, cancel printing by throwing an error.
              throw new Error('ข้อมูลในใบจองยังไม่สมบูรณ์');
            }
          }
          window.originalTitle = document.title;
          document.title = fileName || 'Document';
        }}
        onAfterPrint={() => {
          // Restore the original title.
          document.title = window.originalTitle;
          if (onAfterPrint) onAfterPrint();
        }}
        pageStyle={`
          @page {
            size: A4;
            margin: 8mm;
          }
          @media print {
            .page-break {
              page-break-after: always;
            }
          }
        `}
      />
      <div {...(hideComponent && { style: { display: 'none' } })}>
        <ComponentToPrint ref={el => (componentRef = el)} />
      </div>
    </div>
  );
}
