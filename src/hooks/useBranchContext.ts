import { useContext } from 'react';
import { BranchContext } from '../contexts/BranchContext';

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }

  return context;
};
