import React from 'react';
import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBranchesForProvince } from 'hooks/useBranchesForProvince';
import { useAuth } from 'contexts/AuthContext';
import { ROLES, RoleType } from 'constants/roles';

interface BranchSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
  provinceId?: string;
  skipCache?: boolean;
  forceIncludeAll?: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  label = 'Branch',
  required = false,
  size = 'large',
  placeholder = 'Select branch',
  disabled = false,
  provinceId,
  skipCache = false,
  forceIncludeAll = false
}) => {
  const { t, i18n } = useTranslation(['branches', 'common']);
  const { userProfile } = useAuth();

  // Check if user has administrative access
  const adminRoles: RoleType[] = [ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.EXECUTIVE, ROLES.GENERAL_MANAGER];
  const hasAdminAccess = userProfile?.role && adminRoles.includes(userProfile.role as RoleType);

  // Use includeAll if user has admin access or if it's forced
  const { branches, loading } = useBranchesForProvince({
    provinceId: provinceId, // Always use the provided provinceId
    skipCache: true, // Force refresh when province changes
    includeAll: hasAdminAccess || forceIncludeAll
  });

  // Log for debugging
  console.log('[BranchSelector]', {
    provinceId,
    branchesCount: branches.length,
    loading,
    hasAdminAccess
  });

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={t('selectBranch', { ns: 'branches' })}
      disabled={disabled || loading || !provinceId}
      loading={loading}
      optionFilterProp='children'
      filterOption={(input, option) => {
        const optionText = typeof option?.children === 'string' ? option.children : '';
        return optionText.toLowerCase().includes(input.toLowerCase());
      }}
      style={{ width: '100%' }}
      size={size}
      notFoundContent={loading ? <Spin size='small' /> : t('noBranchFound', { ns: 'branches' })}
    >
      {branches.map(branch => (
        <Select.Option key={branch.branchCode} value={branch.branchCode}>
          {branch.branchName}
        </Select.Option>
      ))}
    </Select>
  );
};

export default BranchSelector;
