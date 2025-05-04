import { usePrintContext } from './PrintProvider';

export const usePrint = () => {
  const context = usePrintContext();
  return context.print;
};
