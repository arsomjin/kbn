import React from 'react';
import { Layout } from 'antd';
import { Outlet, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';

const { Header, Content } = Layout;

interface ProvinceLayoutProps {
  children?: React.ReactNode;
}

const ProvinceLayout: React.FC<ProvinceLayoutProps> = ({ children }) => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { userProfile } = usePermissions();

  const province = userProfile?.accessibleProvinceIds?.find(id => id === provinceId);

  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <h1>{province || 'Province'}</h1>
      </Header>
      <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
        {children || <Outlet />}
      </Content>
    </Layout>
  );
};

export default ProvinceLayout;
