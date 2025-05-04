import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';

interface PrintContextProps {
  print: (content: ReactNode, options?: { title?: string }) => void;
}

export const PrintContext = createContext<PrintContextProps | undefined>(undefined);

export const PrintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [printContent, setPrintContent] = useState<ReactNode | null>(null);
  const [printTitle, setPrintTitle] = useState<string>('');
  const printWindowRef = useRef<Window | null>(null);

  const print = (content: ReactNode, options?: { title?: string }) => {
    setPrintContent(content);
    setPrintTitle(options?.title || 'Document');
    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${options?.title || 'Document'}</title>
              <link rel="stylesheet" type="text/css" href="/printStyles.css" />
            </head>
            <body>
              <div id="print-root"></div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindowRef.current = printWindow;
        setTimeout(() => {
          const printRoot = printWindow.document.getElementById('print-root');
          if (printRoot) {
            printRoot.innerHTML = (document.getElementById('print-content')?.innerHTML || '');
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }
        }, 500);
      }
    }, 100);
  };

  return (
    <PrintContext.Provider value={{ print }}>
      {children}
      {printContent && (
        <div style={{ display: 'none' }}>
          <div id="print-content">{printContent}</div>
        </div>
      )}
    </PrintContext.Provider>
  );
};

export const usePrintContext = () => {
  const context = useContext(PrintContext);
  if (!context) throw new Error('usePrintContext must be used within a PrintProvider');
  return context;
};
