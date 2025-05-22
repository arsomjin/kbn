import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBranchesForProvince } from 'hooks/useBranchesForProvince';
import { Spin } from 'antd';

interface BranchNameProps {
  code: string;
}

const BranchName: React.FC<BranchNameProps> = ({ code }) => {
  const { i18n } = useTranslation();
  // Use includeAll to get all branches across provinces
  const { branches, loading } = useBranchesForProvince({ includeAll: true });
  const lang = i18n.language.startsWith('th') ? 'th' : 'en';

  if (loading) {
    return <Spin size='small' />;
  }
  // Explicitly type b as Branch
  const branch = branches.find((b: any) => b.branchCode === code);
  if (!branch) return <span>{code}</span>;

  return <span>{lang === 'th' ? branch.name : branch.nameEn}</span>;
};

export default BranchName;
