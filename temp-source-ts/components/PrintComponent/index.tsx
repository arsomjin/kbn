import React, { useRef, forwardRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button } from 'elements';
import { PrinterFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PrintComponentProps } from './types';

// Extend Window interface
declare global {
  interface Window {
    originalTitle: string;
  }
}

const PrintComponent: React.FC<PrintComponentProps> = ({
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
  validateBeforePrint
}) => {
  const { t } = useTranslation('common');
  const componentRef = useRef<HTMLDivElement>(null);

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
      {buttonText || t('print')}
    </Button>
  );

  return (
    <div>
      <ReactToPrint
        trigger={trigger}
        content={() => componentRef.current}
        onBeforePrint={async () => {
          if (typeof validateBeforePrint === 'function') {
            const isValid = await validateBeforePrint();
            if (!isValid) {
              throw new Error(t('print.validation.incomplete'));
            }
          }
          window.originalTitle = document.title;
          document.title = fileName || t('print.document');
        }}
        onAfterPrint={() => {
          document.title = window.originalTitle;
          onAfterPrint?.();
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
        <div ref={componentRef}>
          <ComponentToPrint />
        </div>
      </div>
    </div>
  );
};

export default PrintComponent;
