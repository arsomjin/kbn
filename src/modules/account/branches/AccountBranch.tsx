import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Branch-level Account page wrapper
 */
const AccountBranch: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className='account-branch-container'>
      <Outlet />
    </div>
  );
};

export default AccountBranch;
