import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Outlet, useParams } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useProvinceContext } from 'hooks/useProvinceContext';
import { useTranslation } from 'react-i18next';
import { useBranchesForProvince } from 'hooks/useBranchesForProvince';

const { Header } = Layout;

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
    <Layout>
      <Header style={{ padding: '0 24px' }}>
        <label>
          {`${provinceName || 'Province'}${branchCode ? ` / ${branches?.find(b => b.branchCode === branchCode)?.branchName || branchCode}` : ''}`}
        </label>
      </Header>
      {children || <Outlet />}
    </Layout>
  );
};

export default ProvinceLayout;
