import React from 'react';
import { Layout } from 'antd';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProvinceLayout = ({ children }) => {
  const { provinceId } = useParams();
  const provincesObj = useSelector((state) => state.data.provinces || {});

  const name = provincesObj[provinceId]?.name;

  return (
    <Layout>
      <label style={{ padding: '0 24px' }}>{name || 'Province'}</label>
      <div>{children || <Outlet />}</div>
    </Layout>
  );
};

export default ProvinceLayout;
