import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Card } from 'antd';
import { Pie } from '@ant-design/plots';
import { AccountPieChartProps } from '../types';
import { formatCurrency } from 'utils/format';
import { useTheme } from '../../../hooks/useTheme';

const { Title } = Typography;

/**
 * Account pie chart component
 */
export const AccountPieChart: React.FC<AccountPieChartProps> = ({ title, branchName, range, data }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const pieData = [
    {
      type: t('account.income'),
      value: data.totalIncome
    },
    {
      type: t('account.expense'),
      value: data.totalExpense
    }
  ];

  const config = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      content: (data: any) => `${data.type} ${data.value}`,
      style: {
        fill: isDarkMode ? '#fff' : '#000'
      }
    },
    interactions: [
      {
        type: 'element-active'
      }
    ],
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <Card title={title} className='dark:bg-gray-800 dark:border-gray-700'>
      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
          <Title level={4} className='dark:text-white'>
            {title}
          </Title>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {branchName} - {t(`account.${range}`)}
          </div>
        </div>
        <div className='h-[300px] sm:h-[400px]'>
          <Pie {...config} />
        </div>
      </div>
    </Card>
  );
};
