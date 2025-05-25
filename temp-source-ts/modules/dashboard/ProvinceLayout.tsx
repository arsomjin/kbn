import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useProvinceContext } from 'hooks/useProvinceContext';
import { useTranslation } from 'react-i18next';
import { useBranchesForProvince } from 'hooks/useBranchesForProvince';

interface ProvinceLayoutProps {
  children?: React.ReactNode;
}

const ProvinceLayout: React.FC<ProvinceLayoutProps> = ({ children }) => {
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { provinces } = useProvinceContext();
  const { branches } = useBranchesForProvince({ provinceId });
  const { i18n } = useTranslation();

  const lang = i18n.language.startsWith('th') ? 'th' : 'en';

  const province = provinces?.find(p => p.id === provinceId);
  const provinceName = lang === 'th' ? province?.name : province?.nameEn;

  return (
    <div>
      <label style={{ padding: '0 24px' }}>
        {`${provinceName || 'Province'}${branchCode ? ` / ${branches?.find(b => b.branchCode === branchCode)?.branchName || branchCode}` : ''}`}
      </label>
      {children || <Outlet />}
    </div>
  );
};

export default ProvinceLayout;
