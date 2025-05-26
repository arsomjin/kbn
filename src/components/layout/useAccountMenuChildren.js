/**
 * Account menu children generator for MainLayout
 * Extracted for maintainability and testability.
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Generates the Account Management menu children.
 * @param accountBasePath The base path for account routes
 */
export const useAccountMenuChildren = (accountBasePath) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return [
    accountBasePath === '/account' && {
      key: 'account-overview',
      label: t('account:overview') || 'Overview',
      onClick: () => navigate(accountBasePath),
    },
    {
      key: 'account-income',
      label: t('account:income') || 'Income',
      onClick: () => navigate(`${accountBasePath}/income`),
    },
    {
      key: 'account-expense',
      label: t('account:expense') || 'Expense',
      onClick: () => navigate(`${accountBasePath}/expense`),
    },
    {
      key: 'account-price-input',
      label: t('account:account-price-input') || 'บันทึกราคาสินค้า',
      onClick: () => navigate(`${accountBasePath}/input-price`),
    },
  ];
};
