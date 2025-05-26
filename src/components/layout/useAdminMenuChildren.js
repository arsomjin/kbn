/**
 * HR menu children generator for MainLayout
 * Extracted for maintainability and testability.
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Generates the HR Management menu children.
 * @param hrBasePath The base path for hr routes
 */
export const useHRMenuChildren = (hrBasePath) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return [
    hrBasePath === '/hr' && {
      key: 'hr-review-users',
      label: t('hr:review-users') || 'รีวิวผู้ใช้งาน',
      onClick: () => navigate(hrBasePath),
    },
    {
      key: 'hr-manage-users',
      label: t('hr:manage-users') || 'จัดการผู้ใช้งาน',
      onClick: () => navigate(`${hrBasePath}/manage-users`),
    },
  ];
};
