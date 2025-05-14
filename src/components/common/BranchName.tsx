import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBranches } from '../../hooks/useBranches';
import { Spin } from 'antd';

interface BranchNameProps {
  code: string;
}

const BranchName: React.FC<BranchNameProps> = ({ code }) => {
  const { i18n } = useTranslation();
  const { branches, loading } = useBranches({ includeAll: true });
  const lang = i18n.language.startsWith('th') ? 'th' : 'en';

  if (loading) {
    return <Spin size="small" />;
  }
  console.log(branches);
  const branch = branches.find(b => b.branchCode === code);
  if (!branch) return <span>{code}</span>;

  return <span>{lang === 'th' ? branch.name : branch.nameEn}</span>;
};

export default BranchName; 