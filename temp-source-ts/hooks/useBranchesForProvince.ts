import { useBranchContext } from './useBranchContext';

interface UseBranchesForProvinceOptions {
  provinceId?: string;
  skipCache?: boolean;
  includeAll?: boolean;
}

export function useBranchesForProvince(options: UseBranchesForProvinceOptions) {
  const context = useBranchContext();

  // If we have a provinceId but no branches for it yet, trigger a refresh
  if (options.provinceId && !context.branchesByProvince[options.provinceId]) {
    context.refreshBranches({ provinceId: options.provinceId });
  }

  return {
    branches: options.provinceId ? context.branchesByProvince[options.provinceId] || [] : [],
    loading: context.loading,
    error: context.error,
    initialized: context.initialized
  };
}
