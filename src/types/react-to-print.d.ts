declare module 'react-to-print' {
  import { ComponentType, RefObject } from 'react';

  interface ReactToPrintProps {
    trigger: () => React.ReactNode;
    content: () => HTMLElement | null;
    onBeforePrint?: () => Promise<void> | void;
    onAfterPrint?: () => void;
    pageStyle?: string;
    removeAfterPrint?: boolean;
    suppressErrors?: boolean;
  }

  const ReactToPrint: React.FC<ReactToPrintProps>;
  export default ReactToPrint;
} 