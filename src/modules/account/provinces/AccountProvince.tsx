import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Province-level Account page wrapper
 */
const AccountProvince: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className='account-province-container'>
      <Outlet />
    </div>
  );
};

export default AccountProvince;
