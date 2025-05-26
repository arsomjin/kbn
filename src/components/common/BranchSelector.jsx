import React from 'react';
import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/AuthContext';
import { ROLES } from 'constants/roles';
// If you have a custom hook for branches by province, import it:
// import { useBranchesForProvince } from 'hooks/useBranchesForProvince';

const BranchSelector = ({
  value,
  onChange,
  size = 'large',
  disabled = false,
  provinceId,
  forceIncludeAll = false,
}) => {
  const { t } = useTranslation(['branches', 'common']);
  const { userProfile } = useAuth();

  // Admin roles for access
  const adminRoles = [ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.EXECUTIVE, ROLES.GENERAL_MANAGER];
  const hasAdminAccess = userProfile?.role && adminRoles.includes(userProfile?.role);

  // If you have a custom hook, use it. Otherwise, use Redux selector:
  // const { branches, loading } = useBranchesForProvince({ provinceId, skipCache: true, includeAll: hasAdminAccess || forceIncludeAll });
  const allBranchesObj = useSelector((state) => state.data.branches || {});
  let branches = Object.values(allBranchesObj).filter(
    (branch) =>
      branch &&
      !branch.deleted &&
      (hasAdminAccess || forceIncludeAll || !provinceId || branch.provinceId === provinceId),
  );
  // If not admin, filter by provinceId
  if (!hasAdminAccess && !forceIncludeAll && provinceId) {
    branches = branches.filter((branch) => branch.provinceId === provinceId);
  }
  // Sort by branch name
  branches = branches.sort((a, b) =>
    (a.branchName || a.branch || '').localeCompare(b.branchName || b.branch || ''),
  );
  // Simulate loading if needed (replace with real loading state if using a hook)
  const loading = false;

  // Log for debugging
  // console.log('[BranchSelector]', { provinceId, branchesCount: branches.length, loading, hasAdminAccess });

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={t('selectBranch', { ns: 'branches' })}
      disabled={disabled || loading || !provinceId}
      loading={loading}
      optionFilterProp="children"
      filterOption={(input, option) => {
        const optionText = typeof option?.children === 'string' ? option.children : '';
        return optionText.toLowerCase().includes(input.toLowerCase());
      }}
      style={{ width: '100%' }}
      size={size}
      notFoundContent={loading ? <Spin size="small" /> : t('noBranchFound', { ns: 'branches' })}
    >
      {branches.map((branch) => (
        <Select.Option key={branch.branchCode || branch.id} value={branch.branchCode || branch.id}>
          {branch.branchName || branch.branch}
        </Select.Option>
      ))}
    </Select>
  );
};

export default BranchSelector;
