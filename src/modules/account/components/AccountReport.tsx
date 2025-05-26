import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography } from 'antd';
import { Line } from '@ant-design/plots';
import dayjs from 'dayjs';
import { AccountReportProps } from '../types';
import { formatCurrency } from 'utils/format';
import { useTheme } from '../../../hooks/useTheme';
import { DatePicker } from 'elements';

const { Title } = Typography;

/**
 * Account report component with line chart
 */
export const AccountReport: React.FC<AccountReportProps> = ({ title, branchName, range, onRangeChange, data }) => {
  const { t } = useTranslation('account', 'common');
  const { isDarkMode } = useTheme();

  const chartData = data.data
    .map(point => ({
      date: point.date.format('YYYY-MM-DD'),
      value: point.income,
      type: t('income')
    }))
    .concat(
      data.data.map(point => ({
        date: point.date.format('YYYY-MM-DD'),
        value: point.expense,
        type: t('expense')
      }))
    );

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: string) => `฿${parseInt(v).toLocaleString()}`
      }
    },
    legend: {
      position: 'top'
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <Card
      title={title}
      className='dark:bg-gray-800 dark:border-gray-700'
      extra={
        <DatePicker
          isRange
          value={[range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')]}
          onChange={dates => {
            if (dates && Array.isArray(dates)) {
              onRangeChange([dayjs(dates[0], 'YYYY-MM-DD'), dayjs(dates[1], 'YYYY-MM-DD')]);
            }
          }}
          className='dark:bg-gray-700 dark:border-gray-600'
        />
      }
    >
      <Line {...config} />
    </Card>
  );
};
